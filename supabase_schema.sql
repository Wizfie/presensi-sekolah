-- ==============================================================================
-- SISTEM PRESENSI SEKOLAH (BERBASIS LOKASI & QR CODE)
-- Database Schema & Security Functions (Supabase PostgreSQL)
-- ==============================================================================

-- 1. AKTIFKAN EKSTENSI POSTGRESQL
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABEL PROFIL PENGGUNA (PROFILES)
-- Menghubungkan data identitas sekolah/PKBM dengan auth.users Supabase
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    nama_lengkap TEXT NOT NULL,
    nomor_induk TEXT UNIQUE NOT NULL, -- NISN untuk siswa, NIP untuk tutor/admin
    jenis_kelamin VARCHAR(1) CHECK (jenis_kelamin IN ('L', 'P')) DEFAULT 'L',
    role TEXT CHECK (role IN ('admin', 'guru', 'siswa')) NOT NULL DEFAULT 'siswa',
    kelas TEXT,                       -- Misal: '12', '11', '10' (hanya untuk siswa)
    qr_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'), -- Token tetap untuk cetak kartu QR
    foto_profil_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index untuk pencarian cepat berdasarkan nomor induk dan token QR
CREATE INDEX IF NOT EXISTS idx_profiles_nomor_induk ON public.profiles(nomor_induk);
CREATE INDEX IF NOT EXISTS idx_profiles_qr_token ON public.profiles(qr_token);
CREATE INDEX IF NOT EXISTS idx_profiles_kelas ON public.profiles(kelas);

-- 3. TABEL PENGATURAN SEKOLAH (PENGATURAN_SEKOLAH)
CREATE TABLE IF NOT EXISTS public.pengaturan_sekolah (
    id SERIAL PRIMARY KEY,
    nama_sekolah TEXT NOT NULL DEFAULT 'PKBM Cahaya Mulia',
    alamat TEXT DEFAULT 'Jl. Surya Kencana No. 1, Pamulang, Tangerang Selatan',
    tahun_pelajaran TEXT NOT NULL DEFAULT '2026/2027',
    latitude DOUBLE PRECISION NOT NULL DEFAULT -6.345853,   -- Koordinat Latitude PKBM
    longitude DOUBLE PRECISION NOT NULL DEFAULT 106.738159, -- Koordinat Longitude PKBM
    radius_meter INT NOT NULL DEFAULT 100,                  -- Batas radius toleransi kehadiran (meter)
    jam_masuk TIME NOT NULL DEFAULT '07:30:00',             -- Jam awal presensi masuk
    jam_terlambat TIME NOT NULL DEFAULT '08:00:00',         -- Batas toleransi sebelum status 'terlambat'
    jam_pulang TIME NOT NULL DEFAULT '14:00:00',            -- Jam mulai diperbolehkan presensi pulang
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Masukkan pengaturan default jika tabel masih kosong
INSERT INTO public.pengaturan_sekolah (id, nama_sekolah, tahun_pelajaran, latitude, longitude, radius_meter)
VALUES (1, 'PKBM Cahaya Mulia', '2026/2027', -6.345853, 106.738159, 100)
ON CONFLICT (id) DO UPDATE SET 
    nama_sekolah = EXCLUDED.nama_sekolah,
    tahun_pelajaran = EXCLUDED.tahun_pelajaran,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    radius_meter = EXCLUDED.radius_meter;

-- 4. TABEL PRESENSI HARIAN (PRESENSI)
CREATE TABLE IF NOT EXISTS public.presensi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Data Presensi Masuk
    jam_masuk TIMESTAMPTZ,
    lat_masuk DOUBLE PRECISION,
    long_masuk DOUBLE PRECISION,
    jarak_masuk_meter DOUBLE PRECISION,
    foto_masuk_url TEXT,
    
    -- Data Presensi Pulang
    jam_pulang TIMESTAMPTZ,
    lat_pulang DOUBLE PRECISION,
    long_pulang DOUBLE PRECISION,
    jarak_pulang_meter DOUBLE PRECISION,
    foto_pulang_url TEXT,
    
    -- Status Kehadiran
    status TEXT CHECK (status IN ('hadir', 'terlambat', 'izin', 'sakit', 'alpa')) NOT NULL DEFAULT 'hadir',
    metode_presensi TEXT CHECK (metode_presensi IN ('mandiri_gps', 'qr_guru', 'manual_guru')) NOT NULL DEFAULT 'mandiri_gps',
    dicatat_oleh UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Diisi ID guru jika di-scan/di-absenkan
    catatan TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT unique_user_attendance_per_day UNIQUE (user_id, tanggal)
);

CREATE INDEX IF NOT EXISTS idx_presensi_tanggal ON public.presensi(tanggal);
CREATE INDEX IF NOT EXISTS idx_presensi_user_id ON public.presensi(user_id);
CREATE INDEX IF NOT EXISTS idx_presensi_status ON public.presensi(status);

-- 5. TABEL PENGAJUAN IZIN & SAKIT (PENGAJUAN_IZIN)
CREATE TABLE IF NOT EXISTS public.pengajuan_izin (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE NOT NULL,
    jenis TEXT CHECK (jenis IN ('izin', 'sakit')) NOT NULL,
    keterangan TEXT NOT NULL,
    bukti_surat_url TEXT,
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) NOT NULL DEFAULT 'pending',
    diverifikasi_oleh UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    catatan_verifikasi TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pengajuan_izin_user ON public.pengajuan_izin(user_id);
CREATE INDEX IF NOT EXISTS idx_pengajuan_izin_status ON public.pengajuan_izin(status);

-- ==============================================================================
-- 6. FUNGSI DATABASE (RPC FUNCTIONS) UNTUK LOGIKA PRESENSI AMAN
-- ==============================================================================

-- A. FUNGSI SUBMIT PRESENSI MANDIRI (GPS & RADIUS HAVERSINE)
CREATE OR REPLACE FUNCTION public.submit_presensi_gps(
    p_lat DOUBLE PRECISION,
    p_long DOUBLE PRECISION,
    p_foto_url TEXT
) RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_sekolah RECORD;
    v_jarak DOUBLE PRECISION;
    v_now_time TIME := CURRENT_TIME;
    v_status TEXT;
    v_presensi_exist RECORD;
BEGIN
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Unauthorized: Silakan login terlebih dahulu.');
    END IF;

    -- Ambil koordinat & batas radius sekolah
    SELECT * INTO v_sekolah FROM public.pengaturan_sekolah LIMIT 1;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Konfigurasi sekolah belum diatur.');
    END IF;

    -- Hitung jarak Haversine (dalam satuan meter)
    v_jarak := 6371000 * acos(
        least(1.0, greatest(-1.0,
            cos(radians(v_sekolah.latitude)) * cos(radians(p_lat)) *
            cos(radians(p_long) - radians(v_sekolah.longitude)) +
            sin(radians(v_sekolah.latitude)) * sin(radians(p_lat))
        ))
    );

    -- Cek toleransi radius
    IF v_jarak > v_sekolah.radius_meter THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Gagal: Anda berada di luar radius sekolah (' || round(v_jarak::numeric, 1) || ' meter dari titik acuan).'
        );
    END IF;

    -- Tentukan apakah presensi MASUK atau PULANG
    SELECT * INTO v_presensi_exist FROM public.presensi 
    WHERE user_id = v_user_id AND tanggal = CURRENT_DATE;

    IF v_presensi_exist.id IS NULL THEN
        -- Belum pernah absen hari ini -> PRESENSI MASUK
        IF v_now_time > v_sekolah.jam_terlambat THEN
            v_status := 'terlambat';
        ELSE
            v_status := 'hadir';
        END IF;

        INSERT INTO public.presensi (
            user_id, tanggal, jam_masuk, lat_masuk, long_masuk, 
            jarak_masuk_meter, foto_masuk_url, status, metode_presensi
        ) VALUES (
            v_user_id, CURRENT_DATE, now(), p_lat, p_long, 
            v_jarak, p_foto_url, v_status, 'mandiri_gps'
        );

        RETURN jsonb_build_object(
            'success', true,
            'type', 'masuk',
            'status', v_status,
            'jarak', round(v_jarak::numeric, 1),
            'message', 'Presensi Masuk berhasil dicatat (' || upper(v_status) || ')!'
        );
    ELSE
        -- Sudah ada presensi masuk -> PRESENSI PULANG
        IF v_now_time < v_sekolah.jam_pulang THEN
            RETURN jsonb_build_object(
                'success', false,
                'message', 'Belum waktunya jam pulang (Jam pulang: ' || to_char(v_sekolah.jam_pulang, 'HH24:MI') || ').'
            );
        END IF;

        UPDATE public.presensi SET
            jam_pulang = now(),
            lat_pulang = p_lat,
            long_pulang = p_long,
            jarak_pulang_meter = v_jarak,
            foto_pulang_url = p_foto_url
        WHERE id = v_presensi_exist.id;

        RETURN jsonb_build_object(
            'success', true,
            'type', 'pulang',
            'status', v_presensi_exist.status,
            'jarak', round(v_jarak::numeric, 1),
            'message', 'Presensi Pulang berhasil dicatat! Hati-hati di jalan.'
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- B. FUNGSI SCAN QR KARTU OLEH GURU / PETUGAS PIKET
CREATE OR REPLACE FUNCTION public.scan_qr_presensi_siswa(
    p_qr_token TEXT
) RETURNS JSONB AS $$
DECLARE
    v_guru_id UUID := auth.uid();
    v_siswa RECORD;
    v_sekolah RECORD;
    v_now_time TIME := CURRENT_TIME;
    v_status TEXT;
    v_presensi_exist RECORD;
BEGIN
    IF v_guru_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Unauthorized: Petugas/Guru belum login.');
    END IF;

    -- Cari siswa berdasarkan token QR kartu
    SELECT * INTO v_siswa FROM public.profiles WHERE qr_token = p_qr_token;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'QR Code tidak valid atau belum terdaftar.');
    END IF;

    -- Ambil pengaturan jam sekolah
    SELECT * INTO v_sekolah FROM public.pengaturan_sekolah LIMIT 1;

    -- Cek catatan presensi hari ini
    SELECT * INTO v_presensi_exist FROM public.presensi 
    WHERE user_id = v_siswa.id AND tanggal = CURRENT_DATE;

    IF v_presensi_exist.id IS NULL THEN
        -- Presensi Masuk Siswa
        IF v_now_time > v_sekolah.jam_terlambat THEN
            v_status := 'terlambat';
        ELSE
            v_status := 'hadir';
        END IF;

        INSERT INTO public.presensi (
            user_id, tanggal, jam_masuk, status, metode_presensi, dicatat_oleh
        ) VALUES (
            v_siswa.id, CURRENT_DATE, now(), v_status, 'qr_guru', v_guru_id
        );

        RETURN jsonb_build_object(
            'success', true,
            'type', 'masuk',
            'nama', v_siswa.nama_lengkap,
            'nomor_induk', v_siswa.nomor_induk,
            'kelas', v_siswa.kelas,
            'status', v_status,
            'message', 'Presensi masuk siswa berhasil tercatat!'
        );
    ELSE
        -- Update Presensi Pulang Siswa
        UPDATE public.presensi SET
            jam_pulang = now(),
            dicatat_oleh = v_guru_id
        WHERE id = v_presensi_exist.id;

        RETURN jsonb_build_object(
            'success', true,
            'type', 'pulang',
            'nama', v_siswa.nama_lengkap,
            'nomor_induk', v_siswa.nomor_induk,
            'kelas', v_siswa.kelas,
            'status', v_presensi_exist.status,
            'message', 'Presensi pulang siswa berhasil tercatat!'
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- C. FUNGSI RESET QR TOKEN SISWA (JIKA KARTU FISIK HILANG/RUSAK)
CREATE OR REPLACE FUNCTION public.reset_siswa_qr_token(
    p_siswa_id UUID
) RETURNS JSONB AS $$
DECLARE
    v_caller_id UUID := auth.uid();
    v_caller_role TEXT;
    v_new_token TEXT;
BEGIN
    SELECT role INTO v_caller_role FROM public.profiles WHERE id = v_caller_id;
    IF v_caller_role NOT IN ('admin', 'guru') THEN
        RETURN jsonb_build_object('success', false, 'message', 'Akses ditolak: Hanya admin/guru yang dapat mereset kartu.');
    END IF;

    v_new_token := encode(gen_random_bytes(16), 'hex');

    UPDATE public.profiles 
    SET qr_token = v_new_token, updated_at = now()
    WHERE id = p_siswa_id;

    RETURN jsonb_build_object(
        'success', true,
        'new_qr_token', v_new_token,
        'message', 'Token kartu siswa berhasil direset. Silakan cetak kartu baru.'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengaturan_sekolah ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presensi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengajuan_izin ENABLE ROW LEVEL SECURITY;

-- Policy Profiles: Semua user login bisa melihat profil; user bisa update profilnya sendiri
CREATE POLICY "Profiles can be viewed by authenticated users" 
ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Policy Pengaturan Sekolah: Dibaca oleh semua user authenticated; hanya diedit admin
CREATE POLICY "Pengaturan sekolah can be read by authenticated users" 
ON public.pengaturan_sekolah FOR SELECT TO authenticated USING (true);

CREATE POLICY "Pengaturan sekolah only editable by admin" 
ON public.pengaturan_sekolah FOR ALL TO authenticated 
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Policy Presensi: Siswa membaca miliknya; Guru/Admin membaca semua
CREATE POLICY "Presensi view policy" 
ON public.presensi FOR SELECT TO authenticated 
USING (
    user_id = auth.uid() OR 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'guru')
);

CREATE POLICY "Presensi edit policy by teacher/admin" 
ON public.presensi FOR ALL TO authenticated 
USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'guru')
);

-- Policy Izin
CREATE POLICY "Pengajuan izin view policy" 
ON public.pengajuan_izin FOR SELECT TO authenticated 
USING (
    user_id = auth.uid() OR 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'guru')
);

CREATE POLICY "Siswa can insert izin" 
ON public.pengajuan_izin FOR INSERT TO authenticated 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin & guru can update izin" 
ON public.pengajuan_izin FOR UPDATE TO authenticated 
USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'guru')
);

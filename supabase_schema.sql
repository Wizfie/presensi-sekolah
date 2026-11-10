-- ==============================================================================
-- SISTEM PRESENSI PKBM CAHAYA MULIA (PRODUCTION SCHEMA)
-- Supabase PostgreSQL: Tables, Indexes, RLS Policies, Security Triggers & RPCs
-- Aman dijalankan ulang (Idempotent) di Supabase SQL Editor
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. TABEL MASTER KELAS (CLASSES)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.classes (
    name TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 2. TABEL PROFIL PENGGUNA (PROFILES)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    nama_lengkap TEXT NOT NULL,
    nomor_induk TEXT UNIQUE NOT NULL, -- NISN siswa / NIP guru / ID admin
    jenis_kelamin VARCHAR(1) CHECK (jenis_kelamin IN ('L', 'P')) DEFAULT 'L',
    role TEXT CHECK (role IN ('admin', 'guru', 'siswa')) NOT NULL DEFAULT 'siswa',
    kelas TEXT,
    kelas_diajar TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    mata_pelajaran TEXT DEFAULT '',
    jabatan TEXT DEFAULT 'Staf Tata Usaha',
    is_root BOOLEAN NOT NULL DEFAULT false,
    jam_masuk_default TEXT DEFAULT '07:30',
    jam_terlambat_default TEXT DEFAULT '08:00',
    jam_pulang_default TEXT DEFAULT '14:00',
    jadwal_kelas JSONB NOT NULL DEFAULT '{}'::jsonb,
    qr_token TEXT UNIQUE NOT NULL DEFAULT encode(extensions.gen_random_bytes(16), 'hex'),
    foto_profil_url TEXT DEFAULT '',
    foto_update_count INT NOT NULL DEFAULT 0,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pastikan kolom tambahan tersedia jika upgrade dari schema versi lama
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kelas_diajar TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mata_pelajaran TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS jabatan TEXT DEFAULT 'Staf Tata Usaha';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_root BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS jam_masuk_default TEXT DEFAULT '07:30';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS jam_terlambat_default TEXT DEFAULT '08:00';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS jam_pulang_default TEXT DEFAULT '14:00';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS jadwal_kelas JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS foto_update_count INT NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_profiles_nomor_induk ON public.profiles(nomor_induk);
CREATE INDEX IF NOT EXISTS idx_profiles_qr_token ON public.profiles(qr_token);
CREATE INDEX IF NOT EXISTS idx_profiles_kelas ON public.profiles(kelas);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ------------------------------------------------------------------------------
-- 3. TABEL PENGATURAN SEKOLAH (PENGATURAN_SEKOLAH)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pengaturan_sekolah (
    id SERIAL PRIMARY KEY,
    nama_sekolah TEXT NOT NULL DEFAULT 'PKBM Cahaya Mulia',
    alamat TEXT DEFAULT 'Jl. Surya Kencana No. 1, Pamulang, Tangerang Selatan',
    tahun_pelajaran TEXT NOT NULL DEFAULT '2026/2027',
    latitude DOUBLE PRECISION NOT NULL DEFAULT -6.345853,
    longitude DOUBLE PRECISION NOT NULL DEFAULT 106.738159,
    radius_meter INT NOT NULL DEFAULT 100,
    jam_masuk TIME NOT NULL DEFAULT '07:30:00',
    jam_terlambat TIME NOT NULL DEFAULT '08:00:00',
    jam_pulang TIME NOT NULL DEFAULT '14:00:00',
    mengetahui_jabatan TEXT DEFAULT 'Ketua PKBM Cahaya Mulia',
    mengetahui_nama TEXT DEFAULT '',
    mengetahui_nip TEXT DEFAULT '',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pengaturan_sekolah ADD COLUMN IF NOT EXISTS mengetahui_jabatan TEXT DEFAULT 'Ketua PKBM Cahaya Mulia';
ALTER TABLE public.pengaturan_sekolah ADD COLUMN IF NOT EXISTS mengetahui_nama TEXT DEFAULT '';
ALTER TABLE public.pengaturan_sekolah ADD COLUMN IF NOT EXISTS mengetahui_nip TEXT DEFAULT '';

-- Masukkan konfigurasi default hanya jika row id=1 belum ada
INSERT INTO public.pengaturan_sekolah (id, nama_sekolah, tahun_pelajaran, latitude, longitude, radius_meter)
VALUES (1, 'PKBM Cahaya Mulia', '2026/2027', -6.345853, 106.738159, 100)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 4. TABEL PRESENSI HARIAN (PRESENSI)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.presensi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL DEFAULT ((now() AT TIME ZONE 'Asia/Jakarta')::date),
    jam_masuk TIMESTAMPTZ,
    lat_masuk DOUBLE PRECISION,
    long_masuk DOUBLE PRECISION,
    jarak_masuk_meter DOUBLE PRECISION,
    foto_masuk_url TEXT,
    jam_pulang TIMESTAMPTZ,
    lat_pulang DOUBLE PRECISION,
    long_pulang DOUBLE PRECISION,
    jarak_pulang_meter DOUBLE PRECISION,
    foto_pulang_url TEXT,
    status TEXT CHECK (status IN ('hadir', 'terlambat', 'izin', 'sakit', 'alpa')) NOT NULL DEFAULT 'hadir',
    metode_presensi TEXT CHECK (metode_presensi IN ('mandiri_gps', 'qr_guru', 'manual_guru')) NOT NULL DEFAULT 'mandiri_gps',
    dicatat_oleh UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    catatan TEXT,
    keterangan TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_user_attendance_per_day UNIQUE (user_id, tanggal)
);

ALTER TABLE public.presensi ADD COLUMN IF NOT EXISTS keterangan TEXT;

CREATE INDEX IF NOT EXISTS idx_presensi_tanggal ON public.presensi(tanggal);
CREATE INDEX IF NOT EXISTS idx_presensi_user_id ON public.presensi(user_id);
CREATE INDEX IF NOT EXISTS idx_presensi_status ON public.presensi(status);

-- ------------------------------------------------------------------------------
-- 5. TABEL PENGAJUAN IZIN & SAKIT (PENGAJUAN_IZIN)
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 6. HELPER KEAMANAN & TRIGGER ANTI-ESKALASI ROLE
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid() AND is_deleted = false LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.prevent_non_admin_profile_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF auth.uid() IS NOT NULL AND COALESCE(public.get_my_role(), '') <> 'admin' THEN
        NEW.role := OLD.role;
        NEW.is_root := OLD.is_root;
        NEW.is_deleted := OLD.is_deleted;
        NEW.deleted_at := OLD.deleted_at;
        NEW.qr_token := OLD.qr_token;
        NEW.kelas := OLD.kelas;
        NEW.kelas_diajar := OLD.kelas_diajar;
        NEW.nomor_induk := OLD.nomor_induk;
        NEW.email := OLD.email;
    END IF;
    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_non_admin_profile_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_non_admin_profile_escalation
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_non_admin_profile_escalation();

-- Lookup email aman untuk login dengan NISN / NIP sebelum user authenticated
CREATE OR REPLACE FUNCTION public.get_email_by_identifier(p_identifier TEXT)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT email
    FROM public.profiles
    WHERE is_deleted = false
      AND (
        lower(email) = lower(trim(p_identifier))
        OR lower(nomor_induk) = lower(trim(p_identifier))
      )
    LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_email_by_identifier(TEXT) TO anon, authenticated;

-- ------------------------------------------------------------------------------
-- 7. RPC FUNCTIONS: OPERASIONAL PRESENSI, QR, IZIN & SIGNATORY
-- ------------------------------------------------------------------------------

-- A. Submit Presensi Mandiri (GPS + Haversine, Timezone Asia/Jakarta)
CREATE OR REPLACE FUNCTION public.submit_presensi_gps(
    p_lat DOUBLE PRECISION,
    p_long DOUBLE PRECISION,
    p_foto_url TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_profile RECORD;
    v_sekolah RECORD;
    v_jarak DOUBLE PRECISION;
    v_jakarta_now TIMESTAMP := (now() AT TIME ZONE 'Asia/Jakarta');
    v_today DATE := v_jakarta_now::date;
    v_now_time TIME := v_jakarta_now::time;
    v_time_str TEXT := to_char(v_jakarta_now, 'HH24:MI:SS');
    v_status TEXT;
    v_presensi_exist RECORD;
    v_saved RECORD;
BEGIN
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Unauthorized: Silakan login terlebih dahulu.');
    END IF;

    SELECT * INTO v_profile FROM public.profiles WHERE id = v_user_id AND is_deleted = false;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Akun tidak aktif atau tidak ditemukan.');
    END IF;

    SELECT * INTO v_sekolah FROM public.pengaturan_sekolah LIMIT 1;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Konfigurasi sekolah belum diatur.');
    END IF;

    -- Hitung jarak Haversine (meter)
    v_jarak := round((6371000 * acos(
        least(1.0, greatest(-1.0,
            cos(radians(v_sekolah.latitude)) * cos(radians(p_lat)) *
            cos(radians(p_long) - radians(v_sekolah.longitude)) +
            sin(radians(v_sekolah.latitude)) * sin(radians(p_lat))
        ))
    ))::numeric, 1);

    IF v_jarak > v_sekolah.radius_meter THEN
        RETURN jsonb_build_object(
            'success', false,
            'distance', v_jarak,
            'message', 'Gagal: Anda berada di luar radius PKBM (' || v_jarak || ' meter). Batas toleransi adalah ' || v_sekolah.radius_meter || ' meter.'
        );
    END IF;

    SELECT * INTO v_presensi_exist FROM public.presensi
    WHERE user_id = v_user_id AND tanggal = v_today;

    IF v_presensi_exist.id IS NULL THEN
        v_status := CASE WHEN v_now_time > v_sekolah.jam_terlambat THEN 'terlambat' ELSE 'hadir' END;

        INSERT INTO public.presensi (
            user_id, tanggal, jam_masuk, lat_masuk, long_masuk,
            jarak_masuk_meter, foto_masuk_url, status, metode_presensi
        ) VALUES (
            v_user_id, v_today, now(), p_lat, p_long,
            v_jarak, p_foto_url, v_status, 'mandiri_gps'
        )
        RETURNING * INTO v_saved;

        RETURN jsonb_build_object(
            'success', true,
            'type', 'masuk',
            'status', v_status,
            'jam', v_time_str,
            'jarak', v_jarak,
            'record', to_jsonb(v_saved),
            'message', 'Presensi Masuk berhasil dicatat (' || upper(v_status) || ') pada pukul ' || v_time_str || ' WIB!'
        );
    ELSE
        IF v_presensi_exist.jam_pulang IS NOT NULL THEN
            RETURN jsonb_build_object(
                'success', false,
                'message', 'Anda sudah menyelesaikan presensi masuk dan pulang hari ini.'
            );
        END IF;

        UPDATE public.presensi SET
            jam_pulang = now(),
            lat_pulang = p_lat,
            long_pulang = p_long,
            jarak_pulang_meter = v_jarak,
            foto_pulang_url = COALESCE(p_foto_url, foto_pulang_url)
        WHERE id = v_presensi_exist.id
        RETURNING * INTO v_saved;

        RETURN jsonb_build_object(
            'success', true,
            'type', 'pulang',
            'status', v_saved.status,
            'jam', v_time_str,
            'jarak', v_jarak,
            'record', to_jsonb(v_saved),
            'message', 'Presensi Pulang berhasil dicatat pada pukul ' || v_time_str || ' WIB! Hati-hati di jalan.'
        );
    END IF;
END;
$$;

-- B. Scan Kartu QR Siswa oleh Guru / Admin (Ignore Location)
CREATE OR REPLACE FUNCTION public.scan_qr_presensi_siswa(p_qr_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_guru_id UUID := auth.uid();
    v_caller_role TEXT := public.get_my_role();
    v_siswa RECORD;
    v_sekolah RECORD;
    v_jakarta_now TIMESTAMP := (now() AT TIME ZONE 'Asia/Jakarta');
    v_today DATE := v_jakarta_now::date;
    v_now_time TIME := v_jakarta_now::time;
    v_time_str TEXT := to_char(v_jakarta_now, 'HH24:MI:SS');
    v_status TEXT;
    v_presensi_exist RECORD;
    v_saved RECORD;
BEGIN
    IF v_guru_id IS NULL OR v_caller_role NOT IN ('guru', 'admin') THEN
        RETURN jsonb_build_object('success', false, 'message', 'Akses ditolak: Hanya Guru Piket / Admin yang dapat memindai kartu.');
    END IF;

    SELECT * INTO v_siswa
    FROM public.profiles
    WHERE role = 'siswa'
      AND is_deleted = false
      AND (qr_token = p_qr_token OR nomor_induk = p_qr_token)
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'QR Code atau NISN tidak terdaftar dalam sistem.');
    END IF;

    SELECT * INTO v_sekolah FROM public.pengaturan_sekolah LIMIT 1;

    SELECT * INTO v_presensi_exist
    FROM public.presensi
    WHERE user_id = v_siswa.id AND tanggal = v_today;

    IF v_presensi_exist.id IS NULL THEN
        v_status := CASE WHEN v_now_time > v_sekolah.jam_terlambat THEN 'terlambat' ELSE 'hadir' END;

        INSERT INTO public.presensi (
            user_id, tanggal, jam_masuk, status, metode_presensi, dicatat_oleh, jarak_masuk_meter
        ) VALUES (
            v_siswa.id, v_today, now(), v_status, 'qr_guru', v_guru_id, 0
        )
        RETURNING * INTO v_saved;

        RETURN jsonb_build_object(
            'success', true,
            'type', 'masuk',
            'nama', v_siswa.nama_lengkap,
            'jenis_kelamin', v_siswa.jenis_kelamin,
            'nomor_induk', v_siswa.nomor_induk,
            'kelas', v_siswa.kelas,
            'status', v_status,
            'jam', v_time_str,
            'record', to_jsonb(v_saved),
            'message', 'Presensi MASUK - ' || v_siswa.nama_lengkap || ' (Kelas ' || COALESCE(v_siswa.kelas, '-') || ') berhasil dicatat!'
        );
    ELSE
        IF v_presensi_exist.jam_pulang IS NOT NULL THEN
            RETURN jsonb_build_object(
                'success', true,
                'type', 'selesai',
                'nama', v_siswa.nama_lengkap,
                'jenis_kelamin', v_siswa.jenis_kelamin,
                'nomor_induk', v_siswa.nomor_induk,
                'kelas', v_siswa.kelas,
                'status', v_presensi_exist.status,
                'jam', to_char(v_presensi_exist.jam_pulang AT TIME ZONE 'Asia/Jakarta', 'HH24:MI:SS'),
                'record', to_jsonb(v_presensi_exist),
                'message', v_siswa.nama_lengkap || ' sudah menyelesaikan presensi Masuk dan Pulang hari ini.'
            );
        END IF;

        UPDATE public.presensi SET
            jam_pulang = now(),
            dicatat_oleh = v_guru_id
        WHERE id = v_presensi_exist.id
        RETURNING * INTO v_saved;

        RETURN jsonb_build_object(
            'success', true,
            'type', 'pulang',
            'nama', v_siswa.nama_lengkap,
            'jenis_kelamin', v_siswa.jenis_kelamin,
            'nomor_induk', v_siswa.nomor_induk,
            'kelas', v_siswa.kelas,
            'status', v_saved.status,
            'jam', v_time_str,
            'record', to_jsonb(v_saved),
            'message', 'Presensi PULANG - ' || v_siswa.nama_lengkap || ' (Kelas ' || COALESCE(v_siswa.kelas, '-') || ') berhasil dicatat!'
        );
    END IF;
END;
$$;

-- C. Pengajuan Izin / Sakit oleh Siswa (sinkron pengajuan_izin + presensi)
CREATE OR REPLACE FUNCTION public.submit_pengajuan_izin(
    p_tanggal DATE,
    p_jenis TEXT,
    p_keterangan TEXT,
    p_bukti_url TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_leave RECORD;
    v_presensi RECORD;
BEGIN
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Unauthorized.');
    END IF;

    IF p_jenis NOT IN ('izin', 'sakit') THEN
        RETURN jsonb_build_object('success', false, 'message', 'Jenis pengajuan harus izin atau sakit.');
    END IF;

    IF length(trim(COALESCE(p_keterangan, ''))) = 0 THEN
        RETURN jsonb_build_object('success', false, 'message', 'Keterangan wajib diisi.');
    END IF;

    INSERT INTO public.pengajuan_izin (
        user_id, tanggal_mulai, tanggal_selesai, jenis, keterangan, bukti_surat_url, status
    ) VALUES (
        v_user_id, p_tanggal, p_tanggal, p_jenis, trim(p_keterangan), p_bukti_url, 'approved'
    )
    RETURNING * INTO v_leave;

    INSERT INTO public.presensi (
        user_id, tanggal, jam_masuk, jam_pulang, status, metode_presensi, keterangan, catatan
    ) VALUES (
        v_user_id, p_tanggal, NULL, NULL, p_jenis, 'manual_guru', trim(p_keterangan), trim(p_keterangan)
    )
    ON CONFLICT (user_id, tanggal) DO UPDATE SET
        status = EXCLUDED.status,
        jam_masuk = NULL,
        jam_pulang = NULL,
        keterangan = EXCLUDED.keterangan,
        catatan = EXCLUDED.catatan
    RETURNING * INTO v_presensi;

    RETURN jsonb_build_object(
        'success', true,
        'leave', to_jsonb(v_leave),
        'presensi', to_jsonb(v_presensi),
        'message', 'Pengajuan berhasil dicatat.'
    );
END;
$$;

-- D. Reset Token QR Kartu Siswa
CREATE OR REPLACE FUNCTION public.reset_siswa_qr_token(p_siswa_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
    v_caller_role TEXT := public.get_my_role();
    v_new_token TEXT;
BEGIN
    IF v_caller_role NOT IN ('admin', 'guru') THEN
        RETURN jsonb_build_object('success', false, 'message', 'Akses ditolak.');
    END IF;

    v_new_token := encode(extensions.gen_random_bytes(16), 'hex');

    UPDATE public.profiles
    SET qr_token = v_new_token, updated_at = now()
    WHERE id = p_siswa_id;

    RETURN jsonb_build_object(
        'success', true,
        'new_qr_token', v_new_token,
        'message', 'Token kartu siswa berhasil direset. Silakan cetak kartu baru.'
    );
END;
$$;

-- E. Simpan Nama & Jabatan Penandatangan "Mengetahui" oleh Guru / Admin
CREATE OR REPLACE FUNCTION public.update_rekap_signatory(
    p_jabatan TEXT,
    p_nama TEXT,
    p_nip TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF public.get_my_role() NOT IN ('admin', 'guru') THEN
        RETURN jsonb_build_object('success', false, 'message', 'Akses ditolak.');
    END IF;

    UPDATE public.pengaturan_sekolah
    SET
        mengetahui_jabatan = COALESCE(p_jabatan, 'Ketua PKBM Cahaya Mulia'),
        mengetahui_nama = COALESCE(p_nama, ''),
        mengetahui_nip = COALESCE(p_nip, ''),
        updated_at = now()
    WHERE id = 1;

    RETURN jsonb_build_object('success', true);
END;
$$;

-- ------------------------------------------------------------------------------
-- 8. RPC FUNCTIONS: ADMIN MANAJEMEN AKUN (AUTH + PROFILES TANPA EXPOSE SERVICE KEY)
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.admin_create_user(
    p_email TEXT,
    p_password TEXT,
    p_nama_lengkap TEXT,
    p_nomor_induk TEXT,
    p_jenis_kelamin TEXT DEFAULT 'L',
    p_role TEXT DEFAULT 'siswa',
    p_kelas TEXT DEFAULT NULL,
    p_kelas_diajar TEXT[] DEFAULT ARRAY[]::TEXT[],
    p_mata_pelajaran TEXT DEFAULT '',
    p_jabatan TEXT DEFAULT 'Staf Tata Usaha',
    p_foto_profil_url TEXT DEFAULT ''
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions, pg_temp
AS $$
DECLARE
    v_user_id UUID := gen_random_uuid();
    v_email TEXT := lower(trim(COALESCE(p_email, '')));
    v_nip TEXT := trim(COALESCE(p_nomor_induk, ''));
    v_pwd TEXT := COALESCE(NULLIF(trim(p_password), ''), 'password123');
    v_qr TEXT;
    v_cls TEXT;
    v_profile RECORD;
BEGIN
    IF public.get_my_role() <> 'admin' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Akses ditolak: Hanya Administrator.');
    END IF;

    IF p_role NOT IN ('siswa', 'guru', 'admin') THEN
        RETURN jsonb_build_object('success', false, 'message', 'Role pengguna tidak valid.');
    END IF;

    IF v_email = '' OR v_nip = '' OR trim(COALESCE(p_nama_lengkap, '')) = '' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Nama lengkap, nomor induk, dan email wajib diisi.');
    END IF;

    IF length(v_pwd) < 6 THEN
        RETURN jsonb_build_object('success', false, 'message', 'Password minimal 6 karakter.');
    END IF;

    IF EXISTS (SELECT 1 FROM public.profiles WHERE lower(nomor_induk) = lower(v_nip)) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Nomor Induk (NISN/NIP/NIK) "' || v_nip || '" sudah terdaftar.');
    END IF;

    IF EXISTS (SELECT 1 FROM auth.users WHERE lower(email) = v_email)
       OR EXISTS (SELECT 1 FROM public.profiles WHERE lower(email) = v_email) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Email "' || v_email || '" sudah terdaftar.');
    END IF;

    v_qr := 'tok_' || p_role || '_' || encode(extensions.gen_random_bytes(8), 'hex');

    IF p_kelas IS NOT NULL AND trim(p_kelas) <> '' THEN
        INSERT INTO public.classes(name) VALUES (upper(trim(p_kelas))) ON CONFLICT DO NOTHING;
    END IF;

    IF p_kelas_diajar IS NOT NULL AND array_length(p_kelas_diajar, 1) > 0 THEN
        FOREACH v_cls IN ARRAY p_kelas_diajar LOOP
            IF trim(v_cls) <> '' THEN
                INSERT INTO public.classes(name) VALUES (upper(trim(v_cls))) ON CONFLICT DO NOTHING;
            END IF;
        END LOOP;
    END IF;

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, confirmation_token, recovery_token,
        email_change_token_new, email_change,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        v_user_id,
        'authenticated',
        'authenticated',
        v_email,
        crypt(v_pwd, gen_salt('bf')),
        now(),
        '', '', '', '',
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('nama_lengkap', trim(p_nama_lengkap), 'role', p_role),
        now(),
        now()
    );

    INSERT INTO auth.identities (
        id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(),
        v_user_id,
        v_user_id::text,
        'email',
        jsonb_build_object('sub', v_user_id::text, 'email', v_email, 'email_verified', true, 'phone_verified', false),
        now(),
        now(),
        now()
    )
    ON CONFLICT (provider_id, provider) DO NOTHING;

    INSERT INTO public.profiles (
        id, email, nama_lengkap, nomor_induk, jenis_kelamin, role,
        kelas, kelas_diajar, mata_pelajaran, jabatan, is_root,
        qr_token, foto_profil_url
    ) VALUES (
        v_user_id,
        v_email,
        trim(p_nama_lengkap),
        v_nip,
        CASE WHEN upper(COALESCE(p_jenis_kelamin, 'L')) = 'P' THEN 'P' ELSE 'L' END,
        p_role,
        CASE WHEN p_role = 'siswa' THEN upper(trim(COALESCE(p_kelas, '12'))) ELSE NULL END,
        COALESCE(p_kelas_diajar, ARRAY[]::TEXT[]),
        COALESCE(p_mata_pelajaran, ''),
        COALESCE(NULLIF(trim(p_jabatan), ''), 'Staf Tata Usaha'),
        false,
        v_qr,
        COALESCE(p_foto_profil_url, '')
    )
    RETURNING * INTO v_profile;

    RETURN jsonb_build_object('success', true, 'profile', to_jsonb(v_profile));
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_user(
    p_user_id UUID,
    p_email TEXT DEFAULT NULL,
    p_password TEXT DEFAULT NULL,
    p_nama_lengkap TEXT DEFAULT NULL,
    p_nomor_induk TEXT DEFAULT NULL,
    p_jenis_kelamin TEXT DEFAULT NULL,
    p_kelas TEXT DEFAULT NULL,
    p_kelas_diajar TEXT[] DEFAULT NULL,
    p_mata_pelajaran TEXT DEFAULT NULL,
    p_jabatan TEXT DEFAULT NULL,
    p_foto_profil_url TEXT DEFAULT NULL,
    p_foto_update_count INT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions, pg_temp
AS $$
DECLARE
    v_existing RECORD;
    v_email TEXT;
    v_nip TEXT;
    v_cls TEXT;
    v_profile RECORD;
BEGIN
    IF public.get_my_role() <> 'admin' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Akses ditolak: Hanya Administrator.');
    END IF;

    SELECT * INTO v_existing FROM public.profiles WHERE id = p_user_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Data pengguna tidak ditemukan.');
    END IF;

    v_email := COALESCE(NULLIF(lower(trim(p_email)), ''), v_existing.email);
    v_nip := COALESCE(NULLIF(trim(p_nomor_induk), ''), v_existing.nomor_induk);

    IF EXISTS (SELECT 1 FROM public.profiles WHERE id <> p_user_id AND lower(nomor_induk) = lower(v_nip)) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Nomor Induk "' || v_nip || '" sudah digunakan akun lain.');
    END IF;

    IF EXISTS (SELECT 1 FROM public.profiles WHERE id <> p_user_id AND lower(email) = v_email) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Email "' || v_email || '" sudah digunakan akun lain.');
    END IF;

    IF p_kelas IS NOT NULL AND trim(p_kelas) <> '' THEN
        INSERT INTO public.classes(name) VALUES (upper(trim(p_kelas))) ON CONFLICT DO NOTHING;
    END IF;

    IF p_kelas_diajar IS NOT NULL AND array_length(p_kelas_diajar, 1) > 0 THEN
        FOREACH v_cls IN ARRAY p_kelas_diajar LOOP
            IF trim(v_cls) <> '' THEN
                INSERT INTO public.classes(name) VALUES (upper(trim(v_cls))) ON CONFLICT DO NOTHING;
            END IF;
        END LOOP;
    END IF;

    UPDATE public.profiles SET
        email = v_email,
        nama_lengkap = COALESCE(NULLIF(trim(p_nama_lengkap), ''), nama_lengkap),
        nomor_induk = v_nip,
        jenis_kelamin = COALESCE(NULLIF(upper(trim(p_jenis_kelamin)), ''), jenis_kelamin),
        kelas = CASE WHEN role = 'siswa' THEN COALESCE(NULLIF(upper(trim(p_kelas)), ''), kelas) ELSE kelas END,
        kelas_diajar = COALESCE(p_kelas_diajar, kelas_diajar),
        mata_pelajaran = COALESCE(p_mata_pelajaran, mata_pelajaran),
        jabatan = COALESCE(p_jabatan, jabatan),
        foto_profil_url = COALESCE(p_foto_profil_url, foto_profil_url),
        foto_update_count = COALESCE(p_foto_update_count, foto_update_count),
        updated_at = now()
    WHERE id = p_user_id
    RETURNING * INTO v_profile;

    UPDATE auth.users SET
        email = v_email,
        encrypted_password = CASE
            WHEN p_password IS NOT NULL AND length(trim(p_password)) >= 6
            THEN crypt(trim(p_password), gen_salt('bf'))
            ELSE encrypted_password
        END,
        updated_at = now()
    WHERE id = p_user_id;

    UPDATE auth.identities SET
        identity_data = jsonb_set(identity_data, '{email}', to_jsonb(v_email)),
        updated_at = now()
    WHERE user_id = p_user_id AND provider = 'email';

    RETURN jsonb_build_object('success', true, 'profile', to_jsonb(v_profile));
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_reset_user_password(
    p_user_id UUID,
    p_new_password TEXT DEFAULT 'password123'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions, pg_temp
AS $$
DECLARE
    v_pwd TEXT := trim(COALESCE(p_new_password, ''));
BEGIN
    IF public.get_my_role() <> 'admin' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Akses ditolak.');
    END IF;

    IF length(v_pwd) < 6 THEN
        RETURN jsonb_build_object('success', false, 'message', 'Password minimal 6 karakter.');
    END IF;

    UPDATE auth.users
    SET encrypted_password = crypt(v_pwd, gen_salt('bf')), updated_at = now()
    WHERE id = p_user_id;

    RETURN jsonb_build_object('success', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_user_deleted(
    p_user_id UUID,
    p_is_deleted BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_target RECORD;
BEGIN
    IF public.get_my_role() <> 'admin' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Akses ditolak.');
    END IF;

    SELECT * INTO v_target FROM public.profiles WHERE id = p_user_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Data pengguna tidak ditemukan.');
    END IF;

    IF p_is_deleted AND v_target.is_root THEN
        RETURN jsonb_build_object('success', false, 'message', 'Akun Super Admin (Root) tidak dapat dihapus.');
    END IF;

    IF p_is_deleted AND p_user_id = auth.uid() THEN
        RETURN jsonb_build_object('success', false, 'message', 'Tidak dapat menghapus akun yang sedang aktif digunakan.');
    END IF;

    UPDATE public.profiles SET
        is_deleted = p_is_deleted,
        deleted_at = CASE WHEN p_is_deleted THEN now() ELSE NULL END,
        updated_at = now()
    WHERE id = p_user_id;

    UPDATE auth.users SET
        banned_until = CASE WHEN p_is_deleted THEN '2099-12-31 00:00:00+00'::timestamptz ELSE NULL END,
        updated_at = now()
    WHERE id = p_user_id;

    RETURN jsonb_build_object('success', true);
END;
$$;

-- ------------------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengaturan_sekolah ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presensi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengajuan_izin ENABLE ROW LEVEL SECURITY;

-- CLASSES
DROP POLICY IF EXISTS "Classes readable by authenticated users" ON public.classes;
CREATE POLICY "Classes readable by authenticated users"
ON public.classes FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Classes manageable by admin" ON public.classes;
CREATE POLICY "Classes manageable by admin"
ON public.classes FOR ALL TO authenticated
USING (public.get_my_role() = 'admin')
WITH CHECK (public.get_my_role() = 'admin');

-- PROFILES
DROP POLICY IF EXISTS "Profiles can be viewed by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Profiles selective view policy" ON public.profiles;
CREATE POLICY "Profiles selective view policy"
ON public.profiles FOR SELECT TO authenticated
USING (
    id = auth.uid()
    OR public.get_my_role() IN ('admin', 'guru')
);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = id OR public.get_my_role() = 'admin')
WITH CHECK (auth.uid() = id OR public.get_my_role() = 'admin');

-- PENGATURAN SEKOLAH
DROP POLICY IF EXISTS "Pengaturan sekolah can be read by authenticated users" ON public.pengaturan_sekolah;
CREATE POLICY "Pengaturan sekolah can be read by authenticated users"
ON public.pengaturan_sekolah FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Pengaturan sekolah only editable by admin" ON public.pengaturan_sekolah;
CREATE POLICY "Pengaturan sekolah only editable by admin"
ON public.pengaturan_sekolah FOR ALL TO authenticated
USING (public.get_my_role() = 'admin')
WITH CHECK (public.get_my_role() = 'admin');

-- PRESENSI
DROP POLICY IF EXISTS "Presensi view policy" ON public.presensi;
CREATE POLICY "Presensi view policy"
ON public.presensi FOR SELECT TO authenticated
USING (
    user_id = auth.uid()
    OR public.get_my_role() IN ('admin', 'guru')
);

DROP POLICY IF EXISTS "Presensi edit policy by teacher/admin" ON public.presensi;
CREATE POLICY "Presensi edit policy by teacher/admin"
ON public.presensi FOR ALL TO authenticated
USING (public.get_my_role() IN ('admin', 'guru'))
WITH CHECK (public.get_my_role() IN ('admin', 'guru'));

-- PENGAJUAN IZIN
DROP POLICY IF EXISTS "Pengajuan izin view policy" ON public.pengajuan_izin;
CREATE POLICY "Pengajuan izin view policy"
ON public.pengajuan_izin FOR SELECT TO authenticated
USING (
    user_id = auth.uid()
    OR public.get_my_role() IN ('admin', 'guru')
);

DROP POLICY IF EXISTS "Siswa can insert izin" ON public.pengajuan_izin;
CREATE POLICY "Siswa can insert izin"
ON public.pengajuan_izin FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admin & guru can update izin" ON public.pengajuan_izin;
CREATE POLICY "Admin & guru can update izin"
ON public.pengajuan_izin FOR UPDATE TO authenticated
USING (public.get_my_role() IN ('admin', 'guru'))
WITH CHECK (public.get_my_role() IN ('admin', 'guru'));

-- ------------------------------------------------------------------------------
-- 10. GRANT EXECUTE RPC & AKTIFKAN SUPABASE REALTIME
-- ------------------------------------------------------------------------------
GRANT EXECUTE ON FUNCTION public.submit_presensi_gps(DOUBLE PRECISION, DOUBLE PRECISION, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.scan_qr_presensi_siswa(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_pengajuan_izin(DATE, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reset_siswa_qr_token(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_rekap_signatory(TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_create_user(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[], TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_user(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[], TEXT, TEXT, TEXT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_reset_user_password(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_user_deleted(UUID, BOOLEAN) TO authenticated;

DO $$
DECLARE
    v_tbl TEXT;
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        FOREACH v_tbl IN ARRAY ARRAY['presensi', 'pengaturan_sekolah', 'classes', 'profiles'] LOOP
            IF NOT EXISTS (
                SELECT 1
                FROM pg_publication_tables
                WHERE pubname = 'supabase_realtime'
                  AND schemaname = 'public'
                  AND tablename = v_tbl
            ) THEN
                EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', v_tbl);
            END IF;
        END LOOP;
    END IF;
END $$;

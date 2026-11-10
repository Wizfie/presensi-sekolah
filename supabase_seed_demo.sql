-- ==============================================================================
-- DATA SEEDING DEMO AWAL: SISTEM PRESENSI PKBM CAHAYA MULIA (SUPABASE)
-- Jalankan file ini di Supabase SQL Editor SETELAH menjalankan supabase_schema.sql
--
-- Password default semua akun demo: password123
-- Akun Demo Utama (untuk Akses Demo Cepat / Login Manual):
--   Admin      : admin@pkbm.sch.id      (ID: ADM-001)
--   Guru Piket : tutor@pkbm.sch.id      (NIP: 198507122010011005)
--   Siswa      : ade@pkbm.sch.id        (NISN: 20241201)
-- ==============================================================================

DO $$
DECLARE
    v_admin_id   UUID := '11111111-1111-1111-1111-111111111111';
    v_guru1_id   UUID := '22222222-2222-2222-2222-222222222222';
    v_guru2_id   UUID := '22222222-2222-2222-2222-222222222223';
    v_encrypted_pw TEXT := extensions.crypt('password123', extensions.gen_salt('bf'));
    v_jakarta_now TIMESTAMP := (now() AT TIME ZONE 'Asia/Jakarta');
    v_today DATE := v_jakarta_now::date;
    v_year INT := EXTRACT(YEAR FROM v_jakarta_now)::int;
    v_month INT := EXTRACT(MONTH FROM v_jakarta_now)::int;
    v_tp TEXT;
    v_user_rec RECORD;
    v_uid UUID;
    v_day INT;
    v_d DATE;
    v_dow INT;
    v_seed INT;
    v_status TEXT;
    v_jam_in TIMESTAMPTZ;
    v_jam_out TIMESTAMPTZ;
    v_metode TEXT;
    v_ket TEXT;
    v_idx INT := 0;
BEGIN
    -- Hitung Tahun Pelajaran berjalan secara dinamis (Juli = awal tahun ajar baru)
    v_tp := CASE WHEN v_month >= 7 THEN v_year || '/' || (v_year + 1) ELSE (v_year - 1) || '/' || v_year END;

    -- 1. SEED MASTER KELAS
    INSERT INTO public.classes (name) VALUES ('10'), ('11'), ('12')
    ON CONFLICT (name) DO NOTHING;

    -- 2. SEED PENGATURAN SEKOLAH (PKBM CAHAYA MULIA)
    INSERT INTO public.pengaturan_sekolah (
        id, nama_sekolah, alamat, tahun_pelajaran,
        latitude, longitude, radius_meter,
        jam_masuk, jam_terlambat, jam_pulang,
        mengetahui_jabatan, mengetahui_nama, mengetahui_nip
    ) VALUES (
        1,
        'PKBM Cahaya Mulia',
        'Jl. Surya Kencana No. 1, Pamulang, Tangerang Selatan',
        v_tp,
        -6.345853,
        106.738159,
        100,
        '07:30:00',
        '08:00:00',
        '14:00:00',
        'Ketua PKBM Cahaya Mulia',
        'Drs. H. Ahmad Fauzi, M.Pd',
        '197004121998031004'
    )
    ON CONFLICT (id) DO UPDATE SET
        nama_sekolah = EXCLUDED.nama_sekolah,
        alamat = EXCLUDED.alamat,
        tahun_pelajaran = EXCLUDED.tahun_pelajaran,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        radius_meter = EXCLUDED.radius_meter,
        mengetahui_jabatan = EXCLUDED.mengetahui_jabatan,
        mengetahui_nama = EXCLUDED.mengetahui_nama,
        mengetahui_nip = EXCLUDED.mengetahui_nip,
        updated_at = now();

    -- Bersihkan data siswa/guru demo lama dengan domain @pkbm.sch.id agar tidak bentrok ID bila re-seed
    DELETE FROM public.pengajuan_izin;
    DELETE FROM public.presensi;
    DELETE FROM auth.users
    WHERE email LIKE '%@pkbm.sch.id'
      AND id <> v_admin_id
      AND id <> v_guru1_id
      AND id <> v_guru2_id;

    -- 3. SEED ADMIN & GURU PIKET DEMO
    FOR v_user_rec IN
        SELECT * FROM (VALUES
            (v_admin_id, 'admin@pkbm.sch.id', 'Administrator PKBM', 'ADM-001', 'L', 'admin', NULL::text, ARRAY[]::text[], '', 'Pengelola PKBM Cahaya Mulia', true, 'tok_admin_root'),
            (v_guru1_id, 'tutor@pkbm.sch.id', 'Budi Santoso, S.Pd', '198507122010011005', 'L', 'guru', '12', ARRAY['12','11','10'], 'Guru Piket Harian, Tutor Paket C', 'Guru Piket', false, 'tok_guru_budi_secure'),
            (v_guru2_id, 'siti.tutor@pkbm.sch.id', 'Siti Nurhaliza, M.Pd', '199003152015022003', 'P', 'guru', '11', ARRAY['12','11'], 'Tutor Bahasa Indonesia, Wali Paket C', 'Tutor', false, 'tok_guru_siti_secure')
        ) AS t(uid, email, nama, nip, jk, role_name, kls, kls_diajar, mapel, jbt, root_flag, qr)
    LOOP
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password,
            email_confirmed_at, confirmation_token, recovery_token,
            email_change_token_new, email_change,
            raw_app_meta_data, raw_user_meta_data, banned_until, created_at, updated_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            v_user_rec.uid, 'authenticated', 'authenticated', v_user_rec.email, v_encrypted_pw,
            now(), '', '', '', '',
            '{"provider":"email","providers":["email"]}'::jsonb,
            jsonb_build_object('nama_lengkap', v_user_rec.nama, 'role', v_user_rec.role_name),
            NULL, now(), now()
        )
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            encrypted_password = EXCLUDED.encrypted_password,
            email_confirmed_at = now(),
            banned_until = NULL,
            updated_at = now();

        INSERT INTO auth.identities (
            id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at
        ) VALUES (
            gen_random_uuid(),
            v_user_rec.uid,
            v_user_rec.uid::text,
            'email',
            jsonb_build_object('sub', v_user_rec.uid::text, 'email', v_user_rec.email, 'email_verified', true, 'phone_verified', false),
            now(), now(), now()
        )
        ON CONFLICT (provider_id, provider) DO UPDATE SET
            identity_data = EXCLUDED.identity_data,
            updated_at = now();

        INSERT INTO public.profiles (
            id, email, nama_lengkap, nomor_induk, jenis_kelamin, role,
            kelas, kelas_diajar, mata_pelajaran, jabatan, is_root, qr_token, is_deleted, deleted_at
        ) VALUES (
            v_user_rec.uid, v_user_rec.email, v_user_rec.nama, v_user_rec.nip, v_user_rec.jk, v_user_rec.role_name,
            v_user_rec.kls, v_user_rec.kls_diajar, v_user_rec.mapel, v_user_rec.jbt, v_user_rec.root_flag, v_user_rec.qr, false, NULL
        )
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            nama_lengkap = EXCLUDED.nama_lengkap,
            nomor_induk = EXCLUDED.nomor_induk,
            jenis_kelamin = EXCLUDED.jenis_kelamin,
            role = EXCLUDED.role,
            kelas = EXCLUDED.kelas,
            kelas_diajar = EXCLUDED.kelas_diajar,
            mata_pelajaran = EXCLUDED.mata_pelajaran,
            jabatan = EXCLUDED.jabatan,
            is_root = EXCLUDED.is_root,
            qr_token = EXCLUDED.qr_token,
            is_deleted = false,
            deleted_at = NULL,
            updated_at = now();
    END LOOP;

    -- 4. SEED 33 SISWA DEMO (KELAS 12: 13 siswa sesuai buku fisik, KELAS 11: 10 siswa, KELAS 10: 10 siswa)
    FOR v_user_rec IN
        SELECT * FROM (VALUES
            -- Kelas 12
            ('33333333-0012-0000-0000-000000000001'::uuid, 'ade@pkbm.sch.id', 'ADE IZA MUKTI', '20241201', 'L', '12', 'tok_std_12_20241201'),
            ('33333333-0012-0000-0000-000000000002'::uuid, 'ahmad.slamet@pkbm.sch.id', 'AHMAD SLAMET RIYADI', '20241202', 'L', '12', 'tok_std_12_20241202'),
            ('33333333-0012-0000-0000-000000000003'::uuid, 'cinta@pkbm.sch.id', 'CINTA RAYA KHAIRUNNISA', '20241203', 'P', '12', 'tok_std_12_20241203'),
            ('33333333-0012-0000-0000-000000000004'::uuid, 'gadis@pkbm.sch.id', 'GADIS ZAMJIROH', '20241204', 'P', '12', 'tok_std_12_20241204'),
            ('33333333-0012-0000-0000-000000000005'::uuid, 'lina@pkbm.sch.id', 'LINA DWIYANTI', '20241205', 'P', '12', 'tok_std_12_20241205'),
            ('33333333-0012-0000-0000-000000000006'::uuid, 'mahfud@pkbm.sch.id', 'MAHFUD', '20241206', 'L', '12', 'tok_std_12_20241206'),
            ('33333333-0012-0000-0000-000000000007'::uuid, 'reyhan@pkbm.sch.id', 'MUHAMAD REYHAN .S', '20241207', 'L', '12', 'tok_std_12_20241207'),
            ('33333333-0012-0000-0000-000000000008'::uuid, 'najil@pkbm.sch.id', 'NAJIL HAWARI', '20241208', 'L', '12', 'tok_std_12_20241208'),
            ('33333333-0012-0000-0000-000000000009'::uuid, 'novita@pkbm.sch.id', 'NOVITA SARI', '20241209', 'P', '12', 'tok_std_12_20241209'),
            ('33333333-0012-0000-0000-000000000010'::uuid, 'ridwan@pkbm.sch.id', 'RIDWAN SAYIDNA AL .B', '20241210', 'L', '12', 'tok_std_12_20241210'),
            ('33333333-0012-0000-0000-000000000011'::uuid, 'tohirun@pkbm.sch.id', 'TOHIRUN', '20241211', 'L', '12', 'tok_std_12_20241211'),
            ('33333333-0012-0000-0000-000000000012'::uuid, 'widiyawila@pkbm.sch.id', 'WIDIYAWILA SAVITA', '20241212', 'P', '12', 'tok_std_12_20241212'),
            ('33333333-0012-0000-0000-000000000013'::uuid, 'yuliyana@pkbm.sch.id', 'YULIYANA', '20241213', 'P', '12', 'tok_std_12_20241213'),
            -- Kelas 11
            ('33333333-0011-0000-0000-000000000001'::uuid, 'aditya.1101@pkbm.sch.id', 'ADITYA RAMADHAN', '20251101', 'L', '11', 'tok_std_11_20251101'),
            ('33333333-0011-0000-0000-000000000002'::uuid, 'bima.1102@pkbm.sch.id', 'BIMA SAKTI', '20251102', 'L', '11', 'tok_std_11_20251102'),
            ('33333333-0011-0000-0000-000000000003'::uuid, 'cantika.1103@pkbm.sch.id', 'CANTIKA DEWI', '20251103', 'P', '11', 'tok_std_11_20251103'),
            ('33333333-0011-0000-0000-000000000004'::uuid, 'doni.1104@pkbm.sch.id', 'DONI KURNIAWAN', '20251104', 'L', '11', 'tok_std_11_20251104'),
            ('33333333-0011-0000-0000-000000000005'::uuid, 'elsa.1105@pkbm.sch.id', 'ELSA MAYORI', '20251105', 'P', '11', 'tok_std_11_20251105'),
            ('33333333-0011-0000-0000-000000000006'::uuid, 'fadillah.1106@pkbm.sch.id', 'FADILLAH AKBAR', '20251106', 'L', '11', 'tok_std_11_20251106'),
            ('33333333-0011-0000-0000-000000000007'::uuid, 'gita.1107@pkbm.sch.id', 'GITA GUTAWA', '20251107', 'P', '11', 'tok_std_11_20251107'),
            ('33333333-0011-0000-0000-000000000008'::uuid, 'hafizh.1108@pkbm.sch.id', 'HAFIZH SYAHRIN', '20251108', 'L', '11', 'tok_std_11_20251108'),
            ('33333333-0011-0000-0000-000000000009'::uuid, 'intan.1109@pkbm.sch.id', 'INTAN PERMATA', '20251109', 'P', '11', 'tok_std_11_20251109'),
            ('33333333-0011-0000-0000-000000000010'::uuid, 'joko.1110@pkbm.sch.id', 'JOKO SUSILO', '20251110', 'L', '11', 'tok_std_11_20251110'),
            -- Kelas 10
            ('33333333-0010-0000-0000-000000000001'::uuid, 'arif.1001@pkbm.sch.id', 'ARIF RAHMAN', '20261001', 'L', '10', 'tok_std_10_20261001'),
            ('33333333-0010-0000-0000-000000000002'::uuid, 'bayu.1002@pkbm.sch.id', 'BAYU SKAK', '20261002', 'L', '10', 'tok_std_10_20261002'),
            ('33333333-0010-0000-0000-000000000003'::uuid, 'cindy.1003@pkbm.sch.id', 'CINDY GULLA', '20261003', 'P', '10', 'tok_std_10_20261003'),
            ('33333333-0010-0000-0000-000000000004'::uuid, 'danang.1004@pkbm.sch.id', 'DANANG PRADANA', '20261004', 'L', '10', 'tok_std_10_20261004'),
            ('33333333-0010-0000-0000-000000000005'::uuid, 'eva.1005@pkbm.sch.id', 'EVA CELIA', '20261005', 'P', '10', 'tok_std_10_20261005'),
            ('33333333-0010-0000-0000-000000000006'::uuid, 'farhan.1006@pkbm.sch.id', 'FARHAN RASYID', '20261006', 'L', '10', 'tok_std_10_20261006'),
            ('33333333-0010-0000-0000-000000000007'::uuid, 'grace.1007@pkbm.sch.id', 'GRACE NATALIE', '20261007', 'P', '10', 'tok_std_10_20261007'),
            ('33333333-0010-0000-0000-000000000008'::uuid, 'haikal.1008@pkbm.sch.id', 'HAIKAL KAMIL', '20261008', 'L', '10', 'tok_std_10_20261008'),
            ('33333333-0010-0000-0000-000000000009'::uuid, 'isyana.1009@pkbm.sch.id', 'ISYANA SARASVATI', '20261009', 'P', '10', 'tok_std_10_20261009'),
            ('33333333-0010-0000-0000-000000000010'::uuid, 'jefri.1010@pkbm.sch.id', 'JEFRI NICHOL', '20261010', 'L', '10', 'tok_std_10_20261010')
        ) AS s(uid, email, nama, nisn, jk, kls, qr)
    LOOP
        v_idx := v_idx + 1;

        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password,
            email_confirmed_at, confirmation_token, recovery_token,
            email_change_token_new, email_change,
            raw_app_meta_data, raw_user_meta_data, banned_until, created_at, updated_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            v_user_rec.uid, 'authenticated', 'authenticated', v_user_rec.email, v_encrypted_pw,
            now(), '', '', '', '',
            '{"provider":"email","providers":["email"]}'::jsonb,
            jsonb_build_object('nama_lengkap', v_user_rec.nama, 'role', 'siswa'),
            NULL, now(), now()
        )
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            encrypted_password = EXCLUDED.encrypted_password,
            email_confirmed_at = now(),
            banned_until = NULL,
            updated_at = now();

        INSERT INTO auth.identities (
            id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at
        ) VALUES (
            gen_random_uuid(),
            v_user_rec.uid,
            v_user_rec.uid::text,
            'email',
            jsonb_build_object('sub', v_user_rec.uid::text, 'email', v_user_rec.email, 'email_verified', true, 'phone_verified', false),
            now(), now(), now()
        )
        ON CONFLICT (provider_id, provider) DO UPDATE SET
            identity_data = EXCLUDED.identity_data,
            updated_at = now();

        INSERT INTO public.profiles (
            id, email, nama_lengkap, nomor_induk, jenis_kelamin, role, kelas, qr_token, is_deleted, deleted_at
        ) VALUES (
            v_user_rec.uid, v_user_rec.email, v_user_rec.nama, v_user_rec.nisn, v_user_rec.jk, 'siswa', v_user_rec.kls, v_user_rec.qr, false, NULL
        )
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            nama_lengkap = EXCLUDED.nama_lengkap,
            nomor_induk = EXCLUDED.nomor_induk,
            jenis_kelamin = EXCLUDED.jenis_kelamin,
            role = 'siswa',
            kelas = EXCLUDED.kelas,
            qr_token = EXCLUDED.qr_token,
            is_deleted = false,
            deleted_at = NULL,
            updated_at = now();

        -- 5. SEED RIWAYAT PRESENSI BULAN BERJALAN (Senin-Jumat s.d. hari ini)
        FOR v_day IN 1..EXTRACT(DAY FROM v_today)::int LOOP
            v_d := make_date(v_year, v_month, v_day);
            v_dow := EXTRACT(DOW FROM v_d)::int;
            CONTINUE WHEN v_dow IN (0, 6); -- Lewati Sabtu & Minggu

            -- Untuk HARI INI:
            -- - Siswa pertama (ADE IZA MUKTI / akun demo siswa) dibiarkan BELUM presensi agar bisa didemokan langsung!
            -- - GADIS ZAMJIROH dibuat Sakit (dengan pengajuan izin)
            -- - Sebagian siswa lain sudah presensi masuk (tanpa jam pulang) agar bisa demo Set Pulang
            IF v_d = v_today THEN
                IF v_user_rec.nisn = '20241201' THEN
                    CONTINUE;
                ELSIF v_user_rec.nisn = '20241204' THEN
                    INSERT INTO public.presensi (user_id, tanggal, status, metode_presensi, dicatat_oleh, keterangan, catatan)
                    VALUES (v_user_rec.uid, v_d, 'sakit', 'manual_guru', v_guru1_id, 'Sakit demam, istirahat di rumah.', 'Sakit demam, istirahat di rumah.');
                    CONTINUE;
                ELSIF (v_idx % 2) = 0 THEN
                    INSERT INTO public.presensi (
                        user_id, tanggal, jam_masuk, jam_pulang, status, metode_presensi, jarak_masuk_meter, dicatat_oleh
                    ) VALUES (
                        v_user_rec.uid, v_d,
                        (v_d::text || ' 07:24:00+07:00')::timestamptz,
                        NULL,
                        'hadir',
                        CASE WHEN (v_idx % 3) = 0 THEN 'mandiri_gps' ELSE 'qr_guru' END,
                        CASE WHEN (v_idx % 3) = 0 THEN 18.5 ELSE 0 END,
                        CASE WHEN (v_idx % 3) = 0 THEN NULL ELSE v_guru1_id END
                    );
                END IF;
                CONTINUE;
            END IF;

            -- Hari kerja sebelumnya dalam bulan berjalan
            v_seed := (v_idx * 17 + v_day * 13) % 100;
            IF v_seed < 85 THEN
                v_status := 'hadir';
                v_jam_in := (v_d::text || ' 07:' || lpad((15 + (v_seed % 15))::text, 2, '0') || ':00+07:00')::timestamptz;
                v_jam_out := (v_d::text || ' 14:05:00+07:00')::timestamptz;
                v_metode := CASE WHEN (v_idx % 3) = 0 THEN 'mandiri_gps' WHEN (v_idx % 3) = 1 THEN 'qr_guru' ELSE 'manual_guru' END;
                v_ket := NULL;
            ELSIF v_seed < 90 THEN
                v_status := 'sakit';
                v_jam_in := NULL;
                v_jam_out := NULL;
                v_metode := 'manual_guru';
                v_ket := 'Sakit';
            ELSIF v_seed < 95 THEN
                v_status := 'izin';
                v_jam_in := NULL;
                v_jam_out := NULL;
                v_metode := 'manual_guru';
                v_ket := 'Izin Keperluan Keluarga';
            ELSE
                v_status := 'alpa';
                v_jam_in := NULL;
                v_jam_out := NULL;
                v_metode := 'manual_guru';
                v_ket := NULL;
            END IF;

            INSERT INTO public.presensi (
                user_id, tanggal, jam_masuk, jam_pulang, status, metode_presensi,
                jarak_masuk_meter, dicatat_oleh, keterangan, catatan
            ) VALUES (
                v_user_rec.uid, v_d, v_jam_in, v_jam_out, v_status, v_metode,
                CASE WHEN v_metode = 'mandiri_gps' THEN 15 + (v_seed % 30) ELSE 0 END,
                CASE WHEN v_metode <> 'mandiri_gps' THEN v_guru1_id ELSE NULL END,
                v_ket, v_ket
            )
            ON CONFLICT (user_id, tanggal) DO NOTHING;
        END LOOP;
    END LOOP;

    -- 6. SEED CONTOH PENGAJUAN IZIN
    INSERT INTO public.pengajuan_izin (
        user_id, tanggal_mulai, tanggal_selesai, jenis, keterangan, status
    ) VALUES (
        '33333333-0012-0000-0000-000000000004'::uuid,
        v_today,
        v_today,
        'sakit',
        'Sakit demam, istirahat di rumah.',
        'approved'
    );
END $$;

-- Verifikasi Ringkas Hasil Seeding Demo
SELECT role, count(*) AS jumlah_akun
FROM public.profiles
WHERE is_deleted = false
GROUP BY role
ORDER BY role;

SELECT status, count(*) AS jumlah_presensi_demo
FROM public.presensi
GROUP BY status
ORDER BY status;

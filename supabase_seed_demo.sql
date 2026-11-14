-- ==============================================================================
-- DATA SEEDING DEMO: SISTEM PRESENSI PKBM CAHAYA MULIA (SUPABASE)
-- Jalankan file ini di Supabase SQL Editor SETELAH menjalankan supabase_schema.sql
--
-- KREDENSIAL LOGIN AKUN DEMO:
--   1. Admin       : admin@mail.com  | Password: pkbmadmin
--   2. Guru Piket 1: guru1@mail.com  | Password: password123 (NIP: 198507122010011005)
--   3. Guru Piket 2: guru2@mail.com  | Password: password123 (NIP: 199003152015022003)
--   4. Siswa (Login via NISN, Password: password123):
--        • Kelas 12 : NISN 1201 s/d 1210 (Demo Utama: 1201 - ADE IZA MUKTI)
--        • Kelas 11 : NISN 1101 s/d 1110 (Demo Utama: 1101 - ADITYA RAMADHAN)
--        • Kelas 10 : NISN 1001 s/d 1010 (Demo Utama: 1001 - ARIF RAHMAN)
--
-- MASTER KELAS TERDAFTAR: 10, 11, 12 (10 Siswa per Kelas = Total 30 Siswa)
-- ==============================================================================

DO $$
DECLARE
    v_admin_id           UUID := '11111111-1111-1111-1111-111111111111';
    v_guru1_id           UUID := '22222222-2222-2222-2222-222222222222';
    v_guru2_id           UUID := '22222222-2222-2222-2222-222222222223';
    v_encrypted_pw       TEXT := extensions.crypt('password123', extensions.gen_salt('bf'));
    v_encrypted_admin_pw TEXT := extensions.crypt('pkbmadmin', extensions.gen_salt('bf'));
    v_jakarta_now        TIMESTAMP := (now() AT TIME ZONE 'Asia/Jakarta');
    v_today              DATE := v_jakarta_now::date;
    v_year               INT := EXTRACT(YEAR FROM v_jakarta_now)::int;
    v_month              INT := EXTRACT(MONTH FROM v_jakarta_now)::int;
    v_tp                 TEXT;
    v_user_rec           RECORD;
    v_day                INT;
    v_d                  DATE;
    v_dow                INT;
    v_seed               INT;
    v_status             TEXT;
    v_jam_in             TIMESTAMPTZ;
    v_jam_out            TIMESTAMPTZ;
    v_metode             TEXT;
    v_ket                TEXT;
    v_idx                INT := 0;
BEGIN
    -- Hitung Tahun Pelajaran berjalan secara dinamis (Juli = awal tahun ajar baru)
    v_tp := CASE WHEN v_month >= 7 THEN v_year || '/' || (v_year + 1) ELSE (v_year - 1) || '/' || v_year END;

    -- 1. SEED MASTER KELAS (10, 11, 12)
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
        'Jl. Surya Kencana No. 1, Kota Tangerang',
        v_tp,
        -6.345853,
        106.738159,
        100,
        '07:30:00',
        '08:00:00',
        '14:00:00',
        'Kepala PKBM Cahaya Mulia',
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

    -- Bersihkan data transaksi lama demo
    DELETE FROM public.pengajuan_izin;
    DELETE FROM public.presensi;

    -- Bersihkan user siswa demo lama agar ID tidak bentrok
    DELETE FROM auth.users
    WHERE (email LIKE '%@mail.com' OR email LIKE '%@pkbm.sch.id')
      AND id <> v_admin_id
      AND id <> v_guru1_id
      AND id <> v_guru2_id;

    -- 3. SEED ADMIN & GURU PIKET DEMO (admin@mail.com, guru1@mail.com, guru2@mail.com)
    FOR v_user_rec IN
        SELECT * FROM (VALUES
            (v_admin_id, 'admin@mail.com', 'Administrator PKBM', 'ADM-001', 'L', 'admin', NULL::text, ARRAY[]::text[], '', 'Pengelola PKBM Cahaya Mulia', true, 'tok_admin_root'),
            (v_guru1_id, 'guru1@mail.com', 'Budi Santoso, S.Pd', '198507122010011005', 'L', 'guru', '12', ARRAY['10','11','12'], 'Guru Piket Harian, Tutor Paket C', 'Guru Piket', false, 'tok_guru_budi_secure'),
            (v_guru2_id, 'guru2@mail.com', 'Siti Nurhaliza, M.Pd', '199003152015022003', 'P', 'guru', '11', ARRAY['10','11','12'], 'Tutor Bahasa Indonesia, Guru Piket', 'Tutor', false, 'tok_guru_siti_secure')
        ) AS t(uid, email, nama, nip, jk, role_name, kls, kls_diajar, mapel, jbt, root_flag, qr)
    LOOP
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password,
            email_confirmed_at, confirmation_token, recovery_token,
            email_change_token_new, email_change,
            raw_app_meta_data, raw_user_meta_data, banned_until, created_at, updated_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            v_user_rec.uid, 'authenticated', 'authenticated', v_user_rec.email,
            CASE WHEN v_user_rec.uid = v_admin_id THEN v_encrypted_admin_pw ELSE v_encrypted_pw END,
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

        DELETE FROM auth.identities WHERE user_id = v_user_rec.uid;
        INSERT INTO auth.identities (
            id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at
        ) VALUES (
            gen_random_uuid(),
            v_user_rec.uid,
            v_user_rec.uid::text,
            'email',
            jsonb_build_object('sub', v_user_rec.uid::text, 'email', v_user_rec.email, 'email_verified', true, 'phone_verified', false),
            now(), now(), now()
        );

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

    -- 4. SEED 30 SISWA DEMO (TEPAT 10 SISWA PER KELAS: KELAS 12, KELAS 11, KELAS 10)
    -- Format NISN mudah: 1201-1210 (Kls 12), 1101-1110 (Kls 11), 1001-1010 (Kls 10)
    FOR v_user_rec IN
        SELECT * FROM (VALUES
            -- Kelas 12 (NISN 1201 s/d 1210)
            ('33333333-0012-0000-0000-000000000001'::uuid, '1201@mail.com', 'ADE IZA MUKTI', '1201', 'L', '12', 'tok_std_1201'),
            ('33333333-0012-0000-0000-000000000002'::uuid, '1202@mail.com', 'AHMAD SLAMET RIYADI', '1202', 'L', '12', 'tok_std_1202'),
            ('33333333-0012-0000-0000-000000000003'::uuid, '1203@mail.com', 'CINTA RAYA KHAIRUNNISA', '1203', 'P', '12', 'tok_std_1203'),
            ('33333333-0012-0000-0000-000000000004'::uuid, '1204@mail.com', 'GADIS ZAMJIROH', '1204', 'P', '12', 'tok_std_1204'),
            ('33333333-0012-0000-0000-000000000005'::uuid, '1205@mail.com', 'LINA DWIYANTI', '1205', 'P', '12', 'tok_std_1205'),
            ('33333333-0012-0000-0000-000000000006'::uuid, '1206@mail.com', 'MAHFUD', '1206', 'L', '12', 'tok_std_1206'),
            ('33333333-0012-0000-0000-000000000007'::uuid, '1207@mail.com', 'MUHAMAD REYHAN .S', '1207', 'L', '12', 'tok_std_1207'),
            ('33333333-0012-0000-0000-000000000008'::uuid, '1208@mail.com', 'NAJIL HAWARI', '1208', 'L', '12', 'tok_std_1208'),
            ('33333333-0012-0000-0000-000000000009'::uuid, '1209@mail.com', 'NOVITA SARI', '1209', 'P', '12', 'tok_std_1209'),
            ('33333333-0012-0000-0000-000000000010'::uuid, '1210@mail.com', 'RIDWAN SAYIDNA AL .B', '1210', 'L', '12', 'tok_std_1210'),

            -- Kelas 11 (NISN 1101 s/d 1110)
            ('33333333-0011-0000-0000-000000000001'::uuid, '1101@mail.com', 'ADITYA RAMADHAN', '1101', 'L', '11', 'tok_std_1101'),
            ('33333333-0011-0000-0000-000000000002'::uuid, '1102@mail.com', 'BIMA SAKTI', '1102', 'L', '11', 'tok_std_1102'),
            ('33333333-0011-0000-0000-000000000003'::uuid, '1103@mail.com', 'CANTIKA DEWI', '1103', 'P', '11', 'tok_std_1103'),
            ('33333333-0011-0000-0000-000000000004'::uuid, '1104@mail.com', 'DONI KURNIAWAN', '1104', 'L', '11', 'tok_std_1104'),
            ('33333333-0011-0000-0000-000000000005'::uuid, '1105@mail.com', 'ELSA MAYORI', '1105', 'P', '11', 'tok_std_1105'),
            ('33333333-0011-0000-0000-000000000006'::uuid, '1106@mail.com', 'FADILLAH AKBAR', '1106', 'L', '11', 'tok_std_1106'),
            ('33333333-0011-0000-0000-000000000007'::uuid, '1107@mail.com', 'GITA GUTAWA', '1107', 'P', '11', 'tok_std_1107'),
            ('33333333-0011-0000-0000-000000000008'::uuid, '1108@mail.com', 'HAFIZH SYAHRIN', '1108', 'L', '11', 'tok_std_1108'),
            ('33333333-0011-0000-0000-000000000009'::uuid, '1109@mail.com', 'INTAN PERMATA', '1109', 'P', '11', 'tok_std_1109'),
            ('33333333-0011-0000-0000-000000000010'::uuid, '1110@mail.com', 'JOKO SUSILO', '1110', 'L', '11', 'tok_std_1110'),

            -- Kelas 10 (NISN 1001 s/d 1010)
            ('33333333-0010-0000-0000-000000000001'::uuid, '1001@mail.com', 'ARIF RAHMAN', '1001', 'L', '10', 'tok_std_1001'),
            ('33333333-0010-0000-0000-000000000002'::uuid, '1002@mail.com', 'BAYU SKAK', '1002', 'L', '10', 'tok_std_1002'),
            ('33333333-0010-0000-0000-000000000003'::uuid, '1003@mail.com', 'CINDY GULLA', '1003', 'P', '10', 'tok_std_1003'),
            ('33333333-0010-0000-0000-000000000004'::uuid, '1004@mail.com', 'DANANG PRADANA', '1004', 'L', '10', 'tok_std_1004'),
            ('33333333-0010-0000-0000-000000000005'::uuid, '1005@mail.com', 'EVA CELIA', '1005', 'P', '10', 'tok_std_1005'),
            ('33333333-0010-0000-0000-000000000006'::uuid, '1006@mail.com', 'FARHAN RASYID', '1006', 'L', '10', 'tok_std_1006'),
            ('33333333-0010-0000-0000-000000000007'::uuid, '1007@mail.com', 'GRACE NATALIE', '1007', 'P', '10', 'tok_std_1007'),
            ('33333333-0010-0000-0000-000000000008'::uuid, '1008@mail.com', 'HAIKAL KAMIL', '1008', 'L', '10', 'tok_std_1008'),
            ('33333333-0010-0000-0000-000000000009'::uuid, '1009@mail.com', 'ISYANA SARASVATI', '1009', 'P', '10', 'tok_std_1009'),
            ('33333333-0010-0000-0000-000000000010'::uuid, '1010@mail.com', 'JEFRI NICHOL', '1010', 'L', '10', 'tok_std_1010')
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

        DELETE FROM auth.identities WHERE user_id = v_user_rec.uid;
        INSERT INTO auth.identities (
            id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at
        ) VALUES (
            gen_random_uuid(),
            v_user_rec.uid,
            v_user_rec.uid::text,
            'email',
            jsonb_build_object('sub', v_user_rec.uid::text, 'email', v_user_rec.email, 'email_verified', true, 'phone_verified', false),
            now(), now(), now()
        );

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

        -- 5. SEED RIWAYAT PRESENSI BULAN BERJALAN
        FOR v_day IN 1..EXTRACT(DAY FROM v_today)::int LOOP
            v_d := make_date(v_year, v_month, v_day);
            v_dow := EXTRACT(DOW FROM v_d)::int;
            CONTINUE WHEN v_dow IN (0, 6); -- Lewati Sabtu & Minggu

            -- Khusus Hari Ini:
            -- - Siswa NISN 1201 (ADE IZA MUKTI) dibiarkan BELUM presensi agar bisa didemokan live!
            -- - Siswa NISN 1204 (GADIS ZAMJIROH) dibuat Sakit (dengan pengajuan izin)
            -- - Siswa genap sudah presensi masuk (tanpa jam pulang) agar bisa mendemokan Set Pulang
            IF v_d = v_today THEN
                IF v_user_rec.nisn = '1201' THEN
                    CONTINUE;
                ELSIF v_user_rec.nisn = '1204' THEN
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

            -- Hari-hari kerja sebelumnya di bulan berjalan
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

    -- 6. SEED CONTOH PENGAJUAN IZIN (GADIS ZAMJIROH / NISN 1204)
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

-- ==============================================================================
-- VERIFIKASI RINGKAS HASIL SEEDING DEMO
-- ==============================================================================
SELECT role, count(*) AS jumlah_akun
FROM public.profiles
WHERE is_deleted = false
GROUP BY role
ORDER BY role;

SELECT kelas, count(*) AS siswa_per_kelas
FROM public.profiles
WHERE role = 'siswa' AND is_deleted = false
GROUP BY kelas
ORDER BY kelas DESC;

SELECT status, count(*) AS jumlah_presensi_demo
FROM public.presensi
GROUP BY status
ORDER BY status;

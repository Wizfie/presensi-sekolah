-- ==============================================================================
-- SEEDING DATA: SISTEM PRESENSI SEKOLAH (SUPABASE POSTGRESQL)
-- Password default semua akun: password123
-- Jalankan skrip ini di SQL Editor Supabase setelah menjalankan supabase_schema.sql
-- ==============================================================================

DO $$
DECLARE
    v_admin_id UUID := '11111111-1111-1111-1111-111111111111';
    v_guru_id  UUID := '22222222-2222-2222-2222-222222222222';
    v_siswa1_id UUID := '33333333-3333-3333-3333-333333333331';
    v_siswa2_id UUID := '33333333-3333-3333-3333-333333333332';
    v_siswa3_id UUID := '33333333-3333-3333-3333-333333333333';
    v_siswa4_id UUID := '33333333-3333-3333-3333-333333333334';
    v_siswa5_id UUID := '33333333-3333-3333-3333-333333333335';
    v_encrypted_pw TEXT;
BEGIN
    -- Buat hash password 'password123'
    v_encrypted_pw := crypt('password123', gen_salt('bf'));

    -- 1. SEED AKUN DI AUTH.USERS (SUPABASE AUTH)
    -- Akun Admin
    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', v_admin_id, 'authenticated', 'authenticated', 'admin@sekolah.sch.id',
        v_encrypted_pw, now(), '{"provider":"email","providers":["email"]}', '{"nama_lengkap":"Administrator Sistem"}', now(), now()
    ) ON CONFLICT (id) DO UPDATE SET encrypted_password = EXCLUDED.encrypted_password;

    -- Akun Guru
    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', v_guru_id, 'authenticated', 'authenticated', 'guru@sekolah.sch.id',
        v_encrypted_pw, now(), '{"provider":"email","providers":["email"]}', '{"nama_lengkap":"Budi Santoso, S.Kom"}', now(), now()
    ) ON CONFLICT (id) DO UPDATE SET encrypted_password = EXCLUDED.encrypted_password;

    -- Akun Siswa 1 (Ahmad Fauzi)
    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', v_siswa1_id, 'authenticated', 'authenticated', 'ahmad@sekolah.sch.id',
        v_encrypted_pw, now(), '{"provider":"email","providers":["email"]}', '{"nama_lengkap":"Ahmad Fauzi"}', now(), now()
    ) ON CONFLICT (id) DO UPDATE SET encrypted_password = EXCLUDED.encrypted_password;

    -- Akun Siswa 2 (Bunga Citra)
    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', v_siswa2_id, 'authenticated', 'authenticated', 'bunga@sekolah.sch.id',
        v_encrypted_pw, now(), '{"provider":"email","providers":["email"]}', '{"nama_lengkap":"Bunga Citra Lestari"}', now(), now()
    ) ON CONFLICT (id) DO UPDATE SET encrypted_password = EXCLUDED.encrypted_password;

    -- Akun Siswa 3 (Dimas Aditya)
    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', v_siswa3_id, 'authenticated', 'authenticated', 'dimas@sekolah.sch.id',
        v_encrypted_pw, now(), '{"provider":"email","providers":["email"]}', '{"nama_lengkap":"Dimas Aditya"}', now(), now()
    ) ON CONFLICT (id) DO UPDATE SET encrypted_password = EXCLUDED.encrypted_password;

    -- Akun Siswa 4 (Eka Putri)
    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', v_siswa4_id, 'authenticated', 'authenticated', 'eka@sekolah.sch.id',
        v_encrypted_pw, now(), '{"provider":"email","providers":["email"]}', '{"nama_lengkap":"Eka Putri Rahayu"}', now(), now()
    ) ON CONFLICT (id) DO UPDATE SET encrypted_password = EXCLUDED.encrypted_password;

    -- Akun Siswa 5 (Fajar Nugraha)
    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', v_siswa5_id, 'authenticated', 'authenticated', 'fajar@sekolah.sch.id',
        v_encrypted_pw, now(), '{"provider":"email","providers":["email"]}', '{"nama_lengkap":"Fajar Nugraha"}', now(), now()
    ) ON CONFLICT (id) DO UPDATE SET encrypted_password = EXCLUDED.encrypted_password;


    -- 2. SEED TABEL PROFILES
    INSERT INTO public.profiles (id, email, nama_lengkap, nomor_induk, role, kelas, qr_token, foto_profil_url)
    VALUES
        (v_admin_id, 'admin@sekolah.sch.id', 'Administrator Sistem', 'ADMIN-001', 'admin', NULL, 'tok_admin_root', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'),
        (v_guru_id, 'guru@sekolah.sch.id', 'Budi Santoso, S.Kom', '198507122010011005', 'guru', 'XII-RPL-1', 'tok_guru_budi_secure', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
        (v_siswa1_id, 'ahmad@sekolah.sch.id', 'Ahmad Fauzi', '20240101', 'siswa', 'XII-RPL-1', 'tok_ahmad_20240101_secure', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
        (v_siswa2_id, 'bunga@sekolah.sch.id', 'Bunga Citra Lestari', '20240102', 'siswa', 'XII-RPL-1', 'tok_bunga_20240102_secure', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'),
        (v_siswa3_id, 'dimas@sekolah.sch.id', 'Dimas Aditya', '20240103', 'siswa', 'XII-RPL-1', 'tok_dimas_20240103_secure', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),
        (v_siswa4_id, 'eka@sekolah.sch.id', 'Eka Putri Rahayu', '20240104', 'siswa', 'XII-RPL-1', 'tok_eka_20240104_secure', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'),
        (v_siswa5_id, 'fajar@sekolah.sch.id', 'Fajar Nugraha', '20240105', 'siswa', 'XII-RPL-1', 'tok_fajar_20240105_secure', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150')
    ON CONFLICT (id) DO UPDATE SET 
        nama_lengkap = EXCLUDED.nama_lengkap,
        role = EXCLUDED.role,
        kelas = EXCLUDED.kelas,
        qr_token = EXCLUDED.qr_token;


    -- 3. SEED PENGATURAN SEKOLAH
    INSERT INTO public.pengaturan_sekolah (id, nama_sekolah, alamat, latitude, longitude, radius_meter, jam_masuk, jam_terlambat, jam_pulang)
    VALUES (
        1, 
        'SMK Teknologi Unggulan', 
        'Jl. Surya Kencana No. 1, Pamulang', 
        -6.345853, 
        106.738159, 
        80, 
        '07:00:00', 
        '07:15:00', 
        '15:00:00'
    )
    ON CONFLICT (id) DO UPDATE SET 
        nama_sekolah = EXCLUDED.nama_sekolah,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        radius_meter = EXCLUDED.radius_meter;


    -- 4. SEED DATA PRESENSI HARI INI
    INSERT INTO public.presensi (
        user_id, tanggal, jam_masuk, jam_pulang, status, metode_presensi, jarak_masuk_meter, foto_masuk_url
    ) VALUES (
        v_siswa2_id, CURRENT_DATE, (CURRENT_DATE || ' 06:55:12')::timestamptz, NULL, 'hadir', 'mandiri_gps', 24.5,
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
    ) ON CONFLICT (user_id, tanggal) DO NOTHING;

    INSERT INTO public.presensi (
        user_id, tanggal, jam_masuk, jam_pulang, status, metode_presensi, dicatat_oleh
    ) VALUES (
        v_siswa3_id, CURRENT_DATE, (CURRENT_DATE || ' 07:18:04')::timestamptz, NULL, 'terlambat', 'qr_guru', v_guru_id
    ) ON CONFLICT (user_id, tanggal) DO NOTHING;


    -- 5. SEED DATA PERMOHONAN IZIN / SAKIT
    INSERT INTO public.pengajuan_izin (
        user_id, tanggal_mulai, tanggal_selesai, jenis, keterangan, bukti_surat_url, status
    ) VALUES (
        v_siswa4_id, CURRENT_DATE, CURRENT_DATE, 'sakit',
        'Demam tinggi dan flu, istirahat di rumah sesuai anjuran dokter.',
        'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=400',
        'pending'
    ) ON CONFLICT DO NOTHING;

END $$;

-- Tampilkan konfirmasi hasil seeding
SELECT p.nama_lengkap, p.email, p.role, p.kelas, p.nomor_induk, p.qr_token 
FROM public.profiles p 
ORDER BY p.role, p.nama_lengkap;

-- ==============================================================================
-- SEEDING DATA: SISTEM PRESENSI PKBM CAHAYA MULIA (SUPABASE POSTGRESQL)
-- Password default semua akun: password123
-- Jalankan skrip ini di SQL Editor Supabase setelah menjalankan supabase_schema.sql
-- ==============================================================================

DO $$
DECLARE
    v_admin_id UUID := '11111111-1111-1111-1111-111111111111';
    v_guru_id  UUID := '22222222-2222-2222-2222-222222222222';
    v_encrypted_pw TEXT;
BEGIN
    -- Buat hash password 'password123'
    v_encrypted_pw := crypt('password123', gen_salt('bf'));

    -- 1. SEED AKUN ADMIN & TUTOR
    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES 
    (
        '00000000-0000-0000-0000-000000000000', v_admin_id, 'authenticated', 'authenticated', 'admin@pkbm.sch.id',
        v_encrypted_pw, now(), '{"provider":"email","providers":["email"]}', '{"nama_lengkap":"Administrator PKBM"}', now(), now()
    ),
    (
        '00000000-0000-0000-0000-000000000000', v_guru_id, 'authenticated', 'authenticated', 'tutor@pkbm.sch.id',
        v_encrypted_pw, now(), '{"provider":"email","providers":["email"]}', '{"nama_lengkap":"Budi Santoso, S.Pd"}', now(), now()
    )
    ON CONFLICT (id) DO UPDATE SET encrypted_password = EXCLUDED.encrypted_password;

    -- Profiles Admin & Tutor
    INSERT INTO public.profiles (id, email, nama_lengkap, nomor_induk, jenis_kelamin, role, kelas, qr_token)
    VALUES
        (v_admin_id, 'admin@pkbm.sch.id', 'Administrator PKBM', 'ADM-001', 'L', 'admin', NULL, 'tok_admin_root'),
        (v_guru_id, 'tutor@pkbm.sch.id', 'Budi Santoso, S.Pd', '198507122010011005', 'L', 'guru', '12', 'tok_guru_budi_secure')
    ON CONFLICT (id) DO UPDATE SET 
        nama_lengkap = EXCLUDED.nama_lengkap,
        nomor_induk = EXCLUDED.nomor_induk,
        role = EXCLUDED.role;

    -- 2. SEED 13 SISWA KELAS 12 PKBM CAHAYA MULIA (SESUAI BUKU ABSENSI MANUAL)
    INSERT INTO public.profiles (id, email, nama_lengkap, nomor_induk, jenis_kelamin, role, kelas, qr_token)
    VALUES
        (gen_random_uuid(), 'ade@pkbm.sch.id', 'ADE IZA MUKTI', '20241201', 'L', 'siswa', '12', 'tok_std_12_20241201'),
        (gen_random_uuid(), 'ahmad.slamet@pkbm.sch.id', 'AHMAD SLAMET RIYADI', '20241202', 'L', 'siswa', '12', 'tok_std_12_20241202'),
        (gen_random_uuid(), 'cinta@pkbm.sch.id', 'CINTA RAYA KHAIRUNNISA', '20241203', 'P', 'siswa', '12', 'tok_std_12_20241203'),
        (gen_random_uuid(), 'gadis@pkbm.sch.id', 'GADIS ZAMJIROH', '20241204', 'P', 'siswa', '12', 'tok_std_12_20241204'),
        (gen_random_uuid(), 'lina@pkbm.sch.id', 'LINA DWIYANTI', '20241205', 'P', 'siswa', '12', 'tok_std_12_20241205'),
        (gen_random_uuid(), 'mahfud@pkbm.sch.id', 'MAHFUD', '20241206', 'L', 'siswa', '12', 'tok_std_12_20241206'),
        (gen_random_uuid(), 'reyhan@pkbm.sch.id', 'MUHAMAD REYHAN .S', '20241207', 'L', 'siswa', '12', 'tok_std_12_20241207'),
        (gen_random_uuid(), 'najil@pkbm.sch.id', 'NAJIL HAWARI', '20241208', 'L', 'siswa', '12', 'tok_std_12_20241208'),
        (gen_random_uuid(), 'novita@pkbm.sch.id', 'NOVITA SARI', '20241209', 'P', 'siswa', '12', 'tok_std_12_20241209'),
        (gen_random_uuid(), 'ridwan@pkbm.sch.id', 'RIDWAN SAYIDNA AL .B', '20241210', 'L', 'siswa', '12', 'tok_std_12_20241210'),
        (gen_random_uuid(), 'tohirun@pkbm.sch.id', 'TOHIRUN', '20241211', 'L', 'siswa', '12', 'tok_std_12_20241211'),
        (gen_random_uuid(), 'widiyawila@pkbm.sch.id', 'WIDIYAWILA SAVITA', '20241212', 'P', 'siswa', '12', 'tok_std_12_20241212'),
        (gen_random_uuid(), 'yuliyana@pkbm.sch.id', 'YULIYANA', '20241213', 'P', 'siswa', '12', 'tok_std_12_20241213')
    ON CONFLICT (nomor_induk) DO UPDATE SET 
        nama_lengkap = EXCLUDED.nama_lengkap,
        jenis_kelamin = EXCLUDED.jenis_kelamin,
        kelas = EXCLUDED.kelas;

    -- 3. SEED PENGATURAN PKBM CAHAYA MULIA
    INSERT INTO public.pengaturan_sekolah (id, nama_sekolah, alamat, tahun_pelajaran, latitude, longitude, radius_meter, jam_masuk, jam_terlambat, jam_pulang)
    VALUES (
        1, 
        'PKBM Cahaya Mulia', 
        'Jl. Surya Kencana No. 1, Pamulang, Tangerang Selatan', 
        '2026/2027',
        -6.345853, 
        106.738159, 
        100, 
        '07:30:00', 
        '08:00:00', 
        '14:00:00'
    )
    ON CONFLICT (id) DO UPDATE SET 
        nama_sekolah = EXCLUDED.nama_sekolah,
        tahun_pelajaran = EXCLUDED.tahun_pelajaran,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        radius_meter = EXCLUDED.radius_meter;

END $$;

-- Tampilkan konfirmasi hasil seeding
SELECT p.nama_lengkap, p.jenis_kelamin, p.kelas, p.nomor_induk, p.role 
FROM public.profiles p 
ORDER BY p.role, p.nomor_induk;

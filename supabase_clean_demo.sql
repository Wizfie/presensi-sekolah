-- ==============================================================================
-- CLEANING PASCA-DEMO: BERSIHKAN DATA UJI COBA SIAP PAKAI SEKOLAH NYATA
-- Jalankan file ini di Supabase SQL Editor SETELAH sesi demo/pengujian selesai
-- (atau setelah supabase_schema.sql bila ingin langsung mulai bersih tanpa data demo).
--
-- Yang dilakukan oleh skrip ini:
--   1. Menghapus seluruh riwayat presensi & pengajuan izin uji coba demo.
--   2. Menghapus seluruh akun demo Siswa, Guru, dan Admin tambahan non-root.
--   3. Menyisakan HANYA 1 akun Super Administrator Root:
--        Email Login : admin@mail.com (atau ID: ADM-001)
--        Password    : pkbmadmin
--   4. Mereset kolom penandatangan "Mengetahui" ke format Kepala PKBM Cahaya Mulia
--      serta memastikan master kelas ('10', '11', '12') tersedia.
-- ==============================================================================

DO $$
DECLARE
    v_root_admin_id UUID := '11111111-1111-1111-1111-111111111111';
    v_encrypted_pw  TEXT := extensions.crypt('pkbmadmin', extensions.gen_salt('bf'));
    v_jakarta_now   TIMESTAMP := (now() AT TIME ZONE 'Asia/Jakarta');
    v_year          INT := EXTRACT(YEAR FROM v_jakarta_now)::int;
    v_month         INT := EXTRACT(MONTH FROM v_jakarta_now)::int;
    v_tp            TEXT;
BEGIN
    -- Pastikan schema database sudah dijalankan sebelumnya
    IF to_regclass('public.profiles') IS NULL
       OR to_regclass('public.presensi') IS NULL
       OR to_regclass('public.pengajuan_izin') IS NULL THEN
        RAISE EXCEPTION 'Tabel database belum tersedia. Jalankan supabase_schema.sql terlebih dahulu di SQL Editor!';
    END IF;

    -- 1. Hapus semua data transaksi demo (izin & presensi)
    DELETE FROM public.pengajuan_izin;
    DELETE FROM public.presensi;

    -- 2. Hapus semua user selain akun root admin (seluruh siswa demo, guru demo, dan admin non-root)
    -- Menghapus dari auth.users otomatis menghapus profil terkait (ON DELETE CASCADE)
    DELETE FROM auth.users u
    WHERE u.id <> v_root_admin_id;

    -- Pastikan jika ada profil sisa selain root admin ikut bersih
    DELETE FROM public.profiles
    WHERE id <> v_root_admin_id;

    -- Hapus entitas auth lama jika ada akun beremail admin@mail.com atau admin@pkbm.sch.id dengan ID berbeda
    DELETE FROM auth.users
    WHERE id <> v_root_admin_id AND (email = 'admin@mail.com' OR email = 'admin@pkbm.sch.id');

    -- 3. JAMINAN: Siapkan / Reset akun Super Administrator Root (admin@mail.com / pkbmadmin)
    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, confirmation_token, recovery_token,
        email_change_token_new, email_change,
        raw_app_meta_data, raw_user_meta_data, banned_until, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        v_root_admin_id, 'authenticated', 'authenticated', 'admin@mail.com', v_encrypted_pw,
        now(), '', '', '', '',
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('nama_lengkap', 'Administrator PKBM', 'role', 'admin'),
        NULL, now(), now()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = 'admin@mail.com',
        encrypted_password = EXCLUDED.encrypted_password,
        raw_user_meta_data = EXCLUDED.raw_user_meta_data,
        email_confirmed_at = now(),
        banned_until = NULL,
        updated_at = now();

    -- Registrasikan identity email pada auth.identities
    DELETE FROM auth.identities WHERE user_id = v_root_admin_id;
    INSERT INTO auth.identities (
        id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(),
        v_root_admin_id,
        v_root_admin_id::text,
        'email',
        jsonb_build_object('sub', v_root_admin_id::text, 'email', 'admin@mail.com', 'email_verified', true, 'phone_verified', false),
        now(), now(), now()
    );

    -- Pastikan profil publik Super Admin Root terdaftar
    INSERT INTO public.profiles (
        id, email, nama_lengkap, nomor_induk, jenis_kelamin, role,
        kelas, kelas_diajar, mata_pelajaran, jabatan, is_root, qr_token, is_deleted, deleted_at
    ) VALUES (
        v_root_admin_id, 'admin@mail.com', 'Administrator PKBM', 'ADM-001', 'L', 'admin',
        NULL, ARRAY[]::text[], '', 'Pengelola PKBM Cahaya Mulia', true, 'tok_admin_root', false, NULL
    )
    ON CONFLICT (id) DO UPDATE SET
        email = 'admin@mail.com',
        nama_lengkap = 'Administrator PKBM',
        nomor_induk = 'ADM-001',
        role = 'admin',
        is_root = true,
        is_deleted = false,
        deleted_at = NULL,
        updated_at = now();

    -- 4. Pastikan master kelas standar tersedia bila tabel classes masih kosong
    IF NOT EXISTS (SELECT 1 FROM public.classes) THEN
        INSERT INTO public.classes (name) VALUES ('10'), ('11'), ('12')
        ON CONFLICT (name) DO NOTHING;
    END IF;

    -- 5. Bersihkan nama/NIP penandatangan "Mengetahui" bekas demo & pastikan row id=1 ada
    v_tp := CASE WHEN v_month >= 7 THEN v_year || '/' || (v_year + 1) ELSE (v_year - 1) || '/' || v_year END;

    INSERT INTO public.pengaturan_sekolah (
        id, nama_sekolah, tahun_pelajaran, mengetahui_jabatan, mengetahui_nama, mengetahui_nip
    ) VALUES (
        1, 'PKBM Cahaya Mulia', v_tp, 'Kepala PKBM Cahaya Mulia', '', ''
    )
    ON CONFLICT (id) DO UPDATE SET
        mengetahui_jabatan = 'Kepala PKBM Cahaya Mulia',
        mengetahui_nama = '',
        mengetahui_nip = '',
        updated_at = now();
END $$;

-- ==============================================================================
-- VERIFIKASI KONDISI BERSIH PASCA-DEMO
-- ==============================================================================
SELECT
    (SELECT count(*) FROM public.profiles) AS sisa_profiles,
    (SELECT count(*) FROM public.classes) AS sisa_kelas,
    (SELECT count(*) FROM public.presensi) AS sisa_presensi,
    (SELECT count(*) FROM public.pengajuan_izin) AS sisa_izin;

SELECT id, email, nama_lengkap, nomor_induk, role, is_root
FROM public.profiles;

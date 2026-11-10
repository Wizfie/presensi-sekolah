-- ==============================================================================
-- CLEANING PASCA-DEMO: BERSIHKAN DATA UJI COBA SIAP PAKAI SEKOLAH NYATA
-- Jalankan file ini di Supabase SQL Editor SETELAH sesi demo/pengujian selesai
-- (atau setelah supabase_schema.sql bila ingin langsung mulai bersih tanpa demo).
--
-- Yang dilakukan oleh skrip ini:
--   1. Menghapus seluruh riwayat presensi & pengajuan izin uji coba demo.
--   2. Menghapus seluruh akun demo Siswa, Guru, dan Admin tambahan non-root.
--   3. Memastikan minimal 1 akun Super Administrator Root tetap tersedia agar
--      selalu bisa login (otomatis membuat admin@pkbm.sch.id / ADM-001 jika belum ada).
--   4. Mereset kolom penandatangan "Mengetahui" di pengaturan sekolah serta
--      memastikan master kelas ('10', '11', '12') tersedia.
--
-- PENTING SETELAH CLEANING:
--   Login sebagai admin@pkbm.sch.id (atau ID ADM-001, password default: password123
--   jika baru dibuat), lalu SEGERA ganti password & email Administrator melalui
--   Dashboard Admin -> Pengaturan GPS & Radius -> Keamanan & Ganti Password Admin.
-- ==============================================================================

DO $$
DECLARE
    v_root_admin_id UUID := '11111111-1111-1111-1111-111111111111';
    v_encrypted_pw  TEXT := extensions.crypt('password123', extensions.gen_salt('bf'));
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

    -- 2. Hapus semua user non-root (seluruh siswa demo, guru demo, dan admin uji coba)
    -- Catatan: Menghapus dari auth.users otomatis menghapus row di public.profiles (ON DELETE CASCADE)
    DELETE FROM auth.users u
    WHERE u.id <> v_root_admin_id
      AND NOT EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = u.id AND p.is_root = true
      );

    -- Pastikan jika ada profil yatim ikut bersih
    DELETE FROM public.profiles
    WHERE id <> v_root_admin_id
      AND is_root = false;

    -- 3. JAMINAN: Pastikan minimal 1 akun Super Admin Root aktif tersedia untuk login.
    -- Jika sudah ada Root Admin aktif (mis. sudah Anda kustomisasi email/passwordnya), data tetap aman.
    -- Jika belum ada admin sama sekali (mis. langsung menjalankan clean tanpa seed demo), buat akun default.
    IF NOT EXISTS (
        SELECT 1
        FROM public.profiles p
        JOIN auth.users u ON u.id = p.id
        WHERE p.role = 'admin'
          AND p.is_deleted = false
          AND (u.banned_until IS NULL OR u.banned_until <= now())
    ) THEN
        DELETE FROM auth.users WHERE id = v_root_admin_id OR email = 'admin@pkbm.sch.id';
        DELETE FROM public.profiles WHERE id = v_root_admin_id OR email = 'admin@pkbm.sch.id' OR nomor_induk = 'ADM-001';

        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password,
            email_confirmed_at, confirmation_token, recovery_token,
            email_change_token_new, email_change,
            raw_app_meta_data, raw_user_meta_data, banned_until, created_at, updated_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            v_root_admin_id, 'authenticated', 'authenticated', 'admin@pkbm.sch.id', v_encrypted_pw,
            now(), '', '', '', '',
            '{"provider":"email","providers":["email"]}'::jsonb,
            jsonb_build_object('nama_lengkap', 'Administrator PKBM', 'role', 'admin'),
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
            v_root_admin_id,
            v_root_admin_id::text,
            'email',
            jsonb_build_object('sub', v_root_admin_id::text, 'email', 'admin@pkbm.sch.id', 'email_verified', true, 'phone_verified', false),
            now(), now(), now()
        )
        ON CONFLICT (provider_id, provider) DO UPDATE SET
            identity_data = EXCLUDED.identity_data,
            updated_at = now();

        INSERT INTO public.profiles (
            id, email, nama_lengkap, nomor_induk, jenis_kelamin, role,
            kelas, kelas_diajar, mata_pelajaran, jabatan, is_root, qr_token, is_deleted, deleted_at
        ) VALUES (
            v_root_admin_id, 'admin@pkbm.sch.id', 'Administrator PKBM', 'ADM-001', 'L', 'admin',
            NULL, ARRAY[]::text[], '', 'Pengelola PKBM Cahaya Mulia', true, 'tok_admin_root', false, NULL
        )
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            nama_lengkap = EXCLUDED.nama_lengkap,
            nomor_induk = EXCLUDED.nomor_induk,
            role = 'admin',
            is_root = true,
            is_deleted = false,
            deleted_at = NULL,
            updated_at = now();
    END IF;

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
        1, 'PKBM Cahaya Mulia', v_tp, 'Ketua PKBM Cahaya Mulia', '', ''
    )
    ON CONFLICT (id) DO UPDATE SET
        mengetahui_jabatan = 'Ketua PKBM Cahaya Mulia',
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

-- ==============================================================================
-- CLEANING PASCA-DEMO: BERSIHKAN DATA UJI COBA SIAP PAKAI SEKOLAH NYATA
-- Jalankan file ini di Supabase SQL Editor SETELAH sesi demo/pengujian selesai.
--
-- Yang dilakukan oleh skrip ini:
--   1. Menghapus seluruh riwayat presensi & pengajuan izin uji coba demo.
--   2. Menghapus seluruh akun demo Siswa, Guru, dan Admin tambahan (menyisakan
--      1 akun Super Administrator Root agar Anda tetap bisa masuk ke dashboard).
--   3. Mereset kolom penandatangan "Mengetahui" di pengaturan sekolah.
--   4. Mempertahankan master kelas standar ('10', '11', '12') & pengaturan GPS
--      PKBM agar langsung siap diisi data siswa & tutor asli.
--
-- PENTING SETELAH CLEANING:
--   Login sebagai admin@pkbm.sch.id (atau ID ADM-001), lalu SEGERA ganti
--   password & email Administrator melalui Dashboard Admin -> Pengaturan -> Keamanan.
-- ==============================================================================

DO $$
DECLARE
    v_root_admin_id UUID := '11111111-1111-1111-1111-111111111111';
BEGIN
    -- 1. Hapus semua data transaksi demo (izin & presensi)
    DELETE FROM public.pengajuan_izin;
    DELETE FROM public.presensi;

    -- 2. Hapus semua user non-root (seluruh siswa demo, guru demo, dan admin uji coba)
    -- Catatan: Menghapus dari auth.users otomatis menghapus row di public.profiles (ON DELETE CASCADE)
    DELETE FROM auth.users
    WHERE id <> v_root_admin_id
      AND id NOT IN (SELECT id FROM public.profiles WHERE is_root = true);

    -- Pastikan jika ada profil yatim ikut bersih
    DELETE FROM public.profiles
    WHERE id <> v_root_admin_id
      AND is_root = false;

    -- 3. Opsional: Jika ingin mengosongkan daftar kelas juga, hapus tanda komentar (--) baris di bawah:
    -- DELETE FROM public.classes;

    -- 4. Bersihkan nama/NIP penandatangan "Mengetahui" bekas demo
    UPDATE public.pengaturan_sekolah
    SET
        mengetahui_jabatan = 'Ketua PKBM Cahaya Mulia',
        mengetahui_nama = '',
        mengetahui_nip = '',
        updated_at = now()
    WHERE id = 1;
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

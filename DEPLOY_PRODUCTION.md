# Panduan Deploy Production — Cloudflare Pages + Supabase + Custom Domain

Panduan singkat deploy **Presensi PKBM Cahaya Mulia** dari setup awal, sesi demo, hingga live production.

## File Kunci di Repositori
- `supabase_schema.sql` — Schema DB, RLS, trigger keamanan, RPC, Realtime, dan jadwal `pg_cron`
- `supabase_seed_demo.sql` — Data demo awal (33 siswa, 2 guru, 1 admin, presensi & 1 izin)
- `supabase_clean_demo.sql` — Pembersihan pasca-demo (sisakan Root Admin `ADM-001`, kelas & GPS)
- `public/_headers` — Izin kamera/GPS & kontrol cache PWA untuk Cloudflare Pages / Workers
- `.github/workflows/keep-supabase-alive.yml` — Cron keep-alive agar Supabase Free tidak auto-pause
- `.env.example` — Template environment frontend

---

## 1. Setup Supabase
1. **Buat Project:** Login [Supabase Dashboard](https://supabase.com/dashboard) -> **New Project** -> pilih region **Southeast Asia (Singapore)**.
2. **Aktifkan `pg_cron` *(direkomendasikan)*:** Buka **Database -> Extensions**, cari `pg_cron`, lalu geser toggle hingga aktif *(untuk auto-hapus media presensi bulanan)*.
3. **Jalankan Schema:** Buka **SQL Editor -> New Query**, jalankan seluruh isi `supabase_schema.sql` (pastikan *Success*).
3. **Isi Data Demo *(untuk demo awal)*:** Jalankan `supabase_seed_demo.sql` di **SQL Editor**.
   - **Admin Root:** `admin@mail.com` (password: `pkbmadmin`)
   - **Guru Piket:** `guru1@mail.com` (password: `pkbmguru1`) & `guru2@mail.com` (password: `pkbmguru2`)
   - **Siswa Demo:** Login cukup pakai NISN (password format `pkbm[nisn]`, contoh NISN `1201` password: `pkbm1201`)
4. **Ambil Key Supabase:**
   - **Cara cepat:** Klik **Connect** di bar atas -> **App Frameworks -> Vue**.
   - **Via menu:** Klik ikon gerigi **Project Settings**:
     - `VITE_SUPABASE_URL` -> **Data API** *(lama: API)* -> salin **Project URL** (`https://<ref>.supabase.co`)
     - `VITE_SUPABASE_ANON_KEY` -> **API Keys** *(lama: API)* -> salin **Publishable key** (`sb_publishable_...`) atau tab **Legacy** -> **anon public** (`eyJhbGci...`)
   - **Dilarang keras** menaruh **Secret key (`sb_secret_...`)** / **`service_role`** di `.env`, GitHub, atau Cloudflare Pages.
5. **Kunci Signup Publik *(disarankan saat live)*:** Buka **Authentication -> Auth Providers / User Signups** -> nonaktifkan **Allow new users to sign up**.

---

## 2. Deploy ke Cloudflare Pages

### Cara 1: GitHub Auto-Deploy *(Direkomendasikan)*
1. Push kode ke GitHub: `git push origin main`
2. Buka [Cloudflare Dashboard](https://dash.cloudflare.com) -> **Workers & Pages -> Create -> Pages -> Connect to Git** -> pilih repo `Wizfie/presensi-sekolah` (branch `main`).
3. **Build settings:** Framework `Vite` | Build command `npm run build` | Output directory `dist`.
4. **Environment variables** (isi untuk **Production** & **Preview**):

   | Variable | Isi |
   | :--- | :--- |
   | `NODE_VERSION` | `22` |
   | `VITE_SUPABASE_URL` | `https://<ref>.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | `sb_publishable_...` atau `eyJhbGci...` |
   | `VITE_ENABLE_DEMO_LOGIN` | `true` *(demo)* / `false` *(live)* |

5. Klik **Save and Deploy**.

### Cara 2: Wrangler CLI Direct Upload *(Alternatif Cepat)*
1. Buat `.env.production` lokal (jangan di-commit):
   ```env
   VITE_SUPABASE_URL=https://<ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_your_key_or_anon_jwt
   VITE_ENABLE_DEMO_LOGIN=true
   ```
2. Build & upload (Node `v20.19+` / `v22+`):
   ```bash
   npm install
   npm run build
   npx wrangler login
   npx wrangler pages deploy dist --project-name=presensi-pkbm
   ```

---

## 3. Custom Domain & Auth Redirect
Kamera QR, GPS, dan PWA **wajib HTTPS**.
1. **Cloudflare Pages -> Custom domains -> Set up a custom domain** -> masukkan domain (mis. `presensi.pkbmcahayamulia.sch.id`).
   - DNS di Cloudflare: record `CNAME` otomatis dibuat. DNS di registrar lain: buat `CNAME` mengarah ke `<project>.pages.dev` *(untuk root domain, disarankan pindahkan NS ke Cloudflare)*.
   - Di menu **SSL/TLS**: pakai mode **Full (strict)** dan aktifkan **Always Use HTTPS**.
2. **Supabase -> Authentication -> URL Configuration:**
   - **Site URL:** `https://presensi.pkbmcahayamulia.sch.id`
   - **Redirect URLs:** `https://presensi.pkbmcahayamulia.sch.id/**` dan `https://*.pages.dev/**` -> **Save changes**.

---

## 4. Uji Coba Demo
- Login cepat (`VITE_ENABLE_DEMO_LOGIN=true`) berjalan untuk Admin, Guru, dan Siswa.
- Siswa (`ade@pkbm.sch.id`) bisa presensi GPS Masuk/Pulang dan mengajukan izin.
- Guru (`tutor@pkbm.sch.id`) bisa scan QR siswa dan status terupdate real-time di halaman Guru & Admin.
- Buku Rekap, penandatangan *Mengetahui*, Export Excel, Cetak, dan Install PWA berjalan normal di HP.

---

## 5. Cleaning Pasca-Demo -> Live Production
1. **Reset data demo:** Jalankan `supabase_clean_demo.sql` di **Supabase SQL Editor** *(menghapus transaksi & akun demo; tetap menjaga Root Admin `ADM-001`, master kelas, dan pengaturan GPS)*.
2. **Matikan tombol demo:** Ubah `VITE_ENABLE_DEMO_LOGIN=false` di Cloudflare Pages -> **Retry deployment** *(atau rebuild + deploy ulang bila memakai Wrangler CLI)*.
3. **Amankan & isi data asli:** Login sebagai `admin@pkbm.sch.id` -> **Pengaturan GPS & Radius -> Keamanan & Ganti Password Admin** *(wajib ganti password)* -> perbarui titik GPS sekolah, tambah akun Guru & Siswa asli, lalu cetak Kartu QR.

---

## 6. Optimasi Kuota & Anti Auto-Pause (Supabase Free Plan)
Agar database dan egress Supabase Free tetap awet jangka panjang serta tidak ter-pause otomatis saat libur sekolah (>7 hari tanpa login):

### 6.1 Kebijakan Media Hemat Kuota *(Otomatis di Kode & Schema)*
- **Tanpa Gambar Profil:** Form upload foto profil dinonaktifkan (`profiles.foto_profil_url` selalu `''`); seluruh UI & Kartu QR otomatis memakai avatar inisial nama.
- **Load Riwayat Bertahap:** Saat login awal, aplikasi hanya mengunduh presensi **3 bulan terakhir** tanpa kolom media foto. Bulan yang lebih lama otomatis dimuat *on-demand* ketika Guru membuka bulan tersebut di **Buku Rekap**.

### 6.2 Auto-Hapus Foto Presensi & Bukti Izin (`pg_cron`)
`pg_cron` berjalan internal di Postgres untuk membersihkan `foto_masuk_url`, `foto_pulang_url` (`presensi`) dan `bukti_surat_url` (`pengajuan_izin`) pada bulan-bulan sebelumnya tanpa menghapus data kehadiran:
1. Buka **Supabase Dashboard -> Database -> Extensions** -> cari **`pg_cron`** -> aktifkan toggle **Enabled**.
2. Jalankan (atau jalankan ulang) `supabase_schema.sql` di **SQL Editor** untuk mendaftarkan job harian pukul **02:00 WIB** (`0 19 * * *` UTC).
3. Verifikasi job terdaftar lewat menu **Integrations -> Cron -> Jobs**, atau jalankan di **SQL Editor**:
   ```sql
   SELECT jobid, jobname, schedule, active FROM cron.job;
   ```
   Pastikan muncul job **`cleanup-attendance-media-monthly`** dengan `active = true`.
4. **Pembersihan manual per periode *(opsional)*:**
   - Hapus media bulan-bulan sebelumnya: `SELECT public.cleanup_old_attendance_media();`
   - Hapus media lebih lama dari *N* hari (mis. 7 hari): `SELECT public.cleanup_old_attendance_media(7);`

### 6.3 Cron Anti Auto-Pause (`GitHub Actions`)
`pg_cron` internal Postgres **tidak** mereset timer 7 hari idle Supabase, sehingga tetap butuh ping HTTP dari luar lewat [`.github/workflows/keep-supabase-alive.yml`](.github/workflows/keep-supabase-alive.yml) (jalan otomatis tiap **Senin & Kamis pukul 09:00 WIB**):

> [!IMPORTANT]
> **Jika deploy memakai repo hasil Fork (Akun GitHub ke-2):**
> Tambahkan secrets pada **repo fork yang di-deploy** (bukan repo asal), karena GitHub Secrets bersifat per-repository dan tidak ikut tersalin saat fork. **Tidak perlu membuat Environments** — gunakan **Repository secrets**.

1. **Sinkronkan repo fork *(khusus fork)*:** Buka repo fork -> klik **Sync fork -> Update branch** agar `.github/workflows/keep-supabase-alive.yml` masuk ke branch `main`.
2. **Pastikan izin Actions aktif:** Buka **Settings -> Actions -> General** -> pastikan **Allow all actions and reusable workflows** terpilih.
3. **Tambahkan 2 Repository Secrets:**
   - Di halaman **Settings**, lihat sidebar kiri bagian paling bawah di bawah kelompok **Security and quality** -> klik **`Secrets and variables`** -> pilih **`Actions`**.
   - Pastikan tab **`Secrets`** aktif, lalu pada bagian **Repository secrets** klik **`New repository secret`** untuk menambahkan:
     - **`VITE_SUPABASE_URL`** -> isi Project URL Supabase (`https://<ref>.supabase.co`)
     - **`VITE_SUPABASE_ANON_KEY`** -> isi Publishable / anon public key Supabase (`sb_publishable_...` atau `eyJhbGci...`)
4. **Aktifkan & Uji Workflow:**
   - Buka tab **Actions** di repo Anda. Jika muncul banner repo fork, klik **"I understand my workflows, go ahead and enable them"**.
   - Pilih **Keep Supabase Alive** di menu kiri -> klik **Run workflow** -> **Run workflow**.
   - Pastikan status berakhir **Success** (hijau) dengan log `Supabase Keep-Alive HTTP status: 200`.
   *(Catatan: GitHub otomatis menjeda workflow `schedule` jika repo tidak memiliki commit baru selama 60 hari berturut-turut — cukup klik tombol re-enable di tab **Actions** bila menerima notifikasi dari GitHub.)*

---

## Troubleshooting Cepat
- **Build gagal (`vite build`):** Pastikan `NODE_VERSION=22` terpasang di Environment Variables Cloudflare Pages.
- **Deploy gagal `code: 100324` (`Invalid _redirects`):** Jangan pakai rule `/* /index.html 200` di `_redirects`. Pastikan `public/_redirects` tidak ada (Cloudflare Workers & Pages sudah menangani SPA routing secara otomatis jika tidak ada `404.html`).
- **Tombol demo tidak berubah:** Variabel `VITE_*` dibaca saat build; klik **Retry deployment** lalu refresh cache PWA.
- **Refresh `/guru`, `/siswa`, `/admin` error 404:** Di Cloudflare Workers pastikan `not_found_handling` = `single-page-application`; di Cloudflare Pages pastikan tidak ada file `404.html` di `dist/`.
- **Kamera QR / GPS diblokir:** Wajib akses via `https://` dan izinkan akses kamera/lokasi di browser HP.
- **Workflow `Keep Supabase Alive` gagal (`secret belum diatur`):** Pastikan kedua secret ditaruh di **Settings -> Security and quality -> Secrets and variables -> Actions -> Repository secrets**, bukan di menu **Environments**.

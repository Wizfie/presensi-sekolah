# Panduan Deploy Production — Cloudflare Pages + Supabase + Custom Domain

Panduan singkat deploy **Presensi PKBM Cahaya Mulia** dari setup awal, sesi demo, hingga live production.

## File Kunci di Repositori
- `supabase_schema.sql` — Schema DB, RLS, trigger keamanan, RPC, dan Realtime
- `supabase_seed_demo.sql` — Data demo awal (33 siswa, 2 guru, 1 admin, presensi & 1 izin)
- `supabase_clean_demo.sql` — Pembersihan pasca-demo (sisakan Root Admin `ADM-001`, kelas & GPS)
- `public/_headers` — Izin kamera/GPS & kontrol cache PWA untuk Cloudflare Pages / Workers
- `.env.example` — Template environment frontend

---

## 1. Setup Supabase
1. **Buat Project:** Login [Supabase Dashboard](https://supabase.com/dashboard) -> **New Project** -> pilih region **Southeast Asia (Singapore)**.
2. **Jalankan Schema:** Buka **SQL Editor -> New Query**, jalankan seluruh isi `supabase_schema.sql` (pastikan *Success*).
3. **Isi Data Demo *(untuk demo awal)*:** Jalankan `supabase_seed_demo.sql` di **SQL Editor**.
   - Password semua akun demo: `password123`
   - **Admin Root:** `admin@pkbm.sch.id` (`ADM-001`) | **Guru Piket:** `tutor@pkbm.sch.id` (`198507122010011005`) | **Siswa siap demo:** `ade@pkbm.sch.id` (`20241201`)
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

## Troubleshooting Cepat
- **Build gagal (`vite build`):** Pastikan `NODE_VERSION=22` terpasang di Environment Variables Cloudflare Pages.
- **Deploy gagal `code: 100324` (`Invalid _redirects`):** Jangan pakai rule `/* /index.html 200` di `_redirects`. Pastikan `public/_redirects` tidak ada (Cloudflare Workers & Pages sudah menangani SPA routing secara otomatis jika tidak ada `404.html`).
- **Tombol demo tidak berubah:** Variabel `VITE_*` dibaca saat build; klik **Retry deployment** lalu refresh cache PWA.
- **Refresh `/guru`, `/siswa`, `/admin` error 404:** Di Cloudflare Workers pastikan `not_found_handling` = `single-page-application`; di Cloudflare Pages pastikan tidak ada file `404.html` di `dist/`.
- **Kamera QR / GPS diblokir:** Wajib akses via `https://` dan izinkan akses kamera/lokasi di browser HP.

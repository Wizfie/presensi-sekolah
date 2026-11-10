# Panduan Setup & Deploy Production (Cloudflare Pages + Supabase + Custom Domain)

Panduan ini menjelaskan langkah lengkap menyiapkan **Sistem Presensi PKBM Cahaya Mulia** untuk lingkungan production menggunakan **Cloudflare Pages** (frontend & CDN HTTPS), **Supabase** (Auth, PostgreSQL, Row Level Security, Realtime), dan **Custom Domain**, mulai dari **seeding data demo awal** hingga **cleaning pasca-demo** untuk operasional sekolah nyata.

---

## Ringkasan Arsitektur Production

- **Frontend (SPA + PWA)**: Vue 3 + Vite di-host di Cloudflare Pages (`npm run build` -> output `dist/`). File `public/_redirects` memastikan SPA routing berjalan mulus dan `public/_headers` mengaktifkan header keamanan (`Permissions-Policy` untuk kamera & GPS serta aturan cache PWA).
- **Backend & Database**: Supabase PostgreSQL + Supabase Auth + Supabase Realtime (`supabase_schema.sql`), tanpa perlu server backend terpisah maupun mengekspos `service_role` key ke client.
- **Role & Keamanan**:
  - Kontrol akses berbasis database (`RLS` & trigger anti-eskalasi role di tabel `profiles`).
  - Seluruh UI mode developer (`Role (Dev)`, `Data Mode (Dev)`, tombol reset demo) sudah dibersihkan.
  - Tombol **Akses Demo Cepat** di halaman Login dikendalikan oleh environment variable `VITE_ENABLE_DEMO_LOGIN` (default `false` di production).

---

## Langkah 1 — Setup Supabase (Database & Seeding Demo)

### 1.1 Buat Project Supabase
1. Login ke [Supabase Dashboard](https://supabase.com/dashboard) dan klik **New Project**.
2. Isi nama project (misal `presensi-pkbm-cahaya-mulia`), buat password database yang kuat, dan pilih region terdekat: **Southeast Asia (Singapore)** (`ap-southeast-1`).
3. Tunggu beberapa saat hingga project berstatus aktif.

### 1.2 Jalankan Schema Production (`supabase_schema.sql`)
1. Buka menu **SQL Editor** -> klik **New Query**.
2. Salin seluruh isi file **`supabase_schema.sql`** dari repositori ini, tempel ke editor, lalu klik **Run**.
3. Pastikan eksekusi selesai tanpa error (`Success`). Skrip ini bersifat idempotent (aman dijalankan ulang) dan membuat:
   - Tabel: `classes`, `profiles`, `pengaturan_sekolah`, `presensi`, `pengajuan_izin`.
   - Security helper, trigger anti-eskalasi role, dan RLS policies.
   - RPC functions operasional (`submit_presensi_gps`, `scan_qr_presensi_siswa`, `submit_pengajuan_izin`, `update_rekap_signatory`, `reset_siswa_qr_token`, `admin_*`).
   - Publikasi `supabase_realtime` untuk sinkronisasi presensi langsung antar perangkat.

### 1.3 Isi Data Demo Awal (`supabase_seed_demo.sql`) — *Opsional untuk Demo*
Jika ingin langsung memiliki data siap presentasi / uji coba:
1. Buka tab query baru di **SQL Editor**.
2. Salin seluruh isi file **`supabase_seed_demo.sql`**, tempel, lalu klik **Run**.
3. Skrip ini otomatis membuat:
   - Master kelas `10`, `11`, `12` & konfigurasi sekolah PKBM Cahaya Mulia (termasuk titik koordinat GPS Pamulang & penandatangan default).
   - **1 Akun Root Admin**, **2 Akun Guru Piket/Tutor**, dan **33 Akun Siswa** (`13` siswa Kelas 12, `10` siswa Kelas 11, `10` siswa Kelas 10).
   - Riwayat presensi bulan berjalan (Senin–Jumat hingga hari ini) + 1 contoh pengajuan izin.
   - Siswa pertama (`ADE IZA MUKTI`, `20241201`) sengaja dibiarkan **belum presensi hari ini** agar langsung bisa didemokan untuk presensi GPS maupun scan QR.

#### Daftar Akun Demo Utama
Password semua akun demo: **`password123`**

| Role | Email | NISN / NIP / ID | Keterangan |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@pkbm.sch.id` | `ADM-001` | Akun Root Admin (`is_root = true`) |
| **Guru Piket** | `tutor@pkbm.sch.id` | `198507122010011005` | Budi Santoso, S.Pd (Mengajar kelas 10, 11, 12) |
| **Siswa** | `ade@pkbm.sch.id` | `20241201` | ADE IZA MUKTI (Kelas 12 — siap demo presensi hari ini) |

### 1.4 Catat API Keys Supabase
1. Buka **Project Settings** (ikon gerigi) -> **API** (atau **Data API** / **API Keys**).
2. Catat dua nilai berikut:
   - **Project URL** (contoh: `https://xyzcompany.supabase.co`) -> untuk `VITE_SUPABASE_URL`
   - **anon public** key (atau *Publishable key*) -> untuk `VITE_SUPABASE_ANON_KEY`
3. **Penting**: Jangan pernah menaruh `service_role` / `secret` key di `.env` frontend atau Cloudflare Pages.

---

## Langkah 2 — Pilih Cara Deploy ke Cloudflare Pages

Tersedia dua cara mudah untuk deploy aplikasi ke Cloudflare Pages.

### Cara 1 (Direkomendasikan): GitHub Auto-Deploy via Dashboard
Paling praktis untuk jangka panjang. Setiap kali ada perubahan di GitHub branch `main`, Cloudflare Pages otomatis melakukan build dan deploy ulang.

1. Pastikan seluruh perubahan terbaru sudah di-push ke repository GitHub: `https://github.com/Wizfie/presensi-sekolah.git`.
2. Login ke [Cloudflare Dashboard](https://dash.cloudflare.com) -> pilih menu **Workers & Pages** -> **Create** -> tab **Pages** -> **Connect to Git**.
3. Hubungkan akun GitHub dan pilih repository **`Wizfie/presensi-sekolah`**.
4. Isi konfigurasi **Build settings**:
   - **Project name**: `presensi-pkbm` (atau sesuai keinginan, akan menghasilkan URL `presensi-pkbm.pages.dev`)
   - **Production branch**: `main`
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` *(biarkan kosong/default)*
5. Buka bagian **Environment variables (advanced)** dan tambahkan variabel berikut (untuk environment **Production** dan **Preview**):

   | Variable Name | Value | Keterangan |
   | :--- | :--- | :--- |
   | `NODE_VERSION` | `22` | Wajib `>=20.19` atau `22` karena Vite 8 membutuhkannya |
   | `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` | URL project Supabase Anda |
   | `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOi...` | Anon public key Supabase Anda |
   | `VITE_ENABLE_DEMO_LOGIN` | `true` *(saat demo)* / `false` *(live)* | Kontrol tampil/sembunyinya tombol Akses Demo Cepat di Login |

6. Klik **Save and Deploy**. Dalam 1–2 menit, aplikasi siap diakses via `https://<project>.pages.dev`.

---

### Cara 2 (Alternatif Instan): Wrangler CLI Direct Upload dari Lokal
Cocok jika ingin langsung mengunggah hasil build dari komputer/laptop tanpa menghubungkan GitHub ke Cloudflare.

> **Catatan Penting Vite**: Variabel `VITE_*` disuntikkan ke kode JavaScript saat **build time** (`npm run build`). Jika menggunakan Cara 2, pastikan konfigurasi `.env.production` lokal Anda sudah terisi kredensial Supabase sebelum menjalankan build.

1. Buat file `.env.production` di folder project (otomatis terabaikan git jika tidak ditambahkan, jangan pernah commit kredensial rahasia) atau isi `.env`:
   ```env
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   VITE_ENABLE_DEMO_LOGIN=true
   ```
2. Build aplikasi secara lokal (pastikan Node.js `v20.19+` atau `v22+`):
   ```bash
   npm install
   npm run build
   ```
3. Login ke Cloudflare via Wrangler (sekali saja):
   ```bash
   npx wrangler login
   ```
4. Deploy folder `dist/` langsung ke Cloudflare Pages:
   ```bash
   npx wrangler pages deploy dist --project-name=presensi-pkbm
   ```
5. Jika diminta membuat project baru, ketik `y` dan pilih production branch `main`.

---

## Langkah 3 — Hubungkan Custom Domain & Konfigurasi Auth Redirect

Fitur **Geolocation GPS**, **Kamera QR Scanner**, dan **PWA** mewajibkan koneksi **HTTPS**. Custom domain di Cloudflare Pages otomatis mendapatkan sertifikat SSL gratis.

### 3.1 Tambah Custom Domain di Cloudflare Pages
1. Buka project Cloudflare Pages Anda -> tab **Custom domains** -> klik **Set up a custom domain**.
2. Masukkan domain/subdomain pilihan Anda (contoh: `presensi.pkbmcahayamulia.sch.id` atau `absen.domainanda.com`).
3. Jika domain sudah menggunakan Cloudflare DNS, record `CNAME` dibuat otomatis. Jika DNS masih dikelola registrar luar, tambahkan record `CNAME` sesuai instruksi Cloudflare menuju `<project>.pages.dev`.
4. Pada pengaturan SSL domain di Cloudflare (**SSL/TLS -> Overview**), pastikan mode enkripsi diset ke **Full (strict)** dan aktifkan **Always Use HTTPS**.

### 3.2 Konfigurasi URL di Supabase Authentication
1. Buka **Supabase Dashboard** -> **Authentication** -> **URL Configuration**.
2. Isi **Site URL** dengan domain production Anda:
   ```text
   https://presensi.pkbmcahayamulia.sch.id
   ```
3. Pada **Redirect URLs**, klik **Add URL** dan tambahkan:
   - `https://presensi.pkbmcahayamulia.sch.id/**`
   - `https://*.pages.dev/**` *(opsional bila masih mengetes via URL `.pages.dev`)*
4. Klik **Save changes**.

---

## Langkah 4 — Checklist Pengujian Saat Demo

Sebelum presentasi/uji coba ke pihak sekolah, cek skenario berikut lewat HP (jaringan seluler/WiFi) dan laptop:
- [ ] **Halaman Login**: Apabila `VITE_ENABLE_DEMO_LOGIN=true`, tombol **Akses Demo Cepat** tampil dan berhasil login 1 klik (Siswa, Guru, Admin).
- [ ] **Presensi GPS Siswa**: Login sebagai siswa (`ade@pkbm.sch.id`), izinkan akses GPS browser -> sesuaikan koordinat/radius PKBM lewat Admin -> coba tap presensi masuk/pulang.
- [ ] **Scanner QR Guru**: Login sebagai guru piket (`tutor@pkbm.sch.id`), izinkan akses kamera -> scan kartu QR siswa (bisa ditampilkan dari HP lain) -> verifikasi data muncul real-time tanpa refresh.
- [ ] **Presensi Manual & Pulang**: Tes tombol pulang satuan pada kolom **Jam Out** maupun tombol bulk **Set Pulang** & **Tandai Hadir Semua** (pastikan toast & modal konfirmasi tampil rapi di layar HP).
- [ ] **Buku Rekap & Export**: Cek tab **Buku Rekap**, ubah penandatangan *Mengetahui* (tersimpan ke database), tes tombol **Export Excel** dan **Cetak**.
- [ ] **Install PWA**: Uji pemasangan ke layar utama HP (*Add to Home Screen*).

---

## Langkah 5 — Cleaning Pasca-Demo Menuju Operasional Sekolah Nyata

Setelah sesi demo selesai dan aplikasi siap digunakan untuk data siswa/guru asli PKBM Cahaya Mulia, ikuti urutan berikut:

### 5.1 Jalankan Script Cleaning di Supabase (`supabase_clean_demo.sql`)
1. Buka **Supabase Dashboard -> SQL Editor -> New Query**.
2. Salin seluruh isi file **`supabase_clean_demo.sql`**, tempel, lalu klik **Run**.
3. Apa yang dilakukan skrip ini:
   - Menghapus **seluruh data presensi & pengajuan izin demo**.
   - Menghapus **seluruh akun demo Siswa, Guru, dan Admin non-root** (dari `auth.users` dan `public.profiles`).
   - Mereset nama & NIP penandatangan *"Mengetahui"* menjadi kosong.
   - **Mempertahankan**: 1 akun Super Admin Root (`ADM-001` / `admin@pkbm.sch.id`), master kelas (`10`, `11`, `12`), serta konfigurasi jam & lokasi GPS sekolah.

### 5.2 Matikan Tombol Demo Login di Cloudflare Pages
1. Buka Cloudflare Pages -> **Settings -> Environment variables**.
2. Ubah nilai `VITE_ENABLE_DEMO_LOGIN` dari `true` menjadi **`false`** (untuk Production & Preview).
3. Masuk ke tab **Deployments**, klik menu titik tiga (`...`) pada deployment terbaru -> klik **Retry deployment** (wajib di-rebuild agar perubahan env `VITE_*` diterapkan ke bundle).
   - *(Jika memakai Cara 2 / Wrangler CLI: ubah `VITE_ENABLE_DEMO_LOGIN=false` di `.env.production`, jalankan `npm run build`, lalu jalankan ulang `npx wrangler pages deploy dist --project-name=presensi-pkbm`).*

### 5.3 Amankan Akun Administrator & Mulai Input Data Asli
1. Buka domain aplikasi Anda dan login manual sebagai Administrator (`admin@pkbm.sch.id` atau `ADM-001`, password sementara `password123`).
2. Masuk ke **Dashboard Admin -> Pengaturan GPS & Radius**:
   - Pada kartu **Keamanan & Ganti Password Admin**, **SEGERA ganti password** dengan kata sandi baru yang kuat.
   - Perbarui titik lokasi peta GPS sekolah yang sebenarnya, radius meter toleransi, dan tahun pelajaran aktif.
3. Buka tab **Manajemen Administrator**, **Guru Piket & Tutor**, dan **Manajemen Siswa** untuk mulai mendaftarkan akun asli sekolah dan mencetak Kartu ID QR siswa.

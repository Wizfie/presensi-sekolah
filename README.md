# 📋 Presensi Sekolah Digital — PKBM Cahaya Mulia

> **Sistem Presensi Sekolah Modern Berbasis Geofencing GPS & Kartu QR Code**
> Aplikasi Progressive Web App (PWA) untuk mencatat kehadiran siswa dan guru secara real-time, cepat, dan akurat — menggantikan buku absen kertas.

![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4FC08D?style=flat&logo=vue.js)
![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=flat&logo=vite)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat&logo=supabase)
![Cloudflare Pages](https://img.shields.io/badge/Cloudflare%20Pages-HTTPS%20%26%20CDN-F38020?style=flat&logo=cloudflare)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38BDF8?style=flat&logo=tailwind-css)
![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat&logo=pwa)

---

## ✨ Fitur Utama

| Role | Fitur |
|------|-------|
| 👨‍🎓 **Siswa** | Kartu Pelajar Digital + QR Code, Presensi Mandiri GPS (Masuk/Pulang), Pengajuan Izin/Sakit, Riwayat Kehadiran |
| 👨‍🏫 **Guru Piket** | Scanner QR Siswa Real-time, Presensi Manual Harian + Tombol Pulang Satuan/Bulk, Pengaturan Jadwal Kelas, Buku Rekap Bulanan (Desktop/Mobile), Cetak & Export Excel Rapi |
| 🖥️ **Admin** | Manajemen Data Siswa, Guru Piket/Tutor & Administrator, Reset Password Akun, Cetak Kartu ID QR Massal, Pengaturan Titik GPS Leaflet & Radius Geofencing |
| 📱 **PWA** | Responsif penuh di mobile & desktop, toast/konfirmasi ramah HP, bisa diinstall ke Home Screen Android & iPhone |

---

## 🛠️ Tech Stack

- **Frontend:** Vue.js 3 (`<script setup>`), Vue Router 4, Pinia, Tailwind CSS 3
- **Backend & Database:** Supabase (Auth + PostgreSQL + RLS + RPC + Realtime)
- **Hosting & CDN:** Cloudflare Pages (`public/_redirects`, `public/_headers`)
- **Build Tool & PWA:** Vite 8, `vite-plugin-pwa`
- **Libraries:** `html5-qrcode`, `leaflet`, `qrcode`, `xlsx-js-style`, `lucide-vue-next`

---

## 📋 Prasyarat

| Tool | Versi Minimum | Cek Versi |
|------|--------------|-----------|
| **Node.js** | `v20.19+` atau `v22+` (disarankan v22) | `node -v` |
| **npm** | `v9` atau lebih baru | `npm -v` |
| **Git** | Versi terbaru | `git --version` |
| **Akun Supabase** | Gratis | [supabase.com](https://supabase.com) |
| **Akun Cloudflare** | Gratis (untuk hosting Pages + Custom Domain) | [dash.cloudflare.com](https://dash.cloudflare.com) |

---

## 🚀 Setup Database & Lingkungan Lokal

### Langkah 1 — Clone Repository & Install Dependencies

```bash
git clone https://github.com/Wizfie/presensi-sekolah.git
cd presensi-sekolah
npm install
```

### Langkah 2 — Setup Supabase

1. Buat project baru di [supabase.com](https://supabase.com) (pilih region *Southeast Asia / Singapore*).
2. Buka **SQL Editor -> New Query**, salin dan jalankan **`supabase_schema.sql`** untuk membuat tabel, RLS policies, RPC functions, trigger keamanan, dan Realtime publication.
3. *(Opsional untuk demo awal)* Jalankan **`supabase_seed_demo.sql`** di **SQL Editor** untuk mengisi:
   - Root Admin (`admin@pkbm.sch.id` / `ADM-001`)
   - 2 Guru Piket/Tutor (`tutor@pkbm.sch.id` / `198507122010011005`)
   - 33 Siswa demo Kelas 10, 11, dan 12 (mis. `ade@pkbm.sch.id` / `20241201`)
   - Pengaturan lokasi GPS PKBM & riwayat presensi bulan berjalan
   - Password default seluruh akun demo: `password123`
4. Setelah sesi demo selesai dan ingin masuk data sekolah asli, jalankan **`supabase_clean_demo.sql`** di **SQL Editor** (menghapus data transaksi & akun demo, menyisakan Root Admin `ADM-001`, master kelas, dan konfigurasi GPS).

### Langkah 3 — Konfigurasi Environment Lokal

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# Linux / macOS
cp .env.example .env
```

Isi `.env` dari menu **Supabase -> Project Settings -> API**:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_ENABLE_DEMO_LOGIN=false
```

> ⚠️ **Catatan:**
> - Jangan pernah commit file `.env` (sudah masuk `.gitignore`) dan jangan pernah menaruh `service_role` key di frontend.
> - Set `VITE_ENABLE_DEMO_LOGIN=true` hanya saat sesi demo/presentasi untuk menampilkan tombol *"Akses Demo Cepat"* di halaman login.
> - Jika `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` dibiarkan placeholder (`sample-project`), aplikasi otomatis berjalan pada mode preview offline lokal (`localStorage`).

---

## ▶️ Menjalankan Aplikasi Lokal

```bash
# Development server (http://localhost:5173)
npm run dev

# Build production (output ke dist/)
npm run build

# Preview hasil build lokal
npm run preview
```

---

## ☁️ Deploy Production (Cloudflare Pages + Custom Domain)

Panduan lengkap step-by-step deploy ke **Cloudflare Pages**, menghubungkan **Custom Domain** & HTTPS, konfigurasi **Supabase Auth Redirect URL**, **Seeding Demo**, serta **Cleaning Pasca-Demo** tersedia di:

👉 **[DEPLOY_PRODUCTION.md](./DEPLOY_PRODUCTION.md)**

Ringkasnya:
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Environment variables:** `NODE_VERSION=22`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_ENABLE_DEMO_LOGIN` (`true` saat demo, `false` saat live)

---

## 📁 Struktur Project

```text
presensi-sekolah/
├── public/
│   ├── _headers                 # Security & cache headers Cloudflare Pages
│   ├── _redirects               # SPA fallback routing (/* /index.html 200)
│   └── logo.png                 # Logo & ikon PWA aplikasi
├── docs/                        # Dokumentasi & diagram flowchart PKM
├── src/
│   ├── components/              # Navbar, AppSidebar, MobileDrawer, GlobalNotifications, UI
│   ├── lib/
│   │   └── supabase.js          # Inisialisasi Supabase client
│   ├── router/
│   │   └── index.js             # Vue Router + async auth & role guard
│   ├── stores/
│   │   ├── auth.js              # Autentikasi Supabase Auth + fallback offline
│   │   ├── attendance.js        # State presensi, sinkronisasi Realtime & RPC
│   │   └── ui.js                # Toast & Confirm Modal ramah mobile
│   ├── utils/                   # dateTime (WIB), avatar, imageCompressor, academicYear, seeder
│   ├── views/
│   │   ├── LoginView.vue
│   │   ├── AdminDashboard.vue
│   │   ├── GuruDashboard.vue
│   │   └── SiswaDashboard.vue
│   ├── App.vue
│   └── main.js
├── supabase_schema.sql          # Schema database production, RLS, RPC & Realtime
├── supabase_seed_demo.sql       # Data demo awal (33 siswa, 2 guru, 1 admin)
├── supabase_clean_demo.sql      # Cleaning pasca-demo siap operasional sekolah nyata
├── DEPLOY_PRODUCTION.md         # Panduan deploy Cloudflare Pages + Custom Domain
├── .env.example                 # Template konfigurasi environment
├── vite.config.js
└── package.json
```

---

## ❓ Troubleshooting

| Masalah | Solusi |
|---------|--------|
| `npm run build` gagal di Cloudflare Pages | Pastikan environment variable `NODE_VERSION` diisi `22` (minimal `20.19+` untuk Vite 8) |
| Login berhasil tapi langsung kembali ke halaman login / data kosong | Pastikan sudah menjalankan `supabase_schema.sql` dan user tersebut memiliki row aktif (`is_deleted = false`) di `public.profiles` |
| Redirect / refresh halaman `/guru`, `/siswa`, `/admin` menjadi 404 | Pastikan `public/_redirects` terikut di hasil build `dist/_redirects` |
| GPS atau Kamera QR diblokir browser | Pastikan akses menggunakan **HTTPS** (Custom Domain Cloudflare / `*.pages.dev`) dan izin browser aktif |
| Perubahan `VITE_ENABLE_DEMO_LOGIN` tidak berubah di web | Environment `VITE_*` dibaca saat build time; lakukan **Retry deployment** di Cloudflare Pages |

---

## 📄 Lisensi

Project ini dibuat untuk **PKBM Cahaya Mulia** dalam program akademik **PKM (Program Kreativitas Mahasiswa)** — Universitas Pamulang.

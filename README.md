# 📋 Presensi Sekolah Digital

> **Sistem Presensi Sekolah Modern Berbasis Geofencing GPS & Kartu QR Code**
> Aplikasi Progressive Web App (PWA) untuk mencatat kehadiran siswa dan guru secara otomatis, cepat, dan akurat — menggantikan buku absen kertas.

![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4FC08D?style=flat&logo=vue.js)
![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=flat&logo=vite)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat&logo=supabase)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38BDF8?style=flat&logo=tailwind-css)
![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat&logo=pwa)

---

## ✨ Fitur Utama

| Role | Fitur |
|------|-------|
| 👨‍🎓 **Siswa** | Kartu Pelajar Digital + QR Code, Presensi Mandiri GPS + Selfie, Pengajuan Izin/Sakit, Riwayat Kehadiran |
| 👨‍🏫 **Guru** | Scanner QR Siswa, Quick Switch Mapel, Jurnal Kelas Harian, Verifikasi Izin, Export Excel |
| 🖥️ **Admin** | Dashboard Real-time, Master Data (Siswa/Guru/Kelas), Cetak Kartu QR, Pengaturan Lokasi GPS |
| 📱 **PWA** | Bisa diinstall di Android & iPhone, Bekerja tanpa memori besar |

---

## 🛠️ Tech Stack

- **Frontend:** Vue.js 3, Vue Router 4, Pinia (State Management)
- **Styling:** Tailwind CSS 3
- **Backend & Database:** Supabase (PostgreSQL + Auth + Storage)
- **Build Tool:** Vite 8
- **PWA:** vite-plugin-pwa
- **Libraries:** html5-qrcode, Leaflet.js, QRCode.js, XLSX

---

## 📋 Prasyarat

Pastikan sudah terinstall di komputer Anda:

| Tool | Versi Minimum | Cek Versi |
|------|--------------|-----------|
| **Node.js** | v18 atau lebih baru | `node -v` |
| **npm** | v9 atau lebih baru | `npm -v` |
| **Git** | Versi terbaru | `git --version` |
| **Akun Supabase** | (gratis) | [supabase.com](https://supabase.com) |

---

## 🚀 Instalasi & Setup

### Langkah 1 — Clone Repository

```bash
git clone https://github.com/Wizfie/presensi-sekolah.git
cd presensi-sekolah
```

### Langkah 2 — Install Dependencies

```bash
npm install
```

> Tunggu hingga proses selesai. Semua paket akan terinstall otomatis ke folder `node_modules/`.

---

### Langkah 3 — Setup Supabase

Aplikasi ini menggunakan **Supabase** sebagai backend (database, autentikasi, dan storage). Ikuti langkah berikut:

#### 3a. Buat Project Supabase

1. Buka [https://supabase.com](https://supabase.com) dan login / daftar akun gratis.
2. Klik **"New Project"**, isi nama project dan password database, lalu klik **Create**.
3. Tunggu beberapa menit hingga project siap.

#### 3b. Setup Database (Jalankan Schema SQL)

1. Di dashboard Supabase, buka menu **SQL Editor** (ikon `</>` di sidebar kiri).
2. Klik **"New Query"**.
3. Salin seluruh isi file **`supabase_schema.sql`** dari repo ini.
4. Tempel ke editor dan klik **"Run"**.

> ✅ Ini akan membuat semua tabel yang dibutuhkan: `profiles`, `presensi`, `pengaturan_sekolah`, `izin`, `jadwal_pelajaran`, dll.

#### 3c. (Opsional) Load Data Demo/Seed

Jika ingin mencoba aplikasi dengan data contoh (90 siswa, 4 guru):

1. Buka lagi **SQL Editor** di Supabase.
2. Salin isi file **`supabase_seed.sql`** dari repo ini.
3. Tempel dan klik **"Run"**.

#### 3d. Ambil API Keys

1. Di dashboard Supabase, buka **Project Settings** → **API**.
2. Salin:
   - **Project URL** (contoh: `https://abcdefgh.supabase.co`)
   - **anon public key** (string panjang yang dimulai dengan `eyJ...`)

---

### Langkah 4 — Konfigurasi Environment

1. Salin file contoh environment:

   ```bash
   # Windows (PowerShell)
   Copy-Item .env.example .env

   # Linux / macOS
   cp .env.example .env
   ```

2. Buka file `.env` dengan teks editor, lalu isi dengan API Keys dari Supabase:

   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

   > ⚠️ **Jangan pernah commit file `.env`!** File ini sudah ada di `.gitignore` untuk melindungi kredensial Anda.

---

### Langkah 5 — Buat Akun Admin Pertama

Karena tidak ada halaman registrasi publik, akun admin dibuat langsung di Supabase:

1. Di dashboard Supabase, buka **Authentication** → **Users**.
2. Klik **"Add User"** → **"Create new user"**.
3. Isi email dan password admin, lalu klik **Create User**.
4. Salin **UUID** dari user yang baru dibuat (kolom `UID`).
5. Buka **SQL Editor** dan jalankan query berikut (ganti nilainya):

```sql
INSERT INTO public.profiles (id, email, nama_lengkap, nomor_induk, role)
VALUES (
  'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  'admin@sekolah.com',
  'Administrator',
  'ADMIN001',
  'admin'
);
```

---

## ▶️ Menjalankan Aplikasi

### Mode Development (Lokal)

```bash
npm run dev
```

Aplikasi akan berjalan di: **`http://localhost:5173`**

Buka di browser, lalu login dengan akun admin yang sudah dibuat.

### Mode Production (Build)

```bash
npm run build
```

File hasil build akan ada di folder `dist/`. Bisa di-deploy ke Vercel, Netlify, atau hosting statis lainnya.

```bash
# Preview hasil build secara lokal
npm run preview
```

---

## 📱 Akses dari Perangkat Mobile (WiFi yang Sama)

Karena Vite dikonfigurasi dengan `host: true`, aplikasi bisa diakses dari HP di jaringan yang sama:

1. Jalankan `npm run dev`.
2. Lihat output terminal, akan muncul alamat **Network**:
   ```
   ➜  Local:   http://localhost:5173/
   ➜  Network: http://192.168.x.x:5173/
   ```
3. Buka alamat **Network** tersebut di browser HP Anda.

---

## 🌐 Tunnel ke Internet (Opsional)

Untuk akses dari luar jaringan lokal (misal demo GPS di luar kantor):

```bash
npm run tunnel
```

> Membutuhkan `cloudflared` terinstall. Download di: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/

---

## 📁 Struktur Project

```
presensi-sekolah/
├── public/              # Asset publik (favicon, PWA icons, docs)
├── src/
│   ├── assets/          # Gambar & aset statis
│   ├── components/      # Komponen Vue yang dapat digunakan ulang
│   │   ├── ui/          # Komponen UI dasar (Button, Card, Badge, Dropdown)
│   │   └── mobile/      # Komponen khusus tampilan mobile
│   ├── lib/
│   │   └── supabase.js  # Inisialisasi Supabase client
│   ├── router/
│   │   └── index.js     # Konfigurasi Vue Router (route guard per role)
│   ├── stores/
│   │   ├── auth.js      # State autentikasi (Pinia)
│   │   └── attendance.js# State data presensi (Pinia)
│   ├── utils/           # Helper functions (avatar, image compressor, seeder)
│   ├── views/           # Halaman utama per role
│   │   ├── LoginView.vue
│   │   ├── AdminDashboard.vue
│   │   ├── GuruDashboard.vue
│   │   └── SiswaDashboard.vue
│   ├── App.vue
│   ├── main.js
│   └── style.css
├── docs/                # Dokumentasi & flowchart
├── supabase_schema.sql  # ⭐ Script SQL untuk setup database
├── supabase_seed.sql    # Script SQL untuk data demo
├── .env.example         # Template konfigurasi environment
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## ❓ Troubleshooting

| Masalah | Solusi |
|---------|--------|
| `npm install` gagal | Pastikan Node.js versi >= 18: `node -v` |
| Halaman kosong / error di browser | Periksa isi `.env`, pastikan URL & Key Supabase sudah benar |
| Login gagal | Pastikan row di tabel `profiles` sudah dibuat untuk user tersebut |
| GPS tidak terdeteksi | Pastikan browser diberi izin lokasi & gunakan HTTPS atau `localhost` |
| Kamera tidak bisa dibuka | Pastikan browser diberi izin kamera & gunakan HTTPS atau `localhost` |
| SQL error saat jalankan seed | Jalankan `supabase_schema.sql` terlebih dahulu sebelum `supabase_seed.sql` |

---

## 📄 Lisensi

Project ini dibuat untuk keperluan akademik **PKM (Program Kreativitas Mahasiswa)** — Universitas Pamulang.

---

*Dibuat dengan ❤️ menggunakan Vue.js + Supabase*

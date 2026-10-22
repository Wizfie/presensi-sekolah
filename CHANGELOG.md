# Changelog - Proyek Presensi Sekolah

Semua perubahan, penambahan fitur, dan perbaikan pada proyek **Presensi Sekolah Berbasis Lokasi & QR Code** dicatat secara berkala di dalam file ini.

Format pencatatan mengacu pada [Keep a Changelog](https://keepachangelog.com/id/1.0.0/).

---

## [Unreleased]
### Direncanakan
- Integrasi push notification untuk pengingat jam masuk/pulang.

---

## [0.6.0] - 2026-10-16
### Ditambahkan & Disempurnakan
- **Presensi Mandiri Siswa Semi-Otomatis Berbasis Jam Mapel (`SiswaDashboard.vue`)**:
  - Penyesuaian mata pelajaran kini berjalan **semi-otomatis**: sistem mendeteksi waktu/jam saat ini secara cerdas dan mencocokkannya dengan jadwal mata pelajaran di kelas siswa (`detectCurrentSubject()`).
  - Siswa tetap memiliki kebebasan penuh untuk memilih atau menyesuaikan mata pelajaran kelasnya secara manual melalui dropdown penyesuaian mapel kelas.
  - Penambahan tombol *Reset Jam Sekarang* jika siswa ingin mengembalikan pilihan manual ke deteksi otomatis jam pelajaran.
  - Banner informasi sesi mapel aktif yang elegan di Panel 2 Foto Bukti Kehadiran lengkap dengan indikator badge `Otomatis Sesuai Jam` / `Pilihan Manual Siswa`.
  - Tombol aksi kirim presensi secara dinamis menyesuaikan status (Masuk / Pulang) sesuai mata pelajaran yang sedang dipilih.
  - Pengiriman record presensi mandiri (GPS + Foto selfie) kini meneruskan parameter `mata_pelajaran` ke `submitAttendanceGps()` di store.
- **Highlight Mencolok & Quick Switch Mata Pelajaran di Halaman Scan Guru (`GuruDashboard.vue`)**:
  - Penambahan **Banner Sesi Presensi Aktif** di bagian atas halaman scanner: menampilkan nama mata pelajaran besar, kelas target, nama guru pengajar, dan rentang jam sesi.
  - **Refactoring Estetika Bebas Gradasi & Optimalisasi Mobile**:
    - Seluruh warna gradasi (`bg-gradient-to-r`) telah dihilangkan dan diganti dengan warna solid modern (`bg-slate-900` dengan border solid `slate-800` pada scanner guru, dan `bg-blue-50/70` solid pada siswa) yang tajam, kontras tinggi, dan ramah dibaca di bawah terik matahari.
    - Perbaikan layout mobile: Dropdown target kelas dan mata pelajaran kini 100% menggunakan komponen standar `<CustomDropdown>` yang konsisten dengan fitur lainnya (popover card, icon `school`/`menu_book`, badge jumlah siswa, dan checkmark aktif) serta ditata dalam grid responsif penuh (`w-full`) sehingga teks tidak terpotong di layar HP sempit.
    - Penyesuaian top bar scanner di mobile agar tombol *Buka Jurnal* dan status pemindai tetap proporsional dan tidak saling menumpuk.
  - **Mekanisme Continuous Next Scan & State Dropdown Terkunci**:
    - **State Dropdown Terjaga Penuh**: Pilihan Kelas dan Mata Pelajaran kini otomatis tersimpan di `localStorage` dan tidak akan pernah ter-reset setelah memindai kartu siswa.
    - **Alur Langsung Next Scan**: Kamera pemindai tidak mati setelah 1 siswa discan. Sistem otomatis memberikan jeda proteksi (debounce cooldown 1.5 detik) untuk mencegah double-scan kartu yang sama, lalu kamera **langsung standby untuk siswa berikutnya (Next Scan)** tanpa perlu klik tombol apa pun.
    - **Visual Feedback Seketika**: Overlay di atas viewport kamera berubah menjadi hijau emerald dengan notifikasi `"✓ [Nama Siswa] Berhasil! Siap next scan..."` sebelum otomatis kembali ke status standby.
  - Fitur **Quick Switcher Target Sesi**: guru dapat mengganti kelas dan mata pelajaran langsung dari halaman scanner tanpa harus berpindah ke tab Jurnal.
  - **Live Scanner Viewport Overlay**: saat kamera aktif, overlay strip `[🔴 LIVE SCAN] Scan Tertuju Ke: [MATA PELAJARAN] (Kelas [KELAS])` tampil di dalam kamera tanpa menutupi tombol close.
  - **Penegasan Hasil Scan Siswa**: kartu konfirmasi hasil pemindaian (`lastScannedStudent`) kini memiliki kotak highlight nama mata pelajaran yang jelas dan tegas untuk memvalidasi pencatatan kehadiran.
  - Riwayat scan hari ini menampilkan badge mata pelajaran di setiap baris catatan siswa.
- **Pembaruan Dokumentasi**:
  - Sinkronisasi [docs/PENJELASAN_PROJECT_DAN_FITUR.txt](file:///d:/Unpam/Semester%206/PKM/Presensi%20Sekolah/docs/PENJELASAN_PROJECT_DAN_FITUR.txt) dan [public/docs/PENJELASAN_PROJECT_DAN_FITUR.txt](file:///d:/Unpam/Semester%206/PKM/Presensi%20Sekolah/public/docs/PENJELASAN_PROJECT_DAN_FITUR.txt) dengan penjelasan alur presensi mandiri semi-otomatis dan highlight halaman pemindai.

---

## [0.5.0] - 2026-10-16
### Ditambahkan & Disempurnakan
- **Implementasi Presensi Per Mata Pelajaran (Subject-Level Attendance)**:
  - Pencatatan kehadiran kini terisolasi per mata pelajaran (`user_id` + `kelas` + `tanggal` + `mata_pelajaran`), mendukung penuh skenario 1 guru mengajar 2 mapel berbeda di kelas yang sama (misal *Pemrograman Web* di jam pagi dan *Basis Data* di jam siang).
  - Penambahan dropdown **"Mata Pelajaran Sesi"** pada toolbar Jurnal Kelas Guru (`GuruDashboard.vue`) sehingga guru dapat beralih sesi mapel dan mengabsen siswa secara mandiri per jam pelajaran.
  - Scanner QR Guru otomatis mencatat presensi sesuai mata pelajaran yang sedang aktif diajar.
  - Riwayat kehadiran di akun Siswa (`SiswaDashboard.vue`) kini menampilkan kolom nama mata pelajaran untuk tiap catatan presensi.
  - Laporan Ekspor Excel (`.xlsx`) Jurnal Guru memuat nama mata pelajaran secara spesifik per sesi pertemuan.
- **Konfigurasi Progressive Web App (PWA)**:
  - Integrasi `vite-plugin-pwa` dengan Service Worker otomatis (`autoUpdate`) dan offline precaching untuk aset aplikasi.
  - Pembuatan Web App Manifest (`manifest.webmanifest`) dengan ikon SVG vector, tema solid `#2563eb`, dan mode display `standalone`.
  - Komponen banner prompt instalasi PWA interaktif (`PwaInstallPrompt.vue`) untuk mempermudah pemasangan aplikasi di Android dan iOS.
- **Refactoring Estetika & Color Palette Mobile**:
  - Pembersihan warna gradasi pada perangkat mobile, digantikan dengan warna solid modern (`#2563eb`, `#0f172a`, `#4f46e5`) yang bersih dan ramah mata di bawah sinar matahari.
- **Penyempurnaan Alur Pemindai Kamera (QR Scanner) & Anti-Stuck**:
  - Tombol pembatalan scan (`stopScanner`) kini menjaga pengguna tetap berada di halaman pemindai tanpa mengarahkan paksa ke halaman jurnal.
  - Tombol buka jurnal otomatis disembunyikan selama kamera pemindai aktif agar proses scan berlangsung fokus dan cepat.
  - Penambahan tombol floating close `✕` di viewport kamera dan pembersihan instan instance kamera saat tab berganti (`onBeforeUnmount`).
- **Manajemen Akun Administrator & Keamanan Root**:
  - Modul CRUD Staf Administrator / TU lengkap dengan proteksi akun Root (`is_root: true`) dari penghapusan tidak sengaja.
  - Fitur 1-klik reset kata sandi administrator ke sandi bawaan sistem.
- **Seeder Skala Penuh & Kontrol Reset Data**:
  - Penambahan data simulasi realistis: 3 Kelas @ 30 Siswa (Total 90 siswa terdaftar lengkap), 4 Guru multi-mapel, dan 2 Akun Admin.
  - Tombol kontrol data cepat dipindahkan ke Sidebar Desktop dan Mobile Drawer: *"Reset ke Seeding"* dan *"Kosongkan Data (Mulai dari Nol)"*.
- **Pusat Dokumentasi & Flowchart Resmi**:
  - Penyusunan dokumen panduan sistem ramah pengguna awam yang padat dan to-the-point di [docs/PENJELASAN_PROJECT_DAN_FITUR.txt](file:///d:/Unpam/Semester%206/PKM/Presensi%20Sekolah/docs/PENJELASAN_PROJECT_DAN_FITUR.txt) beserta catatan konfirmasi kebijakan guru 2 mapel di kelas yang sama.
  - Pembuatan diagram alir flowchart berstandar akademik ANSI / ISO 5807 dengan background putih bersih, layout lapang, dan bebas tabrakan (zero-collision) di [docs/flowchart_presensi_sekolah.png](file:///d:/Unpam/Semester%206/PKM/Presensi%20Sekolah/docs/flowchart_presensi_sekolah.png).
  - Integrasi tombol unduh langsung file `.txt` dan `.png` pada Sidebar dan Mobile Drawer dalam mode demo.

---

## [0.4.0] - 2026-09-27
### Ditambahkan & Disempurnakan
- **Penyelarasan Tanggung Jawab Peran (Role Boundaries)**:
  - **Administrator Sekolah**:
    - Dikhususkan untuk **Master Data Management** (Manajemen Siswa CRUD, Manajemen Guru & Alokasi Kelas CRUD, Cetak Kartu ID QR Siswa A4, dan Konfigurasi Titik Koordinat GPS & Radius Jarak Geofencing).
    - Menghilangkan log kehadiran operasional harian dan tombol export dari panel Admin agar panel Admin murni terisolasi untuk data master & konfigurasi geofencing sekolah.
    - Menampilkan kartu KPI Master Data (Total Siswa, Total Guru & Staf, Total Kelas Aktif, dan Radius Geofencing GPS).
  - **Guru Pengajar**:
    - **Ringkasan Presensi (KPI Cards)**: Menampilkan KPI presensi real-time kelas aktif yang dipilih (Total Siswa Kelas, Hadir Tepat, Terlambat, Izin/Sakit, dan Belum Hadir / Alpa).
    - **Export Excel (.xlsx) Tiap Kelas**: Guru dapat mengunduh laporan kehadiran khusus untuk kelas yang sedang diajar dengan detail NISN, waktu masuk/pulang, metode, status, dan mata pelajaran.
    - **Pengaturan Jam Masuk Setiap Kelas (Dropdown Selector)**: Guru yang mengampu banyak kelas dapat dengan mudah memilih kelas yang ingin diatur jamnya via **Dropdown Selector** yang ringkas dan responsif, serta melihat status jam aktif di tabel ringkasan.
    - **Tab Profil Pendidik & Perampingan Header**: Memindahkan detail profil (NIP, email, daftar lengkap alokasi kelas, dan form edit nama/foto) ke tab tersendiri **"👤 Profil Pendidik"** sehingga header card atas menjadi ringkas, rapi, dan tidak menumpuk informasi.
    - **Pencarian Cepat di Absen Manual**: Filter pencarian instan berdasarkan nama atau NISN siswa pada tabel absensi manual kelas.
    - **Konfirmasi Keamanan (Confirm Dialog) pada "Set Semua Hadir"**: Menambahkan dialog konfirmasi sebelum menandai seluruh siswa kelas sebagai hadir guna mencegah ketidaksengajaan.

---

## [0.3.0] - 2026-09-27
### Ditambahkan
- **Manajemen Guru & Alokasi Kelas (Admin Dashboard)**:
  - Modul CRUD Guru lengkap (tambah guru baru, edit, hapus, kelola foto, email, dan NIP).
  - Detail **Mata Pelajaran yang Diampu** (misal: Pemrograman Web & Mobile, Basis Data).
  - Fitur **Alokasi Kelas**: Admin dapat menentukan kelas mana saja yang diajar oleh guru tersebut (`kelas_diajar`).
- **Isolasi Hak Akses Siswa Berdasarkan Guru (Guru Dashboard)**:
  - Guru kini hanya dapat melihat, mengabsen, dan memindai siswa yang terdaftar di kelas yang dialokasikan padanya.
  - Dropdown filter kelas di Guru Dashboard hanya menampilkan kelas-kelas yang diajar oleh guru tersebut.
  - Scanner QR otomatis menolak pemindaian siswa dari kelas di luar jangkauan ajar guru.
- **Absensi Manual dengan Input Jam Masuk & Status Cepat**:
  - Kolom **Input Jam Masuk** per siswa pada tabel absensi manual dengan tombol shortcut `Now` (jam saat ini).
  - Tombol **Status Cepat** (Hadir, Telat, Izin, Sakit, Alpa) otomatis mencatat presensi sesuai jam yang tertera pada kolom jam masuk siswa tersebut.
  - Tombol **Set Semua Hadir** untuk menandai seluruh siswa di kelas dengan jam sesi guru secara instan.
- **Pengaturan Jam Masuk Guru Mandiri**:
  - Tab baru di Guru Dashboard: `⚙️ Jam Mengajar Saya`.
  - Guru dapat mengatur sendiri jam masuk mulai pelajaran, batas toleransi terlambat, dan jam selesai mengajar.
  - Pengaturan jam ini otomatis menjadi default waktu pada absensi manual dan scanner.

---

## [0.2.0] - 2026-09-27
### Ditambahkan
- **Panduan Setup Supabase**: Membuat dokumen [TUTORIAL_SUPABASE.md](file:///d:/Unpam/Semester%206/PKM/Presensi%20Sekolah/TUTORIAL_SUPABASE.md) yang menjelaskan cara setup proyek, API keys, eksekusi SQL schema, Storage bucket, dan manajemen user.
- **Skrip Seeding Database Otomatis**: Membuat berkas [supabase_seed.sql](file:///d:/Unpam/Semester%206/PKM/Presensi%20Sekolah/supabase_seed.sql) untuk menginjeksi otomatis akun login Admin, Guru, dan Siswa (password default `password123`), pengaturan lokasi GPS sekolah, data kehadiran hari ini, dan permohonan izin dalam 1-klik.
- **Frontend Scaffolding**: Setup Vue 3 + Vite dengan Pinia dan Vue Router di folder `Presensi Sekolah`.
- **Desain UI/UX shadcn/ui**: Implementasi Tailwind CSS dengan tema Biru (`#2563eb`) & Putih/Slate (`#f8fafc`), border halus, dan komponen reusable (`Button.vue`, `Card.vue`, `Badge.vue`, `Navbar.vue`).
- **Skema Database Supabase Lengkap**: Menulis `supabase_schema.sql` yang memuat tabel `profiles`, `pengaturan_sekolah`, `presensi`, `pengajuan_izin`, RLS policies, dan RPC functions (*Haversine* & *QR Scan*).
- **Halaman Login & Demo Switcher**: `LoginView.vue` dengan autentikasi Supabase dan tombol 1-klik testing untuk Siswa, Guru, dan Admin.
- **Sinkronisasi Data Akun Seed & Login NISN/NIP**: Menyelaraskan seluruh akun dari [supabase_seed.sql](file:///d:/Unpam/Semester%206/PKM/Presensi%20Sekolah/supabase_seed.sql) ke dalam sistem auth frontend (Admin, Guru, dan 5 Siswa). Pengguna kini dapat langsung login menggunakan **Email** ATAU **NISN/NIP** dengan password default `password123`, dilengkapi accordion daftar kredensial dan fitur 1-klik autofill.
- **Dashboard Siswa**:
  - Deteksi koordinat GPS perangkat real-time.
  - Peta interaktif Leaflet.js dengan visualisasi lingkaran radius sekolah dan posisi siswa.
  - Kamera selfie real-time untuk bukti kehadiran.
  - **Perbaikan QR Code**: Mengganti render DOM canvas dengan reactive `QRCode.toDataURL` sehingga QR barcode langsung termuat instan saat membuka tab Kartu ID.
  - **Perbaikan Responsif Mobile**: Merapikan layout kartu ID siswa dan greeting card (`min-w-0 flex-1`, `shrink-0`) agar tidak saling menabrak / overlap pada layar ponsel sempit (360px - 390px).
  - **Reset Kamera & Auto-Redirect Riwayat**: Kamera dan foto selfie otomatis di-reset bersih setelah presensi berhasil dikirim, efek selebrasi confetti dijalankan, dan halaman langsung otomatis beralih ke tab **Riwayat Kehadiran**.
  - Form pengajuan izin/sakit dengan **Fitur Upload Lampiran Bukti / Surat Dokter**: mendukung unggah gambar (JPG, PNG, WEBP hingga 5MB), preview instan dokumen, tombol ganti/hapus, serta riwayat pengajuan izin pribadi siswa dilengkapi lightbox modal.
- **Dashboard Guru / Petugas Piket**:
  - Pemindai kamera QR Code (`html5-qrcode`) dengan suara *beep* dan popup pengenal siswa.
  - Fitur input absensi manual kelas (1-klik tombol Hadir, Terlambat, Izin, Sakit, Alpa).
  - Panel verifikasi persetujuan (*Approve/Reject*) surat izin siswa dilengkapi **Pratinjau Berkas Lampiran / Surat Dokter Siswa** secara mendetail melalui Lightbox modal.
- **Dashboard Admin**:
  - **Modul Manajemen Data Siswa (CRUD)**: Menambah siswa baru (+ auto generate `qr_token`), mengubah data kelas/NISN, menghapus data siswa, serta pencarian instan dan filter kelas.
  - Rekapitulasi statistik kehadiran hari ini secara *real-time*.
  - Generator layout cetak kartu ID QR Code siswa siap print di kertas A4 (`window.print()`).
  - **Persistensi State Otomatis (localStorage)**: Semua perubahan data (tambah siswa, ubah jam sekolah, koordinat GPS, log absensi harian) dan **posisi tab aktif di semua role (Siswa, Guru, Admin)** otomatis tersimpan di `localStorage` peramban sehingga tidak ter-reset saat tab di-refresh.
  - Panel pengaturan titik GPS sekolah (Latitude, Longitude, Radius toleransi) dengan tombol ambil koordinat perangkat otomatis.
  - Fitur ekspor data presensi ke file Excel (`.xlsx`) menggunakan SheetJS.

---

## [0.1.0] - 2026-09-27
### Ditambahkan
- **Dokumentasi Basis Arsitektur**: Membuat berkas spesifikasi teknis `RANCANGAN_SISTEM.md` sebagai acuan pengembangan.
- **Konsep Hybrid Attendance**: Skenario GPS Mandiri dan Kartu QR Fisik / Manual Guru.
- **Dokumen Pemantauan**: Membuat berkas `CHANGELOG.md` untuk memonitor progres pembaruan berkala.

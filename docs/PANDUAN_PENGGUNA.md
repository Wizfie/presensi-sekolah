# 📖 Buku Panduan Pengguna (User Guide)
## Sistem Presensi Sekolah Digital — PKBM Cahaya Mulia

Selamat datang di Buku Panduan Pengguna **Sistem Presensi Sekolah Digital PKBM Cahaya Mulia**. Dokumen ini disusun sebagai panduan operasional lengkap bagi seluruh pengguna sistem: **Siswa (Warga Belajar)**, **Guru Piket / Tutor**, **Administrator (Tata Usaha)**, dan **Kepala PKBM (Pimpinan)**.

---

## 📑 Daftar Isi
1. [Pendahuluan & Akses Sistem](#1-pendahuluan--akses-sistem)
   - [1.1 Persyaratan Perangkat & Browser](#11-persyaratan-perangkat--browser)
   - [1.2 Cara Install Aplikasi ke Layar Utama (PWA)](#12-cara-install-aplikasi-ke-layar-utama-pwa)
   - [1.3 Cara Masuk ke Sistem (Login)](#13-cara-masuk-ke-sistem-login)
   - [1.4 Bantuan Akun & Lupa Password](#14-bantuan-akun--lupa-password)
2. [Panduan untuk Siswa (Warga Belajar)](#2-panduan-untuk-siswa-warga-belajar)
   - [2.1 Presensi Mandiri GPS (Masuk & Pulang)](#21-presensi-mandiri-gps-masuk--pulang)
   - [2.2 Kartu Siswa Digital (QR Code)](#22-kartu-siswa-digital-qr-code)
   - [2.3 Memeriksa Riwayat Kehadiran Pribadi](#23-memeriksa-riwayat-kehadiran-pribadi)
   - [2.4 Mengajukan Izin atau Sakit Online](#24-mengajukan-izin-atau-sakit-online)
3. [Panduan untuk Guru Piket & Tutor](#3-panduan-untuk-guru-piket--tutor)
   - [3.1 Presensi Kelas Harian & Fitur "Tandai Hadir Semua"](#31-presensi-kelas-harian--fitur-tandai-hadir-semua)
   - [3.2 Pencatatan Jam Pulang (Satuan & Pulang Semua)](#32-pencatatan-jam-pulang-satuan--pulang-semua)
   - [3.3 Memindai Kartu Siswa (Kamera Scanner & Input Cepat NISN)](#33-memindai-kartu-siswa-kamera-scanner--input-cepat-nisn)
   - [3.4 Buku Rekapitulasi Bulanan (Mode Otomatis Sesuai Layar Perangkat)](#34-buku-rekapitulasi-bulanan-mode-otomatis-sesuai-layar-perangkat)
   - [3.5 Koreksi Cepat Kehadiran Lewat Mini Kalender](#35-koreksi-cepat-kehadiran-lewat-mini-kalender)
   - [3.6 Pengaturan Penandatangan Dokumen "Mengetahui"](#36-pengaturan-penandatangan-dokumen-mengetahui)
   - [3.7 Export Excel (.xlsx) & Cetak Lembar Absensi](#37-export-excel-xlsx--cetak-lembar-absensi)
4. [Panduan untuk Administrator (Tata Usaha)](#4-panduan-untuk-administrator-tata-usaha)
   - [4.1 Manajemen Akun & Data Siswa (CRUD, Nonaktif, Pulihkan)](#41-manajemen-akun--data-siswa-crud-nonaktif-pulihkan)
   - [4.2 Manajemen Guru Piket / Tutor & Alokasi Kelas](#42-manajemen-guru-piket--tutor--alokasi-kelas)
   - [4.3 Manajemen Master Kelas (Tambah, Rename Nama Kelas, & Syarat Hapus)](#43-manajemen-master-kelas-tambah-rename-nama-kelas--syarat-hapus)
   - [4.4 Manajemen Staf Administrator & Proteksi Akun Root](#44-manajemen-staf-administrator--proteksi-akun-root)
   - [4.5 Reset Password Akun Pengguna](#45-reset-password-akun-pengguna)
   - [4.6 Cetak Kartu ID QR Fisik (A4 Siap Laminasi)](#46-cetak-kartu-id-qr-fisik-a4-siap-laminasi)
   - [4.7 Pengaturan Titik GPS Sekolah & Jam Operasional](#47-pengaturan-titik-gps-sekolah--jam-operasional)
5. [Panduan untuk Kepala PKBM / Pimpinan](#5-panduan-untuk-kepala-pkbm--pimpinan)
   - [5.1 Monitoring Kehadiran Real-time](#51-monitoring-kehadiran-real-time)
   - [5.2 Verifikasi Laporan & Pengesahan Rekap Bulanan](#52-verifikasi-laporan--pengesahan-rekap-bulanan)
6. [Tanya Jawab & Pemecahan Masalah (FAQ)](#6-tanya-jawab--pemecahan-masalah-faq)
7. [Lampiran Kredensial Akun Demo & Pembersihan Database](#7-lampiran-kredensial-akun-demo--pembersihan-database)

---

## 1. Pendahuluan & Akses Sistem

Sistem Presensi Sekolah Digital PKBM Cahaya Mulia adalah aplikasi web progresif (**Progressive Web App / PWA**) yang menggantikan pencatatan presensi lembaran kertas fisik menjadi sistem digital yang cepat, akurat, hemat kuota, dan terhubung secara *real-time*.

### 1.1 Persyaratan Perangkat & Browser
- **Perangkat:** Smartphone Android, iPhone (iOS), Tablet, Laptop, atau PC.
- **Browser yang Disarankan:**
  - **Android / Windows / macOS:** Google Chrome, Microsoft Edge, atau Mozilla Firefox.
  - **iPhone / iPad:** Safari atau Google Chrome.
- **Koneksi:** Akses internet dan koneksi aman HTTPS *(wajib aktif agar fitur GPS dan Kamera Scanner diizinkan oleh sistem operasi)*.

### 1.2 Cara Install Aplikasi ke Layar Utama (PWA)
Aplikasi dapat dipasang ke layar beranda HP Anda layaknya aplikasi native dari Google Play Store / App Store tanpa memakan memori besar:

#### A. Pada Android (Google Chrome):
1. Buka tautan presensi di Google Chrome.
2. Tunggu banner otomatis *"Tambahkan PresensiKu ke Layar Utama"* di bagian bawah layar, lalu ketuk **Install**.
3. Jika banner tidak muncul, ketuk ikon titik tiga (**⋮**) di sudut kanan atas browser → pilih **Instal aplikasi** atau **Tambahkan ke Layar Utama**.
4. Ikon **Presensi PKBM** akan muncul di menu aplikasi HP Anda.

#### B. Pada iPhone / iPad (Safari):
1. Buka tautan presensi di peramban **Safari**.
2. Ketuk tombol **Bagikan (Share)** (ikon kotak dengan tanda panah ke atas di bilah bawah).
3. Gulir ke bawah dan ketuk opsi **Tambah ke Layar Utama (Add to Home Screen)**.
4. Ketuk **Tambah (Add)** di sudut kanan atas.

---

### 1.3 Cara Masuk ke Sistem (Login)

1. Buka aplikasi di HP atau laptop Anda.
2. Masukkan identitas akun pada kolom **Email / NISN / NIP**:
   - **Siswa:** Masukkan **NISN** Anda *(contoh akun demo: `1201`, `1101`, `1001` atau NISN resmi terdaftar)* tanpa perlu mengetikkan alamat email.
   - **Guru Piket / Tutor:** Masukkan alamat email resmi guru *(contoh akun demo: `guru1@mail.com`, `guru2@mail.com`)* atau NIP Anda.
   - **Administrator:** Masukkan email administrator (`admin@mail.com`) atau ID Admin (`ADM-001`).
3. Masukkan **Password** akun Anda:
   - **Siswa (Akun Demo):** Menggunakan format `pkbm[nisn]`, contoh: NISN `1201` password-nya `pkbm1201`, NISN `1101` password-nya `pkbm1101`, NISN `1001` password-nya `pkbm1001`.
   - **Guru Piket (Akun Demo):** Guru 1 (`guru1@mail.com`) password-nya `pkbmguru1`, Guru 2 (`guru2@mail.com`) password-nya `pkbmguru2`.
   - **Administrator (Akun Demo):** Password-nya `pkbmadmin`.
   - *Tips:* Ketuk ikon **Mata** di sisi kanan kolom password untuk menampilkan atau menyembunyikan karakter teks password yang Anda ketik.
4. Ketuk tombol **Masuk**.
5. Sistem akan memvalidasi akun Anda dan secara otomatis mengarahkan ke Dashboard sesuai hak akses masing-masing:
   - Siswa → Dashboard Siswa (`/siswa`)
   - Guru → Dashboard Guru Piket (`/guru`)
   - Admin → Dashboard Pengelola (`/admin`)

---

### 1.4 Bantuan Akun & Lupa Password

Untuk menjaga keamanan dan integritas data kehadiran resmi sekolah:
1. Jika Anda lupa password akun Siswa atau Guru, klik tautan **Lupa password?** di halaman login.
2. Hubungi **Administrator Sekolah / Tata Usaha** atau Guru Piket dengan menyebutkan Nama Lengkap dan NISN/NIP Anda.
3. Administrator akan mereset password akun Anda melalui menu manajemen pengguna dan memberikan password baru.
4. Setelah berhasil login kembali, Anda dapat memperbarui password secara mandiri di menu Profil.

---

## 2. Panduan untuk Siswa (Warga Belajar)

Setelah berhasil masuk, Anda akan melihat halaman **Dashboard Siswa** dengan navigasi bilah bawah: **Presensi**, **Kartu QR**, **Riwayat**, dan **Izin**.

```text
[ Dashboard Siswa ]
├── 📍 Presensi  : Deteksi GPS otomatis & tombol Presensi Masuk / Pulang
├── 💳 Kartu QR   : Barcode identitas resmi untuk discan Guru Piket
├── 📊 Riwayat    : Rangkuman kehadiran bulanan (Hadir, Sakit, Izin, Alpa)
└── 📝 Izin       : Formulir online pengajuan tidak hadir (Izin/Sakit)
```

---

### 2.1 Presensi Mandiri GPS (Masuk & Pulang)

Fitur ini digunakan saat Anda sudah berada di lingkungan gedung PKBM Cahaya Mulia:

1. Buka tab **Presensi**.
2. Berikan izin lokasi ketika browser menampilkan pesan *"Izinkan situs ini mengakses lokasi perangkat Anda?"* → pilih **Izinkan (Allow)**.
3. Periksa status indikator radius:
   - 🟢 **Dalam Radius Presensi:** Menampilkan jarak Anda ke titik sekolah *(contoh: "32 meter dari sekolah (Radius toleransi: 100m)")*. Tombol presensi aktif dan siap digunakan.
   - 🔴 **Di Luar Jangkauan:** Anda berada di luar area toleransi sekolah. Tombol presensi otomatis terkunci demi integritas kehadiran.
4. **Presensi Masuk (Pagi):**
   - Ketuk tombol besar warna biru: **Presensi Masuk (IN)**.
   - Jika hadir sebelum jam batas keterlambatan *(default `08:00 WIB`)*, status tercatat **HADIR**. Jika melewati jam tersebut, status otomatis tercatat **TERLAMBAT**.
   - Muncul notifikasi konfirmasi jam dan jarak lokasi Anda.
5. **Presensi Pulang (Siang/Sore):**
   - Saat jam pulang sekolah tiba, buka kembali tab Presensi lalu ketuk **Presensi Pulang (OUT)**.
   - Waktu kepulangan Anda akan tercatat secara resmi di server.

---

### 2.2 Kartu Siswa Digital (QR Code)

Gunakan fitur ini apabila HP Anda mengalami kendala GPS, sinyal internet lemah, atau baterai habis:
1. Ketuk tab **Kartu QR**.
2. Di layar akan tampil **Kartu Identitas Digital Siswa** berisi:
   - Logo Resmi PKBM Cahaya Mulia
   - Nama Lengkap & NISN Siswa
   - Kelas Aktif & Tahun Pelajaran berjalan
   - Kode QR Dinamis Pribadi
3. Tunjukkan layar kartu ini ke **Guru Piket** di gerbang/meja piket untuk dipindai menggunakan scanner kamera sekolah.
4. Begitu Guru Piket memindai kartu Anda, kehadiran Anda langsung tercatat detik itu juga di server.

---

### 2.3 Memeriksa Riwayat Kehadiran Pribadi

1. Ketuk tab **Riwayat**.
2. Anda dapat melihat:
   - **4 Kotak Ringkasan:** Total kehadiran Hadir, Sakit, Izin, dan Alpa pada bulan berjalan.
   - **Persentase Kehadiran:** Menghitung otomatis tingkat kedisiplinan kehadiran Anda dalam persen (%).
   - **Daftar Harian:** Rincian hari per hari lengkap dengan Jam Masuk, Jam Pulang, dan Keterangan.

---

### 2.4 Mengajukan Izin atau Sakit Online

Jika Anda berhalangan hadir ke sekolah:
1. Ketuk tab **Izin**.
2. Pilih jenis pengajuan:
   - **Izin Keperluan:** Jika memiliki agenda keluarga, keperluan dinas, dsb.
   - **Sakit:** Jika kondisi badan kurang sehat.
3. Tentukan **Tanggal** Anda berhalangan hadir.
4. Tuliskan **Alasan / Keterangan** secara jelas dan sopan pada kolom yang disediakan.
5. Ketuk tombol **Kirim Pengajuan Izin**.
6. Sistem akan memunculkan dialog konfirmasi sukses dan data kehadiran Anda otomatis diperbarui pada daftar absensi Guru Piket.

---

## 3. Panduan untuk Guru Piket & Tutor

Guru Piket dan Tutor bertugas mengawasi kehadiran harian siswa, mengoperasikan scanner QR di pos piket, serta mengesahkan dan mengekspor buku absensi bulanan.

---

### 3.1 Presensi Kelas Harian & Fitur "Tandai Hadir Semua"

1. Masuk ke **Dashboard Guru** → buka tab **Presensi Harian**.
2. Pilih **Kelas** yang ingin diperiksa melalui dropdown filter *(misal: Kelas 10, 11, atau 12)*.
3. Tanggal otomatis mengarah ke hari ini (WIB), namun Anda dapat memilih tanggal lampau jika ingin mengecek arsip.
4. **Mengubah Status Siswa Satuan:**
   - Pada baris nama siswa, tersedia tombol status cepat: **H (Hadir)**, **T (Terlambat)**, **S (Sakit)**, **I (Izin)**, dan **A (Alpa)**.
   - Ketuk salah satu tombol untuk mengubah status. Jam masuk akan tercatat otomatis sesuai waktu saat tombol ditekan.
5. **Fitur Cepat "Tandai Hadir Semua" dengan Pilihan Jam:**
   - Jika satu kelas hadir lengkap, Anda tidak perlu mengeklik satu per satu nama siswa.
   - Ketuk tombol **Tandai Hadir Semua** di bagian atas tabel.
   - Dialog konfirmasi akan terbuka dilengkapi **Input Jam Masuk** (secara otomatis terisi waktu saat ini / *time now* sebagai nilai bawaan, misal `07:30`).
   - Anda dapat menyesuaikan jam masuk jika diperlukan lalu ketuk tombol **Tandai Hadir Semua**. Seluruh siswa yang belum absen langsung serentak tercatat **Hadir** dengan jam masuk tersebut.

---

### 3.2 Pencatatan Jam Pulang (Satuan & Pulang Semua)

1. **Catat Pulang Satuan:**
   - Pada kolom *Jam Pulang*, jika siswa sudah hadir tapi belum pulang, akan tampil tombol biru kecil bertuliskan **Set Pulang**.
   - Saat siswa meninggalkan sekolah, ketuk tombol tersebut. Waktu kepulangan langsung tercatat.
   - Jika salah tekan, arahkan kursor/ketuk jam tersebut lalu pilih opsi reset untuk membatalkan.
2. **1-Klik "Set Pulang Semua" dengan Pilihan Jam:**
   - Saat jam kepulangan bersama tiba, ketuk tombol **Set Pulang Semua** di toolbar atas.
   - Muncul dialog konfirmasi dilengkapi **Input Jam Pulang** (secara default terisi waktu saat ini / *time now*, misal `14:00`).
   - Anda dapat menyesuaikan jam kepulangan jika diperlukan lalu konfirmasi. Seluruh siswa yang berstatus Hadir atau Terlambat akan serentak memiliki jam kepulangan tanpa mengubah status kehadiran mereka.

---

### 3.3 Memindai Kartu Siswa (Kamera Scanner & Input Cepat NISN)

1. Buka tab **Scanner QR**.
2. Izinkan akses kamera pada browser laptop/HP piket.
3. Arahkan kamera ke **Barcode QR pada Kartu Siswa** (baik kartu fisik laminasi maupun layar HP siswa).
4. **Logika Cerdas Scanner:**
   - Scan Pertama (Pagi): Otomatis mencatat **Presensi MASUK**.
   - Scan Kedua (Sore): Otomatis mencatat **Presensi PULANG**.
   - Scan Ketiga: Menampilkan notifikasi bahwa siswa sudah menyelesaikan sesi masuk dan pulang hari ini.
5. Layar scanner akan berkedip hijau disertai notifikasi sukses serta menampilkan nama, kelas, dan NISN siswa.
6. **Alternatif Input Cepat NISN:** Jika kamera bermasalah atau barcode kartu kotor/rusak, Anda cukup mengetikkan **NISN Siswa** pada kotak pencarian cepat di bawah kamera lalu tekan **Enter**.

---

### 3.4 Buku Rekapitulasi Bulanan (Mode Otomatis Sesuai Layar Perangkat)

Buka tab **Buku Rekap** untuk melihat rekapitulasi kehadiran bulanan. Sistem bekerja secara cerdas dan otomatis mendeteksi ukuran layar perangkat yang Anda gunakan (*responsive auto-detect*) tanpa memerlukan tombol pemilihan manual:

#### A. Pada Layar Smartphone / HP (Otomatis Mode Ringkasan Kartu):
- Sistem otomatis mengaktifkan tampilan kartu ringkas per siswa dengan kartu statistik kelas di bagian atas.
- Dilengkapi **progres bar kehadiran**, total H/S/I/A, dan daftar tanggal siswa tidak masuk sekolah yang nyaman dibaca vertikal pada layar sentuh.

#### B. Pada Layar Tablet / Laptop / PC (Otomatis Mode Tabel Matriks):
- Sistem otomatis menampilkan format tabel matriks penuh standar buku absensi lembar fisik resmi dari **Tanggal 1 s.d. 31**.
- Kolom akhir pekan (Sabtu & Minggu) ditandai dengan arsir warna abu-abu lembut pembeda.
- Baris paling bawah menghitung **Total Kehadiran Seluruh Siswa per Hari** dan akumulasi persentase kelas secara presisi.

---

### 3.5 Koreksi Cepat Kehadiran Lewat Mini Kalender

Jika ada siswa yang terlambat membawa surat izin/dokter atau ada koreksi data lampau:
1. Pada tampilan rekap siswa terkait, ketuk tanggal yang ingin diubah pada **Mini Kalender (1–31)**.
2. Muncul dialog **Koreksi Cepat Status**:
   - Pilih status baru: Hadir, Sakit, Izin, atau Alpa.
3. Data akan langsung terupdate di layar dan tersimpan ke server secara real-time.

---

### 3.6 Pengaturan Penandatangan Dokumen "Mengetahui"

Pada bagian bawah tabel matriks rekapitulasi, terdapat blok tanda tangan resmi:
- **Sisi Kiri ("Mengetahui"):** Untuk Kepala PKBM / Pimpinan.
- **Sisi Kanan ("Guru Piket / Tutor"):** Otomatis terisi nama guru yang sedang login.

**Cara Mengubah Identitas Pimpinan:**
1. Arahkan kursor/ketuk langsung pada teks garis bawah **Jabatan**, **Nama Pejabat**, dan **NIP** di sisi kiri.
2. Ketik nama pejabat yang berwenang *(contoh: `Drs. H. Ahmad Fauzi, M.Pd`)*.
3. Perubahan tersimpan secara otomatis ke database sekolah sehingga saat dicetak atau diekspor ke Excel, nama pimpinan sudah tercantum rapi.

---

### 3.7 Export Excel (.xlsx) & Cetak Lembar Absensi

1. Pilih **Kelas**, **Bulan**, dan **Tahun** yang ingin dilaporkan.
2. **Export ke File Excel (.xlsx):**
   - Ketuk tombol hijau **Export Excel**.
   - Sistem akan menyiapkan data dan langsung mengunduh file `.xlsx` dengan format cantik: tabel bergaris rapi, warna status, persentase, dan kolom tanda tangan pengesahan resmi.
3. **Cetak Lembar Absen (Print / PDF):**
   - Ketuk tombol **Cetak Lembar Absen**.
   - Halaman otomatis diformat ke layout **Kertas A4 Horizontal (Landscape)** dengan menyembunyikan tombol navigasi aplikasi.
   - Anda dapat langsung mencetaknya ke printer fisik atau menyimpannya sebagai file **PDF**.

---

## 4. Panduan untuk Administrator (Tata Usaha)

Administrator memiliki kendali penuh atas manajemen basis data pengguna, manajemen master kelas, pengaturan GPS sekolah, dan pencetakan massal kartu identitas siswa.

---

### 4.1 Manajemen Akun & Data Siswa (CRUD, Nonaktif, Pulihkan)

Buka menu **Data Siswa**:
1. **Tambah Siswa Baru:**
   - Klik tombol **+ Tambah Siswa**.
   - Isi Nama Lengkap, NISN (Nomor Induk Siswa Nasional), Jenis Kelamin (L/P), Kelas, dan Password awal login *(minimal 6 karakter)*.
   - Klik **Simpan Siswa**. Sistem otomatis membuatkan akun autentikasi sekaligus token kartu QR unik.
2. **Mengubah Data Siswa:**
   - Klik ikon pensil **Edit** di baris siswa yang dituju. Ubah informasi yang diperlukan lalu klik **Perbarui Data**.
3. **Menonaktifkan Siswa (Soft Delete):**
   - Jika siswa lulus atau pindah, klik tombol tempat sampah **Nonaktifkan**.
   - Data historis kehadiran siswa di masa lalu **tidak akan hilang** dari arsip laporan bulanan.
4. **Memulihkan Siswa:**
   - Klik tombol **Arsip Siswa Nonaktif** → klik tombol **Pulihkan** jika ada siswa yang kembali aktif.

---

### 4.2 Manajemen Guru Piket / Tutor & Alokasi Kelas

Buka menu **Data Guru / Tutor**:
1. Klik **+ Tambah Guru**.
2. Masukkan Nama Lengkap (beserta gelar), NIP / NIK, Email resmi, dan password awal.
3. **Alokasi Kelas:** Centang kelas mana saja yang diampu atau ditugaskan kepada guru tersebut *(misal: Kelas 10, 11, dan 12)*. Guru hanya akan dapat mengelola presensi pada kelas yang dialokasikan.
4. Klik **Simpan Guru / Piket**.

---

### 4.3 Manajemen Master Kelas (Tambah, Rename Nama Kelas, & Syarat Hapus)

Buka menu atau modal **Kelola Master Kelas** di Dashboard Administrator:
1. **Daftar Kelas Terdaftar:**
   - Menampilkan seluruh kelas aktif *(contoh: Kelas `10`, `11`, `12`)* beserta indikator badge jumlah siswa yang sedang terdaftar di kelas tersebut.
2. **Tambah Kelas Baru:**
   - Masukkan nama kelas baru pada kolom isian *(contoh: `10`, `11`, `12`, atau nama rombel lainnya)* lalu klik **+ Tambah**.
   - Nama kelas akan tersimpan ke database dan langsung dapat dipilih saat mendaftarkan siswa baru.
3. **Ubah Nama Kelas (Rename Safe):**
   - Klik ikon pensil **Ubah Nama** pada baris kelas yang ingin diubah.
   - Masukkan nama baru lalu simpan. Sistem akan secara otomatis memperbarui relasi kelas pada profil siswa dan data presensi secara konsisten tanpa menghapus riwayat kehadiran yang ada.
4. **Hapus Kelas (Proteksi Integritas Data):**
   - Klik ikon tempat sampah **Hapus** pada kelas yang ingin dibersihkan.
   - **Syarat Wajib:** Kelas **hanya dapat dihapus apabila jumlah siswa di kelas tersebut sudah kosong (0 siswa)**.
   - Jika kelas masih memiliki siswa aktif, sistem akan menampilkan dialog peringatan dan **mengunci opsi hapus** (hanya tombol "Tutup"). Hal ini untuk melindungi agar data siswa dan riwayat presensi tidak terhapus secara tidak sengaja. Kosongkan atau pindahkan data siswa terlebih dahulu sebelum menghapus kelas.

---

### 4.4 Manajemen Staf Administrator & Proteksi Akun Root

Buka menu **Data Administrator**:
- Tambah atau kelola akun staf Tata Usaha yang diberikan wewenang administratif.
- **Proteksi Super Admin Root:** Akun utama dengan email `admin@mail.com` dan nomor induk `ADM-001` memiliki status *Root* dan dilindungi sistem agar tidak dapat dinonaktifkan atau dihapus secara tidak sengaja oleh siapa pun. Password default akun ini adalah `pkbmadmin`.

---

### 4.5 Reset Password Akun Pengguna

Jika ada siswa, guru, atau staf yang lupa password:
1. Buka menu data pengguna terkait (Siswa / Guru / Admin).
2. Klik tombol **Edit** pada akun pengguna yang meminta reset.
3. Masukkan password baru pada kolom password *(minimal 6 karakter, contoh: `pkbm1201` untuk siswa atau `cahayamulia2026`)*.
4. Simpan perubahan dan serahkan password baru tersebut kepada yang bersangkutan.

---

### 4.6 Cetak Kartu ID QR Fisik (A4 Siap Laminasi)

Buka menu **Cetak Kartu ID QR**:
1. Filter siswa berdasarkan **Kelas** atau gunakan kotak pencarian nama.
2. Gunakan centang **Pilih Semua** atau pilih siswa tertentu yang ingin dicetak kartunya.
3. Kartu dirancang dengan ukuran standar kartu pelajar lengkap dengan logo sekolah, nama, NISN, kelas, dan barcode QR.
4. Klik tombol biru **Cetak Kartu**.
5. Dialog print browser akan terbuka → pilih ukuran kertas **A4** → cetak pada kertas tebal/karton untuk kemudian dipotong dan dilaminasi.
6. **Jika Kartu Fisik Hilang:** Klik tombol merah kecil **Reset Token** di bawah kartu siswa tersebut agar kode QR kartu yang lama otomatis hangus dan tidak dapat disalahgunakan orang lain, lalu cetak kartu yang baru.

---

### 4.7 Pengaturan Titik GPS Sekolah & Jam Operasional

Buka menu **Pengaturan Sekolah & GPS**:
1. **Nama & Informasi Sekolah:** Atur nama resmi lembaga, alamat lengkap, dan Tahun Pelajaran aktif.
2. **Titik Koordinat Sekolah (Geofencing):**
   - Geser pin penanda pada peta satelit interaktif ke lokasi tepat gedung PKBM Cahaya Mulia, ATAU
   - Jika Anda sedang berada di sekolah dengan laptop/HP, klik tombol **Gunakan Lokasi GPS Saya Saat Ini**.
3. **Radius Toleransi Geofencing:**
   - Atur batas radius presensi *(disarankan **100 meter**)*. Siswa hanya dapat melakukan presensi mandiri jika berada di dalam lingkaran biru tersebut.
4. **Jam Operasional Sekolah:**
   - **Jam Masuk:** Waktu dimulainya absensi pagi *(contoh: `07:30 WIB`)*.
   - **Jam Terlambat:** Batas toleransi keterlambatan *(contoh: `08:00 WIB`)*. Siswa yang absen setelah jam ini otomatis berstatus *Terlambat*.
   - **Jam Pulang:** Waktu diperbolehkannya presensi kepulangan *(contoh: `14:00 WIB`)*.
5. Klik **Simpan Pengaturan Sekolah**.

---

## 5. Panduan untuk Kepala PKBM / Pimpinan

Kepala Sekolah / Ketua PKBM dapat menggunakan sistem ini untuk monitoring kinerja kedisiplinan dan memeriksa validitas berkas sebelum penandatanganan resmi.

### 5.1 Monitoring Kehadiran Real-time
- Buka dashboard menggunakan akun pimpinan/guru piket.
- Pada layar utama langsung terpampang **Ringkasan Real-time Hari Ini**: Berapa siswa yang sudah Hadir, Terlambat, Izin, Sakit, atau Alpa tanpa menunggu laporan manual sore hari.

### 5.2 Verifikasi Laporan & Pengesahan Rekap Bulanan
1. Buka tab **Buku Rekap** pada dashboard guru/piket.
2. Pilih kelas dan bulan yang ingin dievaluasi.
3. Periksa persentase kehadiran bulanan warga belajar pada baris rekapitulasi.
4. Periksa identitas pengesahan di sudut kiri bawah lembar absensi:
   - Pastikan nama dan NIP Anda sudah sesuai.
5. Setelah diverifikasi, Guru Piket atau Tata Usaha dapat mencetak lembar tersebut untuk ditandatangani dan distempel basah atau mengunduh arsip digital Excel-nya.

---

## 6. Tanya Jawab & Pemecahan Masalah (FAQ)

### Q1: Muncul pesan "Gagal mendeteksi lokasi GPS. Pastikan izin lokasi aktif" di HP Siswa?
**Solusi:**
1. Pastikan fitur **GPS / Lokasi** di pengaturan HP Android/iPhone Anda sudah dalam keadaan menyala (ON).
2. Buka pengaturan browser (misal Chrome) → **Setelan Situs (Site Settings)** → **Lokasi (Location)** → ubah status situs presensi menjadi **Izinkan (Allow)**.
3. Refresh halaman presensi.

---

### Q2: Muncul pesan "Anda berada di luar radius PKBM (X meter)" padahal siswa sudah di sekolah?
**Solusi:**
1. Sinyal GPS HP dalam ruangan terkadang mengalami deviasi (akurasi rendah). Ajak siswa keluar ruangan sebentar agar HP mengunci sinyal satelit, lalu refresh halaman.
2. Jika masih di luar jangkauan, siswa dapat melakukan absensi melalui **Scanner Kartu QR Guru Piket** yang bebas dari batasan radius GPS.
3. Administrator juga dapat memperbesar toleransi radius di menu pengaturan sekolah *(misal dari 50 meter menjadi 100–150 meter)*.

---

### Q3: Kamera scanner tidak terbuka di HP / Laptop Guru Piket?
**Solusi:**
1. Browser mewajibkan koneksi **HTTPS** untuk mengaktifkan kamera. Pastikan tautan web beralamat `https://...` (bukan `http://`).
2. Pastikan izin kamera telah diberikan di bilah alamat browser (ikon gembok di sebelah kiri URL → **Izin Kamera → Izinkan**).
3. Jika scanner sedang dipakai di tab lain, tutup tab tersebut terlebih dahulu.

---

### Q4: Siswa tidak memiliki smartphone atau kuota internet habis?
**Solusi:**
Sistem telah dirancang secara *hybrid*. Siswa yang tidak membawa HP cukup membawa **Kartu Fisik Berbarcode QR** yang telah dicetak dan dilaminasi oleh sekolah. Guru Piket di gerbang akan memindai kartu tersebut dan presensi siswa langsung tercatat secara otomatis.

---

### Q5: Apakah data riwayat absensi lama akan hilang saat ganti bulan?
**Solusi:**
**Tidak.** Seluruh riwayat data kehadiran (Hadir, Sakit, Izin, Alpa, Jam Masuk, Jam Pulang, Catatan) tersimpan permanen di database server. Yang dibersihkan secara berkala hanyalah cache file foto demi efisiensi kuota. Anda tetap dapat membuka, mencetak, atau mengekspor rekapitulasi absensi bulan-bulan yang telah lewat kapan saja.

---

## 7. Lampiran Kredensial Akun Demo & Pembersihan Database

Bagi tim evaluator, penguji, atau pengelola yang ingin menguji sistem menggunakan data seeder awal demo (`supabase_seed_demo.sql`), berikut adalah rincian kredensial akun login resmi:

### A. Tabel Kredensial Akun Demo

| No | Peran / Jabatan | Username / Login ID | Email Sistem | Password Default | Keterangan Akun |
|:---:|---|---|---|---|---|
| 1 | **Super Admin Root** | `admin@mail.com` atau `ADM-001` | `admin@mail.com` | **`pkbmadmin`** | Administrator Utama PKBM Cahaya Mulia (Akses Penuh) |
| 2 | **Guru Piket 1** | `guru1@mail.com` atau NIP `198507122010011005` | `guru1@mail.com` | **`pkbmguru1`** | Budi Santoso, S.Pd (Pengampu & Piket Kelas 10, 11, 12) |
| 3 | **Guru Piket 2** | `guru2@mail.com` atau NIP `199003152015022003` | `guru2@mail.com` | **`pkbmguru2`** | Siti Nurhaliza, M.Pd (Pengampu & Piket Kelas 10, 11, 12) |
| 4 | **Siswa Kelas 12** | NISN `1201` s/d `1210` | `[nisn]@mail.com` | **`pkbm[nisn]`** *(contoh: `pkbm1201`)* | 10 Siswa (Demo Utama: `1201` / `pkbm1201` - ADE IZA MUKTI) |
| 5 | **Siswa Kelas 11** | NISN `1101` s/d `1110` | `[nisn]@mail.com` | **`pkbm[nisn]`** *(contoh: `pkbm1101`)* | 10 Siswa (Demo Utama: `1101` / `pkbm1101` - ADITYA RAMADHAN) |
| 6 | **Siswa Kelas 10** | NISN `1001` s/d `1010` | `[nisn]@mail.com` | **`pkbm[nisn]`** *(contoh: `pkbm1001`)* | 10 Siswa (Demo Utama: `1001` / `pkbm1001` - ARIF RAHMAN) |

> ℹ️ **Catatan Login Siswa:**
> Siswa cukup memasukkan **NISN** saja (misal `1201`) dan password `pkbm1201`, tanpa perlu mengetikkan domain email.

---

### B. Prosedur Pembersihan Data Pasca-Demo (`supabase_clean_demo.sql`)

Setelah sesi evaluasi atau demonstrasi selesai dan sistem akan diserahkan untuk penggunaan operasional nyata:
1. Buka **Supabase Dashboard** → masuk ke menu **SQL Editor**.
2. Buka dan jalankan seluruh isi file **`supabase_clean_demo.sql`**.
3. Skrip ini akan secara otomatis:
   - Menghapus seluruh riwayat transaksi presensi dan permohonan izin demo.
   - Menghapus akun 30 siswa demo dan akun 2 guru demo dari `auth.users` dan tabel profil.
   - **Mengosongkan master kelas** (`classes`) agar sekolah dapat menambahkan rombel kelas riil sesuai kebutuhan.
   - **Menyisakan HANYA 1 Akun Super Administrator Root**:
     - **Email:** `admin@mail.com`
     - **Password:** `pkbmadmin`
     - **Nomor Induk:** `ADM-001`
4. Sistem kini berada dalam kondisi bersih (*fresh operational ready*) dan siap digunakan secara langsung oleh sekolah.

---

*Dokumen ini disusun untuk implementasi Sistem Presensi Sekolah Digital PKBM Cahaya Mulia — Program Pengabdian Kepada Masyarakat (PKM) Universitas Pamulang.*

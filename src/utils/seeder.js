// Seeder Data Standar Presensi Sekolah
// 3 Kelas Utama (10-RPL-1, 11-TKJ-1, 12-RPL-1) dengan 30 Siswa per Kelas (Total 90 Siswa)
// 4 Guru Multi Mata Pelajaran & Jadwal Kelas Terstruktur

export const defaultClasses = ['10-RPL-1', '11-TKJ-1', '12-RPL-1']

export const defaultSchoolSettings = {
  nama_sekolah: 'SMK Teknologi Unggulan',
  alamat: 'Jl. Surya Kencana No. 1, Pamulang, Tangerang Selatan',
  latitude: -6.345853,
  longitude: 106.738159,
  radius_meter: 80,
  jam_masuk: '07:00',
  jam_terlambat: '07:15',
  jam_pulang: '15:00'
}

// Koleksi nama-nama siswa Indonesia yang realistis per kelas
const studentNamesRPL12 = [
  'Ahmad Fauzi', 'Bunga Citra Lestari', 'Dimas Aditya', 'Eka Putri Rahayu', 'Fajar Nugraha',
  'Gilang Pratama', 'Hani Fitriani', 'Indra Lesmana', 'Jessica Natalia', 'Kevin Sanjaya',
  'Luthfi Hakim', 'Maya Anggraini', 'Naufal Zaki', 'Olivia Putri', 'Panji Gemilang',
  'Qoriatul Aini', 'Rian Hidayat', 'Salsabila Rahma', 'Teguh Prasetyo', 'Utami Dewi',
  'Vina Panduwinata', 'Wahyu Hidayat', 'Xena Callista', 'Yoga Pratama', 'Zahra Amelia',
  'Andika Pratama', 'Bella Safitri', 'Candra Wijaya', 'Dinda Kirana', 'Erlangga Putra'
]

const studentNamesTKJ11 = [
  'Aditya Ramadhan', 'Bima Sakti', 'Cantika Dewi', 'Doni Kurniawan', 'Elsa Mayori',
  'Fadillah Akbar', 'Gita Gutawa', 'Hafizh Syahrin', 'Intan Permata', 'Joko Susilo',
  'Kartika Sari', 'Lukman Sardi', 'Melati Indah', 'Nanda Pratama', 'Oki Setiana',
  'Putra Mandiri', 'Ratu Felisha', 'Satria Baja', 'Tiara Andini', 'Umar Wirahadi',
  'Vicky Prasetyo', 'Wulan Guritno', 'Yusuf Mansur', 'Zaki Iskandar', 'Alif Ba Ta',
  'Bagas Kaffa', 'Citra Kirana', 'Dicky Chandra', 'Enzy Storia', 'Ferry Irawan'
]

const studentNamesRPL10 = [
  'Arif Rahman', 'Bayu Skak', 'Cindy Gulla', 'Danang Pradana', 'Eva Celia',
  'Farhan Rasyid', 'Grace Natalie', 'Haikal Kamil', 'Isyana Sarasvati', 'Jefri Nichol',
  'Keisha Alvaro', 'Luna Maya', 'Maudy Ayunda', 'Nabila Syakieb', 'Onadio Leonardo',
  'Prilly Latuconsina', 'Raffi Ahmad', 'Sherina Munaf', 'Tulus Rusydi', 'Ussy Sulistiawaty',
  'Vidi Aldiano', 'Widy Soediro', 'Yura Yunita', 'Zaskia Adya', 'Aliando Syarief',
  'Bryan Domani', 'Chelsea Islan', 'Deva Mahenra', 'Febby Rastanty', 'Gading Marten'
]

export function generateStudents() {
  const students = []

  // 1. Kelas 12-RPL-1 (Angkatan 2024, NISN: 20240101 s.d. 20240130)
  studentNamesRPL12.forEach((name, idx) => {
    const num = String(idx + 1).padStart(2, '0')
    const nisn = `202401${num}`
    const username = name.toLowerCase().split(' ')[0]
    students.push({
      id: `std-12rpl1-${num}`,
      email: `${username}.${nisn.slice(-4)}@sekolah.sch.id`,
      nama_lengkap: name,
      nomor_induk: nisn,
      kelas: '12-RPL-1',
      password: 'password123',
      foto_update_count: 0,
      qr_token: `tok_std_12rpl1_${nisn}_sec`,
      foto_profil_url: ''
    })
  })

  // 2. Kelas 11-TKJ-1 (Angkatan 2025, NISN: 20250201 s.d. 20250230)
  studentNamesTKJ11.forEach((name, idx) => {
    const num = String(idx + 1).padStart(2, '0')
    const nisn = `202502${num}`
    const username = name.toLowerCase().split(' ')[0]
    students.push({
      id: `std-11tkj1-${num}`,
      email: `${username}.${nisn.slice(-4)}@sekolah.sch.id`,
      nama_lengkap: name,
      nomor_induk: nisn,
      kelas: '11-TKJ-1',
      password: 'password123',
      foto_update_count: 0,
      qr_token: `tok_std_11tkj1_${nisn}_sec`,
      foto_profil_url: ''
    })
  })

  // 3. Kelas 10-RPL-1 (Angkatan 2026, NISN: 20260301 s.d. 20260330)
  studentNamesRPL10.forEach((name, idx) => {
    const num = String(idx + 1).padStart(2, '0')
    const nisn = `202603${num}`
    const username = name.toLowerCase().split(' ')[0]
    students.push({
      id: `std-10rpl1-${num}`,
      email: `${username}.${nisn.slice(-4)}@sekolah.sch.id`,
      nama_lengkap: name,
      nomor_induk: nisn,
      kelas: '10-RPL-1',
      password: 'password123',
      foto_update_count: 0,
      qr_token: `tok_std_10rpl1_${nisn}_sec`,
      foto_profil_url: ''
    })
  })

  return students
}

export const defaultTeachers = [
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'guru@sekolah.sch.id',
    nama_lengkap: 'Budi Santoso, S.Kom',
    nomor_induk: '198507122010011005',
    password: 'password123',
    foto_update_count: 0,
    mata_pelajaran: 'Pemrograman Web, Basis Data',
    kelas_diajar: ['12-RPL-1', '10-RPL-1'],
    jam_masuk_default: '07:00',
    jam_terlambat_default: '07:15',
    jam_pulang_default: '15:00',
    jadwal_kelas: {
      '12-RPL-1': { jam_masuk: '07:00', jam_terlambat: '07:15', jam_pulang: '11:30', mata_pelajaran: 'Pemrograman Web' },
      '10-RPL-1': { jam_masuk: '10:00', jam_terlambat: '10:15', jam_pulang: '14:30', mata_pelajaran: 'Basis Data' }
    },
    foto_profil_url: ''
  },
  {
    id: 'usr-guru-2',
    email: 'siti.guru@sekolah.sch.id',
    nama_lengkap: 'Siti Nurhaliza, M.Pd',
    nomor_induk: '199003152015022003',
    password: 'password123',
    foto_update_count: 0,
    mata_pelajaran: 'Matematika Terapan, Statistika',
    kelas_diajar: ['10-RPL-1', '11-TKJ-1', '12-RPL-1'],
    jam_masuk_default: '07:00',
    jam_terlambat_default: '07:15',
    jam_pulang_default: '15:00',
    jadwal_kelas: {
      '10-RPL-1': { jam_masuk: '07:00', jam_terlambat: '07:15', jam_pulang: '09:30', mata_pelajaran: 'Matematika Terapan' },
      '11-TKJ-1': { jam_masuk: '09:45', jam_terlambat: '10:00', jam_pulang: '12:00', mata_pelajaran: 'Matematika Terapan' },
      '12-RPL-1': { jam_masuk: '13:00', jam_terlambat: '13:15', jam_pulang: '15:15', mata_pelajaran: 'Statistika' }
    },
    foto_profil_url: ''
  },
  {
    id: 'usr-guru-3',
    email: 'hendra.guru@sekolah.sch.id',
    nama_lengkap: 'Hendra Wijaya, M.T',
    nomor_induk: '198204102009011004',
    password: 'password123',
    foto_update_count: 0,
    mata_pelajaran: 'Jaringan Komputer, Keamanan Siber',
    kelas_diajar: ['11-TKJ-1'],
    jam_masuk_default: '07:30',
    jam_terlambat_default: '07:45',
    jam_pulang_default: '15:00',
    jadwal_kelas: {
      '11-TKJ-1': { jam_masuk: '07:30', jam_terlambat: '07:45', jam_pulang: '15:00', mata_pelajaran: 'Jaringan Komputer' }
    },
    foto_profil_url: ''
  },
  {
    id: 'usr-guru-4',
    email: 'ratna.guru@sekolah.sch.id',
    nama_lengkap: 'Ratna Kusuma, S.Pd',
    nomor_induk: '199208222018022005',
    password: 'password123',
    foto_update_count: 0,
    mata_pelajaran: 'Bahasa Inggris, Komunikasi Bisnis',
    kelas_diajar: ['10-RPL-1', '11-TKJ-1', '12-RPL-1'],
    jam_masuk_default: '07:15',
    jam_terlambat_default: '07:30',
    jam_pulang_default: '14:45',
    jadwal_kelas: {
      '10-RPL-1': { jam_masuk: '07:15', jam_terlambat: '07:30', jam_pulang: '09:30', mata_pelajaran: 'Bahasa Inggris' },
      '11-TKJ-1': { jam_masuk: '10:00', jam_terlambat: '10:15', jam_pulang: '12:00', mata_pelajaran: 'Bahasa Inggris' },
      '12-RPL-1': { jam_masuk: '12:45', jam_terlambat: '13:00', jam_pulang: '14:45', mata_pelajaran: 'Komunikasi Bisnis' }
    },
    foto_profil_url: ''
  }
]

export function generateTodayAttendances(studentsList) {
  const todayStr = new Date().toISOString().split('T')[0]
  const list = []

  // Presensi realistik untuk kelas 12-RPL-1
  const rpl12Students = studentsList.filter(s => s.kelas === '12-RPL-1')
  rpl12Students.forEach((std, i) => {
    // 20 siswa hadir tepat waktu
    if (i < 20) {
      const min = String(40 + (i % 18)).padStart(2, '0')
      const sec = String(10 + (i % 45)).padStart(2, '0')
      list.push({
        id: `att-12rpl1-${std.id}`,
        user_id: std.id,
        nama_lengkap: std.nama_lengkap,
        nomor_induk: std.nomor_induk,
        kelas: std.kelas,
        tanggal: todayStr,
        jam_masuk: `06:${min}:${sec}`,
        jam_pulang: null,
        status: 'hadir',
        metode_presensi: i % 2 === 0 ? 'mandiri_gps' : 'qr_guru',
        jarak_masuk_meter: i % 2 === 0 ? parseFloat((15 + (i * 2.1)).toFixed(1)) : 0,
        foto_masuk_url: null
      })
    }
    // 4 siswa terlambat
    else if (i < 24) {
      const min = String(16 + (i - 20) * 3).padStart(2, '0')
      const sec = String(20 + i).padStart(2, '0')
      list.push({
        id: `att-12rpl1-${std.id}`,
        user_id: std.id,
        nama_lengkap: std.nama_lengkap,
        nomor_induk: std.nomor_induk,
        kelas: std.kelas,
        tanggal: todayStr,
        jam_masuk: `07:${min}:${sec}`,
        jam_pulang: null,
        status: 'terlambat',
        metode_presensi: 'qr_guru',
        jarak_masuk_meter: 0,
        foto_masuk_url: null
      })
    }
    // 2 siswa izin/sakit
    else if (i === 24) {
      list.push({
        id: `att-12rpl1-${std.id}`,
        user_id: std.id,
        nama_lengkap: std.nama_lengkap,
        nomor_induk: std.nomor_induk,
        kelas: std.kelas,
        tanggal: todayStr,
        jam_masuk: null,
        jam_pulang: null,
        status: 'sakit',
        metode_presensi: 'manual_guru',
        jarak_masuk_meter: null,
        foto_masuk_url: null
      })
    } else if (i === 25) {
      list.push({
        id: `att-12rpl1-${std.id}`,
        user_id: std.id,
        nama_lengkap: std.nama_lengkap,
        nomor_induk: std.nomor_induk,
        kelas: std.kelas,
        tanggal: todayStr,
        jam_masuk: null,
        jam_pulang: null,
        status: 'izin',
        metode_presensi: 'manual_guru',
        jarak_masuk_meter: null,
        foto_masuk_url: null
      })
    }
    // sisa 4 siswa belum hadir (alpa)
  })

  // Presensi realistik untuk kelas 11-TKJ-1 (sebagian hadir)
  const tkj11Students = studentsList.filter(s => s.kelas === '11-TKJ-1')
  tkj11Students.slice(0, 18).forEach((std, i) => {
    const min = String(45 + (i % 14)).padStart(2, '0')
    list.push({
      id: `att-11tkj1-${std.id}`,
      user_id: std.id,
      nama_lengkap: std.nama_lengkap,
      nomor_induk: std.nomor_induk,
      kelas: std.kelas,
      tanggal: todayStr,
      jam_masuk: `06:${min}:30`,
      jam_pulang: null,
      status: 'hadir',
      metode_presensi: 'mandiri_gps',
      jarak_masuk_meter: parseFloat((20 + i).toFixed(1)),
      foto_masuk_url: null
    })
  })

  // Presensi realistik untuk kelas 10-RPL-1 (sebagian hadir)
  const rpl10Students = studentsList.filter(s => s.kelas === '10-RPL-1')
  rpl10Students.slice(0, 22).forEach((std, i) => {
    const min = String(42 + (i % 16)).padStart(2, '0')
    list.push({
      id: `att-10rpl1-${std.id}`,
      user_id: std.id,
      nama_lengkap: std.nama_lengkap,
      nomor_induk: std.nomor_induk,
      kelas: std.kelas,
      tanggal: todayStr,
      jam_masuk: `06:${min}:15`,
      jam_pulang: null,
      status: 'hadir',
      metode_presensi: 'qr_guru',
      jarak_masuk_meter: 0,
      foto_masuk_url: null
    })
  })

  return list
}

export function generateLeaveRequests() {
  const todayStr = new Date().toISOString().split('T')[0]
  return [
    {
      id: 'leave-101',
      user_id: 'std-12rpl1-25',
      nama_lengkap: 'Zahra Amelia',
      kelas: '12-RPL-1',
      tanggal_mulai: todayStr,
      tanggal_selesai: todayStr,
      jenis: 'sakit',
      keterangan: 'Demam tinggi dan radang tenggorokan, istirahat di rumah sesuai surat dokter Puskesmas.',
      bukti_surat_url: '',
      status: 'approved'
    },
    {
      id: 'leave-102',
      user_id: 'std-12rpl1-26',
      nama_lengkap: 'Andika Pratama',
      kelas: '12-RPL-1',
      tanggal_mulai: todayStr,
      tanggal_selesai: todayStr,
      jenis: 'izin',
      keterangan: 'Menghadiri acara pernikahan kakak kandung di luar kota.',
      bukti_surat_url: '',
      status: 'approved'
    },
    {
      id: 'leave-103',
      user_id: 'std-11tkj1-05',
      nama_lengkap: 'Elsa Mayori',
      kelas: '11-TKJ-1',
      tanggal_mulai: todayStr,
      tanggal_selesai: todayStr,
      jenis: 'sakit',
      keterangan: 'Sakit flu dan batuk bergejala, surat dokter terlampir.',
      bukti_surat_url: '',
      status: 'pending'
    }
  ]
}

// Data Administrator & Staf Tata Usaha Sekolah Bawaan (Seeder)
export const defaultAdmins = [
  {
    id: 'usr-admin-root',
    email: 'admin@sekolah.sch.id',
    nama_lengkap: 'Administrator Utama (Root)',
    nomor_induk: 'ADM-001',
    role: 'admin',
    jabatan: 'Koordinator IT & Sistem',
    password: 'password123',
    is_root: true, // Akun root tidak dapat dihapus
    foto_profil_url: ''
  },
  {
    id: 'usr-admin-tu',
    email: 'tu.kepegawaian@sekolah.sch.id',
    nama_lengkap: 'Dewi Sartika, S.AP',
    nomor_induk: 'ADM-002',
    role: 'admin',
    jabatan: 'Staf Tata Usaha & Kepegawaian',
    password: 'password123',
    is_root: false,
    foto_profil_url: ''
  }
]

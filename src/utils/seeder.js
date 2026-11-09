// Seeder Data Standar Presensi PKBM Cahaya Mulia
// Kebutuhan: Presensi IN/OUT per hari per kelas
// Format Buku Absensi Siswa: NOMOR | NAMA SISWA | L/P | Tanggal 1 s.d. 31

import { getCurrentAcademicYear } from './academicYear'

export const defaultClasses = ['12', '11', '10']

export const defaultSchoolSettings = {
  nama_sekolah: 'PKBM Cahaya Mulia',
  alamat: 'Jl. Surya Kencana No. 1, Pamulang, Tangerang Selatan',
  latitude: -6.345853,
  longitude: 106.738159,
  radius_meter: 100, // Toleransi GPS 100 meter
  jam_masuk: '07:30',
  jam_terlambat: '08:00',
  jam_pulang: '14:00',
  tahun_pelajaran: getCurrentAcademicYear()
}

// 1. Data Siswa Kelas 12 (Persis sesuai foto lembar absensi manual PKBM Cahaya Mulia)
const rawStudentsKelas12 = [
  { nama: 'ADE IZA MUKTI', jk: 'L' },
  { nama: 'AHMAD SLAMET RIYADI', jk: 'L' },
  { nama: 'CINTA RAYA KHAIRUNNISA', jk: 'P' },
  { nama: 'GADIS ZAMJIROH', jk: 'P' },
  { nama: 'LINA DWIYANTI', jk: 'P' },
  { nama: 'MAHFUD', jk: 'L' },
  { nama: 'MUHAMAD REYHAN .S', jk: 'L' },
  { nama: 'NAJIL HAWARI', jk: 'L' },
  { nama: 'NOVITA SARI', jk: 'P' },
  { nama: 'RIDWAN SAYIDNA AL .B', jk: 'L' },
  { nama: 'TOHIRUN', jk: 'L' },
  { nama: 'WIDIYAWILA SAVITA', jk: 'P' },
  { nama: 'YULIYANA', jk: 'P' }
]

// 2. Data Siswa Kelas 11 (Pelengkap)
const rawStudentsKelas11 = [
  { nama: 'ADITYA RAMADHAN', jk: 'L' },
  { nama: 'BIMA SAKTI', jk: 'L' },
  { nama: 'CANTIKA DEWI', jk: 'P' },
  { nama: 'DONI KURNIAWAN', jk: 'L' },
  { nama: 'ELSA MAYORI', jk: 'P' },
  { nama: 'FADILLAH AKBAR', jk: 'L' },
  { nama: 'GITA GUTAWA', jk: 'P' },
  { nama: 'HAFIZH SYAHRIN', jk: 'L' },
  { nama: 'INTAN PERMATA', jk: 'P' },
  { nama: 'JOKO SUSILO', jk: 'L' }
]

// 3. Data Siswa Kelas 10 (Pelengkap)
const rawStudentsKelas10 = [
  { nama: 'ARIF RAHMAN', jk: 'L' },
  { nama: 'BAYU SKAK', jk: 'L' },
  { nama: 'CINDY GULLA', jk: 'P' },
  { nama: 'DANANG PRADANA', jk: 'L' },
  { nama: 'EVA CELIA', jk: 'P' },
  { nama: 'FARHAN RASYID', jk: 'L' },
  { nama: 'GRACE NATALIE', jk: 'P' },
  { nama: 'HAIKAL KAMIL', jk: 'L' },
  { nama: 'ISYANA SARASVATI', jk: 'P' },
  { nama: 'JEFRI NICHOL', jk: 'L' }
]

export function generateStudents() {
  const students = []

  // Kelas 12
  rawStudentsKelas12.forEach((s, idx) => {
    const num = String(idx + 1).padStart(2, '0')
    const nisn = `202412${num}`
    const username = s.nama.toLowerCase().replace(/[^a-z]/g, '').slice(0, 8)
    students.push({
      id: `std-12-${num}`,
      email: `${username}.${nisn.slice(-4)}@pkbm.sch.id`,
      nama_lengkap: s.nama,
      jenis_kelamin: s.jk,
      nomor_induk: nisn,
      kelas: '12',
      password: 'password123',
      foto_update_count: 0,
      qr_token: `tok_std_12_${nisn}`,
      foto_profil_url: ''
    })
  })

  // Kelas 11
  rawStudentsKelas11.forEach((s, idx) => {
    const num = String(idx + 1).padStart(2, '0')
    const nisn = `202511${num}`
    const username = s.nama.toLowerCase().replace(/[^a-z]/g, '').slice(0, 8)
    students.push({
      id: `std-11-${num}`,
      email: `${username}.${nisn.slice(-4)}@pkbm.sch.id`,
      nama_lengkap: s.nama,
      jenis_kelamin: s.jk,
      nomor_induk: nisn,
      kelas: '11',
      password: 'password123',
      foto_update_count: 0,
      qr_token: `tok_std_11_${nisn}`,
      foto_profil_url: ''
    })
  })

  // Kelas 10
  rawStudentsKelas10.forEach((s, idx) => {
    const num = String(idx + 1).padStart(2, '0')
    const nisn = `202610${num}`
    const username = s.nama.toLowerCase().replace(/[^a-z]/g, '').slice(0, 8)
    students.push({
      id: `std-10-${num}`,
      email: `${username}.${nisn.slice(-4)}@pkbm.sch.id`,
      nama_lengkap: s.nama,
      jenis_kelamin: s.jk,
      nomor_induk: nisn,
      kelas: '10',
      password: 'password123',
      foto_update_count: 0,
      qr_token: `tok_std_10_${nisn}`,
      foto_profil_url: ''
    })
  })

  return students
}

// Data Tutor / Guru PKBM Cahaya Mulia
export const defaultTeachers = [
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'tutor@pkbm.sch.id',
    nama_lengkap: 'Budi Santoso, S.Pd',
    nomor_induk: '198507122010011005',
    password: 'password123',
    role: 'guru',
    kelas_diajar: ['12', '11', '10'],
    jam_masuk_default: '07:30',
    jam_pulang_default: '14:00',
    foto_profil_url: ''
  },
  {
    id: 'usr-tutor-2',
    email: 'siti.tutor@pkbm.sch.id',
    nama_lengkap: 'Siti Nurhaliza, M.Pd',
    nomor_induk: '199003152015022003',
    password: 'password123',
    role: 'guru',
    kelas_diajar: ['12', '11'],
    jam_masuk_default: '07:30',
    jam_pulang_default: '14:00',
    foto_profil_url: ''
  }
]

// Data Administrator PKBM Cahaya Mulia
export const defaultAdmins = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'admin@pkbm.sch.id',
    nama_lengkap: 'Administrator PKBM',
    nomor_induk: 'ADM-001',
    role: 'admin',
    jabatan: 'Pengelola PKBM Cahaya Mulia',
    password: 'password123',
    is_root: true,
    foto_profil_url: ''
  }
]

// Generate presensi harian (IN/OUT) yang realistis untuk bulan berjalan
export function generateTodayAttendances(studentsList) {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() // 0-indexed
  const currentDay = now.getDate()
  const list = []

  // Buat riwayat presensi hari aktif bulan ini (hari kerja Senin-Jumat)
  const maxDay = Math.min(currentDay, 28)

  studentsList.forEach((std, stdIdx) => {
    for (let day = 1; day <= maxDay; day++) {
      const d = new Date(currentYear, currentMonth, day)
      const dayOfWeek = d.getDay()
      if (dayOfWeek === 0 || dayOfWeek === 6) continue // Lewati Sabtu & Minggu

      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const isToday = (day === currentDay)

      // Pola kehadiran realistis
      const seed = (stdIdx * 17 + day * 13) % 100
      let status = 'hadir'
      let jamMasuk = '07:25:00'
      let jamPulang = isToday ? null : '14:05:00'
      let metode = (stdIdx % 3 === 0) ? 'mandiri_gps' : (stdIdx % 3 === 1 ? 'qr_guru' : 'manual_guru')

      if (seed < 85) {
        status = 'hadir'
        const m = String(15 + (seed % 15)).padStart(2, '0')
        jamMasuk = `07:${m}:00`
      } else if (seed < 90) {
        status = 'sakit'
        jamMasuk = null
        jamPulang = null
        metode = 'manual_guru'
      } else if (seed < 95) {
        status = 'izin'
        jamMasuk = null
        jamPulang = null
        metode = 'manual_guru'
      } else {
        status = 'alpa'
        jamMasuk = null
        jamPulang = null
        metode = 'manual_guru'
      }

      list.push({
        id: `att-${std.id}-${dateStr}`,
        user_id: std.id,
        nama_lengkap: std.nama_lengkap,
        jenis_kelamin: std.jenis_kelamin,
        nomor_induk: std.nomor_induk,
        kelas: std.kelas,
        tanggal: dateStr,
        jam_masuk: jamMasuk,
        jam_pulang: jamPulang,
        status: status,
        metode_presensi: metode,
        jarak_masuk_meter: metode === 'mandiri_gps' ? parseFloat((15 + (seed % 30)).toFixed(1)) : 0,
        foto_masuk_url: null,
        dicatat_oleh: metode === 'manual_guru' ? 'Tutor PKBM' : null,
        keterangan: status === 'sakit' ? 'Sakit' : (status === 'izin' ? 'Izin Keperluan Keluarga' : null)
      })
    }
  })

  return list
}

export function generateLeaveRequests() {
  const todayStr = new Date().toISOString().split('T')[0]
  return [
    {
      id: 'leave-101',
      user_id: 'std-12-04',
      nama_lengkap: 'GADIS ZAMJIROH',
      kelas: '12',
      tanggal_mulai: todayStr,
      tanggal_selesai: todayStr,
      jenis: 'sakit',
      keterangan: 'Sakit demam, istirahat di rumah.',
      bukti_surat_url: '',
      status: 'approved'
    }
  ]
}

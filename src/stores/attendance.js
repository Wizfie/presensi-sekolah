import { defineStore } from 'pinia'
import { ref, watch, computed } from 'vue'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import {
  defaultClasses,
  defaultSchoolSettings,
  generateStudents,
  defaultTeachers,
  generateTodayAttendances,
  generateLeaveRequests,
  defaultAdmins
} from '../utils/seeder'

export const useAttendanceStore = defineStore('attendance', () => {
  // Helper normalisasi format kelas (tanpa angka Romawi: X -> 10, XI -> 11, XII -> 12)
  function convertRomanClass(cls) {
    if (!cls || typeof cls !== 'string') return cls
    return cls
      .replace(/^XII[-_\s]/i, '12-')
      .replace(/^XI[-_\s]/i, '11-')
      .replace(/^X[-_\s]/i, '10-')
  }

  // Helper muat data dari localStorage
  function loadStorage(key, fallback) {
    const saved = localStorage.getItem(key)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          let modified = false
          // Kasus 1: Array of strings (seperti presensi_classes)
          if (parsed.length > 0 && typeof parsed[0] === 'string') {
            const normalized = parsed.map(c => {
              const converted = convertRomanClass(c)
              if (converted !== c) modified = true
              return converted
            })
            if (modified) {
              localStorage.setItem(key, JSON.stringify(normalized))
            }
            return normalized
          }

          // Kasus 2: Array of objects (siswa, guru, presensi, izin)
          parsed.forEach(item => {
            if (item) {
              if (item.foto_profil_url && item.foto_profil_url.includes('images.unsplash.com')) {
                item.foto_profil_url = ''
                modified = true
              }
              if (item.kelas && typeof item.kelas === 'string') {
                const converted = convertRomanClass(item.kelas)
                if (converted !== item.kelas) {
                  item.kelas = converted
                  modified = true
                }
              }
              if (item.kelas_diajar && Array.isArray(item.kelas_diajar)) {
                item.kelas_diajar = item.kelas_diajar.map(c => {
                  const converted = convertRomanClass(c)
                  if (converted !== c) modified = true
                  return converted
                })
              }
              if (item.jadwal_kelas && typeof item.jadwal_kelas === 'object') {
                const newJadwal = {}
                for (const k in item.jadwal_kelas) {
                  const newK = convertRomanClass(k)
                  newJadwal[newK] = item.jadwal_kelas[k]
                  if (newK !== k) modified = true
                }
                item.jadwal_kelas = newJadwal
              }
            }
          })
          if (modified) {
            localStorage.setItem(key, JSON.stringify(parsed))
          }
        }
        return parsed
      } catch (e) {
        return fallback
      }
    }
    return fallback
  }

  // 1. DATA AWAL (DEFAULT SEEDING: KELAS 12, 11, 10 PKBM CAHAYA MULIA)
  const defaultStudents = generateStudents()
  const defaultTodayAttendances = generateTodayAttendances(defaultStudents)
  const defaultLeaveRequests = generateLeaveRequests()

  // Auto-migrasi ke data PKBM Cahaya Mulia jika data tersimpan masih versi lama (SMK/Budi Luhur)
  try {
    const storedSettings = localStorage.getItem('presensi_school_settings')
    if (storedSettings && (storedSettings.includes('SMK') || storedSettings.includes('Budi Luhur') || storedSettings.includes('Teknologi Unggulan'))) {
      localStorage.setItem('presensi_school_settings', JSON.stringify(defaultSchoolSettings))
      localStorage.setItem('presensi_students', JSON.stringify(defaultStudents))
      localStorage.setItem('presensi_teachers', JSON.stringify(defaultTeachers))
      localStorage.setItem('presensi_admins', JSON.stringify(defaultAdmins))
      localStorage.setItem('presensi_today_attendances', JSON.stringify(defaultTodayAttendances))
      localStorage.setItem('presensi_classes', JSON.stringify(defaultClasses))
      localStorage.setItem('presensi_leave_requests', JSON.stringify(defaultLeaveRequests))
    }
  } catch (e) {}

  // 2. STATE PERSISTENT DENGAN LOCALSTORAGE
  const schoolSettings = ref(loadStorage('presensi_school_settings', defaultSchoolSettings))
  const rawStudents = ref(loadStorage('presensi_students', defaultStudents))
  const rawTeachers = ref(loadStorage('presensi_teachers', defaultTeachers))
  const rawAdmins = ref(loadStorage('presensi_admins', defaultAdmins))
  const todayAttendances = ref(loadStorage('presensi_today_attendances', defaultTodayAttendances))
  const leaveRequests = ref(loadStorage('presensi_leave_requests', defaultLeaveRequests))
  const classes = ref(loadStorage('presensi_classes', defaultClasses))

  // Soft Delete Filter: Komputasi data aktif & data terhapus (soft deleted)
  const students = computed(() => rawStudents.value.filter(s => !s.is_deleted))
  const deletedStudents = computed(() => rawStudents.value.filter(s => s.is_deleted))
  
  const teachers = computed(() => rawTeachers.value.filter(t => !t.is_deleted))
  const deletedTeachers = computed(() => rawTeachers.value.filter(t => t.is_deleted))

  const admins = computed(() => rawAdmins.value.filter(a => !a.is_deleted))
  const deletedAdmins = computed(() => rawAdmins.value.filter(a => a.is_deleted))

  // Sinkronisasi otomatis ke localStorage setiap ada perubahan (Tab refresh aman!)
  watch(schoolSettings, (val) => {
    localStorage.setItem('presensi_school_settings', JSON.stringify(val))
  }, { deep: true })

  watch(rawStudents, (val) => {
    localStorage.setItem('presensi_students', JSON.stringify(val))
  }, { deep: true })

  watch(rawTeachers, (val) => {
    localStorage.setItem('presensi_teachers', JSON.stringify(val))
  }, { deep: true })

  watch(rawAdmins, (val) => {
    localStorage.setItem('presensi_admins', JSON.stringify(val))
  }, { deep: true })

  watch(todayAttendances, (val) => {
    localStorage.setItem('presensi_today_attendances', JSON.stringify(val))
  }, { deep: true })

  watch(leaveRequests, (val) => {
    localStorage.setItem('presensi_leave_requests', JSON.stringify(val))
  }, { deep: true })

  watch(classes, (val) => {
    localStorage.setItem('presensi_classes', JSON.stringify(val))
  }, { deep: true })

  // Daftar seluruh kelas unik yang terdaftar (gabungan dari master kelas, data siswa, & guru)
  const allClasses = computed(() => {
    const fromStudents = students.value.map(s => s.kelas).filter(Boolean)
    const fromTeachers = teachers.value.flatMap(t => t.kelas_diajar || []).filter(Boolean)
    const set = new Set([...classes.value, ...fromStudents, ...fromTeachers])
    return Array.from(set).sort()
  })

  // Tambah kelas baru secara dinamis
  function addClass(className) {
    if (!className) return { success: false, message: 'Nama kelas tidak boleh kosong' }
    const clean = className.trim().toUpperCase()
    if (!clean) return { success: false, message: 'Nama kelas tidak boleh kosong' }
    if (!classes.value.includes(clean)) {
      classes.value.push(clean)
    }
    return { success: true, className: clean }
  }

  function deleteClass(className) {
    classes.value = classes.value.filter(c => c !== className)
    return { success: true }
  }

  // 3. FUNGSI LOGIKA PRESENSI
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000 // Radius bumi dalam meter
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return Math.round(R * c * 10) / 10
  }

  // Presensi Mandiri Siswa (GPS Ringan - Tanpa Kamera Selfie & Tanpa Mapel)
  async function submitAttendanceGps(user, coords) {
    if (!coords || typeof coords.latitude !== 'number' || typeof coords.longitude !== 'number') {
      return { success: false, message: 'Gagal mendeteksi koordinat GPS. Pastikan izin lokasi aktif.' }
    }

    const distance = calculateDistance(
      schoolSettings.value.latitude,
      schoolSettings.value.longitude,
      coords.latitude,
      coords.longitude
    )

    if (distance > schoolSettings.value.radius_meter) {
      return {
        success: false,
        distance,
        message: `Gagal: Anda berada di luar radius PKBM (${distance} meter). Batas toleransi adalah ${schoolSettings.value.radius_meter} meter.`
      }
    }

    const now = new Date()
    const timeStr = now.toTimeString().split(' ')[0]
    const todayStr = new Date().toISOString().split('T')[0]
    const [h, m] = (schoolSettings.value.jam_terlambat || '08:00').split(':').map(Number)
    const lateThreshold = new Date()
    lateThreshold.setHours(h, m, 0)

    const isLate = now > lateThreshold
    const status = isLate ? 'terlambat' : 'hadir'

    // Cari presensi siswa hari ini
    const existingIndex = todayAttendances.value.findIndex(a => 
      a.user_id === user.id &&
      (a.tanggal === todayStr || (!a.tanggal && todayStr === new Date().toISOString().split('T')[0]))
    )

    if (existingIndex === -1) {
      // Presensi Masuk (IN)
      const newRecord = {
        id: 'att-' + Date.now(),
        user_id: user.id,
        nama_lengkap: user.nama_lengkap,
        jenis_kelamin: user.jenis_kelamin || 'L',
        nomor_induk: user.nomor_induk,
        kelas: user.kelas,
        tanggal: todayStr,
        jam_masuk: timeStr,
        jam_pulang: null,
        status: status,
        metode_presensi: 'mandiri_gps',
        jarak_masuk_meter: distance,
        foto_masuk_url: null,
        keterangan: null
      }
      todayAttendances.value.unshift(newRecord)
      return {
        success: true,
        type: 'masuk',
        status: status,
        jam: timeStr,
        jarak: distance,
        message: `Presensi Masuk berhasil dicatat (${status.toUpperCase()}) pada pukul ${timeStr} WIB!`
      }
    } else {
      // Presensi Pulang (OUT)
      if (todayAttendances.value[existingIndex].jam_pulang) {
        return {
          success: false,
          message: `Anda sudah menyelesaikan presensi masuk (${todayAttendances.value[existingIndex].jam_masuk}) dan pulang (${todayAttendances.value[existingIndex].jam_pulang}) hari ini.`
        }
      }

      todayAttendances.value[existingIndex].jam_pulang = timeStr
      todayAttendances.value[existingIndex].jarak_pulang_meter = distance
      return {
        success: true,
        type: 'pulang',
        status: todayAttendances.value[existingIndex].status,
        jam: timeStr,
        jarak: distance,
        message: `Presensi Pulang berhasil dicatat pada pukul ${timeStr} WIB! Hati-hati di jalan.`
      }
    }
  }

  // Scan Kartu QR oleh Guru/Piket (IGNORE LOCATION - Tanpa Cek GPS)
  async function scanStudentQr(qrToken, teacherUser) {
    const student = students.value.find(s => s.qr_token === qrToken || s.nomor_induk === qrToken)
    if (!student) {
      return { success: false, message: 'QR Code atau NISN tidak terdaftar dalam sistem PKBM Cahaya Mulia.' }
    }

    const now = new Date()
    const timeStr = now.toTimeString().split(' ')[0]
    const todayStr = new Date().toISOString().split('T')[0]

    const existingIndex = todayAttendances.value.findIndex(a => 
      a.user_id === student.id && 
      (a.tanggal === todayStr || (!a.tanggal && todayStr === new Date().toISOString().split('T')[0]))
    )

    if (existingIndex === -1) {
      // Presensi Masuk (IN)
      const [h, m] = (schoolSettings.value.jam_terlambat || '08:00').split(':').map(Number)
      const lateThreshold = new Date()
      lateThreshold.setHours(h, m, 0)
      const status = now > lateThreshold ? 'terlambat' : 'hadir'

      const record = {
        id: 'att-' + Date.now(),
        user_id: student.id,
        nama_lengkap: student.nama_lengkap,
        jenis_kelamin: student.jenis_kelamin || 'L',
        nomor_induk: student.nomor_induk,
        kelas: student.kelas,
        tanggal: todayStr,
        jam_masuk: timeStr,
        jam_pulang: null,
        status: status,
        metode_presensi: 'qr_guru',
        dicatat_oleh: teacherUser?.nama_lengkap || 'Tutor PKBM',
        jarak_masuk_meter: 0,
        foto_masuk_url: null,
        keterangan: null
      }
      todayAttendances.value.unshift(record)
      return {
        success: true,
        type: 'masuk',
        nama: student.nama_lengkap,
        jenis_kelamin: student.jenis_kelamin || 'L',
        nomor_induk: student.nomor_induk,
        kelas: student.kelas,
        status: status,
        jam: timeStr,
        message: `Presensi MASUK - ${student.nama_lengkap} (Kelas ${student.kelas}) berhasil dicatat!`
      }
    } else {
      // Presensi Pulang (OUT)
      if (todayAttendances.value[existingIndex].jam_pulang) {
        return {
          success: true,
          type: 'selesai',
          nama: student.nama_lengkap,
          jenis_kelamin: student.jenis_kelamin || 'L',
          nomor_induk: student.nomor_induk,
          kelas: student.kelas,
          status: todayAttendances.value[existingIndex].status,
          jam: todayAttendances.value[existingIndex].jam_pulang,
          message: `${student.nama_lengkap} sudah menyelesaikan presensi Masuk (${todayAttendances.value[existingIndex].jam_masuk}) dan Pulang (${todayAttendances.value[existingIndex].jam_pulang}).`
        }
      }

      todayAttendances.value[existingIndex].jam_pulang = timeStr
      todayAttendances.value[existingIndex].dicatat_oleh = teacherUser?.nama_lengkap || 'Tutor PKBM'
      return {
        success: true,
        type: 'pulang',
        nama: student.nama_lengkap,
        jenis_kelamin: student.jenis_kelamin || 'L',
        nomor_induk: student.nomor_induk,
        kelas: student.kelas,
        status: todayAttendances.value[existingIndex].status,
        jam: timeStr,
        message: `Presensi PULANG - ${student.nama_lengkap} (Kelas ${student.kelas}) berhasil dicatat!`
      }
    }
  }

  // Update Manual Presensi Siswa oleh Guru/Tutor (IGNORE LOCATION - Tanpa Cek GPS)
  function setManualAttendance(student, newStatus, teacherUser, customJamMasuk = null, customJamPulang = null, targetDate = null, keterangan = null) {
    const chosenDate = targetDate || new Date().toISOString().split('T')[0]
    const effectiveTime = customJamMasuk || new Date().toTimeString().split(' ')[0].substring(0, 5)

    const existingIndex = todayAttendances.value.findIndex(a => 
      a.user_id === student.id && 
      (a.tanggal === chosenDate || (!a.tanggal && chosenDate === new Date().toISOString().split('T')[0]))
    )

    if (existingIndex > -1) {
      todayAttendances.value[existingIndex].status = newStatus
      todayAttendances.value[existingIndex].metode_presensi = 'manual_guru'
      todayAttendances.value[existingIndex].dicatat_oleh = teacherUser?.nama_lengkap || 'Tutor'
      todayAttendances.value[existingIndex].tanggal = chosenDate
      if (keterangan !== undefined && keterangan !== null) {
        todayAttendances.value[existingIndex].keterangan = keterangan
      }
      
      if (customJamMasuk !== undefined) {
        todayAttendances.value[existingIndex].jam_masuk = customJamMasuk
      } else if (!todayAttendances.value[existingIndex].jam_masuk && (newStatus === 'hadir' || newStatus === 'terlambat')) {
        todayAttendances.value[existingIndex].jam_masuk = effectiveTime
      }

      if (customJamPulang !== undefined) {
        todayAttendances.value[existingIndex].jam_pulang = customJamPulang
      }
    } else {
      todayAttendances.value.unshift({
        id: 'att-' + Date.now(),
        user_id: student.id,
        nama_lengkap: student.nama_lengkap,
        jenis_kelamin: student.jenis_kelamin || 'L',
        nomor_induk: student.nomor_induk,
        kelas: student.kelas,
        jam_masuk: (newStatus === 'hadir' || newStatus === 'terlambat') ? effectiveTime : null,
        jam_pulang: customJamPulang || null,
        tanggal: chosenDate,
        status: newStatus,
        metode_presensi: 'manual_guru',
        dicatat_oleh: teacherUser?.nama_lengkap || 'Tutor',
        jarak_masuk_meter: 0,
        foto_masuk_url: null,
        keterangan: keterangan || null
      })
    }
  }

  // Tandai Semua Siswa Hadir Sekaligus dalam 1 Kelas (Batch IN - IGNORE LOCATION)
  function batchSetAllPresent(className, targetDate, teacherUser) {
    const chosenDate = targetDate || new Date().toISOString().split('T')[0]
    const effectiveTime = new Date().toTimeString().split(' ')[0].substring(0, 5)
    const targetStudents = students.value.filter(s => s.kelas === className)
    let updatedCount = 0

    targetStudents.forEach(student => {
      const idx = todayAttendances.value.findIndex(a => 
        a.user_id === student.id && 
        (a.tanggal === chosenDate || (!a.tanggal && chosenDate === new Date().toISOString().split('T')[0]))
      )

      if (idx === -1) {
        todayAttendances.value.unshift({
          id: 'att-' + Date.now() + '-' + student.id,
          user_id: student.id,
          nama_lengkap: student.nama_lengkap,
          jenis_kelamin: student.jenis_kelamin || 'L',
          nomor_induk: student.nomor_induk,
          kelas: student.kelas,
          jam_masuk: effectiveTime,
          jam_pulang: null,
          tanggal: chosenDate,
          status: 'hadir',
          metode_presensi: 'manual_guru',
          dicatat_oleh: teacherUser?.nama_lengkap || 'Tutor',
          jarak_masuk_meter: 0,
          foto_masuk_url: null,
          keterangan: null
        })
        updatedCount++
      } else if (todayAttendances.value[idx].status === 'alpa' || !todayAttendances.value[idx].jam_masuk) {
        todayAttendances.value[idx].status = 'hadir'
        todayAttendances.value[idx].jam_masuk = effectiveTime
        todayAttendances.value[idx].dicatat_oleh = teacherUser?.nama_lengkap || 'Tutor'
        updatedCount++
      }
    })

    return { success: true, count: updatedCount }
  }

  // 1-Klik Set Jam Pulang Bersama untuk Semua Siswa yang Hadir (Checkout Kolektif)
  function batchSetAllCheckOut(className, targetDate = null, teacherUser = null, customOutTime = null) {
    const chosenDate = targetDate || new Date().toISOString().split('T')[0]
    const effectiveOut = customOutTime || new Date().toTimeString().split(' ')[0].substring(0, 5)
    const targetStudents = students.value.filter(s => s.kelas === className)
    let updatedCount = 0

    targetStudents.forEach(student => {
      const idx = todayAttendances.value.findIndex(a => 
        a.user_id === student.id && 
        (a.tanggal === chosenDate || (!a.tanggal && chosenDate === new Date().toISOString().split('T')[0]))
      )

      if (idx > -1) {
        const rec = todayAttendances.value[idx]
        if (rec.status === 'hadir' || rec.status === 'terlambat') {
          if (!rec.jam_pulang) {
            rec.jam_pulang = effectiveOut
            if (teacherUser?.nama_lengkap) {
              rec.dicatat_oleh = teacherUser.nama_lengkap
            }
            updatedCount++
          }
        }
      }
    })

    return { success: true, count: updatedCount }
  }

  // Rekapitulasi Matriks Bulanan (Tanggal 1 s.d. 31) persis Format Gambar Manual
  function getMonthlyAttendanceMatrix(className, month, year) {
    // month: 1 - 12, year: misal 2026
    const daysInMonth = new Date(year, month, 0).getDate()
    const classStudents = students.value.filter(s => s.kelas === className)

    return classStudents.map((std, idx) => {
      const days = {}
      let totalH = 0
      let totalS = 0
      let totalI = 0
      let totalA = 0

      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        const record = todayAttendances.value.find(a => 
          a.user_id === std.id && a.tanggal === dateStr
        )

        if (record) {
          const st = record.status
          if (st === 'hadir' || st === 'terlambat') {
            days[day] = { symbol: 'H', status: st, jam_masuk: record.jam_masuk, jam_pulang: record.jam_pulang }
            totalH++
          } else if (st === 'sakit') {
            days[day] = { symbol: 'S', status: st, jam_masuk: null, jam_pulang: null }
            totalS++
          } else if (st === 'izin') {
            days[day] = { symbol: 'I', status: st, jam_masuk: null, jam_pulang: null }
            totalI++
          } else if (st === 'alpa') {
            days[day] = { symbol: 'A', status: st, jam_masuk: null, jam_pulang: null }
            totalA++
          } else {
            days[day] = { symbol: '', status: '', jam_masuk: null, jam_pulang: null }
          }
        } else {
          days[day] = { symbol: '', status: '', jam_masuk: null, jam_pulang: null }
        }
      }

      const totalActiveDays = totalH + totalS + totalI + totalA
      const persentase = totalActiveDays > 0 ? Math.round((totalH / totalActiveDays) * 100) : 0

      return {
        no: idx + 1,
        student: std,
        days,
        totalH,
        totalS,
        totalI,
        totalA,
        persentase
      }
    })
  }

  // Update Pengaturan Sekolah
  function updateSchoolSettings(newSettings) {
    schoolSettings.value = { ...schoolSettings.value, ...newSettings }
  }

  // Reset Token Siswa
  function resetStudentQrToken(studentId) {
    const student = students.value.find(s => s.id === studentId)
    if (student) {
      student.qr_token = 'tok_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now()
      return { success: true, new_token: student.qr_token }
    }
    return { success: false }
  }

  // CRUD Manajemen Siswa
  async function addStudent(studentData) {
    if (studentData.kelas) {
      addClass(studentData.kelas)
    }

    const newStudent = {
      id: 'usr-siswa-' + Date.now(),
      email: studentData.email || `${studentData.nomor_induk}@sekolah.sch.id`,
      nama_lengkap: studentData.nama_lengkap,
      nomor_induk: studentData.nomor_induk,
      kelas: studentData.kelas || '12',
      password: studentData.password || 'password123',
      foto_update_count: 0,
      qr_token: 'tok_' + studentData.nomor_induk + '_' + Math.random().toString(36).substring(2, 7),
      foto_profil_url: studentData.foto_profil_url || ''
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('profiles').insert([
          {
            nama_lengkap: newStudent.nama_lengkap,
            nomor_induk: newStudent.nomor_induk,
            kelas: newStudent.kelas,
            role: 'siswa',
            qr_token: newStudent.qr_token,
            foto_profil_url: newStudent.foto_profil_url
          }
        ])
        if (error) throw error
      } catch (err) {
        console.error('Supabase add student error:', err)
      }
    }

    rawStudents.value.push(newStudent)
    return { success: true, student: newStudent }
  }

  async function updateStudent(id, studentData) {
    if (studentData.kelas) {
      addClass(studentData.kelas)
    }
    const idx = rawStudents.value.findIndex(s => s.id === id)
    if (idx !== -1) {
      rawStudents.value[idx] = { ...rawStudents.value[idx], ...studentData }
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('profiles').update(studentData).eq('id', id)
        } catch (err) {
          console.error('Supabase update student error:', err)
        }
      }
      return { success: true }
    }
    return { success: false }
  }

  // Soft Delete Siswa
  async function deleteStudent(id) {
    const student = rawStudents.value.find(s => s.id === id)
    if (student) {
      student.is_deleted = true
      student.deleted_at = new Date().toISOString()
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('profiles').update({ is_deleted: true, deleted_at: student.deleted_at }).eq('id', id)
        } catch (err) {
          console.error('Supabase soft delete student error:', err)
        }
      }
      return { success: true }
    }
    return { success: false }
  }

  // Restore Siswa dari Sampah (Soft Delete Recovery)
  function restoreStudent(id) {
    const student = rawStudents.value.find(s => s.id === id)
    if (student) {
      student.is_deleted = false
      student.deleted_at = null
      if (isSupabaseConfigured && supabase) {
        supabase.from('profiles').update({ is_deleted: false, deleted_at: null }).eq('id', id)
      }
      return { success: true }
    }
    return { success: false }
  }

  // Submit Pengajuan Izin Siswa
  async function submitLeaveRequest(data) {
    const newRequest = {
      id: 'leave-' + Date.now(),
      user_id: data.user_id,
      nama_lengkap: data.nama_lengkap,
      kelas: data.kelas,
      tanggal_mulai: data.tanggal_mulai,
      tanggal_selesai: data.tanggal_selesai,
      jenis: data.jenis,
      keterangan: data.keterangan,
      bukti_surat_url: data.bukti_surat_url || null,
      status: 'pending',
      created_at: new Date().toISOString()
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('pengajuan_izin').insert([{
          user_id: data.user_id,
          tanggal_mulai: data.tanggal_mulai,
          tanggal_selesai: data.tanggal_selesai,
          jenis: data.jenis,
          keterangan: data.keterangan,
          bukti_surat_url: data.bukti_surat_url || null,
          status: 'pending'
        }])
        if (error) console.error('Supabase submit permit error:', error)
      } catch (err) {
        console.error('Supabase submit permit exception:', err)
      }
    }

    leaveRequests.value.unshift(newRequest)
    return { success: true, data: newRequest }
  }

  // CRUD Manajemen Guru & Alokasi Kelas
  function addTeacher(teacherData) {
    if (teacherData.kelas_diajar && teacherData.kelas_diajar.length) {
      teacherData.kelas_diajar.forEach(c => addClass(c))
    }

    const newTeacher = {
      id: 'usr-guru-' + Date.now(),
      email: teacherData.email || `guru.${Date.now()}@sekolah.sch.id`,
      nama_lengkap: teacherData.nama_lengkap,
      nomor_induk: teacherData.nomor_induk,
      password: teacherData.password || 'password123',
      foto_update_count: 0,
      mata_pelajaran: teacherData.mata_pelajaran || 'Mata Pelajaran Umum',
      kelas_diajar: teacherData.kelas_diajar?.length ? [...teacherData.kelas_diajar] : ['12'],
      jam_masuk_default: teacherData.jam_masuk_default || '07:00',
      jam_terlambat_default: teacherData.jam_terlambat_default || '07:15',
      jam_pulang_default: teacherData.jam_pulang_default || '15:00',
      jadwal_kelas: teacherData.jadwal_kelas || {},
      foto_profil_url: teacherData.foto_profil_url || '',
      is_deleted: false,
      deleted_at: null
    }
    rawTeachers.value.push(newTeacher)
    return { success: true, teacher: newTeacher }
  }

  function updateTeacher(id, teacherData) {
    if (teacherData.kelas_diajar && teacherData.kelas_diajar.length) {
      teacherData.kelas_diajar.forEach(c => addClass(c))
    }
    const idx = rawTeachers.value.findIndex(t => t.id === id)
    if (idx !== -1) {
      rawTeachers.value[idx] = { ...rawTeachers.value[idx], ...teacherData }
      return { success: true, teacher: rawTeachers.value[idx] }
    }
    return { success: false }
  }

  // Soft Delete Guru
  function deleteTeacher(id) {
    const teacher = rawTeachers.value.find(t => t.id === id)
    if (teacher) {
      teacher.is_deleted = true
      teacher.deleted_at = new Date().toISOString()
      return { success: true }
    }
    return { success: false }
  }

  // Restore Guru dari Sampah
  function restoreTeacher(id) {
    const teacher = rawTeachers.value.find(t => t.id === id)
    if (teacher) {
      teacher.is_deleted = false
      teacher.deleted_at = null
      return { success: true }
    }
    return { success: false }
  }

  function updateTeacherSchedule(teacherId, scheduleData, className = null) {
    const teacher = rawTeachers.value.find(t => t.id === teacherId)
    if (teacher) {
      if (!teacher.jadwal_kelas) teacher.jadwal_kelas = {}
      if (className) {
        teacher.jadwal_kelas[className] = {
          jam_masuk: scheduleData.jam_masuk || scheduleData.jam_masuk_default || teacher.jadwal_kelas[className]?.jam_masuk || teacher.jam_masuk_default || '07:00',
          jam_terlambat: scheduleData.jam_terlambat || scheduleData.jam_terlambat_default || teacher.jadwal_kelas[className]?.jam_terlambat || teacher.jam_terlambat_default || '07:15',
          jam_pulang: scheduleData.jam_pulang || scheduleData.jam_pulang_default || teacher.jadwal_kelas[className]?.jam_pulang || teacher.jam_pulang_default || '15:00',
          mata_pelajaran: scheduleData.mata_pelajaran || teacher.jadwal_kelas[className]?.mata_pelajaran || ''
        }
      }
      if (scheduleData.jam_masuk_default || scheduleData.jam_masuk) {
        teacher.jam_masuk_default = scheduleData.jam_masuk_default || scheduleData.jam_masuk
      }
      if (scheduleData.jam_terlambat_default || scheduleData.jam_terlambat) {
        teacher.jam_terlambat_default = scheduleData.jam_terlambat_default || scheduleData.jam_terlambat
      }
      if (scheduleData.jam_pulang_default || scheduleData.jam_pulang) {
        teacher.jam_pulang_default = scheduleData.jam_pulang_default || scheduleData.jam_pulang
      }
      return { success: true, teacher }
    }
    return { success: false }
  }

  // Reset Kuota Kesempatan Ganti Foto Mandiri (Fitur Khusus Admin)
  function resetStudentPhotoQuota(id) {
    const student = rawStudents.value.find(s => s.id === id)
    if (student) {
      student.foto_update_count = 0
      return { success: true, student }
    }
    return { success: false }
  }

  function resetTeacherPhotoQuota(id) {
    const teacher = rawTeachers.value.find(t => t.id === id)
    if (teacher) {
      teacher.foto_update_count = 0
      return { success: true, teacher }
    }
    return { success: false }
  }

  // Ganti / Reset Password Siswa & Guru oleh Admin
  function setStudentPassword(id, newPassword = 'password123') {
    const student = rawStudents.value.find(s => s.id === id)
    if (student) {
      student.password = newPassword
      return { success: true, student }
    }
    return { success: false }
  }

  function setTeacherPassword(id, newPassword = 'password123') {
    const teacher = rawTeachers.value.find(t => t.id === id)
    if (teacher) {
      teacher.password = newPassword
      return { success: true, teacher }
    }
    return { success: false }
  }

  // ===================== CRUD ADMINISTRATOR & STAF TU =====================
  function addAdmin(adminData) {
    const cleanNip = (adminData.nomor_induk || '').trim()
    const cleanEmail = (adminData.email || '').trim().toLowerCase()

    if (!adminData.nama_lengkap || !adminData.nama_lengkap.trim()) {
      return { success: false, message: 'Nama lengkap Administrator wajib diisi!' }
    }
    if (!cleanNip) {
      return { success: false, message: 'Nomor Induk / NIK Administrator wajib diisi!' }
    }
    if (!cleanEmail) {
      return { success: false, message: 'Email Administrator wajib diisi!' }
    }

    if (rawAdmins.value.some(a => !a.is_deleted && a.nomor_induk.toLowerCase() === cleanNip.toLowerCase())) {
      return { success: false, message: 'Nomor Induk / NIK Admin sudah terdaftar!' }
    }
    if (rawAdmins.value.some(a => !a.is_deleted && a.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'Email Admin sudah terdaftar!' }
    }

    const newAdmin = {
      id: `usr-admin-${Date.now()}`,
      nama_lengkap: adminData.nama_lengkap.trim(),
      nomor_induk: cleanNip,
      email: cleanEmail,
      role: 'admin',
      jabatan: (adminData.jabatan || 'Staf Tata Usaha').trim(),
      password: adminData.password || 'password123',
      is_root: false,
      foto_profil_url: '',
      created_at: new Date().toISOString()
    }

    rawAdmins.value.push(newAdmin)
    return { success: true, admin: newAdmin }
  }

  function updateAdmin(id, adminData) {
    const admin = rawAdmins.value.find(a => a.id === id)
    if (!admin) return { success: false, message: 'Data Administrator tidak ditemukan.' }

    const cleanNip = (adminData.nomor_induk || '').trim()
    const cleanEmail = (adminData.email || '').trim().toLowerCase()

    if (rawAdmins.value.some(a => a.id !== id && !a.is_deleted && a.nomor_induk.toLowerCase() === cleanNip.toLowerCase())) {
      return { success: false, message: 'Nomor Induk / NIK Admin sudah digunakan oleh akun lain!' }
    }
    if (rawAdmins.value.some(a => a.id !== id && !a.is_deleted && a.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'Email Admin sudah digunakan oleh akun lain!' }
    }

    admin.nama_lengkap = adminData.nama_lengkap.trim()
    admin.nomor_induk = cleanNip
    admin.email = cleanEmail
    admin.jabatan = (adminData.jabatan || admin.jabatan || 'Staf Tata Usaha').trim()
    if (adminData.password) {
      admin.password = adminData.password
    }
    return { success: true, admin }
  }

  function deleteAdmin(id, currentUserId = null) {
    const admin = rawAdmins.value.find(a => a.id === id)
    if (!admin) return { success: false, message: 'Data Administrator tidak ditemukan.' }
    if (admin.is_root) {
      return { success: false, message: 'Akun Super Admin (Root) dilindungi sistem dan tidak dapat dihapus!' }
    }
    if (currentUserId && (admin.id === currentUserId || admin.nomor_induk === currentUserId || admin.email === currentUserId)) {
      return { success: false, message: 'Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif digunakan!' }
    }

    admin.is_deleted = true
    admin.deleted_at = new Date().toISOString()
    return { success: true }
  }

  function restoreAdmin(id) {
    const admin = rawAdmins.value.find(a => a.id === id)
    if (admin) {
      admin.is_deleted = false
      admin.deleted_at = null
      return { success: true }
    }
    return { success: false }
  }

  function setAdminPassword(id, newPassword = 'password123') {
    const admin = rawAdmins.value.find(a => a.id === id)
    if (admin) {
      admin.password = newPassword
      return { success: true, admin }
    }
    return { success: false }
  }

  // Reset semua data kembali ke default seeding lengkap (3 kelas @ 30 siswa, 4 guru multi-mapel, 2 admin)
  function resetAllDataToDefault() {
    const studentsSeed = generateStudents()
    const attendancesSeed = generateTodayAttendances(studentsSeed)
    const leaveSeed = generateLeaveRequests()

    schoolSettings.value = { ...defaultSchoolSettings }
    rawStudents.value = [...studentsSeed]
    rawTeachers.value = [...defaultTeachers]
    rawAdmins.value = [...defaultAdmins]
    todayAttendances.value = [...attendancesSeed]
    leaveRequests.value = [...leaveSeed]
    classes.value = [...defaultClasses]

    localStorage.setItem('presensi_school_settings', JSON.stringify(defaultSchoolSettings))
    localStorage.setItem('presensi_students', JSON.stringify(studentsSeed))
    localStorage.setItem('presensi_teachers', JSON.stringify(defaultTeachers))
    localStorage.setItem('presensi_admins', JSON.stringify(defaultAdmins))
    localStorage.setItem('presensi_today_attendances', JSON.stringify(attendancesSeed))
    localStorage.setItem('presensi_leave_requests', JSON.stringify(leaveSeed))
    localStorage.setItem('presensi_classes', JSON.stringify(defaultClasses))
    localStorage.removeItem('presensi_admin_password')
  }

  // Kosongkan semua data untuk pengujian dari kondisi nol / baru (Clean Slate)
  function clearAllDataToCleanSlate() {
    rawStudents.value = []
    rawTeachers.value = []
    // Tetap pertahankan akun Super Admin root agar penguji tidak terkunci
    rawAdmins.value = [defaultAdmins[0]]
    todayAttendances.value = []
    leaveRequests.value = []
    classes.value = []

    localStorage.setItem('presensi_students', JSON.stringify([]))
    localStorage.setItem('presensi_teachers', JSON.stringify([]))
    localStorage.setItem('presensi_admins', JSON.stringify([defaultAdmins[0]]))
    localStorage.setItem('presensi_today_attendances', JSON.stringify([]))
    localStorage.setItem('presensi_leave_requests', JSON.stringify([]))
    localStorage.setItem('presensi_classes', JSON.stringify([]))
    localStorage.removeItem('presensi_admin_password')
  }

  return {
    schoolSettings,
    students,
    teachers,
    admins,
    rawStudents,
    rawTeachers,
    rawAdmins,
    deletedStudents,
    deletedTeachers,
    deletedAdmins,
    restoreStudent,
    restoreTeacher,
    restoreAdmin,
    todayAttendances,
    leaveRequests,
    classes,
    allClasses,
    addClass,
    deleteClass,
    calculateDistance,
    submitAttendanceGps,
    scanStudentQr,
    setManualAttendance,
    batchSetAllPresent,
    batchSetAllCheckOut,
    getMonthlyAttendanceMatrix,
    submitLeaveRequest,
    updateSchoolSettings,
    resetStudentQrToken,
    addStudent,
    updateStudent,
    deleteStudent,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    updateTeacherSchedule,
    resetStudentPhotoQuota,
    resetTeacherPhotoQuota,
    setStudentPassword,
    setTeacherPassword,
    addAdmin,
    updateAdmin,
    deleteAdmin,
    setAdminPassword,
    resetAllDataToDefault,
    clearAllDataToCleanSlate
  }
})

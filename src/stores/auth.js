import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  // Mock users sinkron 1:1 dengan data supabase_seed.sql
  const mockUsers = [
    {
      id: '11111111-1111-1111-1111-111111111111',
      email: 'admin@sekolah.sch.id',
      alias_emails: ['admin@sekolah.sch.id'],
      nama_lengkap: 'Administrator Sistem',
      nomor_induk: 'ADMIN-001',
      role: 'admin',
      kelas: null,
      qr_token: 'tok_admin_root',
      foto_profil_url: ''
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      email: 'guru@sekolah.sch.id',
      alias_emails: ['budi.guru@sekolah.sch.id', 'guru@sekolah.sch.id'],
      nama_lengkap: 'Budi Santoso, S.Kom',
      nomor_induk: '198507122010011005', // NIP
      role: 'guru',
      kelas: '12-RPL-1',
      mata_pelajaran: 'Pemrograman Web & Mobile',
      kelas_diajar: ['12-RPL-1', '12-RPL-2'],
      jam_masuk_default: '07:00',
      jam_terlambat_default: '07:15',
      jam_pulang_default: '15:00',
      qr_token: 'tok_guru_budi_secure',
      foto_profil_url: ''
    },
    {
      id: 'usr-guru-2',
      email: 'siti.guru@sekolah.sch.id',
      alias_emails: ['siti@sekolah.sch.id', 'siti.guru@sekolah.sch.id'],
      nama_lengkap: 'Siti Nurhaliza, M.Pd',
      nomor_induk: '199003152015022003', // NIP
      role: 'guru',
      kelas: '12-TKJ-1',
      mata_pelajaran: 'Basis Data & Jaringan Komputer',
      kelas_diajar: ['12-TKJ-1'],
      jam_masuk_default: '07:30',
      jam_terlambat_default: '07:45',
      jam_pulang_default: '15:30',
      qr_token: 'tok_guru_siti_secure',
      foto_profil_url: ''
    },
    {
      id: '33333333-3333-3333-3333-333333333331',
      email: 'ahmad@sekolah.sch.id',
      alias_emails: ['ahmad.siswa@sekolah.sch.id', 'ahmad@sekolah.sch.id'],
      nama_lengkap: 'Ahmad Fauzi',
      nomor_induk: '20240101', // NISN
      role: 'siswa',
      kelas: '12-RPL-1',
      qr_token: 'tok_ahmad_20240101_secure',
      foto_profil_url: ''
    },
    {
      id: '33333333-3333-3333-3333-333333333332',
      email: 'bunga@sekolah.sch.id',
      alias_emails: ['bunga@sekolah.sch.id'],
      nama_lengkap: 'Bunga Citra Lestari',
      nomor_induk: '20240102',
      role: 'siswa',
      kelas: '12-RPL-1',
      qr_token: 'tok_bunga_20240102_secure',
      foto_profil_url: ''
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      email: 'dimas@sekolah.sch.id',
      alias_emails: ['dimas@sekolah.sch.id'],
      nama_lengkap: 'Dimas Aditya',
      nomor_induk: '20240103',
      role: 'siswa',
      kelas: '12-RPL-1',
      qr_token: 'tok_dimas_20240103_secure',
      foto_profil_url: ''
    },
    {
      id: '33333333-3333-3333-3333-333333333334',
      email: 'eka@sekolah.sch.id',
      alias_emails: ['eka@sekolah.sch.id'],
      nama_lengkap: 'Eka Putri Rahayu',
      nomor_induk: '20240104',
      role: 'siswa',
      kelas: '12-RPL-2',
      qr_token: 'tok_eka_20240104_secure',
      foto_profil_url: ''
    },
    {
      id: '33333333-3333-3333-3333-333333333335',
      email: 'fajar@sekolah.sch.id',
      alias_emails: ['fajar@sekolah.sch.id'],
      nama_lengkap: 'Fajar Nugraha',
      nomor_induk: '20240105',
      role: 'siswa',
      kelas: '12-TKJ-1',
      qr_token: 'tok_fajar_20240105_secure',
      foto_profil_url: ''
    }
  ]

  const savedUser = localStorage.getItem('presensi_user')
  let parsedUser = null
  if (savedUser) {
    try {
      parsedUser = JSON.parse(savedUser)
      let modified = false
      // Bersihkan avatar unsplash lama yang tersimpan di localStorage
      if (parsedUser && parsedUser.foto_profil_url && parsedUser.foto_profil_url.includes('images.unsplash.com')) {
        parsedUser.foto_profil_url = ''
        modified = true
      }
      if (parsedUser && parsedUser.kelas && typeof parsedUser.kelas === 'string') {
        const converted = parsedUser.kelas.replace(/^XII[-_\s]/i, '12-').replace(/^XI[-_\s]/i, '11-').replace(/^X[-_\s]/i, '10-')
        if (converted !== parsedUser.kelas) {
          parsedUser.kelas = converted
          modified = true
        }
      }
      if (parsedUser && parsedUser.kelas_diajar && Array.isArray(parsedUser.kelas_diajar)) {
        parsedUser.kelas_diajar = parsedUser.kelas_diajar.map(c => {
          const converted = c.replace(/^XII[-_\s]/i, '12-').replace(/^XI[-_\s]/i, '11-').replace(/^X[-_\s]/i, '10-')
          if (converted !== c) modified = true
          return converted
        })
      }
      if (modified) {
        localStorage.setItem('presensi_user', JSON.stringify(parsedUser))
      }
    } catch (e) {
      parsedUser = null
    }
  }
  const user = ref(parsedUser || mockUsers[1]) // Default Guru
  const isMockMode = ref(!isSupabaseConfigured)

  async function loginWithMock(role) {
    const selected = mockUsers.find(u => u.role === role) || mockUsers[0]
    user.value = selected
    localStorage.setItem('presensi_user', JSON.stringify(selected))
    return { success: true, user: selected }
  }

  // Fungsi helper pencarian user mock berdasarkan email atau NISN/NIP
  function findMockUser(identifier) {
    if (!identifier) return null
    const clean = identifier.trim().toLowerCase()

    // 1. Cek di daftar administrator yang tersimpan di localStorage
    try {
      const storedAdmins = JSON.parse(localStorage.getItem('presensi_admins') || '[]')
      const a = storedAdmins.find(item => 
        !item.is_deleted && (
          (item.email && item.email.toLowerCase() === clean) ||
          (item.nomor_induk && item.nomor_induk.toLowerCase() === clean)
        )
      )
      if (a) {
        return {
          ...a,
          role: 'admin',
          password: a.password || 'password123'
        }
      }
    } catch (e) {}

    // 2. Cek di daftar siswa yang tersimpan di localStorage
    try {
      const storedStudents = JSON.parse(localStorage.getItem('presensi_students') || '[]')
      const s = storedStudents.find(item => 
        (item.email && item.email.toLowerCase() === clean) ||
        (item.nomor_induk && item.nomor_induk.toLowerCase() === clean)
      )
      if (s) {
        return {
          ...s,
          role: 'siswa',
          password: s.password || 'password123'
        }
      }
    } catch (e) {}

    // 3. Cek di daftar guru yang tersimpan di localStorage
    try {
      const storedTeachers = JSON.parse(localStorage.getItem('presensi_teachers') || '[]')
      const t = storedTeachers.find(item => 
        (item.email && item.email.toLowerCase() === clean) ||
        (item.nomor_induk && item.nomor_induk.toLowerCase() === clean)
      )
      if (t) {
        return {
          ...t,
          role: 'guru',
          password: t.password || 'password123'
        }
      }
    } catch (e) {}

    // 3. Fallback ke daftar mockUsers bawaan
    const mu = mockUsers.find(u => 
      u.email.toLowerCase() === clean ||
      (u.nomor_induk && u.nomor_induk.toLowerCase() === clean) ||
      (u.alias_emails && u.alias_emails.some(a => a.toLowerCase() === clean))
    )
    if (mu) {
      let pwd = mu.password || 'password123'
      if (mu.role === 'admin') {
        pwd = localStorage.getItem('presensi_admin_password') || pwd
      }
      return {
        ...mu,
        password: pwd
      }
    }
    return null
  }

  async function login(identifier, password) {
    const cleanId = (identifier || '').trim()

    // JIKA SUPABASE BELUM DIHUBUNGKAN (MOCK MODE AKTIF)
    if (!isSupabaseConfigured) {
      const matched = findMockUser(cleanId)
      if (matched) {
        const expected = matched.password || 'password123'
        if (password && password !== expected) {
          return {
            success: false,
            message: 'Password yang Anda masukkan salah. Silakan periksa kembali atau minta reset ke Administrator.'
          }
        }
        user.value = matched
        localStorage.setItem('presensi_user', JSON.stringify(matched))
        return { success: true, user: matched }
      }
      return { 
        success: false, 
        message: 'Akun tidak ditemukan. Gunakan email terdaftar (misal: ahmad@sekolah.sch.id, guru@sekolah.sch.id) atau NISN/NIP.' 
      }
    }

    // JIKA SUPABASE SUDAH AKTIF
    try {
      let targetEmail = cleanId

      // Jika user input NISN atau NIP (bukan format email @)
      if (!cleanId.includes('@')) {
        const { data: prof, error: findErr } = await supabase
          .from('profiles')
          .select('email')
          .ilike('nomor_induk', cleanId)
          .maybeSingle()

        if (prof && prof.email) {
          targetEmail = prof.email
        } else {
          // Cek fallback di mock user jika ada
          const localMatch = findMockUser(cleanId)
          if (localMatch) {
            targetEmail = localMatch.email
          } else {
            return { success: false, message: `NISN/NIP "${cleanId}" tidak terdaftar di database.` }
          }
        }
      }

      // Login ke Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: password
      })

      if (error) {
        // Cek jika akun seed dicoba saat DB belum ter-seed
        const localSeed = findMockUser(cleanId)
        if (localSeed) {
          const expected = localSeed.password || 'password123'
          if (password === expected || password === 'password123' || !password) {
            user.value = localSeed
            localStorage.setItem('presensi_user', JSON.stringify(localSeed))
            return { success: true, user: localSeed, isOfflineSeed: true }
          } else {
            return {
              success: false,
              message: 'Password salah. Pastikan password Anda sudah benar.'
            }
          }
        }
        throw error
      }

      // Ambil profile lengkap dari tabel profiles
      const { data: profile, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profError) throw profError

      user.value = profile
      localStorage.setItem('presensi_user', JSON.stringify(profile))
      return { success: true, user: profile }
    } catch (err) {
      // Fallback ramah jika akun seed dicoba tapi error di Supabase
      const localSeed = findMockUser(cleanId)
      if (localSeed) {
        const expected = localSeed.password || 'password123'
        if (password === expected || password === 'password123' || !password) {
          user.value = localSeed
          localStorage.setItem('presensi_user', JSON.stringify(localSeed))
          return { success: true, user: localSeed, isOfflineSeed: true }
        } else {
          return {
            success: false,
            message: 'Password salah. Pastikan password Anda sudah benar atau hubungi Admin.'
          }
        }
      }

      return { 
        success: false, 
        message: err.message || 'Gagal login. Pastikan Email/NISN dan password sudah benar.' 
      }
    }
  }

  async function logout() {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut()
    }
    user.value = null
    localStorage.removeItem('presensi_user')
  }

  function updateUserProfile(newData) {
    if (user.value) {
      user.value = { ...user.value, ...newData }
      localStorage.setItem('presensi_user', JSON.stringify(user.value))
    }
  }

  // Pengguna (Siswa/Guru) Mengatur / Mengubah Password Sendiri
  async function changeUserPassword(newPassword, oldPassword = null) {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'Password baru minimal 6 karakter.' }
    }

    if (oldPassword && user.value?.password && oldPassword !== user.value.password && user.value.password !== 'password123') {
      return { success: false, message: 'Password lama tidak cocok.' }
    }

    // Jika Supabase terhubung
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.updateUser({ password: newPassword })
      } catch (e) {
        console.warn('Supabase updateUser password notice:', e)
      }
    }

    // Update user state aktif
    if (user.value) {
      user.value.password = newPassword
      localStorage.setItem('presensi_user', JSON.stringify(user.value))
    }

    // Sinkronkan ke daftar siswa di localStorage
    try {
      const storedStudents = JSON.parse(localStorage.getItem('presensi_students') || '[]')
      const sIdx = storedStudents.findIndex(s => s.id === user.value?.id || s.nomor_induk === user.value?.nomor_induk)
      if (sIdx !== -1) {
        storedStudents[sIdx].password = newPassword
        localStorage.setItem('presensi_students', JSON.stringify(storedStudents))
      }
    } catch (e) {}

    // Sinkronkan ke daftar guru di localStorage
    try {
      const storedTeachers = JSON.parse(localStorage.getItem('presensi_teachers') || '[]')
      const tIdx = storedTeachers.findIndex(t => t.id === user.value?.id || t.nomor_induk === user.value?.nomor_induk)
      if (tIdx !== -1) {
        storedTeachers[tIdx].password = newPassword
        localStorage.setItem('presensi_teachers', JSON.stringify(storedTeachers))
      }
    } catch (e) {}

    // Sinkronkan ke akun admin jika yang login adalah admin
    if (user.value?.role === 'admin') {
      localStorage.setItem('presensi_admin_password', newPassword)
      try {
        const storedAdmins = JSON.parse(localStorage.getItem('presensi_admins') || '[]')
        const aIdx = storedAdmins.findIndex(a => a.id === user.value?.id || a.nomor_induk === user.value?.nomor_induk || a.email === user.value?.email)
        if (aIdx !== -1) {
          storedAdmins[aIdx].password = newPassword
          localStorage.setItem('presensi_admins', JSON.stringify(storedAdmins))
        }
      } catch (e) {}
    }

    return { success: true, message: 'Password Administrator berhasil diperbarui!' }
  }

  return {
    user,
    isMockMode,
    mockUsers,
    login,
    loginWithMock,
    logout,
    updateUserProfile,
    changeUserPassword
  }
})

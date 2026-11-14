import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useAttendanceStore } from './attendance'

export const useAuthStore = defineStore('auth', () => {
  // Akun mock lokal (hanya aktif apabila env Supabase belum dikonfigurasi untuk preview offline)
  const mockUsers = [
    {
      id: '11111111-1111-1111-1111-111111111111',
      email: 'admin@mail.com',
      alias_emails: ['admin@mail.com', 'admin@pkbm.sch.id', 'admin@sekolah.sch.id'],
      nama_lengkap: 'Administrator PKBM',
      nomor_induk: 'ADM-001',
      role: 'admin',
      kelas: null,
      password: 'pkbmadmin',
      qr_token: 'tok_admin_root',
      foto_profil_url: ''
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      email: 'guru1@mail.com',
      alias_emails: ['guru1@mail.com', 'tutor@pkbm.sch.id', 'guru@sekolah.sch.id'],
      nama_lengkap: 'Budi Santoso, S.Pd',
      nomor_induk: '198507122010011005',
      role: 'guru',
      kelas: '12',
      kelas_diajar: ['10', '11', '12'],
      jam_masuk_default: '07:30',
      jam_pulang_default: '14:00',
      password: 'password123',
      qr_token: 'tok_guru_budi_secure',
      foto_profil_url: ''
    },
    {
      id: '22222222-2222-2222-2222-222222222223',
      email: 'guru2@mail.com',
      alias_emails: ['guru2@mail.com', 'siti.tutor@pkbm.sch.id'],
      nama_lengkap: 'Siti Nurhaliza, M.Pd',
      nomor_induk: '199003152015022003',
      role: 'guru',
      kelas: '11',
      kelas_diajar: ['10', '11', '12'],
      jam_masuk_default: '07:30',
      jam_pulang_default: '14:00',
      password: 'password123',
      qr_token: 'tok_guru_siti_secure',
      foto_profil_url: ''
    },
    {
      id: 'std-12-01',
      email: '1201@mail.com',
      alias_emails: ['1201@mail.com', 'ade@pkbm.sch.id'],
      nama_lengkap: 'ADE IZA MUKTI',
      jenis_kelamin: 'L',
      nomor_induk: '1201',
      role: 'siswa',
      kelas: '12',
      password: 'password123',
      qr_token: 'tok_std_1201',
      foto_profil_url: ''
    }
  ]

  const DEMO_CREDENTIALS = {
    admin: 'admin@mail.com',
    guru: 'guru1@mail.com',
    siswa: '1201'
  }

  const user = ref(null)
  const initialized = ref(false)
  const isMockMode = ref(!isSupabaseConfigured)
  const isDemoEnabled = import.meta.env.VITE_ENABLE_DEMO_LOGIN === 'true'

  let initPromise = null
  let authListenerRegistered = false

  function sanitizeLocalProfile(profile) {
    if (!profile) return null
    const clean = { ...profile }
    if (clean.foto_profil_url && clean.foto_profil_url.includes('images.unsplash.com')) {
      clean.foto_profil_url = ''
    }
    if (clean.kelas && typeof clean.kelas === 'string') {
      clean.kelas = clean.kelas
        .replace(/^XII[-_\s]/i, '12-')
        .replace(/^XI[-_\s]/i, '11-')
        .replace(/^X[-_\s]/i, '10-')
    }
    if (Array.isArray(clean.kelas_diajar)) {
      clean.kelas_diajar = clean.kelas_diajar.map(c =>
        c
          .replace(/^XII[-_\s]/i, '12-')
          .replace(/^XI[-_\s]/i, '11-')
          .replace(/^X[-_\s]/i, '10-')
      )
    }
    return clean
  }

  async function fetchRemoteProfile(userId) {
    if (!supabase || !userId) return null
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error || !data || data.is_deleted) {
      return null
    }
    return data
  }

  async function ensureInitialized() {
    if (initialized.value) return
    if (initPromise) return initPromise

    initPromise = (async () => {
      try {
        if (isSupabaseConfigured && supabase) {
          // Pastikan sisa sesi mock lama di localStorage tidak terbawa ke production
          localStorage.removeItem('presensi_user')

          if (!authListenerRegistered) {
            authListenerRegistered = true
            supabase.auth.onAuthStateChange(async (event, session) => {
              if (event === 'SIGNED_OUT' || !session?.user) {
                user.value = null
                localStorage.removeItem('presensi_user')
                try {
                  useAttendanceStore().resetRemoteState()
                } catch (e) {}
                return
              }

              if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
                const prof = await fetchRemoteProfile(session.user.id)
                if (prof) {
                  user.value = prof
                } else {
                  await supabase.auth.signOut()
                  user.value = null
                }
              }
            })
          }

          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user) {
            const prof = await fetchRemoteProfile(session.user.id)
            if (prof) {
              user.value = prof
            } else {
              await supabase.auth.signOut()
              user.value = null
            }
          } else {
            user.value = null
          }
        } else {
          // Mode lokal offline (env Supabase belum diisi)
          const savedUser = localStorage.getItem('presensi_user')
          if (savedUser) {
            try {
              user.value = sanitizeLocalProfile(JSON.parse(savedUser))
            } catch (e) {
              user.value = null
              localStorage.removeItem('presensi_user')
            }
          } else {
            user.value = null
          }
        }
      } finally {
        initialized.value = true
      }
    })()

    return initPromise
  }

  function mapAuthErrorMessage(err) {
    const raw = (err?.message || '').toLowerCase()
    if (raw.includes('invalid login credentials')) {
      return 'Email/NISN/NIP atau password salah. Silakan periksa kembali.'
    }
    if (raw.includes('banned')) {
      return 'Akun Anda sedang dinonaktifkan oleh Administrator.'
    }
    if (raw.includes('email not confirmed')) {
      return 'Email akun belum terkonfirmasi. Hubungi Administrator.'
    }
    if (raw.includes('too many requests')) {
      return 'Terlalu banyak percobaan login. Silakan tunggu beberapa saat.'
    }
    return err?.message || 'Gagal login. Pastikan Email/NISN dan password sudah benar.'
  }

  // Pencarian user mock offline berdasarkan email atau NISN/NIP
  function findMockUser(identifier) {
    if (!identifier) return null
    const clean = identifier.trim().toLowerCase()

    try {
      const storedAdmins = JSON.parse(localStorage.getItem('presensi_admins') || '[]')
      const a = storedAdmins.find(item =>
        !item.is_deleted && (
          (item.email && item.email.toLowerCase() === clean) ||
          (item.nomor_induk && item.nomor_induk.toLowerCase() === clean)
        )
      )
      if (a) {
        return { ...a, role: 'admin', password: a.password || 'password123' }
      }
    } catch (e) {}

    try {
      const storedStudents = JSON.parse(localStorage.getItem('presensi_students') || '[]')
      const s = storedStudents.find(item =>
        !item.is_deleted && (
          (item.email && item.email.toLowerCase() === clean) ||
          (item.nomor_induk && item.nomor_induk.toLowerCase() === clean)
        )
      )
      if (s) {
        return { ...s, role: 'siswa', password: s.password || 'password123' }
      }
    } catch (e) {}

    try {
      const storedTeachers = JSON.parse(localStorage.getItem('presensi_teachers') || '[]')
      const t = storedTeachers.find(item =>
        !item.is_deleted && (
          (item.email && item.email.toLowerCase() === clean) ||
          (item.nomor_induk && item.nomor_induk.toLowerCase() === clean)
        )
      )
      if (t) {
        return { ...t, role: 'guru', password: t.password || 'password123' }
      }
    } catch (e) {}

    const mu = mockUsers.find(u =>
      u.email.toLowerCase() === clean ||
      (u.nomor_induk && u.nomor_induk.toLowerCase() === clean) ||
      (u.alias_emails && u.alias_emails.some(a => a.toLowerCase() === clean))
    )
    if (mu) {
      let pwd = mu.password || (mu.role === 'admin' ? 'pkbmadmin' : 'password123')
      if (mu.role === 'admin') {
        pwd = localStorage.getItem('presensi_admin_password') || pwd
      }
      return { ...mu, password: pwd }
    }
    return null
  }

  async function login(identifier, password) {
    const cleanId = (identifier || '').trim()
    if (!cleanId) {
      return { success: false, message: 'Email, NISN, atau NIP wajib diisi.' }
    }
    if (!password) {
      return { success: false, message: 'Password wajib diisi.' }
    }

    // MODE OFFLINE LOKAL (Hanya apabila env Supabase belum dikonfigurasi)
    if (!isSupabaseConfigured || !supabase) {
      const matched = findMockUser(cleanId)
      if (!matched) {
        return {
          success: false,
          message: 'Akun tidak ditemukan. Gunakan email terdaftar atau NISN/NIP yang valid.'
        }
      }
      const expected = matched.password || 'password123'
      if (password !== expected) {
        return {
          success: false,
          message: 'Password yang Anda masukkan salah. Silakan periksa kembali atau hubungi Administrator.'
        }
      }
      user.value = matched
      localStorage.setItem('presensi_user', JSON.stringify(matched))
      return { success: true, user: matched }
    }

    // MODE PRODUCTION (SUPABASE AUTH + RLS)
    try {
      let targetEmail = cleanId

      if (!cleanId.includes('@')) {
        const { data: resolvedEmail, error: rpcError } = await supabase.rpc('get_email_by_identifier', {
          p_identifier: cleanId
        })

        if (rpcError) {
          return { success: false, message: 'Gagal memverifikasi NISN/NIP dengan server.' }
        }
        if (!resolvedEmail) {
          return {
            success: false,
            message: `NISN/NIP "${cleanId}" tidak terdaftar atau sedang dinonaktifkan.`
          }
        }
        targetEmail = resolvedEmail
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: targetEmail.toLowerCase(),
        password
      })

      if (error) {
        return { success: false, message: mapAuthErrorMessage(error) }
      }

      const profile = await fetchRemoteProfile(data.user.id)
      if (!profile) {
        await supabase.auth.signOut()
        user.value = null
        return {
          success: false,
          message: 'Profil akun tidak ditemukan atau akun telah dinonaktifkan oleh Administrator.'
        }
      }

      try {
        useAttendanceStore().resetRemoteState()
      } catch (e) {}

      user.value = profile
      localStorage.removeItem('presensi_user')
      return { success: true, user: profile }
    } catch (err) {
      return {
        success: false,
        message: mapAuthErrorMessage(err)
      }
    }
  }

  async function loginWithDemo(role) {
    if (!isDemoEnabled) {
      return { success: false, message: 'Akses demo tidak diaktifkan pada konfigurasi ini.' }
    }
    const targetEmail = DEMO_CREDENTIALS[role]
    if (!targetEmail) {
      return { success: false, message: 'Role demo tidak dikenali.' }
    }
    const pwd = role === 'admin' ? 'pkbmadmin' : 'password123'
    return await login(targetEmail, pwd)
  }

  async function logout() {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut()
      } catch (e) {}
    }
    user.value = null
    localStorage.removeItem('presensi_user')
    try {
      useAttendanceStore().resetRemoteState()
    } catch (e) {}
  }

  function updateUserProfile(newData) {
    if (user.value) {
      user.value = { ...user.value, ...newData }
      if (!isSupabaseConfigured) {
        localStorage.setItem('presensi_user', JSON.stringify(user.value))
      }
    }
  }

  async function changeUserPassword(newPassword, oldPassword = null) {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'Password baru minimal 6 karakter.' }
    }

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) {
        return {
          success: false,
          message: error.message || 'Gagal memperbarui password pada server autentikasi.'
        }
      }
      return { success: true, message: 'Password akun berhasil diperbarui!' }
    }

    if (oldPassword && user.value?.password && oldPassword !== user.value.password && user.value.password !== 'password123') {
      return { success: false, message: 'Password lama tidak cocok.' }
    }

    if (user.value) {
      user.value.password = newPassword
      localStorage.setItem('presensi_user', JSON.stringify(user.value))
    }

    try {
      const storedStudents = JSON.parse(localStorage.getItem('presensi_students') || '[]')
      const sIdx = storedStudents.findIndex(s => s.id === user.value?.id || s.nomor_induk === user.value?.nomor_induk)
      if (sIdx !== -1) {
        storedStudents[sIdx].password = newPassword
        localStorage.setItem('presensi_students', JSON.stringify(storedStudents))
      }
    } catch (e) {}

    try {
      const storedTeachers = JSON.parse(localStorage.getItem('presensi_teachers') || '[]')
      const tIdx = storedTeachers.findIndex(t => t.id === user.value?.id || t.nomor_induk === user.value?.nomor_induk)
      if (tIdx !== -1) {
        storedTeachers[tIdx].password = newPassword
        localStorage.setItem('presensi_teachers', JSON.stringify(storedTeachers))
      }
    } catch (e) {}

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

    return { success: true, message: 'Password akun berhasil diperbarui!' }
  }

  return {
    user,
    initialized,
    isMockMode,
    isDemoEnabled,
    ensureInitialized,
    login,
    loginWithDemo,
    logout,
    updateUserProfile,
    changeUserPassword
  }
})

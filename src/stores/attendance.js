import { defineStore } from 'pinia'
import { ref, watch, computed } from 'vue'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { getCurrentAcademicYear } from '../utils/academicYear'
import {
  getWibDateStr,
  getWibTimeStr,
  normalizeClockInput,
  extractWibTimeHHMMSS,
  buildWibTimestampIso
} from '../utils/dateTime'
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
  const isUuid = (val) =>
    typeof val === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val)

  // Normalisasi format kelas (X -> 10, XI -> 11, XII -> 12)
  function convertRomanClass(cls) {
    if (!cls || typeof cls !== 'string') return cls
    return cls
      .replace(/^XII[-_\s]/i, '12-')
      .replace(/^XI[-_\s]/i, '11-')
      .replace(/^X[-_\s]/i, '10-')
  }

  function loadStorage(key, fallback) {
    const saved = localStorage.getItem(key)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          let modified = false
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

  // Migrasi data lokal lama jika tidak memakai Supabase
  if (!isSupabaseConfigured) {
    try {
      const storedSettings = localStorage.getItem('presensi_school_settings')
      if (
        storedSettings &&
        (storedSettings.includes('SMK') ||
          storedSettings.includes('Budi Luhur') ||
          storedSettings.includes('Teknologi Unggulan'))
      ) {
        const seedStudents = generateStudents()
        localStorage.setItem('presensi_school_settings', JSON.stringify(defaultSchoolSettings))
        localStorage.setItem('presensi_students', JSON.stringify(seedStudents))
        localStorage.setItem('presensi_teachers', JSON.stringify(defaultTeachers))
        localStorage.setItem('presensi_admins', JSON.stringify(defaultAdmins))
        localStorage.setItem('presensi_today_attendances', JSON.stringify(generateTodayAttendances(seedStudents)))
        localStorage.setItem('presensi_classes', JSON.stringify(defaultClasses))
        localStorage.setItem('presensi_leave_requests', JSON.stringify(generateLeaveRequests()))
      }
    } catch (e) {}
  } else {
    // Bersihkan cache dummy lokal saat berjalan pada mode Supabase Production
    const legacyKeys = [
      'presensi_school_settings',
      'presensi_students',
      'presensi_teachers',
      'presensi_admins',
      'presensi_today_attendances',
      'presensi_leave_requests',
      'presensi_classes',
      'presensi_admin_password',
      'presensi_rekap_mengetahui_jabatan',
      'presensi_rekap_mengetahui_nama',
      'presensi_rekap_mengetahui_nip'
    ]
    legacyKeys.forEach(k => {
      try {
        localStorage.removeItem(k)
      } catch (e) {}
    })
  }

  const initialMockStudents = !isSupabaseConfigured ? generateStudents() : []
  const initialSchoolSettings = isSupabaseConfigured
    ? {
        ...defaultSchoolSettings,
        mengetahui_jabatan: 'Kepala PKBM Cahaya Mulia',
        mengetahui_nama: '',
        mengetahui_nip: ''
      }
    : loadStorage('presensi_school_settings', {
        ...defaultSchoolSettings,
        mengetahui_jabatan: 'Kepala PKBM Cahaya Mulia',
        mengetahui_nama: '',
        mengetahui_nip: ''
      })

  const schoolSettings = ref(initialSchoolSettings)
  if (!schoolSettings.value.tahun_pelajaran) {
    schoolSettings.value.tahun_pelajaran = getCurrentAcademicYear()
  }

  // Migrasi otomatis jika masih tersimpan jabatan lama 'Ketua PKBM Cahaya Mulia'
  if (!schoolSettings.value.mengetahui_jabatan || schoolSettings.value.mengetahui_jabatan === 'Ketua PKBM Cahaya Mulia') {
    schoolSettings.value.mengetahui_jabatan = 'Kepala PKBM Cahaya Mulia'
    if (!isSupabaseConfigured) {
      saveStorage('presensi_school_settings', schoolSettings.value)
    }
  }

  const activeAcademicYear = computed(() => {
    return schoolSettings.value?.tahun_pelajaran || getCurrentAcademicYear()
  })

  const rawStudents = ref(isSupabaseConfigured ? [] : loadStorage('presensi_students', initialMockStudents))
  const rawTeachers = ref(isSupabaseConfigured ? [] : loadStorage('presensi_teachers', defaultTeachers))
  const rawAdmins = ref(isSupabaseConfigured ? [] : loadStorage('presensi_admins', defaultAdmins))
  const todayAttendances = ref(
    isSupabaseConfigured
      ? []
      : loadStorage('presensi_today_attendances', generateTodayAttendances(initialMockStudents))
  )
  const leaveRequests = ref(
    isSupabaseConfigured ? [] : loadStorage('presensi_leave_requests', generateLeaveRequests())
  )
  const classes = ref(isSupabaseConfigured ? [] : loadStorage('presensi_classes', defaultClasses))

  const isLoading = ref(false)
  const hasLoaded = ref(!isSupabaseConfigured)
  const loadedForUserId = ref(null)
  const loadedSinceDate = ref(null)
  const loadedMonths = new Set()
  const monthFetchPromises = new Map()
  let fetchPromise = null
  let realtimeChannel = null

  const PRESENSI_SELECT_COLUMNS =
    'id,user_id,tanggal,jam_masuk,jam_pulang,status,metode_presensi,dicatat_oleh,jarak_masuk_meter,jarak_pulang_meter,keterangan,catatan'

  function getRecentWindowStartDate(monthsBack = 2) {
    const todayStr = getWibDateStr()
    const [y, m] = todayStr.split('-').map(Number)
    const d = new Date(y, m - 1 - monthsBack, 1)
    const yy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    return `${yy}-${mm}-01`
  }

  // Simpan lookup seluruh profil (termasuk non-aktif) untuk resolusi nama pada riwayat presensi
  const allProfilesMap = ref(new Map())

  const students = computed(() => rawStudents.value.filter(s => !s.is_deleted))
  const deletedStudents = computed(() => rawStudents.value.filter(s => s.is_deleted))

  const teachers = computed(() => rawTeachers.value.filter(t => !t.is_deleted))
  const deletedTeachers = computed(() => rawTeachers.value.filter(t => t.is_deleted))

  const admins = computed(() => rawAdmins.value.filter(a => !a.is_deleted))
  const deletedAdmins = computed(() => rawAdmins.value.filter(a => a.is_deleted))

  // Sinkronisasi localStorage HANYA saat berjalan tanpa Supabase
  if (!isSupabaseConfigured) {
    watch(schoolSettings, val => localStorage.setItem('presensi_school_settings', JSON.stringify(val)), { deep: true })
    watch(rawStudents, val => localStorage.setItem('presensi_students', JSON.stringify(val)), { deep: true })
    watch(rawTeachers, val => localStorage.setItem('presensi_teachers', JSON.stringify(val)), { deep: true })
    watch(rawAdmins, val => localStorage.setItem('presensi_admins', JSON.stringify(val)), { deep: true })
    watch(todayAttendances, val => localStorage.setItem('presensi_today_attendances', JSON.stringify(val)), { deep: true })
    watch(leaveRequests, val => localStorage.setItem('presensi_leave_requests', JSON.stringify(val)), { deep: true })
    watch(classes, val => localStorage.setItem('presensi_classes', JSON.stringify(val)), { deep: true })
  }

  function mapSettingsRow(row) {
    if (!row) return schoolSettings.value
    return {
      ...defaultSchoolSettings,
      ...row,
      jam_masuk: (row.jam_masuk || '07:30:00').substring(0, 5),
      jam_terlambat: (row.jam_terlambat || '08:00:00').substring(0, 5),
      jam_pulang: (row.jam_pulang || '14:00:00').substring(0, 5),
      mengetahui_jabatan: (row.mengetahui_jabatan === 'Ketua PKBM Cahaya Mulia' ? 'Kepala PKBM Cahaya Mulia' : row.mengetahui_jabatan) ?? 'Kepala PKBM Cahaya Mulia',
      mengetahui_nama: row.mengetahui_nama ?? '',
      mengetahui_nip: row.mengetahui_nip ?? ''
    }
  }

  function indexProfiles(profilesList) {
    const map = new Map()
    rawStudents.value = []
    rawTeachers.value = []
    rawAdmins.value = []

    for (const p of profilesList || []) {
      map.set(p.id, p)
      if (p.role === 'siswa') rawStudents.value.push(p)
      else if (p.role === 'guru') rawTeachers.value.push(p)
      else if (p.role === 'admin') rawAdmins.value.push(p)
    }
    allProfilesMap.value = map
  }

  function upsertProfileInLists(profile) {
    if (!profile?.id) return
    allProfilesMap.value.set(profile.id, profile)

    const targetList =
      profile.role === 'siswa'
        ? rawStudents
        : profile.role === 'guru'
          ? rawTeachers
          : rawAdmins

    const idx = targetList.value.findIndex(item => item.id === profile.id)
    if (idx >= 0) {
      targetList.value[idx] = { ...targetList.value[idx], ...profile }
    } else {
      targetList.value.push(profile)
    }
  }

  function mapPresensiRow(row) {
    if (!row) return null
    const std = allProfilesMap.value.get(row.user_id)
    const recorder = row.dicatat_oleh ? allProfilesMap.value.get(row.dicatat_oleh) : null
    const recorderLabel =
      recorder?.nama_lengkap ||
      (typeof row.dicatat_oleh === 'string' && !isUuid(row.dicatat_oleh) ? row.dicatat_oleh : null)

    return {
      id: row.id,
      user_id: row.user_id,
      nama_lengkap: std?.nama_lengkap || row.nama_lengkap || '-',
      jenis_kelamin: std?.jenis_kelamin || row.jenis_kelamin || 'L',
      nomor_induk: std?.nomor_induk || row.nomor_induk || '',
      kelas: std?.kelas || row.kelas || '',
      tanggal: row.tanggal,
      jam_masuk: extractWibTimeHHMMSS(row.jam_masuk),
      jam_pulang: extractWibTimeHHMMSS(row.jam_pulang),
      status: row.status,
      metode_presensi: row.metode_presensi,
      dicatat_oleh: recorderLabel || (row.metode_presensi === 'manual_guru' ? 'Guru Piket' : null),
      dicatat_oleh_id: isUuid(row.dicatat_oleh) ? row.dicatat_oleh : null,
      jarak_masuk_meter: row.jarak_masuk_meter ?? 0,
      jarak_pulang_meter: row.jarak_pulang_meter ?? null,
      foto_masuk_url: row.foto_masuk_url || null,
      keterangan: row.keterangan || row.catatan || null
    }
  }

  function upsertLocalAttendance(mapped) {
    if (!mapped) return
    const idx = todayAttendances.value.findIndex(
      a =>
        (mapped.id && a.id === mapped.id) ||
        (a.user_id === mapped.user_id && a.tanggal === mapped.tanggal)
    )
    if (idx >= 0) {
      todayAttendances.value[idx] = { ...todayAttendances.value[idx], ...mapped }
    } else {
      todayAttendances.value.unshift(mapped)
    }
  }

  function mapLeaveRow(row) {
    if (!row) return null
    const std = allProfilesMap.value.get(row.user_id)
    return {
      ...row,
      nama_lengkap: std?.nama_lengkap || row.nama_lengkap || '-',
      kelas: std?.kelas || row.kelas || ''
    }
  }

  async function fetchAllAttendanceRows(fromDate = null, toDate = null) {
    const allRows = []
    const pageSize = 1000
    let from = 0

    while (true) {
      let query = supabase
        .from('presensi')
        .select(PRESENSI_SELECT_COLUMNS)
        .order('tanggal', { ascending: false })
        .order('created_at', { ascending: false })

      if (fromDate) query = query.gte('tanggal', fromDate)
      if (toDate) query = query.lte('tanggal', toDate)

      const { data, error } = await query.range(from, from + pageSize - 1)

      if (error) throw error
      if (!data || data.length === 0) break

      allRows.push(...data)
      if (data.length < pageSize) break
      from += pageSize
    }
    return allRows
  }

  async function ensureMonthAttendancesLoaded(year, month) {
    if (!isSupabaseConfigured || !supabase) return
    const y = Number(year)
    const m = Number(month)
    if (!y || !m || m < 1 || m > 12) return

    const mm = String(m).padStart(2, '0')
    const monthKey = `${y}-${mm}`
    const monthStart = `${monthKey}-01`

    if (loadedSinceDate.value && monthStart >= loadedSinceDate.value) return
    if (loadedMonths.has(monthKey)) return
    if (monthFetchPromises.has(monthKey)) return monthFetchPromises.get(monthKey)

    const lastDay = new Date(y, m, 0).getDate()
    const monthEnd = `${monthKey}-${String(lastDay).padStart(2, '0')}`

    const p = (async () => {
      try {
        await ensureDataLoaded()
        if (loadedSinceDate.value && monthStart >= loadedSinceDate.value) return
        if (loadedMonths.has(monthKey)) return

        const rows = await fetchAllAttendanceRows(monthStart, monthEnd)
        for (const row of rows) {
          upsertLocalAttendance(mapPresensiRow(row))
        }
        loadedMonths.add(monthKey)
      } catch (err) {
        console.error('Failed loading month attendance:', monthKey, err)
      } finally {
        monthFetchPromises.delete(monthKey)
      }
    })()

    monthFetchPromises.set(monthKey, p)
    return p
  }

  function setupRealtimeSubscription() {
    if (!isSupabaseConfigured || !supabase || realtimeChannel) return
    try {
      realtimeChannel = supabase
        .channel('presensi-live-sync')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'presensi' },
          payload => {
            if (payload.eventType === 'DELETE' && payload.old?.id) {
              todayAttendances.value = todayAttendances.value.filter(a => a.id !== payload.old.id)
            } else if (payload.new) {
              upsertLocalAttendance(mapPresensiRow(payload.new))
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'pengaturan_sekolah' },
          payload => {
            if (payload.new) {
              schoolSettings.value = mapSettingsRow(payload.new)
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'classes' },
          payload => {
            if (payload.eventType === 'DELETE' && payload.old?.name) {
              classes.value = classes.value.filter(c => c !== payload.old.name)
            } else if (payload.new?.name && !classes.value.includes(payload.new.name)) {
              classes.value.push(payload.new.name)
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'profiles' },
          payload => {
            if (payload.new) {
              upsertProfileInLists(payload.new)
            }
          }
        )
        .subscribe()
    } catch (e) {
      console.warn('Realtime sync notice:', e)
    }
  }

  function resetRemoteState() {
    if (realtimeChannel && supabase) {
      try {
        supabase.removeChannel(realtimeChannel)
      } catch (e) {}
      realtimeChannel = null
    }

    if (isSupabaseConfigured) {
      rawStudents.value = []
      rawTeachers.value = []
      rawAdmins.value = []
      todayAttendances.value = []
      leaveRequests.value = []
      classes.value = []
      allProfilesMap.value = new Map()
      schoolSettings.value = {
        ...defaultSchoolSettings,
        mengetahui_jabatan: 'Kepala PKBM Cahaya Mulia',
        mengetahui_nama: '',
        mengetahui_nip: ''
      }
      hasLoaded.value = false
      loadedForUserId.value = null
      loadedSinceDate.value = null
      loadedMonths.clear()
      monthFetchPromises.clear()
      fetchPromise = null
    }
  }

  async function initializeData(force = false) {
    if (!isSupabaseConfigured || !supabase) {
      hasLoaded.value = true
      return
    }

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      resetRemoteState()
      return
    }

    if (!force && hasLoaded.value && loadedForUserId.value === session.user.id) {
      return
    }
    if (!force && fetchPromise) {
      return fetchPromise
    }

    isLoading.value = true
    fetchPromise = (async () => {
      try {
        const recentStartDate = getRecentWindowStartDate(2)
        const [settingsRes, classesRes, profilesRes, attendanceRows, leavesRes] = await Promise.all([
          supabase.from('pengaturan_sekolah').select('*').order('id').limit(1).maybeSingle(),
          supabase.from('classes').select('name').order('name'),
          supabase.from('profiles').select('*').order('nama_lengkap'),
          fetchAllAttendanceRows(recentStartDate, null),
          supabase.from('pengajuan_izin').select('*').order('created_at', { ascending: false }).limit(200)
        ])

        if (settingsRes.data) {
          schoolSettings.value = mapSettingsRow(settingsRes.data)
        }

        if (classesRes.data) {
          classes.value = classesRes.data.map(c => c.name)
        }

        if (profilesRes.data) {
          indexProfiles(profilesRes.data)
        }

        todayAttendances.value = (attendanceRows || []).map(mapPresensiRow).filter(Boolean)
        loadedSinceDate.value = recentStartDate
        loadedMonths.clear()

        if (leavesRes.data) {
          leaveRequests.value = leavesRes.data.map(mapLeaveRow).filter(Boolean)
        }

        hasLoaded.value = true
        loadedForUserId.value = session.user.id
        setupRealtimeSubscription()
      } catch (err) {
        console.error('Failed loading Supabase data:', err)
      } finally {
        isLoading.value = false
        fetchPromise = null
      }
    })()

    return fetchPromise
  }

  async function ensureDataLoaded() {
    if (!isSupabaseConfigured || !supabase) return
    await initializeData(false)
  }

  // Daftar seluruh kelas unik yang terdaftar (gabungan dari master kelas, siswa, & guru)
  const allClasses = computed(() => {
    const fromStudents = students.value.map(s => s.kelas).filter(Boolean)
    const fromTeachers = teachers.value.flatMap(t => t.kelas_diajar || []).filter(Boolean)
    const set = new Set([...classes.value, ...fromStudents, ...fromTeachers])
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  })

  async function addClass(className) {
    if (!className) return { success: false, message: 'Nama kelas tidak boleh kosong' }
    const clean = className.trim().toUpperCase()
    if (!clean) return { success: false, message: 'Nama kelas tidak boleh kosong' }

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('classes').upsert({ name: clean }, { onConflict: 'name' })
      if (error) {
        return { success: false, message: error.message || 'Gagal menyimpan kelas baru.' }
      }
    }

    if (!classes.value.includes(clean)) {
      classes.value.push(clean)
    }
    return { success: true, className: clean }
  }

  async function deleteClass(className) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('classes').delete().eq('name', className)
      if (error) {
        return { success: false, message: error.message || 'Gagal menghapus kelas.' }
      }
    }
    classes.value = classes.value.filter(c => c !== className)
    return { success: true }
  }

  // Perhitungan jarak Haversine (meter)
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return Math.round(R * c * 10) / 10
  }

  // Presensi Mandiri Siswa (GPS)
  async function submitAttendanceGps(user, coords) {
    if (!coords || typeof coords.latitude !== 'number' || typeof coords.longitude !== 'number') {
      return { success: false, message: 'Gagal mendeteksi koordinat GPS. Pastikan izin lokasi aktif.' }
    }

    if (isSupabaseConfigured && supabase) {
      const { data: res, error } = await supabase.rpc('submit_presensi_gps', {
        p_lat: coords.latitude,
        p_long: coords.longitude,
        p_foto_url: null
      })

      if (error) {
        return { success: false, message: error.message || 'Gagal mencatat presensi ke server.' }
      }
      if (!res?.success) {
        return {
          success: false,
          distance: res?.distance,
          message: res?.message || 'Presensi GPS gagal dicatat.'
        }
      }

      if (res.record) {
        upsertLocalAttendance(mapPresensiRow(res.record))
      }

      return {
        success: true,
        type: res.type,
        status: res.status,
        jam: res.jam,
        jarak: res.jarak,
        message: res.message
      }
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
    const timeStr = getWibTimeStr(now)
    const todayStr = getWibDateStr(now)
    const [h, m] = (schoolSettings.value.jam_terlambat || '08:00').split(':').map(Number)
    const lateThreshold = new Date(now)
    lateThreshold.setHours(h, m, 0, 0)

    const isLate = now > lateThreshold
    const status = isLate ? 'terlambat' : 'hadir'

    const existingIndex = todayAttendances.value.findIndex(
      a => a.user_id === user.id && (a.tanggal === todayStr || !a.tanggal)
    )

    if (existingIndex === -1) {
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
        status,
        metode_presensi: 'mandiri_gps',
        jarak_masuk_meter: distance,
        foto_masuk_url: null,
        keterangan: null
      }
      todayAttendances.value.unshift(newRecord)
      return {
        success: true,
        type: 'masuk',
        status,
        jam: timeStr,
        jarak: distance,
        message: `Presensi Masuk berhasil dicatat (${status.toUpperCase()}) pada pukul ${timeStr} WIB!`
      }
    } else {
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

  // Scan Kartu QR oleh Guru/Piket (Ignore Location)
  async function scanStudentQr(qrToken, teacherUser) {
    const cleanToken = (qrToken || '').trim()
    if (!cleanToken) {
      return { success: false, message: 'QR Code kosong atau tidak terbaca.' }
    }

    if (isSupabaseConfigured && supabase) {
      const { data: res, error } = await supabase.rpc('scan_qr_presensi_siswa', {
        p_qr_token: cleanToken
      })

      if (error) {
        return { success: false, message: error.message || 'Gagal memproses scan QR ke server.' }
      }
      if (!res?.success) {
        return {
          success: false,
          isDoubleScan: res?.isDoubleScan || false,
          message: res?.message || 'QR Code atau NISN tidak terdaftar.'
        }
      }

      if (res.record) {
        upsertLocalAttendance(mapPresensiRow(res.record))
      }
      return res
    }

    const student = students.value.find(s => s.qr_token === cleanToken || s.nomor_induk === cleanToken)
    if (!student) {
      return { success: false, message: 'QR Code atau NISN tidak terdaftar dalam sistem PKBM Cahaya Mulia.' }
    }

    const now = new Date()
    const timeStr = getWibTimeStr(now)
    const todayStr = getWibDateStr(now)

    const existingIndex = todayAttendances.value.findIndex(
      a => a.user_id === student.id && (a.tanggal === todayStr || !a.tanggal)
    )

    if (existingIndex === -1) {
      const [h, m] = (schoolSettings.value.jam_terlambat || '08:00').split(':').map(Number)
      const lateThreshold = new Date(now)
      lateThreshold.setHours(h, m, 0, 0)
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
        status,
        metode_presensi: 'qr_guru',
        dicatat_oleh: teacherUser?.nama_lengkap || 'Guru Piket',
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
        status,
        jam: timeStr,
        message: `Presensi MASUK - ${student.nama_lengkap} (Kelas ${student.kelas}) berhasil dicatat!`
      }
    } else {
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

      // Perlindungan Anti Double-Scan:
      // Cegah jam_pulang tercatat otomatis jika jam_masuk baru saja dicatat kurang dari 2 menit yang lalu
      const jamMasukStr = todayAttendances.value[existingIndex].jam_masuk
      if (jamMasukStr) {
        const [jmH, jmM, jmS] = jamMasukStr.split(':').map(Number)
        const jamMasukTime = new Date(now)
        jamMasukTime.setHours(jmH || 0, jmM || 0, jmS || 0, 0)
        const diffSeconds = Math.round((now.getTime() - jamMasukTime.getTime()) / 1000)

        // Jika selisih waktu antara jam masuk dan sekarang kurang dari 120 detik (2 menit)
        if (diffSeconds >= 0 && diffSeconds < 120) {
          return {
            success: false,
            isDoubleScan: true,
            nama: student.nama_lengkap,
            kelas: student.kelas,
            nomor_induk: student.nomor_induk,
            jam_masuk: jamMasukStr,
            message: `${student.nama_lengkap} baru saja presensi Masuk (${jamMasukStr}). Presensi Pulang belum dapat dicatat (jeda minimal 2 menit) untuk mencegah double-scan.`
          }
        }
      }

      todayAttendances.value[existingIndex].jam_pulang = timeStr
      todayAttendances.value[existingIndex].dicatat_oleh = teacherUser?.nama_lengkap || 'Guru Piket'
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

  // Update Manual Presensi Siswa oleh Guru/Piket (Ignore Location)
  async function setManualAttendance(
    student,
    newStatus,
    teacherUser,
    customJamMasuk = undefined,
    customJamPulang = undefined,
    targetDate = null,
    keterangan = undefined
  ) {
    const todayStr = getWibDateStr()
    const chosenDate = targetDate || todayStr
    const effectiveTime = getWibTimeStr()

    const existingIndex = todayAttendances.value.findIndex(
      a => a.user_id === student.id && (a.tanggal === chosenDate || (!a.tanggal && chosenDate === todayStr))
    )
    const existing = existingIndex > -1 ? todayAttendances.value[existingIndex] : null

    let finalJamMasuk = existing?.jam_masuk || null
    if (customJamMasuk !== undefined) {
      finalJamMasuk = customJamMasuk ? normalizeClockInput(customJamMasuk) || customJamMasuk : null
    } else if (!finalJamMasuk && (newStatus === 'hadir' || newStatus === 'terlambat')) {
      finalJamMasuk = effectiveTime
    }

    let finalJamPulang = existing?.jam_pulang || null
    if (customJamPulang !== undefined) {
      finalJamPulang = customJamPulang ? normalizeClockInput(customJamPulang) || customJamPulang : null
    }

    const finalKeterangan = keterangan !== undefined ? keterangan : existing?.keterangan || null
    const recorderName = teacherUser?.nama_lengkap || 'Guru Piket'

    const optimisticRecord = {
      id: existing?.id || 'att-' + Date.now() + '-' + student.id,
      user_id: student.id,
      nama_lengkap: student.nama_lengkap,
      jenis_kelamin: student.jenis_kelamin || 'L',
      nomor_induk: student.nomor_induk,
      kelas: student.kelas,
      jam_masuk: finalJamMasuk,
      jam_pulang: finalJamPulang,
      tanggal: chosenDate,
      status: newStatus,
      metode_presensi: 'manual_guru',
      dicatat_oleh: recorderName,
      dicatat_oleh_id: isUuid(teacherUser?.id) ? teacherUser.id : existing?.dicatat_oleh_id || null,
      jarak_masuk_meter: existing?.jarak_masuk_meter ?? 0,
      foto_masuk_url: existing?.foto_masuk_url || null,
      keterangan: finalKeterangan
    }

    upsertLocalAttendance(optimisticRecord)

    if (isSupabaseConfigured && supabase) {
      const payload = {
        user_id: student.id,
        tanggal: chosenDate,
        status: newStatus,
        metode_presensi: 'manual_guru',
        dicatat_oleh: isUuid(teacherUser?.id) ? teacherUser.id : null,
        jam_masuk: finalJamMasuk ? buildWibTimestampIso(chosenDate, finalJamMasuk) : null,
        jam_pulang: finalJamPulang ? buildWibTimestampIso(chosenDate, finalJamPulang) : null,
        keterangan: finalKeterangan,
        catatan: finalKeterangan
      }

      const { data, error } = await supabase
        .from('presensi')
        .upsert(payload, { onConflict: 'user_id,tanggal' })
        .select('*')
        .single()

      if (error) {
        return { success: false, message: error.message || 'Gagal menyimpan perubahan presensi.' }
      }
      if (data) {
        upsertLocalAttendance(mapPresensiRow(data))
      }
    }

    return { success: true }
  }

  // Tandai Semua Siswa Hadir Sekaligus dalam 1 Kelas
  async function batchSetAllPresent(className, targetDate, teacherUser) {
    const todayStr = getWibDateStr()
    const chosenDate = targetDate || todayStr
    const effectiveTime = getWibTimeStr().substring(0, 5)
    const targetStudents = students.value.filter(s => s.kelas === className)
    const payloads = []
    let updatedCount = 0

    targetStudents.forEach(student => {
      const idx = todayAttendances.value.findIndex(
        a => a.user_id === student.id && (a.tanggal === chosenDate || (!a.tanggal && chosenDate === todayStr))
      )
      const rec = idx > -1 ? todayAttendances.value[idx] : null

      if (!rec || rec.status === 'alpa' || !rec.jam_masuk) {
        const jamMasukVal = extractWibTimeHHMMSS(effectiveTime)
        upsertLocalAttendance({
          id: rec?.id || 'att-' + Date.now() + '-' + student.id,
          user_id: student.id,
          nama_lengkap: student.nama_lengkap,
          jenis_kelamin: student.jenis_kelamin || 'L',
          nomor_induk: student.nomor_induk,
          kelas: student.kelas,
          jam_masuk: jamMasukVal,
          jam_pulang: rec?.jam_pulang || null,
          tanggal: chosenDate,
          status: 'hadir',
          metode_presensi: 'manual_guru',
          dicatat_oleh: teacherUser?.nama_lengkap || 'Guru Piket',
          dicatat_oleh_id: isUuid(teacherUser?.id) ? teacherUser.id : null,
          jarak_masuk_meter: 0,
          foto_masuk_url: null,
          keterangan: rec?.keterangan || null
        })

        payloads.push({
          user_id: student.id,
          tanggal: chosenDate,
          status: 'hadir',
          metode_presensi: 'manual_guru',
          dicatat_oleh: isUuid(teacherUser?.id) ? teacherUser.id : null,
          jam_masuk: buildWibTimestampIso(chosenDate, jamMasukVal),
          jam_pulang: rec?.jam_pulang ? buildWibTimestampIso(chosenDate, rec.jam_pulang) : null,
          keterangan: rec?.keterangan || null,
          catatan: rec?.keterangan || null
        })
        updatedCount++
      }
    })

    if (isSupabaseConfigured && supabase && payloads.length > 0) {
      const { data, error } = await supabase
        .from('presensi')
        .upsert(payloads, { onConflict: 'user_id,tanggal' })
        .select('*')

      if (error) {
        return { success: false, count: 0, message: error.message || 'Gagal menyimpan presensi kolektif.' }
      }
      if (data) {
        data.forEach(row => upsertLocalAttendance(mapPresensiRow(row)))
      }
    }

    return { success: true, count: updatedCount }
  }

  // 1-Klik Set Jam Pulang Bersama untuk Semua Siswa yang Hadir
  async function batchSetAllCheckOut(className, targetDate = null, teacherUser = null, customOutTime = null) {
    const todayStr = getWibDateStr()
    const chosenDate = targetDate || todayStr
    const effectiveOut = extractWibTimeHHMMSS(customOutTime || getWibTimeStr().substring(0, 5))
    const targetStudents = students.value.filter(s => s.kelas === className)
    const payloads = []
    let updatedCount = 0

    targetStudents.forEach(student => {
      const idx = todayAttendances.value.findIndex(
        a => a.user_id === student.id && (a.tanggal === chosenDate || (!a.tanggal && chosenDate === todayStr))
      )

      if (idx > -1) {
        const rec = todayAttendances.value[idx]
        if ((rec.status === 'hadir' || rec.status === 'terlambat') && !rec.jam_pulang) {
          rec.jam_pulang = effectiveOut
          if (teacherUser?.nama_lengkap) {
            rec.dicatat_oleh = teacherUser.nama_lengkap
          }

          payloads.push({
            user_id: student.id,
            tanggal: chosenDate,
            status: rec.status,
            metode_presensi: rec.metode_presensi || 'manual_guru',
            dicatat_oleh: isUuid(teacherUser?.id) ? teacherUser.id : rec.dicatat_oleh_id || null,
            jam_masuk: rec.jam_masuk ? buildWibTimestampIso(chosenDate, rec.jam_masuk) : null,
            jam_pulang: buildWibTimestampIso(chosenDate, effectiveOut),
            keterangan: rec.keterangan || null,
            catatan: rec.keterangan || null
          })
          updatedCount++
        }
      }
    })

    if (isSupabaseConfigured && supabase && payloads.length > 0) {
      const { data, error } = await supabase
        .from('presensi')
        .upsert(payloads, { onConflict: 'user_id,tanggal' })
        .select('*')

      if (error) {
        return { success: false, count: 0, message: error.message || 'Gagal menyimpan jam pulang kolektif.' }
      }
      if (data) {
        data.forEach(row => upsertLocalAttendance(mapPresensiRow(row)))
      }
    }

    return { success: true, count: updatedCount }
  }

  // Rekapitulasi Matriks Bulanan (Tanggal 1 s.d. 31)
  function getMonthlyAttendanceMatrix(className, month, year) {
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
        const record = todayAttendances.value.find(
          a => a.user_id === std.id && a.tanggal === dateStr
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

  // Update Pengaturan Sekolah (Admin)
  async function updateSchoolSettings(newSettings) {
    schoolSettings.value = { ...schoolSettings.value, ...newSettings }

    if (isSupabaseConfigured && supabase) {
      const targetId = schoolSettings.value.id || 1
      const { error } = await supabase
        .from('pengaturan_sekolah')
        .update({
          nama_sekolah: schoolSettings.value.nama_sekolah,
          alamat: schoolSettings.value.alamat || '',
          tahun_pelajaran: schoolSettings.value.tahun_pelajaran,
          latitude: Number(schoolSettings.value.latitude),
          longitude: Number(schoolSettings.value.longitude),
          radius_meter: Number(schoolSettings.value.radius_meter),
          jam_masuk: (schoolSettings.value.jam_masuk || '07:30').slice(0, 5) + ':00',
          jam_terlambat: (schoolSettings.value.jam_terlambat || '08:00').slice(0, 5) + ':00',
          jam_pulang: (schoolSettings.value.jam_pulang || '14:00').slice(0, 5) + ':00',
          updated_at: new Date().toISOString()
        })
        .eq('id', targetId)

      if (error) {
        return { success: false, message: error.message || 'Gagal menyimpan pengaturan sekolah.' }
      }
    }

    return { success: true }
  }

  // Simpan Nama & Jabatan Penandatangan "Mengetahui" (Guru Piket & Admin)
  async function updateRekapSignatory(jabatan, nama, nip) {
    schoolSettings.value.mengetahui_jabatan = jabatan
    schoolSettings.value.mengetahui_nama = nama
    schoolSettings.value.mengetahui_nip = nip

    if (isSupabaseConfigured && supabase) {
      const { data: res, error } = await supabase.rpc('update_rekap_signatory', {
        p_jabatan: jabatan || 'Kepala PKBM Cahaya Mulia',
        p_nama: nama || '',
        p_nip: nip || ''
      })
      if (error || !res?.success) {
        return {
          success: false,
          message: error?.message || res?.message || 'Gagal menyimpan penandatangan rekap.'
        }
      }
    }

    return { success: true }
  }

  // Reset Token Kartu Siswa
  async function resetStudentQrToken(studentId) {
    const student = students.value.find(s => s.id === studentId)

    if (isSupabaseConfigured && supabase) {
      const { data: res, error } = await supabase.rpc('reset_siswa_qr_token', {
        p_siswa_id: studentId
      })
      if (error || !res?.success) {
        return { success: false, message: error?.message || res?.message || 'Gagal mereset token QR.' }
      }
      if (student) {
        student.qr_token = res.new_qr_token
      }
      return { success: true, new_token: res.new_qr_token }
    }

    if (student) {
      student.qr_token = 'tok_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now()
      return { success: true, new_token: student.qr_token }
    }
    return { success: false, message: 'Data siswa tidak ditemukan.' }
  }

  // ===================== CRUD SISWA =====================
  async function addStudent(studentData) {
    const cleanName = (studentData.nama_lengkap || '').trim()
    const cleanNisn = (studentData.nomor_induk || '').trim()
    const cleanKelas = (studentData.kelas || '12').trim().toUpperCase()
    const cleanEmail = (
      studentData.email || `${cleanNisn.toLowerCase().replace(/[^a-z0-9]/g, '')}@pkbm.sch.id`
    ).toLowerCase()

    if (!cleanName || !cleanNisn) {
      return { success: false, message: 'Nama lengkap dan NISN wajib diisi.' }
    }

    const defaultStudentPass = `pkbm${cleanNisn}`
    const finalStudentPass = (studentData.password || '').trim() || defaultStudentPass

    if (isSupabaseConfigured && supabase) {
      const { data: res, error } = await supabase.rpc('admin_create_user', {
        p_email: cleanEmail,
        p_password: finalStudentPass,
        p_nama_lengkap: cleanName,
        p_nomor_induk: cleanNisn,
        p_jenis_kelamin: studentData.jenis_kelamin || 'L',
        p_role: 'siswa',
        p_kelas: cleanKelas,
        p_foto_profil_url: ''
      })

      if (error || !res?.success) {
        return {
          success: false,
          message: error?.message || res?.message || 'Gagal menambahkan data siswa.'
        }
      }

      if (res.profile) {
        upsertProfileInLists(res.profile)
      }
      if (cleanKelas && !classes.value.includes(cleanKelas)) {
        classes.value.push(cleanKelas)
      }
      return { success: true, student: res.profile }
    }

    await addClass(cleanKelas)
    const newStudent = {
      id: 'usr-siswa-' + Date.now(),
      email: cleanEmail,
      nama_lengkap: cleanName,
      jenis_kelamin: studentData.jenis_kelamin || 'L',
      nomor_induk: cleanNisn,
      kelas: cleanKelas,
      password: finalStudentPass,
      foto_update_count: 0,
      qr_token: 'tok_' + cleanNisn + '_' + Math.random().toString(36).substring(2, 7),
      foto_profil_url: '',
      is_deleted: false
    }
    rawStudents.value.push(newStudent)
    return { success: true, student: newStudent }
  }

  async function updateStudent(id, studentData) {
    const cleanKelas = studentData.kelas ? studentData.kelas.trim().toUpperCase() : undefined

    if (isSupabaseConfigured && supabase) {
      const { data: res, error } = await supabase.rpc('admin_update_user', {
        p_user_id: id,
        p_email: studentData.email ? studentData.email.trim().toLowerCase() : null,
        p_password: studentData.password && studentData.password.trim() ? studentData.password.trim() : null,
        p_nama_lengkap: studentData.nama_lengkap?.trim() || null,
        p_nomor_induk: studentData.nomor_induk?.trim() || null,
        p_jenis_kelamin: studentData.jenis_kelamin || null,
        p_kelas: cleanKelas || null,
        p_foto_profil_url: '',
        p_foto_update_count: 0
      })

      if (error || !res?.success) {
        return {
          success: false,
          message: error?.message || res?.message || 'Gagal memperbarui data siswa.'
        }
      }

      if (res.profile) {
        upsertProfileInLists(res.profile)
      }
      if (cleanKelas && !classes.value.includes(cleanKelas)) {
        classes.value.push(cleanKelas)
      }
      return { success: true, student: res.profile }
    }

    if (cleanKelas) await addClass(cleanKelas)
    const idx = rawStudents.value.findIndex(s => s.id === id)
    if (idx !== -1) {
      const patch = { ...studentData }
      if (cleanKelas) patch.kelas = cleanKelas
      if (!patch.password) delete patch.password
      rawStudents.value[idx] = { ...rawStudents.value[idx], ...patch }
      return { success: true, student: rawStudents.value[idx] }
    }
    return { success: false, message: 'Data siswa tidak ditemukan.' }
  }

  async function deleteStudent(id) {
    if (isSupabaseConfigured && supabase) {
      const { data: res, error } = await supabase.rpc('admin_set_user_deleted', {
        p_user_id: id,
        p_is_deleted: true
      })
      if (error || !res?.success) {
        return { success: false, message: error?.message || res?.message || 'Gagal menonaktifkan siswa.' }
      }
    }

    const student = rawStudents.value.find(s => s.id === id)
    if (student) {
      student.is_deleted = true
      student.deleted_at = new Date().toISOString()
      return { success: true }
    }
    return { success: false, message: 'Data siswa tidak ditemukan.' }
  }

  async function restoreStudent(id) {
    if (isSupabaseConfigured && supabase) {
      const { data: res, error } = await supabase.rpc('admin_set_user_deleted', {
        p_user_id: id,
        p_is_deleted: false
      })
      if (error || !res?.success) {
        return { success: false, message: error?.message || res?.message || 'Gagal memulihkan siswa.' }
      }
    }

    const student = rawStudents.value.find(s => s.id === id)
    if (student) {
      student.is_deleted = false
      student.deleted_at = null
      return { success: true }
    }
    return { success: false, message: 'Data siswa tidak ditemukan.' }
  }

  // Submit Pengajuan Izin Siswa (Supabase RPC + Mock fallback)
  async function submitLeaveRequest(data) {
    if (isSupabaseConfigured && supabase) {
      const { data: res, error } = await supabase.rpc('submit_pengajuan_izin', {
        p_tanggal: data.tanggal_mulai,
        p_jenis: data.jenis,
        p_keterangan: data.keterangan,
        p_bukti_url: data.bukti_surat_url || null
      })

      if (error || !res?.success) {
        return {
          success: false,
          message: error?.message || res?.message || 'Gagal mengirim pengajuan izin.'
        }
      }

      if (res.leave) {
        const mappedLeave = mapLeaveRow(res.leave)
        leaveRequests.value.unshift(mappedLeave)
      }
      if (res.presensi) {
        upsertLocalAttendance(mapPresensiRow(res.presensi))
      }
      return { success: true, data: res.leave }
    }

    const newRequest = {
      id: 'leave-' + Date.now(),
      user_id: data.user_id,
      nama_lengkap: data.nama_lengkap,
      kelas: data.kelas,
      tanggal_mulai: data.tanggal_mulai,
      tanggal_selesai: data.tanggal_selesai || data.tanggal_mulai,
      jenis: data.jenis,
      keterangan: data.keterangan,
      bukti_surat_url: data.bukti_surat_url || null,
      status: 'approved',
      created_at: new Date().toISOString()
    }
    leaveRequests.value.unshift(newRequest)

    await setManualAttendance(
      {
        id: data.user_id,
        nama_lengkap: data.nama_lengkap,
        kelas: data.kelas,
        nomor_induk: data.nomor_induk || ''
      },
      data.jenis,
      null,
      null,
      null,
      data.tanggal_mulai,
      data.keterangan
    )

    return { success: true, data: newRequest }
  }

  // ===================== CRUD GURU PIKET / TUTOR =====================
  async function addTeacher(teacherData) {
    const cleanName = (teacherData.nama_lengkap || '').trim()
    const cleanNip = (teacherData.nomor_induk || '').trim()
    const cleanEmail = (teacherData.email || `guru.${Date.now()}@pkbm.sch.id`).trim().toLowerCase()
    const kelasDiajar = teacherData.kelas_diajar?.length ? [...teacherData.kelas_diajar] : ['12']
    const defaultTeacherPass = `pkbm${cleanNip}`
    const finalTeacherPass = (teacherData.password || '').trim() || defaultTeacherPass

    if (isSupabaseConfigured && supabase) {
      const { data: res, error } = await supabase.rpc('admin_create_user', {
        p_email: cleanEmail,
        p_password: finalTeacherPass,
        p_nama_lengkap: cleanName,
        p_nomor_induk: cleanNip,
        p_jenis_kelamin: teacherData.jenis_kelamin || 'L',
        p_role: 'guru',
        p_kelas: null,
        p_kelas_diajar: kelasDiajar,
        p_mata_pelajaran: teacherData.mata_pelajaran || 'Guru Piket Harian',
        p_jabatan: 'Guru Piket',
        p_foto_profil_url: ''
      })

      if (error || !res?.success) {
        return {
          success: false,
          message: error?.message || res?.message || 'Gagal menambahkan guru/piket.'
        }
      }

      if (res.profile) {
        upsertProfileInLists(res.profile)
      }
      kelasDiajar.forEach(c => {
        if (c && !classes.value.includes(c)) classes.value.push(c)
      })
      return { success: true, teacher: res.profile }
    }

    for (const c of kelasDiajar) await addClass(c)
    const newTeacher = {
      id: 'usr-guru-' + Date.now(),
      email: cleanEmail,
      nama_lengkap: cleanName,
      nomor_induk: cleanNip,
      password: finalTeacherPass,
      foto_update_count: 0,
      mata_pelajaran: teacherData.mata_pelajaran || 'Guru Piket Harian',
      kelas_diajar: kelasDiajar,
      jam_masuk_default: teacherData.jam_masuk_default || '07:30',
      jam_terlambat_default: teacherData.jam_terlambat_default || '08:00',
      jam_pulang_default: teacherData.jam_pulang_default || '14:00',
      jadwal_kelas: teacherData.jadwal_kelas || {},
      foto_profil_url: '',
      is_deleted: false,
      deleted_at: null
    }
    rawTeachers.value.push(newTeacher)
    return { success: true, teacher: newTeacher }
  }

  async function updateTeacher(id, teacherData) {
    const kelasDiajar = teacherData.kelas_diajar ? [...teacherData.kelas_diajar] : null

    if (isSupabaseConfigured && supabase) {
      const { data: res, error } = await supabase.rpc('admin_update_user', {
        p_user_id: id,
        p_email: teacherData.email ? teacherData.email.trim().toLowerCase() : null,
        p_password: teacherData.password && teacherData.password.trim() ? teacherData.password.trim() : null,
        p_nama_lengkap: teacherData.nama_lengkap?.trim() || null,
        p_nomor_induk: teacherData.nomor_induk?.trim() || null,
        p_jenis_kelamin: teacherData.jenis_kelamin || null,
        p_kelas_diajar: kelasDiajar,
        p_mata_pelajaran: teacherData.mata_pelajaran ?? null,
        p_foto_profil_url: '',
        p_foto_update_count: 0
      })

      if (error || !res?.success) {
        return {
          success: false,
          message: error?.message || res?.message || 'Gagal memperbarui data guru.'
        }
      }

      if (res.profile) {
        upsertProfileInLists(res.profile)
      }
      if (kelasDiajar) {
        kelasDiajar.forEach(c => {
          if (c && !classes.value.includes(c)) classes.value.push(c)
        })
      }
      return { success: true, teacher: res.profile }
    }

    if (kelasDiajar) {
      for (const c of kelasDiajar) await addClass(c)
    }
    const idx = rawTeachers.value.findIndex(t => t.id === id)
    if (idx !== -1) {
      const patch = { ...teacherData }
      if (!patch.password) delete patch.password
      rawTeachers.value[idx] = { ...rawTeachers.value[idx], ...patch }
      return { success: true, teacher: rawTeachers.value[idx] }
    }
    return { success: false, message: 'Data guru tidak ditemukan.' }
  }

  async function deleteTeacher(id) {
    if (isSupabaseConfigured && supabase) {
      const { data: res, error } = await supabase.rpc('admin_set_user_deleted', {
        p_user_id: id,
        p_is_deleted: true
      })
      if (error || !res?.success) {
        return { success: false, message: error?.message || res?.message || 'Gagal menonaktifkan guru.' }
      }
    }

    const teacher = rawTeachers.value.find(t => t.id === id)
    if (teacher) {
      teacher.is_deleted = true
      teacher.deleted_at = new Date().toISOString()
      return { success: true }
    }
    return { success: false, message: 'Data guru tidak ditemukan.' }
  }

  async function restoreTeacher(id) {
    if (isSupabaseConfigured && supabase) {
      const { data: res, error } = await supabase.rpc('admin_set_user_deleted', {
        p_user_id: id,
        p_is_deleted: false
      })
      if (error || !res?.success) {
        return { success: false, message: error?.message || res?.message || 'Gagal memulihkan guru.' }
      }
    }

    const teacher = rawTeachers.value.find(t => t.id === id)
    if (teacher) {
      teacher.is_deleted = false
      teacher.deleted_at = null
      return { success: true }
    }
    return { success: false, message: 'Data guru tidak ditemukan.' }
  }

  async function updateTeacherSchedule(teacherId, scheduleData, className = null) {
    const teacher = rawTeachers.value.find(t => t.id === teacherId)
    if (!teacher) return { success: false }

    if (!teacher.jadwal_kelas) teacher.jadwal_kelas = {}
    if (className) {
      teacher.jadwal_kelas[className] = {
        jam_masuk:
          scheduleData.jam_masuk ||
          scheduleData.jam_masuk_default ||
          teacher.jadwal_kelas[className]?.jam_masuk ||
          teacher.jam_masuk_default ||
          '07:30',
        jam_terlambat:
          scheduleData.jam_terlambat ||
          scheduleData.jam_terlambat_default ||
          teacher.jadwal_kelas[className]?.jam_terlambat ||
          teacher.jam_terlambat_default ||
          '08:00',
        jam_pulang:
          scheduleData.jam_pulang ||
          scheduleData.jam_pulang_default ||
          teacher.jadwal_kelas[className]?.jam_pulang ||
          teacher.jam_pulang_default ||
          '14:00',
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

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('profiles')
        .update({
          jam_masuk_default: teacher.jam_masuk_default,
          jam_terlambat_default: teacher.jam_terlambat_default,
          jam_pulang_default: teacher.jam_pulang_default,
          jadwal_kelas: teacher.jadwal_kelas
        })
        .eq('id', teacherId)
    }

    return { success: true, teacher }
  }

  async function resetStudentPhotoQuota(id) {
    if (isSupabaseConfigured && supabase) {
      const { data: res, error } = await supabase.rpc('admin_update_user', {
        p_user_id: id,
        p_foto_update_count: 0
      })
      if (error || !res?.success) {
        return { success: false, message: error?.message || res?.message || 'Gagal mereset kuota foto.' }
      }
    }

    const student = rawStudents.value.find(s => s.id === id)
    if (student) {
      student.foto_update_count = 0
      return { success: true, student }
    }
    return { success: false }
  }

  async function resetTeacherPhotoQuota(id) {
    if (isSupabaseConfigured && supabase) {
      const { data: res, error } = await supabase.rpc('admin_update_user', {
        p_user_id: id,
        p_foto_update_count: 0
      })
      if (error || !res?.success) {
        return { success: false, message: error?.message || res?.message || 'Gagal mereset kuota foto.' }
      }
    }

    const teacher = rawTeachers.value.find(t => t.id === id)
    if (teacher) {
      teacher.foto_update_count = 0
      return { success: true, teacher }
    }
    return { success: false }
  }

  async function setStudentPassword(id, newPassword = null) {
    const student = rawStudents.value.find(s => s.id === id)
    const effectivePass = (newPassword || '').trim() || (student?.nomor_induk ? `pkbm${student.nomor_induk}` : 'pkbm123456')
    if (isSupabaseConfigured && supabase) {
      const { data: res, error } = await supabase.rpc('admin_reset_user_password', {
        p_user_id: id,
        p_new_password: effectivePass
      })
      if (error || !res?.success) {
        return { success: false, message: error?.message || res?.message }
      }
      return { success: true }
    }
    if (student) {
      student.password = effectivePass
      return { success: true, student }
    }
    return { success: false }
  }

  async function setTeacherPassword(id, newPassword = null) {
    const teacher = rawTeachers.value.find(t => t.id === id)
    const effectivePass = (newPassword || '').trim() || (teacher?.nomor_induk ? `pkbm${teacher.nomor_induk}` : 'pkbm123456')
    if (isSupabaseConfigured && supabase) {
      const { data: res, error } = await supabase.rpc('admin_reset_user_password', {
        p_user_id: id,
        p_new_password: effectivePass
      })
      if (error || !res?.success) {
        return { success: false, message: error?.message || res?.message }
      }
      return { success: true }
    }
    if (teacher) {
      teacher.password = effectivePass
      return { success: true, teacher }
    }
    return { success: false }
  }

  // ===================== CRUD ADMINISTRATOR & STAF TU =====================
  async function addAdmin(adminData) {
    const cleanNip = (adminData.nomor_induk || '').trim()
    const cleanEmail = (adminData.email || '').trim().toLowerCase()
    const cleanName = (adminData.nama_lengkap || '').trim()

    if (!cleanName) return { success: false, message: 'Nama lengkap Administrator wajib diisi!' }
    if (!cleanNip) return { success: false, message: 'Nomor Induk / NIK Administrator wajib diisi!' }
    if (!cleanEmail) return { success: false, message: 'Email Administrator wajib diisi!' }

    const defaultAdminPass = `pkbm${cleanNip}`
    const finalAdminPass = (adminData.password || '').trim() || defaultAdminPass

    if (isSupabaseConfigured && supabase) {
      const { data: res, error } = await supabase.rpc('admin_create_user', {
        p_email: cleanEmail,
        p_password: finalAdminPass,
        p_nama_lengkap: cleanName,
        p_nomor_induk: cleanNip,
        p_jenis_kelamin: 'L',
        p_role: 'admin',
        p_jabatan: (adminData.jabatan || 'Staf Tata Usaha').trim()
      })

      if (error || !res?.success) {
        return {
          success: false,
          message: error?.message || res?.message || 'Gagal menambahkan Administrator.'
        }
      }

      if (res.profile) {
        upsertProfileInLists(res.profile)
      }
      return { success: true, admin: res.profile }
    }

    if (rawAdmins.value.some(a => !a.is_deleted && a.nomor_induk.toLowerCase() === cleanNip.toLowerCase())) {
      return { success: false, message: 'Nomor Induk / NIK Admin sudah terdaftar!' }
    }
    if (rawAdmins.value.some(a => !a.is_deleted && a.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'Email Admin sudah terdaftar!' }
    }

    const newAdmin = {
      id: `usr-admin-${Date.now()}`,
      nama_lengkap: cleanName,
      nomor_induk: cleanNip,
      email: cleanEmail,
      role: 'admin',
      jabatan: (adminData.jabatan || 'Staf Tata Usaha').trim(),
      password: finalAdminPass,
      is_root: false,
      foto_profil_url: '',
      created_at: new Date().toISOString()
    }

    rawAdmins.value.push(newAdmin)
    return { success: true, admin: newAdmin }
  }

  async function updateAdmin(id, adminData) {
    const cleanNip = (adminData.nomor_induk || '').trim()
    const cleanEmail = (adminData.email || '').trim().toLowerCase()

    if (isSupabaseConfigured && supabase) {
      const { data: res, error } = await supabase.rpc('admin_update_user', {
        p_user_id: id,
        p_email: cleanEmail || null,
        p_password: adminData.password && adminData.password.trim() ? adminData.password.trim() : null,
        p_nama_lengkap: adminData.nama_lengkap?.trim() || null,
        p_nomor_induk: cleanNip || null,
        p_jabatan: adminData.jabatan?.trim() || null
      })

      if (error || !res?.success) {
        return {
          success: false,
          message: error?.message || res?.message || 'Gagal memperbarui data Administrator.'
        }
      }

      if (res.profile) {
        upsertProfileInLists(res.profile)
      }
      return { success: true, admin: res.profile }
    }

    const admin = rawAdmins.value.find(a => a.id === id)
    if (!admin) return { success: false, message: 'Data Administrator tidak ditemukan.' }

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

  async function deleteAdmin(id, currentUserId = null) {
    const admin = rawAdmins.value.find(a => a.id === id)
    if (!admin) return { success: false, message: 'Data Administrator tidak ditemukan.' }
    if (admin.is_root) {
      return { success: false, message: 'Akun Super Admin (Root) dilindungi sistem dan tidak dapat dihapus!' }
    }
    if (currentUserId && (admin.id === currentUserId || admin.nomor_induk === currentUserId || admin.email === currentUserId)) {
      return { success: false, message: 'Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif digunakan!' }
    }

    if (isSupabaseConfigured && supabase) {
      const { data: res, error } = await supabase.rpc('admin_set_user_deleted', {
        p_user_id: id,
        p_is_deleted: true
      })
      if (error || !res?.success) {
        return {
          success: false,
          message: error?.message || res?.message || 'Gagal menghapus akun Administrator.'
        }
      }
    }

    admin.is_deleted = true
    admin.deleted_at = new Date().toISOString()
    return { success: true }
  }

  async function restoreAdmin(id) {
    if (isSupabaseConfigured && supabase) {
      const { data: res, error } = await supabase.rpc('admin_set_user_deleted', {
        p_user_id: id,
        p_is_deleted: false
      })
      if (error || !res?.success) {
        return { success: false, message: error?.message || res?.message }
      }
    }

    const admin = rawAdmins.value.find(a => a.id === id)
    if (admin) {
      admin.is_deleted = false
      admin.deleted_at = null
      return { success: true }
    }
    return { success: false }
  }

  async function setAdminPassword(id, newPassword = null) {
    const admin = rawAdmins.value.find(a => a.id === id)
    const effectivePass = (newPassword || '').trim() || (admin?.nomor_induk ? `pkbm${admin.nomor_induk}` : 'pkbm123456')
    if (isSupabaseConfigured && supabase) {
      const { data: res, error } = await supabase.rpc('admin_reset_user_password', {
        p_user_id: id,
        p_new_password: effectivePass
      })
      if (error || !res?.success) {
        return {
          success: false,
          message: error?.message || res?.message || 'Gagal mereset password Administrator.'
        }
      }
      return { success: true }
    }

    if (admin) {
      admin.password = effectivePass
      return { success: true, admin }
    }
    return { success: false }
  }

  return {
    isLoading,
    hasLoaded,
    ensureDataLoaded,
    ensureMonthAttendancesLoaded,
    initializeData,
    resetRemoteState,
    schoolSettings,
    activeAcademicYear,
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
    updateRekapSignatory,
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
    setAdminPassword
  }
})

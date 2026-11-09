/**
 * Helper Dinamis Tahun Pelajaran & Pilihan Tahun
 * Otomatis mendeteksi tahun ajaran di Indonesia (Juli s.d. Juni)
 * dan menyediakan opsi dropdown dinamis agar sistem terus berkelanjutan tanpa hardcoded.
 */

/**
 * Menghitung Tahun Pelajaran aktif (contoh: "2026/2027") berdasarkan tanggal.
 * Di Indonesia:
 * - Bulan 7 (Juli) s/d 12 (Desember) -> Tahun Pelajaran adalah ${tahun}/${tahun + 1}
 * - Bulan 1 (Januari) s/d 6 (Juni)   -> Tahun Pelajaran adalah ${tahun - 1}/${tahun}
 * 
 * @param {Date|string|number} [date=new Date()]
 * @returns {string} Contoh: "2026/2027"
 */
export function getCurrentAcademicYear(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date)
  const year = isNaN(d.getFullYear()) ? new Date().getFullYear() : d.getFullYear()
  const month = isNaN(d.getMonth()) ? new Date().getMonth() + 1 : d.getMonth() + 1

  if (month >= 7) {
    return `${year}/${year + 1}`
  } else {
    return `${year - 1}/${year}`
  }
}

/**
 * Menghitung Tahun Pelajaran spesifik untuk bulan dan tahun kalender tertentu.
 * Misal: Bulan 1 (Januari) 2027 -> "2026/2027"
 * Misal: Bulan 8 (Agustus) 2026 -> "2026/2027"
 * Misal: Bulan 8 (Agustus) 2027 -> "2027/2028"
 * 
 * @param {number} month (1 - 12)
 * @param {number} year (contoh: 2026)
 * @returns {string} Contoh: "2026/2027"
 */
export function getAcademicYearForMonthYear(month, year) {
  const m = Number(month) || 1
  const y = Number(year) || new Date().getFullYear()
  if (m >= 7) {
    return `${y}/${y + 1}`
  } else {
    return `${y - 1}/${y}`
  }
}

/**
 * Menghasilkan daftar opsi Tahun Pelajaran dinamis untuk dropdown form/pengaturan.
 * Default: 3 tahun ke belakang + tahun aktif + 3 tahun ke depan.
 * 
 * @param {number} [pastYears=3]
 * @param {number} [futureYears=3]
 * @param {Date} [baseDate=new Date()]
 * @returns {string[]} Contoh: ["2023/2024", "2024/2025", "2025/2026", "2026/2027", "2027/2028", "2028/2029"]
 */
export function getAcademicYearOptions(pastYears = 3, futureYears = 3, baseDate = new Date()) {
  const currentAcademic = getCurrentAcademicYear(baseDate)
  const currentStartYear = parseInt(currentAcademic.split('/')[0], 10)
  
  const options = []
  for (let y = currentStartYear - pastYears; y <= currentStartYear + futureYears; y++) {
    options.push(`${y}/${y + 1}`)
  }
  return options
}

/**
 * Menghasilkan daftar opsi Tahun Kalender dinamis untuk filter rekapitulasi bulanan.
 * Menggabungkan tahun sekitar (past/future) dan tahun-tahun yang terdapat di data presensi.
 * 
 * @param {number[]} [existingYears=[]] Daftar tahun dari data yang ada
 * @param {number} [pastYears=3]
 * @param {number} [futureYears=2]
 * @param {Date} [baseDate=new Date()]
 * @returns {number[]} Contoh: [2023, 2024, 2025, 2026, 2027, 2028] (sorted ascending)
 */
export function getCalendarYearOptions(existingYears = [], pastYears = 3, futureYears = 2, baseDate = new Date()) {
  const currentYear = baseDate.getFullYear()
  const yearSet = new Set()

  for (let y = currentYear - pastYears; y <= currentYear + futureYears; y++) {
    yearSet.add(y)
  }

  if (Array.isArray(existingYears)) {
    existingYears.forEach(y => {
      const num = Number(y)
      if (num && !isNaN(num) && num > 2000 && num < 2100) {
        yearSet.add(num)
      }
    })
  }

  return Array.from(yearSet).sort((a, b) => a - b)
}

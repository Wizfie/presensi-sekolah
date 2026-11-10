const JAKARTA_TZ = 'Asia/Jakarta'

export function getWibDateStr(date = new Date()) {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: JAKARTA_TZ,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(date)
    const y = parts.find(p => p.type === 'year')?.value
    const m = parts.find(p => p.type === 'month')?.value
    const d = parts.find(p => p.type === 'day')?.value
    if (y && m && d) return `${y}-${m}-${d}`
  } catch (e) {}

  const d = date instanceof Date ? date : new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function getWibTimeStr(date = new Date()) {
  try {
    const raw = new Intl.DateTimeFormat('en-GB', {
      timeZone: JAKARTA_TZ,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date)
    return raw.replace(/^24:/, '00:')
  } catch (e) {}

  const d = date instanceof Date ? date : new Date(date)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

export function normalizeClockInput(val) {
  if (!val || typeof val !== 'string') return null
  const trimmed = val.trim()
  const match = trimmed.match(/^(\d{1,2})[:.](\d{1,2})(?:[:.](\d{1,2}))?$/)
  if (!match) return null

  const hh = Number(match[1])
  const mm = Number(match[2])
  const ss = match[3] !== undefined ? Number(match[3]) : 0

  if (hh < 0 || hh > 23 || mm < 0 || mm > 59 || ss < 0 || ss > 59) {
    return null
  }

  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
}

export function extractWibTimeHHMMSS(val) {
  if (!val) return null
  if (typeof val === 'string') {
    const plain = normalizeClockInput(val)
    if (plain) return plain
  }
  const parsed = new Date(val)
  if (isNaN(parsed.getTime())) return null
  return getWibTimeStr(parsed)
}

export function buildWibTimestampIso(dateStr, timeStr) {
  const clock = normalizeClockInput(timeStr)
  if (!clock) return null
  const baseDate = dateStr || getWibDateStr()
  return `${baseDate}T${clock}+07:00`
}

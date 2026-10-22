/**
 * Mengambil inisial nama (maksimal 2 huruf)
 * Contoh: "Ahmad Fauzi" -> "AF", "Budi Santoso, S.Kom" -> "BS"
 */
export function getInitials(name) {
  if (!name || typeof name !== 'string') return '?'
  // Bersihkan gelar akademik di belakang koma (misal: ", S.Kom", ", M.Pd")
  const cleaned = name.replace(/,\s*[A-Za-z.\s]+$/, '').trim()
  const parts = cleaned.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) {
    return parts[0].substring(0, Math.min(2, parts[0].length)).toUpperCase()
  }
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

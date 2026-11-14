/**
 * Utilitas untuk membaca dan mengompresi file gambar (PNG / JPG)
 * menjadi Base64 Data URL yang ringan dan ramah penyimpanan (Local Storage / Supabase).
 */
export function compressImageFile(file, maxWidth = 500, maxHeight = 500, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('File tidak ditemukan.'))
    }

    // Validasi format PNG / JPG / JPEG / WEBP
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    if (!validTypes.includes(file.type.toLowerCase())) {
      return reject(new Error('Format file tidak didukung. Harap unggah gambar format PNG atau JPG.'))
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Skala proporsional
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        const outputType = file.type.toLowerCase() === 'image/png' ? 'image/png' : 'image/jpeg'
        const dataUrl = canvas.toDataURL(outputType, quality)
        resolve(dataUrl)
      }
      img.onerror = () => reject(new Error('Gagal memproses gambar.'))
      img.src = e.target.result
    }
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'))
    reader.readAsDataURL(file)
  })
}

/**
 * Utilitas kompresi khusus dokumen/surat izin/surat dokter.
 * Menggunakan resolusi tinggi (max 1440px) dengan smoothing berkualitas tinggi
 * agar teks tulisan tangan, stempel klinik, dan kop surat tetap tajam dan terbaca jelas,
 * namun ukuran file terpangkas drastis menjadi ~120KB - 250KB.
 */
export function compressDocumentFile(file, maxWidth = 1440, maxHeight = 1440, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('File tidak ditemukan.'))
    }

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    if (!validTypes.includes(file.type.toLowerCase())) {
      return reject(new Error('Format file tidak didukung. Harap unggah foto surat dalam format JPG, PNG, atau WEBP.'))
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Pertahankan rasio aspek dokumen
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)

        // Konversi ke JPEG terkompresi dengan teks tetap tajam
        const dataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(dataUrl)
      }
      img.onerror = () => reject(new Error('Gagal memproses foto surat.'))
      img.src = e.target.result
    }
    reader.onerror = () => reject(new Error('Gagal membaca file foto surat.'))
    reader.readAsDataURL(file)
  })
}

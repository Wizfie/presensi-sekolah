import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', () => {
  // Floating Toast State (Mobile-Friendly)
  const toast = ref({
    show: false,
    message: '',
    type: 'success', // 'success' | 'warning' | 'error' | 'info'
    timeout: null
  })

  function showToast(message, type = 'success', duration = 3500) {
    if (toast.value.timeout) clearTimeout(toast.value.timeout)
    toast.value.message = message
    toast.value.type = type
    toast.value.show = true
    toast.value.timeout = setTimeout(() => {
      toast.value.show = false
    }, duration)
  }

  function hideToast() {
    if (toast.value.timeout) clearTimeout(toast.value.timeout)
    toast.value.show = false
  }

  // Flash Toast untuk pesan yang tetap tampil setelah window.location.reload()
  function setFlashToast(message, type = 'success') {
    try {
      sessionStorage.setItem('presensi_flash_toast', JSON.stringify({ message, type }))
    } catch (e) {}
  }

  function checkFlashToast() {
    try {
      const raw = sessionStorage.getItem('presensi_flash_toast')
      if (raw) {
        sessionStorage.removeItem('presensi_flash_toast')
        const parsed = JSON.parse(raw)
        if (parsed?.message) {
          showToast(parsed.message, parsed.type || 'success', 4000)
        }
      }
    } catch (e) {}
  }

  // Global Confirmation Modal State (Promise-based pengganti window.confirm)
  const confirmModal = ref({
    show: false,
    title: 'Konfirmasi',
    message: '',
    confirmText: 'Ya, Lanjutkan',
    cancelText: 'Batal',
    type: 'warning', // 'danger' | 'warning' | 'info' | 'success'
    resolve: null
  })

  function showConfirm(options = {}) {
    return new Promise((resolve) => {
      confirmModal.value = {
        show: true,
        title: options.title || 'Konfirmasi Tindakan',
        message: options.message || '',
        confirmText: options.confirmText || 'Ya, Lanjutkan',
        cancelText: options.cancelText || 'Batal',
        type: options.type || 'warning',
        resolve
      }
    })
  }

  function resolveConfirm(result) {
    const res = confirmModal.value.resolve
    confirmModal.value.show = false
    confirmModal.value.resolve = null
    if (typeof res === 'function') {
      res(result)
    }
  }

  return {
    toast,
    showToast,
    hideToast,
    setFlashToast,
    checkFlashToast,
    confirmModal,
    showConfirm,
    resolveConfirm
  }
})

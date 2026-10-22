<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-full opacity-0"
  >
    <div
      v-if="showPrompt && !isDismissed && !isStandalone"
      class="fixed bottom-16 md:bottom-5 left-3 right-3 md:left-auto md:right-5 md:max-w-sm z-50 bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div class="flex items-center gap-3 min-w-0">
        <div class="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs">
          <span class="material-icons text-xl">install_mobile</span>
        </div>
        <div class="min-w-0">
          <h4 class="text-xs font-bold text-white leading-tight">Pasang Aplikasi di HP</h4>
          <p class="text-[11px] text-slate-300 mt-0.5 leading-tight">
            {{ isIos ? 'Tekan "Bagikan" lalu "Tambahkan ke Layar Utama"' : 'Buka fullscreen tanpa browser bar' }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-1.5 shrink-0">
        <button
          v-if="!isIos"
          type="button"
          @click="handleInstallClick"
          class="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition cursor-pointer shadow-xs"
        >
          Pasang
        </button>
        <button
          type="button"
          @click="dismissPrompt"
          class="w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition cursor-pointer text-xs"
          title="Tutup banner"
        >
          ✕
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const showPrompt = ref(false)
const isDismissed = ref(false)
const deferredPrompt = ref(null)
const isStandalone = ref(false)
const isIos = ref(false)

onMounted(() => {
  // Cek apakah sudah berjalan di mode standalone (sudah terpasang sebagai PWA)
  const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
  isStandalone.value = isStandaloneMode

  // Cek apakah user pernah dismiss prompt di sesi ini
  const dismissedSession = sessionStorage.getItem('pwa_prompt_dismissed')
  if (dismissedSession) {
    isDismissed.value = true
  }

  // Deteksi iOS Safari
  const userAgent = window.navigator.userAgent.toLowerCase()
  isIos.value = /iphone|ipad|ipod/.test(userAgent)

  // Tangkap event install prompt di Android Chrome / Desktop Edge/Chrome
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt.value = e
    if (!isStandalone.value && !isDismissed.value) {
      showPrompt.value = true
    }
  })

  // Jika di iOS dan belum standalone dan belum pernah di-dismiss, tampilkan prompt edukatif
  if (isIos.value && !isStandalone.value && !isDismissed.value) {
    setTimeout(() => {
      showPrompt.value = true
    }, 2000)
  }
})

async function handleInstallClick() {
  if (deferredPrompt.value) {
    deferredPrompt.value.prompt()
    const { outcome } = await deferredPrompt.value.userChoice
    if (outcome === 'accepted') {
      showPrompt.value = false
    }
    deferredPrompt.value = null
  }
}

function dismissPrompt() {
  showPrompt.value = false
  isDismissed.value = true
  sessionStorage.setItem('pwa_prompt_dismissed', 'true')
}
</script>

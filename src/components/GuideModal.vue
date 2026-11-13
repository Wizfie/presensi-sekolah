<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/70 backdrop-blur-sm animate-fade-in"
      @click.self="close"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col w-full max-w-5xl h-[92vh] max-h-[920px] overflow-hidden animate-scale-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-modal-title"
      >
        <!-- Header Modal -->
        <div class="px-4 py-3 sm:px-5 sm:py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <span class="material-icons text-xl">menu_book</span>
            </div>
            <div class="min-w-0">
              <h3 id="guide-modal-title" class="text-sm sm:text-base font-bold text-slate-800 truncate">
                Buku Panduan Pengguna (PDF)
              </h3>
              <p class="text-[11px] sm:text-xs text-slate-500 truncate">
                Sistem Presensi Sekolah Digital — PKBM Cahaya Mulia
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-1.5 sm:gap-2">
            <a
              href="/panduan-pengguna.pdf"
              target="_blank"
              class="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-white border border-slate-200 transition-colors"
              title="Buka dokumen di tab baru browser"
            >
              <span class="material-icons text-sm">open_in_new</span>
              <span>Tab Baru</span>
            </a>
            <a
              href="/panduan-pengguna.pdf"
              download="Panduan_Pengguna_Presensi_PKBM_Cahaya_Mulia.pdf"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors"
              title="Unduh berkas PDF ke perangkat"
            >
              <span class="material-icons text-sm">file_download</span>
              <span>Unduh PDF</span>
            </a>
            <button
              @click="close"
              class="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/70 rounded-lg transition-colors cursor-pointer ml-1"
              title="Tutup Panduan"
            >
              <span class="material-icons text-xl">close</span>
            </button>
          </div>
        </div>

        <!-- Document Viewer Body -->
        <div class="flex-1 w-full h-full bg-slate-100 relative overflow-hidden flex flex-col">
          <iframe
            src="/panduan-pengguna.pdf#toolbar=1&navpanes=0"
            class="w-full flex-1 border-0"
            title="Buku Panduan Pengguna PDF"
          ></iframe>
        </div>

        <!-- Footer Info -->
        <div class="px-4 py-2 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between shrink-0">
          <span class="truncate">💡 Berkas PDF Resmi (5.8 MB) — Panduan Operasional 14 Halaman Ilustrasi</span>
          <div class="flex items-center gap-3 shrink-0">
            <a
              href="/panduan-pengguna.pdf"
              target="_blank"
              class="text-blue-600 hover:underline inline-flex items-center gap-0.5 sm:hidden font-medium"
            >
              <span>Buka Tab Baru</span>
              <span class="material-icons text-xs">open_in_new</span>
            </a>
            <button
              type="button"
              @click="close"
              class="text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])

function close() {
  emit('update:modelValue', false)
}

function handleKeyDown(e) {
  if (e.key === 'Escape' && props.modelValue) {
    close()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

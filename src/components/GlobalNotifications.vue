<template>
  <Teleport to="body">
    <!-- Global Confirmation Modal (Mobile-Friendly, Pengganti confirm / window.confirm) -->
    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="uiStore.confirmModal.show"
        class="no-print fixed inset-0 z-[10050] flex items-end sm:items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm"
        @click.self="uiStore.resolveConfirm(false)"
      >
        <div class="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 transform transition-all">
          <!-- Ikon Status -->
          <div
            class="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto shadow-sm"
            :class="[
              uiStore.confirmModal.type === 'danger' ? 'bg-rose-100 text-rose-600' :
              uiStore.confirmModal.type === 'warning' ? 'bg-amber-100 text-amber-600' :
              uiStore.confirmModal.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
              'bg-blue-100 text-blue-600'
            ]"
          >
            <span class="material-icons text-2xl">
              {{
                uiStore.confirmModal.type === 'danger' ? 'delete_forever' :
                uiStore.confirmModal.type === 'warning' ? 'warning_amber' :
                uiStore.confirmModal.type === 'success' ? 'check_circle' : 'help_outline'
              }}
            </span>
          </div>

          <!-- Judul & Isi Pesan -->
          <div class="text-center space-y-2">
            <h4 class="font-extrabold text-slate-900 text-base sm:text-lg leading-snug">
              {{ uiStore.confirmModal.title }}
            </h4>
            <p class="text-xs text-slate-600 leading-relaxed whitespace-pre-line text-left sm:text-center bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
              {{ uiStore.confirmModal.message }}
            </p>
          </div>

          <!-- Tombol Aksi -->
          <div :class="uiStore.confirmModal.singleButton ? 'pt-1' : 'grid grid-cols-2 gap-2.5 pt-1'">
            <button
              v-if="!uiStore.confirmModal.singleButton"
              type="button"
              @click="uiStore.resolveConfirm(false)"
              class="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              {{ uiStore.confirmModal.cancelText }}
            </button>
            <button
              type="button"
              @click="uiStore.resolveConfirm(true)"
              class="w-full py-2.5 px-4 active:scale-95 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
              :class="[
                uiStore.confirmModal.singleButton ? 'bg-slate-800 hover:bg-slate-900 text-white' :
                uiStore.confirmModal.type === 'danger' ? 'bg-rose-600 hover:bg-rose-700' :
                uiStore.confirmModal.type === 'warning' ? 'bg-amber-600 hover:bg-amber-700' :
                uiStore.confirmModal.type === 'success' ? 'bg-emerald-600 hover:bg-emerald-700' :
                'bg-blue-600 hover:bg-blue-700'
              ]"
            >
              <span>{{ uiStore.confirmModal.confirmText }}</span>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Global Floating Toast Notification (Mobile & Desktop Friendly, Pengganti alert) -->
    <transition
      enter-active-class="transform transition ease-out duration-300"
      enter-from-class="-translate-y-4 opacity-0 scale-95"
      enter-to-class="translate-y-0 opacity-100 scale-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="-translate-y-2 opacity-0 scale-95"
    >
      <div
        v-if="uiStore.toast.show"
        class="no-print fixed top-4 left-1/2 -translate-x-1/2 z-[10060] max-w-md w-[92%] sm:w-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-md transition-all select-none"
        :class="[
          uiStore.toast.type === 'success' ? 'bg-slate-900/95 text-white border-emerald-500/50 shadow-emerald-950/20' :
          uiStore.toast.type === 'warning' ? 'bg-slate-900/95 text-white border-amber-500/50 shadow-amber-950/20' :
          uiStore.toast.type === 'error' ? 'bg-slate-900/95 text-white border-rose-500/50 shadow-rose-950/20' :
          'bg-slate-900/95 text-white border-blue-500/50 shadow-blue-950/20'
        ]"
      >
        <span
          class="material-icons text-xl shrink-0"
          :class="[
            uiStore.toast.type === 'success' ? 'text-emerald-400' :
            uiStore.toast.type === 'warning' ? 'text-amber-400' :
            uiStore.toast.type === 'error' ? 'text-rose-400' : 'text-blue-400'
          ]"
        >
          {{
            uiStore.toast.type === 'success' ? 'check_circle' :
            uiStore.toast.type === 'warning' ? 'warning' :
            uiStore.toast.type === 'error' ? 'error' : 'info'
          }}
        </span>
        <span class="text-xs font-semibold flex-1 leading-snug whitespace-pre-line">{{ uiStore.toast.message }}</span>
        <button
          type="button"
          @click="uiStore.hideToast()"
          class="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer shrink-0"
        >
          <span class="material-icons text-base">close</span>
        </button>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { useUiStore } from '../stores/ui'

const uiStore = useUiStore()

function handleKeydown(e) {
  if (e.key === 'Escape' && uiStore.confirmModal.show) {
    uiStore.resolveConfirm(false)
  }
}

onMounted(() => {
  uiStore.checkFlashToast()
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

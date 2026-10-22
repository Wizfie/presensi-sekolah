<template>
  <Teleport to="body">
    <!-- Backdrop Overlay -->
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 z-[9990] bg-slate-900/60 backdrop-blur-xs flex flex-col justify-end"
        @click.self="close"
      >
        <!-- Bottom Sheet Content Container -->
        <Transition name="slide-up">
          <div
            v-if="open"
            class="bg-white rounded-t-3xl border-t border-slate-200/90 shadow-2xl max-h-[88vh] flex flex-col w-full overflow-hidden animate-in"
          >
            <!-- Drag Handle Bar -->
            <div class="pt-3 pb-1 flex justify-center cursor-pointer select-none" @click="close">
              <div class="w-12 h-1.5 bg-slate-300 hover:bg-slate-400 rounded-full transition-colors"></div>
            </div>

            <!-- Sheet Header -->
            <div class="px-5 pt-2 pb-3.5 border-b border-slate-100 flex items-start justify-between gap-3">
              <div class="min-w-0 flex-1 pr-1">
                <h3 class="text-base font-bold text-slate-900 leading-snug break-words">
                  {{ title }}
                </h3>
                <p v-if="subtitle" class="text-xs text-slate-500 mt-1 leading-relaxed break-words">
                  {{ subtitle }}
                </p>
              </div>

              <!-- Close Button -->
              <button
                type="button"
                @click="close"
                class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                aria-label="Tutup"
              >
                <span class="material-icons text-base">close</span>
              </button>
            </div>

            <!-- Sheet Body (Scrollable) -->
            <div class="px-5 py-4 overflow-y-auto space-y-4 text-xs sm:text-sm">
              <slot />
            </div>

            <!-- Sheet Footer / Action Buttons -->
            <div v-if="$slots.actions" class="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2.5">
              <slot name="actions" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: 'Detail Informasi' },
  subtitle: { type: String, default: '' }
})

const emit = defineEmits(['update:open', 'close'])

function close() {
  emit('update:open', false)
  emit('close')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>

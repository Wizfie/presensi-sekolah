<template>
  <!-- Mobile-only top navbar (hidden on md+, sidebar takes over) -->
  <header class="md:hidden bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
    <div class="px-3.5 h-14 flex items-center justify-between gap-2">
      <!-- Brand Logo & Hamburger -->
      <div class="flex items-center gap-2.5 min-w-0">
        <!-- Hamburger Menu Button (Mobile) -->
        <button
          type="button"
          @click="$emit('open-drawer')"
          class="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer active:scale-95 shrink-0"
          title="Buka Menu Navigasi"
        >
          <span class="material-icons text-xl">menu</span>
        </button>

        <img
          src="/logo.png"
          alt="Logo PKBM Cahaya Mulia"
          class="w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow-xs shrink-0"
        />
        <div class="min-w-0">
          <span class="font-bold text-slate-900 tracking-tight text-sm truncate block leading-tight">PKBM Cahaya Mulia</span>
          <p class="text-[10px] text-slate-500 leading-tight truncate">
            Sistem Presensi Harian
          </p>
        </div>
      </div>

      <!-- Role Badge -->
      <div class="shrink-0">
        <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
          {{ authStore.user?.role === 'guru' ? 'Guru Piket' : authStore.user?.role === 'siswa' ? 'Siswa' : 'Admin' }}
        </span>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

defineEmits(['open-drawer'])
</script>

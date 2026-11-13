<template>
  <!-- Mobile-only top navbar (hidden on md+, sidebar takes over) -->
  <header class="md:hidden bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
    <div class="px-3.5 h-14 flex items-center justify-between">
      <!-- Brand Logo & Hamburger -->
      <div class="flex items-center gap-2 sm:gap-3">
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
          class="w-9 h-9 sm:w-10 sm:h-10 object-contain drop-shadow-xs shrink-0"
        />
        <div>
          <div class="flex items-center gap-1.5">
            <span class="font-bold text-slate-900 tracking-tight text-sm sm:text-base">PKBM Cahaya Mulia</span>
            <span class="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              {{ authStore.user?.role === 'guru' ? 'Guru Piket' : authStore.user?.role === 'siswa' ? 'Siswa' : 'Admin' }}
            </span>
          </div>
          <p class="text-[11px] text-slate-500 hidden sm:block leading-tight">
            Sistem Presensi Harian
          </p>
        </div>
      </div>

      <!-- User Info -->
      <div class="flex items-center gap-2 sm:gap-4">
        <!-- User profile preview -->
        <div v-if="authStore.user" class="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200">
          <img
            v-if="authStore.user.foto_profil_url"
            :src="authStore.user.foto_profil_url"
            alt="Avatar"
            class="w-8 h-8 rounded-full object-cover border border-slate-200 ring-2 ring-blue-50"
          />
          <div
            v-else
            class="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 border border-blue-700 shadow-2xs select-none"
            :title="authStore.user.nama_lengkap"
          >
            {{ getInitials(authStore.user.nama_lengkap) }}
          </div>
          <div class="hidden lg:block text-left">
            <p class="text-xs font-semibold text-slate-800 leading-none truncate max-w-[130px]">
              {{ authStore.user.nama_lengkap }}
            </p>
            <p class="text-[11px] text-slate-500 mt-0.5">
              {{ authStore.user.nomor_induk }}
            </p>
          </div>
          
          <!-- Panduan Pengguna Button -->
          <a
            href="/panduan-pengguna.pdf"
            target="_blank"
            title="Buku Panduan Pengguna (PDF)"
            class="text-slate-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer flex items-center justify-center"
          >
            <span class="material-icons text-base">menu_book</span>
          </a>

          <!-- Logout Button -->
          <button
            @click="handleLogout"
            title="Keluar"
            class="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { getInitials } from '../utils/avatar'

const router = useRouter()
const authStore = useAuthStore()

defineEmits(['open-drawer'])

async function handleLogout() {
  await authStore.logout()
  router.push('/')
}
</script>

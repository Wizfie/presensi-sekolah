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

        <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/>
          </svg>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="font-bold text-slate-900 tracking-tight text-base sm:text-lg">PresensiKu</span>
            <span class="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              {{ authStore.user?.role || 'Siswa' }}
            </span>
          </div>
          <p class="text-xs text-slate-500 hidden sm:block leading-tight">
            {{ attendanceStore.schoolSettings.nama_sekolah }}
          </p>
        </div>
      </div>

      <!-- Quick Role Switcher (For Development & Testing) & User Info -->
      <div class="flex items-center gap-2 sm:gap-4">
        <!-- Switcher Buttons -->
        <div class="hidden md:flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <button
            @click="switchRole('siswa')"
            :class="[
              'px-2.5 py-1 rounded-md transition-all font-medium',
              authStore.user?.role === 'siswa' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            ]"
          >
            Siswa
          </button>
          <button
            @click="switchRole('guru')"
            :class="[
              'px-2.5 py-1 rounded-md transition-all font-medium',
              authStore.user?.role === 'guru' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            ]"
          >
            Guru
          </button>
          <button
            @click="switchRole('admin')"
            :class="[
              'px-2.5 py-1 rounded-md transition-all font-medium',
              authStore.user?.role === 'admin' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            ]"
          >
            Admin
          </button>
        </div>

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
import { useAttendanceStore } from '../stores/attendance'
import { getInitials } from '../utils/avatar'

const router = useRouter()
const authStore = useAuthStore()
const attendanceStore = useAttendanceStore()

defineEmits(['open-drawer'])

async function switchRole(role) {
  await authStore.loginWithMock(role)
  if (role === 'siswa') router.push('/siswa')
  else if (role === 'guru') router.push('/guru')
  else if (role === 'admin') router.push('/admin')
}

async function handleLogout() {
  await authStore.logout()
  router.push('/')
}
</script>

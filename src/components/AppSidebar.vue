<template>
  <!-- DESKTOP SIDEBAR (md+) -->
  <aside
    class="hidden md:flex flex-col w-60 lg:w-64 shrink-0 bg-white border-r border-slate-200/80 min-h-screen sticky top-0 h-screen overflow-y-auto z-20"
  >
    <!-- Brand -->
    <div class="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
      <img
        src="/logo.png"
        alt="Logo PKBM Cahaya Mulia"
        class="w-10 h-10 object-contain drop-shadow-xs shrink-0"
      />
      <div class="min-w-0">
        <p class="font-black text-slate-900 text-sm leading-tight">PKBM Cahaya Mulia</p>
        <p class="text-[11px] font-semibold text-slate-400 truncate leading-tight mt-0.5">Sistem Presensi Harian</p>
      </div>
    </div>

    <!-- User Profile Block -->
    <div class="px-4 py-4 border-b border-slate-100">
      <div class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
        <img
          v-if="authStore.user?.foto_profil_url"
          :src="authStore.user.foto_profil_url"
          alt="Avatar"
          class="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
        />
        <div
          v-else
          class="w-9 h-9 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 select-none"
        >
          {{ getInitials(authStore.user?.nama_lengkap) }}
        </div>
        <div class="min-w-0">
          <p class="text-xs font-semibold text-slate-800 truncate leading-tight">{{ authStore.user?.nama_lengkap }}</p>
          <p class="text-[11px] text-slate-400 mt-0.5 truncate">{{ authStore.user?.nomor_induk }}</p>
        </div>
        <span class="ml-auto shrink-0 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
          {{ authStore.user?.role === 'guru' ? 'Guru Piket' : authStore.user?.role === 'siswa' ? 'Siswa' : 'Admin' }}
        </span>
      </div>
    </div>

    <!-- Navigation Menu -->
    <nav class="flex-1 px-3 py-4 space-y-0.5">
      <p class="text-[10px] uppercase font-bold tracking-widest text-slate-400 px-3 mb-2">Menu Utama</p>
      <button
        v-for="item in navItems"
        :key="item.key"
        @click="$emit('tab-change', item.key)"
        :class="[
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer text-left',
          activeTab === item.key
            ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        ]"
      >
        <span class="material-icons text-[18px] shrink-0">{{ item.icon }}</span>
        <span class="truncate">{{ item.label }}</span>
        <span
          v-if="item.badge"
          class="ml-auto shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
          :class="activeTab === item.key ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'"
        >{{ item.badge }}</span>
      </button>

      <!-- Dokumentasi & Panduan Sistem -->
      <div class="pt-3 pb-2 border-t border-slate-100 mt-2">
        <p class="text-[10px] uppercase font-bold tracking-widest text-slate-400 px-3 mb-2 flex items-center justify-between">
          <span>Panduan Sistem</span>
          <span class="material-icons text-xs text-slate-400">file_download</span>
        </p>
        <div class="flex flex-col gap-1.5 px-1">
          <!-- Download Penjelasan Fitur (.txt) -->
          <a
            href="/docs/PENJELASAN_PROJECT_DAN_FITUR.txt"
            download="PENJELASAN_PROJECT_DAN_FITUR.txt"
            class="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 border border-transparent hover:border-emerald-200 transition-all cursor-pointer group no-underline"
            title="Download penjelasan sistem & fitur (.txt)"
          >
            <span class="material-icons text-base text-emerald-600">article</span>
            <div class="flex flex-col text-left min-w-0 flex-1">
              <span class="font-semibold text-[11px] leading-tight text-slate-700 group-hover:text-emerald-700 truncate">Panduan Fitur (.txt)</span>
              <span class="text-[9px] text-slate-400 leading-tight">Penjelasan Ringkas</span>
            </div>
            <span class="material-icons text-xs text-slate-400 group-hover:text-emerald-600">download</span>
          </a>

          <!-- Download Flowchart (.png) -->
          <a
            href="/docs/flowchart_presensi_sekolah.png"
            download="flowchart_presensi_sekolah.png"
            class="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-700 border border-transparent hover:border-blue-200 transition-all cursor-pointer group no-underline"
            title="Download diagram flowchart sistem (.png)"
          >
            <span class="material-icons text-base text-blue-600">account_tree</span>
            <div class="flex flex-col text-left min-w-0 flex-1">
              <span class="font-semibold text-[11px] leading-tight text-slate-700 group-hover:text-blue-700 truncate">Flowchart (.png)</span>
              <span class="text-[9px] text-slate-400 leading-tight">Standar Akademik</span>
            </div>
            <span class="material-icons text-xs text-slate-400 group-hover:text-blue-600">download</span>
          </a>
        </div>
      </div>
    </nav>

    <!-- Bottom: Logout -->
    <div class="px-3 py-4 border-t border-slate-100">
      <button
        @click="handleLogout"
        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-150 cursor-pointer"
      >
        <span class="material-icons text-[18px]">logout</span>
        <span>Keluar</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { getInitials } from '../utils/avatar'

const props = defineProps({
  activeTab: { type: String, default: '' },
  navItems: { type: Array, default: () => [] }
})

const emit = defineEmits(['tab-change'])

const router = useRouter()
const authStore = useAuthStore()

async function handleLogout() {
  await authStore.logout()
  router.push('/')
}
</script>

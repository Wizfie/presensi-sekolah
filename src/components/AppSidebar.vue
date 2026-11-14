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
        <!-- Avatar Button (Clickable: open profile & change password) -->
        <button
          type="button"
          @click="showProfileModal = true"
          title="Klik foto untuk melihat profil & ganti kata sandi"
          class="relative shrink-0 cursor-pointer focus:outline-none transition-transform active:scale-95 group text-left"
        >
          <img
            v-if="authStore.user?.foto_profil_url"
            :src="authStore.user.foto_profil_url"
            alt="Avatar"
            class="w-9 h-9 rounded-xl object-cover border border-slate-200 group-hover:ring-2 group-hover:ring-blue-500 transition-all"
          />
          <div
            v-else
            class="w-9 h-9 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center justify-center select-none group-hover:bg-blue-700 group-hover:ring-2 group-hover:ring-blue-500 transition-all shadow-xs"
          >
            {{ getInitials(authStore.user?.nama_lengkap) }}
          </div>
          <span
            class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"
            title="Online"
          ></span>
        </button>

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
    </nav>

    <!-- Bottom: Panduan & Logout -->
    <div class="px-3 py-3 border-t border-slate-100 space-y-0.5">
      <a
        href="/panduan-pengguna.pdf"
        download="Panduan_Pengguna_Presensi_PKBM_Cahaya_Mulia.pdf"
        title="Unduh Panduan Pengguna (PDF)"
        class="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:bg-blue-50 hover:text-blue-700 transition-all duration-150 cursor-pointer"
      >
        <span class="material-icons text-[18px] text-slate-400">file_download</span>
        <span class="truncate">Unduh Panduan (PDF)</span>
      </a>
      <button
        @click="handleLogout"
        class="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-150 cursor-pointer"
      >
        <span class="material-icons text-[18px]">logout</span>
        <span>Keluar</span>
      </button>
    </div>

    <!-- Modal Profil & Ganti Password Mandiri (Desktop) -->
    <UserProfileModal v-model="showProfileModal" />
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { getInitials } from '../utils/avatar'
import UserProfileModal from './UserProfileModal.vue'

const props = defineProps({
  activeTab: { type: String, default: '' },
  navItems: { type: Array, default: () => [] }
})

const emit = defineEmits(['tab-change'])

const router = useRouter()
const authStore = useAuthStore()
const showProfileModal = ref(false)

async function handleLogout() {
  await authStore.logout()
  router.push('/')
}
</script>

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

      <!-- Role Switcher (Dev Only) -->
      <div class="pt-4 pb-1">
        <p class="text-[10px] uppercase font-bold tracking-widest text-slate-400 px-3 mb-2">Role (Dev)</p>
        <div class="flex flex-col gap-1">
          <button
            v-for="role in ['siswa', 'guru', 'admin']"
            :key="role"
            @click="switchRole(role)"
            :class="[
              'w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer',
              authStore.user?.role === role
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
            ]"
          >
            <span class="material-icons text-sm">{{ role === 'siswa' ? 'person' : role === 'guru' ? 'school' : 'admin_panel_settings' }}</span>
            {{ role.charAt(0).toUpperCase() + role.slice(1) }}
          </button>
        </div>
      </div>

      <!-- Data Seeding & Reset Mode (Dev Only) -->
      <div class="pt-3 pb-2 border-t border-slate-100 mt-2">
        <p class="text-[10px] uppercase font-bold tracking-widest text-slate-400 px-3 mb-2 flex items-center justify-between">
          <span>Data Mode (Dev)</span>
          <span class="material-icons text-xs text-slate-400">tune</span>
        </p>
        <div class="flex flex-col gap-1.5 px-1">
          <!-- Reset ke Seeding Awal (3 Kelas @ 30 Siswa) -->
          <button
            type="button"
            @click="handleResetToSeed"
            class="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-700 border border-transparent hover:border-blue-200 transition-all cursor-pointer group"
            title="Reset ulang ke data bawaan lengkap (90 siswa, 4 guru multi-mapel)"
          >
            <span class="material-icons text-base text-blue-500 group-hover:rotate-180 transition-transform duration-300">restore</span>
            <div class="flex flex-col text-left">
              <span class="font-semibold text-[11px] leading-tight text-slate-700 group-hover:text-blue-700">Reset ke Seeding</span>
              <span class="text-[9px] text-slate-400 leading-tight">3 Kelas @ 30 Siswa (90)</span>
            </div>
          </button>

          <!-- Kosongkan Data (Test dari Nol) -->
          <button
            type="button"
            @click="handleClearToBlank"
            class="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-700 border border-transparent hover:border-rose-200 transition-all cursor-pointer group"
            title="Kosongkan seluruh data untuk pengujian dari awal (Clean Slate)"
          >
            <span class="material-icons text-base text-rose-500">layers_clear</span>
            <div class="flex flex-col text-left">
              <span class="font-semibold text-[11px] leading-tight text-slate-700 group-hover:text-rose-700">Kosongkan Data</span>
              <span class="text-[9px] text-slate-400 leading-tight">Mulai dari Nol (Clean)</span>
            </div>
          </button>
        </div>
      </div>

      <!-- Dokumentasi Proyek (Demo Mode / PKM) -->
      <div class="pt-3 pb-2 border-t border-slate-100 mt-2">
        <p class="text-[10px] uppercase font-bold tracking-widest text-slate-400 px-3 mb-2 flex items-center justify-between">
          <span>Dokumen (Demo)</span>
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
import { useAttendanceStore } from '../stores/attendance'
import { useUiStore } from '../stores/ui'
import { getInitials } from '../utils/avatar'

const props = defineProps({
  activeTab: { type: String, default: '' },
  navItems: { type: Array, default: () => [] }
})

const emit = defineEmits(['tab-change'])

const router = useRouter()
const authStore = useAuthStore()
const attendanceStore = useAttendanceStore()
const uiStore = useUiStore()

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

async function handleResetToSeed() {
  const confirmed = await uiStore.showConfirm({
    title: 'Reset ke Seeding Awal?',
    message:
      'Data akan dikembalikan ke kondisi bawaan PKBM Cahaya Mulia:\n' +
      '• 3 Kelas (12, 11, 10)\n' +
      '• 13 Siswa Kelas 12 (Buku Presensi Fisik)\n' +
      '• Guru Piket, Tutor & Administrator\n' +
      '• Presensi & riwayat kehadiran harian',
    confirmText: 'Ya, Reset Data',
    cancelText: 'Batal',
    type: 'warning'
  })
  if (confirmed) {
    attendanceStore.resetAllDataToDefault()
    uiStore.setFlashToast('Data berhasil di-reset ke kondisi seeding awal PKBM Cahaya Mulia!', 'success')
    window.location.reload()
  }
}

async function handleClearToBlank() {
  const confirmed = await uiStore.showConfirm({
    title: 'Kosongkan Seluruh Data?',
    message:
      'Semua data siswa, guru, kelas, dan absensi akan dikosongkan untuk pengujian dari nol.\n\n' +
      'Yakin ingin mengosongkan?',
    confirmText: 'Ya, Kosongkan Semua',
    cancelText: 'Batal',
    type: 'danger'
  })
  if (confirmed) {
    attendanceStore.clearAllDataToCleanSlate()
    uiStore.setFlashToast('Data berhasil dikosongkan. Anda dapat mulai menguji dari kondisi nol!', 'info')
    window.location.reload()
  }
}
</script>

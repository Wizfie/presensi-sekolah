<template>
  <Teleport to="body">
    <!-- Overlay Backdrop -->
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex"
        @click.self="close"
      >
        <!-- Drawer Container -->
        <Transition name="slide-right">
          <div
            v-if="open"
            class="w-[290px] max-w-[85vw] bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden"
          >
            <!-- Top Section: Header & Menu -->
            <div class="flex-1 overflow-y-auto">
              <!-- Brand & Close -->
              <div class="p-4 bg-blue-600 text-white flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center text-white font-black text-sm">
                    P
                  </div>
                  <div>
                    <h2 class="text-sm font-bold tracking-tight leading-tight">PresensiKu</h2>
                    <p class="text-[10px] text-blue-100 truncate max-w-[170px]">
                      {{ attendanceStore.schoolSettings.nama_sekolah }}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  @click="close"
                  class="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  <span class="material-icons text-base">close</span>
                </button>
              </div>

              <!-- User Profile Header Block -->
              <div class="p-4 bg-slate-50 border-b border-slate-200/80 flex items-center gap-3">
                <div class="relative shrink-0">
                  <img
                    v-if="authStore.user?.foto_profil_url"
                    :src="authStore.user.foto_profil_url"
                    class="w-12 h-12 rounded-full object-cover border-2 border-white shadow-2xs"
                  />
                  <div
                    v-else
                    class="w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-base flex items-center justify-center border-2 border-white shadow-2xs"
                  >
                    {{ getInitials(authStore.user?.nama_lengkap || 'User') }}
                  </div>
                  <span
                    class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white"
                    title="Online"
                  ></span>
                </div>
                <div class="min-w-0 flex-1">
                  <h3 class="text-xs font-bold text-slate-900 truncate">
                    {{ authStore.user?.nama_lengkap }}
                  </h3>
                  <p class="text-[11px] text-slate-500 truncate mt-0.5 font-mono">
                    {{ authStore.user?.nomor_induk || authStore.user?.email }}
                  </p>
                  <div class="mt-1">
                    <span :class="['text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider', roleBadgeClasses]">
                      {{ authStore.user?.role }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Nav Menu Items (ListTile Style) -->
              <div class="p-3 space-y-1">
                <p class="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Menu Navigasi
                </p>

                <button
                  v-for="item in navItems"
                  :key="item.key"
                  type="button"
                  @click="handleSelect(item.key)"
                  :class="[
                    'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none text-left',
                    activeTab === item.key
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  ]"
                >
                  <div class="flex items-center gap-3">
                    <span
                      class="material-icons text-lg"
                      :class="activeTab === item.key ? 'text-white' : 'text-slate-400'"
                    >
                      {{ item.icon }}
                    </span>
                    <span>{{ item.label }}</span>
                  </div>

                  <span
                    v-if="item.badge !== undefined && item.badge !== null"
                    :class="[
                      'px-2 py-0.5 rounded-full text-[10px] font-bold',
                      activeTab === item.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    ]"
                  >
                    {{ item.badge }}
                  </span>
                </button>
              </div>

              <!-- Switch Role (Demo) -->
              <div class="mx-3 mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Ganti Akun Demo
                </p>
                <div class="grid grid-cols-3 gap-1.5">
                  <button
                    v-for="r in ['siswa', 'guru', 'admin']"
                    :key="r"
                    type="button"
                    @click="switchRole(r)"
                    :class="[
                      'py-1.5 text-[11px] font-semibold rounded-lg capitalize border transition-all cursor-pointer',
                      authStore.user?.role === r
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    ]"
                  >
                    {{ r }}
                  </button>
                </div>
              </div>

              <!-- Data Seeding & Reset Mode (Dev Only) -->
              <div class="mx-3 mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Data Mode (Dev)</span>
                  <span class="material-icons text-xs text-slate-400">tune</span>
                </p>
                <div class="flex flex-col gap-1.5">
                  <button
                    type="button"
                    @click="handleResetToSeed"
                    class="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all cursor-pointer text-left"
                  >
                    <span class="material-icons text-base text-blue-500">restore</span>
                    <div class="flex flex-col">
                      <span class="font-semibold text-[11px]">Reset ke Seeding</span>
                      <span class="text-[9px] text-slate-400">3 Kelas @ 30 Siswa (90)</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    @click="handleClearToBlank"
                    class="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-all cursor-pointer text-left"
                  >
                    <span class="material-icons text-base text-rose-500">layers_clear</span>
                    <div class="flex flex-col">
                      <span class="font-semibold text-[11px]">Kosongkan Data</span>
                      <span class="text-[9px] text-slate-400">Mulai dari Nol (Clean)</span>
                    </div>
                  </button>
                </div>
              </div>

              <!-- Dokumen Proyek (Demo Mode / PKM) -->
              <div class="mx-3 mt-2 mb-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Dokumen (Demo)</span>
                  <span class="material-icons text-xs text-slate-400">file_download</span>
                </p>
                <div class="flex flex-col gap-1.5">
                  <a
                    href="/docs/PENJELASAN_PROJECT_DAN_FITUR.txt"
                    download="PENJELASAN_PROJECT_DAN_FITUR.txt"
                    class="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all cursor-pointer text-left no-underline"
                  >
                    <span class="material-icons text-base text-emerald-600">article</span>
                    <div class="flex flex-col flex-1 min-w-0">
                      <span class="font-semibold text-[11px] truncate">Panduan Fitur (.txt)</span>
                      <span class="text-[9px] text-slate-400">Penjelasan Ringkas</span>
                    </div>
                    <span class="material-icons text-xs text-slate-400">download</span>
                  </a>

                  <a
                    href="/docs/flowchart_presensi_sekolah.png"
                    download="flowchart_presensi_sekolah.png"
                    class="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all cursor-pointer text-left no-underline"
                  >
                    <span class="material-icons text-base text-blue-600">account_tree</span>
                    <div class="flex flex-col flex-1 min-w-0">
                      <span class="font-semibold text-[11px] truncate">Flowchart (.png)</span>
                      <span class="text-[9px] text-slate-400">Standar Akademik</span>
                    </div>
                    <span class="material-icons text-xs text-slate-400">download</span>
                  </a>
                </div>
              </div>
            </div>

            <!-- Bottom: Logout Button -->
            <div class="p-3 border-t border-slate-200 bg-white">
              <button
                type="button"
                @click="handleLogout"
                class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
              >
                <span class="material-icons text-base">logout</span>
                <span>Keluar dari Akun</span>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useAttendanceStore } from '../stores/attendance'
import { getInitials } from '../utils/avatar'

const props = defineProps({
  open: { type: Boolean, default: false },
  navItems: { type: Array, default: () => [] },
  activeTab: { type: String, default: '' }
})

const emit = defineEmits(['update:open', 'select-tab', 'logout'])

const router = useRouter()
const authStore = useAuthStore()
const attendanceStore = useAttendanceStore()

function close() {
  emit('update:open', false)
}

function handleSelect(key) {
  emit('select-tab', key)
  close()
}

function switchRole(role) {
  authStore.loginWithMock(role)
  close()
  if (role === 'siswa') router.push('/siswa')
  else if (role === 'guru') router.push('/guru')
  else if (role === 'admin') router.push('/admin')
}

function handleLogout() {
  close()
  emit('logout')
  authStore.logout()
  router.push('/login')
}

function handleResetToSeed() {
  const confirmed = window.confirm(
    'Reset ke Seeding Awal?\n\n' +
    'Data akan dikembalikan ke kondisi bawaan lengkap:\n' +
    '• 3 Kelas (10-RPL-1, 11-TKJ-1, 12-RPL-1)\n' +
    '• 90 Siswa (30 siswa per kelas)\n' +
    '• 4 Guru dengan multi-mapel & jadwal kelas\n' +
    '• Presensi & riwayat izin bawaan\n\n' +
    'Lanjutkan?'
  )
  if (confirmed) {
    attendanceStore.resetAllDataToDefault()
    close()
    alert('Data berhasil di-reset ke kondisi seeding awal (90 siswa & 4 guru)!')
    window.location.reload()
  }
}

function handleClearToBlank() {
  const confirmed = window.confirm(
    'Kosongkan Seluruh Data (Clean Slate)?\n\n' +
    'Semua data siswa, guru, kelas, dan absensi akan dikosongkan untuk pengujian dari nol.\n\n' +
    'Yakin ingin mengosongkan?'
  )
  if (confirmed) {
    attendanceStore.clearAllDataToCleanSlate()
    close()
    alert('Data berhasil dikosongkan. Anda dapat mulai menguji dari kondisi nol!')
    window.location.reload()
  }
}

const roleBadgeClasses = computed(() => {
  switch (authStore.user?.role) {
    case 'admin':
      return 'bg-purple-100 text-purple-700'
    case 'guru':
      return 'bg-emerald-100 text-emerald-700'
    case 'siswa':
      return 'bg-blue-100 text-blue-700'
    default:
      return 'bg-slate-100 text-slate-700'
  }
})
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

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(-100%);
}
</style>

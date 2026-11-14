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
                  <div class="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-xs">
                    <img src="/logo.png" alt="Logo PKBM Cahaya Mulia" class="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h2 class="text-sm font-black tracking-tight leading-tight">PKBM Cahaya Mulia</h2>
                    <p class="text-[10px] text-blue-100 truncate max-w-[170px]">
                      Sistem Presensi Harian
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

              <!-- User Profile Header Block (Clickable card & avatar) -->
              <div
                @click="openProfile"
                title="Klik untuk melihat profil & ganti password"
                class="p-4 bg-slate-50 hover:bg-blue-50/50 border-b border-slate-200/80 flex items-center gap-3 cursor-pointer transition-colors group select-none"
              >
                <div
                  class="relative shrink-0 transition-transform group-hover:scale-105 active:scale-95 text-left"
                >
                  <img
                    v-if="authStore.user?.foto_profil_url"
                    :src="authStore.user.foto_profil_url"
                    class="w-12 h-12 rounded-full object-cover border-2 border-white shadow-2xs group-hover:ring-2 group-hover:ring-blue-400"
                  />
                  <div
                    v-else
                    class="w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-base flex items-center justify-center border-2 border-white shadow-2xs group-hover:bg-blue-700 select-none"
                  >
                    {{ getInitials(authStore.user?.nama_lengkap || 'User') }}
                  </div>
                  <span
                    class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white"
                    title="Online"
                  ></span>
                </div>
                <div class="min-w-0 flex-1">
                  <h3 class="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors truncate">
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
            </div>

            <!-- Bottom: Panduan & Logout Button -->
            <div class="p-3 border-t border-slate-200 bg-white space-y-2">
              <a
                href="/panduan-pengguna.pdf"
                download="Panduan_Pengguna_Presensi_PKBM_Cahaya_Mulia.pdf"
                class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 transition-colors cursor-pointer"
              >
                <div class="flex items-center gap-2.5">
                  <span class="material-icons text-base text-blue-600">file_download</span>
                  <span>Unduh Panduan (PDF)</span>
                </div>
                <span class="text-[10px] text-slate-400 font-mono">5.8 MB</span>
              </a>
              <button
                type="button"
                @click="handleLogout"
                class="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
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

  <!-- Modal Profil & Ganti Password Mandiri (Mobile) -->
  <UserProfileModal v-model="showProfileModal" />
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { getInitials } from '../utils/avatar'
import UserProfileModal from './UserProfileModal.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  navItems: { type: Array, default: () => [] },
  activeTab: { type: String, default: '' }
})

const emit = defineEmits(['update:open', 'select-tab', 'logout'])

const router = useRouter()
const authStore = useAuthStore()
const showProfileModal = ref(false)

function openProfile() {
  close()
  showProfileModal.value = true
}

function close() {
  emit('update:open', false)
}

function handleSelect(key) {
  emit('select-tab', key)
  close()
}

async function handleLogout() {
  close()
  emit('logout')
  await authStore.logout()
  router.push('/')
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

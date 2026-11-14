<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
      @click.self="close"
    >
      <div
        class="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto animate-scale-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
      >
        <!-- Header Modal -->
        <div class="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
          <div class="flex items-center gap-2">
            <span class="material-icons text-blue-600 text-xl">account_circle</span>
            <h3 id="profile-modal-title" class="font-bold text-slate-800 text-base">
              Profil Pengguna
            </h3>
          </div>
          <button
            type="button"
            @click="close"
            class="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            title="Tutup"
          >
            <span class="material-icons text-lg">close</span>
          </button>
        </div>

        <div class="p-5 space-y-5">
          <!-- User Identity Banner -->
          <div class="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50/70 to-indigo-50/50 border border-blue-100/80">
            <div class="relative shrink-0">
              <img
                v-if="currentUser?.foto_profil_url"
                :src="currentUser.foto_profil_url"
                alt="Avatar"
                class="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm ring-2 ring-blue-100"
              />
              <div
                v-else
                class="w-16 h-16 rounded-full bg-blue-600 text-white font-extrabold text-xl flex items-center justify-center border-2 border-white shadow-sm select-none"
              >
                {{ getInitials(currentUser?.nama_lengkap || 'User') }}
              </div>
              <span
                class="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white"
                title="Akun Aktif"
              ></span>
            </div>

            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <span
                  class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                  :class="roleBadgeClasses"
                >
                  {{ roleLabel }}
                </span>
                <span class="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Aktif</span>
                </span>
              </div>
              <h4 class="font-bold text-slate-900 text-base truncate mt-1">
                {{ currentUser?.nama_lengkap }}
              </h4>
              <p class="text-xs text-slate-500 font-mono mt-0.5 truncate">
                {{ nomorIndukLabel }}: {{ currentUser?.nomor_induk || '-' }}
              </p>
            </div>
          </div>

          <!-- Section 1: Read-Only Profile Details -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <p class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span class="material-icons text-sm text-slate-400">badge</span>
                <span>Data Identitas Resmi (Read-Only)</span>
              </p>
              <span class="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                🔒 Terkunci
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <!-- Nama Lengkap -->
              <div class="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span class="block text-[10px] font-semibold text-slate-400 uppercase">Nama Lengkap</span>
                <span class="text-xs font-bold text-slate-800 truncate block mt-0.5">
                  {{ currentUser?.nama_lengkap || '-' }}
                </span>
              </div>

              <!-- Nomor Induk -->
              <div class="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span class="block text-[10px] font-semibold text-slate-400 uppercase">{{ nomorIndukLabel }}</span>
                <span class="text-xs font-bold font-mono text-slate-800 truncate block mt-0.5">
                  {{ currentUser?.nomor_induk || '-' }}
                </span>
              </div>

              <!-- Role / Peran -->
              <div class="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span class="block text-[10px] font-semibold text-slate-400 uppercase">Peran Akun</span>
                <span class="text-xs font-bold text-slate-800 truncate block mt-0.5">
                  {{ roleLabel }}
                </span>
              </div>

              <!-- Kelas / Tugas / Jabatan -->
              <div class="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span class="block text-[10px] font-semibold text-slate-400 uppercase">{{ extraFieldLabel }}</span>
                <span class="text-xs font-bold text-slate-800 truncate block mt-0.5">
                  {{ extraFieldValue }}
                </span>
              </div>

              <!-- Email -->
              <div class="p-2.5 bg-slate-50 rounded-xl border border-slate-100 sm:col-span-2">
                <span class="block text-[10px] font-semibold text-slate-400 uppercase">Email Akun Sekolah</span>
                <span class="text-xs font-medium text-slate-800 truncate block mt-0.5 font-mono">
                  {{ currentUser?.email || '-' }}
                </span>
              </div>
            </div>

            <p class="text-[11px] text-slate-400 leading-relaxed bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/60 text-amber-800 flex items-start gap-1.5">
              <span class="material-icons text-sm text-amber-600 shrink-0 mt-0.5">info</span>
              <span>Data profil di atas bersifat tetap (*read-only*) dan dikelola langsung oleh Administrator Tata Usaha. Jika ada kesalahan data, silakan melapor ke pihak sekolah.</span>
            </p>
          </div>

          <hr class="border-slate-100" />

          <!-- Section 2: Ganti Password Mandiri -->
          <div class="space-y-3">
            <div>
              <p class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span class="material-icons text-sm text-blue-600">lock_reset</span>
                <span>Ganti Password Mandiri</span>
              </p>
              <p class="text-[11px] text-slate-500 mt-0.5">
                Perbarui kata sandi Anda secara berkala untuk menjaga keamanan akun.
              </p>
            </div>

            <form @submit.prevent="handleChangePassword" class="space-y-3">
              <!-- Password Baru -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  Password Baru
                </label>
                <div class="relative">
                  <input
                    v-model="newPassword"
                    :type="showPass ? 'text' : 'password'"
                    required
                    minlength="6"
                    placeholder="Minimal 6 karakter..."
                    class="w-full h-9 pl-3 pr-16 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    @click="showPass = !showPass"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer select-none"
                  >
                    {{ showPass ? 'Tutup' : 'Lihat' }}
                  </button>
                </div>
              </div>

              <!-- Konfirmasi Password Baru -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  Ulangi Password Baru
                </label>
                <div class="relative">
                  <input
                    v-model="confirmPassword"
                    :type="showConfirmPass ? 'text' : 'password'"
                    required
                    minlength="6"
                    placeholder="Ketik ulang password baru..."
                    class="w-full h-9 pl-3 pr-16 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    @click="showConfirmPass = !showConfirmPass"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer select-none"
                  >
                    {{ showConfirmPass ? 'Tutup' : 'Lihat' }}
                  </button>
                </div>
              </div>

              <!-- Feedback Message -->
              <div
                v-if="feedback.message"
                :class="[
                  'p-2.5 rounded-lg text-xs flex items-center justify-between',
                  feedback.success
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                ]"
              >
                <span class="flex items-center gap-1.5 font-medium">
                  <span class="material-icons text-sm">{{ feedback.success ? 'check_circle' : 'error_outline' }}</span>
                  <span>{{ feedback.message }}</span>
                </span>
                <button
                  type="button"
                  @click="feedback.message = ''"
                  class="font-bold text-sm leading-none ml-2 cursor-pointer"
                >
                  &times;
                </button>
              </div>

              <div class="pt-1">
                <button
                  type="submit"
                  :disabled="isLoading"
                  class="w-full h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs hover:shadow-sm transition-all duration-150 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span v-if="isLoading" class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span v-else class="material-icons text-xs">save</span>
                  <span>{{ isLoading ? 'Menyimpan...' : 'Simpan Password Baru' }}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            @click="close"
            class="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { getInitials } from '../utils/avatar'

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])

const authStore = useAuthStore()
const currentUser = computed(() => authStore.user)

const newPassword = ref('')
const confirmPassword = ref('')
const showPass = ref(false)
const showConfirmPass = ref(false)
const isLoading = ref(false)
const feedback = ref({ success: false, message: '' })

const roleLabel = computed(() => {
  const role = currentUser.value?.role
  if (role === 'siswa') return 'Siswa / Warga Belajar'
  if (role === 'guru') return 'Guru Piket / Tutor'
  if (role === 'admin') return 'Administrator'
  return 'Pengguna'
})

const roleBadgeClasses = computed(() => {
  const role = currentUser.value?.role
  if (role === 'siswa') return 'bg-blue-50 text-blue-700 border-blue-200'
  if (role === 'guru') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (role === 'admin') return 'bg-purple-50 text-purple-700 border-purple-200'
  return 'bg-slate-50 text-slate-700 border-slate-200'
})

const nomorIndukLabel = computed(() => {
  const role = currentUser.value?.role
  if (role === 'siswa') return 'NISN'
  if (role === 'guru') return 'NIP / NIK'
  return 'ID / NIK'
})

const extraFieldLabel = computed(() => {
  const role = currentUser.value?.role
  if (role === 'siswa') return 'Kelas Aktif'
  if (role === 'guru') return 'Penugasan / Mapel'
  return 'Jabatan'
})

const extraFieldValue = computed(() => {
  const role = currentUser.value?.role
  if (role === 'siswa') return `Kelas ${currentUser.value?.kelas || '12'}`
  if (role === 'guru') return currentUser.value?.mata_pelajaran || 'Guru Piket Harian'
  return currentUser.value?.jabatan || 'Pengelola PKBM'
})

function close() {
  newPassword.value = ''
  confirmPassword.value = ''
  feedback.value = { success: false, message: '' }
  emit('update:modelValue', false)
}

async function handleChangePassword() {
  feedback.value = { success: false, message: '' }

  if (!newPassword.value || newPassword.value.length < 6) {
    feedback.value = {
      success: false,
      message: 'Password baru minimal 6 karakter.'
    }
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    feedback.value = {
      success: false,
      message: 'Konfirmasi password tidak cocok dengan password baru.'
    }
    return
  }

  isLoading.value = true
  const res = await authStore.changeUserPassword(newPassword.value)
  isLoading.value = false

  if (res?.success) {
    feedback.value = {
      success: true,
      message: 'Password berhasil diperbarui! Gunakan password baru saat login berikutnya.'
    }
    newPassword.value = ''
    confirmPassword.value = ''
  } else {
    feedback.value = {
      success: false,
      message: res?.message || 'Gagal mengubah password. Silakan coba beberapa saat lagi.'
    }
  }
}

function handleKeyDown(e) {
  if (e.key === 'Escape' && props.modelValue) {
    close()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <div class="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-slate-50">
    <div class="w-full max-w-md">
      <!-- Header / Logo -->
      <div class="text-center mb-6">
        <img
          src="/logo.png"
          alt="Logo PKBM Cahaya Mulia"
          class="w-24 h-24 object-contain drop-shadow-md mx-auto mb-3 transition hover:scale-105"
        />
        <h1 class="text-2xl font-black tracking-tight text-slate-900">PKBM Cahaya Mulia</h1>
        <p class="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">
          Sistem Presensi Siswa 
        </p>
      </div>

      <!-- Main Login Card -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <form @submit.prevent="handleLogin" class="space-y-4">
          <!-- Alert message if any -->
          <div v-if="errorMessage" class="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>{{ errorMessage }}</span>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">Email / NISN / NIP</label>
            <input
              v-model="email"
              type="text"
              required
              placeholder="nama@sekolah.sch.id"
              class="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="block text-xs font-semibold text-slate-700">Password</label>
              <button 
                type="button" 
                @click="showForgotModal = true" 
                class="text-xs text-blue-600 hover:underline hover:text-blue-700 font-medium cursor-pointer"
              >
                Lupa password?
              </button>
            </div>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                placeholder="••••••••"
                class="w-full h-10 pl-3 pr-10 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                :aria-label="showPassword ? 'Sembunyikan password' : 'Lihat password'"
                :title="showPassword ? 'Sembunyikan password' : 'Lihat password'"
                class="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
              >
                <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                  <line x1="2" x2="22" y1="2" y2="22"/>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>
          </div>

          <Button
            type="submit"
            :loading="loading"
            class="w-full"
            size="lg"
          >
            Masuk
          </Button>
        </form>

        <!-- Akses Demo Cepat (Hanya tampil jika VITE_ENABLE_DEMO_LOGIN=true) -->
        <template v-if="authStore.isDemoEnabled">
          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-slate-200"></div>
            </div>
            <div class="relative flex justify-center text-xs uppercase">
              <span class="bg-white px-2 text-slate-400 font-medium tracking-wider">Akses Demo Cepat</span>
            </div>
          </div>

          <!-- Quick Demo Login Buttons -->
          <div class="space-y-2">
            <button
              type="button"
              :disabled="loading"
              @click="quickLogin('siswa')"
              class="w-full p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between transition-all group text-left cursor-pointer"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  S
                </div>
                <div>
                  <p class="text-xs font-semibold text-slate-800 group-hover:text-blue-600">Masuk sebagai Siswa</p>
                  <p class="text-[11px] text-slate-500">ADE IZA MUKTI (NISN: 1201 &bull; Password: pkbm1201)</p>
                </div>
              </div>
              <span class="text-xs text-blue-600 font-medium">Buka &rarr;</span>
            </button>

            <button
              type="button"
              :disabled="loading"
              @click="quickLogin('guru')"
              class="w-full p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between transition-all group text-left cursor-pointer"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  T
                </div>
                <div>
                  <p class="text-xs font-semibold text-slate-800 group-hover:text-blue-600">Masuk sebagai Guru Piket / Tutor</p>
                  <p class="text-[11px] text-slate-500">Budi Santoso, S.Pd (guru1@mail.com &bull; Password: pkbmguru1)</p>
                </div>
              </div>
              <span class="text-xs text-blue-600 font-medium">Buka &rarr;</span>
            </button>

            <button
              type="button"
              :disabled="loading"
              @click="quickLogin('admin')"
              class="w-full p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between transition-all group text-left cursor-pointer"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  A
                </div>
                <div>
                  <p class="text-xs font-semibold text-slate-800 group-hover:text-blue-600">Masuk sebagai Pengelola / Admin</p>
                  <p class="text-[11px] text-slate-500">admin@mail.com &bull; Password: pkbmadmin</p>
                </div>
              </div>
              <span class="text-xs text-blue-600 font-medium">Buka &rarr;</span>
            </button>
          </div>
        </template>
      </div>

      <!-- Footer Info -->
      <div class="text-center mt-6 space-y-2">
        <a
          href="/panduan-pengguna.pdf"
          download="Panduan_Pengguna_Presensi_PKBM_Cahaya_Mulia.pdf"
          class="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 hover:underline font-semibold transition-colors"
          title="Unduh Buku Panduan Pengguna (PDF)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          <span>Unduh Panduan Pengguna (PDF)</span>
        </a>
        <p class="text-xs text-slate-400">PKM Mahasiswa Universitas Pamulang</p>
      </div>
    </div>

    <!-- Modal Lupa Password / Bantuan Admin -->
    <div 
      v-if="showForgotModal" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      @click.self="showForgotModal = false"
    >
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
        <div class="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
            <path d="m7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        
        <h3 class="text-base font-bold text-slate-800">Lupa Password Akun?</h3>
        <p class="text-xs text-slate-500 mt-1 leading-relaxed">
          Untuk menjaga keamanan data kehadiran, penggantian password akun Siswa atau Guru yang lupa password dibantu langsung oleh <strong>Administrator Sekolah</strong> atau staf Tata Usaha.
        </p>

        <div class="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs text-slate-600">
          <div class="flex items-start gap-2">
            <span class="text-blue-600 font-bold">1.</span>
            <span>Hubungi Admin atau Wali Kelas dengan menyebutkan NISN / NIP Anda.</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-blue-600 font-bold">2.</span>
            <span>Admin akan mereset password akun Anda melalui <strong>Dashboard Admin → Manajemen Akun</strong>.</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-blue-600 font-bold">3.</span>
            <span>Setelah direset oleh Admin, Anda dapat masuk dengan password baru yang diberikan lalu menggantinya sendiri di menu Profil.</span>
          </div>
        </div>

        <div class="mt-6 flex justify-end">
          <Button @click="showForgotModal = false" class="w-full">
            Saya Mengerti
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Button from '../components/ui/Button.vue'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const showForgotModal = ref(false)

async function handleLogin() {
  loading.value = true
  errorMessage.value = ''
  
  const res = await authStore.login(email.value, password.value)
  loading.value = false

  if (res.success) {
    navigateByRole(res.user.role)
  } else {
    errorMessage.value = res.message
  }
}

async function quickLogin(role) {
  loading.value = true
  errorMessage.value = ''
  const res = await authStore.loginWithDemo(role)
  loading.value = false
  if (res.success) {
    navigateByRole(res.user?.role || role)
  } else {
    errorMessage.value = res.message
  }
}

function navigateByRole(role) {
  if (role === 'siswa') router.push('/siswa')
  else if (role === 'guru') router.push('/guru')
  else if (role === 'admin') router.push('/admin')
}
</script>

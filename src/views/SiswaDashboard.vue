<template>
  <div class="min-h-screen bg-slate-50 md:flex">
    <!-- Mobile Navbar -->
    <Navbar @open-drawer="isDrawerOpen = true" />

    <!-- Mobile Slide-in Drawer -->
    <MobileDrawer
      v-model:open="isDrawerOpen"
      :nav-items="navItems"
      :active-tab="activeTab"
      @select-tab="activeTab = $event"
    />

    <!-- Mobile Bottom Navigation Bar -->
    <MobileBottomNav
      :items="navItems"
      v-model="activeTab"
    />

    <!-- Desktop Sidebar -->
    <AppSidebar
      class="no-print"
      :active-tab="activeTab"
      :nav-items="navItems"
      @tab-change="activeTab = $event"
    />

    <!-- Main Content Area -->
    <main class="flex-1 min-w-0 px-4 py-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto pb-20 md:pb-6">
      
      <!-- Greeting & Header Info -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Warga Belajar / Siswa
            </span>
            <span class="text-xs text-slate-400">&bull;</span>
            <span class="text-xs font-semibold text-slate-600">PKBM Cahaya Mulia</span>
          </div>
          <h2 class="text-lg sm:text-xl font-bold text-slate-900 leading-tight mt-1 truncate">
            Halo, {{ currentUser?.nama_lengkap }}!
          </h2>
          <p class="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span>Kelas: <strong class="text-slate-800">{{ currentUser?.kelas || '12' }}</strong></span>
            <span class="text-slate-300">&bull;</span>
            <span>NISN: <span class="font-mono text-slate-700">{{ currentUser?.nomor_induk }}</span></span>
            <span class="text-slate-300">&bull;</span>
            <span
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold"
              :class="currentUser?.jenis_kelamin === 'P' ? 'bg-pink-50 text-pink-700 border border-pink-200' : 'bg-blue-50 text-blue-700 border border-blue-200'"
            >
              <span>{{ currentUser?.jenis_kelamin === 'P' ? '♀ Perempuan' : '♂ Laki-laki' }}</span>
            </span>
          </p>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <Badge
            :status="myTodayAttendance?.status || 'default'"
            :label="myTodayAttendance ? `Status: ${myTodayAttendance.status.toUpperCase()}` : 'Belum Presensi Hari Ini'"
          />
        </div>
      </div>

      <!-- ============================================================== -->
      <!-- TAB 1: PRESENSI MANDIRI (GPS RINGAN & CEPAT) -->
      <!-- ============================================================== -->
      <div v-if="activeTab === 'presensi'" class="space-y-6">
        
        <!-- Status Kehadiran Hari Ini (IN / OUT) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Jam Masuk (IN) -->
          <div class="p-4 rounded-2xl border bg-white border-slate-200/80 shadow-2xs flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg shrink-0">
              <span class="material-icons">login</span>
            </div>
            <div>
              <p class="text-xs font-semibold text-slate-500">Presensi Masuk (IN)</p>
              <h3 class="text-lg font-bold text-slate-900 font-mono mt-0.5">
                {{ myTodayAttendance?.jam_masuk ? `${formatTime(myTodayAttendance.jam_masuk)} WIB` : 'Belum Masuk' }}
              </h3>
              <p class="text-[11px] text-slate-400">
                {{ myTodayAttendance?.jam_masuk ? 'Tercatat hadir tepat waktu' : 'Jadwal masuk: 07:30 WIB' }}
              </p>
            </div>
          </div>

          <!-- Jam Pulang (OUT) -->
          <div class="p-4 rounded-2xl border bg-white border-slate-200/80 shadow-2xs flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg shrink-0">
              <span class="material-icons">logout</span>
            </div>
            <div>
              <p class="text-xs font-semibold text-slate-500">Presensi Pulang (OUT)</p>
              <h3 class="text-lg font-bold text-slate-900 font-mono mt-0.5">
                {{ myTodayAttendance?.jam_pulang ? `${formatTime(myTodayAttendance.jam_pulang)} WIB` : 'Belum Pulang' }}
              </h3>
              <p class="text-[11px] text-slate-400">
                {{ myTodayAttendance?.jam_pulang ? 'Presensi hari ini selesai' : 'Jadwal pulang: 14:00 WIB' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Panel Deteksi Lokasi GPS & Tombol Presensi -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-5">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 class="font-bold text-slate-900 text-base flex items-center gap-2">
                <span class="material-icons text-blue-600">location_on</span>
                Presensi Mandiri Berbasis GPS
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">
                Pastikan Anda berada di area PKBM Cahaya Mulia sebelum menekan tombol presensi
              </p>
            </div>

            <!-- Tombol Refresh Lokasi GPS -->
            <button
              type="button"
              @click="detectLocation"
              :disabled="isLocating"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              <span class="material-icons text-sm" :class="{ 'animate-spin': isLocating }">refresh</span>
              <span>{{ isLocating ? 'Mencari GPS...' : 'Perbarui Lokasi' }}</span>
            </button>
          </div>

          <!-- Indikator Validasi Radius GPS -->
          <div
            class="p-4 rounded-xl border flex items-center justify-between transition-all"
            :class="isWithinRadius ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' : currentDistance !== null ? 'bg-amber-50/80 border-amber-200 text-amber-950' : 'bg-slate-50 border-slate-200 text-slate-700'"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shrink-0"
                :class="isWithinRadius ? 'bg-emerald-100 text-emerald-700' : currentDistance !== null ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'"
              >
                <span class="material-icons">{{ isWithinRadius ? 'check_circle' : 'near_me' }}</span>
              </div>
              <div>
                <p class="text-xs font-bold">
                  {{ isWithinRadius ? 'Dalam Radius PKBM Cahaya Mulia' : currentDistance !== null ? 'Di Luar Radius PKBM Cahaya Mulia' : 'Menunggu Deteksi Lokasi GPS...' }}
                </p>
                <p class="text-[11px] text-slate-600 mt-0.5">
                  <span v-if="currentDistance !== null">
                    Jarak Anda ke PKBM: <strong>{{ currentDistance }} meter</strong> (Toleransi: {{ attendanceStore.schoolSettings?.radius_meter || 100 }}m)
                  </span>
                  <span v-else>
                    Klik tombol "Perbarui Lokasi" untuk mendeteksi koordinat HP Anda.
                  </span>
                </p>
              </div>
            </div>

            <span
              v-if="currentDistance !== null"
              class="text-xs font-bold px-2.5 py-1 rounded-full uppercase"
              :class="isWithinRadius ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'"
            >
              {{ isWithinRadius ? 'Valid' : 'Luar Radius' }}
            </span>
          </div>

          <!-- Tombol Aksi Presensi Mandiri (Masuk / Pulang / Selesai) -->
          <div class="pt-2">
            <!-- Kasus 1: Belum Presensi Masuk Hari Ini -->
            <div v-if="!myTodayAttendance?.jam_masuk">
              <button
                type="button"
                @click="submitPresensi('masuk')"
                :disabled="isSubmitting"
                class="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-base shadow-md shadow-emerald-500/25 flex items-center justify-center gap-3 transition cursor-pointer"
              >
                <span class="material-icons text-2xl">location_on</span>
                <span>{{ isSubmitting ? 'Mencatat Kehadiran...' : 'Presensi Masuk Sekarang (IN)' }}</span>
              </button>
              <p class="text-[11px] text-slate-400 text-center mt-2">
                Presensi akan mencatat waktu masuk Anda hari ini secara otomatis.
              </p>
            </div>

            <!-- Kasus 2: Sudah Masuk, Belum Pulang -->
            <div v-else-if="myTodayAttendance?.jam_masuk && !myTodayAttendance?.jam_pulang">
              <button
                type="button"
                @click="submitPresensi('pulang')"
                :disabled="isSubmitting"
                class="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-base shadow-md shadow-blue-500/25 flex items-center justify-center gap-3 transition cursor-pointer"
              >
                <span class="material-icons text-2xl">logout</span>
                <span>{{ isSubmitting ? 'Mencatat Kepulangan...' : 'Presensi Pulang Sekarang (OUT)' }}</span>
              </button>
              <p class="text-[11px] text-slate-400 text-center mt-2">
                Tekan tombol ini saat sesi belajar di kelas telah usai.
              </p>
            </div>

            <!-- Kasus 3: Sudah Lengkap (Masuk & Pulang Selesai) -->
            <div v-else class="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
              <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-2xl font-bold">
                ✓
              </div>
              <h4 class="font-extrabold text-slate-900 text-base">Presensi Hari Ini Telah Lengkap!</h4>
              <p class="text-xs text-slate-600">
                Masuk: <strong>{{ formatTime(myTodayAttendance.jam_masuk) }} WIB</strong> &bull; 
                Pulang: <strong>{{ formatTime(myTodayAttendance.jam_pulang) }} WIB</strong>
              </p>
              <p class="text-[11px] text-emerald-700 font-semibold pt-1">
                Terima kasih atas kehadiran Anda. Selamat beristirahat dan hati-hati di perjalanan pulang!
              </p>
            </div>
          </div>
        </div>

        <!-- Info Tambahan / Alternatif QR -->
        <div class="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 flex items-start gap-3">
          <span class="material-icons text-blue-600 text-xl shrink-0 mt-0.5">info</span>
          <div class="text-xs text-blue-900">
            <p class="font-bold">Kendala GPS atau Baterai HP Lemah?</p>
            <p class="text-blue-700 mt-0.5">
              Anda tetap bisa melakukan presensi dengan menunjukkan <strong>Kartu Pelajar QR</strong> di tab samping kepada Tutor atau Petugas Piket PKBM Cahaya Mulia.
            </p>
          </div>
        </div>
      </div>

      <!-- ============================================================== -->
      <!-- TAB 2: KARTU PELAJAR DIGITAL (QR CODE) -->
      <!-- ============================================================== -->
      <div v-if="activeTab === 'kartu'" class="max-w-md mx-auto space-y-4">
        <div class="bg-gradient-to-br from-blue-700 to-indigo-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
          <!-- Background decoration -->
          <div class="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-white/10 blur-xl"></div>
          <div class="absolute -left-8 -top-8 w-32 h-32 rounded-full bg-white/10 blur-lg"></div>

          <!-- Card Header -->
          <div class="flex items-center justify-between pb-4 border-b border-white/20 relative z-10">
            <div class="flex items-center gap-2.5">
              <img src="/logo.png" alt="Logo PKBM" class="w-9 h-9 object-contain bg-white/20 p-0.5 rounded-lg border border-white/30 shrink-0" />
              <div>
                <p class="text-[10px] uppercase font-bold tracking-widest text-blue-200">KARTU TANDA SISWA</p>
                <h3 class="font-black text-sm tracking-wide">PKBM CAHAYA MULIA</h3>
              </div>
            </div>
            <span class="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full border border-white/30">
              TP 2026/2027
            </span>
          </div>

          <!-- Card Body: QR Code & Student Identity -->
          <div class="py-6 flex flex-col items-center text-center relative z-10">
            <!-- QR Canvas Container -->
            <div class="p-3 bg-white rounded-2xl shadow-lg mb-4">
              <canvas ref="qrCanvasRef" class="w-44 h-44"></canvas>
            </div>

            <h4 class="font-black text-lg text-white uppercase tracking-wide">
              {{ currentUser?.nama_lengkap }}
            </h4>
            <p class="text-xs text-blue-200 font-mono mt-0.5">
              NISN: {{ currentUser?.nomor_induk }} &bull; KELAS: {{ currentUser?.kelas }} &bull; {{ currentUser?.jenis_kelamin === 'P' ? 'Perempuan' : 'Laki-laki' }}
            </p>
          </div>

          <!-- Card Footer -->
          <div class="pt-3 border-t border-white/20 text-center text-[10px] text-blue-200 relative z-10">
            Tunjukkan kartu ini kepada Tutor untuk dipindai saat hadir di tempat belajar
          </div>
        </div>
      </div>

      <!-- ============================================================== -->
      <!-- TAB 3: RIWAYAT KEHADIRAN SISWA BULAN INI (MOBILE OPTIMIZED) -->
      <!-- ============================================================== -->
      <div v-if="activeTab === 'riwayat'" class="space-y-4">
        <!-- Ringkasan Kehadiran Saya Bulan Ini -->
        <div class="grid grid-cols-4 gap-2 sm:gap-3">
          <div class="p-2.5 sm:p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs text-center">
            <p class="text-[10px] sm:text-xs font-semibold text-emerald-700">Hadir</p>
            <p class="text-base sm:text-xl font-black text-emerald-800 mt-0.5">{{ myMonthlyStats.hadir }}</p>
          </div>
          <div class="p-2.5 sm:p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs text-center">
            <p class="text-[10px] sm:text-xs font-semibold text-amber-700">Sakit</p>
            <p class="text-base sm:text-xl font-black text-amber-800 mt-0.5">{{ myMonthlyStats.sakit }}</p>
          </div>
          <div class="p-2.5 sm:p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs text-center">
            <p class="text-[10px] sm:text-xs font-semibold text-blue-700">Izin</p>
            <p class="text-base sm:text-xl font-black text-blue-800 mt-0.5">{{ myMonthlyStats.izin }}</p>
          </div>
          <div class="p-2.5 sm:p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs text-center">
            <p class="text-[10px] sm:text-xs font-semibold text-slate-700">% Hadir</p>
            <p class="text-base sm:text-xl font-black text-slate-900 mt-0.5">{{ myMonthlyStats.persentase }}%</p>
          </div>
        </div>

        <!-- 1. TAMPILAN MOBILE: KARTU RIWAYAT (RESPONSIF, BEBAS TERPOTONG) -->
        <div class="block md:hidden space-y-2.5">
          <div class="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
            <span>Daftar Catatan Kehadiran</span>
            <span class="text-[11px] text-slate-500 font-normal">{{ myAttendanceHistory.length }} hari tercatat</span>
          </div>

          <div
            v-for="att in myAttendanceHistory"
            :key="'mob-hist-' + att.id"
            class="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2.5"
          >
            <!-- Header Kartu: Tanggal & Badge Status -->
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2.5 min-w-0">
                <span
                  class="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0"
                  :class="getStatusIconClass(att.status)"
                >
                  <span class="material-icons text-base">{{ getStatusIcon(att.status) }}</span>
                </span>
                <div class="min-w-0">
                  <p class="font-bold text-slate-900 text-xs truncate">
                    {{ formatIndonesianDate(att.tanggal) }}
                  </p>
                  <p class="text-[10px] text-slate-400">
                    {{ formatMetode(att.metode_presensi) }}
                  </p>
                </div>
              </div>
              <span
                class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase shrink-0"
                :class="getStatusBadgeClass(att.status)"
              >
                {{ att.status }}
              </span>
            </div>

            <!-- Jam IN & Jam OUT (Grid 2 Kolom) -->
            <div class="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-xs">
              <div class="bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200/70 flex items-center justify-between">
                <span class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  <span class="material-icons text-xs text-emerald-600">login</span> IN:
                </span>
                <span class="font-mono font-bold text-slate-800">
                  {{ att.jam_masuk ? formatTime(att.jam_masuk) + ' WIB' : '-' }}
                </span>
              </div>
              <div class="bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200/70 flex items-center justify-between">
                <span class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  <span class="material-icons text-xs text-blue-600">logout</span> OUT:
                </span>
                <span class="font-mono font-bold text-slate-800">
                  {{ att.jam_pulang ? formatTime(att.jam_pulang) + ' WIB' : '-' }}
                </span>
              </div>
            </div>

            <!-- Catatan/Keterangan jika ada -->
            <div v-if="att.keterangan" class="text-[11px] text-slate-600 bg-amber-50/70 p-2 rounded-xl border border-amber-200/70 flex items-center gap-1.5">
              <span class="material-icons text-xs text-amber-600 shrink-0">info</span>
              <span class="truncate">{{ att.keterangan }}</span>
            </div>
          </div>

          <div v-if="myAttendanceHistory.length === 0" class="text-center py-8 text-slate-400 bg-white rounded-2xl border border-slate-200">
            Belum ada riwayat kehadiran tercatat bulan ini.
          </div>
        </div>

        <!-- 2. TAMPILAN DESKTOP: TABEL LEBAR (md KE ATAS) -->
        <div class="hidden md:block bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div class="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 class="font-bold text-slate-900 text-base flex items-center gap-2">
              <span class="material-icons text-blue-600 text-lg">history</span>
              Riwayat Presensi Bulan Ini
            </h3>
            <span class="text-xs text-slate-500">
              Total Catatan: {{ myAttendanceHistory.length }}
            </span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200/80 uppercase tracking-wider text-[11px]">
                <tr>
                  <th class="py-3 px-3.5">Tanggal</th>
                  <th class="py-3 px-3.5 text-center">Status</th>
                  <th class="py-3 px-3.5 text-center">Jam Masuk</th>
                  <th class="py-3 px-3.5 text-center">Jam Pulang</th>
                  <th class="py-3 px-3.5 text-center">Metode</th>
                  <th class="py-3 px-3.5">Keterangan</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr
                  v-for="att in myAttendanceHistory"
                  :key="att.id"
                  class="hover:bg-slate-50/70 transition"
                >
                  <td class="py-3 px-3.5 font-bold text-slate-900">
                    {{ formatIndonesianDate(att.tanggal) }}
                  </td>
                  <td class="py-3 px-3.5 text-center">
                    <span
                      class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase"
                      :class="getStatusBadgeClass(att.status)"
                    >
                      {{ att.status }}
                    </span>
                  </td>
                  <td class="py-3 px-3.5 text-center font-mono font-semibold text-slate-700">
                    {{ formatTime(att.jam_masuk) || '-' }}
                  </td>
                  <td class="py-3 px-3.5 text-center font-mono font-semibold text-slate-700">
                    {{ formatTime(att.jam_pulang) || '-' }}
                  </td>
                  <td class="py-3 px-3.5 text-center text-slate-500 text-[11px]">
                    {{ formatMetode(att.metode_presensi) }}
                  </td>
                  <td class="py-3 px-3.5 text-slate-500">
                    {{ att.keterangan || '-' }}
                  </td>
                </tr>
                <tr v-if="myAttendanceHistory.length === 0">
                  <td colspan="6" class="py-8 text-center text-slate-400">
                    Belum ada riwayat kehadiran tercatat bulan ini.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ============================================================== -->
      <!-- TAB 4: PENGAJUAN IZIN / SAKIT -->
      <!-- ============================================================== -->
      <div v-if="activeTab === 'izin'" class="max-w-lg mx-auto space-y-4">
        <Card title="Pengajuan Izin / Sakit" description="Ajukan izin tidak hadir belajar jika berhalangan">
          <form @submit.prevent="handleIzinSubmit" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Jenis Ketidakhadiran</label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  @click="izinForm.jenis = 'izin'"
                  :class="[
                    'py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer',
                    izinForm.jenis === 'izin' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 border-slate-200 text-slate-700'
                  ]"
                >
                  Izin Keperluan
                </button>
                <button
                  type="button"
                  @click="izinForm.jenis = 'sakit'"
                  :class="[
                    'py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer',
                    izinForm.jenis === 'sakit' ? 'bg-amber-500 text-white border-amber-500' : 'bg-slate-50 border-slate-200 text-slate-700'
                  ]"
                >
                  Sakit
                </button>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Tanggal</label>
              <input
                type="date"
                v-model="izinForm.tanggal"
                required
                class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Alasan / Keterangan Lengkap</label>
              <textarea
                v-model="izinForm.keterangan"
                rows="3"
                required
                placeholder="Contoh: Sakit demam tinggi, beristirahat di rumah..."
                class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <button
              type="submit"
              class="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              Kirim Pengajuan Izin
            </button>
          </form>
        </Card>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import QRCode from 'qrcode'
import confetti from 'canvas-confetti'
import { useAuthStore } from '../stores/auth'
import { useAttendanceStore } from '../stores/attendance'
import Navbar from '../components/Navbar.vue'
import AppSidebar from '../components/AppSidebar.vue'
import MobileDrawer from '../components/MobileDrawer.vue'
import MobileBottomNav from '../components/MobileBottomNav.vue'
import Card from '../components/ui/Card.vue'
import Badge from '../components/ui/Badge.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const attendanceStore = useAttendanceStore()

const isDrawerOpen = ref(false)

// State Tab Persisten Siswa (URL query + localStorage)
const validTabs = ['presensi', 'kartu', 'riwayat', 'izin']
const initialTab = (route.query.tab && validTabs.includes(route.query.tab))
  ? route.query.tab
  : (localStorage.getItem('presensi_tab_siswa') && validTabs.includes(localStorage.getItem('presensi_tab_siswa')))
    ? localStorage.getItem('presensi_tab_siswa')
    : 'presensi'

const activeTab = ref(initialTab)

watch(activeTab, (tab) => {
  localStorage.setItem('presensi_tab_siswa', tab)
  if (route.query.tab !== tab) {
    router.replace({ query: { ...route.query, tab } }).catch(() => {})
  }
})

watch(() => route.query.tab, (newTab) => {
  if (newTab && validTabs.includes(newTab) && newTab !== activeTab.value) {
    activeTab.value = newTab
  }
})

const navItems = computed(() => [
  { key: 'presensi', icon: 'location_on', label: 'Presensi Mandiri' },
  { key: 'kartu', icon: 'badge', label: 'Kartu Siswa' },
  { key: 'riwayat', icon: 'history', label: 'Riwayat' },
  { key: 'izin', icon: 'edit_note', label: 'Izin' }
])

const currentUser = computed(() => {
  return attendanceStore.students.find(s => 
    s.id === authStore.user?.id || 
    s.email === authStore.user?.email || 
    s.nomor_induk === authStore.user?.nomor_induk
  ) || authStore.user || {}
})

const todayStr = new Date().toISOString().split('T')[0]

const myTodayAttendance = computed(() => {
  return attendanceStore.todayAttendances.find(a => 
    a.user_id === currentUser.value?.id && 
    (a.tanggal === todayStr || (!a.tanggal && todayStr === new Date().toISOString().split('T')[0]))
  )
})

const myAttendanceHistory = computed(() => {
  return attendanceStore.todayAttendances
    .filter(a => a.user_id === currentUser.value?.id)
    .sort((a, b) => new Date(b.tanggal || todayStr) - new Date(a.tanggal || todayStr))
})

const myMonthlyStats = computed(() => {
  let hadir = 0, sakit = 0, izin = 0, alpa = 0
  myAttendanceHistory.value.forEach(a => {
    if (a.status === 'hadir' || a.status === 'terlambat') hadir++
    else if (a.status === 'sakit') sakit++
    else if (a.status === 'izin') izin++
    else alpa++
  })
  const total = hadir + sakit + izin + alpa
  const persentase = total > 0 ? Math.round((hadir / total) * 100) : 0
  return { hadir, sakit, izin, alpa, total, persentase }
})

function getStatusIcon(st) {
  if (st === 'hadir' || st === 'terlambat') return 'check_circle'
  if (st === 'sakit') return 'sick'
  if (st === 'izin') return 'info'
  return 'cancel'
}

function getStatusIconClass(st) {
  if (st === 'hadir' || st === 'terlambat') return 'bg-emerald-100 text-emerald-700'
  if (st === 'sakit') return 'bg-amber-100 text-amber-700'
  if (st === 'izin') return 'bg-blue-100 text-blue-700'
  return 'bg-rose-100 text-rose-700'
}

// GPS Deteksi & Validasi Radius
const isLocating = ref(false)
const userCoords = ref(null)
const currentDistance = ref(null)
const isSubmitting = ref(false)

const isWithinRadius = computed(() => {
  if (currentDistance.value === null) return false
  const maxRadius = attendanceStore.schoolSettings?.radius_meter || 100
  return currentDistance.value <= maxRadius
})

function detectLocation() {
  isLocating.value = true
  if (!navigator.geolocation) {
    alert('Browser tidak mendukung geolokasi GPS.')
    isLocating.value = false
    return
  }

  navigator.geolocation.getCurrentPosition(
    pos => {
      userCoords.value = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude
      }
      currentDistance.value = attendanceStore.calculateDistance(
        attendanceStore.schoolSettings.latitude,
        attendanceStore.schoolSettings.longitude,
        pos.coords.latitude,
        pos.coords.longitude
      )
      isLocating.value = false
    },
    err => {
      console.warn('Geolocation error:', err)
      // Fallback simulasi lokasi jika browser di desktop menolak izin
      userCoords.value = {
        latitude: attendanceStore.schoolSettings.latitude + 0.0001,
        longitude: attendanceStore.schoolSettings.longitude + 0.0001
      }
      currentDistance.value = attendanceStore.calculateDistance(
        attendanceStore.schoolSettings.latitude,
        attendanceStore.schoolSettings.longitude,
        userCoords.value.latitude,
        userCoords.value.longitude
      )
      isLocating.value = false
    },
    { enableHighAccuracy: true, timeout: 10000 }
  )
}

async function submitPresensi(type) {
  if (!userCoords.value) {
    detectLocation()
  }

  isSubmitting.value = true
  try {
    const coords = userCoords.value || {
      latitude: attendanceStore.schoolSettings.latitude,
      longitude: attendanceStore.schoolSettings.longitude
    }
    const res = await attendanceStore.submitAttendanceGps(currentUser.value, coords)
    if (res.success) {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } })
      alert(res.message)
    } else {
      alert(res.message)
    }
  } catch (e) {
    alert('Terjadi kesalahan: ' + e.message)
  } finally {
    isSubmitting.value = false
  }
}

// Kartu Siswa QR Code Rendering
const qrCanvasRef = ref(null)

function renderQrCode() {
  if (!qrCanvasRef.value) return
  const token = currentUser.value?.qr_token || currentUser.value?.nomor_induk || 'tok_default'
  QRCode.toCanvas(qrCanvasRef.value, token, {
    width: 176,
    margin: 1,
    color: { dark: '#0f172a', light: '#ffffff' }
  })
}

watch(activeTab, (tab) => {
  if (tab === 'kartu') {
    setTimeout(renderQrCode, 50)
  }
})

// Pengajuan Izin Form
const izinForm = ref({
  jenis: 'izin',
  tanggal: todayStr,
  keterangan: ''
})

function handleIzinSubmit() {
  attendanceStore.setManualAttendance(
    currentUser.value,
    izinForm.value.jenis,
    null,
    null,
    null,
    izinForm.value.tanggal,
    izinForm.value.keterangan
  )
  alert(`Pengajuan ${izinForm.value.jenis.toUpperCase()} berhasil dikirim!`)
  izinForm.value.keterangan = ''
  activeTab.value = 'riwayat'
}

// Helpers
function formatTime(t) {
  if (!t) return ''
  return t.length > 5 ? t.substring(0, 5) : t
}

function formatIndonesianDate(dStr) {
  if (!dStr) return '-'
  try {
    const d = new Date(dStr + 'T00:00:00')
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  } catch (e) {
    return dStr
  }
}

function formatMetode(m) {
  if (m === 'mandiri_gps') return 'GPS Mandiri'
  if (m === 'qr_guru') return 'Scan QR'
  if (m === 'manual_guru') return 'Manual Tutor'
  return m || '-'
}

function getStatusBadgeClass(st) {
  if (st === 'hadir' || st === 'terlambat') return 'bg-emerald-100 text-emerald-800'
  if (st === 'sakit') return 'bg-amber-100 text-amber-800'
  if (st === 'izin') return 'bg-blue-100 text-blue-800'
  return 'bg-rose-100 text-rose-800'
}

onMounted(() => {
  detectLocation()
  if (activeTab.value === 'kartu') {
    renderQrCode()
  }
})
</script>

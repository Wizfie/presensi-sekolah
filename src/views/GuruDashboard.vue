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
    <main class="flex-1 min-w-0 p-4 sm:p-6 space-y-6 overflow-y-auto pb-20 md:pb-6">
      
      <!-- Top Greeting & Identity Banner -->
      <div class="no-print bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Guru Piket &bull; Tutor PKBM
            </span>
            <span class="text-xs text-slate-400">&bull;</span>
          </div>
          <h2 class="text-lg sm:text-xl font-bold text-slate-900 mt-1">
            {{ currentTeacher?.nama_lengkap || authStore.user?.nama_lengkap || 'Guru Piket PKBM' }}
          </h2>
          <p class="text-xs text-slate-500">
            {{ attendanceStore.schoolSettings?.nama_sekolah || 'PKBM Cahaya Mulia' }} &bull; NIP: {{ currentTeacher?.nomor_induk || '-' }}
          </p>
        </div>

        <!-- Mode Indicator -->
        <div class="flex items-center gap-2 shrink-0">
          <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            Presensi Datang &amp; Pulang (IN / OUT)
          </span>
        </div>
      </div>

      <!-- ============================================================== -->
      <!-- TAB 1: PRESENSI HARIAN KELAS (MANUAL - IGNORE LOCATION) -->
      <!-- ============================================================== -->
      <div v-if="activeTab === 'manual'" class="space-y-4">
        <!-- Control Bar: Filter Kelas, Tanggal, Pencarian & Aksi Cepat (Mobile Optimized) -->
        <div class="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div class="grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center gap-2.5">
            <!-- Filter Kelas -->
            <div class="flex items-center gap-1.5 col-span-1">
              <label class="text-[11px] sm:text-xs font-bold text-slate-700 shrink-0">Kelas:</label>
              <select
                v-model="selectedClass"
                class="w-full sm:w-auto px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option v-for="cls in availableClasses" :key="cls" :value="cls">
                  Kelas {{ cls }}
                </option>
              </select>
            </div>

            <!-- Filter Tanggal -->
            <div class="flex items-center gap-1.5 col-span-1">
              <label class="text-[11px] sm:text-xs font-bold text-slate-700 shrink-0">Tgl:</label>
              <input
                type="date"
                v-model="selectedDate"
                class="w-full sm:w-auto px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <!-- Pencarian Cepat Nama / NISN -->
            <div class="col-span-2 sm:col-span-1 w-full sm:w-56 relative">
              <input
                v-model="studentSearchQuery"
                type="text"
                placeholder="Cari nama / NISN..."
                class="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <span class="material-icons absolute left-2.5 top-2 text-slate-400 text-sm">search</span>
              <button
                v-if="studentSearchQuery"
                type="button"
                @click="studentSearchQuery = ''"
                class="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs"
              >
                &times;
              </button>
            </div>

            <!-- Keterangan Bebas Lokasi (Desktop only / small pill) -->
            <span class="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg ml-auto">
              <span class="material-icons text-xs text-slate-400">fmd_good</span>
              Ignore Location
            </span>
          </div>

          <!-- Tombol Aksi Cepat (Grid 3 Kolom di Mobile, Flex di Desktop) -->
          <div class="grid grid-cols-2 sm:flex sm:items-center sm:justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              @click="handleBatchAllPresent"
              class="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer select-none"
              title="Set semua siswa yang belum absen hari ini menjadi Hadir"
            >
              <span class="material-icons text-sm">done_all</span>
              <span>Tandai Hadir Semua</span>
            </button>
            <button
              type="button"
              @click="handleBatchAllCheckOut"
              class="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer select-none"
              title="Set jam pulang bersama untuk semua siswa yang berstatus Hadir"
            >
              <span class="material-icons text-sm">logout</span>
              <span>Set Pulang Semua</span>
            </button>
            <button
              type="button"
              @click="activeTab = 'scan'"
              class="col-span-2 sm:col-span-1 w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer select-none"
            >
              <span class="material-icons text-sm">qr_code_scanner</span>
              <span>Buka Scanner</span>
            </button>
          </div>
        </div>

        <!-- Ringkasan Kehadiran Kelas (Mobile 2 Kolom, Desktop 5 Kolom) -->
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
          <div class="p-2.5 sm:p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
            <p class="text-[10px] sm:text-[11px] font-semibold text-slate-500">Total Siswa</p>
            <p class="text-base sm:text-xl font-bold text-slate-900 mt-0.5">{{ classStudents.length }}</p>
          </div>
          <div class="p-2.5 sm:p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 shadow-2xs">
            <p class="text-[10px] sm:text-[11px] font-semibold text-emerald-700">Hadir</p>
            <p class="text-base sm:text-xl font-bold text-emerald-800 mt-0.5">{{ attendanceStats.hadir }}</p>
          </div>
          <div class="p-2.5 sm:p-3 bg-amber-50/70 rounded-xl border border-amber-200 shadow-2xs">
            <p class="text-[10px] sm:text-[11px] font-semibold text-amber-700">Sakit</p>
            <p class="text-base sm:text-xl font-bold text-amber-800 mt-0.5">{{ attendanceStats.sakit }}</p>
          </div>
          <div class="p-2.5 sm:p-3 bg-blue-50/70 rounded-xl border border-blue-200 shadow-2xs">
            <p class="text-[10px] sm:text-[11px] font-semibold text-blue-700">Izin</p>
            <p class="text-base sm:text-xl font-bold text-blue-800 mt-0.5">{{ attendanceStats.izin }}</p>
          </div>
          <div class="p-2.5 sm:p-3 bg-rose-50/70 rounded-xl border border-rose-200 shadow-2xs col-span-2 sm:col-span-1">
            <p class="text-[10px] sm:text-[11px] font-semibold text-rose-700">Alpa / Belum</p>
            <p class="text-base sm:text-xl font-bold text-rose-800 mt-0.5">{{ attendanceStats.alpa }}</p>
          </div>
        </div>

        <!-- ============================================================== -->
        <!-- 1. TAMPILAN MOBILE: KARTU SISWA (RAMAH SENTUHAN, TIDAK TERPOTONG) -->
        <!-- ============================================================== -->
        <div class="block md:hidden space-y-3">
          <div class="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
            <span>Daftar Siswa ({{ filteredClassStudents.length }})</span>
            <span class="text-[11px] text-slate-500 font-normal">Sentuh status untuk mengubah</span>
          </div>

          <div
            v-for="(std, idx) in filteredClassStudents"
            :key="'mob-' + std.id"
            class="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 transition-all"
          >
            <!-- Baris Atas: Nomor, Nama Siswa, NISN, Badge L/P -->
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-2.5 min-w-0">
                <span class="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                  {{ idx + 1 }}
                </span>
                <div class="min-w-0">
                  <h4 class="font-bold text-slate-900 text-sm leading-tight truncate">
                    {{ std.nama_lengkap }}
                  </h4>
                  <p class="text-[11px] text-slate-500 font-mono mt-0.5">
                    NISN: {{ std.nomor_induk }}
                  </p>
                </div>
              </div>
              <span
                class="px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 flex items-center gap-1"
                :class="std.jenis_kelamin === 'P' ? 'bg-pink-50 text-pink-700 border border-pink-200' : 'bg-blue-50 text-blue-700 border border-blue-200'"
                :title="std.jenis_kelamin === 'P' ? 'Perempuan' : 'Laki-laki'"
              >
                <span>{{ std.jenis_kelamin === 'P' ? '♀ Perempuan' : '♂ Laki-laki' }}</span>
              </span>
            </div>

            <!-- Tombol Status Kehadiran (Grid 4 Kolom Penuh: Hadir, Sakit, Izin, Alpa) -->
            <div>
              <div class="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  @click="changeStatus(std, 'hadir')"
                  :class="[
                    'py-2 rounded-lg text-xs font-bold transition flex items-center justify-center active:scale-95 cursor-pointer',
                    getStudentAttendance(std.id)?.status === 'hadir' || getStudentAttendance(std.id)?.status === 'terlambat'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  ]"
                >
                  <span>Hadir</span>
                </button>
                <button
                  type="button"
                  @click="changeStatus(std, 'sakit')"
                  :class="[
                    'py-2 rounded-lg text-xs font-bold transition flex items-center justify-center active:scale-95 cursor-pointer',
                    getStudentAttendance(std.id)?.status === 'sakit'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  ]"
                >
                  <span>Sakit</span>
                </button>
                <button
                  type="button"
                  @click="changeStatus(std, 'izin')"
                  :class="[
                    'py-2 rounded-lg text-xs font-bold transition flex items-center justify-center active:scale-95 cursor-pointer',
                    getStudentAttendance(std.id)?.status === 'izin'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  ]"
                >
                  <span>Izin</span>
                </button>
                <button
                  type="button"
                  @click="changeStatus(std, 'alpa')"
                  :class="[
                    'py-2 rounded-lg text-xs font-bold transition flex items-center justify-center active:scale-95 cursor-pointer',
                    !getStudentAttendance(std.id) || getStudentAttendance(std.id)?.status === 'alpa'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  ]"
                >
                  <span>Alpa</span>
                </button>
              </div>
            </div>

            <!-- Jam IN & Jam OUT (Grid 2 Kolom) -->
            <div class="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
              <div class="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                <span class="text-[10px] font-bold text-slate-500 uppercase shrink-0">IN:</span>
                <input
                  type="text"
                  :value="formatTimeDisplay(getStudentAttendance(std.id)?.jam_masuk)"
                  @change="updateJamMasuk(std, $event.target.value)"
                  placeholder="07:30"
                  class="w-full bg-transparent text-xs font-mono font-bold text-slate-800 focus:outline-none"
                />
              </div>
              <div class="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                <span class="text-[10px] font-bold text-slate-500 uppercase shrink-0">OUT:</span>
                <input
                  type="text"
                  :value="formatTimeDisplay(getStudentAttendance(std.id)?.jam_pulang)"
                  @change="updateJamPulang(std, $event.target.value)"
                  placeholder="14:00"
                  class="w-full bg-transparent text-xs font-mono font-bold text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <!-- Input Catatan/Keterangan & Metadata Pencatat -->
            <div class="space-y-1.5">
              <input
                type="text"
                :value="getStudentAttendance(std.id)?.keterangan || ''"
                @change="updateKeterangan(std, $event.target.value)"
                placeholder="Catatan / keterangan (opsional)..."
                class="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div v-if="getStudentAttendance(std.id)" class="flex items-center justify-between text-[10px] text-slate-400 px-0.5">
                <span class="flex items-center gap-1 truncate">
                  <span class="material-icons text-[12px] text-slate-400">info_outline</span>
                  <span v-if="getStudentAttendance(std.id)?.metode_presensi === 'mandiri_gps'" class="text-blue-600 font-medium">Presensi Mandiri Siswa (GPS)</span>
                  <span v-else-if="getStudentAttendance(std.id)?.metode_presensi === 'qr_guru'" class="text-purple-600 font-medium">Scan QR ({{ getStudentAttendance(std.id)?.dicatat_oleh || 'Guru' }})</span>
                  <span v-else class="text-slate-600 font-medium">Dicatat: {{ getStudentAttendance(std.id)?.dicatat_oleh || 'Guru' }}</span>
                </span>
                <span v-if="getStudentAttendance(std.id)?.jam_masuk" class="font-mono text-slate-500 shrink-0">
                  {{ formatTimeDisplay(getStudentAttendance(std.id)?.jam_masuk) }}
                </span>
              </div>
            </div>
          </div>

          <div v-if="filteredClassStudents.length === 0" class="text-center py-8 text-slate-400 bg-white rounded-2xl border border-slate-200">
            Tidak ada siswa ditemukan dengan kata kunci "{{ studentSearchQuery }}".
          </div>
        </div>

        <!-- ============================================================== -->
        <!-- 2. TAMPILAN DESKTOP: TABEL LEBAR (TAMPIL DI LAYAR md KE ATAS) -->
        <!-- ============================================================== -->
        <div class="hidden md:block bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div class="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 class="font-bold text-slate-900 text-base flex items-center gap-2">
              <span class="material-icons text-blue-600 text-lg">list_alt</span>
              Daftar Kehadiran Siswa Kelas {{ selectedClass }} &bull; {{ formattedSelectedDate }}
            </h3>
            <span class="text-xs text-slate-500">
              Menampilkan {{ filteredClassStudents.length }} siswa
            </span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200/80 uppercase tracking-wider text-[11px]">
                <tr>
                  <th class="py-3 px-3.5 text-center w-12">No</th>
                  <th class="py-3 px-3.5">Nama Siswa</th>
                  <th class="py-3 px-2 text-center w-14" title="Jenis Kelamin (Laki-laki / Perempuan)">L/P</th>
                  <th class="py-3 px-3.5 text-center w-52">Status Kehadiran</th>
                  <th class="py-3 px-3.5 text-center w-28">Jam IN</th>
                  <th class="py-3 px-3.5 text-center w-28">Jam OUT</th>
                  <th class="py-3 px-3.5">Keterangan</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr
                  v-for="(std, idx) in filteredClassStudents"
                  :key="std.id"
                  class="hover:bg-slate-50/70 transition"
                >
                  <td class="py-3 px-3.5 text-center font-bold text-slate-500">
                    {{ idx + 1 }}
                  </td>
                  <td class="py-3 px-3.5">
                    <p class="font-bold text-slate-900">{{ std.nama_lengkap }}</p>
                    <p class="text-[10px] text-slate-400">NISN: {{ std.nomor_induk }}</p>
                  </td>
                  <td class="py-3 px-2 text-center" :title="std.jenis_kelamin === 'P' ? 'Perempuan' : 'Laki-laki'">
                    <span
                      class="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[11px] font-bold"
                      :class="std.jenis_kelamin === 'P' ? 'bg-pink-50 text-pink-700 border border-pink-200' : 'bg-blue-50 text-blue-700 border border-blue-200'"
                    >
                      {{ std.jenis_kelamin === 'P' ? '♀ P' : '♂ L' }}
                    </span>
                  </td>
                  <td class="py-3 px-3.5 text-center">
                    <!-- Status Toggle Pills -->
                    <div class="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200">
                      <button
                        type="button"
                        @click="changeStatus(std, 'hadir')"
                        :class="[
                          'px-2 py-1 rounded-md text-[11px] font-bold transition cursor-pointer',
                          getStudentAttendance(std.id)?.status === 'hadir' || getStudentAttendance(std.id)?.status === 'terlambat'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        ]"
                      >
                        Hadir
                      </button>
                      <button
                        type="button"
                        @click="changeStatus(std, 'sakit')"
                        :class="[
                          'px-2 py-1 rounded-md text-[11px] font-bold transition cursor-pointer',
                          getStudentAttendance(std.id)?.status === 'sakit'
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        ]"
                      >
                        Sakit
                      </button>
                      <button
                        type="button"
                        @click="changeStatus(std, 'izin')"
                        :class="[
                          'px-2 py-1 rounded-md text-[11px] font-bold transition cursor-pointer',
                          getStudentAttendance(std.id)?.status === 'izin'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        ]"
                      >
                        Izin
                      </button>
                      <button
                        type="button"
                        @click="changeStatus(std, 'alpa')"
                        :class="[
                          'px-2 py-1 rounded-md text-[11px] font-bold transition cursor-pointer',
                          !getStudentAttendance(std.id) || getStudentAttendance(std.id)?.status === 'alpa'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        ]"
                      >
                        Alpa
                      </button>
                    </div>
                  </td>
                  <td class="py-3 px-3.5 text-center">
                    <input
                      type="text"
                      :value="formatTimeDisplay(getStudentAttendance(std.id)?.jam_masuk)"
                      @change="updateJamMasuk(std, $event.target.value)"
                      placeholder="--:--"
                      class="w-20 px-2 py-1 text-center bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td class="py-3 px-3.5 text-center">
                    <input
                      type="text"
                      :value="formatTimeDisplay(getStudentAttendance(std.id)?.jam_pulang)"
                      @change="updateJamPulang(std, $event.target.value)"
                      placeholder="--:--"
                      class="w-20 px-2 py-1 text-center bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td class="py-3 px-3.5">
                    <div class="flex items-center gap-1.5">
                      <input
                        type="text"
                        :value="getStudentAttendance(std.id)?.keterangan || ''"
                        @change="updateKeterangan(std, $event.target.value)"
                        placeholder="Catatan..."
                        class="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <span
                        v-if="getStudentAttendance(std.id)?.metode_presensi"
                        class="shrink-0 text-[10px] font-semibold"
                        :title="`Metode: ${getStudentAttendance(std.id)?.metode_presensi}\nPencatat: ${getStudentAttendance(std.id)?.dicatat_oleh || '-'}`"
                      >
                        <span v-if="getStudentAttendance(std.id)?.metode_presensi === 'mandiri_gps'" class="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">GPS</span>
                        <span v-else-if="getStudentAttendance(std.id)?.metode_presensi === 'qr_guru'" class="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">QR</span>
                        <span v-else class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">Manual</span>
                      </span>
                    </div>
                  </td>
                </tr>
                <tr v-if="filteredClassStudents.length === 0">
                  <td colspan="7" class="py-8 text-center text-slate-400">
                    Tidak ada siswa ditemukan dengan kata kunci "{{ studentSearchQuery }}".
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ============================================================== -->
      <!-- TAB 2: SCANNER QR SISWA (IGNORE LOCATION - BEBAS LOKASI) -->
      <!-- ============================================================== -->
      <div v-if="activeTab === 'scan'" class="space-y-4">
        <!-- Top Scanner Info Bar -->
        <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 class="font-bold text-slate-900 text-base">Scanner QR Meja Piket (Datang &amp; Pulang)</h3>
            </div>
            <p class="text-xs text-slate-500 mt-0.5">
              Pindai kartu siswa saat kedatangan (IN) dan kepulangan (OUT) &bull; <strong>Meja Piket (Ignore Location)</strong>
            </p>
          </div>

          <div class="flex items-center gap-2">
            <button
              v-if="isScanning"
              type="button"
              @click="stopScanner"
              class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <span class="material-icons text-sm">videocam_off</span>
              <span>Matikan Kamera</span>
            </button>
            <button
              v-else
              type="button"
              @click="startScanner"
              class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <span class="material-icons text-sm">videocam</span>
              <span>Nyalakan Kamera</span>
            </button>
          </div>
        </div>

        <!-- Scanner Area -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Video Scanner Container -->
          <Card title="Kamera Pemindai" description="Arahkan QR Code kartu siswa ke dalam kotak pemindai">
            <div class="relative w-full aspect-square max-w-sm mx-auto bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-800 shadow-md">
              <div id="qr-reader" class="w-full h-full"></div>

              <!-- Idle placeholder when camera is OFF -->
              <div v-if="!isScanning" class="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white bg-slate-900">
                <div class="w-16 h-16 rounded-2xl bg-blue-600/30 text-blue-400 flex items-center justify-center mb-3">
                  <span class="material-icons text-3xl">qr_code_scanner</span>
                </div>
                <h4 class="font-bold text-sm">Kamera Sedang Nonaktif</h4>
                <p class="text-xs text-slate-400 mt-1 max-w-xs">
                  Klik tombol "Nyalakan Kamera" untuk mulai memindai kartu presensi siswa.
                </p>
                <button
                  type="button"
                  @click="startScanner"
                  class="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
                >
                  Nyalakan Kamera Sekarang
                </button>
              </div>
            </div>
          </Card>

          <!-- Live Scan Result Card -->
          <Card title="Hasil Pemindaian Terakhir" description="Data kehadiran siswa yang baru saja dipindai">
            <div v-if="lastScannedStudent" class="space-y-4">
              <div
                class="p-4 rounded-2xl border flex items-center gap-4 transition-all"
                :class="lastScannedType === 'masuk' ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-blue-50 border-blue-200 text-blue-950'"
              >
                <div
                  class="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-2xl text-white shadow-xs shrink-0"
                  :class="lastScannedType === 'masuk' ? 'bg-emerald-600' : 'bg-blue-600'"
                >
                  {{ lastScannedType === 'masuk' ? 'IN' : 'OUT' }}
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <span
                      class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full"
                      :class="lastScannedType === 'masuk' ? 'bg-emerald-200 text-emerald-900' : 'bg-blue-200 text-blue-900'"
                    >
                      Presensi {{ lastScannedType === 'masuk' ? 'Masuk' : 'Pulang' }} Berhasil!
                    </span>
                    <span class="text-xs font-mono font-bold text-slate-500">{{ lastScannedTime }} WIB</span>
                  </div>
                  <h4 class="font-extrabold text-base sm:text-lg text-slate-900 mt-0.5 truncate">
                    {{ lastScannedStudent.nama }}
                  </h4>
                  <p class="text-xs text-slate-600 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span>Kelas: <strong>{{ lastScannedStudent.kelas }}</strong></span>
                    <span class="text-slate-300">&bull;</span>
                    <span>NISN: <span class="font-mono">{{ lastScannedStudent.nomor_induk }}</span></span>
                    <span class="text-slate-300">&bull;</span>
                    <span
                      class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-bold"
                      :class="lastScannedStudent.jenis_kelamin === 'P' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'"
                    >
                      {{ lastScannedStudent.jenis_kelamin === 'P' ? '♀ Perempuan' : '♂ Laki-laki' }}
                    </span>
                  </p>
                </div>
              </div>

              <!-- Quick Instruction -->
              <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center gap-2.5">
                <span class="material-icons text-emerald-600 text-lg">check_circle</span>
                <span>Kamera siap memindai siswa berikutnya secara berurutan.</span>
              </div>
            </div>

            <!-- Empty placeholder -->
            <div v-else class="h-64 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 rounded-2xl">
              <span class="material-icons text-4xl text-slate-300 mb-2">qr_code_2</span>
              <p class="text-xs font-bold text-slate-600">Belum ada pemindaian kartu</p>
              <p class="text-[11px] text-slate-400 mt-0.5 max-w-xs">
                Arahkan kartu siswa ke kamera untuk mencatat kehadiran IN atau OUT secara instan.
              </p>
            </div>
          </Card>
        </div>
      </div>

      <!-- ============================================================== -->
      <!-- TAB 3: REKAPITULASI BULANAN (MATRIKS FORMAT GAMBAR FISIK) -->
      <!-- ============================================================== -->
      <div v-if="activeTab === 'rekap'" class="space-y-4">
        <!-- Control Bar: Filter Kelas, Bulan, Tahun, Cetak & Export -->
        <div class="no-print bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div class="flex flex-wrap items-center gap-2.5">
            <!-- Filter Kelas -->
            <div class="flex items-center gap-1.5">
              <label class="text-xs font-bold text-slate-700">Kelas:</label>
              <select
                v-model="rekapClass"
                class="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option v-for="cls in availableClasses" :key="cls" :value="cls">
                  Kelas {{ cls }}
                </option>
              </select>
            </div>

            <!-- Filter Bulan -->
            <div class="flex items-center gap-1.5">
              <label class="text-xs font-bold text-slate-700">Bulan:</label>
              <select
                v-model="rekapMonth"
                class="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option v-for="(mName, mIdx) in monthNames" :key="mIdx" :value="mIdx + 1">
                  {{ mName }}
                </option>
              </select>
            </div>

            <!-- Filter Tahun -->
            <div class="flex items-center gap-1.5">
              <label class="text-xs font-bold text-slate-700">Tahun:</label>
              <select
                v-model="rekapYear"
                class="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option :value="2026">2026</option>
                <option :value="2027">2027</option>
              </select>
            </div>
          </div>

          <!-- Tombol Export Excel & Cetak Landscape -->
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="exportMonthlyToExcel"
              class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <span class="material-icons text-sm">download</span>
              <span>Export Excel (.xlsx)</span>
            </button>
            <button
              type="button"
              @click="printMonthlySheet"
              class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <span class="material-icons text-sm">print</span>
              <span>Cetak Lembar Absen</span>
            </button>
          </div>
        </div>

        <!-- ============================================================== -->
        <!-- LEMBAR DAFTAR HADIR SISWA (TAMPILAN MATRIKS PERSIS GAMBAR) -->
        <!-- ============================================================== -->
        <div class="print-container bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <!-- Kop Header Lembar Absensi (Persis Gambar) -->
          <div class="flex items-center justify-center gap-3 sm:gap-4 pb-2 border-b border-slate-900">
            <img src="/logo.png" alt="Logo PKBM" class="w-12 h-12 sm:w-14 sm:h-14 object-contain shrink-0" />
            <div class="text-center">
              <h2 class="text-base sm:text-lg font-black tracking-wide text-slate-900 uppercase">
                DAFTAR HADIR SISWA
              </h2>
              <h3 class="text-sm sm:text-base font-bold text-slate-900 uppercase">
                {{ attendanceStore.schoolSettings?.nama_sekolah || 'PKBM CAHAYA MULIA' }}
              </h3>
              <p class="text-xs font-bold text-slate-800 uppercase tracking-wider">
                TAHUN PELAJARAN {{ attendanceStore.schoolSettings?.tahun_pelajaran || '2026/2027' }}
              </p>
            </div>
          </div>

          <!-- Metadata Kelas & Bulan -->
          <div class="flex items-center justify-between text-xs font-bold text-slate-900 pt-1">
            <span>Kelas: <strong class="text-sm font-black">{{ rekapClass }}</strong></span>
            <span>Bulan: <strong class="text-sm font-black">{{ monthNames[rekapMonth - 1] }} {{ rekapYear }}</strong></span>
          </div>

          <!-- Petunjuk Geser Layar untuk Mobile -->
          <div class="no-print md:hidden flex items-center justify-between text-[11px] text-blue-800 bg-blue-50 px-3 py-2 rounded-xl border border-blue-200">
            <span class="flex items-center gap-1.5 font-medium">
              <span class="material-icons text-sm text-blue-600">swipe</span>
              Geser tabel ke samping untuk melihat tanggal 1 s.d. 31
            </span>
            <span class="font-bold">➡️</span>
          </div>

          <!-- Matriks Tabel Tanggal 1 s.d. 31 -->
          <div class="overflow-x-auto">
            <table class="w-full border-collapse border border-slate-800 text-[10px] sm:text-xs">
              <thead class="bg-slate-100 text-slate-900 font-bold">
                <!-- Baris 1 Header Kolom -->
                <tr>
                  <th rowspan="2" class="border border-slate-800 px-1 py-1.5 text-center w-8">NOMOR</th>
                  <th rowspan="2" class="border border-slate-800 px-2 py-1.5 text-left min-w-[140px]">NAMA SISWA</th>
                  <th rowspan="2" class="border border-slate-800 px-1 py-1.5 text-center w-8">L/P</th>
                  <th :colspan="daysInSelectedMonth" class="border border-slate-800 px-1 py-0.5 text-center bg-slate-200">
                    Tanggal
                  </th>
                  <th colspan="4" class="border border-slate-800 px-1 py-0.5 text-center bg-slate-200">
                    Rekap
                  </th>
                  <th rowspan="2" class="border border-slate-800 px-1 py-1.5 text-center w-10">%</th>
                </tr>
                <!-- Baris 2 Angka Tanggal 1 s.d. 31 & Kolom H, S, I, A -->
                <tr>
                  <th
                    v-for="day in daysInSelectedMonth"
                    :key="day"
                    class="border border-slate-800 px-0.5 py-1 text-center w-6"
                    :class="isWeekend(day) ? 'bg-slate-200 text-slate-400' : 'bg-white'"
                  >
                    {{ day }}
                  </th>
                  <th class="border border-slate-800 px-1 py-1 text-center w-6 bg-emerald-100 text-emerald-900 font-bold">H</th>
                  <th class="border border-slate-800 px-1 py-1 text-center w-6 bg-amber-100 text-amber-900 font-bold">S</th>
                  <th class="border border-slate-800 px-1 py-1 text-center w-6 bg-blue-100 text-blue-900 font-bold">I</th>
                  <th class="border border-slate-800 px-1 py-1 text-center w-6 bg-rose-100 text-rose-900 font-bold">A</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, rIdx) in monthlyMatrixData"
                  :key="row.student.id"
                  class="hover:bg-slate-50 transition"
                >
                  <td class="border border-slate-800 px-1 py-1 text-center font-bold">
                    {{ rIdx + 1 }}
                  </td>
                  <td class="border border-slate-800 px-2 py-1 font-bold text-slate-900 truncate uppercase">
                    {{ row.student.nama_lengkap }}
                  </td>
                  <td class="border border-slate-800 px-1 py-1 text-center font-bold" :class="row.student.jenis_kelamin === 'P' ? 'text-pink-600' : 'text-blue-700'" :title="row.student.jenis_kelamin === 'P' ? 'Perempuan (P)' : 'Laki-laki (L)'">
                    {{ row.student.jenis_kelamin || 'L' }}
                  </td>
                  <!-- Sel Tanggal 1 s.d. 31 -->
                  <td
                    v-for="day in daysInSelectedMonth"
                    :key="day"
                    class="border border-slate-800 px-0.5 py-1 text-center font-bold select-none cursor-pointer"
                    :class="[
                      isWeekend(day) ? 'bg-slate-100 text-slate-300' : '',
                      row.days[day]?.symbol === 'H' ? 'text-emerald-700 font-black' : '',
                      row.days[day]?.symbol === 'S' ? 'text-amber-700 bg-amber-50 font-black' : '',
                      row.days[day]?.symbol === 'I' ? 'text-blue-700 bg-blue-50 font-black' : '',
                      row.days[day]?.symbol === 'A' ? 'text-rose-700 bg-rose-50 font-black' : ''
                    ]"
                    @click="openQuickEdit(row.student, day)"
                    :title="row.days[day]?.status ? `${row.student.nama_lengkap} (Tgl ${day}): ${row.days[day].status.toUpperCase()}` : `Ubah kehadiran Tgl ${day}`"
                  >
                    {{ row.days[day]?.symbol || '' }}
                  </td>
                  <!-- Total H, S, I, A -->
                  <td class="border border-slate-800 px-1 py-1 text-center font-bold text-emerald-800 bg-emerald-50/50">
                    {{ row.totalH }}
                  </td>
                  <td class="border border-slate-800 px-1 py-1 text-center font-bold text-amber-800 bg-amber-50/50">
                    {{ row.totalS }}
                  </td>
                  <td class="border border-slate-800 px-1 py-1 text-center font-bold text-blue-800 bg-blue-50/50">
                    {{ row.totalI }}
                  </td>
                  <td class="border border-slate-800 px-1 py-1 text-center font-bold text-rose-800 bg-rose-50/50">
                    {{ row.totalA }}
                  </td>
                  <!-- Persentase Kehadiran -->
                  <td class="border border-slate-800 px-1 py-1 text-center font-bold">
                    {{ row.persentase }}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Tanda Tangan Cetak Lembar Absen (Hanya tampil saat Print) -->
          <div class="print-only pt-8 grid grid-cols-2 text-center text-xs text-slate-900">
            <div>
              <p>Mengetahui,</p>
              <p class="font-bold">Ketua PKBM Cahaya Mulia</p>
              <div class="h-16"></div>
              <p class="font-bold underline">( ............................................ )</p>
            </div>
            <div>
              <p>Pamulang, {{ currentPrintDate }}</p>
              <p class="font-bold">Tutor / Wali Kelas</p>
              <div class="h-16"></div>
              <p class="font-bold underline">{{ currentTeacher?.nama_lengkap || '( ............................................ )' }}</p>
              <p class="text-[10px]">NIP. {{ currentTeacher?.nomor_induk || '-' }}</p>
            </div>
          </div>
        </div>
      </div>

    </main>

    <!-- Quick Edit Modal untuk Matriks Rekap -->
    <div
      v-if="editingCell"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
      @click.self="editingCell = null"
    >
      <div class="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
        <h4 class="font-bold text-slate-900 text-sm">
          Ralat Kehadiran: {{ editingCell.student.nama_lengkap }}
        </h4>
        <p class="text-xs text-slate-500 mt-0.5">
          Tanggal: {{ editingCell.day }} {{ monthNames[rekapMonth - 1] }} {{ rekapYear }}
        </p>

        <div class="grid grid-cols-2 gap-2 mt-4">
          <button
            type="button"
            @click="applyQuickEdit('hadir')"
            class="p-2.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 font-bold text-xs hover:bg-emerald-100 cursor-pointer"
          >
            H - Hadir
          </button>
          <button
            type="button"
            @click="applyQuickEdit('sakit')"
            class="p-2.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 font-bold text-xs hover:bg-amber-100 cursor-pointer"
          >
            S - Sakit
          </button>
          <button
            type="button"
            @click="applyQuickEdit('izin')"
            class="p-2.5 rounded-xl border border-blue-300 bg-blue-50 text-blue-800 font-bold text-xs hover:bg-blue-100 cursor-pointer"
          >
            I - Izin
          </button>
          <button
            type="button"
            @click="applyQuickEdit('alpa')"
            class="p-2.5 rounded-xl border border-rose-300 bg-rose-50 text-rose-800 font-bold text-xs hover:bg-rose-100 cursor-pointer"
          >
            A - Alpa
          </button>
        </div>

        <button
          type="button"
          @click="editingCell = null"
          class="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
        >
          Tutup
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Html5Qrcode } from 'html5-qrcode'
import XLSX from 'xlsx-js-style'
import { useAuthStore } from '../stores/auth'
import { useAttendanceStore } from '../stores/attendance'
import Navbar from '../components/Navbar.vue'
import AppSidebar from '../components/AppSidebar.vue'
import MobileDrawer from '../components/MobileDrawer.vue'
import MobileBottomNav from '../components/MobileBottomNav.vue'
import Card from '../components/ui/Card.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const attendanceStore = useAttendanceStore()

const isDrawerOpen = ref(false)

// State Tab Persisten (URL query + localStorage)
const validTabs = ['manual', 'scan', 'rekap']
const initialTab = (route.query.tab && validTabs.includes(route.query.tab))
  ? route.query.tab
  : (localStorage.getItem('presensi_tab_guru') && validTabs.includes(localStorage.getItem('presensi_tab_guru')))
    ? localStorage.getItem('presensi_tab_guru')
    : 'manual'

const activeTab = ref(initialTab)

watch(activeTab, (tab) => {
  localStorage.setItem('presensi_tab_guru', tab)
  if (route.query.tab !== tab) {
    router.replace({ query: { ...route.query, tab } }).catch(() => {})
  }
})

watch(() => route.query.tab, (newTab) => {
  if (newTab && validTabs.includes(newTab) && newTab !== activeTab.value) {
    activeTab.value = newTab
  }
})

// Navigation Items (Clean & Simple)
const navItems = computed(() => [
  { key: 'manual', icon: 'fact_check', label: 'Presensi Harian' },
  { key: 'scan', icon: 'qr_code_scanner', label: 'Scanner QR Piket' },
  { key: 'rekap', icon: 'table_chart', label: 'Buku Rekap' }
])

const currentTeacher = computed(() => {
  return attendanceStore.teachers.find(t => 
    t.id === authStore.user?.id || 
    t.email === authStore.user?.email || 
    t.nomor_induk === authStore.user?.nomor_induk
  ) || authStore.user || {}
})

const availableClasses = computed(() => {
  if (currentTeacher.value?.kelas_diajar && Array.isArray(currentTeacher.value.kelas_diajar) && currentTeacher.value.kelas_diajar.length > 0) {
    const assigned = currentTeacher.value.kelas_diajar.filter(c => attendanceStore.allClasses.includes(c))
    if (assigned.length > 0) return assigned
  }
  return attendanceStore.allClasses && attendanceStore.allClasses.length > 0
    ? attendanceStore.allClasses
    : ['12', '11', '10']
})

// Tab 1: State Presensi Manual Persisten
const savedClass = localStorage.getItem('presensi_guru_selected_class')
const selectedClass = ref(savedClass && availableClasses.value.includes(savedClass) ? savedClass : (availableClasses.value[0] || '12'))

watch(selectedClass, (val) => {
  if (val) localStorage.setItem('presensi_guru_selected_class', val)
})

const selectedDate = ref(new Date().toISOString().split('T')[0])

const classStudents = computed(() => {
  return attendanceStore.students.filter(s => s.kelas === selectedClass.value)
})

const studentSearchQuery = ref('')

const filteredClassStudents = computed(() => {
  if (!studentSearchQuery.value.trim()) return classStudents.value
  const q = studentSearchQuery.value.trim().toLowerCase()
  return classStudents.value.filter(s => 
    s.nama_lengkap.toLowerCase().includes(q) || 
    (s.nomor_induk && s.nomor_induk.includes(q))
  )
})

const formattedSelectedDate = computed(() => {
  try {
    const d = new Date(selectedDate.value + 'T00:00:00')
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  } catch (e) {
    return selectedDate.value
  }
})

function getStudentAttendance(studentId) {
  return attendanceStore.todayAttendances.find(a => 
    a.user_id === studentId && 
    (a.tanggal === selectedDate.value || (!a.tanggal && selectedDate.value === new Date().toISOString().split('T')[0]))
  )
}

const attendanceStats = computed(() => {
  let hadir = 0, sakit = 0, izin = 0, alpa = 0
  classStudents.value.forEach(std => {
    const rec = getStudentAttendance(std.id)
    const st = rec?.status
    if (st === 'hadir' || st === 'terlambat') hadir++
    else if (st === 'sakit') sakit++
    else if (st === 'izin') izin++
    else alpa++
  })
  return { hadir, sakit, izin, alpa }
})

function changeStatus(student, newStatus) {
  attendanceStore.setManualAttendance(
    student,
    newStatus,
    currentTeacher.value,
    newStatus === 'hadir' ? '07:30' : null,
    null,
    selectedDate.value
  )
}

function updateJamMasuk(student, val) {
  const clean = val.trim()
  attendanceStore.setManualAttendance(
    student,
    'hadir',
    currentTeacher.value,
    clean || null,
    undefined,
    selectedDate.value
  )
}

function updateJamPulang(student, val) {
  const clean = val.trim()
  attendanceStore.setManualAttendance(
    student,
    'hadir',
    currentTeacher.value,
    undefined,
    clean || null,
    selectedDate.value
  )
}

function updateKeterangan(student, val) {
  const clean = val.trim()
  attendanceStore.setManualAttendance(
    student,
    getStudentAttendance(student.id)?.status || 'hadir',
    currentTeacher.value,
    undefined,
    undefined,
    selectedDate.value,
    clean || null
  )
}

function formatTimeDisplay(t) {
  if (!t) return ''
  return t.length > 5 ? t.substring(0, 5) : t
}

function handleBatchAllPresent() {
  const res = attendanceStore.batchSetAllPresent(selectedClass.value, selectedDate.value, currentTeacher.value)
  alert(`Berhasil menandai ${res.count} siswa Kelas ${selectedClass.value} sebagai Hadir!`)
}

function handleBatchAllCheckOut() {
  const defaultTime = new Date().toTimeString().split(' ')[0].substring(0, 5)
  const inputTime = prompt(`Set jam pulang bersama untuk semua siswa Kelas ${selectedClass.value} yang hadir hari ini:`, defaultTime)
  if (inputTime === null) return // Batal

  const res = attendanceStore.batchSetAllCheckOut(selectedClass.value, selectedDate.value, currentTeacher.value, inputTime.trim() || defaultTime)
  if (res.count > 0) {
    alert(`Berhasil mencatat jam pulang (${inputTime.trim() || defaultTime}) untuk ${res.count} siswa Kelas ${selectedClass.value}!`)
  } else {
    alert(`Semua siswa yang hadir di Kelas ${selectedClass.value} sudah memiliki jam pulang tercatat.`)
  }
}

// Tab 2: Scanner QR (IGNORE LOCATION)
const isScanning = ref(false)
let html5QrCode = null
const lastScannedStudent = ref(null)
const lastScannedType = ref('')
const lastScannedTime = ref('')
let scanCooldown = false

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, ctx.currentTime) // 880Hz beep
    gain.gain.setValueAtTime(0.2, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
    osc.start()
    osc.stop(ctx.currentTime + 0.15)
  } catch (e) {}
}

async function startScanner() {
  isScanning.value = true
  try {
    if (!html5QrCode) {
      html5QrCode = new Html5Qrcode('qr-reader')
    }
    await html5QrCode.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 220, height: 220 } },
      onScanSuccess,
      () => {}
    )
  } catch (err) {
    alert('Gagal mengakses kamera: ' + err.message)
    isScanning.value = false
  }
}

async function stopScanner() {
  if (html5QrCode && isScanning.value) {
    try {
      await html5QrCode.stop()
    } catch (e) {}
  }
  isScanning.value = false
}

async function onScanSuccess(decodedText) {
  if (scanCooldown) return
  scanCooldown = true

  const res = await attendanceStore.scanStudentQr(decodedText, currentTeacher.value)
  if (res.success) {
    playBeep()
    lastScannedStudent.value = res.student || { nama: res.nama, kelas: res.kelas, nomor_induk: res.nomor_induk, jenis_kelamin: res.jenis_kelamin }
    lastScannedType.value = res.type
    lastScannedTime.value = res.jam || new Date().toTimeString().split(' ')[0].substring(0, 5)
  } else {
    alert(res.message || 'QR Code tidak valid')
  }

  // Cooldown 2 detik sebelum scan berikutnya
  setTimeout(() => {
    scanCooldown = false
  }, 2000)
}

onBeforeUnmount(() => {
  stopScanner()
})

// Tab 3: Rekapitulasi Bulanan (Buku Absensi Matriks Sesuai Lembar Manual)
const savedRekapClass = localStorage.getItem('presensi_guru_rekap_class')
const rekapClass = ref(savedRekapClass && availableClasses.value.includes(savedRekapClass) ? savedRekapClass : (availableClasses.value[0] || '12'))

watch(rekapClass, (val) => {
  if (val) localStorage.setItem('presensi_guru_rekap_class', val)
})

const now = new Date()
const savedRekapMonth = localStorage.getItem('presensi_guru_rekap_month')
const rekapMonth = ref(savedRekapMonth ? parseInt(savedRekapMonth, 10) : (now.getMonth() + 1))

watch(rekapMonth, (val) => {
  if (val) localStorage.setItem('presensi_guru_rekap_month', String(val))
})

const rekapYear = ref(now.getFullYear())

watch(availableClasses, (newClasses) => {
  if (newClasses && newClasses.length > 0) {
    if (!newClasses.includes(selectedClass.value)) {
      selectedClass.value = newClasses[0]
    }
    if (!newClasses.includes(rekapClass.value)) {
      rekapClass.value = newClasses[0]
    }
  }
}, { immediate: true })

const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const daysInSelectedMonth = computed(() => {
  return new Date(rekapYear.value, rekapMonth.value, 0).getDate()
})

const monthlyMatrixData = computed(() => {
  return attendanceStore.getMonthlyAttendanceMatrix(rekapClass.value, rekapMonth.value, rekapYear.value)
})

function isWeekend(day) {
  const d = new Date(rekapYear.value, rekapMonth.value - 1, day)
  const dayOfWeek = d.getDay()
  return dayOfWeek === 0 || dayOfWeek === 6 // Minggu = 0, Sabtu = 6
}

const currentPrintDate = computed(() => {
  return new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})

function printMonthlySheet() {
  window.print()
}

// Export Matriks Bulanan ke Excel (.xlsx) dengan Format Cantik Persis Gambar
function exportMonthlyToExcel() {
  const schoolName = (attendanceStore.schoolSettings?.nama_sekolah || 'PKBM CAHAYA MULIA').toUpperCase()
  const tp = attendanceStore.schoolSettings?.tahun_pelajaran || '2026/2027'
  const mName = monthNames[rekapMonth.value - 1].toUpperCase()
  const daysCount = daysInSelectedMonth.value

  // Header Rows
  const aoa = [
    ['DAFTAR HADIR SISWA'],
    [schoolName],
    [`TAHUN PELAJARAN ${tp}`],
    [],
    [`Kelas: ${rekapClass.value}`, '', '', `Bulan: ${mName} ${rekapYear.value}`]
  ]

  // Table Column Headers (Baris 5 & 6)
  const headerRow1 = ['NOMOR', 'NAMA SISWA', 'L/P']
  for (let d = 1; d <= daysCount; d++) headerRow1.push(String(d))
  headerRow1.push('H', 'S', 'I', 'A', '%')
  aoa.push(headerRow1)

  // Data Rows
  monthlyMatrixData.value.forEach((row, idx) => {
    const r = [idx + 1, row.student.nama_lengkap.toUpperCase(), row.student.jenis_kelamin || 'L']
    for (let d = 1; d <= daysCount; d++) {
      r.push(row.days[d]?.symbol || '')
    }
    r.push(row.totalH, row.totalS, row.totalI, row.totalA, `${row.persentase}%`)
    aoa.push(r)
  })

  // Footer Spacing & Signatures
  aoa.push([])
  aoa.push(['', 'Mengetahui,', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Pamulang, ' + currentPrintDate.value])
  aoa.push(['', 'Ketua PKBM Cahaya Mulia', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Tutor / Wali Kelas'])
  aoa.push([])
  aoa.push([])
  aoa.push(['', '( ............................................ )', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', (currentTeacher.value?.nama_lengkap || '( ............................................ )')])

  const ws = XLSX.utils.aoa_to_sheet(aoa)

  // Merge Cells for Title
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: daysCount + 7 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: daysCount + 7 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: daysCount + 7 } }
  ]

  // Set Column Widths
  const colWidths = [{ wch: 6 }, { wch: 28 }, { wch: 5 }]
  for (let i = 0; i < daysCount; i++) colWidths.push({ wch: 3.5 })
  colWidths.push({ wch: 4.5 }, { wch: 4.5 }, { wch: 4.5 }, { wch: 4.5 }, { wch: 6 })
  ws['!cols'] = colWidths

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, `Daftar Hadir Kls ${rekapClass.value}`)

  const fileName = `Daftar_Hadir_PKBM_Cahaya_Mulia_Kelas_${rekapClass.value}_${mName}_${rekapYear.value}.xlsx`
  XLSX.writeFile(wb, fileName)
}

// Quick Edit Modal
const editingCell = ref(null)

function openQuickEdit(student, day) {
  editingCell.value = { student, day }
}

function applyQuickEdit(status) {
  if (!editingCell.value) return
  const { student, day } = editingCell.value
  const dateStr = `${rekapYear.value}-${String(rekapMonth.value).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  
  attendanceStore.setManualAttendance(
    student,
    status,
    currentTeacher.value,
    status === 'hadir' ? '07:30' : null,
    null,
    dateStr
  )
  editingCell.value = null
}
</script>

<style scoped>
@media print {
  /* Hide non-printable elements */
  .no-print,
  nav,
  aside,
  header {
    display: none !important;
  }

  /* Full landscape page layout */
  body,
  main,
  .print-container {
    background: white !important;
    padding: 0 !important;
    margin: 0 !important;
    width: 100% !important;
    border: none !important;
    box-shadow: none !important;
  }

  .print-only {
    display: grid !important;
  }
}

.print-only {
  display: none;
}
</style>

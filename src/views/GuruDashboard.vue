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
              @click="openBatchPresentModal"
              class="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer select-none"
              title="Set semua siswa yang belum absen hari ini menjadi Hadir"
            >
              <span class="material-icons text-sm">done_all</span>
              <span>Tandai Hadir Semua</span>
            </button>
            <button
              type="button"
              @click="openBatchCheckoutModal"
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

        <!-- Ringkasan Kehadiran Kelas (Mobile 2 Kolom, Desktop 6 Kolom) -->
        <div class="grid grid-cols-2 sm:grid-cols-6 gap-2 sm:gap-3">
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
          <div class="p-2.5 sm:p-3 bg-rose-50/70 rounded-xl border border-rose-200 shadow-2xs">
            <p class="text-[10px] sm:text-[11px] font-semibold text-rose-700">Alpa</p>
            <p class="text-base sm:text-xl font-bold text-rose-800 mt-0.5">{{ attendanceStats.alpa }}</p>
          </div>
          <div class="p-2.5 sm:p-3 bg-slate-50 rounded-xl border border-slate-200 shadow-2xs">
            <p class="text-[10px] sm:text-[11px] font-semibold text-slate-500">Belum Presensi</p>
            <p class="text-base sm:text-xl font-bold text-slate-700 mt-0.5">{{ attendanceStats.belum }}</p>
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
            <!-- Baris Atas: Nomor, Nama Siswa, NISN, Badge L/P & Status Belum -->
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
              <div class="flex items-center gap-1.5 shrink-0">
                <span
                  v-if="!getStudentAttendance(std.id)?.status"
                  class="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200"
                >
                  Belum Diabsen
                </span>
                <span
                  class="px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1"
                  :class="std.jenis_kelamin === 'P' ? 'bg-pink-50 text-pink-700 border border-pink-200' : 'bg-blue-50 text-blue-700 border border-blue-200'"
                  :title="std.jenis_kelamin === 'P' ? 'Perempuan' : 'Laki-laki'"
                >
                  <span>{{ std.jenis_kelamin === 'P' ? '♀ Perempuan' : '♂ Laki-laki' }}</span>
                </span>
              </div>
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
                    getStudentAttendance(std.id)?.status === 'alpa'
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
              <!-- Jam OUT: Tombol Set Pulang saat kosong, berubah jadi jam pulang saat sudah ada -->
              <div v-if="!getStudentAttendance(std.id)?.jam_pulang" class="flex items-center">
                <button
                  type="button"
                  @click="handleSingleCheckOut(std)"
                  class="w-full h-full py-1.5 px-2 rounded-lg text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 shadow-2xs"
                  title="Klik untuk mencatat jam pulang siswa sekarang"
                >
                  <span class="material-icons text-xs text-amber-600">logout</span>
                  <span>Set Pulang</span>
                </button>
              </div>
              <div v-else class="flex items-center justify-between gap-1 bg-emerald-50/80 px-2 py-1.5 rounded-lg border border-emerald-300">
                <div class="flex items-center gap-1.5 min-w-0 flex-1">
                  <span class="text-[10px] font-bold text-emerald-700 uppercase shrink-0">OUT:</span>
                  <input
                    type="text"
                    :value="formatTimeDisplay(getStudentAttendance(std.id)?.jam_pulang)"
                    @change="updateJamPulang(std, $event.target.value)"
                    placeholder="14:00"
                    title="Klik untuk mengedit jam pulang manual"
                    class="w-full bg-transparent text-xs font-mono font-bold text-emerald-900 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  @click="clearJamPulang(std)"
                  class="text-emerald-700 hover:text-rose-600 p-0.5 cursor-pointer shrink-0 transition-colors"
                  title="Batalkan / hapus jam pulang"
                >
                  <span class="material-icons text-xs">close</span>
                </button>
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
                          getStudentAttendance(std.id)?.status === 'alpa'
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
                    <!-- Jika jam pulang belum tercatat: Tombol Set Pulang Single -->
                    <button
                      v-if="!getStudentAttendance(std.id)?.jam_pulang"
                      type="button"
                      @click="handleSingleCheckOut(std)"
                      class="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 transition-all cursor-pointer active:scale-95 shadow-2xs group/btn"
                      title="Klik untuk mencatat jam pulang siswa sekarang"
                    >
                      <span class="material-icons text-xs text-amber-600 group-hover/btn:text-amber-800">logout</span>
                      <span>Pulang</span>
                    </button>

                    <!-- Jika sudah tercatat: Tampilkan Jam Pulang (editable) + Opsi Hapus -->
                    <div v-else class="inline-flex items-center gap-1 group/out">
                      <input
                        type="text"
                        :value="formatTimeDisplay(getStudentAttendance(std.id)?.jam_pulang)"
                        @change="updateJamPulang(std, $event.target.value)"
                        placeholder="--:--"
                        title="Klik untuk mengedit jam pulang manual"
                        class="w-18 px-1.5 py-1 text-center bg-emerald-50 border border-emerald-300 rounded-lg text-xs font-mono font-bold text-emerald-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        @click="clearJamPulang(std)"
                        class="opacity-0 group-hover/out:opacity-100 text-slate-400 hover:text-rose-600 p-0.5 rounded transition-opacity cursor-pointer"
                        title="Hapus / batalkan jam pulang"
                      >
                        <span class="material-icons text-xs">close</span>
                      </button>
                    </div>
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

        <!-- Scanner Area (Mobile: Hasil Scan di Atas Kamera; Desktop: Berdampingan) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <!-- Video Scanner Container (Order 2 di mobile agar kamera di bawah hasil scan, Order 1 di md+) -->
          <div class="order-2 md:order-1">
            <Card title="Kamera Pemindai" description="Arahkan QR Code kartu siswa ke dalam kotak pemindai">
              <div class="relative w-full aspect-square max-w-sm mx-auto bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-800 shadow-md">
                <div id="qr-reader" class="w-full h-full"></div>

                <!-- Floating Jeda Cooldown Badge -->
                <div
                  v-if="isScanning && cooldownSeconds > 0"
                  class="absolute top-3 inset-x-3 z-10 py-2 px-3.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-amber-500/50 text-white text-xs font-semibold flex items-center justify-between shadow-xl"
                >
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
                    <span class="text-amber-200">Jeda Pemindaian (Ganti Siswa)</span>
                  </div>
                  <span class="bg-amber-500 text-slate-950 font-mono font-black text-xs px-2.5 py-0.5 rounded-md shadow-xs">
                    {{ cooldownSeconds }}s
                  </span>
                </div>

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
          </div>

          <!-- Live Scan Result Card (Order 1 di mobile agar langsung terlihat di atas kamera, Order 2 di md+) -->
          <div class="order-1 md:order-2">
            <Card title="Hasil Pemindaian Terakhir" description="Data kehadiran siswa yang baru saja dipindai">
              <div v-if="lastScannedStudent" class="space-y-4">
                <div
                  class="p-4 rounded-2xl border flex items-center gap-3.5 sm:gap-4 transition-all shadow-xs"
                  :class="lastScannedType === 'masuk'
                    ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 ring-1 ring-emerald-200'
                    : lastScannedType === 'selesai'
                      ? 'bg-amber-50/90 border-amber-300 text-amber-950 ring-1 ring-amber-200'
                      : 'bg-blue-50/90 border-blue-300 text-blue-950 ring-1 ring-blue-200'"
                >
                  <div
                    class="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-bold text-xl sm:text-2xl text-white shadow-xs shrink-0"
                    :class="lastScannedType === 'masuk'
                      ? 'bg-emerald-600'
                      : lastScannedType === 'selesai'
                        ? 'bg-amber-500'
                        : 'bg-blue-600'"
                  >
                    {{ lastScannedType === 'masuk' ? 'IN' : lastScannedType === 'selesai' ? 'OK' : 'OUT' }}
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span
                        class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full"
                        :class="lastScannedType === 'masuk'
                          ? 'bg-emerald-200 text-emerald-900'
                          : lastScannedType === 'selesai'
                            ? 'bg-amber-200 text-amber-900'
                            : 'bg-blue-200 text-blue-900'"
                      >
                        {{ lastScannedType === 'masuk'
                          ? 'Presensi Masuk Berhasil!'
                          : lastScannedType === 'selesai'
                            ? 'Presensi Hari Ini Sudah Lengkap'
                            : 'Presensi Pulang Berhasil!' }}
                      </span>
                      <span class="text-xs font-mono font-bold text-slate-500">{{ lastScannedTime }} WIB</span>
                    </div>
                    <h4 class="font-extrabold text-base sm:text-lg text-slate-900 mt-1 truncate">
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

                <!-- Status / Cooldown Notice -->
                <div
                  v-if="cooldownSeconds > 0"
                  class="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between shadow-2xs"
                >
                  <div class="flex items-center gap-2">
                    <span class="material-icons text-amber-600 text-base animate-spin">hourglass_empty</span>
                    <span class="font-semibold">Jeda pemindaian: Tunggu pergantian kartu siswa...</span>
                  </div>
                  <span class="font-mono font-extrabold text-xs bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md">
                    {{ cooldownSeconds }}s
                  </span>
                </div>
                <div
                  v-else
                  class="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 shadow-2xs"
                >
                  <span class="material-icons text-emerald-600 text-base">check_circle</span>
                  <span class="font-medium">Kamera siap memindai siswa berikutnya secara berurutan.</span>
                </div>
              </div>

              <!-- Empty placeholder -->
              <div
                v-else
                class="py-4 md:h-64 flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50"
              >
                <span class="material-icons text-3xl text-slate-300 mb-1">qr_code_2</span>
                <p class="text-xs font-bold text-slate-600">Belum ada pemindaian kartu</p>
                <p class="text-[11px] text-slate-400 mt-0.5 max-w-xs">
                  Arahkan QR Code kartu siswa ke kamera di bawah untuk mencatat kehadiran IN atau OUT secara instan.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <!-- ============================================================== -->
      <!-- TAB 3: REKAPITULASI BULANAN (MATRIKS FORMAT GAMBAR FISIK) -->
      <!-- ============================================================== -->
      <div v-if="activeTab === 'rekap'" class="space-y-4">
        <!-- Control Bar: Filter Kelas, Bulan, Tahun, Switcher Tampilan, Cetak & Export -->
        <div class="no-print bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
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

            <!-- Filter Tahun (Dinamis) -->
            <div class="flex items-center gap-1.5">
              <label class="text-xs font-bold text-slate-700">Tahun:</label>
              <select
                v-model="rekapYear"
                class="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option v-for="y in availableYears" :key="y" :value="y">{{ y }}</option>
              </select>
            </div>
          </div>

          <!-- Tombol Export Excel & Cetak Landscape -->
          <div class="flex items-center gap-2">
            <button
              type="button"
              :disabled="isExportingExcel"
              @click="exportMonthlyToExcel"
              class="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <span class="material-icons text-sm" :class="{ 'animate-spin': isExportingExcel }">
                {{ isExportingExcel ? 'sync' : 'download' }}
              </span>
              <span>{{ isExportingExcel ? 'Menyiapkan...' : 'Export Excel' }}</span>
            </button>
            <button
              type="button"
              @click="printMonthlySheet"
              class="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <span class="material-icons text-sm">print</span>
              <span>Cetak Lembar Absen</span>
            </button>
          </div>
        </div>

        <!-- ============================================================== -->
        <!-- TAMPILAN 1: RINGKASAN KARTU SISWA (OTOMATIS TAMPIL DI HP / MOBILE) -->
        <!-- ============================================================== -->
        <div class="no-print block md:hidden space-y-4">
          <!-- Overview Statistik Kehadiran Kelas Bulan Ini -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div class="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <span class="material-icons text-xl">groups</span>
              </div>
              <div class="min-w-0">
                <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Siswa</p>
                <p class="text-lg font-black text-slate-900 leading-tight">{{ classMonthlyStats.totalStudents }}</p>
              </div>
            </div>

            <div class="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <span class="material-icons text-xl">trending_up</span>
              </div>
              <div class="min-w-0">
                <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rata-rata Hadir</p>
                <p class="text-lg font-black text-emerald-600 leading-tight">{{ classMonthlyStats.avgPct }}%</p>
              </div>
            </div>

            <div class="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3 col-span-2 sm:col-span-2">
              <div class="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <span class="material-icons text-xl">pie_chart</span>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Akumulasi Kelas</p>
                <div class="flex items-center gap-2 mt-0.5 text-xs font-bold">
                  <span class="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">H: {{ classMonthlyStats.sumH }}</span>
                  <span class="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">S: {{ classMonthlyStats.sumS }}</span>
                  <span class="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">I: {{ classMonthlyStats.sumI }}</span>
                  <span class="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">A: {{ classMonthlyStats.sumA }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Search Input & Info Banner -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div class="relative flex-1">
              <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">search</span>
              <input
                v-model="rekapSearchQuery"
                type="text"
                placeholder="Cari nama siswa atau NISN..."
                class="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
              />
              <button
                v-if="rekapSearchQuery"
                type="button"
                @click="rekapSearchQuery = ''"
                class="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                close
              </button>
            </div>
            <div class="flex items-center justify-between sm:justify-end gap-2 text-xs text-slate-600 px-1">
              <span>Menampilkan: <strong>{{ filteredMatrixData.length }}</strong> siswa</span>
            </div>
          </div>

          <!-- List Kartu Siswa -->
          <div v-if="filteredMatrixData.length > 0" class="space-y-3">
            <div
              v-for="(row, rIdx) in filteredMatrixData"
              :key="'card-' + row.student.id"
              class="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-300 transition-all overflow-hidden"
            >
              <!-- Card Header & Summary -->
              <div class="p-3.5 sm:p-4 space-y-3">
                <div class="flex items-start justify-between gap-3">
                  <div class="flex items-center gap-2.5 min-w-0">
                    <span class="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {{ rIdx + 1 }}
                    </span>
                    <div class="min-w-0">
                      <h4 class="font-extrabold text-slate-900 text-sm truncate uppercase">
                        {{ row.student.nama_lengkap }}
                      </h4>
                      <p class="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-1.5">
                        <span>NISN: {{ row.student.nomor_induk || '-' }}</span>
                        <span class="text-slate-300">&bull;</span>
                        <span
                          class="font-bold"
                          :class="row.student.jenis_kelamin === 'P' ? 'text-pink-600' : 'text-blue-700'"
                        >
                          {{ row.student.jenis_kelamin === 'P' ? '♀ Perempuan' : '♂ Laki-laki' }}
                        </span>
                      </p>
                    </div>
                  </div>

                  <!-- Persentase Badge -->
                  <div class="shrink-0 text-right">
                    <span
                      class="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black border"
                      :class="[
                        row.persentase >= 85
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : row.persentase >= 75
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                      ]"
                    >
                      {{ row.persentase }}% Hadir
                    </span>
                  </div>
                </div>

                <!-- Visual Progress Bar Kehadiran -->
                <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-300"
                    :class="[
                      row.persentase >= 85
                        ? 'bg-emerald-500'
                        : row.persentase >= 75
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                    ]"
                    :style="{ width: `${row.persentase}%` }"
                  ></div>
                </div>

                <!-- 4 Pill Rekapitulasi (Hadir, Sakit, Izin, Alpa) -->
                <div class="grid grid-cols-4 gap-1.5 text-center text-xs">
                  <div class="p-2 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                    <p class="text-[10px] font-bold text-emerald-700 uppercase">Hadir</p>
                    <p class="text-sm font-black text-emerald-800 mt-0.5">{{ row.totalH }}</p>
                  </div>
                  <div class="p-2 rounded-xl bg-amber-50/70 border border-amber-200/80">
                    <p class="text-[10px] font-bold text-amber-700 uppercase">Sakit</p>
                    <p class="text-sm font-black text-amber-800 mt-0.5">{{ row.totalS }}</p>
                  </div>
                  <div class="p-2 rounded-xl bg-blue-50/70 border border-blue-200/80">
                    <p class="text-[10px] font-bold text-blue-700 uppercase">Izin</p>
                    <p class="text-sm font-black text-blue-800 mt-0.5">{{ row.totalI }}</p>
                  </div>
                  <div class="p-2 rounded-xl bg-rose-50/70 border border-rose-200/80">
                    <p class="text-[10px] font-bold text-rose-700 uppercase">Alpa</p>
                    <p class="text-sm font-black text-rose-800 mt-0.5">{{ row.totalA }}</p>
                  </div>
                </div>

                <!-- Tombol Toggle Accordion Kalender Detail -->
                <button
                  type="button"
                  @click="toggleExpandStudent(row.student.id)"
                  class="w-full pt-2 flex items-center justify-between text-xs font-bold text-slate-700 hover:text-blue-600 transition cursor-pointer border-t border-slate-100"
                >
                  <span class="flex items-center gap-1.5">
                    <span class="material-icons text-sm text-slate-500">event_note</span>
                    <span>{{ expandedStudentId === row.student.id ? 'Tutup Kalender & Detail' : 'Buka Kalender & Ralat Kehadiran' }}</span>
                  </span>
                  <span class="material-icons text-sm transition-transform" :class="{ 'rotate-180': expandedStudentId === row.student.id }">
                    expand_more
                  </span>
                </button>
              </div>

              <!-- Accordion Detail Kalender 1..31 & Catatan Ketidakhadiran -->
              <div
                v-if="expandedStudentId === row.student.id"
                class="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 space-y-3 animate-fade-in"
              >
                <!-- Catatan Hari Tidak Hadir -->
                <div>
                  <p class="text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                    <span class="material-icons text-xs text-amber-600">notifications_active</span>
                    <span>Catatan Ketidakhadiran Bulan {{ monthNames[rekapMonth - 1] }}:</span>
                  </p>
                  
                  <div v-if="getStudentAbsenceList(row).length > 0" class="flex flex-wrap gap-1.5">
                    <span
                      v-for="abs in getStudentAbsenceList(row)"
                      :key="abs.day"
                      class="px-2 py-0.5 rounded-lg text-xs font-bold border flex items-center gap-1"
                      :class="abs.badgeClass"
                    >
                      <span>Tgl {{ abs.day }}:</span>
                      <span>{{ abs.label }}</span>
                    </span>
                  </div>
                  <div v-else class="text-xs text-emerald-700 bg-emerald-50/80 px-2.5 py-1.5 rounded-lg border border-emerald-200 font-medium">
                    ✅ Kehadiran sempurna (tidak ada catatan sakit, izin, atau alpa).
                  </div>
                </div>

                <!-- Mini Kalender Interaktif 1..daysInMonth -->
                <div>
                  <div class="flex items-center justify-between text-[11px] text-slate-600 mb-1">
                    <span class="font-bold">Kalender Bulan {{ monthNames[rekapMonth - 1] }} {{ rekapYear }}:</span>
                    <span class="text-[10px] text-slate-500 italic">Sentuh tanggal untuk mengubah</span>
                  </div>

                  <div class="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-11 gap-1">
                    <button
                      v-for="day in daysInSelectedMonth"
                      :key="day"
                      type="button"
                      @click="openQuickEdit(row.student, day)"
                      class="p-1.5 rounded-lg text-center border text-[11px] font-bold transition flex flex-col items-center justify-center cursor-pointer hover:ring-2 hover:ring-blue-400"
                      :class="[
                        isWeekend(day) ? 'bg-slate-200/70 text-slate-400 border-slate-300' : 'bg-white border-slate-200',
                        row.days[day]?.symbol === 'H' ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-black' : '',
                        row.days[day]?.symbol === 'S' ? 'bg-amber-100 text-amber-800 border-amber-300 font-black' : '',
                        row.days[day]?.symbol === 'I' ? 'bg-blue-100 text-blue-800 border-blue-300 font-black' : '',
                        row.days[day]?.symbol === 'A' ? 'bg-rose-100 text-rose-800 border-rose-300 font-black' : ''
                      ]"
                    >
                      <span class="text-[10px] leading-none">{{ day }}</span>
                      <span class="text-[11px] leading-tight font-black mt-0.5">
                        {{ row.days[day]?.symbol || (isWeekend(day) ? '•' : '-') }}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State Pencarian -->
          <div v-else class="p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-2">
            <span class="material-icons text-3xl text-slate-300">search_off</span>
            <p class="text-xs font-bold text-slate-700">Tidak ada siswa yang sesuai pencarian</p>
            <p class="text-[11px] text-slate-500">Coba ganti kata kunci pencarian Anda.</p>
          </div>
        </div>

        <!-- ============================================================== -->
        <!-- TAMPILAN 2: LEMBAR DAFTAR HADIR MATRIKS (OTOMATIS DI DESKTOP & CETAK) -->
        <!-- ============================================================== -->
        <div
          id="printable-monthly-sheet"
          class="print-container bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 hidden md:block print:block"
        >
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
                TAHUN PELAJARAN {{ rekapAcademicYear }}
              </p>
            </div>
          </div>

          <!-- Metadata Kelas & Bulan -->
          <div class="flex items-center justify-between text-xs font-bold text-slate-900 pt-1">
            <span>Kelas: <strong class="text-sm font-black">{{ rekapClass }}</strong></span>
            <span>Bulan: <strong class="text-sm font-black">{{ monthNames[rekapMonth - 1] }} {{ rekapYear }}</strong></span>
          </div>

          <!-- Matriks Tabel Tanggal 1 s.d. 31 -->
          <div class="overflow-x-auto">
            <table class="w-full border-collapse border border-slate-800 text-[10px] sm:text-xs">
              <thead class="bg-slate-100 text-slate-900 font-bold">
                <!-- Baris 1 Header Kolom -->
                <tr>
                  <th rowspan="2" class="sticky left-0 z-20 bg-slate-100 border border-slate-800 px-1 py-1.5 text-center w-8 print:static">NOMOR</th>
                  <th rowspan="2" class="sticky left-8 z-20 bg-slate-100 border border-slate-800 px-2 py-1.5 text-left min-w-[130px] max-w-[160px] truncate shadow-xs print:static print:max-w-none">NAMA SISWA</th>
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
                  class="hover:bg-slate-50 transition group"
                >
                  <td class="sticky left-0 z-10 bg-white group-hover:bg-slate-50 border border-slate-800 px-1 py-1 text-center font-bold print:static">
                    {{ rIdx + 1 }}
                  </td>
                  <td class="sticky left-8 z-10 bg-white group-hover:bg-slate-50 border border-slate-800 px-2 py-1 font-bold text-slate-900 truncate uppercase max-w-[160px] shadow-xs print:static print:max-w-none">
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
              <!-- Baris Total Kehadiran Kelas (Footer Tabel) -->
              <tfoot class="bg-slate-100 font-bold border-t-2 border-slate-900">
                <tr>
                  <td colspan="3" class="sticky left-0 z-10 bg-slate-100 border border-slate-800 px-2 py-1 text-center font-black print:static">
                    TOTAL KEHADIRAN KELAS
                  </td>
                  <td
                    v-for="day in daysInSelectedMonth"
                    :key="'sum-' + day"
                    class="border border-slate-800 px-0.5 py-1 text-center font-bold text-slate-800"
                    :class="isWeekend(day) ? 'bg-slate-200 text-slate-400' : ''"
                  >
                    {{ monthlyMatrixData.filter(s => s.days[day]?.symbol === 'H').length || '' }}
                  </td>
                  <td class="border border-slate-800 px-1 py-1 text-center font-bold text-emerald-900 bg-emerald-100">
                    {{ classMonthlyStats.sumH }}
                  </td>
                  <td class="border border-slate-800 px-1 py-1 text-center font-bold text-amber-900 bg-amber-100">
                    {{ classMonthlyStats.sumS }}
                  </td>
                  <td class="border border-slate-800 px-1 py-1 text-center font-bold text-blue-900 bg-blue-100">
                    {{ classMonthlyStats.sumI }}
                  </td>
                  <td class="border border-slate-800 px-1 py-1 text-center font-bold text-rose-900 bg-rose-100">
                    {{ classMonthlyStats.sumA }}
                  </td>
                  <td class="border border-slate-800 px-1 py-1 text-center font-bold bg-slate-200">
                    {{ classMonthlyStats.avgPct }}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Tanda Tangan Pengesahan (Editable di Layar, Bersih Saat Print & Export) -->
          <div class="pt-8 pb-4 grid grid-cols-2 text-center text-xs text-slate-900 border-t border-slate-200 mt-4">
            <!-- Kolom Kiri: Mengetahui (Editable) -->
            <div class="flex flex-col items-center">
              <p class="text-slate-600">Mengetahui,</p>
              
              <!-- Jabatan Mengetahui (Editable di Layar, Plain Text saat Print) -->
              <div class="mt-0.5">
                <span class="print:inline hidden font-bold text-slate-900">{{ mengetahuiJabatan || 'Kepala PKBM Cahaya Mulia' }}</span>
                <input
                  v-model="mengetahuiJabatan"
                  @blur="flushMengetahuiSignatory"
                  type="text"
                  class="no-print font-bold text-slate-900 text-center border-b border-dashed border-slate-300 hover:border-blue-400 focus:border-blue-600 focus:outline-none bg-transparent px-1 py-0.5 text-xs w-60 transition-colors"
                  placeholder="Jabatan (Kepala PKBM Cahaya Mulia)"
                  title="Klik untuk mengubah jabatan penandatangan"
                />
              </div>

              <div class="h-16 flex items-center justify-center">
                <span class="no-print text-[10px] text-slate-300 italic select-none">(Ruang Tanda Tangan &amp; Stempel)</span>
              </div>

              <!-- Nama Mengetahui (Editable di Layar, Plain Text saat Print) -->
              <div class="w-full">
                <span class="print:inline hidden font-bold underline text-slate-900">
                  ({{ mengetahuiNama ? ` ${mengetahuiNama} ` : ' ............................................ ' }})
                </span>
                <div class="no-print flex items-center justify-center gap-1">
                  <span class="text-slate-700 font-bold">(</span>
                  <input
                    v-model="mengetahuiNama"
                    @blur="flushMengetahuiSignatory"
                    type="text"
                    class="font-bold underline text-slate-900 text-center border-b border-dashed border-slate-300 hover:border-blue-400 focus:border-blue-600 focus:outline-none bg-transparent px-1 text-xs w-60 transition-colors"
                    placeholder="Ketik Nama Mengetahui (Bisa Diedit)"
                    title="Klik untuk mengisi/mengubah nama penandatangan"
                  />
                  <span class="text-slate-700 font-bold">)</span>
                </div>
                
                <!-- NIP Opsional Mengetahui -->
                <div class="mt-0.5">
                  <span v-if="mengetahuiNip" class="print:inline hidden text-[10px] text-slate-600 font-mono">NIP: {{ mengetahuiNip }}</span>
                  <input
                    v-model="mengetahuiNip"
                    @blur="flushMengetahuiSignatory"
                    type="text"
                    class="no-print text-[10px] text-slate-500 font-mono text-center border-b border-dashed border-transparent hover:border-slate-300 focus:border-blue-600 focus:outline-none bg-transparent px-1 w-44 transition-colors"
                    placeholder="NIP/NIY (Opsional)"
                    title="Ketik NIP/NIY penandatangan jika ada"
                  />
                </div>
              </div>
            </div>

            <!-- Kolom Kanan: Guru / Piket -->
            <div class="flex flex-col items-center">
              <p class="text-slate-600">Kota Tangerang, {{ currentPrintDate }}</p>
              <p class="font-bold text-slate-900 mt-0.5">Guru / Piket</p>
              <div class="h-16 flex items-center justify-center">
                <span class="no-print text-[10px] text-slate-300 italic select-none">(Ruang Tanda Tangan)</span>
              </div>
              
              <!-- Nama Guru / Piket (Editable di Layar, Plain Text saat Print, Default dari User Login) -->
              <div class="w-full">
                <span class="print:inline hidden font-bold underline text-slate-900">
                  ({{ (guruPiketNama || defaultGuruName) ? ` ${guruPiketNama || defaultGuruName} ` : ' ............................................ ' }})
                </span>
                <div class="no-print flex items-center justify-center gap-1">
                  <span class="text-slate-700 font-bold">(</span>
                  <input
                    v-model="guruPiketNama"
                    @blur="handleGuruNamaBlur"
                    type="text"
                    class="font-bold underline text-slate-900 text-center border-b border-dashed border-slate-300 hover:border-blue-400 focus:border-blue-600 focus:outline-none bg-transparent px-1 text-xs w-60 transition-colors"
                    :placeholder="defaultGuruName || 'Ketik Nama Guru/Piket'"
                    title="Klik untuk mengubah nama penandatangan (Default: user login)"
                  />
                  <span class="text-slate-700 font-bold">)</span>
                </div>

                <!-- NIP Guru / Piket (Editable di Layar, Plain Text saat Print) -->
                <div class="mt-0.5">
                  <span class="print:inline hidden text-[10px] text-slate-600 font-mono">
                    NIP: {{ guruPiketNip || defaultGuruNip || '-' }}
                  </span>
                  <div class="no-print flex items-center justify-center gap-1">
                    <span class="text-[10px] text-slate-500 font-mono">NIP:</span>
                    <input
                      v-model="guruPiketNip"
                      @blur="handleGuruNipBlur"
                      type="text"
                      class="text-[10px] text-slate-500 font-mono text-center border-b border-dashed border-transparent hover:border-slate-300 focus:border-blue-600 focus:outline-none bg-transparent px-1 w-44 transition-colors"
                      :placeholder="defaultGuruNip || '-'"
                      title="Klik untuk mengubah NIP penandatangan (Default: user login)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================================== -->
      <!-- TAB 4: VERIFIKASI PENGAJUAN IZIN & SAKIT SISWA -->
      <!-- ============================================================== -->
      <div v-if="activeTab === 'izin'" class="space-y-4">
        <!-- Control Bar & Sub-Tabs -->
        <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 class="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <span class="material-icons text-blue-600 text-lg">assignment_turned_in</span>
                <span>Verifikasi Pengajuan Izin &amp; Sakit</span>
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">
                Periksa bukti surat, setujui untuk merekam presensi resmi atau tolak dengan catatan verifikasi.
              </p>
            </div>

            <!-- Sub Tab Toggle -->
            <div class="inline-flex p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                @click="izinSubTab = 'pending'"
                :class="[
                  'px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
                  izinSubTab === 'pending'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                ]"
              >
                <span>Perlu Tindakan</span>
                <span
                  v-if="pendingLeaves.length > 0"
                  class="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white"
                >
                  {{ pendingLeaves.length }}
                </span>
              </button>
              <button
                type="button"
                @click="izinSubTab = 'history'"
                :class="[
                  'px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
                  izinSubTab === 'history'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                ]"
              >
                <span>Riwayat Verifikasi</span>
                <span class="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
                  {{ historyLeaves.length }}
                </span>
              </button>
            </div>
          </div>

          <!-- Filter & Search -->
          <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <div class="flex items-center gap-1.5">
              <label class="text-[11px] font-bold text-slate-700">Kelas:</label>
              <select
                v-model="izinClassFilter"
                class="px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">Semua Kelas</option>
                <option v-for="cls in availableClasses" :key="'izin-cls-' + cls" :value="cls">
                  Kelas {{ cls }}
                </option>
              </select>
            </div>

            <div class="w-full sm:w-56 relative ml-auto">
              <input
                v-model="izinSearchQuery"
                type="text"
                placeholder="Cari siswa / NISN..."
                class="w-full pl-8 pr-3 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
              <span class="material-icons absolute left-2.5 top-1.5 text-slate-400 text-xs">search</span>
            </div>
          </div>
        </div>

        <!-- 1. TAMPILAN TAB PENDING (PERLU TINDAKAN) -->
        <div v-if="izinSubTab === 'pending'" class="space-y-3">
          <div v-if="filteredPendingLeaves.length === 0" class="bg-white p-8 rounded-2xl border border-slate-200/80 text-center space-y-2">
            <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <span class="material-icons text-2xl">check_circle</span>
            </div>
            <h4 class="font-bold text-slate-800 text-sm">Semua Pengajuan Telah Diverifikasi</h4>
            <p class="text-xs text-slate-500 max-w-sm mx-auto">
              Tidak ada pengajuan izin atau sakit yang tertunda untuk kelas yang Anda pilih.
            </p>
          </div>

          <div
            v-for="req in filteredPendingLeaves"
            :key="req.id"
            class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 transition-all"
          >
            <!-- Header Permohonan -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div class="flex items-center gap-3 min-w-0">
                <div
                  class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs font-bold text-sm"
                  :class="req.jenis === 'sakit' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'"
                >
                  <span class="material-icons text-xl">{{ req.jenis === 'sakit' ? 'medical_services' : 'assignment' }}</span>
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <h4 class="font-bold text-slate-900 text-sm truncate">{{ req.nama_lengkap }}</h4>
                    <span class="px-2 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      Kelas {{ req.kelas }}
                    </span>
                  </div>
                  <p class="text-[11px] text-slate-500 font-mono mt-0.5">
                    NISN: {{ req.nomor_induk || '-' }} &bull; Tanggal Izin: <strong>{{ formatIndonesianDate(req.tanggal_mulai) }}</strong>
                  </p>
                </div>
              </div>

              <!-- Badge Status -->
              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 self-start sm:self-center">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                <span>Menunggu Verifikasi</span>
              </span>
            </div>

            <!-- Isi Keterangan & Bukti Surat -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
              <div class="md:col-span-2 space-y-1">
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Alasan / Keterangan:</span>
                <p class="text-xs text-slate-800 leading-relaxed italic">
                  "{{ req.keterangan || '-' }}"
                </p>
                <p class="text-[10px] text-slate-400 mt-2">
                  Diajukan pada: {{ formatDateTimeDisplay(req.created_at) }}
                </p>
              </div>

              <!-- Lampiran Bukti Surat -->
              <div class="border-t md:border-t-0 md:border-l border-slate-200 pt-2 md:pt-0 md:pl-3 flex flex-col justify-center">
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Bukti Dokumen:</span>
                <div v-if="req.bukti_surat_url" class="flex items-center gap-2.5">
                  <div
                    @click="lightboxPhoto = req.bukti_surat_url"
                    class="w-16 h-16 rounded-lg overflow-hidden border border-slate-300 relative cursor-pointer group shrink-0 shadow-2xs"
                    title="Klik untuk memperbesar dokumen"
                  >
                    <img :src="req.bukti_surat_url" alt="Surat Dokter" class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div class="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span class="material-icons text-white text-base">zoom_in</span>
                    </div>
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="text-[11px] font-bold text-slate-800">Foto Bukti Surat</p>
                    <button
                      type="button"
                      @click="lightboxPhoto = req.bukti_surat_url"
                      class="text-[11px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer inline-flex items-center gap-0.5 mt-0.5"
                    >
                      <span class="material-icons text-xs">visibility</span>
                      <span>Zoom Penuh</span>
                    </button>
                  </div>
                </div>
                <div v-else class="text-xs text-slate-400 italic flex items-center gap-1">
                  <span class="material-icons text-sm text-slate-300">hide_image</span>
                  <span>Tanpa lampiran berkas</span>
                </div>
              </div>
            </div>

            <!-- Tombol Aksi Verifikasi -->
            <div class="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                @click="openRejectModal(req)"
                class="px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span class="material-icons text-sm">cancel</span>
                <span>Tolak</span>
              </button>
              <button
                type="button"
                @click="handleApproveLeave(req)"
                class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span class="material-icons text-sm">check_circle</span>
                <span>Setujui (Catat Presensi)</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 2. TAMPILAN TAB RIWAYAT VERIFIKASI -->
        <div v-if="izinSubTab === 'history'" class="space-y-3">
          <div v-if="filteredHistoryLeaves.length === 0" class="bg-white p-8 rounded-2xl border border-slate-200/80 text-center space-y-2">
            <span class="material-icons text-3xl text-slate-300">history</span>
            <p class="text-xs text-slate-500">Belum ada riwayat pengajuan yang diverifikasi.</p>
          </div>

          <div
            v-for="req in filteredHistoryLeaves"
            :key="req.id"
            class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2.5"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-2.5 min-w-0">
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0"
                  :class="req.jenis === 'sakit' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'"
                >
                  {{ req.jenis }}
                </span>
                <h4 class="font-bold text-slate-900 text-sm truncate">{{ req.nama_lengkap }} (Kelas {{ req.kelas }})</h4>
              </div>

              <span
                v-if="req.status === 'approved'"
                class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0"
              >
                <span class="material-icons text-[12px]">check_circle</span>
                <span>Disetujui</span>
              </span>
              <span
                v-else
                class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 shrink-0"
              >
                <span class="material-icons text-[12px]">cancel</span>
                <span>Ditolak</span>
              </span>
            </div>

            <p class="text-xs text-slate-700 italic">"{{ req.keterangan || '-' }}"</p>

            <div class="p-2.5 bg-slate-50 rounded-xl text-xs space-y-1 text-slate-600">
              <div class="flex items-center justify-between">
                <span>Tanggal Izin: <strong>{{ formatIndonesianDate(req.tanggal_mulai) }}</strong></span>
                <span v-if="req.diverifikasi_oleh">Diverifikasi: <strong>{{ req.diverifikasi_oleh }}</strong></span>
              </div>
              <div v-if="req.catatan_verifikasi" class="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                Catatan: {{ req.catatan_verifikasi }}
              </div>
            </div>

            <div v-if="req.bukti_surat_url" class="pt-1 flex items-center justify-between">
              <button
                type="button"
                @click="lightboxPhoto = req.bukti_surat_url"
                class="text-[11px] font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 cursor-pointer"
              >
                <span class="material-icons text-xs">image</span>
                <span>Buka Bukti Surat</span>
              </button>
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

    <!-- Modal Konfirmasi & Input Jam Masuk Tandai Hadir Semua (Mobile-Friendly) -->
    <div
      v-if="showBatchPresentModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
      @click.self="showBatchPresentModal = false"
    >
      <div class="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
        <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
          <span class="material-icons text-2xl">done_all</span>
        </div>

        <div class="text-center space-y-1">
          <h4 class="font-extrabold text-slate-900 text-base sm:text-lg">
            Tandai Hadir Semua Siswa
          </h4>
          <p class="text-xs text-slate-500">
            Kelas <strong class="text-slate-800">{{ selectedClass }}</strong> • <span class="font-mono text-slate-700">{{ selectedDate }}</span>
          </p>
        </div>

        <!-- Input Time & Presets -->
        <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
          <label class="block text-center text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            Tentukan Jam Masuk:
          </label>
          <div class="flex items-center justify-center">
            <input
              type="time"
              v-model="batchPresentTime"
              class="text-3xl font-black font-mono text-center text-slate-900 bg-white border-2 border-emerald-200 focus:border-emerald-600 rounded-2xl px-4 py-2 shadow-xs focus:outline-none cursor-pointer"
            />
          </div>

          <!-- Quick Presets -->
          <div class="flex items-center justify-center gap-1.5 pt-1">
            <button
              type="button"
              @click="setPresetPresentTime('now')"
              class="px-2.5 py-1 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-lg text-[11px] font-bold text-slate-700 hover:text-emerald-700 transition cursor-pointer"
            >
              Sekarang
            </button>
            <button
              type="button"
              @click="setPresetPresentTime('07:30')"
              class="px-2.5 py-1 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-lg text-[11px] font-bold text-slate-700 hover:text-emerald-700 transition cursor-pointer font-mono"
            >
              07:30
            </button>
            <button
              type="button"
              @click="setPresetPresentTime('08:00')"
              class="px-2.5 py-1 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-lg text-[11px] font-bold text-slate-700 hover:text-emerald-700 transition cursor-pointer font-mono"
            >
              08:00
            </button>
          </div>
        </div>

        <p class="text-[11px] text-slate-500 text-center leading-relaxed">
          Semua siswa yang belum diabsen akan otomatis dicatat sebagai <span class="text-emerald-700 font-bold">Hadir</span>.
        </p>

        <div class="grid grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            @click="showBatchPresentModal = false"
            class="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            @click="confirmBatchAllPresent"
            class="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span class="material-icons text-sm">check</span>
            <span>Terapkan Hadir</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Input Jam Pulang Bersama (Mobile-Friendly) -->
    <div
      v-if="showBatchCheckoutModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
      @click.self="showBatchCheckoutModal = false"
    >
      <div class="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
        <div class="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto">
          <span class="material-icons text-2xl">logout</span>
        </div>

        <div class="text-center space-y-1">
          <h4 class="font-extrabold text-slate-900 text-base sm:text-lg">
            Set Jam Pulang Bersama
          </h4>
          <p class="text-xs text-slate-500">
            Kelas <strong class="text-slate-800">{{ selectedClass }}</strong> • <span class="font-mono text-slate-700">{{ selectedDate }}</span>
          </p>
        </div>

        <!-- Input Time & Presets -->
        <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
          <label class="block text-center text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            Tentukan Jam Pulang:
          </label>
          <div class="flex items-center justify-center">
            <input
              type="time"
              v-model="batchCheckoutTime"
              class="text-3xl font-black font-mono text-center text-slate-900 bg-white border-2 border-indigo-200 focus:border-indigo-600 rounded-2xl px-4 py-2 shadow-xs focus:outline-none cursor-pointer"
            />
          </div>

          <!-- Quick Presets -->
          <div class="flex items-center justify-center gap-1.5 pt-1">
            <button
              type="button"
              @click="setPresetCheckoutTime('now')"
              class="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-lg text-[11px] font-bold text-slate-700 hover:text-indigo-700 transition cursor-pointer"
            >
              Sekarang
            </button>
            <button
              type="button"
              @click="setPresetCheckoutTime('13:00')"
              class="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-lg text-[11px] font-bold text-slate-700 hover:text-indigo-700 transition cursor-pointer font-mono"
            >
              13:00
            </button>
            <button
              type="button"
              @click="setPresetCheckoutTime('14:00')"
              class="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-lg text-[11px] font-bold text-slate-700 hover:text-indigo-700 transition cursor-pointer font-mono"
            >
              14:00
            </button>
            <button
              type="button"
              @click="setPresetCheckoutTime('15:00')"
              class="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-lg text-[11px] font-bold text-slate-700 hover:text-indigo-700 transition cursor-pointer font-mono"
            >
              15:00
            </button>
          </div>
        </div>

        <p class="text-[11px] text-slate-500 text-center leading-snug">
          Jam pulang di atas akan dicatat untuk semua siswa yang berstatus Hadir pada hari ini.
        </p>

        <div class="grid grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            @click="showBatchCheckoutModal = false"
            class="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            @click="confirmBatchAllCheckOut"
            class="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span class="material-icons text-sm">check</span>
            <span>Terapkan</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Toast Notification (Mobile & Desktop Friendly, Floating Top Center) -->
    <transition
      enter-active-class="transform transition ease-out duration-300"
      enter-from-class="-translate-y-4 opacity-0 scale-95"
      enter-to-class="translate-y-0 opacity-100 scale-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="-translate-y-2 opacity-0 scale-95"
    >
      <div
        v-if="toast.show"
        class="fixed top-4 left-1/2 -translate-x-1/2 z-60 max-w-sm w-[92%] sm:w-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-md transition-all select-none"
        :class="[
          toast.type === 'success' ? 'bg-slate-900/95 text-white border-emerald-500/50 shadow-emerald-950/20' :
          toast.type === 'warning' ? 'bg-slate-900/95 text-white border-amber-500/50 shadow-amber-950/20' :
          toast.type === 'error' ? 'bg-slate-900/95 text-white border-rose-500/50 shadow-rose-950/20' :
          'bg-slate-900/95 text-white border-blue-500/50 shadow-blue-950/20'
        ]"
      >
        <span
          class="material-icons text-xl shrink-0"
          :class="[
            toast.type === 'success' ? 'text-emerald-400' :
            toast.type === 'warning' ? 'text-amber-400' :
            toast.type === 'error' ? 'text-rose-400' : 'text-blue-400'
          ]"
        >
          {{ toast.type === 'success' ? 'check_circle' : toast.type === 'warning' ? 'warning' : toast.type === 'error' ? 'error' : 'info' }}
        </span>
        <span class="text-xs font-semibold flex-1 leading-snug">{{ toast.message }}</span>
        <button
          type="button"
          @click="toast.show = false"
          class="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
        >
          <span class="material-icons text-base">close</span>
        </button>
      </div>
    </transition>

    <!-- Modal Alasan Penolakan Izin Siswa -->
    <div
      v-if="showRejectModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
      @click.self="showRejectModal = false"
    >
      <div class="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
        <div class="flex items-center gap-2.5 text-rose-600 font-bold text-base">
          <div class="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center">
            <span class="material-icons text-xl text-rose-600">cancel</span>
          </div>
          <span>Tolak Pengajuan Izin</span>
        </div>
        <p class="text-xs text-slate-600 leading-relaxed">
          Siswa: <strong class="text-slate-900">{{ selectedLeaveToReject?.nama_lengkap }}</strong> &bull; Kelas {{ selectedLeaveToReject?.kelas }}
        </p>
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">
            Catatan Penolakan <span class="text-slate-400 font-normal">(Terlihat oleh siswa)</span>
          </label>
          <textarea
            v-model="rejectReason"
            rows="3"
            placeholder="Tuliskan alasan penolakan, contoh: Foto surat buram/tidak terbaca..."
            class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
          ></textarea>
        </div>
        <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            @click="showRejectModal = false"
            class="py-2.5 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            @click="confirmRejectLeave"
            class="py-2.5 px-3 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-xs cursor-pointer active:scale-95"
          >
            Kirim Penolakan
          </button>
        </div>
      </div>
    </div>

    <!-- Lightbox Modal untuk Pratinjau Bukti Surat Penuh Resolusi Tinggi -->
    <div
      v-if="lightboxPhoto"
      class="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs animate-fade-in"
      @click.self="lightboxPhoto = null"
    >
      <div class="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
        <div class="px-4 py-3 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <span class="text-xs font-bold flex items-center gap-1.5">
            <span class="material-icons text-sm text-blue-400">description</span>
            <span>Bukti Dokumen Surat Izin / Surat Dokter (Resolusi Penuh)</span>
          </span>
          <button
            type="button"
            @click="lightboxPhoto = null"
            class="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <span class="material-icons text-base">close</span>
          </button>
        </div>
        <div class="p-3 bg-slate-100 flex-1 overflow-auto flex items-center justify-center min-h-[300px]">
          <img :src="lightboxPhoto" alt="Foto Bukti Surat" class="max-w-full max-h-[75vh] object-contain rounded-lg shadow-sm" />
        </div>
        <div class="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span class="text-[11px] text-slate-500">Stempel klinik, tanda tangan &amp; tanggal dapat diperiksa jelas</span>
          <button
            type="button"
            @click="lightboxPhoto = null"
            class="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold text-xs cursor-pointer"
          >
            Tutup Pratinjau
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Html5Qrcode } from 'html5-qrcode'
import XLSX from 'xlsx-js-style'
import { getCalendarYearOptions, getAcademicYearForMonthYear } from '../utils/academicYear'
import { getWibDateStr, getWibTimeStr, normalizeClockInput, formatIndonesianDate } from '../utils/dateTime'
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
const validTabs = ['manual', 'scan', 'rekap', 'izin']
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

const pendingIzinCount = computed(() => {
  return (attendanceStore.leaveRequests || []).filter(r => r.status === 'pending').length
})

// Navigation Items (Clean & Simple)
const navItems = computed(() => [
  { key: 'manual', icon: 'fact_check', label: 'Presensi Harian' },
  { key: 'scan', icon: 'qr_code_scanner', label: 'Scanner QR Piket' },
  { key: 'rekap', icon: 'table_chart', label: 'Buku Rekap' },
  {
    key: 'izin',
    icon: 'assignment_turned_in',
    label: 'Verifikasi Izin',
    badge: pendingIzinCount.value > 0 ? String(pendingIzinCount.value) : null
  }
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

const selectedDate = ref(getWibDateStr())

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
  const todayStr = getWibDateStr()
  return attendanceStore.todayAttendances.find(a =>
    a.user_id === studentId &&
    (a.tanggal === selectedDate.value || (!a.tanggal && selectedDate.value === todayStr))
  )
}

const attendanceStats = computed(() => {
  let hadir = 0, sakit = 0, izin = 0, alpa = 0, belum = 0
  classStudents.value.forEach(std => {
    const rec = getStudentAttendance(std.id)
    const st = rec?.status
    if (st === 'hadir' || st === 'terlambat') hadir++
    else if (st === 'sakit') sakit++
    else if (st === 'izin') izin++
    else if (st === 'alpa') alpa++
    else belum++
  })
  return { hadir, sakit, izin, alpa, belum }
})

async function changeStatus(student, newStatus) {
  const res = await attendanceStore.setManualAttendance(
    student,
    newStatus,
    currentTeacher.value,
    newStatus === 'hadir' ? '07:30' : null,
    null,
    selectedDate.value
  )
  if (res?.success === false) {
    showToast(res.message || 'Gagal memperbarui status kehadiran.', 'error')
  }
}

async function updateJamMasuk(student, val) {
  const clean = (val || '').trim()
  if (clean && !normalizeClockInput(clean)) {
    showToast('Format jam masuk tidak valid. Gunakan HH:MM (contoh: 07:30).', 'warning')
    return
  }
  const currentAtt = getStudentAttendance(student.id)
  const targetStatus =
    currentAtt?.status === 'hadir' || currentAtt?.status === 'terlambat'
      ? currentAtt.status
      : 'hadir'
  const res = await attendanceStore.setManualAttendance(
    student,
    targetStatus,
    currentTeacher.value,
    clean || null,
    undefined,
    selectedDate.value
  )
  if (res?.success === false) {
    showToast(res.message || 'Gagal memperbarui jam masuk.', 'error')
  }
}

async function updateJamPulang(student, val) {
  const clean = (val || '').trim()
  if (clean && !normalizeClockInput(clean)) {
    showToast('Format jam pulang tidak valid. Gunakan HH:MM (contoh: 14:00).', 'warning')
    return
  }
  const currentAtt = getStudentAttendance(student.id)
  const res = await attendanceStore.setManualAttendance(
    student,
    currentAtt?.status || 'hadir',
    currentTeacher.value,
    currentAtt?.jam_masuk,
    clean || null,
    selectedDate.value
  )
  if (res?.success === false) {
    showToast(res.message || 'Gagal memperbarui jam pulang.', 'error')
  }
}

async function handleSingleCheckOut(student) {
  const nowTime = getWibTimeStr().substring(0, 5)
  const currentAtt = getStudentAttendance(student.id)
  
  // Jika status saat ini bukan hadir/terlambat/sakit/izin (misal belum tercatat atau alpa), jadikan 'hadir'
  let targetStatus = currentAtt?.status
  if (!targetStatus || targetStatus === 'alpa') {
    targetStatus = 'hadir'
  }
  
  const jamMasuk = currentAtt?.jam_masuk || (targetStatus === 'hadir' ? '07:30' : null)

  const res = await attendanceStore.setManualAttendance(
    student,
    targetStatus,
    currentTeacher.value,
    jamMasuk,
    nowTime,
    selectedDate.value
  )
  if (res?.success === false) {
    showToast(res.message || 'Gagal mencatat jam pulang.', 'error')
    return
  }
  showToast(`Jam pulang ${student.nama_lengkap} dicatat (${nowTime})`, 'success')
}

async function clearJamPulang(student) {
  const currentAtt = getStudentAttendance(student.id)
  if (!currentAtt) return
  const res = await attendanceStore.setManualAttendance(
    student,
    currentAtt.status || 'hadir',
    currentTeacher.value,
    currentAtt.jam_masuk,
    null,
    selectedDate.value
  )
  if (res?.success === false) {
    showToast(res.message || 'Gagal membatalkan jam pulang.', 'error')
    return
  }
  showToast(`Jam pulang ${student.nama_lengkap} dibatalkan`, 'info')
}

async function updateKeterangan(student, val) {
  const clean = (val || '').trim()
  const res = await attendanceStore.setManualAttendance(
    student,
    getStudentAttendance(student.id)?.status || 'hadir',
    currentTeacher.value,
    undefined,
    undefined,
    selectedDate.value,
    clean || null
  )
  if (res?.success === false) {
    showToast(res.message || 'Gagal memperbarui keterangan.', 'error')
  }
}

function formatTimeDisplay(t) {
  if (!t) return ''
  return t.length > 5 ? t.substring(0, 5) : t
}

// State Toast Notification (Mobile & Desktop Friendly)
const toast = ref({
  show: false,
  message: '',
  type: 'success', // 'success' | 'warning' | 'error' | 'info'
  timeout: null
})

function showToast(message, type = 'success') {
  if (toast.value.timeout) clearTimeout(toast.value.timeout)
  toast.value.message = message
  toast.value.type = type
  toast.value.show = true
  toast.value.timeout = setTimeout(() => {
    toast.value.show = false
  }, 3500)
}

// Modal State: Tandai Hadir Semua (Dengan Input Jam Masuk & Default Waktu Sekarang)
const showBatchPresentModal = ref(false)
const batchPresentTime = ref('')

function openBatchPresentModal() {
  batchPresentTime.value = getWibTimeStr().substring(0, 5)
  showBatchPresentModal.value = true
}

function setPresetPresentTime(val) {
  if (val === 'now') {
    batchPresentTime.value = getWibTimeStr().substring(0, 5)
  } else {
    batchPresentTime.value = val
  }
}

async function confirmBatchAllPresent() {
  const defaultTime = getWibTimeStr().substring(0, 5)
  const inputTime = batchPresentTime.value.trim() || defaultTime

  const res = await attendanceStore.batchSetAllPresent(selectedClass.value, selectedDate.value, currentTeacher.value, inputTime)
  showBatchPresentModal.value = false
  if (!res?.success) {
    showToast(res?.message || 'Gagal mencatat presensi kolektif.', 'error')
    return
  }
  if (res.count > 0) {
    showToast(`Berhasil menandai ${res.count} siswa Kelas ${selectedClass.value} sebagai Hadir (${inputTime})!`, 'success')
  } else {
    showToast(`Semua siswa Kelas ${selectedClass.value} sudah tercatat kehadirannya hari ini.`, 'info')
  }
}

// Modal State: Set Jam Pulang Bersama
const showBatchCheckoutModal = ref(false)
const batchCheckoutTime = ref('')

function openBatchCheckoutModal() {
  batchCheckoutTime.value = getWibTimeStr().substring(0, 5)
  showBatchCheckoutModal.value = true
}

function setPresetCheckoutTime(val) {
  if (val === 'now') {
    batchCheckoutTime.value = getWibTimeStr().substring(0, 5)
  } else {
    batchCheckoutTime.value = val
  }
}

async function confirmBatchAllCheckOut() {
  const defaultTime = getWibTimeStr().substring(0, 5)
  const inputTime = batchCheckoutTime.value.trim() || defaultTime

  const res = await attendanceStore.batchSetAllCheckOut(selectedClass.value, selectedDate.value, currentTeacher.value, inputTime)
  showBatchCheckoutModal.value = false
  if (!res?.success) {
    showToast(res?.message || 'Gagal mencatat jam pulang kolektif.', 'error')
    return
  }
  if (res.count > 0) {
    showToast(`Berhasil mencatat jam pulang (${inputTime}) untuk ${res.count} siswa Kelas ${selectedClass.value}!`, 'success')
  } else {
    showToast(`Semua siswa yang hadir di Kelas ${selectedClass.value} sudah memiliki jam pulang tercatat.`, 'info')
  }
}

// Tab 2: Scanner QR (IGNORE LOCATION)
const isScanning = ref(false)
let html5QrCode = null
const lastScannedStudent = ref(null)
const lastScannedType = ref('')
const lastScannedTime = ref('')
const cooldownSeconds = ref(0)
let cooldownTimer = null

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

function playWarningBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(440, ctx.currentTime) // 440Hz lower warning beep
    gain.gain.setValueAtTime(0.18, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)
    osc.start()
    osc.stop(ctx.currentTime + 0.25)
  } catch (e) {}
}

function startCooldown(seconds = 3) {
  if (cooldownTimer) clearInterval(cooldownTimer)
  cooldownSeconds.value = seconds
  cooldownTimer = setInterval(() => {
    cooldownSeconds.value--
    if (cooldownSeconds.value <= 0) {
      clearInterval(cooldownTimer)
      cooldownTimer = null
      cooldownSeconds.value = 0
    }
  }, 1000)
}

async function startScanner() {
  isScanning.value = true
  cooldownSeconds.value = 0
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
    showToast('Gagal mengakses kamera: ' + err.message, 'error')
    isScanning.value = false
  }
}

async function stopScanner() {
  if (cooldownTimer) {
    clearInterval(cooldownTimer)
    cooldownTimer = null
  }
  cooldownSeconds.value = 0

  if (html5QrCode && isScanning.value) {
    try {
      await html5QrCode.stop()
    } catch (e) {}
  }
  isScanning.value = false
}

async function onScanSuccess(decodedText) {
  if (cooldownSeconds.value > 0) return

  // Beri jeda pemindaian 3 detik untuk mencegah scan ganda beruntun
  startCooldown(3)

  const res = await attendanceStore.scanStudentQr(decodedText, currentTeacher.value)
  if (res?.success) {
    playBeep()
    lastScannedStudent.value = res.student || {
      nama: res.nama,
      kelas: res.kelas,
      nomor_induk: res.nomor_induk,
      jenis_kelamin: res.jenis_kelamin
    }
    lastScannedType.value = res.type
    lastScannedTime.value = formatTimeDisplay(res.jam) || getWibTimeStr().substring(0, 5)
    if (res.type === 'selesai') {
      showToast(res.message || `${lastScannedStudent.value.nama} sudah selesai Masuk & Pulang hari ini.`, 'info')
    } else {
      showToast(
        `Presensi ${res.type === 'masuk' ? 'Masuk' : 'Pulang'} berhasil: ${lastScannedStudent.value.nama}`,
        'success'
      )
    }
  } else if (res?.isDoubleScan) {
    playWarningBeep()
    showToast(res.message, 'warning')
  } else {
    showToast(res?.message || 'QR Code tidak valid', 'error')
  }
}

onBeforeUnmount(() => {
  stopScanner()
  if (cooldownTimer) clearInterval(cooldownTimer)
  if (signatorySaveTimer) clearTimeout(signatorySaveTimer)
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

const savedRekapYear = localStorage.getItem('presensi_guru_rekap_year')
const rekapYear = ref(savedRekapYear ? parseInt(savedRekapYear, 10) : now.getFullYear())

watch(rekapYear, (val) => {
  if (val) localStorage.setItem('presensi_guru_rekap_year', String(val))
})

watch(
  [rekapYear, rekapMonth],
  ([y, m]) => {
    attendanceStore.ensureMonthAttendancesLoaded(y, m)
  },
  { immediate: true }
)

const availableYears = computed(() => {
  const existingYears = []
  if (attendanceStore.todayAttendances) {
    attendanceStore.todayAttendances.forEach(att => {
      if (att.tanggal) {
        const y = parseInt(att.tanggal.split('-')[0], 10)
        if (y) existingYears.push(y)
      }
    })
  }
  return getCalendarYearOptions(existingYears, 3, 2, now)
})

const rekapAcademicYear = computed(() => {
  return getAcademicYearForMonthYear(rekapMonth.value, rekapYear.value)
})

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

// State Penandatangan "Mengetahui" (Kepala PKBM Cahaya Mulia - Sinkron dengan database)
const rawMengetahuiJabatan = attendanceStore.schoolSettings?.mengetahui_jabatan
const initialMengetahuiJabatan = (!rawMengetahuiJabatan || rawMengetahuiJabatan === 'Ketua PKBM Cahaya Mulia')
  ? 'Kepala PKBM Cahaya Mulia'
  : rawMengetahuiJabatan

const mengetahuiJabatan = ref(initialMengetahuiJabatan)
const mengetahuiNama = ref(attendanceStore.schoolSettings?.mengetahui_nama || '')
const mengetahuiNip = ref(attendanceStore.schoolSettings?.mengetahui_nip || '')

// State Penandatangan "Guru / Piket" (Editable dengan default dari user yang sedang login)
const defaultGuruName = computed(() => currentTeacher.value?.nama_lengkap || authStore.user?.nama_lengkap || '')
const defaultGuruNip = computed(() => currentTeacher.value?.nomor_induk || authStore.user?.nomor_induk || '')

const guruPiketNama = ref('')
const guruPiketNip = ref('')

watch(defaultGuruName, (newVal) => {
  const userKey = 'presensi_rekap_guru_nama_' + (authStore.user?.id || 'guest')
  const saved = localStorage.getItem(userKey)
  guruPiketNama.value = (saved !== null && saved !== '') ? saved : (newVal || '')
}, { immediate: true })

watch(defaultGuruNip, (newVal) => {
  const userKey = 'presensi_rekap_guru_nip_' + (authStore.user?.id || 'guest')
  const saved = localStorage.getItem(userKey)
  guruPiketNip.value = (saved !== null && saved !== '') ? saved : (newVal || '')
}, { immediate: true })

function handleGuruNamaBlur() {
  const userKey = 'presensi_rekap_guru_nama_' + (authStore.user?.id || 'guest')
  if (!guruPiketNama.value || !guruPiketNama.value.trim()) {
    guruPiketNama.value = defaultGuruName.value
    localStorage.removeItem(userKey)
  } else {
    localStorage.setItem(userKey, guruPiketNama.value)
  }
}

function handleGuruNipBlur() {
  const userKey = 'presensi_rekap_guru_nip_' + (authStore.user?.id || 'guest')
  if (!guruPiketNip.value || !guruPiketNip.value.trim()) {
    guruPiketNip.value = defaultGuruNip.value
    localStorage.removeItem(userKey)
  } else {
    localStorage.setItem(userKey, guruPiketNip.value)
  }
}

let isSyncingSignatory = false
let signatorySaveTimer = null

watch(
  () => [
    attendanceStore.schoolSettings?.mengetahui_jabatan,
    attendanceStore.schoolSettings?.mengetahui_nama,
    attendanceStore.schoolSettings?.mengetahui_nip
  ],
  ([jab, nama, nip]) => {
    isSyncingSignatory = true
    if (jab !== undefined && jab !== null) {
      mengetahuiJabatan.value = (jab === 'Ketua PKBM Cahaya Mulia' ? 'Kepala PKBM Cahaya Mulia' : jab) || 'Kepala PKBM Cahaya Mulia'
    }
    if (nama !== undefined && nama !== null) {
      mengetahuiNama.value = nama
    }
    if (nip !== undefined && nip !== null) {
      mengetahuiNip.value = nip
    }
    queueMicrotask(() => {
      isSyncingSignatory = false
    })
  },
  { immediate: true }
)

async function persistMengetahuiSignatory() {
  const res = await attendanceStore.updateRekapSignatory(
    mengetahuiJabatan.value || 'Kepala PKBM Cahaya Mulia',
    mengetahuiNama.value || '',
    mengetahuiNip.value || ''
  )
  if (res?.success === false) {
    showToast(res.message || 'Gagal menyimpan data penandatangan.', 'error')
  }
}

function flushMengetahuiSignatory() {
  if (signatorySaveTimer) {
    clearTimeout(signatorySaveTimer)
    signatorySaveTimer = null
  }
  persistMengetahuiSignatory()
}

watch([mengetahuiJabatan, mengetahuiNama, mengetahuiNip], () => {
  if (isSyncingSignatory) return
  if (signatorySaveTimer) clearTimeout(signatorySaveTimer)
  signatorySaveTimer = setTimeout(() => {
    signatorySaveTimer = null
    persistMengetahuiSignatory()
  }, 700)
})

// Search query untuk mode kartu siswa di mobile
const rekapSearchQuery = ref('')

// State expand kartu siswa di mode mobile (ID siswa)
const expandedStudentId = ref(null)

function toggleExpandStudent(id) {
  expandedStudentId.value = expandedStudentId.value === id ? null : id
}

// Data siswa hasil filter di mode kartu
const filteredMatrixData = computed(() => {
  const list = monthlyMatrixData.value || []
  if (!rekapSearchQuery.value.trim()) return list
  const q = rekapSearchQuery.value.toLowerCase().trim()
  return list.filter(row => 
    row.student.nama_lengkap.toLowerCase().includes(q) ||
    (row.student.nomor_induk && String(row.student.nomor_induk).includes(q))
  )
})

// Ringkasan Akumulasi Kehadiran Kelas Bulan Ini
const classMonthlyStats = computed(() => {
  const rows = monthlyMatrixData.value || []
  const totalStudents = rows.length
  const sumH = rows.reduce((acc, r) => acc + (r.totalH || 0), 0)
  const sumS = rows.reduce((acc, r) => acc + (r.totalS || 0), 0)
  const sumI = rows.reduce((acc, r) => acc + (r.totalI || 0), 0)
  const sumA = rows.reduce((acc, r) => acc + (r.totalA || 0), 0)
  const avgPct = totalStudents > 0 
    ? Math.round(rows.reduce((acc, r) => acc + (r.persentase || 0), 0) / totalStudents)
    : 0
  return { totalStudents, avgPct, sumH, sumS, sumI, sumA }
})

// Ambil daftar tanggal tidak hadir (Sakit, Izin, Alpa) per siswa
function getStudentAbsenceList(row) {
  const absences = []
  for (let day = 1; day <= daysInSelectedMonth.value; day++) {
    const d = row.days[day]
    if (d && d.symbol && d.symbol !== 'H') {
      let label = 'Hadir'
      let badgeClass = 'bg-slate-100 text-slate-800 border-slate-300'
      if (d.symbol === 'S') {
        label = 'Sakit'
        badgeClass = 'bg-amber-100 text-amber-800 border-amber-300'
      } else if (d.symbol === 'I') {
        label = 'Izin'
        badgeClass = 'bg-blue-100 text-blue-800 border-blue-300'
      } else if (d.symbol === 'A') {
        label = 'Alpa'
        badgeClass = 'bg-rose-100 text-rose-800 border-rose-300'
      }
      absences.push({ day, symbol: d.symbol, label, badgeClass })
    }
  }
  return absences
}

const isExportingExcel = ref(false)

async function printMonthlySheet() {
  await attendanceStore.ensureMonthAttendancesLoaded(rekapYear.value, rekapMonth.value)
  const style = document.createElement('style')
  style.id = 'rekap-landscape-print'
  style.innerHTML = `@page { size: A4 landscape !important; margin: 5mm 6mm !important; }`
  document.head.appendChild(style)

  window.print()

  setTimeout(() => {
    const el = document.getElementById('rekap-landscape-print')
    if (el) el.remove()
  }, 1000)
}

// Export Matriks Bulanan ke Excel (.xlsx) dengan Format Cantik Persis Gambar & View Buku Rekap
async function exportMonthlyToExcel() {
  if (isExportingExcel.value) return
  isExportingExcel.value = true
  try {
    await attendanceStore.ensureMonthAttendancesLoaded(rekapYear.value, rekapMonth.value)

    const schoolName = (attendanceStore.schoolSettings?.nama_sekolah || 'PKBM CAHAYA MULIA').toUpperCase()
    const tp = rekapAcademicYear.value
    const mName = monthNames[rekapMonth.value - 1].toUpperCase()
    const daysCount = daysInSelectedMonth.value
    const totalCols = daysCount + 8 // NOMOR, NAMA, L/P, [days], H, S, I, A, %

  // Styling Primitives
  const borderThin = {
    top: { style: 'thin', color: { rgb: '334155' } },
    bottom: { style: 'thin', color: { rgb: '334155' } },
    left: { style: 'thin', color: { rgb: '334155' } },
    right: { style: 'thin', color: { rgb: '334155' } }
  }

  const borderDoubleBottom = {
    top: { style: 'thin', color: { rgb: '334155' } },
    bottom: { style: 'double', color: { rgb: '0F172A' } },
    left: { style: 'thin', color: { rgb: '334155' } },
    right: { style: 'thin', color: { rgb: '334155' } }
  }

  // 1. Susun Array of Arrays (aoa)
  const aoa = []

  // Baris 0 - 2: Judul Kop
  aoa.push(['DAFTAR HADIR SISWA'])
  aoa.push([schoolName])
  aoa.push([`TAHUN PELAJARAN ${tp}`])
  aoa.push([]) // Baris 3: Kosong

  // Baris 4: Info Kelas & Bulan
  const metaRow = new Array(totalCols).fill('')
  metaRow[0] = `Kelas: ${rekapClass.value}`
  metaRow[totalCols - 5] = `Bulan: ${mName} ${rekapYear.value}`
  aoa.push(metaRow)

  // Baris 5: Header Tingkat 1
  const h1 = ['NOMOR', 'NAMA SISWA', 'L/P']
  for (let d = 1; d <= daysCount; d++) {
    h1.push(d === 1 ? 'Tanggal' : '')
  }
  h1.push('Rekapitulasi', '', '', '', '%')
  aoa.push(h1)

  // Baris 6: Header Tingkat 2 (Tanggal 1..daysCount & H, S, I, A)
  const h2 = ['', '', '']
  for (let d = 1; d <= daysCount; d++) {
    h2.push(String(d))
  }
  h2.push('H', 'S', 'I', 'A', '')
  aoa.push(h2)

  // Baris 7+: Data Siswa
  const studentRows = monthlyMatrixData.value
  studentRows.forEach((row, idx) => {
    const r = [
      idx + 1,
      row.student.nama_lengkap.toUpperCase(),
      row.student.jenis_kelamin || 'L'
    ]
    for (let d = 1; d <= daysCount; d++) {
      r.push(row.days[d]?.symbol || '')
    }
    r.push(row.totalH, row.totalS, row.totalI, row.totalA, `${row.persentase}%`)
    aoa.push(r)
  })

  // Baris Rekapitulasi Total Kelas (Summary Row)
  const summaryRow = ['TOTAL KEHADIRAN KELAS', '', '']
  for (let d = 1; d <= daysCount; d++) {
    const totalDayPresent = studentRows.filter(s => s.days[d]?.symbol === 'H').length
    summaryRow.push(totalDayPresent > 0 ? totalDayPresent : '')
  }
  const sumH = studentRows.reduce((acc, r) => acc + (r.totalH || 0), 0)
  const sumS = studentRows.reduce((acc, r) => acc + (r.totalS || 0), 0)
  const sumI = studentRows.reduce((acc, r) => acc + (r.totalI || 0), 0)
  const sumA = studentRows.reduce((acc, r) => acc + (r.totalA || 0), 0)
  const avgPct = studentRows.length > 0
    ? Math.round(studentRows.reduce((acc, r) => acc + (r.persentase || 0), 0) / studentRows.length)
    : 0
  summaryRow.push(sumH, sumS, sumI, sumA, `${avgPct}%`)
  aoa.push(summaryRow)

  // Footer Spacing & Tanda Tangan
  aoa.push([])
  aoa.push([])

  // Ambil index baris awal tanda tangan secara tepat
  const sigStart = aoa.length
  const leftStartCol = 1
  const leftEndCol = Math.min(8, 2 + daysCount)
  const rightStartCol = Math.max(leftEndCol + 2, totalCols - 10)
  const rightEndCol = totalCols - 1

  const teacherName = guruPiketNama.value || defaultGuruName.value || '............................................'
  const teacherNip = guruPiketNip.value || defaultGuruNip.value || '-'

  const sigRow1 = new Array(totalCols).fill('')
  sigRow1[leftStartCol] = 'Mengetahui,'
  sigRow1[rightStartCol] = `Kota Tangerang, ${currentPrintDate.value}`
  aoa.push(sigRow1)

  const sigRow2 = new Array(totalCols).fill('')
  sigRow2[leftStartCol] = mengetahuiJabatan.value || 'Kepala PKBM Cahaya Mulia'
  sigRow2[rightStartCol] = 'Guru / Piket'
  aoa.push(sigRow2)

  aoa.push([])
  aoa.push([])
  aoa.push([])

  const sigRow6 = new Array(totalCols).fill('')
  sigRow6[leftStartCol] = `( ${mengetahuiNama.value || '............................................'} )`
  sigRow6[rightStartCol] = `( ${teacherName} )`
  aoa.push(sigRow6)

  const sigRow7 = new Array(totalCols).fill('')
  if (mengetahuiNip.value) {
    sigRow7[leftStartCol] = `NIP. ${mengetahuiNip.value}`
  }
  sigRow7[rightStartCol] = `NIP. ${teacherNip}`
  aoa.push(sigRow7)

  // 2. Buat Worksheet
  const ws = XLSX.utils.aoa_to_sheet(aoa)

  // 3. Merges Configuration
  ws['!merges'] = [
    // Judul Kop
    { s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: totalCols - 1 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: totalCols - 1 } },
    // Info Kelas & Bulan
    { s: { r: 4, c: 0 }, e: { r: 4, c: 2 } },
    { s: { r: 4, c: totalCols - 5 }, e: { r: 4, c: totalCols - 1 } },
    // Header Table Col 0, 1, 2 Rowspan 2
    { s: { r: 5, c: 0 }, e: { r: 6, c: 0 } }, // NOMOR
    { s: { r: 5, c: 1 }, e: { r: 6, c: 1 } }, // NAMA SISWA
    { s: { r: 5, c: 2 }, e: { r: 6, c: 2 } }, // L/P
    // Tanggal Colspan
    { s: { r: 5, c: 3 }, e: { r: 5, c: 2 + daysCount } },
    // Rekapitulasi Colspan
    { s: { r: 5, c: 3 + daysCount }, e: { r: 5, c: 6 + daysCount } },
    // % Rowspan 2
    { s: { r: 5, c: 7 + daysCount }, e: { r: 6, c: 7 + daysCount } },
    // Summary Row Colspan NOMOR + NAMA + L/P
    { s: { r: 7 + studentRows.length, c: 0 }, e: { r: 7 + studentRows.length, c: 2 } },
    // Tanda Tangan Mengetahui (Kiri)
    { s: { r: sigStart, c: leftStartCol }, e: { r: sigStart, c: leftEndCol } },
    { s: { r: sigStart + 1, c: leftStartCol }, e: { r: sigStart + 1, c: leftEndCol } },
    { s: { r: sigStart + 5, c: leftStartCol }, e: { r: sigStart + 5, c: leftEndCol } },
    ...(mengetahuiNip.value ? [{ s: { r: sigStart + 6, c: leftStartCol }, e: { r: sigStart + 6, c: leftEndCol } }] : []),
    // Tanda Tangan Pembuat / Guru Piket (Kanan)
    { s: { r: sigStart, c: rightStartCol }, e: { r: sigStart, c: rightEndCol } },
    { s: { r: sigStart + 1, c: rightStartCol }, e: { r: sigStart + 1, c: rightEndCol } },
    { s: { r: sigStart + 5, c: rightStartCol }, e: { r: sigStart + 5, c: rightEndCol } },
    { s: { r: sigStart + 6, c: rightStartCol }, e: { r: sigStart + 6, c: rightEndCol } }
  ]

  // 4. Column Widths
  const colWidths = [
    { wch: 6 },  // NOMOR
    { wch: 26 }, // NAMA SISWA
    { wch: 5 }   // L/P
  ]
  for (let i = 0; i < daysCount; i++) {
    colWidths.push({ wch: 3.5 })
  }
  colWidths.push({ wch: 4.5 }, { wch: 4.5 }, { wch: 4.5 }, { wch: 4.5 }, { wch: 6 })
  ws['!cols'] = colWidths

  // Helper aman pasang style sel
  function setStyle(r, c, style) {
    const ref = XLSX.utils.encode_cell({ r, c })
    if (!ws[ref]) ws[ref] = { t: 's', v: '' }
    ws[ref].s = { ...(ws[ref].s || {}), ...style }
  }

  // 5. Terapkan Style Judul Kop (Baris 0, 1, 2)
  setStyle(0, 0, {
    font: { name: 'Calibri', sz: 12, bold: true, color: { rgb: '0F172A' } },
    alignment: { horizontal: 'center', vertical: 'center' }
  })
  setStyle(1, 0, {
    font: { name: 'Calibri', sz: 15, bold: true, color: { rgb: '1E3A8A' } },
    alignment: { horizontal: 'center', vertical: 'center' }
  })
  setStyle(2, 0, {
    font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: '334155' } },
    alignment: { horizontal: 'center', vertical: 'center' }
  })

  // Style Info Baris 4 (Kelas & Bulan)
  setStyle(4, 0, {
    font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: '0F172A' } },
    alignment: { horizontal: 'left', vertical: 'center' }
  })
  setStyle(4, totalCols - 5, {
    font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: '0F172A' } },
    alignment: { horizontal: 'right', vertical: 'center' }
  })

  // 6. Terapkan Border & Fill pada Header Tabel (Baris 5 & 6)
  for (let c = 0; c < totalCols; c++) {
    // Header Baris 5
    setStyle(5, c, {
      font: { name: 'Calibri', sz: 9, bold: true, color: { rgb: '0F172A' } },
      fill: { fgColor: { rgb: 'E2E8F0' } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: borderThin
    })
    // Header Baris 6
    setStyle(6, c, {
      font: { name: 'Calibri', sz: 9, bold: true, color: { rgb: '0F172A' } },
      fill: { fgColor: { rgb: 'F1F5F9' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: borderThin
    })
  }

  // Khusus Header Rekap H, S, I, A di Baris 6
  setStyle(6, 3 + daysCount, {
    font: { name: 'Calibri', sz: 9, bold: true, color: { rgb: '047857' } },
    fill: { fgColor: { rgb: 'D1FAE5' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: borderThin
  })
  setStyle(6, 4 + daysCount, {
    font: { name: 'Calibri', sz: 9, bold: true, color: { rgb: 'B45309' } },
    fill: { fgColor: { rgb: 'FEF3C7' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: borderThin
  })
  setStyle(6, 5 + daysCount, {
    font: { name: 'Calibri', sz: 9, bold: true, color: { rgb: '1D4ED8' } },
    fill: { fgColor: { rgb: 'DBEAFE' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: borderThin
  })
  setStyle(6, 6 + daysCount, {
    font: { name: 'Calibri', sz: 9, bold: true, color: { rgb: 'BE123C' } },
    fill: { fgColor: { rgb: 'FFE4E6' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: borderThin
  })

  // 7. Terapkan Border & Formatting pada Data Siswa (Baris 7 s.d. 6 + N)
  const dataStartRow = 7
  studentRows.forEach((row, sIdx) => {
    const r = dataStartRow + sIdx

    // Nomor
    setStyle(r, 0, {
      font: { name: 'Calibri', sz: 9, bold: true },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: borderThin
    })
    // Nama Siswa
    setStyle(r, 1, {
      font: { name: 'Calibri', sz: 9, bold: true, color: { rgb: '0F172A' } },
      alignment: { horizontal: 'left', vertical: 'center' },
      border: borderThin
    })
    // L/P
    const isFemale = row.student.jenis_kelamin === 'P'
    setStyle(r, 2, {
      font: { name: 'Calibri', sz: 9, bold: true, color: { rgb: isFemale ? 'DB2777' : '1D4ED8' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: borderThin
    })

    // Tanggal 1 s.d. daysCount
    for (let d = 1; d <= daysCount; d++) {
      const c = 2 + d
      const sym = row.days[d]?.symbol
      const isWk = isWeekend(d)

      const cellStyle = {
        font: { name: 'Calibri', sz: 9, bold: true, color: { rgb: '0F172A' } },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: borderThin
      }

      if (isWk) {
        cellStyle.fill = { fgColor: { rgb: 'F1F5F9' } }
      }

      if (sym === 'H') {
        cellStyle.font = { name: 'Calibri', sz: 9, bold: true, color: { rgb: '047857' } }
      } else if (sym === 'S') {
        cellStyle.font = { name: 'Calibri', sz: 9, bold: true, color: { rgb: 'B45309' } }
        cellStyle.fill = { fgColor: { rgb: 'FEF3C7' } }
      } else if (sym === 'I') {
        cellStyle.font = { name: 'Calibri', sz: 9, bold: true, color: { rgb: '1D4ED8' } }
        cellStyle.fill = { fgColor: { rgb: 'DBEAFE' } }
      } else if (sym === 'A') {
        cellStyle.font = { name: 'Calibri', sz: 9, bold: true, color: { rgb: 'BE123C' } }
        cellStyle.fill = { fgColor: { rgb: 'FFE4E6' } }
      }

      setStyle(r, c, cellStyle)
    }

    // Rekap H, S, I, A, %
    setStyle(r, 3 + daysCount, {
      font: { name: 'Calibri', sz: 9, bold: true, color: { rgb: '065F46' } },
      fill: { fgColor: { rgb: 'ECFDF5' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: borderThin
    })
    setStyle(r, 4 + daysCount, {
      font: { name: 'Calibri', sz: 9, bold: true, color: { rgb: '92400E' } },
      fill: { fgColor: { rgb: 'FFFBEB' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: borderThin
    })
    setStyle(r, 5 + daysCount, {
      font: { name: 'Calibri', sz: 9, bold: true, color: { rgb: '1E40AF' } },
      fill: { fgColor: { rgb: 'EFF6FF' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: borderThin
    })
    setStyle(r, 6 + daysCount, {
      font: { name: 'Calibri', sz: 9, bold: true, color: { rgb: '9F1239' } },
      fill: { fgColor: { rgb: 'FFF1F2' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: borderThin
    })
    setStyle(r, 7 + daysCount, {
      font: { name: 'Calibri', sz: 9, bold: true, color: { rgb: '0F172A' } },
      fill: { fgColor: { rgb: 'F8FAFC' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: borderThin
    })
  })

  // 8. Terapkan Style Baris Summary Total
  const summaryRowIdx = dataStartRow + studentRows.length
  for (let c = 0; c < totalCols; c++) {
    setStyle(summaryRowIdx, c, {
      font: { name: 'Calibri', sz: 9, bold: true, color: { rgb: '0F172A' } },
      fill: { fgColor: { rgb: 'E2E8F0' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: borderDoubleBottom
    })
  }

  // 9. Terapkan Style Tanda Tangan (Mengetahui & Guru / Piket)
  // Kiri: Mengetahui
  setStyle(sigStart, leftStartCol, {
    font: { name: 'Calibri', sz: 10, color: { rgb: '0F172A' } },
    alignment: { horizontal: 'center', vertical: 'center' }
  })
  setStyle(sigStart + 1, leftStartCol, {
    font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: '0F172A' } },
    alignment: { horizontal: 'center', vertical: 'center' }
  })
  setStyle(sigStart + 5, leftStartCol, {
    font: { name: 'Calibri', sz: 10, bold: true, underline: true, color: { rgb: '0F172A' } },
    alignment: { horizontal: 'center', vertical: 'center' }
  })
  if (mengetahuiNip.value) {
    setStyle(sigStart + 6, leftStartCol, {
      font: { name: 'Calibri', sz: 9, color: { rgb: '475569' } },
      alignment: { horizontal: 'center', vertical: 'center' }
    })
  }

  // Kanan: Pembuat / Guru Piket
  setStyle(sigStart, rightStartCol, {
    font: { name: 'Calibri', sz: 10, color: { rgb: '0F172A' } },
    alignment: { horizontal: 'center', vertical: 'center' }
  })
  setStyle(sigStart + 1, rightStartCol, {
    font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: '0F172A' } },
    alignment: { horizontal: 'center', vertical: 'center' }
  })
  setStyle(sigStart + 5, rightStartCol, {
    font: { name: 'Calibri', sz: 10, bold: true, underline: true, color: { rgb: '0F172A' } },
    alignment: { horizontal: 'center', vertical: 'center' }
  })
  setStyle(sigStart + 6, rightStartCol, {
    font: { name: 'Calibri', sz: 9, color: { rgb: '475569' } },
    alignment: { horizontal: 'center', vertical: 'center' }
  })

  // 10. Simpan File Excel
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, `Daftar Hadir Kls ${rekapClass.value}`)

  const fileName = `Daftar_Hadir_PKBM_Cahaya_Mulia_Kelas_${rekapClass.value}_${mName}_${rekapYear.value}.xlsx`
  XLSX.writeFile(wb, fileName)
  } catch (err) {
    console.error('Gagal export Excel:', err)
  } finally {
    isExportingExcel.value = false
  }
}

// Quick Edit Modal
const editingCell = ref(null)

function openQuickEdit(student, day) {
  editingCell.value = { student, day }
}

async function applyQuickEdit(status) {
  if (!editingCell.value) return
  const { student, day } = editingCell.value
  const dateStr = `${rekapYear.value}-${String(rekapMonth.value).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  
  const res = await attendanceStore.setManualAttendance(
    student,
    status,
    currentTeacher.value,
    status === 'hadir' ? '07:30' : null,
    null,
    dateStr
  )
  editingCell.value = null
  if (res?.success === false) {
    showToast(res.message || 'Gagal memperbarui catatan presensi.', 'error')
  }
}

// ==============================================================
// TAB 4: STATE & HANDLER VERIFIKASI IZIN / SAKIT SISWA
// ==============================================================
const izinSubTab = ref('pending')
const izinClassFilter = ref('all')
const izinSearchQuery = ref('')

const showRejectModal = ref(false)
const selectedLeaveToReject = ref(null)
const rejectReason = ref('')
const lightboxPhoto = ref(null)

const pendingLeaves = computed(() => {
  return (attendanceStore.leaveRequests || [])
    .filter(r => r.status === 'pending')
    .sort((a, b) => new Date(b.created_at || b.tanggal_mulai) - new Date(a.created_at || a.tanggal_mulai))
})

const historyLeaves = computed(() => {
  return (attendanceStore.leaveRequests || [])
    .filter(r => r.status === 'approved' || r.status === 'rejected')
    .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
})

const filteredPendingLeaves = computed(() => {
  return pendingLeaves.value.filter(req => {
    if (izinClassFilter.value !== 'all' && String(req.kelas) !== String(izinClassFilter.value)) return false
    if (izinSearchQuery.value) {
      const q = izinSearchQuery.value.toLowerCase()
      const matchName = req.nama_lengkap?.toLowerCase().includes(q)
      const matchNis = req.nomor_induk?.toLowerCase().includes(q)
      if (!matchName && !matchNis) return false
    }
    return true
  })
})

const filteredHistoryLeaves = computed(() => {
  return historyLeaves.value.filter(req => {
    if (izinClassFilter.value !== 'all' && String(req.kelas) !== String(izinClassFilter.value)) return false
    if (izinSearchQuery.value) {
      const q = izinSearchQuery.value.toLowerCase()
      const matchName = req.nama_lengkap?.toLowerCase().includes(q)
      const matchNis = req.nomor_induk?.toLowerCase().includes(q)
      if (!matchName && !matchNis) return false
    }
    return true
  })
})

async function handleApproveLeave(req) {
  const res = await attendanceStore.approveLeaveRequest(req.id, currentTeacher.value)
  if (res?.success) {
    showToast(`Pengajuan izin ${req.nama_lengkap} berhasil disetujui & dicatat ke presensi!`, 'success')
  } else {
    showToast(res?.message || 'Gagal menyetujui pengajuan izin.', 'error')
  }
}

function openRejectModal(req) {
  selectedLeaveToReject.value = req
  rejectReason.value = 'Foto surat tidak jelas/stempel tidak ada. Mohon foto ulang dan ajukan kembali.'
  showRejectModal.value = true
}

async function confirmRejectLeave() {
  if (!selectedLeaveToReject.value) return
  const req = selectedLeaveToReject.value
  const res = await attendanceStore.rejectLeaveRequest(req.id, currentTeacher.value, rejectReason.value)
  showRejectModal.value = false
  if (res?.success) {
    showToast(`Pengajuan izin ${req.nama_lengkap} telah ditolak. Siswa dapat mengajukan ulang.`, 'info')
  } else {
    showToast(res?.message || 'Gagal menolak pengajuan izin.', 'error')
  }
}

function formatDateTimeDisplay(dtStr) {
  if (!dtStr) return '-'
  try {
    const d = new Date(dtStr)
    return d.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (e) {
    return dtStr
  }
}
</script>

<style scoped>
.print-only {
  display: none;
}
</style>

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

            <!-- Switcher Mode Tampilan: Kartu (Mobile) vs Tabel Matriks (Fisik) -->
            <div class="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              <button
                type="button"
                @click="rekapViewMode = 'cards'"
                :class="rekapViewMode === 'cards' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900 font-semibold'"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition cursor-pointer"
                title="Tampilan ringkas kartu per siswa, sangat nyaman di HP"
              >
                <span class="material-icons text-sm">view_agenda</span>
                <span>Ringkasan Kartu</span>
                <span class="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-full font-bold">HP</span>
              </button>
              <button
                type="button"
                @click="rekapViewMode = 'matrix'"
                :class="rekapViewMode === 'matrix' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900 font-semibold'"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition cursor-pointer"
                title="Tabel matriks lengkap 31 hari format buku cetak fisik"
              >
                <span class="material-icons text-sm">table_chart</span>
                <span>Tabel Matriks</span>
                <span class="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full font-bold">Fisik</span>
              </button>
            </div>
          </div>

          <!-- Tombol Export Excel & Cetak Landscape -->
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="exportMonthlyToExcel"
              class="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <span class="material-icons text-sm">download</span>
              <span>Export Excel</span>
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
        <!-- ALTERNATIF 1: TAMPILAN RINGKASAN KARTU SISWA (KHUSUS MOBILE / CEPAT) -->
        <!-- ============================================================== -->
        <div v-show="rekapViewMode === 'cards'" class="no-print space-y-4">
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
              <button
                type="button"
                @click="rekapViewMode = 'matrix'"
                class="md:hidden text-blue-600 font-bold hover:underline flex items-center gap-1 text-[11px]"
              >
                <span>Lihat Format Tabel Matriks</span>
                <span class="material-icons text-xs">arrow_forward</span>
              </button>
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
        <!-- LEMBAR DAFTAR HADIR SISWA (TAMPILAN MATRIKS PERSIS GAMBAR) -->
        <!-- ============================================================== -->
        <div
          id="printable-monthly-sheet"
          class="print-container bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4"
          :class="{ 'hidden print:block': rekapViewMode === 'cards' }"
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

          <!-- Petunjuk Geser Layar & Tips Rotasi untuk Mobile -->
          <div class="no-print md:hidden flex flex-col gap-1.5 text-[11px] text-blue-900 bg-blue-50 px-3 py-2 rounded-xl border border-blue-200">
            <div class="flex items-center justify-between font-medium">
              <span class="flex items-center gap-1.5">
                <span class="material-icons text-sm text-blue-600">swipe</span>
                Geser tabel ke samping untuk melihat tgl 1 s.d. 31 (Nama Siswa tetap terkunci di kiri)
              </span>
              <span class="font-bold">➡️</span>
            </div>
            <div class="flex items-center justify-between text-[10px] text-blue-700 pt-1 border-t border-blue-200/60">
              <span class="flex items-center gap-1">
                <span class="material-icons text-xs">screen_rotation</span>
                Putar ponsel ke mendatar (Landscape) untuk layar lebih lega
              </span>
              <button
                type="button"
                @click="rekapViewMode = 'cards'"
                class="font-bold underline text-blue-800 hover:text-blue-950 cursor-pointer"
              >
                Beralih ke Ringkasan Kartu
              </button>
            </div>
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
                <span class="print:inline hidden font-bold text-slate-900">{{ mengetahuiJabatan || 'Ketua PKBM Cahaya Mulia' }}</span>
                <input
                  v-model="mengetahuiJabatan"
                  type="text"
                  class="no-print font-bold text-slate-900 text-center border-b border-dashed border-slate-300 hover:border-blue-400 focus:border-blue-600 focus:outline-none bg-transparent px-1 py-0.5 text-xs w-60 transition-colors"
                  placeholder="Jabatan (Ketua PKBM Cahaya Mulia)"
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
              <p class="text-slate-600">Pamulang, {{ currentPrintDate }}</p>
              <p class="font-bold text-slate-900 mt-0.5">Guru / Piket</p>
              <div class="h-16 flex items-center justify-center">
                <span class="no-print text-[10px] text-slate-300 italic select-none">(Ruang Tanda Tangan)</span>
              </div>
              <p class="font-bold underline text-slate-900">( {{ currentTeacher?.nama_lengkap || authStore.user?.nama_lengkap || '............................................' }} )</p>
              <p class="text-[10px] text-slate-500 font-mono mt-0.5">NIP: {{ currentTeacher?.nomor_induk || authStore.user?.nomor_induk || '-' }}</p>
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

    <!-- Modal Konfirmasi Tandai Hadir Semua (Mobile-Friendly) -->
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
            Tandai Hadir Semua Siswa?
          </h4>
          <p class="text-xs text-slate-500 leading-relaxed">
            Semua siswa <strong class="text-slate-800">Kelas {{ selectedClass }}</strong> yang belum tercatat pada tanggal <strong class="text-slate-800">{{ selectedDate }}</strong> akan otomatis ditandai sebagai <span class="text-emerald-700 font-bold">Hadir</span> (07:30).
          </p>
        </div>

        <div class="grid grid-cols-2 gap-2.5 pt-2">
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
            <span>Ya, Tandai Hadir</span>
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
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Html5Qrcode } from 'html5-qrcode'
import XLSX from 'xlsx-js-style'
import { getCalendarYearOptions, getAcademicYearForMonthYear } from '../utils/academicYear'
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
  const currentAtt = getStudentAttendance(student.id)
  attendanceStore.setManualAttendance(
    student,
    currentAtt?.status || 'hadir',
    currentTeacher.value,
    currentAtt?.jam_masuk,
    clean || null,
    selectedDate.value
  )
}

function handleSingleCheckOut(student) {
  const nowTime = new Date().toTimeString().split(' ')[0].substring(0, 5)
  const currentAtt = getStudentAttendance(student.id)
  
  // Jika status saat ini bukan hadir/terlambat/sakit/izin (misal belum tercatat atau alpa), jadikan 'hadir'
  let targetStatus = currentAtt?.status
  if (!targetStatus || targetStatus === 'alpa') {
    targetStatus = 'hadir'
  }
  
  const jamMasuk = currentAtt?.jam_masuk || (targetStatus === 'hadir' ? '07:30' : null)

  attendanceStore.setManualAttendance(
    student,
    targetStatus,
    currentTeacher.value,
    jamMasuk,
    nowTime,
    selectedDate.value
  )
  showToast(`Jam pulang ${student.nama_lengkap} dicatat (${nowTime})`, 'success')
}

function clearJamPulang(student) {
  const currentAtt = getStudentAttendance(student.id)
  if (!currentAtt) return
  attendanceStore.setManualAttendance(
    student,
    currentAtt.status || 'hadir',
    currentTeacher.value,
    currentAtt.jam_masuk,
    null,
    selectedDate.value
  )
  showToast(`Jam pulang ${student.nama_lengkap} dibatalkan`, 'info')
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

// Modal State: Tandai Hadir Semua
const showBatchPresentModal = ref(false)

function openBatchPresentModal() {
  showBatchPresentModal.value = true
}

function confirmBatchAllPresent() {
  const res = attendanceStore.batchSetAllPresent(selectedClass.value, selectedDate.value, currentTeacher.value)
  showBatchPresentModal.value = false
  if (res.count > 0) {
    showToast(`Berhasil menandai ${res.count} siswa Kelas ${selectedClass.value} sebagai Hadir!`, 'success')
  } else {
    showToast(`Semua siswa Kelas ${selectedClass.value} sudah tercatat kehadirannya hari ini.`, 'info')
  }
}

// Modal State: Set Jam Pulang Bersama
const showBatchCheckoutModal = ref(false)
const batchCheckoutTime = ref('')

function openBatchCheckoutModal() {
  batchCheckoutTime.value = new Date().toTimeString().split(' ')[0].substring(0, 5)
  showBatchCheckoutModal.value = true
}

function setPresetCheckoutTime(val) {
  if (val === 'now') {
    batchCheckoutTime.value = new Date().toTimeString().split(' ')[0].substring(0, 5)
  } else {
    batchCheckoutTime.value = val
  }
}

function confirmBatchAllCheckOut() {
  const defaultTime = new Date().toTimeString().split(' ')[0].substring(0, 5)
  const inputTime = batchCheckoutTime.value.trim() || defaultTime

  const res = attendanceStore.batchSetAllCheckOut(selectedClass.value, selectedDate.value, currentTeacher.value, inputTime)
  showBatchCheckoutModal.value = false
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
    showToast('Gagal mengakses kamera: ' + err.message, 'error')
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
    showToast(`Presensi ${res.type === 'in' ? 'Masuk' : 'Pulang'} berhasil: ${lastScannedStudent.value.nama}`, 'success')
  } else {
    showToast(res.message || 'QR Code tidak valid', 'error')
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

const savedRekapYear = localStorage.getItem('presensi_guru_rekap_year')
const rekapYear = ref(savedRekapYear ? parseInt(savedRekapYear, 10) : now.getFullYear())

watch(rekapYear, (val) => {
  if (val) localStorage.setItem('presensi_guru_rekap_year', String(val))
})

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

// State Penandatangan "Mengetahui" (Editable & Tersimpan di localStorage)
const savedMengetahuiJabatan = localStorage.getItem('presensi_rekap_mengetahui_jabatan')
const mengetahuiJabatan = ref(savedMengetahuiJabatan !== null ? savedMengetahuiJabatan : 'Ketua PKBM Cahaya Mulia')

watch(mengetahuiJabatan, (val) => {
  localStorage.setItem('presensi_rekap_mengetahui_jabatan', val || '')
})

const savedMengetahuiNama = localStorage.getItem('presensi_rekap_mengetahui_nama')
const mengetahuiNama = ref(savedMengetahuiNama || '')

watch(mengetahuiNama, (val) => {
  localStorage.setItem('presensi_rekap_mengetahui_nama', val || '')
})

const savedMengetahuiNip = localStorage.getItem('presensi_rekap_mengetahui_nip')
const mengetahuiNip = ref(savedMengetahuiNip || '')

watch(mengetahuiNip, (val) => {
  localStorage.setItem('presensi_rekap_mengetahui_nip', val || '')
})

// State Mode Tampilan Rekap (Kartu Mobile vs Matriks Tabel)
const savedRekapViewMode = localStorage.getItem('presensi_guru_rekap_view_mode')
const isMobileInitial = typeof window !== 'undefined' && window.innerWidth < 768
const rekapViewMode = ref(savedRekapViewMode || (isMobileInitial ? 'cards' : 'matrix'))

watch(rekapViewMode, (val) => {
  if (val) localStorage.setItem('presensi_guru_rekap_view_mode', val)
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

function printMonthlySheet() {
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
function exportMonthlyToExcel() {
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

  const teacherName = currentTeacher.value?.nama_lengkap || authStore.user?.nama_lengkap || '............................................'
  const teacherNip = currentTeacher.value?.nomor_induk || authStore.user?.nomor_induk || '-'

  const sigRow1 = new Array(totalCols).fill('')
  sigRow1[leftStartCol] = 'Mengetahui,'
  sigRow1[rightStartCol] = `Pamulang, ${currentPrintDate.value}`
  aoa.push(sigRow1)

  const sigRow2 = new Array(totalCols).fill('')
  sigRow2[leftStartCol] = mengetahuiJabatan.value || 'Ketua PKBM Cahaya Mulia'
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
.print-only {
  display: none;
}
</style>

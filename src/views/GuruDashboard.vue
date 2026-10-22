<template>
  <div class="min-h-screen bg-slate-50 md:flex">
    <!-- Mobile Navbar with Hamburger -->
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




      <!-- TAB 1: SCANNER QR CODE KARTU SISWA -->
      <div v-if="activeTab === 'scan'" class="space-y-4">
        <!-- Top Navigation Bar: Scanner Status & Cancel Scan Button -->
        <div class="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div class="flex items-center gap-2 min-w-0">
            <button
              v-if="isScanning"
              type="button"
              @click="stopScanner"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition cursor-pointer"
              title="Batalkan pemindaian dan matikan kamera"
            >
              <span class="material-icons text-sm text-rose-500">videocam_off</span>
              <span>Batalkan Mode Scan</span>
            </button>
            <div v-else class="flex items-center gap-2 min-w-0">
              <span class="w-2 h-2 rounded-full bg-slate-300 shrink-0"></span>
              <span class="text-xs font-semibold text-slate-700 truncate">
                Pemindai Kartu<span class="hidden sm:inline"> Siswa</span>
              </span>
            </div>
          </div>
          
          <div class="flex items-center gap-2 shrink-0">
            <span
              v-if="isScanning"
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse"
            >
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Kamera Aktif</span>
            </span>
            <button
              v-if="!isScanning"
              type="button"
              @click="goToJournal"
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:text-blue-700 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 transition cursor-pointer"
              title="Buka tampilan tabel jurnal kelas"
            >
              <span class="material-icons text-xs text-slate-500">menu_book</span>
              <span>Buka Jurnal</span>
            </button>
          </div>
        </div>

        <!-- Banner Highlight Sesi Mata Pelajaran & Kelas yang Sedang Di-Scan (Warna Solid Bebas Gradasi & Responsif Mobile) -->
        <div class="rounded-2xl bg-slate-900 text-white p-4 sm:p-5 shadow-xs border border-slate-800 space-y-3.5">
          <!-- Baris 1: Header Sesi & Indikator Target -->
          <div class="flex items-center justify-between flex-wrap gap-2">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500 text-white shadow-2xs">
              <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              Sesi Presensi Aktif
            </span>
            <div class="flex items-center gap-1.5 text-xs text-slate-300">
              <span class="text-slate-400">Target:</span>
              <strong class="text-white font-bold bg-slate-800 px-2 py-0.5 rounded border border-slate-700 font-mono">
                Kelas {{ selectedClass }}
              </strong>
            </div>
          </div>

          <!-- Baris 2: Nama Mapel, Icon & Detail Guru/Jam -->
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shrink-0 shadow-xs">
              <span class="material-icons text-xl">menu_book</span>
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="text-lg sm:text-2xl font-bold text-white tracking-tight leading-tight truncate">
                {{ selectedSubject || 'Mata Pelajaran Umum' }}
              </h3>
              <div class="flex flex-col sm:flex-row sm:items-center gap-x-2.5 gap-y-0.5 text-xs text-slate-300 mt-1">
                <span class="truncate">Guru: <strong class="text-white">{{ currentTeacher?.nama_lengkap || authStore.user?.nama_lengkap }}</strong></span>
                <span class="hidden sm:inline text-slate-600">&bull;</span>
                <span class="font-mono text-blue-300 font-medium">Jam: {{ sessionJamMasuk }} - {{ sessionJamPulang }} WIB</span>
              </div>
            </div>
          </div>

          <!-- Baris 3: Quick Switch Sesi (Responsif Penuh di Mobile Tanpa Terpotong) -->
          <div class="pt-2.5 border-t border-slate-800">
            <div class="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1.5">
              <span>Ganti Target Sesi Cepat:</span>
              <span class="text-[10px] text-blue-400 font-normal">Sinkron tanpa pindah tab</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <!-- Dropdown Kelas (Konsisten menggunakan CustomDropdown) -->
              <CustomDropdown
                v-model="selectedClass"
                :options="teacherClassOptions"
                title="Pilih Kelas Target"
                icon="school"
                :fullWidth="true"
                size="md"
              />

              <!-- Dropdown Mapel (Konsisten menggunakan CustomDropdown) -->
              <CustomDropdown
                v-model="selectedSubject"
                :options="teacherSubjectDropdownOptions"
                title="Pilih Mata Pelajaran Target"
                icon="menu_book"
                :fullWidth="true"
                size="md"
              />
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Panel Kamera Scanner -->
          <Card title="Arahkan Kamera ke Kartu Siswa" :description="`Pindai kartu fisik siswa • Tertuju ke Mapel: ${selectedSubject} (${selectedClass})`">
            <div class="space-y-4">
              <!-- Reader Container with Overlay Cancel Button & Subject Indicator -->
              <div class="relative w-full min-h-[260px] bg-slate-900 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center">
                <div id="qr-reader" class="w-full h-full"></div>

                <!-- Floating Subject Highlight Badge inside scanner viewport with Next Scan Feedback -->
                <div
                  v-if="isScanning"
                  class="absolute top-3 left-3 right-12 z-30 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white text-xs border shadow-md pointer-events-none truncate transition-all duration-300"
                  :class="scanSuccessFlash ? 'bg-emerald-600 border-emerald-400 ring-2 ring-emerald-400/50' : 'bg-slate-950/90 border-blue-500'"
                >
                  <template v-if="scanSuccessFlash">
                    <span class="material-icons text-xs text-white shrink-0">check_circle</span>
                    <span class="font-bold text-white truncate">✓ {{ lastScannedName }} Berhasil!</span>
                    <span class="text-[10px] text-emerald-100 font-medium shrink-0 ml-1">Siap next scan...</span>
                  </template>
                  <template v-else>
                    <span class="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-ping"></span>
                    <span class="text-slate-300 font-medium shrink-0">Scan:</span>
                    <strong class="text-blue-300 font-bold uppercase truncate">{{ selectedSubject }}</strong>
                    <span class="text-slate-400 text-[10px] font-mono shrink-0">({{ selectedClass }})</span>
                  </template>
                </div>

                <!-- Floating Close/Cancel Button inside camera viewport -->
                <button
                  v-if="isScanning"
                  type="button"
                  @click="stopScanner"
                  class="absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer shadow-md border border-white/20"
                  title="Batalkan & Matikan Mode Scan"
                >
                  <span class="material-icons text-sm">close</span>
                </button>

                <div v-if="!isScanning" class="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-white z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mx-auto text-slate-400 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h.01"/><path d="M17 7h.01"/><path d="M7 17h.01"/><path d="M17 17h.01"/></svg>
                  <p class="text-xs text-slate-300">Scanner kamera belum aktif</p>
                  <p class="text-[11px] text-blue-300 font-semibold mt-0.5">Sesi: {{ selectedSubject }} • Kelas {{ selectedClass }}</p>
                  <div class="flex items-center gap-2 mt-3">
                    <Button size="sm" variant="default" class="font-bold shadow-md bg-blue-600 hover:bg-blue-500" @click="startScanner">
                      <span class="material-icons text-xs mr-1">qr_code_scanner</span>
                      Mulai Scan QR
                    </Button>
                    <Button size="sm" variant="outline" class="text-slate-300 border-slate-600 hover:text-white hover:bg-slate-800" @click="goToJournal">
                      Buka Jurnal
                    </Button>
                  </div>
                </div>
              </div>

              <!-- Camera Active Action Buttons -->
              <div v-if="isScanning" class="pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  class="w-full text-rose-600 border-rose-200 hover:bg-rose-50 inline-flex items-center justify-center gap-1.5 cursor-pointer font-semibold py-2"
                  @click="stopScanner"
                >
                  <span class="material-icons text-sm">videocam_off</span>
                  <span>Batal / Matikan Kamera</span>
                </Button>
              </div>

            <!-- Input NISN Manual (Alternatif jika tanpa kamera scanner) -->
            <div class="pt-3 border-t border-slate-100">
              <label class="text-xs text-slate-700 mb-1.5 font-semibold flex items-center justify-between">
                <span class="flex items-center gap-1.5">
                  <span class="material-icons text-xs text-blue-600">pin</span>
                  <span>Atau Masukkan NISN Siswa (Tanpa Kamera):</span>
                </span>
                <span class="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Target: {{ selectedSubject }}
                </span>
              </label>
              <form @submit.prevent="handleManualTokenSubmit" class="flex gap-2">
                <input
                  v-model="manualToken"
                  type="text"
                  inputmode="numeric"
                  placeholder="Ketik NISN (Contoh: 20240101)..."
                  class="flex-1 h-9 px-3 rounded-lg border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 focus:bg-white"
                />
                <Button size="sm" type="submit" variant="default" class="whitespace-nowrap cursor-pointer">
                  Absenkan Siswa
                </Button>
              </form>
              <p class="text-[11px] text-slate-400 mt-1">Cukup ketik NISN siswa untuk memproses kehadiran masuk / pulang.</p>
            </div>
          </div>
        </Card>

        <!-- Panel Hasil Pemindaian Terakhir -->
        <Card title="Hasil Pemindaian Terakhir" description="Konfirmasi identitas siswa & mata pelajaran yang baru saja discan">
          <div v-if="lastScannedStudent" class="space-y-4">
            <div class="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
              <div class="flex items-center gap-4">
                <img
                  v-if="lastScannedStudent.foto_profil_url"
                  :src="lastScannedStudent.foto_profil_url"
                  alt="Foto"
                  class="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-xs shrink-0"
                />
                <div
                  v-else
                  class="w-16 h-16 rounded-xl bg-blue-600 text-white font-bold text-lg flex items-center justify-center border-2 border-white shadow-xs shrink-0 select-none"
                >
                  {{ getInitials(lastScannedStudent.nama) }}
                </div>
                <div>
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-200/80 text-emerald-800">
                      {{ lastScannedStudent.scanType === 'masuk' ? 'Presensi Masuk' : 'Presensi Pulang' }}
                    </span>
                    <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                      {{ lastScannedStudent.mata_pelajaran || selectedSubject }}
                    </span>
                  </div>
                  <h4 class="font-bold text-slate-900 text-base mt-1">{{ lastScannedStudent.nama }}</h4>
                  <p class="text-xs text-slate-600">NISN: {{ lastScannedStudent.nomor_induk }} &bull; {{ lastScannedStudent.kelas }}</p>
                  <p class="text-[11px] text-emerald-700 font-semibold mt-0.5">Status: {{ lastScannedStudent.status?.toUpperCase() }}</p>
                </div>
              </div>

              <!-- Box Konfirmasi Penegasan Mapel -->
              <div class="p-2.5 rounded-lg bg-white/90 border border-emerald-200 text-xs flex items-center justify-between">
                <span class="text-slate-600">Presensi Berhasil Dicatat Pada:</span>
                <span class="font-bold text-blue-700 flex items-center gap-1">
                  <span class="material-icons text-xs text-blue-600">menu_book</span>
                  <span>{{ lastScannedStudent.mata_pelajaran || selectedSubject }}</span>
                </span>
              </div>
            </div>

            <!-- List recent scans -->
            <div>
              <h5 class="text-xs font-semibold text-slate-700 mb-2">Riwayat Scan Hari Ini</h5>
              <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
                <div
                  v-for="item in recentScans"
                  :key="item.id"
                  class="p-2.5 rounded-lg border border-slate-100 bg-white flex items-center justify-between text-xs"
                >
                  <div class="min-w-0 pr-2">
                    <span class="font-semibold text-slate-800 truncate block">{{ item.nama_lengkap }}</span>
                    <div class="flex items-center gap-1.5 mt-0.5">
                      <span class="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                        {{ item.mata_pelajaran || selectedSubject }}
                      </span>
                      <span class="text-slate-400 font-mono text-[11px]">{{ item.jam_masuk || item.jam_pulang }}</span>
                    </div>
                  </div>
                  <Badge :status="item.status" />
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-12 text-slate-400 text-xs">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 mx-auto mb-2 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
            Belum ada kartu siswa yang dipindai. Silakan scan kartu di panel sebelah kiri.
          </div>
        </Card>
        </div>
      </div>

      <!-- TAB 2: PRESENSI & JURNAL KELAS (MONITORING & KOREKSI TERPROTEKSI) -->
      <div v-else-if="activeTab === 'manual'" class="space-y-4">
        <!-- KPI Summary Presensi Kelas yang Dipilih (Khusus Desktop, di Mobile menggunakan Grid 2x2 Filter di dalam Card) -->
        <div class="hidden md:grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
          <div class="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <p class="text-xs font-semibold text-slate-500 uppercase">Total Siswa ({{ selectedClass }})</p>
            <div class="flex items-center justify-between mt-1">
              <span class="text-2xl font-bold text-slate-900">{{ classStudents.length }}</span>
              <span class="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">Siswa</span>
            </div>
          </div>
          <div class="bg-white p-4 rounded-xl border border-emerald-100 shadow-xs">
            <p class="text-xs font-semibold text-emerald-600 uppercase">Hadir Tepat</p>
            <div class="flex items-center justify-between mt-1">
              <span class="text-2xl font-bold text-emerald-700">{{ countClassStatus('hadir') }}</span>
              <span class="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">Tepat</span>
            </div>
          </div>
          <div class="bg-white p-4 rounded-xl border border-amber-100 shadow-xs">
            <p class="text-xs font-semibold text-amber-600 uppercase">Terlambat</p>
            <div class="flex items-center justify-between mt-1">
              <span class="text-2xl font-bold text-amber-700">{{ countClassStatus('terlambat') }}</span>
              <span class="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">Telat</span>
            </div>
          </div>
          <div class="bg-white p-4 rounded-xl border border-blue-100 shadow-xs">
            <p class="text-xs font-semibold text-blue-600 uppercase">Izin / Sakit</p>
            <div class="flex items-center justify-between mt-1">
              <span class="text-2xl font-bold text-blue-700">{{ countClassStatus('izin') + countClassStatus('sakit') }}</span>
              <span class="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">Dispensasi</span>
            </div>
          </div>
          <div class="bg-white p-4 rounded-xl border border-rose-100 shadow-xs">
            <p class="text-xs font-semibold text-rose-600 uppercase">Belum Hadir / Alpa</p>
            <div class="flex items-center justify-between mt-1">
              <span class="text-2xl font-bold text-rose-700">{{ countClassAlpa }}</span>
              <span class="text-xs text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full font-medium">Alpa</span>
            </div>
          </div>
        </div>

        <Card :title="`Jurnal Presensi (${selectedClass})`" :description="`${formatTanggalIndo(selectedDate)} • Mapel: ${getClassSubject(selectedClass)}`">
          <template #action>
            <!-- Tombol Simpan Perubahan Otomatis jika ada perubahan yang dilakukan -->
            <transition
              enter-active-class="transition duration-150 ease-out"
              enter-from-class="scale-95 opacity-0"
              enter-to-class="scale-100 opacity-100"
              leave-active-class="transition duration-100 ease-in"
              leave-from-class="scale-100 opacity-100"
              leave-to-class="scale-95 opacity-0"
            >
              <button
                v-if="hasPendingChanges"
                type="button"
                @click="savePendingChanges"
                class="h-7 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer animate-pulse shrink-0"
              >
                <span class="material-icons text-xs">save</span>
                <span>Simpan Perubahan ({{ pendingChangesCount }})</span>
              </button>
            </transition>
          </template>

          <!-- Notifikasi Feedback Perubahan Status Terakhir -->
          <div
            v-if="statusUpdateNotice"
            class="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between mb-3 animate-in fade-in duration-200"
          >
            <span class="font-medium flex items-center gap-1.5 truncate">
              <span class="material-icons text-xs text-emerald-600">check_circle</span>
              <span>{{ statusUpdateNotice }}</span>
            </span>
            <button @click="statusUpdateNotice = ''" class="text-emerald-600 hover:text-emerald-900 font-bold text-sm cursor-pointer leading-none ml-2">
              &times;
            </button>
          </div>

          <!-- Desktop Filter Chip Status Kehadiran (hidden di mobile) -->
          <div class="hidden md:flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 mb-3 flex-nowrap -mx-1 px-1">
            <button
              type="button"
              @click="statusFilter = 'all'"
              :class="['h-7 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0', statusFilter === 'all' ? 'bg-slate-900 text-white shadow-2xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200']"
            >
              Semua <span class="text-[10px] px-1 py-0.2 rounded" :class="statusFilter === 'all' ? 'bg-white/20' : 'bg-slate-100 text-slate-700 font-bold'">{{ classStudents.length }}</span>
            </button>
            <button
              type="button"
              @click="statusFilter = 'alpa'"
              :class="['h-7 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0', statusFilter === 'alpa' ? 'bg-rose-600 text-white shadow-2xs' : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/80']"
            >
              <span class="material-icons text-xs">warning</span>
              <span>Belum Hadir / Alpa</span>
              <span class="text-[10px] px-1 py-0.2 rounded" :class="statusFilter === 'alpa' ? 'bg-white/20' : 'bg-rose-100 text-rose-800 font-bold'">{{ countClassAlpa }}</span>
            </button>
            <button
              type="button"
              @click="statusFilter = 'hadir'"
              :class="['h-7 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0', statusFilter === 'hadir' ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/80']"
            >
              <span class="material-icons text-xs">check_circle</span>
              <span>Hadir</span>
              <span class="text-[10px] px-1 py-0.2 rounded" :class="statusFilter === 'hadir' ? 'bg-white/20' : 'bg-emerald-100 text-emerald-800 font-bold'">{{ countClassStatus('hadir') }}</span>
            </button>
            <button
              type="button"
              @click="statusFilter = 'terlambat'"
              :class="['h-7 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0', statusFilter === 'terlambat' ? 'bg-amber-600 text-white shadow-2xs' : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/80']"
            >
              <span class="material-icons text-xs">schedule</span>
              <span>Terlambat</span>
              <span class="text-[10px] px-1 py-0.2 rounded" :class="statusFilter === 'terlambat' ? 'bg-white/20' : 'bg-amber-100 text-amber-800 font-bold'">{{ countClassStatus('terlambat') }}</span>
            </button>
            <button
              type="button"
              @click="statusFilter = 'izin_sakit'"
              :class="['h-7 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0', statusFilter === 'izin_sakit' ? 'bg-blue-600 text-white shadow-2xs' : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/80']"
            >
              <span class="material-icons text-xs">description</span>
              <span>Izin & Sakit</span>
              <span class="text-[10px] px-1 py-0.2 rounded" :class="statusFilter === 'izin_sakit' ? 'bg-white/20' : 'bg-blue-100 text-blue-800 font-bold'">{{ countClassStatus('izin') + countClassStatus('sakit') }}</span>
            </button>
          </div>

          <!-- Mobile 2x2 Compact Summary & Filter Grid (md:hidden) -->
          <div class="md:hidden space-y-1.5 mb-2.5">
            <!-- Header baris ringkas: Judul & Tombol Semua -->
            <div class="flex items-center justify-between px-0.5">
              <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <span class="material-icons text-xs text-blue-600">analytics</span>
                <span>Ringkasan Kehadiran:</span>
              </span>
              <button
                type="button"
                @click="statusFilter = 'all'"
                :class="[
                  'px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer border',
                  statusFilter === 'all'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'
                ]"
              >
                Semua Siswa ({{ classStudents.length }})
              </button>
            </div>

            <!-- Grid 2x2: Ukuran Ultra-Kompak (Satu Baris per Card, Hemat Ruang Vertikal) -->
            <div class="grid grid-cols-2 gap-1.5">
              <!-- Kotak 1: Hadir Tepat -->
              <button
                type="button"
                @click="statusFilter = statusFilter === 'hadir' ? 'all' : 'hadir'"
                :class="[
                  'py-1.5 px-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between',
                  statusFilter === 'hadir'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-1 ring-emerald-500/30'
                    : 'bg-emerald-50/70 hover:bg-emerald-100/70 border-emerald-200 text-emerald-900'
                ]"
              >
                <div class="flex items-center gap-1.5 min-w-0">
                  <span class="text-base font-black leading-none">{{ countClassStatus('hadir') }}</span>
                  <span class="text-[10px] uppercase font-bold truncate" :class="statusFilter === 'hadir' ? 'text-emerald-100' : 'text-emerald-800'">Hadir Tepat</span>
                </div>
                <span class="material-icons text-base shrink-0" :class="statusFilter === 'hadir' ? 'text-white' : 'text-emerald-600'">check_circle</span>
              </button>

              <!-- Kotak 2: Terlambat -->
              <button
                type="button"
                @click="statusFilter = statusFilter === 'terlambat' ? 'all' : 'terlambat'"
                :class="[
                  'py-1.5 px-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between',
                  statusFilter === 'terlambat'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs ring-1 ring-amber-500/30'
                    : 'bg-amber-50/70 hover:bg-amber-100/70 border-amber-200 text-amber-900'
                ]"
              >
                <div class="flex items-center gap-1.5 min-w-0">
                  <span class="text-base font-black leading-none">{{ countClassStatus('terlambat') }}</span>
                  <span class="text-[10px] uppercase font-bold truncate" :class="statusFilter === 'terlambat' ? 'text-amber-100' : 'text-amber-800'">Terlambat</span>
                </div>
                <span class="material-icons text-base shrink-0" :class="statusFilter === 'terlambat' ? 'text-white' : 'text-amber-600'">schedule</span>
              </button>

              <!-- Kotak 3: Izin & Sakit -->
              <button
                type="button"
                @click="statusFilter = statusFilter === 'izin_sakit' ? 'all' : 'izin_sakit'"
                :class="[
                  'py-1.5 px-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between',
                  statusFilter === 'izin_sakit'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs ring-1 ring-blue-500/30'
                    : 'bg-blue-50/70 hover:bg-blue-100/70 border-blue-200 text-blue-900'
                ]"
              >
                <div class="flex items-center gap-1.5 min-w-0">
                  <span class="text-base font-black leading-none">{{ countClassStatus('izin') + countClassStatus('sakit') }}</span>
                  <span class="text-[10px] uppercase font-bold truncate" :class="statusFilter === 'izin_sakit' ? 'text-blue-100' : 'text-blue-800'">Izin & Sakit</span>
                </div>
                <span class="material-icons text-base shrink-0" :class="statusFilter === 'izin_sakit' ? 'text-white' : 'text-blue-600'">assignment</span>
              </button>

              <!-- Kotak 4: Belum Hadir / Alpa -->
              <button
                type="button"
                @click="statusFilter = statusFilter === 'alpa' ? 'all' : 'alpa'"
                :class="[
                  'py-1.5 px-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between',
                  statusFilter === 'alpa'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs ring-1 ring-rose-500/30'
                    : 'bg-rose-50/70 hover:bg-rose-100/70 border-rose-200 text-rose-900'
                ]"
              >
                <div class="flex items-center gap-1.5 min-w-0">
                  <span class="text-base font-black leading-none">{{ countClassAlpa }}</span>
                  <span class="text-[10px] uppercase font-bold truncate" :class="statusFilter === 'alpa' ? 'text-rose-100' : 'text-rose-800'">Alpa</span>
                </div>
                <span class="material-icons text-base shrink-0" :class="statusFilter === 'alpa' ? 'text-white' : 'text-rose-600'">warning</span>
              </button>
            </div>
          </div>

          <!-- Toolbar Kontrol: Kelas, Tanggal, Search & Aksi (Didesain Ringkas & Kompak) -->
          <div class="p-2 sm:p-2.5 bg-slate-50/90 border border-slate-200/90 rounded-2xl space-y-2 mb-3">
            <!-- Baris 1: Filter Kelas, Mata Pelajaran Sesi & Tanggal -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <!-- Kelas (Custom Restyled Dropdown Popover List) -->
              <CustomDropdown
                v-model="selectedClass"
                :options="teacherClassOptions"
                title="Daftar Kelas Binaan"
                icon="school"
                :fullWidth="true"
                size="sm"
              />

              <!-- Mata Pelajaran Sesi (Mendukung Presensi Per Mapel) -->
              <CustomDropdown
                v-model="selectedSubject"
                :options="teacherSubjectDropdownOptions"
                title="Mata Pelajaran Sesi"
                icon="menu_book"
                :fullWidth="true"
                size="sm"
              />

              <!-- Tanggal Presensi (Default Today) -->
              <div class="flex items-center justify-between gap-1 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs min-w-0">
                <div class="flex items-center gap-1 min-w-0 flex-1">
                  <span class="material-icons text-xs text-slate-400 shrink-0">calendar_today</span>
                  <input
                    v-model="selectedDate"
                    type="date"
                    class="font-mono text-xs font-semibold text-slate-800 bg-transparent border-none focus:outline-none cursor-pointer w-full min-w-0 p-0"
                    title="Pilih tanggal presensi"
                  />
                </div>
                <button
                  v-if="!isTodaySelected"
                  type="button"
                  @click="setTodayDate"
                  class="px-1.5 py-0.5 text-[9px] font-bold rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 cursor-pointer shrink-0"
                  title="Kembali ke hari ini"
                >
                  Hari Ini
                </button>
              </div>
            </div>

            <!-- Baris 2: Pencarian Siswa + Tombol Semua Hadir + Tombol Export Excel -->
            <div class="flex items-center gap-1.5">
              <!-- Search Bar -->
              <div class="relative flex-1 min-w-0">
                <span class="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-slate-400">
                  <span class="material-icons text-xs">search</span>
                </span>
                <input
                  v-model="manualSearchQuery"
                  type="text"
                  placeholder="Cari nama / NISN..."
                  class="w-full h-8 pl-8 pr-6 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white shadow-2xs placeholder:text-slate-400 text-slate-800"
                />
                <button
                  v-if="manualSearchQuery"
                  type="button"
                  @click="manualSearchQuery = ''"
                  class="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                  title="Hapus pencarian"
                >
                  ✕
                </button>
              </div>

              <!-- Tombol Set Semua Hadir (Kompak) -->
              <button
                type="button"
                @click="setAllStudentsPresent"
                class="h-8 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-2xs flex items-center gap-1 shrink-0 cursor-pointer transition-transform active:scale-95"
                title="Tandai semua siswa di kelas ini hadir"
              >
                <span class="material-icons text-xs">done_all</span>
                <span class="hidden sm:inline">Set Semua Hadir</span>
                <span class="sm:hidden text-[11px]">Semua Hadir</span>
              </button>

              <!-- Tombol Export Excel (Kompak) -->
              <button
                type="button"
                @click="exportClassToExcel"
                class="h-8 px-2.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 font-semibold text-xs shadow-2xs flex items-center gap-1 shrink-0 cursor-pointer transition-transform active:scale-95"
                title="Unduh rekap presensi kelas ke format Excel"
              >
                <span class="material-icons text-sm">file_download</span>
                <span class="hidden sm:inline">Export Excel</span>
                <span class="sm:hidden text-[11px]">Excel</span>
              </button>
            </div>

            <!-- Mini Counter Info jika Filter / Pencarian Aktif -->
            <div
              v-if="manualSearchQuery || statusFilter !== 'all'"
              class="flex items-center justify-between text-[11px] text-slate-500 pt-0.5 px-0.5 border-t border-slate-200/60"
            >
              <span>Menampilkan <strong class="text-slate-800">{{ filteredClassStudents.length }}</strong> dari {{ classStudents.length }} siswa</span>
              <button
                type="button"
                @click="manualSearchQuery = ''; statusFilter = 'all'"
                class="text-blue-600 font-bold hover:underline cursor-pointer"
              >
                Reset Filter
              </button>
            </div>
          </div>

          <!-- Tabel Presensi & Jurnal Kelas (Desktop Table) -->
          <div class="hidden md:block overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-600">
              <thead class="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th class="py-2.5 px-3">Siswa</th>
                  <th class="py-2.5 px-3">NISN</th>
                  <th class="py-2.5 px-3">Tanggal</th>
                  <th class="py-2.5 px-3">Jam Masuk</th>
                  <th class="py-2.5 px-3">Status</th>
                  <th class="py-2.5 px-3">Metode</th>
                  <th class="py-2.5 px-3 text-center text-slate-700 font-semibold whitespace-nowrap">
                    <span class="inline-flex items-center gap-1">
                      <span class="material-icons text-xs text-blue-600">touch_app</span>
                      <span>Ubah Status Presensi</span>
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="std in filteredClassStudents" :key="std.id" class="hover:bg-slate-50/50">
                  <td class="py-2.5 px-3 font-semibold text-slate-900 flex items-center gap-2.5">
                    <img
                      v-if="std.foto_profil_url"
                      :src="std.foto_profil_url"
                      class="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div
                      v-else
                      class="w-7 h-7 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 border border-blue-700 select-none"
                    >
                      {{ getInitials(std.nama_lengkap) }}
                    </div>
                    <span class="whitespace-nowrap">{{ std.nama_lengkap }}</span>
                  </td>
                  <td class="py-2.5 px-3 font-mono text-[11px] whitespace-nowrap">{{ std.nomor_induk }}</td>
                  <!-- Kolom Tanggal Presensi -->
                  <td class="py-2.5 px-3 font-mono text-[11px] whitespace-nowrap">
                    <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                      <span class="material-icons text-xs">calendar_today</span>
                      <span>{{ formatShortDate(getStudentAttendance(std.id)?.tanggal || selectedDate) }}</span>
                    </span>
                  </td>
                  <td class="py-2.5 px-3 whitespace-nowrap">
                    <!-- Tampilan Jam Masuk (Teks Saja, Input Jam Dihapus) -->
                    <span
                      class="font-mono text-xs font-bold"
                      :class="getStudentAttendance(std.id)?.jam_masuk ? 'text-slate-800' : 'text-slate-400'"
                    >
                      {{ getStudentAttendance(std.id)?.jam_masuk || '-' }}
                    </span>
                  </td>
                  <td class="py-2.5 px-3 whitespace-nowrap">
                    <div class="flex items-center gap-1.5">
                      <Badge :status="getStudentStatus(std.id)" />
                      <!-- Badge Surat ACC Izin/Sakit Terverifikasi -->
                      <span
                        v-if="getStudentApprovedPermit(std.id)"
                        class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 inline-flex items-center gap-0.5"
                        :title="`Surat Izin Disetujui: ${getStudentApprovedPermit(std.id).keterangan || '-'}`"
                      >
                        <span class="material-icons text-[11px]">verified</span>
                        <span>Surat ACC</span>
                      </span>
                      <span v-if="isStudentPending(std.id)" class="w-2 h-2 rounded-full bg-blue-600 animate-pulse shrink-0" title="Perubahan belum disimpan"></span>
                    </div>
                  </td>
                  <td class="py-2.5 px-3 whitespace-nowrap">
                    <div class="flex items-center gap-1.5">
                      <span class="text-[11px] text-slate-500">
                        {{ getMetodeLabel(getStudentAttendance(std.id)?.metode_presensi) }}
                      </span>
                      <!-- Tombol Preview Foto Selfie Presensi Jika Tersedia -->
                      <button
                        v-if="getStudentAttendance(std.id)?.foto_masuk_url"
                        type="button"
                        @click="openSelfieModal(std, getStudentAttendance(std.id))"
                        class="px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-900 transition-colors inline-flex items-center gap-1 text-[10px] font-semibold cursor-pointer border border-blue-200 shadow-2xs"
                        title="Klik untuk verifikasi foto selfie kehadiran siswa"
                      >
                        <span class="material-icons text-xs">photo_camera</span>
                        <span>Foto</span>
                      </button>
                    </div>
                  </td>
                  <!-- Kolom Ubah Status Cepat (Hadir vs Tidak Hadir & Sub-opsi Sakit/Izin/Alpa) -->
                  <td class="py-2.5 px-3">
                    <!-- Kasus 1: Status Saat Ini Hadir / Terlambat -->
                    <div
                      v-if="getStudentStatus(std.id) === 'hadir' || getStudentStatus(std.id) === 'terlambat'"
                      class="flex items-center justify-center gap-1.5"
                    >
                      <button
                        type="button"
                        @click="updateStudentStatus(std, 'hadir')"
                        class="h-7 px-3 rounded-lg text-xs font-bold bg-emerald-600 text-white shadow-2xs flex items-center gap-1 cursor-pointer transition-transform active:scale-95"
                        title="Tandai Hadir"
                      >
                        <span class="material-icons text-xs">check</span>
                        <span>Hadir</span>
                      </button>
                      <button
                        type="button"
                        @click="updateStudentStatus(std, 'alpa')"
                        class="h-7 px-2.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200/90 flex items-center gap-1 cursor-pointer transition-transform active:scale-95"
                        title="Tandai Tidak Hadir"
                      >
                        <span class="material-icons text-xs text-slate-400">close</span>
                        <span>Tidak Hadir</span>
                      </button>
                    </div>

                    <!-- Kasus 2: Status Saat Ini Tidak Hadir (Sakit / Izin / Alpa) -->
                    <div v-else class="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        @click="updateStudentStatus(std, 'hadir')"
                        class="h-7 px-2.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 cursor-pointer transition-transform active:scale-95 flex items-center gap-1 shrink-0"
                        title="Ubah jadi Hadir"
                      >
                        <span class="material-icons text-xs text-emerald-600">check</span>
                        <span>Hadir</span>
                      </button>
                      <div class="inline-flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs shrink-0">
                        <button
                          type="button"
                          @click="updateStudentStatus(std, 'sakit')"
                          :class="[
                            'px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer',
                            getStudentStatus(std.id) === 'sakit' ? 'bg-purple-600 text-white shadow-2xs' : 'text-purple-800 hover:bg-purple-100/60'
                          ]"
                          title="Tandai Sakit"
                        >
                          Sakit
                        </button>
                        <button
                          type="button"
                          @click="updateStudentStatus(std, 'izin')"
                          :class="[
                            'px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer',
                            getStudentStatus(std.id) === 'izin' ? 'bg-blue-600 text-white shadow-2xs' : 'text-blue-800 hover:bg-blue-100/60'
                          ]"
                          title="Tandai Izin"
                        >
                          Izin
                        </button>
                        <button
                          type="button"
                          @click="updateStudentStatus(std, 'alpa')"
                          :class="[
                            'px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer',
                            getStudentStatus(std.id) === 'alpa' ? 'bg-rose-600 text-white shadow-2xs' : 'text-rose-800 hover:bg-rose-100/60'
                          ]"
                          title="Tandai Alpa"
                        >
                          Alpa
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr v-if="filteredClassStudents.length === 0">
                  <td colspan="7" class="py-8 text-center text-slate-400 text-xs">
                    <span v-if="manualSearchQuery">Tidak ada siswa yang cocok dengan pencarian "{{ manualSearchQuery }}".</span>
                    <span v-else-if="statusFilter !== 'all'">Tidak ada siswa dengan filter status "{{ statusFilter }}".</span>
                    <span v-else>Tidak ada siswa terdaftar di kelas {{ selectedClass }}.</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile ListView (Absensi Manual Cepat: Hadir vs Tidak Hadir & Sub-opsi Sakit/Izin/Alpa) -->
          <div class="md:hidden space-y-2.5">
            <div
              v-for="std in filteredClassStudents"
              :key="std.id"
              class="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-2.5 transition-all select-none"
              :class="isStudentPending(std.id) ? 'ring-2 ring-blue-500/60 bg-blue-50/20 border-blue-300' : ''"
            >
              <!-- Info Baris Atas: Avatar, Nama, NISN, & Status Badge -->
              <div class="flex items-center justify-between gap-2.5 cursor-pointer" @click="openStudentSheet(std)">
                <div class="flex items-center gap-2.5 min-w-0">
                  <img
                    v-if="std.foto_profil_url"
                    :src="std.foto_profil_url"
                    class="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-2xs shrink-0"
                  />
                  <div
                    v-else
                    class="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center border border-blue-700 shadow-2xs shrink-0 select-none"
                  >
                    {{ getInitials(std.nama_lengkap) }}
                  </div>
                  <div class="min-w-0">
                    <div class="flex items-center gap-1.5">
                      <h4 class="text-sm font-bold text-slate-900 truncate leading-snug">{{ std.nama_lengkap }}</h4>
                      <span v-if="isStudentPending(std.id)" class="w-2 h-2 rounded-full bg-blue-600 animate-pulse shrink-0" title="Perubahan belum disimpan"></span>
                    </div>
                    <p class="text-[11px] text-slate-500 truncate mt-0.5 font-mono">
                      NISN: {{ std.nomor_induk }} &bull; {{ getStudentAttendance(std.id)?.jam_masuk || '-' }}
                    </p>
                  </div>
                </div>
                <div class="flex flex-col items-end gap-1 shrink-0">
                  <Badge :status="getStudentStatus(std.id)" />
                  <!-- Badge Surat ACC jika ada surat dokter / izin yang disetujui -->
                  <span
                    v-if="getStudentApprovedPermit(std.id)"
                    class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 inline-flex items-center gap-0.5"
                  >
                    <span class="material-icons text-[11px]">verified</span>
                    <span>Surat ACC</span>
                  </span>
                </div>
              </div>

              <!-- Banner Dispensasi Izin / Sakit Terverifikasi (Jika Ada Surat Izin Disetujui) -->
              <div
                v-if="getStudentApprovedPermit(std.id)"
                class="px-2.5 py-1.5 rounded-xl bg-blue-50/90 border border-blue-200/80 flex items-center justify-between gap-2 text-xs text-blue-900"
              >
                <div class="flex items-center gap-1.5 min-w-0">
                  <span class="material-icons text-xs text-blue-600 shrink-0">assignment_turned_in</span>
                  <span class="truncate text-[11px] font-semibold">
                    Dispensasi Disetujui: <strong class="capitalize text-blue-950">{{ getStudentApprovedPermit(std.id).jenis }}</strong> &bull; {{ getStudentApprovedPermit(std.id).keterangan || 'Surat Izin Resmi' }}
                  </span>
                </div>
              </div>

              <!-- Quick Status Buttons (Hadir vs Tidak Hadir dengan Sub-opsi Sakit / Izin / Alpa) -->
              <div class="pt-2 border-t border-slate-100">
                <!-- Kasus 1: Status Hadir / Terlambat -->
                <div
                  v-if="getStudentStatus(std.id) === 'hadir' || getStudentStatus(std.id) === 'terlambat'"
                  class="grid grid-cols-2 gap-2"
                >
                  <button
                    type="button"
                    @click.stop="updateStudentStatus(std, 'hadir')"
                    class="py-2 px-3 text-xs font-bold rounded-xl bg-emerald-600 text-white shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-transform active:scale-95"
                  >
                    <span class="material-icons text-sm">check_circle</span>
                    <span>Hadir</span>
                  </button>
                  <button
                    type="button"
                    @click.stop="updateStudentStatus(std, 'alpa')"
                    class="py-2 px-3 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200/90 flex items-center justify-center gap-1.5 cursor-pointer transition-transform active:scale-95"
                  >
                    <span class="material-icons text-sm text-slate-400">cancel</span>
                    <span>Tidak Hadir</span>
                  </button>
                </div>

                <!-- Kasus 2: Status Tidak Hadir (Sakit / Izin / Alpa) -->
                <div v-else class="flex items-center gap-1.5">
                  <button
                    type="button"
                    @click.stop="updateStudentStatus(std, 'hadir')"
                    class="py-2 px-2.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200/90 flex items-center gap-1 cursor-pointer transition-transform active:scale-95 shrink-0"
                    title="Ubah menjadi Hadir"
                  >
                    <span class="material-icons text-xs text-emerald-600">check</span>
                    <span>Hadir</span>
                  </button>

                  <!-- Segmented Control Alasan: Sakit | Izin | Alpa -->
                  <div class="grid grid-cols-3 gap-1 flex-1 bg-slate-100 p-1 rounded-xl border border-slate-200/90">
                    <button
                      type="button"
                      @click.stop="updateStudentStatus(std, 'sakit')"
                      :class="[
                        'py-1.5 text-xs font-bold rounded-lg transition-all text-center cursor-pointer',
                        getStudentStatus(std.id) === 'sakit'
                          ? 'bg-purple-600 text-white shadow-2xs'
                          : 'text-purple-800 hover:bg-purple-200/50'
                      ]"
                    >
                      Sakit
                    </button>
                    <button
                      type="button"
                      @click.stop="updateStudentStatus(std, 'izin')"
                      :class="[
                        'py-1.5 text-xs font-bold rounded-lg transition-all text-center cursor-pointer',
                        getStudentStatus(std.id) === 'izin'
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'text-blue-800 hover:bg-blue-200/50'
                      ]"
                    >
                      Izin
                    </button>
                    <button
                      type="button"
                      @click.stop="updateStudentStatus(std, 'alpa')"
                      :class="[
                        'py-1.5 text-xs font-bold rounded-lg transition-all text-center cursor-pointer',
                        getStudentStatus(std.id) === 'alpa'
                          ? 'bg-rose-600 text-white shadow-2xs'
                          : 'text-rose-800 hover:bg-rose-200/50'
                      ]"
                    >
                      Alpa
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="filteredClassStudents.length === 0" class="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-200">
              <span v-if="manualSearchQuery">Tidak ada siswa yang cocok dengan pencarian "{{ manualSearchQuery }}".</span>
              <span v-else-if="statusFilter !== 'all'">Tidak ada siswa dengan filter status "{{ statusFilter }}".</span>
              <span v-else>Tidak ada siswa terdaftar di kelas {{ selectedClass }}.</span>
            </div>
          </div>
        </Card>
      </div>

      <!-- TAB 3: VERIFIKASI PERMOHONAN IZIN -->
      <div v-else-if="activeTab === 'verifikasi'" class="space-y-4">
        <!-- Summary Cards Permohonan Izin -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div class="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <p class="text-[11px] font-semibold text-slate-500 uppercase">Total Pengajuan</p>
            <div class="flex items-center justify-between mt-1">
              <span class="text-xl sm:text-2xl font-bold text-slate-900">{{ teacherLeaveRequests.length }}</span>
              <span class="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">Semua</span>
            </div>
          </div>
          <div class="bg-white p-3.5 sm:p-4 rounded-xl border border-amber-200/80 shadow-xs">
            <p class="text-[11px] font-semibold text-amber-600 uppercase">Menunggu Verifikasi</p>
            <div class="flex items-center justify-between mt-1">
              <span class="text-xl sm:text-2xl font-bold text-amber-700">{{ pendingPermits.length }}</span>
              <span class="text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">Pending</span>
            </div>
          </div>
          <div class="bg-white p-3.5 sm:p-4 rounded-xl border border-emerald-200/80 shadow-xs">
            <p class="text-[11px] font-semibold text-emerald-600 uppercase">Telah Disetujui</p>
            <div class="flex items-center justify-between mt-1">
              <span class="text-xl sm:text-2xl font-bold text-emerald-700">
                {{ teacherLeaveRequests.filter(l => l.status === 'approved').length }}
              </span>
              <span class="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Approved</span>
            </div>
          </div>
          <div class="bg-white p-3.5 sm:p-4 rounded-xl border border-rose-200/80 shadow-xs">
            <p class="text-[11px] font-semibold text-rose-600 uppercase">Telah Ditolak</p>
            <div class="flex items-center justify-between mt-1">
              <span class="text-xl sm:text-2xl font-bold text-rose-700">
                {{ teacherLeaveRequests.filter(l => l.status === 'rejected').length }}
              </span>
              <span class="text-[10px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">Rejected</span>
            </div>
          </div>
        </div>

        <Card title="Daftar Permohonan Izin & Sakit Siswa" description="Verifikasi berkas bukti surat dokter dan persetujuan izin kehadiran siswa">
          <!-- Toolbar Filter & Pencarian Izin (Proporsional & Ringkas) -->
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-2.5 mb-4 pb-3 border-b border-slate-100">
            <!-- Sisi Kiri: Filter Kelas + Status Filter Pills -->
            <div class="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <!-- Custom Dropdown Popover Filter Kelas -->
              <CustomDropdown
                v-model="permitClassFilter"
                :options="permitClassFilterOptions"
                title="Filter Kelas"
                icon="school"
                size="sm"
              />

              <!-- Segmented Pills: Filter Status -->
              <div class="flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200/80 shrink-0">
                <button
                  type="button"
                  @click="permitStatusFilter = 'all'"
                  :class="[
                    'h-7 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1',
                    permitStatusFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  ]"
                >
                  <span>Semua</span>
                </button>
                <button
                  type="button"
                  @click="permitStatusFilter = 'pending'"
                  :class="[
                    'h-7 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1',
                    permitStatusFilter === 'pending'
                      ? 'bg-amber-500 text-white shadow-2xs font-bold'
                      : 'text-amber-700 hover:text-amber-900'
                  ]"
                >
                  <span>Menunggu</span>
                  <span
                    v-if="pendingPermits.length"
                    :class="[
                      'px-1.5 py-0.2 rounded-full text-[10px] font-bold',
                      permitStatusFilter === 'pending' ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-800'
                    ]"
                  >
                    {{ pendingPermits.length }}
                  </span>
                </button>
                <button
                  type="button"
                  @click="permitStatusFilter = 'approved'"
                  :class="[
                    'h-7 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1',
                    permitStatusFilter === 'approved'
                      ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                      : 'text-emerald-700 hover:text-emerald-900'
                  ]"
                >
                  <span>Disetujui</span>
                </button>
                <button
                  type="button"
                  @click="permitStatusFilter = 'rejected'"
                  :class="[
                    'h-7 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1',
                    permitStatusFilter === 'rejected'
                      ? 'bg-rose-600 text-white shadow-2xs font-bold'
                      : 'text-rose-700 hover:text-rose-900'
                  ]"
                >
                  <span>Ditolak</span>
                </button>
              </div>
            </div>

            <!-- Sisi Kanan: Search Input + Status Counter & Reset -->
            <div class="flex items-center gap-2 flex-1 max-w-sm justify-end">
              <!-- Search Box Siswa / Keterangan -->
              <div class="relative flex-1 min-w-[160px]">
                <span class="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-slate-400">
                  <span class="material-icons text-xs">search</span>
                </span>
                <input
                  v-model="permitSearchQuery"
                  type="text"
                  placeholder="Cari siswa/alasan..."
                  class="w-full h-8 pl-8 pr-6 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
                />
                <button
                  v-if="permitSearchQuery"
                  type="button"
                  @click="permitSearchQuery = ''"
                  class="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <!-- Counter Badge & Reset -->
              <div class="flex items-center gap-1 text-[11px] text-slate-500 shrink-0">
                <span class="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 font-medium whitespace-nowrap">
                  {{ filteredLeaveRequests.length }} / {{ teacherLeaveRequests.length }}
                </span>
                <button
                  v-if="permitClassFilter || permitStatusFilter !== 'all' || permitSearchQuery"
                  type="button"
                  @click="permitClassFilter = ''; permitStatusFilter = 'all'; permitSearchQuery = ''"
                  class="px-2 py-1 rounded-lg text-rose-600 hover:bg-rose-50 font-semibold cursor-pointer flex items-center gap-0.5 transition-colors"
                  title="Reset filter"
                >
                  <span class="material-icons text-xs">close</span>
                  <span class="hidden sm:inline">Reset</span>
                </button>
              </div>
            </div>
          </div>

          <!-- List Permohonan Izin -->
          <div v-if="filteredLeaveRequests.length" class="space-y-3">
            <div
              v-for="item in filteredLeaveRequests"
              :key="item.id"
              class="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div class="flex items-start gap-3 min-w-0">
                <!-- Thumbnail Lampiran Dokumen -->
                <div v-if="item.bukti_surat_url" class="shrink-0">
                  <img
                    :src="item.bukti_surat_url"
                    alt="Surat Dokter"
                    class="w-14 h-14 rounded-lg object-cover border border-slate-200 cursor-pointer hover:opacity-85 shadow-xs transition-opacity"
                    @click="openPreviewModal(item.bukti_surat_url, item.nama_lengkap)"
                    title="Klik untuk memperbesar dokumen surat"
                  />
                </div>
                <div v-else class="w-14 h-14 rounded-lg bg-slate-100 border border-slate-200 flex flex-col items-center justify-center shrink-0 text-slate-400 text-[10px]">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <span>Tanpa File</span>
                </div>

                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-bold text-slate-900 text-sm">{{ item.nama_lengkap }}</span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {{ item.kelas }}
                    </span>
                    <Badge :status="item.jenis" />
                    <Badge :status="item.status" />
                  </div>
                  <p class="text-xs text-slate-500 mt-1">
                    Periode: <strong class="text-slate-700">{{ item.tanggal_mulai }}</strong>
                    <span v-if="item.tanggal_selesai && item.tanggal_selesai !== item.tanggal_mulai"> s/d <strong class="text-slate-700">{{ item.tanggal_selesai }}</strong></span>
                  </p>
                  <p class="text-xs text-slate-700 mt-1 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                    "{{ item.keterangan }}"
                  </p>
                  <button
                    v-if="item.bukti_surat_url"
                    type="button"
                    class="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1.5 cursor-pointer"
                    @click="openPreviewModal(item.bukti_surat_url, item.nama_lengkap)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                    Lihat Lampiran Surat &rarr;
                  </button>
                </div>
              </div>

              <!-- Aksi Verifikasi (Setujui / Tolak) -->
              <div class="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <Button
                  size="sm"
                  variant="success"
                  @click="approvePermit(item)"
                  :disabled="item.status === 'approved'"
                  class="flex-1 sm:flex-none justify-center"
                >
                  <span class="material-icons text-xs mr-1">check</span>
                  <span>{{ item.status === 'approved' ? 'Telah Disetujui' : 'Setujui' }}</span>
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  @click="rejectPermit(item)"
                  :disabled="item.status === 'rejected'"
                  class="flex-1 sm:flex-none justify-center"
                >
                  <span class="material-icons text-xs mr-1">close</span>
                  <span>{{ item.status === 'rejected' ? 'Telah Ditolak' : 'Tolak' }}</span>
                </Button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-12 text-slate-400 text-xs space-y-1">
            <span class="material-icons text-3xl text-slate-300">inbox</span>
            <p v-if="permitClassFilter">Tidak ada permohonan izin untuk <strong>Kelas {{ permitClassFilter }}</strong>.</p>
            <p v-else-if="permitStatusFilter !== 'all'">Tidak ada permohonan izin dengan status <strong>{{ permitStatusFilter }}</strong>.</p>
            <p v-else-if="permitSearchQuery">Tidak ada siswa yang cocok dengan pencarian "{{ permitSearchQuery }}".</p>
            <p v-else>Tidak ada permohonan izin di kelas binaan Anda saat ini.</p>
          </div>
        </Card>
      </div>

      <!-- TAB 4: RINGKASAN JADWAL KELAS DENGAN MODE EDIT LANGSUNG -->
      <div v-else-if="activeTab === 'jadwal'" class="space-y-4">
        <Card
          title="Jadwal Mengajar Per Kelas"
          :description="`Mata Pelajaran: ${currentTeacher?.mata_pelajaran || 'Umum'} • Atur jam masuk, batas toleransi terlambat, dan jam pulang langsung pada setiap kelas binaan Anda`"
        >
          <!-- Toolbar Filter & Pencarian Kelas (Proporsional & Ringkas) -->
          <div class="flex items-center justify-between gap-2.5 mb-4 pb-3 border-b border-slate-100 flex-wrap sm:flex-nowrap">
            <!-- Sisi Kiri: Filter Dropdown + Search Box -->
            <div class="flex items-center gap-2 flex-1 min-w-[220px] max-w-md">
              <!-- Custom Dropdown Popover Filter Kelas -->
              <CustomDropdown
                v-model="scheduleClassFilter"
                :options="scheduleClassFilterOptions"
                title="Filter Kelas"
                icon="tune"
                size="sm"
              />

              <!-- Search Box Kelas -->
              <div class="relative flex-1 min-w-0">
                <span class="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-slate-400">
                  <span class="material-icons text-xs">search</span>
                </span>
                <input
                  v-model="scheduleSearchQuery"
                  type="text"
                  placeholder="Cari kelas..."
                  class="w-full h-8 pl-8 pr-6 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
                />
                <button
                  v-if="scheduleSearchQuery"
                  type="button"
                  @click="scheduleSearchQuery = ''"
                  class="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            <!-- Sisi Kanan: Status Counter & Reset -->
            <div class="flex items-center gap-2 text-[11px] text-slate-500 shrink-0">
              <span class="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 font-medium whitespace-nowrap">
                {{ filteredTeacherClasses.length }} / {{ teacherClasses.length }} kelas
              </span>
              <button
                v-if="scheduleClassFilter !== 'ALL' || scheduleSearchQuery"
                type="button"
                @click="scheduleClassFilter = 'ALL'; scheduleSearchQuery = ''"
                class="px-2 py-1 rounded-lg text-rose-600 hover:bg-rose-50 font-semibold cursor-pointer flex items-center gap-0.5 transition-colors"
                title="Reset filter"
              >
                <span class="material-icons text-xs">close</span>
                <span>Reset</span>
              </button>
            </div>
          </div>

          <!-- Empty State jika Filter / Pencarian tidak cocok -->
          <div
            v-if="filteredTeacherClasses.length === 0"
            class="py-12 text-center text-slate-400 text-xs bg-slate-50/70 rounded-2xl border border-dashed border-slate-200"
          >
            <span class="material-icons text-3xl text-slate-300 mb-1">search_off</span>
            <p class="font-semibold text-slate-600">Tidak ada jadwal kelas yang cocok</p>
            <p class="text-[11px] text-slate-400 mt-0.5">Coba ubah kata kunci pencarian atau reset filter kelas.</p>
            <button
              type="button"
              @click="scheduleClassFilter = 'ALL'; scheduleSearchQuery = ''"
              class="mt-3 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              Reset Filter
            </button>
          </div>

          <!-- Grid Card Jadwal Kelas (1 kolom di mobile, 2 kolom tablet, 3 kolom desktop) -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="cls in filteredTeacherClasses"
              :key="cls"
              class="p-4 bg-slate-50/90 border border-slate-200/90 rounded-2xl space-y-3.5 shadow-2xs hover:border-blue-300 transition-all flex flex-col justify-between"
            >
              <div>
                <!-- Header Baris Kelas: Nama Kelas, Badge Aktif, Jumlah Siswa -->
                <div class="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-200/70">
                  <div class="flex items-center gap-2 min-w-0">
                    <div class="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                      <span class="material-icons text-sm">school</span>
                    </div>
                    <div class="min-w-0">
                      <h4 class="font-bold text-slate-900 text-sm truncate">Kelas {{ cls }}</h4>
                      <p class="text-[11px] text-slate-500 font-medium">{{ getStudentsCountForClass(cls) }} siswa terdaftar</p>
                    </div>
                  </div>

                  <div class="flex items-center gap-1.5 shrink-0">
                    <span
                      v-if="selectedClass === cls"
                      class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200"
                    >
                      Aktif di Absensi
                    </span>
                  </div>
                </div>

                <!-- Form Jadwal Kelas (Mata Pelajaran & 3 Input Jam) -->
                <form @submit.prevent="saveScheduleForClass(cls)" class="space-y-3 mt-3">
                  <!-- Pilihan Mata Pelajaran untuk Kelas Ini (Khusus Guru Multi Mapel) -->
                  <div>
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-[10px] font-bold text-slate-500 uppercase tracking-tight flex items-center gap-1">
                        <span class="material-icons text-[12px] text-blue-600">menu_book</span>
                        <span>Mata Pelajaran di Kelas Ini</span>
                      </span>
                      <span v-if="teacherSubjectDropdownOptions.length > 1" class="text-[10px] text-blue-600 font-semibold">
                        Multi-Mapel
                      </span>
                    </div>

                    <!-- Dropdown jika guru punya multi mapel -->
                    <CustomDropdown
                      v-if="teacherSubjectDropdownOptions.length > 1 && classScheduleForms[cls]"
                      v-model="classScheduleForms[cls].mata_pelajaran"
                      :options="teacherSubjectDropdownOptions"
                      placeholder="Pilih Mata Pelajaran"
                      title="Mata Pelajaran di Kelas Ini"
                      icon="menu_book"
                      :fullWidth="true"
                      size="sm"
                    />

                    <!-- Badge jika guru hanya punya 1 mapel -->
                    <div
                      v-else
                      class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs font-semibold text-slate-800"
                    >
                      <span class="truncate">{{ getClassSubject(cls) }}</span>
                    </div>
                  </div>

                  <div class="grid grid-cols-3 gap-2">
                    <!-- 1. Jam Masuk -->
                    <div class="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                      <div class="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-tight truncate">
                        <span class="material-icons text-[11px] text-blue-600">login</span>
                        <span>Masuk</span>
                      </div>
                      <input
                        v-if="classScheduleForms[cls]"
                        v-model="classScheduleForms[cls].jam_masuk"
                        type="time"
                        required
                        class="w-full text-xs font-mono font-bold text-slate-800 bg-transparent border-none focus:outline-none p-0 cursor-pointer"
                      />
                    </div>

                    <!-- 2. Toleransi Terlambat -->
                    <div class="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                      <div class="flex items-center gap-1 text-[10px] font-bold text-amber-700 uppercase tracking-tight truncate">
                        <span class="material-icons text-[11px] text-amber-600">alarm</span>
                        <span>Batas Telat</span>
                      </div>
                      <input
                        v-if="classScheduleForms[cls]"
                        v-model="classScheduleForms[cls].jam_terlambat"
                        type="time"
                        required
                        class="w-full text-xs font-mono font-bold text-amber-800 bg-transparent border-none focus:outline-none p-0 cursor-pointer"
                      />
                    </div>

                    <!-- 3. Jam Pulang -->
                    <div class="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                      <div class="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-tight truncate">
                        <span class="material-icons text-[11px] text-rose-600">logout</span>
                        <span>Pulang</span>
                      </div>
                      <input
                        v-if="classScheduleForms[cls]"
                        v-model="classScheduleForms[cls].jam_pulang"
                        type="time"
                        required
                        class="w-full text-xs font-mono font-bold text-slate-800 bg-transparent border-none focus:outline-none p-0 cursor-pointer"
                      />
                    </div>
                  </div>

                  <!-- Footer Tindakan: Tombol Simpan Jadwal Kelas & Tombol Buka Jurnal -->
                  <div class="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60 mt-3">
                    <button
                      type="button"
                      @click="jumpToClassAttendance(cls)"
                      class="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>Buka Jurnal</span>
                      <span class="material-icons text-xs">arrow_forward</span>
                    </button>

                    <button
                      type="submit"
                      :class="[
                        'h-7 px-3 rounded-lg font-semibold text-xs shadow-2xs flex items-center gap-1 cursor-pointer transition-all active:scale-95 shrink-0',
                        savedScheduleStatus[cls]
                          ? 'bg-emerald-600 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      ]"
                    >
                      <span class="material-icons text-xs">
                        {{ savedScheduleStatus[cls] ? 'check_circle' : 'save' }}
                      </span>
                      <span>{{ savedScheduleStatus[cls] ? 'Tersimpan' : 'Simpan' }}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <!-- TAB 5: PROFIL LENGKAP PENDIDIK & ALOKASI KELAS -->
      <div v-else-if="activeTab === 'profil'" class="space-y-6">
        <!-- 1. Virtual Teacher Identity Card (Full Width Banner) -->
        <div class="relative overflow-hidden rounded-2xl bg-slate-900 text-white p-6 shadow-md border border-slate-800">
          <div class="relative z-10">
            <!-- Header ID Card -->
            <div class="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-blue-200">
                  <span class="material-icons text-lg">school</span>
                </div>
                <div>
                  <h4 class="text-xs uppercase font-bold tracking-wider text-blue-200">Kartu Identitas Pendidik</h4>
                  <p class="text-xs text-white/90 font-medium">{{ attendanceStore.schoolSettings.nama_sekolah }}</p>
                </div>
              </div>
            </div>

            <!-- Identity Body -->
            <div class="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div class="relative shrink-0">
                <img
                  v-if="currentTeacher?.foto_profil_url || authStore.user?.foto_profil_url"
                  :src="currentTeacher?.foto_profil_url || authStore.user?.foto_profil_url"
                  alt="Foto Guru"
                  class="w-24 h-28 sm:w-28 sm:h-32 rounded-xl object-cover border-2 border-white/30 shadow-lg"
                />
                <div
                  v-else
                  class="w-24 h-28 sm:w-28 sm:h-32 rounded-xl bg-blue-800/90 border-2 border-white/30 shadow-lg flex items-center justify-center text-white font-bold text-2xl select-none"
                >
                  {{ getInitials(currentTeacher?.nama_lengkap || authStore.user?.nama_lengkap) }}
                </div>
                <span class="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900" title="Status: Online"></span>
              </div>

              <div class="flex-1 text-center sm:text-left space-y-3 min-w-0">
                <div>
                  <h3 class="text-xl font-bold text-white tracking-tight">{{ currentTeacher?.nama_lengkap || authStore.user?.nama_lengkap }}</h3>
                  <div class="flex items-center gap-1.5 mt-1.5 flex-wrap justify-center sm:justify-start">
                    <span
                      v-for="sub in formatSubjects(currentTeacher?.mata_pelajaran)"
                      :key="sub"
                      class="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-white/15 text-blue-100 text-xs font-medium border border-white/20"
                    >
                      <span class="material-icons text-xs">menu_book</span>
                      <span>{{ sub }}</span>
                    </span>
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <div class="bg-white/5 p-2.5 rounded-xl border border-white/10">
                    <p class="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">NIP / Nomor Induk Pegawai</p>
                    <div class="flex items-center justify-between mt-0.5">
                      <span class="font-mono font-bold text-white tracking-wider">{{ currentTeacher?.nomor_induk || '-' }}</span>
                      <button
                        type="button"
                        @click="copyNip"
                        class="text-[10px] text-blue-300 hover:text-white cursor-pointer px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 transition-colors"
                        title="Salin NIP"
                      >
                        {{ nipCopied ? 'Tersalin!' : 'Salin' }}
                      </button>
                    </div>
                  </div>

                  <div class="bg-white/5 p-2.5 rounded-xl border border-white/10">
                    <p class="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Email Akun Sekolah</p>
                    <p class="font-medium text-white truncate mt-0.5">{{ currentTeacher?.email || authStore.user?.email || '-' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2 Kolom Grid Desktop: Alokasi Kelas di Kiri (5 kolom), Form Update & Password di Kanan (7 kolom) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <!-- Kolom Kiri: Alokasi Kelas yang Diampu Guru (lg:col-span-5) -->
          <div class="lg:col-span-5 space-y-6">
            <Card title="Alokasi Kelas yang Anda Ampu" description="Daftar kelas yang diberikan hak akses presensi kepada Anda beserta jumlah siswa aktif">
              <div class="grid grid-cols-1 gap-3.5">
                <div
                  v-for="cls in teacherClasses"
                  :key="cls"
                  class="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-400 transition-all shadow-2xs space-y-3"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2.5">
                      <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs border border-blue-100">
                        <span class="material-icons text-base text-blue-600">school</span>
                      </div>
                      <div>
                        <h4 class="font-bold text-slate-900 text-sm">Kelas {{ cls }}</h4>
                        <p class="text-[11px] text-slate-500">{{ getStudentsCountForClass(cls) }} Siswa Terdaftar</p>
                      </div>
                    </div>
                  </div>

                  <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span class="text-slate-500 text-[11px]">
                      Jam Masuk: <strong class="font-mono text-slate-800">{{ getClassScheduleDisplay(cls).jam_masuk }}</strong>
                    </span>
                    <button
                      type="button"
                      @click="jumpToClassAttendance(cls)"
                      class="font-semibold text-blue-600 hover:text-blue-800 cursor-pointer inline-flex items-center gap-1 text-[11px]"
                    >
                      <span>Buka Absen</span>
                      <span>&rarr;</span>
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <!-- Kolom Kanan: Edit Profil & Ganti Password (lg:col-span-7) -->
          <div class="lg:col-span-7 space-y-6">
            <!-- Identitas Resmi & Pas Foto Mandiri Guru -->
            <Card title="Identitas & Pas Foto Pendidik" description="Informasi kepegawaian resmi dan pengelolaan pas foto profil Anda">
              <!-- Status Kuota Kesempatan Update Foto -->
              <div v-if="isTeacherPhotoLocked" class="mb-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-1">
                <div class="flex items-center justify-between">
                  <span class="flex items-center gap-1.5 font-bold text-slate-800">
                    <span class="material-icons text-base text-emerald-600">verified</span>
                    <span>Identitas & Foto Profil Terverifikasi</span>
                  </span>
                  <span class="px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-600 font-bold text-[10px]">Terkunci</span>
                </div>
                <p class="text-[11px] text-slate-500 leading-relaxed">
                  Data pokok pendidik dan 1x kesempatan pas foto mandiri telah terkunci. Perubahan nama, gelar, atau foto selanjutnya harus melalui <strong>Administrator / Tata Usaha Sekolah</strong>.
                </p>
              </div>
              <div v-else class="mb-4 p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
                <div class="flex items-center justify-between">
                  <span class="font-bold flex items-center gap-1.5 text-blue-800">
                    <span class="material-icons text-sm text-blue-600">info</span>
                    <span>Kesempatan Unggah Foto Mandiri:</span>
                    <span class="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px]">1x Tersisa</span>
                  </span>
                </div>
                <p class="text-[11px] text-blue-700 leading-relaxed">
                  Unggah pas foto resmi Anda (format <strong>PNG atau JPG</strong>, maksimal 5MB). Setelah disimpan, foto profil akan dikunci demi ketertiban data administrasi sekolah.
                </p>
              </div>

              <form @submit.prevent="saveTeacherProfile" class="space-y-4">
                <!-- Data Identitas Kepegawaian Resmi (Read-Only) -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <div class="flex items-center justify-between mb-1">
                      <label class="block text-xs font-semibold text-slate-700">Nama Lengkap & Gelar</label>
                      <span class="text-[10px] text-slate-400 font-medium flex items-center gap-0.5">
                        <span class="material-icons text-[11px] text-slate-400">lock</span> Resmi
                      </span>
                    </div>
                    <input
                      :value="currentTeacher?.nama_lengkap || authStore.user?.nama_lengkap"
                      type="text"
                      readonly
                      tabindex="-1"
                      class="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-semibold text-sm cursor-not-allowed select-all focus:outline-none"
                    />
                  </div>

                  <div>
                    <div class="flex items-center justify-between mb-1">
                      <label class="block text-xs font-semibold text-slate-700">NIP / Nomor Induk Pegawai</label>
                      <span class="text-[10px] text-slate-400 font-medium flex items-center gap-0.5">
                        <span class="material-icons text-[11px] text-slate-400">lock</span> Resmi
                      </span>
                    </div>
                    <input
                      :value="currentTeacher?.nomor_induk || authStore.user?.nomor_induk || '-'"
                      type="text"
                      readonly
                      tabindex="-1"
                      class="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-mono font-semibold text-sm cursor-not-allowed select-all focus:outline-none"
                    />
                  </div>
                </div>

                <p class="text-[11px] text-slate-400 flex items-center gap-1.5 pt-0.5">
                  <span class="material-icons text-xs text-slate-400">info_outline</span>
                  <span>Nama resmi dan NIP dikunci demi konsistensi data presensi & laporan rekap dinas.</span>
                </p>

                <!-- Upload Pas Foto Profil (PNG / JPG) -->
                <div class="pt-2 border-t border-slate-100">
                  <label class="block text-xs font-semibold text-slate-700 mb-1">
                    Pas Foto Profil Resmi (PNG / JPG)
                  </label>

                  <!-- Jika sudah terkunci -->
                  <div v-if="isTeacherPhotoLocked" class="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <img
                      v-if="currentTeacher?.foto_profil_url || authStore.user?.foto_profil_url"
                      :src="currentTeacher?.foto_profil_url || authStore.user?.foto_profil_url"
                      alt="Foto Guru"
                      class="w-14 h-16 rounded-lg object-cover border border-slate-300 shadow-2xs shrink-0"
                    />
                    <div
                      v-else
                      class="w-14 h-16 rounded-lg bg-blue-600 text-white font-bold text-sm flex items-center justify-center shrink-0 border border-blue-700 shadow-2xs select-none"
                    >
                      {{ getInitials(currentTeacher?.nama_lengkap || authStore.user?.nama_lengkap) }}
                    </div>
                    <div class="text-xs space-y-0.5">
                      <p class="font-bold text-slate-800">{{ currentTeacher?.nama_lengkap }}</p>
                      <p class="text-[11px] text-slate-500">Pas foto terkunci &bull; Hubungi Admin sekolah untuk penggantian</p>
                    </div>
                  </div>

                  <!-- Jika kuota masih ada -->
                  <div v-else class="space-y-2">
                    <input
                      ref="teacherPhotoInputRef"
                      type="file"
                      accept=".png, .jpg, .jpeg, image/png, image/jpeg"
                      class="hidden"
                      @change="handleTeacherPhotoChange"
                    />

                    <!-- Belum ada file baru dipilih -->
                    <div
                      v-if="!teacherPhotoPreview"
                      @click="triggerTeacherPhotoPicker"
                      class="p-5 border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl text-center cursor-pointer bg-slate-50/60 hover:bg-blue-50/20 transition-all group"
                    >
                      <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-1.5 text-lg group-hover:scale-105 transition-transform">
                        <span class="material-icons text-xl text-blue-600">add_a_photo</span>
                      </div>
                      <p class="text-xs font-bold text-slate-800">Klik untuk Unggah Pas Foto (PNG / JPG)</p>
                      <p class="text-[11px] text-slate-500 mt-0.5">Maksimal 5MB &bull; Gambar otomatis dioptimalkan</p>
                    </div>

                    <!-- Preview file baru yang dipilih -->
                    <div v-else class="p-3 rounded-xl border border-blue-200 bg-blue-50/40 flex items-center justify-between gap-3">
                      <div class="flex items-center gap-3 min-w-0">
                        <img
                          :src="teacherPhotoPreview"
                          alt="Preview Foto Baru"
                          class="w-14 h-16 rounded-lg object-cover border-2 border-blue-400 shadow-2xs shrink-0"
                        />
                        <div class="min-w-0 text-xs">
                          <p class="font-bold text-slate-800 truncate">{{ teacherPhotoFileName }}</p>
                          <p class="text-[11px] text-slate-500">{{ teacherPhotoFileSize }}</p>
                          <p class="text-[11px] text-emerald-600 font-semibold mt-0.5">Siap disimpan sebagai foto profil</p>
                        </div>
                      </div>
                      <div class="flex items-center gap-1.5 shrink-0">
                        <Button type="button" size="sm" variant="outline" @click="triggerTeacherPhotoPicker">
                          Ganti
                        </Button>
                        <Button type="button" size="sm" variant="ghost" class="text-rose-600 hover:bg-rose-50" @click="clearTeacherPhotoSelection">
                          Batal
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Tombol Simpan (Hanya jika kuota foto masih ada) -->
                <div v-if="!isTeacherPhotoLocked">
                  <Button
                    type="submit"
                    variant="default"
                    size="lg"
                    class="w-full text-xs font-bold shadow-2xs"
                    :disabled="!teacherPhotoPreview || isCompressingTeacherPhoto"
                  >
                    {{ isCompressingTeacherPhoto ? 'Memproses Foto...' : 'Simpan Pas Foto Profil' }}
                  </Button>
                </div>
              </form>
            </Card>

            <!-- Ganti Password Akun Guru Mandiri -->
            <Card title="Keamanan & Ganti Password Akun" description="Atur kata sandi akun pendidik Anda untuk melindungi akun dan akses data presensi">
              <form @submit.prevent="handleTeacherChangePassword" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  <!-- Kolom 1: Input Password Baru & Strength Indicator -->
                  <div class="space-y-2">
                    <label class="block text-xs font-semibold text-slate-700">Password Baru</label>
                    <div class="relative">
                      <input
                        v-model="teacherPasswordForm.newPassword"
                        :type="showTeacherPass ? 'text' : 'password'"
                        required
                        placeholder="Ketik password baru..."
                        class="w-full h-10 pl-3 pr-14 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        @click="showTeacherPass = !showTeacherPass"
                        class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer"
                      >
                        {{ showTeacherPass ? 'Tutup' : 'Lihat' }}
                      </button>
                    </div>

                    <!-- Strength Meter Bar -->
                    <div v-if="teacherPasswordForm.newPassword" class="space-y-1 pt-1">
                      <div class="flex items-center justify-between text-[11px]">
                        <span class="text-slate-500">Kekuatan Sandi:</span>
                        <span :class="teacherPasswordStrengthTextClass" class="font-bold">
                          {{ teacherPasswordStrengthLabel }}
                        </span>
                      </div>
                      <div class="grid grid-cols-3 gap-1.5 h-1.5">
                        <div
                          class="rounded-full transition-all duration-300"
                          :class="teacherPasswordScore >= 1 ? teacherPasswordStrengthBarColor : 'bg-slate-200'"
                        />
                        <div
                          class="rounded-full transition-all duration-300"
                          :class="teacherPasswordScore >= 2 ? teacherPasswordStrengthBarColor : 'bg-slate-200'"
                        />
                        <div
                          class="rounded-full transition-all duration-300"
                          :class="teacherPasswordScore >= 3 ? teacherPasswordStrengthBarColor : 'bg-slate-200'"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Kolom 2: Check Rules Box -->
                  <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Syarat Keamanan Password:
                    </span>
                    <ul class="space-y-1.5 text-xs">
                      <li
                        class="flex items-center gap-2 transition-colors"
                        :class="teacherPasswordRules.hasMinLength ? 'text-emerald-700 font-semibold' : 'text-slate-500'"
                      >
                        <span
                          class="material-icons text-sm"
                          :class="teacherPasswordRules.hasMinLength ? 'text-emerald-600' : 'text-slate-300'"
                        >
                          {{ teacherPasswordRules.hasMinLength ? 'check_circle' : 'radio_button_unchecked' }}
                        </span>
                        <span>Minimal 6 karakter</span>
                      </li>
                      <li
                        class="flex items-center gap-2 transition-colors"
                        :class="teacherPasswordRules.hasLetter ? 'text-emerald-700 font-semibold' : 'text-slate-500'"
                      >
                        <span
                          class="material-icons text-sm"
                          :class="teacherPasswordRules.hasLetter ? 'text-emerald-600' : 'text-slate-300'"
                        >
                          {{ teacherPasswordRules.hasLetter ? 'check_circle' : 'radio_button_unchecked' }}
                        </span>
                        <span>Mengandung huruf (a-z / A-Z)</span>
                      </li>
                      <li
                        class="flex items-center gap-2 transition-colors"
                        :class="teacherPasswordRules.hasNumber ? 'text-emerald-700 font-semibold' : 'text-slate-500'"
                      >
                        <span
                          class="material-icons text-sm"
                          :class="teacherPasswordRules.hasNumber ? 'text-emerald-600' : 'text-slate-300'"
                        >
                          {{ teacherPasswordRules.hasNumber ? 'check_circle' : 'radio_button_unchecked' }}
                        </span>
                        <span>Mengandung angka (0-9)</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-100">
                  <p class="text-[11px] text-slate-400 flex items-center gap-1">
                    <span class="material-icons text-xs text-amber-500">lightbulb</span>
                    <span>Jika suatu saat Anda lupa password, Administrator Sekolah dapat membantu mereset password akun Anda.</span>
                  </p>
                  <Button
                    type="submit"
                    variant="default"
                    size="sm"
                    :loading="isChangingTeacherPass"
                    :disabled="!isTeacherPasswordValid"
                    class="shrink-0 font-bold shadow-2xs"
                  >
                    Perbarui Password Akun
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>

      <!-- Modal Preview Lampiran Surat Guru -->
      <div
        v-if="isPreviewModalOpen"
        class="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
        @click.self="closePreviewModal"
      >
        <div class="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div class="p-4 border-b border-slate-100 flex items-center justify-between">
            <h4 class="text-sm font-bold text-slate-800">Lampiran Surat Izin - {{ previewStudentName }}</h4>
            <button
              @click="closePreviewModal"
              class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-sm cursor-pointer"
            >
              &times;
            </button>
          </div>
          <div class="p-4 bg-slate-950 flex items-center justify-center max-h-[70vh] overflow-auto">
            <img :src="previewModalImage" alt="Bukti Surat Dokter" class="max-w-full max-h-[60vh] object-contain rounded" />
          </div>
          <div class="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
            <Button size="sm" variant="outline" @click="closePreviewModal">Tutup</Button>
          </div>
        </div>
      </div>

      <!-- Modal Preview & Verifikasi Foto Selfie Presensi Siswa -->
      <div
        v-if="isSelfieModalOpen"
        class="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
        @click.self="closeSelfieModal"
      >
        <div class="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div class="p-4 border-b border-slate-100 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="material-icons text-blue-600 text-lg">verified_user</span>
              <h4 class="text-sm font-bold text-slate-800">Verifikasi Foto Kehadiran Siswa</h4>
            </div>
            <button
              @click="closeSelfieModal"
              class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-sm cursor-pointer"
            >
              &times;
            </button>
          </div>

          <div class="p-5 space-y-4">
            <!-- Student Header Meta -->
            <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
              <div>
                <p class="font-bold text-slate-900 text-sm">{{ selectedSelfieStudent?.nama_lengkap }}</p>
                <p class="text-slate-500 mt-0.5">NISN: <span class="font-mono font-medium">{{ selectedSelfieStudent?.nomor_induk }}</span> &bull; Kelas: {{ selectedSelfieStudent?.kelas }}</p>
              </div>
              <Badge :status="selectedSelfieAttendance?.status || 'hadir'" />
            </div>

            <!-- Perbandingan Wajah: Master Profil vs Selfie Presensi -->
            <div class="grid grid-cols-2 gap-3.5">
              <!-- Kolom 1: Foto Profil Master -->
              <div class="p-3 rounded-xl border border-slate-200 bg-white flex flex-col items-center text-center">
                <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Foto Resmi Master</span>
                <img
                  v-if="selectedSelfieStudent?.foto_profil_url"
                  :src="selectedSelfieStudent.foto_profil_url"
                  alt="Foto Profil Siswa"
                  class="w-24 h-28 sm:w-28 sm:h-32 rounded-lg object-cover border border-slate-300 shadow-2xs"
                />
                <div
                  v-else
                  class="w-24 h-28 sm:w-28 sm:h-32 rounded-lg bg-blue-600 text-white font-bold text-xl flex items-center justify-center border border-blue-700 shadow-2xs select-none"
                >
                  {{ getInitials(selectedSelfieStudent?.nama_lengkap) }}
                </div>
                <p class="text-[10px] text-slate-400 mt-2">Database Profil</p>
              </div>

              <!-- Kolom 2: Foto Selfie Kehadiran Realtime -->
              <div class="p-3 rounded-xl border border-blue-200 bg-blue-50/30 flex flex-col items-center text-center">
                <span class="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-2">Selfie Saat Presensi</span>
                <img
                  v-if="selectedSelfieAttendance?.foto_masuk_url"
                  :src="selectedSelfieAttendance.foto_masuk_url"
                  alt="Selfie Presensi"
                  class="w-24 h-28 sm:w-28 sm:h-32 rounded-lg object-cover border-2 border-blue-400 shadow-2xs"
                />
                <div
                  v-else
                  class="w-24 h-28 sm:w-28 sm:h-32 rounded-lg bg-slate-200 text-slate-500 font-medium text-xs flex items-center justify-center border border-slate-300 shadow-2xs p-2"
                >
                  Tidak Ada Foto
                </div>
                <p class="text-[10px] text-emerald-700 font-semibold mt-2 font-mono">
                  {{ selectedSelfieAttendance?.jam_masuk ? `${selectedSelfieAttendance.jam_masuk} WIB` : '-' }}
                </p>
              </div>
            </div>

            <!-- Detail Presensi & Lokasi GPS -->
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-slate-500">Metode Presensi:</span>
                <span class="font-semibold text-slate-800">{{ getMetodeLabel(selectedSelfieAttendance?.metode_presensi) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-500">Waktu Presensi:</span>
                <span class="font-mono font-bold text-slate-800">{{ selectedSelfieAttendance?.tanggal }} {{ selectedSelfieAttendance?.jam_masuk || '-' }}</span>
              </div>
              <div v-if="selectedSelfieAttendance?.jarak_masuk_meter !== undefined && selectedSelfieAttendance?.jarak_masuk_meter !== null" class="flex items-center justify-between">
                <span class="text-slate-500">Jarak ke Titik GPS:</span>
                <span class="font-mono font-semibold text-emerald-700">{{ selectedSelfieAttendance.jarak_masuk_meter }} meter</span>
              </div>
            </div>
          </div>

          <div class="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
            <Button size="sm" variant="outline" @click="closeSelfieModal">Tutup</Button>
          </div>
        </div>
      </div>
      <!-- Mobile Detail Bottom Sheet: Siswa Presensi -->
      <MobileDetailSheet
        v-model:open="isStudentSheetOpen"
        :title="selectedStudentDetail?.nama_lengkap || 'Detail Siswa'"
        :subtitle="`NISN: ${selectedStudentDetail?.nomor_induk || ''} • Kelas ${selectedClass}`"
      >
        <div v-if="selectedStudentDetail" class="space-y-4">
          <!-- Student Mini Card -->
          <div class="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <img
              v-if="selectedStudentDetail.foto_profil_url"
              :src="selectedStudentDetail.foto_profil_url"
              class="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-2xs"
            />
            <div
              v-else
              class="w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shrink-0 border border-blue-700 shadow-2xs"
            >
              {{ getInitials(selectedStudentDetail.nama_lengkap) }}
            </div>
            <div class="min-w-0 flex-1">
              <h4 class="font-bold text-slate-900 text-sm truncate">{{ selectedStudentDetail.nama_lengkap }}</h4>
              <p class="text-xs text-slate-500 font-mono mt-0.5">{{ selectedStudentDetail.nomor_induk }}</p>
              <div class="mt-1 flex items-center gap-2">
                <span class="text-[11px] text-slate-500">Status saat ini:</span>
                <Badge :status="getStudentStatus(selectedStudentDetail.id)" />
              </div>
            </div>
          </div>

          <!-- Informasi Surat Izin / Sakit Terverifikasi Jika Ada -->
          <div
            v-if="getStudentApprovedPermit(selectedStudentDetail.id)"
            class="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs space-y-1 text-blue-900"
          >
            <div class="font-bold flex items-center gap-1.5">
              <span class="material-icons text-sm text-blue-600">verified</span>
              <span>Dispensasi Disetujui ({{ getStudentApprovedPermit(selectedStudentDetail.id).jenis.toUpperCase() }})</span>
            </div>
            <p class="text-slate-600">
              {{ getStudentApprovedPermit(selectedStudentDetail.id).keterangan || 'Dispensasi izin/sakit telah disetujui di sistem.' }}
            </p>
          </div>

          <!-- Quick Action Buttons: Ubah Status Presensi -->
          <div class="space-y-2">
            <label class="block text-xs font-bold text-slate-700">Ubah Status Kehadiran:</label>
            <div class="grid grid-cols-3 gap-2">
              <button
                type="button"
                @click="updateStudentStatus(selectedStudentDetail, 'hadir')"
                :class="['py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1', getStudentStatus(selectedStudentDetail.id) === 'hadir' ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100']"
              >
                <span class="material-icons text-sm">check_circle</span>
                <span>Hadir</span>
              </button>
              <button
                type="button"
                @click="updateStudentStatus(selectedStudentDetail, 'terlambat')"
                :class="['py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1', getStudentStatus(selectedStudentDetail.id) === 'terlambat' ? 'bg-amber-600 text-white border-amber-600 shadow-xs' : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100']"
              >
                <span class="material-icons text-sm">schedule</span>
                <span>Telat</span>
              </button>
              <button
                type="button"
                @click="updateStudentStatus(selectedStudentDetail, 'izin')"
                :class="['py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1', getStudentStatus(selectedStudentDetail.id) === 'izin' ? 'bg-blue-600 text-white border-blue-600 shadow-xs' : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100']"
              >
                <span class="material-icons text-sm">assignment</span>
                <span>Izin</span>
              </button>
              <button
                type="button"
                @click="updateStudentStatus(selectedStudentDetail, 'sakit')"
                :class="['py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1', getStudentStatus(selectedStudentDetail.id) === 'sakit' ? 'bg-purple-600 text-white border-purple-600 shadow-xs' : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100']"
              >
                <span class="material-icons text-sm">healing</span>
                <span>Sakit</span>
              </button>
              <button
                type="button"
                @click="updateStudentStatus(selectedStudentDetail, 'alpa')"
                :class="['py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1', getStudentStatus(selectedStudentDetail.id) === 'alpa' ? 'bg-rose-600 text-white border-rose-600 shadow-xs' : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100']"
              >
                <span class="material-icons text-sm">cancel</span>
                <span>Alpa</span>
              </button>
              <button
                type="button"
                v-if="getStudentAttendance(selectedStudentDetail.id)?.foto_masuk_url"
                @click="openSelfieModal(selectedStudentDetail, getStudentAttendance(selectedStudentDetail.id))"
                class="py-2 px-2 rounded-xl text-xs font-bold border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <span class="material-icons text-sm">face</span>
                <span>Selfie</span>
              </button>
            </div>
          </div>

          <!-- Attendance Info Details -->
          <div v-if="getStudentAttendance(selectedStudentDetail.id)" class="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Jam Masuk:</span>
              <span class="font-mono font-bold text-slate-800">{{ getStudentAttendance(selectedStudentDetail.id).jam_masuk || '-' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Metode Presensi:</span>
              <span class="font-semibold text-slate-800">{{ getStudentAttendance(selectedStudentDetail.id).metode_presensi }}</span>
            </div>
            <div v-if="getStudentAttendance(selectedStudentDetail.id).jarak_masuk_meter" class="flex items-center justify-between">
              <span class="text-slate-500">Jarak Lokasi GPS:</span>
              <span class="font-mono font-bold text-blue-600">{{ getStudentAttendance(selectedStudentDetail.id).jarak_masuk_meter }} meter</span>
            </div>
          </div>
        </div>
      </MobileDetailSheet>

      <!-- Floating Sticky Save Changes Bar (Otomatis Muncul Saat Ada Perubahan Status) -->
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="translate-y-12 opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="translate-y-12 opacity-0"
      >
        <div
          v-if="hasPendingChanges && activeTab === 'manual'"
          class="fixed bottom-20 md:bottom-6 left-3 right-3 md:left-auto md:right-8 z-40 bg-slate-900/95 backdrop-blur-md text-white p-3 px-4 rounded-2xl shadow-2xl border border-slate-700 flex items-center justify-between gap-3 max-w-md ml-auto animate-in fade-in slide-in-from-bottom-4"
        >
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0"></span>
            <span class="text-xs font-semibold text-slate-200 truncate">
              <strong class="text-white">{{ pendingChangesCount }}</strong> perubahan belum disimpan
            </span>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button
              type="button"
              @click="cancelPendingChanges"
              class="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <Button
              size="sm"
              variant="default"
              @click="savePendingChanges"
              class="h-8 px-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 flex items-center gap-1 rounded-xl cursor-pointer"
            >
              <span class="material-icons text-sm">check</span>
              <span>Simpan Perubahan</span>
            </Button>
          </div>
        </div>
      </transition>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount, watch } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'
import XLSX from 'xlsx-js-style'
import { useAuthStore } from '../stores/auth'
import { useAttendanceStore } from '../stores/attendance'
import Navbar from '../components/Navbar.vue'
import AppSidebar from '../components/AppSidebar.vue'
import MobileDrawer from '../components/MobileDrawer.vue'
import MobileBottomNav from '../components/MobileBottomNav.vue'
import MobileListItem from '../components/mobile/MobileListItem.vue'
import MobileDetailSheet from '../components/mobile/MobileDetailSheet.vue'
import Card from '../components/ui/Card.vue'
import Button from '../components/ui/Button.vue'
import Badge from '../components/ui/Badge.vue'
import CustomDropdown from '../components/ui/CustomDropdown.vue'
import { compressImageFile } from '../utils/imageCompressor'
import { getInitials } from '../utils/avatar'

const authStore = useAuthStore()
const attendanceStore = useAttendanceStore()

const activeTab = ref(localStorage.getItem('presensi_tab_guru') || 'scan')
watch(activeTab, async (tab) => {
  localStorage.setItem('presensi_tab_guru', tab)
  if (tab !== 'scan') {
    await stopScanner()
  }
})

// State untuk Mobile Drawer & Detail Bottom Sheet
const isDrawerOpen = ref(false)
const isStudentSheetOpen = ref(false)
const selectedStudentDetail = ref(null)

function openStudentSheet(std) {
  selectedStudentDetail.value = std
  isStudentSheetOpen.value = true
}

// Sidebar & Bottom Nav items untuk Guru
const navItems = computed(() => [
  { key: 'scan', icon: 'qr_code_scanner', label: 'Scan QR' },
  { key: 'manual', icon: 'fact_check', label: 'Jurnal' },
  { key: 'verifikasi', icon: 'assignment', label: 'Izin', badge: pendingPermits.value.length },
  { key: 'jadwal', icon: 'schedule', label: 'Jadwal' },
  { key: 'profil', icon: 'person', label: 'Profil' },
])

// Data Profil Guru yang Sedang Login
const currentTeacher = computed(() => {
  return attendanceStore.teachers.find(t => 
    t.id === authStore.user?.id || 
    t.email === authStore.user?.email || 
    t.nomor_induk === authStore.user?.nomor_induk
  ) || authStore.user || {}
})

// Alokasi Kelas yang Diampu Guru Ini (Isolasi Hak Akses)
const teacherClasses = computed(() => {
  return currentTeacher.value?.kelas_diajar?.length ? currentTeacher.value.kelas_diajar : ['12-RPL-1']
})

const savedClass = localStorage.getItem('presensi_guru_selected_class')
const selectedClass = ref(savedClass && teacherClasses.value.includes(savedClass) ? savedClass : (teacherClasses.value[0] || '12-RPL-1'))

const teacherClassOptions = computed(() => {
  return teacherClasses.value.map(cls => ({
    value: cls,
    label: cls,
    icon: 'school',
    badge: `${getStudentsCountForClass(cls)} siswa`
  }))
})

const permitClassFilterOptions = computed(() => [
  { value: '', label: 'Semua Kelas', icon: 'apps', badge: teacherClasses.value.length },
  ...teacherClasses.value.map(cls => ({
    value: cls,
    label: `Kelas ${cls}`,
    icon: 'school',
    badge: `${getStudentsCountForClass(cls)} siswa`
  }))
])

const scheduleClassFilterOptions = computed(() => [
  { value: 'ALL', label: 'Semua Kelas', icon: 'apps', badge: teacherClasses.value.length },
  ...teacherClasses.value.map(cls => ({
    value: cls,
    label: `Kelas ${cls}`,
    icon: 'school',
    badge: `${getStudentsCountForClass(cls)} siswa`
  }))
])

function selectClass(cls) {
  selectedClass.value = cls
}

// Pastikan selectedClass selalu berada dalam alokasi kelas guru
watch(teacherClasses, (newClasses) => {
  if (newClasses && newClasses.length && !newClasses.includes(selectedClass.value)) {
    selectedClass.value = newClasses[0]
  }
}, { immediate: true })

// Daftar Siswa yang HANYA berasal dari kelas yang dipilih guru
const classStudents = computed(() => {
  return attendanceStore.students.filter(s => s.kelas === selectedClass.value)
})

// State Proteksi, Tanggal & Filter Tab Presensi & Jurnal Kelas
const requireConfirm = ref(true)
const statusFilter = ref('all') // 'all', 'alpa', 'hadir', 'terlambat', 'izin_sakit'
const statusUpdateNotice = ref('')

// Format Tanggal Hari Ini (Waktu Lokal Komputer)
function getTodayDateString() {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Tanggal Presensi yang Dipilih (Default: Hari Ini)
const selectedDate = ref(getTodayDateString())

const isTodaySelected = computed(() => {
  return selectedDate.value === getTodayDateString()
})

function setTodayDate() {
  selectedDate.value = getTodayDateString()
}

// State Perubahan Presensi yang Belum Disimpan (Staged / Pending Changes)
// Format: { [studentId]: { student, newStatus, previousStatus } }
const pendingChanges = ref({})

const pendingChangesCount = computed(() => Object.keys(pendingChanges.value).length)
const hasPendingChanges = computed(() => pendingChangesCount.value > 0)

function isStudentPending(studentId) {
  return !!pendingChanges.value[studentId]
}

// Helper Deteksi Permohonan Izin / Sakit yang Telah Disetujui (Opsi 3)
function getStudentApprovedPermit(studentId) {
  const targetDate = selectedDate.value
  return attendanceStore.leaveRequests.find(l => 
    l.user_id === studentId &&
    l.status === 'approved' &&
    l.tanggal_mulai <= targetDate &&
    (l.tanggal_selesai ? l.tanggal_selesai >= targetDate : l.tanggal_mulai === targetDate)
  )
}

// Ambil Status Murni Tanpa Pending (Kombinasi Database Presensi + Surat Izin ACC)
function getStudentStatusWithoutPending(studentId) {
  const att = getStudentAttendance(studentId)
  if (att?.status) return att.status
  // Integrasi Otomatis Opsi 3: Jika siswa memiliki permohonan izin/sakit yang sudah di-ACC untuk tanggal ini
  const permit = getStudentApprovedPermit(studentId)
  if (permit) {
    return permit.jenis === 'sakit' ? 'sakit' : 'izin'
  }
  return 'alpa'
}

function updateStudentStatus(student, status) {
  const currentActual = getStudentStatusWithoutPending(student.id)
  if (status === currentActual) {
    // Jika dikembalikan ke status aslinya, batalkan pending untuk siswa ini
    const copy = { ...pendingChanges.value }
    delete copy[student.id]
    pendingChanges.value = copy
  } else {
    pendingChanges.value = {
      ...pendingChanges.value,
      [student.id]: {
        student,
        newStatus: status,
        previousStatus: currentActual
      }
    }
  }
}

function cancelPendingChanges() {
  pendingChanges.value = {}
}

async function savePendingChanges() {
  const count = pendingChangesCount.value
  if (count === 0) return

  const teacher = currentTeacher.value || authStore.user
  const targetDate = selectedDate.value
  const targetTime = sessionJamMasuk.value || '07:00'

  for (const studentId in pendingChanges.value) {
    const item = pendingChanges.value[studentId]
    attendanceStore.setManualAttendance(
      item.student,
      item.newStatus,
      teacher,
      targetTime,
      targetDate,
      selectedSubject.value
    )
  }

  pendingChanges.value = {}
  statusUpdateNotice.value = `Berhasil menyimpan perubahan presensi untuk ${count} siswa pada mapel ${selectedSubject.value || 'Umum'}!`
  setTimeout(() => {
    statusUpdateNotice.value = ''
  }, 4000)
}

function formatTanggalIndo(dateStr) {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  } catch (e) {
    return dateStr
  }
}

function formatShortDate(dateStr) {
  if (!dateStr) return '-'
  const parts = dateStr.split('-')
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }
  return dateStr
}

// Search & Filter di Presensi & Jurnal Siswa
const manualSearchQuery = ref('')

// Mata Pelajaran Sesi Aktif (Dukungan Presensi Per Mapel & Persistent State)
const savedSubject = localStorage.getItem('presensi_guru_selected_subject')
const selectedSubject = ref(savedSubject || '')

// Helper Ringkasan Presensi KPI Kelas yang Dipilih (Sesuai Tanggal & Mata Pelajaran yang Dipilih)
function getStudentAttendance(studentId) {
  return attendanceStore.todayAttendances.find(a => 
    a.user_id === studentId && 
    (a.tanggal === selectedDate.value || (!a.tanggal && isTodaySelected.value)) &&
    (!a.mata_pelajaran || !selectedSubject.value || a.mata_pelajaran === selectedSubject.value)
  )
}

// Ambil Status Siswa (Memprioritaskan Perubahan Staged yang Belum Disimpan, lalu status tersimpan / izin ACC)
function getStudentStatus(studentId) {
  if (pendingChanges.value[studentId]) {
    return pendingChanges.value[studentId].newStatus
  }
  return getStudentStatusWithoutPending(studentId)
}

const filteredClassStudents = computed(() => {
  let list = classStudents.value

  // 1. Filter Status Kehadiran
  if (statusFilter.value === 'alpa') {
    list = list.filter(s => getStudentStatus(s.id) === 'alpa')
  } else if (statusFilter.value === 'hadir') {
    list = list.filter(s => getStudentStatus(s.id) === 'hadir')
  } else if (statusFilter.value === 'terlambat') {
    list = list.filter(s => getStudentStatus(s.id) === 'terlambat')
  } else if (statusFilter.value === 'izin_sakit') {
    list = list.filter(s => getStudentStatus(s.id) === 'izin' || getStudentStatus(s.id) === 'sakit')
  }

  // 2. Filter Search Nama atau NISN
  const q = manualSearchQuery.value.trim().toLowerCase()
  if (!q) return list
  return list.filter(s =>
    s.nama_lengkap.toLowerCase().includes(q) ||
    s.nomor_induk.includes(q)
  )
})

function countClassStatus(status) {
  return classStudents.value.filter(s => getStudentStatus(s.id) === status).length
}

const countClassAlpa = computed(() => {
  return classStudents.value.filter(s => getStudentStatus(s.id) === 'alpa').length
})

function formatSubjects(val) {
  if (!val) return ['Umum']
  if (Array.isArray(val)) return val
  return String(val)
    .split(/[,;/]/)
    .map(s => s.trim())
    .filter(Boolean)
}

// Jam Masuk Sesi Guru (Dinamis Sesuai Kelas Aktif yang Dipilih)
const sessionJamMasuk = ref('07:00')
const sessionJamTerlambat = ref('07:15')
const sessionJamPulang = ref('15:00')

// Pengaturan Jadwal Jam Masuk & Mata Pelajaran Per Kelas (Dikelola Langsung per Kelas Binaan)
const classScheduleForms = ref({})

const teacherSubjectDropdownOptions = computed(() => {
  const subs = formatSubjects(currentTeacher.value?.mata_pelajaran)
  return subs.map(s => ({
    value: s,
    label: s,
    icon: 'menu_book'
  }))
})

function getClassSubject(cls) {
  const sched = currentTeacher.value?.jadwal_kelas?.[cls]
  if (sched?.mata_pelajaran) return sched.mata_pelajaran
  const subjects = formatSubjects(currentTeacher.value?.mata_pelajaran)
  return subjects[0] || 'Umum'
}

function getClassScheduleDisplay(cls) {
  const sched = currentTeacher.value?.jadwal_kelas?.[cls]
  const defaultSubject = formatSubjects(currentTeacher.value?.mata_pelajaran)[0] || 'Umum'
  return {
    jam_masuk: sched?.jam_masuk || currentTeacher.value?.jam_masuk_default || '07:00',
    jam_terlambat: sched?.jam_terlambat || currentTeacher.value?.jam_terlambat_default || '07:15',
    jam_pulang: sched?.jam_pulang || currentTeacher.value?.jam_pulang_default || '15:00',
    mata_pelajaran: sched?.mata_pelajaran || defaultSubject
  }
}

function initClassScheduleForms() {
  const forms = {}
  teacherClasses.value.forEach(cls => {
    forms[cls] = { ...getClassScheduleDisplay(cls) }
  })
  classScheduleForms.value = forms
}

watch(teacherClasses, () => {
  initClassScheduleForms()
}, { immediate: true })

watch(currentTeacher, () => {
  initClassScheduleForms()
}, { deep: true })

// Sinkronkan jam sesi & mapel saat selectedClass berubah (dan simpan state)
watch(selectedClass, (newClass) => {
  pendingChanges.value = {}
  if (newClass) {
    localStorage.setItem('presensi_guru_selected_class', newClass)
  }
  const sched = getClassScheduleDisplay(newClass)
  sessionJamMasuk.value = sched.jam_masuk
  sessionJamTerlambat.value = sched.jam_terlambat
  sessionJamPulang.value = sched.jam_pulang

  const validSubjects = formatSubjects(currentTeacher.value?.mata_pelajaran)
  const storedSubject = localStorage.getItem('presensi_guru_selected_subject')
  if (storedSubject && validSubjects.includes(storedSubject)) {
    selectedSubject.value = storedSubject
  } else if (!selectedSubject.value || !validSubjects.includes(selectedSubject.value)) {
    selectedSubject.value = sched.mata_pelajaran || validSubjects[0] || 'Umum'
  }
}, { immediate: true })

watch(selectedSubject, (newSub) => {
  pendingChanges.value = {}
  if (newSub) {
    localStorage.setItem('presensi_guru_selected_subject', newSub)
  }
})

watch(selectedDate, () => {
  pendingChanges.value = {}
})

// Filter & Pencarian Kelas pada Tab Jadwal Mengajar (Praktis bila guru mengampu banyak kelas)
const scheduleClassFilter = ref('ALL')
const scheduleSearchQuery = ref('')

const filteredTeacherClasses = computed(() => {
  let list = teacherClasses.value || []
  if (scheduleClassFilter.value && scheduleClassFilter.value !== 'ALL') {
    list = list.filter(cls => cls === scheduleClassFilter.value)
  }
  if (scheduleSearchQuery.value && scheduleSearchQuery.value.trim()) {
    const q = scheduleSearchQuery.value.trim().toLowerCase()
    list = list.filter(cls => cls.toLowerCase().includes(q))
  }
  return list
})

const savedScheduleStatus = ref({})

function saveScheduleForClass(cls) {
  if (!currentTeacher.value?.id) return
  const form = classScheduleForms.value[cls] || getClassScheduleDisplay(cls)
  attendanceStore.updateTeacherSchedule(
    currentTeacher.value.id,
    {
      jam_masuk: form.jam_masuk,
      jam_terlambat: form.jam_terlambat,
      jam_pulang: form.jam_pulang,
      mata_pelajaran: form.mata_pelajaran
    },
    cls
  )
  if (selectedClass.value === cls) {
    sessionJamMasuk.value = form.jam_masuk
    sessionJamTerlambat.value = form.jam_terlambat
    sessionJamPulang.value = form.jam_pulang
  }
  savedScheduleStatus.value[cls] = true
  setTimeout(() => {
    savedScheduleStatus.value[cls] = false
  }, 2200)
}

// Export Rekap Tiap Kelas yang Diajar ke Excel (.xlsx) dengan Format Cantik, Warna, Metadata Periode, & Auto-Fit
function exportClassToExcel() {
  const targetDateStr = selectedDate.value || new Date().toISOString().split('T')[0]
  
  // Format tanggal periode dalam Bahasa Indonesia
  let formattedPeriod = targetDateStr
  try {
    const d = new Date(targetDateStr + 'T00:00:00')
    formattedPeriod = d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  } catch (e) {}

  const exportTimestamp = new Date().toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })

  const teacherName = (currentTeacher.value?.nama_lengkap || authStore.user?.nama_lengkap || '-').toUpperCase()
  const teacherNip = currentTeacher.value?.nomor_induk || authStore.user?.nomor_induk || '-'
  const subjectName = (selectedSubject.value || getClassSubject(selectedClass.value) || currentTeacher.value?.mata_pelajaran || 'MATA PELAJARAN UMUM').toUpperCase()
  const schoolName = (attendanceStore.schoolSettings?.nama_sekolah || 'SMK TEKNOLOGI UNGGULAN').toUpperCase()

  // Hitung ringkasan status kelas
  let countHadir = 0, countTelat = 0, countIzin = 0, countSakit = 0, countAlpa = 0
  classStudents.value.forEach(std => {
    const st = getStudentAttendance(std.id)?.status || 'alpa'
    if (st === 'hadir') countHadir++
    else if (st === 'terlambat') countTelat++
    else if (st === 'izin') countIzin++
    else if (st === 'sakit') countSakit++
    else countAlpa++
  })

  // 1. Susun Array of Arrays (AOA)
  const aoa = [
    // Row 0: Banner Judul Utama
    ['LAPORAN PRESENSI & JURNAL KEHADIRAN SISWA'],
    // Row 1: Sub-banner Sekolah
    [`${schoolName} • SISTEM PRESENSI RESMI GEOFENCING GPS & QR CODE`],
    // Row 2: Spacer
    [],
    // Row 3: Metadata Row 1
    ['PERIODE / TANGGAL PRESENSI', formattedPeriod + ' (' + targetDateStr + ')', '', 'KELAS DIAJAR', selectedClass.value],
    // Row 4: Metadata Row 2
    ['GURU PENGAJAR', `${teacherName} (NIP: ${teacherNip})`, '', 'MATA PELAJARAN', subjectName],
    // Row 5: Metadata Row 3
    ['WAKTU EXPORT LAPORAN', `${exportTimestamp} WIB`, '', 'TOTAL SISWA KELAS', `${classStudents.value.length} SISWA`],
    // Row 6: Metadata Row 4 (Ringkasan Kehadiran)
    ['RINGKASAN KEHADIRAN', `Hadir: ${countHadir} | Telat: ${countTelat} | Izin: ${countIzin} | Sakit: ${countSakit} | Alpa: ${countAlpa}`, '', 'STATUS DATA', 'FINAL TERSIMPAN'],
    // Row 7: Spacer
    [],
    // Row 8: Header Tabel Kolom (Semua UPPERCASE)
    [
      'NO',
      'TANGGAL',
      'NISN',
      'NAMA LENGKAP SISWA',
      'KELAS',
      'JAM MASUK',
      'JAM PULANG',
      'STATUS KEHADIRAN',
      'METODE PRESENSI',
      'GURU PENGAJAR',
      'MATA PELAJARAN'
    ]
  ]

  // Data Baris Presensi Siswa
  classStudents.value.forEach((student, idx) => {
    const att = getStudentAttendance(student.id)
    aoa.push([
      idx + 1,
      att?.tanggal || targetDateStr,
      student.nomor_induk,
      student.nama_lengkap.toUpperCase(),
      student.kelas,
      att?.jam_masuk || '-',
      att?.jam_pulang || '-',
      (att?.status || 'alpa').toUpperCase(),
      (att?.metode_presensi || '-').toUpperCase(),
      teacherName,
      subjectName
    ])
  })

  // 2. Buat Worksheet (100% BEBAS MERGED CELL - Aman untuk sorting & filtering Excel)
  const ws = XLSX.utils.aoa_to_sheet(aoa)

  // 3. Styling Lengkap Menggunakan xlsx-js-style
  // Style Title Row (A1)
  if (ws['A1']) {
    ws['A1'].s = {
      font: { name: 'Segoe UI', sz: 13, bold: true, color: { rgb: '1E3A8A' } },
      alignment: { horizontal: 'left', vertical: 'center' }
    }
  }

  // Style Subtitle Row (A2)
  if (ws['A2']) {
    ws['A2'].s = {
      font: { name: 'Segoe UI', sz: 9.5, bold: true, color: { rgb: '2563EB' } },
      alignment: { horizontal: 'left', vertical: 'center' }
    }
  }

  // Style Metadata (Rows 3..6: Index Baris 4 s/d 7 di Excel)
  // Dibuat bersih tanpa border/fill kotak, persis tampilan natural spreadsheet
  for (let r = 3; r <= 6; r++) {
    for (let c = 0; c <= 4; c++) {
      const cellRef = XLSX.utils.encode_cell({ r, c })
      if (!ws[cellRef]) continue

      const isLabel = (c === 0 || c === 3)
      ws[cellRef].s = {
        font: {
          name: 'Segoe UI',
          sz: 9,
          bold: isLabel,
          color: { rgb: isLabel ? '0F172A' : '334155' }
        },
        alignment: { horizontal: 'left', vertical: 'center' }
      }
    }
  }

  // Style Table Header Row (Row 8, index 8 = Baris 9 di Excel)
  for (let c = 0; c <= 10; c++) {
    const cellRef = XLSX.utils.encode_cell({ r: 8, c })
    if (ws[cellRef]) {
      ws[cellRef].s = {
        fill: { fgColor: { rgb: '2563EB' } }, // Royal Blue
        font: { name: 'Segoe UI', sz: 10, bold: true, color: { rgb: 'FFFFFF' } },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: {
          top: { style: 'medium', color: { rgb: '1D4ED8' } },
          bottom: { style: 'medium', color: { rgb: '1D4ED8' } },
          left: { style: 'thin', color: { rgb: '60A5FA' } },
          right: { style: 'thin', color: { rgb: '60A5FA' } }
        }
      }
    }
  }

  // Style Data Rows (Rows 9.. = Baris 10+ di Excel)
  for (let r = 9; r < aoa.length; r++) {
    for (let c = 0; c <= 10; c++) {
      const cellRef = XLSX.utils.encode_cell({ r, c })
      if (!ws[cellRef]) continue

      // Default cell style dengan border tipis rapi
      const cellStyle = {
        font: { name: 'Segoe UI', sz: 9, color: { rgb: '1E293B' } },
        alignment: {
          horizontal: (c === 3 || c === 9 || c === 10) ? 'left' : 'center',
          vertical: 'center'
        },
        border: {
          top: { style: 'thin', color: { rgb: 'CBD5E1' } },
          bottom: { style: 'thin', color: { rgb: 'CBD5E1' } },
          left: { style: 'thin', color: { rgb: 'CBD5E1' } },
          right: { style: 'thin', color: { rgb: 'CBD5E1' } }
        }
      }

      // Khusus Kolom Status Kehadiran (c = 7): Beri warna badge elegan persis screenshot
      if (c === 7) {
        const val = String(ws[cellRef].v || '').toUpperCase()
        if (val === 'HADIR') {
          cellStyle.fill = { fgColor: { rgb: 'DCFCE7' } } // Light green badge
          cellStyle.font = { name: 'Segoe UI', sz: 9, bold: true, color: { rgb: '15803D' } }
        } else if (val === 'TERLAMBAT') {
          cellStyle.fill = { fgColor: { rgb: 'FEF3C7' } } // Light amber
          cellStyle.font = { name: 'Segoe UI', sz: 9, bold: true, color: { rgb: 'B45309' } }
        } else if (val === 'IZIN') {
          cellStyle.fill = { fgColor: { rgb: 'DBEAFE' } } // Light blue
          cellStyle.font = { name: 'Segoe UI', sz: 9, bold: true, color: { rgb: '1D4ED8' } }
        } else if (val === 'SAKIT') {
          cellStyle.fill = { fgColor: { rgb: 'F3E8FF' } } // Light purple
          cellStyle.font = { name: 'Segoe UI', sz: 9, bold: true, color: { rgb: '7E22CE' } }
        } else if (val === 'ALPA') {
          cellStyle.fill = { fgColor: { rgb: 'FFE4E6' } } // Light rose
          cellStyle.font = { name: 'Segoe UI', sz: 9, bold: true, color: { rgb: 'BE123C' } }
        }
      }

      // Format nama siswa (c = 3)
      if (c === 3) {
        cellStyle.font = { name: 'Segoe UI', sz: 9, bold: true, color: { rgb: '0F172A' } }
      }

      ws[cellRef].s = cellStyle
    }
  }

  // 5. Auto-Fit Columns (Presisi dan proporsional untuk semua kolom tanpa butuh merged cell)
  let maxStudentNameLen = 'NAMA LENGKAP SISWA'.length
  classStudents.value.forEach(s => {
    if (s.nama_lengkap && s.nama_lengkap.length > maxStudentNameLen) {
      maxStudentNameLen = s.nama_lengkap.length
    }
  })

  const summaryStr = `Hadir: ${countHadir} | Telat: ${countTelat} | Izin: ${countIzin} | Sakit: ${countSakit} | Alpa: ${countAlpa}`
  const colWidths = [
    { wch: 28 }, // Col A: NO (menampung label "PERIODE / TANGGAL PRESENSI" & "RINGKASAN KEHADIRAN")
    { wch: 40 }, // Col B: TANGGAL
    { wch: 14 }, // Col C: NISN
    { wch: Math.max(maxStudentNameLen + 4, 26) }, // Col D: NAMA LENGKAP SISWA & label kanan
    { wch: Math.max(subjectName.length + 4, 26) }, // Col E: KELAS & nama mapel
    { wch: 14 }, // Col F: JAM MASUK
    { wch: 14 }, // Col G: JAM PULANG
    { wch: 20 }, // Col H: STATUS KEHADIRAN
    { wch: 18 }, // Col I: METODE PRESENSI
    { wch: Math.max(teacherName.length + 4, 24) }, // Col J: GURU PENGAJAR
    { wch: Math.max(subjectName.length + 4, 28) }  // Col K: MATA PELAJARAN
  ]
  ws['!cols'] = colWidths

  // 6. Auto-Fit Rows (Tinggi Baris yang Proporsional & Rapi)
  const rowHeights = [
    { hpt: 30 }, // Row 0: Banner Judul Utama
    { hpt: 20 }, // Row 1: Subtitle Sekolah
    { hpt: 8 },  // Row 2: Spacer
    { hpt: 20 }, // Row 3: Metadata 1
    { hpt: 20 }, // Row 4: Metadata 2
    { hpt: 20 }, // Row 5: Metadata 3
    { hpt: 20 }, // Row 6: Metadata 4
    { hpt: 10 }, // Row 7: Spacer
    { hpt: 26 }  // Row 8: Table Header Kolom
  ]
  for (let i = 9; i < aoa.length; i++) {
    rowHeights.push({ hpt: 22 }) // Data rows
  }
  ws['!rows'] = rowHeights

  // 7. Simpan Workbook & Download File
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, `Presensi ${selectedClass.value}`)
  XLSX.writeFile(wb, `Laporan_Presensi_${selectedClass.value}_${targetDateStr}.xlsx`)
}

// Data & Handler Tab Profil Pendidik
const nipCopied = ref(false)

function copyNip() {
  if (currentTeacher.value?.nomor_induk) {
    navigator.clipboard.writeText(currentTeacher.value.nomor_induk)
    nipCopied.value = true
    setTimeout(() => {
      nipCopied.value = false
    }, 2000)
  }
}

function getStudentsCountForClass(className) {
  return attendanceStore.students.filter(s => s.kelas === className).length
}

function jumpToClassAttendance(className) {
  selectedClass.value = className
  activeTab.value = 'manual'
}

const editProfileForm = ref({
  nama_lengkap: '',
  foto_profil_url: ''
})

// Variabel Upload Foto Guru & Kuota 1x
const teacherPhotoInputRef = ref(null)
const teacherPhotoPreview = ref('')
const teacherPhotoFileName = ref('')
const teacherPhotoFileSize = ref('')
const isCompressingTeacherPhoto = ref(false)

const isTeacherPhotoLocked = computed(() => {
  return (currentTeacher.value?.foto_update_count || authStore.user?.foto_update_count || 0) >= 1
})

function triggerTeacherPhotoPicker() {
  if (isTeacherPhotoLocked.value) return
  if (teacherPhotoInputRef.value) {
    teacherPhotoInputRef.value.click()
  }
}

async function handleTeacherPhotoChange(event) {
  const file = event.target.files?.[0]
  if (!file) return

  try {
    isCompressingTeacherPhoto.value = true
    const compressed = await compressImageFile(file, 600, 600, 0.85)
    teacherPhotoPreview.value = compressed
    teacherPhotoFileName.value = file.name
    teacherPhotoFileSize.value = (file.size / 1024).toFixed(0) + ' KB'
    editProfileForm.value.foto_profil_url = compressed
  } catch (err) {
    alert(err.message || 'Gagal memproses file foto.')
  } finally {
    isCompressingTeacherPhoto.value = false
  }
}

function clearTeacherPhotoSelection() {
  teacherPhotoPreview.value = ''
  teacherPhotoFileName.value = ''
  teacherPhotoFileSize.value = ''
  editProfileForm.value.foto_profil_url = currentTeacher.value?.foto_profil_url || authStore.user?.foto_profil_url || ''
  if (teacherPhotoInputRef.value) {
    teacherPhotoInputRef.value.value = ''
  }
}

watch(currentTeacher, (teacher) => {
  if (teacher) {
    editProfileForm.value.nama_lengkap = teacher.nama_lengkap || authStore.user?.nama_lengkap || ''
    editProfileForm.value.foto_profil_url = teacher.foto_profil_url || authStore.user?.foto_profil_url || ''
  }
}, { immediate: true })

function saveTeacherProfile() {
  if (!currentTeacher.value?.id) return

  if (isTeacherPhotoLocked.value) {
    alert('Data identitas dan foto profil Anda sudah terkunci secara resmi. Hubungi Administrator untuk bantuan perubahan data.')
    return
  }

  const hasNewPhoto = !!teacherPhotoPreview.value
  if (!hasNewPhoto) {
    alert('Silakan pilih berkas pas foto terlebih dahulu sebelum menyimpan.')
    return
  }

  const updatedData = {
    foto_profil_url: teacherPhotoPreview.value,
    foto_update_count: (currentTeacher.value.foto_update_count || authStore.user?.foto_update_count || 0) + 1
  }

  attendanceStore.updateTeacher(currentTeacher.value.id, updatedData)
  authStore.updateUserProfile(updatedData)

  alert('Pas foto resmi pendidik berhasil disimpan! Batas 1x kesempatan mandiri Anda kini telah terkunci.')
  teacherPhotoPreview.value = ''
}

// Logika Ganti Password Guru Mandiri dengan Check Rule
const showTeacherPass = ref(false)
const isChangingTeacherPass = ref(false)
const teacherPasswordForm = ref({
  newPassword: ''
})

const teacherPasswordRules = computed(() => {
  const p = teacherPasswordForm.value.newPassword || ''
  return {
    hasMinLength: p.length >= 6,
    hasLetter: /[a-zA-Z]/.test(p),
    hasNumber: /[0-9]/.test(p)
  }
})

const teacherPasswordScore = computed(() => {
  let score = 0
  if (teacherPasswordRules.value.hasMinLength) score++
  if (teacherPasswordRules.value.hasLetter) score++
  if (teacherPasswordRules.value.hasNumber) score++
  return score
})

const isTeacherPasswordValid = computed(() => {
  return teacherPasswordRules.value.hasMinLength &&
    teacherPasswordRules.value.hasLetter &&
    teacherPasswordRules.value.hasNumber
})

const teacherPasswordStrengthLabel = computed(() => {
  if (teacherPasswordScore.value === 3) return 'Kuat'
  if (teacherPasswordScore.value === 2) return 'Sedang'
  return 'Kurang Memenuhi'
})

const teacherPasswordStrengthTextClass = computed(() => {
  if (teacherPasswordScore.value === 3) return 'text-emerald-600'
  if (teacherPasswordScore.value === 2) return 'text-amber-600'
  return 'text-rose-600'
})

const teacherPasswordStrengthBarColor = computed(() => {
  if (teacherPasswordScore.value === 3) return 'bg-emerald-500'
  if (teacherPasswordScore.value === 2) return 'bg-amber-500'
  return 'bg-rose-500'
})

async function handleTeacherChangePassword() {
  if (!isTeacherPasswordValid.value) {
    alert('Harap penuhi semua syarat keamanan password sebelum menyimpan.')
    return
  }

  isChangingTeacherPass.value = true
  const res = await authStore.changeUserPassword(teacherPasswordForm.value.newPassword)
  isChangingTeacherPass.value = false

  if (res.success) {
    if (currentTeacher.value?.id) {
      attendanceStore.updateTeacher(currentTeacher.value.id, { password: teacherPasswordForm.value.newPassword })
    }
    alert('Password akun Anda berhasil diperbarui! Gunakan password baru ini saat masuk ke sistem selanjutnya.')
    teacherPasswordForm.value.newPassword = ''
  } else {
    alert(res.message || 'Gagal mengubah password.')
  }
}

// Map waktu jam masuk kustom per siswa
const studentCustomTime = ref({})

function getStudentCustomTime(studentId) {
  if (!studentCustomTime.value[studentId]) {
    const existing = getStudentAttendance(studentId)
    studentCustomTime.value[studentId] = existing?.jam_masuk ? existing.jam_masuk.substring(0, 5) : sessionJamMasuk.value
  }
  return studentCustomTime.value[studentId]
}

function setNowForStudent(studentId) {
  studentCustomTime.value[studentId] = new Date().toTimeString().split(' ')[0].substring(0, 5)
}

const isScanning = ref(false)
const manualToken = ref('')
const lastScannedStudent = ref(null)

// Lightbox modal variables
const isPreviewModalOpen = ref(false)
const previewModalImage = ref('')
const previewStudentName = ref('')

function openPreviewModal(url, studentName) {
  previewModalImage.value = url
  previewStudentName.value = studentName || 'Siswa'
  isPreviewModalOpen.value = true
}

function closePreviewModal() {
  isPreviewModalOpen.value = false
  previewModalImage.value = ''
  previewStudentName.value = ''
}

// Modal Preview & Verifikasi Foto Selfie Kehadiran Siswa
const isSelfieModalOpen = ref(false)
const selectedSelfieStudent = ref(null)
const selectedSelfieAttendance = ref(null)

function openSelfieModal(student, attendance) {
  selectedSelfieStudent.value = student
  selectedSelfieAttendance.value = attendance
  isSelfieModalOpen.value = true
}

function closeSelfieModal() {
  isSelfieModalOpen.value = false
  selectedSelfieStudent.value = null
  selectedSelfieAttendance.value = null
}

function getMetodeLabel(metode) {
  if (!metode) return '-'
  if (metode === 'mandiri_gps') return 'GPS Mandiri'
  if (metode === 'qr_guru') return 'QR Kartu'
  if (metode === 'manual_guru') return 'Manual Guru'
  return metode
}

let html5QrCode = null

// Filter Tab Verifikasi Permohonan Izin Siswa
const permitClassFilter = ref('')
const permitStatusFilter = ref('all') // 'all', 'pending', 'approved', 'rejected'
const permitSearchQuery = ref('')

// Semua izin dari kelas-kelas yang diampu oleh guru ini
const teacherLeaveRequests = computed(() => {
  return attendanceStore.leaveRequests.filter(l => teacherClasses.value.includes(l.kelas))
})

// Counter badge untuk navigasi tab Izin (hanya yang pending di kelas binaan guru)
const pendingPermits = computed(() => {
  return teacherLeaveRequests.value.filter(l => l.status === 'pending')
})

// Hasil filter permohonan izin berdasarkan kelas, status, dan pencarian nama
const filteredLeaveRequests = computed(() => {
  return teacherLeaveRequests.value.filter(item => {
    // 1. Filter Kelas
    const matchClass = permitClassFilter.value ? item.kelas === permitClassFilter.value : true

    // 2. Filter Status
    const matchStatus = permitStatusFilter.value === 'all' ? true : item.status === permitStatusFilter.value

    // 3. Filter Pencarian Nama Siswa / Keterangan
    const q = permitSearchQuery.value.trim().toLowerCase()
    const matchQuery = q
      ? (item.nama_lengkap.toLowerCase().includes(q) || (item.keterangan && item.keterangan.toLowerCase().includes(q)))
      : true

    return matchClass && matchStatus && matchQuery
  })
})

const recentScans = computed(() => {
  return attendanceStore.todayAttendances.filter(a => a.metode_presensi === 'qr_guru')
})

// 1. Start QR Scanner
async function startScanner() {
  isScanning.value = true
  try {
    html5QrCode = new Html5Qrcode('qr-reader')
    await html5QrCode.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 220, height: 220 } },
      async (decodedText) => {
        playBeep()
        await processScannedToken(decodedText)
      },
      (errorMessage) => {
        // ignore continuous frame scanning errors
      }
    )
  } catch (err) {
    isScanning.value = false
    alert('Gagal mengakses kamera scanner: ' + err)
  }
}

async function stopScanner() {
  if (html5QrCode) {
    try {
      if (html5QrCode.isScanning) {
        await html5QrCode.stop()
      }
    } catch (err) {
      console.warn('Error saat menghentikan html5QrCode:', err)
    } finally {
      try {
        html5QrCode.clear()
      } catch (e) {}
      html5QrCode = null
    }
  }
  isScanning.value = false
}

async function goToJournal() {
  await stopScanner()
  activeTab.value = 'manual'
}

async function cancelScanAndGoToJournal() {
  await goToJournal()
}

// State Cooldown & Feedback Pemindai Kartu untuk Continuous Next Scan
const isScanCooldown = ref(false)
const scanSuccessFlash = ref(false)
const lastScannedName = ref('')

async function processScannedToken(input) {
  if (!input) return
  if (isScanCooldown.value) return // Cegah trigger ganda jika kartu masih berada di depan lensa kamera

  const trimmed = input.trim()

  const student = attendanceStore.students.find(s => s.nomor_induk === trimmed || s.qr_token === trimmed)
  if (!student) {
    alert(`NISN atau Token "${trimmed}" tidak terdaftar di database siswa.`)
    return
  }

  // Validasi Alokasi Kelas: Cek apakah siswa ini diajar oleh guru yang sedang login
  if (!teacherClasses.value.includes(student.kelas)) {
    alert(`Akses Ditolak: Siswa ${student.nama_lengkap} berasal dari kelas ${student.kelas}, sedangkan alokasi kelas yang Anda ajar hanya: ${teacherClasses.value.join(', ')}.`)
    return
  }

  // Kunci cooldown agar tidak re-trigger dalam durasi standby
  isScanCooldown.value = true

  const tokenToUse = student.qr_token || trimmed
  const currentSub = selectedSubject.value
  const currentCls = selectedClass.value

  const res = await attendanceStore.scanStudentQr(tokenToUse, currentTeacher.value || authStore.user, currentSub)
  if (res.success) {
    lastScannedStudent.value = {
      nama: res.nama,
      nomor_induk: res.nomor_induk || student.nomor_induk,
      kelas: res.kelas || student.kelas,
      scanType: res.type,
      status: res.status,
      mata_pelajaran: res.mata_pelajaran || currentSub,
      foto_profil_url: student?.foto_profil_url
    }
    lastScannedName.value = res.nama
    scanSuccessFlash.value = true

    // Jaga konsistensi state dropdown agar tetap terkunci pada sesi kelas & mapel yang dipilih guru
    if (currentCls && selectedClass.value !== currentCls) {
      selectedClass.value = currentCls
    }
    if (currentSub && selectedSubject.value !== currentSub) {
      selectedSubject.value = currentSub
    }

    // Cooldown 1.5 detik: memberi waktu kartu diturunkan, lalu kamera langsung standby untuk siswa berikutnya (Next Scan)
    setTimeout(() => {
      isScanCooldown.value = false
      scanSuccessFlash.value = false
    }, 1500)
  } else {
    isScanCooldown.value = false
    alert(res.message)
  }
}

async function handleManualTokenSubmit() {
  if (!manualToken.value) return
  await processScannedToken(manualToken.value.trim())
  manualToken.value = ''
}

// Ubah Status Manual (Cukup Update Status, Ditampung di pendingChanges)
function setManualStatus(student, status) {
  updateStudentStatus(student, status)
}

// 1-Klik Tandai Semua Siswa di Kelas Ini Hadir (Kecuali yang Memiliki Surat ACC)
function setAllStudentsPresent() {
  if (!classStudents.value.length) {
    alert('Tidak ada siswa di kelas ini.')
    return
  }
  let markedCount = 0
  classStudents.value.forEach(std => {
    // Siswa yang memiliki surat sakit/izin terverifikasi (ACC) tidak akan tertimpa
    if (getStudentApprovedPermit(std.id)) {
      return
    }
    updateStudentStatus(std, 'hadir')
    markedCount++
  })
}

function approvePermit(item) {
  item.status = 'approved'
  const student = attendanceStore.students.find(s => s.id === item.user_id)
  if (student) {
    attendanceStore.setManualAttendance(student, item.jenis, currentTeacher.value || authStore.user, null, item.tanggal_mulai)
  }
  alert(`Izin ${item.nama_lengkap} (${item.kelas}) disetujui untuk tanggal ${item.tanggal_mulai}.`)
}

function rejectPermit(item) {
  item.status = 'rejected'
  alert(`Izin ${item.nama_lengkap} ditolak.`)
}

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(800, ctx.currentTime)
    osc.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.1)
  } catch (e) {
    // AudioContext might not be allowed without gesture
  }
}

onBeforeUnmount(() => {
  stopScanner()
})
</script>

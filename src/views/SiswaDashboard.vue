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
    <main class="flex-1 min-w-0 px-4 py-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto pb-20 md:pb-6">
      <!-- Greeting & Header Info -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div class="min-w-0">
          <h2 class="text-base sm:text-xl font-bold text-slate-900 leading-tight truncate">
            Halo, {{ authStore.user?.nama_lengkap }}!
          </h2>
          <p class="text-xs text-slate-500 mt-0.5">
            Kelas: <span class="font-semibold text-slate-800">{{ authStore.user?.kelas || '12-RPL-1' }}</span> &bull; NISN: {{ authStore.user?.nomor_induk }}
          </p>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <Badge :status="myAttendance?.status || 'default'" :label="myAttendance ? `Status: ${myAttendance.status.toUpperCase()}` : 'Belum Absen Hari Ini'" />
        </div>
      </div>

      <!-- TAB 1: PRESENSI MANDIRI (GPS + SELFIE + PETA) -->
      <div v-if="activeTab === 'presensi'" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Panel 1: Validasi Lokasi GPS & Peta -->
        <Card title="1. Deteksi Lokasi GPS" description="Pastikan Anda berada di lingkungan sekolah">
          <div class="space-y-4">
            <!-- Lokasi status box -->
            <div class="p-3.5 rounded-xl border flex items-center justify-between" :class="isWithinRadius ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : currentDistance !== null ? 'bg-rose-50/70 border-rose-200 text-rose-900' : 'bg-slate-50 border-slate-200 text-slate-700'">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center" :class="isWithinRadius ? 'bg-emerald-100 text-emerald-700' : currentDistance !== null ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-700'">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div>
                  <p class="text-xs font-semibold">
                    {{ isWithinRadius ? 'Dalam Radius Sekolah' : currentDistance !== null ? 'Di Luar Radius Sekolah' : 'GPS Belum Dideteksi' }}
                  </p>
                  <p class="text-[11px] text-slate-500">
                    {{ currentDistance !== null ? `Jarak ke sekolah: ${currentDistance} meter (Maks: ${attendanceStore.schoolSettings.radius_meter}m)` : 'Klik tombol di bawah untuk mendeteksi' }}
                  </p>
                </div>
              </div>
              <Button size="sm" variant="outline" @click="detectLocation" :loading="isLocating">
                Perbarui
              </Button>
            </div>

            <!-- Leaflet Map Container -->
            <div class="w-full h-48 rounded-xl border border-slate-200 overflow-hidden relative z-0 isolate" id="map-container">
              <div v-if="!userCoords" class="absolute inset-0 bg-slate-100 flex flex-col items-center justify-center p-4 text-center z-10">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-slate-400 mb-2 animate-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                <p class="text-xs font-medium text-slate-600">Tekan "Perbarui" untuk menampilkan peta & radius</p>
              </div>
            </div>

            <div class="flex items-center justify-between text-[11px] text-slate-500 px-1">
              <span>Titik Acuan: {{ attendanceStore.schoolSettings.latitude.toFixed(4) }}, {{ attendanceStore.schoolSettings.longitude.toFixed(4) }}</span>
              <span>Radius Toleransi: {{ attendanceStore.schoolSettings.radius_meter }}m</span>
            </div>
          </div>
        </Card>

        <!-- Panel 2: Kamera Selfie & Aksi Presensi -->
        <Card title="2. Foto Bukti Kehadiran (Selfie)" description="Sesuaikan mata pelajaran & ambil foto wajah langsung menggunakan kamera">
          <!-- Banner Highlight Sesi Mata Pelajaran (Semi-Otomatis Solid Bebas Gradasi) -->
          <div class="mb-4 p-3.5 rounded-xl border border-blue-200 bg-blue-50/70 space-y-2.5">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div class="flex items-center gap-2.5 min-w-0">
                <div class="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                  <span class="material-icons text-lg">menu_book</span>
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-blue-700">Sesi Mapel Presensi</span>
                    <span
                      v-if="isSubjectAutoDetected"
                      class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200"
                      title="Sistem mendeteksi jadwal jam saat ini secara otomatis"
                    >
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                      Otomatis Sesuai Jam
                    </span>
                    <span
                      v-else
                      class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200"
                    >
                      Pilihan Manual Siswa
                    </span>
                  </div>
                  <h4 class="font-bold text-slate-900 text-base leading-tight mt-0.5 truncate">
                    {{ selectedSubject || 'Memuat Jadwal Mapel...' }}
                  </h4>
                </div>
              </div>

              <!-- Tombol Reset Deteksi Jam Sekarang jika sebelumnya diubah manual -->
              <button
                v-if="!isSubjectAutoDetected"
                type="button"
                @click="detectCurrentSubject(true)"
                class="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:text-blue-900 bg-white hover:bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 transition cursor-pointer shadow-2xs"
                title="Deteksi ulang mata pelajaran sesuai jam sekarang"
              >
                <span class="material-icons text-xs">schedule</span>
                <span>Reset Jam Sekarang</span>
              </button>
            </div>

            <!-- Dropdown Penyesuaian Mapel Sesuai Kelas Siswa -->
            <div class="pt-1 border-t border-blue-100/80">
              <label class="block text-[11px] font-semibold text-slate-700 mb-1">
                Pilih / Sesuaikan Mapel Kelas {{ authStore.user?.kelas || '' }}:
              </label>
              <CustomDropdown
                v-model="selectedSubject"
                :options="subjectDropdownOptions"
                title="Pilih Mata Pelajaran"
                icon="menu_book"
                :fullWidth="true"
                size="md"
                @update:modelValue="onSubjectManualChange"
              />
              <div class="flex items-center justify-between text-[11px] text-slate-500 mt-1 px-0.5 flex-wrap gap-1">
                <span>Pengajar: <strong class="text-slate-700">{{ currentSubjectSchedule?.guru || '-' }}</strong></span>
                <span class="font-mono text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200/60 font-medium">
                  {{ currentSubjectSchedule?.jam_masuk || '-' }} - {{ currentSubjectSchedule?.jam_pulang || '-' }} WIB
                </span>
              </div>
            </div>
          </div>

          <!-- Kondisi 1: Presensi Masuk & Pulang Sudah Lengkap untuk Mapel Ini -->
          <div v-if="myAttendance?.jam_masuk && myAttendance?.jam_pulang" class="p-6 text-center bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3">
            <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-xl font-bold">
              ✓
            </div>
            <div>
              <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-200/80 text-emerald-800">
                {{ selectedSubject }}
              </span>
              <h4 class="font-bold text-slate-900 text-base mt-1">Presensi Mapel Ini Selesai</h4>
              <p class="text-xs text-slate-600 mt-1">
                Masuk: <span class="font-semibold text-slate-800">{{ myAttendance.jam_masuk }}</span> &bull; 
                Pulang: <span class="font-semibold text-slate-800">{{ myAttendance.jam_pulang }}</span>
              </p>
              <p class="text-[11px] text-emerald-700 font-medium mt-1">Seluruh jadwal kehadiran pada mata pelajaran ini telah lengkap tercatat hari ini.</p>
            </div>
            <Button size="sm" variant="outline" @click="activeTab = 'riwayat'" class="mt-2">
              Lihat Riwayat Kehadiran &rarr;
            </Button>
          </div>

          <!-- Kondisi 2: Belum Masuk atau Belum Pulang -->
          <div v-else class="space-y-4">
            <!-- Banner Status Jika Sudah Masuk dan Akan Pulang -->
            <div v-if="myAttendance?.jam_masuk && !myAttendance?.jam_pulang" class="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-center justify-between">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-200 text-blue-900 block w-fit mb-0.5">
                  {{ selectedSubject }}
                </span>
                <p class="font-semibold">Presensi Masuk Tercatat ({{ myAttendance.jam_masuk }})</p>
                <p class="text-[11px] text-blue-600">Ambil foto selfie kembali untuk melakukan Presensi Pulang mapel ini.</p>
              </div>
              <Badge status="hadir" label="Masuk OK" />
            </div>

            <!-- Camera / Photo Preview Area -->
            <div class="relative w-full h-56 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200">
              <video
                v-show="isCameraOpen && !capturedPhoto"
                ref="videoRef"
                autoplay
                playsinline
                muted
                class="w-full h-full object-cover mirror-mode"
              ></video>

              <img
                v-if="capturedPhoto"
                :src="capturedPhoto"
                alt="Captured"
                class="w-full h-full object-cover"
              />

              <!-- Floating Cancel Button inside preview area -->
              <button
                v-if="isCameraOpen || capturedPhoto"
                type="button"
                @click="handleCancelCameraOrPhoto"
                class="absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer shadow-md border border-white/20"
                :title="capturedPhoto ? 'Hapus foto & kembali' : 'Tutup kamera selfie'"
              >
                <span class="material-icons text-sm">close</span>
              </button>

              <div v-if="!isCameraOpen && !capturedPhoto" class="text-center p-4 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 mx-auto text-slate-400 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                <p class="text-xs text-slate-300">Kamera belum diaktifkan</p>
                <Button size="sm" variant="default" class="mt-3 font-semibold" @click="startCamera">
                  <span class="material-icons text-xs mr-1">photo_camera</span>
                  {{ myAttendance ? 'Nyalakan Kamera untuk Pulang' : 'Nyalakan Kamera untuk Masuk' }}
                </Button>
              </div>

              <!-- Retake & Delete Buttons if photo captured -->
              <div v-if="capturedPhoto" class="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 z-10">
                <Button size="sm" variant="secondary" class="bg-white/90 hover:bg-white text-slate-700 font-semibold shadow-xs" @click="retakePhoto">
                  <span class="material-icons text-xs mr-1">restart_alt</span>
                  Foto Ulang
                </Button>
                <Button size="sm" variant="outline" class="bg-rose-600/90 hover:bg-rose-700 text-white border-transparent font-semibold shadow-xs" @click="handleCancelCameraOrPhoto">
                  <span class="material-icons text-xs mr-1">delete</span>
                  Batal
                </Button>
              </div>
            </div>

            <canvas ref="canvasRef" class="hidden"></canvas>

            <!-- Action Buttons -->
            <div class="flex flex-col gap-2 pt-1">
              <!-- When Camera is Open -->
              <div v-if="isCameraOpen && !capturedPhoto" class="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  class="text-rose-600 border-rose-200 hover:bg-rose-50 inline-flex items-center justify-center gap-1.5 font-semibold"
                  @click="stopCamera"
                >
                  <span class="material-icons text-base">videocam_off</span>
                  <span>Batal Kamera</span>
                </Button>

                <Button
                  type="button"
                  variant="default"
                  class="inline-flex items-center justify-center gap-1.5 font-bold shadow-2xs bg-blue-600 hover:bg-blue-700"
                  @click="takeSnapshot"
                >
                  <span class="material-icons text-base">photo_camera</span>
                  <span>Ambil Foto</span>
                </Button>
              </div>

              <!-- When Photo is Captured or Waiting -->
              <Button
                v-if="capturedPhoto"
                @click="handleSubmitAttendance"
                :disabled="!isWithinRadius"
                :loading="isSubmitting"
                size="lg"
                class="w-full font-bold shadow-sm"
              >
                {{ myAttendance ? `Kirim Presensi Pulang (${selectedSubject || 'Mapel'})` : `Kirim Presensi Masuk (${selectedSubject || 'Mapel'})` }}
              </Button>

              <button
                v-if="isCameraOpen || capturedPhoto"
                type="button"
                @click="cancelPresensiAndGoToHistory"
                class="text-xs text-slate-500 hover:text-slate-800 text-center py-1 transition cursor-pointer font-medium"
              >
                Batalkan Presensi & Kembali ke Riwayat
              </button>

              <p v-if="!isWithinRadius && currentDistance !== null" class="text-center text-xs text-rose-600 font-medium inline-flex items-center justify-center gap-1">
                <span class="material-icons text-xs">warning</span>
                <span>Anda harus berada dalam radius sekolah untuk dapat mengirim presensi.</span>
              </p>
              <p v-else-if="!capturedPhoto && !isCameraOpen" class="text-center text-xs text-slate-500">
                Wajib mengambil foto selfie kehadiran sebelum submit.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <!-- TAB 2: KARTU ID & QR CODE (Untuk ditunjukkan ke guru jika scan) -->
      <div v-else-if="activeTab === 'kartu'" class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <Card title="Kartu Pelajar & QR Presensi" description="Tunjukkan kartu ini kepada guru atau cetak kartu fisik">
          <div class="flex flex-col items-center p-2 sm:p-4">
            <!-- Simulated ID Card -->
            <div class="w-full max-w-sm rounded-2xl bg-blue-600 text-white p-4 sm:p-5 shadow-sm border border-blue-700 relative overflow-hidden">
              <div class="flex items-center justify-between border-b border-white/20 pb-2.5 mb-3">
                <div class="min-w-0 pr-2">
                  <h4 class="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-blue-200">Kartu Presensi Siswa</h4>
                  <p class="text-xs sm:text-sm font-bold text-white leading-tight truncate max-w-[200px]">{{ attendanceStore.schoolSettings.nama_sekolah }}</p>
                </div>
                <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold text-xs shrink-0">
                  ID
                </div>
              </div>

              <div class="flex gap-3 sm:gap-4 items-center">
                <img
                  v-if="authStore.user?.foto_profil_url"
                  :src="authStore.user.foto_profil_url"
                  alt="Foto Siswa"
                  class="w-16 h-20 sm:w-20 sm:h-24 rounded-lg object-cover border-2 border-white shadow-xs shrink-0"
                />
                <div
                  v-else
                  class="w-16 h-20 sm:w-20 sm:h-24 rounded-lg bg-blue-900/60 border-2 border-white shadow-xs shrink-0 flex items-center justify-center text-white font-bold text-lg sm:text-xl select-none"
                >
                  {{ getInitials(authStore.user?.nama_lengkap) }}
                </div>
                <div class="text-xs space-y-1 min-w-0 flex-1">
                  <div>
                    <p class="text-blue-200 text-[9px] sm:text-[10px] uppercase font-semibold">Nama Lengkap</p>
                    <p class="font-bold text-xs sm:text-sm text-white truncate">{{ authStore.user?.nama_lengkap }}</p>
                  </div>
                  <div>
                    <p class="text-blue-200 text-[9px] sm:text-[10px] uppercase font-semibold">NISN / Kelas</p>
                    <p class="font-medium text-xs sm:text-sm text-white font-mono truncate">{{ authStore.user?.nomor_induk }} &bull; {{ authStore.user?.kelas }}</p>
                  </div>
                </div>
              </div>

              <!-- QR Code Container (Responsive & Anti-Overlap) -->
              <div class="mt-4 pt-3 border-t border-white/20 flex items-center justify-between bg-white text-slate-900 p-2.5 sm:p-3 rounded-xl gap-2 overflow-hidden shadow-xs">
                <div class="min-w-0 flex-1">
                  <p class="text-[9px] sm:text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Scan Token</p>
                  <p class="text-[11px] sm:text-xs font-mono font-bold text-blue-600 truncate select-all">{{ authStore.user?.qr_token }}</p>
                  <p class="text-[9px] text-slate-400 mt-0.5 leading-tight truncate">Berlaku selama masa aktif</p>
                </div>
                <div class="shrink-0 bg-slate-50 p-1 rounded-lg border border-slate-200 flex items-center justify-center">
                  <img
                    v-if="qrCodeDataUrl"
                    :src="qrCodeDataUrl"
                    alt="QR Code Siswa"
                    class="w-12 h-12 sm:w-14 sm:h-14 object-contain block"
                  />
                  <div v-else class="w-12 h-12 flex items-center justify-center text-[9px] text-slate-400">
                    ...
                  </div>
                </div>
              </div>
            </div>

            <p class="text-xs text-slate-500 text-center mt-3">
              Bagi siswa tanpa smartphone, kartu ini dapat dicetak dalam format fisik oleh Admin atau Guru.
            </p>
          </div>
        </Card>

        <!-- Kolom Kanan: Pas Foto Pelajar & Keamanan Akun -->
        <div class="space-y-6">
          <!-- Card 2: Pengaturan & Upload Pas Foto Pelajar (1x Kesempatan Mandiri) -->
          <Card title="Pas Foto Pelajar" description="Pas foto resmi seragam untuk kartu identitas dan buku presensi sekolah">
            <!-- Kondisi 1: Batas 1x sudah digunakan (Terkunci) -->
            <div v-if="isStudentPhotoLocked" class="space-y-3">
              <div class="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1.5">
                <div class="flex items-center gap-2 font-bold text-amber-800">
                  <span class="material-icons text-base">lock</span>
                  <span>Foto Profil Terkunci (1/1 Kesempatan Telah Digunakan)</span>
                </div>
                <p class="text-[11px] text-amber-700 leading-relaxed">
                  Anda telah menggunakan <strong>1x kesempatan mandiri</strong> untuk memperbarui foto profil pelajar. Demi ketertiban dan validitas data siswa, penggantian foto berikutnya hanya dapat diproses oleh <strong>Administrator Sekolah</strong>.
                </p>
              </div>

              <div class="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <img
                  v-if="authStore.user?.foto_profil_url"
                  :src="authStore.user.foto_profil_url"
                  alt="Foto Profil Siswa"
                  class="w-14 h-16 rounded-lg object-cover border border-slate-300 shadow-2xs shrink-0"
                />
                <div
                  v-else
                  class="w-14 h-16 rounded-lg bg-blue-600 text-white font-bold text-sm flex items-center justify-center shrink-0 border border-blue-700 shadow-2xs select-none"
                >
                  {{ getInitials(authStore.user?.nama_lengkap) }}
                </div>
                <div class="text-xs space-y-0.5 min-w-0">
                  <p class="font-bold text-slate-800 truncate">{{ authStore.user?.nama_lengkap }}</p>
                  <p class="text-slate-500 font-mono text-[11px]">{{ authStore.user?.nomor_induk }} &bull; {{ authStore.user?.kelas }}</p>
                  <span class="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold mt-1">
                    <span>✓</span> Foto Resmi Terverifikasi
                  </span>
                </div>
              </div>
            </div>

            <!-- Kondisi 2: Kesempatan 1x Masih Tersedia -->
            <div v-else class="space-y-3.5">
              <div class="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-blue-800 flex items-center gap-1.5">
                    <span class="material-icons text-sm text-blue-600">info</span>
                    <span>Kesempatan Update Mandiri:</span>
                    <span class="px-2 py-0.5 rounded-full bg-blue-200/70 text-blue-800 font-bold text-[10px]">1x Tersisa</span>
                  </span>
                </div>
                <p class="text-[11px] text-blue-700 leading-relaxed">
                  Unggah pas foto berseragam sekolah dengan format <strong>PNG atau JPG</strong> (maksimal 5MB). Pastikan foto tegak dan jelas, karena setelah disimpan foto akan dikunci dan perubahan berikutnya memerlukan bantuan Admin.
                </p>
              </div>

              <!-- Upload Area & Preview -->
              <input
                ref="studentPhotoInputRef"
                type="file"
                accept=".png, .jpg, .jpeg, image/png, image/jpeg"
                class="hidden"
                @change="handleStudentPhotoChange"
              />

              <!-- Jika belum memilih file -->
              <div
                v-if="!studentPhotoPreview"
                @click="triggerStudentPhotoPicker"
                class="p-5 border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-2xl text-center cursor-pointer bg-slate-50/60 hover:bg-blue-50/20 transition-all group"
              >
                <div class="w-11 h-11 rounded-full bg-blue-100/80 text-blue-600 flex items-center justify-center mx-auto mb-1.5 text-lg group-hover:scale-105 transition-transform">
                  <span class="material-icons text-2xl text-blue-600">add_a_photo</span>
                </div>
                <p class="text-xs font-bold text-slate-800">Klik untuk Unggah Pas Foto (PNG / JPG)</p>
                <p class="text-[11px] text-slate-500 mt-0.5">Maksimal 5MB &bull; Disarankan pas foto berseragam rapi</p>
              </div>

              <!-- Jika file sudah dipilih (Preview) -->
              <div v-else class="p-3 rounded-xl border border-blue-200 bg-blue-50/30 flex items-center justify-between gap-3">
                <div class="flex items-center gap-3 min-w-0">
                  <img
                    :src="studentPhotoPreview"
                    alt="Preview Foto Baru"
                    class="w-14 h-16 rounded-lg object-cover border-2 border-blue-400 shadow-2xs shrink-0"
                  />
                  <div class="min-w-0 text-xs">
                    <p class="font-bold text-slate-800 truncate">{{ studentPhotoFileName }}</p>
                    <p class="text-[11px] text-slate-500">{{ studentPhotoFileSize }}</p>
                    <p class="text-[11px] text-emerald-600 font-semibold mt-0.5">Siap disimpan sebagai foto resmi</p>
                  </div>
                </div>
                <div class="flex items-center gap-1.5 shrink-0">
                  <Button size="sm" variant="outline" @click="triggerStudentPhotoPicker">
                    Ganti
                  </Button>
                  <Button size="sm" variant="ghost" class="text-rose-600 hover:bg-rose-50" @click="clearStudentPhotoSelection">
                    Batal
                  </Button>
                </div>
              </div>

              <Button
                type="button"
                variant="default"
                size="lg"
                class="w-full text-xs font-bold shadow-2xs inline-flex items-center justify-center gap-1.5"
                :disabled="!studentPhotoPreview || isCompressingStudentPhoto"
                @click="saveStudentPhoto"
              >
                <span class="material-icons text-sm" v-if="!isCompressingStudentPhoto">save</span>
                <span>{{ isCompressingStudentPhoto ? 'Memproses Foto...' : 'Simpan Pas Foto Pelajar (1x Kesempatan)' }}</span>
              </Button>
            </div>
          </Card>

          <!-- Card 3: Ganti Password Siswa Mandiri -->
          <Card title="Keamanan & Password Akun" description="Atur kata sandi akun pelajar Anda agar tetap aman dan terlindungi">
            <form @submit.prevent="handleStudentChangePassword" class="space-y-3.5">
              <div class="space-y-3">
                <!-- Input Password Baru -->
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Password Baru</label>
                  <div class="relative">
                    <input
                      v-model="studentPasswordForm.newPassword"
                      :type="showStudentPass ? 'text' : 'password'"
                      required
                      placeholder="Ketik password baru..."
                      class="w-full h-9 pl-3 pr-14 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      @click="showStudentPass = !showStudentPass"
                      class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer"
                    >
                      {{ showStudentPass ? 'Tutup' : 'Lihat' }}
                    </button>
                  </div>

                  <!-- Strength Meter Bar -->
                  <div v-if="studentPasswordForm.newPassword" class="space-y-1 pt-1.5">
                    <div class="flex items-center justify-between text-[11px]">
                      <span class="text-slate-500">Kekuatan Sandi:</span>
                      <span :class="studentPasswordStrengthTextClass" class="font-bold">
                        {{ studentPasswordStrengthLabel }}
                      </span>
                    </div>
                    <div class="grid grid-cols-3 gap-1.5 h-1.5">
                      <div
                        class="rounded-full transition-all duration-300"
                        :class="studentPasswordScore >= 1 ? studentPasswordStrengthBarColor : 'bg-slate-200'"
                      />
                      <div
                        class="rounded-full transition-all duration-300"
                        :class="studentPasswordScore >= 2 ? studentPasswordStrengthBarColor : 'bg-slate-200'"
                      />
                      <div
                        class="rounded-full transition-all duration-300"
                        :class="studentPasswordScore >= 3 ? studentPasswordStrengthBarColor : 'bg-slate-200'"
                      />
                    </div>
                  </div>
                </div>

                <!-- Check Rules Box -->
                <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Syarat Keamanan Password:
                  </span>
                  <ul class="space-y-1 text-xs">
                    <li
                      class="flex items-center gap-1.5 transition-colors"
                      :class="studentPasswordRules.hasMinLength ? 'text-emerald-700 font-semibold' : 'text-slate-500'"
                    >
                      <span
                        class="material-icons text-sm"
                        :class="studentPasswordRules.hasMinLength ? 'text-emerald-600' : 'text-slate-300'"
                      >
                        {{ studentPasswordRules.hasMinLength ? 'check_circle' : 'radio_button_unchecked' }}
                      </span>
                      <span>Minimal 6 karakter</span>
                    </li>
                    <li
                      class="flex items-center gap-1.5 transition-colors"
                      :class="studentPasswordRules.hasLetter ? 'text-emerald-700 font-semibold' : 'text-slate-500'"
                    >
                      <span
                        class="material-icons text-sm"
                        :class="studentPasswordRules.hasLetter ? 'text-emerald-600' : 'text-slate-300'"
                      >
                        {{ studentPasswordRules.hasLetter ? 'check_circle' : 'radio_button_unchecked' }}
                      </span>
                      <span>Mengandung huruf (a-z / A-Z)</span>
                    </li>
                    <li
                      class="flex items-center gap-1.5 transition-colors"
                      :class="studentPasswordRules.hasNumber ? 'text-emerald-700 font-semibold' : 'text-slate-500'"
                    >
                      <span
                        class="material-icons text-sm"
                        :class="studentPasswordRules.hasNumber ? 'text-emerald-600' : 'text-slate-300'"
                      >
                        {{ studentPasswordRules.hasNumber ? 'check_circle' : 'radio_button_unchecked' }}
                      </span>
                      <span>Mengandung angka (0-9)</span>
                    </li>
                  </ul>
                </div>
              </div>

              <p class="text-[11px] text-slate-400 flex items-center gap-1">
                <span class="material-icons text-xs text-amber-500">lightbulb</span>
                <span>Ingat password baru Anda. Jika suatu saat lupa, Anda dapat meminta bantuan Admin Sekolah untuk meresetnya.</span>
              </p>

              <Button
                type="submit"
                variant="default"
                size="sm"
                class="w-full font-bold shadow-2xs"
                :loading="isChangingStudentPass"
                :disabled="!isStudentPasswordValid"
              >
                Perbarui Password Akun
              </Button>
            </form>
          </Card>
        </div>
      </div>

      <!-- TAB 3: PENGAJUAN IZIN / SAKIT -->
      <div v-else-if="activeTab === 'izin'" class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <Card title="Form Pengajuan Izin / Sakit" description="Ajukan permohonan ketidakhadiran dengan melampirkan surat dokter atau bukti pendukung">
          <form @submit.prevent="handleApplyPermit" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Jenis Ketidakhadiran</label>
                <CustomDropdown
                  v-model="permitForm.jenis"
                  :options="permitTypeOptions"
                  title="Pilih Jenis Izin"
                  icon="edit_note"
                  :fullWidth="true"
                  size="md"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Tanggal</label>
                <input v-model="permitForm.tanggal" type="date" required class="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Alasan / Keterangan Lengkap</label>
              <textarea v-model="permitForm.keterangan" rows="3" required placeholder="Jelaskan alasan ketidakhadiran Anda secara terperinci..." class="w-full p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
            </div>

            <!-- Upload Bukti Lampiran / Surat Dokter -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="block text-xs font-semibold text-slate-700">
                  Lampiran Bukti / Surat Keterangan
                  <span v-if="permitForm.jenis === 'sakit'" class="text-rose-500 font-bold ml-1">*Wajib untuk sakit</span>
                  <span v-else class="text-slate-400 font-normal ml-1">(Opsional)</span>
                </label>
                <span v-if="attachmentPreview" class="text-[11px] text-slate-400">{{ attachmentFileSize }}</span>
              </div>

              <!-- Hidden File Input -->
              <input
                ref="fileInputRef"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleFileChange"
              />

              <!-- Preview State jika gambar terpilih -->
              <div v-if="attachmentPreview" class="p-3 rounded-xl border border-blue-200 bg-blue-50/40 flex items-center justify-between gap-3">
                <div class="flex items-center gap-3 min-w-0">
                  <img
                    :src="attachmentPreview"
                    alt="Preview Bukti"
                    class="w-14 h-14 rounded-lg object-cover border border-blue-200 shrink-0 cursor-pointer shadow-xs hover:opacity-90"
                    @click="openAttachmentModal(attachmentPreview)"
                    title="Klik untuk perbesar"
                  />
                  <div class="min-w-0">
                    <p class="text-xs font-semibold text-slate-800 truncate">{{ attachmentFileName || 'surat_keterangan.jpg' }}</p>
                    <p class="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                      File siap dilampirkan
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-1 shrink-0">
                  <Button type="button" size="sm" variant="outline" @click="triggerFileInput">
                    Ganti
                  </Button>
                  <Button type="button" size="sm" variant="ghost" class="text-rose-600 hover:bg-rose-50" @click="removeAttachment">
                    Hapus
                  </Button>
                </div>
              </div>

              <!-- Dropzone Upload State jika belum ada file -->
              <div
                v-else
                @click="triggerFileInput"
                class="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-4 sm:p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/30 group"
              >
                <div class="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center mx-auto mb-2 text-slate-400 group-hover:text-blue-600 group-hover:border-blue-300 shadow-xs transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </div>
                <p class="text-xs font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
                  Klik untuk unggah foto Surat Dokter / Surat Keterangan
                </p>
                <p class="text-[11px] text-slate-400 mt-0.5">
                  Format gambar JPG, PNG, atau WEBP (Maksimal 5MB)
                </p>
              </div>
            </div>

            <Button type="submit" variant="default" :loading="isSubmitting" class="w-full" size="lg">
              Kirim Permohonan Izin
            </Button>
          </form>
        </Card>

        <!-- Riwayat Pengajuan Izin Siswa -->
        <Card title="Riwayat Pengajuan Izin Saya" description="Status persetujuan surat izin Anda oleh guru">
          <div v-if="studentLeaveHistory.length" class="space-y-3">
            <div
              v-for="item in studentLeaveHistory"
              :key="item.id"
              class="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div class="flex items-start gap-3 min-w-0">
                <!-- Thumbnail Lampiran jika ada -->
                <div v-if="item.bukti_surat_url" class="shrink-0">
                  <img
                    :src="item.bukti_surat_url"
                    alt="Lampiran Surat"
                    class="w-12 h-12 rounded-lg object-cover border border-slate-200 cursor-pointer hover:opacity-85 shadow-xs"
                    @click="openAttachmentModal(item.bukti_surat_url)"
                    title="Klik untuk memperbesar surat"
                  />
                </div>
                <div v-else class="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400 text-xs">
                  -
                </div>

                <div class="min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-xs font-bold text-slate-900">{{ item.tanggal_mulai }}</span>
                    <Badge :status="item.jenis" />
                    <Badge :status="item.status" />
                  </div>
                  <p class="text-xs text-slate-600 mt-1 italic line-clamp-2">"{{ item.keterangan }}"</p>
                  <p v-if="item.bukti_surat_url" class="text-[11px] text-blue-600 font-medium mt-1 cursor-pointer hover:underline" @click="openAttachmentModal(item.bukti_surat_url)">
                    Lihat Lampiran Surat &rarr;
                  </p>
                </div>
              </div>

              <div class="shrink-0 text-right sm:text-right">
                <span class="text-[11px] text-slate-400 capitalize block">
                  Status: <strong class="text-slate-700">{{ item.status }}</strong>
                </span>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-slate-400 text-xs">
            Belum ada permohonan izin yang diajukan.
          </div>
        </Card>
      </div>

      <!-- Lightbox Modal Preview Lampiran -->
      <div
        v-if="isPreviewModalOpen"
        class="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
        @click.self="closeAttachmentModal"
      >
        <div class="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div class="p-4 border-b border-slate-100 flex items-center justify-between">
            <h4 class="text-sm font-bold text-slate-800">Lampiran Surat Izin / Sakit</h4>
            <button
              @click="closeAttachmentModal"
              class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-sm cursor-pointer"
            >
              &times;
            </button>
          </div>
          <div class="p-4 bg-slate-950 flex items-center justify-center max-h-[70vh] overflow-auto">
            <img :src="previewModalImage" alt="Bukti Surat" class="max-w-full max-h-[60vh] object-contain rounded" />
          </div>
          <div class="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
            <Button size="sm" variant="outline" @click="closeAttachmentModal">Tutup</Button>
          </div>
        </div>
      </div>

      <!-- TAB 4: RIWAYAT KEHADIRAN -->
      <div v-else-if="activeTab === 'riwayat'" class="space-y-4 sm:space-y-6">
        <!-- Ringkasan Statistik Presensi Siswa -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div class="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <p class="text-[11px] font-semibold text-slate-500 uppercase tracking-tight">Total Presensi</p>
            <p class="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{{ studentHistory.length }}</p>
          </div>
          <div class="bg-white p-3.5 sm:p-4 rounded-2xl border border-emerald-100 shadow-2xs">
            <p class="text-[11px] font-semibold text-emerald-700 uppercase tracking-tight">Hadir Tepat</p>
            <p class="text-xl sm:text-2xl font-bold text-emerald-700 mt-1">{{ studentHadirCount }}</p>
          </div>
          <div class="bg-white p-3.5 sm:p-4 rounded-2xl border border-amber-100 shadow-2xs">
            <p class="text-[11px] font-semibold text-amber-700 uppercase tracking-tight">Terlambat</p>
            <p class="text-xl sm:text-2xl font-bold text-amber-700 mt-1">{{ studentTerlambatCount }}</p>
          </div>
          <div class="bg-white p-3.5 sm:p-4 rounded-2xl border border-blue-100 shadow-2xs">
            <p class="text-[11px] font-semibold text-blue-700 uppercase tracking-tight">Izin / Sakit</p>
            <p class="text-xl sm:text-2xl font-bold text-blue-700 mt-1">{{ studentLeaveHistory.length }}</p>
          </div>
        </div>

        <Card title="Riwayat Presensi Pribadi" description="Catatan riwayat kehadiran Anda">
          <!-- Desktop Table View -->
          <div class="hidden md:block overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-600">
              <thead class="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th class="py-3 px-4">Tanggal</th>
                  <th class="py-3 px-4">Mata Pelajaran</th>
                  <th class="py-3 px-4">Jam Masuk</th>
                  <th class="py-3 px-4">Jam Pulang</th>
                  <th class="py-3 px-4">Metode</th>
                  <th class="py-3 px-4">Jarak</th>
                  <th class="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="att in studentHistory" :key="att.id" class="hover:bg-slate-50/50">
                  <td class="py-3 px-4 font-medium text-slate-800">{{ att.tanggal }}</td>
                  <td class="py-3 px-4 font-semibold text-blue-700">{{ att.mata_pelajaran || 'Presensi Harian' }}</td>
                  <td class="py-3 px-4">{{ att.jam_masuk || '-' }}</td>
                  <td class="py-3 px-4">{{ att.jam_pulang || '-' }}</td>
                  <td class="py-3 px-4">
                    <span v-if="att.metode_presensi === 'mandiri_gps'" class="text-blue-600 font-medium">GPS Mandiri</span>
                    <span v-else-if="att.metode_presensi === 'qr_guru'" class="text-indigo-600 font-medium">Scan QR Guru</span>
                    <span v-else class="text-slate-600">Manual Guru</span>
                  </td>
                  <td class="py-3 px-4">{{ att.jarak_masuk_meter ? `${att.jarak_masuk_meter}m` : '-' }}</td>
                  <td class="py-3 px-4">
                    <Badge :status="att.status" />
                  </td>
                </tr>
                <tr v-if="studentHistory.length === 0">
                  <td colspan="7" class="py-8 text-center text-slate-400 text-xs">
                    Belum ada data riwayat presensi Anda.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile ListView (Flutter ListTile Style) -->
          <div class="md:hidden space-y-2.5">
            <MobileListItem
              v-for="att in studentHistory"
              :key="att.id"
              :title="`${att.tanggal} • ${att.mata_pelajaran || 'Presensi Harian'}`"
              :subtitle="att.jam_masuk ? `Masuk: ${att.jam_masuk} ${att.jam_pulang ? '• Pulang: ' + att.jam_pulang : ''}` : 'Belum absen'"
              :extra="att.metode_presensi === 'mandiri_gps' ? `📍 GPS (${att.jarak_masuk_meter || 0}m)` : (att.metode_presensi === 'qr_guru' ? '📷 QR Guru' : '✏️ Manual Guru')"
              :badge="att.status"
              :badgeVariant="att.status === 'hadir' ? 'success' : (att.status === 'terlambat' ? 'warning' : 'danger')"
              icon="event_available"
              @click="openHistoryDetail(att)"
            />

            <div v-if="studentHistory.length === 0" class="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-200">
              Belum ada riwayat presensi Anda tercatat.
            </div>
          </div>
        </Card>
      </div>

      <!-- Mobile Detail Bottom Sheet: Riwayat Presensi -->
      <MobileDetailSheet
        v-model:open="isHistoryDetailOpen"
        :title="`Presensi ${selectedHistoryItem?.tanggal || ''}`"
        :subtitle="`Status: ${(selectedHistoryItem?.status || '').toUpperCase()}`"
      >
        <div v-if="selectedHistoryItem" class="space-y-4">
          <!-- Status Banner -->
          <div class="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span class="text-xs text-slate-600 font-medium">Status Kehadiran:</span>
            <Badge :status="selectedHistoryItem.status" />
          </div>

          <!-- Waktu Presensi -->
          <div class="grid grid-cols-2 gap-3">
            <div class="p-3 rounded-xl border border-slate-200 bg-white">
              <span class="text-[11px] text-slate-400 block font-medium">Jam Masuk</span>
              <span class="text-sm font-bold text-slate-900 mt-0.5 block font-mono">
                {{ selectedHistoryItem.jam_masuk || '-' }}
              </span>
            </div>
            <div class="p-3 rounded-xl border border-slate-200 bg-white">
              <span class="text-[11px] text-slate-400 block font-medium">Jam Pulang</span>
              <span class="text-sm font-bold text-slate-900 mt-0.5 block font-mono">
                {{ selectedHistoryItem.jam_pulang || '-' }}
              </span>
            </div>
          </div>

          <!-- Metode & Jarak GPS -->
          <div class="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-500">Metode Verifikasi</span>
              <span class="font-semibold text-slate-900">
                {{ selectedHistoryItem.metode_presensi === 'mandiri_gps' ? 'GPS Mandiri Siswa' : (selectedHistoryItem.metode_presensi === 'qr_guru' ? 'Scan Kartu QR oleh Guru' : 'Input Manual Guru') }}
              </span>
            </div>
            <div v-if="selectedHistoryItem.jarak_masuk_meter" class="flex items-center justify-between text-xs pt-1.5 border-t border-slate-100">
              <span class="text-slate-500">Jarak ke Titik Sekolah</span>
              <span class="font-bold text-blue-600 font-mono">{{ selectedHistoryItem.jarak_masuk_meter }} meter</span>
            </div>
          </div>

          <!-- Foto Selfie Masuk jika ada -->
          <div v-if="selectedHistoryItem.foto_masuk_url" class="space-y-1.5">
            <span class="text-xs font-semibold text-slate-700">Foto Selfie Saat Presensi Masuk:</span>
            <div class="w-full h-44 rounded-2xl overflow-hidden border border-slate-200 bg-black">
              <img :src="selectedHistoryItem.foto_masuk_url" class="w-full h-full object-contain" />
            </div>
          </div>
        </div>
      </MobileDetailSheet>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import QRCode from 'qrcode'
import L from 'leaflet'
import confetti from 'canvas-confetti'
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

const activeTab = ref(localStorage.getItem('presensi_tab_siswa') || 'presensi')

// State untuk Mobile Drawer & Detail Bottom Sheet
const isDrawerOpen = ref(false)
const isHistoryDetailOpen = ref(false)
const selectedHistoryItem = ref(null)

function openHistoryDetail(att) {
  selectedHistoryItem.value = att
  isHistoryDetailOpen.value = true
}

// Sidebar & Bottom Nav items untuk Siswa
const navItems = computed(() => [
  { key: 'presensi', icon: 'location_on', label: 'Presensi' },
  { key: 'kartu', icon: 'badge', label: 'Kartu QR' },
  { key: 'izin', icon: 'edit_note', label: 'Izin' },
  { key: 'riwayat', icon: 'history', label: 'Riwayat' },
])
const isLocating = ref(false)
const userCoords = ref(null)
const currentDistance = ref(null)
const isSubmitting = ref(false)

// Camera variables
const videoRef = ref(null)
const canvasRef = ref(null)
const isCameraOpen = ref(false)
const capturedPhoto = ref(null)
const mediaStream = ref(null)

// QR Data URL
const qrCodeDataUrl = ref('')

// Map variables
let mapInstance = null
let circleInstance = null
let markerInstance = null

const permitTypeOptions = [
  { value: 'sakit', label: 'Sakit (Surat Keterangan Dokter)', icon: 'local_hospital' },
  { value: 'izin', label: 'Izin (Keperluan Keluarga/Penting)', icon: 'assignment' }
]

// Permit form & attachment
const permitForm = ref({
  jenis: 'sakit',
  tanggal: new Date().toISOString().split('T')[0],
  keterangan: ''
})
const fileInputRef = ref(null)
const attachmentFile = ref(null)
const attachmentPreview = ref(null)
const attachmentFileName = ref('')
const attachmentFileSize = ref('')
const isPreviewModalOpen = ref(false)
const previewModalImage = ref('')

const studentLeaveHistory = computed(() => {
  return attendanceStore.leaveRequests.filter(l => l.user_id === authStore.user?.id)
})

// Logika Upload Foto Siswa & Batasan Kuota 1x
const studentPhotoInputRef = ref(null)
const studentPhotoPreview = ref('')
const studentPhotoFileName = ref('')
const studentPhotoFileSize = ref('')
const isCompressingStudentPhoto = ref(false)

const isStudentPhotoLocked = computed(() => {
  return (authStore.user?.foto_update_count || 0) >= 1
})

function triggerStudentPhotoPicker() {
  if (isStudentPhotoLocked.value) return
  if (studentPhotoInputRef.value) {
    studentPhotoInputRef.value.click()
  }
}

async function handleStudentPhotoChange(event) {
  const file = event.target.files?.[0]
  if (!file) return

  try {
    isCompressingStudentPhoto.value = true
    const compressed = await compressImageFile(file, 600, 600, 0.85)
    studentPhotoPreview.value = compressed
    studentPhotoFileName.value = file.name
    studentPhotoFileSize.value = (file.size / 1024).toFixed(0) + ' KB'
  } catch (err) {
    alert(err.message || 'Gagal memproses file foto.')
  } finally {
    isCompressingStudentPhoto.value = false
  }
}

function clearStudentPhotoSelection() {
  studentPhotoPreview.value = ''
  studentPhotoFileName.value = ''
  studentPhotoFileSize.value = ''
  if (studentPhotoInputRef.value) {
    studentPhotoInputRef.value.value = ''
  }
}

async function saveStudentPhoto() {
  if (!studentPhotoPreview.value || isStudentPhotoLocked.value) return

  const updatedData = {
    foto_profil_url: studentPhotoPreview.value,
    foto_update_count: (authStore.user?.foto_update_count || 0) + 1
  }

  // Update profil di authStore
  authStore.updateUserProfile(updatedData)

  // Update data siswa di attendanceStore agar sinkron dengan admin & guru
  if (authStore.user?.id) {
    await attendanceStore.updateStudent(authStore.user.id, updatedData)
  }

  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.6 }
  })

  alert('Pas foto profil pelajar berhasil diperbarui! Batas 1x kesempatan mandiri Anda kini telah terkunci.')
  studentPhotoPreview.value = ''
}

// Logika Ganti Password Siswa Mandiri dengan Check Rule
const showStudentPass = ref(false)
const isChangingStudentPass = ref(false)
const studentPasswordForm = ref({
  newPassword: ''
})

const studentPasswordRules = computed(() => {
  const p = studentPasswordForm.value.newPassword || ''
  return {
    hasMinLength: p.length >= 6,
    hasLetter: /[a-zA-Z]/.test(p),
    hasNumber: /[0-9]/.test(p)
  }
})

const studentPasswordScore = computed(() => {
  let score = 0
  if (studentPasswordRules.value.hasMinLength) score++
  if (studentPasswordRules.value.hasLetter) score++
  if (studentPasswordRules.value.hasNumber) score++
  return score
})

const isStudentPasswordValid = computed(() => {
  return studentPasswordRules.value.hasMinLength &&
    studentPasswordRules.value.hasLetter &&
    studentPasswordRules.value.hasNumber
})

const studentPasswordStrengthLabel = computed(() => {
  if (studentPasswordScore.value === 3) return 'Kuat'
  if (studentPasswordScore.value === 2) return 'Sedang'
  return 'Kurang Memenuhi'
})

const studentPasswordStrengthTextClass = computed(() => {
  if (studentPasswordScore.value === 3) return 'text-emerald-600'
  if (studentPasswordScore.value === 2) return 'text-amber-600'
  return 'text-rose-600'
})

const studentPasswordStrengthBarColor = computed(() => {
  if (studentPasswordScore.value === 3) return 'bg-emerald-500'
  if (studentPasswordScore.value === 2) return 'bg-amber-500'
  return 'bg-rose-500'
})

async function handleStudentChangePassword() {
  if (!isStudentPasswordValid.value) {
    alert('Harap penuhi semua syarat keamanan password sebelum menyimpan.')
    return
  }

  isChangingStudentPass.value = true
  const res = await authStore.changeUserPassword(studentPasswordForm.value.newPassword)
  isChangingStudentPass.value = false

  if (res.success) {
    if (authStore.user?.id) {
      await attendanceStore.updateStudent(authStore.user.id, { password: studentPasswordForm.value.newPassword })
    }
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.6 }
    })
    alert('Password akun Anda berhasil diperbarui! Gunakan password baru ini saat masuk ke sistem selanjutnya.')
    studentPasswordForm.value.newPassword = ''
  } else {
    alert(res.message || 'Gagal mengubah password.')
  }
}

function triggerFileInput() {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

function handleFileChange(event) {
  const file = event.target.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    alert('Harap pilih file gambar (JPG, PNG, atau WEBP).')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    alert('Ukuran file maksimal 5MB.')
    return
  }

  attachmentFile.value = file
  attachmentFileName.value = file.name
  attachmentFileSize.value = (file.size / 1024).toFixed(1) + ' KB'

  const reader = new FileReader()
  reader.onload = (e) => {
    attachmentPreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

function removeAttachment() {
  attachmentFile.value = null
  attachmentPreview.value = null
  attachmentFileName.value = ''
  attachmentFileSize.value = ''
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

function openAttachmentModal(imageUrl) {
  previewModalImage.value = imageUrl
  isPreviewModalOpen.value = true
}

function closeAttachmentModal() {
  isPreviewModalOpen.value = false
  previewModalImage.value = ''
}

// === MANAJEMEN SESI MATA PELAJARAN SEMI-OTOMATIS (SESUAI KELAS SISWA & JAM PELAJARAN) ===
const studentClass = computed(() => authStore.user?.kelas || '')

const studentClassSubjects = computed(() => {
  const cls = studentClass.value
  const list = []
  const teachers = attendanceStore.teachers || []

  teachers.forEach(t => {
    const teachesThisClass = (t.kelas_diajar && t.kelas_diajar.includes(cls)) || (t.jadwal_kelas && t.jadwal_kelas[cls])
    if (teachesThisClass) {
      const sched = t.jadwal_kelas?.[cls]
      const rawSubjects = sched?.mata_pelajaran || t.mata_pelajaran || 'Umum'
      const subs = String(rawSubjects).split(/[,;/]/).map(s => s.trim()).filter(Boolean)
      
      subs.forEach(subName => {
        if (!list.some(item => item.name.toLowerCase() === subName.toLowerCase())) {
          list.push({
            name: subName,
            guru: t.nama_lengkap,
            jam_masuk: sched?.jam_masuk || t.jam_masuk_default || '07:00',
            jam_terlambat: sched?.jam_terlambat || t.jam_terlambat_default || '07:15',
            jam_pulang: sched?.jam_pulang || t.jam_pulang_default || '15:00'
          })
        }
      })
    }
  })

  // Fallback jika belum ada konfigurasi guru spesifik untuk kelas siswa ini
  if (list.length === 0) {
    list.push({
      name: 'Umum / Teori Dasar',
      guru: 'Guru Pengampu Kelas',
      jam_masuk: '07:00',
      jam_terlambat: '07:15',
      jam_pulang: '15:00'
    })
  }

  // Urutkan jadwal berdasarkan jam masuk
  return list.sort((a, b) => a.jam_masuk.localeCompare(b.jam_masuk))
})

const subjectDropdownOptions = computed(() => {
  return studentClassSubjects.value.map(sub => ({
    value: sub.name,
    label: `${sub.name} (${sub.jam_masuk} - ${sub.jam_pulang})`,
    icon: 'menu_book',
    badge: sub.guru
  }))
})

const selectedSubject = ref('')
const isSubjectAutoDetected = ref(true)

const currentSubjectSchedule = computed(() => {
  return studentClassSubjects.value.find(s => s.name === selectedSubject.value) || studentClassSubjects.value[0] || null
})

function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 0
  const [h, m] = timeStr.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

function detectCurrentSubject(force = false) {
  const list = studentClassSubjects.value
  if (!list.length) return

  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  // Cari mata pelajaran yang saat ini jamnya sedang berlangsung (jam_masuk <= now <= jam_pulang)
  const activeNow = list.find(sub => {
    const start = parseTimeToMinutes(sub.jam_masuk)
    const end = parseTimeToMinutes(sub.jam_pulang)
    return currentMinutes >= start && currentMinutes <= end
  })

  if (activeNow) {
    selectedSubject.value = activeNow.name
  } else {
    // Jika sebelum jam sekolah atau setelahnya, cari yang terdekat atau urutan pertama
    const upcoming = list.find(sub => parseTimeToMinutes(sub.jam_masuk) >= currentMinutes)
    selectedSubject.value = upcoming ? upcoming.name : list[0].name
  }

  isSubjectAutoDetected.value = true
}

function onSubjectManualChange() {
  isSubjectAutoDetected.value = false
}

// Pantau perubahan daftar mapel kelas untuk inisialisasi awal
watch(studentClassSubjects, () => {
  if (!selectedSubject.value || !studentClassSubjects.value.some(s => s.name === selectedSubject.value)) {
    detectCurrentSubject()
  }
}, { immediate: true })

const myAttendance = computed(() => {
  const todayStr = new Date().toISOString().split('T')[0]
  return attendanceStore.todayAttendances.find(a => 
    a.user_id === authStore.user?.id &&
    (a.tanggal === todayStr || !a.tanggal) &&
    (!a.mata_pelajaran || !selectedSubject.value || a.mata_pelajaran === selectedSubject.value)
  )
})

const isWithinRadius = computed(() => {
  if (currentDistance.value === null) return false
  return currentDistance.value <= attendanceStore.schoolSettings.radius_meter
})

const studentHistory = computed(() => {
  return attendanceStore.todayAttendances.filter(a => a.user_id === authStore.user?.id)
})

const studentHadirCount = computed(() => {
  return studentHistory.value.filter(a => a.status === 'hadir').length
})

const studentTerlambatCount = computed(() => {
  return studentHistory.value.filter(a => a.status === 'terlambat').length
})

// 1. Detect GPS Location
function detectLocation() {
  if (!navigator.geolocation) {
    alert('Browser tidak mendukung geolokasi.')
    return
  }

  isLocating.value = true
  navigator.geolocation.getCurrentPosition(
    (position) => {
      isLocating.value = false
      userCoords.value = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      }

      // Calculate distance using store helper
      currentDistance.value = attendanceStore.calculateDistance(
        attendanceStore.schoolSettings.latitude,
        attendanceStore.schoolSettings.longitude,
        userCoords.value.latitude,
        userCoords.value.longitude
      )

      renderMap()
    },
    (error) => {
      isLocating.value = false
      // For demo purpose, fallback to mock inside school radius
      userCoords.value = {
        latitude: attendanceStore.schoolSettings.latitude + 0.00015,
        longitude: attendanceStore.schoolSettings.longitude + 0.00015
      }
      currentDistance.value = attendanceStore.calculateDistance(
        attendanceStore.schoolSettings.latitude,
        attendanceStore.schoolSettings.longitude,
        userCoords.value.latitude,
        userCoords.value.longitude
      )
      renderMap()
    },
    { enableHighAccuracy: true, timeout: 10000 }
  )
}

function renderMap() {
  nextTick(() => {
    const el = document.getElementById('map-container')
    if (!el) return

    const schoolLat = attendanceStore.schoolSettings.latitude
    const schoolLng = attendanceStore.schoolSettings.longitude
    const radius = attendanceStore.schoolSettings.radius_meter

    if (!mapInstance) {
      mapInstance = L.map('map-container').setView([schoolLat, schoolLng], 17)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(mapInstance)
    }

    // Add school radius circle
    if (circleInstance) mapInstance.removeLayer(circleInstance)
    circleInstance = L.circle([schoolLat, schoolLng], {
      color: '#2563eb',
      fillColor: '#3b82f6',
      fillOpacity: 0.15,
      radius: radius
    }).addTo(mapInstance)

    // Add user marker
    if (userCoords.value) {
      if (markerInstance) mapInstance.removeLayer(markerInstance)
      markerInstance = L.marker([userCoords.value.latitude, userCoords.value.longitude])
        .addTo(mapInstance)
        .bindPopup('Posisi Anda Sekarang')
        .openPopup()

      mapInstance.panTo([userCoords.value.latitude, userCoords.value.longitude])
    }
  })
}

// 2. Camera Controls
async function startCamera() {
  try {
    mediaStream.value = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: 480, height: 480 }
    })
    if (videoRef.value) {
      videoRef.value.srcObject = mediaStream.value
      isCameraOpen.value = true
    }
  } catch (err) {
    alert('Tidak dapat mengakses kamera: ' + err.message)
  }
}

function takeSnapshot() {
  if (!videoRef.value || !canvasRef.value) return
  const video = videoRef.value
  const canvas = canvasRef.value
  canvas.width = video.videoWidth || 480
  canvas.height = video.videoHeight || 480
  const ctx = canvas.getContext('2d')
  
  // Mirror horizontally
  ctx.translate(canvas.width, 0)
  ctx.scale(-1, 1)
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
  
  capturedPhoto.value = canvas.toDataURL('image/jpeg', 0.8)
  stopCamera()
}

function retakePhoto() {
  capturedPhoto.value = null
  startCamera()
}

function stopCamera() {
  if (mediaStream.value) {
    mediaStream.value.getTracks().forEach(track => track.stop())
    mediaStream.value = null
  }
  isCameraOpen.value = false
}

function handleCancelCameraOrPhoto() {
  stopCamera()
  capturedPhoto.value = null
}

function cancelPresensiAndGoToHistory() {
  handleCancelCameraOrPhoto()
  activeTab.value = 'riwayat'
  localStorage.setItem('presensi_tab_siswa', 'riwayat')
}

onBeforeUnmount(() => {
  stopCamera()
})

// 3. Submit Attendance
async function handleSubmitAttendance() {
  if (!userCoords.value || !capturedPhoto.value) return
  isSubmitting.value = true

  const res = await attendanceStore.submitAttendanceGps(
    authStore.user,
    userCoords.value,
    capturedPhoto.value,
    selectedSubject.value
  )
  isSubmitting.value = false

  if (res.success) {
    // 1. Reset kamera & foto agar bersih untuk presensi berikutnya
    stopCamera()
    capturedPhoto.value = null

    // 2. Efek selebrasi confetti
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } })
    } catch (e) {}

    alert(res.message)

    // 3. Otomatis redirect ke tab Riwayat Kehadiran
    activeTab.value = 'riwayat'
    localStorage.setItem('presensi_tab_siswa', 'riwayat')
  } else {
    alert(res.message)
  }
}

// 4. Generate QR Code on Tab 2
async function generateQrCode() {
  const token = authStore.user?.qr_token
  if (!token) return
  try {
    qrCodeDataUrl.value = await QRCode.toDataURL(token, {
      width: 180,
      margin: 1,
      color: { dark: '#0f172a', light: '#ffffff' }
    })
  } catch (err) {
    console.error('Failed to generate QR code:', err)
  }
}

watch(
  () => authStore.user?.qr_token,
  () => {
    generateQrCode()
  },
  { immediate: true }
)

watch(activeTab, (tab) => {
  localStorage.setItem('presensi_tab_siswa', tab)
  if (tab === 'kartu') {
    generateQrCode()
  }
  // Matikan kamera dan bersihkan snapshot jika berpindah ke tab selain presensi
  if (tab !== 'presensi') {
    stopCamera()
    capturedPhoto.value = null
  }
})

// 5. Submit Permit Form
async function handleApplyPermit() {
  if (permitForm.value.jenis === 'sakit' && !attachmentPreview.value) {
    const confirmWithout = confirm('Pengajuan sakit biasanya memerlukan surat keterangan dokter. Apakah Anda yakin ingin mengirim tanpa lampiran?')
    if (!confirmWithout) return
  }

  isSubmitting.value = true

  await attendanceStore.submitLeaveRequest({
    user_id: authStore.user.id,
    nama_lengkap: authStore.user.nama_lengkap,
    kelas: authStore.user.kelas,
    tanggal_mulai: permitForm.value.tanggal,
    tanggal_selesai: permitForm.value.tanggal,
    jenis: permitForm.value.jenis,
    keterangan: permitForm.value.keterangan,
    bukti_surat_url: attachmentPreview.value
  })

  isSubmitting.value = false
  alert('Permohonan izin berhasil dikirim ke guru!')
  permitForm.value.keterangan = ''
  removeAttachment()
}

onMounted(() => {
  detectLocation()
  generateQrCode()
})
</script>

<style scoped>
.mirror-mode {
  transform: scaleX(-1);
}
</style>

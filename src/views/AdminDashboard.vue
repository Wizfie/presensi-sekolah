<template>
  <div class="min-h-screen bg-slate-50 md:flex">
    <!-- Mobile Navbar with Hamburger -->
    <Navbar class="no-print" @open-drawer="isDrawerOpen = true" />

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
    <main class="flex-1 min-w-0 p-4 sm:p-6 space-y-6 overflow-y-auto pb-24 md:pb-6">
      <!-- Admin Header (Kontekstual sesuai tab aktif) -->
      <div class="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div class="flex items-center gap-2">
            <span class="material-icons text-blue-600 text-xl">{{ currentTabMeta.icon }}</span>
            <h2 class="text-xl font-bold text-slate-900">{{ currentTabMeta.title }}</h2>
          </div>
          <p class="text-xs sm:text-sm text-slate-500 mt-1">
            {{ currentTabMeta.desc }}
          </p>
        </div>
      </div>

      <!-- TAB 1: MANAJEMEN DATA SISWA (CRUD) -->
      <div v-if="activeTab === 'siswa'" class="space-y-4">
        <!-- Siswa Contextual Summary Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div class="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <p class="text-xs font-semibold text-slate-500 uppercase">Total Siswa Terdaftar</p>
            <div class="flex items-center justify-between mt-1">
              <span class="text-2xl font-bold text-slate-900">{{ attendanceStore.students.length }}</span>
              <span class="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">Siswa</span>
            </div>
          </div>
          <div class="bg-white p-4 rounded-xl border border-indigo-100 shadow-xs">
            <p class="text-xs font-semibold text-indigo-600 uppercase">Total Kelas / Rombel</p>
            <div class="flex items-center justify-between mt-1">
              <span class="text-2xl font-bold text-indigo-700">{{ attendanceStore.allClasses.length }}</span>
              <span class="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-medium">Kelas</span>
            </div>
          </div>
          <div class="bg-white p-4 rounded-xl border border-emerald-100 shadow-xs">
            <p class="text-xs font-semibold text-emerald-600 uppercase">Token QR Aktif</p>
            <div class="flex items-center justify-between mt-1">
              <span class="text-2xl font-bold text-emerald-700">{{ attendanceStore.students.filter(s => s.qr_token).length }}</span>
              <span class="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">100% Siap</span>
            </div>
          </div>
          <div class="bg-white p-4 rounded-xl border border-amber-100 shadow-xs">
            <p class="text-xs font-semibold text-amber-600 uppercase">Hasil Filter</p>
            <div class="flex items-center justify-between mt-1">
              <span class="text-2xl font-bold text-amber-700">{{ filteredStudents.length }}</span>
              <span class="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">Ditampilkan</span>
            </div>
          </div>
        </div>

        <Card title="Daftar Siswa & Pengguna" description="Kelola data induk siswa, NISN, kelas, dan token QR kartu">
          <template #action>
            <div class="flex items-center gap-2">
              <button
                v-if="attendanceStore.deletedStudents.length > 0"
                type="button"
                @click="openTrashModal('siswa')"
                class="px-2.5 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium inline-flex items-center gap-1 transition cursor-pointer"
                title="Lihat siswa yang dinonaktifkan (Soft Delete)"
              >
                <span class="material-icons text-sm text-slate-500">delete_outline</span>
                <span>Sampah ({{ attendanceStore.deletedStudents.length }})</span>
              </button>
              <Button size="sm" variant="default" @click="openCreateStudentModal">
                + Tambah Siswa Baru
              </Button>
            </div>
          </template>

          <!-- Search & Filter Controls -->
          <div class="flex flex-col sm:flex-row gap-3 mb-4">
            <div class="relative flex-1">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Cari nama siswa atau NISN..."
                class="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <div class="flex gap-2 items-center">
              <CustomDropdown
                v-model="selectedClassFilter"
                :options="classFilterOptions"
                title="Filter Kelas Siswa"
                icon="school"
                size="md"
              />
              <button
                type="button"
                @click="openAddClassModal('filter')"
                title="Tambah rombel / kelas baru ke sistem"
                class="h-9 px-3 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl border border-blue-200 font-semibold cursor-pointer transition-colors whitespace-nowrap inline-flex items-center gap-1 shadow-2xs"
              >
                <span class="material-icons text-xs">add</span>
                <span>Kelas Baru</span>
              </button>
            </div>
          </div>

          <!-- Table Desktop View -->
          <div class="hidden md:block overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-600">
              <thead class="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th class="py-3 px-4">Nama Siswa</th>
                  <th class="py-3 px-4">NISN</th>
                  <th class="py-3 px-2 text-center w-14" title="Jenis Kelamin (Laki-laki / Perempuan)">L/P</th>
                  <th class="py-3 px-4">Kelas</th>
                  <th class="py-3 px-4">Token QR</th>
                  <th class="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="std in filteredStudents" :key="std.id" class="hover:bg-slate-50/50">
                  <td class="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2.5">
                    <img v-if="std.foto_profil_url" :src="std.foto_profil_url" class="w-8 h-8 rounded-full object-cover border border-slate-200" />
                    <div v-else class="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 border border-blue-700 select-none">
                      {{ getInitials(std.nama_lengkap) }}
                    </div>
                    <span>{{ std.nama_lengkap }}</span>
                  </td>
                  <td class="py-3 px-4 font-mono font-medium">{{ std.nomor_induk }}</td>
                  <td class="py-3 px-2 text-center" :title="std.jenis_kelamin === 'P' ? 'Perempuan' : 'Laki-laki'">
                    <span
                      class="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[11px] font-bold"
                      :class="std.jenis_kelamin === 'P' ? 'bg-pink-50 text-pink-700 border border-pink-200' : 'bg-blue-50 text-blue-700 border border-blue-200'"
                    >
                      {{ std.jenis_kelamin === 'P' ? '♀ P' : '♂ L' }}
                    </span>
                  </td>
                  <td class="py-3 px-4 font-medium">{{ std.kelas }}</td>
                  <td class="py-3 px-4 font-mono text-[11px] text-blue-600 truncate max-w-[130px]">
                    {{ std.qr_token }}
                  </td>
                  <td class="py-3 px-4">
                    <div class="flex items-center justify-center gap-2">
                      <button
                        @click="openEditStudentModal(std)"
                        class="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        @click="deleteStudentConfirm(std)"
                        class="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-medium cursor-pointer transition-colors"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="filteredStudents.length === 0">
                  <td colspan="6" class="py-8 text-center text-slate-400 text-xs">
                    Tidak ada data siswa yang cocok dengan pencarian.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile ListView (Flutter ListTile Style) -->
          <div class="md:hidden space-y-2.5">
            <MobileListItem
              v-for="std in filteredStudents"
              :key="std.id"
              :title="std.nama_lengkap"
              :subtitle="`NISN: ${std.nomor_induk} • Kelas: ${std.kelas} • ${std.jenis_kelamin === 'P' ? '♀ Perempuan' : '♂ Laki-laki'}`"
              :badge="std.qr_token ? 'QR Siap' : 'Belum QR'"
              :badgeVariant="std.qr_token ? 'success' : 'default'"
              :avatarUrl="std.foto_profil_url"
              :initials="getInitials(std.nama_lengkap)"
              @click="openStudentDetailSheet(std)"
            />

            <div v-if="filteredStudents.length === 0" class="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-200">
              Tidak ada data siswa yang cocok dengan pencarian.
            </div>
          </div>
        </Card>
      </div>

      <!-- TAB MANAJEMEN GURU & ALOKASI KELAS (GURU PIKET & TUTOR) -->
      <div v-else-if="activeTab === 'guru'" class="space-y-4">
        <!-- Guru Contextual Summary Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div class="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <p class="text-xs font-semibold text-slate-500 uppercase">Total Guru &amp; Piket</p>
            <div class="flex items-center justify-between mt-1">
              <span class="text-2xl font-bold text-slate-900">{{ attendanceStore.teachers.length }}</span>
              <span class="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">Pendidik / Piket</span>
            </div>
          </div>
          <div class="bg-white p-4 rounded-xl border border-indigo-100 shadow-xs">
            <p class="text-xs font-semibold text-indigo-600 uppercase">Metode Presensi Aktif</p>
            <div class="flex items-center justify-between mt-1">
              <span class="text-lg font-bold text-indigo-700">QR &amp; Manual</span>
              <span class="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-medium">Bebas Lokasi</span>
            </div>
          </div>
          <div class="bg-white p-4 rounded-xl border border-emerald-100 shadow-xs">
            <p class="text-xs font-semibold text-emerald-600 uppercase">Rombel Tercover</p>
            <div class="flex items-center justify-between mt-1">
              <span class="text-2xl font-bold text-emerald-700">{{ coveredClassesCount }}</span>
              <span class="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">Kelas</span>
            </div>
          </div>
        </div>

        <Card title="Daftar Guru Piket &amp; Tutor PKBM" description="Kelola data guru piket, hak akses scanner QR meja piket, dan alokasi kelas yang dikelola">
          <template #action>
            <div class="flex items-center gap-2">
              <button
                v-if="attendanceStore.deletedTeachers.length > 0"
                type="button"
                @click="openTrashModal('guru')"
                class="px-2.5 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium inline-flex items-center gap-1 transition cursor-pointer"
                title="Lihat guru yang dinonaktifkan (Soft Delete)"
              >
                <span class="material-icons text-sm text-slate-500">delete_outline</span>
                <span>Sampah ({{ attendanceStore.deletedTeachers.length }})</span>
              </button>
              <Button size="sm" variant="default" @click="openAddTeacherModal">
                + Tambah Guru Piket / Tutor
              </Button>
            </div>
          </template>

          <!-- Search Bar Guru -->
          <div class="mb-4">
            <div class="relative max-w-md">
              <input
                v-model="searchTeacherQuery"
                type="text"
                placeholder="Cari nama guru, NIP, peran tugas, atau email..."
                class="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
          </div>

          <!-- Desktop Table View -->
          <div class="hidden md:block overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-600">
              <thead class="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th class="py-3 px-4">Nama Guru / Tutor</th>
                  <th class="py-3 px-4">NIP / Email</th>
                  <th class="py-3 px-4">Peran &amp; Tugas</th>
                  <th class="py-3 px-4">Alokasi Kelas Dikelola</th>
                  <th class="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="t in filteredTeachers" :key="t.id" class="hover:bg-slate-50/50">
                  <td class="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2.5">
                    <img v-if="t.foto_profil_url" :src="t.foto_profil_url" class="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0" />
                    <div v-else class="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 border border-blue-700 select-none">
                      {{ getInitials(t.nama_lengkap) }}
                    </div>
                    <div>
                      <span class="font-bold text-slate-900">{{ t.nama_lengkap }}</span>
                      <span class="block text-[11px] text-slate-400 font-normal">Guru Piket / Tutor</span>
                    </div>
                  </td>
                  <td class="py-3 px-4 font-mono">
                    <p class="text-slate-800 font-medium">{{ t.nomor_induk }}</p>
                    <p class="text-[11px] text-slate-400 font-sans">{{ t.email }}</p>
                  </td>
                  <td class="py-3 px-4 font-medium">
                    <div class="flex flex-wrap gap-1">
                      <span
                        v-for="sub in formatSubjects(t.mata_pelajaran)"
                        :key="sub"
                        class="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-semibold"
                      >
                        {{ sub }}
                      </span>
                    </div>
                  </td>
                  <td class="py-3 px-4">
                    <div class="flex flex-wrap gap-1">
                      <span
                        v-for="cls in t.kelas_diajar"
                        :key="cls"
                        class="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-medium"
                      >
                        {{ cls }}
                      </span>
                    </div>
                  </td>
                  <td class="py-3 px-4">
                    <div class="flex items-center justify-center gap-2">
                      <button
                        @click="openEditTeacherModal(t)"
                        class="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        @click="deleteTeacherConfirm(t)"
                        class="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-medium cursor-pointer transition-colors"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="filteredTeachers.length === 0">
                  <td colspan="5" class="py-8 text-center text-slate-400 text-xs">
                    {{ attendanceStore.teachers.length === 0 ? 'Belum ada data guru piket / tutor. Klik tombol "+ Tambah Guru Piket / Tutor" di atas.' : 'Tidak ada data guru yang cocok dengan pencarian.' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile ListView (Flutter ListTile Style) -->
          <div class="md:hidden space-y-2.5">
            <MobileListItem
              v-for="t in filteredTeachers"
              :key="t.id"
              :title="t.nama_lengkap"
              :subtitle="`NIP: ${t.nomor_induk} • ${t.mata_pelajaran}`"
              :extra="`Kelas Dikelola: ${t.kelas_diajar?.join(', ') || '-'}`"
              :avatarUrl="t.foto_profil_url"
              :initials="getInitials(t.nama_lengkap)"
              @click="openTeacherDetailSheet(t)"
            />

            <div v-if="filteredTeachers.length === 0" class="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-200">
              {{ attendanceStore.teachers.length === 0 ? 'Belum ada data guru piket / tutor.' : 'Tidak ada data guru yang cocok dengan pencarian.' }}
            </div>
          </div>
        </Card>
      </div>

      <!-- TAB: MANAJEMEN ADMINISTRATOR & STAF TU (CRUD) -->
      <div v-else-if="activeTab === 'admin'" class="space-y-4">
        <!-- Admin Summary Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div class="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <p class="text-xs font-semibold text-slate-500 uppercase">Total Administrator</p>
            <div class="flex items-center justify-between mt-1">
              <span class="text-2xl font-bold text-slate-900">{{ attendanceStore.admins?.length || 0 }}</span>
              <span class="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-medium">Akun</span>
            </div>
          </div>
          <div class="bg-white p-4 rounded-xl border border-purple-100 shadow-xs">
            <p class="text-xs font-semibold text-purple-600 uppercase">Super Admin / Root</p>
            <div class="flex items-center justify-between mt-1">
              <span class="text-2xl font-bold text-purple-700">
                {{ attendanceStore.admins?.filter(a => a.is_root).length || 1 }}
              </span>
              <span class="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full font-medium">Root</span>
            </div>
          </div>
          <div class="bg-white p-4 rounded-xl border border-blue-100 shadow-xs">
            <p class="text-xs font-semibold text-blue-600 uppercase">Staf Tata Usaha</p>
            <div class="flex items-center justify-between mt-1">
              <span class="text-2xl font-bold text-blue-700">
                {{ attendanceStore.admins?.filter(a => !a.is_root).length || 0 }}
              </span>
              <span class="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">Staf</span>
            </div>
          </div>
          <div class="bg-white p-4 rounded-xl border border-emerald-100 shadow-xs">
            <p class="text-xs font-semibold text-emerald-600 uppercase">Akun Anda Saat Ini</p>
            <div class="flex items-center justify-between mt-1">
              <span class="text-xs sm:text-sm font-bold text-slate-800 truncate max-w-[130px]" :title="authStore.user?.nama_lengkap">
                {{ authStore.user?.nama_lengkap?.split(',')[0] || 'Administrator' }}
              </span>
              <span class="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full font-semibold border border-emerald-200">
                Aktif
              </span>
            </div>
          </div>
        </div>

        <!-- Toolbar: Search & Tambah Admin -->
        <Card>
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div class="relative flex-1">
              <span class="material-icons absolute left-3 top-2.5 text-slate-400 text-lg">search</span>
              <input
                v-model="adminSearchQuery"
                type="text"
                placeholder="Cari nama administrator, NIK, jabatan, atau email..."
                class="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
            <div class="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                class="inline-flex items-center gap-1.5 font-bold shadow-2xs whitespace-nowrap bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                @click="openCreateAdminModal"
              >
                <span class="material-icons text-sm">person_add</span>
                <span>Tambah Admin</span>
              </Button>
            </div>
          </div>
        </Card>

        <!-- Admin Table & Mobile Cards -->
        <Card title="Daftar Administrator & Staf Tata Usaha" description="Pengguna dengan hak akses level administrator sekolah">
          <!-- Desktop Table View -->
          <div class="hidden md:block overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-600">
              <thead class="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                <tr>
                  <th class="py-3 px-4">Administrator</th>
                  <th class="py-3 px-4">Kontak & Email</th>
                  <th class="py-3 px-4">Jabatan / Level</th>
                  <th class="py-3 px-4">Status Sesi</th>
                  <th class="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="adm in filteredAdmins" :key="adm.id" class="hover:bg-slate-50/60 transition-colors">
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
                        {{ getInitials(adm.nama_lengkap) }}
                      </div>
                      <div class="min-w-0">
                        <div class="flex items-center gap-1.5">
                          <p class="font-bold text-slate-800 text-xs truncate">{{ adm.nama_lengkap }}</p>
                          <span
                            v-if="adm.is_root"
                            class="px-1.5 py-0.2 bg-purple-100 text-purple-700 text-[9px] font-bold rounded-sm border border-purple-200"
                            title="Super Administrator Sistem"
                          >
                            ROOT
                          </span>
                        </div>
                        <p class="text-[11px] text-slate-400 font-mono">ID/NIK: {{ adm.nomor_induk }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-1 text-slate-600">
                      <span class="material-icons text-xs text-slate-400">email</span>
                      <span class="text-xs truncate">{{ adm.email }}</span>
                    </div>
                  </td>
                  <td class="py-3 px-4">
                    <span
                      class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                      :class="adm.is_root ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-blue-50 text-blue-700 border border-blue-200'"
                    >
                      <span class="material-icons text-xs">{{ adm.is_root ? 'verified_user' : 'badge' }}</span>
                      <span>{{ adm.jabatan || (adm.is_root ? 'Super Administrator' : 'Staf Tata Usaha') }}</span>
                    </span>
                  </td>
                  <td class="py-3 px-4">
                    <span
                      v-if="authStore.user?.id === adm.id || authStore.user?.email === adm.email"
                      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
                    >
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Sedang Login</span>
                    </span>
                    <span v-else class="text-[11px] text-slate-400">
                      Aktif
                    </span>
                  </td>
                  <td class="py-3 px-4 text-right">
                    <div class="flex items-center justify-end gap-1">
                      <!-- Edit -->
                      <button
                        type="button"
                        class="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                        title="Edit Data Administrator"
                        @click="openEditAdminModal(adm)"
                      >
                        <span class="material-icons text-base">edit</span>
                      </button>

                      <!-- Reset Password -->
                      <button
                        type="button"
                        class="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                        title="Buat Password Sementara Baru"
                        @click="resetAdminPasswordConfirm(adm)"
                      >
                        <span class="material-icons text-base">lock_reset</span>
                      </button>

                      <!-- Hapus (Proteksi Root & Akun Sendiri) -->
                      <button
                        v-if="!adm.is_root && authStore.user?.id !== adm.id && authStore.user?.email !== adm.email"
                        type="button"
                        class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Hapus Akun Administrator"
                        @click="deleteAdminConfirm(adm)"
                      >
                        <span class="material-icons text-base">delete_outline</span>
                      </button>
                      <span
                        v-else
                        class="p-1.5 text-slate-200 cursor-not-allowed"
                        :title="adm.is_root ? 'Akun Super Admin dilindungi' : 'Tidak dapat menghapus akun sendiri'"
                      >
                        <span class="material-icons text-base">lock</span>
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile Cards View -->
          <div class="md:hidden space-y-2.5">
            <div
              v-for="adm in filteredAdmins"
              :key="adm.id"
              class="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200 space-y-3"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <div class="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {{ getInitials(adm.nama_lengkap) }}
                  </div>
                  <div>
                    <div class="flex items-center gap-1.5">
                      <p class="font-bold text-slate-800 text-xs">{{ adm.nama_lengkap }}</p>
                      <span v-if="adm.is_root" class="px-1.5 py-0.2 bg-purple-100 text-purple-700 text-[9px] font-bold rounded-sm">ROOT</span>
                    </div>
                    <p class="text-[10px] text-slate-400 font-mono">ID: {{ adm.nomor_induk }}</p>
                  </div>
                </div>
                <span
                  v-if="authStore.user?.id === adm.id || authStore.user?.email === adm.email"
                  class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200"
                >
                  Sedang Login
                </span>
              </div>

              <div class="flex flex-col gap-1 text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100">
                <div class="flex items-center gap-1.5">
                  <span class="material-icons text-xs text-slate-400">badge</span>
                  <span class="font-medium text-slate-700">{{ adm.jabatan || 'Staf Tata Usaha' }}</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="material-icons text-xs text-slate-400">email</span>
                  <span class="truncate">{{ adm.email }}</span>
                </div>
              </div>

              <div class="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-200/60">
                <button
                  type="button"
                  class="px-2.5 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg inline-flex items-center gap-1 hover:bg-slate-50 cursor-pointer"
                  @click="openEditAdminModal(adm)"
                >
                  <span class="material-icons text-xs text-blue-500">edit</span>
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  class="px-2.5 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg inline-flex items-center gap-1 hover:bg-slate-50 cursor-pointer"
                  @click="resetAdminPasswordConfirm(adm)"
                >
                  <span class="material-icons text-xs text-amber-500">lock_reset</span>
                  <span>Reset Pass</span>
                </button>
                <button
                  v-if="!adm.is_root && authStore.user?.id !== adm.id && authStore.user?.email !== adm.email"
                  type="button"
                  class="px-2.5 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg inline-flex items-center gap-1 hover:bg-rose-100 cursor-pointer"
                  @click="deleteAdminConfirm(adm)"
                >
                  <span class="material-icons text-xs">delete</span>
                  <span>Hapus</span>
                </button>
              </div>
            </div>

            <div v-if="filteredAdmins.length === 0" class="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-200">
              Tidak ada data administrator yang cocok dengan pencarian.
            </div>
          </div>
        </Card>
      </div>

      <!-- TAB 3: CETAK KARTU ID QR SISWA (SIAP PRINT A4) -->
      <div v-else-if="activeTab === 'kartu'" class="space-y-4">
        <!-- Control Toolbar (Hanya Tampil di Layar, Sembunyi Saat Print) -->
        <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 no-print">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 class="text-base font-bold text-slate-900">Format Kartu ID Siswa (Siap Cetak Kertas A4)</h3>
              <p class="text-xs text-slate-500 mt-0.5">
                Cetak kartu fisik barcode QR siswa tanpa tampilan halaman admin. Bisa per kelas atau pilih siswa tertentu.
              </p>
            </div>
            
            <div class="flex items-center gap-2">
              <Button
                type="button"
                @click="triggerPrint"
                size="default"
                variant="default"
                :disabled="selectedCardIds.length === 0"
                class="gap-1.5"
              >
                <span class="material-icons text-sm">print</span>
                <span>Cetak Kartu ({{ selectedCardIds.length }})</span>
              </Button>
            </div>
          </div>

          <!-- Filter & Multi-Select Action Bar -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
            <div class="flex items-center gap-2.5 flex-wrap">
              <!-- Filter Kelas -->
              <div class="flex items-center gap-1.5">
                <span class="text-slate-600 font-semibold">Filter Kelas:</span>
                <CustomDropdown
                  v-model="printCardClassFilter"
                  :options="printCardClassOptions"
                  title="Filter Kelas Cetak"
                  icon="school"
                  size="sm"
                />
              </div>

              <!-- Search Siswa di Tab Cetak -->
              <div class="relative w-44">
                <input
                  v-model="printCardSearchQuery"
                  type="text"
                  placeholder="Cari nama / NISN..."
                  class="w-full h-8 pl-7 pr-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-slate-500 text-[11px]">
                Terpilih: <strong class="text-blue-600 font-bold">{{ selectedCardIds.length }}</strong> dari {{ filteredCardStudents.length }} siswa
              </span>
              <button
                type="button"
                @click="selectAllCards"
                class="px-2.5 py-1 text-xs rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold cursor-pointer transition-colors"
              >
                Pilih Semua
              </button>
              <button
                v-if="selectedCardIds.length > 0"
                type="button"
                @click="clearSelectedCards"
                class="px-2 py-1 text-xs rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
              >
                Batal Pilih
              </button>
            </div>
          </div>
        </div>

        <!-- Grid of ID Cards (Printable Area) -->
        <div 
          id="printable-cards-area" 
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <div
            v-for="std in filteredCardStudents"
            :key="std.id"
            :class="[
              'id-card-print-item bg-white rounded-2xl border-2 p-4 shadow-sm relative overflow-hidden flex flex-col justify-between transition-all',
              selectedCardIds.includes(std.id) ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md' : 'border-slate-200',
              !selectedCardIds.includes(std.id) ? 'print-hide-card' : ''
            ]"
          >
            <!-- Checkbox Pemilihan Kartu (no-print) -->
            <div class="no-print absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-white/95 backdrop-blur-xs px-2 py-1 rounded-lg border border-slate-200 shadow-2xs">
              <input
                type="checkbox"
                :id="'chk-' + std.id"
                :value="std.id"
                v-model="selectedCardIds"
                class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label :for="'chk-' + std.id" class="text-[10px] font-bold text-slate-600 cursor-pointer select-none">
                {{ selectedCardIds.includes(std.id) ? 'Terpilih' : 'Pilih' }}
              </label>
            </div>

            <!-- Card Header -->
            <div class="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3 pr-16 sm:pr-0">
              <div class="flex items-center gap-2">
                <img src="/logo.png" alt="Logo PKBM" class="w-7 h-7 object-contain shrink-0" />
                <div>
                  <h4 class="text-[11px] font-bold text-slate-900 leading-none">{{ attendanceStore.schoolSettings.nama_sekolah }}</h4>
                  <p class="text-[9px] text-slate-500 mt-0.5">KARTU PRESENSI RESMI &bull; TP {{ attendanceStore.activeAcademicYear }}</p>
                </div>
              </div>
            </div>

            <!-- Card Body -->
            <div class="flex gap-3 items-center">
              <img
                v-if="std.foto_profil_url"
                :src="std.foto_profil_url"
                alt="Foto"
                class="w-16 h-20 rounded-lg object-cover border border-slate-200 shadow-xs shrink-0"
              />
              <div
                v-else
                class="w-16 h-20 rounded-lg bg-slate-100 border border-slate-200 shadow-xs shrink-0 flex items-center justify-center text-slate-700 font-bold text-base select-none print:border-slate-300"
              >
                {{ getInitials(std.nama_lengkap) }}
              </div>
              <div class="text-xs space-y-1 flex-1 min-w-0">
                <div>
                  <span class="text-[9px] uppercase font-bold text-slate-400">Nama Siswa</span>
                  <p class="font-bold text-slate-900 truncate leading-tight">{{ std.nama_lengkap }}</p>
                </div>
                <div>
                  <span class="text-[9px] uppercase font-bold text-slate-400">NISN / Kelas</span>
                  <p class="font-mono text-slate-700 text-xs">{{ std.nomor_induk }} &bull; {{ std.kelas }}</p>
                </div>
              </div>
            </div>

            <!-- Card QR Code Section -->
            <div class="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p class="text-[10px] font-bold text-slate-800">QR Presensi Siswa</p>
                <p class="text-[9px] text-slate-400 mt-0.5">Pindai untuk presensi harian</p>
                <button
                  @click="resetToken(std.id)"
                  class="no-print text-[10px] text-rose-600 hover:underline mt-1 block font-medium cursor-pointer"
                >
                  Reset Token Baru
                </button>
              </div>
              <div class="p-1 bg-white rounded-xl border border-slate-200 shrink-0 shadow-2xs">
                <canvas :ref="el => renderStudentQr(el, std.qr_token)" class="w-14 h-14 block"></canvas>
              </div>
            </div>
          </div>
        </div>

        <div v-if="filteredCardStudents.length === 0" class="p-12 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
          Tidak ada data kartu siswa untuk filter ini.
        </div>
      </div>

      <!-- TAB 4: PENGATURAN TITIK GPS & RADIUS JARAK -->
      <div v-else-if="activeTab === 'settings'" class="w-full space-y-6">
        <!-- Status Geofencing Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div class="bg-white p-4 rounded-xl border border-emerald-100 shadow-xs">
            <p class="text-xs font-semibold text-emerald-600 uppercase">Radius Geofencing Aktif</p>
            <div class="flex items-center justify-between mt-1">
              <span class="text-2xl font-bold text-emerald-700">{{ settingsForm.radius_meter }}m</span>
              <span class="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">Toleransi</span>
            </div>
            <p class="text-[11px] text-slate-400 mt-1">Siswa di luar jarak ini otomatis ditolak</p>
          </div>
          <div class="bg-white p-4 rounded-xl border border-blue-100 shadow-xs">
            <p class="text-xs font-semibold text-blue-600 uppercase">Titik Pusat Koordinat</p>
            <div class="flex items-center justify-between mt-1">
              <span class="text-sm font-bold text-blue-900 font-mono">{{ Number(settingsForm.latitude).toFixed(4) }}, {{ Number(settingsForm.longitude).toFixed(4) }}</span>
              <span class="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">GPS</span>
            </div>
            <p class="text-[11px] text-slate-400 mt-1 truncate">{{ settingsForm.nama_sekolah }}</p>
          </div>
          <div class="bg-white p-4 rounded-xl border border-indigo-100 shadow-xs">
            <p class="text-xs font-semibold text-indigo-600 uppercase">Mode Validasi Presensi</p>
            <div class="flex items-center justify-between mt-1">
              <span class="text-base font-bold text-indigo-700">GPS High Accuracy</span>
              <span class="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">Aktif</span>
            </div>
            <p class="text-[11px] text-slate-400 mt-1">Deteksi jarak otomatis saat siswa presensi</p>
          </div>
        </div>

        <!-- 2-Column Responsive Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- Kolom Form (7 Kolom) -->
          <div class="lg:col-span-7 space-y-6">
            <Card title="Konfigurasi Koordinat & Radius" description="Atur nama instansi, titik koordinat acuan sekolah, dan batas radius toleransi">
              <form @submit.prevent="saveSettings" class="space-y-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Nama Sekolah</label>
                  <input v-model="settingsForm.nama_sekolah" type="text" required class="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>

                <!-- Tahun Pelajaran Aktif (Dinamis & Berkelanjutan) -->
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <label class="block text-xs font-semibold text-slate-700">Tahun Pelajaran (TP) Aktif</label>
                    <span class="text-[11px] text-blue-600 font-medium">Otomatis &amp; Dinamis</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <select
                      v-model="settingsForm.tahun_pelajaran"
                      class="flex-1 h-10 px-3 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-semibold text-slate-800 cursor-pointer"
                    >
                      <option v-for="tp in dynamicAcademicYearOptions" :key="tp" :value="tp">
                        Tahun Pelajaran {{ tp }} {{ tp === currentAutoAcademicYear ? '(Tahun Berjalan Saat Ini)' : '' }}
                      </option>
                    </select>
                    <button
                      type="button"
                      @click="settingsForm.tahun_pelajaran = currentAutoAcademicYear"
                      class="h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold inline-flex items-center gap-1 shrink-0 transition cursor-pointer"
                      title="Set ke Tahun Pelajaran Berjalan Saat Ini"
                    >
                      <span class="material-icons text-xs text-blue-600">auto_mode</span>
                      <span>Tahun Sekarang</span>
                    </button>
                  </div>
                  <p class="text-[11px] text-slate-400 mt-1">
                    Tahun pelajaran aktif ini akan otomatis menjadi acuan seluruh kartu siswa, rekapitulasi, dan berkas cetak tanpa perlu ubah manual.
                  </p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1">Koordinat Latitude (Lintang)</label>
                    <input v-model.number="settingsForm.latitude" type="number" step="any" required class="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono" />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1">Koordinat Longitude (Bujur)</label>
                    <input v-model.number="settingsForm.longitude" type="number" step="any" required class="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono" />
                  </div>
                </div>

                <!-- Tombol Ambil Lokasi Perangkat -->
                <div>
                  <Button type="button" size="sm" variant="outline" @click="fetchCurrentCoords" :loading="isFetchingCoords" class="inline-flex items-center gap-1.5">
                    <span class="material-icons text-sm">my_location</span>
                    <span>Ambil Koordinat Perangkat Saya Saat Ini</span>
                  </Button>
                  <p class="text-[11px] text-slate-400 mt-1">Mengambil koordinat akurat GPS dari sensor browser / HP Anda saat ini</p>
                </div>

                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Radius Toleransi Presensi (Meter)</label>
                  <input v-model.number="settingsForm.radius_meter" type="number" min="10" max="500" required class="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  
                  <!-- Quick Preset Buttons -->
                  <div class="flex items-center gap-1.5 mt-2 flex-wrap">
                    <span class="text-[11px] text-slate-500 mr-1">Preset cepat:</span>
                    <button
                      type="button"
                      v-for="r in [30, 50, 100, 150, 200]"
                      :key="r"
                      @click="settingsForm.radius_meter = r"
                      :class="['px-2.5 py-1 text-xs rounded-lg border font-medium cursor-pointer transition-colors', settingsForm.radius_meter === r ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100']"
                    >
                      {{ r }}m
                    </button>
                  </div>
                  <p class="text-[11px] text-slate-500 mt-1.5">Siswa yang mencoba presensi di luar radius ini akan ditolak oleh sistem.</p>
                </div>

                <div class="pt-2">
                  <Button type="submit" variant="default" class="w-full h-11 text-sm font-semibold">
                    Simpan Perubahan Pengaturan
                  </Button>
                </div>
              </form>
            </Card>

            <!-- Keamanan & Ganti Password Akun Admin -->
            <Card
              title="Keamanan & Ganti Password Admin"
              description="Perbarui kata sandi akun Administrator Anda untuk melindungi hak akses konfigurasi sekolah"
            >
              <form @submit.prevent="handleAdminChangePassword" class="space-y-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Password Baru Admin</label>
                  <div class="relative">
                    <input
                      v-model="adminPasswordInput"
                      :type="showAdminPass ? 'text' : 'password'"
                      required
                      minlength="6"
                      placeholder="Masukkan password baru (minimal 6 karakter)..."
                      class="w-full h-10 pl-3 pr-16 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      @click="showAdminPass = !showAdminPass"
                      class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer"
                    >
                      {{ showAdminPass ? 'Tutup' : 'Lihat' }}
                    </button>
                  </div>
                  <p class="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                    Minimal 6 karakter. Disarankan menggunakan kombinasi huruf besar, huruf kecil, dan angka.
                  </p>
                </div>

                <!-- Notifikasi Feedback -->
                <div
                  v-if="adminPasswordFeedback.message"
                  :class="[
                    'p-3 rounded-xl text-xs flex items-center justify-between',
                    adminPasswordFeedback.success
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border border-rose-200 text-rose-800'
                  ]"
                >
                  <span class="flex items-center gap-1.5 font-medium">
                    <span class="material-icons text-sm">{{ adminPasswordFeedback.success ? 'check_circle' : 'error_outline' }}</span>
                    <span>{{ adminPasswordFeedback.message }}</span>
                  </span>
                  <button type="button" @click="adminPasswordFeedback.message = ''" class="font-bold text-sm leading-none ml-2 cursor-pointer">
                    &times;
                  </button>
                </div>

                <div>
                  <Button
                    type="submit"
                    variant="default"
                    class="h-10 text-xs font-semibold inline-flex items-center gap-1.5"
                    :loading="isAdminSavingPass"
                  >
                    <span class="material-icons text-xs">lock_reset</span>
                    <span>Perbarui Password Admin</span>
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          <!-- Kolom Peta & Zona Bahaya (5 Kolom) -->
          <div class="lg:col-span-5 space-y-6">
            <!-- Peta Visualisasi Radius -->
            <Card title="Pratinjau Peta & Radius Geofencing" description="Klik pada peta untuk mengubah titik koordinat sekolah secara langsung">
              <div class="space-y-3">
                <div id="admin-map-container" class="w-full h-64 sm:h-72 rounded-xl border border-slate-200 z-0 relative overflow-hidden isolate"></div>
                <div class="flex items-center justify-between text-xs text-slate-500">
                  <span class="flex items-center gap-1">
                    <span class="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
                    Lingkaran biru = radius toleransi
                  </span>
                  <a
                    :href="`https://www.google.com/maps?q=${settingsForm.latitude},${settingsForm.longitude}`"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-blue-600 hover:underline inline-flex items-center gap-1 font-medium"
                  >
                    <span>Buka Google Maps</span>
                    <span class="material-icons text-xs">open_in_new</span>
                  </a>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <!-- MODAL TAMBAH / EDIT SISWA -->
      <div v-if="isStudentModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
        <div class="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 class="font-bold text-slate-900 text-base">
              {{ modalMode === 'create' ? 'Tambah Siswa Baru' : 'Edit Data Siswa' }}
            </h3>
            <button @click="isStudentModalOpen = false" class="text-slate-400 hover:text-slate-600 p-1">
              ✕
            </button>
          </div>

          <form @submit.prevent="saveStudentForm" class="space-y-3.5 mt-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap</label>
              <input
                v-model="studentForm.nama_lengkap"
                type="text"
                required
                placeholder="Contoh: Muhammad Rizky"
                class="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">NISN</label>
                <input
                  v-model="studentForm.nomor_induk"
                  type="text"
                  required
                  placeholder="20241201"
                  class="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                <select
                  v-model="studentForm.jenis_kelamin"
                  class="w-full h-9 px-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-semibold"
                >
                  <option value="L">♂ Laki-laki</option>
                  <option value="P">♀ Perempuan</option>
                </select>
              </div>
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="block text-xs font-semibold text-slate-700">Kelas</label>
                  <button
                    type="button"
                    @click="openAddClassModal('student')"
                    class="text-[11px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer inline-flex items-center gap-0.5 transition-colors"
                    title="Buat kelas baru jika belum ada di daftar"
                  >
                    <span class="material-icons text-[12px]">add</span>
                    <span>Baru</span>
                  </button>
                </div>
                <CustomDropdown
                  v-model="studentForm.kelas"
                  :options="studentClassOptions"
                  placeholder="-- Pilih Kelas --"
                  title="Pilih Kelas Siswa"
                  icon="school"
                  :fullWidth="true"
                  size="md"
                />
              </div>
            </div>

            <!-- Password Akun Siswa (Tambah / Reset Password Jika Lupa) -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                {{ modalMode === 'create' ? 'Password Akun Siswa' : 'Ganti / Reset Password Siswa (Opsional)' }}
              </label>
              <div class="relative">
                <input
                  v-model="studentForm.password"
                  :type="showAdminStudentPass ? 'text' : 'password'"
                  :required="modalMode === 'create'"
                  :placeholder="modalMode === 'create' ? 'Minimal 6 karakter' : 'Kosongkan jika tidak ingin mengubah password'"
                  class="w-full h-9 pl-3 pr-16 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  @click="showAdminStudentPass = !showAdminStudentPass"
                  class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 text-[11px] font-semibold cursor-pointer"
                >
                  {{ showAdminStudentPass ? 'Tutup' : 'Lihat' }}
                </button>
              </div>
              <p class="text-[10px] text-slate-400 mt-1">
                {{ modalMode === 'create' ? 'Password awal login siswa (minimal 6 karakter). Siswa dapat menggantinya sendiri setelah login.' : 'Isi minimal 6 karakter hanya jika ingin mereset password siswa.' }}
              </p>
            </div>

            <!-- Upload Foto Siswa (PNG / JPG) -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Pas Foto Siswa (PNG / JPG)</label>
              <div class="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/70">
                <img
                  v-if="studentForm.foto_profil_url"
                  :src="studentForm.foto_profil_url"
                  alt="Foto Siswa"
                  class="w-12 h-14 rounded-lg object-cover border border-slate-300 shadow-2xs shrink-0"
                />
                <div
                  v-else
                  class="w-12 h-14 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 border border-blue-700 shadow-2xs select-none"
                >
                  {{ getInitials(studentForm.nama_lengkap || 'Siswa') }}
                </div>
                <div class="flex-1 min-w-0 space-y-1">
                  <input
                    ref="adminStudentFileInputRef"
                    type="file"
                    accept=".png, .jpg, .jpeg, image/png, image/jpeg"
                    class="hidden"
                    @change="handleAdminStudentPhotoUpload"
                  />
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      class="h-8 text-xs bg-white inline-flex items-center gap-1"
                      @click="adminStudentFileInputRef?.click()"
                    >
                      <span class="material-icons text-xs">upload_file</span>
                      <span>Unggah PNG / JPG</span>
                    </Button>
                    <button
                      v-if="studentForm.foto_profil_url"
                      type="button"
                      class="text-[11px] text-rose-600 hover:text-rose-700 cursor-pointer"
                      @click="studentForm.foto_profil_url = ''"
                    >
                      Hapus Foto
                    </button>
                  </div>
                  <p class="text-[10px] text-slate-400">Admin memiliki hak akses tanpa batas untuk mengganti foto siswa.</p>
                </div>
              </div>
            </div>

            <!-- Kontrol Kuota Ganti Foto Mandiri Siswa (Hanya di Edit Mode) -->
            <div v-if="modalMode === 'edit'" class="p-2.5 rounded-xl border border-slate-200 bg-slate-50/80 flex items-center justify-between gap-2 text-xs">
              <div>
                <span class="text-slate-500 font-medium">Batas Update Mandiri Siswa: </span>
                <span :class="studentForm.foto_update_count >= 1 ? 'font-bold text-amber-700' : 'font-bold text-emerald-700'">
                  {{ studentForm.foto_update_count >= 1 ? '1/1 Terpakai (Terkunci)' : '0/1 (Belum Digunakan)' }}
                </span>
              </div>
              <Button
                v-if="studentForm.foto_update_count >= 1"
                type="button"
                size="sm"
                variant="outline"
                class="h-7 text-[11px] text-blue-700 border-blue-300 hover:bg-blue-50 bg-white inline-flex items-center gap-1"
                @click="resetStudentPhotoQuotaAdmin"
              >
                <span class="material-icons text-xs">refresh</span>
                <span>Beri Kuota 1x Lagi</span>
              </Button>
            </div>

            <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" @click="isStudentModalOpen = false">
                Batal
              </Button>
              <Button type="submit" variant="default" size="sm">
                {{ modalMode === 'create' ? 'Simpan Siswa' : 'Perbarui Data' }}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <!-- MODAL TAMBAH / EDIT GURU -->
      <div v-if="isTeacherModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
        <div class="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 class="font-bold text-slate-900 text-base">
                {{ teacherModalMode === 'create' ? 'Tambah Guru Piket / Tutor Baru' : 'Edit Data Guru Piket / Tutor' }}
              </h3>
              <p class="text-[11px] text-slate-500">PKBM Cahaya Mulia &bull; Akses Presensi Harian &amp; Scanner QR</p>
            </div>
            <button @click="isTeacherModalOpen = false" class="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
              ✕
            </button>
          </div>

          <form @submit.prevent="saveTeacherForm" class="space-y-3.5 mt-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap &amp; Gelar</label>
              <input
                v-model="teacherForm.nama_lengkap"
                type="text"
                required
                placeholder="Contoh: Budi Santoso, S.Pd"
                class="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">NIP / Nomor Induk Pegawai</label>
              <input
                v-model="teacherForm.nomor_induk"
                type="text"
                required
                placeholder="Contoh: 198507122010011005"
                class="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Email Akun PKBM</label>
              <input
                v-model="teacherForm.email"
                type="email"
                required
                placeholder="tutor@pkbm.sch.id"
                class="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block text-xs font-semibold text-slate-700">
                  Peran Tugas &amp; Mata Pelajaran
                </label>
                <span class="text-[10px] text-slate-400">Bisa lebih dari 1 (pisahkan koma)</span>
              </div>
              <input
                v-model="teacherForm.mata_pelajaran"
                type="text"
                required
                placeholder="Contoh: Guru Piket Harian, Tutor Matematika, Pamong Belajar"
                class="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <div v-if="teacherForm.mata_pelajaran?.trim()" class="flex flex-wrap gap-1 mt-1.5">
                <span
                  v-for="sub in formatSubjects(teacherForm.mata_pelajaran)"
                  :key="sub"
                  class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold flex items-center gap-1"
                >
                  <span class="material-icons text-[10px]">check</span>
                  <span>{{ sub }}</span>
                </span>
              </div>
              <p class="text-[10px] text-slate-400 mt-1">
                Peran tugas di PKBM (contoh: <em>Guru Piket Harian, Tutor Paket C</em>). Pisahkan tanda koma jika lebih dari satu.
              </p>
            </div>

            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block text-xs font-semibold text-slate-700">
                  Alokasi Kelas Dikelola (Binaan)
                  <span class="text-rose-500 font-bold">*</span>
                </label>
                <span class="text-[11px] text-slate-400">Total: {{ attendanceStore.allClasses.length }} kelas</span>
              </div>
              <div class="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2.5">
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
                  <label v-for="cls in attendanceStore.allClasses" :key="cls" class="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      :value="cls"
                      v-model="teacherForm.kelas_diajar"
                      class="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span class="truncate">Kelas {{ cls }}</span>
                  </label>
                </div>
                <div class="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                  <span class="text-[11px] text-slate-500">Kelas belum terdaftar?</span>
                  <button
                    type="button"
                    @click="openAddClassModal('teacher')"
                    class="h-8 px-2.5 text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg cursor-pointer transition-colors inline-flex items-center gap-1 shadow-2xs"
                  >
                    <span class="material-icons text-xs">add</span>
                    <span>Tambah Kelas Baru</span>
                  </button>
                </div>
              </div>
              <p class="text-[11px] text-slate-400 mt-1">Guru piket / tutor hanya akan dapat melihat data siswa dan rekapitulasi di kelas yang dicentang.</p>
            </div>

            <!-- Password Akun Guru (Tambah / Reset Password Jika Lupa) -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                {{ teacherModalMode === 'create' ? 'Password Akun Guru' : 'Ganti / Reset Password Guru (Opsional)' }}
              </label>
              <div class="relative">
                <input
                  v-model="teacherForm.password"
                  :type="showAdminTeacherPass ? 'text' : 'password'"
                  :required="teacherModalMode === 'create'"
                  :placeholder="teacherModalMode === 'create' ? 'Minimal 6 karakter' : 'Kosongkan jika tidak ingin mengubah password'"
                  class="w-full h-9 pl-3 pr-16 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  @click="showAdminTeacherPass = !showAdminTeacherPass"
                  class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 text-[11px] font-semibold cursor-pointer"
                >
                  {{ showAdminTeacherPass ? 'Tutup' : 'Lihat' }}
                </button>
              </div>
              <p class="text-[10px] text-slate-400 mt-1">
                {{ teacherModalMode === 'create' ? 'Password awal login pendidik (minimal 6 karakter). Guru dapat menggantinya sendiri di tab profil.' : 'Isi minimal 6 karakter hanya jika ingin mereset password guru.' }}
              </p>
            </div>

            <!-- Upload Foto Guru (PNG / JPG) -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Pas Foto Guru (PNG / JPG)</label>
              <div class="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/70">
                <img
                  v-if="teacherForm.foto_profil_url"
                  :src="teacherForm.foto_profil_url"
                  alt="Foto Guru"
                  class="w-12 h-14 rounded-lg object-cover border border-slate-300 shadow-2xs shrink-0"
                />
                <div
                  v-else
                  class="w-12 h-14 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 border border-blue-700 shadow-2xs select-none"
                >
                  {{ getInitials(teacherForm.nama_lengkap || 'Guru') }}
                </div>
                <div class="flex-1 min-w-0 space-y-1">
                  <input
                    ref="adminTeacherFileInputRef"
                    type="file"
                    accept=".png, .jpg, .jpeg, image/png, image/jpeg"
                    class="hidden"
                    @change="handleAdminTeacherPhotoUpload"
                  />
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      class="h-8 text-xs bg-white inline-flex items-center gap-1"
                      @click="adminTeacherFileInputRef?.click()"
                    >
                      <span class="material-icons text-xs">upload_file</span>
                      <span>Unggah PNG / JPG</span>
                    </Button>
                    <button
                      v-if="teacherForm.foto_profil_url"
                      type="button"
                      class="text-[11px] text-rose-600 hover:text-rose-700 cursor-pointer"
                      @click="teacherForm.foto_profil_url = ''"
                    >
                      Hapus Foto
                    </button>
                  </div>
                  <p class="text-[10px] text-slate-400">Admin memiliki hak akses tanpa batas untuk mengganti foto guru.</p>
                </div>
              </div>
            </div>

            <!-- Kontrol Kuota Ganti Foto Mandiri Guru (Hanya di Edit Mode) -->
            <div v-if="teacherModalMode === 'edit'" class="p-2.5 rounded-xl border border-slate-200 bg-slate-50/80 flex items-center justify-between gap-2 text-xs">
              <div>
                <span class="text-slate-500 font-medium">Batas Update Mandiri Guru: </span>
                <span :class="teacherForm.foto_update_count >= 1 ? 'font-bold text-amber-700' : 'font-bold text-emerald-700'">
                  {{ teacherForm.foto_update_count >= 1 ? '1/1 Terpakai (Terkunci)' : '0/1 (Belum Digunakan)' }}
                </span>
              </div>
              <Button
                v-if="teacherForm.foto_update_count >= 1"
                type="button"
                size="sm"
                variant="outline"
                class="h-7 text-[11px] text-blue-700 border-blue-300 hover:bg-blue-50 bg-white inline-flex items-center gap-1"
                @click="resetTeacherPhotoQuotaAdmin"
              >
                <span class="material-icons text-xs">refresh</span>
                <span>Beri Kuota 1x Lagi</span>
              </Button>
            </div>

            <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" @click="isTeacherModalOpen = false">
                Batal
              </Button>
              <Button type="submit" variant="default" size="sm">
                {{ teacherModalMode === 'create' ? 'Simpan Guru / Piket' : 'Perbarui Guru / Piket' }}
              </Button>
            </div>
          </form>
        </div>
      </div>


      <!-- Mobile Detail Sheet: Siswa (Flutter BottomSheet Style) -->
      <MobileDetailSheet
        v-model:open="isStudentDetailSheetOpen"
        :title="selectedStudentItem?.nama_lengkap || 'Detail Siswa'"
        :subtitle="`NISN: ${selectedStudentItem?.nomor_induk || '-'} • ${selectedStudentItem?.kelas || '-'}`"
      >
        <div v-if="selectedStudentItem" class="space-y-4">
          <!-- Profil Singkat -->
          <div class="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <img
              v-if="selectedStudentItem.foto_profil_url"
              :src="selectedStudentItem.foto_profil_url"
              class="w-14 h-14 rounded-full object-cover border-2 border-white shadow-xs"
            />
            <div
              v-else
              class="w-14 h-14 rounded-full bg-blue-600 text-white text-lg font-bold flex items-center justify-center shrink-0 border-2 border-white shadow-xs"
            >
              {{ getInitials(selectedStudentItem.nama_lengkap) }}
            </div>
            <div class="min-w-0 flex-1">
              <h4 class="text-sm font-bold text-slate-900 truncate">{{ selectedStudentItem.nama_lengkap }}</h4>
              <p class="text-xs text-slate-500 mt-0.5">Siswa Aktif • Kelas {{ selectedStudentItem.kelas }}</p>
              <div class="flex items-center gap-1.5 mt-1">
                <span class="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded-md border border-blue-200">
                  NISN: {{ selectedStudentItem.nomor_induk }}
                </span>
                <span
                  class="px-2 py-0.5 text-[10px] font-bold rounded-md"
                  :class="selectedStudentItem.jenis_kelamin === 'P' ? 'bg-pink-50 text-pink-700 border border-pink-200' : 'bg-blue-50 text-blue-700 border border-blue-200'"
                >
                  {{ selectedStudentItem.jenis_kelamin === 'P' ? '♀ Perempuan' : '♂ Laki-laki' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Token Kartu QR & Preview Barcode -->
          <div class="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-xs font-bold text-slate-900 block">Kartu Presensi QR</span>
                <span class="text-[11px] text-slate-400 block font-mono truncate max-w-[200px]">{{ selectedStudentItem.qr_token }}</span>
              </div>
              <Badge :status="selectedStudentItem.qr_token ? 'hadir' : 'alpa'" :label="selectedStudentItem.qr_token ? 'Aktif' : 'Kosong'" />
            </div>

            <!-- Canvas QR Code Mobile -->
            <div class="flex items-center justify-center p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <canvas ref="sheetStudentQrCanvas" class="w-24 h-24"></canvas>
            </div>
          </div>

          <!-- Kredensial Login -->
          <div class="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-2 text-xs">
            <div class="flex items-center justify-between gap-2">
              <span class="text-slate-500">Email Akun</span>
              <span class="font-medium text-slate-800 truncate">{{ selectedStudentItem.email || `${selectedStudentItem.nomor_induk}@pkbm.sch.id` }}</span>
            </div>
          </div>
        </div>

        <template #actions>
          <div class="w-full grid grid-cols-2 gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="default"
              class="w-full text-xs font-semibold justify-center gap-1.5"
              @click="handleEditFromSheet('siswa')"
            >
              <span class="material-icons text-sm">edit</span>
              <span>Edit Data</span>
            </Button>
            <button
              type="button"
              @click="handleDeleteFromSheet('siswa')"
              class="w-full h-9 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <span class="material-icons text-sm">delete_outline</span>
              <span>Soft Delete</span>
            </button>
          </div>
        </template>
      </MobileDetailSheet>

      <!-- Mobile Detail Sheet: Guru (Flutter BottomSheet Style) -->
      <MobileDetailSheet
        v-model:open="isTeacherDetailSheetOpen"
        :title="selectedTeacherItem?.nama_lengkap || 'Detail Guru / Piket'"
        :subtitle="`NIP: ${selectedTeacherItem?.nomor_induk || '-'} • ${selectedTeacherItem?.mata_pelajaran || '-'}`"
      >
        <div v-if="selectedTeacherItem" class="space-y-4">
          <!-- Profil Singkat Guru -->
          <div class="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <img
              v-if="selectedTeacherItem.foto_profil_url"
              :src="selectedTeacherItem.foto_profil_url"
              class="w-14 h-14 rounded-full object-cover border-2 border-white shadow-xs"
            />
            <div
              v-else
              class="w-14 h-14 rounded-full bg-blue-600 text-white text-lg font-bold flex items-center justify-center shrink-0 border-2 border-white shadow-xs"
            >
              {{ getInitials(selectedTeacherItem.nama_lengkap) }}
            </div>
            <div class="min-w-0 flex-1">
              <h4 class="text-sm font-bold text-slate-900 truncate">{{ selectedTeacherItem.nama_lengkap }}</h4>
              <div class="flex flex-wrap gap-1 mt-1">
                <span
                  v-for="sub in formatSubjects(selectedTeacherItem.mata_pelajaran)"
                  :key="sub"
                  class="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold"
                >
                  {{ sub }}
                </span>
              </div>
              <span class="inline-block mt-1 text-[11px] text-slate-500 font-mono">
                NIP: {{ selectedTeacherItem.nomor_induk }}
              </span>
            </div>
          </div>

          <!-- Rombel / Kelas Diajar -->
          <div class="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-2">
            <span class="text-xs font-bold text-slate-900 block">Alokasi Kelas yang Dikelola</span>
            <div class="flex flex-wrap gap-1.5 pt-1">
              <span
                v-for="cls in selectedTeacherItem.kelas_diajar"
                :key="cls"
                class="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold"
              >
                {{ cls }}
              </span>
              <span v-if="!selectedTeacherItem.kelas_diajar?.length" class="text-xs text-slate-400">
                Belum ada alokasi kelas
              </span>
            </div>
          </div>

          <!-- Kredensial Akun -->
          <div class="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-2.5 text-xs">
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Email Akun</span>
              <span class="font-medium text-slate-800">{{ selectedTeacherItem.email }}</span>
            </div>
          </div>
        </div>

        <template #actions>
          <div class="w-full grid grid-cols-2 gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="default"
              class="w-full text-xs font-semibold justify-center gap-1.5"
              @click="handleEditFromSheet('guru')"
            >
              <span class="material-icons text-sm">edit</span>
              <span>Edit Data</span>
            </Button>
            <button
              type="button"
              @click="handleDeleteFromSheet('guru')"
              class="w-full h-9 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <span class="material-icons text-sm">delete_outline</span>
              <span>Soft Delete</span>
            </button>
          </div>
        </template>
      </MobileDetailSheet>

      <!-- Modal: Kotak Sampah / Data Terhapus (Soft Delete Archive) -->
      <div v-if="isTrashModalOpen" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
          <div class="p-4 border-b border-slate-100 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="material-icons text-rose-600">delete_outline</span>
              <div class="min-w-0 pr-1">
                <h3 class="font-bold text-slate-900 text-sm leading-snug break-words">
                  Arsip Data Terhapus ({{ trashType === 'siswa' ? 'Siswa' : 'Guru / Piket' }})
                </h3>
                <p class="text-[11px] text-slate-500 leading-normal break-words mt-0.5">Sistem Soft Delete: Data dapat dipulihkan kapan saja</p>
              </div>
            </div>
            <button @click="isTrashModalOpen = false" class="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer">
              <span class="material-icons text-lg">close</span>
            </button>
          </div>

          <div class="p-4 overflow-y-auto space-y-2.5 flex-1 text-xs">
            <!-- Jika Siswa -->
            <template v-if="trashType === 'siswa'">
              <div
                v-for="std in attendanceStore.deletedStudents"
                :key="std.id"
                class="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3"
              >
                <div class="min-w-0">
                  <p class="font-bold text-slate-900 truncate">{{ std.nama_lengkap }}</p>
                  <p class="text-[11px] text-slate-500">NISN: {{ std.nomor_induk }} • Kelas: {{ std.kelas }}</p>
                  <p class="text-[10px] text-slate-400">Dihapus: {{ std.deleted_at ? new Date(std.deleted_at).toLocaleString('id-ID') : '-' }}</p>
                </div>
                <button
                  type="button"
                  @click="restoreStudentConfirm(std)"
                  class="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-semibold inline-flex items-center gap-1 shrink-0 transition cursor-pointer"
                >
                  <span class="material-icons text-xs">restore</span>
                  <span>Pulihkan</span>
                </button>
              </div>

              <div v-if="attendanceStore.deletedStudents.length === 0" class="py-8 text-center text-slate-400">
                Tidak ada data siswa dalam arsip terhapus.
              </div>
            </template>

            <!-- Jika Guru -->
            <template v-else>
              <div
                v-for="t in attendanceStore.deletedTeachers"
                :key="t.id"
                class="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3"
              >
                <div class="min-w-0">
                  <p class="font-bold text-slate-900 truncate">{{ t.nama_lengkap }}</p>
                  <p class="text-[11px] text-slate-500">NIP: {{ t.nomor_induk }} • {{ t.mata_pelajaran }}</p>
                  <p class="text-[10px] text-slate-400">Dihapus: {{ t.deleted_at ? new Date(t.deleted_at).toLocaleString('id-ID') : '-' }}</p>
                </div>
                <button
                  type="button"
                  @click="restoreTeacherConfirm(t)"
                  class="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-semibold inline-flex items-center gap-1 shrink-0 transition cursor-pointer"
                >
                  <span class="material-icons text-xs">restore</span>
                  <span>Pulihkan</span>
                </button>
              </div>

              <div v-if="attendanceStore.deletedTeachers.length === 0" class="py-8 text-center text-slate-400">
                Tidak ada data guru piket / tutor dalam arsip terhapus.
              </div>
            </template>
          </div>

          <div class="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
            <Button size="sm" variant="outline" @click="isTrashModalOpen = false">
              Tutup
            </Button>
          </div>
        </div>
      </div>

      <!-- Modal: Tambah / Edit Administrator & Staf TU -->
      <div v-if="isAdminModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
        <div class="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <span class="material-icons text-base">admin_panel_settings</span>
              </div>
              <h3 class="font-bold text-slate-900 text-sm sm:text-base">
                {{ adminModalMode === 'create' ? 'Tambah Administrator Baru' : 'Edit Administrator' }}
              </h3>
            </div>
            <button @click="isAdminModalOpen = false" class="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
              ✕
            </button>
          </div>

          <form @submit.prevent="saveAdminForm" class="space-y-3.5 mt-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap & Gelar <span class="text-rose-500">*</span>
              </label>
              <input
                v-model="adminForm.nama_lengkap"
                type="text"
                required
                placeholder="Contoh: Dewi Sartika, S.AP"
                class="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Induk / NIK / ID Pegawai <span class="text-rose-500">*</span>
              </label>
              <input
                v-model="adminForm.nomor_induk"
                type="text"
                required
                placeholder="Contoh: ADM-003 atau 19930415..."
                class="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none uppercase"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                Email Sekolah <span class="text-rose-500">*</span>
              </label>
              <input
                v-model="adminForm.email"
                type="email"
                required
                placeholder="Contoh: dewi.tu@sekolah.sch.id"
                class="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                Jabatan / Unit Kerja
              </label>
              <input
                v-model="adminForm.jabatan"
                type="text"
                placeholder="Contoh: Staf Tata Usaha, Koordinator IT, Operator Presensi"
                class="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                {{ adminModalMode === 'create' ? 'Password Awal' : 'Password Baru (Opsional)' }}
                <span v-if="adminModalMode === 'create'" class="text-rose-500">*</span>
              </label>
              <div class="relative">
                <input
                  v-model="adminForm.password"
                  :type="showAdminModalPass ? 'text' : 'password'"
                  :required="adminModalMode === 'create'"
                  :placeholder="adminModalMode === 'create' ? 'Minimal 6 karakter' : 'Kosongkan jika tidak ingin mengubah password'"
                  class="w-full h-10 pl-3 pr-16 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50"
                />
                <button
                  type="button"
                  @click="showAdminModalPass = !showAdminModalPass"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-[11px] font-semibold cursor-pointer"
                >
                  {{ showAdminModalPass ? 'Tutup' : 'Lihat' }}
                </button>
              </div>
              <p class="text-[10px] text-slate-400 mt-1">
                {{ adminModalMode === 'create' ? 'Minimal 6 karakter. Admin dapat menggantinya sendiri di menu Pengaturan.' : 'Isi minimal 6 karakter hanya jika ingin mereset password administrator ini.' }}
              </p>
            </div>

            <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" @click="isAdminModalOpen = false">
                Batal
              </Button>
              <Button type="submit" variant="default" size="sm" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                {{ adminModalMode === 'create' ? 'Simpan Administrator' : 'Perbarui Data' }}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <!-- MODAL TAMBAH KELAS / ROMBEL BARU (FORMAT PKBM CAHAYA MULIA) -->
      <div v-if="isClassModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
        <div class="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-5 sm:p-6 animate-in fade-in zoom-in-95 duration-150">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                <span class="material-icons text-lg">school</span>
              </div>
              <div>
                <h3 class="font-bold text-slate-900 text-sm sm:text-base leading-snug">Tambah Kelas Baru</h3>
                <p class="text-[11px] text-slate-500">PKBM Cahaya Mulia &bull; TA {{ attendanceStore.activeAcademicYear }}</p>
              </div>
            </div>
            <button
              type="button"
              @click="isClassModalOpen = false"
              class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center text-xs font-bold cursor-pointer transition-colors"
            >
              ✕
            </button>
          </div>

          <form @submit.prevent="submitCreateClass" class="space-y-4 mt-4">
            <!-- Pilihan Cepat Preset Tingkat / Jenjang PKBM -->
            <div>
              <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Pilihan Cepat (Tingkat / Paket Kesetaraan)
              </label>
              <div class="space-y-2">
                <div v-for="group in presetClassOptions" :key="group.label" class="flex items-center gap-1.5 flex-wrap">
                  <span class="text-[11px] font-semibold text-slate-500 w-24 shrink-0">{{ group.label }}:</span>
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <button
                      v-for="item in group.items"
                      :key="item"
                      type="button"
                      @click="selectPresetClass(item)"
                      class="px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer"
                      :class="newClassNameInput === item
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : attendanceStore.allClasses.includes(item)
                          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                          : 'bg-white hover:bg-blue-50 text-slate-700 border-slate-200 hover:border-blue-300'"
                      :disabled="attendanceStore.allClasses.includes(item)"
                      :title="attendanceStore.allClasses.includes(item) ? `Kelas ${item} sudah terdaftar` : `Pilih Kelas ${item}`"
                    >
                      {{ item }}
                      <span v-if="attendanceStore.allClasses.includes(item)" class="text-[9px] font-normal ml-0.5">✓</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Input Nama / Nomor Kelas Manual -->
            <div class="pt-2 border-t border-slate-100">
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                Nama / Nomor Tingkat Kelas
              </label>
              <input
                ref="newClassNameInputRef"
                v-model="newClassNameInput"
                type="text"
                required
                placeholder="Contoh: 12, 11, atau 10 (atau 12-A)"
                class="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm font-semibold uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:normal-case placeholder:font-normal placeholder:text-slate-400"
                @input="classError = ''"
              />
              <p v-if="classError" class="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                <span class="material-icons text-xs">error_outline</span>
                <span>{{ classError }}</span>
              </p>
              <p v-else class="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                Format standar PKBM: Cukup masukkan nomor kelas (contoh: <strong>12</strong>, <strong>11</strong>, <strong>10</strong>) atau nama rombel (contoh: <strong>12-A</strong>).
              </p>
            </div>

            <!-- Daftar Kelas yang Saat Ini Terdaftar -->
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div class="flex items-center justify-between text-[11px] mb-1.5">
                <span class="font-bold text-slate-600">Kelas Terdaftar Saat Ini:</span>
                <span class="font-mono text-slate-400 font-bold">{{ attendanceStore.allClasses.length }} kelas</span>
              </div>
              <div class="flex items-center gap-1.5 flex-wrap">
                <span
                  v-for="c in attendanceStore.allClasses"
                  :key="c"
                  class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-white text-slate-700 border border-slate-200 shadow-2xs"
                >
                  <span>Kelas {{ c }}</span>
                  <button
                    v-if="!hasStudentsInClass(c)"
                    type="button"
                    @click="handleRemoveClass(c)"
                    class="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer text-xs"
                    title="Hapus kelas ini dari daftar (belum ada siswa)"
                  >
                    &times;
                  </button>
                </span>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" @click="isClassModalOpen = false">
                Batal
              </Button>
              <Button type="submit" variant="default" size="sm" class="font-bold shadow-2xs">
                Simpan Kelas
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import QRCode from 'qrcode'
import L from 'leaflet'
import { useAttendanceStore } from '../stores/attendance'
import { useAuthStore } from '../stores/auth'
import { useUiStore } from '../stores/ui'
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
import { getCurrentAcademicYear, getAcademicYearOptions } from '../utils/academicYear'

const authStore = useAuthStore()
const attendanceStore = useAttendanceStore()
const uiStore = useUiStore()
const isDrawerOpen = ref(false)

// Mobile Detail Sheet Siswa (Flutter Style)
const isStudentDetailSheetOpen = ref(false)
const selectedStudentItem = ref(null)
const sheetStudentQrCanvas = ref(null)

function openStudentDetailSheet(student) {
  selectedStudentItem.value = student
  isStudentDetailSheetOpen.value = true
  if (student.qr_token) {
    nextTick(() => {
      renderStudentQr(sheetStudentQrCanvas.value, student.qr_token)
    })
  }
}

// Mobile Detail Sheet Guru (Flutter Style)
const isTeacherDetailSheetOpen = ref(false)
const selectedTeacherItem = ref(null)

function openTeacherDetailSheet(teacher) {
  selectedTeacherItem.value = teacher
  isTeacherDetailSheetOpen.value = true
}

function handleEditFromSheet(type) {
  if (type === 'siswa') {
    isStudentDetailSheetOpen.value = false
    if (selectedStudentItem.value) {
      openEditStudentModal(selectedStudentItem.value)
    }
  } else if (type === 'guru') {
    isTeacherDetailSheetOpen.value = false
    if (selectedTeacherItem.value) {
      openEditTeacherModal(selectedTeacherItem.value)
    }
  }
}

async function handleDeleteFromSheet(type) {
  if (type === 'siswa') {
    if (selectedStudentItem.value) {
      const std = selectedStudentItem.value
      const confirmed = await uiStore.showConfirm({
        title: 'Nonaktifkan Data Siswa?',
        message: `Pindahkan data siswa "${std.nama_lengkap}" (${std.nomor_induk}) ke status nonaktif (Soft Delete)?\n\nData historis dan riwayat presensi tetap aman.`,
        confirmText: 'Ya, Nonaktifkan',
        cancelText: 'Batal',
        type: 'warning'
      })
      if (confirmed) {
        const res = await attendanceStore.deleteStudent(std.id)
        if (res?.success === false) {
          uiStore.showToast(res.message || 'Gagal menonaktifkan siswa.', 'error')
          return
        }
        isStudentDetailSheetOpen.value = false
        uiStore.showToast('Data siswa berhasil dinonaktifkan (Soft Delete).', 'success')
      }
    }
  } else if (type === 'guru') {
    if (selectedTeacherItem.value) {
      const t = selectedTeacherItem.value
      const confirmed = await uiStore.showConfirm({
        title: 'Nonaktifkan Data Guru Piket?',
        message: `Pindahkan data guru piket "${t.nama_lengkap}" (${t.nomor_induk}) ke status nonaktif (Soft Delete)?\n\nHak akses presensi harian dan scanner QR akan dinonaktifkan.`,
        confirmText: 'Ya, Nonaktifkan',
        cancelText: 'Batal',
        type: 'warning'
      })
      if (confirmed) {
        const res = await attendanceStore.deleteTeacher(t.id)
        if (res?.success === false) {
          uiStore.showToast(res.message || 'Gagal menonaktifkan guru.', 'error')
          return
        }
        isTeacherDetailSheetOpen.value = false
        uiStore.showToast('Data guru piket berhasil dinonaktifkan (Soft Delete).', 'success')
      }
    }
  }
}

// Trash / Soft Delete Archive Modal State
const isTrashModalOpen = ref(false)
const trashType = ref('siswa') // 'siswa' | 'guru'

function openTrashModal(type = 'siswa') {
  trashType.value = type
  isTrashModalOpen.value = true
}

async function restoreStudentConfirm(student) {
  const res = await attendanceStore.restoreStudent(student.id)
  if (res?.success === false) {
    uiStore.showToast(res.message || 'Gagal memulihkan siswa.', 'error')
    return
  }
  uiStore.showToast(`Data siswa "${student.nama_lengkap}" berhasil dipulihkan!`, 'success')
}

async function restoreTeacherConfirm(teacher) {
  const res = await attendanceStore.restoreTeacher(teacher.id)
  if (res?.success === false) {
    uiStore.showToast(res.message || 'Gagal memulihkan guru.', 'error')
    return
  }
  uiStore.showToast(`Data guru piket "${teacher.nama_lengkap}" berhasil dipulihkan!`, 'success')
}

const route = useRoute()
const router = useRouter()

const validAdminTabs = ['siswa', 'guru', 'admin', 'kartu', 'settings']
const initialAdminTab = (route.query.tab && validAdminTabs.includes(route.query.tab))
  ? route.query.tab
  : (localStorage.getItem('presensi_tab_admin') && validAdminTabs.includes(localStorage.getItem('presensi_tab_admin')))
    ? localStorage.getItem('presensi_tab_admin')
    : 'siswa'

const activeTab = ref(initialAdminTab)

watch(activeTab, (tab) => {
  localStorage.setItem('presensi_tab_admin', tab)
  if (route.query.tab !== tab) {
    router.replace({ query: { ...route.query, tab } }).catch(() => {})
  }
})

watch(() => route.query.tab, (newTab) => {
  if (newTab && validAdminTabs.includes(newTab) && newTab !== activeTab.value) {
    activeTab.value = newTab
  }
})

// Header & Tab Metainfo (Kontekstual per tab)
const currentTabMeta = computed(() => {
  switch (activeTab.value) {
    case 'siswa':
      return {
        icon: 'people',
        title: 'Manajemen Data Siswa',
        desc: 'Kelola data induk siswa, NISN, rombongan belajar, dan QR token kartu presensi'
      }
    case 'guru':
      return {
        icon: 'school',
        title: 'Manajemen Guru Piket & Tutor',
        desc: 'Kelola data guru piket, hak akses scanner QR meja piket, dan alokasi kelas binaan'
      }
    case 'admin':
      return {
        icon: 'admin_panel_settings',
        title: 'Manajemen Administrator & Staf TU',
        desc: 'Kelola data staf tata usaha, koordinator sistem, hak akses login, dan kredensial administrator sekolah'
      }
    case 'kartu':
      return {
        icon: 'badge',
        title: 'Cetak Kartu ID QR Siswa',
        desc: 'Pratinjau dan cetak kartu fisik identitas siswa dengan barcode QR dalam format standar A4'
      }
    case 'settings':
      return {
        icon: 'settings',
        title: 'Pengaturan Titik GPS & Radius Geofencing',
        desc: 'Konfigurasi titik pusat koordinat sekolah dan batas radius toleransi presensi mandiri'
      }
    default:
      return {
        icon: 'admin_panel_settings',
        title: 'Panel Administrator Sekolah',
        desc: 'Pusat kontrol dan konfigurasi sistem presensi sekolah'
      }
  }
})

// Stats Komputasi Guru
const uniqueSubjectsCount = computed(() => {
  const subjects = new Set(attendanceStore.teachers.map(t => t.mata_pelajaran).filter(Boolean))
  return subjects.size
})

const coveredClassesCount = computed(() => {
  const classes = new Set(attendanceStore.teachers.flatMap(t => t.kelas_diajar || []))
  return classes.size
})

// Sidebar nav items untuk Admin
const navItems = computed(() => [
  { key: 'siswa', icon: 'people', label: `Manajemen Siswa`, badge: attendanceStore.students.length },
  { key: 'guru', icon: 'school', label: `Guru Piket & Tutor`, badge: attendanceStore.teachers.length },
  { key: 'admin', icon: 'admin_panel_settings', label: `Manajemen Admin`, badge: attendanceStore.admins?.length || 0 },
  { key: 'kartu', icon: 'badge', label: 'Cetak Kartu ID QR' },
  { key: 'settings', icon: 'settings', label: 'Pengaturan GPS & Radius' },
])

// Search & Filter Siswa
const searchQuery = ref('')
const savedAdminClassFilter = localStorage.getItem('presensi_admin_class_filter')
const selectedClassFilter = ref(savedAdminClassFilter || '')

watch(selectedClassFilter, (val) => {
  localStorage.setItem('presensi_admin_class_filter', val || '')
})

const classFilterOptions = computed(() => [
  { value: '', label: `Semua Kelas (${attendanceStore.allClasses.length})`, icon: 'apps' },
  ...attendanceStore.allClasses.map(cls => ({ value: cls, label: `Kelas ${cls}`, icon: 'school' }))
])

const printCardClassOptions = computed(() => [
  { value: '', label: `Semua Kelas (${attendanceStore.students.length} Siswa)`, icon: 'apps' },
  ...attendanceStore.allClasses.map(cls => ({ value: cls, label: `Kelas ${cls}`, icon: 'school' }))
])

const studentClassOptions = computed(() => [
  ...attendanceStore.allClasses.map(cls => ({ value: cls, label: `Kelas ${cls}`, icon: 'school' }))
])

const filteredStudents = computed(() => {
  return attendanceStore.students.filter(s => {
    const matchQuery = s.nama_lengkap.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                       s.nomor_induk.includes(searchQuery.value)
    const matchClass = selectedClassFilter.value ? s.kelas === selectedClassFilter.value : true
    return matchQuery && matchClass
  })
})

// Search Guru
const searchTeacherQuery = ref('')
const filteredTeachers = computed(() => {
  if (!searchTeacherQuery.value.trim()) return attendanceStore.teachers
  const q = searchTeacherQuery.value.toLowerCase()
  return attendanceStore.teachers.filter(t => {
    return (t.nama_lengkap && t.nama_lengkap.toLowerCase().includes(q)) ||
           (t.nomor_induk && t.nomor_induk.includes(q)) ||
           (t.email && t.email.toLowerCase().includes(q)) ||
           (t.mata_pelajaran && t.mata_pelajaran.toLowerCase().includes(q))
  })
})

// Modal State
const isStudentModalOpen = ref(false)
const modalMode = ref('create')
const editingStudentId = ref(null)
const showAdminStudentPass = ref(false)
const showAdminTeacherPass = ref(false)
const showAdminModalPass = ref(false)

// Modal Tambah Kelas Baru (Format PKBM Cahaya Mulia)
const isClassModalOpen = ref(false)
const newClassNameInput = ref('')
const classError = ref('')
const classModalContext = ref('filter') // 'filter', 'student', 'teacher'
const newClassNameInputRef = ref(null)

const presetClassOptions = [
  { label: 'Paket C (SMA)', items: ['10', '11', '12'] },
  { label: 'Paket B (SMP)', items: ['7', '8', '9'] },
  { label: 'Rombel A/B', items: ['10-A', '11-A', '12-A', '12-B'] }
]

function selectPresetClass(name) {
  if (attendanceStore.allClasses.includes(name)) {
    classError.value = `Kelas ${name} sudah terdaftar.`
    return
  }
  newClassNameInput.value = name
  classError.value = ''
}

function hasStudentsInClass(className) {
  return attendanceStore.students.some(s => s.kelas === className)
}

async function handleRemoveClass(className) {
  if (hasStudentsInClass(className)) {
    uiStore.showToast(`Kelas ${className} tidak dapat dihapus karena masih memiliki siswa terdaftar.`, 'warning')
    return
  }
  const confirmed = await uiStore.showConfirm({
    title: 'Hapus Kelas?',
    message: `Hapus Kelas ${className} dari daftar kelas?`,
    confirmText: 'Ya, Hapus',
    cancelText: 'Batal',
    type: 'danger'
  })
  if (confirmed) {
    const res = await attendanceStore.deleteClass(className)
    if (res?.success === false) {
      uiStore.showToast(res.message || 'Gagal menghapus kelas.', 'error')
      return
    }
    uiStore.showToast(`Kelas ${className} berhasil dihapus.`, 'success')
  }
}

function openAddClassModal(context = 'filter') {
  classModalContext.value = context
  newClassNameInput.value = ''
  classError.value = ''
  isClassModalOpen.value = true
  nextTick(() => {
    if (newClassNameInputRef.value) {
      newClassNameInputRef.value.focus()
    }
  })
}

async function submitCreateClass() {
  if (!newClassNameInput.value.trim()) {
    classError.value = 'Nama kelas tidak boleh kosong'
    return
  }

  const clean = newClassNameInput.value.trim().toUpperCase()
  if (attendanceStore.allClasses.includes(clean)) {
    classError.value = `Kelas ${clean} sudah terdaftar dalam sistem.`
    return
  }

  const res = await attendanceStore.addClass(clean)
  if (res?.success) {
    if (classModalContext.value === 'student') {
      studentForm.value.kelas = clean
    } else if (classModalContext.value === 'teacher') {
      if (!teacherForm.value.kelas_diajar.includes(clean)) {
        teacherForm.value.kelas_diajar.push(clean)
      }
    } else if (classModalContext.value === 'filter') {
      selectedClassFilter.value = clean
    }
    isClassModalOpen.value = false
    newClassNameInput.value = ''
  } else {
    classError.value = res?.message || 'Gagal menambahkan kelas.'
  }
}

const studentForm = ref({
  nama_lengkap: '',
  nomor_induk: '',
  jenis_kelamin: 'L',
  kelas: '12',
  password: '',
  foto_profil_url: ''
})

function openCreateStudentModal() {
  modalMode.value = 'create'
  editingStudentId.value = null
  showAdminStudentPass.value = false
  studentForm.value = {
    nama_lengkap: '',
    nomor_induk: '',
    jenis_kelamin: 'L',
    kelas: attendanceStore.allClasses[0] || '12',
    password: '',
    foto_profil_url: ''
  }
  isStudentModalOpen.value = true
}

function openEditStudentModal(student) {
  modalMode.value = 'edit'
  editingStudentId.value = student.id
  showAdminStudentPass.value = false
  studentForm.value = {
    ...student,
    jenis_kelamin: student.jenis_kelamin || 'L',
    password: ''
  }
  isStudentModalOpen.value = true
}

const adminStudentFileInputRef = ref(null)
const adminTeacherFileInputRef = ref(null)

async function handleAdminStudentPhotoUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return
  try {
    const compressed = await compressImageFile(file, 600, 600, 0.85)
    studentForm.value.foto_profil_url = compressed
  } catch (err) {
    uiStore.showToast(err.message || 'Gagal memproses gambar.', 'error')
  }
}

async function resetStudentPhotoQuotaAdmin() {
  if (!editingStudentId.value) return
  const res = await attendanceStore.resetStudentPhotoQuota(editingStudentId.value)
  if (res?.success === false) {
    uiStore.showToast(res.message || 'Gagal mereset kuota foto siswa.', 'error')
    return
  }
  studentForm.value.foto_update_count = 0
  uiStore.showToast('Batas kuota ganti foto untuk siswa ini telah di-reset menjadi 0/1. Siswa dapat memperbarui fotonya 1x lagi.', 'info', 4500)
}

async function handleAdminTeacherPhotoUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return
  try {
    const compressed = await compressImageFile(file, 600, 600, 0.85)
    teacherForm.value.foto_profil_url = compressed
  } catch (err) {
    uiStore.showToast(err.message || 'Gagal memproses gambar.', 'error')
  }
}

async function resetTeacherPhotoQuotaAdmin() {
  if (!editingTeacherId.value) return
  const res = await attendanceStore.resetTeacherPhotoQuota(editingTeacherId.value)
  if (res?.success === false) {
    uiStore.showToast(res.message || 'Gagal mereset kuota foto guru.', 'error')
    return
  }
  teacherForm.value.foto_update_count = 0
  uiStore.showToast('Batas kuota ganti foto untuk guru ini telah di-reset menjadi 0/1. Guru dapat memperbarui fotonya 1x lagi.', 'info', 4500)
}

async function saveStudentForm() {
  const rawPass = (studentForm.value.password || '').trim()
  if (modalMode.value === 'create' && rawPass.length < 6) {
    uiStore.showToast('Password awal siswa minimal 6 karakter.', 'warning')
    return
  }
  if (modalMode.value === 'edit' && rawPass.length > 0 && rawPass.length < 6) {
    uiStore.showToast('Password baru siswa minimal 6 karakter (atau kosongkan jika tidak diubah).', 'warning')
    return
  }

  if (modalMode.value === 'create') {
    const res = await attendanceStore.addStudent({
      ...studentForm.value,
      password: rawPass
    })
    if (!res?.success) {
      uiStore.showToast(res?.message || 'Gagal menambahkan data siswa.', 'error')
      return
    }
    uiStore.showToast(`Siswa ${studentForm.value.nama_lengkap} berhasil ditambahkan!`, 'success')
  } else {
    const payload = { ...studentForm.value }
    if (!rawPass) delete payload.password
    else payload.password = rawPass
    const res = await attendanceStore.updateStudent(editingStudentId.value, payload)
    if (!res?.success) {
      uiStore.showToast(res?.message || 'Gagal memperbarui data siswa.', 'error')
      return
    }
    uiStore.showToast(`Data ${studentForm.value.nama_lengkap} berhasil diperbarui!`, 'success')
  }
  isStudentModalOpen.value = false
}

async function deleteStudentConfirm(student) {
  const confirmed = await uiStore.showConfirm({
    title: 'Nonaktifkan Data Siswa?',
    message: `Pindahkan data siswa "${student.nama_lengkap}" (${student.nomor_induk}) ke status nonaktif (Soft Delete)?\n\nData historis dan riwayat presensi tetap aman.`,
    confirmText: 'Ya, Nonaktifkan',
    cancelText: 'Batal',
    type: 'warning'
  })
  if (confirmed) {
    const res = await attendanceStore.deleteStudent(student.id)
    if (res?.success === false) {
      uiStore.showToast(res.message || 'Gagal menonaktifkan siswa.', 'error')
      return
    }
    uiStore.showToast('Data siswa berhasil dinonaktifkan (Soft Delete).', 'success')
  }
}

// Teacher Management State & Handlers
function formatSubjects(val) {
  if (!val) return ['Umum']
  if (Array.isArray(val)) return val
  return String(val)
    .split(/[,;/]/)
    .map(s => s.trim())
    .filter(Boolean)
}

const isTeacherModalOpen = ref(false)
const teacherModalMode = ref('create')
const editingTeacherId = ref(null)
const teacherForm = ref({
  nama_lengkap: '',
  nomor_induk: '',
  email: '',
  password: '',
  mata_pelajaran: '',
  kelas_diajar: ['12'],
  foto_profil_url: ''
})

const availableClasses = computed(() => attendanceStore.allClasses)
const uniqueClasses = computed(() => attendanceStore.allClasses)

function openAddTeacherModal() {
  teacherModalMode.value = 'create'
  editingTeacherId.value = null
  showAdminTeacherPass.value = false
  teacherForm.value = {
    nama_lengkap: '',
    nomor_induk: '',
    email: '',
    password: '',
    mata_pelajaran: '',
    kelas_diajar: attendanceStore.allClasses.length ? [attendanceStore.allClasses[0]] : ['12'],
    foto_profil_url: ''
  }
  isTeacherModalOpen.value = true
}

function openEditTeacherModal(teacher) {
  teacherModalMode.value = 'edit'
  editingTeacherId.value = teacher.id
  showAdminTeacherPass.value = false
  teacherForm.value = {
    ...teacher,
    password: '',
    kelas_diajar: [...(teacher.kelas_diajar || ['12'])]
  }
  isTeacherModalOpen.value = true
}

async function saveTeacherForm() {
  if (!teacherForm.value.kelas_diajar.length) {
    uiStore.showToast('Pilih minimal satu kelas yang diajar oleh guru.', 'warning')
    return
  }

  const rawPass = (teacherForm.value.password || '').trim()
  if (teacherModalMode.value === 'create' && rawPass.length < 6) {
    uiStore.showToast('Password awal guru minimal 6 karakter.', 'warning')
    return
  }
  if (teacherModalMode.value === 'edit' && rawPass.length > 0 && rawPass.length < 6) {
    uiStore.showToast('Password baru guru minimal 6 karakter (atau kosongkan jika tidak diubah).', 'warning')
    return
  }

  if (teacherModalMode.value === 'create') {
    const res = await attendanceStore.addTeacher({
      ...teacherForm.value,
      password: rawPass
    })
    if (!res?.success) {
      uiStore.showToast(res?.message || 'Gagal menambahkan data guru / piket.', 'error')
      return
    }
    uiStore.showToast(`Guru / Piket ${teacherForm.value.nama_lengkap} berhasil ditambahkan!`, 'success')
  } else {
    const payload = { ...teacherForm.value }
    if (!rawPass) delete payload.password
    else payload.password = rawPass
    const res = await attendanceStore.updateTeacher(editingTeacherId.value, payload)
    if (!res?.success) {
      uiStore.showToast(res?.message || 'Gagal memperbarui data guru / piket.', 'error')
      return
    }
    uiStore.showToast(`Data guru / piket ${teacherForm.value.nama_lengkap} berhasil diperbarui!`, 'success')
  }
  isTeacherModalOpen.value = false
}

async function deleteTeacherConfirm(teacher) {
  const confirmed = await uiStore.showConfirm({
    title: 'Nonaktifkan Data Guru Piket?',
    message: `Pindahkan data guru piket "${teacher.nama_lengkap}" (${teacher.nomor_induk}) ke status nonaktif (Soft Delete)?\n\nHak akses presensi harian dan scanner QR akan dinonaktifkan.`,
    confirmText: 'Ya, Nonaktifkan',
    cancelText: 'Batal',
    type: 'warning'
  })
  if (confirmed) {
    const res = await attendanceStore.deleteTeacher(teacher.id)
    if (res?.success === false) {
      uiStore.showToast(res.message || 'Gagal menonaktifkan guru.', 'error')
      return
    }
    uiStore.showToast('Data guru piket berhasil dinonaktifkan (Soft Delete).', 'success')
  }
}

// ==================== STATE & METODE MANAJEMEN ADMINISTRATOR ====================
const adminSearchQuery = ref('')
const isAdminModalOpen = ref(false)
const adminModalMode = ref('create') // 'create' | 'edit'
const editingAdminId = ref(null)
const adminForm = ref({
  nama_lengkap: '',
  nomor_induk: '',
  email: '',
  jabatan: 'Staf Tata Usaha',
  password: ''
})

const filteredAdmins = computed(() => {
  if (!attendanceStore.admins) return []
  return attendanceStore.admins.filter(a => {
    if (!adminSearchQuery.value) return true
    const q = adminSearchQuery.value.toLowerCase().trim()
    return (
      (a.nama_lengkap && a.nama_lengkap.toLowerCase().includes(q)) ||
      (a.nomor_induk && a.nomor_induk.toLowerCase().includes(q)) ||
      (a.email && a.email.toLowerCase().includes(q)) ||
      (a.jabatan && a.jabatan.toLowerCase().includes(q))
    )
  })
})

function openCreateAdminModal() {
  adminModalMode.value = 'create'
  editingAdminId.value = null
  showAdminModalPass.value = false
  adminForm.value = {
    nama_lengkap: '',
    nomor_induk: '',
    email: '',
    jabatan: 'Staf Tata Usaha',
    password: ''
  }
  isAdminModalOpen.value = true
}

function openEditAdminModal(admin) {
  adminModalMode.value = 'edit'
  editingAdminId.value = admin.id
  showAdminModalPass.value = false
  adminForm.value = {
    nama_lengkap: admin.nama_lengkap,
    nomor_induk: admin.nomor_induk,
    email: admin.email,
    jabatan: admin.jabatan || 'Staf Tata Usaha',
    password: ''
  }
  isAdminModalOpen.value = true
}

async function saveAdminForm() {
  if (!adminForm.value.nama_lengkap.trim() || !adminForm.value.nomor_induk.trim() || !adminForm.value.email.trim()) {
    uiStore.showToast('Mohon lengkapi Nama Lengkap, Nomor Induk / NIK, dan Email.', 'warning')
    return
  }

  const rawPass = (adminForm.value.password || '').trim()
  if (adminModalMode.value === 'create' && rawPass.length < 6) {
    uiStore.showToast('Password awal Administrator minimal 6 karakter.', 'warning')
    return
  }
  if (adminModalMode.value === 'edit' && rawPass.length > 0 && rawPass.length < 6) {
    uiStore.showToast('Password baru Administrator minimal 6 karakter (atau kosongkan jika tidak diubah).', 'warning')
    return
  }

  if (adminModalMode.value === 'create') {
    const res = await attendanceStore.addAdmin({
      nama_lengkap: adminForm.value.nama_lengkap,
      nomor_induk: adminForm.value.nomor_induk,
      email: adminForm.value.email,
      jabatan: adminForm.value.jabatan,
      password: rawPass
    })
    if (!res?.success) {
      uiStore.showToast(res?.message || 'Gagal menambahkan Administrator.', 'error')
      return
    }
    uiStore.showToast(`Administrator "${adminForm.value.nama_lengkap}" berhasil ditambahkan!`, 'success')
  } else {
    const res = await attendanceStore.updateAdmin(editingAdminId.value, {
      nama_lengkap: adminForm.value.nama_lengkap,
      nomor_induk: adminForm.value.nomor_induk,
      email: adminForm.value.email,
      jabatan: adminForm.value.jabatan,
      password: rawPass || undefined
    })
    if (!res?.success) {
      uiStore.showToast(res?.message || 'Gagal memperbarui data Administrator.', 'error')
      return
    }
    uiStore.showToast('Data Administrator berhasil diperbarui!', 'success')
  }
  isAdminModalOpen.value = false
}

async function deleteAdminConfirm(admin) {
  if (admin.is_root) {
    uiStore.showToast('Akun Super Administrator Utama (Root) tidak dapat dihapus!', 'warning')
    return
  }
  if (authStore.user?.id === admin.id || authStore.user?.email === admin.email) {
    uiStore.showToast('Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif digunakan!', 'warning')
    return
  }

  const confirmed = await uiStore.showConfirm({
    title: 'Hapus Akun Administrator?',
    message:
      `Hapus akun Administrator "${admin.nama_lengkap}" (${admin.nomor_induk})?\n\n` +
      `Hak akses pengelolaan sistem sekolah akan dinonaktifkan.`,
    confirmText: 'Ya, Hapus',
    cancelText: 'Batal',
    type: 'danger'
  })
  if (confirmed) {
    const res = await attendanceStore.deleteAdmin(admin.id, authStore.user?.id)
    if (res?.success) {
      uiStore.showToast('Akun Administrator berhasil dihapus.', 'success')
    } else {
      uiStore.showToast(res?.message || 'Gagal menghapus Administrator.', 'error')
    }
  }
}

function generateTempPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  let token = 'Pkbm#'
  for (let i = 0; i < 6; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

async function resetAdminPasswordConfirm(admin) {
  const tempPassword = generateTempPassword()
  const confirmed = await uiStore.showConfirm({
    title: 'Reset Password Administrator?',
    message:
      `Nama: ${admin.nama_lengkap}\n` +
      `ID/NIK: ${admin.nomor_induk}\n` +
      `Email: ${admin.email}\n\n` +
      `Password sementara yang akan diterapkan: ${tempPassword}\nPastikan Anda mencatat password sementara ini lalu segera ubah setelah login.`,
    confirmText: 'Ya, Reset Password',
    cancelText: 'Batal',
    type: 'warning'
  })
  if (confirmed) {
    const res = await attendanceStore.setAdminPassword(admin.id, tempPassword)
    if (res?.success === false) {
      uiStore.showToast(res.message || 'Gagal mereset password Administrator.', 'error')
      return
    }
    uiStore.showToast(`Password sementara Administrator "${admin.nama_lengkap}": ${tempPassword}`, 'success', 7000)
  }
}

const currentAutoAcademicYear = computed(() => getCurrentAcademicYear())
const dynamicAcademicYearOptions = computed(() => {
  const opts = getAcademicYearOptions(3, 3)
  const currentVal = settingsForm.value.tahun_pelajaran || attendanceStore.activeAcademicYear
  if (currentVal && !opts.includes(currentVal)) {
    opts.push(currentVal)
    opts.sort()
  }
  return opts
})

const settingsForm = ref({
  tahun_pelajaran: attendanceStore.activeAcademicYear,
  ...attendanceStore.schoolSettings
})

watch(() => attendanceStore.schoolSettings, (newSettings) => {
  if (newSettings) {
    settingsForm.value = {
      tahun_pelajaran: attendanceStore.activeAcademicYear,
      ...newSettings
    }
  }
}, { deep: true })

const isFetchingCoords = ref(false)

function countStatus(st) {
  return attendanceStore.todayAttendances.filter(a => a.status === st).length
}

const countAlpa = computed(() => {
  const recordedCount = attendanceStore.todayAttendances.length
  return Math.max(0, attendanceStore.students.length - recordedCount)
})

function renderStudentQr(canvas, token) {
  if (!canvas || !token) return
  nextTick(() => {
    QRCode.toCanvas(canvas, token, {
      width: 60,
      margin: 1,
      color: { dark: '#0f172a', light: '#ffffff' }
    })
  })
}

async function resetToken(studentId) {
  const confirmed = await uiStore.showConfirm({
    title: 'Reset Token Kartu QR?',
    message: 'Apakah Anda yakin ingin mereset token kartu ini? Kartu fisik lama tidak akan bisa di-scan lagi.',
    confirmText: 'Ya, Reset Token',
    cancelText: 'Batal',
    type: 'danger'
  })
  if (confirmed) {
    const res = await attendanceStore.resetStudentQrToken(studentId)
    if (res?.success) {
      uiStore.showToast('Token berhasil diperbarui. Silakan cetak ulang kartu.', 'success')
    } else {
      uiStore.showToast(res?.message || 'Gagal mereset token kartu QR.', 'error')
    }
  }
}

// State & Filter Cetak Kartu ID
const printCardClassFilter = ref('')
const printCardSearchQuery = ref('')
const selectedCardIds = ref([])

const filteredCardStudents = computed(() => {
  return attendanceStore.students.filter(std => {
    const matchClass = printCardClassFilter.value ? std.kelas === printCardClassFilter.value : true
    const q = printCardSearchQuery.value.toLowerCase().trim()
    const matchQuery = q ? (std.nama_lengkap.toLowerCase().includes(q) || std.nomor_induk.includes(q)) : true
    return matchClass && matchQuery
  })
})

// Otomatis pilih semua kartu yang sesuai filter aktif
watch([printCardClassFilter, printCardSearchQuery], () => {
  selectedCardIds.value = filteredCardStudents.value.map(s => s.id)
}, { immediate: true })

function selectAllCards() {
  selectedCardIds.value = filteredCardStudents.value.map(s => s.id)
}

function clearSelectedCards() {
  selectedCardIds.value = []
}

function triggerPrint() {
  if (selectedCardIds.value.length === 0) {
    uiStore.showToast('Silakan pilih minimal 1 kartu siswa yang ingin dicetak.', 'warning')
    return
  }

  const style = document.createElement('style')
  style.id = 'cards-portrait-print'
  style.innerHTML = `@page { size: A4 portrait !important; margin: 8mm 6mm !important; }`
  document.head.appendChild(style)

  // Berikan waktu jeda singkat agar DOM class print-hide-card terpasang sempurna
  setTimeout(() => {
    window.print()
    setTimeout(() => {
      const el = document.getElementById('cards-portrait-print')
      if (el) el.remove()
    }, 1000)
  }, 100)
}

let adminMap = null
let schoolMarker = null
let geofenceCircle = null

function initAdminMap() {
  const container = document.getElementById('admin-map-container')
  if (!container) return

  if (adminMap) {
    adminMap.remove()
    adminMap = null
  }

  const lat = Number(settingsForm.value.latitude) || -6.200000
  const lng = Number(settingsForm.value.longitude) || 106.816666
  const radius = Number(settingsForm.value.radius_meter) || 100

  try {
    adminMap = L.map('admin-map-container').setView([lat, lng], 16)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(adminMap)

    schoolMarker = L.marker([lat, lng]).addTo(adminMap)
      .bindPopup(`<b>${settingsForm.value.nama_sekolah || 'Sekolah'}</b><br>Titik Acuan GPS`)
      .openPopup()

    geofenceCircle = L.circle([lat, lng], {
      color: '#2563eb',
      fillColor: '#3b82f6',
      fillOpacity: 0.15,
      radius: radius
    }).addTo(adminMap)

    // Klik pada peta untuk memindahkan titik koordinat sekolah
    adminMap.on('click', (e) => {
      settingsForm.value.latitude = parseFloat(e.latlng.lat.toFixed(6))
      settingsForm.value.longitude = parseFloat(e.latlng.lng.toFixed(6))
      updateAdminMapVisuals()
    })

    setTimeout(() => {
      adminMap?.invalidateSize()
    }, 200)
  } catch (err) {
    console.error('Error initializing admin map:', err)
  }
}

function updateAdminMapVisuals() {
  const lat = Number(settingsForm.value.latitude) || -6.200000
  const lng = Number(settingsForm.value.longitude) || 106.816666
  const rad = Number(settingsForm.value.radius_meter) || 100

  if (schoolMarker) {
    schoolMarker.setLatLng([lat, lng])
    schoolMarker.setPopupContent(`<b>${settingsForm.value.nama_sekolah || 'Sekolah'}</b><br>Titik Acuan GPS`)
  }
  if (geofenceCircle) {
    geofenceCircle.setLatLng([lat, lng])
    geofenceCircle.setRadius(rad)
  }
  if (adminMap) {
    adminMap.panTo([lat, lng])
  }
}

watch(
  () => [settingsForm.value.latitude, settingsForm.value.longitude, settingsForm.value.radius_meter, settingsForm.value.nama_sekolah],
  () => {
    updateAdminMapVisuals()
  }
)

watch(activeTab, (newTab) => {
  if (newTab === 'settings') {
    nextTick(() => {
      initAdminMap()
    })
  }
})

onMounted(() => {
  if (activeTab.value === 'settings') {
    nextTick(() => {
      initAdminMap()
    })
  }
})

function fetchCurrentCoords() {
  if (!navigator.geolocation) {
    uiStore.showToast('Geolokasi tidak didukung browser.', 'error')
    return
  }
  isFetchingCoords.value = true
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      isFetchingCoords.value = false
      settingsForm.value.latitude = parseFloat(pos.coords.latitude.toFixed(6))
      settingsForm.value.longitude = parseFloat(pos.coords.longitude.toFixed(6))
      updateAdminMapVisuals()
      uiStore.showToast('Koordinat berhasil diambil dari GPS perangkat Anda!', 'success')
    },
    (err) => {
      isFetchingCoords.value = false
      uiStore.showToast('Gagal mengambil koordinat: ' + err.message, 'error')
    },
    { enableHighAccuracy: true }
  )
}

async function saveSettings() {
  const res = await attendanceStore.updateSchoolSettings(settingsForm.value)
  if (res?.success === false) {
    uiStore.showToast(res.message || 'Gagal menyimpan pengaturan sekolah.', 'error')
    return
  }
  uiStore.showToast('Pengaturan sekolah dan batas radius GPS berhasil disimpan!', 'success')
}

// Logika Ganti Password Mandiri Akun Admin
const adminPasswordInput = ref('')
const showAdminPass = ref(false)
const isAdminSavingPass = ref(false)
const adminPasswordFeedback = ref({ success: false, message: '' })

async function handleAdminChangePassword() {
  if (!adminPasswordInput.value || adminPasswordInput.value.length < 6) {
    adminPasswordFeedback.value = {
      success: false,
      message: 'Password baru minimal 6 karakter.'
    }
    return
  }

  isAdminSavingPass.value = true
  const res = await authStore.changeUserPassword(adminPasswordInput.value)
  isAdminSavingPass.value = false

  adminPasswordFeedback.value = {
    success: res.success,
    message: res.message || 'Password Administrator berhasil diperbarui!'
  }

  if (res.success) {
    adminPasswordInput.value = ''
  }
}
</script>

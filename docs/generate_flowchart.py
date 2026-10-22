import os
from PIL import Image, ImageDraw, ImageFont

def draw_perfect_flowchart():
    # Resolusi luas & proporsional: 2600 x 2700 px (Ruang lapang per kolom, 0% overlap)
    W, H = 2600, 2750
    img = Image.new('RGB', (W, H), color='#ffffff')
    draw = ImageDraw.Draw(img)

    # Font setup
    fonts_dir = os.path.join(os.environ.get('WINDIR', 'C:\\Windows'), 'Fonts')
    def get_font(name, size, bold=False):
        try:
            fname = 'segoeuib.ttf' if bold else 'segoeui.ttf'
            if not os.path.exists(os.path.join(fonts_dir, fname)):
                fname = 'arialbd.ttf' if bold else 'arial.ttf'
            return ImageFont.truetype(os.path.join(fonts_dir, fname), size)
        except:
            return ImageFont.load_default()

    font_title = get_font('segoeuib.ttf', 36, bold=True)
    font_subtitle = get_font('segoeui.ttf', 19)
    font_node_title = get_font('segoeuib.ttf', 17, bold=True)
    font_node_text = get_font('segoeui.ttf', 15)
    font_label = get_font('segoeuib.ttf', 15, bold=True)
    font_caption = get_font('segoeui.ttf', 14)

    # 1. Header Standar Dokumen Laporan PKM
    draw.text((100, 50), "FLOWCHART SISTEM PRESENSI SEKOLAH DIGITAL", fill='#0f172a', font=font_title)
    draw.text((100, 100), "Standar Diagram Alir Proses Presensi: Mandiri (GPS + Foto), Scan QR Guru, dan Pengajuan Izin Siswa", fill='#475569', font=font_subtitle)
    draw.line([(100, 140), (W - 100, 140)], fill='#0f172a', width=2)

    # Warna Standar Formal
    C_BORDER = '#0f172a' # Border garis hitam tegas
    C_START = '#f1f5f9'
    C_PROC = '#ffffff'
    C_DEC = '#fffbeb'
    C_IO = '#f8fafc'
    C_WARN = '#fef2f2'
    C_DB = '#f5f3ff'

    # Helper: Teks rata tengah
    def draw_centered_text(cx, cy, lines, bold_first=True, fill='#0f172a'):
        total_h = len(lines) * 23
        start_y = cy - (total_h // 2)
        for idx, line in enumerate(lines):
            f = font_node_title if (idx == 0 and bold_first) else font_node_text
            tw = draw.textlength(line, font=f)
            draw.text((cx - (tw // 2), start_y + idx * 23), line, fill=fill, font=f)

    # Helper: Terminator (Oval)
    def draw_terminator(cx, cy, w, h, text, fill=C_START):
        x1, y1 = cx - w//2, cy - h//2
        x2, y2 = cx + w//2, cy + h//2
        draw.rounded_rectangle([x1, y1, x2, y2], radius=h//2, fill=fill, outline=C_BORDER, width=2)
        draw_centered_text(cx, cy, [text], bold_first=True)

    # Helper: Process (Persegi Panjang)
    def draw_process(cx, cy, w, h, lines, fill=C_PROC):
        x1, y1 = cx - w//2, cy - h//2
        x2, y2 = cx + w//2, cy + h//2
        draw.rectangle([x1, y1, x2, y2], fill=fill, outline=C_BORDER, width=2)
        draw_centered_text(cx, cy, lines)

    # Helper: Decision (Belah Ketupat / Diamond)
    def draw_decision(cx, cy, w, h, lines, fill=C_DEC):
        pts = [(cx, cy - h//2), (cx + w//2, cy), (cx, cy + h//2), (cx - w//2, cy)]
        draw.polygon(pts, fill=fill, outline=C_BORDER)
        draw.line(pts + [pts[0]], fill=C_BORDER, width=2)
        draw_centered_text(cx, cy, lines)

    # Helper: Input/Output (Jajar Genjang)
    def draw_io(cx, cy, w, h, lines, fill=C_IO, skew=22):
        x1, y1 = cx - w//2, cy - h//2
        x2, y2 = cx + w//2, cy + h//2
        pts = [(x1 + skew, y1), (x2, y1), (x2 - skew, y2), (x1, y2)]
        draw.polygon(pts, fill=fill, outline=C_BORDER)
        draw.line(pts + [pts[0]], fill=C_BORDER, width=2)
        draw_centered_text(cx, cy, lines)

    # Helper: Database (Silinder)
    def draw_database(cx, cy, w, h, lines, fill=C_DB):
        x1, y1 = cx - w//2, cy - h//2
        x2, y2 = cx + w//2, cy + h//2
        draw.rectangle([x1, y1 + 14, x2, y2 - 14], fill=fill, outline=C_BORDER, width=2)
        draw.ellipse([x1, y1, x2, y1 + 28], fill=fill, outline=C_BORDER, width=2)
        draw.arc([x1, y2 - 28, x2, y2], start=0, end=180, fill=C_BORDER, width=2)
        draw_centered_text(cx, cy + 4, lines)

    # Helper: Panah Orthogonal (Tegak Lurus) dengan kepala panah presisi
    def draw_arrow(points, color=C_BORDER):
        for i in range(len(points) - 1):
            draw.line([points[i], points[i+1]], fill=color, width=2)
        p_last2 = points[-2]
        p_last = points[-1]
        x1, y1 = p_last2
        x2, y2 = p_last
        head_len = 10
        if x1 == x2 and y2 > y1: # Arah Bawah
            draw.polygon([(x2 - 5, y2 - head_len), (x2 + 5, y2 - head_len), (x2, y2)], fill=color)
        elif x1 == x2 and y1 > y2: # Arah Atas
            draw.polygon([(x2 - 5, y2 + head_len), (x2 + 5, y2 + head_len), (x2, y2)], fill=color)
        elif y1 == y2 and x2 > x1: # Arah Kanan
            draw.polygon([(x2 - head_len, y2 - 5), (x2 - head_len, y2 + 5), (x2, y2)], fill=color)
        elif y1 == y2 and x1 > x2: # Arah Kiri
            draw.polygon([(x2 + head_len, y2 - 5), (x2 + head_len, y2 + 5), (x2, y2)], fill=color)

    # Helper: Label Teks pada Panah dengan Bounding Box Bersih (Anti-Tabrakan)
    def draw_arrow_badge(cx, cy, text, is_positive=True):
        f = font_label
        tw = draw.textlength(text, font=f)
        color = '#047857' if is_positive else '#b91c1c'
        # Kotak putih di belakang teks agar tidak pernah tertabrak garis
        draw.rectangle([cx - tw//2 - 5, cy - 11, cx + tw//2 + 5, cy + 11], fill='#ffffff', outline='#cbd5e1', width=1)
        draw.text((cx - tw//2, cy - 10), text, fill=color, font=f)

    # ==============================================================
    # 2. DEFINISI KOORDINAT & LAYOUT 3 JALUR (RUANG LAPANG 800px / JALUR)
    # ==============================================================
    CX_MAIN = 1300  # Tengah
    CX_GPS  = 520   # Kolom 1 (Kiri)
    CX_QR   = 1300  # Kolom 2 (Tengah)
    CX_IZIN = 2080  # Kolom 3 (Kanan)

    # START (Terminator)
    draw_terminator(CX_MAIN, 200, 200, 55, "MULAI")

    # PROSES: Buka Aplikasi
    draw_process(CX_MAIN, 290, 360, 65, ["Siswa Membuka Aplikasi", "Presensi Sekolah (PWA)"])
    draw_arrow([(CX_MAIN, 228), (CX_MAIN, 258)])

    # DECISION: Pilih Metode
    draw_decision(CX_MAIN, 410, 380, 100, ["Pilih Metode", "Presensi?"])
    draw_arrow([(CX_MAIN, 323), (CX_MAIN, 360)])

    # Cabang ke Jalur 1 (GPS), Jalur 2 (QR), Jalur 3 (Izin)
    draw_arrow([(CX_MAIN - 190, 410), (CX_GPS, 410), (CX_GPS, 475)])
    draw_arrow_badge((CX_MAIN - 190 + CX_GPS)//2, 410, "1. Mandiri GPS", is_positive=True)

    draw_arrow([(CX_MAIN, 460), (CX_QR, 475)])
    draw_arrow_badge(CX_QR, 468, "2. Scan QR Guru", is_positive=True)

    draw_arrow([(CX_MAIN + 190, 410), (CX_IZIN, 410), (CX_IZIN, 475)])
    draw_arrow_badge((CX_MAIN + 190 + CX_IZIN)//2, 410, "3. Pengajuan Izin", is_positive=True)

    # -------------------------------------------------------------
    # JALUR 1: MANDIRI GPS (KOLOM KIRI)
    # -------------------------------------------------------------
    draw_io(CX_GPS, 515, 340, 70, ["Ambil Koordinat GPS", "& Foto Selfie Siswa"])

    draw_process(CX_GPS, 620, 340, 65, ["Hitung Jarak ke Sekolah", "(Rumus Haversine)"])
    draw_arrow([(CX_GPS, 550), (CX_GPS, 588)])

    # Decision Radius
    draw_decision(CX_GPS, 745, 320, 95, ["Jarak <= Radius", "Sekolah (100m)?"])
    draw_arrow([(CX_GPS, 653), (CX_GPS, 698)])

    # Cabang Tidak Radius (Ke Kiri Luar dengan ruang 280px)
    draw_process(180, 745, 230, 65, ["Tampilkan Peringatan:", "Di Luar Wilayah Sekolah"], fill=C_WARN)
    draw_arrow([(CX_GPS - 160, 745), (295, 745)])
    draw_arrow_badge((CX_GPS - 160 + 295)//2, 745, "Tidak", is_positive=False)
    # Loop kembali ke input
    draw_arrow([(180, 712), (180, 515), (CX_GPS - 170, 515)])
    draw_arrow_badge(180, 610, "Coba Lagi", is_positive=False)

    # Cabang Ya Radius (Keluar dari Bawah Diamond)
    draw_arrow([(CX_GPS, 793), (CX_GPS, 875)])
    draw_arrow_badge(CX_GPS, 834, "Ya", is_positive=True)

    # Decision Jam Masuk Toleransi
    draw_decision(CX_GPS, 930, 320, 95, ["Jam Presensi <=", "Jam Toleransi?"])

    # Output Decision Jam Masuk:
    # 1. Ya (Hadir): Keluar Bawah
    draw_process(CX_GPS, 1080, 240, 60, ["Status Presensi:", "HADIR"])
    draw_arrow([(CX_GPS, 978), (CX_GPS, 1050)])
    draw_arrow_badge(CX_GPS, 1014, "Ya", is_positive=True)

    # 2. Tidak (Terlambat): Keluar Kanan secara bersih tanpa memotong
    draw_process(CX_GPS + 260, 1080, 200, 60, ["Status Presensi:", "TERLAMBAT"])
    draw_arrow([(CX_GPS + 160, 930), (CX_GPS + 260, 930), (CX_GPS + 260, 1050)])
    draw_arrow_badge(CX_GPS + 210, 930, "Tidak", is_positive=False)

    # Gabung Log Presensi GPS
    draw_arrow([(CX_GPS, 1110), (CX_GPS, 1175)])
    draw_arrow([(CX_GPS + 260, 1110), (CX_GPS + 260, 1150), (CX_GPS, 1150)])
    draw_process(CX_GPS, 1205, 320, 60, ["Buat Log Presensi:", "Mandiri (GPS + Foto)"])

    # -------------------------------------------------------------
    # JALUR 2: SCAN QR GURU (KOLOM TENGAH)
    # -------------------------------------------------------------
    draw_process(CX_QR, 515, 340, 65, ["Siswa Memperlihatkan", "Kartu Pelajar Digital (QR)"])

    draw_io(CX_QR, 620, 340, 70, ["Guru Memindai QR", "via Kamera Scanner"])
    draw_arrow([(CX_QR, 548), (CX_QR, 585)])

    # Decision Validasi QR Kelas
    draw_decision(CX_QR, 745, 320, 95, ["QR Terdaftar &", "Sesuai Kelas Guru?"])
    draw_arrow([(CX_QR, 655), (CX_QR, 698)])

    # Cabang Tidak QR (Ke Kanan dengan jarak aman 120px)
    draw_process(CX_QR + 270, 745, 190, 65, ["QR Ditolak /", "Bukan Siswa Kelas"], fill=C_WARN)
    draw_arrow([(CX_QR + 160, 745), (CX_QR + 175, 745)])
    draw_arrow_badge((CX_QR + 160 + CX_QR + 175)//2, 745, "Tidak", is_positive=False)

    # Cabang Ya QR (Keluar dari Bawah Diamond)
    draw_arrow([(CX_QR, 793), (CX_QR, 875)])
    draw_arrow_badge(CX_QR, 834, "Ya", is_positive=True)

    # Decision Jam Scan Masuk
    draw_decision(CX_QR, 930, 320, 95, ["Jam Scan <=", "Batas Masuk?"])

    # Output Decision Jam Masuk QR:
    # 1. Ya (Hadir): Keluar Bawah
    draw_process(CX_QR, 1080, 240, 60, ["Status Presensi:", "HADIR"])
    draw_arrow([(CX_QR, 978), (CX_QR, 1050)])
    draw_arrow_badge(CX_QR, 1014, "Ya", is_positive=True)

    # 2. Tidak (Terlambat): Keluar Kiri (karena kanan ada jalur aman)
    draw_process(CX_QR - 240, 1080, 200, 60, ["Status Presensi:", "TERLAMBAT"])
    draw_arrow([(CX_QR - 160, 930), (CX_QR - 240, 930), (CX_QR - 240, 1050)])
    draw_arrow_badge(CX_QR - 200, 930, "Tidak", is_positive=False)

    # Gabung Log Presensi QR
    draw_arrow([(CX_QR, 1110), (CX_QR, 1175)])
    draw_arrow([(CX_QR - 240, 1110), (CX_QR - 240, 1150), (CX_QR, 1150)])
    draw_process(CX_QR, 1205, 320, 60, ["Buat Log Presensi:", "Scan Kartu QR oleh Guru"])

    # -------------------------------------------------------------
    # JALUR 3: PENGAJUAN IZIN / SAKIT (KOLOM KANAN)
    # -------------------------------------------------------------
    draw_io(CX_IZIN, 515, 340, 70, ["Isi Form Izin/Sakit", "& Unggah Bukti Surat"])

    draw_process(CX_IZIN, 620, 340, 65, ["Simpan Permohonan:", "Status = Menunggu Verifikasi"])
    draw_arrow([(CX_IZIN, 550), (CX_IZIN, 588)])

    draw_process(CX_IZIN, 730, 340, 70, ["Guru / TU Memeriksa", "Keterangan & Bukti Surat"])
    draw_arrow([(CX_IZIN, 653), (CX_IZIN, 695)])

    # Decision Approval Izin
    draw_decision(CX_IZIN, 865, 320, 95, ["Permohonan", "Disetujui?"])
    draw_arrow([(CX_IZIN, 765), (CX_IZIN, 818)])

    # Output Decision Approval:
    # 1. Ya (Disetujui): Keluar Bawah
    draw_process(CX_IZIN, 1015, 240, 60, ["Permohonan Diterima", "(Status: IZIN / SAKIT)"])
    draw_arrow([(CX_IZIN, 913), (CX_IZIN, 985)])
    draw_arrow_badge(CX_IZIN, 949, "Ya", is_positive=True)

    # 2. Tidak (Ditolak): Keluar Kanan
    draw_process(CX_IZIN + 250, 1015, 200, 60, ["Permohonan Ditolak", "(Status: ALPA)"], fill=C_WARN)
    draw_arrow([(CX_IZIN + 160, 865), (CX_IZIN + 250, 865), (CX_IZIN + 250, 985)])
    draw_arrow_badge(CX_IZIN + 205, 865, "Tidak", is_positive=False)

    # Gabung Log Izin
    draw_arrow([(CX_IZIN, 1045), (CX_IZIN, 1175)])
    draw_arrow([(CX_IZIN + 250, 1045), (CX_IZIN + 250, 1130), (CX_IZIN, 1130)])
    draw_process(CX_IZIN, 1205, 320, 60, ["Update Rekap Presensi:", "Sesuai Keputusan"])

    # ==============================================================
    # 3. PENYIMPANAN DATA & SINKRONISASI (BOTTOM LAYER)
    # ==============================================================
    Y_BUS = 1320
    # Ketiga kolom turun ke bus horizontal tanpa saling silang
    draw_arrow([(CX_GPS, 1235), (CX_GPS, Y_BUS), (CX_MAIN, Y_BUS)])
    draw_arrow([(CX_QR, 1235), (CX_MAIN, Y_BUS)])
    draw_arrow([(CX_IZIN, 1235), (CX_IZIN, Y_BUS), (CX_MAIN, Y_BUS)])

    # Dari Bus bar turun ke Database Silinder
    Y_DB = 1420
    draw_arrow([(CX_MAIN, Y_BUS), (CX_MAIN, Y_DB - 45)])
    draw_database(CX_MAIN, Y_DB, 440, 90, ["DATABASE PRESENSI & JURNAL", "(LocalStorage / Supabase Sync)"])

    # Update Dashboard & Rekap
    Y_DASH = 1580
    draw_arrow([(CX_MAIN, Y_DB + 45), (CX_MAIN, Y_DASH - 35)])
    draw_process(CX_MAIN, Y_DASH, 520, 70, ["Sistem Memperbarui Dashboard Real-Time,", "Jurnal Kelas Guru, & Rekapitulasi Siswa"])

    # Laporan Akhir (I/O)
    Y_OUT = 1720
    draw_arrow([(CX_MAIN, Y_DASH + 35), (CX_MAIN, Y_OUT - 35)])
    draw_io(CX_MAIN, Y_OUT, 480, 70, ["Laporan Presensi Harian & Bulanan", "Siap Dicetak / Export Excel"])

    # SELESAI (Terminator)
    Y_END = 1850
    draw_arrow([(CX_MAIN, Y_OUT + 35), (CX_MAIN, Y_END - 28)])
    draw_terminator(CX_MAIN, Y_END, 200, 55, "SELESAI")

    # ==============================================================
    # 4. KETERANGAN SIMBOL RESMI (STANDAR ANSI / ISO 5807)
    # ==============================================================
    Y_LEG = 1970
    draw.line([(100, Y_LEG), (W - 100, Y_LEG)], fill='#cbd5e1', width=1)
    draw.text((100, Y_LEG + 25), "KETERANGAN SIMBOL FLOWCHART (STANDAR ANSI / ISO 5807):", fill='#0f172a', font=font_node_title)

    # 4 Legenda Simbol Rapi
    draw_terminator(280, Y_LEG + 105, 170, 46, "Mulai / Selesai")
    draw.text((385, Y_LEG + 95), ": Awal atau akhir alur proses", fill='#334155', font=font_node_text)

    draw_process(840, Y_LEG + 105, 150, 46, ["Proses"])
    draw.text((935, Y_LEG + 95), ": Aktivitas eksekusi / kalkulasi sistem", fill='#334155', font=font_node_text)

    draw_decision(1480, Y_LEG + 105, 150, 56, ["Keputusan"])
    draw.text((1575, Y_LEG + 95), ": Titik percabangan logika (Ya / Tidak)", fill='#334155', font=font_node_text)

    draw_io(2080, Y_LEG + 105, 150, 46, ["Input / Output"])
    draw.text((2175, Y_LEG + 95), ": Pemasukan data / hasil laporan", fill='#334155', font=font_node_text)

    # Footer
    draw.text((100, H - 55), "Dokumen Lampiran Teknis • Program Kreativitas Mahasiswa (PKM) - Sistem Presensi Sekolah Digital", fill='#64748b', font=font_caption)

    # Simpan
    out_path = os.path.join('docs', 'flowchart_presensi_sekolah.png')
    img.save(out_path, format='PNG', optimize=True)
    print(f"Zero-Collision Flowchart successfully generated at {out_path} ({W}x{H}px)")

if __name__ == '__main__':
    draw_perfect_flowchart()

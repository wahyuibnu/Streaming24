<div align="center">
  <h1>🚀 StreamAuto 24/7</h1>
  <p><strong>Platform Live Streaming Otomatis Kelas Enterprise untuk Kreator Konten</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/Next.js-14+-black?style=flat-square&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/FFmpeg-Ready-blue?style=flat-square&logo=ffmpeg" alt="FFmpeg" />
    <img src="https://img.shields.io/badge/Node.js-18+-green?style=flat-square&logo=node.js" alt="Node.js" />
    <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" alt="License" />
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome" />
  </p>
</div>

---

Bosan komputer Anda harus menyala seharian penuh hanya untuk menjaga siaran *live* tetap berjalan? 

**StreamAuto 24/7** adalah solusi *dashboard* mandiri bergaya SaaS yang dirancang khusus untuk memutar video Anda secara terus-menerus ke berbagai platform sekaligus (YouTube, TikTok, Twitch, & Kick). Dibangun dengan perpaduan teknologi canggih antara keindahan Next.js dan ketangguhan mesin FFmpeg di *backend*, proyek ini mengubah VPS sederhana Anda menjadi stasiun TV pribadi yang tidak pernah tidur.

## ✨ Fitur Unggulan

- **📡 Multicast Matrix (4 Platform)**: Siarkan konten Anda secara bersamaan ke YouTube, TikTok, Twitch, dan Kick langsung dari satu *dashboard*.
- **🎵 Lofi Radio Mode (Audio Shuffle)**: Unggah deretan lagu MP3 favorit Anda. Sistem akan otomatis menyatukan (Muxing) visual video utama Anda dengan playlist musik yang diacak—sempurna untuk *channel* gaya "Lofi Hip-Hop 24/7".
- **💬 Live Marquee (Teks Berjalan)**: Ingin menyapa donatur atau memberi pengumuman *live*? Ubah teks berjalan (Running Text) langsung dari *dashboard* dan video Anda akan ter- *update* seketika tanpa perlu menghentikan siaran.
- **🛡️ Sistem Keamanan Berlapis (Brute-Force Protection)**: Panel admin diamankan dengan autentikasi berbasis sesi (*cookie*) serta pelacakan *lockout* otomatis jika ada percobaan *login* paksa oleh *hacker*.
- **🚀 Eksekusi GPU (Hardware Acceleration)**: Jika server Anda dilengkapi GPU, sistem bisa diatur untuk menggunakan NVENC (Nvidia) atau QSV (Intel) agar performa CPU tetap sangat rendah (0-5%).
- **🔴 VOD Archiving Otomatis**: Rekam siaran Anda secara paralel (*Tee Muxing*) langsung ke dalam hardisk server tanpa membebani prosesor sama sekali.
- **🤖 Penjaga Siaran (Anti-Zombie & Auto-Restart)**: Jika koneksi internet putus, sistem akan otomatis melakukan *restart* dalam 5 detik. Tidak hanya itu, aplikasi akan otomatis mematikan *Zombie Process* FFmpeg untuk mencegah memori server Anda bocor.

## 📦 Persyaratan Sistem

- **Node.js** (versi 18 ke atas)
- **FFmpeg** (Wajib terinstal di OS Anda: `sudo apt install ffmpeg`)
- **Fonts Dejavu** (Untuk teks berjalan: `sudo apt install fonts-dejavu-core`)
- Disarankan menggunakan sistem berbasis Linux (Ubuntu/Debian) untuk performa 24/7 terbaik.

## 🚀 Instalasi & Cara Penggunaan

1. **Unduh Repositori**
   ```bash
   git clone https://github.com/wahyuibnu/Streaming24.git
   cd Streaming24
   ```

2. **Instal Dependensi**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment**
   Ganti nama `.env.example` menjadi `.env` lalu sesuaikan dengan kunci rahasia Anda.
   ```bash
   cp .env.example .env
   ```
   > 💡 **Penting:** Pastikan Anda mengubah `ADMIN_PASSWORD` di dalam `.env` untuk melindungi *dashboard* Anda dari jangkauan publik.

4. **Unggah Media Anda**
   - Video utama bisa diunggah langsung melalui *Dashboard* Web nanti.
   - Atau, masukkan file video berformat `.mp4` ke dalam folder `public/videos/`.
   - (Opsional) Masukkan file `.mp3` ke folder `public/audio/` untuk mengaktifkan mode *Radio Lofi*.

5. **Jalankan Aplikasi**
   Untuk tahap uji coba:
   ```bash
   npm run dev
   ```
   Untuk disebarkan di *Production* (Disarankan menggunakan PM2):
   ```bash
   sudo npm install -g pm2
   npm run build
   pm2 start ecosystem.config.js
   pm2 save
   ```

6. Buka `http://<IP-Server-Anda>:8080` di browser dan masuk menggunakan *password* yang telah Anda buat.

## 🛠️ Modifikasi Tingkat Lanjut (Advanced Config)

Buka file `.env` untuk melakukan kustomisasi FFmpeg kelas profesional:
- `STREAM_BITRATE`: Atur kualitas *bitrate* (Misal: `3000k` atau `6000k`)
- `HARDWARE_ENCODER`: Ganti dari `libx264` ke `h264_nvenc` jika Anda menyewa server ber-GPU.
- `ENABLE_ARCHIVE`: Ubah ke `true` jika Anda ingin siaran Anda direkam secara otomatis dalam potongan-potongan MP4 beresolusi tinggi.
- `DISCORD_WEBHOOK_URL`: Pasang *link* Discord Anda untuk mendapatkan notifikasi *real-time* ke HP jika siaran Anda terputus.

## 📄 Lisensi

Proyek ini didistribusikan di bawah lisensi MIT. Anda dibebaskan untuk memodifikasi, menggunakan untuk komersial, maupun membagikan kembali kode sumber ini. Selamat berkarya!

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
- **🖼️ Dynamic Image Logo Watermark**: Tingkatkan *branding* saluran Anda! Unggah logo transparan (.png) langsung dari *Dashboard*, dan sistem akan otomatis menempelkannya di pojok kiri atas siaran layaknya stasiun televisi sungguhan.
- **🤖 Remote API Trigger (Webhook)**: Kontrol penuh dari luar! Anda kini bisa menyalakan atau mematikan siaran dari jarak jauh menggunakan API rahasia yang terhubung langsung dengan aplikasi otomatisasi seperti Zapier, IFTTT, atau Siri Shortcuts.
- **📦 One-Click Server Export**: Pindah server? Tidak perlu repot memindahkan file secara manual. Klik tombol "Export Backup" di Dashboard, dan seluruh video, audio, teks, serta file .env Anda akan terunduh menjadi satu file `.tar.gz` yang siap dipasang di tempat baru.
- **🛡️ Fail-Safe Fallback Screen**: Jika terjadi kesalahan (misalnya video terhapus atau kosong), sistem secara otomatis memutar video "Please Stand By" darurat agar koneksi Anda ke YouTube/TikTok tidak pernah terputus.
- **👻 Anti-Banned Pixel Randomization**: *Fitur Dewa Rahasia*. Sistem menyuntikkan *noise/grain* mikroskopis (*Temporal Noise*) yang berubah di setiap *frame*. Ini menghancurkan algoritma pelacak *Video Hashing* milik AI YouTube dan TikTok, membuat mereka mengira video *looping* Anda adalah siaran kamera *Live* yang 100% organik. Anti *shadowban*, anti *spam-strike*.
- **🎵 Real-Time Audio Spectrum Visualizer**: Punya saluran Musik / Lofi 24/7? Aktifkan fitur ini di *Settings*, dan FFmpeg akan secara gaib merender grafik gelombang frekuensi suara (*Audio EQ Bars*) secara *real-time* dan menempelkannya di atas video Anda. Menjadikan *streaming* statis Anda terasa sangat interaktif dan premium layaknya saluran musik profesional!

## 📦 Persyaratan Sistem

- Server berbasis Linux (Ubuntu/Debian) untuk performa 24/7 terbaik.
- Jika menginstal manual: **Node.js** 18+ & **FFmpeg**.

## 🚀 Instalasi & Cara Penggunaan

### ⚡ Metode 1: One-Click Auto Installer (Paling Cepat & Mudah)

Buka terminal di server Linux (VPS) Anda yang masih kosong (fresh install), lalu *copy-paste* perintah pamungkas ini:

```bash
curl -sL https://raw.githubusercontent.com/wahyuibnu/Streaming24/main/install.sh | bash
```

*Script* ini akan mengambil alih semuanya: menginstal Docker, mengunduh repositori, membuat file `.env`, dan langsung menjalankan *server* secara otomatis. Setelah selesai, ia akan memberi tahu IP Dashboard Anda!

### 🐳 Metode 2: Menggunakan Docker Manual

1. **Unduh Repositori & Persiapkan Environment**
   ```bash
   git clone https://github.com/wahyuibnu/Streaming24.git
   cd Streaming24
   cp .env.example .env
   ```
   > 💡 Edit file `.env` dan masukkan password serta Stream Key Anda.

2. **Jalankan dengan Satu Perintah**
   ```bash
   docker-compose up -d
   ```
   Aplikasi Anda kini sudah menyala dan kebal dari *error* sistem operasi! Buka `http://<IP-Server>:8080`.

### 🖥️ Metode 2: Instalasi Manual (Native Linux)

Gunakan metode ini jika Anda tidak menggunakan Docker.

1. **Instal Dependensi Sistem**
   ```bash
   sudo apt update
   sudo apt install ffmpeg fonts-dejavu-core -y
   ```

2. **Unduh & Instal Aplikasi**
   ```bash
   git clone https://github.com/wahyuibnu/Streaming24.git
   cd Streaming24
   npm install
   cp .env.example .env
   ```

3. **Jalankan Aplikasi (Production)**
   ```bash
   sudo npm install -g pm2
   npm run build
   pm2 start ecosystem.config.js
   pm2 save
   ```

## 🛠️ Modifikasi Tingkat Lanjut (Advanced Config)

Buka file `.env` untuk melakukan kustomisasi FFmpeg kelas profesional:
- `STREAM_BITRATE`: Atur kualitas *bitrate* (Misal: `3000k` atau `6000k`)
- `HARDWARE_ENCODER`: Ganti dari `libx264` ke `h264_nvenc` jika Anda menyewa server ber-GPU.
- `ENABLE_ARCHIVE`: Ubah ke `true` jika Anda ingin siaran Anda direkam secara otomatis dalam potongan-potongan MP4 beresolusi tinggi.
- `DISCORD_WEBHOOK_URL`: Pasang *link* Discord Anda untuk mendapatkan notifikasi *real-time* ke HP jika siaran Anda terputus.

## 📄 Lisensi

Proyek ini didistribusikan di bawah lisensi MIT. Anda dibebaskan untuk memodifikasi, menggunakan untuk komersial, maupun membagikan kembali kode sumber ini. Selamat berkarya!

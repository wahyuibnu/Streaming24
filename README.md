# StreamAuto 24/7

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Status](https://img.shields.io/badge/Status-Beta-orange.svg)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-14.x-black.svg)
![FFmpeg](https://img.shields.io/badge/FFmpeg-4.4%2B-red.svg)

StreamAuto 24/7 is a professional, self-hosted live streaming automation platform. Built with Next.js and powered by FFmpeg, it allows you to broadcast pre-recorded videos and audio continuously to multiple platforms (YouTube, TikTok, Twitch, and Kick) simultaneously without relying on third-party SaaS subscriptions.

## Key Features

- **Multi-Platform Broadcasting**: Stream to up to four platforms simultaneously using a single low-overhead interface.
- **Hardware Acceleration**: Built-in support for NVENC (NVIDIA) and QSV (Intel) to minimize CPU usage during 24/7 transcoding.
- **Dynamic Overlays**: Supports live running text (marquee) and custom branding logos. These can be updated on-the-fly without restarting the stream.
- **Real-Time Audio Visualizer**: Automatically generates and overlays an audio spectrum visualizer, ideal for 24/7 music or Lofi streams.
- **Temporal Noise Injection**: Integrates subtle frame-by-frame pixel randomization to prevent repetitive content from being flagged by automated spam algorithms (Video Hashing Evasion).
- **VOD Auto-Archiving**: Automatically saves a local, high-quality copy of your broadcast directly to the server's storage using Tee Muxing.
- **Fail-Safe Mechanism**: Automatically transitions to a fallback screen if media files are missing or deleted, ensuring stream uptime is preserved.
- **Remote API Trigger**: Includes a secure API endpoint to start or stop streams remotely via external automation tools (e.g., Zapier, IFTTT, cron jobs).
- **In-App Management**: Features a complete web-based dashboard to manage media files, edit environment configurations, monitor system telemetry, view terminal logs, and export server backups.

## System Requirements

- Linux-based operating system (Ubuntu/Debian recommended for stability)
- Node.js 18.x or higher (if deploying natively)
- FFmpeg installed in the system path (`ffmpeg`, `fonts-dejavu-core`)
- Docker & Docker Compose (optional, but highly recommended for deployment)

## Installation

### Method 1: Automated Script (Recommended)
Run the following command on a fresh Linux server. The script will automatically install Docker, clone the repository, configure the environment, and start the application.

```bash
curl -sL https://raw.githubusercontent.com/wahyuibnu/Streaming24/main/install.sh | bash
```

### Method 2: Docker Compose (Manual)
```bash
git clone https://github.com/wahyuibnu/Streaming24.git
cd Streaming24
cp .env.example .env
# Edit your .env file with your specific credentials before proceeding
docker-compose up -d
```

### Method 3: Native Node.js Deployment
```bash
sudo apt update
sudo apt install ffmpeg fonts-dejavu-core -y
git clone https://github.com/wahyuibnu/Streaming24.git
cd Streaming24
npm install
cp .env.example .env
npm run build
sudo npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
```

## Configuration

All system configurations can be modified securely through the web dashboard by navigating to the **Settings** menu. Alternatively, you can edit the `.env` file directly on your server.

Important variables include:
- `ADMIN_PASSWORD`: Secures your web dashboard against unauthorized access.
- `YOUTUBE_STREAM_KEY`, `TIKTOK_STREAM_KEY`: Your broadcasting credentials.
- `HARDWARE_ENCODER`: Set to `libx264` (CPU), `h264_nvenc` (NVIDIA), or `h264_qsv` (Intel).
- `ENABLE_VISUALIZER`: Toggle the real-time audio spectrum overlay.

## Media Management

Upload your `.mp4` video files, `.mp3` audio files, and a `logo.png` file directly via the dashboard's **Media Library** panel. The system will automatically construct the playlists, apply the necessary overlays, and normalize the audio volume for broadcasting.

## License

This project is licensed under the [MIT License](LICENSE).

# StreamAuto 24/7

StreamAuto 24/7 is a robust, lightweight SaaS-style dashboard built with Next.js and FFmpeg that allows you to stream a single video file on an infinite loop to YouTube and TikTok simultaneously, 24 hours a day, 7 days a week.

## 🌟 Features
- **Simultaneous Streaming:** Push live streams to both YouTube and TikTok concurrently.
- **24/7 Infinite Loop:** Automatically loops your selected MP4 video indefinitely using FFmpeg.
- **Secure Credentials:** All Stream Keys and URLs are stored safely in `.env` and are never exposed to the frontend.
- **Glassmorphism UI:** A premium, modern, and dark-themed dashboard to monitor your streams.
- **API Controlled:** Streams are managed via Next.js background workers and child processes.

## 🚀 Prerequisites
- Node.js (v18 or newer)
- FFmpeg installed on your server (`sudo apt install ffmpeg`)
- A Linux VPS or local server to keep the streams running 24/7.

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/StreamAuto247.git
   cd StreamAuto247
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and fill in your details:
   - `PORT`: The port for the web dashboard (default: 8080)
   - `YOUTUBE_STREAM_KEY`: Your YouTube Live stream key
   - `TIKTOK_STREAM_KEY`: Your TikTok Live stream key
   - `TIKTOK_RTMP_URL`: Your TikTok Server URL (e.g., rtmp://...)
   - `VIDEO_FILE_PATH`: The absolute or relative path to the MP4 file you want to stream (e.g., `./public/stream_video.mp4`).

4. **Add Your Video:**
   Place the MP4 file you want to loop in the `public/` directory and name it `stream_video.mp4`, or update the path in `.env`.

5. **Start the Dashboard:**
   To run in development mode:
   ```bash
   npm run dev
   ```
   To run in production (Recommended for 24/7 stability):
   ```bash
   # 1. Install PM2 globally
   sudo npm install -g pm2
   
   # 2. Build the Next.js app
   npm run build
   
   # 3. Start the application using the ecosystem file
   pm2 start ecosystem.config.js
   
   # 4. Save PM2 state so it restarts on server reboot
   pm2 save
   pm2 startup
   ```

## 🛡 Reliability (Auto-Restart)
- **FFmpeg Auto-Restart:** If the stream drops due to a network hiccup or TikTok/YouTube closing the connection, the internal `streamManager` will automatically restart FFmpeg after 5 seconds to keep the 24/7 loop alive.
- **App Auto-Restart:** PM2 ensures that the web dashboard itself is always running, even if the VPS restarts.

## 🛠 Usage
1. Open your browser and navigate to `http://<your-server-ip>:8080`.
2. You will see the StreamAuto dashboard.
3. Click **Start Stream** on the YouTube or TikTok cards.
4. The dashboard will communicate with the backend API to spawn an FFmpeg process that pushes your video to the respective RTMP servers.
5. Click **Stop Stream** to kill the background FFmpeg process gracefully.

## 📄 License
MIT License

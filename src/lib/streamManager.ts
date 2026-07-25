import { spawn, ChildProcess } from 'child_process';
import cron from 'node-cron';
import fs from 'fs';
import path from 'path';

type Platform = 'youtube' | 'tiktok' | 'twitch' | 'kick';

const globalStore = global as unknown as {
  processes: Record<Platform, ChildProcess | undefined>;
  intents: Record<Platform, 'online' | 'offline'>;
  logs: string[];
  schedulerInitialzed?: boolean;
};

if (!globalStore.processes) globalStore.processes = { youtube: undefined, tiktok: undefined, twitch: undefined, kick: undefined };
if (!globalStore.intents) globalStore.intents = { youtube: 'offline', tiktok: 'offline', twitch: 'offline', kick: 'offline' };
if (!globalStore.logs) globalStore.logs = [];

if (!globalStore.schedulerInitialzed) {
  const cleanup = () => {
    Object.values(globalStore.processes).forEach(p => {
      if (p && !p.killed) p.kill('SIGKILL');
    });
  };
  process.on('exit', cleanup);
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

function addLog(msg: string) {
  const time = new Date().toISOString().split('T')[1].split('.')[0];
  globalStore.logs.unshift(`[${time}] ${msg}`);
  if (globalStore.logs.length > 50) globalStore.logs.pop();
}

async function sendWebhook(message: string) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: `🚨 **StreamAuto 24/7 Alert**\n${message}` })
    });
  } catch (e) {
    addLog('[System] Gagal mengirim peringatan webhook');
  }
}

function buildPlaylists() {
  const publicDir = path.join(process.cwd(), 'public');
  const videosDir = path.join(publicDir, 'videos');
  const audioDir = path.join(publicDir, 'audio');
  
  if (!fs.existsSync(videosDir)) fs.mkdirSync(videosDir, { recursive: true });
  if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });
  
  let videoFiles = fs.readdirSync(videosDir).filter(f => f.endsWith('.mp4')).sort();
  
  // FAIL-SAFE FALLBACK SYSTEM
  let isUsingFallback = false;
  if (videoFiles.length === 0) {
    if (fs.existsSync(path.join(publicDir, 'fallback.mp4'))) {
      videoFiles = ['../fallback.mp4']; // Relative to public/videos/ for concat
      isUsingFallback = true;
      addLog('[Sistem] Peringatan: Memutar video cadangan (Fail-Safe) karena playlist kosong.');
    } else {
      throw new Error('Silakan unggah minimal 1 file MP4 terlebih dahulu.');
    }
  }
  
  const audioFiles = fs.readdirSync(audioDir).filter(f => f.endsWith('.mp3')).sort(() => Math.random() - 0.5);
  
  const videoPlaylistPath = path.join(publicDir, 'video_playlist.txt');
  const audioPlaylistPath = path.join(publicDir, 'audio_playlist.txt');
  
  fs.writeFileSync(videoPlaylistPath, videoFiles.map(f => `file 'videos/${f}'`).join('\n'));
  
  const hasAudio = audioFiles.length > 0 && !isUsingFallback;
  if (hasAudio) {
    fs.writeFileSync(audioPlaylistPath, audioFiles.map(f => `file 'audio/${f}'`).join('\n'));
  }
  
  const hasLogo = fs.existsSync(path.join(publicDir, 'logo.png'));
  
  return { videoPlaylistPath, audioPlaylistPath, hasAudio, hasLogo, isUsingFallback };
}

export function startStream(platform: Platform) {
  globalStore.intents[platform] = 'online';
  _spawnFFmpeg(platform);
}

function _spawnFFmpeg(platform: Platform) {
  if (globalStore.processes[platform]) return;

  let rtmpUrl, streamKey;
  if (platform === 'youtube') { rtmpUrl = process.env.YOUTUBE_RTMP_URL; streamKey = process.env.YOUTUBE_STREAM_KEY; }
  else if (platform === 'tiktok') { rtmpUrl = process.env.TIKTOK_RTMP_URL; streamKey = process.env.TIKTOK_STREAM_KEY; }
  else if (platform === 'twitch') { rtmpUrl = process.env.TWITCH_RTMP_URL || 'rtmp://live.twitch.tv/app'; streamKey = process.env.TWITCH_STREAM_KEY; }
  else if (platform === 'kick') { rtmpUrl = process.env.KICK_RTMP_URL; streamKey = process.env.KICK_STREAM_KEY; }

  if (!rtmpUrl || !streamKey || streamKey.includes('your_')) {
    throw new Error(`Kredensial RTMP/Key untuk ${platform} belum diatur di .env`);
  }

  const { videoPlaylistPath, audioPlaylistPath, hasAudio, hasLogo } = buildPlaylists();
  const bitrate = process.env.STREAM_BITRATE || '3000k';
  const preset = process.env.STREAM_PRESET || 'veryfast';
  const resolution = process.env.STREAM_RESOLUTION || '1280x720';
  const hwEncoder = process.env.HARDWARE_ENCODER || 'libx264'; // Supports: libx264, h264_nvenc, h264_qsv, h264_amf
  const enableArchive = process.env.ENABLE_ARCHIVE === 'true';

  let ffmpegArgs = ['-re', '-f', 'concat', '-safe', '0', '-stream_loop', '-1', '-i', videoPlaylistPath];
  if (hasAudio) ffmpegArgs.push('-f', 'concat', '-safe', '0', '-stream_loop', '-1', '-i', audioPlaylistPath);
  if (hasLogo) ffmpegArgs.push('-i', 'logo.png');

  let filterChain = '';
  let currentVideo = '[0:v]';
  const audioInput = hasAudio ? '[1:a]' : '[0:a]';
  let hasComplex = false;

  // 1. Audio Visualizer (if enabled)
  if (process.env.ENABLE_VISUALIZER === 'true') {
    filterChain += `${audioInput}showwaves=s=1280x150:colors=cyan:mode=cline,format=yuva420p[wave];`;
    filterChain += `${currentVideo}[wave]overlay=0:H-h[vwithwave];`;
    currentVideo = '[vwithwave]';
    hasComplex = true;
  }

  // 2. Logo Overlay
  if (hasLogo) {
    const logoIndex = hasAudio ? 2 : 1;
    filterChain += `${currentVideo}[${logoIndex}:v]overlay=20:20[vwithlogo];`;
    currentVideo = '[vwithlogo]';
    hasComplex = true;
  }

  // 3. Text & Noise Filters
  const marqueePath = path.join(process.cwd(), 'public', 'marquee.txt');
  let vfFilters = `drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:textfile='${marqueePath}':reload=1:y=h-line_h-15:x=w-mod(t*150\\,w+tw):fontsize=28:fontcolor=white:box=1:boxcolor=black@0.6:boxborderw=10`;
  if (process.env.ENABLE_WATERMARK === 'true') {
    vfFilters += `,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:text='%{localtime}':x=w-tw-20:y=20:fontsize=24:fontcolor=white@0.8:box=1:boxcolor=black@0.4:boxborderw=5`;
  }
  // Anti-Banned Pixel Randomization
  vfFilters += `,noise=c0s=2:allf=t`;

  if (hasComplex) {
    filterChain += `${currentVideo}${vfFilters}[vout]`;
    ffmpegArgs.push('-filter_complex', filterChain);
    ffmpegArgs.push('-map', '[vout]');
  } else {
    ffmpegArgs.push('-vf', vfFilters);
    ffmpegArgs.push('-map', '0:v:0');
  }

  if (hasAudio) ffmpegArgs.push('-map', '1:a:0'); // map audio from 2nd input
  else ffmpegArgs.push('-map', '0:a:0'); // map audio from 1st input

  // Multi-output setup using pseudo-muxer if Archive is enabled
  // We apply the encoding args before specifying outputs
  ffmpegArgs = ffmpegArgs.concat([
    '-c:v', hwEncoder,
    '-preset', preset,
    '-b:v', bitrate,
    '-maxrate', bitrate,
    '-bufsize', `${parseInt(bitrate) * 2}k`,
    '-s', resolution,
    '-pix_fmt', 'yuv420p',
    '-g', '50',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-ar', '44100',
    '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11' // Audio Mastering
  ]);

  if (enableArchive) {
    // Uses the tee muxer to output to both RTMP and a local segment archive simultaneously without re-encoding
    const archivePath = path.join(process.cwd(), 'public', 'archives', `archive_${platform}_%Y%m%d_%H%M%S.mp4`);
    ffmpegArgs.push(
      '-f', 'tee',
      '-map', '0:v?', '-map', '0:a?', // map whatever was filtered
      `[f=flv:flvflags=no_duration_filesize]${rtmpUrl}/${streamKey}|[f=segment:segment_time=3600:reset_timestamps=1:strftime=1]${archivePath}`
    );
  } else {
    ffmpegArgs.push(
      '-f', 'flv',
      '-flvflags', 'no_duration_filesize',
      `${rtmpUrl}/${streamKey}`
    );
  }

  addLog(`[${platform}] Memulai siaran | Encoder: ${hwEncoder} | Arsip: ${enableArchive ? 'AKTIF' : 'MATI'}`);
  const ffmpeg = spawn('ffmpeg', ffmpegArgs, { cwd: path.join(process.cwd(), 'public') });

  ffmpeg.stderr.on('data', (data) => {
    const output = data.toString();
    if (output.includes('frame=') || output.includes('bitrate=')) addLog(`[${platform}] ${output.trim()}`);
    else if (output.toLowerCase().includes('error')) addLog(`[${platform}] KESALAHAN: ${output.trim()}`);
  });

  ffmpeg.on('close', (code) => {
    addLog(`[${platform}] Siaran terputus (Kode ${code})`);
    globalStore.processes[platform] = undefined;

    if (globalStore.intents[platform] === 'online') {
      addLog(`[${platform}] Auto-restarting dalam 5 detik...`);
      sendWebhook(`Koneksi ${platform} terputus. Sistem akan otomatis restart dalam 5 detik.`);
      setTimeout(() => {
        if (globalStore.intents[platform] === 'online') _spawnFFmpeg(platform);
      }, 5000);
    }
  });

  globalStore.processes[platform] = ffmpeg;
}

export function stopStream(platform: Platform) {
  globalStore.intents[platform] = 'offline';
  const process = globalStore.processes[platform];
  if (!process) throw new Error(`Siaran ${platform} saat ini sedang tidak berjalan`);
  process.kill('SIGINT');
  addLog(`[${platform}] Siaran dihentikan secara manual.`);
}

export function stopAllStreams() {
  (['youtube', 'tiktok', 'twitch', 'kick'] as Platform[]).forEach(p => {
    globalStore.intents[p] = 'offline';
    if (globalStore.processes[p] && !globalStore.processes[p]?.killed) {
      globalStore.processes[p]?.kill('SIGKILL');
      addLog(`[${p}] Siaran dihentikan darurat (PANIC BUTTON).`);
    }
  });
}

export function getStreamStatus() {
  return {
    youtube: !!globalStore.processes.youtube && !globalStore.processes.youtube.killed,
    tiktok: !!globalStore.processes.tiktok && !globalStore.processes.tiktok.killed,
    twitch: !!globalStore.processes.twitch && !globalStore.processes.twitch.killed,
    kick: !!globalStore.processes.kick && !globalStore.processes.kick.killed,
    logs: globalStore.logs
  };
}

export function initScheduler() {
  if (globalStore.schedulerInitialzed) return;
  globalStore.schedulerInitialzed = true;
  cron.schedule('0 3 * * *', () => {
    addLog('[Sistem] Jadwal: Memasuki waktu istirahat');
    (['youtube', 'tiktok', 'twitch', 'kick'] as Platform[]).forEach(p => {
      try { stopStream(p); } catch(e){}
    });
    sendWebhook('Waktu istirahat terjadwal (03:00). Semua siaran dihentikan sementara.');
  });
  cron.schedule('0 7 * * *', () => {
    addLog('[Sistem] Jadwal: Membangunkan siaran');
    (['youtube', 'tiktok', 'twitch', 'kick'] as Platform[]).forEach(p => {
      if(globalStore.intents[p] === 'online') {
        try { startStream(p); } catch(e){}
      }
    });
    sendWebhook('Sistem kembali aktif (07:00). Memulai ulang semua siaran yang dijadwalkan.');
  });
}

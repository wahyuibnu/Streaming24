import { spawn, ChildProcess } from 'child_process';
import cron from 'node-cron';
import fs from 'fs';
import path from 'path';

const globalStore = global as unknown as {
  youtubeProcess?: ChildProcess;
  tiktokProcess?: ChildProcess;
  youtubeIntent?: 'online' | 'offline';
  tiktokIntent?: 'online' | 'offline';
  logs: string[];
  schedulerInitialzed?: boolean;
};

if (!globalStore.logs) globalStore.logs = [];

// Zombie Process Prevention
if (!globalStore.schedulerInitialzed) {
  const cleanup = () => {
    if (globalStore.youtubeProcess && !globalStore.youtubeProcess.killed) globalStore.youtubeProcess.kill('SIGKILL');
    if (globalStore.tiktokProcess && !globalStore.tiktokProcess.killed) globalStore.tiktokProcess.kill('SIGKILL');
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
    addLog('[System] Failed to send webhook alert');
  }
}

function generatePlaylist() {
  const videosDir = path.join(process.cwd(), 'public', 'videos');
  const playlistPath = path.join(videosDir, 'playlist.txt');
  
  if (!fs.existsSync(videosDir)) fs.mkdirSync(videosDir, { recursive: true });
  
  const files = fs.readdirSync(videosDir).filter(f => f.endsWith('.mp4')).sort();
  if (files.length === 0) throw new Error('No MP4 videos found in public/videos directory.');
  
  const playlistContent = files.map(f => `file '${f}'`).join('\n');
  fs.writeFileSync(playlistPath, playlistContent);
  return playlistPath;
}

export function startStream(platform: 'youtube' | 'tiktok') {
  if (platform === 'youtube') globalStore.youtubeIntent = 'online';
  if (platform === 'tiktok') globalStore.tiktokIntent = 'online';
  _spawnFFmpeg(platform);
}

function _spawnFFmpeg(platform: 'youtube' | 'tiktok') {
  if (platform === 'youtube' && globalStore.youtubeProcess) return;
  if (platform === 'tiktok' && globalStore.tiktokProcess) return;

  const rtmpUrl = platform === 'youtube' ? process.env.YOUTUBE_RTMP_URL : process.env.TIKTOK_RTMP_URL;
  const streamKey = platform === 'youtube' ? process.env.YOUTUBE_STREAM_KEY : process.env.TIKTOK_STREAM_KEY;

  if (!rtmpUrl || !streamKey || streamKey.includes('your_')) {
    throw new Error(`Missing or invalid RTMP URL/Key for ${platform}`);
  }

  const playlistPath = generatePlaylist();
  const bitrate = process.env.STREAM_BITRATE || '3000k';
  const preset = process.env.STREAM_PRESET || 'veryfast';
  const resolution = process.env.STREAM_RESOLUTION || '1280x720';

  let ffmpegArgs = [
    '-re',
    '-f', 'concat',
    '-safe', '0',
    '-stream_loop', '-1',
    '-i', playlistPath
  ];

  // Optional Watermark
  if (process.env.ENABLE_WATERMARK === 'true') {
    ffmpegArgs.push('-vf', "drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:text='%{localtime}':x=w-tw-20:y=20:fontsize=24:fontcolor=white@0.8:box=1:boxcolor=black@0.4:boxborderw=5");
  }

  ffmpegArgs = ffmpegArgs.concat([
    '-c:v', 'libx264',
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
    '-f', 'flv',
    '-flvflags', 'no_duration_filesize',
    `${rtmpUrl}/${streamKey}`
  ]);

  addLog(`[${platform}] Starting stream with Playlist, Bitrate: ${bitrate}, Res: ${resolution}`);
  const ffmpeg = spawn('ffmpeg', ffmpegArgs, { cwd: path.join(process.cwd(), 'public', 'videos') });

  ffmpeg.stderr.on('data', (data) => {
    const output = data.toString();
    if (output.includes('frame=') || output.includes('bitrate=')) addLog(`[${platform}] ${output.trim()}`);
    else if (output.toLowerCase().includes('error')) addLog(`[${platform}] ERROR: ${output.trim()}`);
  });

  ffmpeg.on('close', (code) => {
    addLog(`[${platform}] Closed (code ${code})`);
    if (platform === 'youtube') globalStore.youtubeProcess = undefined;
    if (platform === 'tiktok') globalStore.tiktokProcess = undefined;

    const intent = platform === 'youtube' ? globalStore.youtubeIntent : globalStore.tiktokIntent;
    if (intent === 'online') {
      addLog(`[${platform}] Auto-restarting in 5s...`);
      sendWebhook(`The ${platform} stream dropped and is attempting to auto-restart in 5 seconds.`);
      setTimeout(() => {
        const currentIntent = platform === 'youtube' ? globalStore.youtubeIntent : globalStore.tiktokIntent;
        if (currentIntent === 'online') _spawnFFmpeg(platform);
      }, 5000);
    }
  });

  if (platform === 'youtube') globalStore.youtubeProcess = ffmpeg;
  if (platform === 'tiktok') globalStore.tiktokProcess = ffmpeg;
}

export function stopStream(platform: 'youtube' | 'tiktok') {
  if (platform === 'youtube') globalStore.youtubeIntent = 'offline';
  if (platform === 'tiktok') globalStore.tiktokIntent = 'offline';
  const process = platform === 'youtube' ? globalStore.youtubeProcess : globalStore.tiktokProcess;
  if (!process) throw new Error(`${platform} stream is not running`);
  process.kill('SIGINT');
  addLog(`[${platform}] Stream stopped manually.`);
}

export function getStreamStatus() {
  return {
    youtube: !!globalStore.youtubeProcess && !globalStore.youtubeProcess.killed,
    tiktok: !!globalStore.tiktokProcess && !globalStore.tiktokProcess.killed,
    logs: globalStore.logs
  };
}

export function initScheduler() {
  if (globalStore.schedulerInitialzed) return;
  globalStore.schedulerInitialzed = true;
  cron.schedule('0 3 * * *', () => {
    addLog('[System] Scheduler: Rest period');
    try { stopStream('youtube'); } catch(e){}
    try { stopStream('tiktok'); } catch(e){}
    sendWebhook('Scheduled rest period started. Streams stopped.');
  });
  cron.schedule('0 7 * * *', () => {
    addLog('[System] Scheduler: Waking up');
    try { startStream('youtube'); } catch(e){}
    try { startStream('tiktok'); } catch(e){}
    sendWebhook('Scheduled wake up. Streams started.');
  });
}

import { spawn, ChildProcess } from 'child_process';
import cron from 'node-cron';

const globalStore = global as unknown as {
  youtubeProcess?: ChildProcess;
  tiktokProcess?: ChildProcess;
  youtubeIntent?: 'online' | 'offline';
  tiktokIntent?: 'online' | 'offline';
  logs: string[];
  schedulerInitialzed?: boolean;
};

if (!globalStore.logs) globalStore.logs = [];

// Zombie Process Prevention: Kill FFmpeg if Node.js server shuts down or restarts
if (!globalStore.schedulerInitialzed) {
  const cleanup = () => {
    if (globalStore.youtubeProcess && !globalStore.youtubeProcess.killed) {
      globalStore.youtubeProcess.kill('SIGKILL');
    }
    if (globalStore.tiktokProcess && !globalStore.tiktokProcess.killed) {
      globalStore.tiktokProcess.kill('SIGKILL');
    }
  };
  
  process.on('exit', cleanup);
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('SIGUSR1', cleanup);
  process.on('SIGUSR2', cleanup);
}

function addLog(msg: string) {
  const time = new Date().toISOString().split('T')[1].split('.')[0];
  globalStore.logs.unshift(`[${time}] ${msg}`);
  if (globalStore.logs.length > 50) globalStore.logs.pop(); // Keep last 50 lines
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
  const videoPath = process.env.VIDEO_FILE_PATH || './public/stream_video.mp4';

  if (!rtmpUrl || !streamKey || streamKey === 'your_youtube_stream_key_here' || streamKey === 'your_tiktok_stream_key_here') {
    throw new Error(`Missing or invalid RTMP URL or Stream Key for ${platform} in .env`);
  }

  const fullUrl = `${rtmpUrl}/${streamKey}`;

  // FFmpeg arguments for infinite loop 24/7 streaming WITH live clock overlay to prevent spam detection
  const ffmpegArgs = [
    '-re',
    '-stream_loop', '-1',
    '-i', videoPath,
    '-vf', "drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:text='%{localtime}':x=w-tw-20:y=20:fontsize=24:fontcolor=white@0.8:box=1:boxcolor=black@0.4:boxborderw=5",
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-b:v', '3000k',
    '-maxrate', '3000k',
    '-bufsize', '6000k',
    '-pix_fmt', 'yuv420p',
    '-g', '50',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-ar', '44100',
    '-f', 'flv',
    '-flvflags', 'no_duration_filesize',
    fullUrl
  ];

  addLog(`[${platform}] Starting stream...`);
  const ffmpeg = spawn('ffmpeg', ffmpegArgs);

  ffmpeg.stderr.on('data', (data) => {
    const output = data.toString();
    // Only log actual metrics to avoid spamming the log view with junk
    if (output.includes('frame=') || output.includes('bitrate=')) {
      addLog(`[${platform}] ${output.trim()}`);
    } else if (output.includes('error') || output.includes('Error')) {
      addLog(`[${platform}] ERROR: ${output.trim()}`);
    }
  });

  ffmpeg.on('close', (code) => {
    addLog(`[${platform}] Connection closed (code ${code})`);
    
    if (platform === 'youtube') globalStore.youtubeProcess = undefined;
    if (platform === 'tiktok') globalStore.tiktokProcess = undefined;

    const intent = platform === 'youtube' ? globalStore.youtubeIntent : globalStore.tiktokIntent;
    if (intent === 'online') {
      addLog(`[${platform}] Auto-restarting in 5 seconds...`);
      setTimeout(() => {
        const currentIntent = platform === 'youtube' ? globalStore.youtubeIntent : globalStore.tiktokIntent;
        if (currentIntent === 'online') {
           _spawnFFmpeg(platform);
        }
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
  
  if (!process) {
    throw new Error(`${platform} stream is not running`);
  }

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

// Scheduler Setup
export function initScheduler() {
  if (globalStore.schedulerInitialzed) return;
  globalStore.schedulerInitialzed = true;

  // Example: Stop at 03:00 AM, Start at 07:00 AM everyday
  // This can be configurable via API or DB in the future
  cron.schedule('0 3 * * *', () => {
    addLog('[System] Scheduler triggered: Stopping streams for rest period');
    try { stopStream('youtube'); } catch(e){}
    try { stopStream('tiktok'); } catch(e){}
  });

  cron.schedule('0 7 * * *', () => {
    addLog('[System] Scheduler triggered: Waking up streams');
    try { startStream('youtube'); } catch(e){}
    try { startStream('tiktok'); } catch(e){}
  });

  addLog('[System] Daily Scheduler active: Rest at 03:00, Wake at 07:00');
}

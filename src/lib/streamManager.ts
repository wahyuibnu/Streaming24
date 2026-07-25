import { spawn, ChildProcess } from 'child_process';

const globalProcessStore = global as unknown as {
  youtubeProcess?: ChildProcess;
  tiktokProcess?: ChildProcess;
  youtubeIntent?: 'online' | 'offline';
  tiktokIntent?: 'online' | 'offline';
};

export function startStream(platform: 'youtube' | 'tiktok') {
  if (platform === 'youtube') globalProcessStore.youtubeIntent = 'online';
  if (platform === 'tiktok') globalProcessStore.tiktokIntent = 'online';

  _spawnFFmpeg(platform);
}

function _spawnFFmpeg(platform: 'youtube' | 'tiktok') {
  if (platform === 'youtube' && globalProcessStore.youtubeProcess) return;
  if (platform === 'tiktok' && globalProcessStore.tiktokProcess) return;

  const rtmpUrl = platform === 'youtube' ? process.env.YOUTUBE_RTMP_URL : process.env.TIKTOK_RTMP_URL;
  const streamKey = platform === 'youtube' ? process.env.YOUTUBE_STREAM_KEY : process.env.TIKTOK_STREAM_KEY;
  const videoPath = process.env.VIDEO_FILE_PATH || './public/stream_video.mp4';

  if (!rtmpUrl || !streamKey || streamKey === 'your_youtube_stream_key_here' || streamKey === 'your_tiktok_stream_key_here') {
    throw new Error(`Missing or invalid RTMP URL or Stream Key for ${platform} in .env`);
  }

  const fullUrl = `${rtmpUrl}/${streamKey}`;

  const ffmpegArgs = [
    '-re',
    '-stream_loop', '-1',
    '-i', videoPath,
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

  console.log(`[${platform}] Starting FFmpeg...`);
  const ffmpeg = spawn('ffmpeg', ffmpegArgs);

  ffmpeg.on('close', (code) => {
    console.log(`[${platform}] FFmpeg process exited with code ${code}`);
    
    if (platform === 'youtube') globalProcessStore.youtubeProcess = undefined;
    if (platform === 'tiktok') globalProcessStore.tiktokProcess = undefined;

    const intent = platform === 'youtube' ? globalProcessStore.youtubeIntent : globalProcessStore.tiktokIntent;
    if (intent === 'online') {
      console.log(`[${platform}] Stream closed unexpectedly. Auto-restarting in 5 seconds...`);
      setTimeout(() => {
        const currentIntent = platform === 'youtube' ? globalProcessStore.youtubeIntent : globalProcessStore.tiktokIntent;
        if (currentIntent === 'online') {
           _spawnFFmpeg(platform);
        }
      }, 5000);
    }
  });

  if (platform === 'youtube') globalProcessStore.youtubeProcess = ffmpeg;
  if (platform === 'tiktok') globalProcessStore.tiktokProcess = ffmpeg;
}

export function stopStream(platform: 'youtube' | 'tiktok') {
  if (platform === 'youtube') globalProcessStore.youtubeIntent = 'offline';
  if (platform === 'tiktok') globalProcessStore.tiktokIntent = 'offline';

  const process = platform === 'youtube' ? globalProcessStore.youtubeProcess : globalProcessStore.tiktokProcess;
  
  if (!process) {
    throw new Error(`${platform} stream is not running`);
  }

  process.kill('SIGINT');
}

export function getStreamStatus() {
  return {
    youtube: !!globalProcessStore.youtubeProcess && !globalProcessStore.youtubeProcess.killed,
    tiktok: !!globalProcessStore.tiktokProcess && !globalProcessStore.tiktokProcess.killed,
  };
}

import { NextResponse } from 'next/server';
import { startStream, stopStream, stopAllStreams } from '@/lib/streamManager';

export async function POST(req: Request) {
  try {
    const { action, platform } = await req.json();

    if (action === 'panic') {
      stopAllStreams();
      return NextResponse.json({ success: true, message: 'All streams stopped via Panic Button!' });
    }

    if (!['start', 'stop'].includes(action) || !['youtube', 'tiktok', 'twitch', 'kick'].includes(platform)) {
      return NextResponse.json({ error: 'Invalid action or platform' }, { status: 400 });
    }

    if (action === 'start') {
      startStream(platform);
      return NextResponse.json({ success: true, message: `Started ${platform} stream` });
    } else {
      stopStream(platform);
      return NextResponse.json({ success: true, message: `Stopped ${platform} stream` });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

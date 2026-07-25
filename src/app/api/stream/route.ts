import { NextResponse } from 'next/server';
import { startStream, stopStream } from '@/lib/streamManager';

export async function POST(req: Request) {
  try {
    const { action, platform } = await req.json();

    if (!['start', 'stop'].includes(action) || !['youtube', 'tiktok', 'twitch', 'kick'].includes(platform)) {
      return NextResponse.json({ error: 'Invalid action or platform' }, { status: 400 });
    }

    if (action === 'start') {
      startStream(platform);
      return NextResponse.json({ success: true, message: `${platform} stream started.` });
    } else {
      stopStream(platform);
      return NextResponse.json({ success: true, message: `${platform} stream stopped.` });
    }

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

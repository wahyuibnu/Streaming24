import { NextResponse } from 'next/server';
import { getStreamStatus, initScheduler } from '@/lib/streamManager';

export async function GET() {
  // Lazy initialize the scheduler on first dashboard load
  initScheduler();
  return NextResponse.json(getStreamStatus());
}

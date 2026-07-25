import { NextResponse } from 'next/server';
import { getStreamStatus } from '@/lib/streamManager';

export async function GET() {
  return NextResponse.json(getStreamStatus());
}

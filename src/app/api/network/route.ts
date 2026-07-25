import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    // Ping YouTube ingest server 4 times
    const { stdout } = await execAsync('ping -c 4 a.rtmp.youtube.com');
    const lines = stdout.split('\n');
    const rttLine = lines.find(l => l.includes('min/avg/max/mdev'));
    
    if (rttLine) {
      const avgPing = rttLine.split('=')[1].split('/')[1];
      return NextResponse.json({ status: 'healthy', ping: `${avgPing} ms` });
    }
    return NextResponse.json({ status: 'warning', ping: 'Unknown' });
  } catch (error) {
    return NextResponse.json({ status: 'error', error: 'Ping failed' }, { status: 500 });
  }
}

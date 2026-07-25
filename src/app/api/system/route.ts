import { NextResponse } from 'next/server';
import os from 'os';

export async function GET() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memUsagePercent = ((usedMem / totalMem) * 100).toFixed(1);

  const cpus = os.cpus();
  const uptime = os.uptime();

  return NextResponse.json({
    memory: {
      used: (usedMem / 1024 / 1024 / 1024).toFixed(2),
      total: (totalMem / 1024 / 1024 / 1024).toFixed(2),
      percent: memUsagePercent
    },
    cpu: cpus[0].model,
    cores: cpus.length,
    uptime: formatUptime(uptime)
  });
}

function formatUptime(seconds: number) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  
  const dDisplay = d > 0 ? d + (d === 1 ? " day, " : " days, ") : "";
  const hDisplay = h > 0 ? h + (h === 1 ? " hr, " : " hrs, ") : "";
  const mDisplay = m > 0 ? m + (m === 1 ? " min" : " mins") : "";
  return dDisplay + hDisplay + mDisplay;
}

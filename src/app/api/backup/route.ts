import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

export async function GET(req: Request) {
  try {
    const backupPath = path.join(process.cwd(), 'backup.tar.gz');
    
    // Create a tarball of the public directory and .env file
    // Excluding the archives to save space, but keeping videos, audio, logo, marquee
    await execAsync(`tar --exclude='public/archives/*' -czf ${backupPath} public .env`);

    if (!fs.existsSync(backupPath)) {
      throw new Error('Backup failed to generate');
    }

    const fileBuffer = fs.readFileSync(backupPath);
    
    // Clean up
    fs.unlinkSync(backupPath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/gzip',
        'Content-Disposition': 'attachment; filename="streamauto_backup.tar.gz"',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

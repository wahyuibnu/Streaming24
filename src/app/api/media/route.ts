import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    const videosDir = path.join(publicDir, 'videos');
    const audioDir = path.join(publicDir, 'audio');
    
    const videos = fs.existsSync(videosDir) ? fs.readdirSync(videosDir).filter(f => f.endsWith('.mp4')) : [];
    const audio = fs.existsSync(audioDir) ? fs.readdirSync(audioDir).filter(f => f.endsWith('.mp3')) : [];
    const logo = fs.existsSync(path.join(publicDir, 'logo.png'));

    return NextResponse.json({ videos, audio, logo });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { type, filename } = await req.json();
    const publicDir = path.join(process.cwd(), 'public');
    let filePath = '';

    if (type === 'logo') {
      filePath = path.join(publicDir, 'logo.png');
    } else if (type === 'video') {
      filePath = path.join(publicDir, 'videos', filename);
    } else if (type === 'audio') {
      filePath = path.join(publicDir, 'audio', filename);
    } else {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return NextResponse.json({ success: true, message: 'File successfully deleted.' });
    } else {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

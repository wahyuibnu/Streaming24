import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import fs from 'fs';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('video') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!file.name.endsWith('.mp4')) {
      return NextResponse.json({ error: 'Only MP4 files are allowed' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/videos
    const publicDir = path.join(process.cwd(), 'public', 'videos');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    // Prefix with timestamp so it orders correctly in playlist
    const fileName = `${Date.now()}_${file.name.replace(/\\s+/g, '_')}`;
    const filePath = path.join(publicDir, fileName);
    await writeFile(filePath, buffer);

    return NextResponse.json({ success: true, message: 'Video uploaded and added to playlist.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

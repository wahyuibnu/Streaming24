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

    const isLogo = file.name.endsWith('.png');
    if (!file.name.endsWith('.mp4') && !isLogo) {
      return NextResponse.json({ error: 'File format not supported' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (isLogo) {
      const logoPath = path.join(process.cwd(), 'public', 'logo.png');
      await writeFile(logoPath, buffer);
      return NextResponse.json({ success: true, message: 'Logo watermark updated successfully!' });
    } else {
      const publicDir = path.join(process.cwd(), 'public', 'videos');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const filePath = path.join(publicDir, fileName);
      await writeFile(filePath, buffer);
      return NextResponse.json({ success: true, message: 'Video uploaded and added to playlist.' });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import path from 'path';
import fs from 'fs';

const marqueePath = path.join(process.cwd(), 'public', 'marquee.txt');

export async function GET() {
  try {
    if (!fs.existsSync(marqueePath)) {
      return NextResponse.json({ text: '' });
    }
    const text = await readFile(marqueePath, 'utf-8');
    return NextResponse.json({ text: text.trim() });
  } catch (error) {
    return NextResponse.json({ text: '' });
  }
}

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (typeof text !== 'string') {
      return NextResponse.json({ error: 'Invalid text format' }, { status: 400 });
    }
    await writeFile(marqueePath, text);
    return NextResponse.json({ success: true, message: 'Running text updated successfully!' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

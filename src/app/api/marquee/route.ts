import { NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import path from 'path';
import fs from 'fs';

const marqueePath = path.join(process.cwd(), 'public', 'marquee.txt');

export async function GET() {
  try {
    let text = 'Welcome to the Live Stream!';
    if (fs.existsSync(marqueePath)) {
      text = fs.readFileSync(marqueePath, 'utf8');
    }
    return NextResponse.json({ text });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    fs.writeFileSync(marqueePath, text);
    return NextResponse.json({ success: true, message: 'Running text updated successfully!' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

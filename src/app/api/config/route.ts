import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env');

function readEnv() {
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const config: Record<string, string> = {};
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const splitIndex = trimmed.indexOf('=');
      if (splitIndex > -1) {
        const key = trimmed.substring(0, splitIndex).trim();
        const value = trimmed.substring(splitIndex + 1).trim();
        config[key] = value;
      }
    }
  });
  return config;
}

export async function GET() {
  try {
    const config = readEnv();
    return NextResponse.json(config);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const updates = await req.json();
    const currentConfig = readEnv();
    const newConfig = { ...currentConfig, ...updates };
    
    let newContent = '';
    for (const [key, value] of Object.entries(newConfig)) {
      newContent += `${key}=${value}\n`;
      process.env[key] = value as string;
    }
    
    fs.writeFileSync(envPath, newContent);
    return NextResponse.json({ success: true, message: 'Settings saved successfully! (Changes to Stream Keys apply on next stream start)' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

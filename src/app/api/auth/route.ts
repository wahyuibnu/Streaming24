import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Simple brute-force protection
const globalAuthStore = global as unknown as { failedAttempts: number; lockUntil: number };
if (globalAuthStore.failedAttempts === undefined) {
  globalAuthStore.failedAttempts = 0;
  globalAuthStore.lockUntil = 0;
}

export async function POST(req: Request) {
  try {
    const now = Date.now();
    if (globalAuthStore.lockUntil > now) {
      const remainingMinutes = Math.ceil((globalAuthStore.lockUntil - now) / 60000);
      return NextResponse.json({ error: `Too many failed attempts. Locked for ${remainingMinutes} minute(s).` }, { status: 429 });
    }

    const { password } = await req.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json({ error: 'System not configured. Admin password missing.' }, { status: 500 });
    }

    if (password === adminPassword) {
      // Success - reset attempts
      globalAuthStore.failedAttempts = 0;
      
      const cookieStore = await cookies();
      cookieStore.set('stream_session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7 // 1 week
      });

      return NextResponse.json({ success: true });
    } else {
      globalAuthStore.failedAttempts += 1;
      if (globalAuthStore.failedAttempts >= 5) {
        globalAuthStore.lockUntil = now + 15 * 60 * 1000; // Lock for 15 minutes
        return NextResponse.json({ error: 'Too many failed attempts. Locked for 15 minutes.' }, { status: 429 });
      }
      return NextResponse.json({ error: `Invalid password. ${5 - globalAuthStore.failedAttempts} attempts remaining.` }, { status: 401 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('stream_session');
  return NextResponse.json({ success: true });
}

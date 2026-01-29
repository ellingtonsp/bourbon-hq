import { NextRequest, NextResponse } from 'next/server';
import { sendMessage, listSessions } from '@/lib/gateway';

export async function GET() {
  // Get recent sessions/messages
  const result = await listSessions();
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { message, sessionKey = 'main' } = body;

  if (!message) {
    return NextResponse.json(
      { ok: false, error: { message: 'Message required' } },
      { status: 400 }
    );
  }

  const result = await sendMessage(message, sessionKey);
  return NextResponse.json(result);
}

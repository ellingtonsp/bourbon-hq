import { NextRequest, NextResponse } from 'next/server';

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://127.0.0.1:18789';
const GATEWAY_PASSWORD = process.env.GATEWAY_PASSWORD || '';

export async function GET() {
  // Health check
  try {
    const res = await fetch(`${GATEWAY_URL}/tools/invoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GATEWAY_PASSWORD}`,
      },
      body: JSON.stringify({ tool: 'session_status', args: {} }),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ ok: false, error: 'Connection failed' });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { messages, stream = true } = body;

  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json(
      { ok: false, error: { message: 'Messages array required' } },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`${GATEWAY_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GATEWAY_PASSWORD}`,
        'x-clawdbot-agent-id': 'main',
      },
      body: JSON.stringify({
        model: 'clawdbot:main',
        stream,
        messages,
        user: 'bourbon-hq-chat',
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { ok: false, error: { message: `Gateway error: ${response.status} ${text}` } },
        { status: response.status }
      );
    }

    if (stream && response.body) {
      // Return streaming response
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Non-streaming response
    const data = await response.json();
    return NextResponse.json({
      ok: true,
      response: data.choices?.[0]?.message?.content || 'No response',
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { ok: false, error: { message: error instanceof Error ? error.message : 'Unknown error' } },
      { status: 500 }
    );
  }
}

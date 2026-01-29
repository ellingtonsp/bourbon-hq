import { NextRequest, NextResponse } from 'next/server';

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://127.0.0.1:18789';
const GATEWAY_PASSWORD = process.env.GATEWAY_PASSWORD || '';

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path');
  
  if (!path) {
    return NextResponse.json({ ok: false, error: 'Path required' }, { status: 400 });
  }

  // Security: only allow reading from workspace
  if (!path.startsWith('/Users/bourbon/clawd')) {
    return NextResponse.json({ ok: false, error: 'Access denied' }, { status: 403 });
  }

  try {
    const response = await fetch(`${GATEWAY_URL}/tools/invoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GATEWAY_PASSWORD}`,
      },
      body: JSON.stringify({
        tool: 'read',
        args: { path },
      }),
    });

    const data = await response.json();
    
    if (data.ok && data.result !== undefined) {
      return NextResponse.json({ ok: true, content: data.result });
    }

    return NextResponse.json({ 
      ok: false, 
      error: data.error?.message || 'Failed to read file' 
    });
  } catch (error) {
    console.error('Read error:', error);
    return NextResponse.json({ ok: false, error: 'Network error' });
  }
}

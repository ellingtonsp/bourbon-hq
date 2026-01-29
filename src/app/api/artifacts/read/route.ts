import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';

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
    const content = await readFile(path, 'utf-8');
    return NextResponse.json({ ok: true, content });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to read file';
    // Check if it's a "file not found" error
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return NextResponse.json({ ok: false, error: 'File not found' }, { status: 404 });
    }
    return NextResponse.json({ ok: false, error: message });
  }
}

import { NextResponse } from 'next/server';

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://127.0.0.1:18789';
const GATEWAY_PASSWORD = process.env.GATEWAY_PASSWORD || '';

// Determine type from filename
function getFileType(name: string): string {
  if (name.includes('MEMORY') || name.match(/^\d{4}-\d{2}-\d{2}\.md$/)) return 'memory';
  if (name.includes('draft') || name.includes('Draft')) return 'draft';
  if (name.includes('report') || name.includes('Report')) return 'report';
  if (name.endsWith('.json') || name.includes('config')) return 'config';
  return 'document';
}

export async function GET() {
  try {
    // Find markdown and important files in workspace
    const response = await fetch(`${GATEWAY_URL}/tools/invoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GATEWAY_PASSWORD}`,
      },
      body: JSON.stringify({
        tool: 'exec',
        args: {
          command: `find /Users/bourbon/clawd -maxdepth 2 -type f \\( -name "*.md" -o -name "*.json" \\) ! -path "*/node_modules/*" ! -path "*/.git/*" ! -path "*/.next/*" 2>/dev/null | head -30`,
          timeout: 10,
        },
      }),
    });

    const data = await response.json();
    
    if (data.ok && data.result) {
      const output = typeof data.result === 'string' ? data.result : data.result.stdout || '';
      const paths = output.split('\n').filter((p: string) => p.trim());
      
      const files = paths.map((path: string, index: number) => {
        const name = path.split('/').pop() || path;
        return {
          id: String(index),
          name,
          path,
          type: getFileType(name),
        };
      });

      // Sort: memory files first, then by name
      files.sort((a: { type: string; name: string }, b: { type: string; name: string }) => {
        if (a.type === 'memory' && b.type !== 'memory') return -1;
        if (b.type === 'memory' && a.type !== 'memory') return 1;
        return a.name.localeCompare(b.name);
      });

      return NextResponse.json({ ok: true, files });
    }

    return NextResponse.json({ ok: false, error: 'Failed to list files', files: [] });
  } catch (error) {
    console.error('Artifacts error:', error);
    return NextResponse.json({ ok: false, error: 'Network error', files: [] });
  }
}

import { NextResponse } from 'next/server';

// Known important workspace files
const WORKSPACE_FILES = [
  { path: '/Users/bourbon/clawd/MEMORY.md', name: 'MEMORY.md', type: 'memory' },
  { path: '/Users/bourbon/clawd/SOUL.md', name: 'SOUL.md', type: 'document' },
  { path: '/Users/bourbon/clawd/USER.md', name: 'USER.md', type: 'document' },
  { path: '/Users/bourbon/clawd/AGENTS.md', name: 'AGENTS.md', type: 'document' },
  { path: '/Users/bourbon/clawd/TOOLS.md', name: 'TOOLS.md', type: 'config' },
  { path: '/Users/bourbon/clawd/IDENTITY.md', name: 'IDENTITY.md', type: 'document' },
  { path: '/Users/bourbon/clawd/HEARTBEAT.md', name: 'HEARTBEAT.md', type: 'config' },
  { path: '/Users/bourbon/clawd/memory/heartbeat-state.json', name: 'heartbeat-state.json', type: 'config' },
];

// Generate today's date for memory file
function getTodayMemoryFile(): { path: string; name: string; type: string } {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  return {
    path: `/Users/bourbon/clawd/memory/${dateStr}.md`,
    name: `${dateStr}.md`,
    type: 'memory',
  };
}

// Generate yesterday's date for memory file  
function getYesterdayMemoryFile(): { path: string; name: string; type: string } {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().split('T')[0];
  return {
    path: `/Users/bourbon/clawd/memory/${dateStr}.md`,
    name: `${dateStr}.md`,
    type: 'memory',
  };
}

export async function GET() {
  // Build file list with dynamic date files
  const files = [
    getTodayMemoryFile(),
    getYesterdayMemoryFile(),
    ...WORKSPACE_FILES,
  ].map((f, i) => ({
    id: String(i),
    ...f,
  }));

  return NextResponse.json({ ok: true, files });
}

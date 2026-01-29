'use client';

import { useEffect, useState } from 'react';

interface Status {
  model: string;
  session: string;
  uptime: string;
  novaraDAU: number;
  lastActivity: string;
}

export default function StatusBar() {
  const [status, setStatus] = useState<Status>({
    model: 'claude-opus-4-5',
    session: 'main',
    uptime: '2h 34m',
    novaraDAU: 7,
    lastActivity: 'Just now',
  });

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[var(--success)] rounded-full animate-pulse"></span>
            <span className="text-sm font-medium">Online</span>
          </div>
          
          <div className="text-sm">
            <span className="text-[var(--muted)]">Model:</span>{' '}
            <span className="font-mono">{status.model}</span>
          </div>

          <div className="text-sm">
            <span className="text-[var(--muted)]">Session:</span>{' '}
            <span className="font-mono">{status.session}</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-sm">
            <span className="text-[var(--muted)]">Novara DAU:</span>{' '}
            <span className="font-semibold text-[var(--accent)]">{status.novaraDAU}</span>
          </div>

          <div className="text-sm font-mono text-[var(--muted)]">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';

interface Status {
  model: string;
  session: string;
  connected: boolean;
  error?: string;
}

export default function StatusBar() {
  const [status, setStatus] = useState<Status>({
    model: 'unknown',
    session: 'main',
    connected: false,
  });
  const [time, setTime] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/status');
        const data = await res.json();
        if (data.ok && data.result) {
          // Extract model from statusText or details
          const statusText = data.result.details?.statusText || data.result.content?.[0]?.text || '';
          const modelMatch = statusText.match(/Model:\s*([^\s·]+)/);
          const sessionMatch = statusText.match(/Session:\s*([^\s•]+)/);
          setStatus({
            model: modelMatch?.[1] || data.result.model || 'opus',
            session: sessionMatch?.[1] || data.result.details?.sessionKey || 'main',
            connected: true,
          });
        } else {
          setStatus(prev => ({ ...prev, connected: false, error: data.error?.message }));
        }
      } catch (err) {
        setStatus(prev => ({ ...prev, connected: false, error: 'Network error' }));
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${
              status.connected 
                ? 'bg-[var(--success)] animate-pulse' 
                : 'bg-[var(--danger)]'
            }`}></span>
            <span className="text-sm font-medium">
              {status.connected ? 'Connected' : 'Disconnected'}
            </span>
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
          {status.error && (
            <div className="text-sm text-[var(--danger)]">
              {status.error}
            </div>
          )}

          <div className="text-sm font-mono text-[var(--muted)]">
            {mounted && time ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--'}
          </div>
        </div>
      </div>
    </div>
  );
}

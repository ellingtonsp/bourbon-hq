'use client';

import { useState, useEffect } from 'react';

interface CronJob {
  id: string;
  name?: string;
  text?: string;
  schedule: string | { kind: string; expr: string; tz?: string };
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
  state?: {
    lastRunAtMs?: number;
    nextRunAtMs?: number;
  };
  payload?: {
    kind?: string;
    message?: string;
    text?: string;
  };
}

// Helper to get schedule string
function getScheduleExpr(schedule: CronJob['schedule']): string {
  if (typeof schedule === 'string') return schedule;
  return schedule?.expr || '';
}

export default function CronPanel() {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/cron');
      const data = await res.json();
      // Jobs can be in result.jobs or result.details.jobs
      const jobs = data.result?.jobs || data.result?.details?.jobs;
      if (data.ok && jobs) {
        setJobs(jobs);
        setError(null);
      } else {
        setError(data.error?.message || 'Failed to fetch jobs');
      }
    } catch (err) {
      setError('Network error - is the gateway reachable?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const toggleJob = async (id: string, currentEnabled: boolean) => {
    try {
      const res = await fetch('/api/cron', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle', jobId: id, enabled: !currentEnabled }),
      });
      const data = await res.json();
      if (data.ok) {
        fetchJobs(); // Refresh list
      }
    } catch (err) {
      console.error('Toggle failed:', err);
    }
  };

  const runNow = async (id: string) => {
    try {
      const res = await fetch('/api/cron', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run', jobId: id }),
      });
      const data = await res.json();
      if (data.ok) {
        alert('Job triggered!');
      } else {
        alert(`Failed: ${data.error?.message}`);
      }
    } catch (err) {
      alert('Network error');
    }
  };

  if (loading) {
    return (
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-8 text-center">
        <p className="text-[var(--muted)]">Loading cron jobs...</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
        <h2 className="font-semibold flex items-center gap-2">
          <span>⏰</span> Cron Jobs
          {error && <span className="text-xs text-[var(--danger)]">⚠</span>}
        </h2>
        <button 
          onClick={fetchJobs}
          className="text-xs px-2 py-1 bg-[var(--background)] hover:bg-[var(--card-hover)] rounded-lg transition-colors"
        >
          ↻ Refresh
        </button>
      </div>

      {error ? (
        <div className="p-4 text-sm text-[var(--danger)]">
          {error}
        </div>
      ) : jobs.length === 0 ? (
        <div className="p-4 text-sm text-[var(--muted)]">
          No cron jobs configured
        </div>
      ) : (
        <div className="divide-y divide-[var(--border)] max-h-80 overflow-y-auto">
          {jobs.map((job) => (
            <div key={job.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleJob(job.id, job.enabled)}
                    className={`w-10 h-6 rounded-full transition-colors relative ${
                      job.enabled ? 'bg-[var(--success)]' : 'bg-[var(--border)]'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        job.enabled ? 'left-5' : 'left-1'
                      }`}
                    />
                  </button>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">
                      {job.name || job.payload?.text?.slice(0, 30) || job.id}
                    </p>
                    <p className="text-xs text-[var(--muted)] font-mono">{getScheduleExpr(job.schedule)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => runNow(job.id)}
                    className="text-xs px-2 py-1 border border-[var(--border)] hover:bg-[var(--card-hover)] rounded-lg transition-colors"
                  >
                    Run Now
                  </button>
                  <button
                    onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                    className="text-xs px-2 py-1 border border-[var(--border)] hover:bg-[var(--card-hover)] rounded-lg transition-colors"
                  >
                    {expandedJob === job.id ? '▲' : '▼'}
                  </button>
                </div>
              </div>

              {expandedJob === job.id && (
                <div className="mt-3 pt-3 border-t border-[var(--border)] text-xs text-[var(--muted)]">
                  <div className="space-y-1">
                    <div><span className="opacity-60">ID:</span> {job.id}</div>
                    {job.payload?.text && (
                      <div><span className="opacity-60">Task:</span> {job.payload.text.slice(0, 100)}...</div>
                    )}
                    {job.payload?.message && (
                      <div><span className="opacity-60">Task:</span> {job.payload.message.slice(0, 100)}...</div>
                    )}
                    {job.state?.lastRunAtMs && (
                      <div><span className="opacity-60">Last run:</span> {new Date(job.state.lastRunAtMs).toLocaleString()}</div>
                    )}
                    {job.state?.nextRunAtMs && (
                      <div><span className="opacity-60">Next run:</span> {new Date(job.state.nextRunAtMs).toLocaleString()}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

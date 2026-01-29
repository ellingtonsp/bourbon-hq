'use client';

import { useState } from 'react';

interface CronJob {
  id: string;
  name: string;
  schedule: string;
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
}

const mockJobs: CronJob[] = [
  {
    id: '1',
    name: 'Morning Briefing',
    schedule: '0 8 * * *',
    enabled: true,
    lastRun: '2026-01-28 08:00',
    nextRun: '2026-01-29 08:00',
  },
  {
    id: '2',
    name: 'LinkedIn Daily Post',
    schedule: '0 9 * * 1-5',
    enabled: true,
    lastRun: '2026-01-28 09:00',
    nextRun: '2026-01-29 09:00',
  },
  {
    id: '3',
    name: 'Email Triage',
    schedule: '0 */4 * * *',
    enabled: false,
    lastRun: '2026-01-28 16:00',
    nextRun: '-',
  },
];

export default function CronPanel() {
  const [jobs, setJobs] = useState<CronJob[]>(mockJobs);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);

  const toggleJob = (id: string) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === id ? { ...job, enabled: !job.enabled } : job
      )
    );
  };

  const runNow = (id: string) => {
    // TODO: Trigger cron job via API
    alert(`Running job ${id}... (API integration pending)`);
  };

  return (
    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
        <h2 className="font-semibold flex items-center gap-2">
          <span>⏰</span> Cron Jobs
        </h2>
        <button className="text-xs px-2 py-1 bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-lg transition-colors">
          + New
        </button>
      </div>

      <div className="divide-y divide-[var(--border)]">
        {jobs.map((job) => (
          <div key={job.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleJob(job.id)}
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
                <div>
                  <p className="font-medium text-sm">{job.name}</p>
                  <p className="text-xs text-[var(--muted)]">{job.schedule}</p>
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
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="opacity-60">Last run:</span> {job.lastRun || 'Never'}
                  </div>
                  <div>
                    <span className="opacity-60">Next run:</span> {job.nextRun || '-'}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

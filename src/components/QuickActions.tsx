'use client';

interface Action {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

const actions: Action[] = [
  {
    id: 'email-triage',
    name: 'Email Triage',
    icon: '📧',
    description: 'Check all inboxes for urgent messages',
    color: 'bg-blue-500/20 border-blue-500/30 hover:bg-blue-500/30',
  },
  {
    id: 'linkedin-post',
    name: 'LinkedIn Post',
    icon: '💼',
    description: 'Find article & draft daily post',
    color: 'bg-cyan-500/20 border-cyan-500/30 hover:bg-cyan-500/30',
  },
  {
    id: 'novara-metrics',
    name: 'Novara Metrics',
    icon: '📊',
    description: 'Pull latest PostHog analytics',
    color: 'bg-purple-500/20 border-purple-500/30 hover:bg-purple-500/30',
  },
  {
    id: 'calendar-brief',
    name: 'Calendar Brief',
    icon: '📅',
    description: 'Next 24h schedule overview',
    color: 'bg-green-500/20 border-green-500/30 hover:bg-green-500/30',
  },
  {
    id: 'research',
    name: 'Research',
    icon: '🔍',
    description: 'Start a research task',
    color: 'bg-amber-500/20 border-amber-500/30 hover:bg-amber-500/30',
  },
  {
    id: 'compose-email',
    name: 'Compose Email',
    icon: '✉️',
    description: 'Draft and send an email',
    color: 'bg-rose-500/20 border-rose-500/30 hover:bg-rose-500/30',
  },
];

export default function QuickActions() {
  const executeAction = (id: string) => {
    // TODO: Connect to Clawdbot API
    alert(`Executing ${id}... (API integration pending)`);
  };

  return (
    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <h2 className="font-semibold flex items-center gap-2">
          <span>⚡</span> Quick Actions
        </h2>
      </div>

      <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => executeAction(action.id)}
            className={`p-4 rounded-xl border text-left transition-colors ${action.color}`}
          >
            <span className="text-2xl">{action.icon}</span>
            <p className="font-medium text-sm mt-2">{action.name}</p>
            <p className="text-xs text-[var(--muted)] mt-1">{action.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

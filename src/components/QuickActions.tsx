'use client';

import { useState } from 'react';

interface Action {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  needsInput?: boolean;
  inputPlaceholder?: string;
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
    needsInput: true,
    inputPlaceholder: 'What to research?',
  },
  {
    id: 'compose-email',
    name: 'Compose Email',
    icon: '✉️',
    description: 'Draft and send an email',
    color: 'bg-rose-500/20 border-rose-500/30 hover:bg-rose-500/30',
    needsInput: true,
    inputPlaceholder: 'Email details...',
  },
];

export default function QuickActions() {
  const [loading, setLoading] = useState<string | null>(null);
  const [inputModal, setInputModal] = useState<Action | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [lastResult, setLastResult] = useState<{ action: string; success: boolean } | null>(null);

  const executeAction = async (action: Action, params?: Record<string, string>) => {
    setLoading(action.id);
    setLastResult(null);
    
    try {
      const res = await fetch('/api/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: action.id,
          params: params || {},
        }),
      });
      const data = await res.json();
      setLastResult({ action: action.name, success: data.ok });
      
      if (!data.ok) {
        console.error('Action failed:', data.error);
      }
    } catch (err) {
      setLastResult({ action: action.name, success: false });
      console.error('Action error:', err);
    } finally {
      setLoading(null);
    }
  };

  const handleClick = (action: Action) => {
    if (action.needsInput) {
      setInputModal(action);
      setInputValue('');
    } else {
      executeAction(action);
    }
  };

  const handleInputSubmit = () => {
    if (inputModal && inputValue.trim()) {
      const params: Record<string, string> = inputModal.id === 'research' 
        ? { topic: inputValue }
        : { prompt: inputValue };
      executeAction(inputModal, params);
      setInputModal(null);
      setInputValue('');
    }
  };

  return (
    <>
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2">
            <span>⚡</span> Quick Actions
          </h2>
          {lastResult && (
            <span className={`text-xs px-2 py-1 rounded ${
              lastResult.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {lastResult.action}: {lastResult.success ? 'Sent!' : 'Failed'}
            </span>
          )}
        </div>

        <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleClick(action)}
              disabled={loading === action.id}
              className={`p-4 rounded-xl border text-left transition-all ${action.color} ${
                loading === action.id ? 'opacity-50 cursor-wait' : ''
              }`}
            >
              <span className="text-2xl">
                {loading === action.id ? '⏳' : action.icon}
              </span>
              <p className="font-medium text-sm mt-2">{action.name}</p>
              <p className="text-xs text-[var(--muted)] mt-1">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Input Modal */}
      {inputModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 w-full max-w-md">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <span>{inputModal.icon}</span> {inputModal.name}
            </h3>
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={inputModal.inputPlaceholder}
              className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-[var(--accent)]"
              rows={3}
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setInputModal(null)}
                className="px-4 py-2 text-sm border border-[var(--border)] rounded-xl hover:bg-[var(--card-hover)]"
              >
                Cancel
              </button>
              <button
                onClick={handleInputSubmit}
                disabled={!inputValue.trim()}
                className="px-4 py-2 text-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-xl disabled:opacity-50"
              >
                Execute
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

'use client';

import { useState, useEffect } from 'react';

interface ApiKey {
  id: string;
  name: string;
  service: string;
  maskedValue: string;
  location: 'env' | 'keychain' | 'config';
  lastUsed?: string;
}

export default function ApiKeysPanel() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newKey, setNewKey] = useState({ name: '', service: '', value: '' });

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const res = await fetch('/api/keys');
      const data = await res.json();
      if (data.ok) {
        setKeys(data.keys);
      }
    } catch (err) {
      console.error('Failed to fetch keys:', err);
    } finally {
      setLoading(false);
    }
  };

  const addKey = async () => {
    if (!newKey.name || !newKey.service || !newKey.value) return;
    
    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newKey),
      });
      const data = await res.json();
      if (data.ok) {
        fetchKeys();
        setShowAddModal(false);
        setNewKey({ name: '', service: '', value: '' });
      }
    } catch (err) {
      console.error('Failed to add key:', err);
    }
  };

  const deleteKey = async (id: string) => {
    if (!confirm('Delete this API key?')) return;
    
    try {
      const res = await fetch(`/api/keys?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.ok) {
        fetchKeys();
      }
    } catch (err) {
      console.error('Failed to delete key:', err);
    }
  };

  const copyToClipboard = async (id: string) => {
    try {
      const res = await fetch(`/api/keys/${id}`);
      const data = await res.json();
      if (data.ok && data.value) {
        await navigator.clipboard.writeText(data.value);
        alert('Copied to clipboard!');
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (loading) {
    return (
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-8 text-center">
        <p className="text-[var(--muted)]">Loading API keys...</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2">
            <span>🔐</span> API Keys
          </h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-xs px-2 py-1 bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-lg transition-colors"
          >
            + Add Key
          </button>
        </div>

        {keys.length === 0 ? (
          <div className="p-4 text-sm text-[var(--muted)] text-center">
            No API keys configured. Add one to get started.
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)] max-h-80 overflow-y-auto">
            {keys.map((key) => (
              <div key={key.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[var(--background)] rounded-lg flex items-center justify-center text-sm">
                    {key.service === 'posthog' && '📊'}
                    {key.service === 'openai' && '🤖'}
                    {key.service === 'anthropic' && '🧠'}
                    {key.service === 'sendgrid' && '📧'}
                    {key.service === 'supabase' && '🗄️'}
                    {key.service === 'meta' && '📘'}
                    {key.service === 'google' && '🔍'}
                    {!['posthog', 'openai', 'anthropic', 'sendgrid', 'supabase', 'meta', 'google'].includes(key.service) && '🔑'}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{key.name}</p>
                    <p className="text-xs text-[var(--muted)] font-mono">{key.maskedValue}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    key.location === 'keychain' ? 'bg-green-500/20 text-green-400' :
                    key.location === 'env' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {key.location}
                  </span>
                  <button
                    onClick={() => copyToClipboard(key.id)}
                    className="text-xs px-2 py-1 border border-[var(--border)] hover:bg-[var(--card-hover)] rounded-lg"
                    title="Copy to clipboard"
                  >
                    📋
                  </button>
                  <button
                    onClick={() => deleteKey(key.id)}
                    className="text-xs px-2 py-1 border border-[var(--danger)]/30 hover:bg-[var(--danger)]/20 text-[var(--danger)] rounded-lg"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Key Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 w-full max-w-md">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <span>🔐</span> Add API Key
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-[var(--muted)] mb-1">Name</label>
                <input
                  type="text"
                  value={newKey.name}
                  onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                  placeholder="e.g., PostHog Production"
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
              
              <div>
                <label className="block text-xs text-[var(--muted)] mb-1">Service</label>
                <select
                  value={newKey.service}
                  onChange={(e) => setNewKey({ ...newKey, service: e.target.value })}
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
                >
                  <option value="">Select service...</option>
                  <option value="posthog">PostHog</option>
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="supabase">Supabase</option>
                  <option value="sendgrid">SendGrid</option>
                  <option value="resend">Resend</option>
                  <option value="meta">Meta/Facebook</option>
                  <option value="google">Google</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs text-[var(--muted)] mb-1">API Key</label>
                <input
                  type="password"
                  value={newKey.value}
                  onChange={(e) => setNewKey({ ...newKey, value: e.target.value })}
                  placeholder="sk-..."
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-2 text-sm font-mono focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm border border-[var(--border)] rounded-xl hover:bg-[var(--card-hover)]"
              >
                Cancel
              </button>
              <button
                onClick={addKey}
                disabled={!newKey.name || !newKey.service || !newKey.value}
                className="px-4 py-2 text-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-xl disabled:opacity-50"
              >
                Save to Keychain
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

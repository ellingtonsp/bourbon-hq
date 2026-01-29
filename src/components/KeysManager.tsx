'use client';

import { useState, useEffect } from 'react';

interface KeyEntry {
  name: string;
  value: string;
  description?: string;
}

export default function KeysManager() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [keys, setKeys] = useState<Record<string, KeyEntry>>({});
  const [keyNames, setKeyNames] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKey, setNewKey] = useState({ name: '', value: '', description: '' });
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [isFirstTime, setIsFirstTime] = useState(false);

  // Check if keys exist on mount
  useEffect(() => {
    fetch('/api/keys')
      .then(res => res.json())
      .then(data => {
        if (data.ok) {
          if (data.locked) {
            setKeyNames(data.keys || []);
          } else if (data.keys && Array.isArray(data.keys) && data.keys.length === 0) {
            setIsFirstTime(true);
          }
        }
      });
  }, []);

  const unlock = async () => {
    setError(null);
    try {
      const res = await fetch('/api/keys', {
        headers: { 'x-keys-password': password }
      });
      const data = await res.json();
      if (data.ok) {
        setKeys(data.keys || {});
        setIsUnlocked(true);
      } else {
        setError(data.error || 'Failed to unlock');
      }
    } catch {
      setError('Network error');
    }
  };

  const saveKeys = async (updatedKeys: Record<string, KeyEntry>) => {
    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-keys-password': password 
        },
        body: JSON.stringify({ keys: updatedKeys })
      });
      const data = await res.json();
      if (data.ok) {
        setKeys(updatedKeys);
        setKeyNames(Object.keys(updatedKeys));
      } else {
        setError(data.error || 'Failed to save');
      }
    } catch {
      setError('Network error');
    }
  };

  const addKey = () => {
    if (!newKey.name || !newKey.value) return;
    const updated = { ...keys, [newKey.name]: newKey };
    saveKeys(updated);
    setNewKey({ name: '', value: '', description: '' });
    setShowAddForm(false);
  };

  const deleteKey = (name: string) => {
    const updated = { ...keys };
    delete updated[name];
    saveKeys(updated);
  };

  const toggleVisibility = (name: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(name)) {
      newVisible.delete(name);
    } else {
      newVisible.add(name);
    }
    setVisibleKeys(newVisible);
  };

  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value);
  };

  // Locked view
  if (!isUnlocked) {
    return (
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border)]">
          <h2 className="font-semibold flex items-center gap-2">
            <span>🔐</span> API Keys
          </h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-[var(--muted)] mb-4">
            {isFirstTime 
              ? 'Set a master password to encrypt your API keys:'
              : 'Enter your master password to unlock:'}
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && unlock()}
              placeholder="Master password"
              className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
            />
            <button
              onClick={unlock}
              className="px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-lg text-sm font-medium"
            >
              {isFirstTime ? 'Create' : 'Unlock'}
            </button>
          </div>
          {error && <p className="text-sm text-[var(--danger)] mt-2">{error}</p>}
          {keyNames.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[var(--border)]">
              <p className="text-xs text-[var(--muted)] mb-2">Stored keys:</p>
              <div className="flex flex-wrap gap-2">
                {keyNames.map(name => (
                  <span key={name} className="px-2 py-1 bg-[var(--background)] rounded text-xs">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Unlocked view
  return (
    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
        <h2 className="font-semibold flex items-center gap-2">
          <span>🔓</span> API Keys
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm(true)}
            className="text-xs px-2 py-1 bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-lg"
          >
            + Add Key
          </button>
          <button
            onClick={() => { setIsUnlocked(false); setPassword(''); }}
            className="text-xs px-2 py-1 border border-[var(--border)] hover:bg-[var(--card-hover)] rounded-lg"
          >
            Lock
          </button>
        </div>
      </div>

      {error && (
        <div className="px-4 py-2 bg-red-500/10 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Add Key Form */}
      {showAddForm && (
        <div className="p-4 border-b border-[var(--border)] bg-[var(--background)]">
          <div className="space-y-3">
            <input
              type="text"
              value={newKey.name}
              onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
              placeholder="Key name (e.g., OPENAI_API_KEY)"
              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="password"
              value={newKey.value}
              onChange={(e) => setNewKey({ ...newKey, value: e.target.value })}
              placeholder="API key value"
              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={newKey.description}
              onChange={(e) => setNewKey({ ...newKey, description: e.target.value })}
              placeholder="Description (optional)"
              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm"
            />
            <div className="flex gap-2">
              <button
                onClick={addKey}
                className="px-3 py-1 bg-[var(--success)] hover:opacity-80 rounded-lg text-sm"
              >
                Save
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1 border border-[var(--border)] hover:bg-[var(--card-hover)] rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keys List */}
      <div className="divide-y divide-[var(--border)] max-h-80 overflow-y-auto">
        {Object.entries(keys).length === 0 ? (
          <div className="p-4 text-sm text-[var(--muted)] text-center">
            No API keys stored yet
          </div>
        ) : (
          Object.entries(keys).map(([name, entry]) => (
            <div key={name} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{name}</p>
                  {entry.description && (
                    <p className="text-xs text-[var(--muted)]">{entry.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleVisibility(name)}
                    className="text-xs px-2 py-1 border border-[var(--border)] hover:bg-[var(--card-hover)] rounded"
                  >
                    {visibleKeys.has(name) ? '👁️' : '👁️‍🗨️'}
                  </button>
                  <button
                    onClick={() => copyToClipboard(entry.value)}
                    className="text-xs px-2 py-1 border border-[var(--border)] hover:bg-[var(--card-hover)] rounded"
                  >
                    📋
                  </button>
                  <button
                    onClick={() => deleteKey(name)}
                    className="text-xs px-2 py-1 border border-[var(--danger)] text-[var(--danger)] hover:bg-red-500/10 rounded"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              {visibleKeys.has(name) && (
                <div className="mt-2 p-2 bg-[var(--background)] rounded font-mono text-xs break-all">
                  {entry.value}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

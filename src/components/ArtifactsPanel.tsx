'use client';

import { useState, useEffect } from 'react';

interface Artifact {
  id: string;
  name: string;
  path: string;
  type: 'document' | 'draft' | 'memory' | 'report' | 'config';
  modified?: string;
}

const typeIcons: Record<string, string> = {
  document: '📄',
  draft: '✏️',
  memory: '🧠',
  report: '📊',
  config: '⚙️',
};

const typeColors: Record<string, string> = {
  document: 'text-gray-400',
  draft: 'text-amber-400',
  memory: 'text-purple-400',
  report: 'text-cyan-400',
  config: 'text-green-400',
};

// Determine type from filename
function getFileType(name: string): Artifact['type'] {
  if (name.includes('MEMORY') || name.match(/^\d{4}-\d{2}-\d{2}\.md$/)) return 'memory';
  if (name.includes('draft') || name.includes('Draft')) return 'draft';
  if (name.includes('report') || name.includes('Report')) return 'report';
  if (name.endsWith('.json') || name.includes('config')) return 'config';
  return 'document';
}

export default function ArtifactsPanel() {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerContent, setViewerContent] = useState<{ name: string; content: string; path: string } | null>(null);
  const [viewerLoading, setViewerLoading] = useState(false);

  // Fetch artifacts on mount
  useEffect(() => {
    const fetchArtifacts = async () => {
      try {
        const res = await fetch('/api/artifacts');
        const data = await res.json();
        if (data.ok && data.files) {
          setArtifacts(data.files);
        }
      } catch (err) {
        console.error('Failed to fetch artifacts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchArtifacts();
  }, []);

  const filteredArtifacts = selectedType
    ? artifacts.filter((a) => a.type === selectedType)
    : artifacts;

  const openArtifact = async (artifact: Artifact) => {
    setViewerOpen(true);
    setViewerLoading(true);
    setViewerContent({ name: artifact.name, content: '', path: artifact.path });

    try {
      const res = await fetch(`/api/artifacts/read?path=${encodeURIComponent(artifact.path)}`);
      const data = await res.json();
      if (data.ok && data.content) {
        setViewerContent({ name: artifact.name, content: data.content, path: artifact.path });
      } else {
        setViewerContent({ name: artifact.name, content: `Error: ${data.error || 'Could not load file'}`, path: artifact.path });
      }
    } catch (err) {
      setViewerContent({ name: artifact.name, content: 'Error: Failed to load file', path: artifact.path });
    } finally {
      setViewerLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-8 text-center">
        <p className="text-[var(--muted)]">Loading files...</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2">
            <span>📁</span> Workspace Files
          </h2>
          <div className="flex gap-1">
            {['memory', 'document', 'config'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(selectedType === type ? null : type)}
                className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                  selectedType === type
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-[var(--background)] hover:bg-[var(--card-hover)]'
                }`}
              >
                {typeIcons[type]}
              </button>
            ))}
          </div>
        </div>

        {artifacts.length === 0 ? (
          <div className="p-4 text-sm text-[var(--muted)]">
            No files found in workspace
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)] max-h-64 overflow-y-auto">
            {filteredArtifacts.map((artifact) => (
              <button
                key={artifact.id}
                onClick={() => openArtifact(artifact)}
                className="w-full p-4 text-left hover:bg-[var(--card-hover)] transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className={`text-lg ${typeColors[artifact.type]}`}>
                    {typeIcons[artifact.type]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{artifact.name}</p>
                    <p className="text-xs text-[var(--muted)] truncate mt-1 font-mono opacity-60">
                      {artifact.path}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* File Viewer Modal */}
      {viewerOpen && viewerContent && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] w-full max-w-3xl max-h-[80vh] flex flex-col">
            <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold truncate">{viewerContent.name}</h3>
                <p className="text-xs text-[var(--muted)] font-mono truncate">{viewerContent.path}</p>
              </div>
              <button
                onClick={() => setViewerOpen(false)}
                className="ml-4 p-2 hover:bg-[var(--card-hover)] rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {viewerLoading ? (
                <div className="text-center py-8 text-[var(--muted)]">Loading...</div>
              ) : (
                <pre className="text-sm whitespace-pre-wrap font-mono bg-[var(--background)] p-4 rounded-lg border border-[var(--border)]">
                  {viewerContent.content}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

'use client';

import { useState } from 'react';

interface Artifact {
  id: string;
  name: string;
  type: 'document' | 'draft' | 'memory' | 'report';
  modified: string;
  preview?: string;
}

const mockArtifacts: Artifact[] = [
  {
    id: '1',
    name: 'MEMORY.md',
    type: 'memory',
    modified: '2026-01-28',
    preview: 'Long-term memory and notes...',
  },
  {
    id: '2',
    name: '2026-01-28.md',
    type: 'memory',
    modified: '2026-01-28',
    preview: 'Daily log for January 28...',
  },
  {
    id: '3',
    name: 'LinkedIn Draft - AI Integration',
    type: 'draft',
    modified: '2026-01-28',
    preview: 'The real challenge in healthcare AI isn\'t the models...',
  },
  {
    id: '4',
    name: 'Novara Weekly Report',
    type: 'report',
    modified: '2026-01-27',
    preview: 'Weekly metrics summary...',
  },
];

const typeIcons: Record<string, string> = {
  document: '📄',
  draft: '✏️',
  memory: '🧠',
  report: '📊',
};

const typeColors: Record<string, string> = {
  document: 'text-gray-400',
  draft: 'text-amber-400',
  memory: 'text-purple-400',
  report: 'text-cyan-400',
};

export default function ArtifactsPanel() {
  const [artifacts] = useState<Artifact[]>(mockArtifacts);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const filteredArtifacts = selectedType
    ? artifacts.filter((a) => a.type === selectedType)
    : artifacts;

  const openArtifact = (id: string) => {
    // TODO: Open file viewer
    alert(`Opening artifact ${id}... (File viewer pending)`);
  };

  return (
    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
        <h2 className="font-semibold flex items-center gap-2">
          <span>📁</span> Artifacts & Docs
        </h2>
        <div className="flex gap-1">
          {['memory', 'draft', 'report'].map((type) => (
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

      <div className="divide-y divide-[var(--border)] max-h-64 overflow-y-auto">
        {filteredArtifacts.map((artifact) => (
          <button
            key={artifact.id}
            onClick={() => openArtifact(artifact.id)}
            className="w-full p-4 text-left hover:bg-[var(--card-hover)] transition-colors"
          >
            <div className="flex items-start gap-3">
              <span className={`text-lg ${typeColors[artifact.type]}`}>
                {typeIcons[artifact.type]}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{artifact.name}</p>
                <p className="text-xs text-[var(--muted)] truncate mt-1">
                  {artifact.preview}
                </p>
                <p className="text-xs text-[var(--muted)] opacity-60 mt-1">
                  Modified: {artifact.modified}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

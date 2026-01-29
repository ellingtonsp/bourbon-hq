import ChatPanel from '@/components/ChatPanel';
import CronPanel from '@/components/CronPanel';
import QuickActions from '@/components/QuickActions';
import StatusBar from '@/components/StatusBar';
import ArtifactsPanel from '@/components/ArtifactsPanel';
import ApiKeysPanel from '@/components/ApiKeysPanel';

export default function Home() {
  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🐶</span>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Bourbon HQ</h1>
              <p className="text-sm text-[var(--muted)]">Mission Control</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-[var(--card)] rounded-lg transition-colors">
              <span className="text-xl">⚙️</span>
            </button>
          </div>
        </div>
      </header>

      {/* Status Bar */}
      <div className="mb-6">
        <StatusBar />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Chat */}
        <div className="lg:col-span-1 lg:row-span-2">
          <div className="h-[600px] lg:h-[calc(100vh-220px)] sticky top-6">
            <ChatPanel />
          </div>
        </div>

        {/* Right Column - Panels */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <QuickActions />

          {/* Three Column Grid for smaller panels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Cron Jobs */}
            <CronPanel />

            {/* Artifacts */}
            <ArtifactsPanel />

            {/* API Keys */}
            <ApiKeysPanel />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 pt-6 border-t border-[var(--border)] text-center text-xs text-[var(--muted)]">
        <p>Bourbon HQ • Built with ❤️ by Bourbon & Stephen</p>
      </footer>
    </div>
  );
}

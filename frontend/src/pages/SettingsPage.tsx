import { useAppStore } from '../store/useAppStore';

export function SettingsPage() {
  const { stats } = useAppStore();
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-lg font-semibold text-white">Settings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface-800/60 border border-surface-700/40 rounded-xl p-5">
          <div className="text-sm font-semibold text-white mb-3">System Configuration</div>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-xs text-surface-200/70">Demo Mode</span>
              <span className={`text-xs font-mono ${stats.demoMode ? 'text-brand-400' : 'text-surface-200/40'}`}>{stats.demoMode ? 'ENABLED' : 'DISABLED'}</span>
            </label>
            <label className="flex items-center justify-between">
              <span className="text-xs text-surface-200/70">Map Provider</span>
              <span className="text-xs font-mono text-surface-200/60">OpenStreetMap (Leaflet)</span>
            </label>
            <label className="flex items-center justify-between">
              <span className="text-xs text-surface-200/70">Backend URL</span>
              <span className="text-xs font-mono text-surface-200/60">http://localhost:8000</span>
            </label>
            <label className="flex items-center justify-between">
              <span className="text-xs text-surface-200/70">Detection Engine</span>
              <span className="text-xs font-mono text-yellow-400">YOLO (stub)</span>
            </label>
            <label className="flex items-center justify-between">
              <span className="text-xs text-surface-200/70">Tracking</span>
              <span className="text-xs font-mono text-yellow-400">ByteTrack (stub)</span>
            </label>
          </div>
        </div>
        <div className="bg-surface-800/60 border border-surface-700/40 rounded-xl p-5">
          <div className="text-sm font-semibold text-white mb-3">Alert Priority Rules</div>
          <div className="space-y-2 text-xs font-mono">
            {[
              { zone: 'Safe Zone', priority: 'LOW / INFO', color: 'text-blue-400' },
              { zone: 'Monitoring Zone', priority: 'MEDIUM', color: 'text-yellow-400' },
              { zone: 'Restricted Zone', priority: 'HIGH', color: 'text-orange-400' },
              { zone: 'Danger Zone', priority: 'CRITICAL', color: 'text-red-400' },
              { zone: 'Border Crossing', priority: 'CRITICAL', color: 'text-red-400' },
            ].map(r => (
              <div key={r.zone} className="flex justify-between items-center py-1 border-b border-surface-700/30">
                <span className="text-surface-200/60">{r.zone}</span>
                <span className={r.color}>{r.priority}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

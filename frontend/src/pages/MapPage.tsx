import { IBVAPMap } from '../map/IBVAPMap';
import { useAppStore } from '../store/useAppStore';
import { AlertBadge } from '../components/AlertBadge';

export function MapPage() {
  const { alerts, persons, cameras } = useAppStore();
  const activeAlerts = alerts.filter(a => a.status === 'active');

  return (
    <div className="h-full flex flex-col">
      {/* Map header stats */}
      <div className="flex-shrink-0 px-4 py-2 border-b border-surface-700/30 flex gap-6 bg-surface-900/30">
        <div className="text-xs font-mono text-surface-200/60">
          <span className="text-white font-semibold">{cameras.filter(c => c.status === 'online').length}</span>/{cameras.length} cameras
        </div>
        <div className="text-xs font-mono text-surface-200/60">
          <span className="text-white font-semibold">{persons.filter(p => p.isActive).length}</span> active persons
        </div>
        <div className="text-xs font-mono text-surface-200/60">
          <span className={activeAlerts.length > 0 ? 'text-red-400 font-semibold' : 'text-white font-semibold'}>{activeAlerts.length}</span> active alerts
        </div>
        <div className="text-xs text-surface-200/30 font-mono ml-auto">
          DEMO COORDS — WAGAH BORDER AREA, PUNJAB
        </div>
      </div>

      {/* Full map */}
      <div className="flex-1 p-3">
        <IBVAPMap height="100%" showControls={true} />
      </div>

      {/* Alert strip at bottom */}
      {activeAlerts.length > 0 && (
        <div className="flex-shrink-0 border-t border-surface-700/50 bg-surface-900/80 px-4 py-2">
          <div className="flex gap-3 overflow-x-auto">
            {activeAlerts.slice(0, 3).map(alert => (
              <div key={alert.id} className="flex items-center gap-2 bg-surface-800 rounded px-3 py-1.5 flex-shrink-0">
                <AlertBadge priority={alert.priority} />
                <span className="text-xs text-white">{alert.message}</span>
                <span className="text-xs text-surface-200/40 font-mono">{new Date(alert.timestamp).toLocaleTimeString('en-IN', { hour12: false })}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { useAppStore } from '../store/useAppStore';
import { AlertBadge } from '../components/AlertBadge';
import { ZoneBadge } from '../components/ZoneBadge';
import { formatCoords } from '../utils/geo';
import { CheckCircle, MapPin } from 'lucide-react';
import type { ZoneType } from '../types';

export function AlertsPage() {
  const { alerts, acknowledgeAlert, setMapCenter } = useAppStore();

  const zoneTypeFromEvent = (type: string): ZoneType => {
    if (type.includes('danger')) return 'danger';
    if (type.includes('restricted')) return 'restricted';
    if (type.includes('border')) return 'restricted';
    if (type.includes('monitor')) return 'monitoring';
    return 'safe';
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-white">Alerts</h1>
        <div className="text-xs text-surface-200/40 font-mono">
          {alerts.filter(a => a.status === 'active').length} active / {alerts.length} total
        </div>
      </div>

      <div className="space-y-3">
        {alerts.length === 0 && (
          <div className="text-center py-16 text-surface-200/30 text-sm">No alerts — start the demo to generate alerts</div>
        )}
        {alerts.map(alert => (
          <div key={alert.id} className={`bg-surface-800/60 border rounded-xl p-5 ${
            alert.status === 'acknowledged' ? 'border-surface-700/30 opacity-60' : (
              alert.priority === 'critical' ? 'border-red-500/40 alert-critical-pulse' :
              alert.priority === 'high' ? 'border-orange-500/30' :
              'border-surface-700/40'
            )
          }`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertBadge priority={alert.priority} />
                {alert.zoneId && <ZoneBadge type={zoneTypeFromEvent(alert.type)} />}
                {alert.status === 'acknowledged' && (
                  <span className="text-xs text-surface-200/40 font-mono">ACKNOWLEDGED</span>
                )}
              </div>
              <span className="text-xs text-surface-200/40 font-mono">
                {new Date(alert.timestamp).toLocaleTimeString('en-IN', { hour12: false })} • {new Date(alert.timestamp).toLocaleDateString('en-IN')}
              </span>
            </div>

            <div className="text-sm text-white mb-3 font-medium">{alert.message}</div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-surface-200/60 font-mono mb-4">
              <div><span className="text-surface-200/30">Alert ID</span><br />{alert.id}</div>
              {alert.personId && <div><span className="text-surface-200/30">Person</span><br />#{alert.personId.replace('P-', '')}</div>}
              {alert.cameraId && <div><span className="text-surface-200/30">Camera</span><br />{alert.cameraId}</div>}
              {alert.confidence && <div><span className="text-surface-200/30">Confidence</span><br />{alert.confidence}%</div>}
            </div>

            {alert.lat && alert.lng && (
              <div className="text-xs text-yellow-400/80 font-mono mb-3">
                ⚠️ ESTIMATED LOCATION: {formatCoords(alert.lat, alert.lng)}
              </div>
            )}

            {alert.zoneName && (
              <div className="text-xs text-surface-200/50 mb-3">Zone: {alert.zoneName}</div>
            )}

            {alert.status === 'active' && (
              <div className="flex gap-2">
                <button
                  onClick={() => { if (alert.lat && alert.lng) setMapCenter([alert.lat, alert.lng]); }}
                  className="flex items-center gap-1.5 text-xs bg-surface-700/50 text-surface-200/70 hover:text-white px-3 py-1.5 rounded transition-colors"
                >
                  <MapPin className="w-3 h-3" /> View on Map
                </button>
                <button
                  onClick={() => acknowledgeAlert(alert.id)}
                  className="flex items-center gap-1.5 text-xs bg-green-500/15 text-green-400 border border-green-500/25 px-3 py-1.5 rounded hover:bg-green-500/25 transition-colors"
                >
                  <CheckCircle className="w-3 h-3" /> Acknowledge
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

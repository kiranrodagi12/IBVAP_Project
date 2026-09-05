import { useAppStore } from '../store/useAppStore';
import { ZoneBadge } from '../components/ZoneBadge';
import { formatCoords } from '../utils/geo';
import { MapPin } from 'lucide-react';
import type { ZoneType } from '../types';

export function EventsPage() {
  const { events, setMapCenter } = useAppStore();

  const zoneTypeFromEvent = (type: string): ZoneType => {
    if (type.includes('danger')) return 'danger';
    if (type.includes('restricted')) return 'restricted';
    if (type.includes('border')) return 'restricted';
    if (type.includes('monitor')) return 'monitoring';
    return 'safe';
  };

  const eventTypeLabel: Record<string, string> = {
    person_detected: '👤 Person Detected',
    zone_entered: '🚧 Zone Entered',
    zone_exited: '🚪 Zone Exited',
    border_crossed: '⚠️ Border Crossed',
    restricted_intrusion: '🚨 Restricted Intrusion',
    danger_intrusion: '🔴 Danger Intrusion',
    camera_offline: '📷 Camera Offline',
    camera_online: '📷 Camera Online',
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-white">Event History</h1>
        <div className="text-xs text-surface-200/40 font-mono">{events.length} events recorded</div>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-16 text-surface-200/30 text-sm">No events — start the demo to generate events</div>
      ) : (
        <div className="space-y-3">
          {events.map(evt => (
            <div key={evt.id} className="bg-surface-800/60 border border-surface-700/40 rounded-xl p-5">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{eventTypeLabel[evt.type] ?? evt.type}</span>
                  <ZoneBadge type={zoneTypeFromEvent(evt.type)} />
                </div>
                <div className="text-xs text-surface-200/40 font-mono">
                  {new Date(evt.timestamp).toLocaleString('en-IN', { hour12: false })}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono text-surface-200/60 my-3">
                <div><span className="text-surface-200/30">Event ID</span><br />{evt.id}</div>
                {evt.personId && <div><span className="text-surface-200/30">Person</span><br />#{evt.personId.replace('P-', '')}</div>}
                {evt.cameraId && <div><span className="text-surface-200/30">Camera</span><br />{evt.cameraId}</div>}
                {evt.confidence && <div><span className="text-surface-200/30">Confidence</span><br />{evt.confidence}%</div>}
              </div>

              {evt.zoneName && (
                <div className="text-xs text-surface-200/60 mb-2">Zone: <strong className="text-white">{evt.zoneName}</strong></div>
              )}

              {evt.lat && evt.lng && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-yellow-400/70 font-mono">⚠️ ESTIMATED LOCATION: {formatCoords(evt.lat, evt.lng)}</span>
                  <button onClick={() => { if (evt.lat && evt.lng) setMapCenter([evt.lat, evt.lng]); }}
                    className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300">
                    <MapPin className="w-3 h-3" /> Map
                  </button>
                </div>
              )}

              <div className="text-xs text-surface-200/50 italic">{evt.description}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

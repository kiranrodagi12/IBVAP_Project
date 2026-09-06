import { useAppStore } from '../store/useAppStore';
import { AlertBadge } from '../components/AlertBadge';
import { ZoneBadge } from '../components/ZoneBadge';
import { CheckCircle, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ZoneType } from '../types';

export function AlertsPage() {
  const { alerts, acknowledgeAlert, setMapCenter, setMapZoom } = useAppStore();
  const navigate = useNavigate();

  const zoneTypeFromEvent = (type: string): ZoneType => {
    if (type.includes('danger')) return 'danger';
    if (type.includes('restricted')) return 'restricted';
    if (type.includes('border')) return 'restricted';
    if (type.includes('monitor')) return 'monitoring';
    return 'safe';
  };

  const handleFocusMap = (lat?: number, lng?: number) => {
    if (lat && lng) {
      setMapCenter([lat, lng]);
      setMapZoom(17);
      navigate('/map');
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Intrusion & Security Alerts</h1>
          <p className="text-xs text-surface-200/50">Real-time alerts with person CCTV pixel coords and Geo location</p>
        </div>
        <div className="text-xs text-surface-200/50 font-mono">
          {alerts.filter(a => a.status === 'active').length} active / {alerts.length} total
        </div>
      </div>

      <div className="space-y-3">
        {alerts.length === 0 && (
          <div className="text-center py-16 text-surface-200/30 text-sm bg-surface-900/40 rounded-xl border border-surface-800">
            No alerts — start the demo mode to simulate detections and zone intrusions
          </div>
        )}
        {alerts.map(alert => (
          <div key={alert.id} className={`bg-surface-800/60 border rounded-xl p-5 transition-all ${
            alert.status === 'acknowledged' ? 'border-surface-700/30 opacity-60' : (
              alert.priority === 'critical' ? 'border-red-500/50 alert-critical-pulse shadow-lg shadow-red-500/10' :
              alert.priority === 'high' ? 'border-orange-500/40' :
              'border-surface-700/40'
            )
          }`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertBadge priority={alert.priority} />
                {alert.zoneId && <ZoneBadge type={zoneTypeFromEvent(alert.type)} />}
                {alert.status === 'acknowledged' && (
                  <span className="text-[10px] text-surface-200/40 font-mono bg-surface-700/50 px-2 py-0.5 rounded">ACKNOWLEDGED</span>
                )}
              </div>
              <span className="text-xs text-surface-200/40 font-mono">
                {new Date(alert.timestamp).toLocaleTimeString('en-IN', { hour12: false })} • {new Date(alert.timestamp).toLocaleDateString('en-IN')}
              </span>
            </div>

            <div className="text-sm text-white mb-3 font-semibold">{alert.message}</div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs text-surface-200/60 font-mono mb-4 bg-surface-850/60 p-3 rounded-lg border border-surface-750">
              <div>
                <span className="text-surface-200/30 text-[10px]">Alert ID</span>
                <div className="text-white font-bold">{alert.id}</div>
              </div>
              <div>
                <span className="text-surface-200/30 text-[10px]">Target Person</span>
                <div className="text-white font-bold">{alert.personId ? `#${alert.personId.replace('P-', '')}` : 'N/A'}</div>
              </div>
              <div>
                <span className="text-surface-200/30 text-[10px]">Trigger Camera</span>
                <div className="text-white font-bold">{alert.cameraId ?? 'CAM-01'}</div>
              </div>
              <div>
                <span className="text-surface-200/30 text-[10px]">CCTV Pixel (X, Y)</span>
                <div className="text-sky-400 font-bold">X: {alert.pixelX ?? 825} px, Y: {alert.pixelY ?? 800} px</div>
              </div>
              <div>
                <span className="text-surface-200/30 text-[10px]">Confidence</span>
                <div className="text-green-400 font-bold">{alert.confidence ?? 94}%</div>
              </div>
            </div>

            {alert.lat && alert.lng && (
              <div className="text-xs text-yellow-400/90 font-mono mb-3 flex items-center gap-1.5 bg-yellow-500/10 px-3 py-1.5 rounded-lg border border-yellow-500/20">
                <span>📍 Person Geo Coordinate:</span>
                <span className="font-bold">Lat: {alert.lat.toFixed(6)}, Lon: {alert.lng.toFixed(6)}</span>
                {alert.cameraLat && (
                  <span className="text-surface-200/50 ml-auto">
                    (Camera Loc: {alert.cameraLat.toFixed(4)}, {alert.cameraLng?.toFixed(4)})
                  </span>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => handleFocusMap(alert.lat, alert.lng)}
                className="flex items-center gap-1.5 text-xs bg-brand-500/20 text-brand-300 border border-brand-500/30 hover:bg-brand-500/30 px-3.5 py-1.5 rounded-lg font-medium transition-colors"
              >
                <MapPin className="w-3.5 h-3.5" /> View on Live Map
              </button>
              {alert.status === 'active' && (
                <button
                  onClick={() => acknowledgeAlert(alert.id)}
                  className="flex items-center gap-1.5 text-xs bg-green-500/15 text-green-400 border border-green-500/25 px-3.5 py-1.5 rounded-lg hover:bg-green-500/25 font-medium transition-colors ml-auto"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Acknowledge Alert
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

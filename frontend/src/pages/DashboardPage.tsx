import { Camera, Bell, Users, Shield, Activity, AlertTriangle, Clock } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { StatCard } from '../components/StatCard';
import { AlertBadge } from '../components/AlertBadge';
import { IBVAPMap } from '../map/IBVAPMap';
import { ZoneBadge } from '../components/ZoneBadge';
import { useNavigate } from 'react-router-dom';
import type { ZoneType } from '../types';

export function DashboardPage() {
  const { cameras, alerts, persons, events, stats } = useAppStore();
  const navigate = useNavigate();

  const activeAlerts = alerts.filter(a => a.status === 'active');
  const onlineCameras = cameras.filter(c => c.status === 'online');

  return (
    <div className="p-6 space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          label="Cameras Online"
          value={`${onlineCameras.length}/${cameras.length}`}
          icon={Camera}
          color="green"
          sub={cameras.filter(c => c.status === 'offline').length > 0 ? `${cameras.filter(c => c.status === 'offline').length} offline` : 'All operational'}
        />
        <StatCard
          label="Active Persons"
          value={persons.filter(p => p.isActive).length}
          icon={Users}
          color="blue"
          sub="Currently tracked"
        />
        <StatCard
          label="Active Alerts"
          value={activeAlerts.length}
          icon={Bell}
          color={activeAlerts.length > 0 ? 'red' : 'default'}
          sub={activeAlerts.filter(a => a.priority === 'critical').length > 0 ? `${activeAlerts.filter(a => a.priority === 'critical').length} critical` : 'No critical'}
          pulse={activeAlerts.length > 0}
        />
        <StatCard
          label="Zone Intrusions"
          value={stats.zoneIntrusions}
          icon={AlertTriangle}
          color={stats.zoneIntrusions > 0 ? 'orange' : 'default'}
          sub="Total events"
        />
        <StatCard
          label="System Status"
          value={stats.systemStatus.toUpperCase()}
          icon={Activity}
          color={stats.systemStatus === 'online' ? 'green' : 'red'}
          sub={stats.demoMode ? 'Demo mode active' : 'Live mode'}
        />
      </div>

      {/* Map + Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-surface-200/80 uppercase tracking-wider">Live Situation Map</h2>
            <button onClick={() => navigate('/map')} className="text-xs text-brand-400 hover:text-brand-300">Full Map →</button>
          </div>
          <IBVAPMap height="380px" showControls={false} />
        </div>

        {/* Alerts panel */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-surface-200/80 uppercase tracking-wider">Active Alerts</h2>
            <button onClick={() => navigate('/alerts')} className="text-xs text-brand-400 hover:text-brand-300">All Alerts →</button>
          </div>
          <div className="space-y-2 max-h-[380px] overflow-y-auto">
            {activeAlerts.length === 0 ? (
              <div className="bg-surface-800/50 rounded-lg p-6 text-center text-surface-200/40 text-sm">
                <Shield className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No active alerts
              </div>
            ) : (
              activeAlerts.map(alert => (
                <div
                  key={alert.id}
                  className="bg-surface-800/80 border border-surface-700/50 rounded-lg p-3 cursor-pointer hover:border-surface-600 transition-colors"
                  onClick={() => navigate('/alerts')}
                >
                  <div className="flex items-start justify-between mb-1">
                    <AlertBadge priority={alert.priority} />
                    <span className="text-surface-200/40 text-xs font-mono">
                      {new Date(alert.timestamp).toLocaleTimeString('en-IN', { hour12: false })}
                    </span>
                  </div>
                  <div className="text-sm text-white mt-1.5 leading-snug">{alert.message}</div>
                  <div className="flex gap-2 mt-1.5 text-xs text-surface-200/50">
                    {alert.personId && <span>Person #{alert.personId.replace('P-', '')}</span>}
                    {alert.cameraId && <span>• {alert.cameraId}</span>}
                    {alert.zoneName && <span>• {alert.zoneName}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Camera status + Event timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Camera status */}
        <div>
          <h2 className="text-sm font-semibold text-surface-200/80 uppercase tracking-wider mb-3">Camera Status</h2>
          <div className="space-y-2">
            {cameras.map(cam => (
              <div key={cam.id} className="bg-surface-800/50 rounded-lg px-4 py-3 flex items-center justify-between border border-surface-700/30">
                <div className="flex items-center gap-3">
                  <span className={`status-dot ${cam.status}`} />
                  <div>
                    <div className="text-sm font-medium text-white">{cam.id}</div>
                    <div className="text-xs text-surface-200/50">{cam.name}</div>
                  </div>
                </div>
                <div className="text-right text-xs text-surface-200/50 font-mono">
                  <div>{cam.fps ?? 0} FPS</div>
                  <div>Range: {cam.range}m</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent events */}
        <div>
          <h2 className="text-sm font-semibold text-surface-200/80 uppercase tracking-wider mb-3">Event Timeline</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {events.length === 0 ? (
              <div className="text-surface-200/30 text-sm text-center py-8">No events yet — start demo to see activity</div>
            ) : (
              events.slice(0, 15).map(evt => (
                <div key={evt.id} className="flex gap-3 items-start">
                  <div className="text-surface-200/30 text-xs font-mono w-16 flex-shrink-0 pt-0.5">
                    {new Date(evt.timestamp).toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-white leading-snug">{evt.description}</div>
                    {evt.zoneId && (
                      <div className="mt-0.5">
                        <ZoneBadge type={(evt.type.includes('danger') ? 'danger' : evt.type.includes('restricted') ? 'restricted' : evt.type.includes('monitor') ? 'monitoring' : 'safe') as ZoneType} />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

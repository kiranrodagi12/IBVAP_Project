import { useAppStore } from '../store/useAppStore';
import { Activity, Camera, Database, Wifi, Cpu } from 'lucide-react';

export function SystemHealthPage() {
  const { cameras, stats } = useAppStore();
  const onlineCams = cameras.filter(c => c.status === 'online').length;

  const components = [
    { name: 'Frontend (React)', status: 'operational', detail: 'Vite dev server running', icon: Activity },
    { name: 'Map Service', status: 'operational', detail: 'OpenStreetMap tiles loaded', icon: Activity },
    { name: 'Backend API (FastAPI)', status: 'check_backend', detail: 'http://localhost:8000', icon: Database },
    { name: 'WebSocket Events', status: 'check_ws', detail: 'ws://localhost:8000/ws/events', icon: Wifi },
    { name: 'Camera Feeds', status: onlineCams === cameras.length ? 'operational' : 'degraded', detail: `${onlineCams}/${cameras.length} cameras online`, icon: Camera },
    { name: 'AI Engine (YOLO)', status: 'stub', detail: 'Demo mode — drop best.pt to activate', icon: Cpu },
    { name: 'Tracking (ByteTrack)', status: 'stub', detail: 'Demo mode active', icon: Cpu },
    { name: 'Geofence Engine', status: 'operational', detail: 'Turf.js point-in-polygon active', icon: Activity },
    { name: 'Alert Engine', status: 'operational', detail: 'WebSocket push ready', icon: Activity },
    { name: 'Database', status: 'check_backend', detail: 'SQLite (dev) / PostGIS (prod)', icon: Database },
  ];

  const statusColor = (s: string) => {
    if (s === 'operational') return 'text-green-400';
    if (s === 'degraded') return 'text-yellow-400';
    if (s === 'stub') return 'text-blue-400';
    return 'text-surface-200/40';
  };

  const statusLabel = (s: string) => {
    if (s === 'operational') return 'OPERATIONAL';
    if (s === 'degraded') return 'DEGRADED';
    if (s === 'stub') return 'STUB (DEMO)';
    return 'CHECK BACKEND';
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-lg font-semibold text-white">System Health</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {components.map(comp => (
          <div key={comp.name} className="bg-surface-800/60 border border-surface-700/40 rounded-lg p-4 flex items-center gap-4">
            <comp.icon className={`w-5 h-5 flex-shrink-0 ${statusColor(comp.status)}`} />
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white">{comp.name}</div>
              <div className="text-xs text-surface-200/40 font-mono truncate">{comp.detail}</div>
            </div>
            <span className={`text-[10px] font-mono font-bold flex-shrink-0 ${statusColor(comp.status)}`}>{statusLabel(comp.status)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

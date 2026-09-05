import { useAppStore } from '../store/useAppStore';
import { ZoneBadge } from '../components/ZoneBadge';
import { formatCoords } from '../utils/geo';
import type { ZoneType } from '../types';

export function PeoplePage() {
  const { persons, tracks, zones, cameras } = useAppStore();

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-lg font-semibold text-white">Tracked Persons</h1>
      {persons.length === 0 ? (
        <div className="text-center py-16 text-surface-200/30 text-sm">No persons tracked — start the demo</div>
      ) : (
        <div className="space-y-4">
          {persons.map(person => {
            const zone = zones.find(z => z.id === person.currentZoneId);
            const camera = cameras.find(c => c.id === person.currentCameraId);
            const personTracks = tracks[person.id] ?? [];
            return (
              <div key={person.id} className="bg-surface-800/60 border border-surface-700/40 rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-500/20 border border-brand-500/30 rounded-full flex items-center justify-center text-xl">👤</div>
                    <div>
                      <div className="text-base font-bold text-white font-mono">Person #${person.trackId}</div>
                      <div className="text-xs text-surface-200/50">ID: {person.id}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {zone && <ZoneBadge type={zone.type as ZoneType} />}
                    <span className={`text-xs font-mono px-2 py-0.5 rounded border ${
                      person.isActive ? 'bg-green-500/15 text-green-400 border-green-500/25' : 'bg-surface-700/50 text-surface-200/40 border-surface-700/50'
                    }`}>{person.isActive ? 'ACTIVE' : 'LOST'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="text-surface-200/50">
                    <div className="text-surface-200/30 mb-0.5">Current Camera</div>
                    {camera?.name ?? person.currentCameraId ?? 'Unknown'}
                  </div>
                  <div className="text-surface-200/50">
                    <div className="text-surface-200/30 mb-0.5">Current Zone</div>
                    {zone?.name ?? 'Unknown'}
                  </div>
                  <div className="text-surface-200/50">
                    <div className="text-surface-200/30 mb-0.5">Confidence</div>
                    {person.confidence ?? '?'}%
                  </div>
                  <div className="text-surface-200/50">
                    <div className="text-surface-200/30 mb-0.5">First Seen</div>
                    {new Date(person.firstSeen).toLocaleTimeString('en-IN', { hour12: false })}
                  </div>
                  <div className="text-surface-200/50">
                    <div className="text-surface-200/30 mb-0.5">Last Seen</div>
                    {new Date(person.lastSeen).toLocaleTimeString('en-IN', { hour12: false })}
                  </div>
                  <div className="text-surface-200/50">
                    <div className="text-surface-200/30 mb-0.5">Track Points</div>
                    {personTracks.length}
                  </div>
                </div>

                {person.currentLat && person.currentLng && (
                  <div className="mt-3 text-xs text-yellow-400/70 font-mono">
                    ⚠️ SIMULATED LOCATION: {formatCoords(person.currentLat, person.currentLng)}
                  </div>
                )}

                {personTracks.length > 1 && (
                  <div className="mt-3 border-t border-surface-700/30 pt-3">
                    <div className="text-xs text-surface-200/40 mb-2">Trajectory ({personTracks.length} points)</div>
                    <div className="flex gap-1.5 overflow-x-auto">
                      {personTracks.map((pt, i) => (
                        <div key={i} className="flex-shrink-0 bg-surface-700/50 rounded px-2 py-1 text-xs font-mono text-surface-200/60">
                          <div>{new Date(pt.timestamp).toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                          <div className="text-surface-200/30">{pt.cameraId}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { useAppStore } from '../store/useAppStore';
import { ZoneBadge } from '../components/ZoneBadge';
import { MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ZoneType } from '../types';

export function PeoplePage() {
  const { persons, tracks, zones, cameras, setMapCenter, setMapZoom } = useAppStore();
  const navigate = useNavigate();

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
          <h1 className="text-lg font-semibold text-white">Tracked Persons & Geo Trajectories</h1>
          <p className="text-xs text-surface-200/50">CCTV bottom-center pixel to ground coordinate transformation and real-time tracking</p>
        </div>
        <div className="text-xs text-surface-200/50 font-mono">
          {persons.filter(p => p.isActive).length} active / {persons.length} total tracked
        </div>
      </div>

      {persons.length === 0 ? (
        <div className="text-center py-16 text-surface-200/30 text-sm bg-surface-900/40 rounded-xl border border-surface-800">
          No persons tracked — click "Start Demo" in the left sidebar to simulate active person detection and movement
        </div>
      ) : (
        <div className="space-y-4">
          {persons.map(person => {
            const zone = zones.find(z => z.id === person.currentZoneId);
            const camera = cameras.find(c => c.id === person.currentCameraId);
            const personTracks = tracks[person.id] ?? [];
            const pixelX = person.pixelX ?? 825;
            const pixelY = person.pixelY ?? 800;

            return (
              <div key={person.id} className="bg-surface-800/60 border border-surface-700/40 rounded-xl p-5 hover:border-surface-600/50 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-500/20 border border-brand-500/30 rounded-full flex items-center justify-center text-xl shadow-lg shadow-brand-500/10">
                      👤
                    </div>
                    <div>
                      <div className="text-base font-bold text-white font-mono">PERSON #{person.trackId}</div>
                      <div className="text-xs text-surface-200/50">System Track ID: {person.id}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {zone && <ZoneBadge type={zone.type as ZoneType} />}
                    <span className={`text-xs font-mono px-2 py-0.5 rounded border font-bold ${
                      person.isActive ? 'bg-green-500/15 text-green-400 border-green-500/25' : 'bg-surface-700/50 text-surface-200/40 border-surface-700/50'
                    }`}>{person.isActive ? 'ACTIVE' : 'LOST'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono bg-surface-850/60 p-3 rounded-lg border border-surface-750 mb-3">
                  <div>
                    <div className="text-surface-200/40 text-[10px]">Current Camera</div>
                    <div className="text-white font-bold">{camera?.name ?? person.currentCameraId ?? 'CAM-01'}</div>
                  </div>
                  <div>
                    <div className="text-surface-200/40 text-[10px]">CCTV Pixel (Feet Base)</div>
                    <div className="text-sky-400 font-bold">X: {pixelX} px, Y: {pixelY} px</div>
                  </div>
                  <div>
                    <div className="text-surface-200/40 text-[10px]">Current Zone</div>
                    <div className="text-white font-bold">{zone?.name ?? 'Monitored Zone'}</div>
                  </div>
                  <div>
                    <div className="text-surface-200/40 text-[10px]">Detection Confidence</div>
                    <div className="text-green-400 font-bold">{person.confidence ?? 94}%</div>
                  </div>
                </div>

                {person.currentLat && person.currentLng && (
                  <div className="text-xs text-yellow-400/90 font-mono mb-3 flex items-center justify-between bg-yellow-500/10 px-3 py-2 rounded-lg border border-yellow-500/20">
                    <div>
                      <span>📍 Computed Geo Coordinate: </span>
                      <strong className="text-white">Lat: {person.currentLat.toFixed(6)}, Lon: {person.currentLng.toFixed(6)}</strong>
                    </div>
                    <button
                      onClick={() => handleFocusMap(person.currentLat, person.currentLng)}
                      className="flex items-center gap-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 px-2.5 py-1 rounded text-[11px] font-semibold transition-colors"
                    >
                      <MapPin className="w-3 h-3" /> Focus on Map
                    </button>
                  </div>
                )}

                {personTracks.length > 0 && (
                  <div className="border-t border-surface-700/30 pt-3">
                    <div className="text-xs text-surface-200/50 mb-2 flex items-center justify-between font-mono">
                      <span>Movement Trajectory ({personTracks.length} points logged)</span>
                      <span className="text-[10px] text-surface-200/40">Status: {person.locationStatus.toUpperCase()}</span>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {personTracks.map((pt, i) => (
                        <div key={i} className="flex-shrink-0 bg-surface-750/70 border border-surface-700/50 rounded px-2.5 py-1.5 text-[11px] font-mono text-surface-200/70">
                          <div className="text-white font-semibold">Step {i + 1}</div>
                          <div className="text-sky-400">X:{pt.pixelX ?? 825}, Y:{pt.pixelY ?? 800}</div>
                          <div className="text-surface-200/40 text-[10px]">{pt.lat.toFixed(4)}, {pt.lng.toFixed(4)}</div>
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

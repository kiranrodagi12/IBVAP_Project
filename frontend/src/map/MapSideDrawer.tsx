import { X, Camera as CameraIcon, Layers as LayersIcon, MapPin, Check, Plus, Trash2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { bearingToCompass, formatCoords } from '../utils/geo';
import type { Camera, Zone, ZoneType } from '../types';

export function MapSideDrawer() {
  const {
    mapMode, setMapMode,
    draftCamera, updateDraftCamera, saveDraftCamera,
    draftZone, updateDraftZone, saveDraftZone, addDraftZonePoint, clearDraftZonePoints,
    cameras
  } = useAppStore();

  if (mapMode === 'NORMAL') return null;

  const ZONE_TYPES: ZoneType[] = ['safe', 'normal', 'monitoring', 'restricted', 'danger'];

  return (
    <div className="absolute top-4 right-4 bottom-4 w-80 bg-surface-900/95 backdrop-blur-md border border-surface-700/60 rounded-xl shadow-2xl z-[1000] flex flex-col overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-700/50 bg-surface-850">
        <div className="flex items-center gap-2">
          {mapMode.includes('CAMERA') ? (
            <CameraIcon className="w-4 h-4 text-brand-400" />
          ) : (
            <LayersIcon className="w-4 h-4 text-brand-400" />
          )}
          <span className="text-sm font-semibold text-white">
            {mapMode === 'ADD_CAMERA' && 'Add Camera on Map'}
            {mapMode === 'EDIT_CAMERA' && 'Edit Camera'}
            {mapMode === 'ADD_ZONE' && 'Draw Zone on Map'}
            {mapMode === 'EDIT_ZONE' && 'Edit Zone'}
          </span>
        </div>
        <button
          onClick={() => setMapMode('NORMAL')}
          className="text-surface-200/50 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* CAMERA MODE FORM */}
        {(mapMode === 'ADD_CAMERA' || mapMode === 'EDIT_CAMERA') && (
          <>
            <div className="p-2.5 bg-brand-500/10 border border-brand-500/20 rounded-lg text-brand-300 font-mono text-[11px] flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-brand-400" />
              <span>Click anywhere on the map to set camera position!</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-surface-200/60 mb-1">Camera ID *</label>
                <input
                  value={draftCamera.id ?? ''}
                  onChange={e => updateDraftCamera({ id: e.target.value })}
                  placeholder="CAM-05"
                  className="w-full bg-surface-800 border border-surface-700/50 rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-surface-200/60 mb-1">Name *</label>
                <input
                  value={draftCamera.name ?? ''}
                  onChange={e => updateDraftCamera({ name: e.target.value })}
                  placeholder="Main Entrance Camera"
                  className="w-full bg-surface-800 border border-surface-700/50 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-surface-200/60 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={draftCamera.lat ?? 18.5204}
                    onChange={e => updateDraftCamera({ lat: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-surface-800 border border-surface-700/50 rounded-lg px-2 py-1 text-white font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-surface-200/60 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={draftCamera.lng ?? 73.8567}
                    onChange={e => updateDraftCamera({ lng: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-surface-800 border border-surface-700/50 rounded-lg px-2 py-1 text-white font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-surface-200/60 mb-1">
                  <span>Direction (Orientation)</span>
                  <span className="text-brand-400 font-mono">{draftCamera.direction ?? 90}° ({bearingToCompass(draftCamera.direction ?? 90)})</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="359"
                  value={draftCamera.direction ?? 90}
                  onChange={e => updateDraftCamera({ direction: parseInt(e.target.value) })}
                  className="w-full accent-brand-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-surface-200/60 mb-1">
                  <span>Field of View (FOV)</span>
                  <span className="text-brand-400 font-mono">{draftCamera.fov ?? 70}°</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="180"
                  value={draftCamera.fov ?? 70}
                  onChange={e => updateDraftCamera({ fov: parseInt(e.target.value) })}
                  className="w-full accent-brand-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-surface-200/60 mb-1">
                  <span>Detection Range</span>
                  <span className="text-brand-400 font-mono">{draftCamera.range ?? 150}m</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="500"
                  step="10"
                  value={draftCamera.range ?? 150}
                  onChange={e => updateDraftCamera({ range: parseInt(e.target.value) })}
                  className="w-full accent-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-surface-200/60 mb-1">Status</label>
                  <select
                    value={draftCamera.status ?? 'online'}
                    onChange={e => updateDraftCamera({ status: e.target.value as Camera['status'] })}
                    className="w-full bg-surface-800 border border-surface-700/50 rounded-lg px-2 py-1.5 text-white"
                  >
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="degraded">Degraded</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-surface-200/60 mb-1">Type</label>
                  <select
                    value={draftCamera.type ?? 'fixed'}
                    onChange={e => updateDraftCamera({ type: e.target.value as Camera['type'] })}
                    className="w-full bg-surface-800 border border-surface-700/50 rounded-lg px-2 py-1.5 text-white"
                  >
                    <option value="fixed">Fixed</option>
                    <option value="ptz">PTZ</option>
                    <option value="thermal">Thermal</option>
                  </select>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ZONE MODE FORM */}
        {(mapMode === 'ADD_ZONE' || mapMode === 'EDIT_ZONE') && (
          <>
            <div className="p-2.5 bg-brand-500/10 border border-brand-500/20 rounded-lg text-brand-300 font-mono text-[11px] flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-brand-400" />
              <span>Click on the map to add polygon vertices! ({draftZone.coordinates?.length ?? 0} points)</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-surface-200/60 mb-1">Zone ID *</label>
                <input
                  value={draftZone.id ?? ''}
                  onChange={e => updateDraftZone({ id: e.target.value })}
                  placeholder="ZONE-05"
                  className="w-full bg-surface-800 border border-surface-700/50 rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-surface-200/60 mb-1">Zone Name *</label>
                <input
                  value={draftZone.name ?? ''}
                  onChange={e => updateDraftZone({ name: e.target.value })}
                  placeholder="North Gate Danger Zone"
                  className="w-full bg-surface-800 border border-surface-700/50 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-surface-200/60 mb-1">Zone Category / Type</label>
                <div className="flex gap-1 flex-wrap">
                  {ZONE_TYPES.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => updateDraftZone({ type: t })}
                      className={`px-2 py-1 rounded text-[10px] font-mono uppercase border transition-colors ${
                        draftZone.type === t
                          ? 'bg-brand-500/20 border-brand-500/50 text-brand-400 font-bold'
                          : 'border-surface-700/50 text-surface-200/50 hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-surface-200/60 mb-1">Associated Cameras</label>
                <div className="flex flex-wrap gap-1.5 bg-surface-800/50 p-2 rounded-lg border border-surface-700/40 max-h-24 overflow-y-auto">
                  {cameras.map(c => {
                    const linked = draftZone.linkedCameraIds?.includes(c.id) ?? false;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          const current = draftZone.linkedCameraIds ?? [];
                          const next = linked ? current.filter(id => id !== c.id) : [...current, c.id];
                          updateDraftZone({ linkedCameraIds: next });
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                          linked ? 'bg-green-500/20 border-green-500/40 text-green-400' : 'border-surface-700/50 text-surface-200/50'
                        }`}
                      >
                        {c.id}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-surface-200/60">Polygon Vertices</span>
                  <button
                    type="button"
                    onClick={clearDraftZonePoints}
                    className="text-red-400 hover:text-red-300 text-[10px] flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Clear Points
                  </button>
                </div>
                <div className="bg-surface-800/50 rounded-lg p-2 max-h-28 overflow-y-auto font-mono text-[10px] space-y-1">
                  {(draftZone.coordinates ?? []).map((pt, idx) => (
                    <div key={idx} className="flex justify-between text-surface-200/70 border-b border-surface-700/30 pb-0.5">
                      <span>Pt {idx + 1}: {pt.lat.toFixed(5)}, {pt.lng.toFixed(5)}</span>
                    </div>
                  ))}
                  {(!draftZone.coordinates || draftZone.coordinates.length === 0) && (
                    <div className="text-surface-200/30 italic text-center py-2">No points added yet. Click map to add.</div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer Buttons */}
      <div className="p-3 border-t border-surface-700/50 bg-surface-850 flex gap-2">
        <button
          onClick={() => setMapMode('NORMAL')}
          className="flex-1 py-1.5 px-3 rounded-lg text-surface-200/60 hover:text-white bg-surface-800 hover:bg-surface-750 font-medium transition-colors text-xs"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            if (mapMode.includes('CAMERA')) saveDraftCamera();
            else saveDraftZone();
          }}
          className="flex-1 py-1.5 px-3 rounded-lg bg-brand-500 text-white hover:bg-brand-400 font-semibold transition-colors flex items-center justify-center gap-1.5 text-xs shadow-lg shadow-brand-500/20"
        >
          <Check className="w-3.5 h-3.5" /> Save
        </button>
      </div>
    </div>
  );
}

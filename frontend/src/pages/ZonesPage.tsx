import { useAppStore } from '../store/useAppStore';
import { IBVAPMap } from '../map/IBVAPMap';
import { ZoneBadge } from '../components/ZoneBadge';
import { Trash2, Edit2, Plus, Layers as LayersIcon } from 'lucide-react';

export function ZonesPage() {
  const { zones, removeZone, setMapMode, openEditZoneOnMap } = useAppStore();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Zone Management</h1>
          <p className="text-xs text-surface-200/50">Draw and configure safe, monitoring, restricted, and danger border zones</p>
        </div>
        <button
          onClick={() => setMapMode('ADD_ZONE')}
          className="flex items-center gap-2 bg-brand-500 text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-brand-400 transition-all shadow-lg shadow-brand-500/20"
        >
          <Plus className="w-4 h-4" /> Draw Zone on Map
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Zones List */}
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {zones.map(zone => (
            <div key={zone.id} className="bg-surface-800/60 border border-surface-700/40 rounded-xl p-4 hover:border-surface-600/50 transition-all">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    <LayersIcon className="w-3.5 h-3.5 text-brand-400" />
                    {zone.name}
                  </div>
                  <div className="text-xs text-surface-200/50 font-mono">{zone.id}</div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEditZoneOnMap(zone)}
                    title="Edit Zone on Map"
                    className="p-1.5 text-surface-200/40 hover:text-brand-400 hover:bg-surface-700/50 rounded transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => removeZone(zone.id)}
                    title="Delete Zone"
                    className="p-1.5 text-surface-200/40 hover:text-red-400 hover:bg-surface-700/50 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-2">
                <ZoneBadge type={zone.type} />
                <span className="text-[10px] font-mono text-surface-200/40 uppercase">
                  {zone.priority} Priority
                </span>
              </div>

              <div className="mt-2 text-xs text-surface-200/60 font-mono space-y-1 pt-2 border-t border-surface-700/30">
                <div>📐 Vertices: {zone.coordinates?.length ?? 0} points</div>
                <div>📷 Linked Cameras: {zone.linkedCameraIds && zone.linkedCameraIds.length > 0 ? zone.linkedCameraIds.join(', ') : 'None'}</div>
                {zone.description && <div className="text-surface-200/40 italic font-sans">{zone.description}</div>}
              </div>
            </div>
          ))}
        </div>

        {/* Map Preview */}
        <div className="lg:col-span-2">
          <IBVAPMap height="600px" showControls={true} />
        </div>
      </div>
    </div>
  );
}

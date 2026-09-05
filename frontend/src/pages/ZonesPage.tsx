import { useAppStore } from '../store/useAppStore';
import { IBVAPMap } from '../map/IBVAPMap';
import { ZoneBadge } from '../components/ZoneBadge';
import { Trash2, Edit2, Plus } from 'lucide-react';
import { useState } from 'react';
import type { Zone, ZoneType } from '../types';
import { DEMO_CAMERAS } from '../data/demoData';
import { cameraPositionsToPolygon } from '../utils/geo';

const EMPTY_ZONE: Partial<Zone> = {
  name: '',
  type: 'restricted',
  priority: 'high',
  status: 'active',
  description: '',
  coordinates: [],
};

export function ZonesPage() {
  const { zones, addZone, removeZone, cameras } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Zone>>(EMPTY_ZONE);
  const [selectedCams, setSelectedCams] = useState<string[]>([]);

  const F = (field: keyof Zone, value: unknown) => setForm(f => ({ ...f, [field]: value }));

  const generateFromCameras = () => {
    const cams = cameras.filter(c => selectedCams.includes(c.id));
    if (cams.length < 3) return;
    const coords = cameraPositionsToPolygon(cams);
    setForm(f => ({ ...f, coordinates: coords, linkedCameraIds: selectedCams }));
  };

  const handleSave = () => {
    if (!form.name || !form.id) return;
    addZone(form as Zone);
    setShowForm(false);
    setForm(EMPTY_ZONE);
  };

  const ZONE_TYPE_OPTIONS: ZoneType[] = ['safe', 'normal', 'monitoring', 'restricted', 'danger'];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-white">Zone Management</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-brand-500/20 text-brand-400 border border-brand-500/30 px-3 py-2 rounded-lg text-sm hover:bg-brand-500/30">
          <Plus className="w-4 h-4" /> Create Zone
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-3">
          {zones.map(zone => (
            <div key={zone.id} className="bg-surface-800/60 border border-surface-700/40 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="text-sm font-bold text-white">{zone.name}</div>
                  <div className="text-xs text-surface-200/50 font-mono">{zone.id}</div>
                </div>
                <button onClick={() => removeZone(zone.id)} className="p-1.5 text-surface-200/40 hover:text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <ZoneBadge type={zone.type} />
              <div className="mt-2 text-xs text-surface-200/50">
                <div>Priority: {zone.priority.toUpperCase()}</div>
                <div>{zone.coordinates.length} vertices</div>
                {zone.description && <div className="mt-1 italic">{zone.description}</div>}
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-2">
          <IBVAPMap height="500px" />
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-900 border border-surface-700/50 rounded-xl w-full max-w-lg p-6">
            <h2 className="text-base font-semibold text-white mb-4">Create Zone</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-surface-200/60 mb-1">Zone ID *</label>
                  <input value={form.id ?? ''} onChange={e => F('id', e.target.value)}
                    className="w-full bg-surface-800 border border-surface-700/50 rounded-lg px-3 py-2 text-sm text-white font-mono"
                    placeholder="ZONE-05" />
                </div>
                <div>
                  <label className="block text-xs text-surface-200/60 mb-1">Zone Name *</label>
                  <input value={form.name ?? ''} onChange={e => F('name', e.target.value)}
                    className="w-full bg-surface-800 border border-surface-700/50 rounded-lg px-3 py-2 text-sm text-white"
                    placeholder="Restricted Zone 2" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-surface-200/60 mb-2">Zone Type</label>
                <div className="flex gap-2 flex-wrap">
                  {ZONE_TYPE_OPTIONS.map(t => (
                    <button key={t} onClick={() => F('type', t)}
                      className={`px-3 py-1 rounded text-xs font-mono uppercase border transition-colors ${
                        form.type === t ? 'bg-brand-500/20 border-brand-500/50 text-brand-400' : 'border-surface-700/50 text-surface-200/50 hover:text-white'
                      }`}>{t}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-surface-200/60 mb-1">Description</label>
                <input value={form.description ?? ''} onChange={e => F('description', e.target.value)}
                  className="w-full bg-surface-800 border border-surface-700/50 rounded-lg px-3 py-2 text-sm text-white" />
              </div>
              <div className="border border-surface-700/30 rounded-lg p-3">
                <div className="text-xs text-surface-200/60 mb-2 font-semibold">Generate Polygon from Cameras</div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {cameras.map(c => (
                    <label key={c.id} className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={selectedCams.includes(c.id)}
                        onChange={e => setSelectedCams(prev => e.target.checked ? [...prev, c.id] : prev.filter(id => id !== c.id))}
                      />
                      <span className="text-xs text-white">{c.id}</span>
                    </label>
                  ))}
                </div>
                <button onClick={generateFromCameras}
                  className="text-xs bg-surface-700/50 text-surface-200/70 hover:text-white px-3 py-1.5 rounded transition-colors">
                  Generate Polygon ({selectedCams.length} cameras)
                </button>
                {form.coordinates && form.coordinates.length > 0 && (
                  <div className="mt-2 text-xs text-green-400">✓ {form.coordinates.length} vertices generated</div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-surface-200/60 hover:text-white">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 text-sm bg-brand-500/20 text-brand-400 border border-brand-500/30 rounded-lg hover:bg-brand-500/30">Save Zone</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

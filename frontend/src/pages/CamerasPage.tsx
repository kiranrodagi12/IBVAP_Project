import { useState } from 'react';
import { Plus, Edit2, Trash2, Camera } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { CameraStatusBadge } from '../components/CameraStatusBadge';
import { IBVAPMap } from '../map/IBVAPMap';
import { bearingToCompass } from '../utils/geo';
import type { Camera as CameraType } from '../types';
import { clsx } from 'clsx';

const EMPTY_CAM: Partial<CameraType> = {
  name: '',
  lat: 31.604,
  lng: 74.512,
  direction: 0,
  fov: 70,
  range: 150,
  status: 'online',
  type: 'fixed',
  videoSource: 'demo',
  calibrationValid: false,
  fps: 25,
};

export function CamerasPage() {
  const { cameras, addCamera, updateCamera, removeCamera } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<CameraType>>(EMPTY_CAM);

  const openAdd = () => { setForm(EMPTY_CAM); setEditing(null); setShowForm(true); };
  const openEdit = (cam: CameraType) => { setForm(cam); setEditing(cam.id); setShowForm(true); };

  const handleSave = () => {
    if (!form.name || !form.id) return;
    if (editing) {
      updateCamera(editing, form);
    } else {
      addCamera(form as CameraType);
    }
    setShowForm(false);
  };

  const F = (field: keyof CameraType, value: unknown) => setForm(f => ({ ...f, [field]: value }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-white">Camera Management</h1>
        <button onClick={openAdd} className="flex items-center gap-2 bg-brand-500/20 text-brand-400 border border-brand-500/30 px-3 py-2 rounded-lg text-sm hover:bg-brand-500/30 transition-colors">
          <Plus className="w-4 h-4" /> Add Camera
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camera list */}
        <div className="lg:col-span-1 space-y-3">
          {cameras.map(cam => (
            <div key={cam.id} className="bg-surface-800/60 border border-surface-700/40 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="text-sm font-bold text-white font-mono">{cam.id}</div>
                  <div className="text-xs text-surface-200/60">{cam.name}</div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(cam)} className="p-1.5 text-surface-200/50 hover:text-white rounded transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => removeCamera(cam.id)} className="p-1.5 text-surface-200/50 hover:text-red-400 rounded transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <CameraStatusBadge status={cam.status} />
              <div className="mt-2 grid grid-cols-2 gap-1 text-xs text-surface-200/50 font-mono">
                <span>Dir: {cam.direction}° {bearingToCompass(cam.direction)}</span>
                <span>FOV: {cam.fov}°</span>
                <span>Range: {cam.range}m</span>
                <span>FPS: {cam.fps}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Map preview */}
        <div className="lg:col-span-2">
          <IBVAPMap height="500px" />
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-900 border border-surface-700/50 rounded-xl w-full max-w-lg p-6">
            <h2 className="text-base font-semibold text-white mb-4">{editing ? 'Edit Camera' : 'Add Camera'}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-surface-200/60 mb-1">Camera ID *</label>
                  <input value={form.id ?? ''} onChange={e => F('id', e.target.value)}
                    className="w-full bg-surface-800 border border-surface-700/50 rounded-lg px-3 py-2 text-sm text-white font-mono"
                    placeholder="CAM-05" />
                </div>
                <div>
                  <label className="block text-xs text-surface-200/60 mb-1">Name *</label>
                  <input value={form.name ?? ''} onChange={e => F('name', e.target.value)}
                    className="w-full bg-surface-800 border border-surface-700/50 rounded-lg px-3 py-2 text-sm text-white"
                    placeholder="Gate Camera" />
                </div>
                <div>
                  <label className="block text-xs text-surface-200/60 mb-1">Latitude</label>
                  <input type="number" step="0.0001" value={form.lat ?? ''} onChange={e => F('lat', parseFloat(e.target.value))}
                    className="w-full bg-surface-800 border border-surface-700/50 rounded-lg px-3 py-2 text-sm text-white font-mono" />
                </div>
                <div>
                  <label className="block text-xs text-surface-200/60 mb-1">Longitude</label>
                  <input type="number" step="0.0001" value={form.lng ?? ''} onChange={e => F('lng', parseFloat(e.target.value))}
                    className="w-full bg-surface-800 border border-surface-700/50 rounded-lg px-3 py-2 text-sm text-white font-mono" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-surface-200/60 mb-1">Direction: {form.direction}° ({bearingToCompass(form.direction ?? 0)})</label>
                <input type="range" min="0" max="359" value={form.direction ?? 0} onChange={e => F('direction', parseInt(e.target.value))}
                  className="w-full" />
              </div>
              <div>
                <label className="block text-xs text-surface-200/60 mb-1">Field of View: {form.fov}°</label>
                <input type="range" min="10" max="180" value={form.fov ?? 70} onChange={e => F('fov', parseInt(e.target.value))}
                  className="w-full" />
              </div>
              <div>
                <label className="block text-xs text-surface-200/60 mb-1">Detection Range: {form.range}m</label>
                <input type="range" min="20" max="500" step="10" value={form.range ?? 150} onChange={e => F('range', parseInt(e.target.value))}
                  className="w-full" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-surface-200/60 mb-1">Status</label>
                  <select value={form.status} onChange={e => F('status', e.target.value)}
                    className="w-full bg-surface-800 border border-surface-700/50 rounded-lg px-3 py-2 text-sm text-white">
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="degraded">Degraded</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-surface-200/60 mb-1">Type</label>
                  <select value={form.type} onChange={e => F('type', e.target.value)}
                    className="w-full bg-surface-800 border border-surface-700/50 rounded-lg px-3 py-2 text-sm text-white">
                    <option value="fixed">Fixed</option>
                    <option value="ptz">PTZ</option>
                    <option value="thermal">Thermal</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-surface-200/60 hover:text-white transition-colors">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 text-sm bg-brand-500/20 text-brand-400 border border-brand-500/30 rounded-lg hover:bg-brand-500/30 transition-colors">Save Camera</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

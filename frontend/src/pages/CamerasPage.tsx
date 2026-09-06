import { Plus, Edit2, Trash2, Camera as CameraIcon } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { CameraStatusBadge } from '../components/CameraStatusBadge';
import { IBVAPMap } from '../map/IBVAPMap';
import { bearingToCompass } from '../utils/geo';

export function CamerasPage() {
  const { cameras, setMapMode, openEditCameraOnMap, removeCamera } = useAppStore();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Camera Management</h1>
          <p className="text-xs text-surface-200/50">Configure, position, and calibrate border CCTV cameras</p>
        </div>
        <button
          onClick={() => setMapMode('ADD_CAMERA')}
          className="flex items-center gap-2 bg-brand-500 text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-brand-400 transition-all shadow-lg shadow-brand-500/20"
        >
          <Plus className="w-4 h-4" /> Add Camera on Map
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camera List */}
        <div className="lg:col-span-1 space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {cameras.map(cam => (
            <div key={cam.id} className="bg-surface-800/60 border border-surface-700/40 rounded-xl p-4 hover:border-surface-600/50 transition-all">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
                    <CameraIcon className="w-3.5 h-3.5 text-brand-400" />
                    {cam.id}
                  </div>
                  <div className="text-xs text-surface-200/70 font-medium">{cam.name}</div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEditCameraOnMap(cam)}
                    title="Edit Camera on Map"
                    className="p-1.5 text-surface-200/50 hover:text-brand-400 hover:bg-surface-700/50 rounded transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => removeCamera(cam.id)}
                    title="Delete Camera"
                    className="p-1.5 text-surface-200/50 hover:text-red-400 hover:bg-surface-700/50 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-2">
                <CameraStatusBadge status={cam.status} />
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                  cam.calibrationValid ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'
                }`}>
                  {cam.calibrationValid ? 'CALIBRATED' : 'NOT CALIBRATED'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1 text-xs text-surface-200/60 font-mono pt-2 border-t border-surface-700/30">
                <div>📍 Lat: {cam.lat.toFixed(5)}</div>
                <div>📍 Lng: {cam.lng.toFixed(5)}</div>
                <div>🎯 Dir: {cam.direction}° ({bearingToCompass(cam.direction)})</div>
                <div>📐 FOV: {cam.fov}°</div>
                <div>📏 Range: {cam.range}m</div>
                <div>🎬 FPS: {cam.fps ?? 25}</div>
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

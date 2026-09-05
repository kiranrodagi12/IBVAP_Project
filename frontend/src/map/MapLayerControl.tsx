import { useState } from 'react';
import { Layers } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { clsx } from 'clsx';

export function MapLayerControl() {
  const { layers, toggleLayer } = useAppStore();
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute top-3 right-3 z-[1000]">
      <button
        onClick={() => setOpen(o => !o)}
        className="bg-surface-800 border border-surface-700/50 rounded-lg p-2 text-surface-200/70 hover:text-white transition-colors shadow-lg"
      >
        <Layers className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute top-10 right-0 bg-surface-900 border border-surface-700/50 rounded-lg p-3 w-52 shadow-xl">
          <div className="text-xs text-surface-200/50 font-mono uppercase tracking-wider mb-2">Map Layers</div>
          {layers.map(layer => (
            <label key={layer.id} className="flex items-center gap-2 py-1 cursor-pointer group">
              <input
                type="checkbox"
                checked={layer.visible}
                onChange={() => toggleLayer(layer.id)}
                className="rounded"
              />
              <span className={clsx(
                'text-xs transition-colors',
                layer.visible ? 'text-white' : 'text-surface-200/40'
              )}>{layer.name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

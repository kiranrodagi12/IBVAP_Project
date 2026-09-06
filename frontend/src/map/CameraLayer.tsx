import { Polygon, Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { useAppStore } from '../store/useAppStore';
import { buildFovSector, bearingToCompass, formatCoords } from '../utils/geo';
import type { Camera } from '../types';

// Custom camera icon
const createCameraIcon = (status: Camera['status']) => L.divIcon({
  html: `<div class="camera-marker camera-marker-${status}">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C9.87 2 8.11 3.28 7.34 5.11L2 7.01V17h6.34A5.5 5.5 0 0 0 17.5 19H22V7.01l-5.34-1.9C15.89 3.28 14.13 2 12 2zm0 2c1.47 0 2.71.82 3.35 2H8.65C9.29 4.82 10.53 4 12 4zm-8 5.17l4 1.43V16H4V9.17zm16 6.83h-4V10.6l4-1.43V16zm-6 2.5A3.5 3.5 0 0 1 8.5 15 3.5 3.5 0 0 1 12 11.5 3.5 3.5 0 0 1 15.5 15 3.5 3.5 0 0 1 12 18.5z"/>
    </svg>
  </div>`,
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14],
});

const FOV_COLORS: Record<Camera['status'], { fill: string; stroke: string }> = {
  online:      { fill: '#0ea5e9', stroke: '#38bdf8' },
  offline:     { fill: '#ef4444', stroke: '#f87171' },
  degraded:    { fill: '#eab308', stroke: '#fbbf24' },
  maintenance: { fill: '#8b5cf6', stroke: '#a78bfa' },
};

interface CameraLayerProps {
  showFov: boolean;
  showMarker: boolean;
}

export function CameraLayer({ showFov, showMarker }: CameraLayerProps) {
  const { cameras, setSelectedCamera, openEditCameraOnMap, setDraftZone, setMapMode } = useAppStore();

  return (
    <>
      {cameras.map((cam) => {
        const sectorCoords = buildFovSector(
          cam.lat, cam.lng,
          cam.direction, cam.fov, cam.range
        );
        const colors = FOV_COLORS[cam.status];

        const handleCreateZoneFromCamera = () => {
          setDraftZone({
            id: `ZONE-CAM-${cam.id}`,
            name: `${cam.name} Coverage Zone`,
            type: 'restricted',
            linkedCameraIds: [cam.id],
            coordinates: sectorCoords.slice(1, -1) // sector arc points
          });
          setMapMode('ADD_ZONE');
        };

        return (
          <div key={cam.id}>
            {/* FOV sector */}
            {showFov && (
              <Polygon
                positions={sectorCoords.map(p => [p.lat, p.lng])}
                pathOptions={{
                  color: colors.stroke,
                  fillColor: colors.fill,
                  fillOpacity: cam.status === 'online' ? 0.12 : 0.05,
                  weight: 1.5,
                  dashArray: cam.status === 'offline' ? '4,4' : undefined,
                }}
              >
                <Tooltip direction="center" permanent={false}>
                  <div className="text-xs font-mono">
                    <strong>{cam.id}</strong> — {cam.name}<br />
                    Dir: {cam.direction}° ({bearingToCompass(cam.direction)}) | FOV: {cam.fov}° | Range: {cam.range}m
                  </div>
                </Tooltip>
              </Polygon>
            )}

            {/* Camera marker */}
            {showMarker && (
              <Marker
                position={[cam.lat, cam.lng]}
                icon={createCameraIcon(cam.status)}
                eventHandlers={{ click: () => setSelectedCamera(cam.id) }}
              >
                <Popup>
                  <div className="min-w-[220px]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-base font-mono">{cam.id}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        cam.status === 'online' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                      }`}>{cam.status.toUpperCase()}</span>
                    </div>
                    <div className="text-xs text-gray-200 font-semibold mb-2">{cam.name}</div>
                    <div className="space-y-1 text-xs text-gray-300 font-mono">
                      <div>📍 Lat: {cam.lat.toFixed(6)}</div>
                      <div>📍 Lng: {cam.lng.toFixed(6)}</div>
                      <div>🎯 Direction: {cam.direction}° ({bearingToCompass(cam.direction)})</div>
                      <div>📐 Field of View: {cam.fov}°</div>
                      <div>📏 Range: {cam.range}m</div>
                      <div>🔧 Calibration: {cam.calibrationValid ? '✅ Valid' : '❌ Invalid'}</div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-gray-700 flex gap-1.5">
                      <button
                        onClick={() => openEditCameraOnMap(cam)}
                        className="flex-1 text-[11px] bg-sky-900/60 hover:bg-sky-800 text-sky-200 py-1 px-2 rounded font-medium transition-colors"
                      >
                        ✏️ Edit Camera
                      </button>
                      <button
                        onClick={handleCreateZoneFromCamera}
                        className="flex-1 text-[11px] bg-orange-900/60 hover:bg-orange-800 text-orange-200 py-1 px-2 rounded font-medium transition-colors"
                      >
                        📐 Create Zone
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}
          </div>
        );
      })}
    </>
  );
}

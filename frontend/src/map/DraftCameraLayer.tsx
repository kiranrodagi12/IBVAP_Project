import { Marker, Polygon, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useAppStore } from '../store/useAppStore';
import { buildFovSector, bearingToCompass, formatCoords } from '../utils/geo';

const createDraftCameraIcon = () => L.divIcon({
  html: `<div style="
    width: 32px; height: 32px;
    background: #0ea5e9;
    border: 2px solid #ffffff;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: white;
    box-shadow: 0 0 16px rgba(14, 165, 233, 0.8);
    animation: pulse 1.5s infinite;
  ">📷</div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

export function DraftCameraLayer() {
  const { mapMode, draftCamera, updateDraftCamera } = useAppStore();

  if (!mapMode.includes('CAMERA') || !draftCamera.lat || !draftCamera.lng) {
    return null;
  }

  const sectorCoords = buildFovSector(
    draftCamera.lat,
    draftCamera.lng,
    draftCamera.direction ?? 90,
    draftCamera.fov ?? 70,
    draftCamera.range ?? 150
  );

  return (
    <>
      <Polygon
        positions={sectorCoords.map(p => [p.lat, p.lng])}
        pathOptions={{
          color: '#38bdf8',
          fillColor: '#0ea5e9',
          fillOpacity: 0.25,
          weight: 2,
          dashArray: '6,6'
        }}
      />
      <Marker
        position={[draftCamera.lat, draftCamera.lng]}
        icon={createDraftCameraIcon()}
        draggable={true}
        eventHandlers={{
          dragend: (e) => {
            const marker = e.target;
            const pos = marker.getLatLng();
            updateDraftCamera({ lat: pos.lat, lng: pos.lng });
          }
        }}
      >
        <Popup>
          <div className="text-xs">
            <strong>{draftCamera.id || 'New Camera'}</strong> (Draft)<br />
            📍 {formatCoords(draftCamera.lat, draftCamera.lng, 5)}<br />
            🎯 {draftCamera.direction ?? 90}° ({bearingToCompass(draftCamera.direction ?? 90)})
          </div>
        </Popup>
      </Marker>
    </>
  );
}

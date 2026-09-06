import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useAppStore } from '../store/useAppStore';
import { formatCoords } from '../utils/geo';
import type { ZoneType } from '../types';

const ZONE_MARKER_COLORS: Record<ZoneType, string> = {
  safe:       '#22c55e',
  normal:     '#64748b',
  monitoring: '#eab308',
  restricted: '#f97316',
  danger:     '#ef4444',
};

function personIcon(zoneType?: ZoneType) {
  const color = zoneType ? ZONE_MARKER_COLORS[zoneType] : '#0ea5e9';
  return L.divIcon({
    html: `<div style="
      width:34px; height:34px;
      background:${color}22;
      border: 2px solid ${color};
      border-radius: 50%;
      display:flex; align-items:center; justify-content:center;
      font-size:18px;
      box-shadow: 0 0 14px ${color}88;
    ">👤</div>`,
    className: '',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17],
  });
}

export function PersonLayer() {
  const { persons, zones, setSelectedPerson, setMapCenter } = useAppStore();

  return (
    <>
      {persons.filter(p => p.isActive && p.currentLat && p.currentLng).map((person) => {
        const zone = zones.find(z => z.id === person.currentZoneId);
        const pixelX = person.pixelX ?? 825;
        const pixelY = person.pixelY ?? 800;

        return (
          <Marker
            key={person.id}
            position={[person.currentLat!, person.currentLng!]}
            icon={personIcon(zone?.type)}
            eventHandlers={{
              click: () => {
                setSelectedPerson(person.id);
                if (person.currentLat && person.currentLng)
                  setMapCenter([person.currentLat, person.currentLng]);
              }
            }}
          >
            <Popup>
              <div className="min-w-[240px]">
                <div className="font-bold text-base mb-1 font-mono">PERSON #{person.trackId}</div>
                <div className="text-xs text-gray-300 font-mono space-y-1">
                  <div>📷 Camera: <strong>{person.currentCameraId ?? 'CAM-01'}</strong></div>
                  
                  <div className="pt-1 border-t border-gray-700">
                    <span className="text-gray-400">CCTV Coordinate (Bottom-Center Feet):</span>
                    <div className="font-bold text-sky-400">X: {pixelX} px, Y: {pixelY} px</div>
                  </div>

                  <div className="pt-1 border-t border-gray-700">
                    <span className="text-gray-400">Geo Coordinate:</span>
                    <div>Lat: {person.currentLat?.toFixed(6)}</div>
                    <div>Lon: {person.currentLng?.toFixed(6)}</div>
                  </div>

                  <div className="pt-1 border-t border-gray-700">
                    <div>🗺️ Zone: <strong>{zone?.name ?? person.currentZoneName ?? 'Monitored Area'}</strong></div>
                    <div>🎯 Confidence: <strong>{person.confidence ?? 94}%</strong></div>
                    <div>🕐 Last seen: {new Date(person.lastSeen).toLocaleTimeString()}</div>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

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
      width:32px; height:32px;
      background:${color}22;
      border: 2px solid ${color};
      border-radius: 50%;
      display:flex; align-items:center; justify-content:center;
      font-size:16px;
      box-shadow: 0 0 12px ${color}66;
    ">👤</div>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
}

export function PersonLayer() {
  const { persons, zones, setSelectedPerson, setMapCenter } = useAppStore();

  return (
    <>
      {persons.filter(p => p.isActive && p.currentLat && p.currentLng).map((person) => {
        const zone = zones.find(z => z.id === person.currentZoneId);
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
              <div className="min-w-[220px]">
                <div className="font-bold text-base mb-2">Person #${person.trackId}</div>
                <div className="space-y-1 text-xs text-gray-300">
                  <div>📷 Camera: {person.currentCameraId ?? 'Unknown'}</div>
                  <div>📍 {formatCoords(person.currentLat!, person.currentLng!, 6)}</div>
                  <div>🗺️ Zone: <strong>{zone?.name ?? 'Unknown'}</strong></div>
                  <div>🕐 Last seen: {new Date(person.lastSeen).toLocaleTimeString()}</div>
                  <div>🎯 Confidence: {person.confidence ?? '?'}%</div>
                  <div className="text-yellow-400">⚠️ Location: {person.locationStatus.toUpperCase()}</div>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

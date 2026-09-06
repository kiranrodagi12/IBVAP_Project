import { Polygon, CircleMarker, Polyline } from 'react-leaflet';
import { useAppStore } from '../store/useAppStore';
import { ZONE_COLORS } from '../data/demoData';

export function DraftZoneLayer() {
  const { mapMode, draftZone } = useAppStore();

  if (!mapMode.includes('ZONE') || !draftZone.coordinates) return null;

  const points = draftZone.coordinates.map(p => [p.lat, p.lng] as [number, number]);
  const style = ZONE_COLORS[draftZone.type ?? 'restricted'] ?? ZONE_COLORS.restricted;

  return (
    <>
      {/* Vertices markers */}
      {points.map((pt, idx) => (
        <CircleMarker
          key={idx}
          center={pt}
          radius={5}
          pathOptions={{
            color: '#ffffff',
            fillColor: style.stroke,
            fillOpacity: 1,
            weight: 2
          }}
        />
      ))}

      {/* Polyline if < 3 points */}
      {points.length > 1 && points.length < 3 && (
        <Polyline
          positions={points}
          pathOptions={{
            color: style.stroke,
            weight: 3,
            dashArray: '4,4'
          }}
        />
      )}

      {/* Polygon if >= 3 points */}
      {points.length >= 3 && (
        <Polygon
          positions={points}
          pathOptions={{
            color: style.stroke,
            fillColor: style.fill,
            fillOpacity: 0.3,
            weight: 2,
            dashArray: '4,4'
          }}
        />
      )}
    </>
  );
}

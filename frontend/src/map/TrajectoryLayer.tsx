import { Polyline, CircleMarker } from 'react-leaflet';
import { useAppStore } from '../store/useAppStore';

export function TrajectoryLayer() {
  const { tracks, zones } = useAppStore();

  return (
    <>
      {Object.entries(tracks).map(([personId, points]) => {
        if (points.length < 2) return null;
        const positions = points.map(p => [p.lat, p.lng] as [number, number]);
        return (
          <div key={personId}>
            <Polyline
              positions={positions}
              pathOptions={{
                color: '#0ea5e9',
                weight: 2,
                opacity: 0.7,
                dashArray: '4,2',
              }}
            />
            {/* Start marker */}
            <CircleMarker
              center={positions[0]}
              radius={4}
              pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 1, weight: 2 }}
            />
            {/* Waypoint dots */}
            {positions.slice(1, -1).map((pos, i) => (
              <CircleMarker
                key={i}
                center={pos}
                radius={2}
                pathOptions={{ color: '#0ea5e9', fillColor: '#0ea5e9', fillOpacity: 0.7, weight: 1 }}
              />
            ))}
          </div>
        );
      })}
    </>
  );
}

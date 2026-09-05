import { Polygon, Tooltip } from 'react-leaflet';
import { useAppStore } from '../store/useAppStore';
import { ZONE_COLORS } from '../data/demoData';
import type { ZoneType } from '../types';

interface ZoneLayerProps {
  zoneTypes?: ZoneType[];
}

export function ZoneLayer({ zoneTypes }: ZoneLayerProps) {
  const { zones, setSelectedZone } = useAppStore();

  const filtered = zoneTypes
    ? zones.filter(z => zoneTypes.includes(z.type) && z.status === 'active')
    : zones.filter(z => z.status === 'active');

  return (
    <>
      {filtered.map((zone) => {
        const colors = ZONE_COLORS[zone.type] ?? ZONE_COLORS.normal;
        return (
          <Polygon
            key={zone.id}
            positions={zone.coordinates.map(c => [c.lat, c.lng])}
            pathOptions={{
              color: colors.stroke,
              fillColor: colors.fill,
              fillOpacity: colors.fillOpacity,
              weight: zone.type === 'danger' ? 2 : 1.5,
              dashArray: zone.type === 'restricted' || zone.type === 'danger' ? '6,3' : undefined,
            }}
            eventHandlers={{ click: () => setSelectedZone(zone.id) }}
          >
            <Tooltip sticky>
              <div className="text-xs">
                <strong className="text-base">{zone.name}</strong><br />
                Type: <span className="uppercase font-bold">{zone.type}</span><br />
                Priority: {zone.priority.toUpperCase()}<br />
                {zone.description}
              </div>
            </Tooltip>
          </Polygon>
        );
      })}
    </>
  );
}

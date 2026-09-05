import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { CameraLayer } from './CameraLayer';
import { ZoneLayer } from './ZoneLayer';
import { PersonLayer } from './PersonLayer';
import { TrajectoryLayer } from './TrajectoryLayer';
import { MapLegend } from './MapLegend';
import { MapLayerControl } from './MapLayerControl';

// Component to sync map center with store
function MapController() {
  const map = useMap();
  const { mapCenter, mapZoom } = useAppStore();

  useEffect(() => {
    map.setView(mapCenter, mapZoom, { animate: true, duration: 0.8 });
  }, [mapCenter, mapZoom, map]);

  return null;
}

interface IBVAPMapProps {
  height?: string;
  showControls?: boolean;
}

export function IBVAPMap({ height = '100%', showControls = true }: IBVAPMapProps) {
  const { mapCenter, mapZoom, layers } = useAppStore();

  const isLayerVisible = (id: string) => layers.find(l => l.id === id)?.visible ?? true;

  return (
    <div className="relative rounded-lg overflow-hidden border border-surface-700/50" style={{ height }}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <MapController />

        {/* OpenStreetMap tiles */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          className="map-tiles"
        />

        {/* Layers */}
        {isLayerVisible('zones-safe') && <ZoneLayer zoneTypes={['safe', 'normal']} />}
        {isLayerVisible('zones-monitoring') && <ZoneLayer zoneTypes={['monitoring']} />}
        {isLayerVisible('zones-restricted') && <ZoneLayer zoneTypes={['restricted']} />}
        {isLayerVisible('zones-danger') && <ZoneLayer zoneTypes={['danger']} />}
        {isLayerVisible('camera-coverage') && <CameraLayer showFov={true} showMarker={isLayerVisible('cameras')} />}
        {!isLayerVisible('camera-coverage') && isLayerVisible('cameras') && <CameraLayer showFov={false} showMarker={true} />}
        {isLayerVisible('trajectories') && <TrajectoryLayer />}
        {isLayerVisible('persons') && <PersonLayer />}
      </MapContainer>

      <MapLegend />
      {showControls && <MapLayerControl />}
    </div>
  );
}

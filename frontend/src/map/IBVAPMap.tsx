import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { CameraLayer } from './CameraLayer';
import { ZoneLayer } from './ZoneLayer';
import { PersonLayer } from './PersonLayer';
import { TrajectoryLayer } from './TrajectoryLayer';
import { MapLegend } from './MapLegend';
import { MapLayerControl } from './MapLayerControl';
import { MapSideDrawer } from './MapSideDrawer';
import { DraftCameraLayer } from './DraftCameraLayer';
import { DraftZoneLayer } from './DraftZoneLayer';

// Component to sync map center with store
function MapController() {
  const map = useMap();
  const { mapCenter, mapZoom } = useAppStore();

  useEffect(() => {
    map.setView(mapCenter, mapZoom, { animate: true, duration: 0.8 });
  }, [mapCenter, mapZoom, map]);

  return null;
}

// Component to handle map clicks for camera/zone placement
function MapClickHandler() {
  const { mapMode, updateDraftCamera, addDraftZonePoint } = useAppStore();

  useMapEvents({
    click(e) {
      if (mapMode === 'ADD_CAMERA' || mapMode === 'EDIT_CAMERA') {
        updateDraftCamera({ lat: e.latlng.lat, lng: e.latlng.lng });
      } else if (mapMode === 'ADD_ZONE' || mapMode === 'EDIT_ZONE') {
        addDraftZonePoint({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    }
  });

  return null;
}

interface IBVAPMapProps {
  height?: string;
  showControls?: boolean;
}

export function IBVAPMap({ height = '100%', showControls = true }: IBVAPMapProps) {
  const { mapCenter, mapZoom, layers, mapMode, setMapMode } = useAppStore();

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
        <MapClickHandler />

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

        {/* Placement Draft Layers */}
        <DraftCameraLayer />
        <DraftZoneLayer />
      </MapContainer>

      {/* Top Map Toolbar (Add Camera / Add Zone Quick Action Buttons) */}
      {showControls && mapMode === 'NORMAL' && (
        <div className="absolute top-3 left-14 z-[999] flex gap-2">
          <button
            onClick={() => setMapMode('ADD_CAMERA')}
            className="bg-surface-900/90 text-brand-400 hover:text-white border border-surface-700/60 hover:border-brand-500/50 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg backdrop-blur-sm transition-all flex items-center gap-1.5"
          >
            📷 Add Camera on Map
          </button>
          <button
            onClick={() => setMapMode('ADD_ZONE')}
            className="bg-surface-900/90 text-brand-400 hover:text-white border border-surface-700/60 hover:border-brand-500/50 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg backdrop-blur-sm transition-all flex items-center gap-1.5"
          >
            📐 Draw Zone on Map
          </button>
        </div>
      )}

      {/* Map Legend */}
      <MapLegend />

      {/* Map Controls */}
      {showControls && <MapLayerControl />}

      {/* Overlap-Free Map Side Drawer */}
      <MapSideDrawer />
    </div>
  );
}

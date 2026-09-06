// ============================================================
// IBVAP — Main Application State Store (Zustand)
// ============================================================
import { create } from 'zustand';
import type {
  Camera, Zone, Person, TrackPoint, IBVAPEvent,
  Alert, SystemStats, MapLayer, MapInteractionMode, CameraCalibration
} from '../types';
import { DEMO_CAMERAS, DEMO_ZONES } from '../data/demoData';

interface AppState {
  // Data
  cameras: Camera[];
  zones: Zone[];
  persons: Person[];
  tracks: Record<string, TrackPoint[]>;
  events: IBVAPEvent[];
  alerts: Alert[];
  stats: SystemStats;
  calibrations: Record<string, CameraCalibration>;

  // UI & Map Interaction State
  mapMode: MapInteractionMode;
  draftCamera: Partial<Camera>;
  draftZone: Partial<Zone>;
  selectedCameraId: string | null;
  selectedZoneId: string | null;
  selectedPersonId: string | null;
  selectedAlertId: string | null;
  selectedEventId: string | null;
  sidebarOpen: boolean;
  activePage: string;
  mapCenter: [number, number];
  mapZoom: number;
  demoRunning: boolean;
  demoStep: number;

  // Map layers
  layers: MapLayer[];

  // Actions — Map Mode & Placement
  setMapMode: (mode: MapInteractionMode) => void;
  setDraftCamera: (cam: Partial<Camera>) => void;
  updateDraftCamera: (updates: Partial<Camera>) => void;
  saveDraftCamera: () => void;
  openEditCameraOnMap: (cam: Camera) => void;

  setDraftZone: (zone: Partial<Zone>) => void;
  updateDraftZone: (updates: Partial<Zone>) => void;
  addDraftZonePoint: (pt: { lat: number; lng: number }) => void;
  clearDraftZonePoints: () => void;
  saveDraftZone: () => void;
  openEditZoneOnMap: (zone: Zone) => void;

  // Actions — Cameras
  addCamera: (camera: Camera) => void;
  updateCamera: (id: string, updates: Partial<Camera>) => void;
  removeCamera: (id: string) => void;

  // Actions — Zones
  addZone: (zone: Zone) => void;
  updateZone: (id: string, updates: Partial<Zone>) => void;
  removeZone: (id: string) => void;

  // Actions — Calibration
  saveCalibration: (cal: CameraCalibration) => void;

  // Actions — Persons & Tracks
  upsertPerson: (person: Person) => void;
  addTrackPoint: (point: TrackPoint) => void;

  // Actions — Events & Alerts
  addEvent: (event: IBVAPEvent) => void;
  addAlert: (alert: Alert) => void;
  acknowledgeAlert: (id: string) => void;

  // Actions — UI
  setSelectedCamera: (id: string | null) => void;
  setSelectedZone: (id: string | null) => void;
  setSelectedPerson: (id: string | null) => void;
  setSelectedAlert: (id: string | null) => void;
  setSelectedEvent: (id: string | null) => void;
  setSidebarOpen: (open: boolean) => void;
  setActivePage: (page: string) => void;
  setMapCenter: (center: [number, number]) => void;
  setMapZoom: (zoom: number) => void;
  setDemoRunning: (running: boolean) => void;
  setDemoStep: (step: number) => void;
  toggleLayer: (layerId: string) => void;
  updateStats: (stats: Partial<SystemStats>) => void;
}

const INITIAL_LAYERS: MapLayer[] = [
  { id: 'cameras', name: 'Cameras', visible: true },
  { id: 'camera-coverage', name: 'Camera Coverage', visible: true },
  { id: 'zones-safe', name: 'Safe Zones', visible: true },
  { id: 'zones-monitoring', name: 'Monitoring Zones', visible: true },
  { id: 'zones-restricted', name: 'Restricted Zones', visible: true },
  { id: 'zones-danger', name: 'Danger Zones', visible: true },
  { id: 'persons', name: 'Persons', visible: true },
  { id: 'trajectories', name: 'Trajectories', visible: true },
  { id: 'alerts', name: 'Alert Markers', visible: true },
  { id: 'borders', name: 'Zone Borders', visible: true },
];

const INITIAL_STATS: SystemStats = {
  camerasOnline: 4,
  camerasTotal: 4,
  activePersons: 0,
  activeAlerts: 0,
  zoneIntrusions: 0,
  systemStatus: 'online',
  demoMode: true,
  uptime: '00:00:00',
};

const DEFAULT_DRAFT_CAM: Partial<Camera> = {
  id: 'CAM-05',
  name: 'Main Entrance Camera',
  lat: 18.5204,
  lng: 73.8567,
  direction: 90,
  fov: 70,
  range: 150,
  status: 'online',
  type: 'fixed',
  videoSource: 'demo',
  calibrationValid: true,
  fps: 25,
};

const DEFAULT_DRAFT_ZONE: Partial<Zone> = {
  id: 'ZONE-05',
  name: 'Main Entrance Danger Zone',
  type: 'danger',
  priority: 'critical',
  status: 'active',
  description: 'Camera coverage intrusion zone',
  coordinates: [],
  linkedCameraIds: [],
};

export const useAppStore = create<AppState>((set, get) => ({
  cameras: DEMO_CAMERAS,
  zones: DEMO_ZONES,
  persons: [],
  tracks: {},
  events: [],
  alerts: [],
  stats: INITIAL_STATS,
  calibrations: {},

  mapMode: 'NORMAL',
  draftCamera: DEFAULT_DRAFT_CAM,
  draftZone: DEFAULT_DRAFT_ZONE,
  selectedCameraId: null,
  selectedZoneId: null,
  selectedPersonId: null,
  selectedAlertId: null,
  selectedEventId: null,
  sidebarOpen: true,
  activePage: 'dashboard',
  mapCenter: [18.5204, 73.8567],
  mapZoom: 16,
  demoRunning: false,
  demoStep: 0,
  layers: INITIAL_LAYERS,

  setMapMode: (mode) => set({ mapMode: mode }),
  setDraftCamera: (cam) => set({ draftCamera: { ...DEFAULT_DRAFT_CAM, ...cam } }),
  updateDraftCamera: (updates) => set(s => ({ draftCamera: { ...s.draftCamera, ...updates } })),
  saveDraftCamera: () => {
    const { draftCamera, cameras, mapMode } = get();
    if (!draftCamera.id || !draftCamera.name || !draftCamera.lat || !draftCamera.lng) return;
    
    const camToSave: Camera = {
      id: draftCamera.id,
      name: draftCamera.name,
      lat: draftCamera.lat,
      lng: draftCamera.lng,
      direction: draftCamera.direction ?? 90,
      fov: draftCamera.fov ?? 70,
      range: draftCamera.range ?? 150,
      status: draftCamera.status ?? 'online',
      type: draftCamera.type ?? 'fixed',
      videoSource: draftCamera.videoSource ?? 'demo',
      fps: draftCamera.fps ?? 25,
      calibrationValid: draftCamera.calibrationValid ?? true,
      description: draftCamera.description ?? '',
      createdAt: new Date().toISOString(),
    };

    if (mapMode === 'EDIT_CAMERA') {
      set(s => ({
        cameras: s.cameras.map(c => c.id === camToSave.id ? camToSave : c),
        mapMode: 'NORMAL',
        stats: { ...s.stats, camerasOnline: s.cameras.filter(c => c.status === 'online').length }
      }));
    } else {
      set(s => ({
        cameras: [...s.cameras.filter(c => c.id !== camToSave.id), camToSave],
        mapMode: 'NORMAL',
        stats: { ...s.stats, camerasTotal: s.cameras.length + 1, camerasOnline: s.cameras.filter(c => c.status === 'online').length + 1 }
      }));
    }
  },

  openEditCameraOnMap: (cam) => set({
    draftCamera: cam,
    mapMode: 'EDIT_CAMERA',
    mapCenter: [cam.lat, cam.lng]
  }),

  setDraftZone: (zone) => set({ draftZone: { ...DEFAULT_DRAFT_ZONE, ...zone } }),
  updateDraftZone: (updates) => set(s => ({ draftZone: { ...s.draftZone, ...updates } })),
  addDraftZonePoint: (pt) => set(s => ({
    draftZone: {
      ...s.draftZone,
      coordinates: [...(s.draftZone.coordinates ?? []), pt]
    }
  })),
  clearDraftZonePoints: () => set(s => ({
    draftZone: { ...s.draftZone, coordinates: [] }
  })),
  saveDraftZone: () => {
    const { draftZone, mapMode } = get();
    if (!draftZone.id || !draftZone.name || !draftZone.coordinates || draftZone.coordinates.length < 3) return;

    const zoneToSave: Zone = {
      id: draftZone.id,
      name: draftZone.name,
      type: draftZone.type ?? 'restricted',
      priority: draftZone.priority ?? (draftZone.type === 'danger' ? 'critical' : draftZone.type === 'restricted' ? 'high' : 'medium'),
      status: 'active',
      description: draftZone.description ?? '',
      coordinates: draftZone.coordinates,
      linkedCameraIds: draftZone.linkedCameraIds ?? [],
    };

    if (mapMode === 'EDIT_ZONE') {
      set(s => ({
        zones: s.zones.map(z => z.id === zoneToSave.id ? zoneToSave : z),
        mapMode: 'NORMAL'
      }));
    } else {
      set(s => ({
        zones: [...s.zones.filter(z => z.id !== zoneToSave.id), zoneToSave],
        mapMode: 'NORMAL'
      }));
    }
  },

  openEditZoneOnMap: (zone) => set({
    draftZone: zone,
    mapMode: 'EDIT_ZONE',
    mapCenter: zone.coordinates[0] ? [zone.coordinates[0].lat, zone.coordinates[0].lng] : [18.5204, 73.8567]
  }),

  addCamera: (camera) => set((s) => ({
    cameras: [...s.cameras.filter(c => c.id !== camera.id), camera],
    stats: { ...s.stats, camerasTotal: s.cameras.length + 1 }
  })),
  updateCamera: (id, updates) => set((s) => ({
    cameras: s.cameras.map(c => c.id === id ? { ...c, ...updates } : c)
  })),
  removeCamera: (id) => set((s) => ({ cameras: s.cameras.filter(c => c.id !== id) })),

  addZone: (zone) => set((s) => ({ zones: [...s.zones.filter(z => z.id !== zone.id), zone] })),
  updateZone: (id, updates) => set((s) => ({
    zones: s.zones.map(z => z.id === id ? { ...z, ...updates } : z)
  })),
  removeZone: (id) => set((s) => ({ zones: s.zones.filter(z => z.id !== id) })),

  saveCalibration: (cal) => set(s => ({
    calibrations: { ...s.calibrations, [cal.cameraId]: cal },
    cameras: s.cameras.map(c => c.id === cal.cameraId ? { ...c, calibrationValid: cal.valid } : c)
  })),

  upsertPerson: (person) => set((s) => {
    const existing = s.persons.findIndex(p => p.id === person.id);
    if (existing >= 0) {
      const updated = [...s.persons];
      updated[existing] = { ...updated[existing], ...person };
      return { persons: updated };
    }
    return { persons: [...s.persons, person] };
  }),

  addTrackPoint: (point) => set((s) => {
    const existing = s.tracks[point.personId] || [];
    return { tracks: { ...s.tracks, [point.personId]: [...existing, point] } };
  }),

  addEvent: (event) => set((s) => ({ events: [event, ...s.events] })),

  addAlert: (alert) => set((s) => ({
    alerts: [alert, ...s.alerts],
    stats: { ...s.stats, activeAlerts: s.stats.activeAlerts + 1 }
  })),

  acknowledgeAlert: (id) => set((s) => ({
    alerts: s.alerts.map(a => a.id === id
      ? { ...a, status: 'acknowledged' as const, acknowledgedAt: new Date().toISOString() }
      : a
    ),
    stats: {
      ...s.stats,
      activeAlerts: Math.max(0, s.stats.activeAlerts - 1)
    }
  })),

  setSelectedCamera: (id) => set({ selectedCameraId: id }),
  setSelectedZone: (id) => set({ selectedZoneId: id }),
  setSelectedPerson: (id) => set({ selectedPersonId: id }),
  setSelectedAlert: (id) => set({ selectedAlertId: id }),
  setSelectedEvent: (id) => set({ selectedEventId: id }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActivePage: (page) => set({ activePage: page }),
  setMapCenter: (center) => set({ mapCenter: center }),
  setMapZoom: (zoom) => set({ mapZoom: zoom }),
  setDemoRunning: (running) => set({ demoRunning: running }),
  setDemoStep: (step) => set({ demoStep: step }),
  toggleLayer: (layerId) => set((s) => ({
    layers: s.layers.map(l => l.id === layerId ? { ...l, visible: !l.visible } : l)
  })),
  updateStats: (stats) => set((s) => ({ stats: { ...s.stats, ...stats } })),
}));

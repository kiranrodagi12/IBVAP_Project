// ============================================================
// IBVAP — Main Application State Store (Zustand)
// ============================================================
import { create } from 'zustand';
import type {
  Camera, Zone, Person, TrackPoint, IBVAPEvent,
  Alert, SystemStats, MapLayer
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

  // UI state
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

  // Actions — Cameras
  addCamera: (camera: Camera) => void;
  updateCamera: (id: string, updates: Partial<Camera>) => void;
  removeCamera: (id: string) => void;

  // Actions — Zones
  addZone: (zone: Zone) => void;
  updateZone: (id: string, updates: Partial<Zone>) => void;
  removeZone: (id: string) => void;

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

export const useAppStore = create<AppState>((set, get) => ({
  cameras: DEMO_CAMERAS,
  zones: DEMO_ZONES,
  persons: [],
  tracks: {},
  events: [],
  alerts: [],
  stats: INITIAL_STATS,

  selectedCameraId: null,
  selectedZoneId: null,
  selectedPersonId: null,
  selectedAlertId: null,
  selectedEventId: null,
  sidebarOpen: true,
  activePage: 'dashboard',
  mapCenter: [31.604, 74.512],
  mapZoom: 15,
  demoRunning: false,
  demoStep: 0,
  layers: INITIAL_LAYERS,

  addCamera: (camera) => set((s) => ({ cameras: [...s.cameras, camera] })),
  updateCamera: (id, updates) => set((s) => ({
    cameras: s.cameras.map(c => c.id === id ? { ...c, ...updates } : c)
  })),
  removeCamera: (id) => set((s) => ({ cameras: s.cameras.filter(c => c.id !== id) })),

  addZone: (zone) => set((s) => ({ zones: [...s.zones, zone] })),
  updateZone: (id, updates) => set((s) => ({
    zones: s.zones.map(z => z.id === id ? { ...z, ...updates } : z)
  })),
  removeZone: (id) => set((s) => ({ zones: s.zones.filter(z => z.id !== id) })),

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

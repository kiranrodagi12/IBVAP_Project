// ============================================================
// IBVAP — API Service Layer
// Communicates with FastAPI backend
// Falls back to demo data when backend is unavailable
// ============================================================
import type { Camera, Zone, Person, IBVAPEvent, Alert } from '../types';

const BASE_URL = '/api';

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const resp = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!resp.ok) throw new Error(`API ${resp.status}: ${resp.statusText}`);
  return resp.json() as Promise<T>;
}

// ---- Cameras ----
export const camerasApi = {
  list: () => fetchJson<Camera[]>('/cameras'),
  get: (id: string) => fetchJson<Camera>(`/cameras/${id}`),
  create: (data: Omit<Camera, 'id'>) => fetchJson<Camera>('/cameras', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Camera>) => fetchJson<Camera>(`/cameras/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchJson<{ ok: boolean }>(`/cameras/${id}`, { method: 'DELETE' }),
};

// ---- Zones ----
export const zonesApi = {
  list: () => fetchJson<Zone[]>('/zones'),
  get: (id: string) => fetchJson<Zone>(`/zones/${id}`),
  create: (data: Omit<Zone, 'id'>) => fetchJson<Zone>('/zones', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Zone>) => fetchJson<Zone>(`/zones/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchJson<{ ok: boolean }>(`/zones/${id}`, { method: 'DELETE' }),
};

// ---- Persons ----
export const personsApi = {
  list: () => fetchJson<Person[]>('/persons'),
  get: (id: string) => fetchJson<Person>(`/persons/${id}`),
  tracks: (personId: string) => fetchJson<{ personId: string; points: object[] }>(`/tracks/${personId}`),
};

// ---- Events ----
export const eventsApi = {
  list: (params?: { limit?: number; offset?: number; type?: string }) =>
    fetchJson<IBVAPEvent[]>(`/events?${new URLSearchParams(params as Record<string, string>).toString()}`),
  get: (id: string) => fetchJson<IBVAPEvent>(`/events/${id}`),
};

// ---- Alerts ----
export const alertsApi = {
  list: () => fetchJson<Alert[]>('/alerts'),
  acknowledge: (id: string) => fetchJson<Alert>(`/alerts/${id}/acknowledge`, { method: 'POST' }),
};

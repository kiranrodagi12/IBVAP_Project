// ============================================================
// IBVAP — Demo Mode Hook
// Simulates person tracking, zone crossing, and alert generation
// ============================================================
import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { DEMO_PERSON_PATH } from '../data/demoData';
import { findZoneForPoint, detectZoneCrossing } from '../utils/geo';
import type { Person, IBVAPEvent, Alert, TrackPoint } from '../types';

const STEP_INTERVAL_MS = 3000; // one step every 3 seconds

let eventCounter = 0;
let alertCounter = 0;

function generateId(prefix: string) {
  return `${prefix}-${String(++eventCounter).padStart(4, '0')}`;
}

export function useDemo() {
  const {
    demoRunning, demoStep,
    zones, persons,
    setDemoRunning, setDemoStep,
    upsertPerson, addTrackPoint,
    addEvent, addAlert, updateStats, setMapCenter,
  } = useAppStore();

  const previousZoneTypeRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const processStep = useCallback((step: number) => {
    if (step >= DEMO_PERSON_PATH.length) {
      setDemoRunning(false);
      return;
    }

    const point = DEMO_PERSON_PATH[step];
    const latLng = { lat: point.lat, lng: point.lng };

    // Find current zone
    const currentZone = findZoneForPoint(latLng, zones);
    const currentZoneType = currentZone?.type ?? null;
    const prevZoneType = previousZoneTypeRef.current;

    // Update or create person
    const person: Person = {
      id: 'P-17',
      trackId: 17,
      currentLat: point.lat,
      currentLng: point.lng,
      currentZoneId: currentZone?.id,
      currentCameraId: point.cameraId,
      firstSeen: DEMO_PERSON_PATH[0].timestamp,
      lastSeen: point.timestamp,
      locationStatus: 'simulated',
      confidence: point.confidence,
      isActive: true,
    };
    upsertPerson(person);
    addTrackPoint(point);

    // Update map center
    setMapCenter([point.lat, point.lng]);

    // Detect zone crossing
    const crossingType = detectZoneCrossing(prevZoneType, currentZoneType);
    previousZoneTypeRef.current = currentZoneType;

    if (crossingType) {
      const eventId = generateId('EVT');
      const alertId = generateId('ALT');
      const now = new Date().toISOString();

      // Determine priority
      let priority: Alert['priority'] = 'low';
      let message = '';

      if (crossingType === 'danger_intrusion') {
        priority = 'critical';
        message = `🚨 CRITICAL: Person #17 entered DANGER zone — ${currentZone?.name}`;
      } else if (crossingType === 'restricted_intrusion') {
        priority = 'high';
        message = `⚠️ HIGH: Person #17 entered RESTRICTED zone — ${currentZone?.name}`;
      } else if (crossingType === 'border_crossed') {
        priority = 'high';
        message = `⚠️ HIGH: Person #17 crossed boundary into ${currentZone?.name}`;
      } else {
        priority = 'medium';
        message = `Person #17 entered ${currentZone?.name ?? 'monitored zone'}`;
      }

      const event: IBVAPEvent = {
        id: eventId,
        type: crossingType,
        personId: 'P-17',
        cameraId: point.cameraId,
        zoneId: currentZone?.id,
        zoneName: currentZone?.name,
        lat: point.lat,
        lng: point.lng,
        timestamp: now,
        confidence: point.confidence,
        locationStatus: 'simulated',
        description: message,
        acknowledged: false,
        alertId,
      };

      const alert: Alert = {
        id: alertId,
        eventId,
        priority,
        status: 'active',
        type: crossingType,
        personId: 'P-17',
        cameraId: point.cameraId,
        zoneId: currentZone?.id,
        zoneName: currentZone?.name,
        lat: point.lat,
        lng: point.lng,
        timestamp: now,
        message,
        confidence: point.confidence,
      };

      addEvent(event);
      addAlert(alert);

      updateStats({
        zoneIntrusions: useAppStore.getState().stats.zoneIntrusions + 1,
      });
    }

    // Always add detection event for first step
    if (step === 0) {
      addEvent({
        id: generateId('EVT'),
        type: 'person_detected',
        personId: 'P-17',
        cameraId: point.cameraId,
        zoneId: currentZone?.id,
        zoneName: currentZone?.name,
        lat: point.lat,
        lng: point.lng,
        timestamp: new Date().toISOString(),
        confidence: point.confidence,
        locationStatus: 'simulated',
        description: 'Person #17 detected by CAM-01',
        acknowledged: false,
      });

      addAlert({
        id: generateId('ALT'),
        eventId: generateId('EVT'),
        priority: 'low',
        status: 'active',
        type: 'person_detected',
        personId: 'P-17',
        cameraId: point.cameraId,
        zoneId: currentZone?.id,
        zoneName: currentZone?.name,
        lat: point.lat,
        lng: point.lng,
        timestamp: new Date().toISOString(),
        message: 'Person #17 detected — monitoring',
        confidence: point.confidence,
      });
    }

    updateStats({ activePersons: 1 });
  }, [zones, upsertPerson, addTrackPoint, addEvent, addAlert, updateStats, setMapCenter, setDemoRunning]);

  const startDemo = useCallback(() => {
    // Reset state
    useAppStore.setState({
      persons: [],
      tracks: {},
      events: [],
      alerts: [],
      demoStep: 0,
    });
    previousZoneTypeRef.current = null;
    eventCounter = 0;
    alertCounter = 0;

    setDemoRunning(true);
    setDemoStep(0);
  }, [setDemoRunning, setDemoStep]);

  const stopDemo = useCallback(() => {
    setDemoRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [setDemoRunning]);

  const resetDemo = useCallback(() => {
    stopDemo();
    useAppStore.setState({
      persons: [],
      tracks: {},
      events: [],
      alerts: [],
      demoStep: 0,
      stats: {
        camerasOnline: 4,
        camerasTotal: 4,
        activePersons: 0,
        activeAlerts: 0,
        zoneIntrusions: 0,
        systemStatus: 'online',
        demoMode: true,
        uptime: '00:00:00',
      }
    });
    previousZoneTypeRef.current = null;
  }, [stopDemo]);

  useEffect(() => {
    if (demoRunning) {
      processStep(demoStep);
      timerRef.current = setInterval(() => {
        setDemoStep(useAppStore.getState().demoStep + 1);
      }, STEP_INTERVAL_MS);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [demoRunning]);

  useEffect(() => {
    if (demoRunning && demoStep > 0) {
      processStep(demoStep);
      if (demoStep >= DEMO_PERSON_PATH.length - 1) {
        setDemoRunning(false);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }
  }, [demoStep, demoRunning, processStep, setDemoRunning]);

  return { startDemo, stopDemo, resetDemo, demoRunning, demoStep, totalSteps: DEMO_PERSON_PATH.length };
}

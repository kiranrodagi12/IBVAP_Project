import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { MapPage } from './pages/MapPage';
import { CamerasPage } from './pages/CamerasPage';
import { ZonesPage } from './pages/ZonesPage';
import { AlertsPage } from './pages/AlertsPage';
import { EventsPage } from './pages/EventsPage';
import { PeoplePage } from './pages/PeoplePage';
import { CalibrationPage } from './pages/CalibrationPage';
import { SettingsPage } from './pages/SettingsPage';
import { SystemHealthPage } from './pages/SystemHealthPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/cameras" element={<CamerasPage />} />
          <Route path="/zones" element={<ZonesPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventsPage />} />
          <Route path="/people" element={<PeoplePage />} />
          <Route path="/calibration" element={<CalibrationPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/health" element={<SystemHealthPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

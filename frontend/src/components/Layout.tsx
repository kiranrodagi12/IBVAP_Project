import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Map, Camera, Layers, Bell,
  Calendar, Users, Crosshair, Settings, Activity,
  Shield, Menu, X, Wifi, WifiOff, AlertTriangle
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useWebSocket } from '../hooks/useWebSocket';
import { useDemo } from '../hooks/useDemo';
import { clsx } from 'clsx';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/map', label: 'Live Map', icon: Map },
  { path: '/cameras', label: 'Cameras', icon: Camera },
  { path: '/zones', label: 'Zones', icon: Layers },
  { path: '/alerts', label: 'Alerts', icon: Bell, badge: true },
  { path: '/events', label: 'Events', icon: Calendar },
  { path: '/people', label: 'People', icon: Users },
  { path: '/calibration', label: 'Calibration', icon: Crosshair },
  { path: '/health', label: 'System Health', icon: Activity },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarOpen, setSidebarOpen, alerts, stats } = useAppStore();
  const { connected } = useWebSocket();
  const { startDemo, stopDemo, resetDemo, demoRunning, demoStep, totalSteps } = useDemo();

  const activeAlerts = alerts.filter(a => a.status === 'active').length;
  const criticalAlerts = alerts.filter(a => a.status === 'active' && a.priority === 'critical').length;

  return (
    <div className="flex h-screen bg-surface-950 overflow-hidden">
      {/* Sidebar */}
      <aside className={clsx(
        'flex-shrink-0 flex flex-col bg-surface-900 border-r border-surface-700/50 transition-all duration-300 z-20',
        sidebarOpen ? 'w-60' : 'w-16'
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-surface-700/50 h-16">
          <Shield className="w-7 h-7 text-brand-400 flex-shrink-0" />
          {sidebarOpen && (
            <div>
              <div className="text-white font-bold text-sm tracking-wider">IBVAP</div>
              <div className="text-surface-200/50 text-[10px] tracking-widest font-mono">BORDER ANALYTICS</div>
            </div>
          )}
          <button
            className="ml-auto text-surface-200/50 hover:text-white transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-2 overflow-y-auto">
          {NAV_ITEMS.map(({ path, label, icon: Icon, badge }) => {
            const isActive = location.pathname === path || location.pathname.startsWith(path + '/');
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={clsx(
                  'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all relative group',
                  isActive
                    ? 'bg-brand-500/15 text-brand-400 border-r-2 border-brand-400'
                    : 'text-surface-200/60 hover:text-white hover:bg-surface-800/50'
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {sidebarOpen && <span className="truncate">{label}</span>}
                {badge && activeAlerts > 0 && (
                  <span className={clsx(
                    'ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full flex-shrink-0',
                    criticalAlerts > 0 ? 'bg-red-500 text-white animate-pulse' : 'bg-orange-500 text-white'
                  )}>
                    {activeAlerts}
                  </span>
                )}
                {!sidebarOpen && (
                  <div className="absolute left-16 bg-surface-800 text-white text-xs px-2 py-1 rounded
                    opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Demo controls */}
        <div className="border-t border-surface-700/50 p-3">
          {sidebarOpen ? (
            <div className="space-y-2">
              <div className="text-xs text-surface-200/40 font-mono uppercase tracking-wider">Demo Mode</div>
              <div className="flex gap-1.5">
                <button
                  onClick={demoRunning ? stopDemo : startDemo}
                  className={clsx(
                    'flex-1 text-xs py-1.5 px-2 rounded font-medium transition-colors',
                    demoRunning
                      ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                      : 'bg-brand-500/20 text-brand-400 hover:bg-brand-500/30'
                  )}
                >
                  {demoRunning ? '⏸ Pause' : '▶ Start'}
                </button>
                <button
                  onClick={resetDemo}
                  className="text-xs py-1.5 px-2 rounded bg-surface-700/50 text-surface-200/60 hover:text-white transition-colors"
                >
                  ↺
                </button>
              </div>
              {demoRunning && (
                <div className="w-full bg-surface-700/50 rounded-full h-1">
                  <div
                    className="bg-brand-400 h-1 rounded-full transition-all"
                    style={{ width: `${(demoStep / (totalSteps - 1)) * 100}%` }}
                  />
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={demoRunning ? stopDemo : startDemo}
              className={clsx(
                'w-full flex justify-center p-2 rounded transition-colors',
                demoRunning ? 'text-orange-400' : 'text-brand-400 hover:bg-brand-500/20'
              )}
              title={demoRunning ? 'Pause Demo' : 'Start Demo'}
            >
              {demoRunning ? '⏸' : '▶'}
            </button>
          )}
        </div>

        {/* Connection status */}
        <div className="border-t border-surface-700/50 px-4 py-3 flex items-center gap-2">
          {connected
            ? <Wifi className="w-3 h-3 text-green-400" />
            : <WifiOff className="w-3 h-3 text-red-400" />
          }
          {sidebarOpen && (
            <span className={clsx('text-xs font-mono', connected ? 'text-green-400' : 'text-red-400')}>
              {connected ? 'BACKEND LIVE' : 'DEMO ONLY'}
            </span>
          )}
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-surface-700/50 bg-surface-900/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-white font-semibold text-sm tracking-wider">
              INTELLIGENT BORDER VIDEO ANALYTICS PLATFORM
            </h1>
            {stats.demoMode && (
              <span className="text-xs bg-brand-500/20 text-brand-400 border border-brand-500/30 px-2 py-0.5 rounded font-mono">
                DEMO MODE
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {criticalAlerts > 0 && (
              <div className="flex items-center gap-1.5 bg-red-500/15 border border-red-500/30 px-3 py-1.5 rounded alert-critical-pulse">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span className="text-red-400 text-xs font-bold">{criticalAlerts} CRITICAL</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="status-dot online" />
              <span className="text-green-400">SYSTEM ONLINE</span>
            </div>
            <div className="text-surface-200/40 text-xs font-mono">
              {new Date().toLocaleTimeString('en-IN', { hour12: false })}
            </div>
          </div>
        </header>

        {/* Critical alert banner */}
        {criticalAlerts > 0 && (
          <div className="bg-red-950/60 border-b border-red-500/30 px-6 py-2 flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
            <span className="text-red-300 text-xs font-mono">
              🚨 {alerts.filter(a => a.status === 'active' && a.priority === 'critical')[0]?.message}
            </span>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

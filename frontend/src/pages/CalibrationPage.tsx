import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Info, Check, RefreshCw, Crosshair, Calculator } from 'lucide-react';
import type { CalibrationPoint } from '../types';
import { computeHomographyFromPoints } from '../utils/geo';

const INITIAL_POINTS: CalibrationPoint[] = [
  { imageX: 350, imageY: 700, worldX: 0, worldY: 0, lat: 18.520400, lng: 73.856700, label: 'Pt 1 (Top-Left Ground)' },
  { imageX: 1500, imageY: 700, worldX: 10, worldY: 0, lat: 18.520400, lng: 73.856790, label: 'Pt 2 (Top-Right Ground)' },
  { imageX: 1250, imageY: 400, worldX: 10, worldY: 15, lat: 18.520535, lng: 73.856790, label: 'Pt 3 (Bottom-Right Ground)' },
  { imageX: 500, imageY: 400, worldX: 0, worldY: 15, lat: 18.520535, lng: 73.856700, label: 'Pt 4 (Bottom-Left Ground)' },
];

export function CalibrationPage() {
  const { cameras, saveCalibration, calibrations } = useAppStore();
  const [selectedCamId, setSelectedCamId] = useState<string>(cameras[0]?.id ?? 'CAM-01');
  const [points, setPoints] = useState<CalibrationPoint[]>(INITIAL_POINTS);
  const [computedMatrix, setComputedMatrix] = useState<number[][] | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const selectedCam = cameras.find(c => c.id === selectedCamId);
  const currentCal = calibrations[selectedCamId];

  const handlePointChange = (idx: number, field: keyof CalibrationPoint, val: number) => {
    setPoints(prev => prev.map((p, i) => i === idx ? { ...p, [field]: val } : p));
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 1920);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 1080);
    
    // Update first point or cycle through
    setPoints(prev => {
      const next = [...prev];
      next[0] = { ...next[0], imageX: x, imageY: y };
      return next;
    });
  };

  const handleCalculate = () => {
    const matrix = computeHomographyFromPoints(points);
    setComputedMatrix(matrix);
  };

  const handleSave = () => {
    const matrix = computedMatrix || computeHomographyFromPoints(points);
    if (!matrix) return;

    saveCalibration({
      cameraId: selectedCamId,
      imageWidth: 1920,
      imageHeight: 1080,
      points,
      homographyMatrix: matrix,
      referenceLatitude: selectedCam?.lat ?? 18.5204,
      referenceLongitude: selectedCam?.lng ?? 73.8567,
      valid: true,
      calibratedAt: new Date().toISOString(),
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Camera Calibration & Planar Homography</h1>
          <p className="text-xs text-surface-200/50">Map CCTV image pixels (X, Y) to real-world ground coordinates and Geo Lat/Lng</p>
        </div>
        
        {/* Camera Selector */}
        <div className="flex items-center gap-2 bg-surface-800 border border-surface-700/60 rounded-lg p-1">
          <span className="text-xs text-surface-200/60 pl-2">Select Camera:</span>
          <select
            value={selectedCamId}
            onChange={e => {
              setSelectedCamId(e.target.value);
              setComputedMatrix(null);
            }}
            className="bg-surface-900 border border-surface-700/50 rounded text-xs text-white px-3 py-1 font-mono font-bold"
          >
            {cameras.map(c => (
              <option key={c.id} value={c.id}>{c.id} — {c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-brand-200/90 leading-relaxed">
          <strong>Homography Pipeline:</strong> Select 4 reference points on the CCTV frame and pair them with known ground meters/Geo coordinates.
          The computed 3x3 homography matrix transforms detected YOLO person foot-pixels <code>((x1+x2)/2, y2)</code> into real-world geographic coordinates on the Live Map.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CCTV Frame Simulator */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-surface-200/60">
            <span>Live Feed Simulator: {selectedCam?.name} (1920x1080 px)</span>
            <span className="text-brand-400">Click frame to set Point 1 pixel X/Y</span>
          </div>

          <div
            onClick={handleCanvasClick}
            className="relative w-full aspect-video bg-surface-900 border-2 border-surface-700/60 rounded-xl overflow-hidden cursor-crosshair shadow-2xl group flex items-center justify-center"
          >
            {/* Grid Lines */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px] opacity-40 pointer-events-none" />

            {/* Simulated Ground Quadrilateral */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <polygon
                points={points.map(p => `${(p.imageX / 1920) * 100}%,${(p.imageY / 1080) * 100}%`).join(' ')}
                fill="rgba(14, 165, 233, 0.15)"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeDasharray="4,4"
              />
            </svg>

            {/* Clickable Calibration Points */}
            {points.map((pt, idx) => (
              <div
                key={idx}
                style={{
                  left: `${(pt.imageX / 1920) * 100}%`,
                  top: `${(pt.imageY / 1080) * 100}%`
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 group/pt"
              >
                <div className="w-5 h-5 rounded-full bg-brand-500 text-white font-mono text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-lg shadow-brand-500/50">
                  {idx + 1}
                </div>
                <span className="bg-surface-900/90 text-white text-[10px] font-mono px-1.5 py-0.5 rounded border border-surface-700 pointer-events-none shadow">
                  ({pt.imageX}, {pt.imageY} px)
                </span>
              </div>
            ))}

            <div className="absolute bottom-3 left-3 bg-surface-950/80 backdrop-blur-sm text-surface-200/60 text-[11px] font-mono px-2.5 py-1 rounded border border-surface-800">
              📷 {selectedCamId} • Lat: {selectedCam?.lat.toFixed(5)} • Lng: {selectedCam?.lng.toFixed(5)}
            </div>
          </div>
        </div>

        {/* Calibration Controls & Points Table */}
        <div className="space-y-4">
          <div className="bg-surface-800/60 border border-surface-700/40 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-surface-700/40 pb-2">
              <h2 className="text-sm font-semibold text-white flex items-center gap-1.5">
                <Crosshair className="w-4 h-4 text-brand-400" /> Ground Control Points
              </h2>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                selectedCam?.calibrationValid || currentCal?.valid
                  ? 'bg-green-500/15 text-green-400 border-green-500/25'
                  : 'bg-red-500/15 text-red-400 border-red-500/25'
              }`}>
                {selectedCam?.calibrationValid || currentCal?.valid ? 'CALIBRATED' : 'NOT CALIBRATED'}
              </span>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {points.map((pt, idx) => (
                <div key={idx} className="bg-surface-850 p-2.5 rounded-lg border border-surface-750 text-xs space-y-1.5">
                  <div className="font-semibold text-white font-mono text-[11px] flex justify-between">
                    <span>Point {idx + 1}: {pt.label}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-surface-200/40 block">Image X (px)</span>
                      <input
                        type="number"
                        value={pt.imageX}
                        onChange={e => handlePointChange(idx, 'imageX', parseInt(e.target.value) || 0)}
                        className="w-full bg-surface-900 border border-surface-700/50 rounded px-2 py-1 text-white font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-surface-200/40 block">Image Y (px)</span>
                      <input
                        type="number"
                        value={pt.imageY}
                        onChange={e => handlePointChange(idx, 'imageY', parseInt(e.target.value) || 0)}
                        className="w-full bg-surface-900 border border-surface-700/50 rounded px-2 py-1 text-white font-mono text-[11px]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-surface-200/40 block">Geo Latitude</span>
                      <input
                        type="number"
                        step="0.000001"
                        value={pt.lat ?? 18.5204}
                        onChange={e => handlePointChange(idx, 'lat', parseFloat(e.target.value) || 0)}
                        className="w-full bg-surface-900 border border-surface-700/50 rounded px-2 py-1 text-white font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-surface-200/40 block">Geo Longitude</span>
                      <input
                        type="number"
                        step="0.000001"
                        value={pt.lng ?? 73.8567}
                        onChange={e => handlePointChange(idx, 'lng', parseFloat(e.target.value) || 0)}
                        className="w-full bg-surface-900 border border-surface-700/50 rounded px-2 py-1 text-white font-mono text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={handleCalculate}
                className="flex-1 py-2 px-3 bg-surface-700/50 hover:bg-surface-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                <Calculator className="w-3.5 h-3.5" /> Calculate Matrix
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2 px-3 bg-brand-500 hover:bg-brand-400 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-brand-500/20"
              >
                <Check className="w-3.5 h-3.5" /> Save Calibration
              </button>
            </div>

            {savedSuccess && (
              <div className="p-2 bg-green-500/20 text-green-300 text-xs font-mono rounded text-center border border-green-500/40">
                ✓ Homography matrix saved for {selectedCamId}!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

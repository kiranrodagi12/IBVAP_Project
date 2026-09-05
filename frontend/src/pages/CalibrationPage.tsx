import { useAppStore } from '../store/useAppStore';
import { Info } from 'lucide-react';

export function CalibrationPage() {
  const { cameras } = useAppStore();
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-lg font-semibold text-white">Camera Calibration</h1>
      <div className="bg-brand-500/10 border border-brand-500/20 rounded-lg p-4 flex gap-3">
        <Info className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-brand-200/80">
          Camera calibration maps image pixels to geographic coordinates using homography.
          Select reference points in the camera image and associate them with known geographic coordinates.
          The computed homography matrix is used to estimate the geographic position of detected persons.
          <div className="mt-2 text-brand-400/70 text-xs">Note: All position estimates are ESTIMATED unless verified ground-control points are used.</div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cameras.map(cam => (
          <div key={cam.id} className="bg-surface-800/60 border border-surface-700/40 rounded-xl p-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-bold text-white font-mono">{cam.id}</div>
                <div className="text-xs text-surface-200/50">{cam.name}</div>
              </div>
              <span className={`text-xs font-mono px-2 py-0.5 rounded border ${
                cam.calibrationValid
                  ? 'bg-green-500/15 text-green-400 border-green-500/25'
                  : 'bg-red-500/15 text-red-400 border-red-500/25'
              }`}>{cam.calibrationValid ? 'CALIBRATED' : 'NOT CALIBRATED'}</span>
            </div>
            <div className="text-xs text-surface-200/50 space-y-1">
              <div>To calibrate: Select ≥4 reference points in the camera feed,</div>
              <div>associate each with a known geographic coordinate.</div>
              <div>The system will compute the homography transformation matrix.</div>
            </div>
            <div className="mt-4">
              <div className="text-xs text-surface-200/30 font-mono mb-2">Geolocation Workflow</div>
              <div className="text-xs text-surface-200/40 font-mono space-y-0.5">
                {['YOLO Detection','Bounding Box','Foot Point','Camera Calibration','Homography','Ground Coord','Geographic Coord','Point-in-Polygon','Zone → Alert'].map((s,i) => (
                  <div key={i} className="flex items-center gap-1">
                    <span className="text-surface-200/20">{i > 0 ? '↓' : ' '}</span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
            <button className="mt-4 w-full text-xs text-surface-200/50 bg-surface-700/30 hover:bg-surface-700/50 border border-surface-700/50 rounded-lg py-2 transition-colors">
              Open Calibration Interface (requires live camera)
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

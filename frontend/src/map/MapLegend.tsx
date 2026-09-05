export function MapLegend() {
  return (
    <div className="absolute bottom-8 left-3 z-[1000] bg-surface-900/90 backdrop-blur border border-surface-700/50 rounded-lg p-3 text-xs space-y-1.5">
      <div className="text-surface-200/50 font-mono uppercase tracking-wider text-[10px] mb-2">Legend</div>
      <div className="flex items-center gap-2"><span>📷</span><span className="text-surface-200/80">Camera</span></div>
      <div className="flex items-center gap-2">
        <span className="inline-block w-5 h-2 rounded" style={{background:'#0ea5e955', border:'1px solid #38bdf8'}} />
        <span className="text-surface-200/80">Camera Coverage</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-block w-5 h-2 rounded" style={{background:'#22c55e1e', border:'1px solid #16a34a'}} />
        <span className="text-green-400">Safe Zone</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-block w-5 h-2 rounded" style={{background:'#eab3082e', border:'1px solid #ca8a04'}} />
        <span className="text-yellow-400">Monitoring</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-block w-5 h-2 rounded" style={{background:'#f9731638', border:'1px solid #ea580c'}} />
        <span className="text-orange-400">Restricted</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-block w-5 h-2 rounded" style={{background:'#ef444447', border:'1px solid #dc2626'}} />
        <span className="text-red-400">Danger Zone</span>
      </div>
      <div className="flex items-center gap-2"><span>👤</span><span className="text-surface-200/80">Person</span></div>
      <div className="flex items-center gap-2">
        <span className="inline-block w-5" style={{borderBottom:'2px dashed #0ea5e9'}} />
        <span className="text-surface-200/80">Trajectory</span>
      </div>
    </div>
  );
}

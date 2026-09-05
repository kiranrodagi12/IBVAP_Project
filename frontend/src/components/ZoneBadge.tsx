import { clsx } from 'clsx';
import type { ZoneType } from '../types';

const COLORS: Record<ZoneType, string> = {
  safe:        'bg-green-500/15 text-green-400 border-green-500/25',
  normal:      'bg-slate-500/15 text-slate-400 border-slate-500/25',
  monitoring:  'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
  restricted:  'bg-orange-500/15 text-orange-400 border-orange-500/25',
  danger:      'bg-red-500/15 text-red-400 border-red-500/25',
};

export function ZoneBadge({ type }: { type: ZoneType }) {
  return (
    <span className={clsx('text-[10px] font-bold font-mono px-2 py-0.5 rounded border uppercase tracking-wider', COLORS[type])}>
      {type}
    </span>
  );
}

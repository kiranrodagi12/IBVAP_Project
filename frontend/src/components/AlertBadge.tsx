import { clsx } from 'clsx';
import type { AlertPriority } from '../types';

const COLORS: Record<AlertPriority, string> = {
  low:      'bg-blue-500/20 text-blue-400 border-blue-500/30',
  medium:   'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  high:     'bg-orange-500/20 text-orange-400 border-orange-500/30',
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export function AlertBadge({ priority }: { priority: AlertPriority }) {
  return (
    <span className={clsx(
      'text-[10px] font-bold font-mono px-2 py-0.5 rounded border uppercase tracking-wider',
      COLORS[priority],
      priority === 'critical' && 'animate-pulse'
    )}>
      {priority}
    </span>
  );
}

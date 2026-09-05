import { clsx } from 'clsx';
import type { CameraStatus } from '../types';

const COLORS: Record<CameraStatus, string> = {
  online:      'text-green-400',
  offline:     'text-red-400',
  degraded:    'text-yellow-400',
  maintenance: 'text-blue-400',
};

export function CameraStatusBadge({ status }: { status: CameraStatus }) {
  return (
    <span className={clsx('flex items-center gap-1.5 text-xs font-mono', COLORS[status])}>
      <span className={clsx('status-dot', status)} />
      {status.toUpperCase()}
    </span>
  );
}

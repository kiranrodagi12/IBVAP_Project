import { clsx } from 'clsx';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'green' | 'blue' | 'orange' | 'red' | 'yellow' | 'default';
  sub?: string;
  pulse?: boolean;
}

const colorMap = {
  green:   { bg: 'bg-green-500/10',  border: 'border-green-500/20',  text: 'text-green-400',  icon: 'text-green-500' },
  blue:    { bg: 'bg-brand-500/10',  border: 'border-brand-500/20',  text: 'text-brand-400',  icon: 'text-brand-500' },
  orange:  { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400', icon: 'text-orange-500' },
  red:     { bg: 'bg-red-500/10',    border: 'border-red-500/20',    text: 'text-red-400',    icon: 'text-red-500' },
  yellow:  { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400', icon: 'text-yellow-500' },
  default: { bg: 'bg-surface-800',   border: 'border-surface-700/50', text: 'text-white',     icon: 'text-surface-200/60' },
};

export function StatCard({ label, value, icon: Icon, color = 'default', sub, pulse }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className={clsx(
      'rounded-lg border p-4 flex items-start justify-between',
      c.bg, c.border,
      pulse && 'animate-pulse-slow'
    )}>
      <div>
        <div className="text-surface-200/50 text-xs font-mono uppercase tracking-wider mb-2">{label}</div>
        <div className={clsx('text-3xl font-bold font-mono', c.text)}>{value}</div>
        {sub && <div className="text-xs text-surface-200/40 mt-1">{sub}</div>}
      </div>
      <Icon className={clsx('w-6 h-6 mt-1', c.icon)} />
    </div>
  );
}

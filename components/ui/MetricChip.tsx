'use client';

import { cn } from '@/lib/utils/cn';

type MetricChipProps = {
  label: string;
  value: number; // 0-100
  className?: string;
};

export function MetricChip({ label, value, className }: MetricChipProps) {
  const hue = 140 - Math.round((value / 100) * 140); // green->red
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 ui-chip text-sm',
        className,
      )}
    >
      <span className="opacity-90" title={label}>{label}</span>
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: `hsl(${hue} 70% 45%)` }}
      />
      <span className="tabular-nums opacity-90">{Math.round(value)}</span>
    </div>
  );
}



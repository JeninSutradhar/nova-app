'use client';

import { MetricChip } from '@/components/ui/MetricChip';
import type { Event, MetricsState } from '@/lib/types/game';
import { ChoiceGrid } from './ChoiceGrid';

type ScenarioCardProps = {
  event: Event;
  metrics: MetricsState;
  onChoose: (choiceId: string) => void;
};

export function ScenarioCard({ event, metrics, onChoose }: ScenarioCardProps) {
  return (
    <div className="ui-card-solid p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wider text-[color:var(--muted)]">
          Scenario
        </div>
        <div className="flex items-center gap-2 ui-chip">
          <div className="h-2 w-2 animate-pulse rounded-full" style={{ backgroundColor: 'var(--lime-700)' }}></div>
          <span className="text-xs font-medium">Active</span>
        </div>
      </div>

      <h2 className="text-3xl font-extrabold mb-3">{event.title}</h2>
      <p className="text-base leading-relaxed text-[color:var(--muted)] mb-8">
        {event.narrative}
      </p>

      <div className="mb-8 ui-card p-4">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--muted)]">
          Current Status
        </div>
        <div className="flex flex-wrap gap-2">
          <MetricChip label="Health" value={metrics.Health} />
          <MetricChip label="Mental" value={metrics.MentalWellbeing} />
          <MetricChip label="Relations" value={metrics.Relationships} />
          <MetricChip label="Academics" value={metrics.Academics} />
          <MetricChip label="Reputation" value={metrics.Reputation} />
          <MetricChip label="Stress" value={metrics.Stress} />
          <MetricChip label="Awareness" value={metrics.RiskAwareness} />
          <MetricChip label="Support" value={metrics.SupportNetwork} />
        </div>
      </div>

      <div>
        <div className="mb-4 text-sm font-semibold">What will you do?</div>
        <ChoiceGrid
          choices={event.choices as unknown as any[]}
          onSelect={(c) => onChoose(c.id)}
        />
      </div>
    </div>
  );
}

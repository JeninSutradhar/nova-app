'use client';

import { create } from 'zustand';
import type { MetricsState } from '@/lib/types/game';

export type SessionState = {
  sessionId: string | null;
  metrics: MetricsState;
  step: number;
};

const defaultMetrics: MetricsState = {
  Health: 50,
  MentalWellbeing: 50,
  Relationships: 50,
  Academics: 50,
  Reputation: 50,
  Stress: 50,
  RiskAwareness: 50,
  SupportNetwork: 50,
  Time: 0,
};

type Actions = {
  start: (sessionId: string) => void;
  applyMetricDelta: (delta: Partial<MetricsState>) => void;
  nextStep: () => void;
  reset: () => void;
};

export const useSessionStore = create<SessionState & Actions>((set) => ({
  sessionId: null,
  metrics: defaultMetrics,
  step: 0,
  start: (sessionId) => set({ sessionId, metrics: { ...defaultMetrics }, step: 0 }),
  applyMetricDelta: (delta) =>
    set((s) => ({ metrics: { ...s.metrics, ...Object.assign({}, s.metrics, delta) } })),
  nextStep: () => set((s) => ({ step: s.step + 1 })),
  reset: () => set({ sessionId: null, metrics: { ...defaultMetrics }, step: 0 }),
}));



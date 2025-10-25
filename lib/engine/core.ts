import type { ContentPack, Event as GameEvent, Choice as GameChoice, MetricsState, MetricKey, Profile, Session, Decision } from '@/lib/types/game';

export type EngineState = {
  step: number;
  metrics: MetricsState;
  profile?: Profile;
  seenEventIds: Set<string>;
  achievements: Set<string>;
  decisions: Decision[];
};

export function initEngineState(profile?: Profile, session?: Session): EngineState {
  if (session) {
    return {
      step: session.decisions?.length || 0,
      metrics: session.metrics as MetricsState,
      profile: session.profile,
      seenEventIds: new Set(session.seenEventIds || []),
      achievements: new Set(session.achievements || []),
      decisions: [...(session.decisions || [])],
    };
  }

  const defaultMetrics: MetricsState = {
    Health: 50,
    MentalWellbeing: 50,
    Relationships: 50,
    Academics: 50,
    Reputation: 50,
    Stress: 50,
    RiskAwareness: 20,
    SupportNetwork: 30,
    Time: 0,
  };

  return {
    step: 0,
    metrics: defaultMetrics,
    profile,
    seenEventIds: new Set<string>(),
    achievements: new Set<string>(),
    decisions: [],
  };
}

export function selectNextEvent(
  content: ContentPack,
  engineState: EngineState,
  options?: { avoidRepeats?: boolean }
): GameEvent | null {
  const { seenEventIds, profile } = engineState;
  const ageBand = profile?.ageBand;

  const candidates = content.events.filter((event: GameEvent) => {
    if (options?.avoidRepeats && seenEventIds.has(event.id)) {
      return false;
    }
    if (ageBand && event.ageBands && !event.ageBands.includes(ageBand)) {
      return false;
    }
    return true;
  });

  if (candidates.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex];
}

export function applyChoice(
  content: ContentPack,
  engineState: EngineState,
  eventId: string,
  choiceId: string
): { nextState: EngineState; effects: { achievement: string | null; decision: Decision } } {
  const event = content.events.find((e: GameEvent) => e.id === eventId);
  const choice = event?.choices.find((c: GameChoice) => c.id === choiceId);

  if (!choice) {
    throw new Error(`Choice ${choiceId} not found in event ${eventId}`);
  }

  // clone shallow, Sets reconstructed below
  const nextState: EngineState = {
    step: engineState.step + 1,
    metrics: { ...engineState.metrics },
    profile: engineState.profile,
    seenEventIds: new Set(engineState.seenEventIds),
    achievements: new Set(engineState.achievements),
    decisions: [...engineState.decisions],
  };
  nextState.seenEventIds.add(eventId);

  // Apply metric deltas
  if (choice.effects?.metricDeltas) {
    for (const [metric, delta] of Object.entries(choice.effects.metricDeltas)) {
      const key = metric as MetricKey;
      const current = nextState.metrics[key] ?? 0;
      const v = current + (delta as number);
      nextState.metrics[key] = Math.max(0, Math.min(100, v));
    }
  }

  // Check for achievements
  let unlockedAchievement: string | null = null;
  const achievements = content.achievements || [];
  for (const ach of achievements) {
    if (!nextState.achievements.has(ach.id)) {
      const metricOk = !ach.condition?.metric || nextState.metrics[ach.condition.metric.name] >= ach.condition.metric.threshold;
      if (metricOk) {
        nextState.achievements.add(ach.id);
        unlockedAchievement = ach.name;
        break; // at most one per turn
      }
    }
  }

  const decision: Decision = {
    eventId,
    choiceId,
    at: Date.now(),
    metricDeltas: choice.effects?.metricDeltas || {},
    achievement: unlockedAchievement,
  };
  nextState.decisions.push(decision);

  return { nextState, effects: { achievement: unlockedAchievement, decision } };
}



export type MetricKey =
  | 'Health'
  | 'MentalWellbeing'
  | 'Relationships'
  | 'Academics'
  | 'Reputation'
  | 'Stress'
  | 'RiskAwareness'
  | 'SupportNetwork'
  | 'Time';

export type MetricsState = Record<MetricKey, number>;

export type ChoiceEffect = {
  metricDeltas?: Partial<Record<MetricKey, number>>;
  addTags?: string[];
  removeTags?: string[];
  delayed?: Array<{ afterSteps: number; effect: ChoiceEffect }>;
  unlocks?: string[];
  achievement?: string; // simple string id/name for unlocked achievement
};

export type Choice = {
  id: string;
  label: string;
  hint?: string;
  effects: ChoiceEffect;
  requires?: string[]; // tags/unlocks required
};

export type Event = {
  id: string;
  title: string;
  narrative: string;
  media?: string;
  tags: string[];
  triggers?: {
    requireTags?: string[];
    excludeTags?: string[];
    metricGte?: Partial<Record<MetricKey, number>>;
    metricLte?: Partial<Record<MetricKey, number>>;
  };
  ageBands?: Array<'13-14' | '15-16' | '17-18'>;
  sensitive?: boolean;
  choices: [Choice, Choice, Choice, Choice];
};

export type Achievement = {
  id: string;
  name: string;
  condition?: {
    metric?: { name: MetricKey; threshold: number };
  };
};

export type ContentPack = {
  id: string;
  version: string;
  locale: string;
  ageBands: Array<'13-14' | '15-16' | '17-18'>;
  safeForDemo: boolean;
  events: Event[];
  achievements?: Achievement[];
  preQuiz?: QuizQuestion[];
  postQuiz?: QuizQuestion[];
};

export type Metric =
  | 'Health'
  | 'MentalWellbeing'
  | 'Relationships'
  | 'Academics'
  | 'Reputation'
  | 'Stress'
  | 'RiskAwareness'
  | 'SupportNetwork'
  | 'Time';

export type QuizQuestion = {
  id: string;
  text: string;
  options: { id: string; text: string }[];
  correct?: string;
};

export type Profile = {
  name?: string;
  ageBand?: '13-14' | '15-16' | '17-18';
  avatar?: string;
};

export type Decision = {
  eventId: string;
  choiceId: string;
  at: number;
  metricDeltas: Partial<Record<MetricKey, number>>;
  achievement?: string | null;
};

export type Session = {
  id: string;
  startedAt: number;
  finishedAt?: number;
  profile?: Profile;
  metrics: Record<Metric, number>;
  achievements: string[];
  decisions: Decision[];
  preQuizAnswers?: Record<string, string>;
  postQuizAnswers?: Record<string, string>;
  seenEventIds: string[];
};



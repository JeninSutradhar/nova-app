'use client';

import { useEffect, useMemo, useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { loadDefaultContent } from '@/lib/content/loadContent';
import { initEngineState, selectNextEvent, applyChoice, type EngineState } from '@/lib/engine/core';
import type { ContentPack } from '@/lib/types/game';
import { ScenarioCard } from '@/components/game/ScenarioCard';
import { saveSession, getSession } from '@/lib/db/indexedDb';
import { SoundToggle } from '@/components/SoundToggle';
import { WarningModal } from '@/components/WarningModal';

function PlayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');

  const [content, setContent] = useState<ContentPack | null>(null);
  const [currentEvent, setCurrentEvent] = useState<any>(null);
  const [engine, setEngine] = useState<EngineState | null>(null);
  const [profile, setProfile] = useState<{ name?: string; ageBand?: '13-14' | '15-16' | '17-18'; avatar?: string } | null>(null);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [showAchievement, setShowAchievement] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState<any>(null);
  const [gameEnded, setGameEnded] = useState(false);
  const MAX_STEPS = 10;

  useEffect(() => {
    async function setupGame() {
      if (!sessionId) {
        router.push('/');
        return;
      }

      const gameContent = await loadDefaultContent();
      setContent(gameContent);

      const session = await getSession(sessionId);
      if (!session) {
        router.push('/');
        return;
      }

      setProfile(session.profile || null);

      const engineState = initEngineState(session.profile as any, {
        id: session.id,
        startedAt: session.startedAt,
        finishedAt: session.finishedAt,
        profile: session.profile as any,
        metrics: session.metrics as any,
        achievements: session.achievements || [],
        decisions: (session.decisions as any) || [],
        seenEventIds: session.seenEventIds || [],
      } as any);
      setEngine(engineState);

      const firstEvent = selectNextEvent(gameContent, engineState, { avoidRepeats: true });
      handleEventSelection(firstEvent);
    }
    setupGame();
  }, [sessionId, router]);

  const step = useMemo(() => engine?.step || 0, [engine]);
  const metrics = useMemo(() => engine?.metrics || {}, [engine]);

  async function handleChoose(choiceId: string) {
    if (!engine || !currentEvent) return;

    const { nextState, effects } = applyChoice(content!, engine, currentEvent.id, choiceId);
    setEngine(nextState);
    
    if (effects.achievement && !achievements.includes(effects.achievement)) {
      const newAchievements = [...achievements, effects.achievement];
      setAchievements(newAchievements);
      setShowAchievement(effects.achievement);
      setTimeout(() => setShowAchievement(null), 3000);
    }

    const session = await getSession(sessionId!);
    if (session) {
      const newDecisions = [...(session.decisions || []), effects.decision];
      const updatedSession = { 
        ...session, 
        decisions: newDecisions, 
        seenEventIds: Array.from(nextState.seenEventIds),
        achievements: Array.from(nextState.achievements),
        metrics: nextState.metrics as any,
      };
      await saveSession(updatedSession as any);
    }

    if (nextState.step >= MAX_STEPS) {
      setGameEnded(true);
      setTimeout(async () => {
        const session = await getSession(sessionId!);
        if (session) {
          await saveSession({ ...session, finishedAt: Date.now(), metrics: nextState.metrics as any } as any);
        }
        router.push(`/outcome?session=${sessionId}`);
      }, 1200);
    } else {
      const nextEvent = selectNextEvent(content!, nextState, { avoidRepeats: true });
      handleEventSelection(nextEvent);
    }
  }

  const handleEventSelection = (event: any) => {
    if (!event) {
      setGameEnded(true);
      setTimeout(async () => {
        const session = await getSession(sessionId!);
        if (session) {
          await saveSession({ ...session, finishedAt: Date.now(), metrics: engine!.metrics as any } as any);
        }
        router.push(`/outcome?session=${sessionId}`);
      }, 1200);
      return;
    }

    if (event.sensitive) {
      setShowWarning(event);
    } else {
      setCurrentEvent(event);
    }
  };
  
  const handleSkip = () => {
    const nextEvent = selectNextEvent(content!, engine!, { avoidRepeats: true });
    setShowWarning(null);
    handleEventSelection(nextEvent);
  };

  if (!currentEvent || !engine) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <div className="h-14 w-14 animate-spin rounded-full border-4 border-[color:var(--ink)] border-t-transparent"></div>
        </motion.div>
      </div>
    );
  }

  if (gameEnded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h2 className="text-3xl font-bold mb-2">Your Journey Complete</h2>
          <p className="text-lg text-[color:var(--muted)]">Preparing your results...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AnimatePresence>
        {showWarning && (
          <WarningModal 
            onProceed={() => {
              setCurrentEvent(showWarning);
              setShowWarning(null);
            }} 
            onSkip={handleSkip}
          />
        )}
        {showAchievement && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="ui-card-solid px-8 py-4">
              <div className="text-2xl">✨</div>
              <div className="font-bold text-lg">{showAchievement}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-4xl p-6 pt-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="ui-chip font-black">NOVA</div>
          </div>
          <div className="flex items-center gap-3 ui-chip" aria-label="Player Status">
            {profile?.avatar ? (
              <span className="relative w-6 h-6 block">
                <Image src={profile.avatar} alt="avatar" fill className="rounded-full object-cover" />
              </span>
            ) : null}
            {profile?.name ? <span className="text-sm font-medium">{profile.name}</span> : null}
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--lime-700)' }}></div>
            <span className="text-sm font-medium">Step {engine.step + 1}</span>
            <SoundToggle />
          </div>
        </motion.div>

        <motion.div key={currentEvent.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <ScenarioCard event={currentEvent} metrics={engine.metrics as any} onChoose={handleChoose} />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-6 text-center text-sm text-[color:var(--muted)]">
          Progress: {engine.step} / {MAX_STEPS} scenarios
        </motion.div>
      </div>
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-[color:var(--ink)] border-t-transparent"></div>
      </div>
    }>
      <PlayContent />
    </Suspense>
  );
}

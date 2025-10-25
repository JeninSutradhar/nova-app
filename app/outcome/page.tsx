'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, ResponsiveContainer } from 'recharts';
import { getSession, clearSessions } from '@/lib/db/indexedDb';
import { exportSessions } from '@/lib/db/indexedDb';
import { loadDefaultContent } from '@/lib/content/loadContent';
import type { ContentPack } from '@/lib/types/game';

function OutcomeContent() {
  const params = useSearchParams();
  const router = useRouter();
  const sessionId = params.get('session');
  const [metrics, setMetrics] = useState<any>(null);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [reflection, setReflection] = useState('');
  const [loading, setLoading] = useState(true);
  const [decisions, setDecisions] = useState<any[]>([]);
  const [content, setContent] = useState<ContentPack | null>(null);

  useEffect(() => {
    async function loadContentAsync() {
      const gameContent = await loadDefaultContent();
      setContent(gameContent);
    }
    loadContentAsync();
  }, []);

  useEffect(() => {
    if (!sessionId) {
      router.push('/play');
      return;
    }
    
    getSession(sessionId).then((session) => {
      if (session) {
        setMetrics(session.metrics);
        setAchievements(session.achievements || []);
        setDecisions(session.decisions || []);
      }
      setLoading(false);
    });
  }, [sessionId, router]);

  function getDecisionText(eventId: string, choiceId: string) {
    if (!content) return { eventText: eventId, choiceText: choiceId };
    
    const event = content.events.find((e: any) => e.id === eventId);
    const choice = event?.choices.find((c: any) => c.id === choiceId);

    return {
      eventText: event?.narrative || eventId,
      choiceText: (choice as any)?.label || choiceId
    };
  }

  async function handleExport() {
    const json = await exportSessions();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nova-session.json';
    a.click();
  }

  async function handleSaveReflection() {
    try {
      localStorage.setItem(`nova-reflection-${sessionId}`, reflection);
      alert('Reflection saved locally');
    } catch (e) {
      console.error(e);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-[color:var(--ink)] border-t-transparent"></div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div>Session not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-4xl p-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-extrabold mb-2">Your Journey Results</h1>
          <p className="text-lg text-[color:var(--muted)]">
            Here's how your decisions shaped your path
          </p>
        </motion.div>

        {/* Metrics Radar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-12 ui-card p-6"
        >
          <h2 className="text-2xl font-bold mb-4">📈 Metrics Overview</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={Object.entries(metrics).filter(([k]) => k !== 'Time').map(([k, v]) => ({ metric: k, value: v as number }))}>
                <PolarGrid stroke="rgba(15,23,42,0.15)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: 'rgba(15,23,42,0.8)', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'rgba(15,23,42,0.6)', fontSize: 10 }} />
                <Radar name="You" dataKey="value" stroke="#9DDA4B" fill="#C6F36B" fillOpacity={0.35} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Decisions Timeline */}
        {decisions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-12 ui-card p-8"
          >
            <h2 className="text-2xl font-bold mb-4">🗓️ Key Choices Timeline</h2>
            <div className="relative pl-6 space-y-6 border-l-2 ui-border/20">
              {decisions.map((d, i) => {
                const { eventText, choiceText } = getDecisionText(d.eventId, d.choiceId);
                return (
                  <div key={i} className="relative">
                    <div className="absolute -left-[30px] top-1 h-4 w-4 rounded-full" style={{ backgroundColor: 'var(--lime-600)', boxShadow: '0 0 0 6px rgba(198,243,107,0.25)' }} />
                    <div className="text-sm text-[color:var(--muted)]">{new Date(d.at).toLocaleTimeString()}</div>
                    <p className="font-medium my-1">"{eventText}"</p>
                    <p className="pl-4 border-l-2" style={{ borderColor: 'rgba(15,23,42,0.15)', color: 'var(--muted)' }}>You chose: "{choiceText}"</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Metrics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12 grid grid-cols-2 gap-4 sm:grid-cols-3"
        >
          {Object.entries(metrics).map(([key, value]) => (
            <div
              key={key}
              className="ui-card-solid p-6"
            >
              <div className="text-sm text-[color:var(--muted)] mb-2">{key}</div>
              <div className="text-3xl font-bold mb-2">{Math.round(value as number)}</div>
              <div className="h-2 w-full bg-[rgba(15,23,42,0.08)] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${value as number}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: 'var(--lime-600)' }}
                />
              </div>
            </div>
          ))}
        </motion.div>

        {/* Achievements */}
        {achievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold mb-4">✨ Achievements Unlocked</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {achievements.map((achievement, i) => (
                <motion.div
                  key={achievement}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="ui-card p-4"
                >
                  <div className="font-medium">{achievement}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Reflection Prompts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12 ui-card p-8"
        >
          <h2 className="text-2xl font-bold mb-4">💭 Reflection Questions</h2>
          <div className="space-y-4">
            <div> <strong>1.</strong> Which decision surprised you the most? Why?</div>
            <div> <strong>2.</strong> What protective strategies did you use?</div>
            <div> <strong>3.</strong> How can you apply these learnings in real life?</div>
          </div>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Write your thoughts here..."
            className="mt-6 w-full min-h-32 ui-card-solid p-4 focus:outline-none"
          />
          <div className="mt-4 text-right">
            <button
              onClick={handleSaveReflection}
              className="ui-btn ui-btn-secondary"
            >
              Save Reflection
            </button>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button
            onClick={() => {
              const newSessionId = crypto.randomUUID();
              router.push(`/quiz/pre?session=${newSessionId}`);
            }}
            className="flex-1 ui-btn ui-btn-secondary"
          >
            Play Again
          </button>
          <button
            onClick={() => router.push(`/quiz/post?session=${sessionId}`)}
            className="flex-1 ui-btn ui-btn-primary"
          >
            Take Post-Quiz & Finish
          </button>
          <button
            onClick={handleExport}
            className="flex-1 ui-btn ui-btn-secondary"
          >
            Export Results
          </button>
          <button
            onClick={async () => { 
              if (window.confirm('Are you sure you want to delete all your local session data? This cannot be undone.')) {
                await clearSessions(); 
                alert('All local session data has been deleted.');
                router.push('/');
              }
            }}
            className="flex-1 ui-btn ui-btn-secondary"
          >
            Delete My Data
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex-1 ui-btn ui-btn-secondary"
          >
            Home
          </button>
        </motion.div>
      </div>
    </div>
  );
}

export default function OutcomePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-[color:var(--ink)] border-t-transparent"></div>
      </div>
    }>
      <OutcomeContent />
    </Suspense>
  );
}

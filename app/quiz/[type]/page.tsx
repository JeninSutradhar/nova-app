'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { loadDefaultContent } from '@/lib/content/loadContent';
import type { ContentPack, QuizQuestion } from '@/lib/types/game';
import { getSession, saveSession } from '@/lib/db/indexedDb';

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const quizType = params.type as 'pre' | 'post';
  const sessionId = searchParams.get('session');

  const [content, setContent] = useState<ContentPack | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // Achievements during quiz
  const [achievement, setAchievement] = useState<null | { title: string; subtitle: string; badge: string }>(null);

  useEffect(() => {
    async function loadContentAsync() {
      const gameContent = await loadDefaultContent();
      setContent(gameContent);
      const questionsToLoad = quizType === 'pre' ? gameContent.preQuiz : gameContent.postQuiz;
      setQuestions(questionsToLoad || []);
      setLoading(false);
    }
    loadContentAsync();
  }, [quizType]);

  const triggerAchievement = (title: string, subtitle: string) => {
    const badges = ['/badges/badge2.png', '/badges/badge3.png'];
    const badge = badges[Math.floor(Math.random() * badges.length)];
    setAchievement({ title, subtitle, badge });
    setTimeout(() => setAchievement(null), 1400);
  };

  const handleAnswer = (questionId: string, optionId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));

    // Mid-quiz achievements (simple, client-only)
    if (currentQuestionIndex === 0) {
      triggerAchievement('First Step!', 'You started the check‑in.');
    } else if (optionId.toLowerCase().endsWith('a4')) {
      triggerAchievement('Confidence +1', 'A strong, clear choice.');
    }

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        finishQuiz();
      }
    }, 250);
  };

  const finishQuiz = async () => {
    if (quizType === 'pre' && sessionId) {
      const existing = await getSession(sessionId);
      const newSession: any = existing || {
        id: sessionId,
        startedAt: Date.now(),
        metrics: {
          Health: 50, MentalWellbeing: 50, Relationships: 50, Academics: 50,
          Reputation: 50, Stress: 50, RiskAwareness: 20, SupportNetwork: 30, Time: 0
        },
        achievements: [],
        decisions: [],
        seenEventIds: [],
      };
      await saveSession(newSession);
      router.push(`/onboarding?session=${sessionId}`);
    } else if (quizType === 'post' && sessionId) {
      router.push(`/outcome?session=${sessionId}`);
    } else {
      router.push('/');
    }
  };

  if (loading || questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        Loading...
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      {/* Achievement toast */}
      <AnimatePresence>
        {achievement && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="ui-card-solid px-5 py-3 flex items-center gap-3">
              <Image src={achievement.badge} alt="badge" width={48} height={48} />
              <div>
                <div className="font-bold">{achievement.title}</div>
                <div className="text-sm text-[color:var(--muted)]">{achievement.subtitle}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
          >
            <h1 className="text-3xl font-extrabold text-center mb-2">{quizType === 'pre' ? 'Quick Check-in' : 'Final Thoughts'}</h1>
            <p className="text-center text-[color:var(--muted)] mb-8">Question {currentQuestionIndex + 1} of {questions.length}</p>
            <div className="ui-card p-8">
              <p className="text-xl text-center font-medium mb-8 min-h-16">{currentQuestion.text}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.options.map(option => (
                  <motion.button
                    key={option.id}
                    onClick={() => handleAnswer(currentQuestion.id, option.id)}
                    whileTap={{ y: 1, scale: 0.98 }}
                    className="ui-card-solid p-5 text-left quiz-hover transition-transform"
                  >
                    {option.text}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

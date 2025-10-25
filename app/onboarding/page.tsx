'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { getSession, saveSession } from '@/lib/db/indexedDb';

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');
  
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [ageBand, setAgeBand] = useState<'13-14' | '15-16' | '17-18' | ''>('');
  const [avatar, setAvatar] = useState('');

  const avatars = ['avatar1.png','avatar2.png','avatar3.png','avatar4.png','avatar5.png','avatar6.png'];

  function handleNext() {
    if (step === 1 && !name) {
      // allow anonymous
    }
    if (step === 2 && !ageBand) return;
    if (step === 3 && !avatar) return;

    if (step < 3) {
      setStep(step + 1);
    } else {
      handleStart();
    }
  }

  const handleStart = async () => {
    const userProfile = { name, ageBand: (ageBand || undefined) as any, avatar: `/avatars/${avatar}` };
    localStorage.setItem('nova-profile', JSON.stringify(userProfile));
    
    if (sessionId) {
      const session = await getSession(sessionId);
      if (session) {
        await saveSession({ ...session, profile: userProfile } as any);
      }
      router.push(`/play?session=${sessionId}`);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        <div className="ui-card p-8">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Step {step} of 3</span>
              <span className="text-sm text-[color:var(--muted)]">{Math.round((step / 3) * 100)}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(15,23,42,0.08)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(step / 3) * 100}%` }}
                className="h-full"
                style={{ background: 'var(--lime-600)' }}
              />
            </div>
          </div>

          {/* Step 1: Name */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-3xl font-extrabold mb-2">What's your name?</h2>
                <p className="text-[color:var(--muted)]">We'll use this to personalize your journey</p>
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name (or leave blank for anonymous)"
                className="w-full px-6 py-4 ui-card-solid focus:outline-none"
                autoFocus
              />
            </motion.div>
          )}

          {/* Step 2: Age */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-3xl font-extrabold mb-2">What's your age range?</h2>
                <p className="text-[color:var(--muted)]">This helps us show age-appropriate scenarios</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {(['13-14', '15-16', '17-18'] as const).map((age) => (
                  <button
                    key={age}
                    onClick={() => setAgeBand(age)}
                    className={`ui-card-solid p-6 transition-all ${
                      ageBand === age ? 'selected-strong' : 'hover:bg-[var(--surface)]'
                    }`}
                  >
                    <div className="text-2xl font-bold">{age}</div>
                    <div className="text-sm text-[color:var(--muted)] mt-1">years</div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Avatar */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-3xl font-extrabold mb-2">Choose your avatar</h2>
                <p className="text-[color:var(--muted)]">Pick something that represents you</p>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                {avatars.map((file) => (
                  <button
                    key={file}
                    onClick={() => setAvatar(file)}
                    className={`ui-card-solid p-2 transition-all ${
                      avatar === file ? 'selected-strong' : 'hover:bg-[var(--surface)]'
                    }`}
                  >
                    <div className="relative w-full aspect-square">
                      <Image src={`/avatars/${file}`} alt={file} fill className="rounded-xl object-cover" />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => setStep(step > 1 ? step - 1 : 1)}
              className={`ui-btn ui-btn-secondary ${step === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={step === 1}
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="ui-btn ui-btn-primary"
            >
              {step === 3 ? 'Start Journey' : 'Next'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-[color:var(--ink)] border-t-transparent"></div>
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';

export default function HomePage() {
  const router = useRouter();

  const handleStart = () => {
    const newSessionId = crypto.randomUUID();
    router.push(`/quiz/pre?session=${newSessionId}`);
  };

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="ui-card-solid p-10"
        >
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4">Build Resilience. Choose Your Path.</h1>
              <p className="text-lg text-[color:var(--muted)] mb-6 max-w-prose">
                Navigate realistic scenarios, practice refusal skills and protective strategies, and see your impact—safely, privately, and locally.
              </p>
              <div className="flex flex-wrap gap-4">
                <button onClick={handleStart} className="ui-btn ui-btn-primary">Start Your Journey</button>
                <Link href="#features" className="ui-btn ui-btn-secondary">Learn More</Link>
              </div>
            </div>
            <div className="ui-card p-8">
              <div className="text-sm font-semibold mb-3">Highlights</div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="ui-card-solid p-5 text-center">
                  <div className="text-3xl font-black">10+</div>
                  <div className="text-sm text-[color:var(--muted)]">Scenarios</div>
                </div>
                <div className="ui-card-solid p-5 text-center">
                  <div className="text-3xl font-black">40+</div>
                  <div className="text-sm text-[color:var(--muted)]">Choices</div>
                </div>
                <div className="ui-card-solid p-5 text-center">
                  <div className="text-3xl font-black">9</div>
                  <div className="text-sm text-[color:var(--muted)]">Metrics</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="ui-card-solid p-6">
            <div className="text-sm font-semibold text-[color:var(--muted)] mb-2">Gameplay</div>
            <h3 className="text-xl font-bold mb-1">Choice-Based Scenarios</h3>
            <p className="text-[color:var(--muted)]">Explore realistic situations and shape outcomes with meaningful decisions.</p>
          </div>
          <div className="ui-card-solid p-6">
            <div className="text-sm font-semibold text-[color:var(--muted)] mb-2">Skills</div>
            <h3 className="text-xl font-bold mb-1">Build Resilience</h3>
            <p className="text-[color:var(--muted)]">Practice protective strategies, refusal skills, and help-seeking.</p>
          </div>
          <div className="ui-card-solid p-6">
            <div className="text-sm font-semibold text-[color:var(--muted)] mb-2">Impact</div>
            <h3 className="text-xl font-bold mb-1">See Your Progress</h3>
            <p className="text-[color:var(--muted)]">Track your decisions and their effects on wellbeing and relationships.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="ui-card p-10 text-center">
          <h2 className="text-3xl font-extrabold mb-2">Ready to Begin?</h2>
          <p className="text-[color:var(--muted)] mb-6 max-w-2xl mx-auto">Start your journey of self-discovery and empowerment. Every choice matters.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={handleStart} className="ui-btn ui-btn-primary">Start Playing Now</button>
            <Link href="/about" className="ui-btn ui-btn-secondary">About NOVA</Link>
            <Link href="/resources" className="ui-btn ui-btn-secondary">Resources</Link>
            <Link href="/dashboard" className="ui-btn ui-btn-secondary">For Teachers</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-16">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="ui-card-solid p-10 mb-10 text-center">
          <h1 className="text-5xl font-extrabold mb-3">About NOVA</h1>
          <p className="text-lg text-[color:var(--muted)] max-w-3xl mx-auto">
            NOVA is a story-driven learning experience that helps adolescents practice refusal skills, build resilience,
            and make informed decisions in a safe, stigma-free environment.
          </p>
        </motion.div>

        {/* Mission */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="ui-card p-6">
            <div className="text-sm text-[color:var(--muted)] mb-1">Mission</div>
            <h3 className="text-xl font-bold mb-2">Empower Better Choices</h3>
            <p className="text-[color:var(--muted)]">Build refusal efficacy, protective strategies, and help‑seeking confidence.</p>
          </div>
          <div className="ui-card p-6">
            <div className="text-sm text-[color:var(--muted)] mb-1">Approach</div>
            <h3 className="text-xl font-bold mb-2">Play. Reflect. Grow.</h3>
            <p className="text-[color:var(--muted)]">Interactive scenarios, quick reflections, and outcome insights track progress.</p>
          </div>
          <div className="ui-card p-6">
            <div className="text-sm text-[color:var(--muted)] mb-1">Privacy</div>
            <h3 className="text-xl font-bold mb-2">Local‑first by Design</h3>
            <p className="text-[color:var(--muted)]">Data stays on the device. Export or delete anytime. Cohorts show only aggregates.</p>
          </div>
        </motion.div>

        {/* How it works */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="ui-card p-8 mb-10">
          <h2 className="text-2xl font-bold mb-6">How it works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="ui-card-solid p-6">
              <div className="text-sm text-[color:var(--muted)] mb-1">Step 1</div>
              <h4 className="font-semibold mb-1">Quick Check‑in</h4>
              <p className="text-[color:var(--muted)]">2 short questions to set a baseline and personalize the journey.</p>
            </div>
            <div className="ui-card-solid p-6">
              <div className="text-sm text-[color:var(--muted)] mb-1">Step 2</div>
              <h4 className="font-semibold mb-1">Play 10 Scenarios</h4>
              <p className="text-[color:var(--muted)]">Choose actions, see immediate consequences, and unlock achievements.</p>
            </div>
            <div className="ui-card-solid p-6">
              <div className="text-sm text-[color:var(--muted)] mb-1">Step 3</div>
              <h4 className="font-semibold mb-1">Outcome & Reflection</h4>
              <p className="text-[color:var(--muted)]">Review metrics and key choices, reflect, and plan next steps.</p>
            </div>
          </div>
        </motion.div>

        {/* Principles */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="ui-card p-8">
            <h2 className="text-2xl font-bold mb-4">Design Principles</h2>
            <ul className="space-y-2 text-[color:var(--muted)]">
              <li>✓ Non‑judgmental tone and culturally relevant narratives</li>
              <li>✓ Safety guardrails and optional content warnings</li>
              <li>✓ Accessibility: keyboard‑first, dyslexia‑friendly font mode</li>
              <li>✓ Light, premium UI that keeps focus on decisions</li>
            </ul>
          </div>
          <div className="ui-card p-8">
            <h2 className="text-2xl font-bold mb-4">For Schools</h2>
            <ul className="space-y-2 text-[color:var(--muted)]">
              <li>✓ Cohort‑level dashboard with privacy (k‑anonymity)</li>
              <li>✓ Discussion prompts aligned to scenarios and skills</li>
              <li>✓ Local‑first storage; export JSON for offline aggregation</li>
              <li>✓ Simple setup—no accounts required for students</li>
            </ul>
          </div>
        </motion.div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/onboarding" className="ui-btn ui-btn-primary mr-3">Start Playing</Link>
          <Link href="/dashboard" className="ui-btn ui-btn-secondary">Open Teacher Dashboard</Link>
        </div>
      </div>
    </div>
  );
}

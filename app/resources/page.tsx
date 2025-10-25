'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const resources = [
  {
    title: 'How to Say No',
    description: 'Practical strategies to decline offers with confidence.',
    icon: '🛡️',
    tips: [
      'Use clear "I" statements: “I don’t want to.”',
      'Suggest a safer alternative activity.',
      'Step away if it doesn’t feel right.',
      'Ask a trusted friend for backup.',
    ],
  },
  {
    title: 'Managing Stress',
    description: 'Healthy coping for exams and daily pressure.',
    icon: '🧘',
    tips: [
      'Try 4‑7‑8 breathing or a 5‑minute walk.',
      'Break work into small blocks with short rests.',
      'Move your body—stretch, dance, or play.',
      'Talk to someone you trust.',
    ],
  },
  {
    title: 'Build Your Support',
    description: 'Find people who have your back.',
    icon: '🤝',
    tips: [
      'List 3 trusted adults you can talk to.',
      'Join positive clubs/teams in school.',
      'Practice active listening with friends.',
      'Help others—support grows both ways.',
    ],
  },
  {
    title: 'Getting Help',
    description: 'When and how to reach out for support.',
    icon: '💬',
    tips: [
      'Talk to your school counselor or a teacher.',
      'Call a helpline if you need immediate support.',
      'Let a parent/guardian know how you feel.',
      'Asking for help is strength—not weakness.',
    ],
  },
];

const hotlines = [
  { name: 'Childline', number: '1098', available: '24/7 (India)' },
  { name: 'Vandrevala Foundation', number: '1860-2662-345', available: '24/7' },
  { name: 'iCall', number: '022-25521111', available: 'Mon‑Sat, 8am‑10pm' },
];

export default function ResourcesPage() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-16">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="ui-card-solid p-10 text-center mb-10">
          <h1 className="text-5xl font-extrabold mb-3">Resources & Support</h1>
          <p className="text-lg text-[color:var(--muted)] max-w-3xl mx-auto">Tools, strategies, and people you can rely on—online and at school.</p>
        </motion.div>

        {/* Resource Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {resources.map((resource, i) => (
            <motion.div key={resource.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="ui-card p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-3xl">{resource.icon}</div>
                <div>
                  <h3 className="text-xl font-bold mb-1">{resource.title}</h3>
                  <p className="text-[color:var(--muted)]">{resource.description}</p>
                </div>
              </div>
              <ul className="space-y-2 mt-4">
                {resource.tips.map((tip, j) => (
                  <li key={j} className="flex items-start gap-3 text-[color:var(--muted)]">
                    <span style={{ color: 'var(--lime-700)' }}>•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Hotlines */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="ui-card p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">24/7 Support Hotlines (India)</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {hotlines.map((hotline) => (
              <div key={hotline.name} className="ui-card-solid p-6">
                <div className="font-semibold text-lg mb-1">{hotline.name}</div>
                <div className="text-2xl font-bold mb-1">{hotline.number}</div>
                <div className="text-sm text-[color:var(--muted)]">{hotline.available}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Links */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="ui-card p-8 mb-12">
          <h2 className="text-2xl font-bold mb-4">Helpful Links</h2>
          <ul className="grid md:grid-cols-2 gap-3 text-[color:var(--muted)]">
            <li><a className="ui-card-solid p-3 block" href="https://www.unodc.org/" target="_blank" rel="noreferrer">UNODC: Youth resources</a></li>
            <li><a className="ui-card-solid p-3 block" href="https://www.who.int/" target="_blank" rel="noreferrer">WHO: Mental health and substance use</a></li>
            <li><a className="ui-card-solid p-3 block" href="https://www.childlineindia.org/" target="_blank" rel="noreferrer">Childline India</a></li>
            <li><a className="ui-card-solid p-3 block" href="https://vandrevalafoundation.com/" target="_blank" rel="noreferrer">Vandrevala Foundation</a></li>
          </ul>
        </motion.div>

        {/* Back */}
        <div className="text-center">
          <Link href="/" className="ui-btn ui-btn-secondary">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

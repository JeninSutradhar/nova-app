'use client';

import Link from 'next/link';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-[var(--surface-strong)]/90 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="ui-chip font-black">NOVA</span>
          <span className="text-sm text-[color:var(--muted)] hidden sm:inline">Your Journey, Your Choices</span>
        </Link>
        <nav className="hidden md:flex items-center gap-3">
          <Link href="/about" className="ui-btn ui-btn-secondary">About</Link>
          <Link href="/resources" className="ui-btn ui-btn-secondary">Resources</Link>
          <Link href="/dashboard" className="ui-btn ui-btn-secondary">For Teachers</Link>
          <Link href="/onboarding" className="ui-btn ui-btn-primary">Play</Link>
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}

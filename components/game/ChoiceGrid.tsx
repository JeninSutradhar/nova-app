'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import type { Choice } from '@/lib/types/game';

type ChoiceGridProps = {
  choices: Choice[];
  onSelect: (choice: Choice) => void;
};

export function ChoiceGrid({ choices, onSelect }: ChoiceGridProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {choices.map((c) => (
        <motion.button
          key={c.id}
          whileHover={{ y: -2 }}
          whileTap={{ y: 1, scale: 0.98 }}
          onClick={() => onSelect(c)}
          className={cn(
            'ui-card-solid text-left p-5 hover:bg-[var(--surface)] transition-colors'
          )}
        >
          <div className="text-base font-semibold">{c.label}</div>
          {c.hint ? <div className="mt-1 text-sm text-[color:var(--muted)]">{c.hint}</div> : null}
        </motion.button>
      ))}
    </div>
  );
}



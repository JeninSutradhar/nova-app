'use client';

import { motion } from 'framer-motion';

type WarningModalProps = {
  onProceed: () => void;
  onSkip: () => void;
};

export function WarningModal({ onProceed, onSkip }: WarningModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="mx-4 max-w-md ui-card-solid p-8"
      >
        <h2 className="text-2xl font-bold mb-3">Content Warning</h2>
        <p className="text-[color:var(--muted)] mb-6 leading-relaxed">
          The next scenario may contain sensitive themes related to family stress or loneliness. Please proceed with care.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onSkip}
            className="flex-1 ui-btn ui-btn-secondary"
          >
            Skip Scenario
          </button>
          <button
            onClick={onProceed}
            className="flex-1 ui-btn ui-btn-primary"
          >
            Proceed
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

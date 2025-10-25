'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMessage } from '@/lib/i18n';

type ConsentModalProps = {
  onAccept: () => void;
  onDecline: () => void;
};

export function ConsentModal({ onAccept, onDecline }: ConsentModalProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hasConsented = localStorage.getItem('nova-consent');
    if (!hasConsented) {
      setShow(true);
    }
  }, []);

  function handleAccept() {
    localStorage.setItem('nova-consent', 'true');
    setShow(false);
    onAccept();
  }

  function handleDecline() {
    setShow(false);
    onDecline();
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mx-4 max-w-md rounded-3xl bg-white/10 p-8 backdrop-blur border border-white/20 text-white"
          >
            <h2 className="text-2xl font-bold mb-4">{getMessage('consent.title')}</h2>
            <p className="text-white/80 mb-6 leading-relaxed">
              {getMessage('consent.message')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDecline}
                className="flex-1 rounded-full border border-white/20 bg-white/10 px-6 py-3 font-semibold backdrop-blur hover:bg-white/20 transition-colors"
              >
                {getMessage('consent.decline')}
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 rounded-full gradient-brand px-6 py-3 font-semibold text-white shadow-lg hover:shadow-xl transition-shadow"
              >
                {getMessage('consent.accept')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

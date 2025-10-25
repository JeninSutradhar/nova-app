'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Locale, setLocale, getLocale } from '@/lib/i18n/store';
import { supportedLocales, defaultLocale } from '@/lib/i18n/index';

export function LanguageSwitcher() {
  const [currentLocale, setCurrentLocale] = useState<Locale>(defaultLocale);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setCurrentLocale(getLocale());
  }, []);

  const handleLocaleChange = (locale: Locale) => {
    setCurrentLocale(locale);
    setLocale(locale);
    setIsOpen(false);
  };

  const localeNames: Record<Locale, string> = {
    en: 'English',
    hi: 'हिंदी',
    kn: 'ಕನ್ನಡ',
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur border border-white/20 hover:bg-white/20 transition-colors"
        aria-label="Change language"
      >
        <span className="text-lg">🌐</span>
        <span className="text-sm font-medium">{localeNames[currentLocale]}</span>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </motion.button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute bottom-full right-0 mb-2 rounded-2xl bg-white/10 backdrop-blur border border-white/20 overflow-hidden z-50 min-w-[150px] shadow-lg"
        >
          {supportedLocales.map((locale) => (
            <button
              key={locale}
              onClick={() => handleLocaleChange(locale)}
              className={`w-full text-left px-4 py-3 hover:bg-white/20 transition-colors ${
                currentLocale === locale ? 'bg-white/10' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{localeNames[locale]}</span>
                {currentLocale === locale && (
                  <span className="text-purple-400">✓</span>
                )}
              </div>
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}

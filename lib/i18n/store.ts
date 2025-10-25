import { Locale, defaultLocale, supportedLocales, type Locale as LocaleType } from './index';

const STORAGE_KEY = 'nova-locale';

export function getLocale(): LocaleType {
  if (typeof window === 'undefined') return defaultLocale;
  
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && supportedLocales.includes(saved as LocaleType)) {
    return saved as LocaleType;
  }
  return defaultLocale;
}

export function setLocale(locale: LocaleType): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(STORAGE_KEY, locale);
  
  // Trigger a custom event to notify components
  window.dispatchEvent(new Event('localechange'));
}

export { type LocaleType as Locale };

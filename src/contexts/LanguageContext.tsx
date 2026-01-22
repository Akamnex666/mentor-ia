"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import es from '../translations/es.json';
import en from '../translations/en.json';
import fr from '../translations/fr.json';

type Locale = 'es' | 'en' | 'fr';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  isHydrated: boolean;
}

const translations = { es, en, fr };

// Helper function to get initial locale synchronously
function getInitialLocale(): Locale {
  if (typeof window !== 'undefined') {
    const savedLocale = localStorage.getItem('language') as Locale;
    if (savedLocale && ['es', 'en', 'fr'].includes(savedLocale)) {
      return savedLocale;
    }
  }
  return 'es';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Always start with 'es' on server and initial client render to avoid hydration mismatch
  const [locale, setLocaleState] = useState<Locale>('es');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Only run on client after hydration is complete
    const savedLocale = localStorage.getItem('language') as Locale;
    if (savedLocale && ['es', 'en', 'fr'].includes(savedLocale)) {
      setLocaleState(savedLocale);
      document.documentElement.lang = savedLocale;
    }
    setIsHydrated(true);
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('language', newLocale);
    // Update html lang attribute
    document.documentElement.lang = newLocale;
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: unknown = translations[locale];

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    return typeof value === 'string' ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, isHydrated }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

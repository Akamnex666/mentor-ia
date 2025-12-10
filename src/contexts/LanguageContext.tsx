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
}

const translations = { es, en, fr };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('es');

  useEffect(() => {
    // Load saved language from localStorage
    const savedLocale = localStorage.getItem('language') as Locale;
    if (savedLocale && ['es', 'en', 'fr'].includes(savedLocale)) {
      setLocaleState(savedLocale);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('language', newLocale);
    // Update html lang attribute
    document.documentElement.lang = newLocale;
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[locale];

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    return typeof value === 'string' ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
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

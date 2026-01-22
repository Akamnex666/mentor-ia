"use client";

import { useLanguage } from '../../contexts/LanguageContext';
import { useState, useRef, useEffect } from 'react';
import '../../styles/LanguageSelector.css';

const languages = {
  es: { name: 'Español', flag: '🇪🇸', short: 'ES' },
  en: { name: 'English', flag: '🇬🇧', short: 'EN' },
  fr: { name: 'Français', flag: '🇫🇷', short: 'FR' }
};

export default function LanguageSelector() {
  const { locale, setLocale, isHydrated } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar el dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Usar siempre 'es' en el servidor y durante la hidratación inicial
  const effectiveLocale = isHydrated ? locale : 'es';
  const currentLang = languages[effectiveLocale as keyof typeof languages];

  const handleLanguageChange = (newLocale: string) => {
    setLocale(newLocale as 'es' | 'en' | 'fr');
    setIsOpen(false);
  };

  return (
    <div className="language-selector" ref={dropdownRef} suppressHydrationWarning>
      <button
        className="lang-btn-main"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Cambiar idioma"
        aria-expanded={isOpen}
        suppressHydrationWarning
      >
        <span className="lang-flag" suppressHydrationWarning>{currentLang.flag}</span>
        <span className="lang-code" suppressHydrationWarning>{currentLang.short}</span>
        <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
      </button>

      {isOpen && (
        <div className="lang-dropdown">
          {Object.entries(languages).map(([code, lang]) => (
            <button
              key={code}
              className={`lang-option ${effectiveLocale === code ? 'active' : ''}`}
              onClick={() => handleLanguageChange(code)}
            >
              <span className="lang-flag">{lang.flag}</span>
              <span className="lang-name">{lang.name}</span>
              {effectiveLocale === code && <i className="fas fa-check"></i>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

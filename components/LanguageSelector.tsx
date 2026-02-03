// frontend
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Check, Globe, ChevronDown } from 'lucide-react';
import { useLanguage, SUPPORTED_LANGUAGES } from '@/lib/services/languageService';

interface LanguageSelectorProps {
  className?: string;
}

export function LanguageSelector({ className }: LanguageSelectorProps) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Group languages by region for better UX
  const languageGroups = {
    'Western European': ['en', 'fr', 'fr-ca', 'de', 'es', 'it', 'pt', 'nl'],
    'Celtic': ['ga', 'gd'],
    'Eastern European': ['ru', 'el'],
    'East Asian': ['ja', 'zh', 'ko'],
    'South Asian': ['hi', 'ta', 'te', 'mr', 'gu', 'bn', 'pa', 'kn', 'ml', 'ur', 'ne', 'si'],
    'Central Asian': ['dz'],
  };

  const handleSelect = (langCode: string) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentConfig = SUPPORTED_LANGUAGES[language];

  return (
    <div className={className} ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-lg hover:border-amber-500/40 transition-all"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-amber-400" />
            <div className="text-left">
              <div className="text-sm text-amber-200/60">Current Language</div>
              <div className="text-lg font-medium text-white">
                {currentConfig?.flag} {currentConfig?.nativeName} ({currentConfig?.name})
              </div>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-amber-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full max-w-md max-h-80 overflow-y-auto bg-[#1a1f2e] border border-amber-500/20 rounded-lg shadow-xl">
          {Object.entries(languageGroups).map(([region, codes]) => {
            const regionLanguages = codes
              .filter(code => SUPPORTED_LANGUAGES[code]?.available)
              .map(code => SUPPORTED_LANGUAGES[code]);

            if (regionLanguages.length === 0) return null;

            return (
              <div key={region} className="px-2 py-1">
                <div className="px-3 py-2 text-xs uppercase tracking-wider text-white/40 sticky top-0 bg-[#1a1f2e]">
                  {region}
                </div>
                {regionLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleSelect(lang.code)}
                    className={`
                      w-full px-3 py-2 rounded-lg text-left transition-all flex items-center justify-between
                      ${language === lang.code
                        ? 'bg-amber-500/20 text-white'
                        : 'hover:bg-white/5 text-white/80'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{lang.flag}</span>
                      <span className="text-sm font-medium">{lang.nativeName}</span>
                      <span className="text-xs text-white/50">({lang.name})</span>
                      {lang.beta && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                          Beta
                        </span>
                      )}
                    </div>
                    {language === lang.code && (
                      <Check className="w-4 h-4 text-amber-400" />
                    )}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Info about what language setting affects */}
      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-xs text-blue-200/70">
          <strong>What this changes:</strong> MAIA will respond in your selected language.
          Voice recognition and speech will also adapt to your language preference.
        </p>
      </div>
    </div>
  );
}

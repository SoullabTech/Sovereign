// frontend
'use client';

import React from 'react';
import { Check, Globe } from 'lucide-react';
import { useLanguage, SUPPORTED_LANGUAGES, LanguageConfig } from '@/lib/services/languageService';

interface LanguageSelectorProps {
  className?: string;
}

export function LanguageSelector({ className }: LanguageSelectorProps) {
  const { language, setLanguage, availableLanguages } = useLanguage();

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
  };

  const currentConfig = SUPPORTED_LANGUAGES[language];

  return (
    <div className={className}>
      {/* Current Language Display */}
      <div className="mb-6 p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-lg">
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5 text-amber-400" />
          <div>
            <div className="text-sm text-amber-200/60">Current Language</div>
            <div className="text-lg font-medium text-white">
              {currentConfig?.flag} {currentConfig?.nativeName} ({currentConfig?.name})
            </div>
          </div>
        </div>
      </div>

      {/* Language Grid by Region */}
      <div className="space-y-6">
        {Object.entries(languageGroups).map(([region, codes]) => {
          const regionLanguages = codes
            .filter(code => SUPPORTED_LANGUAGES[code]?.available)
            .map(code => SUPPORTED_LANGUAGES[code]);

          if (regionLanguages.length === 0) return null;

          return (
            <div key={region}>
              <h4 className="text-xs uppercase tracking-wider text-white/40 mb-2">{region}</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {regionLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleSelect(lang.code)}
                    className={`
                      p-3 rounded-lg border text-left transition-all
                      ${language === lang.code
                        ? 'border-amber-500/50 bg-amber-500/10'
                        : 'border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/5'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{lang.flag}</span>
                        <div>
                          <div className="text-sm font-medium text-white">{lang.nativeName}</div>
                          <div className="text-xs text-white/50">{lang.name}</div>
                        </div>
                      </div>
                      {language === lang.code && (
                        <Check className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                    {lang.beta && (
                      <div className="mt-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                          Beta
                        </span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Info about what language setting affects */}
      <div className="mt-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-xs text-blue-200/70">
          <strong>What this changes:</strong> MAIA will respond in your selected language.
          Voice recognition and speech will also adapt to your language preference.
        </p>
      </div>
    </div>
  );
}

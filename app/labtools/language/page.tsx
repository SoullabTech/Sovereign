'use client';

/**
 * LANGUAGE SETTINGS
 *
 * Spoken language preference for MAIA conversations.
 * For wisdom system translation, see /labtools/wisdom
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Globe, Check, ChevronRight } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'it', name: 'Italian', native: 'Italiano' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'zh', name: 'Chinese', native: '中文' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'ko', name: 'Korean', native: '한국어' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'nl', name: 'Dutch', native: 'Nederlands' },
  { code: 'sv', name: 'Swedish', native: 'Svenska' },
  { code: 'pl', name: 'Polish', native: 'Polski' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe' },
  { code: 'he', name: 'Hebrew', native: 'עברית' },
  { code: 'th', name: 'Thai', native: 'ไทย' },
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt' },
  { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia' },
];

export default function LanguageSettingsPage() {
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load saved preference
    const saved = localStorage.getItem('maia.language');
    if (saved) setSelectedLanguage(saved);
  }, []);

  const handleSelect = async (code: string) => {
    setSelectedLanguage(code);
    setSaving(true);

    try {
      // Save to localStorage
      localStorage.setItem('maia.language', code);

      // Try to save to server
      await apiFetch('/api/members/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: code }),
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.warn('[Language] Failed to save to server:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0f1a] to-[#1a1f2e] text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0a0f1a]/90 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push('/labtools')}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold">Language</h1>
            <p className="text-sm text-white/50">MAIA speaks 30+ languages</p>
          </div>
          {saved && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="ml-auto flex items-center gap-1 text-emerald-400 text-sm"
            >
              <Check className="w-4 h-4" />
              Saved
            </motion.div>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Language list */}
        <div className="space-y-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              disabled={saving}
              className={`w-full flex items-center justify-between p-4 rounded-xl transition-all
                ${
                  selectedLanguage === lang.code
                    ? 'bg-[#D4B896]/20 border border-[#D4B896]/40'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
            >
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-white/40" />
                <div className="text-left">
                  <div className="font-medium">{lang.name}</div>
                  <div className="text-sm text-white/50">{lang.native}</div>
                </div>
              </div>
              {selectedLanguage === lang.code && (
                <Check className="w-5 h-5 text-[#D4B896]" />
              )}
            </button>
          ))}
        </div>

        {/* Link to Wisdom Translation */}
        <div className="pt-4 border-t border-white/10">
          <button
            onClick={() => router.push('/labtools/wisdom')}
            className="w-full flex items-center justify-between p-4 rounded-xl
                     bg-gradient-to-r from-[#D4B896]/10 to-transparent
                     border border-[#D4B896]/20 hover:border-[#D4B896]/40
                     transition-all group"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🌀</span>
              <div className="text-left">
                <div className="font-medium text-[#D4B896]">Wisdom Translation</div>
                <div className="text-sm text-white/50">
                  Explore insights across wisdom systems
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#D4B896] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}

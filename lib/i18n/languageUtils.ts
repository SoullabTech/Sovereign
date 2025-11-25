/**
 * Language Utilities for MAIA Multilingual Support
 *
 * Provides language detection, mapping, and voice synthesis configuration
 * for OpenAI TTS multilingual capabilities
 */

export type SupportedLanguage =
  | 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'nl'   // European
  | 'ja' | 'zh' | 'ko' | 'hi' | 'ar' | 'tr' | 'ru'   // Asian/Middle Eastern
  | 'pl' | 'sv' | 'da' | 'no' | 'fi'                  // Nordic
  | 'cs' | 'ro' | 'uk' | 'bg' | 'hr' | 'sk';         // Eastern European

export interface LanguageConfig {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  // OpenAI TTS supports these languages with natural pronunciation
  ttsSupported: boolean;
}

export const LANGUAGES: Record<SupportedLanguage, LanguageConfig> = {
  // European Languages
  en: { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr', ttsSupported: true },
  es: { code: 'es', name: 'Spanish', nativeName: 'Español', direction: 'ltr', ttsSupported: true },
  fr: { code: 'fr', name: 'French', nativeName: 'Français', direction: 'ltr', ttsSupported: true },
  de: { code: 'de', name: 'German', nativeName: 'Deutsch', direction: 'ltr', ttsSupported: true },
  it: { code: 'it', name: 'Italian', nativeName: 'Italiano', direction: 'ltr', ttsSupported: true },
  pt: { code: 'pt', name: 'Portuguese', nativeName: 'Português', direction: 'ltr', ttsSupported: true },
  nl: { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', direction: 'ltr', ttsSupported: true },

  // Asian Languages
  ja: { code: 'ja', name: 'Japanese', nativeName: '日本語', direction: 'ltr', ttsSupported: true },
  zh: { code: 'zh', name: 'Chinese', nativeName: '中文', direction: 'ltr', ttsSupported: true },
  ko: { code: 'ko', name: 'Korean', nativeName: '한국어', direction: 'ltr', ttsSupported: true },
  hi: { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', direction: 'ltr', ttsSupported: true },

  // Middle Eastern
  ar: { code: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'rtl', ttsSupported: true },
  tr: { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', direction: 'ltr', ttsSupported: true },

  // Slavic/Eastern European
  ru: { code: 'ru', name: 'Russian', nativeName: 'Русский', direction: 'ltr', ttsSupported: true },
  pl: { code: 'pl', name: 'Polish', nativeName: 'Polski', direction: 'ltr', ttsSupported: true },
  uk: { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', direction: 'ltr', ttsSupported: true },
  cs: { code: 'cs', name: 'Czech', nativeName: 'Čeština', direction: 'ltr', ttsSupported: true },
  ro: { code: 'ro', name: 'Romanian', nativeName: 'Română', direction: 'ltr', ttsSupported: true },
  bg: { code: 'bg', name: 'Bulgarian', nativeName: 'Български', direction: 'ltr', ttsSupported: true },
  hr: { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', direction: 'ltr', ttsSupported: true },
  sk: { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', direction: 'ltr', ttsSupported: true },

  // Nordic
  sv: { code: 'sv', name: 'Swedish', nativeName: 'Svenska', direction: 'ltr', ttsSupported: true },
  da: { code: 'da', name: 'Danish', nativeName: 'Dansk', direction: 'ltr', ttsSupported: true },
  no: { code: 'no', name: 'Norwegian', nativeName: 'Norsk', direction: 'ltr', ttsSupported: true },
  fi: { code: 'fi', name: 'Finnish', nativeName: 'Suomi', direction: 'ltr', ttsSupported: true },
};

/**
 * Detect language from browser locale or user preference
 */
export function detectLanguage(
  navigatorLanguage?: string,
  userPreference?: string
): SupportedLanguage {
  // Priority: user preference > browser language > default
  if (userPreference && isSupported Language(userPreference as SupportedLanguage)) {
    return userPreference as SupportedLanguage;
  }

  if (navigatorLanguage) {
    // Extract language code (e.g., 'en-US' -> 'en')
    const langCode = navigatorLanguage.split('-')[0].toLowerCase();
    if (isSupportedLanguage(langCode as SupportedLanguage)) {
      return langCode as SupportedLanguage;
    }
  }

  return 'en'; // Default to English
}

/**
 * Type guard for supported languages
 */
export function isSupportedLanguage(lang: string): lang is SupportedLanguage {
  return lang in LANGUAGES;
}

/**
 * Get language configuration
 */
export function getLanguageConfig(lang: string): LanguageConfig {
  if (isSupportedLanguage(lang)) {
    return LANGUAGES[lang];
  }
  return LANGUAGES.en;
}

/**
 * Get all supported languages for UI display
 */
export function getSupportedLanguages(): LanguageConfig[] {
  return Object.values(LANGUAGES).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

/**
 * Format language name for display
 */
export function formatLanguageName(lang: SupportedLanguage, showNative: boolean = true): string {
  const config = LANGUAGES[lang];
  if (showNative && config.name !== config.nativeName) {
    return `${config.name} (${config.nativeName})`;
  }
  return config.name;
}

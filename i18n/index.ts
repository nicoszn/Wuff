import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enUS from './locales/en-US.json';
import esES from './locales/es-ES.json';
import type { Language } from '../types';

// ── LocalStorage keys ──
const LANG_KEY = 'portbuff-lang';
const LANG_AUTO_KEY = 'portbuff-lang-auto'; // 'true' when auto-detect is on

// ── Helpers ──

function loadSavedTranslations(): Language[] {
  try {
    const stored = localStorage.getItem('portbuff-languages');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function loadEnabledLanguageCodes(): string[] {
  const languages = loadSavedTranslations();
  return languages.filter((l) => l.enabled).map((l) => l.code);
}

/**
 * Detect the best matching language from the browser's language list
 * against the available enabled languages.
 *
 * Matching strategy:
 *   1. Exact match  (e.g. "es-ES" → "es-ES")
 *   2. Base-language match (e.g. "es-MX" → "es-ES", "pt-BR" → "pt-PT")
 *   3. No match → falls back to null (caller uses 'en-US')
 */
function detectBrowserLanguage(): string | null {
  const browserLangs: readonly string[] =
    typeof navigator !== 'undefined'
      ? navigator.languages || [navigator.language]
      : [];

  // Built-in languages are always available
  const builtIn = ['en-US', 'es-ES'];
  const customEnabled = loadEnabledLanguageCodes();
  const allAvailable = [...new Set([...builtIn, ...customEnabled])];

  // Build a lookup: "en-us" → "en-US", "es" → "es-ES", "es-es" → "es-ES"
  const codeMap = new Map<string, string>();
  for (const code of allAvailable) {
    // exact
    codeMap.set(code.toLowerCase(), code);
    // base language (e.g. "es" from "es-ES")
    const base = code.split('-')[0].toLowerCase();
    if (!codeMap.has(base)) {
      codeMap.set(base, code);
    }
  }

  for (const bl of browserLangs) {
    const normalized = bl.trim().toLowerCase();
    // Try exact
    if (codeMap.has(normalized)) return codeMap.get(normalized)!;
    // Try base
    const base = normalized.split('-')[0];
    if (codeMap.has(base)) return codeMap.get(base)!;
  }

  return null;
}

/** Set the HTML <html lang="..."> attribute for accessibility & SEO. */
function setHtmlLang(code: string) {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = code;
  }
}

/**
 * Auto-detect language on first visit.
 * If the user has never picked a language (no portbuff-lang in localStorage)
 * and auto mode is on (or unset), detect from browser and switch.
 */
function autoDetectAndSet(): string {
  const isAuto = localStorage.getItem(LANG_AUTO_KEY);
  const hasManualChoice = localStorage.getItem(LANG_KEY) !== null;

  // If user has explicitly chosen a language before AND auto is not on, use it
  if (hasManualChoice && isAuto !== 'true') {
    return localStorage.getItem(LANG_KEY)!;
  }

  // Either first visit or auto is on — detect
  const detected = detectBrowserLanguage();
  if (detected) {
    localStorage.setItem(LANG_KEY, detected);
    setHtmlLang(detected);
    return detected;
  }

  // Nothing matched — use English
  localStorage.setItem(LANG_KEY, 'en-US');
  setHtmlLang('en-US');
  return 'en-US';
}

// ── Init ──

const resolvedLang = autoDetectAndSet();

i18n.use(initReactI18next).init({
  resources: {
    'en-US': { translation: enUS },
    'es-ES': { translation: esES },
  },
  lng: resolvedLang,
  fallbackLng: 'en-US',
  interpolation: {
    escapeValue: false,
  },
});

// Register any previously saved custom translations
registerAllSavedTranslations();

// ── Public API ──

/**
 * Register a language's translations with i18next at runtime.
 * Built-in languages (en-US, es-ES) are skipped — they are statically imported.
 */
export function registerTranslations(code: string, translations: Record<string, string>) {
  if (!code || Object.keys(translations).length === 0) return;
  if (code === 'en-US' || code === 'es-ES') return;
  i18n.addResources(code, 'translation', translations);
}

/** Register all saved custom translations (called on boot). */
export function registerAllSavedTranslations() {
  const languages = loadSavedTranslations();
  for (const lang of languages) {
    if (lang.enabled && lang.translations && Object.keys(lang.translations).length > 0) {
      registerTranslations(lang.code, lang.translations);
    }
  }
}

/** Switch language manually. Turns auto-detect OFF. */
export const changeLanguage = (lang: string) => {
  i18n.changeLanguage(lang);
  localStorage.setItem(LANG_KEY, lang);
  localStorage.setItem(LANG_AUTO_KEY, 'false');
  setHtmlLang(lang);
};

/** Enable auto-detect mode. Immediately detects and switches. */
export const enableAutoDetect = (): string => {
  localStorage.setItem(LANG_AUTO_KEY, 'true');
  const detected = detectBrowserLanguage();
  const chosen = detected || 'en-US';
  i18n.changeLanguage(chosen);
  localStorage.setItem(LANG_KEY, chosen);
  setHtmlLang(chosen);
  return chosen;
};

/** Check if auto-detect is currently enabled. */
export const isAutoDetectEnabled = (): boolean => {
  return localStorage.getItem(LANG_AUTO_KEY) !== 'false';
};

/** Get the raw browser language list for display purposes. */
export const getBrowserLanguages = (): readonly string[] => {
  if (typeof navigator !== 'undefined') {
    return navigator.languages || [navigator.language];
  }
  return [];
};

export default i18n;

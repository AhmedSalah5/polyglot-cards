import { loadLanguages, saveLanguages } from "./storage.js";

// Complete class strings, so Tailwind can find them
export const BADGES = [
  "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
  "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200",
  "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-200",
  "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-200",
  "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200",
  "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-200",
  "bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200",
  "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-200",
];
const FALLBACK_BADGE = "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200";

// These keep the same codes your existing cards already use
const DEFAULTS = [
  { code: "en", name: "English", locale: "en-US", color: 0 },
  { code: "de", name: "Deutsch", locale: "de-DE", color: 1 },
  { code: "es", name: "Español", locale: "es-ES", color: 2 },
];

// [code, name shown in the app, English name, locale for speech]
const PRESET_ROWS = [
  ["fr", "Français", "French", "fr-FR"],
  ["it", "Italiano", "Italian", "it-IT"],
  ["pt-br", "Português (Brasil)", "Portuguese (Brazil)", "pt-BR"],
  ["pt-pt", "Português (Portugal)", "Portuguese (Portugal)", "pt-PT"],
  ["nl", "Nederlands", "Dutch", "nl-NL"],
  ["sv", "Svenska", "Swedish", "sv-SE"],
  ["da", "Dansk", "Danish", "da-DK"],
  ["nb", "Norsk", "Norwegian", "nb-NO"],
  ["fi", "Suomi", "Finnish", "fi-FI"],
  ["pl", "Polski", "Polish", "pl-PL"],
  ["cs", "Čeština", "Czech", "cs-CZ"],
  ["tr", "Türkçe", "Turkish", "tr-TR"],
  ["el", "Ελληνικά", "Greek", "el-GR"],
  ["ru", "Русский", "Russian", "ru-RU"],
  ["uk", "Українська", "Ukrainian", "uk-UA"],
  ["ar", "العربية", "Arabic", "ar-SA"],
  ["he", "עברית", "Hebrew", "he-IL"],
  ["hi", "हिन्दी", "Hindi", "hi-IN"],
  ["id", "Bahasa Indonesia", "Indonesian", "id-ID"],
  ["vi", "Tiếng Việt", "Vietnamese", "vi-VN"],
  ["th", "ไทย", "Thai", "th-TH"],
  ["ja", "日本語", "Japanese", "ja-JP"],
  ["ko", "한국어", "Korean", "ko-KR"],
  ["zh", "中文", "Chinese (Mandarin)", "zh-CN"],
];

export const PRESETS = PRESET_ROWS.map(([code, name, english, locale]) => ({
  code,
  name,
  english,
  locale,
}));

const saved = loadLanguages();
let languages = Array.isArray(saved) && saved.length ? saved : DEFAULTS;

function validLocale(locale) {
  try {
    return Intl.getCanonicalLocales(locale)[0] ?? "en-US";
  } catch {
    return "en-US";
  }
}

function nextColor() {
  const used = new Set(languages.map((lang) => lang.color));
  const free = BADGES.findIndex((_, index) => !used.has(index));
  return free === -1 ? languages.length % BADGES.length : free;
}

export function getLanguages() {
  return languages;
}

export function hasLanguage(code) {
  return languages.some((lang) => lang.code === code);
}

// Always returns something, even if a code is unknown
export function getLang(code) {
  return languages.find((lang) => lang.code === code) ?? { code, name: code, locale: "en-US", color: -1 };
}

export function badgeClass(lang) {
  return BADGES[lang.color] ?? FALLBACK_BADGE;
}

export function addLanguage({ code, name, locale }) {
  if (hasLanguage(code)) throw new Error(`${name} is already in your list.`);
  languages = [...languages, { code, name, locale: validLocale(locale), color: nextColor() }];
  saveLanguages(languages);
  return languages[languages.length - 1];
}

export function removeLanguage(code) {
  languages = languages.filter((lang) => lang.code !== code);
  saveLanguages(languages);
}

// For the "custom language" form: checks the code and builds a unique id
export function buildCustomLanguage(name, localeInput) {
  let locale;
  try {
    locale = Intl.getCanonicalLocales(localeInput.trim())[0];
  } catch {
    locale = null;
  }
  if (!locale) throw new Error("That language code isn't valid. Examples: fr-FR, pt-BR, ja-JP.");

  const base = locale.split("-")[0].toLowerCase();
  const code = hasLanguage(base) ? locale.toLowerCase() : base;
  return { code, name: name.trim(), locale };
}
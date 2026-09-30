const CARDS_KEY = "polyglot-cards";
const LOG_KEY = "polyglot-review-log";

function read(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

export const loadCards = () => read(CARDS_KEY, []);
export const saveCards = (cards) => localStorage.setItem(CARDS_KEY, JSON.stringify(cards));

export const loadLog = () => read(LOG_KEY, {});
export const saveLog = (log) => localStorage.setItem(LOG_KEY, JSON.stringify(log));

const LANG_KEY = "polyglot-languages";

export const loadLanguages = () => read(LANG_KEY, null);
export const saveLanguages = (languages) => localStorage.setItem(LANG_KEY, JSON.stringify(languages));
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
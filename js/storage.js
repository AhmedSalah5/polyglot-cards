const KEY = "polyglot-cards";

export function loadCards() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? [];
  } catch {
    return [];
  }
}

export function saveCards(cards) {
  localStorage.setItem(KEY, JSON.stringify(cards));
}
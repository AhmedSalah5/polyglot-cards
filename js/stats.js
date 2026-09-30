import { isDue } from "./srs.js";

const $ = (id) => document.getElementById(id);

// "2026-09-30" in the user's LOCAL time zone (the en-CA format is year-month-day)
export function dayKey(date = new Date()) {
  return date.toLocaleDateString("en-CA");
}

// The log looks like { "2026-09-30": 12, "2026-10-01": 8 }
export function recordReview(log) {
  const key = dayKey();
  return { ...log, [key]: (log[key] ?? 0) + 1 };
}

export function calcStreak(log) {
  let streak = 0;
  const day = new Date();

  // If you haven't reviewed yet today, the streak is still alive from yesterday
  if (!log[dayKey(day)]) day.setDate(day.getDate() - 1);

  while (log[dayKey(day)]) {
    streak++;
    day.setDate(day.getDate() - 1);
  }
  return streak;
}

export function renderStats(cards, log) {
  $("stat-total").textContent = cards.length;
  $("stat-due").textContent = cards.filter((card) => isDue(card)).length;
  $("stat-learned").textContent = cards.filter((card) => card.interval >= 21).length;
  $("stat-today").textContent = log[dayKey()] ?? 0;
  $("stat-streak").textContent = calcStreak(log);
}
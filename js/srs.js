const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;

export function newSrsFields() {
  return { ease: 2.5, interval: 0, reps: 0, due: Date.now() };
}

// Old cards saved in Phase 2 don't have these fields yet
export function withSrsDefaults(card) {
  return { ...newSrsFields(), ...card };
}

export function isDue(card, now = Date.now()) {
  return card.due <= now;
}

// rating: 0 = Again, 1 = Hard, 2 = Good, 3 = Easy
// Returns a NEW card object; the original is not changed.
export function review(card, rating, now = Date.now()) {
  let { ease, interval, reps } = card;

  if (rating === 0) {
    return {
      ...card,
      ease: Math.max(1.3, ease - 0.2),
      interval: 0,
      reps: 0,
      due: now + 10 * MINUTE,
    };
  }

  if (rating === 1) {
    interval = Math.max(1, Math.round(interval * 1.2));
    ease = Math.max(1.3, ease - 0.15);
  } else if (rating === 2) {
    interval = reps === 0 ? 1 : reps === 1 ? 3 : Math.round(interval * ease);
  } else {
    interval = reps === 0 ? 3 : reps === 1 ? 6 : Math.round(interval * ease * 1.3);
    ease += 0.15;
  }

  return { ...card, ease, interval, reps: reps + 1, due: now + interval * DAY };
}

// Turns milliseconds into a short label like "10m", "3d", "2mo"
export function intervalLabel(ms) {
  if (ms < 60 * MINUTE) return `${Math.max(1, Math.round(ms / MINUTE))}m`;
  const days = Math.max(1, Math.round(ms / DAY));
  if (days < 30) return `${days}d`;
  if (days < 365) return `${Math.round(days / 30)}mo`;
  return `${(days / 365).toFixed(1)}y`;
}
import { isDue, review, intervalLabel } from "./srs.js";
import { LANGUAGES } from "./ui.js";
import { speak } from "./speech.js";

const $ = (id) => document.getElementById(id);

export function createReviewer(onRate) {
  let queue = [];
  let current = null;

  const showBtn = $("show-answer");
  const answerEl = $("review-answer");
  const ratingEl = $("rating-buttons");

  function start(cards) {
    queue = cards.filter((card) => isDue(card));
    next();
  }

  function next() {
    current = queue.shift() ?? null;

    $("review-done").classList.toggle("hidden", current !== null);
    $("review-card").classList.toggle("hidden", current === null);
    $("review-remaining").textContent = current
      ? `${queue.length + 1} left in this session`
      : "";
    if (!current) return;

    const lang = LANGUAGES[current.lang];
    const badge = $("review-lang");
    badge.className = `inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${lang.badge}`;
    badge.textContent = lang.name;

    $("review-word").textContent = current.word;
    $("review-translation").textContent = current.translation;
    $("review-sentence").textContent = current.sentence;
    $("speak-sentence").classList.toggle("hidden", !current.sentence);


    answerEl.classList.add("hidden");
    ratingEl.classList.add("hidden");
    showBtn.classList.remove("hidden");
  }

  function reveal() {
    if (!current) return;

    // Show what each button would do, e.g. "Good · 3d"
    for (const btn of ratingEl.querySelectorAll("[data-rating]")) {
      const preview = review(current, Number(btn.dataset.rating));
      btn.querySelector("[data-hint]").textContent = intervalLabel(preview.due - Date.now());
    }

    answerEl.classList.remove("hidden");
    ratingEl.classList.remove("hidden");
    showBtn.classList.add("hidden");
  }

  function rate(rating) {
    const updated = review(current, rating);
    onRate(updated);
    if (rating === 0) queue.push(updated); // "Again" cards return later in this session
    next();
  }

  showBtn.addEventListener("click", reveal);
  for (const btn of ratingEl.querySelectorAll("[data-rating]")) {
    btn.addEventListener("click", () => rate(Number(btn.dataset.rating)));
  }


  $("speak-word").addEventListener("click", () => current && speak(current.word, current.lang));
  $("speak-sentence").addEventListener("click", () => current?.sentence && speak(current.sentence, current.lang));

  return { start };
}
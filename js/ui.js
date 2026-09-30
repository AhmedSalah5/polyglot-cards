const LANGUAGES = {
  en: { name: "English", badge: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200" },
  de: { name: "Deutsch", badge: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" },
  es: { name: "Español", badge: "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200" },
};

export function renderCards(cards, listEl, countEl, onDelete) {
  listEl.innerHTML = "";
  countEl.textContent = cards.length;

  if (cards.length === 0) {
    const empty = document.createElement("li");
    empty.className = "rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-500 dark:border-slate-600 dark:text-slate-400";
    empty.textContent = "No cards yet. Add your first word above.";
    listEl.append(empty);
    return;
  }

  for (const card of cards) {
    const lang = LANGUAGES[card.lang];

    const li = document.createElement("li");
    li.className = "grid gap-1 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700";

    const top = document.createElement("div");
    top.className = "flex items-center justify-between";

    const badge = document.createElement("span");
    badge.className = `rounded-full px-2.5 py-0.5 text-xs font-medium ${lang.badge}`;
    badge.textContent = lang.name;

    const del = document.createElement("button");
    del.className = "cursor-pointer text-xs text-slate-400 transition hover:text-red-500";
    del.textContent = "Delete";
    del.addEventListener("click", () => onDelete(card.id));

    top.append(badge, del);

    const word = document.createElement("div");
    word.className = "text-lg font-semibold";
    word.textContent = card.word;

    const translation = document.createElement("div");
    translation.className = "text-slate-600 dark:text-slate-300";
    translation.textContent = card.translation;

    li.append(top, word, translation);

    if (card.sentence) {
      const sentence = document.createElement("div");
      sentence.className = "mt-1 text-sm italic text-slate-500 dark:text-slate-400";
      sentence.textContent = card.sentence;
      li.append(sentence);
    }

    listEl.append(li);
  }
}
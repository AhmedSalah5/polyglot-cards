import { speak } from "./speech.js";
import { getLang, badgeClass } from "./languages.js";


function speakButton(text, lang) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "speak";
  btn.title = "Listen";
  btn.setAttribute("aria-label", "Listen");
  btn.textContent = "🔊";
  btn.addEventListener("click", () => speak(text, lang));
  return btn;
}

export function renderCards(cards, listEl, countEl, onDelete, onEdit) {
  listEl.innerHTML = "";
  countEl.textContent = cards.length;

  if (cards.length === 0) {
    const empty = document.createElement("li");
    empty.className = "rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-500 dark:border-slate-600 dark:text-slate-400";
    empty.textContent = "No cards to show.";
    listEl.append(empty);
    return;
  }

  for (const card of cards) {
    const lang = getLang(card.lang);

    const li = document.createElement("li");
    li.className = "grid gap-1 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700";

    const top = document.createElement("div");
    top.className = "flex items-center justify-between";

    const badge = document.createElement("span");
    // badge.className = `rounded-full px-2.5 py-0.5 text-xs font-medium ${lang.badge}`;
    badge.className = `rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeClass(lang)}`;
    badge.textContent = lang.name;

    const del = document.createElement("button");
    del.className = "cursor-pointer text-xs text-slate-400 transition hover:text-red-500";
    del.textContent = "Delete";
    del.addEventListener("click", () => onDelete(card.id));

    const edit = document.createElement("button");
    edit.className = "cursor-pointer text-xs text-slate-400 transition hover:text-indigo-500";
    edit.textContent = "Edit";
    edit.addEventListener("click", () => onEdit(card.id));

    const actions = document.createElement("div");
    actions.className = "flex gap-3";
    actions.append(edit, del);

    top.append(badge, actions);

    const wordRow = document.createElement("div");
    wordRow.className = "flex items-center gap-2";
    const word = document.createElement("span");
    word.className = "text-lg font-semibold";
    word.textContent = card.word;
    word.dir = "auto";
    wordRow.append(word, speakButton(card.word, card.lang));

    const translation = document.createElement("div");
    translation.className = "text-slate-600 dark:text-slate-300";
    translation.textContent = card.translation;
    translation.dir = "auto";

    li.append(top, wordRow, translation);

    if (card.sentence) {
      const sentenceRow = document.createElement("div");
      sentenceRow.className = "mt-1 flex items-start gap-2";
      const sentence = document.createElement("span");
      sentence.className = "text-sm italic text-slate-500 dark:text-slate-400";
      sentence.textContent = card.sentence;
      sentence.dir = "auto";
      sentenceRow.append(sentence, speakButton(card.sentence, card.lang));
      li.append(sentenceRow);
    }

    listEl.append(li);
  }
}
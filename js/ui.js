const LANG_NAMES = { en: "English", de: "Deutsch", es: "Español" };

export function renderCards(cards, listEl, countEl, onDelete) {
  listEl.innerHTML = "";
  countEl.textContent = cards.length;

  for (const card of cards) {
    const li = document.createElement("li");
    li.className = "card";

    const top = document.createElement("div");
    top.className = "card-top";

    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = LANG_NAMES[card.lang];

    const del = document.createElement("button");
    del.className = "delete";
    del.textContent = "Delete";
    del.addEventListener("click", () => onDelete(card.id));

    top.append(badge, del);

    const word = document.createElement("strong");
    word.textContent = card.word;

    const translation = document.createElement("div");
    translation.textContent = card.translation;

    li.append(top, word, translation);

    if (card.sentence) {
      const sentence = document.createElement("em");
      sentence.textContent = card.sentence;
      li.append(sentence);
    }

    listEl.append(li);
  }
}
import { loadCards, saveCards } from "./storage.js";
import { renderCards } from "./ui.js";
import { newSrsFields, withSrsDefaults, isDue } from "./srs.js";
import { createReviewer } from "./review.js";
import { createReader } from "./reader.js";

const $ = (id) => document.getElementById(id);

const form = $("card-form");
const listEl = $("card-list");
const countEl = $("count");

let cards = loadCards().map(withSrsDefaults);

function updateDueCount() {
  const due = cards.filter((card) => isDue(card)).length;
  $("tab-review").textContent = `Review (${due})`;
}

function refresh() {
  renderCards(cards, listEl, countEl, deleteCard);
  updateDueCount();
}

function addCard({ lang, word, translation, sentence }) {
  cards.unshift({
    id: crypto.randomUUID(),
    lang,
    word,
    translation,
    sentence,
    createdAt: new Date().toISOString(),
    ...newSrsFields(),
  });
  saveCards(cards);
  refresh();
}

function deleteCard(id) {
  cards = cards.filter((card) => card.id !== id);
  saveCards(cards);
  refresh();
}

const reviewer = createReviewer((updatedCard) => {
  cards = cards.map((card) => (card.id === updatedCard.id ? updatedCard : card));
  saveCards(cards);
  updateDueCount();
});

const reader = createReader({ getCards: () => cards, onAdd: addCard });

const VIEWS = ["cards", "review", "reader"];

function showView(name) {
  for (const view of VIEWS) {
    $(`view-${view}`).classList.toggle("hidden", view !== name);
    $(`tab-${view}`).classList.toggle("tab-active", view === name);
  }
  if (name === "review") reviewer.start(cards);
  if (name === "reader") reader.refresh();
}

for (const view of VIEWS) {
  $(`tab-${view}`).addEventListener("click", () => showView(view));
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  addCard({
    lang: form.lang.value,
    word: form.word.value.trim(),
    translation: form.translation.value.trim(),
    sentence: form.sentence.value.trim(),
  });

  form.word.value = "";
  form.translation.value = "";
  form.sentence.value = "";
  form.word.focus();
});

refresh();
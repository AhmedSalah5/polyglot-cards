import { loadCards, saveCards } from "./storage.js";
import { renderCards } from "./ui.js";
import { newSrsFields, withSrsDefaults, isDue } from "./srs.js";
import { createReviewer } from "./review.js";

const $ = (id) => document.getElementById(id);

const form = $("card-form");
const listEl = $("card-list");
const countEl = $("count");

let cards = loadCards().map(withSrsDefaults);

const reviewer = createReviewer((updatedCard) => {
  cards = cards.map((card) => (card.id === updatedCard.id ? updatedCard : card));
  saveCards(cards);
  updateDueCount();
});

function updateDueCount() {
  const due = cards.filter((card) => isDue(card)).length;
  $("tab-review").textContent = `Review (${due})`;
}

function refresh() {
  renderCards(cards, listEl, countEl, deleteCard);
  updateDueCount();
}

function deleteCard(id) {
  cards = cards.filter((card) => card.id !== id);
  saveCards(cards);
  refresh();
}

function showView(name) {
  $("view-cards").classList.toggle("hidden", name !== "cards");
  $("view-review").classList.toggle("hidden", name !== "review");
  $("tab-cards").classList.toggle("tab-active", name === "cards");
  $("tab-review").classList.toggle("tab-active", name === "review");
  if (name === "review") reviewer.start(cards);
}

$("tab-cards").addEventListener("click", () => showView("cards"));
$("tab-review").addEventListener("click", () => showView("review"));

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const card = {
    id: crypto.randomUUID(),
    lang: form.lang.value,
    word: form.word.value.trim(),
    translation: form.translation.value.trim(),
    sentence: form.sentence.value.trim(),
    createdAt: new Date().toISOString(),
    ...newSrsFields(),
  };

  cards.unshift(card);
  saveCards(cards);
  refresh();

  form.word.value = "";
  form.translation.value = "";
  form.sentence.value = "";
  form.word.focus();
});

refresh();
import { loadCards, saveCards, loadLog, saveLog } from "./storage.js";
import { renderCards } from "./ui.js";
import { newSrsFields, withSrsDefaults, isDue } from "./srs.js";
import { createReviewer } from "./review.js";
import { createReader } from "./reader.js";
import { recordReview, renderStats } from "./stats.js";
import { downloadBackup, parseBackup } from "./backup.js";

const $ = (id) => document.getElementById(id);
const form = $("card-form");

let cards = loadCards().map(withSrsDefaults);
let reviewLog = loadLog();
let editingId = null;
const filters = { lang: "all", query: "" };

// ---------- helpers ----------

function visibleCards() {
  const q = filters.query.toLowerCase();
  return cards.filter((card) => {
    if (filters.lang !== "all" && card.lang !== filters.lang) return false;
    if (!q) return true;
    return [card.word, card.translation, card.sentence ?? ""].some((text) =>
      text.toLowerCase().includes(q)
    );
  });
}

function updateDueCount() {
  const due = cards.filter((card) => isDue(card)).length;
  $("tab-review").textContent = `Review (${due})`;
}

function refresh() {
  renderCards(visibleCards(), $("card-list"), $("count"), deleteCard, startEdit);
  updateDueCount();
  renderStats(cards, reviewLog);
}

// ---------- add / edit / delete ----------

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

function clearFields() {
  form.word.value = "";
  form.translation.value = "";
  form.sentence.value = "";
}

function startEdit(id) {
  const card = cards.find((c) => c.id === id);
  if (!card) return;

  editingId = id;
  form.lang.value = card.lang;
  form.word.value = card.word;
  form.translation.value = card.translation;
  form.sentence.value = card.sentence ?? "";

  $("edit-banner").classList.remove("hidden");
  $("cancel-edit").classList.remove("hidden");
  $("submit-btn").textContent = "Save changes";

  form.scrollIntoView({ behavior: "smooth" });
  form.word.focus();
}

function stopEdit() {
  editingId = null;
  clearFields();
  $("edit-banner").classList.add("hidden");
  $("cancel-edit").classList.add("hidden");
  $("submit-btn").textContent = "Add card";
}

function deleteCard(id) {
  if (id === editingId) stopEdit();
  cards = cards.filter((card) => card.id !== id);
  saveCards(cards);
  refresh();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const fields = {
    lang: form.lang.value,
    word: form.word.value.trim(),
    translation: form.translation.value.trim(),
    sentence: form.sentence.value.trim(),
  };

  if (editingId) {
    cards = cards.map((card) => (card.id === editingId ? { ...card, ...fields } : card));
    saveCards(cards);
    stopEdit();
    refresh();
  } else {
    addCard(fields);
    clearFields();
  }
  form.word.focus();
});

$("cancel-edit").addEventListener("click", stopEdit);

// ---------- search and filter ----------

$("filter-lang").addEventListener("change", (event) => {
  filters.lang = event.target.value;
  refresh();
});

$("search").addEventListener("input", (event) => {
  filters.query = event.target.value.trim();
  refresh();
});

// ---------- review and reader ----------

const reviewer = createReviewer((updatedCard) => {
  cards = cards.map((card) => (card.id === updatedCard.id ? updatedCard : card));
  reviewLog = recordReview(reviewLog);
  saveCards(cards);
  saveLog(reviewLog);
  updateDueCount();
  renderStats(cards, reviewLog);
});

const reader = createReader({ getCards: () => cards, onAdd: addCard });

// ---------- backup ----------

async function importBackup(file) {
  const status = $("backup-status");
  try {
    const { cards: incoming, reviewLog: incomingLog } = parseBackup(await file.text());

    const existingIds = new Set(cards.map((card) => card.id));
    const fresh = incoming.filter((card) => !existingIds.has(card.id)).map(withSrsDefaults);

    cards = [...fresh, ...cards];
    for (const [day, count] of Object.entries(incomingLog)) {
      reviewLog[day] = Math.max(reviewLog[day] ?? 0, Number(count) || 0);
    }

    saveCards(cards);
    saveLog(reviewLog);
    refresh();
    status.textContent = `Imported ${fresh.length} new cards (${incoming.length - fresh.length} already existed).`;
  } catch (error) {
    status.textContent = `Import failed: ${error.message}`;
  }
}

$("export-btn").addEventListener("click", () => {
  downloadBackup(cards, reviewLog);
  $("backup-status").textContent = `Exported ${cards.length} cards.`;
});

$("import-btn").addEventListener("click", () => $("import-file").click());

$("import-file").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (file) await importBackup(file);
  event.target.value = ""; // lets you pick the same file again later
});

// ---------- tabs ----------

const VIEWS = ["cards", "review", "reader", "stats"];

function showView(name) {
  for (const view of VIEWS) {
    $(`view-${view}`).classList.toggle("hidden", view !== name);
    $(`tab-${view}`).classList.toggle("tab-active", view === name);
  }
  if (name === "review") reviewer.start(cards);
  if (name === "reader") reader.refresh();
  if (name === "stats") renderStats(cards, reviewLog);
}

for (const view of VIEWS) {
  $(`tab-${view}`).addEventListener("click", () => showView(view));
}

refresh();
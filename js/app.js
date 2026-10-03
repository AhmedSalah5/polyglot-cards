import { loadCards, saveCards, loadLog, saveLog } from "./storage.js";
import { renderCards } from "./ui.js";
import { initTheme } from "./theme.js";
import { newSrsFields, withSrsDefaults, isDue } from "./srs.js";
import { createReviewer } from "./review.js";
import { createReader } from "./reader.js";
import { recordReview, renderStats } from "./stats.js";
import { downloadBackup, parseBackup } from "./backup.js";
import {
  PRESETS,
  getLanguages,
  badgeClass,
  addLanguage,
  removeLanguage,
  hasLanguage,
  buildCustomLanguage,
} from "./languages.js";
import { speechSupported, hasVoice } from "./speech.js";

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

// ---------- languages ----------

function fillSelect(select, { withAll = false } = {}) {
  const current = select.value;
  select.innerHTML = "";
  if (withAll) select.append(new Option("All languages", "all"));
  for (const lang of getLanguages()) select.append(new Option(lang.name, lang.code));
  if ([...select.options].some((option) => option.value === current)) select.value = current;
}

function populateLanguageSelects() {
  fillSelect($("lang"));
  fillSelect($("reader-lang"));
  fillSelect($("filter-lang"), { withAll: true });
  filters.lang = $("filter-lang").value;

  const presetSelect = $("preset-select");
  presetSelect.innerHTML = "";
  for (const preset of PRESETS.filter((p) => !hasLanguage(p.code))) {
    presetSelect.append(new Option(`${preset.name} — ${preset.english}`, preset.code));
  }
  $("add-language-btn").disabled = presetSelect.options.length === 0;
}

function renderLanguageList() {
  const list = $("language-list");
  list.innerHTML = "";
  const all = getLanguages();

  for (const lang of all) {
    const count = cards.filter((card) => card.lang === lang.code).length;

    const li = document.createElement("li");
    li.className =
      "flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700";

    const left = document.createElement("div");
    left.className = "flex flex-wrap items-center gap-2";

    const badge = document.createElement("span");
    badge.className = `rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeClass(lang)}`;
    badge.textContent = lang.name;
    badge.dir = "auto";

    const voice = !speechSupported ? "" : hasVoice(lang.locale) ? " · voice available" : " · no voice installed";
    const info = document.createElement("span");
    info.className = "text-sm text-slate-500 dark:text-slate-400";
    info.textContent = `${lang.locale} · ${count} ${count === 1 ? "card" : "cards"}${voice}`;

    left.append(badge, info);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Remove";
    remove.className =
      "cursor-pointer text-sm text-slate-400 transition hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-slate-400";
    remove.disabled = count > 0 || all.length === 1;
    remove.title =
      count > 0 ? "Move or delete this language's cards first" : all.length === 1 ? "Keep at least one language" : "Remove";
    remove.addEventListener("click", () => {
      removeLanguage(lang.code);
      populateLanguageSelects();
      renderLanguageList();
      $("language-status").textContent = `${lang.name} removed.`;
    });

    li.append(left, remove);
    list.append(li);
  }
}

function addNewLanguage(lang) {
  const added = addLanguage(lang);
  populateLanguageSelects();
  renderLanguageList();

  const noVoice = speechSupported && !hasVoice(added.locale);
  $("language-status").textContent =
    `${added.name} added.` +
    (noVoice ? " Your device has no voice for it yet, so pronunciation may not work." : "");
}

$("add-language-btn").addEventListener("click", () => {
  const preset = PRESETS.find((p) => p.code === $("preset-select").value);
  if (!preset) return;
  try {
    addNewLanguage(preset);
  } catch (error) {
    $("language-status").textContent = error.message;
  }
});

$("custom-language-form").addEventListener("submit", (event) => {
  event.preventDefault();
  try {
    addNewLanguage(buildCustomLanguage($("custom-name").value, $("custom-locale").value));
    event.target.reset();
  } catch (error) {
    $("language-status").textContent = error.message;
  }
});

// Voices can load a moment after the page opens
if (speechSupported) window.speechSynthesis.addEventListener("voiceschanged", renderLanguageList);

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
    const {
      cards: incoming,
      reviewLog: incomingLog,
      languages: incomingLanguages,
    } = parseBackup(await file.text());

    const existingIds = new Set(cards.map((card) => card.id));
    const fresh = incoming.filter((card) => !existingIds.has(card.id)).map(withSrsDefaults);

    // Make sure every language used by the imported cards exists here
    for (const card of fresh) {
      if (hasLanguage(card.lang)) continue;
      const def = incomingLanguages.find((lang) => lang.code === card.lang);
      addLanguage({
        code: card.lang,
        name: def?.name ?? card.lang,
        locale: def?.locale ?? "en-US",
      });
    }

    cards = [...fresh, ...cards];
    for (const [day, count] of Object.entries(incomingLog)) {
      reviewLog[day] = Math.max(reviewLog[day] ?? 0, Number(count) || 0);
    }

    saveCards(cards);
    saveLog(reviewLog);
    populateLanguageSelects();
    renderLanguageList();
    refresh();
    status.textContent = `Imported ${fresh.length} new cards (${incoming.length - fresh.length} already existed).`;
  } catch (error) {
    status.textContent = `Import failed: ${error.message}`;
  }
}

$("export-btn").addEventListener("click", () => {
  downloadBackup(cards, reviewLog, getLanguages());
  $("backup-status").textContent = `Exported ${cards.length} cards.`;
});

$("import-btn").addEventListener("click", () => $("import-file").click());

$("import-file").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (file) await importBackup(file);
  event.target.value = ""; // lets you pick the same file again later
});

// ---------- tabs ----------

const VIEWS = ["cards", "review", "reader", "stats", "languages"];

function showView(name) {
  for (const view of VIEWS) {
    $(`view-${view}`).classList.toggle("hidden", view !== name);
    $(`tab-${view}`).classList.toggle("tab-active", view === name);
  }
  if (name === "review") reviewer.start(cards);
  if (name === "reader") reader.refresh();
  if (name === "stats") renderStats(cards, reviewLog);
  if (name === "languages") renderLanguageList();
}

for (const view of VIEWS) {
  $(`tab-${view}`).addEventListener("click", () => showView(view));
}

// ---------- start ----------
initTheme();
populateLanguageSelects();

refresh();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("service-worker.js")
    .catch((error) => console.warn("Service worker failed:", error));
}
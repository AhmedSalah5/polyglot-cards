// const greetings = [
//   { lang: "en-US", text: "Hello!" },
//   { lang: "de-DE", text: "Hallo!" },
//   { lang: "es-ES", text: "¡Hola!" },
// ];

// const button = document.getElementById("hello-btn");
// const output = document.getElementById("output");

// button.addEventListener("click", () => {
//   const pick = greetings[Math.floor(Math.random() * greetings.length)];
//   output.textContent = pick.text;

//   const speech = new SpeechSynthesisUtterance(pick.text);
//   speech.lang = pick.lang;
//   window.speechSynthesis.speak(speech);
// });

import { loadCards, saveCards } from "./storage.js";
import { renderCards } from "./ui.js";

const form = document.getElementById("card-form");
const listEl = document.getElementById("card-list");
const countEl = document.getElementById("count");

let cards = loadCards();

function refresh() {
  renderCards(cards, listEl, countEl, deleteCard);
}

function deleteCard(id) {
  cards = cards.filter((card) => card.id !== id);
  saveCards(cards);
  refresh();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const card = {
    id: crypto.randomUUID(),
    lang: form.lang.value,
    word: form.word.value.trim(),
    translation: form.translation.value.trim(),
    sentence: form.sentence.value.trim(),
    createdAt: new Date().toISOString(),
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
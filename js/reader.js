import { speak } from "./speech.js";

const $ = (id) => document.getElementById(id);

// Letters from any language (ä, ö, ü, ß, ñ, é...), allowing inner ' or -
const WORD = /\p{L}+(?:['’-]\p{L}+)*/gu;

export function createReader({ getCards, onAdd }) {
  let words = [];      // every clickable word: { span, word }
  let selected = null; // the word the user clicked: { word, sentence, span }
  let textLang = "de"; // language of the loaded text

  function isKnown(word) {
    const w = word.toLowerCase();
    return getCards().some((c) => c.lang === textLang && c.word.toLowerCase() === w);
  }

  function markKnown() {
    for (const { span, word } of words) {
      const known = isKnown(word);
      span.classList.toggle("bg-green-100", known);
      span.classList.toggle("dark:bg-green-900", known);
    }
  }

  function closePanel() {
    if (selected) selected.span.classList.remove("ring-2", "ring-indigo-400");
    selected = null;
    $("word-panel").classList.add("hidden");
  }

  function select(word, sentence, span) {
    if (selected) selected.span.classList.remove("ring-2", "ring-indigo-400");
    selected = { word, sentence, span };
    span.classList.add("ring-2", "ring-indigo-400");

    $("panel-word").textContent = word;
    $("panel-sentence").textContent = sentence;
    $("panel-translation").value = "";
    $("panel-status").textContent = isKnown(word) ? "Already in your deck." : "";

    const q = encodeURIComponent(word);
    $("link-translate").href = `https://translate.google.com/?sl=${textLang}&text=${q}&op=translate`;
    $("link-wiktionary").href = `https://en.wiktionary.org/wiki/${q}`;

    $("word-panel").classList.remove("hidden");
    $("panel-translation").focus();
    speak(word, textLang);
  }

  function renderSentence(sentence, paragraph) {
    let last = 0;
    for (const match of sentence.matchAll(WORD)) {
      if (match.index > last) paragraph.append(sentence.slice(last, match.index));

      const span = document.createElement("span");
      span.textContent = match[0];
      span.className = "cursor-pointer rounded px-0.5 hover:bg-indigo-100 dark:hover:bg-indigo-900";
      span.addEventListener("click", () => select(match[0], sentence, span));

      words.push({ span, word: match[0] });
      paragraph.append(span);
      last = match.index + match[0].length;
    }
    if (last < sentence.length) paragraph.append(sentence.slice(last));
    paragraph.append(" ");
  }

  function load() {
    const text = $("reader-input").value.trim();
    textLang = $("reader-lang").value;

    const container = $("reader-text");
    container.innerHTML = "";
    words = [];
    closePanel();

    for (const line of text.split(/\n+/)) {
      const paragraph = document.createElement("p");
      const sentences = line.match(/[^.!?]+[.!?]*/g) ?? [];
      for (const raw of sentences) {
        const sentence = raw.trim();
        if (sentence) renderSentence(sentence, paragraph);
      }
      if (paragraph.childNodes.length) container.append(paragraph);
    }
    markKnown();
  }

  function add() {
    if (!selected) return;
    const translation = $("panel-translation").value.trim();

    if (isKnown(selected.word)) {
      $("panel-status").textContent = "Already in your deck.";
      return;
    }
    if (!translation) {
      $("panel-status").textContent = "Type a translation first.";
      return;
    }

    onAdd({
      lang: textLang,
      word: selected.word,
      translation,
      sentence: selected.sentence,
    });
    markKnown();
    $("panel-status").textContent = "Added!";
  }

  $("reader-load").addEventListener("click", load);
  $("panel-close").addEventListener("click", closePanel);
  $("panel-add").addEventListener("click", add);
  $("panel-translation").addEventListener("keydown", (event) => {
    if (event.key === "Enter") add();
  });
  $("panel-speak").addEventListener("click", () => selected && speak(selected.word, textLang));
  $("panel-speak-sentence").addEventListener("click", () => selected && speak(selected.sentence, textLang));

  return { refresh: markKnown };
}
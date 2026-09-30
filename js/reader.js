import { speak } from "./speech.js";
import { getLang } from "./languages.js";

const $ = (id) => document.getElementById(id);
const HAS_LETTER = /\p{L}/u;

function splitSentences(text, locale) {
  if ("Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter(locale, { granularity: "sentence" });
    return [...segmenter.segment(text)].map((s) => s.segment.trim()).filter(Boolean);
  }
  // Fallback for very old browsers
  return text.match(/[^.!?。！？؟]+[.!?。！？؟]*/g)?.map((s) => s.trim()).filter(Boolean) ?? [];
}

// Returns pieces like [{ text: "Ich", isWord: true }, { text: " ", isWord: false }, ...]
function splitWords(sentence, locale) {
  if ("Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter(locale, { granularity: "word" });
    return [...segmenter.segment(sentence)].map((s) => ({
      text: s.segment,
      isWord: Boolean(s.isWordLike) && HAS_LETTER.test(s.segment),
    }));
  }
  // Fallback for very old browsers
  const parts = [];
  let last = 0;
  for (const m of sentence.matchAll(/[\p{L}\p{M}]+(?:['’-][\p{L}\p{M}]+)*/gu)) {
    if (m.index > last) parts.push({ text: sentence.slice(last, m.index), isWord: false });
    parts.push({ text: m[0], isWord: true });
    last = m.index + m[0].length;
  }
  if (last < sentence.length) parts.push({ text: sentence.slice(last), isWord: false });
  return parts;
}

export function createReader({ getCards, onAdd }) {
  let words = [];      // every clickable word: { span, word }
  let selected = null; // the word the user clicked: { word, sentence, span }
  let textLang = "";   // language code of the loaded text
  let textLocale = "en-US";

  $("panel-word").dir = "auto";
  $("panel-sentence").dir = "auto";

  function isKnown(word) {
    const w = word.toLocaleLowerCase(textLocale);
    return getCards().some(
      (c) => c.lang === textLang && c.word.toLocaleLowerCase(textLocale) === w
    );
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
    $("link-translate").href = `https://translate.google.com/?sl=auto&text=${q}&op=translate`;
    $("link-wiktionary").href = `https://en.wiktionary.org/wiki/${q}`;

    $("word-panel").classList.remove("hidden");
    $("panel-translation").focus();
    speak(word, textLang);
  }

  function renderSentence(sentence, paragraph) {
    for (const part of splitWords(sentence, textLocale)) {
      if (!part.isWord) {
        paragraph.append(part.text);
        continue;
      }

      const span = document.createElement("span");
      span.textContent = part.text;
      span.className = "cursor-pointer rounded px-0.5 hover:bg-indigo-100 dark:hover:bg-indigo-900";
      span.addEventListener("click", () => select(part.text, sentence, span));

      words.push({ span, word: part.text });
      paragraph.append(span);
    }
    paragraph.append(" ");
  }

  function load() {
    const text = $("reader-input").value.trim();
    textLang = $("reader-lang").value;
    textLocale = getLang(textLang).locale;

    const container = $("reader-text");
    container.innerHTML = "";
    words = [];
    closePanel();

    for (const line of text.split(/\n+/)) {
      const paragraph = document.createElement("p");
      paragraph.dir = "auto";
      for (const sentence of splitSentences(line, textLocale)) {
        renderSentence(sentence, paragraph);
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
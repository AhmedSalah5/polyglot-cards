import { getLang } from "./languages.js";

export const speechSupported = "speechSynthesis" in window;

// Some browsers load voices late, so ask for them early
if (speechSupported) window.speechSynthesis.getVoices();

const fix = (lang) => lang.replace("_", "-");

function pickVoice(locale) {
  const voices = window.speechSynthesis.getVoices();
  const base = locale.split("-")[0];
  return (
    voices.find((voice) => fix(voice.lang) === locale) ??
    voices.find((voice) => fix(voice.lang).split("-")[0] === base) ??
    null
  );
}

export function hasVoice(locale) {
  return speechSupported && pickVoice(locale) !== null;
}

export function speak(text, langCode) {
  if (!speechSupported || !text) return;

  const locale = getLang(langCode).locale;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = locale;
  utterance.rate = 0.9;

  const voice = pickVoice(locale);
  if (voice) utterance.voice = voice;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}
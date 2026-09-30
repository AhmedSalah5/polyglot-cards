const LOCALES = { en: "en-US", de: "de-DE", es: "es-ES" };

export const speechSupported = "speechSynthesis" in window;

// Some browsers load voices late, so ask for them early
if (speechSupported) window.speechSynthesis.getVoices();

function pickVoice(locale) {
  const voices = window.speechSynthesis.getVoices();
  const fix = (lang) => lang.replace("_", "-");
  return (
    voices.find((v) => fix(v.lang) === locale) ??
    voices.find((v) => fix(v.lang).startsWith(locale.slice(0, 2))) ??
    null
  );
}

export function speak(text, lang) {
  if (!speechSupported || !text) return;

  const locale = LOCALES[lang] ?? "en-US";
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = locale;
  utterance.rate = 0.9; // slightly slower is easier for learners

  const voice = pickVoice(locale);
  if (voice) utterance.voice = voice;

  window.speechSynthesis.cancel(); // stop anything already playing
  window.speechSynthesis.speak(utterance);
}
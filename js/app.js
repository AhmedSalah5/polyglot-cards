const greetings = [
  { lang: "en-US", text: "Hello!" },
  { lang: "de-DE", text: "Hallo!" },
  { lang: "es-ES", text: "¡Hola!" },
];

const button = document.getElementById("hello-btn");
const output = document.getElementById("output");

button.addEventListener("click", () => {
  const pick = greetings[Math.floor(Math.random() * greetings.length)];
  output.textContent = pick.text;

  const speech = new SpeechSynthesisUtterance(pick.text);
  speech.lang = pick.lang;
  window.speechSynthesis.speak(speech);
});
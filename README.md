# Polyglot Cards

A free flashcard app for learning vocabulary in **any language**, with spaced repetition, pronunciation, and a reader that turns real texts into flashcards.

**Live app:** https://ahmedsalah5.github.io/polyglot-cards/

## Features

- **Any language:** choose from about 25 built-in languages, or add your own with a language code
- **Spaced repetition:** rate each card Again / Hard / Good / Easy, and the app schedules the next review
- **Pronunciation:** text-to-speech for words and sentences, using the voices on your device
- **Reader:** paste a text, click any word, and add it to your deck together with its sentence; works with right-to-left scripts and languages written without spaces
- **Search, filter, and edit** your cards
- **Stats:** cards due, cards learned, reviews today, and a daily streak
- **Backup:** export and import your deck, languages, and progress as a file
- **Installable and offline:** works as an app on desktop and mobile, with dark mode

## Privacy

Everything is stored in your own browser. There is no account and no server, and your cards are never uploaded anywhere.

## Run it locally

```bash
git clone https://github.com/AhmedSalah5/polyglot-cards.git
cd polyglot-cards
npm install
npx @tailwindcss/cli -i ./src/input.css -o ./css/output.css --watch
```

Then serve the folder with any local web server (for example, the VS Code "Live Server" extension) and open it in your browser. Opening `index.html` directly from the file system won't work, because the app uses JavaScript modules.

## Built with

Plain HTML and JavaScript (no framework), Tailwind CSS, the Web Speech API for pronunciation, `Intl.Segmenter` for splitting text into words, and a service worker for offline use.
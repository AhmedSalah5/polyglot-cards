export function downloadBackup(cards, reviewLog, languages) {
  const data = {
    app: "polyglot-cards",
    version: 2,
    exportedAt: new Date().toISOString(),
    languages,
    cards,
    reviewLog,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `polyglot-cards-${new Date().toLocaleDateString("en-CA")}.json`;
  link.click();

  URL.revokeObjectURL(url);
}

// Reads the text of a backup file and returns only valid data.
// Throws an Error (with a readable message) if the file is not usable.
export function parseBackup(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("This file is not valid JSON.");
  }

  const isList = Array.isArray(data);
  const rawCards = isList ? data : data?.cards;
  if (!Array.isArray(rawCards)) throw new Error("No cards found in this file.");

  const cards = rawCards
    .filter(
      (c) =>
        c &&
        typeof c.lang === "string" && c.lang &&
        typeof c.word === "string" && c.word.trim() &&
        typeof c.translation === "string" && c.translation.trim()
    )
    .map((c) => ({
      ...c,
      id: c.id ?? crypto.randomUUID(),
      sentence: typeof c.sentence === "string" ? c.sentence : "",
    }));

  const reviewLog =
    !isList && data?.reviewLog && typeof data.reviewLog === "object" ? data.reviewLog : {};

  const languages =
    !isList && Array.isArray(data?.languages)
      ? data.languages.filter(
          (l) =>
            l &&
            typeof l.code === "string" &&
            typeof l.name === "string" &&
            typeof l.locale === "string"
        )
      : [];

  return { cards, reviewLog, languages };
}
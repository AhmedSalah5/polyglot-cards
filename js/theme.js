const KEY = "polyglot-theme"; // "light", "dark" or "system"
const media = window.matchMedia("(prefers-color-scheme: dark)");

export function getTheme() {
  try {
    return localStorage.getItem(KEY) || "system";
  } catch {
    return "system";
  }
}

function apply(theme) {
  const dark = theme === "dark" || (theme === "system" && media.matches);
  document.documentElement.classList.toggle("dark", dark);

  // Colors the phone's status bar to match
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", dark ? "#0f172a" : "#4f46e5");
}

function setTheme(theme) {
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    // Storage blocked: the theme still changes, it just won't be remembered
  }
  apply(theme);
}

export function initTheme() {
  const buttons = document.querySelectorAll("[data-theme]");
  function paint() {
    const current = getTheme();
    for (const button of buttons) {
      const active = button.dataset.theme === current;
      button.classList.toggle("theme-btn-active", active);
      button.setAttribute("aria-pressed", String(active));
    }
  }

  for (const button of buttons) {
    button.addEventListener("click", () => {
      setTheme(button.dataset.theme);
      paint();
    });
  }

  // In "Auto" mode, follow the device live
  media.addEventListener("change", () => {
    if (getTheme() === "system") apply("system");
  });

  apply(getTheme());
  paint();
}
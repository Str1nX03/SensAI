// src/utils/theme.js

export const THEMES = ['dark', 'light', 'sepia', 'handwritten'];

export const THEME_META = {
  dark:        { icon: '◐', label: 'Dark',        emoji: '🌑' },
  light:       { icon: '○', label: 'Light',       emoji: '☀️' },
  sepia:       { icon: '◑', label: 'Sepia',       emoji: '📜' },
  handwritten: { icon: '✎', label: 'Notes',       emoji: '✏️' },
};

export function getTheme() {
  return localStorage.getItem('sensai_theme') || 'dark';
}

export function setTheme(theme) {
  localStorage.setItem('sensai_theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
}

export function initTheme() {
  const saved = getTheme();
  document.documentElement.setAttribute('data-theme', saved);
  return saved;
}

export function cycleTheme() {
  const current = getTheme();
  const idx = THEMES.indexOf(current);
  const next = THEMES[(idx + 1) % THEMES.length];
  setTheme(next);
  return next;
}
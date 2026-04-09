// src/utils/theme.js

export const THEME_META = {
    dark: { id: "dark", label: "Dark" },
    light: { id: "light", label: "Light" }
};

const THEMES = ["dark", "light"];

export function getTheme() {
    return localStorage.getItem("sensai_theme") || "dark";
}

export function initTheme() {
    const current = getTheme();
    document.body.setAttribute("data-theme", current);
    return current;
}

export function cycleTheme() {
    const current = getTheme();
    const currentIndex = THEMES.indexOf(current);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    const nextTheme = THEMES[nextIndex];
    
    localStorage.setItem("sensai_theme", nextTheme);
    document.body.setAttribute("data-theme", nextTheme);
    
    return nextTheme;
}
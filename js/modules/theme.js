// =============================================
// THEME.JS — Tema claro / escuro
// =============================================
import { showToast } from '../utils/toast.js';

export function getTheme() {
    return localStorage.getItem('ph_theme') || (matchMedia('(prefers-color-scheme:light)').matches ? 'light' : 'dark');
}

export function setTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('ph_theme', t);
    document.querySelectorAll('.theme-icon').forEach(e => e.textContent = t === 'light' ? '☀️' : '🌙');
}

export function toggleTheme() {
    const n = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(n);
    showToast(n === 'light' ? 'Modo claro ☀️' : 'Modo escuro 🌙', 'info');
}

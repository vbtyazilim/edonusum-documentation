/**
 * THEME.JS — Dark/Light tema yönetimi
 * Bağımlılık: Yok (standalone)
 *
 * Kullanım:
 *   1. HTML'ye ekle: <script src="theme/theme.js"></script>
 *   2. Toggle butonu: <button onclick="theme.toggleTheme()">...</button>
 *   3. Tercihi localStorage'da saklar; sayfa yüklenmesinde otomatik uygular.
 *
 * API:
 *   theme.toggleTheme()  — Tema değiştirir
 *   theme.setTheme(t)    — 'light' | 'dark'  zorla set eder
 */
(function () {
    'use strict';

    function isValidTheme(name) {
        return name === 'light' || name === 'dark';
    }

    function getStoredTheme() {
        try {
            var stored = localStorage.getItem('theme');
            return isValidTheme(stored) ? stored : null;
        } catch (error) {
            return null;
        }
    }

    function storeTheme(name) {
        try {
            localStorage.setItem('theme', name);
        } catch (error) {}
    }

    /** Aktif temayı <html data-theme> ve localStorage'a yazar, UI'ı günceller. */
    function setTheme(name) {
        if (!isValidTheme(name)) return;
        document.documentElement.setAttribute('data-theme', name);
        storeTheme(name);
        updateThemeToggleUI(name);
    }

    /** Toggle: light ↔ dark */
    var theme = window.theme || {};

    function toggleTheme() {
        var current = document.documentElement.getAttribute('data-theme');
        setTheme(current === 'dark' ? 'light' : 'dark');
    }

    /** Dışarıdan set etmek için public API. */
    theme.toggleTheme = toggleTheme;
    theme.setTheme = setTheme;
    window.theme = theme;

    /** Butonun erişilebilir durum metnini senkronize eder. */
    function updateThemeToggleUI(themeName) {
        var themeToggleButton = document.querySelector('.theme-toggle');
        if (!themeToggleButton) return;
        var label = themeToggleButton.querySelector('.theme-toggle-label');
        var nextThemeLabel = themeName === 'dark' ? 'Açık' : 'Koyu';
        if (label) label.textContent = nextThemeLabel + ' tema';
        themeToggleButton.setAttribute('aria-label', nextThemeLabel + ' temaya geç');
        themeToggleButton.setAttribute('title', nextThemeLabel + ' temaya geç');
    }

    /* Sayfa yüklenirken kayıtlı temayı uygula (FOUC'u önlemek için
       mümkün olduğunca erken çalıştırılmalı). */
    (function init() {
        var current = document.documentElement.getAttribute('data-theme');
        var saved = getStoredTheme() || (isValidTheme(current) ? current : 'light');
        document.documentElement.setAttribute('data-theme', saved);
        /* DOM hazır olmayabilir; UI güncellemesini DOMContentLoaded'a ertele. */
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function () { updateThemeToggleUI(saved); });
        } else {
            updateThemeToggleUI(saved);
        }
    })();
})();

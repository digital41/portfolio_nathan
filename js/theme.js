/**
 * Theme System — Dark / Light / System
 * Manages theme with localStorage persistence + OS preference detection
 */
(function () {
    'use strict';

    var STORAGE_KEY = 'theme';
    var MODES = ['dark', 'light', 'system'];
    var TOOLTIPS = { dark: 'Mode sombre', light: 'Mode clair', system: 'Thème système' };

    var currentMode = localStorage.getItem(STORAGE_KEY) || 'system';
    if (MODES.indexOf(currentMode) === -1) currentMode = 'system';

    function applyTheme() {
        var html = document.documentElement;
        html.setAttribute('data-theme-mode', currentMode);

        var actualTheme = currentMode;
        if (currentMode === 'system') {
            actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }

        if (actualTheme === 'light') {
            html.setAttribute('data-theme', 'light');
        } else {
            html.removeAttribute('data-theme');
        }

        // Update tooltips
        var btns = document.querySelectorAll('.theme-toggle');
        for (var i = 0; i < btns.length; i++) {
            btns[i].setAttribute('data-tooltip', TOOLTIPS[currentMode]);
            btns[i].setAttribute('aria-label', TOOLTIPS[currentMode]);
        }
    }

    function cycleTheme() {
        var idx = MODES.indexOf(currentMode);
        currentMode = MODES[(idx + 1) % MODES.length];
        localStorage.setItem(STORAGE_KEY, currentMode);
        applyTheme();
    }

    // Listen for OS preference changes (for system mode)
    try {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
            if (currentMode === 'system') applyTheme();
        });
    } catch (e) {
        // Fallback for older browsers
        window.matchMedia('(prefers-color-scheme: dark)').addListener(function () {
            if (currentMode === 'system') applyTheme();
        });
    }

    // Public API
    window.themeSystem = {
        cycle: cycleTheme,
        getMode: function () { return currentMode; }
    };

    // Init on DOM ready
    function init() {
        applyTheme();
        var btns = document.querySelectorAll('.theme-toggle');
        for (var i = 0; i < btns.length; i++) {
            btns[i].addEventListener('click', cycleTheme);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

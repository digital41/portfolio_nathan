/**
 * Theme System — Dark / Light
 * Manages theme with localStorage persistence
 */
(function () {
    'use strict';

    var STORAGE_KEY = 'theme';
    var MODES = ['dark', 'light'];
    var TOOLTIPS = { dark: 'Mode sombre', light: 'Mode clair' };

    var currentMode = localStorage.getItem(STORAGE_KEY) || 'dark';
    if (MODES.indexOf(currentMode) === -1) currentMode = 'dark';

    function applyTheme() {
        var html = document.documentElement;
        html.setAttribute('data-theme-mode', currentMode);

        if (currentMode === 'light') {
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
        currentMode = currentMode === 'dark' ? 'light' : 'dark';
        localStorage.setItem(STORAGE_KEY, currentMode);
        applyTheme();
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

/**
 * Lightweight A/B Testing System
 * Persists variant in localStorage for user consistency.
 * Tracks impressions & clicks via Umami custom events.
 */
(function () {
    'use strict';

    var STORAGE_KEY = 'ab_variant';
    var VERSION_KEY = 'ab_version';
    var CURRENT_VERSION = '1';

    var TESTS = {
        'header-cta': {
            selector: '[data-ab="header-cta"]',
            variants: ['Consultation Call', 'Consultation Call', 'Consultation Call']
        },
        'hero-cta': {
            selector: '[data-ab="hero-cta"]',
            variants: [
                "Lancer l'Audit Express",
                "Diagnostic",
                "Analyser Mon Entreprise"
            ]
        },
        'audit-cta': {
            selector: '[data-ab="audit-cta"]',
            variants: [
                'R\u00e9server mon Audit',
                'Obtenir Mon Diagnostic',
                'D\u00e9marrer l\'Analyse'
            ]
        }
    };

    function getVariantIndex() {
        var stored = localStorage.getItem(STORAGE_KEY);
        var version = localStorage.getItem(VERSION_KEY);

        if (stored !== null && version === CURRENT_VERSION) {
            return parseInt(stored, 10);
        }

        var idx = Math.floor(Math.random() * 3);
        localStorage.setItem(STORAGE_KEY, idx);
        localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
        return idx;
    }

    var variantIndex = getVariantIndex();

    function applyTests() {
        var testNames = Object.keys(TESTS);
        for (var i = 0; i < testNames.length; i++) {
            var testName = testNames[i];
            var test = TESTS[testName];
            var elements = document.querySelectorAll(test.selector);
            var text = test.variants[variantIndex] || test.variants[0];

            for (var j = 0; j < elements.length; j++) {
                var span = elements[j].querySelector('[data-ab-text]');
                if (span) {
                    span.textContent = text;
                }

                // Track impression via Umami
                if (typeof umami !== 'undefined' && umami.track) {
                    umami.track('ab-impression', {
                        test: testName,
                        variant: variantIndex,
                        text: text
                    });
                }
            }
        }
    }

    function trackClicks() {
        var allAb = document.querySelectorAll('[data-ab]');
        for (var i = 0; i < allAb.length; i++) {
            (function (el) {
                el.addEventListener('click', function () {
                    var testName = el.getAttribute('data-ab');
                    var test = TESTS[testName];
                    if (!test) return;
                    var text = test.variants[variantIndex] || test.variants[0];

                    if (typeof umami !== 'undefined' && umami.track) {
                        umami.track('ab-click', {
                            test: testName,
                            variant: variantIndex,
                            text: text
                        });
                    }
                });
            })(allAb[i]);
        }
    }

    window.abTest = {
        getVariant: function () { return variantIndex; },
        getTests: function () { return TESTS; }
    };

    function init() {
        applyTests();
        trackClicks();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

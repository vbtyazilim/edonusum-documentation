/**
 * FULL.JS - Optional full behavior package.
 *
 * Loads all feature scripts in dependency order. Prefer individual feature
 * files when you want the smallest possible page.
 */
(function () {
    'use strict';

    var currentScript = document.currentScript;
    var featureRoot = currentScript && currentScript.src
        ? new URL('../features/', currentScript.src)
        : new URL('features/', window.location.href);

    var scripts = [
        'theme/theme.js',
        'code-highlight/code-highlight.js',
        'copy-code/copy-code.js',
        'copy-table/copy-table.js',
        'code-tabs/code-tabs.js',
        'docs-layout/docs-layout.js',
        'sidemenu/sidemenu.js',
        'search/search.js',
        'scroll-top/scroll-top.js',
        'reading-progress/reading-progress.js',
        'navigation-progress/navigation-progress.js'
    ];
    var loadPromise = null;

    function hasScript(src) {
        var target = new URL(src, featureRoot).href;
        return Array.from(document.scripts).some(function (script) {
            return script.src && new URL(script.src, window.location.href).href === target;
        });
    }

    function loadScript(src) {
        return new Promise(function (resolve, reject) {
            if (hasScript(src)) {
                resolve();
                return;
            }

            var script = document.createElement('script');
            script.src = new URL(src, featureRoot).href;
            script.async = false;
            script.onload = resolve;
            script.onerror = function () {
                reject(new Error('Failed to load ' + src));
            };
            document.head.appendChild(script);
        });
    }

    function loadAll() {
        if (loadPromise) return loadPromise;
        loadPromise = scripts.reduce(function (chain, src) {
            return chain.then(function () { return loadScript(src); });
        }, Promise.resolve());
        return loadPromise;
    }

    window.documentTemplateFull = {
        load: loadAll
    };

    loadAll().catch(function (error) {
        if (window.console && console.warn) console.warn(error.message);
    });
})();

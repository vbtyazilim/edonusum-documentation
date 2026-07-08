/**
 * NAVIGATION-PROGRESS.JS - Sayfa gecislerinde ilerleme gostergesi
 * Bagimlilik: navigation-progress.css
 *
 * HTML gerektirmez; gosterge otomatik olusturulur.
 */
(function () {
    'use strict';

    var progressElement;

    function getProgressElement() {
        if (progressElement) return progressElement;

        progressElement = document.createElement('div');
        progressElement.className = 'navigation-progress';
        progressElement.setAttribute('role', 'progressbar');
        progressElement.setAttribute('aria-label', 'Sayfa yukleniyor');
        progressElement.setAttribute('aria-hidden', 'true');
        document.body.appendChild(progressElement);
        return progressElement;
    }

    function start() {
        var element = getProgressElement();
        element.classList.remove('is-leaving');
        element.classList.remove('is-active');
        void element.offsetWidth;
        element.classList.add('is-active');
        element.setAttribute('aria-hidden', 'false');
    }

    function finish() {
        if (!progressElement) return;
        progressElement.classList.remove('is-active', 'is-leaving');
        progressElement.setAttribute('aria-hidden', 'true');
    }

    function isNavigatingLink(event, link) {
        if (!link || event.defaultPrevented || event.button !== 0) return false;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
        if (link.target && link.target.toLowerCase() !== '_self') return false;
        if (link.hasAttribute('download')) return false;

        var href = link.getAttribute('href');
        if (!href || href.charAt(0) === '#') return false;
        if (/^(mailto:|tel:|javascript:)/i.test(href)) return false;

        var destination;
        try {
            destination = new URL(link.href, window.location.href);
        } catch (error) {
            return false;
        }

        if (!/^https?:$/.test(destination.protocol)) return false;
        return destination.href !== window.location.href;
    }

    function init() {
        document.addEventListener('click', function (event) {
            var link = event.target.closest('a');
            if (isNavigatingLink(event, link)) start();
        });

        window.addEventListener('beforeunload', function () {
            if (!progressElement) return;
            progressElement.classList.add('is-leaving');
        });

        window.addEventListener('pageshow', finish);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

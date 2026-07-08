/**
 * DOCS-LAYOUT.JS — Çok sayfalı doküman navigasyonu ve sayfa içi başlıklar
 * Bağımlılık: docs-layout.css
 */
(function () {
    'use strict';

    var sidebar;
    var overlay;
    var tocLinks = [];

    function closeNavigation() {
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('show');
        document.body.style.overflow = '';
    }

    function toggleNavigation() {
        if (!sidebar || !overlay) return;
        var willOpen = !sidebar.classList.contains('open');
        sidebar.classList.toggle('open', willOpen);
        overlay.classList.toggle('show', willOpen);
        document.body.style.overflow = willOpen ? 'hidden' : '';
    }

    function buildToc() {
        var container = document.querySelector('[data-docs-toc]');
        var article = document.querySelector('.docs-article');
        if (!container || !article) return;

        var headings = Array.from(article.querySelectorAll(':scope > section > h2[id], :scope > section > h3[id]'));
        headings.forEach(function (heading) {
            var link = document.createElement('a');
            link.href = '#' + heading.id;
            link.textContent = heading.textContent.replace(/^\d+\.\s*/, '').trim();
            link.dataset.level = heading.tagName === 'H3' ? '3' : '2';
            container.appendChild(link);
            tocLinks.push({ link: link, heading: heading });
        });

        if (headings.length === 0) {
            var toc = document.querySelector('.docs-toc');
            if (toc) toc.hidden = true;
        }
    }

    function setActiveToc() {
        if (tocLinks.length === 0) return;
        var offset = window.scrollY + 140;
        var active = tocLinks[0];
        tocLinks.forEach(function (entry) {
            if (entry.heading.offsetTop <= offset) active = entry;
        });
        tocLinks.forEach(function (entry) {
            entry.link.classList.toggle('active', entry === active);
        });
    }

    function markCurrentPage() {
        var current = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.docs-nav-link').forEach(function (link) {
            var target = link.getAttribute('href').split('#')[0].split('/').pop();
            if (target === current) link.classList.add('active');
        });
    }

    function init() {
        sidebar = document.querySelector('[data-docs-sidebar]');
        overlay = document.querySelector('[data-docs-overlay]');

        document.querySelectorAll('[data-docs-nav-toggle]').forEach(function (button) {
            button.addEventListener('click', toggleNavigation);
        });
        if (overlay) overlay.addEventListener('click', closeNavigation);
        if (sidebar) {
            sidebar.querySelectorAll('a').forEach(function (link) {
                link.addEventListener('click', closeNavigation);
            });
        }

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') closeNavigation();
        });

        markCurrentPage();
        buildToc();
        setActiveToc();
        window.addEventListener('scroll', setActiveToc, { passive: true });
    }

    window.docsLayout = {
        toggleNavigation: toggleNavigation,
        closeNavigation: closeNavigation
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

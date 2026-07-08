/**
 * CODE-TABS.JS — Erişilebilir yerel sekmeler ve grup bazlı global seçim.
 * Bağımlılık: Yok.
 *
 * HTML sözleşmesi:
 *   [data-code-tabs]                           panel
 *   [data-code-tab][data-code-option]          sekme butonu
 *   [data-code-panel][data-code-option]        sekme içeriği
 *   [data-code-tabs-global="<group>"]           global seçim kapsayıcısı
 *   [data-code-option]                         global seçim butonu
 */
(function () {
    'use strict';

    var panelCounter = 0;

    function getButtons(panel) {
        return Array.from(panel.querySelectorAll('[data-code-tab][data-code-option]'));
    }

    function getPanels(panel) {
        return Array.from(panel.querySelectorAll('[data-code-panel][data-code-option]'));
    }

    function available(panel, option) {
        return getButtons(panel).some(function (button) {
            return button.dataset.codeOption === option;
        });
    }

    function select(panel, option, focus) {
        if (!panel || !available(panel, option)) return false;

        getButtons(panel).forEach(function (button) {
            var active = button.dataset.codeOption === option;
            button.setAttribute('aria-selected', String(active));
            button.tabIndex = active ? 0 : -1;
            if (active && focus) button.focus();
        });

        getPanels(panel).forEach(function (content) {
            content.hidden = content.dataset.codeOption !== option;
        });

        panel.dataset.codeTabsActive = option;
        panel.dispatchEvent(new CustomEvent('code-tabs:change', {
            bubbles: true,
            detail: { option: option, group: panel.dataset.codeTabsGroup || '' }
        }));
        return true;
    }

    function updateGlobal(group, option) {
        document.querySelectorAll('[data-code-tabs-global="' + CSS.escape(group) + '"] [data-code-option]')
            .forEach(function (button) {
                button.setAttribute('aria-pressed', String(button.dataset.codeOption === option));
            });
    }

    function selectAll(group, option) {
        if (!group) return;
        document.querySelectorAll('[data-code-tabs][data-code-tabs-group="' + CSS.escape(group) + '"]')
            .forEach(function (panel) {
                select(panel, option, false);
            });
        updateGlobal(group, option);
        try { localStorage.setItem('code-tabs:' + group, option); } catch (error) {}
    }

    function initPanel(panel) {
        if (panel.dataset.codeTabsReady === 'true') return;
        panelCounter += 1;

        var buttons = getButtons(panel);
        var panels = getPanels(panel);
        if (!buttons.length || !panels.length) return;

        var panelId = panel.id || 'code-tabs-' + panelCounter;
        panel.id = panelId;

        buttons.forEach(function (button, index) {
            var option = button.dataset.codeOption;
            var tabId = button.id || panelId + '-tab-' + index;
            var content = panels.find(function (item) {
                return item.dataset.codeOption === option;
            });
            button.id = tabId;
            button.setAttribute('role', 'tab');
            if (content) {
                content.id = content.id || panelId + '-panel-' + index;
                content.setAttribute('role', 'tabpanel');
                content.setAttribute('aria-labelledby', tabId);
                button.setAttribute('aria-controls', content.id);
            }
            button.addEventListener('click', function () {
                select(panel, option, false);
            });
            button.addEventListener('keydown', function (event) {
                if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
                event.preventDefault();
                var current = buttons.indexOf(button);
                var next = event.key === 'Home' ? 0 :
                    event.key === 'End' ? buttons.length - 1 :
                    event.key === 'ArrowRight' ? (current + 1) % buttons.length :
                    (current - 1 + buttons.length) % buttons.length;
                select(panel, buttons[next].dataset.codeOption, true);
            });
        });

        var list = panel.querySelector('[data-code-tabs-list]');
        if (list) list.setAttribute('role', 'tablist');

        var group = panel.dataset.codeTabsGroup || '';
        var saved = '';
        try { saved = group ? localStorage.getItem('code-tabs:' + group) || '' : ''; } catch (error) {}
        var initial = saved || panel.dataset.codeTabsDefault ||
            (buttons.find(function (button) { return button.getAttribute('aria-selected') === 'true'; }) || buttons[0]).dataset.codeOption;

        if (!select(panel, initial, false)) select(panel, buttons[0].dataset.codeOption, false);
        panel.dataset.codeTabsReady = 'true';
    }

    function initGlobal(control) {
        if (control.dataset.codeTabsReady === 'true') return;
        var group = control.dataset.codeTabsGlobal;
        control.querySelectorAll('[data-code-option]').forEach(function (button) {
            button.addEventListener('click', function () {
                selectAll(group, button.dataset.codeOption);
            });
        });
        var activePanel = document.querySelector('[data-code-tabs][data-code-tabs-group="' + CSS.escape(group) + '"]');
        if (activePanel) updateGlobal(group, activePanel.dataset.codeTabsActive);
        control.dataset.codeTabsReady = 'true';
    }

    function init(root) {
        var scope = root || document;
        scope.querySelectorAll('[data-code-tabs]').forEach(initPanel);
        scope.querySelectorAll('[data-code-tabs-global]').forEach(initGlobal);
    }

    window.codeTabs = {
        init: init,
        select: function (panelOrSelector, option) {
            var panel = typeof panelOrSelector === 'string'
                ? document.querySelector(panelOrSelector)
                : panelOrSelector;
            return select(panel, option, false);
        },
        selectAll: selectAll
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { init(document); });
    } else {
        init(document);
    }
})();

/**
 * COPY-TABLE.JS - Adds row-level copy buttons to key/value tables.
 * Dependency: copy-table.css
 *
 * HTML contract:
 *   [data-copy-table]                       table wrapper
 *   [data-copy-value]                       value cell or inline value source
 *   [data-copy-label]                       optional button label
 *   [data-copy-success-label]               optional copied label
 *   [data-copy-error-label]                 optional error label
 *
 * Public API:
 *   copyTable.init(root)
 */
(function () {
    'use strict';

    var DEFAULT_LABEL = 'Copy';
    var DEFAULT_SUCCESS_LABEL = 'Copied';
    var DEFAULT_ERROR_LABEL = 'Error';
    var RESET_MS = 1500;

    function copyWithFallback(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text);
        }

        return new Promise(function (resolve, reject) {
            var fallbackTextarea = document.createElement('textarea');
            fallbackTextarea.value = text;
            fallbackTextarea.setAttribute('readonly', '');
            fallbackTextarea.style.position = 'fixed';
            fallbackTextarea.style.top = '-999px';
            fallbackTextarea.style.opacity = '0';
            document.body.appendChild(fallbackTextarea);
            fallbackTextarea.select();

            try {
                if (document.execCommand('copy')) resolve();
                else reject(new Error('Copy command failed'));
            } catch (error) {
                reject(error);
            } finally {
                document.body.removeChild(fallbackTextarea);
            }
        });
    }

    function getText(source) {
        if (!source) return '';
        if (source.hasAttribute('data-copy-value') &&
            source.dataset.copyValue &&
            source.dataset.copyValue !== 'true') {
            return source.dataset.copyValue;
        }
        if (source.dataset.copyRaw) return source.dataset.copyRaw;
        return (source.textContent || '').trim();
    }

    function setButtonState(button, label, className) {
        button.textContent = label;
        button.classList.remove('is-copied', 'is-error');
        if (className) button.classList.add(className);
    }

    function createButton(table, source) {
        var button = document.createElement('button');
        button.className = 'copy-table-button';
        button.type = 'button';
        button.textContent = source.dataset.copyLabel || table.dataset.copyLabel || DEFAULT_LABEL;
        button.setAttribute('aria-label', source.dataset.copyAriaLabel || table.dataset.copyAriaLabel || 'Copy value');

        button.addEventListener('click', function () {
            var text = getText(source);
            var label = source.dataset.copyLabel || table.dataset.copyLabel || DEFAULT_LABEL;
            var successLabel = source.dataset.copySuccessLabel || table.dataset.copySuccessLabel || DEFAULT_SUCCESS_LABEL;
            var errorLabel = source.dataset.copyErrorLabel || table.dataset.copyErrorLabel || DEFAULT_ERROR_LABEL;

            copyWithFallback(text).then(function () {
                setButtonState(button, successLabel, 'is-copied');
                setTimeout(function () {
                    setButtonState(button, label, '');
                }, RESET_MS);
            }).catch(function () {
                setButtonState(button, errorLabel, 'is-error');
                setTimeout(function () {
                    setButtonState(button, label, '');
                }, RESET_MS);
            });
        });

        return button;
    }

    function enhanceValue(table, source) {
        if (source.dataset.copyTableReady === 'true') return;
        source.dataset.copyRaw = getText(source);

        var valueBox = document.createElement('div');
        valueBox.className = 'copy-table-value';

        var text = document.createElement('span');
        text.className = 'copy-table-text';

        while (source.firstChild) {
            text.appendChild(source.firstChild);
        }

        valueBox.appendChild(text);
        valueBox.appendChild(createButton(table, source));
        source.appendChild(valueBox);
        source.dataset.copyTableReady = 'true';
    }

    function init(root) {
        var scope = root || document;
        scope.querySelectorAll('[data-copy-table]').forEach(function (table) {
            if (!table.classList.contains('copy-table')) table.classList.add('copy-table');
            table.querySelectorAll('[data-copy-value]').forEach(function (source) {
                enhanceValue(table, source);
            });
        });
    }

    window.copyTable = {
        init: init
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { init(document); });
    } else {
        init(document);
    }
})();

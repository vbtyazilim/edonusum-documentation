/**
 * CODE-HIGHLIGHT.JS — Sözdizimi vurgulama + otomatik biçimlendirme
 * Bağımlılık: Yok (standalone). copy-code.js ile birlikte kullanılabilir.
 *
 * Özellikler:
 *   • <script class="code-block language-xml" type="text/plain"> bloklarını
 *     otomatik <pre><code> elemanına dönüştürür.
 *   • HTML/XML, JSON, C#, Bash, YAML ve SQL için sözdizimi vurgulaması uygular.
 *   • Kodu otomatik girintiler.
 *
 * Kullanım:
 *   <script src="code-highlight/code-highlight.js"></script>
 *   <!-- Opsiyonel copy-code butonları için copy-code.js'i de dahil et -->
 */
(function () {
    'use strict';

    /* ── Yardımcı: HTML escape ── */
    function escapeHtml(value) {
        return value.replace(/[&<>"']/g, function (character) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
        });
    }

    /* Raw-text script bloklarindaki HTML entity'lerini bir kez cozer. */
    function decodeHtmlEntities(value) {
        var decoder = document.createElement('textarea');
        decoder.innerHTML = value;
        return decoder.value;
    }

    /* ── Başındaki/sonundaki boş satırları at, ortak girintiyi sıfırla ── */
    function normalizeCode(value) {
        var lines = value.replace(/\r\n/g, '\n').split('\n');
        while (lines.length && !lines[0].trim()) lines.shift();
        while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
        var indent = lines.reduce(function (min, line) {
            if (!line.trim()) return min;
            return Math.min(min, line.match(/^\s*/)[0].length);
        }, Infinity);
        return lines.map(function (line) {
            return line.slice(indent === Infinity ? 0 : indent);
        }).join('\n');
    }

    /* ── Dil tespiti ── */
    function detectLanguage(code, explicit) {
        if (explicit) return explicit;
        var text = code.trim();
        if (/^</.test(text))      return 'xml';
        if (/^[\[{]/.test(text))  return 'json';
        if (/^https?:\/\//.test(text)) return 'url';
        return 'text';
    }

    /* ── JSON biçimlendirme ── */
    function formatJson(code) {
        try { return JSON.stringify(JSON.parse(code), null, 2); }
        catch (error) { return code; }
    }

    /* ── XML biçimlendirme (indentation) ── */
    function formatXml(code) {
        var compact = code.replace(/>\s+</g, '><').trim();
        var tokens  = compact.match(/<[^>]+>|[^<]+/g) || [];
        var lines   = [];
        var level   = 0;

        for (var tokenIndex = 0; tokenIndex < tokens.length; tokenIndex++) {
            var token     = tokens[tokenIndex];
            var next      = tokens[tokenIndex + 1] || '';
            var nextAfter = tokens[tokenIndex + 2] || '';

            if (/^<\//.test(token)) {
                level = Math.max(level - 1, 0);
                lines.push('    '.repeat(level) + token);
            } else if (/^</.test(token)) {
                if (/^<\?/.test(token) || /^<!--/.test(token) || /\/>$/.test(token)) {
                    lines.push('    '.repeat(level) + token);
                } else if (next && !/^</.test(next) && /^<\//.test(nextAfter)) {
                    lines.push('    '.repeat(level) + token + next.trim() + nextAfter);
                    tokenIndex += 2;
                } else {
                    lines.push('    '.repeat(level) + token);
                    level += 1;
                }
            } else if (token.trim()) {
                lines.push('    '.repeat(level) + token.trim());
            }
        }
        return lines.join('\n');
    }

    /* ── XML token vurgulama ── */
    function highlightXmlAttributes(attributes) {
        var output = '';
        var cursor = 0;
        var attributePattern = /([\w:.-]+)(\s*=\s*)("[^"]*"|'[^']*')/g;
        var match;

        while ((match = attributePattern.exec(attributes)) !== null) {
            output += escapeHtml(attributes.slice(cursor, match.index));
            output += token('attr', match[1]);
            output += token('punctuation', match[2]);
            output += token('string', match[3]);
            cursor = match.index + match[0].length;
        }

        return output + escapeHtml(attributes.slice(cursor));
    }

    function highlightXml(code) {
        var output = '';
        var cursor = 0;
        var markupPattern = /<!--[\s\S]*?-->|<\/?[\w:.-]+(?:\s+(?:"[^"]*"|'[^']*'|[^"'<>])*)?\s*\/?>/g;
        var match;

        while ((match = markupPattern.exec(code)) !== null) {
            output += escapeHtml(code.slice(cursor, match.index));

            if (match[0].indexOf('<!--') === 0) {
                output += token('comment', match[0]);
            } else {
                var parts = match[0].match(/^(<\/?)([\w:.-]+)([\s\S]*?)(\/?>)$/);
                output += token('punctuation', parts[1]);
                output += token('tag', parts[2]);
                output += highlightXmlAttributes(parts[3]);
                output += token('punctuation', parts[4]);
            }

            cursor = match.index + match[0].length;
        }

        return output + escapeHtml(code.slice(cursor));
    }

    /* ── JSON token vurgulama ── */
    function highlightJson(code) {
        return escapeHtml(code).replace(
            /("(?:\\.|[^"\\])*"\s*:)|("(?:\\.|[^"\\])*")|\b(true|false|null)\b|-?\b\d+(?:\.\d+)?\b/g,
            function (match, key, stringValue, keyword) {
                if (key)         return '<span class="code-token attr">'    + key         + '</span>';
                if (stringValue) return '<span class="code-token string">'  + stringValue + '</span>';
                if (keyword)     return '<span class="code-token keyword">'  + keyword     + '</span>';
                return '<span class="code-token number">' + match + '</span>';
            }
        );
    }

    function token(className, value) {
        return '<span class="code-token ' + className + '">' + escapeHtml(value) + '</span>';
    }

    function highlightCLike(code, keywords) {
        var keywordSet = new Set(keywords);
        var output = '';
        var index = 0;

        while (index < code.length) {
            var rest = code.slice(index);
            var match;

            if (rest.indexOf('//') === 0) {
                match = rest.match(/^\/\/[^\n]*/)[0];
                output += token('comment', match);
                index += match.length;
                continue;
            }
            if (rest.indexOf('/*') === 0) {
                match = rest.match(/^\/\*[\s\S]*?(?:\*\/|$)/)[0];
                output += token('comment', match);
                index += match.length;
                continue;
            }
            match = rest.match(/^(\$?@?"(?:\\.|""|[^"])*"|'(?:\\.|[^'\\])*')/);
            if (match) {
                output += token('string', match[0]);
                index += match[0].length;
                continue;
            }
            match = rest.match(/^(?:0x[\da-f]+|\d+(?:\.\d+)?)(?:[a-z]+)?/i);
            if (match) {
                output += token('number', match[0]);
                index += match[0].length;
                continue;
            }
            match = rest.match(/^[A-Za-z_][A-Za-z0-9_]*/);
            if (match) {
                var word = match[0];
                var previous = code.slice(0, index).match(/\S(?=\s*$)/);
                var next = code.slice(index + word.length).match(/^\s*(.)/);
                if (keywordSet.has(word)) {
                    output += token('keyword', word);
                } else if ((previous && previous[0] === '.') || (next && next[1] === '(')) {
                    output += token('attr', word);
                } else if (/^[A-Z]/.test(word)) {
                    output += token('tag', word);
                } else {
                    output += escapeHtml(word);
                }
                index += word.length;
                continue;
            }

            output += /[{}[\]();,.<>:=+\-*/?!&|]/.test(code[index])
                ? token('punctuation', code[index])
                : escapeHtml(code[index]);
            index += 1;
        }
        return output;
    }

    function highlightCsharp(code) {
        return highlightCLike(code, [
            'abstract', 'as', 'async', 'await', 'base', 'bool', 'break', 'byte',
            'case', 'catch', 'char', 'checked', 'class', 'const', 'continue',
            'decimal', 'default', 'delegate', 'do', 'double', 'else', 'enum',
            'event', 'explicit', 'extern', 'false', 'finally', 'fixed', 'float',
            'for', 'foreach', 'from', 'get', 'global', 'goto', 'if', 'implicit',
            'in', 'init', 'int', 'interface', 'internal', 'into', 'is', 'join',
            'let', 'lock', 'long', 'namespace', 'new', 'not', 'null', 'object',
            'on', 'operator', 'or', 'orderby', 'out', 'override', 'params',
            'partial', 'private', 'protected', 'public', 'readonly', 'record',
            'ref', 'required', 'return', 'sbyte', 'sealed', 'select', 'set',
            'short', 'sizeof', 'stackalloc', 'static', 'string', 'struct',
            'switch', 'this', 'throw', 'true', 'try', 'typeof', 'uint', 'ulong',
            'unchecked', 'unsafe', 'ushort', 'using', 'var', 'virtual', 'void',
            'volatile', 'when', 'where', 'while', 'with', 'yield'
        ]);
    }

    function highlightBash(code) {
        var keywords = new Set([
            'case', 'do', 'done', 'elif', 'else', 'esac', 'export', 'fi', 'for',
            'function', 'if', 'in', 'local', 'readonly', 'select', 'then',
            'time', 'until', 'while'
        ]);
        return code.split('\n').map(function (line) {
            var commentIndex = -1;
            var quote = '';
            for (var index = 0; index < line.length; index++) {
                var character = line[index];
                if ((character === '"' || character === "'") && line[index - 1] !== '\\') {
                    quote = quote === character ? '' : (quote || character);
                }
                if (character === '#' && !quote) {
                    commentIndex = index;
                    break;
                }
            }
            var body = commentIndex >= 0 ? line.slice(0, commentIndex) : line;
            var comment = commentIndex >= 0 ? line.slice(commentIndex) : '';
            var html = escapeHtml(body)
                .replace(/(&quot;.*?&quot;|&#39;.*?&#39;)/g, '<span class="code-token string">$1</span>')
                .replace(/(\$\{?[A-Za-z_][A-Za-z0-9_]*\}?)/g, '<span class="code-token attr">$1</span>')
                .replace(/\b(case|do|done|elif|else|esac|export|fi|for|function|if|in|local|readonly|select|then|time|until|while)\b/g, function (word) {
                    return keywords.has(word) ? '<span class="code-token keyword">' + word + '</span>' : word;
                })
                .replace(/(^|[^\w&#])(\d+(?:\.\d+)?)\b/g, '$1<span class="code-token number">$2</span>');
            return html + (comment ? token('comment', comment) : '');
        }).join('\n');
    }

    function highlightYaml(code) {
        return code.split('\n').map(function (line) {
            var match = line.match(/^(\s*)(-\s+)?([^#:\n][^:\n]*)(:)(.*)$/);
            if (match) {
                return escapeHtml(match[1] + (match[2] || '')) +
                    token('attr', match[3].trim()) +
                    token('punctuation', match[4]) +
                    highlightYamlValue(match[5]);
            }
            var commentAt = line.indexOf('#');
            if (commentAt >= 0) {
                return highlightYamlValue(line.slice(0, commentAt)) + token('comment', line.slice(commentAt));
            }
            return highlightYamlValue(line);
        }).join('\n');
    }

    function highlightYamlValue(value) {
        return escapeHtml(value)
            .replace(/(&quot;.*?&quot;|&#39;.*?&#39;)/g, '<span class="code-token string">$1</span>')
            .replace(/\b(true|false|null|yes|no|on|off)\b/gi, '<span class="code-token keyword">$1</span>')
            .replace(/(^|[^\w&#])(-?\d+(?:\.\d+)?)\b/g, '$1<span class="code-token number">$2</span>');
    }

    function highlightSql(code) {
        var keywords = /\b(add|alter|and|as|asc|begin|between|by|case|constraint|create|database|declare|default|delete|desc|distinct|drop|else|end|exec|exists|from|full|group|having|if|in|index|inner|insert|into|is|join|left|like|not|null|on|or|order|outer|primary|procedure|references|right|schema|select|set|table|then|top|transaction|truncate|union|unique|update|use|values|view|when|where|with)\b/gi;
        return code.split('\n').map(function (line) {
            var commentAt = line.indexOf('--');
            var body = commentAt >= 0 ? line.slice(0, commentAt) : line;
            var comment = commentAt >= 0 ? line.slice(commentAt) : '';
            var html = escapeHtml(body)
                .replace(/(&#39;(?:&#39;&#39;|.*?)&#39;|&quot;.*?&quot;)/g, '<span class="code-token string">$1</span>')
                .replace(keywords, '<span class="code-token keyword">$1</span>')
                .replace(/(^|[^\w&#])(\d+(?:\.\d+)?)\b/g, '$1<span class="code-token number">$2</span>');
            return html + (comment ? token('comment', comment) : '');
        }).join('\n');
    }

    function highlightCode(code, lang) {
        var normalizedLanguage = (lang || '').toLowerCase();
        if (normalizedLanguage === 'html') return highlightXml(code);
        if (normalizedLanguage === 'xml') return highlightXml(code);
        if (normalizedLanguage === 'json') return highlightJson(code);
        if (normalizedLanguage === 'csharp' || normalizedLanguage === 'cs') return highlightCsharp(code);
        if (normalizedLanguage === 'bash' || normalizedLanguage === 'shell' || normalizedLanguage === 'sh') return highlightBash(code);
        if (normalizedLanguage === 'yaml' || normalizedLanguage === 'yml') return highlightYaml(code);
        if (normalizedLanguage === 'sql') return highlightSql(code);
        return escapeHtml(code);
    }

    /* ── Genel biçimlendir ── */
    function formatCode(code, lang) {
        var normalized = normalizeCode(code);
        if (lang === 'json') return formatJson(normalized);
        if (lang === 'xml')  return formatXml(normalized);
        return normalized;
    }

    window.CodeHighlight = {
        escapeHtml:    escapeHtml,
        decodeHtmlEntities: decodeHtmlEntities,
        normalizeCode: normalizeCode,
        detectLanguage: detectLanguage,
        formatCode:    formatCode,
        highlightXml:  highlightXml,
        highlightJson: highlightJson,
        highlightCode: highlightCode,
    };
    /* ── Public API: dışarıdan çağrılabilir ── */
    /* ── Init: DOM hazır olduğunda çalıştır ── */
    function init() {
        /* 1. <script class="code-block" type="text/plain"> → <pre><code> */
        document.querySelectorAll('script.code-block[type="text/plain"]').forEach(function (source) {
            var codeBlockWrapper  = document.createElement('pre');
            var code = document.createElement('code');
            var classes  = Array.from(source.classList);
            var langClass = classes.find(function (className) { return className.indexOf('language-') === 0; });
            var lang = langClass ? langClass.replace('language-', '') : '';

            code.textContent = normalizeCode(decodeHtmlEntities(source.textContent));
            if (lang) code.className = 'language-' + lang;
            codeBlockWrapper.appendChild(code);
            source.parentNode.replaceChild(codeBlockWrapper, source);
        });

        /* 2. Tüm pre > code bloklarını vurgula */
        document.querySelectorAll('pre').forEach(function (codeBlockWrapper) {
            var code = codeBlockWrapper.querySelector('code');
            if (!code) return;

            var explicit = Array.from(code.classList).reduce(function (found, name) {
                return found || (name.indexOf('language-') === 0 ? name.replace('language-', '') : '');
            }, '');

            var lang      = detectLanguage(code.textContent, explicit);
            var formatted = formatCode(code.textContent, lang);

            codeBlockWrapper.setAttribute('data-lang', lang);
            code.textContent = formatted;

            code.innerHTML = highlightCode(formatted, lang);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

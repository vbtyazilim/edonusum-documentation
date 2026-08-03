const fs = require('fs');
const path = require('path');

const siteRoot = path.resolve(__dirname, '..');
const guidesRoot = path.join(siteRoot, 'guides');
const outputPath = path.join(siteRoot, 'assets', 'site-search-index.js');

function decodeHtml(value) {
    return value
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function collectMatches(html, expression) {
    const values = [];
    let match;
    while ((match = expression.exec(html)) !== null) {
        const value = decodeHtml(match[1]);
        if (value) values.push(value);
    }
    return values;
}

function unique(values) {
    return [...new Set(values.map((value) => String(value).trim()).filter(Boolean))];
}

function pageKeywords(html) {
    const headings = collectMatches(html, /<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/gi);
    const codeValues = collectMatches(html, /<code[^>]*>([\s\S]*?)<\/code>/gi)
        .filter((value) => value.length >= 2 && value.length <= 96)
        .filter((value) => !/[{}\[\]\n]/.test(value));

    return unique([...headings, ...codeValues]).slice(0, 220);
}

const guideDirectories = fs.readdirSync(guidesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right, 'tr'));

const items = [];

for (const directory of guideDirectories) {
    const manifestPath = path.join(guidesRoot, directory, 'guide.manifest.json');
    if (!fs.existsSync(manifestPath)) continue;

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const product = manifest.shortTitle || manifest.title;

    items.push({
        title: product,
        text: manifest.description || '',
        keywords: unique([manifest.eyebrow, product, 'ürün rehberi']).join(' '),
        url: `guides/${directory}/index.html`,
        sectionType: 'Ürün'
    });

    for (const section of manifest.sections || []) {
        for (const page of section.pages || []) {
            const htmlPath = path.join(guidesRoot, directory, 'docs', `${page.slug}.html`);
            const html = fs.existsSync(htmlPath) ? fs.readFileSync(htmlPath, 'utf8') : '';
            const technicalTerms = html ? pageKeywords(html) : [];
            const keywords = unique([
                product,
                section.label,
                page.eyebrow,
                ...(page.keywords || []),
                ...technicalTerms
            ]);

            items.push({
                title: `${product} · ${page.title}`,
                text: page.description || '',
                keywords: keywords.join(' '),
                url: `guides/${directory}/docs/${page.slug}.html`,
                sectionType: section.label || 'Rehber'
            });
        }
    }
}

const banner = '// Bu dosya guide.manifest.json ve yayımlanmış sayfa başlıklarından üretilir.\n';
const output = `${banner}window.SITE_SEARCH_INDEX=${JSON.stringify(items)};\n`;
fs.writeFileSync(outputPath, output, 'utf8');

console.log(`Site arama indeksi üretildi: ${items.length} kayıt`);

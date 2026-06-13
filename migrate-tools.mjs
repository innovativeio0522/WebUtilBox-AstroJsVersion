// Phase 2 Migration Script — Webutilbox HTML → Astro
// Tool JS is written to public/js/[tool].js and loaded via <script src>
// This completely bypasses esbuild — static JS files are served as-is.

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir   = dirname(fileURLToPath(import.meta.url));
const SITE    = join(__dir, '..');
const PAGES   = join(__dir, 'src', 'pages');
const PUBJS   = join(__dir, 'public', 'js');

// OG image map
const OG = {
  developer: ['base64-encoder','sha256-generator','regex-tester','jwt-decoder','json-to-csv',
    'url-parser','uuid-generator','binary-text-converter','number-base-converter',
    'html-entity-encoder','js-obfuscator','cron-expression-generator','markdown-to-html',
    'sql-formatter','css-js-minifier','random-string-generator','text-encryption',
    'slug-generator','unix-timestamp-converter','password-generator','password-strength'],
  'css-tools': ['css-gradient-generator','css-grid-generator','flexbox-generator',
    'box-shadow-generator','border-radius-generator','text-shadow-generator',
    'color-converter','color-contrast-checker','color-shades-generator','favicon-generator'],
  'image-tools': ['image-compressor','image-resizer','image-cropper','image-format-converter',
    'image-to-base64','image-filters','image-rotate-flip','image-watermark',
    'image-blur-pixelate','image-color-picker','image-comparison-slider',
    'image-metadata','gif-maker','meme-generator'],
  'text-tools': ['word-counter','case-converter','text-cleaner','text-diff','text-reverser',
    'text-sorter','text-splitter','find-replace','lorem-ipsum',
    'character-frequency-analyzer','word-frequency-counter','syllable-counter',
    'morse-code-translator','instagram-bio-generator','username-generator'],
  calculators: ['percentage-calculator','bmi-calculator','compound-interest-calculator',
    'discount-calculator','tip-calculator','tax-calculator','loan-calculator',
    'mortgage-calculator','salary-calculator','investment-calculator',
    'crypto-profit-calculator','scientific-calculator','age-calculator',
    'date-calculator','unit-converter','currency-converter'],
  'pdf-tools': ['pdf-merger','pdf-splitter','pdf-images-converter'],
  'media-tools': ['audio-speed-changer','audio-trimmer','audio-visualizer',
    'video-thumbnail-generator','video-to-audio-extractor','voice-recorder','metronome'],
  generators: ['qr-barcode-generator','ascii-art-generator','meta-tag-generator'],
  timers: ['countdown-timer','stopwatch','pomodoro-timer','time-zone-converter'],
};
const ogMap = {};
for (const [cat, tools] of Object.entries(OG)) {
  for (const t of tools) ogMap[t] = `og-${cat}.svg`;
}

function readHtml(page) {
  const f = join(SITE, page, 'index.html');
  if (!existsSync(f)) return null;
  return readFileSync(f, 'utf8');
}
function extract(html, rx) {
  const m = html.match(rx);
  return m ? m[1].trim() : '';
}
function getMeta(html) {
  return {
    title:     extract(html, /<title>([^<]+)<\/title>/),
    desc:      extract(html, /name="description" content="([^"]+)"/),
    keywords:  extract(html, /name="keywords" content="([^"]+)"/),
    canonical: extract(html, /rel="canonical" href="([^"]+)"/),
    h1:        extract(html, /<h1[^>]*>([\s\S]*?)<\/h1>/),
    subtitle:  extract(html, /class="subtitle">([^<]+)</),
    updated:   extract(html, /datetime="(\d{4}-\d{2}-\d{2})"/),
    shareText: extract(html, /intent\/tweet\?text=([^&"]+)/),
    jsonLd:    extract(html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/),
  };
}
function getWorkspace(html) {
  let s = html.indexOf('<div class="workspace">');
  if (s < 0) s = html.indexOf('<div class="workspace ');
  let e = html.indexOf('<div class="share-bar">');
  if (e < 0) e = html.indexOf('<!-- Share Bar -->');
  if (s < 0 || e < 0 || e <= s) return '';
  return html.slice(s, e).trim();
}
function getInfoInner(html) {
  const s = html.indexOf('<div class="info-section">');
  if (s < 0) return '';
  const toastIdx = html.indexOf('<div id="toast"');
  if (toastIdx < 0) return '';
  const e = html.slice(0, toastIdx).lastIndexOf('</div>') + 6;
  if (e <= s) return '';
  return html.slice(s, e)
    .replace(/^<div class="info-section">\s*/, '')
    .replace(/\s*<\/div>\s*$/, '')
    .trim();
}
function getToolJs(html) {
  let best = '', bestLen = 0;
  // Use a regex that only matches up to the first </script> and skips scripts that start with </script>
  const rx = /<script(?:\s(?!type=["']application\/ld\+json["'])[^>]*)?>([\s\S]*?)<\/script>/g;
  let m;
  while ((m = rx.exec(html)) !== null) {
    const body = m[1].trim();
    // Skip any script that starts with </script> (invalid match)
    if (body.startsWith('</script')) continue;
    if (/adsbygoogle|toggleFaq[\s\S]*toggleEmbed|copyPageLink[\s\S]*copyEmbedCode/.test(body)) continue;
    if (body.length > bestLen && body.length > 50) { bestLen = body.length; best = body; }
  }
  return best;
}
function getToolStyles(html) {
  const out = [];
  const rx = /<style>([\s\S]*?)<\/style>/g;
  let m;
  while ((m = rx.exec(html)) !== null) {
    const body = m[1].trim();
    if (body.length > 30 && !/font-display|ad-container|box-sizing:border-box/.test(body)) {
      out.push(`<style>\n${body}\n</style>`);
    }
  }
  return out.join('\n');
}
function getCdnScripts(html) {
  const out = [];
  const rx = /<script[^>]+src="(https:\/\/(?!pagead)[^"]+)"[^>]*><\/script>/g;
  let m;
  while ((m = rx.exec(html)) !== null) out.push(m[0]);
  return out.join('\n');
}
function safeAttr(s) { return s.replace(/"/g, '&quot;'); }

function migrate(page) {
  const destDir  = join(PAGES, page);
  const destFile = join(destDir, 'index.astro');
  if (existsSync(destFile)) { console.log(`SKIP: ${page}`); return; }

  const html = readHtml(page);
  if (!html) { console.log(`SKIP (no html): ${page}`); return; }

  const meta      = getMeta(html);
  const workspace = getWorkspace(html);
  const infoInner = getInfoInner(html);
  const toolJs    = getToolJs(html);
  const styles    = getToolStyles(html);
  const cdns      = getCdnScripts(html);

  const ogFile   = ogMap[page] || 'og-image.png';
  const ogImage  = ogFile.endsWith('.svg')
    ? `https://webutilbox.com/assets/og/${ogFile}`
    : `https://webutilbox.com/assets/og-image.png`;
  const hasCss   = html.includes('tool-specific');
  const embedTitle = `${meta.title.replace(' | Webutilbox', '')} -- Webutilbox`;

  // Write tool JS to public/js/[page].js — served as a static file, not processed by esbuild
  if (toolJs) {
    mkdirSync(PUBJS, { recursive: true });
    writeFileSync(join(PUBJS, `${page}.js`), toolJs, 'utf8');
  }

  const lines = [
    '---',
    `import ToolLayout from '../../layouts/ToolLayout.astro';`,
    '',
    `const canonical = '${meta.canonical}';`,
    `const jsonLd = ${meta.jsonLd || '{}'};`,
    '---',
    '',
    '<ToolLayout',
    `  title="${safeAttr(meta.title)}"`,
    `  description="${safeAttr(meta.desc)}"`,
    `  canonical={canonical}`,
    `  ogImage="${ogImage}"`,
    `  keywords="${safeAttr(meta.keywords)}"`,
    `  h1="${safeAttr(meta.h1)}"`,
    `  subtitle="${safeAttr(meta.subtitle)}"`,
    `  lastUpdated="${meta.updated}"`,
    `  shareText="${meta.shareText}"`,
    `  shareUrl={canonical}`,
    `  embedUrl={canonical}`,
    `  embedTitle="${safeAttr(embedTitle)}"`,
    `  embedHeight={600}`,
    `  toolCss={${hasCss}}`,
    `  jsonLd={jsonLd}`,
    '>',
    '',
    workspace,
    '',
    styles,
    '',
    cdns,
    // Tool JS loaded from static file — completely bypasses Astro/esbuild
    ...(toolJs ? [`<script src="/js/${page}.js" defer><\/script>`] : []),
    '',
    '<div class="info-section" slot="info">',
    infoInner,
    '</div>',
    '',
    '</ToolLayout>',
  ];

  mkdirSync(destDir, { recursive: true });
  writeFileSync(destFile, lines.join('\n'), 'utf8');
  console.log(`OK: ${page}`);
}

const arg = process.argv[2];
if (arg) {
  migrate(arg);
} else {
  const allTools = readdirSync(SITE, { withFileTypes: true })
    .filter(d => d.isDirectory() && existsSync(join(SITE, d.name, 'index.html'))
              && d.name !== 'tools' && d.name !== 'astro')
    .map(d => d.name).sort();
  const toRun = allTools.filter(p => !existsSync(join(PAGES, p, 'index.astro')));
  console.log(`Migrating ${toRun.length} tools...`);
  for (const p of toRun) migrate(p);
  console.log('\nDone.');
}

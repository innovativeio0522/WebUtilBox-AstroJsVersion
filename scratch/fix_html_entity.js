import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.resolve(__dirname, '../src/pages/html-entity-encoder/index.astro');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace('Encode ?</button>', 'Encode →</button>');
content = content.replace('? Decode</button>', '← Decode</button>');

content = content.replace('?? Encoded:', '🔢 Encoded:');
content = content.replace('?? Entities:', '🔄 Entities:');

// Replace reference table mappings
content = content.split('<code>&lt;</code> ? <code>&amp;lt;</code>').join('<code>&lt;</code> → <code>&amp;lt;</code>');
content = content.split('<code>&gt;</code> ? <code>&amp;gt;</code>').join('<code>&gt;</code> → <code>&amp;gt;</code>');
content = content.split('<code>&amp;</code> ? <code>&amp;amp;</code>').join('<code>&amp;</code> → <code>&amp;amp;</code>');
content = content.split('<code>"</code> ? <code>&amp;quot;</code>').join('<code>"</code> → <code>&amp;quot;</code>');
content = content.split('<code>\'</code> ? <code>&amp;apos;</code>').join('<code>\'</code> → <code>&amp;apos;</code>');
content = content.split('<code>©</code> ? <code>&amp;copy;</code>').join('<code>©</code> → <code>&amp;copy;</code>');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully fixed html-entity-encoder/index.astro cleanly');

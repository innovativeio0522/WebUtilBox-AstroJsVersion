import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.resolve(__dirname, '../src/pages/favicon-generator/index.astro');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace('?? 16×16', '📥 16×16');
content = content.replace('?? 32×32', '📥 32×32');
content = content.replace('?? 64×64', '📥 64×64');
content = content.replace('?? 128×128', '📥 128×128');
content = content.replace('?? 256×256', '📥 256×256');
content = content.replace('?? Copy', '📋 Copy');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully fixed favicon-generator/index.astro cleanly');

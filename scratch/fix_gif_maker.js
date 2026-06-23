import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.resolve(__dirname, '../src/pages/gif-maker/index.astro');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace('margin-bottom: 15px;">???</div>', 'margin-bottom: 15px;">📤</div>');
content = content.replace('?? Create GIF', '🎬 Create GIF');
content = content.replace('margin-bottom: 10px;">?</div>', 'margin-bottom: 10px;">⏳</div>');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully fixed gif-maker/index.astro cleanly');

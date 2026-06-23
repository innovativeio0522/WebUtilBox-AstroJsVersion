import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WORKSPACE_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(WORKSPACE_DIR, 'src', 'pages');

// 1. Fix tax-calculator/index.astro
const taxPath = path.join(SRC_DIR, 'tax-calculator', 'index.astro');
if (fs.existsSync(taxPath)) {
  let content = fs.readFileSync(taxPath, 'utf8');
  
  // Replace flag emojis using replaceAll
  content = content.replaceAll('???? United States', '🇺🇸 United States');
  content = content.replaceAll('???? United Kingdom', '🇬🇧 United Kingdom');
  content = content.replaceAll('???? Canada', '🇨🇦 Canada');
  content = content.replaceAll('???? Australia', '🇦🇺 Australia');
  content = content.replaceAll('???? India', '🇮🇳 India');
  content = content.replaceAll('???? Germany', '🇩🇪 Germany');
  content = content.replaceAll('???? France', '🇫🇷 France');
  content = content.replaceAll('???? Japan', '🇯🇵 Japan');
  content = content.replaceAll('???? Brazil', '🇧🇷 Brazil');
  content = content.replaceAll('???? Mexico', '🇲🇽 Mexico');
  
  // Replace INR currency symbol
  content = content.replaceAll("INR: '?'", "INR: '₹'");

  fs.writeFileSync(taxPath, content, 'utf8');
  console.log('Fixed tax-calculator/index.astro');
} else {
  console.warn('tax-calculator/index.astro not found');
}

// 2. Fix crypto-profit-calculator/index.astro
const cryptoPath = path.join(SRC_DIR, 'crypto-profit-calculator', 'index.astro');
if (fs.existsSync(cryptoPath)) {
  let content = fs.readFileSync(cryptoPath, 'utf8');
  
  // Replace profit/loss emojis
  content = content.replaceAll('?? Profit!', '📈 Profit!');
  content = content.replaceAll('?? Loss!', '📉 Loss!');
  content = content.replaceAll('?? Break-even!', '⚖️ Break-even!');
  
  // Replace broken em-dashes and other text
  content = content.replaceAll('trade performance ? profit or loss, ROI, break-even price, and net gains after fees ? all in one place', 'trade performance — profit or loss, ROI, break-even price, and net gains after fees — all in one place');
  content = content.replaceAll('manually ? which gets', 'manually — which gets');
  content = content.replaceAll('break-even price ? the minimum sell price', 'break-even price — the minimum sell price');
  content = content.replaceAll('any cryptocurrency ? Bitcoin', 'any cryptocurrency — Bitcoin');
  content = content.replaceAll('any fiat currency ? just enter', 'any fiat currency — just enter');
  content = content.replaceAll('Color-coded results ? green', 'Color-coded results — green');
  content = content.replaceAll('buy price ? the price per coin', 'buy price — the price per coin');
  content = content.replaceAll('sell price ? the price per coin', 'sell price — the price per coin');
  content = content.replaceAll('investment amount ? the total', 'investment amount — the total');
  content = content.replaceAll('buy fee percentage ? typically', 'buy fee percentage — typically');
  content = content.replaceAll('sell fee percentage ? same as', 'sell fee percentage — same as');
  content = content.replaceAll('Tax preparation ? calculating', 'Tax preparation — calculating');
  content = content.replaceAll('is 1% ? which means', 'is 1% — which means');
  content = content.replaceAll('provides ? net of fees ? is', 'provides — net of fees — is');
  content = content.replaceAll('investment ? a 10% ROI', 'investment — a 10% ROI');

  fs.writeFileSync(cryptoPath, content, 'utf8');
  console.log('Fixed crypto-profit-calculator/index.astro');
} else {
  console.warn('crypto-profit-calculator/index.astro not found');
}

// 3. Fix metronome/index.astro
const metronomePath = path.join(SRC_DIR, 'metronome', 'index.astro');
if (fs.existsSync(metronomePath)) {
  let content = fs.readFileSync(metronomePath, 'utf8');
  content = content.replaceAll('? Stop', '🛑 Stop');
  fs.writeFileSync(metronomePath, content, 'utf8');
  console.log('Fixed metronome/index.astro');
} else {
  console.warn('metronome/index.astro not found');
}

// 4. Fix pdf-images-converter/index.astro
const pdfPath = path.join(SRC_DIR, 'pdf-images-converter', 'index.astro');
if (fs.existsSync(pdfPath)) {
  let content = fs.readFileSync(pdfPath, 'utf8');
  content = content.replaceAll('PDF ? Images Converter', 'PDF to Images Converter');
  content = content.replaceAll('📄?', '🖼️'); // For Images to PDF mode main icon
  content = content.replaceAll('font-size: 2rem; margin-bottom: 10px;">?</div>', 'font-size: 2rem; margin-bottom: 10px;">⏳</div>');
  fs.writeFileSync(pdfPath, content, 'utf8');
  console.log('Fixed pdf-images-converter/index.astro');
} else {
  console.warn('pdf-images-converter/index.astro not found');
}

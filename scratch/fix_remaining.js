import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKSPACE_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(WORKSPACE_DIR, 'src', 'pages');

const replacements = [
  {
    file: 'voice-recorder/index.astro',
    targets: [
      { from: '<span style="font-size: 1.2rem;">??</span> Resume', to: '<span style="font-size: 1.2rem;">▶️</span> Resume' }
    ]
  },
  {
    file: 'video-thumbnail-generator/index.astro',
    targets: [
      { from: '?? Capture Frame(s)', to: '📸 Capture Frame(s)' }
    ]
  },
  {
    file: 'instagram-bio-generator/index.astro',
    targets: [
      { from: '?? Editor', to: '✏️ Editor' },
      { from: '?? Templates', to: '📋 Templates' },
      { from: '?? Fonts', to: '🔤 Fonts' },
      { from: '?? Emojis', to: '😊 Emojis' }
    ]
  },
  {
    file: 'meme-generator/index.astro',
    targets: [
      { from: "addEmoji('??')", to: "addEmoji('😂')" },
      { from: '">??</button>', to: '">😂</button>' }, // line 159

      { from: "addEmoji('??')", to: "addEmoji('😎')" },
      { from: '">??</button>', to: '">😎</button>' }, // line 160

      { from: "addEmoji('??')", to: "addEmoji('🔥')" },
      { from: '">??</button>', to: '">🔥</button>' }, // line 161

      { from: "addEmoji('??')", to: "addEmoji('💯')" },
      { from: '">??</button>', to: '">💯</button>' }, // line 162

      { from: "addEmoji('??')", to: "addEmoji('👍')" },
      { from: '">??</button>', to: '">👍</button>' }, // line 163

      { from: "addEmoji('??')", to: "addEmoji('❤️')", allowMultiple: true },
      { from: '">??</button>', to: '">❤️</button>' }, // line 164

      { from: "addEmoji('??')", to: "addEmoji('😭')", allowMultiple: true },
      { from: '">??</button>', to: '">😭</button>' }, // line 165

      { from: "addEmoji('??')", to: "addEmoji('🤣')", allowMultiple: true },
      { from: '">??</button>', to: '">🤣</button>' }, // line 166

      { from: "addEmoji('??')", to: "addEmoji('😍')", allowMultiple: true },
      { from: '">??</button>', to: '">😍</button>' }, // line 167

      { from: "addEmoji('??')", to: "addEmoji('🤔')", allowMultiple: true },
      { from: '">??</button>', to: '">🤔</button>' }, // line 168

      { from: "addEmoji('??')", to: "addEmoji('💀')", allowMultiple: true },
      { from: '">??</button>', to: '">💀</button>' }, // line 169

      { from: "addEmoji('?')", to: "addEmoji('⭐')", allowMultiple: true },
      { from: '">?</button>', to: '">⭐</button>' } // line 170
    ]
  },
  {
    file: 'image-metadata/index.astro',
    targets: [
      { from: '??? Remove All Metadata & Download', to: '🗑️ Remove All Metadata & Download' },
      { from: '?? Removes all EXIF data including GPS location', to: '⚠️ Removes all EXIF data including GPS location' }
    ]
  },
  {
    file: 'image-comparison-slider/index.astro',
    targets: [
      { from: '1.5rem; margin-bottom: 5px;">??</div>', to: '1.5rem; margin-bottom: 5px;">📷</div>', allowMultiple: true }
    ]
  },
  {
    file: 'discount-calculator/index.astro',
    targets: [
      { from: '?? $100 with 20% off', to: '💰 $100 with 20% off' },
      { from: '??? $250 with 30% off', to: '🛍️ $250 with 30% off' },
      { from: '?? $50 with 15% + 10% off', to: '🎁 $50 with 15% + 10% off' }
    ]
  },
  {
    file: 'currency-converter/index.astro',
    targets: [
      { from: '???? USD - US Dollar', to: '🇺🇸 USD - US Dollar', allowMultiple: true },
      { from: '???? EUR - Euro', to: '🇪🇺 EUR - Euro', allowMultiple: true },
      { from: '???? GBP - British Pound', to: '🇬🇧 GBP - British Pound', allowMultiple: true },
      { from: '???? JPY - Japanese Yen', to: '🇯🇵 JPY - Japanese Yen', allowMultiple: true },
      { from: '???? CNY - Chinese Yuan', to: '🇨🇳 CNY - Chinese Yuan', allowMultiple: true },
      { from: '???? INR - Indian Rupee', to: '🇮🇳 INR - Indian Rupee', allowMultiple: true },
      { from: '???? CAD - Canadian Dollar', to: '🇨🇦 CAD - Canadian Dollar', allowMultiple: true },
      { from: '???? AUD - Australian Dollar', to: '🇦🇺 AUD - Australian Dollar', allowMultiple: true },
      { from: '???? CHF - Swiss Franc', to: '🇨🇭 CHF - Swiss Franc', allowMultiple: true },
      { from: '???? MXN - Mexican Peso', to: '🇲🇽 MXN - Mexican Peso', allowMultiple: true },
      { from: 'rotate(0deg)\">?</button>', to: 'rotate(0deg)\">⇄</button>' },
      { from: '?? <strong>Note:</strong>', to: '⚠️ <strong>Note:</strong>' }
    ]
  },
  {
    file: 'audio-visualizer/index.astro',
    targets: [
      { from: '?? Upload Audio File', to: '📁 Upload Audio File' },
      { from: '?? Use Microphone', to: '🎤 Use Microphone' }
    ]
  },
  {
    file: 'age-calculator/index.astro',
    targets: [
      { from: '?? <span id="nextBirthday"', to: '📅 <span id="nextBirthday"' },
      { from: '?? <span id="dayOfWeek"', to: '🎉 <span id="dayOfWeek"' }
    ]
  }
];

// Helper to replace sequentially in meme generator without replacing everything at once
function replaceMemeGenerator(content, targets) {
  let updated = content;
  // Emojis mapping for sequential replacement in order
  const emojis = ['😂', '😎', '🔥', '💯', '👍', '❤️', '😭', '🤣', '😍', '🤔', '💀', '⭐'];
  
  // We need to replace the addEmoji calls and button label text
  // Let's do it by index-based replacement on the string for safety.
  // First, let's find all occurrences of addEmoji('??') and replacing them.
  let emojiIndex = 0;
  
  // Replace addEmoji calls
  updated = updated.replace(/addEmoji\('\?\?'\)/g, () => {
    return `addEmoji('${emojis[emojiIndex++]}')`;
  });
  // Replace the single '?' one at the end
  updated = updated.replace(/addEmoji\('\?'\)/g, "addEmoji('⭐')");
  
  // Reset index for button tags
  emojiIndex = 0;
  updated = updated.replace(/">\?\?<\/button>/g, () => {
    return `">${emojis[emojiIndex++]}</button>`;
  });
  // Replace the single '?' button label
  updated = updated.replace(/">\?<\/button>/g, '">⭐</button>');

  return updated;
}

for (const item of replacements) {
  const filePath = path.join(SRC_DIR, item.file);
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    continue;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  if (item.file === 'meme-generator/index.astro') {
    content = replaceMemeGenerator(content, item.targets);
  } else {
    for (const target of item.targets) {
      if (!content.includes(target.from)) {
        console.warn(`Target not found in ${item.file}: "${target.from}"`);
        continue;
      }
      
      if (target.allowMultiple) {
        content = content.split(target.from).join(target.to);
      } else {
        content = content.replace(target.from, target.to);
      }
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Successfully fixed emojis in: ${item.file}`);
  } else {
    console.log(`No changes made to: ${item.file}`);
  }
}

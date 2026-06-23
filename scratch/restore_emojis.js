import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKSPACE_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(WORKSPACE_DIR, 'src', 'pages');
const ORIGINAL_REPO_DIR = 'F:\\Github Projects\\webutilbox';

// List of target tools
const tools = [
  'tax-calculator',
  'salary-calculator',
  'mortgage-calculator',
  'investment-calculator',
  'crypto-profit-calculator'
];

// Fallback dictionary for common phrases/patterns
const fallbackDict = {
  'Download': '💾 Download',
  'Copy All': '📋 Copy All',
  'Upload New': '📤 Upload New',
  'Text': '🔤 Text',
  'Image': '🖼️ Image',
  'Length': '📏 Length',
  'Weight': '⚖️ Weight',
  'Temperature': '🌡️ Temperature',
  'Volume': '🧪 Volume',
  'Area': '📐 Area',
  'Speed': '⚡ Speed',
  'List': '📝 List',
  'Numbered': '🔢 Numbered',
  'Comma': '🔤 Comma',
  'Gaming': '🎮 Gaming',
  'Cool': '😎 Cool',
  'Cute': '✨ Cute',
  'Funny': '😂 Funny',
  'Random': '🎲 Random',
  'Changed': '📝 Changed',
  'Original': '📄 Original',
  'Resume': '▶️ Resume',
  'Start': '▶️ Start',
  'Tap Tempo': '🥁 Tap Tempo',
  'Extract Audio': '🎵 Extract Audio',
  'Capture Frame(s)': '📸 Capture Frame(s)',
  'Split PDF': '✂️ Split PDF',
  'Merge PDFs': '🔗 Merge PDFs',
  'Convert to Images': '🖼️ Convert to Images',
  'Create PDF': '📄 Create PDF',
  'Play Morse Code': '🔊 Play Morse Code',
  'Drag watermark to reposition': '👈 Drag watermark to reposition'
};

// Position arrows for the 3x3 layout
const positionArrows = {
  'top-left': '↖️',
  'top-center': '⬆️',
  'top-right': '↗️',
  'middle-left': '⬅️',
  'center': '⏺️',
  'middle-right': '➡️',
  'bottom-left': '↙️',
  'bottom-center': '⬇️',
  'bottom-right': '↘️'
};

// Normalizes text by removing HTML tags and shrinking whitespace
function normalizeText(text) {
  return text
    .replace(/<[^>]*>/g, '') // remove HTML tags
    .replace(/\s+/g, ' ')    // collapse whitespace
    .trim();
}

function findCleanCommit(tool) {
  // Candidate commits
  const commits = ['55637e7', 'c6a492d', 'main'];
  for (const commit of commits) {
    try {
      const content = execSync(`git show ${commit}:${tool}/index.html`, {
        cwd: ORIGINAL_REPO_DIR,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore']
      });
      if (content && !content.includes('??') && !content.includes('???')) {
        return { commit, content };
      }
    } catch (e) {
      // commit or path does not exist in this commit
    }
  }

  // If still not found, search git log for a clean version of index.html
  try {
    const logOutput = execSync(`git log --follow --oneline -- "${tool}/index.html"`, {
      cwd: ORIGINAL_REPO_DIR,
      encoding: 'utf8'
    });
    const commitHashes = logOutput.split('\n').map(line => line.split(' ')[0]).filter(Boolean);
    for (const hash of commitHashes) {
      const content = execSync(`git show ${hash}:${tool}/index.html`, {
        cwd: ORIGINAL_REPO_DIR,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore']
      });
      if (content && !content.includes('??') && !content.includes('???')) {
        return { commit: hash, content };
      }
    }
  } catch (e) {
    // ignore
  }

  return null;
}

// Main logic
for (const tool of tools) {
  const astroPath = path.join(SRC_DIR, tool, 'index.astro');
  if (!fs.existsSync(astroPath)) {
    console.warn(`Astro file does not exist: ${astroPath}`);
    continue;
  }

  console.log(`\n==================================================`);
  console.log(`Processing: ${tool}`);
  
  let astroContent = fs.readFileSync(astroPath, 'utf8');
  if (!astroContent.includes('??')) {
    console.log(`No question marks found in ${tool}`);
    continue;
  }

  const cleanResult = findCleanCommit(tool);
  let cleanLines = [];
  if (cleanResult) {
    console.log(`Found clean HTML version for ${tool} at commit ${cleanResult.commit}`);
    cleanLines = cleanResult.content.split('\n');
  } else {
    console.log(`Could not find a clean HTML commit for ${tool}. Using dictionary fallbacks.`);
  }

  const astroLines = astroContent.split('\n');
  let updatedLines = [...astroLines];
  let changed = false;

  for (let i = 0; i < astroLines.length; i++) {
    const line = astroLines[i];
    if (!line.includes('??')) continue;

    console.log(`  Line ${i + 1}: ${line.trim()}`);

    // Let's try to match position grid icons first (common for crop/watermark tools)
    let positionMatch = line.match(/setPosition\(['"]([^'"]+)['"]\)/) || line.match(/id=['"]pos-([^'"]+)['"]/);
    if (positionMatch && positionArrows[positionMatch[1]]) {
      const arrow = positionArrows[positionMatch[1]];
      updatedLines[i] = line.replace(/\?\?\+*/g, arrow).replace(/\?\?\?+/g, arrow);
      console.log(`    -> Matched position [${positionMatch[1]}], replaced with: ${arrow}`);
      changed = true;
      continue;
    }

    // Try to match using our clean HTML lines if available
    let foundMatch = false;
    if (cleanLines.length > 0) {
      // Strip tags and whitespace to get search pattern
      const normAstro = normalizeText(line).replace(/\?\?/g, '??').replace(/\?\?\?/g, '???');
      
      // Let's build a regex where ??/??? are wildcards
      const escapedAstro = normAstro
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // escape regex chars
        .replace(/\\\?\\\\\?/g, '(.+)')           // replace escaped \?\? with capture group
        .replace(/\\\?\\\\\?\\\\\?/g, '(.+)');
      
      try {
        const regex = new RegExp(`^${escapedAstro}$`, 'i');
        
        for (const cleanLine of cleanLines) {
          const normClean = normalizeText(cleanLine);
          const match = normClean.match(regex);
          if (match && match[1]) {
            const resolvedEmoji = match[1].trim();
            // Ensure the match is actually an emoji or visual text, not HTML code or long sentences
            if (resolvedEmoji.length <= 4 || /[\uD800-\uDFFF].*/.test(resolvedEmoji)) {
              updatedLines[i] = line.replace(/\?\?\+*/g, resolvedEmoji).replace(/\?\?\?+/g, resolvedEmoji);
              console.log(`    -> Aligned with original HTML line, replaced with: ${resolvedEmoji}`);
              foundMatch = true;
              changed = true;
              break;
            }
          }
        }
      } catch (err) {
        // regex error, fall through
      }
    }

    if (foundMatch) continue;

    // Try dictionary replacement
    let dictFound = false;
    for (const [key, val] of Object.entries(fallbackDict)) {
      if (line.includes(`?? ${key}`) || line.includes(`??? ${key}`)) {
        updatedLines[i] = line.replace(new RegExp(`\\?\\?\\?*\\s*${key}`, 'g'), val);
        console.log(`    -> Dictionary match for "${key}", replaced with: ${val}`);
        dictFound = true;
        changed = true;
        break;
      } else if (line.includes(`>${key}<`)) {
        // e.g. button label
        updatedLines[i] = line.replace(new RegExp(`\\?\\?\\?*\\s*${key}`, 'g'), val);
        console.log(`    -> Button text dictionary match for "${key}", replaced with: ${val}`);
        dictFound = true;
        changed = true;
        break;
      }
    }

    if (dictFound) continue;

    // Extra heuristics for file/upload icons
    if (line.includes('font-size: 3rem') || line.includes('font-size: 2rem') || line.includes('font-size: 5rem')) {
      let replacement = '📤'; // Default upload/input emoji
      if (tool.includes('pdf')) {
        replacement = '📄';
      } else if (tool.includes('voice') || tool.includes('audio')) {
        replacement = '🎤';
      } else if (tool.includes('image') || tool.includes('meme')) {
        replacement = '🖼️';
      }
      updatedLines[i] = line.replace(/\?\?\+*/g, replacement).replace(/\?\?\?+/g, replacement);
      console.log(`    -> Upload box heuristic match, replaced with: ${replacement}`);
      changed = true;
      continue;
    }

    // Default clean-up fallback if we couldn't match anything
    console.log(`    [WARNING] Could not match emoji for line: ${line.trim()}`);
  }

  if (changed) {
    fs.writeFileSync(astroPath, updatedLines.join('\n'), 'utf8');
    console.log(`Saved changes to ${astroPath}`);
  } else {
    console.log(`No changes made to ${astroPath}`);
  }
}

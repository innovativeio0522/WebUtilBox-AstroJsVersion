// Fix bare { } in Astro HTML template areas that Astro parses as JSX expressions.
// Strategy: in the slot="info" section and workspace HTML, replace { with {"{"} 
// EXCEPT when already inside an Astro expression like {canonical} or {jsonLd}.
// We also need to preserve { inside <style> and <script> blocks.

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir  = dirname(fileURLToPath(import.meta.url));
const PAGES  = join(__dir, 'src', 'pages');

function fixFile(filePath) {
  const original = readFileSync(filePath, 'utf8');

  // Split the file into zones:
  // 1. Frontmatter (between first --- and second ---)
  // 2. Template (everything after second ---)

  const fmEnd = original.indexOf('---', 3) + 3; // end of closing ---
  const frontmatter = original.slice(0, fmEnd);
  let template = original.slice(fmEnd);

  // In the template, we must NOT touch:
  //  - <script ...> ... </script> blocks
  //  - <style> ... </style> blocks  
  //  - Astro prop expressions: attr={...}
  //  - Astro slot names: slot="..."
  // We MUST escape { in:
  //  - Regular HTML text nodes and attribute values (non-expression)
  //  - CSS inside style="" inline attributes... but those are rare here

  // Approach: tokenize into safe zones and HTML zones, escape in HTML zones only.
  // Safe zones: <script>...</script>, <style>...</style>, {expr} Astro expressions

  // We'll process the template character by character to find bare { in HTML text
  let result = '';
  let i = 0;

  while (i < template.length) {
    // Skip <script is:inline> blocks entirely
    if (template.slice(i, i + 16) === '<script is:inlin') {
      const end = template.indexOf('</script>', i);
      if (end >= 0) {
        result += template.slice(i, end + 9);
        i = end + 9;
        continue;
      }
    }
    // Skip <script defer|async|src blocks
    if (template.slice(i, i + 7) === '<script') {
      const end = template.indexOf('</script>', i);
      if (end >= 0) {
        result += template.slice(i, end + 9);
        i = end + 9;
        continue;
      }
    }
    // Skip <style> blocks
    if (template.slice(i, i + 7) === '<style>') {
      const end = template.indexOf('</style>', i);
      if (end >= 0) {
        result += template.slice(i, end + 8);
        i = end + 8;
        continue;
      }
    }
    // Skip Astro expressions: {canonical}, {jsonLd}, {true}, {false}, {600}, etc.
    // These are { immediately followed by a valid JS identifier or number
    if (template[i] === '{') {
      const rest = template.slice(i + 1);
      // If it looks like a valid Astro expression (identifier, number, string)
      if (/^[a-zA-Z_$"'`\d!]/.test(rest)) {
        // Find the matching closing brace
        let depth = 1, j = i + 1;
        while (j < template.length && depth > 0) {
          if (template[j] === '{') depth++;
          else if (template[j] === '}') depth--;
          j++;
        }
        result += template.slice(i, j);
        i = j;
        continue;
      }
      // Otherwise it's a bare { in HTML (like CSS rule or JS object in text)
      // Replace with {"{"} 
      result += '{"{"}';
      i++;
      continue;
    }
    // Skip < tags (inside attribute values might have { but that's handled above)
    result += template[i];
    i++;
  }

  const fixed = frontmatter + result;
  if (fixed !== original) {
    writeFileSync(filePath, fixed, 'utf8');
    return true;
  }
  return false;
}

// Process all .astro pages
const tools = readdirSync(PAGES, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

let fixedCount = 0;
for (const tool of tools) {
  const file = join(PAGES, tool, 'index.astro');
  if (!existsSync(file)) continue;
  try {
    if (fixFile(file)) {
      console.log(`Fixed: ${tool}`);
      fixedCount++;
    }
  } catch (e) {
    console.log(`ERROR: ${tool} — ${e.message}`);
  }
}

console.log(`\nFixed ${fixedCount} files. Running build...`);

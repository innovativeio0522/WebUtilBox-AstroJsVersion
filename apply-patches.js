import fs from 'fs';
import path from 'path';

const patchesDir = path.resolve('patches');
const targetDir = path.resolve('node_modules/@astrojs/sitemap/dist');

// Copy index.js
fs.copyFileSync(
  path.join(patchesDir, 'sitemap-index.js'),
  path.join(targetDir, 'index.js')
);

// Copy write-sitemap.js
fs.copyFileSync(
  path.join(patchesDir, 'write-sitemap.js'),
  path.join(targetDir, 'write-sitemap.js')
);

console.log('Patches applied successfully!');

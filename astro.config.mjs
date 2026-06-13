import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://webutilbox.com',
  output: 'static',
  integrations: [sitemap({
    entryLimit: 50000, // High limit to keep all in one file
  })],
  build: {
    format: 'directory',
  },
  compressHTML: true,
});

import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://webutilbox.com',
  output: 'static',
  // @astrojs/sitemap added back once all pages are migrated
  integrations: [],
  build: {
    format: 'directory',
  },
  compressHTML: true,
});

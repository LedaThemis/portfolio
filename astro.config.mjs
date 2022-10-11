import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  site: 'https://leda.dev',
  integrations: [
    tailwind(),
    sitemap({
      customPages: ['https://www.leda.dev'],
    }),
  ],
  adapter: vercel(),
});

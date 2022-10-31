import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel/serverless";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  output: "server",
  site: "https://leda.dev",
  integrations: [
    tailwind(),
    sitemap({
      customPages: ["https://www.leda.dev"],
    }),
    mdx(),
  ],
  adapter: vercel(),
});

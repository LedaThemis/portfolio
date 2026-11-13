import { readFileSync } from "node:fs";

import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";

const SITE = "https://www.alqaba.com";
const SUBJECT = "Adil Al Qaba";

const photos = JSON.parse(
  readFileSync(new URL("./src/data/photos.json", import.meta.url), "utf8"),
).filter((p) => !p.is_hidden);

const caption = (p) => {
  if (p.title.includes(SUBJECT)) return p.title;
  if (p.subject_in_frame === false) return p.title;
  return `${p.title} — ${SUBJECT} pictured`;
};

const toImg = (p) => ({
  url: `${SITE}${p.file}`,
  title: p.title,
  caption: caption(p),
});

const bySlug = new Map(photos.map((p) => [p.slug, p]));
const newest = photos
  .map((p) => p.taken_at)
  .filter(Boolean)
  .sort()
  .at(-1);

// https://astro.build/config
export default defineConfig({
  site: SITE,
  trailingSlash: "never",
  integrations: [
    sitemap({
      serialize(item) {
        const path = new URL(item.url).pathname.replace(/\/$/, "");

        if (path === "/photo-archive") {
          return {
            ...item,
            img: photos.map(toImg),
            lastmod: newest,
            priority: 0.9,
            changefreq: "monthly",
          };
        }

        if (path.startsWith("/photo-archive/")) {
          const photo = bySlug.get(path.slice("/photo-archive/".length));
          if (!photo) return item;
          return {
            ...item,
            img: [toImg(photo)],
            lastmod: photo.taken_at,
            priority: 0.7,
            changefreq: "yearly",
          };
        }

        if (path === "" || path === "/") {
          return {
            ...item,
            img: [
              {
                url: `${SITE}/images/adil-al-qaba.jpg`,
                title: SUBJECT,
                caption: `${SUBJECT}, software engineer and researcher`,
              },
            ],
            priority: 1.0,
            changefreq: "weekly",
          };
        }

        return item;
      },
    }),
    mdx(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});

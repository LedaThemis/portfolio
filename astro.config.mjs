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

// Declare the file each page actually renders as its <img> src. The gallery
// shows the 480px thumb and only offers the full size as a srcset candidate,
// so claiming the full size there made Google treat the gallery as the home
// of every photo and label all of them with the gallery's own title.
const toImg = (p, { thumb = false } = {}) => ({
  url: `${SITE}${thumb ? p.file.replace("/photos/", "/photos/thumbs/") : p.file}`,
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
            img: photos.map((p) => toImg(p, { thumb: true })),
          };
        }

        if (path.startsWith("/photo-archive/")) {
          const photo = bySlug.get(path.slice("/photo-archive/".length));
          if (!photo) return item;
          return {
            ...item,
            img: [toImg(photo)],
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

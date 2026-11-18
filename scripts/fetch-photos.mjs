// Mirrors every entry in src/data/photos.json into public/photos as WebP,
// so the images Google indexes are served from alqaba.com and carry the
// subject's name in the filename. Run after adding a photo:  node scripts/fetch-photos.mjs
import { mkdir, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";

const CLOUD = "https://res.cloudinary.com/dj08db9y2/image";
const OUT = new URL("../public/photos/", import.meta.url);
const SIZES = [
  { dir: OUT, transform: "f_webp,q_auto:good,c_limit,w_1600" },
  { dir: new URL("thumbs/", OUT), transform: "f_webp,q_auto:good,c_limit,w_480" },
];

const photos = JSON.parse(
  readFileSync(new URL("../src/data/photos.json", import.meta.url), "utf8"),
).filter((photo) => !photo.is_hidden);

const sourceUrl = (p, transform) => {
  const src = p.image_mirror ?? p.image;
  const type = src.startsWith("http") ? "fetch" : "upload";
  return `${CLOUD}/${type}/${transform}/${src}`;
};

for (const { dir, transform } of SIZES) {
  await mkdir(dir, { recursive: true });
  let total = 0;
  for (const photo of photos) {
    const name = photo.file.split("/").pop();
    const response = await fetch(sourceUrl(photo, transform));
    if (!response.ok) {
      // Half a mirror is worse than none: the row stays in photos.json, so the
      // page, the <img> and the sitemap would all point at a file never written.
      throw new Error(`${photo.slug}: Cloudinary returned ${response.status}`);
    }
    const bytes = Buffer.from(await response.arrayBuffer());
    await writeFile(new URL(name, dir), bytes);
    total += bytes.length;
  }
  console.log(`${transform} -> ${(total / 1e6).toFixed(2)} MB in ${dir.pathname}`);
}

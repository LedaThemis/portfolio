// Imported by both src/lib/photos.ts and astro.config.mjs, so this file must
// stay free of astro:content: the config is loaded by Node before Astro's
// content layer exists. Two copies of altFor would let the sitemap's captions
// drift away from the alt text on the pages.

export const SUBJECT = "Adil Al Qaba";

export function altFor(p: {
  title: string;
  subject_in_frame?: boolean;
}) {
  if (p.title.includes(SUBJECT)) return p.title;
  if (p.subject_in_frame === false) return p.title;
  return `${p.title} — ${SUBJECT} pictured`;
}

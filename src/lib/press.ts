import { getCollection } from "astro:content";
import { SUBJECT } from "./photos";

const YOUTUBE = /(?:youtu\.be\/|youtube\.com\/watch\?v=)([A-Za-z0-9_-]{11})/;

export function youtubeId(url?: string) {
  return url?.match(YOUTUBE)?.[1];
}

const PLATFORMS: [RegExp, string][] = [
  [/youtu\.be|youtube\.com/, "YouTube"],
  [/facebook\.com/, "Facebook"],
  [/instagram\.com/, "Instagram"],
];

function platformOf(url: string) {
  return PLATFORMS.find(([re]) => re.test(url))?.[1] ?? new URL(url).hostname;
}

export async function getFeatures() {
  const press = await getCollection("press");
  return press
    .flatMap((entry) => {
      if (!entry.data.feature) return [];
      const { feature, ...data } = entry.data;
      // Only YouTube is embedded. Facebook offers no cookie-free player and no
      // thumbnail URL that stays valid, so those pages carry the interview's
      // details and a link out, and no VideoObject: marking up a video the
      // page cannot play would be a claim the page does not support.
      const id = youtubeId(data.reference);
      return [{
        ...data,
        ...feature,
        id,
        url: `/press/${data.slug}`,
        // nocookie serves the same player without setting tracking cookies
        // before the visitor has pressed play.
        embedUrl: id ? `https://www.youtube-nocookie.com/embed/${id}` : undefined,
        thumbUrl: id ? `https://i.ytimg.com/vi/${id}/maxresdefault.jpg` : undefined,
        watchUrl: data.reference,
        platform: platformOf(data.reference),
        uploadDate: data.published_at.toISOString().split("T")[0],
      }];
    })
    .sort((a, b) => b.published_at.getTime() - a.published_at.getTime());
}

export const RTL = new Set(["ar", "fa", "he", "ur"]);

export type Feature = Awaited<ReturnType<typeof getFeatures>>[number];

export function videoObject(v: Feature, site: URL | undefined) {
  const page = new URL(v.url, site).toString();
  return {
    "@type": "VideoObject",
    "@id": `${page}#video`,
    name: v.headline,
    description: v.summary,
    thumbnailUrl: v.thumbUrl,
    uploadDate: v.uploadDate,
    embedUrl: v.embedUrl,
    // The recording belongs to the broadcaster, not to Adil. He is its
    // subject, which is what `about` says.
    publisher: { "@type": "Organization", name: v.publisher },
    about: { "@id": "https://www.alqaba.com/#person" },
    inLanguage: v.language,
    isPartOf: { "@id": "https://www.alqaba.com/#website" },
  };
}

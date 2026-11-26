import { getCollection } from "astro:content";

const YOUTUBE = /(?:youtu\.be\/|youtube\.com\/watch\?v=)([A-Za-z0-9_-]{11})/;

function youtubeId(url?: string) {
  return url?.match(YOUTUBE)?.[1];
}

const PLATFORMS: [RegExp, string][] = [
  [/youtu\.be|youtube\.com/, "YouTube"],
  [/facebook\.com/, "Facebook"],
  [/instagram\.com/, "Instagram"],
];

// W3C i18n guidance: set dir wherever you set lang for a right-to-left
// language. It matters most on the strings that mix Arabic runs with dashes,
// because a neutral dash takes the container's direction and reorders them.
export const dirFor = (lang: string) => (lang === "ar" ? "rtl" : undefined);

// undefined for an article, which never shows a platform
function platformOf(url: string) {
  return PLATFORMS.find(([re]) => re.test(url))?.[1];
}

export async function getFeatures() {
  const press = await getCollection("press");
  return press
    .flatMap((entry) => {
      if (!entry.data.feature) return [];
      const { feature, ...data } = entry.data;
      // Only YouTube is embedded. facebook.com/plugins/video.php returns
      // "video not available" for all four Facebook posts and they expose no
      // video id, so there is nothing to embed, cookie-free or otherwise.
      // Those pages link out and carry no VideoObject: marking up a video the
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

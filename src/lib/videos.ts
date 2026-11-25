import { getCollection } from "astro:content";
import { SUBJECT } from "./photos";

const YOUTUBE = /(?:youtu\.be\/|youtube\.com\/watch\?v=)([A-Za-z0-9_-]{11})/;

export function youtubeId(url?: string) {
  return url?.match(YOUTUBE)?.[1];
}

export async function getVideos() {
  const press = await getCollection("press");
  return press
    .flatMap((entry) => {
      const id = youtubeId(entry.data.reference);
      if (!id || !entry.data.video) return [];
      const { video, ...data } = entry.data;
      return [{
        ...data,
        ...video,
        id,
        url: `/press/${data.slug}`,
        // nocookie serves the same player without setting tracking cookies
        // before the visitor has pressed play.
        embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
        watchUrl: `https://www.youtube.com/watch?v=${id}`,
        thumbUrl: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
        uploadDate: data.published_at.toISOString().split("T")[0],
      }];
    })
    .sort((a, b) => b.published_at.getTime() - a.published_at.getTime());
}

export type Video = Awaited<ReturnType<typeof getVideos>>[number];

export function videoObject(v: Video, site: URL | undefined) {
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

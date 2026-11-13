import { getCollection } from "astro:content";

export const SUBJECT = "Adil Al Qaba";

export type PhotoData = {
  is_featured?: boolean;
  is_hidden?: boolean;
  subject_in_frame?: boolean;
  slug: string;
  title: string;
  file: string;
  reference?: string | null;
  reference_title?: string;
  width: number;
  height: number;
  taken_at?: Date;
  published_at?: Date;
};

const iso = (d?: Date) => (d ? d.toISOString().split("T")[0] : undefined);

export function altFor(p: PhotoData) {
  if (p.title.includes(SUBJECT)) return p.title;
  if (p.subject_in_frame === false) return p.title;
  return `${p.title} — ${SUBJECT} pictured`;
}

export function pageUrl(p: PhotoData) {
  return `/photo-archive/${p.slug}`;
}

export async function getPhotos() {
  const photos = await getCollection("photos", ({ data }) => !data.is_hidden);
  const events = await getCollection("events");

  const byReference = new Map(
    events.filter((e) => e.data.reference).map((e) => [e.data.reference!, e.data]),
  );

  const decorated = photos.map((entry) => {
    const data = entry.data as PhotoData;
    const event = data.reference ? byReference.get(data.reference) : undefined;
    const where = event
      ? Object.values(event.location).filter(Boolean).join(", ")
      : undefined;

    const context = [
      event ? `Photographed at ${event.title}` : undefined,
      where,
      iso(data.taken_at),
    ]
      .filter(Boolean)
      .join(" · ");

    return {
      ...data,
      event,
      where,
      context,
      alt: altFor(data),
      thumb: data.file.replace("/photos/", "/photos/thumbs/"),
      url: pageUrl(data),
      takenISO: iso(data.taken_at),
      publishedISO: iso(data.published_at),
      inFrame: data.subject_in_frame !== false,
    };
  });

  decorated.sort((a, b) => (b.takenISO ?? "").localeCompare(a.takenISO ?? ""));
  return decorated;
}

export type Photo = Awaited<ReturnType<typeof getPhotos>>[number];

export function imageObject(p: Photo, site: URL | undefined) {
  const url = new URL(p.file, site).toString();
  return {
    "@type": "ImageObject",
    "@id": new URL(p.url, site).toString() + "#image",
    contentUrl: url,
    url,
    width: p.width,
    height: p.height,
    name: p.title,
    caption: p.alt,
    description: [p.alt, p.context].filter(Boolean).join(". "),
    representativeOfPage: true,
    ...(p.takenISO ? { dateCreated: p.takenISO } : {}),
    ...(p.publishedISO ? { uploadDate: p.publishedISO } : {}),
    ...(p.inFrame ? { about: { "@id": "https://www.alqaba.com/#person" } } : {}),
    creditText: p.reference_title ?? "Own work",
    ...(p.reference ? { isBasedOn: p.reference } : {}),
  };
}

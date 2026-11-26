import { getCollection } from "astro:content";
import { altFor } from "./subject";

export { SUBJECT } from "./subject";

export type PhotoData = {
  is_featured?: boolean;
  is_hidden?: boolean;
  subject_in_frame?: boolean;
  slug: string;
  title: string;
  file: string;
  reference?: string | null;
  event?: string;
  reference_title?: string;
  creator?: string;
  width: number;
  height: number;
  taken_at?: Date;
  published_at?: Date;
  image: string;
  image_mirror?: string;
};

const iso = (d?: Date) => (d ? d.toISOString().split("T")[0] : undefined);

// Social scrapers (LinkedIn and WhatsApp especially) are unreliable with WebP,
// so the share card is a JPEG rendered from the Cloudinary original.
const OG_CARD = "f_jpg,q_auto:good,c_fill,g_auto,w_1200,h_630";
function ogCard(data: PhotoData) {
  const src = data.image_mirror ?? data.image;
  const kind = src.startsWith("http") ? "fetch" : "upload";
  return `https://res.cloudinary.com/dj08db9y2/image/${kind}/${OG_CARD}/${src}`;
}

function pageUrl(p: PhotoData) {
  return `/photo-archive/${p.slug}`;
}

export async function getPhotos() {
  const photos = await getCollection("photos", ({ data }) => !data.is_hidden);
  const events = await getCollection("events");

  // reference matches a photo published on the event's own page; event names
  // the event outright, which also reaches the one event that has no URL.
  const byReference = new Map(
    events.filter((e) => e.data.reference).map((e) => [e.data.reference!, e.data]),
  );
  const byTitle = new Map(events.map((e) => [e.data.title, e.data]));

  const decorated = photos.map((entry) => {
    const data = entry.data as PhotoData;
    // reference is where the photograph came from; event is which event it was
    // taken at. A photo of Adil's own has a source of "Own work" and still
    // belongs to an event.
    const event = data.event
      ? byTitle.get(data.event)
      : data.reference
        ? byReference.get(data.reference)
        : undefined;
    const where = event
      ? [event.location.venue, event.location.city, event.location.country]
          .filter(Boolean)
          .join(", ")
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
      hoverText: [
        data.title,
        iso(data.taken_at) && `Taken: ${iso(data.taken_at)}`,
        `Source: ${data.reference_title ?? "Own work"}`,
      ]
        .filter(Boolean)
        .join(" | "),
      thumb: data.file.replace("/photos/", "/photos/thumbs/"),
      ogCard: ogCard(data),
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

export function imageObject(p: Photo, site: URL | undefined, representative = false) {
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
    ...(representative ? { representativeOfPage: true } : {}),
    ...(p.takenISO ? { dateCreated: p.takenISO } : {}),
    ...(p.publishedISO ? { uploadDate: p.publishedISO } : {}),
    ...(p.inFrame ? { about: { "@id": "https://www.alqaba.com/#person" } } : {}),
    creditText: p.reference_title ?? "Own work",
    ...(p.creator ? { creator: { "@type": "Person", name: p.creator } } : {}),
    ...(p.reference ? { isBasedOn: p.reference } : {}),
  };
}

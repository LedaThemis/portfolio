import { defineCollection } from "astro:content";

import { glob, file } from "astro/loaders";

import { z } from "astro/zod";

const events = defineCollection({
  loader: file("src/data/events.json"),
  schema: z.object({
    is_featured: z.boolean().optional(),
    title: z.string(),
    role: z.string(),
    reference: z.string().optional(),
    location: z.object({
      venue: z.string().optional(),
      city: z.string(),
      country: z.string(),
    }),
    start_date: z.coerce.date(),
    end_date: z.coerce.date(),
    mention: z.object({
        lang: z.string(),
        text: z.string(),
    }).optional(),
  }),
});

const press = defineCollection({
  loader: file("src/data/press.json"),
  schema: z.object({
    is_featured: z.boolean().optional(),
    title: z.string(),
    reference: z.string().optional(),
    published_at: z.coerce.date(),
    mention: z.object({
        lang: z.string(),
        text: z.string(),
    }).optional(),
  }),
});

const photos = defineCollection({
  loader: file("src/data/photos.json"),
  schema: z.object({
    is_featured: z.boolean().optional(),
    is_hidden: z.boolean().optional(),
    title: z.string(),
    reference: z.string().optional().nullable(),
    reference_title: z.string().optional(),
    width: z.number().default(200),
    height: z.number().default(200),
    image: z.string(),
    image_mirror: z.string().optional(),
    taken_at: z.coerce.date().optional(),
    published_at: z.coerce.date().optional(),
  }),
});

const writing = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/data/writing" }),
  schema: z.object({
    is_published: z.boolean().optional(),
    title: z.string(),
    description: z.string(),
  }),
});

export const collections = { events, press, photos, writing };

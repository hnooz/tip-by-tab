import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const tips = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "../tips" }),
  schema: z.object({
    id: z
      .string()
      .regex(/^[a-z]+-\d{4}$/)
      .optional(),
    title: z.string().min(10).max(90),
    stack: z.string().regex(/^[a-z][a-z0-9-]*$/),
    tags: z.array(z.string()).min(1).max(5),
    language: z.string().regex(/^[a-z][a-z0-9-]*$/),
    file: z.string().optional(),
    author: z.object({
      github: z.string().regex(/^[a-zA-Z0-9-]+$/),
      name: z.string().min(2).max(60),
    }),
    source: z.url().optional(),
    publishedAt: z.coerce.date(),
  }),
});

export const collections = { tips };

import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    author: z.string().default('Webutilbox Team'),
    category: z.string(),
    tags: z.array(z.string()).default([]),
    keywords: z.string().default(''),
    coverImage: z.string().optional(),
    relatedTool: z.object({
      name: z.string(),
      href: z.string(),
      icon: z.string()
    }).optional()
  })
});

export const collections = { blog };

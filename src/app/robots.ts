import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://puzzle-meta-mechanic.vercel.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/'], // Hide admin routes from crawlers
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}

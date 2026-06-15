import type { APIContext } from 'astro';

export async function GET(_context: APIContext) {
  return new Response(
    `User-agent: *
Allow: /
Sitemap: https://ncert-library.org/sitemap-index.xml

# Disallow private areas
Disallow: /api/
`,
    {
      headers: { 'Content-Type': 'text/plain' },
    },
  );
}

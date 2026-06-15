import rss from '@astrojs/rss';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  return rss({
    title: 'NCERT Library',
    description: 'Latest NCERT textbooks and updates',
    site: context.site ?? 'https://ncert-library.org',
    items: [
      {
        title: 'NCERT Textbook Collection',
        pubDate: new Date(),
        description:
          'Complete collection of NCERT textbooks from Class I to XII.',
        link: '/books',
      },
    ],
    customData: '<language>en-us</language>',
  });
}

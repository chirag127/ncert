interface SiteConfig {
  slug: string
  name: string
  origin: string
  tagline: string
  description?: string
}

export const SITE_CONFIG: SiteConfig = {
  slug: 'ncert',
  name: 'NCERT',
  origin: 'https://ncert.oriz.in',
  tagline: 'NCERT textbook directory — browse, search, and download for free.',
  description:
    'A free, open directory of NCERT textbooks (Pre-Primary through Class XII). Browse by class, subject, and language; download merged whole-book PDFs from GitHub Releases.',
}

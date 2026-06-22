/**
 * Flat NCERT catalogue loader — used by /[class], /[class]/[subject]/[lang]
 * pages. The shape mirrors data/books.json (per spec):
 *
 *   { class, subject, lang, title, pdf_url }
 *
 * This is intentionally separate from src/lib/books.ts (legacy BookMetadata
 * with chapters) — the v0 spec wants the simple flat form.
 */
import fs from 'node:fs'
import path from 'node:path'

export interface NcertEntry {
  class: string
  subject: string
  lang: 'en' | 'hi'
  title: string
  pdf_url: string
}

let cache: NcertEntry[] | null = null

export function loadCatalog(): NcertEntry[] {
  if (cache) return cache
  const jsonPath = path.resolve(process.cwd(), 'data/books.json')
  try {
    const raw = fs.readFileSync(jsonPath, 'utf-8')
    cache = JSON.parse(raw) as NcertEntry[]
    return cache
  } catch {
    cache = []
    return cache
  }
}

export const CLASSES = [
  'pre-primary',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
] as const

export function classLabel(cls: string): string {
  if (cls === 'pre-primary') return 'Pre-Primary'
  return `Class ${cls}`
}

export function subjectLabel(subject: string): string {
  return subject
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ')
}

export function langLabel(lang: string): string {
  return lang === 'hi' ? 'हिंदी' : 'English'
}

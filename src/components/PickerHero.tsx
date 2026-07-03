/*
 * PickerHero — the v0 signature.
 *
 * 3 cascading columns: Class → Subject → Language. Below them, a single
 * "Download book" CTA that becomes enabled once all three are picked. Click
 * navigates to /{class}/{subject}/{lang}/ which is the existing book page.
 *
 * Subjects per class are filtered from data/books.json (passed in as
 * `entries`). If a class has no entries (unlikely), we fall back to a fixed
 * subject list so the UI never goes empty.
 *
 * No external deps. Renders client:load. State is purely local.
 */
import { useEffect, useMemo, useState } from 'react'

type Lang = 'en' | 'hi'

interface Entry {
  class: string
  subject: string
  lang: Lang
  title: string
  pdf_url: string
}

interface Props {
  entries: Entry[]
  classes: string[]
  classLabel: Record<string, string>
  subjectLabel: Record<string, string>
}

const FALLBACK_SUBJECTS = ['math', 'science', 'english', 'hindi', 'social-science', 'evs']

export default function PickerHero({ entries, classes, classLabel, subjectLabel }: Props) {
  const [cls, setCls] = useState<string | null>(null)
  const [subject, setSubject] = useState<string | null>(null)
  const [lang, setLang] = useState<Lang | null>(null)

  // Subjects available for the chosen class.
  const subjects = useMemo(() => {
    if (!cls) return [] as string[]
    const seen = new Set<string>()
    for (const e of entries) if (e.class === cls) seen.add(e.subject)
    if (seen.size === 0) for (const s of FALLBACK_SUBJECTS) seen.add(s)
    return [...seen]
  }, [cls, entries])

  // Languages available for the chosen class+subject.
  const langs = useMemo(() => {
    if (!cls || !subject) return [] as Lang[]
    const seen = new Set<Lang>()
    for (const e of entries) {
      if (e.class === cls && e.subject === subject) seen.add(e.lang)
    }
    if (seen.size === 0) {
      seen.add('en')
      seen.add('hi')
    }
    return [...seen]
  }, [cls, subject, entries])

  // Reset downstream when upstream changes.
  useEffect(() => {
    setSubject(null)
    setLang(null)
  }, [])
  useEffect(() => {
    setLang(null)
  }, [])

  const target = useMemo(() => {
    if (!cls || !subject || !lang) return null
    const hit = entries.find((e) => e.class === cls && e.subject === subject && e.lang === lang)
    return hit?.pdf_url ?? `/${cls}/${subject}/${lang}/`
  }, [cls, subject, lang, entries])

  return (
    <section className="picker" aria-label="Pick a book in 3 steps">
      <div className="picker-grid">
        {/* Column 1 — Class */}
        <div className="picker-col">
          <div className="picker-head">
            <span className="picker-step">01</span>
            <span className="picker-title">Class</span>
          </div>
          <div className="picker-options picker-options--classes">
            {classes.map((c) => (
              <button
                key={c}
                type="button"
                className={`opt opt--class ${cls === c ? 'opt--active' : ''}`}
                onClick={() => setCls(c)}
              >
                {c === 'pre-primary' ? 'Pre-K' : c}
              </button>
            ))}
          </div>
        </div>

        {/* Column 2 — Subject */}
        <div className={`picker-col ${cls ? '' : 'picker-col--disabled'}`}>
          <div className="picker-head">
            <span className="picker-step">02</span>
            <span className="picker-title">Subject</span>
          </div>
          <div className="picker-options">
            {!cls && <p className="picker-hint">Pick a class to begin.</p>}
            {cls &&
              subjects.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`opt opt--subject ${subject === s ? 'opt--active' : ''}`}
                  onClick={() => setSubject(s)}
                >
                  {subjectLabel[s] ?? s}
                </button>
              ))}
          </div>
        </div>

        {/* Column 3 — Language */}
        <div className={`picker-col ${subject ? '' : 'picker-col--disabled'}`}>
          <div className="picker-head">
            <span className="picker-step">03</span>
            <span className="picker-title">Language</span>
          </div>
          <div className="picker-options">
            {!subject && <p className="picker-hint">Pick a subject next.</p>}
            {subject &&
              langs.map((l) => (
                <button
                  key={l}
                  type="button"
                  className={`opt opt--lang ${lang === l ? 'opt--active' : ''}`}
                  onClick={() => setLang(l)}
                >
                  {l === 'hi' ? 'हिंदी' : 'English'}
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="picker-cta">
        <a
          className={`picker-btn ${target ? '' : 'picker-btn--disabled'}`}
          href={target ?? '#'}
          aria-disabled={target ? 'false' : 'true'}
          onClick={(e) => {
            if (!target) e.preventDefault()
          }}
        >
          <span>Download book</span>
          <span aria-hidden="true">↓</span>
        </a>
        <p className="picker-summary">
          {cls ? (
            <>
              <strong>{classLabel[cls] ?? `Class ${cls}`}</strong>
              {subject ? <> · {subjectLabel[subject] ?? subject}</> : null}
              {lang ? <> · {lang === 'hi' ? 'हिंदी' : 'English'}</> : null}
            </>
          ) : (
            <span className="picker-hint">No class selected.</span>
          )}
        </p>
      </div>
    </section>
  )
}

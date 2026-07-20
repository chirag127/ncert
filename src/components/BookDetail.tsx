/**
 * BookDetail — three-column at ≥1024px, single-column below.
 *
 * Per the v2 brief:
 *   Left (220px):    cover image (NCERT scan, 4:5, 1px brass border, no shadow)
 *                    Below: download button `[ Download PDF · 18.4 MB ]` in
 *                    JetBrains Mono inside square brackets, cinnabar text on
 *                    Card Bone, no fill.
 *   Middle (flex):   H1 title in Plex Serif, Hindi subtitle below in Plex
 *                    Sans Devanagari at 0.7× size, then a leader-dotted
 *                    chapter list — `01 ····· Relations and Functions ········· ⬇ PDF`.
 *                    Leader dots via CSS `border-bottom: 1px dotted` on a
 *                    flex spacer in brass at 40% opacity. Hover row: dots
 *                    fade to 100% + 2px Cinnabar bracket on left edge.
 *   Right (200px):   spec sidebar — Class, Subject, Medium, Publisher,
 *                    Edition year, Pages, ISBN, Last scraped (mono).
 *
 * Print stylesheet handled in global.css `@media print`. Cover + spec
 * sidebar + chapter list survive; chrome + download button hide.
 */
import type { BookMetadata } from '~/lib/types'

const NCERT_BASE = 'https://ncert.nic.in'

interface Props {
  book: BookMetadata
}

const SUBJECT_LABEL: Record<string, string> = {
  mathematics: 'Mathematics',
  science: 'Science',
  'social-science': 'Social Studies',
  social: 'Social Studies',
  english: 'English',
  hindi: 'Hindi',
}

function classDisplay(c: string): string {
  return c.replace('class-', 'Class ').replace('balvatika-', 'Balvatika ')
}

function subjectDisplay(s: string): string {
  return (
    SUBJECT_LABEL[s.toLowerCase()] ?? s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  )
}

function formatBytes(n?: number): string | null {
  if (!n || n <= 0) return null
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`
  if (n >= 1024) return `${(n / 1024).toFixed(0)} KB`
  return `${n} B`
}

export default function BookDetail({ book }: Props) {
  const cls = classDisplay(book.class)
  const subj = subjectDisplay(book.subject)
  const mergedBookUrl = book.downloadUrl ?? `${NCERT_BASE}/textbook/pdf/${book.bookCode}.pdf`
  const safeTitle = book.title.replace(/[^a-z0-9]/gi, '_')
  const sizeLabel = formatBytes((book as BookMetadata & { fileSize?: number }).fileSize)
  const cover = (book as BookMetadata & { coverImage?: string }).coverImage
  const pages = (book as BookMetadata & { pageCount?: number }).pageCount
  const lastUpdated = (book as BookMetadata & { lastUpdated?: string }).lastUpdated

  return (
    <article className="bd-root">
      <nav aria-label="Breadcrumb" className="bd-crumbs mono">
        <a href="/">CATALOGUE</a>
        <span aria-hidden="true">/</span>
        <span className="current">{book.bookCode.toUpperCase()}</span>
      </nav>

      <div className="bd-grid">
        <aside className="bd-cover-col">
          {cover ? (
            <img src={cover} alt={`Cover of ${book.title}`} className="bd-cover" loading="eager" />
          ) : (
            <div className="bd-cover bd-cover-placeholder" aria-hidden="true">
              <span>{book.bookCode.toUpperCase()}</span>
            </div>
          )}

          <a
            href={mergedBookUrl}
            download={`${book.bookCode}-${safeTitle}.pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="bd-download mono"
            data-no-print
          >
            [ Download PDF{sizeLabel ? ` · ${sizeLabel}` : ''} ]
          </a>
        </aside>

        <section className="bd-main">
          <p className="bd-eyebrow mono">
            {cls.toUpperCase()} · {subj.toUpperCase()} · {book.language.toUpperCase()}
          </p>
          <h1 className="bd-title">{book.title}</h1>
          {book.subtitle && <p className="bd-subtitle">{book.subtitle}</p>}
          {book.description && <p className="bd-desc">{book.description}</p>}

          <h2 className="bd-section-h">Chapters</h2>
          <ol className="bd-chapters">
            {book.chapters.map((chapter) => {
              const chapterFilename = `${book.bookCode}-${String(chapter.number).padStart(
                2,
                '0',
              )}-${chapter.name
                .replace(/[<>:"/\\|?*]/g, '_')
                .replace(/\s+/g, '_')
                .toLowerCase()}.pdf`
              return (
                <li key={chapter.number} className="bd-chapter">
                  <a
                    href={chapter.url}
                    download={chapterFilename}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="ch-num mono">{String(chapter.number).padStart(2, '0')}</span>
                    <span className="ch-name">{chapter.name}</span>
                    <span className="leader" aria-hidden="true" />
                    <span className="ch-pdf mono">PDF</span>
                  </a>
                </li>
              )
            })}
          </ol>
        </section>

        <aside className="bd-spec mono" aria-label="Book specifications">
          <dl>
            <div className="dl-row">
              <dt>CLASS</dt>
              <dd>{cls}</dd>
            </div>
            <div className="dl-row">
              <dt>SUBJECT</dt>
              <dd>{subj}</dd>
            </div>
            <div className="dl-row">
              <dt>MEDIUM</dt>
              <dd>{book.language.charAt(0).toUpperCase() + book.language.slice(1)}</dd>
            </div>
            <div className="dl-row">
              <dt>PUBLISHER</dt>
              <dd>NCERT</dd>
            </div>
            {book.editionYear && (
              <div className="dl-row">
                <dt>EDITION</dt>
                <dd>{book.editionYear}</dd>
              </div>
            )}
            {pages && (
              <div className="dl-row">
                <dt>PAGES</dt>
                <dd>{pages}</dd>
              </div>
            )}
            <div className="dl-row">
              <dt>CODE</dt>
              <dd>{book.bookCode.toUpperCase()}</dd>
            </div>
            <div className="dl-row">
              <dt>CHAPTERS</dt>
              <dd>{book.numberOfChapters}</dd>
            </div>
            {lastUpdated && (
              <div className="dl-row">
                <dt>SYNCED</dt>
                <dd>
                  <time dateTime={lastUpdated}>{lastUpdated.slice(0, 10)}</time>
                </dd>
              </div>
            )}
          </dl>
        </aside>
      </div>

      <style>{`
        .bd-root { padding-block: 1.5rem 4rem; }

        .bd-crumbs {
          display: flex;
          gap: 0.5rem;
          align-items: center;
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--ink-mute);
          margin-bottom: 1.75rem;
          font-feature-settings: 'tnum' 1, 'zero' 1, 'ss20' 1, 'calt' 0;
        }
        .bd-crumbs a { color: var(--ink-mute); text-decoration: none; }
        .bd-crumbs a:hover { color: var(--cinnabar); }
        .bd-crumbs .current { color: var(--ink); }

        .bd-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
          align-items: start;
        }
        @media (min-width: 1024px) {
          .bd-grid {
            grid-template-columns: 220px 1fr 200px;
            gap: 2.5rem;
          }
        }

        /* ============= Cover column ============= */
        .bd-cover-col { display: flex; flex-direction: column; gap: 1rem; }
        .bd-cover {
          display: block;
          width: 100%;
          aspect-ratio: 4 / 5;
          object-fit: cover;
          border: 1px solid var(--brass);
          background: var(--card);
          color: var(--graphite);
        }
        .bd-cover-placeholder {
          display: grid;
          place-items: center;
          font-family: var(--font-mono);
          font-size: 16px;
          letter-spacing: 0.16em;
          color: var(--graphite-soft);
          font-feature-settings: 'tnum' 1, 'zero' 1, 'ss20' 1, 'calt' 0;
        }
        .bd-download {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.625rem 0.75rem;
          background: var(--card);
          color: var(--cinnabar);
          border: 1px solid var(--brass);
          border-radius: 0;
          font-family: var(--font-mono);
          font-size: 12px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          text-decoration: none;
          font-feature-settings: 'tnum' 1, 'zero' 1, 'ss20' 1, 'calt' 0;
        }
        .bd-download:hover { border-color: var(--cinnabar); color: var(--cinnabar); }

        /* ============= Main column ============= */
        .bd-main { min-width: 0; }
        .bd-eyebrow {
          margin: 0 0 0.625rem;
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--ink-mute);
          font-feature-settings: 'tnum' 1, 'zero' 1, 'ss20' 1, 'calt' 0;
        }
        .bd-title {
          margin: 0;
          font-family: var(--font-display);
          font-weight: 500;
          font-size: clamp(1.75rem, 4vw, 2rem);
          line-height: 1.15;
          letter-spacing: -0.005em;
          color: var(--ink);
        }
        .bd-subtitle {
          margin: 0.5rem 0 0;
          color: var(--ink-mute);
          font-size: 0.9rem;
          font-family: 'IBM Plex Sans Devanagari', var(--font-sans);
          /* 0.7× size relative to the H1 — the spec calls for that ratio. */
        }
        .bd-desc {
          margin: 1.25rem 0 0;
          color: color-mix(in oklab, var(--ink) 92%, var(--paper));
          line-height: 1.7;
          max-width: 56ch;
        }

        .bd-section-h {
          margin: 2.5rem 0 1rem;
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--ink-mute);
          font-weight: 500;
          font-feature-settings: 'tnum' 1, 'zero' 1, 'ss20' 1, 'calt' 0;
        }

        /* ============= Leader-dotted chapter list ============= */
        .bd-chapters {
          list-style: none;
          padding: 0;
          margin: 0;
          border-top: 1px solid var(--rule);
        }
        .bd-chapter { margin: 0; }
        .bd-chapter a {
          display: flex;
          align-items: baseline;
          gap: 0.75rem;
          padding: 0.625rem 0.5rem 0.625rem 0.75rem;
          color: var(--ink);
          text-decoration: none;
          border-bottom: 1px solid var(--rule);
          border-left: 2px solid transparent;
        }
        .bd-chapter a:hover,
        .bd-chapter a:focus-visible {
          background: color-mix(in oklab, var(--brass) 8%, transparent);
          border-left-color: var(--cinnabar);
          outline: none;
        }
        .ch-num {
          flex: none;
          width: 28px;
          color: var(--ink-mute);
          font-family: var(--font-mono);
          font-size: 12px;
          letter-spacing: 0.05em;
          font-feature-settings: 'tnum' 1, 'zero' 1, 'ss20' 1, 'calt' 0;
        }
        .ch-name {
          font-family: var(--font-display);
          font-size: 1.0625rem;
          color: var(--ink);
          flex: none;
        }
        .leader {
          flex: 1 1 auto;
          align-self: center;
          height: 0;
          margin: 0 0.625rem;
          border-bottom: 1px dotted var(--brass);
          opacity: 0.4;
          transform: translateY(-2px);
          transition: opacity 120ms linear;
        }
        .bd-chapter a:hover .leader,
        .bd-chapter a:focus-visible .leader { opacity: 1; }
        .ch-pdf {
          flex: none;
          color: var(--cinnabar);
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-feature-settings: 'tnum' 1, 'zero' 1, 'ss20' 1, 'calt' 0;
        }

        /* ============= Spec sidebar ============= */
        .bd-spec {
          padding-block: 0.75rem;
          border-top: 1px solid var(--brass);
          border-bottom: 1px solid var(--brass);
          font-family: var(--font-mono);
          font-feature-settings: 'tnum' 1, 'zero' 1, 'ss20' 1, 'calt' 0;
        }
        .bd-spec dl { margin: 0; padding: 0; }
        .dl-row {
          display: grid;
          grid-template-columns: 5rem 1fr;
          gap: 0.75rem;
          padding-block: 0.375rem;
          font-size: 11px;
          letter-spacing: 0.08em;
          line-height: 1.4;
        }
        .dl-row dt {
          color: var(--ink-mute);
          margin: 0;
        }
        .dl-row dd {
          color: var(--ink);
          margin: 0;
        }

        @media print {
          .bd-crumbs, .bd-download { display: none; }
          .bd-cover { border: 1px solid #000; }
          .bd-main { color: black; }
          .bd-title { color: black; }
          .leader { border-bottom-color: #000; opacity: 0.5; }
          .ch-num, .ch-name, .ch-pdf { color: black; }
          .bd-spec { border-color: #000; color: black; }
          .dl-row dt, .dl-row dd { color: black; }
        }
      `}</style>
    </article>
  )
}

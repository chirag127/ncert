import type { BookMetadata } from '@ncert-library/types';
import { useEffect, useState } from 'react';

interface BookDetailProps {
  bookCode: string;
}

// NCERT publishes a pre-merged whole-book PDF at /textbook/pdf/<bookCode>.pdf.
// We link to it directly. We previously tried to fetch & merge chapter PDFs
// client-side via pdf-lib, but ncert.nic.in does not send CORS headers, so
// every fetch from the browser was blocked, the loop swallowed each failure
// and the merge "succeeded" with an empty document.
//
// Direct anchor links bypass CORS entirely (the browser navigates / saves the
// resource itself), so both the per-chapter and full-book buttons now just
// resolve to a URL on ncert.nic.in.
const NCERT_BASE = 'https://ncert.nic.in';

const buildMergedBookUrl = (bookCode: string, fallbackDownloadUrl?: string) =>
  fallbackDownloadUrl ?? `${NCERT_BASE}/textbook/pdf/${bookCode}.pdf`;

export default function BookDetail({ bookCode }: BookDetailProps) {
  const [book, setBook] = useState<BookMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBook() {
      try {
        const resp = await fetch('/data/metadata/books.json');
        const data: BookMetadata[] = await resp.json();
        const found = data.find((b) => b.bookCode === bookCode);
        setBook(found ?? null);
      } catch {
        setBook(null);
      } finally {
        setLoading(false);
      }
    }
    loadBook();
  }, [bookCode]);

  if (loading) {
    return (
      <div class="flex items-center justify-center py-32">
        <div class="animate-spin w-8 h-8 border-2 border-ncert-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!book) {
    return (
      <div class="text-center py-32">
        <div class="text-5xl mb-4">📖</div>
        <h1 class="text-2xl font-display font-bold text-gray-900 dark:text-gray-100 mb-2">
          Book Not Found
        </h1>
        <p class="text-gray-500 dark:text-gray-400 mb-8">
          The book "{bookCode}" could not be found.
        </p>
        <a
          href="/books"
          class="inline-flex items-center gap-2 px-5 py-2.5 text-sm bg-ncert-600 text-white rounded-lg font-medium hover:bg-ncert-700 transition-colors"
        >
          Browse All Books
        </a>
      </div>
    );
  }

  const classDisplay = book.class
    .replace('class-', 'Class ')
    .replace('balvatika-', 'Balvatika ');
  const subjectDisplay = book.subject
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const mergedBookUrl = buildMergedBookUrl(bookCode, book.downloadUrl);
  const safeTitle = book.title.replace(/[^a-z0-9]/gi, '_');

  return (
    <div class="animate-fade-in">
      <nav class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
        <a href="/" class="hover:text-ncert-600 transition-colors">
          Home
        </a>
        <span>/</span>
        <a href="/books" class="hover:text-ncert-600 transition-colors">
          Books
        </a>
        <span>/</span>
        <span class="text-gray-700 dark:text-gray-300 truncate">
          {book.title}
        </span>
      </nav>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2">
          <h1 class="text-3xl sm:text-4xl font-display font-bold text-ncert-900 dark:text-ncert-100 leading-tight">
            {book.title}
          </h1>
          {book.subtitle && (
            <p class="mt-2 text-lg text-gray-500 dark:text-gray-400">
              {book.subtitle}
            </p>
          )}
          {book.description && (
            <p class="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed">
              {book.description}
            </p>
          )}

          <div class="flex flex-wrap gap-2 mt-6">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-ncert-100 dark:bg-ncert-900/30 text-ncert-700 dark:text-ncert-300">
              {classDisplay}
            </span>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 capitalize">
              {subjectDisplay}
            </span>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 capitalize">
              {book.language}
            </span>
            {book.editionYear && (
              <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                {book.editionYear} Edition
              </span>
            )}
          </div>

          {/* Download Buttons */}
          <div class="flex flex-col sm:flex-row gap-3 mt-6">
            <a
              href={mergedBookUrl}
              download={`${bookCode}-${safeTitle}.pdf`}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="download-full-book"
              class="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm bg-ncert-600 text-white rounded-lg font-medium hover:bg-ncert-700 transition-colors"
            >
              <svg
                aria-hidden="true"
                class="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3M7 4h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z"
                />
              </svg>
              Download Full Book (PDF)
            </a>
          </div>
        </div>

        <div class="lg:col-span-1">
          <div class="p-5 rounded-xl border border-paper-200/50 bg-white/80 dark:bg-gray-900/80 dark:border-gray-800 shadow-sm">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Book Details
            </h3>
            <dl class="space-y-3 text-sm">
              {book.numberOfChapters && (
                <div class="flex justify-between">
                  <dt class="text-gray-500 dark:text-gray-400">Chapters</dt>
                  <dd class="font-medium text-gray-900 dark:text-gray-100">
                    {book.numberOfChapters}
                  </dd>
                </div>
              )}
              <div class="flex justify-between">
                <dt class="text-gray-500 dark:text-gray-400">Subject</dt>
                <dd class="font-medium text-gray-900 dark:text-gray-100 capitalize">
                  {subjectDisplay}
                </dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-500 dark:text-gray-400">Class</dt>
                <dd class="font-medium text-gray-900 dark:text-gray-100">
                  {classDisplay}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <div class="mt-12">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-display font-bold text-ncert-900 dark:text-ncert-100">
            Chapters
          </h2>
        </div>

        <div class="space-y-2">
          {book.chapters.map((chapter) => {
            const chapterFilename = `${bookCode}-${String(chapter.number).padStart(2, '0')}-${chapter.name
              .replace(/[<>:"/\\|?*]/g, '_')
              .replace(/\s+/g, '_')
              .toLowerCase()}.pdf`;
            return (
              <div
                key={chapter.number}
                class="flex items-center justify-between p-4 rounded-lg border border-paper-200/50 bg-white/80 dark:bg-gray-900/80 dark:border-gray-800 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div class="flex items-center gap-4 flex-1 min-w-0">
                  <span class="flex items-center justify-center w-8 h-8 rounded-full bg-ncert-100 dark:bg-ncert-900/30 text-ncert-700 dark:text-ncert-300 text-sm font-semibold shrink-0">
                    {chapter.number}
                  </span>
                  <span class="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {chapter.name}
                  </span>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                  <a
                    href={chapter.url}
                    download={chapterFilename}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid={`download-chapter-${chapter.number}`}
                    class="px-3 py-1.5 text-xs bg-ncert-600 text-white rounded font-medium hover:bg-ncert-700 transition-colors"
                  >
                    Download
                  </a>
                  <a
                    href={chapter.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-xs text-gray-500 hover:text-ncert-600 transition-colors"
                    title="Open on NCERT website"
                    aria-label={`Open chapter ${chapter.number} (${chapter.name}) on NCERT website`}
                  >
                    <span class="sr-only">Open on NCERT website</span>
                    <svg
                      aria-hidden="true"
                      class="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {book.tags.length > 0 && (
        <div class="mt-12 pt-8 border-t border-paper-200 dark:border-gray-800">
          <div class="flex flex-wrap gap-2">
            {book.tags.map((tag) => (
              <span
                key={tag}
                class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-paper-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

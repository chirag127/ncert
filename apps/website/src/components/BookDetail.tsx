import type { BookMetadata } from '@ncert-library/types';
import { useEffect, useState } from 'react';

interface BookDetailProps {
  bookCode: string;
}

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
              {book.pageCount && (
                <div class="flex justify-between">
                  <dt class="text-gray-500 dark:text-gray-400">Pages</dt>
                  <dd class="font-medium text-gray-900 dark:text-gray-100">
                    {book.pageCount}
                  </dd>
                </div>
              )}
              {book.fileSize && (
                <div class="flex justify-between">
                  <dt class="text-gray-500 dark:text-gray-400">Size</dt>
                  <dd class="font-medium text-gray-900 dark:text-gray-100">
                    {book.fileSize > 1048576
                      ? `${(book.fileSize / 1048576).toFixed(1)} MB`
                      : `${(book.fileSize / 1024).toFixed(0)} KB`}
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
        <h2 class="text-xl font-display font-bold text-ncert-900 dark:text-ncert-100 mb-6">
          Chapters
        </h2>
        <div class="space-y-2">
          {book.chapters.map((chapter, i) => (
            <a
              key={chapter.number}
              href={chapter.url}
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center justify-between p-4 rounded-lg border border-paper-200/50 bg-white/80 dark:bg-gray-900/80 dark:border-gray-800 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div class="flex items-center gap-4">
                <span class="flex items-center justify-center w-8 h-8 rounded-full bg-ncert-100 dark:bg-ncert-900/30 text-ncert-700 dark:text-ncert-300 text-sm font-semibold shrink-0">
                  {chapter.number}
                </span>
                <span class="font-medium text-gray-900 dark:text-gray-100 group-hover:text-ncert-600 dark:group-hover:text-ncert-400 transition-colors">
                  {chapter.name}
                </span>
              </div>
              <svg aria-hidden="true"
                class="w-5 h-5 text-gray-400 group-hover:text-ncert-500 transition-colors shrink-0"
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
          ))}
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

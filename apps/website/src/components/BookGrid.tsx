import type { BookMetadata } from '@ncert-library/types';
import { useEffect, useState } from 'react';

export default function BookGrid() {
  const [books, setBooks] = useState<BookMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    async function loadBooks() {
      try {
        const resp = await fetch('/data/metadata/books.json');
        const data = await resp.json();
        setBooks(data);
      } catch {
        console.warn('Could not load books');
      } finally {
        setLoading(false);
      }
    }
    loadBooks();
  }, []);

  const filtered =
    filter === 'all' ? books : books.filter((b) => b.class === filter);

  const classes = [...new Set(books.map((b) => b.class))].sort();

  if (loading) {
    return (
      <div class="flex items-center justify-center py-20">
        <div class="animate-spin w-8 h-8 border-2 border-ncert-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <section>
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-2xl font-display font-bold text-ncert-900 dark:text-ncert-100">
          Browse Textbooks
        </h2>

        <div class="flex gap-2 overflow-x-auto pb-2">
          <button type="button"
            onClick={() => setFilter('all')}
            class={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === 'all'
                ? 'bg-ncert-600 text-white'
                : 'bg-paper-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-paper-200 dark:hover:bg-gray-700'
            }`}
          >
            All Classes
          </button>
          {classes.map((cls) => (
            <button type="button"
              key={cls}
              onClick={() => setFilter(cls)}
              class={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === cls
                  ? 'bg-ncert-600 text-white'
                  : 'bg-paper-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-paper-200 dark:hover:bg-gray-700'
              }`}
            >
              {cls.replace('class-', 'Class ')}
            </button>
          ))}
        </div>
      </div>

      {books.length === 0 && (
        <div class="text-center py-16">
          <div class="text-4xl mb-4">📚</div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Loading Books...
          </h3>
          <p class="text-gray-500 dark:text-gray-400">
            Books will appear after the first GitHub Actions scrape run.
          </p>
        </div>
      )}

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((book) => (
          <a
            key={book.bookCode}
            href={`/book/${book.bookCode}`}
            class="group p-5 flex flex-col rounded-xl border border-paper-200/50 bg-white/80 dark:bg-gray-900/80 dark:border-gray-800 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
          >
            <div class="flex-1">
              <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-ncert-100 dark:bg-ncert-900/30 text-ncert-700 dark:text-ncert-300 mb-2">
                {book.class.replace('class-', 'Class ')}
              </span>
              <h3 class="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-ncert-600 dark:group-hover:text-ncert-400 transition-colors mt-2">
                {book.title}
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 capitalize">
                {book.subject.replace(/-/g, ' ')}
              </p>
            </div>
            <div class="mt-4 pt-4 border-t border-paper-200 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400">
              <span>{book.numberOfChapters} chapters</span>
              <span class="capitalize">{book.language}</span>
            </div>
          </a>
        ))}
      </div>

      {filtered.length === 0 && books.length > 0 && (
        <div class="text-center py-12 text-gray-500">
          No books found for this filter.
        </div>
      )}
    </section>
  );
}

import type { BookMetadata } from '@ncert-library/types';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BookMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [allBooks, setAllBooks] = useState<BookMetadata[]>([]);
  const [filters, setFilters] = useState({
    class: '',
    subject: '',
    language: '',
  });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const resp = await fetch('/data/metadata/books.json');
        const data = await resp.json();
        setAllBooks(data);
        setResults(data);
      } catch {
        console.warn('Could not load books index');
      }
    }
    load();
    inputRef.current?.focus();
  }, []);

  const performSearch = useCallback(
    (q: string) => {
      setLoading(true);
      const terms = q.toLowerCase().split(/\s+/).filter(Boolean);

      let filtered = allBooks;

      if (q.trim()) {
        filtered = filtered.filter((book) => {
          const searchable = [
            book.title,
            book.subject,
            book.class,
            book.bookCode,
            book.language,
            ...book.keywords,
            ...book.chapterNames,
            book.description,
          ]
            .join(' ')
            .toLowerCase();
          return terms.every((t) => searchable.includes(t));
        });

        filtered.sort((a, b) => {
          const scoreA = terms.filter((t) =>
            a.title.toLowerCase().includes(t),
          ).length;
          const scoreB = terms.filter((t) =>
            b.title.toLowerCase().includes(t),
          ).length;
          return scoreB - scoreA;
        });
      }

      if (filters.class) {
        filtered = filtered.filter((b) => b.class === filters.class);
      }
      if (filters.subject) {
        filtered = filtered.filter((b) => b.subject === filters.subject);
      }
      if (filters.language) {
        filtered = filtered.filter((b) => b.language === filters.language);
      }

      setResults(filtered);
      setLoading(false);
    },
    [allBooks, filters],
  );

  useEffect(() => {
    const timer = setTimeout(() => performSearch(query), 200);
    return () => clearTimeout(timer);
  }, [query, performSearch]);

  const subjects = [...new Set(allBooks.map((b) => b.subject))].sort();
  const classes = [...new Set(allBooks.map((b) => b.class))].sort();

  return (
    <div>
      <div class="mb-8">
        <h1 class="text-3xl font-display font-bold text-ncert-900 dark:text-ncert-100 mb-2">
          Search Textbooks
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          {results.length} books available
        </p>
      </div>

      <div class="space-y-4 mb-8">
        <div class="relative">
          <svg aria-hidden="true"
            class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, subject, class, or keywords..."
            class="w-full px-4 py-3 pl-12 text-lg rounded-lg border border-paper-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ncert-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        <div class="flex flex-wrap gap-3">
          <select
            value={filters.class}
            onChange={(e) =>
              setFilters((f) => ({ ...f, class: e.target.value }))
            }
            class="px-4 py-2.5 rounded-lg border border-paper-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-ncert-500 w-auto min-w-[140px]"
          >
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c} value={c}>
                {c.replace('class-', 'Class ')}
              </option>
            ))}
          </select>

          <select
            value={filters.subject}
            onChange={(e) =>
              setFilters((f) => ({ ...f, subject: e.target.value }))
            }
            class="px-4 py-2.5 rounded-lg border border-paper-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-ncert-500 w-auto min-w-[140px]"
          >
            <option value="">All Subjects</option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>

          <select
            value={filters.language}
            onChange={(e) =>
              setFilters((f) => ({ ...f, language: e.target.value }))
            }
            class="px-4 py-2.5 rounded-lg border border-paper-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-ncert-500 w-auto min-w-[120px]"
          >
            <option value="">All Languages</option>
            <option value="english">English</option>
            <option value="hindi">Hindi</option>
          </select>
        </div>
      </div>

      {loading && (
        <div class="flex items-center justify-center py-12">
          <div class="animate-spin w-6 h-6 border-2 border-ncert-600 border-t-transparent rounded-full" />
        </div>
      )}

      {!loading && results.length === 0 && allBooks.length > 0 && (
        <div class="text-center py-16">
          <div class="text-4xl mb-4">🔍</div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No results found
          </h3>
          <p class="text-gray-500 dark:text-gray-400">
            Try adjusting your search or filters.
          </p>
        </div>
      )}

      {allBooks.length === 0 && (
        <div class="text-center py-16">
          <div class="text-4xl mb-4">📚</div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No books loaded yet
          </h3>
          <p class="text-gray-500 dark:text-gray-400">
            Books will appear after the first CI run scrapes NCERT data.
          </p>
        </div>
      )}

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((book) => (
          <a
            key={book.bookCode}
            href={`/book/${book.bookCode}`}
            class="p-4 flex flex-col rounded-xl border border-paper-200/50 bg-white/80 dark:bg-gray-900/80 dark:border-gray-800 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
          >
            <div class="flex items-start justify-between mb-2">
              <span class="px-2 py-0.5 rounded text-xs font-medium bg-ncert-100 dark:bg-ncert-900/30 text-ncert-700 dark:text-ncert-300">
                {book.class.replace('class-', 'Class ')}
              </span>
              <span class="text-xs text-gray-400 capitalize">
                {book.language}
              </span>
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-ncert-600 transition-colors">
              {book.title}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 capitalize">
              {book.subject.replace(/-/g, ' ')}
            </p>
            <div class="mt-2 text-xs text-gray-400">
              {book.numberOfChapters} chapters
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

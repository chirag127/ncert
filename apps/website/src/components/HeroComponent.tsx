import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

const STATS = [
  { label: 'Textbooks', value: '200+' },
  { label: 'Classes', value: 'I-XII' },
  { label: 'Subjects', value: '25+' },
  { label: 'Free Access', value: '100%' },
];

export default function HeroComponent() {
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('hero-search')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <section class="relative overflow-hidden bg-gradient-to-br from-ncert-50 via-white to-paper-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-ncert-200/20 via-transparent to-transparent dark:from-ncert-800/10" />

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          class="text-center max-w-3xl mx-auto"
        >
          <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-ncert-100 text-ncert-700 dark:bg-ncert-900/30 dark:text-ncert-300 mb-6">
            Free &amp; Open Source
          </span>

          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-ncert-900 dark:text-ncert-100 leading-tight">
            All NCERT Textbooks in
            <span class="text-ncert-600 dark:text-ncert-400"> One Place</span>
          </h1>

          <p class="mt-4 text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            A beautiful, fast, and modern digital library. Browse, search, and
            download NCERT textbooks for free.
          </p>

          <div class="mt-8 max-w-xl mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
                }
              }}
            >
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
                  id="hero-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search textbooks, subjects, classes..."
                  class="w-full pl-12 pr-4 py-4 rounded-xl border border-paper-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ncert-500 focus:border-transparent text-lg shadow-lg shadow-ncert-500/5"
                />
                <kbd class="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-mono bg-paper-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-paper-200 dark:border-gray-700">
                  <span>⌘</span>K
                </kbd>
              </div>
            </form>
          </div>

          <div class="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                class="text-center"
              >
                <div class="text-2xl sm:text-3xl font-display font-bold text-ncert-600 dark:text-ncert-400">
                  {stat.value}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

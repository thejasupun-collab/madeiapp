import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export default function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gray-200 dark:border-gray-800 shadow-sm transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2" aria-label="MadeiApp home">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            M
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-950 dark:text-white">
            MadeiApp
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm">
          <Link
            href="/"
            className="hidden sm:inline font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          >
            Home
          </Link>
          <Link
            href="/#faq"
            className="hidden md:inline font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          >
            FAQ
          </Link>
          <Link
            href="/contact"
            className="font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          >
            Contact
          </Link>
          <ThemeToggle />
          <Link
            href="/login"
            className="font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          >
            Login
          </Link>
          <Link
            href="/dashboard"
            className="px-3.5 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition"
          >
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}

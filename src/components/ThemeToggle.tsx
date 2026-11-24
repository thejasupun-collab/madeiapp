'use client';

import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
}

/**
 * Toggles Tailwind's `dark` class on <html> and persists the choice in localStorage.
 * The class is applied before hydration by the inline script in app/layout.tsx.
 *
 * The icons are switched with Tailwind's `dark:` variant (no React state needed),
 * which keeps the button hydration-safe and always in sync with the document class.
 */
export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const toggleTheme = () => {
    const root = document.documentElement;
    const nextIsDark = !root.classList.contains('dark');

    root.classList.toggle('dark', nextIsDark);
    root.style.colorScheme = nextIsDark ? 'dark' : 'light';

    try {
      localStorage.setItem('theme', nextIsDark ? 'dark' : 'light');
    } catch {
      // localStorage can be unavailable in private browsing; the toggle still works for the session.
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
      className={`relative p-2 rounded-xl text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${className}`}
    >
      <Moon className="h-5 w-5 dark:hidden" />
      <Sun className="hidden h-5 w-5 dark:block" />
    </button>
  );
}

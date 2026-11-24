import Link from 'next/link';
import { Mail, MapPin, ShieldCheck } from 'lucide-react';

const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms & Conditions', href: '/terms' },
  { label: 'Refund Policy', href: '/refund' },
  { label: 'Contact Us', href: '/contact' },
];

export default function PublicFooter() {
  return (
    <footer className="w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 transition-colors">
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="space-y-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
              M
            </div>
            <span className="text-lg font-bold text-gray-950 dark:text-white">MadeiApp</span>
          </Link>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Digital faculty notes and study materials for Sri Lankan university students. Secure
            payments, verified access and progress tracking in one place.
          </p>
          <div className="flex flex-col gap-1.5 text-sm text-gray-500 dark:text-gray-400">
            <span className="inline-flex items-center gap-2">
              <Mail className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <a href="mailto:support@madeiapp.com" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                support@madeiapp.com
              </a>
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              Colombo, Sri Lanka
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-3">
            Platform
          </h3>
          <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
            <li>
              <Link href="/dashboard" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                Student Dashboard
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                Sign In
              </Link>
            </li>
            <li>
              <Link href="/register" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                Create Account
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                Help &amp; Support
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-3">
            Legal
          </h3>
          <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            Secured by PayHere &amp; Paddle
          </p>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800 py-5 px-6 text-center text-xs text-gray-500 dark:text-gray-400">
        &copy; 2026 MadeiApp. All rights reserved. Made for students in Sri Lanka.
      </div>
    </footer>
  );
}

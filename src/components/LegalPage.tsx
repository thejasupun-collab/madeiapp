import Link from 'next/link';
import { ArrowLeft, Mail, MessageSquareText } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';

export default function LegalPage({
  title,
  subtitle,
  updated = '24 November 2026',
  children,
}: {
  title: string;
  subtitle: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-950 dark:text-white tracking-tight">
          {title}
        </h1>
        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
          {subtitle}
        </p>
        <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mt-3">
          Last updated: {updated}
        </p>

        <article className="mt-8 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 md:p-10 space-y-8">
          {children}
        </article>

        <div className="mt-6 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
              <MessageSquareText className="h-4 w-4" />
              Questions about this policy?
            </h2>
            <p className="text-sm text-indigo-700/80 dark:text-indigo-300/80 mt-1">
              Our support team is happy to clarify anything before you pay.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition"
            >
              Contact Us
            </Link>
            <a
              href="mailto:support@madeiapp.com"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-gray-900 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-sm font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition"
            >
              <Mail className="h-4 w-4" />
              Email
            </a>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{title}</h2>
      <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  );
}

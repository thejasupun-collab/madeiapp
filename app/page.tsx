import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BookmarkCheck,
  BookOpenCheck,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import ApprovedReviews from '@/components/landing/ApprovedReviews';
import FaqAccordion from '@/components/landing/FaqAccordion';

export const metadata: Metadata = {
  title: 'Faculty Notes for Sri Lankan Students',
  description:
    'Access curated faculty notes, track study progress, bookmark materials and pay securely in LKR with PayHere or bank slip verification.',
};

const FEATURES = [
  {
    icon: BookOpenCheck,
    title: 'Faculty-curated notes',
    description:
      'Organised lecture notes, summaries and revision material for your modules, all in one secure study library.',
    accent: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  },
  {
    icon: CreditCard,
    title: 'Secure LKR payments',
    description:
      'Pay instantly with PayHere using local cards, FriMi or wallets, or upload a bank slip for manual verification.',
    accent: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
  {
    icon: BookmarkCheck,
    title: 'Progress & bookmarks',
    description:
      'Mark files as completed, bookmark what matters and watch your study progress grow from your dashboard.',
    accent: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
  {
    icon: ShieldCheck,
    title: 'Verified access',
    description:
      'Paid content is protected with secure download links. Promo codes and payment status are verified before unlocking.',
    accent: 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400',
  },
];

export default function Home() {
  return (
    <PublicLayout>
      <section className="relative overflow-hidden">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-indigo-300/30 dark:bg-indigo-600/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-violet-300/30 dark:bg-violet-600/10 blur-3xl" />

        <div className="relative max-w-4xl mx-auto text-center px-6 py-16 md:py-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-semibold mb-6 tracking-wide uppercase border border-indigo-100 dark:border-indigo-500/20">
            <Sparkles className="h-3.5 w-3.5" />
            Built for Sri Lankan students
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6">
            Study smarter with{' '}
            <span className="text-indigo-600 dark:text-indigo-400">MadeiApp</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-9 max-w-2xl mx-auto leading-relaxed">
            Faculty notes, revision summaries and past-paper style material — organised, secure and
            accessible from any device. Pay in LKR with PayHere or a verified bank slip.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Link
              href="/register"
              className="px-8 py-3.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-indigo-950/50 transition duration-200 flex items-center justify-center gap-2"
            >
              Create Free Account <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="px-8 py-3.5 rounded-xl font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm transition duration-200 flex items-center justify-center gap-2"
            >
              Sign In
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-gray-500 dark:text-gray-400">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              PayHere &amp; bank slip payments
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Verified student access
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Works on mobile
            </span>
          </div>
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm transition-colors"
              >
                <span className={`inline-flex p-2.5 rounded-xl ${feature.accent}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 mt-3 mb-1.5">
                  {feature.title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>
      <ApprovedReviews />

      <FaqAccordion />

      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-700 p-8 md:p-12 text-center text-white shadow-xl">
          <TrendingUp className="h-8 w-8 mx-auto mb-4 text-indigo-100" />
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3">
            Ready to organise your semester?
          </h2>
          <p className="text-indigo-100 text-sm md:text-base max-w-2xl mx-auto mb-6">
            Create a free account to browse available files, then unlock premium notes whenever
            you are ready. Your study progress stays saved across devices.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="px-6 py-3 rounded-xl bg-white text-indigo-700 font-semibold hover:bg-indigo-50 transition"
            >
              Get Started Free
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 rounded-xl bg-white/10 border border-white/30 text-white font-semibold hover:bg-white/20 transition"
            >
              Talk to Support
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}



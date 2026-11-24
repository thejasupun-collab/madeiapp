import type { Metadata } from 'next';
import Link from 'next/link';
import { Clock, Mail, MapPin, MessageCircle, ShieldCheck } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import ContactForm from '@/components/ContactForm';

export const metadata: Metadata = {
  title: 'Contact & Support',
  description:
    'Contact the MadeiApp student support team for help with payments, notes access, refunds or account questions.',
};

export default function ContactPage() {
  return (
    <PublicLayout>
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-semibold border border-indigo-100 dark:border-indigo-500/20 mb-3">
            <MessageCircle className="h-3.5 w-3.5" />
            Student Support
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-950 dark:text-white tracking-tight">
            We&apos;re here to help
          </h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-3 leading-relaxed">
            Questions about a payment, promo code, notes access or refund? Send us a message and our
            team will get back to you within one business day.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 md:p-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-5">
              Send us a message
            </h2>
            <ContactForm />
          </div>

          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-4">
                Contact details
              </h2>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <span className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">Email</p>
                    <a
                      href="mailto:support@madeiapp.com"
                      className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      support@madeiapp.com
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">Location</p>
                    <p className="text-gray-500 dark:text-gray-400">Colombo, Sri Lanka</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Clock className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">Support hours</p>
                    <p className="text-gray-500 dark:text-gray-400">
                      Monday to Saturday, 9.00 am &ndash; 6.00 pm (Sri Lanka time)
                    </p>
                  </div>
                </li>
              </ul>

              <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-800 flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
                <MessageCircle className="h-4 w-4 text-[#25D366] flex-shrink-0 mt-0.5" />
                <span>
                  Prefer WhatsApp? Use the floating support button at the bottom-right when it is
                  available.
                </span>
              </div>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 p-6">
              <h2 className="text-sm font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-2 mb-2">
                <ShieldCheck className="h-4 w-4" />
                Payment or refund issue?
              </h2>
              <p className="text-xs text-indigo-700/80 dark:text-indigo-300/80 leading-relaxed">
                Include your payment date, amount and transaction reference so we can investigate
                faster. Read our{' '}
                <Link href="/refund" className="underline font-semibold">
                  Refund Policy
                </Link>{' '}
                for eligibility and timelines.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

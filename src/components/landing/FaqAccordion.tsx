'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    question: 'What is MadeiApp and who is it for?',
    answer:
      'MadeiApp is a digital study-notes platform for Sri Lankan university and higher-education students. It gives you organised lecture notes, summaries and past-paper style materials prepared by faculty, with progress tracking and bookmarks to keep your revision on schedule.',
  },
  {
    question: 'How do I unlock premium faculty notes?',
    answer:
      'Create a free account, open the Payments page, and choose PayHere for instant card or wallet payment, or upload a bank deposit slip for manual verification. Once approved, premium files unlock automatically in your dashboard.',
  },
  {
    question: 'What currency are the payments in?',
    answer:
      'Prices are shown in Sri Lankan Rupees (LKR). PayHere processes local cards, FriMi and mobile wallets in LKR. International students can use the Paddle option where offered, which handles their local currency and card provider.',
  },
  {
    question: 'Can I use a promo code?',
    answer:
      'Yes. On the Payments page, enter your promo code under “Have a Promo Code?” before paying. The discounted amount is applied to the PayHere checkout and to the bank slip instructions so you transfer the correct amount.',
  },
  {
    question: 'Do you offer refunds?',
    answer:
      'Because our products are digital study materials, refunds are limited and reviewed case by case. Duplicate payments, failed access after payment, and unauthorised transactions are eligible. Please read our Refund Policy for the full process and timelines.',
  },
  {
    question: 'Can I access my notes on more than one device?',
    answer:
      'Yes, your account can be used across devices. To protect paid content, only the two most recent devices are tracked per account. If you change devices, simply sign in again to register the new one.',
  },
  {
    question: 'How do I contact support?',
    answer:
      'Use the Contact page to send a message directly to our team, or tap the floating WhatsApp button when it is available. We aim to respond within one business day (Monday to Saturday, Sri Lanka time).',
  },
];

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="max-w-4xl mx-auto px-6 py-16 scroll-mt-24">
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-semibold border border-indigo-100 dark:border-indigo-500/20 mb-3">
          <HelpCircle className="h-3.5 w-3.5" />
          Frequently Asked Questions
        </span>
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Everything you need to know
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Still unsure? Send us a message and our team will help you out.
        </p>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={faq.question}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${index}`}
                id={`faq-button-${index}`}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
              >
                <span className="font-semibold text-sm md:text-base text-gray-900 dark:text-gray-100">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`h-5 w-5 flex-shrink-0 text-indigo-600 dark:text-indigo-400 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div
                  id={`faq-panel-${index}`}
                  role="region"
                  aria-labelledby={`faq-button-${index}`}
                  className="px-5 pb-5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed"
                >
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

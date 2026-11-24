'use client';

import { useEffect, useMemo, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Quote, Star } from 'lucide-react';
import { db } from '@/lib/firebase';
import type { AdminReview } from '@/components/admin/types';

function StarRow({ rating, size = 'h-4 w-4' }: { rating: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          className={`${size} ${
            value <= rating
              ? 'text-amber-400 fill-amber-400'
              : 'text-gray-300 dark:text-gray-600'
          }`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export default function ApprovedReviews() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getDocs(query(collection(db, 'reviews'), where('approved', '==', true)))
      .then((snapshot) => {
        if (cancelled) return;
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as AdminReview[];
        list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        setReviews(list.slice(0, 6));
      })
      .catch((err) => console.error('Failed to load approved reviews:', err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const average = useMemo(() => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0);
    return Math.round((total / reviews.length) * 10) / 10;
  }, [reviews]);

  if (loading) {
    return (
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="h-40 rounded-2xl bg-gray-200/60 dark:bg-gray-800/60 animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  if (reviews.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-6 pb-16">
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-semibold border border-amber-100 dark:border-amber-500/20 mb-3">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          Student Reviews
        </span>
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Trusted by students across Sri Lanka
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {average > 0 ? `${average} / 5 average rating` : 'Real feedback'} from verified paid
          students.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {reviews.map((review) => (
          <figure
            key={review.id}
            className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 flex flex-col gap-3 transition-colors"
          >
            <Quote className="h-6 w-6 text-indigo-200 dark:text-indigo-500/40" />
            <StarRow rating={Number(review.rating) || 0} />
            <blockquote className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed flex-1">
              {review.comment}
            </blockquote>
            <figcaption className="flex items-center gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-sm font-bold">
                {(review.userName || 'S').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {review.userName || 'Verified student'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Verified student'}
                </p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

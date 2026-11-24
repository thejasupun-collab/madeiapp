'use client';

import { useEffect, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { CheckCircle2, Loader2, MessageSquareQuote, Star, Trash2, Clock } from 'lucide-react';
import { db } from '@/lib/firebase';
import type { AdminReview } from './types';

export default function ReviewsTab() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'reviews'),
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as AdminReview[];
        list.sort((a, b) => {
          if (a.approved !== b.approved) return a.approved ? 1 : -1;
          return (b.createdAt || '').localeCompare(a.createdAt || '');
        });
        setReviews(list);
        setLoading(false);
      },
      (err) => {
        console.error('Failed to load reviews:', err);
        setFeedback('Could not load reviews. Check Firestore permissions.');
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, []);

  const pendingCount = reviews.filter((review) => !review.approved).length;

  const handleApprove = async (review: AdminReview) => {
    setPendingId(review.id);
    setFeedback('');
    try {
      await updateDoc(doc(db, 'reviews', review.id), { approved: true });
      setFeedback(`Review by ${review.userName || 'student'} approved and published.`);
    } catch (err) {
      console.error('Failed to approve review:', err);
      setFeedback('Could not approve this review.');
    } finally {
      setPendingId(null);
    }
  };

  const handleDelete = async (review: AdminReview) => {
    if (!window.confirm(`Delete the review by ${review.userName || 'this student'}?`)) return;
    setPendingId(review.id);
    setFeedback('');
    try {
      await deleteDoc(doc(db, 'reviews', review.id));
      setFeedback('Review deleted.');
    } catch (err) {
      console.error('Failed to delete review:', err);
      setFeedback('Could not delete this review.');
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <MessageSquareQuote className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Review Moderation
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Approve genuine student feedback to show it on the landing page.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold">
            <Clock className="h-3.5 w-3.5" /> {pendingCount} pending
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5" /> {reviews.length - pendingCount} published
          </span>
        </div>
      </div>

      {feedback && (
        <div className="px-4 py-3 rounded-xl text-sm border bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300">
          {feedback}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600 dark:text-indigo-400" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-10 text-center">
          <MessageSquareQuote className="h-10 w-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No student reviews yet.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {reviews.map((review) => {
            const isPending = pendingId === review.id;
            return (
              <li
                key={review.id}
                className={`bg-white dark:bg-gray-900 rounded-2xl border p-5 shadow-sm ${
                  review.approved
                    ? 'border-gray-200 dark:border-gray-800'
                    : 'border-amber-200 dark:border-amber-500/30'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {review.userName || 'Student'}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${
                          review.approved
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
                            : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30'
                        }`}
                      >
                        {review.approved ? 'Published' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5 mb-2" aria-label={`${review.rating} out of 5 stars`}>
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Star
                          key={value}
                          className={`h-4 w-4 ${
                            value <= review.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {review.comment}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      {review.createdAt ? new Date(review.createdAt).toLocaleString() : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!review.approved && (
                      <button
                        type="button"
                        onClick={() => void handleApprove(review)}
                        disabled={isPending}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition disabled:opacity-50"
                      >
                        {isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        )}
                        Approve
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => void handleDelete(review)}
                      disabled={isPending}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-xs font-semibold transition disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

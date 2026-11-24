'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { addDoc, collection, onSnapshot, query, where } from 'firebase/firestore';
import {
  AlertCircle,
  BadgeCheck,
  CheckCircle2,
  Loader2,
  Lock,
  MessageSquareQuote,
  Send,
  Star,
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import type { AdminReview } from '@/components/admin/types';

const RATING_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very good',
  5: 'Excellent',
};

export default function ReviewsPage() {
  const { userProfile, firebaseUser } = useAuth();
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);

  const isPaid = Boolean(userProfile?.isPaid || userProfile?.role === 'admin');

  useEffect(() => {
    if (!firebaseUser) return;
    const unsubscribe = onSnapshot(
      query(collection(db, 'reviews'), where('userId', '==', firebaseUser.uid)),
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as AdminReview[];
        list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        setReviews(list);
        setLoading(false);
      },
      (err) => {
        console.error('Failed to load your reviews:', err);
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, [firebaseUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;
    setStatus(null);

    if (comment.trim().length < 10) {
      setStatus({
        type: 'error',
        text: 'Please write at least 10 characters so your review is helpful to other students.',
      });
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        userId: firebaseUser.uid,
        userName: userProfile?.name || firebaseUser.email || 'Student',
        rating,
        comment: comment.trim(),
        approved: false,
        createdAt: new Date().toISOString(),
      });
      setStatus({
        type: 'success',
        text: 'Thank you! Your review was submitted and will appear on the landing page after approval.',
      });
      setComment('');
      setRating(5);
      setHoveredRating(0);
    } catch (err) {
      console.error('Failed to submit review:', err);
      setStatus({
        type: 'error',
        text: 'We could not submit your review. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isPaid) {
    return (
      <div className="max-w-lg mx-auto bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-10 text-center space-y-4">
        <div className="mx-auto h-16 w-16 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <Lock className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Reviews are for paid students
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Only students with active paid access can submit reviews. Unlock premium notes to share
          your experience and help other students choose the right study materials.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-1">
          <Link
            href="/dashboard/payments"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition"
          >
            <BadgeCheck className="h-4 w-4" />
            Unlock Access
          </Link>
          <Link
            href="/dashboard/files"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold transition"
          >
            Browse Files
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-950 dark:text-white tracking-tight flex items-center gap-2">
            <MessageSquareQuote className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            My Reviews
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Share your experience with MadeiApp notes. Approved reviews appear on the landing page.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 self-start sm:self-auto px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-500/30">
          <BadgeCheck className="h-3.5 w-3.5" />
          Paid student
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
            Write a review
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Rate the notes and tell other students what helped you most.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Your rating
              </span>
              <div
                className="flex items-center gap-1"
                onMouseLeave={() => setHoveredRating(0)}
                role="radiogroup"
                aria-label="Star rating"
              >
                {[1, 2, 3, 4, 5].map((value) => {
                  const isActive = (hoveredRating || rating) >= value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      onMouseEnter={() => setHoveredRating(value)}
                      aria-label={`${value} star${value > 1 ? 's' : ''}`}
                      aria-pressed={rating === value}
                      className="p-1 rounded-lg transition hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          isActive
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    </button>
                  );
                })}
                <span className="ml-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {RATING_LABELS[hoveredRating || rating]}
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="review-comment"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Your review
              </label>
              <textarea
                id="review-comment"
                required
                rows={5}
                maxLength={600}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you like about the notes? Was the content clear and helpful for your revision?"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none resize-y"
              />
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 text-right">
                {comment.length}/600
              </p>
            </div>

            {status && (
              <div
                role="status"
                className={`flex items-start gap-2 px-4 py-3 rounded-xl text-sm border ${
                  status.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                    : 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400'
                }`}
              >
                {status.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                )}
                <span>{status.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Reviews are moderated before appearing publicly. Please keep feedback respectful and
              relevant to the study materials.
            </p>
          </form>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Your submissions</h2>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              {reviews.length} review{reviews.length === 1 ? '' : 's'}
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600 dark:text-indigo-400" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-10">
              <MessageSquareQuote className="h-10 w-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You have not submitted a review yet.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {reviews.map((review) => (
                <li
                  key={review.id}
                  className="rounded-xl border border-gray-200 dark:border-gray-800 p-4"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-0.5" aria-label={`${review.rating} out of 5 stars`}>
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
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                        review.approved
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
                          : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30'
                      }`}
                    >
                      {review.approved ? 'Published' : 'Pending review'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {review.comment}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

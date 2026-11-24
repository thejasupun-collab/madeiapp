'use client';

import { useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore';
import {
  TicketPercent,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Power,
} from 'lucide-react';
import { db } from '@/lib/firebase';
import type { AdminCoupon } from './types';

interface CouponFormMessage {
  type: 'success' | 'error';
  text: string;
}

function isCouponExpired(coupon: AdminCoupon) {
  if (!coupon.expiresAt) return false;
  const expiry = new Date(coupon.expiresAt).getTime();
  return Number.isFinite(expiry) && expiry < Date.now();
}

export default function CouponsTab() {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [saving, setSaving] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState<CouponFormMessage | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'coupons'),
      (snapshot) => {
        const records = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as AdminCoupon[];
        records.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        setCoupons(records);
        setLoadError('');
        setLoading(false);
      },
      (err) => {
        console.error('Failed to load coupons:', err);
        setLoadError('Could not load coupons. Check your Firestore permissions.');
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, []);

  const activeCount = coupons.filter((c) => c.isActive && !isCouponExpired(c)).length;
  const expiredCount = coupons.filter(isCouponExpired).length;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const normalizedCode = code.trim().toUpperCase().replace(/\s+/g, '');
    if (!/^[A-Z0-9_-]{3,24}$/.test(normalizedCode)) {
      setMessage({
        type: 'error',
        text: 'Code must be 3-24 characters using letters, numbers, hyphens or underscores.',
      });
      return;
    }

    const pct = Number(discountPercent);
    if (!Number.isFinite(pct) || pct < 1 || pct > 100) {
      setMessage({ type: 'error', text: 'Discount must be a number between 1 and 100.' });
      return;
    }

    if (coupons.some((c) => String(c.code || '').toUpperCase() === normalizedCode)) {
      setMessage({ type: 'error', text: `Coupon "${normalizedCode}" already exists.` });
      return;
    }

    setSaving(true);
    try {
      await addDoc(collection(db, 'coupons'), {
        code: normalizedCode,
        discountPercent: Math.round(pct * 100) / 100,
        isActive: true,
        expiresAt: expiresAt ? new Date(`${expiresAt}T23:59:59`).toISOString() : '',
        createdAt: new Date().toISOString(),
      });
      setMessage({
        type: 'success',
        text: `Coupon "${normalizedCode}" created with ${pct}% off.`,
      });
      setCode('');
      setDiscountPercent('');
      setExpiresAt('');
    } catch (err) {
      console.error('Failed to create coupon:', err);
      setMessage({ type: 'error', text: 'Could not create the coupon. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (coupon: AdminCoupon) => {
    setPendingId(coupon.id);
    setMessage(null);
    try {
      await updateDoc(doc(db, 'coupons', coupon.id), { isActive: !coupon.isActive });
      setMessage({
        type: 'success',
        text: `Coupon "${coupon.code}" ${coupon.isActive ? 'deactivated' : 'activated'}.`,
      });
    } catch (err) {
      console.error('Failed to update coupon:', err);
      setMessage({ type: 'error', text: 'Could not update the coupon.' });
    } finally {
      setPendingId(null);
    }
  };

  const handleDelete = async (coupon: AdminCoupon) => {
    if (!window.confirm(`Delete coupon "${coupon.code}"? This cannot be undone.`)) return;
    setPendingId(coupon.id);
    setMessage(null);
    try {
      await deleteDoc(doc(db, 'coupons', coupon.id));
      setMessage({ type: 'success', text: `Coupon "${coupon.code}" deleted.` });
    } catch (err) {
      console.error('Failed to delete coupon:', err);
      setMessage({ type: 'error', text: 'Could not delete the coupon.' });
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <TicketPercent className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Create Promo Code
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Students can redeem these codes on the payments page for a discounted PayHere or bank slip amount.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" /> {activeCount} active
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium">
              <CalendarDays className="h-3.5 w-3.5" /> {expiredCount} expired
            </span>
          </div>
        </div>

        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="coupon-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Promo Code
            </label>
            <input
              id="coupon-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. SAVE20"
              maxLength={24}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-mono uppercase tracking-wide text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label htmlFor="coupon-discount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Discount (%)
            </label>
            <input
              id="coupon-discount"
              type="number"
              min={1}
              max={100}
              step={0.5}
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              placeholder="20"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label htmlFor="coupon-expiry" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Expires On <span className="text-gray-400 dark:text-gray-500 font-normal">(optional)</span>
            </label>
            <input
              id="coupon-expiry"
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={saving}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {saving ? 'Creating...' : 'Create Coupon'}
            </button>
          </div>
        </form>

        {message && (
          <div
            className={`mt-4 flex items-center gap-2 px-4 py-3 rounded-xl text-sm border ${
              message.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                : 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400'
            }`}
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{message.text}</span>
          </div>
        )}

        {loadError && (
          <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-xl text-sm border bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{loadError}</span>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between gap-3 p-6 pb-4">
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Existing Coupons</h3>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
            {coupons.length} total
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600 dark:text-indigo-400" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-12 px-6 text-sm text-gray-500 dark:text-gray-400">
            No promo codes yet. Create your first coupon above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-y border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-6">Code</th>
                  <th className="py-3 px-4">Discount</th>
                  <th className="py-3 px-4">Expires</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                {coupons.map((coupon) => {
                  const expired = isCouponExpired(coupon);
                  const isLive = coupon.isActive && !expired;
                  const isPending = pendingId === coupon.id;

                  return (
                    <tr key={coupon.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition">
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-2 font-mono font-bold text-gray-900 dark:text-gray-100 tracking-wide">
                          <TicketPercent className="h-4 w-4 text-indigo-500" />
                          {coupon.code}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400">
                          {coupon.discountPercent}% OFF
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {coupon.expiresAt ? (
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {new Date(coupon.expiresAt).toLocaleDateString()}
                          </span>
                        ) : (
                          'Never'
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            expired
                              ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                              : coupon.isActive
                                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
                                : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30'
                          }`}
                        >
                          {expired ? 'Expired' : coupon.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => void handleToggleActive(coupon)}
                            disabled={isPending || expired}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-40 ${
                              isLive
                                ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10'
                                : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
                            }`}
                          >
                            {isPending ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Power className="h-3.5 w-3.5" />
                            )}
                            {isLive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(coupon)}
                            disabled={isPending}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition disabled:opacity-40"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { AlertCircle, CheckCircle2, Loader2, MessageCircle, Save, Trash2 } from 'lucide-react';
import { db } from '@/lib/firebase';

export default function SettingsTab() {
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [savedNumber, setSavedNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'settings', 'general'),
      (snapshot) => {
        const value = String(snapshot.data()?.whatsappNumber || '');
        setWhatsappNumber(value);
        setSavedNumber(value);
        setLoading(false);
      },
      (err) => {
        console.error('Failed to load general settings:', err);
        setStatus({ type: 'error', text: 'Could not load settings. Check Firestore permissions.' });
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, []);

  const saveNumber = async (value: string) => {
    setSaving(true);
    setStatus(null);
    try {
      await setDoc(doc(db, 'settings', 'general'), { whatsappNumber: value }, { merge: true });
      setSavedNumber(value);
      setWhatsappNumber(value);
      setStatus({
        type: 'success',
        text: value
          ? 'WhatsApp support button is now live across the platform.'
          : 'WhatsApp support button disabled.',
      });
    } catch (err) {
      console.error('Failed to save WhatsApp number:', err);
      setStatus({ type: 'error', text: 'Could not save settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = whatsappNumber.replace(/\D/g, '');
    if (digits && (digits.length < 9 || digits.length > 15)) {
      setStatus({
        type: 'error',
        text: 'Enter a valid international number with country code, e.g. 94771234567 (9-15 digits).',
      });
      return;
    }
    await saveNumber(digits);
  };

  const handleClear = async () => {
    if (!window.confirm('Disable the floating WhatsApp support button?')) return;
    await saveNumber('');
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          General Settings
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Public-facing support and contact configuration for the platform.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">
          WhatsApp Support Number
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          When a number is saved, a floating WhatsApp button appears in the bottom-right corner of
          every page so students can reach support instantly.
        </p>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 py-4">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading settings...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="whatsapp-number"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                WhatsApp Number (with country code)
              </label>
              <div className="flex items-center">
                <span className="inline-flex items-center px-3 py-2.5 rounded-l-xl border border-r-0 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-500 dark:text-gray-400">
                  +
                </span>
                <input
                  id="whatsapp-number"
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="94 77 123 4567"
                  className="flex-1 px-4 py-2.5 rounded-r-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                Include the country code without the leading +. Example: Sri Lanka{' '}
                <span className="font-mono font-semibold">94771234567</span>.
              </p>
            </div>

            {savedNumber.length >= 9 && (
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 px-4 py-3 text-sm">
                <p className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Button is live
                </p>
                <a
                  href={`https://wa.me/${savedNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-700/80 dark:text-emerald-400/80 underline break-all"
                >
                  https://wa.me/{savedNumber}
                </a>
              </div>
            )}

            {status && (
              <div
                className={`flex items-start gap-2 px-4 py-3 rounded-xl text-sm border ${
                  status.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                    : 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400'
                }`}
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{status.text}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
              {savedNumber && (
                <button
                  type="button"
                  onClick={() => void handleClear()}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 text-sm font-semibold transition disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Disable Button
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Stored in Firestore at <span className="font-mono">settings/general</span>. Make sure public
        read access to this document is allowed so visitors can see the support button.
      </p>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { CheckCircle2, XCircle, Clock, Loader2, Mail } from 'lucide-react';
import type { AdminPaymentRecord } from './types';

export default function PaymentsTab() {
  const [payments, setPayments] = useState<AdminPaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, 'payments'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        setPayments(
          snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as AdminPaymentRecord[],
        );
        setLoading(false);
      },
      (err) => {
        console.error('Error loading payments:', err);
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, []);

  const handleViewSlip = async (record: AdminPaymentRecord) => {
    try {
      setViewingId(record.id);
      const res = await fetch(`/api/sas?containerName=payments&blobName=${encodeURIComponent(record.blobName)}`);
      const data = await res.json();
      if (data.success && data.sasUrl) window.open(data.sasUrl, '_blank');
      else alert(data?.error || 'Failed');
    } catch { alert('Error'); } finally { setViewingId(null); }
  };

  const handleDecision = async (record: AdminPaymentRecord, status: 'approved' | 'rejected') => {
    setProcessingId(record.id);
    setFeedback('');
    try {
      await updateDoc(doc(db, 'payments', record.id), { status });
      if (status === 'approved') {
        await updateDoc(doc(db, 'users', record.userId), { isPaid: true });
        const emailRes = await fetch('/api/email/send', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: record.userEmail,
            subject: 'Your MadeiApp account is unlocked!',
            message: `Your payment of ${record.amount} was approved. Access is now unlocked.`,
          }),
        });
        const ed = await emailRes.json();
        setFeedback(ed?.configured === false
          ? `Approved. Email not sent: ${ed?.message || ''}`
          : ed?.success ? 'Approved and emailed.' : 'Approved, email failed.');
      } else {
        setFeedback('Rejected.');
      }
    } catch (e) {
      setFeedback('Failed.');
      console.error(e);
    } finally { setProcessingId(null); }
  };

  const statusStyles = { pending: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200', approved: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200', rejected: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200' };

  return (
    <div className="space-y-3">
      {feedback && (
        <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 text-indigo-800 p-2 rounded text-sm flex items-center gap-2">
          <Mail className="h-3 w-3" />
          {feedback}
        </div>
      )}
      {loading ? (
        <div className="flex items-center py-4"><Loader2 className="h-5 w-5 animate-spin text-indigo-600 dark:text-indigo-400" /></div>
      ) : payments.length === 0 ? (
        <div className="bg-gray-200 dark:bg-gray-700 p-8 text-center text-gray-500 dark:text-gray-400">No submissions.</div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="py-2 px-4">Student</th>
                  <th className="py-2 px-4">Date</th>
                  <th className="py-2 px-4">Amount</th>
                  <th className="py-2 px-4">Status</th>
                  <th className="py-2 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((r: AdminPaymentRecord) => {
                  const Icon = { pending: Clock, approved: CheckCircle2, rejected: XCircle }[r.status] || Clock;
                  return (
                    <tr key={r.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                      <td className="py-2 px-4 text-sm font-medium">{r.userEmail || 'Unknown'}</td>
                      <td className="py-2 px-4 text-xs text-gray-500 dark:text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td className="py-2 px-4 font-medium">
                        {r.amount || 'N/A'}
                        {r.promoCode && (
                          <span className="block text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            Promo {r.promoCode}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold border ${statusStyles[r.status as keyof typeof statusStyles]}`}>
                          <Icon className="h-3 w-3" />
                          <span className="capitalize">{r.status}</span>
                        </span>
                      </td>
                      <td className="py-2 px-4 text-right space-x-1">
                        <button onClick={() => handleViewSlip(r)} disabled={viewingId === r.id} className="text-indigo-600 dark:text-indigo-400 text-xs hover:underline disabled:opacity-50">
                          {viewingId === r.id ? 'Opening...' : 'View'}
                        </button>
                        <button onClick={() => handleDecision(r, 'approved')} disabled={processingId === r.id} className="text-emerald-600 dark:text-emerald-400 text-xs hover:underline">Approve</button>
                        <button onClick={() => handleDecision(r, 'rejected')} disabled={processingId === r.id} className="text-rose-600 dark:text-rose-400 text-xs hover:underline">Reject</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
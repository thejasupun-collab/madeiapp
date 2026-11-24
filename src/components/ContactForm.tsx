'use client';

import { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { AlertCircle, CheckCircle2, Loader2, Send } from 'lucide-react';
import { db } from '@/lib/firebase';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [company, setCompany] = useState(''); // Honeypot field for basic bot filtering.
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (company.trim()) {
      // Silently accept without writing anything when the honeypot is filled.
      setStatus({ type: 'success', text: 'Thanks! Your message has been received.' });
      return;
    }
    if (message.trim().length < 10) {
      setStatus({
        type: 'error',
        text: 'Please add a little more detail so we can help (at least 10 characters).',
      });
      return;
    }

    setSending(true);
    try {
      await addDoc(collection(db, 'messages'), {
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim() || 'General inquiry',
        message: message.trim(),
        status: 'new',
        createdAt: new Date().toISOString(),
      });
      setStatus({
        type: 'success',
        text: 'Message sent! Our support team will reply to your email within one business day.',
      });
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err) {
      console.error('Failed to send contact message:', err);
      setStatus({
        type: 'error',
        text: 'We could not send your message right now. Please try again or email support@madeiapp.com.',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Full Name
          </label>
          <input
            id="contact-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoComplete="name"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email Address
          </label>
          <input
            id="contact-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            autoComplete="email"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Subject
        </label>
        <input
          id="contact-subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. Payment verification, notes access, refund request"
          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          How can we help?
        </label>
        <textarea
          id="contact-message"
          required
          rows={6}
          maxLength={2000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us what you need help with. If this is about a payment, include the payment date and reference number."
          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none resize-y"
        />
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 text-right">
          {message.length}/2000
        </p>
      </div>

      <div className="hidden" aria-hidden="true">
        <label htmlFor="contact-company">Company</label>
        <input
          id="contact-company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
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
        disabled={sending}
        className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-100 dark:shadow-indigo-950/40 transition disabled:opacity-50"
      >
        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {sending ? 'Sending message...' : 'Send Message'}
      </button>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        By submitting this form you agree to our{' '}
        <a href="/privacy" className="text-indigo-600 dark:text-indigo-400 underline">
          Privacy Policy
        </a>
        . We use your details only to respond to your inquiry.
      </p>
    </form>
  );
}

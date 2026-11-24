'use client';

import { useEffect, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { Loader2, Mail, MailOpen, MessageSquare, Trash2, User } from 'lucide-react';
import { db } from '@/lib/firebase';
import type { AdminMessage } from './types';

export default function MessagesTab() {
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'messages'),
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as AdminMessage[];
        list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        setMessages(list);
        setLoading(false);
      },
      (err) => {
        console.error('Failed to load messages:', err);
        setFeedback('Could not load messages. Check Firestore permissions.');
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, []);

  const newCount = messages.filter((message) => message.status !== 'read').length;

  const toggleRead = async (message: AdminMessage) => {
    const nextRead = message.status !== 'read';
    setPendingId(message.id);
    setFeedback('');
    try {
      await updateDoc(doc(db, 'messages', message.id), { status: nextRead ? 'read' : 'new' });
    } catch (err) {
      console.error('Failed to update message:', err);
      setFeedback('Could not update this message.');
    } finally {
      setPendingId(null);
    }
  };

  const handleDelete = async (message: AdminMessage) => {
    if (!window.confirm(`Delete the message from ${message.name || message.email}?`)) return;
    setPendingId(message.id);
    setFeedback('');
    try {
      await deleteDoc(doc(db, 'messages', message.id));
      setFeedback('Message deleted.');
    } catch (err) {
      console.error('Failed to delete message:', err);
      setFeedback('Could not delete this message.');
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Contact Messages
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Inquiries submitted through the public contact form.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-semibold">
          <Mail className="h-3.5 w-3.5" /> {newCount} unread
        </span>
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
      ) : messages.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-10 text-center">
          <Mail className="h-10 w-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No contact messages yet.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {messages.map((message) => {
            const isUnread = message.status !== 'read';
            const isPending = pendingId === message.id;
            return (
              <li
                key={message.id}
                className={`bg-white dark:bg-gray-900 rounded-2xl border p-5 shadow-sm ${
                  isUnread
                    ? 'border-indigo-200 dark:border-indigo-500/30'
                    : 'border-gray-200 dark:border-gray-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {message.subject || 'General inquiry'}
                      </span>
                      {isUnread && (
                        <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="inline-flex items-center gap-1">
                        <User className="h-3 w-3" /> {message.name || 'Unknown'}
                      </span>
                      <a
                        href={`mailto:${message.email}?subject=${encodeURIComponent(
                          `Re: ${message.subject || 'Your MadeiApp inquiry'}`,
                        )}`}
                        className="inline-flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        <Mail className="h-3 w-3" /> {message.email}
                      </a>
                      <span>
                        {message.createdAt ? new Date(message.createdAt).toLocaleString() : ''}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mt-3 whitespace-pre-line">
                      {message.message}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => void toggleRead(message)}
                      disabled={isPending}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs font-semibold transition disabled:opacity-50"
                    >
                      {isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : isUnread ? (
                        <MailOpen className="h-3.5 w-3.5" />
                      ) : (
                        <Mail className="h-3.5 w-3.5" />
                      )}
                      {isUnread ? 'Mark read' : 'Mark unread'}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(message)}
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

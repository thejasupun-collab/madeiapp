'use client';

import { useMemo, useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import {
  Search,
  Users,
  BadgeCheck,
  Ban,
  Unlock,
  Lock,
  Loader2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { db } from '@/lib/firebase';
import type { AdminUserRecord } from './types';

interface UsersTabProps {
  users: AdminUserRecord[];
  currentUid?: string;
}

type UserPatch = Partial<Pick<AdminUserRecord, 'isPaid' | 'isBlocked' | 'role'>>;

const ROLE_STYLES: Record<string, string> = {
  admin:
    'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30',
  staff:
    'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-500/30',
  student:
    'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30',
};

export default function UsersTab({ users, currentUid }: UsersTabProps) {
  const [search, setSearch] = useState('');
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return [...users]
      .filter((user) => {
        if (!term) return true;
        return (
          (user.name || '').toLowerCase().includes(term) ||
          (user.email || '').toLowerCase().includes(term)
        );
      })
      .sort((a, b) => (a.name || a.email || '').localeCompare(b.name || b.email || ''));
  }, [users, search]);

  const paidCount = users.filter((user) => user.isPaid).length;
  const blockedCount = users.filter((user) => user.isBlocked).length;

  const updateUser = async (user: AdminUserRecord, patch: UserPatch) => {
    const docId = user.id || user.uid;
    if (!docId) {
      setMessage({ type: 'error', text: 'This user record is missing an ID and cannot be updated.' });
      return;
    }
    if (currentUid && (user.uid === currentUid || user.id === currentUid)) {
      setMessage({ type: 'error', text: 'You cannot change your own admin account from this panel.' });
      return;
    }

    setPendingId(docId);
    setMessage(null);
    try {
      await updateDoc(doc(db, 'users', docId), patch);
      const action =
        patch.isBlocked === true
          ? 'Account blocked.'
          : patch.isBlocked === false
            ? 'Account unblocked.'
            : patch.role
              ? 'Role updated.'
              : patch.isPaid === true
                ? 'Access unlocked.'
                : 'Access locked.';
      setMessage({ type: 'success', text: `${action} ${user.email || user.name || 'User'}` });
    } catch (err) {
      console.error('Failed to update user:', err);
      setMessage({ type: 'error', text: 'Could not update this user. Please try again.' });
    } finally {
      setPendingId(null);
    }
  };

  const handleRoleChange = (user: AdminUserRecord, role: AdminUserRecord['role']) => {
    if (role === user.role) return;
    const confirmed = window.confirm(
      `Change ${user.email || user.name || 'this user'}'s role to "${role}"?`,
    );
    if (confirmed) void updateUser(user, { role });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students by name or email..."
            aria-label="Search users by name or email"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium">
            <Users className="h-3.5 w-3.5" /> {users.length} total
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium">
            <BadgeCheck className="h-3.5 w-3.5" /> {paidCount} paid
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 font-medium">
            <Ban className="h-3.5 w-3.5" /> {blockedCount} blocked
          </span>
        </div>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm border ${
            message.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
              : 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400'
          }`}
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Paid Access</th>
                <th className="py-3 px-4">Account</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 px-4 text-center text-gray-500 dark:text-gray-400">
                    {users.length === 0
                      ? 'No users found in the users collection.'
                      : 'No users match your search.'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const docId = user.id || user.uid;
                  const isSelf = Boolean(
                    currentUid && (user.uid === currentUid || user.id === currentUid),
                  );
                  const isPending = pendingId === docId;
                  const initials = (user.name || user.email || '?').charAt(0).toUpperCase();

                  return (
                    <tr
                      key={docId}
                      className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold flex-shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                {user.name || 'Unnamed user'}
                              </span>
                              {isSelf && (
                                <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {user.email || 'No email'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={user.role}
                            onChange={(e) =>
                              handleRoleChange(user, e.target.value as AdminUserRecord['role'])
                            }
                            disabled={isPending || isSelf}
                            aria-label={`Change role for ${user.email || user.name}`}
                            className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold capitalize outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 ${ROLE_STYLES[user.role] || ROLE_STYLES.student}`}
                          >
                            <option value="student">Student</option>
                            <option value="admin">Admin</option>
                            <option value="staff">Staff</option>
                          </select>
                          {user.role === 'admin' && (
                            <ShieldCheck className="h-4 w-4 text-amber-500" aria-hidden="true" />
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${
                              user.isPaid
                                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            <BadgeCheck className="h-3 w-3" />
                            {user.isPaid ? 'Paid' : 'Free'}
                          </span>
                          <button
                            type="button"
                            onClick={() => void updateUser(user, { isPaid: !user.isPaid })}
                            disabled={isPending || isSelf}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition disabled:opacity-50"
                          >
                            {isPending ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : user.isPaid ? (
                              <Lock className="h-3.5 w-3.5" />
                            ) : (
                              <Unlock className="h-3.5 w-3.5" />
                            )}
                            {user.isPaid ? 'Lock access' : 'Unlock access'}
                          </button>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${
                              user.isBlocked
                                ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30'
                                : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
                            }`}
                          >
                            <Ban className="h-3 w-3" />
                            {user.isBlocked ? 'Blocked' : 'Active'}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                !user.isBlocked &&
                                !window.confirm(
                                  `Block ${user.email || user.name}? They will be signed out of dashboard access.`,
                                )
                              ) {
                                return;
                              }
                              void updateUser(user, { isBlocked: !user.isBlocked });
                            }}
                            disabled={isPending || isSelf}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-50 ${
                              user.isBlocked
                                ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
                                : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10'
                            }`}
                          >
                            {user.isBlocked ? (
                              <Unlock className="h-3.5 w-3.5" />
                            ) : (
                              <Ban className="h-3.5 w-3.5" />
                            )}
                            {user.isBlocked ? 'Unblock' : 'Block'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

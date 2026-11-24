'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { collection, onSnapshot } from 'firebase/firestore';
import {
  Users,
  BadgeCheck,
  Clock,
  FolderOpen,
  Eye,
  ShieldCheck,
  ShieldOff,
  LayoutDashboard,
  TicketPercent,
  CreditCard,
  ArrowRight,
  Activity,
  Star,
  Mail,
  Settings,
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import UsersTab from '@/components/admin/UsersTab';
import CouponsTab from '@/components/admin/CouponsTab';
import PaymentsTab from '@/components/admin/PaymentsTab';
import ReviewsTab from '@/components/admin/ReviewsTab';
import MessagesTab from '@/components/admin/MessagesTab';
import SettingsTab from '@/components/admin/SettingsTab';
import type { AdminPaymentRecord, AdminUserRecord } from '@/components/admin/types';

type AdminTab = 'overview' | 'users' | 'coupons' | 'payments' | 'reviews' | 'messages' | 'settings';

interface AdminFileRecord {
  id: string;
  title?: string;
  subject?: string;
  views?: number;
}

const TABS: { key: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'users', label: 'User Management', icon: Users },
  { key: 'coupons', label: 'Coupons', icon: TicketPercent },
  { key: 'payments', label: 'Payments', icon: CreditCard },
  { key: 'reviews', label: 'Reviews', icon: Star },
  { key: 'messages', label: 'Messages', icon: Mail },
  { key: 'settings', label: 'Settings', icon: Settings },
];

export default function AdminPage() {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (userProfile?.role !== 'admin') {
    return (
      <div className="max-w-lg mx-auto bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-10 text-center space-y-4">
        <div className="mx-auto h-16 w-16 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
          <ShieldOff className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Admin Access Required</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          This area is restricted to platform administrators. If you believe you should have access,
          contact the MadeiApp team.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return <AdminDashboard currentUid={userProfile.uid} />;
}

function AdminDashboard({ currentUid }: { currentUid: string }) {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [payments, setPayments] = useState<AdminPaymentRecord[]>([]);
  const [files, setFiles] = useState<AdminFileRecord[]>([]);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [filesLoaded, setFilesLoaded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribeUsers = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        setUsers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as AdminUserRecord[]);
        setUsersLoaded(true);
      },
      (err) => {
        console.error('Admin users listener failed:', err);
        setError('Could not load users. Check Firestore permissions.');
        setUsersLoaded(true);
      },
    );

    const unsubscribePayments = onSnapshot(
      collection(db, 'payments'),
      (snapshot) => {
        setPayments(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as AdminPaymentRecord[]);
      },
      (err) => {
        console.error('Admin payments listener failed:', err);
        setError('Could not load payments.');
      },
    );

    const unsubscribeFiles = onSnapshot(
      collection(db, 'facfiles'),
      (snapshot) => {
        setFiles(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as AdminFileRecord[]);
        setFilesLoaded(true);
      },
      (err) => {
        console.error('Admin files listener failed:', err);
        setFilesLoaded(true);
      },
    );

    return () => {
      unsubscribeUsers();
      unsubscribePayments();
      unsubscribeFiles();
    };
  }, []);

  const totalStudents = useMemo(() => users.filter((u) => u.role === 'student').length, [users]);
  const paidStudents = useMemo(
    () => users.filter((u) => u.role === 'student' && u.isPaid).length,
    [users],
  );
  const blockedStudents = useMemo(
    () => users.filter((u) => u.role === 'student' && u.isBlocked).length,
    [users],
  );

  const pendingSlips = useMemo(() => payments.filter((p) => p.status === 'pending').length, [payments]);
  const approvedSlips = useMemo(() => payments.filter((p) => p.status === 'approved').length, [payments]);
  const rejectedSlips = useMemo(() => payments.filter((p) => p.status === 'rejected').length, [payments]);

  const mostViewedFile = useMemo(() => {
    if (files.length === 0) return null;
    return files.reduce((best, file) =>
      (Number(file.views) || 0) > (Number(best.views) || 0) ? file : best,
    );
  }, [files]);

  const totalViews = useMemo(
    () => files.reduce((sum, file) => sum + (Number(file.views) || 0), 0),
    [files],
  );

  const paidRate = totalStudents > 0 ? Math.round((paidStudents / totalStudents) * 100) : 0;

  const stats = [
    {
      label: 'Total Students',
      value: usersLoaded ? String(totalStudents) : '—',
      hint: blockedStudents > 0 ? `${blockedStudents} blocked` : 'All accounts active',
      icon: Users,
      iconClass: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
      valueClass: '',
    },
    {
      label: 'Paid Students',
      value: usersLoaded ? String(paidStudents) : '—',
      hint: `${paidRate}% conversion`,
      icon: BadgeCheck,
      iconClass: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      valueClass: '',
    },
    {
      label: 'Pending Payment Slips',
      value: String(pendingSlips),
      hint: `${approvedSlips} approved · ${rejectedSlips} rejected`,
      icon: Clock,
      iconClass: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
      valueClass: '',
    },
    {
      label: 'Total Files',
      value: filesLoaded ? String(files.length) : '—',
      hint: `${totalViews} preview views`,
      icon: FolderOpen,
      iconClass: 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400',
      valueClass: '',
    },
    {
      label: 'Most Viewed File',
      value: filesLoaded ? (mostViewedFile?.title || 'No files yet') : '—',
      hint: mostViewedFile ? `${Number(mostViewedFile.views) || 0} views` : 'Upload files to see stats',
      icon: Eye,
      iconClass: 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400',
      valueClass: 'text-lg leading-snug line-clamp-2',
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-950 dark:text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            Admin Control Center
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Live analytics, student access, promo codes, payments, reviews, messages and settings.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-500/30">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          Live data
        </span>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm border bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400">
          <Activity className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className={`p-2.5 rounded-xl ${stat.iconClass}`}>
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <p className={`font-extrabold text-gray-950 dark:text-white ${stat.valueClass || 'text-2xl'}`}>
                {stat.value}
              </p>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">
                {stat.label}
              </p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                {stat.hint}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-1.5 bg-white dark:bg-gray-900 p-1.5 rounded-xl border border-gray-200 dark:border-gray-800 w-fit max-w-full shadow-sm">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          const badge =
            tab.key === 'users' ? users.length : tab.key === 'payments' ? pendingSlips : undefined;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              aria-pressed={isActive}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {badge !== undefined && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Student Access
            </h2>
            <div className="flex items-end justify-between mb-2">
              <span className="text-3xl font-extrabold text-gray-950 dark:text-white">
                {usersLoaded ? paidStudents : '—'}
                <span className="text-sm font-medium text-gray-400 dark:text-gray-500">
                  /{usersLoaded ? totalStudents : '—'}
                </span>
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {paidRate}% paid
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                style={{ width: `${paidRate}%` }}
              />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                {paidStudents} paid
              </span>
              <span className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                {Math.max(totalStudents - paidStudents, 0)} free
              </span>
              {blockedStudents > 0 && (
                <span className="px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400">
                  {blockedStudents} blocked
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
            >
              Manage students <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              Payment Verification
            </h2>
            <div className="flex items-end justify-between mb-3">
              <span className="text-3xl font-extrabold text-gray-950 dark:text-white">
                {pendingSlips}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400">
                Pending slips
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-3 py-2">
                {approvedSlips} approved
              </div>
              <div className="rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 px-3 py-2">
                {rejectedSlips} rejected
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('payments')}
              className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
            >
              Review payments <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4">
              <FolderOpen className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              Study Library
            </h2>
            <div className="flex items-end justify-between mb-3">
              <span className="text-3xl font-extrabold text-gray-950 dark:text-white">
                {filesLoaded ? files.length : '—'}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400">
                {totalViews} views
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Most viewed:{' '}
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {mostViewedFile?.title || 'No files yet'}
              </span>
            </p>
            <Link
              href="/dashboard/files"
              className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
            >
              Open file manager <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {activeTab === 'users' && <UsersTab users={users} currentUid={currentUid} />}

      {activeTab === 'coupons' && <CouponsTab />}

      {activeTab === 'payments' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
              Payment Slip Verification
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400">
              {pendingSlips} pending
            </span>
          </div>
          <PaymentsTab />
        </div>
      )}

      {activeTab === 'reviews' && <ReviewsTab />}

      {activeTab === 'messages' && <MessagesTab />}

      {activeTab === 'settings' && <SettingsTab />}
    </div>
  );
}

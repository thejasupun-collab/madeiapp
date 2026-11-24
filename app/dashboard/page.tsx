'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import {
  FolderOpen,
  FileText,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Bookmark,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardHomePage() {
  const { userProfile, refreshProfile } = useAuth();
  const isAdmin = userProfile?.role === 'admin';
  const isPaid = userProfile?.isPaid;

  const [totalFiles, setTotalFiles] = useState(0);

  // Pull the newest bookmarks/completions when returning from the files page.
  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  useEffect(() => {
    let cancelled = false;

    async function fetchFileCount() {
      try {
        const snapshot = await getDocs(collection(db, 'facfiles'));
        if (!cancelled) setTotalFiles(snapshot.size);
      } catch (err) {
        console.error('Failed to load file count:', err);
      }
    }

    fetchFileCount();
    return () => {
      cancelled = true;
    };
  }, []);

  const completedCount = userProfile?.completedFiles?.length ?? 0;
  const bookmarkedCount = userProfile?.bookmarkedFiles?.length ?? 0;
  const progressTotal = Math.max(totalFiles, completedCount);
  const completionPercent = progressTotal > 0 ? Math.round((completedCount / progressTotal) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-violet-700 rounded-2xl p-6 md:p-8 text-white shadow-xl">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-2">
          Welcome back, {userProfile?.name || 'User'}!
        </h1>
        <p className="text-indigo-100 text-sm md:text-base max-w-2xl leading-relaxed">
          Access faculty files, check payment status, and manage platform contents with ease.
        </p>
      </div>

      {/* Study progress */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Study Progress</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Track the course materials you have finished.
              </p>
            </div>
          </div>
          <div className="sm:text-right">
            <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{completionPercent}%</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {completedCount} of {progressTotal} {progressTotal === 1 ? 'file' : 'files'} completed
            </p>
          </div>
        </div>

        <div
          className="w-full h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden"
          role="progressbar"
          aria-valuenow={completionPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Study completion progress"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
            style={{ width: `${completionPercent}%` }}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {completedCount} completed
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400">
            <Bookmark className="h-3.5 w-3.5" />
            {bookmarkedCount} bookmarked
          </span>
          <Link
            href="/dashboard/files"
            className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            Open study files <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"><FolderOpen className="h-6 w-6" /></span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400">Azure</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Faculty Files</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Access lecture notes and study materials in `facfiles`.</p>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Container: facfiles</span>
            <Link href="/dashboard/files" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1">
              Browse <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="p-3 rounded-xl bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400"><FileText className="h-6 w-6" /></span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400">Blogs</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Latest Articles</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Read announcements and updates stored in `blogs`.</p>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Container: blogs</span>
            <Link href="/dashboard/blogs" className="text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 flex items-center gap-1">
              Read <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className={`p-3 rounded-xl ${isPaid ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                <CreditCard className="h-6 w-6" />
              </span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${isPaid ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'}`}>
                {isPaid ? 'Active Member' : 'Free Tier'}
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Payment &amp; Access</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {isPaid ? 'Full access to premium containers.' : 'Upgrade your account to unlock premium materials.'}
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {isPaid ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Verified</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">Upgrade Required</span>
                </>
              )}
            </div>
            <Link href="/dashboard/payments" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1">
              Manage <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20"><ShieldCheck className="h-8 w-8" /></div>
            <div>
              <h3 className="text-lg font-bold">Admin Privileges Active</h3>
              <p className="text-slate-400 text-sm">Manage users, upload blobs to Azure, and configure platform settings.</p>
            </div>
          </div>
          <Link href="/dashboard/admin" className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow transition whitespace-nowrap">
            Open Admin Panel
          </Link>
        </div>
      )}
    </div>
  );
}

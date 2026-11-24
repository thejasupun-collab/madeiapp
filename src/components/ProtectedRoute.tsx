'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, LogOut, Mail } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { firebaseUser, userProfile, loading, logOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.push('/login');
    }
  }, [firebaseUser, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (!firebaseUser) {
    return null;
  }

  if (userProfile?.isBlocked) {
    const handleSignOut = async () => {
      try {
        await logOut();
      } finally {
        router.push('/login');
      }
    };

    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12 transition-colors">
        <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-rose-200 dark:border-rose-500/30 p-8 text-center space-y-5">
          <div className="mx-auto h-16 w-16 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <ShieldAlert className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Account Suspended
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Your MadeiApp account has been suspended by an administrator. You can no longer access
              the dashboard, study files, or payment features.
            </p>
          </div>

          {userProfile?.email && (
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-300">
              <Mail className="h-3.5 w-3.5" />
              {userProfile.email}
            </div>
          )}

          <p className="text-xs text-gray-500 dark:text-gray-400">
            If you believe this is a mistake, contact the MadeiApp administrator to restore your access.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <button
              type="button"
              onClick={handleSignOut}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold shadow transition"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
            <Link
              href="/"
              className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

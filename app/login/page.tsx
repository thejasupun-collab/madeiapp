'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { sendPasswordResetEmail } from 'firebase/auth';
import { AlertCircle, CheckCircle2, Loader2, Mail, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import ThemeToggle from '@/components/ThemeToggle';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const { signIn } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const openForgotPassword = () => {
    setResetEmail(email);
    setResetError('');
    setResetMessage('');
    setResetOpen(true);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetMessage('');

    const target = resetEmail.trim();
    if (!target) {
      setResetError('Enter the email address linked to your account.');
      return;
    }

    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, target);
      setResetMessage(
        `Password reset email sent to ${target}. Check your inbox and spam/junk folder.`,
      );
    } catch (err) {
      const code = (err as { code?: string }).code;
      setResetError(
        code === 'auth/invalid-email'
          ? 'Please enter a valid email address.'
          : code === 'auth/user-not-found'
            ? 'No account was found with that email address.'
            : code === 'auth/too-many-requests'
              ? 'Too many attempts. Please wait a few minutes and try again.'
              : 'We could not send the reset email. Please try again.',
      );
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-gray-100 dark:bg-gray-950 px-4 py-12 transition-colors">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle className="bg-white/80 dark:bg-gray-900/80 shadow-sm border border-gray-200 dark:border-gray-800" />
      </div>
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 space-y-6 transition-colors">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <div className="h-10 w-10 mx-auto rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
              M
            </div>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Sign in to MadeiApp
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter your credentials to access your account
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-sm p-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
              <span className="ml-2 text-gray-600 dark:text-gray-400">Remember me</span>
            </label>
            <button
              type="button"
              onClick={openForgotPassword}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-medium"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 font-medium shadow-md shadow-indigo-100 dark:shadow-indigo-950/40 transition duration-200 disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800 space-y-2">
          <p>
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
              Register
            </Link>
          </p>
          <p>
            <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 underline">
              Back to Home
            </Link>
          </p>
          <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs pt-1">
            <Link href="/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-indigo-600 dark:hover:text-indigo-400">
              Terms
            </Link>
            <Link href="/refund" className="hover:text-indigo-600 dark:hover:text-indigo-400">
              Refunds
            </Link>
            <Link href="/contact" className="hover:text-indigo-600 dark:hover:text-indigo-400">
              Contact
            </Link>
          </p>
        </div>
      </div>

      {resetOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-password-title"
          onClick={() => setResetOpen(false)}
        >
          <div
            className="w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h2
                    id="reset-password-title"
                    className="text-lg font-bold text-gray-900 dark:text-gray-100"
                  >
                    Reset your password
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    We&apos;ll email you a secure reset link.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResetOpen(false)}
                aria-label="Close password reset dialog"
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label
                  htmlFor="reset-email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Account Email Address
                </label>
                <input
                  id="reset-email"
                  type="email"
                  required
                  autoFocus
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
              </div>

              {resetError && (
                <div
                  role="alert"
                  className="flex items-start gap-2 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-sm p-3 rounded-lg"
                >
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{resetError}</span>
                </div>
              )}

              {resetMessage && (
                <div
                  role="status"
                  className="flex items-start gap-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-sm p-3 rounded-lg"
                >
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{resetMessage}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 font-medium transition disabled:opacity-50 text-sm"
                >
                  {resetLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4" />
                  )}
                  {resetLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
                <button
                  type="button"
                  onClick={() => setResetOpen(false)}
                  className="px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
              </div>
            </form>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              If you do not receive an email within a few minutes, check your spam/junk folder or
              contact support at support@madeiapp.com.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

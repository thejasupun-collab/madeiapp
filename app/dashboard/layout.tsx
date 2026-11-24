'use client';

import React, { Suspense, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardNav from '@/components/DashboardNav';
import ThemeToggle from '@/components/ThemeToggle';
import ActivePathLabel from '@/components/ActivePathLabel';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs, updateDoc, arrayUnion, query, orderBy } from 'firebase/firestore';
import {
  Menu,
  X,
  LogOut,
  User as UserIcon,
  Bell,
  Megaphone,
  CheckCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface NoticeConfig {
  text: string;
  isActive: boolean;
  type: 'info' | 'warning' | 'success';
}

interface InAppNotification {
  id: string;
  title: string;
  message: string;
  target: 'all' | 'paid';
  createdAt: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { userProfile, firebaseUser, logOut } = useAuth();
  const router = useRouter();

  const [notice, setNotice] = useState<NoticeConfig | null>(null);
  const [noticeDismissed, setNoticeDismissed] = useState(false);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [localReadIds, setLocalReadIds] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchNoticeAndNotifications() {
      try {
        const noticeSnap = await getDoc(doc(db, 'settings', 'notice'));
        if (noticeSnap.exists()) {
          setNotice(noticeSnap.data() as NoticeConfig);
        }
        const notifSnap = await getDocs(query(collection(db, 'notifications'), orderBy('createdAt', 'desc')));
        const allNotifs = notifSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as InAppNotification[];
        setNotifications(allNotifs);
      } catch (err) {
        console.error('Error fetching notice or notifications:', err);
      }
    }
    fetchNoticeAndNotifications();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logOut();
      router.push('/login');
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (n.target === 'all') return true;
    if (n.target === 'paid' && (userProfile?.isPaid || userProfile?.role === 'admin')) return true;
    return false;
  });

  const readList = Array.from(new Set([...(userProfile?.readNotifications || []), ...localReadIds]));
  const unreadCount = filteredNotifications.filter((n) => !readList.includes(n.id)).length;

  const markAsRead = async (notifId: string) => {
    if (!firebaseUser || readList.includes(notifId)) return;
    setLocalReadIds((prev) => [...prev, notifId]);
    try {
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        readNotifications: arrayUnion(notifId),
      });
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const noticeTypeStyles = {
    info: 'bg-indigo-600 text-white',
    warning: 'bg-amber-500 text-white',
    success: 'bg-emerald-600 text-white',
  };

  const NoticeIcon = {
    info: Info,
    warning: AlertTriangle,
    success: CheckCircle,
  }[notice?.type || 'info'];

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden font-sans transition-colors">
        {sidebarOpen && (
          <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm" />
        )}

        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="h-16 flex items-center px-6 bg-slate-950 text-white font-bold text-xl justify-between border-b border-slate-800">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow">M</div>
              <span className="tracking-wider">MadeiApp</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white p-1">
              <X className="h-6 w-6" />
            </button>
          </div>

          <Suspense fallback={<div className="flex-1 px-4 py-6" />}>
            <DashboardNav role={userProfile?.role} onNavigate={() => setSidebarOpen(false)} />
          </Suspense>

          <div className="p-4 border-t border-slate-800 bg-slate-950/50">
            <button onClick={handleLogout} className="flex items-center justify-center w-full py-2.5 px-4 rounded-xl bg-slate-800 text-slate-200 hover:bg-rose-600 hover:text-white transition text-sm font-medium shadow-sm gap-2">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {notice?.isActive && notice.text && !noticeDismissed && (
            <div className={`px-4 py-2.5 text-sm font-medium flex items-center justify-between shadow-sm z-40 ${noticeTypeStyles[notice.type] || noticeTypeStyles.info}`}>
              <div className="flex items-center gap-2 max-w-5xl mx-auto flex-1 justify-center text-center">
                <NoticeIcon className="h-4 w-4 flex-shrink-0" />
                <span>{notice.text}</span>
              </div>
              <button onClick={() => setNoticeDismissed(true)} className="text-white/80 hover:text-white p-1 rounded-lg transition" aria-label="Dismiss notice">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 shadow-sm z-30 transition-colors">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition" aria-label="Open sidebar">
              <Menu className="h-6 w-6" />
            </button>
            <Suspense fallback={<div className="hidden md:block h-5 w-48" />}>
              <ActivePathLabel />
            </Suspense>
            <div className="flex items-center space-x-4 ml-auto">
              <ThemeToggle />
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="relative p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition focus:outline-none"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-rose-600 text-white font-bold text-[10px] flex items-center justify-center ring-2 ring-white dark:ring-gray-900">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 py-3 z-50">
                    <div className="px-4 pb-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                        <Megaphone className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        Notifications
                      </h3>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                        {unreadCount} unread
                      </span>
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                      {filteredNotifications.length === 0 ? (
                        <div className="py-8 text-center text-sm text-gray-400">No notifications right now.</div>
                      ) : (
                        filteredNotifications.map((n) => {
                          const isRead = readList.includes(n.id);
                          return (
                            <div
                              key={n.id}
                              onClick={() => markAsRead(n.id)}
                              className={`p-4 transition cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${isRead ? 'bg-white dark:bg-gray-900 opacity-75' : 'bg-indigo-50/40 dark:bg-indigo-500/10'}`}
                            >
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100">{n.title}</h4>
                                <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                  {new Date(n.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{n.message}</p>
                              {!isRead && <span className="inline-block mt-2 h-2 w-2 rounded-full bg-indigo-600" />}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-lg shadow-inner">
                  {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : <UserIcon className="h-5 w-5" />}
                </div>
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-bold text-gray-800 dark:text-gray-200">{userProfile?.name || 'User'}</div>
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold capitalize flex items-center justify-end gap-1.5">
                    <span className={`inline-block h-2 w-2 rounded-full ${userProfile?.role === 'admin' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                    {userProfile?.role || 'student'} &bull; {userProfile?.isPaid ? 'Paid Member' : 'Free Access'}
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50 dark:bg-gray-950 transition-colors">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

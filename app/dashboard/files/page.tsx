'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import Link from 'next/link';
import {
  Search,
  FolderOpen,
  Download,
  Lock,
  Calendar,
  BookOpen,
  AlertCircle,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Circle,
} from 'lucide-react';

interface FacultyFile {
  id: string;
  title: string;
  subject: string;
  category: string;
  blobName: string;
  uploadedAt: string;
  isFreePreview?: boolean;
  views?: number;
}

type FileFilter = 'all' | 'bookmarked' | 'completed';
type ProfileListField = 'bookmarkedFiles' | 'completedFiles';
type StringListSetter = (ids: string[]) => void;

export default function FacultyFilesPage() {
  const { userProfile, firebaseUser, refreshProfile } = useAuth();
  const [files, setFiles] = useState<FacultyFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FileFilter>('all');
  // Seeded from the Firestore-backed profile; the page is only rendered once the profile has loaded.
  const [bookmarkedFiles, setBookmarkedFiles] = useState<string[]>(
    () => userProfile?.bookmarkedFiles ?? [],
  );
  const [completedFiles, setCompletedFiles] = useState<string[]>(
    () => userProfile?.completedFiles ?? [],
  );
  const [pendingFileId, setPendingFileId] = useState<string | null>(null);

  const canAccess = Boolean(userProfile?.isPaid || userProfile?.role === 'admin');

  useEffect(() => {
    async function fetchFiles() {
      try {
        const q = query(collection(db, 'facfiles'), orderBy('uploadedAt', 'desc'));
        const snapshot = await getDocs(q);
        const fetchedFiles = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as FacultyFile[];
        if (fetchedFiles.length === 0) {
          setFiles([
            { id: '1', title: 'Advanced Mathematics Notes', subject: 'Mathematics', category: 'Lecture Notes', blobName: 'math.pdf', uploadedAt: new Date().toISOString() },
          ]);
        } else {
          setFiles(fetchedFiles);
        }
      } catch (e) {
        console.error('Error fetching faculty files:', e);
        setFiles([
          { id: '1', title: 'Advanced Mathematics Notes', subject: 'Mathematics', category: 'Lecture Notes', blobName: 'math.pdf', uploadedAt: new Date().toISOString() },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchFiles();
  }, []);

  const handleDownload = async (file: FacultyFile) => {
    const isFreePreviewAccessible = !canAccess && file.isFreePreview === true;
    if (!canAccess && !isFreePreviewAccessible) return;

    try {
      setDownloadingId(file.id);
      const res = await fetch(`/api/sas?containerName=facfiles&blobName=${encodeURIComponent(file.blobName)}`);
      const data = await res.json();
      if (data.success && data.sasUrl) {
        window.open(data.sasUrl, '_blank', 'noopener,noreferrer');
        if (isFreePreviewAccessible) {
          try {
            await updateDoc(doc(db, 'facfiles', file.id), { views: (file.views ?? 0) + 1 });
          } catch (e) {
            console.error('Failed to increment views:', e);
          }
        }
      } else {
        alert(data.error || 'Failed to generate secure download link.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while getting the file download link.');
    } finally {
      setDownloadingId(null);
    }
  };

  const toggleProfileList = async (
    field: ProfileListField,
    fileId: string,
    currentIds: string[],
    setIds: StringListSetter,
  ) => {
    if (!firebaseUser) {
      alert('Please sign in to save your study progress.');
      return;
    }

    const isSaved = currentIds.includes(fileId);
    const nextIds = isSaved ? currentIds.filter((id) => id !== fileId) : [...currentIds, fileId];

    // Optimistic update so the card reacts instantly.
    setIds(nextIds);
    setPendingFileId(fileId);

    try {
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        [field]: isSaved ? arrayRemove(fileId) : arrayUnion(fileId),
      });
      await refreshProfile();
    } catch (err) {
      console.error(`Failed to update ${field}:`, err);
      setIds(currentIds);
      alert('Could not save your changes. Please try again.');
    } finally {
      setPendingFileId(null);
    }
  };

  const toggleBookmark = (fileId: string) =>
    toggleProfileList('bookmarkedFiles', fileId, bookmarkedFiles, setBookmarkedFiles);

  const toggleCompleted = (fileId: string) =>
    toggleProfileList('completedFiles', fileId, completedFiles, setCompletedFiles);

  const subjects = ['All', ...Array.from(new Set(files.map((f) => f.subject)))];
  const categories = ['All', ...Array.from(new Set(files.map((f) => f.category)))];

  const filterTabs: { key: FileFilter; label: string; count: number; icon: typeof FolderOpen }[] = [
    { key: 'all', label: 'All Files', count: files.length, icon: FolderOpen },
    { key: 'bookmarked', label: 'Bookmarked', count: files.filter((f) => bookmarkedFiles.includes(f.id)).length, icon: Bookmark },
    { key: 'completed', label: 'Completed', count: files.filter((f) => completedFiles.includes(f.id)).length, icon: CheckCircle2 },
  ];

  const filteredFiles = files.filter((file) => {
    const matchesSearch =
      file.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'All' || file.subject === selectedSubject;
    const matchesCategory = selectedCategory === 'All' || file.category === selectedCategory;
    const matchesFilter =
      activeFilter === 'all' ||
      (activeFilter === 'bookmarked' && bookmarkedFiles.includes(file.id)) ||
      (activeFilter === 'completed' && completedFiles.includes(file.id));
    return matchesSearch && matchesSubject && matchesCategory && matchesFilter;
  });

  const emptyStateTitle =
    activeFilter === 'bookmarked'
      ? 'No bookmarked files yet'
      : activeFilter === 'completed'
        ? 'No completed files yet'
        : 'No files found';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-950 dark:text-white tracking-tight">Faculty Files &amp; Study Materials</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Access secure study materials stored in Azure.</p>
        </div>
        {!canAccess && (
          <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 px-4 py-3 rounded-xl text-sm flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div>
              <span className="font-bold">Free Tier:</span> Download locked.{' '}
              <Link href="/dashboard/payments" className="underline font-semibold hover:text-amber-900 dark:hover:text-amber-200">Upgrade</Link>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col md:flex-row gap-4 items-center justify-between transition-colors">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or subject..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 outline-none">
            {subjects.map((s) => <option key={s} value={s}>Subject: {s}</option>)}
          </select>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 outline-none">
            {categories.map((c) => <option key={c} value={c}>Category: {c}</option>)}
          </select>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-gray-900 p-1.5 rounded-xl border border-gray-200 dark:border-gray-800 w-fit max-w-full shadow-sm transition-colors">
        {filterTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeFilter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveFilter(tab.key)}
              aria-pressed={isActive}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-800 transition-colors">
          <FolderOpen className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{emptyStateTitle}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {activeFilter === 'all'
              ? 'Try adjusting your search or filters.'
              : 'Save files or mark them as completed and they will appear here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFiles.map((file) => {
            const isBookmarked = bookmarkedFiles.includes(file.id);
            const isCompleted = completedFiles.includes(file.id);
            const isPending = pendingFileId === file.id;
            const isFreePreview = file.isFreePreview === true;
            const canOpen = canAccess || isFreePreview;

            return (
              <div
                key={file.id}
                className={`bg-white dark:bg-gray-900 rounded-2xl p-6 border shadow-sm hover:shadow-md transition flex flex-col justify-between ${
                  isCompleted
                    ? 'border-emerald-300 dark:border-emerald-500/40 ring-1 ring-emerald-200 dark:ring-emerald-500/20'
                    : 'border-gray-200 dark:border-gray-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400">{file.category}</span>
                      {isFreePreview && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" /> Free Sample
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleBookmark(file.id)}
                      disabled={isPending}
                      aria-pressed={isBookmarked}
                      aria-label={isBookmarked ? `Remove ${file.title} from bookmarks` : `Bookmark ${file.title}`}
                      title={isBookmarked ? 'Remove bookmark' : 'Bookmark this file'}
                      className={`p-2 rounded-xl border transition disabled:opacity-50 ${
                        isBookmarked
                          ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400'
                          : 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-200 dark:hover:border-amber-500/30'
                      }`}
                    >
                      {isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                    </button>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">{file.title}</h3>
                  <div className="flex items-center justify-between gap-2 text-xs text-gray-600 dark:text-gray-400 mb-4">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span className="font-medium">Subject:</span> {file.subject}
                    </span>
                    <span className="text-gray-400 dark:text-gray-500 flex items-center gap-1 whitespace-nowrap">
                      <Calendar className="h-3 w-3" />{new Date(file.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-mono truncate max-w-[140px]">{file.blobName}</span>
                    {canOpen ? (
                      <button onClick={() => handleDownload(file)} disabled={downloadingId === file.id} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center gap-1.5 shadow transition disabled:opacity-50">
                        {downloadingId === file.id ? (
                          <span className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-white"></span>
                        ) : (
                          <><Download className="h-3.5 w-3.5" />{canAccess ? 'View / Download' : 'Free Preview'}</>
                        )}
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-3 py-1.5 rounded-xl text-xs font-semibold"><Lock className="h-3.5 w-3.5" />Locked</div>
                    )}
                  </div>

                  {/* Study tools */}
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => toggleBookmark(file.id)}
                      disabled={isPending}
                      aria-pressed={isBookmarked}
                      className={`inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-xs font-semibold border transition disabled:opacity-50 ${
                        isBookmarked
                          ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-amber-300 dark:hover:border-amber-500/40 hover:text-amber-700 dark:hover:text-amber-400'
                      }`}
                    >
                      {isBookmarked ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
                      {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleCompleted(file.id)}
                      disabled={isPending}
                      aria-pressed={isCompleted}
                      className={`inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-xs font-semibold border transition disabled:opacity-50 ${
                        isCompleted
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-emerald-300 dark:hover:border-emerald-500/40 hover:text-emerald-700 dark:hover:text-emerald-400'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                      {isCompleted ? 'Completed ✓' : 'Mark as Completed ✓'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Image as ImageIcon } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  summary: string;
  content: string;
  coverBlobName?: string;
  author: string;
  createdAt: string;
}

export default function BlogPostPage() {
  const params = useParams();
  const id = params?.id as string;
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBlog() {
      if (!id) return;
      try {
        const docRef = doc(db, 'blogs', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as BlogPost;
          setBlog(data);
          if (data.coverBlobName) {
            const res = await fetch(`/api/sas?containerName=blogs&blobName=${encodeURIComponent(data.coverBlobName)}`);
            const resData = await res.json();
            if (resData.success && resData.sasUrl) {
              setCoverUrl(resData.sasUrl);
            }
          }
        } else {
          // Fallback mock blog if ID doesn't exist in Firestore
          setBlog({
            id,
            title: 'Welcome to MadeiApp Platform',
            summary: 'Discover how MadeiApp integrates Firebase and Azure Blob Storage.',
            content: 'MadeiApp is designed to provide secure faculty files, student payments, and informative blogs with enterprise-grade cloud storage integration. Azure Blob Storage ensures private blobs remain secure and accessible via short-lived SAS URLs.',
            coverBlobName: 'sample_cover.jpg',
            author: 'Admin Team',
            createdAt: new Date().toISOString(),
          });
          setCoverUrl('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80');
        }
      } catch (err) {
        console.error("Error fetching blog post:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Blog post not found</h2>
        <Link href="/dashboard/blogs" className="text-indigo-600 dark:text-indigo-400 font-medium underline">
          Back to Blogs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div>
        <Link href="/dashboard/blogs" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-indigo-600 transition mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Blogs
        </Link>

        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-950 dark:text-white tracking-tight mb-3">
          {blog.title}
        </h1>

        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 pb-4 border-b border-gray-200 dark:border-gray-800">
          <span className="flex items-center gap-1">
            <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            {blog.author}
          </span>
          <span>&bull;</span>
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            {new Date(blog.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Cover Image */}
      <div className="h-72 md:h-96 w-full rounded-2xl bg-gray-100 dark:bg-gray-800 overflow-hidden relative shadow-md flex items-center justify-center">
        {coverUrl ? (
          <img src={coverUrl} alt={blog.title} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center text-gray-400">
            <ImageIcon className="h-12 w-12 mb-2" />
            <span className="text-sm">Cover Image</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-10 shadow-sm border border-gray-200 dark:border-gray-800 space-y-6">
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300 leading-relaxed italic border-l-4 border-indigo-600 pl-4 py-1">
          {blog.summary}
        </p>

        <div className="text-gray-800 dark:text-gray-200 leading-relaxed space-y-4 whitespace-pre-line text-base">
          {blog.content}
        </div>
      </div>
    </div>
  );
}

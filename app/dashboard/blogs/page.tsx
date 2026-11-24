'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import Link from 'next/link';
import { FileText, Calendar, User, ArrowRight, Image as ImageIcon } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  summary: string;
  content: string;
  coverBlobName?: string;
  author: string;
  createdAt: string;
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [coverUrls, setCoverUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const fetchedBlogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BlogPost[];

        if (fetchedBlogs.length === 0) {
          setBlogs([
            {
              id: '1',
              title: 'Welcome to MadeiApp Platform',
              summary: 'Discover how MadeiApp integrates Firebase and Azure Blob Storage for seamless learning.',
              content: 'MadeiApp is designed to provide secure faculty files, student payments, and informative blogs with enterprise-grade cloud storage integration.',
              coverBlobName: 'sample_cover.jpg',
              author: 'Admin Team',
              createdAt: new Date().toISOString(),
            },
            {
              id: '2',
              title: 'Getting Started with Azure Blob Storage',
              summary: 'Learn how we securely manage study materials and payment receipts using containers.',
              content: 'Azure Blob Storage provides scalable, secure object storage. By utilizing SAS URLs, our platform ensures private blobs remain secure and accessible only to authorized members.',
              coverBlobName: 'azure_cover.jpg',
              author: 'Tech Lead',
              createdAt: new Date(Date.now() - 86400000).toISOString(),
            },
          ]);
        } else {
          setBlogs(fetchedBlogs);
        }
      } catch (err) {
        console.error("Error fetching blogs:", err);
        setBlogs([
          {
            id: '1',
            title: 'Welcome to MadeiApp Platform',
            summary: 'Discover how MadeiApp integrates Firebase and Azure Blob Storage for seamless learning.',
            content: 'MadeiApp is designed to provide secure faculty files, student payments, and informative blogs with enterprise-grade cloud storage integration.',
            coverBlobName: 'sample_cover.jpg',
            author: 'Admin Team',
            createdAt: new Date().toISOString(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchBlogs();
  }, []);

  // Fetch SAS URLs for cover blobs
  useEffect(() => {
    async function resolveCoverUrls() {
      const urls: Record<string, string> = {};
      for (const blog of blogs) {
        if (blog.coverBlobName) {
          try {
            const res = await fetch(`/api/sas?containerName=blogs&blobName=${encodeURIComponent(blog.coverBlobName)}`);
            const data = await res.json();
            if (data.success && data.sasUrl) {
              urls[blog.id] = data.sasUrl;
            }
          } catch (e) {
            console.error("Failed to resolve cover SAS URL for blog:", blog.id);
          }
        }
      }
      setCoverUrls(urls);
    }

    if (blogs.length > 0) {
      resolveCoverUrls();
    }
  }, [blogs]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-950 dark:text-white tracking-tight">Platform Blogs &amp; Announcements</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Read the latest articles, tutorials, and updates from the MadeiApp team.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : blogs.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-800">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">No blog posts found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <div key={blog.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between">
              <div>
                {/* Cover Image / Placeholder */}
                <div className="h-48 w-full bg-gray-100 dark:bg-gray-800 relative overflow-hidden flex items-center justify-center">
                  {coverUrls[blog.id] ? (
                    <img
                      src={coverUrls[blog.id]}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <ImageIcon className="h-10 w-10 mb-1" />
                      <span className="text-xs">Loading Cover...</span>
                    </div>
                  )}
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {blog.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-2">{blog.title}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{blog.summary}</p>
                </div>
              </div>

              <div className="p-6 pt-0">
                <Link
                  href={`/dashboard/blogs/${blog.id}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-600 hover:text-white text-indigo-600 dark:text-indigo-400 font-medium text-sm transition flex items-center justify-center gap-2"
                >
                  <span>Read Article</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

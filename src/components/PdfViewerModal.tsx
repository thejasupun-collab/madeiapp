'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PdfViewerModal({ file }: { file: any }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md transform transition-transform duration-300 ease-in-out" onClick={() => setOpen(false)}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{file.title || 'PDF'}</h2>
          <span className="text-sm text-gray-500">{file.blobName || 'PDF'}</span>
        </div>
        <div className="border border-gray-200 pt-4 space-y-4">
          <div>
            <p className="text-sm text-gray-600">Subject:</p>
            <p>{file.subject || ''}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Category:</p>
            <p>{file.category || ''}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg text-indigo-600 hover:text-indigo-700">Close</button>
        </div>
      </div>
    </div>
  );
}

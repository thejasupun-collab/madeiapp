'use client';

import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

export default function ActivePathLabel() {
  const pathname = usePathname();
  const segment = pathname?.split('/').filter(Boolean).pop() || 'Home';

  return (
    <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
      <span>Dashboard</span>
      <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
      <span className="text-gray-900 dark:text-gray-100 capitalize">{segment}</span>
    </div>
  );
}

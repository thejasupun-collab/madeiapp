'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderOpen,
  FileText,
  CreditCard,
  ShieldCheck,
  Star,
} from 'lucide-react';

export default function DashboardNav({
  role,
  onNavigate,
}: {
  role?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard Home', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Faculty Files', href: '/dashboard/files', icon: FolderOpen },
    { name: 'Blogs', href: '/dashboard/blogs', icon: FileText },
    { name: 'My Reviews', href: '/dashboard/reviews', icon: Star },
    { name: 'Payments', href: '/dashboard/payments', icon: CreditCard },
  ];

  if (role === 'admin') {
    navItems.push({ name: 'Admin Panel', href: '/dashboard/admin', icon: ShieldCheck });
  }

  return (
    <nav className="flex-1 px-4 py-6 space-y-1.5 text-sm font-medium overflow-y-auto">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center px-4 py-3 rounded-xl transition group ${
              isActive
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/50'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Icon
              className={`h-5 w-5 mr-3 ${
                isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
              }`}
            />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}

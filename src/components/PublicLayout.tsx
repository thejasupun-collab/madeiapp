import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';

export default function PublicLayout({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200 dark:from-gray-950 dark:via-gray-950 dark:to-slate-900 transition-colors ${className}`}
    >
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}

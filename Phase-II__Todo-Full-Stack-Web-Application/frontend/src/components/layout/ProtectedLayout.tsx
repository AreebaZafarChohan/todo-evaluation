// T029: Protected layout with sidebar and header
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';
import { FiHome, FiCheckSquare, FiSettings, FiMenu, FiX, FiLogOut } from 'react-icons/fi';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

interface User {
  id: string;
  email: string;
  name?: string;
}

interface Session {
  user: User;
  token: string;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    // Check for stored session on component mount
    const storedToken = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setSession({ user, token: storedToken });
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        // If parsing fails, redirect to sign in
        router.push('/signin');
      }
    } else {
      router.push('/signin');
    }
  }, [router]);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: <FiHome className="w-5 h-5" /> },
    { name: 'Tasks', href: '/tasks', icon: <FiCheckSquare className="w-5 h-5" /> },
    { name: 'Settings', href: '/settings', icon: <FiSettings className="w-5 h-5" /> },
  ];

  const handleLogout = async () => {
    // Clear stored session
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    router.push('/signin');
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 border-4 border-[var(--primary-500)] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-[var(--muted-foreground)]">Redirecting to login...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[var(--background)]">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={prefersReducedMotion ? {} : { x: -280 }}
        animate={{ x: 0 }}
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-[var(--card-bg)] border-r border-[var(--card-border)]',
          'transform transition-transform duration-300 ease-in-out',
          'lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--card-border)]">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] flex items-center justify-center">
              <FiCheckSquare className="text-white" />
            </div>
            <span className="text-xl font-bold text-[var(--foreground)]">TodoApp</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                    'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/50',
                    pathname === item.href && 'text-[var(--primary-500)] bg-[var(--primary-500)]/10'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-[var(--card-border)]">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] flex items-center justify-center">
              <span className="text-white font-medium">
                {session.user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">
                {session.user?.name || session.user?.email}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                {session.user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-[var(--error)]/10 text-[var(--error)] hover:bg-[var(--error)]/20 transition-colors"
          >
            <FiLogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-[var(--card-bg)] border-b border-[var(--card-border)]">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] lg:hidden"
            >
              <FiMenu className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] flex items-center justify-center">
                <FiCheckSquare className="text-white" />
              </div>
              <h1 className="text-xl font-bold text-[var(--foreground)] capitalize">
                {pathname?.split('/')[1] || 'Dashboard'}
              </h1>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
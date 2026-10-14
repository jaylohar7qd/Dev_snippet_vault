'use client';

import { SnippetStoreProvider } from '@/lib/store';
import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { SearchCommand } from '@/components/ui/SearchCommand';
import { Toast } from '@/components/ui/Toast';
import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
const [user, setUser] = useState<{
  id: string;
  name: string;
  email: string;
} | null>(null);
const [isAuthLoading, setIsAuthLoading] = useState(true);
const [authError, setAuthError] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  useEffect(() => {
  const controller = new AbortController();

  const loadUser = async () => {
    try {
      const token = sessionStorage.getItem('token');

      if (!token) {
        router.replace('/login');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        throw new Error('Backend URL is missing. Restart the frontend.');
      }

      const response = await fetch(`${apiUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });

      if (response.status === 401) {
        sessionStorage.removeItem('token');
        router.replace('/login');
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Could not load your account.');
      }

      if (!data.user) {
        throw new Error('The response did not contain user details.');
      }

      setUser(data.user);
    } catch (error) {
      if (!controller.signal.aborted) {
        setAuthError(
          error instanceof Error ? error.message : 'Could not load your account.'
        );
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsAuthLoading(false);
      }
    }
  };

  void loadUser();
  return () => controller.abort();
}, [router]);

if (isAuthLoading) {
  return <div className="p-8 text-sm">Loading your account...</div>;
}

if (authError) {
  return (
    <div role="alert" className="p-8 text-sm text-red-500">
      {authError}
    </div>
  );
}

if (!user) {
  return null;
}

  return (
    <SnippetStoreProvider>
      <div className="flex h-screen overflow-hidden" style={{ background: 'var(--background)' }}>
        {/* Desktop Sidebar */}
        <Suspense fallback={<div className="hidden lg:flex w-[260px] h-screen" style={{ background: 'var(--surface)' }} />}>
         <Sidebar
  userName={user.name}
  userEmail={user.email}
  mobile
  onClose={() => setMobileSidebarOpen(false)}
/>
        </Suspense>

        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <div
              className="absolute inset-0"
              style={{ background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(2px)' }}
            />
            <div
              className="absolute left-0 top-0 bottom-0 animate-slide-in-right"
              style={{ width: 260 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Suspense fallback={null}>
               <Sidebar userName={user.name} userEmail={user.email} />
              </Suspense>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
          <main className="flex-1 overflow-y-auto" style={{ background: 'var(--background)' }}>
            <Suspense fallback={<div className="p-8 text-sm" style={{ color: 'var(--foreground-muted)' }}>Loading...</div>}>
              {children}
            </Suspense>
          </main>
        </div>
      </div>

      {/* Overlays */}
      <SearchCommand />
      <Toast />
    </SnippetStoreProvider>
  );
}

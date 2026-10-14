'use client';

import { Search, Bell, Command, Menu } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useDashboardUser } from '@/lib/dashboard-user';

interface DashboardHeaderProps {
  onToggleMobileSidebar?: () => void;
}

export function DashboardHeader({ onToggleMobileSidebar }: DashboardHeaderProps) {
  const user = useDashboardUser();

  const handleSearchClick = () => {
    // Dispatch Ctrl+K
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
  };

  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-4 px-4 lg:px-6"
      style={{
        height: 60,
        background: 'var(--surface)',
        borderBottom: '1px solid var(--surface-border)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {/* Mobile menu toggle */}
      <button
        className="btn-ghost lg:hidden"
        onClick={onToggleMobileSidebar}
        style={{ padding: 8 }}
        aria-label="Toggle sidebar"
      >
        <Menu size={20} />
      </button>

      {/* Search */}
      <button
        onClick={handleSearchClick}
        className="flex items-center gap-3 flex-1 max-w-lg"
        style={{
          padding: '8px 14px',
          background: 'var(--background-secondary)',
          border: '1px solid var(--surface-border)',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
        }}
      >
        <Search size={16} style={{ color: 'var(--foreground-muted)', flexShrink: 0 }} />
        <span style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem', flex: 1, textAlign: 'left' }}>
          Search snippets, code, tags...
        </span>
        <div className="hidden sm:flex items-center gap-1">
          <kbd
            style={{
              fontSize: '0.65rem',
              padding: '2px 5px',
              borderRadius: 4,
              background: 'var(--surface)',
              border: '1px solid var(--surface-border)',
              color: 'var(--foreground-muted)',
            }}
          >
            <Command size={10} style={{ display: 'inline' }} />
          </kbd>
          <kbd
            style={{
              fontSize: '0.65rem',
              padding: '2px 5px',
              borderRadius: 4,
              background: 'var(--surface)',
              border: '1px solid var(--surface-border)',
              color: 'var(--foreground-muted)',
            }}
          >
            K
          </kbd>
        </div>
      </button>

      <div className="flex items-center gap-1 ml-auto">
        {/* Notifications */}
        <button
          className="btn-ghost relative"
          style={{ padding: 8, width: 40, height: 40 }}
          title="Notifications"
        >
          <Bell size={18} />
          <span
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: 'var(--accent)',
            }}
          />
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Avatar */}
        <div
          className="flex items-center justify-center font-bold cursor-pointer ml-1"
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
            color: 'white',
            fontSize: '0.8rem',
          }}
          title={user?.name ?? 'Profile'}
        >
          {user?.name.trim().charAt(0).toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
}

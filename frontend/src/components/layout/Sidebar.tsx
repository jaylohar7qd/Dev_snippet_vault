'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Plus,
  Star,
  Tag,
  Settings,
  LogOut,
  Code2,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  userName?: string;
  userEmail?: string;
  mobile?: boolean;
  onClose?: () => void;
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/new', label: 'New Snippet', icon: Plus },
  { href: '/dashboard/favorites', label: 'Favorites', icon: Star },
  { href: '/dashboard/tags', label: 'Tags', icon: Tag },
  { href: '/dashboard/collections', label: 'Collections', icon: FolderOpen },
];

const bottomItems = [
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ userName, userEmail, mobile, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    localStorage.removeItem('snippetvault_snippets');
    localStorage.removeItem('snippetvault_collections');
    router.replace('/login');
  };

  return (
    <aside
      id="dashboard-sidebar"
      className={`${mobile ? 'flex' : 'hidden lg:flex'} flex-col h-screen sticky top-0 transition-all duration-300 z-50`}
      style={{
        width: collapsed ? 72 : 260,
        background: 'var(--surface)',
        borderRight: '1px solid var(--surface-border)',
        padding: collapsed ? '16px 8px' : '16px',
      }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between mb-6" style={{ padding: collapsed ? '0 4px' : '0 4px' }}>
        {!collapsed && (userName || userEmail) && (
          <Link href="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
            <div
              className="flex items-center justify-center"
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
              }}
            >
              <Code2 size={18} color="white" />
            </div>
            <span className="font-bold gradient-text" style={{ fontSize: '1rem' }}>
              SnippetVault
            </span>
          </Link>
        )}
        <button
          id="sidebar-collapse-btn"
          className="btn-ghost"
          onClick={() => setCollapsed(!collapsed)}
          style={{ padding: 6, marginLeft: collapsed ? 'auto' : undefined, marginRight: collapsed ? 'auto' : undefined }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onClose?.()}
              id={`sidebar-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              className="flex items-center gap-3 transition-all duration-200"
              style={{
                padding: collapsed ? '10px' : '10px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'var(--accent-glow)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--foreground-secondary)',
                fontWeight: isActive ? 600 : 400,
                fontSize: '0.875rem',
                textDecoration: 'none',
                border: isActive ? '1px solid rgba(230, 126, 34, 0.2)' : '1px solid transparent',
              }}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={20} />
              {!collapsed && <span>{item.label}</span>}
              {isActive && item.href === '/dashboard/new' && !collapsed && (
                <span
                  className="ml-auto"
                  style={{
                    background: 'var(--accent)',
                    color: 'white',
                    padding: '1px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                  }}
                >
                  NEW
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="flex flex-col gap-1">
        <div style={{ borderTop: '1px solid var(--surface-border)', margin: '8px 0' }} />
        {bottomItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onClose?.()}
              className="flex items-center gap-3 transition-all duration-200"
              style={{
                padding: collapsed ? '10px' : '10px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'var(--accent-glow)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--foreground-secondary)',
                fontSize: '0.875rem',
                textDecoration: 'none',
              }}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}

        <button
          id="sidebar-logout-btn"
          onClick={handleLogout}
          className="flex items-center gap-3 transition-all duration-200"
          style={{
            padding: collapsed ? '10px' : '10px 12px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: 'var(--radius-md)',
            background: 'transparent',
            color: 'var(--error)',
            fontSize: '0.875rem',
            cursor: 'pointer',
            border: 'none',
            width: '100%',
          }}
          title={collapsed ? 'Log Out' : undefined}
        >
          <LogOut size={20} />
          {!collapsed && <span>Log Out</span>}
        </button>

        {/* User Info */}
        {!collapsed && (
          <div
            className="mt-2 flex items-center gap-3"
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--background-secondary)',
            }}
          >
            <div
              className="flex items-center justify-center font-bold"
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
                color: 'white',
                fontSize: '0.85rem',
                flexShrink: 0,
              }}
            >
              {userName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>
                {userName || 'User'}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--foreground-muted)' }}>
                {userEmail}
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

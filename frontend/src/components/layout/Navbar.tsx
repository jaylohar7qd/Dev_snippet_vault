'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '../ui/ThemeToggle';
import {
  Code2,
  Menu,
  X,
  LogIn,
  LayoutDashboard,
  Sparkles,
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface NavbarProps {
  isAuthenticated?: boolean;
  userName?: string;
}

export function Navbar({ isAuthenticated = false, userName }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isDashboard = pathname?.startsWith('/dashboard');

  return (
    <nav
      id="main-navbar"
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? 'var(--surface)'
          : 'transparent',
        borderBottom: scrolled ? '1px solid var(--surface-border)' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        boxShadow: scrolled ? 'var(--shadow-sm)' : 'none',
      }}
    >
      <div
        className="mx-auto flex items-center justify-between"
        style={{ maxWidth: 1280, padding: '12px 24px' }}
      >
        {/* Logo */}
        <Link
          href="/"
          id="navbar-logo"
          className="flex items-center gap-2.5 group"
          style={{ textDecoration: 'none' }}
        >
          <div
            className="flex items-center justify-center"
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
              transition: 'all var(--transition-base)',
              boxShadow: '0 2px 8px var(--accent-glow)',
            }}
          >
            <Code2 size={20} color="white" />
          </div>
          <span
            className="font-bold gradient-text"
            style={{ fontSize: '1.15rem', letterSpacing: '-0.01em' }}
          >
            SnippetVault
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {!isDashboard && (
            <>
              <NavLink href="/#features" label="Features" />
              <NavLink href="/#how-it-works" label="How It Works" />
            </>
          )}

          {isAuthenticated ? (
            <>
              <NavLink href="/dashboard" label="Dashboard" icon={<LayoutDashboard size={16} />} active={pathname === '/dashboard'} />
              <div className="flex items-center gap-2 ml-3">
                <ThemeToggle />
                <div
                  className="flex items-center gap-2 px-3 py-1.5"
                  style={{
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--surface-hover)',
                    border: '1px solid var(--surface-border)',
                  }}
                >
                  <div
                    className="flex items-center justify-center font-semibold"
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
                      color: 'white',
                      fontSize: '0.75rem',
                    }}
                  >
                    {userName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                    {userName || 'User'}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 ml-3">
              <ThemeToggle />
              <Link href="/login" id="nav-login-btn" className="btn-ghost" style={{ fontSize: '0.875rem' }}>
                <LogIn size={16} />
                Log In
              </Link>
              <Link href="/signup" id="nav-signup-btn" className="btn-primary" style={{ fontSize: '0.875rem', padding: '8px 20px' }}>
                <Sparkles size={16} />
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            id="mobile-menu-toggle"
            className="btn-ghost"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            style={{ padding: 8 }}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className="md:hidden animate-slide-down"
          style={{
            background: 'var(--surface)',
            borderTop: '1px solid var(--surface-border)',
            padding: '16px 24px',
          }}
        >
          <div className="flex flex-col gap-2">
            {!isDashboard && (
              <>
                <MobileNavLink href="/#features" label="Features" onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink href="/#how-it-works" label="How It Works" onClick={() => setMobileMenuOpen(false)} />
              </>
            )}
            {isAuthenticated ? (
              <MobileNavLink
                href="/dashboard"
                label="Dashboard"
                onClick={() => setMobileMenuOpen(false)}
              />
            ) : (
              <>
                <MobileNavLink href="/login" label="Log In" onClick={() => setMobileMenuOpen(false)} />
                <div style={{ paddingTop: 8 }}>
                  <Link
                    href="/signup"
                    className="btn-primary w-full"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ textDecoration: 'none' }}
                  >
                    <Sparkles size={16} />
                    Get Started Free
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className="btn-ghost"
      style={{
        color: active ? 'var(--accent)' : undefined,
        textDecoration: 'none',
        fontSize: '0.875rem',
      }}
    >
      {icon}
      {label}
    </Link>
  );
}

function MobileNavLink({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block py-2.5 px-3 rounded-lg transition-colors"
      style={{
        color: 'var(--foreground)',
        textDecoration: 'none',
        fontSize: '0.95rem',
      }}
    >
      {label}
    </Link>
  );
}

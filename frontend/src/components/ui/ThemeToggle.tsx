'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="btn-ghost" aria-label="Toggle theme" style={{ width: 40, height: 40 }}>
        <div className="skeleton" style={{ width: 20, height: 20, borderRadius: '50%' }} />
      </button>
    );
  }

  return (
    <button
      id="theme-toggle"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="btn-ghost relative overflow-hidden"
      style={{ width: 40, height: 40, padding: 0 }}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <div className="relative" style={{ width: 20, height: 20 }}>
        <Sun
          size={20}
          style={{
            position: 'absolute',
            inset: 0,
            transition: 'all 0.3s ease',
            transform: theme === 'dark' ? 'rotate(0deg) scale(1)' : 'rotate(90deg) scale(0)',
            opacity: theme === 'dark' ? 1 : 0,
            color: 'var(--accent)',
          }}
        />
        <Moon
          size={20}
          style={{
            position: 'absolute',
            inset: 0,
            transition: 'all 0.3s ease',
            transform: theme === 'light' ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0)',
            opacity: theme === 'light' ? 1 : 0,
            color: 'var(--accent)',
          }}
        />
      </div>
    </button>
  );
}

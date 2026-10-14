'use client';

import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import {
  Code2,
  Search,
  ArrowRight,
  FolderOpen,
  Layers,
  Terminal,
  Star,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: 'var(--background)' }}>
      <div className="noise-overlay" />

      {/* Background glow effects */}
      <div
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full pointer-events-none animate-pulse-glow"
        style={{ background: 'var(--accent-glow-strong)', filter: 'blur(140px)' }}
      />
      <div
        className="absolute top-[40%] right-[-10%] w-[45%] h-[45%] rounded-full pointer-events-none"
        style={{ background: 'rgba(34, 211, 238, 0.08)', filter: 'blur(140px)' }}
      />
      <div
        className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] rounded-full pointer-events-none"
        style={{ background: 'var(--accent-glow)', filter: 'blur(120px)' }}
      />

      {/* Main Navigation */}
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-32 pb-20 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-6 animate-slide-down">
          <Code2 size={15} style={{ color: 'var(--accent)' }} />
          <span className="text-xs font-semibold tracking-wide" style={{ color: 'var(--foreground)' }}>
            A PERSONAL CODE SNIPPET VAULT
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight max-w-5xl animate-slide-up stagger-1">
          Your Developer <br className="hidden sm:inline" />
          <span className="gradient-text">Snippet Vault</span>
        </h1>

        <p className="text-base sm:text-xl mb-10 max-w-3xl leading-relaxed animate-slide-up stagger-2" style={{ color: 'var(--foreground-muted)' }}>
          Save, organize, and retrieve your mission-critical code snippets, configs, and architectural patterns.
          Add your own tags and collections, then find saved code with instant search.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 animate-slide-up stagger-3">
          <Link
            href="/dashboard"
            className="btn-primary text-base px-8 py-3.5 flex items-center gap-2 shadow-lg hover:shadow-orange-500/20"
          >
            Launch Web Vault <ArrowRight size={18} />
          </Link>
          <Link
            href="/signup"
            className="btn-secondary text-base px-8 py-3.5 flex items-center gap-2"
          >
            Create Free Account
          </Link>
        </div>

        {/* Features Section */}
        <section id="features" className="w-full max-w-6xl mx-auto py-12 scroll-mt-24">
          <div className="text-center mb-16">
            <span
              className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
              style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}
            >
              Core Capabilities
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold mt-4 mb-4" style={{ color: 'var(--foreground)' }}>
              Built for High-Velocity Engineering
            </h2>
            <p className="text-base max-w-2xl mx-auto" style={{ color: 'var(--foreground-muted)' }}>
              Everything developers need to capture knowledge, eliminate repeated searches, and write better code.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            <FeatureCard
              icon={<Code2 style={{ color: 'var(--accent)' }} size={24} />}
              title="Smart Code Vault"
              description="Organize code snippets across 30+ languages with multi-theme syntax highlighting, collections, and line counts."
            />
            <FeatureCard
              icon={<Layers style={{ color: '#a855f7' }} size={24} />}
              title="Collections & Tags"
              description="Organize snippets with your own tags and project collections."
            />
            <FeatureCard
              icon={<Star style={{ color: 'var(--info)' }} size={24} />}
              title="Favorites"
              description="Mark important snippets so they are easy to find again."
            />
            <FeatureCard
              icon={<Search style={{ color: 'var(--success)' }} size={24} />}
              title="Developer Search"
              description="Blazing fast full-text and tag-based search with global command palette shortcuts (Ctrl+K or Cmd+K)."
            />
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full max-w-6xl mx-auto py-16 scroll-mt-24">
          <div className="text-center mb-16">
            <span
              className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
              style={{ background: 'rgba(34, 211, 238, 0.15)', color: 'var(--info)' }}
            >
              Workflow
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold mt-4 mb-4" style={{ color: 'var(--foreground)' }}>
              How SnippetVault Works
            </h2>
            <p className="text-base max-w-2xl mx-auto" style={{ color: 'var(--foreground-muted)' }}>
              From clipboard to structured knowledge in four seamless steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            <StepCard
              step="01"
              icon={<Terminal size={20} />}
              title="Save or Paste Code"
              description="Paste any snippet, API call, regex, SQL query, or Docker script and choose its language."
            />
            <StepCard
              step="02"
              icon={<Layers size={20} />}
              title="Add Tags & Details"
              description="Describe each snippet and add tags to make it easier to find."
            />
            <StepCard
              step="03"
              icon={<FolderOpen size={20} />}
              title="Organize & Star"
              description="Group snippets into custom project collections, bookmark favorites, or toggle public sharing."
            />
            <StepCard
              step="04"
              icon={<Search size={20} />}
              title="Instant Retrieval"
              description="Hit Ctrl+K anywhere in the app to find and copy any snippet in milliseconds without leaving the keyboard."
            />
          </div>
        </section>

        {/* Call to Action Banner */}
        <section className="w-full max-w-5xl mx-auto mt-12 mb-16">
          <div
            className="glass-card text-center p-12 sm:p-16 relative overflow-hidden"
            style={{
              borderRadius: 'var(--radius-xl)',
              background: 'linear-gradient(135deg, rgba(230, 126, 34, 0.12), rgba(245, 158, 11, 0.05))',
              border: '1px solid rgba(230, 126, 34, 0.25)',
            }}
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4" style={{ color: 'var(--foreground)' }}>
              Never Rewrite the Same Code Twice
            </h2>
            <p className="text-base max-w-xl mx-auto mb-8" style={{ color: 'var(--foreground-muted)' }}>
              Keep your frequently used code organized, searchable, and ready to reuse.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="btn-primary text-base px-8 py-3.5 flex items-center gap-2"
              >
                Get Started Now <ArrowRight size={18} />
              </Link>
              <Link
                href="/login"
                className="btn-secondary text-base px-8 py-3.5"
              >
                Sign In to Vault
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        className="relative z-10 py-12 px-6 border-t"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--surface-border)',
        }}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center"
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
              }}
            >
              <Code2 size={18} color="white" />
            </div>
            <span className="font-bold text-base gradient-text">SnippetVault</span>
          </div>

          <div className="flex items-center gap-6 text-xs" style={{ color: 'var(--foreground-muted)' }}>
            <Link href="/#features" className="hover:text-[var(--foreground)] transition-colors">
              Features
            </Link>
            <Link href="/#how-it-works" className="hover:text-[var(--foreground)] transition-colors">
              How It Works
            </Link>
            <Link href="/dashboard" className="hover:text-[var(--foreground)] transition-colors">
              Dashboard
            </Link>
            <Link href="/login" className="hover:text-[var(--foreground)] transition-colors">
              Sign In
            </Link>
          </div>

          <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
            © 2025 SnippetVault. Developer code, organized.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div
      className="glass-card flex flex-col items-start transition-all duration-300 hover:-translate-y-1"
      style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}
    >
      <div
        className="flex items-center justify-center mb-4"
        style={{
          width: 44,
          height: 44,
          borderRadius: 'var(--radius-md)',
          background: 'var(--surface-hover)',
          border: '1px solid var(--surface-border)',
        }}
      >
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--foreground)' }}>
        {title}
      </h3>
      <p className="text-xs leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
        {description}
      </p>
    </div>
  );
}

function StepCard({
  step,
  icon,
  title,
  description,
}: {
  step: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div
      className="glass-card flex flex-col items-start transition-all duration-300 hover:-translate-y-1"
      style={{ padding: '24px', borderRadius: 'var(--radius-lg)', position: 'relative' }}
    >
      <div className="flex items-center justify-between w-full mb-4">
        <div
          className="flex items-center justify-center"
          style={{
            width: 38,
            height: 38,
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-glow)',
            color: 'var(--accent)',
          }}
        >
          {icon}
        </div>
        <span className="font-mono text-xs font-bold" style={{ color: 'var(--foreground-muted)' }}>
          {step}
        </span>
      </div>
      <h3 className="text-base font-bold mb-2" style={{ color: 'var(--foreground)' }}>
        {title}
      </h3>
      <p className="text-xs leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
        {description}
      </p>
    </div>
  );
}

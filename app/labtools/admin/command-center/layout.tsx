'use client';

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getAdminPassword, setAdminPassword } from '@/lib/admin/adminFetch';
import {
  BarChart3,
  Activity,
  MessageSquare,
  Users,
  Server,
  Zap,
  ArrowLeft,
  Lock,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  ChevronRight,
} from 'lucide-react';

// ─── Refresh Context ────────────────────────────────────────────────
interface RefreshContextValue {
  autoRefresh: boolean;
  setAutoRefresh: (v: boolean) => void;
  refreshKey: number;
  triggerRefresh: () => void;
  intervalMs: number;
}

const RefreshContext = createContext<RefreshContextValue>({
  autoRefresh: false,
  setAutoRefresh: () => {},
  refreshKey: 0,
  triggerRefresh: () => {},
  intervalMs: 30000,
});

export function useCommandCenterRefresh() {
  return useContext(RefreshContext);
}

// ─── Nav Items ──────────────────────────────────────────────────────
const NAV_ITEMS = [
  { path: '/labtools/admin/command-center', label: 'Overview', icon: BarChart3, exact: true },
  { path: '/labtools/admin/command-center/field-engines', label: 'Field Engines', icon: Activity },
  { path: '/labtools/admin/command-center/conversations', label: 'Conversations', icon: MessageSquare },
  { path: '/labtools/admin/command-center/members', label: 'Members', icon: Users },
  { path: '/labtools/admin/command-center/system', label: 'System', icon: Server },
  { path: '/labtools/admin/command-center/actions', label: 'Actions', icon: Zap },
];

// ─── Auth Gate ──────────────────────────────────────────────────────
function AuthGate({ onAuth }: { onAuth: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        // Single admin client path: store the password (validated above) for
        // adminFetch() to inject as x-admin-password. Retires maia_admin_token.
        setAdminPassword(password);
        onAuth();
      } else {
        setError('Invalid password');
      }
    } catch {
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 w-full max-w-sm"
      >
        <div className="flex items-center gap-3 mb-6">
          <Lock className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-gray-100">Command Center</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 mb-4"
            autoFocus
          />
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-black font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Enter'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Layout ─────────────────────────────────────────────────────────
export default function CommandCenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const intervalMs = 30000;

  // Check existing auth
  useEffect(() => {
    if (getAdminPassword()) setAuthenticated(true);
    setCheckingAuth(false);
  }, []);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => {
      setRefreshKey((k) => k + 1);
    }, intervalMs);
    return () => clearInterval(id);
  }, [autoRefresh, intervalMs]);

  const triggerRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <RefreshCw className="w-6 h-6 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (!authenticated) {
    return <AuthGate onAuth={() => setAuthenticated(true)} />;
  }

  return (
    <RefreshContext.Provider value={{ autoRefresh, setAutoRefresh, refreshKey, triggerRefresh, intervalMs }}>
      <div className="min-h-screen bg-black flex">
        {/* Sidebar */}
        <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-zinc-800">
            <h1 className="text-lg font-bold text-amber-500">Command Center</h1>
            <p className="text-xs text-gray-500 mt-1">Platform Stewardship</p>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = item.exact
                ? pathname === item.path
                : pathname?.startsWith(item.path);
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-400 font-medium'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-zinc-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                  {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-zinc-800 space-y-3">
            {/* Auto-refresh toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="w-full flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200"
            >
              {autoRefresh ? (
                <ToggleRight className="w-5 h-5 text-amber-500" />
              ) : (
                <ToggleLeft className="w-5 h-5" />
              )}
              <span>Auto-refresh</span>
              {autoRefresh && (
                <span className="text-xs text-gray-500 ml-auto">30s</span>
              )}
            </button>

            {/* Manual refresh */}
            <button
              onClick={triggerRefresh}
              className="w-full flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh now</span>
            </button>

            {/* Back */}
            <button
              onClick={() => router.push('/labtools/admin')}
              className="w-full flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 pt-2 border-t border-zinc-800"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Admin</span>
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="p-6"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </RefreshContext.Provider>
  );
}

'use client';

import { useState, useCallback } from 'react';
import { Menu } from 'lucide-react';
import { SacredCompass } from './SacredCompass';
import { DirectionalPanel } from './DirectionalPanel';
import { CompassState, NavigationHint } from '@/types/extensions';
import { DirectionalPanel as PanelDirection, getEnabledExtensions, getPanelContent } from '@/lib/extensions/registry';
import { useExtensionConfig } from '@/hooks/useExtensionConfig';

interface SacredSpaceLayoutProps {
  userId: string;
  children: React.ReactNode; // MAIA conversation goes here
}

/**
 * Sacred Space Layout
 *
 * Main layout component that provides:
 * - Sacred center space for MAIA conversation (uncluttered)
 * - Minimal top bar with menu
 * - Sacred Compass for phenomenological navigation
 * - Directional panels that slide in when needed
 */
export function SacredSpaceLayout({ userId, children }: SacredSpaceLayoutProps) {
  const { config } = useExtensionConfig(userId);
  const [compassState, setCompassState] = useState<CompassState>({
    currentPanel: 'center',
    suggestions: [],
    available: ['right', 'left', 'up', 'down'], // Will be computed from enabled extensions
  });
  const [hints, setHints] = useState<NavigationHint[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  // Compute which directions have content based on enabled extensions
  const availableDirections: PanelDirection[] = (() => {
    if (!config) return [];

    const userConfig = Object.fromEntries(
      Object.entries(config.extensions || {}).map(([id, cfg]) => [id, cfg.enabled])
    );

    const directions: Set<PanelDirection> = new Set();

    (['right', 'left', 'up', 'down'] as PanelDirection[]).forEach(direction => {
      const content = getPanelContent(direction, userConfig);
      if (content.length > 0) {
        directions.add(direction);
      }
    });

    return Array.from(directions);
  })();

  const handleNavigate = useCallback((direction: PanelDirection | 'center') => {
    setCompassState(prev => ({
      ...prev,
      previousPanel: prev.currentPanel,
      currentPanel: direction,
    }));
  }, []);

  const handleClosePanel = useCallback(() => {
    handleNavigate('center');
  }, [handleNavigate]);

  return (
    <div className="h-screen w-screen bg-black text-white overflow-hidden">
      {/* Minimal Top Bar */}
      <header className="h-14 border-b border-white/10 flex items-center justify-between px-4">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors text-white/70 hover:text-white"
          aria-label="Menu"
        >
          <Menu size={20} />
        </button>

        <h1 className="text-sm font-serif text-white/60">Spiralogic</h1>

        <div className="w-10" /> {/* Spacer for symmetry */}
      </header>

      {/* Sacred Center Space - MAIA Conversation */}
      <main className="h-[calc(100vh-3.5rem)] overflow-hidden">
        {children}
      </main>

      {/* Sacred Compass */}
      <SacredCompass
        state={{
          ...compassState,
          available: availableDirections,
        }}
        onNavigate={handleNavigate}
        hints={hints}
      />

      {/* Directional Panels */}
      {(['right', 'left', 'up', 'down'] as PanelDirection[]).map(direction => (
        <DirectionalPanel
          key={direction}
          direction={direction}
          isOpen={compassState.currentPanel === direction}
          onClose={handleClosePanel}
          userId={userId}
        />
      ))}

      {/* Menu Dropdown */}
      {menuOpen && (
        <div className="absolute top-14 left-4 z-50">
          <div
            className="fixed inset-0"
            onClick={() => setMenuOpen(false)}
          />
          <div className="relative bg-black/95 border border-white/20 rounded-lg shadow-2xl min-w-[200px] py-2">
            <MenuLink href="/settings">Settings</MenuLink>
            <MenuLink href="/settings/extensions">Extensions</MenuLink>
            <MenuLink href="/account">Account</MenuLink>
            <MenuLink href="/community">Community</MenuLink>
            <div className="h-px bg-white/10 my-2" />
            <MenuLink href="/help">Help & Support</MenuLink>
            <MenuLink href="/api/auth/signout">Sign Out</MenuLink>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="block px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
    >
      {children}
    </a>
  );
}

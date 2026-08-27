'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import {
  ChevronLeft,
  Loader2,
  Menu,
  X,
  MessageSquare,
  LayoutGrid,
  Users,
  Calendar,
  GripVertical,
  LogOut,
} from 'lucide-react';
import { TeamContextProvider } from '@/components/studio/TeamContextProvider';
import { TeamSwitcher } from '@/components/studio/TeamSwitcher';
import { RecordingContextProvider } from '@/lib/studio/RecordingContext';
import { RecordingBanner } from '@/components/studio/RecordingBanner';
import { NavigationGuard } from '@/components/studio/NavigationGuard';
import { MaiaBoundaryLayout } from '@/components/maia/MaiaBoundaryLayout';
import { RAIL_WIDTH_PX } from '@/lib/navigation/maiaNav';
import { apiFetch } from '@/lib/http/apiBase';
import { getLocalMemberId } from '@/lib/auth/getLocalMemberId';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import {
  getVisibleModules,
  MODULE_DEFINITIONS,
  type PortalType,
  type ModuleSlug,
  type ModuleDefinition,
  type ModuleCategory,
} from '@/lib/studio/moduleDefinitions';
import type { StudioMode } from '@/hooks/useStudioData';
import { useTeamContext } from '@/hooks/useStudioData';

/**
 * Watches studioMode from TeamContext and calls back when it changes.
 * Must be rendered inside TeamContextProvider.
 */
function StudioModeWatcher({
  onModeChange,
}: {
  onModeChange: (mode: StudioMode) => void;
}) {
  const { studioMode } = useTeamContext();

  useEffect(() => {
    onModeChange(studioMode);
  }, [studioMode, onModeChange]);

  return null;
}

// Bottom tab bar — the practitioner's day-one working set: orient, coordinate, people, sessions.
const MOBILE_TABS = [
  { slug: 'command_center', label: 'Home', icon: LayoutGrid, href: '/studio' },
  { slug: 'teams', label: 'Co-lab', icon: MessageSquare, href: '/team' },
  { slug: 'clients', label: 'Clients', icon: Users, href: '/studio/clients' },
  { slug: 'sessions', label: 'Sessions', icon: Calendar, href: '/studio/sessions' },
] as const;

// Draggable nav row for the Personal Field sidebar. The Link stays fully
// clickable (navigation must never break); only the grip handle starts a drag
// (dragListener=false + dragControls). Order is local/per-device.
// Default order for the movable region of the Personal sidebar, used until the
// person reorders. Frequently-entered surfaces near the top — MAIA is a primary
// interaction surface, not just a tool — then fully reorderable. Slugs not
// listed fall back to module-definition order at the end. (If the default order
// is the layout a non-reordering user keeps, it should be intentional, not
// inherited from MODULE_DEFINITIONS order.)
const DEFAULT_PERSONAL_NAV_ORDER = ['maia', 'decisions', 'changes', 'tasks', 'calendar', 'media', 'scribe'];

function DraggableNavItem({
  mod,
  isActive,
  onNavigate,
}: {
  mod: ModuleDefinition;
  isActive: boolean;
  onNavigate?: () => void;
}) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={mod}
      dragListener={false}
      dragControls={controls}
      as="div"
      className="group relative flex items-center"
    >
      <Link
        href={mod.href}
        onClick={onNavigate}
        className={`
          flex-1 flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm
          ${isActive
            ? 'bg-amber-500/20 text-amber-400'
            : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}
        `}
      >
        <mod.icon className="w-4 h-4 flex-shrink-0" />
        <span className="truncate">{mod.label}</span>
      </Link>
      <button
        type="button"
        aria-label={`Reorder ${mod.label}`}
        onPointerDown={(e) => controls.start(e)}
        className="px-1 py-2 text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing opacity-50 group-hover:opacity-100 transition-opacity touch-none"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>
    </Reorder.Item>
  );
}

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width: 767px)');

  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [checkingPractitioner, setCheckingPractitioner] = useState(true);
  const [isPractitioner, setIsPractitioner] = useState(false);
  const [visibleModules, setVisibleModules] = useState<ModuleDefinition[]>(MODULE_DEFINITIONS);
  const [initialStudioMode, setInitialStudioMode] = useState<StudioMode>('practice');
  const [portalTypeRef, setPortalTypeRef] = useState<PortalType>('generalist');
  const [enabledModulesRef, setEnabledModulesRef] = useState<ModuleSlug[] | null>(null);
  const studioModeRef = useRef<StudioMode>('practice');
  const [currentMode, setCurrentMode] = useState<StudioMode>('practice');
  const [practitionerName, setPractitionerName] = useState<string | null>(null);
  const [coLabName, setCoLabName] = useState<string | null>(null);
  const [coLabRole, setCoLabRole] = useState<string | null>(null);
  // Personal Field sidebar order — local, per-device navigation comfort only.
  const [personalOrder, setPersonalOrder] = useState<string[]>([]);

  // Skip practitioner check on /studio/create page
  const isCreatePage = pathname === '/studio/create';

  // Check if user is a practitioner and load their modules
  useEffect(() => {
    if (isCreatePage) {
      setCheckingPractitioner(false);
      return;
    }

    const memberId = getLocalMemberId();
    if (!memberId) {
      router.replace('/signin');
      return;
    }

    async function checkPractitioner() {
      try {
        const response = await apiFetch('/api/studio/whoami');
        const data = await response.json();

        if (data.isPractitioner) {
          setIsPractitioner(true);
          setPractitionerName(data.identity?.name ?? null);
          setCoLabName(data.identity?.coLabName ?? null);
          setCoLabRole(data.identity?.coLabRole ?? null);

          // Resolve visible modules from identity
          const portalType = (data.identity?.portalType ?? 'generalist') as PortalType;
          const enabledModules = data.identity?.enabledModules as ModuleSlug[] | null;
          const serverMode = (data.identity?.studioMode ?? 'practice') as StudioMode;

          setPortalTypeRef(portalType);
          setEnabledModulesRef(enabledModules);
          setInitialStudioMode(serverMode);
          studioModeRef.current = serverMode;
          setCurrentMode(serverMode);
          setVisibleModules(getVisibleModules(enabledModules, portalType, serverMode));

          // Personal-mode users who land on /studio go to /studio/field
          if (serverMode === 'personal' && pathname === '/studio') {
            router.replace('/studio/field');
            return;
          }
        } else {
          router.replace('/studio/create');
          return;
        }
      } catch {
        router.replace('/studio/create');
        return;
      } finally {
        setCheckingPractitioner(false);
      }
    }

    checkPractitioner();
  }, [isCreatePage, router, pathname]);

  // Callback for StudioModeWatcher — re-filters nav when mode changes
  const handleModeChange = useCallback((mode: StudioMode) => {
    studioModeRef.current = mode;
    setCurrentMode(mode);
    if (isPractitioner) {
      setVisibleModules(getVisibleModules(enabledModulesRef, portalTypeRef, mode));
    }
  }, [isPractitioner, enabledModulesRef, portalTypeRef]);

  // Listen for module-save events from settings page → refresh sidebar live
  useEffect(() => {
    function onModulesUpdated(e: Event) {
      const detail = (e as CustomEvent<ModuleSlug[]>).detail;
      if (!Array.isArray(detail)) return;
      setEnabledModulesRef(detail);
      setVisibleModules(getVisibleModules(detail, portalTypeRef, studioModeRef.current));
    }
    window.addEventListener('studio:modules-updated', onModulesUpdated);
    return () => window.removeEventListener('studio:modules-updated', onModulesUpdated);
  }, [portalTypeRef]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const dayName = currentTime.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const timeStr = currentTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  // Current section title for mobile top bar
  const currentSection = useMemo(() => {
    const match = visibleModules.find(
      (mod) => mod.href !== '/studio' && pathname?.startsWith(mod.href)
    );
    return match?.label ?? 'Studio';
  }, [visibleModules, pathname]);

  // ── Personal Field nav order — local, per-device "navigation comfort" only.
  //    Field stays pinned at top; the tools below it are drag-reorderable.
  //    localStorage only: no schema, no API, no cross-device assumptions.
  useEffect(() => {
    if (currentMode !== 'personal') return;
    try {
      const raw = localStorage.getItem(`studio:fieldNavOrder:${getLocalMemberId() ?? 'anon'}`);
      const saved = raw ? JSON.parse(raw) : [];
      setPersonalOrder(Array.isArray(saved) ? saved.filter((s) => typeof s === 'string') : []);
    } catch {
      setPersonalOrder([]);
    }
  }, [currentMode]);

  // Reorderable middle = the Personal sidebar minus the pinned Field (top) and
  // Settings (bottom), sorted by the saved local order (unknown slugs append).
  const personalMiddle = useMemo(() => {
    const middle = visibleModules.filter((m) => m.slug !== 'field' && m.slug !== 'settings');
    // Saved order if the person has reordered; otherwise a sensible default
    // (frequently-entered surfaces near the top), not raw definition order.
    const order = personalOrder.length > 0 ? personalOrder : DEFAULT_PERSONAL_NAV_ORDER;
    const rank = (slug: string) => {
      const i = order.indexOf(slug);
      return i === -1 ? Number.MAX_SAFE_INTEGER : i;
    };
    return [...middle].sort((a, b) => rank(a.slug) - rank(b.slug));
  }, [visibleModules, personalOrder]);

  const handlePersonalReorder = (newOrder: ModuleDefinition[]) => {
    const slugs = newOrder.map((m) => m.slug);
    setPersonalOrder(slugs);
    try {
      localStorage.setItem(`studio:fieldNavOrder:${getLocalMemberId() ?? 'anon'}`, JSON.stringify(slugs));
    } catch {
      /* navigation comfort is best-effort; ignore storage failures */
    }
  };

  // Show loading while checking practitioner status
  if (checkingPractitioner && !isCreatePage) {
    return (
      <MaiaBoundaryLayout boundary="studio" railRecede ownsMobileNav>
      <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          <p className="text-slate-400">Loading Studio...</p>
        </div>
      </div>
      </MaiaBoundaryLayout>
    );
  }

  // Create page gets minimal layout (no sidebar)
  if (isCreatePage) {
    return (
      <MaiaBoundaryLayout boundary="studio" railRecede ownsMobileNav>
      <div className="min-h-screen bg-[#1a1a2e]">
        {children}
      </div>
      </MaiaBoundaryLayout>
    );
  }

  // ─── Nav link renderer (shared by sidebar and drawer) ─────
  const renderNavLink = (mod: ModuleDefinition, onClick?: () => void, collapsed = false) => {
    const isActive = pathname === mod.href ||
      (mod.href !== '/studio' && pathname?.startsWith(mod.href));

    return (
      <Link
        key={mod.href}
        href={mod.href}
        onClick={onClick}
        title={collapsed ? mod.label : undefined}
        className={`
          flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm
          ${isActive
            ? 'bg-amber-500/20 text-amber-400'
            : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}
        `}
      >
        <mod.icon className="w-4 h-4 flex-shrink-0" />
        {!collapsed && <span className="truncate">{mod.label}</span>}
      </Link>
    );
  };

  // ─── Grouped nav — surface the category metadata that already exists in
  //     moduleDefinitions instead of a flat list. Co-lab (collaboration) sits
  //     near the top; Settings is pinned to the bottom. ───────────────────────
  const NAV_GROUPS: { cat: ModuleCategory; label: string }[] = [
    { cat: 'core', label: '' },                       // Command Center, MAIA — no header
    { cat: 'collaboration', label: 'Collaboration' }, // Co-lab — promoted near the top
    { cat: 'clients', label: 'Clients' },
    { cat: 'operations', label: 'Operations' },
    { cat: 'tools', label: 'Tools' },
  ];
  const renderGroupedNav = (collapsed: boolean, onNavigate?: () => void) => {
    const settings = visibleModules.find((m) => m.slug === 'settings');

    // ── Personal Field: flat + reorderable. Field pinned at top (the return
    //    floor, non-draggable), Settings pinned at bottom, everything between
    //    drag-reorderable (local per-device order). Practice keeps the grouped
    //    nav below. The floor, the four questions, and the experiment are
    //    untouched — this is navigation comfort, not field composition.
    if (currentMode === 'personal') {
      const field = visibleModules.find((m) => m.slug === 'field');
      const isActive = (mod: ModuleDefinition) =>
        pathname === mod.href || (mod.href !== '/studio' && (pathname?.startsWith(mod.href) ?? false));
      return (
        <>
          {field && renderNavLink(field, onNavigate, collapsed)}
          {collapsed ? (
            <div className="space-y-0.5 mt-0.5">
              {personalMiddle.map((m) => renderNavLink(m, onNavigate, true))}
            </div>
          ) : (
            <Reorder.Group
              axis="y"
              values={personalMiddle}
              onReorder={handlePersonalReorder}
              as="div"
              className="space-y-0.5 mt-0.5"
            >
              {personalMiddle.map((m) => (
                <DraggableNavItem key={m.slug} mod={m} isActive={isActive(m)} onNavigate={onNavigate} />
              ))}
            </Reorder.Group>
          )}
          {settings && (
            <div className="mt-2 pt-2 border-t border-slate-800/50 space-y-0.5">
              {renderNavLink(settings, onNavigate, collapsed)}
            </div>
          )}
        </>
      );
    }

    return (
      <>
        {NAV_GROUPS.map(({ cat, label }) => {
          const mods = visibleModules.filter((m) => m.category === cat && m.slug !== 'settings');
          if (mods.length === 0) return null;
          return (
            <div key={cat} className="mb-1">
              {!collapsed && label && (
                <div className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                  {label}
                </div>
              )}
              <div className="space-y-0.5">
                {mods.map((m) => renderNavLink(m, onNavigate, collapsed))}
              </div>
            </div>
          );
        })}
        {settings && (
          <div className="mt-2 pt-2 border-t border-slate-800/50 space-y-0.5">
            {renderNavLink(settings, onNavigate, collapsed)}
          </div>
        )}
      </>
    );
  };

  // ─── MOBILE LAYOUT ────────────────────────────────────────
  if (isMobile) {
    return (
      <MaiaBoundaryLayout boundary="studio" railRecede ownsMobileNav>
      <TeamContextProvider initialStudioMode={initialStudioMode}>
      <StudioModeWatcher onModeChange={handleModeChange} />
      <RecordingContextProvider>
      <NavigationGuard />
      <div className="min-h-screen bg-[#1a1a2e] flex flex-col">
        {/* Top bar */}
        <div className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-800/50 bg-[#16162a]/95 backdrop-blur-sm px-3 py-2.5">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-800/50 hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5">
              <Image
                src="/logo_flower 2.png"
                alt="Soullab"
                width={20}
                height={20}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-sm font-medium text-white">{currentSection}</span>
          </div>
          <div className="w-9" /> {/* Spacer for centering */}
        </div>

        {/* Drawer overlay */}
        <AnimatePresence>
          {drawerOpen && (
            <div className="fixed inset-0 z-[60]">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60"
                onClick={() => setDrawerOpen(false)}
              />
              {/* Drawer panel */}
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                // The MAIA rail is desktop-only (MaiaBoundaryLayout), so on a
                // phone this drawer starts at the edge. It used to be inset by
                // the rail width, which is now 56px of nothing.
                className="absolute top-0 left-0 h-full w-[280px] bg-[#16162a] border-r border-slate-800/50 flex flex-col"
                style={{ maxWidth: 'calc(100vw - 8px)' }}
              >
                {/* Drawer header */}
                <div className="p-4 border-b border-slate-800/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7">
                        <Image
                          src="/logo_flower 2.png"
                          alt="Soullab"
                          width={28}
                          height={28}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <span className="font-semibold text-white">Studio</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDrawerOpen(false)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800/50 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-3">
                    <div className="text-[10px] text-slate-500 tracking-wider">{dayName}</div>
                    <div className="text-2xl font-light text-white">{timeStr}</div>
                  </div>
                </div>

                {/* Team Switcher */}
                <div className="px-2 py-2">
                  <TeamSwitcher collapsed={false} />
                </div>

                {/* Nav — grouped by category */}
                <nav className="flex-1 min-h-0 px-2 py-2 overflow-y-auto scrollbar-hide">
                  {renderGroupedNav(false, () => setDrawerOpen(false))}
                </nav>

                {/* Identity + Sign out */}
                <div className="px-2 pb-3 border-t border-slate-800/50">
                  {practitionerName && (
                    <div className="px-2 pt-2 pb-1 space-y-0.5">
                      <div className="text-xs font-medium text-slate-300 truncate">{practitionerName}</div>
                      {coLabRole && <div className="text-[10px] text-slate-500 capitalize truncate">{coLabRole}</div>}
                      {coLabName && <div className="text-[10px] text-amber-500/70 truncate">{coLabName}</div>}
                    </div>
                  )}
                  <Link
                    href="/signout"
                    className="flex items-center gap-2 w-full px-2 py-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800/50 transition-colors"
                  >
                    <LogOut className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs">Sign out</span>
                  </Link>
                </div>

              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Content */}
        <main className="flex-1 min-h-0 font-sans">
          <RecordingBanner />
          {children}
        </main>

        {/* Bottom tab bar */}
        <div className="sticky bottom-0 z-50 grid grid-cols-4 border-t border-slate-800/50 bg-[#16162a]/95 backdrop-blur-sm">
          {MOBILE_TABS.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = pathname?.startsWith(tab.href);

            return (
              <Link
                key={tab.slug}
                href={tab.href}
                className={`
                  flex flex-col items-center gap-0.5 py-2.5 text-[10px] transition-colors
                  ${isActive
                    ? 'text-amber-400'
                    : 'text-slate-500 active:text-slate-300'}
                `}
              >
                <TabIcon className="w-5 h-5" />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
      </RecordingContextProvider>
      </TeamContextProvider>
      </MaiaBoundaryLayout>
    );
  }

  // ─── DESKTOP LAYOUT ───────────────────────────────────────
  return (
    <MaiaBoundaryLayout boundary="studio" railRecede ownsMobileNav>
    <TeamContextProvider initialStudioMode={initialStudioMode}>
    <StudioModeWatcher onModeChange={handleModeChange} />
    <RecordingContextProvider>
    <NavigationGuard />
    <div className="min-h-screen bg-[#1a1a2e] flex">
      {/* Studio sidebar — offset by MAIA rail width */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 64 : 200 }}
        className="fixed top-0 h-full bg-[#16162a] border-r border-slate-800/50 flex flex-col z-50"
        style={{ left: RAIL_WIDTH_PX }}
      >
        {/* Header with Logo and Time */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 flex-shrink-0">
              <Image
                src="/logo_flower 2.png"
                alt="Soullab"
                width={28}
                height={28}
                className="w-full h-full object-contain"
              />
            </div>
            {!collapsed && <span className="font-semibold text-white">Studio</span>}
            {!collapsed && (
              <button
                onClick={() => setCollapsed(true)}
                className="ml-auto p-1 rounded hover:bg-slate-800 text-slate-500"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>
          {!collapsed && (
            <div className="mt-3">
              <div className="text-[10px] text-slate-500 tracking-wider">{dayName}</div>
              <div className="text-2xl font-light text-white">{timeStr}</div>
            </div>
          )}
        </div>

        {/* Team Switcher */}
        <div className="px-2 pb-2">
          <TeamSwitcher collapsed={collapsed} />
        </div>

        {/* Nav Items — grouped by category */}
        <nav className="flex-1 min-h-0 px-2 py-2 overflow-y-auto scrollbar-hide">
          {renderGroupedNav(collapsed)}
        </nav>


        {/* Identity + Sign out */}
        <div className="px-2 pb-2 border-t border-slate-800/50">
          {!collapsed && practitionerName && (
            <div className="px-2 pt-2 pb-1 space-y-0.5">
              <div className="text-xs font-medium text-slate-300 truncate">{practitionerName}</div>
              {coLabRole && <div className="text-[10px] text-slate-500 capitalize truncate">{coLabRole}</div>}
              {coLabName && <div className="text-[10px] text-amber-500/70 truncate">{coLabName}</div>}
            </div>
          )}
          <Link
            href="/signout"
            className="flex items-center gap-2 w-full px-2 py-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800/50 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span className="text-xs">Sign out</span>}
          </Link>
        </div>

        {/* Expand button when collapsed */}
        {collapsed && (
          <div className="p-2">
            <button
              onClick={() => setCollapsed(false)}
              className="w-full p-2 rounded-lg hover:bg-slate-800 text-slate-500"
            >
              <ChevronLeft className="w-4 h-4 rotate-180 mx-auto" />
            </button>
          </div>
        )}
      </motion.aside>

      {/* Main Content — offset by Studio sidebar width (MAIA rail offset handled by boundary layout) */}
      <main
        className="flex-1 font-sans transition-all duration-300"
        style={{ marginLeft: collapsed ? 64 : 200 }}
      >
        <RecordingBanner />
        {children}
      </main>
    </div>
    </RecordingContextProvider>
    </TeamContextProvider>
    </MaiaBoundaryLayout>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { TeamContextProvider } from '@/components/studio/TeamContextProvider';
import { TeamSwitcher } from '@/components/studio/TeamSwitcher';
import { RecordingContextProvider } from '@/lib/studio/RecordingContext';
import { RecordingBanner } from '@/components/studio/RecordingBanner';
import { NavigationGuard } from '@/components/studio/NavigationGuard';
import { apiFetch } from '@/lib/http/apiBase';
import { getLocalMemberId } from '@/lib/auth/getLocalMemberId';
import {
  getVisibleModules,
  MODULE_DEFINITIONS,
  type PortalType,
  type ModuleSlug,
  type ModuleDefinition,
} from '@/lib/studio/moduleDefinitions';

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [checkingPractitioner, setCheckingPractitioner] = useState(true);
  const [isPractitioner, setIsPractitioner] = useState(false);
  const [visibleModules, setVisibleModules] = useState<ModuleDefinition[]>(MODULE_DEFINITIONS);

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

          // Resolve visible modules from identity
          const portalType = (data.identity?.portalType ?? 'generalist') as PortalType;
          const enabledModules = data.identity?.enabledModules as ModuleSlug[] | null;
          setVisibleModules(getVisibleModules(enabledModules, portalType));
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
  }, [isCreatePage, router]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dayName = currentTime.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const timeStr = currentTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  // Show loading while checking practitioner status
  if (checkingPractitioner && !isCreatePage) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          <p className="text-slate-400">Loading Studio...</p>
        </div>
      </div>
    );
  }

  // Create page gets minimal layout (no sidebar)
  if (isCreatePage) {
    return (
      <div className="min-h-screen bg-[#1a1a2e]">
        {children}
      </div>
    );
  }

  return (
    <TeamContextProvider>
    <RecordingContextProvider>
    <NavigationGuard />
    <div className="min-h-screen bg-[#1a1a2e] flex">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 64 : 200 }}
        className="fixed left-0 top-0 h-full bg-[#16162a] border-r border-slate-800/50 flex flex-col z-50"
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

        {/* Nav Items - dynamically rendered from enabled modules */}
        <nav className="flex-1 min-h-0 px-2 py-2 space-y-0.5 overflow-y-auto scrollbar-hide">
          {visibleModules.map((mod) => {
            const isActive = pathname === mod.href ||
              (mod.href !== '/studio' && pathname?.startsWith(mod.href));

            return (
              <Link
                key={mod.href}
                href={mod.href}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm
                  ${isActive
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}
                `}
              >
                <mod.icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span>{mod.label}</span>}
              </Link>
            );
          })}
        </nav>

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

      {/* Main Content */}
      <main
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: collapsed ? 64 : 200 }}
      >
        <RecordingBanner />
        {children}
      </main>
    </div>
    </RecordingContextProvider>
    </TeamContextProvider>
  );
}

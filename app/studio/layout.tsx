'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutGrid,
  Users,
  Calendar,
  CalendarDays,
  CheckSquare,
  Package,
  MessageSquare,
  Lock,
  MonitorPlay,
  Code2,
  Sparkles,
  Settings,
  ChevronLeft,
  Camera,
  Megaphone,
  FolderOpen,
  Loader2,
  Briefcase,
  Wrench,
} from 'lucide-react';
import { TeamContextProvider } from '@/components/studio/TeamContextProvider';
import { TeamSwitcher } from '@/components/studio/TeamSwitcher';
import { apiFetch } from '@/lib/http/apiBase';
import { getLocalMemberId } from '@/lib/auth/getLocalMemberId';

const navItems = [
  { href: '/studio', icon: LayoutGrid, label: 'Command Center' },
  { href: '/studio/clients', icon: Users, label: 'Clients' },
  { href: '/studio/groups', icon: FolderOpen, label: 'Groups' },
  { href: '/studio/sessions', icon: Calendar, label: 'Sessions' },
  { href: '/studio/caseload', icon: Briefcase, label: 'Caseload' },
  { href: '/studio/services', icon: Package, label: 'Services' },
  { href: '/studio/calendar', icon: CalendarDays, label: 'Calendar' },
  { href: '/studio/tasks', icon: CheckSquare, label: 'Tasks' },
  { href: '/studio/comms', icon: MessageSquare, label: 'Communications' },
  { href: '/studio/marketing', icon: Megaphone, label: 'Marketing' },
  { href: '/studio/vault', icon: Lock, label: 'Vault' },
  { href: '/studio/media', icon: MonitorPlay, label: 'Media Studio' },
  { href: '/studio/camera', icon: Camera, label: 'Live Camera' },
  { href: '/studio/code', icon: Code2, label: 'Code Sessions' },
  { href: '/studio/teams', icon: Users, label: 'Teams' },
  { href: '/studio/maia', icon: Sparkles, label: 'MAIA' },
  { href: '/studio/tools', icon: Wrench, label: 'Tools' },
  { href: '/studio/settings', icon: Settings, label: 'Settings' },
];

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

  // Skip practitioner check on /studio/create page
  const isCreatePage = pathname === '/studio/create';

  // Check if user is a practitioner
  useEffect(() => {
    if (isCreatePage) {
      setCheckingPractitioner(false);
      return;
    }

    const memberId = getLocalMemberId();
    if (!memberId) {
      // No member ID - redirect to sign in
      router.replace('/signin');
      return;
    }

    async function checkPractitioner() {
      try {
        const response = await apiFetch('/api/studio/whoami');
        const data = await response.json();

        if (data.isPractitioner) {
          setIsPractitioner(true);
        } else {
          // Not a practitioner - redirect to create
          router.replace('/studio/create');
          return;
        }
      } catch {
        // Error checking - assume not practitioner
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

        {/* Nav Items */}
        <nav className="flex-1 px-2 py-2 space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/studio' && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm
                  ${isActive
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}
                `}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
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
        {children}
      </main>
    </div>
    </TeamContextProvider>
  );
}

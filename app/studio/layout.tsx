'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';
import { TeamContextProvider } from '@/components/studio/TeamContextProvider';
import { TeamSwitcher } from '@/components/studio/TeamSwitcher';

const navItems = [
  { href: '/studio', icon: LayoutGrid, label: 'Command Center' },
  { href: '/studio/clients', icon: Users, label: 'Clients' },
  { href: '/studio/groups', icon: FolderOpen, label: 'Groups' },
  { href: '/studio/sessions', icon: Calendar, label: 'Sessions' },
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
  { href: '/studio/settings', icon: Settings, label: 'Settings' },
];

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

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

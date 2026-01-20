"use client";

/**
 * STELLIUM LAYOUT
 *
 * The container for the practitioner's sanctuary
 * Provides navigation and context for all Stellium pages
 */

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Brain,
  Settings,
  ChevronLeft,
  Menu,
  X,
  TrendingUp,
} from 'lucide-react';
import { Holoflower } from '@/components/ui/Holoflower';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

const navItems: NavItem[] = [
  { path: '/stellium', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { path: '/stellium/clients', label: 'Clients', icon: <Users className="w-5 h-5" /> },
  { path: '/stellium/sessions', label: 'Sessions', icon: <Calendar className="w-5 h-5" /> },
  { path: '/stellium/persona', label: 'MAIA Persona', icon: <Brain className="w-5 h-5" /> },
  { path: '/stellium/marketing', label: 'Marketing', icon: <TrendingUp className="w-5 h-5" />, badge: 'PRO' },
  { path: '/stellium/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
];

export default function StelliumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (path: string) => {
    if (path === '/stellium') {
      return pathname === '/stellium';
    }
    return pathname?.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <Holoflower size="sm" animate={false} glowIntensity="low" />
            <span className="text-lg font-light text-gray-200">Stellium</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-400 hover:text-gray-200"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: mobileMenuOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 20 }}
        className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-64 bg-gray-900 border-r border-gray-800"
      >
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <Holoflower size="sm" animate={false} glowIntensity="low" />
            <span className="text-lg font-light text-gray-200">Stellium</span>
          </div>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map(item => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-sacred-gold/10 text-sacred-gold'
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-gradient-to-r from-sacred-gold/30 to-amber-500/30 text-sacred-gold rounded">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </motion.div>

      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:flex fixed left-0 top-0 bottom-0 z-40 flex-col bg-gray-900/50 backdrop-blur-xl border-r border-gray-800/50 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sacred-gold/20 to-amber-600/20 flex items-center justify-center border border-sacred-gold/20">
                <Holoflower size="sm" animate={false} glowIntensity="low" />
              </div>
              {sidebarOpen && (
                <span className="text-lg font-light text-gray-200">Stellium</span>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              <ChevronLeft
                className={`w-5 h-5 transition-transform ${sidebarOpen ? '' : 'rotate-180'}`}
              />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(item => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                isActive(item.path)
                  ? 'bg-sacred-gold/10 text-sacred-gold border border-sacred-gold/20'
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
              } ${sidebarOpen ? '' : 'justify-center'}`}
              title={!sidebarOpen ? item.label : undefined}
            >
              <div className={`flex items-center space-x-3 ${sidebarOpen ? '' : 'space-x-0'}`}>
                {item.icon}
                {sidebarOpen && <span>{item.label}</span>}
              </div>
              {sidebarOpen && item.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-gradient-to-r from-sacred-gold/30 to-amber-500/30 text-sacred-gold rounded">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800/50">
          {sidebarOpen ? (
            <p className="text-xs text-gray-600 text-center">
              Not software. A sanctuary.
            </p>
          ) : (
            <div className="w-2 h-2 rounded-full bg-sacred-gold/50 mx-auto" />
          )}
        </div>
      </div>

      {/* Main Content */}
      <main
        className={`min-h-screen transition-all duration-300 ${
          sidebarOpen ? 'lg:pl-64' : 'lg:pl-20'
        } pt-16 lg:pt-0`}
      >
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

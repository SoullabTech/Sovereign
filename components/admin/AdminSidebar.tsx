"use client";

/**
 * ADMIN SIDEBAR
 *
 * Navigation sidebar for the practitioner admin portal
 * Cosmic starlight design with collapsible navigation
 */

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  FileText,
  TrendingUp,
  Share2,
  ShoppingBag,
  Brain,
  Settings,
  HelpCircle,
  ChevronLeft,
  Sparkles,
  Star,
} from 'lucide-react';
import type { Practitioner } from '@/lib/stellium/types';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

const navItems: NavItem[] = [
  { path: '', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { path: '/clients', label: 'Clients', icon: <Users className="w-5 h-5" /> },
  { path: '/sessions', label: 'Sessions', icon: <Calendar className="w-5 h-5" /> },
  { path: '/messages', label: 'Messages', icon: <MessageSquare className="w-5 h-5" /> },
  { path: '/content', label: 'Content', icon: <FileText className="w-5 h-5" /> },
  { path: '/marketing', label: 'Marketing', icon: <TrendingUp className="w-5 h-5" />, badge: 'PRO' },
  { path: '/social', label: 'Social', icon: <Share2 className="w-5 h-5" /> },
  { path: '/commerce', label: 'Commerce', icon: <ShoppingBag className="w-5 h-5" /> },
  { path: '/persona', label: 'AI Persona', icon: <Brain className="w-5 h-5" /> },
  { path: '/faq', label: 'FAQ', icon: <HelpCircle className="w-5 h-5" /> },
  { path: '/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
];

interface AdminSidebarProps {
  slug: string;
  practitioner: Practitioner;
  isOpen: boolean;
  onToggle: () => void;
  basePath?: string;
}

export function AdminSidebar({ slug, practitioner, isOpen, onToggle, basePath: basePathProp }: AdminSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  // Use provided basePath or default to portal path for subdomain routing
  const basePath = basePathProp || `/portal/${slug}/admin`;

  const isActive = (path: string) => {
    const fullPath = `${basePath}${path}`;
    if (path === '') {
      return pathname === basePath || pathname === `${basePath}/`;
    }
    return pathname?.startsWith(fullPath);
  };

  const colors = {
    void: '#0D0B14',
    cosmos: '#1A1625',
    nebula: '#251F33',
    stardust: '#2D2640',
    gold: '#E5C158',
    violet: '#B8A5D9',
    starlight: '#FFFFFF',
    muted: '#C8BDE0',
    dim: '#9A8FB8',
  };

  return (
    <div
      className={`fixed left-0 top-0 bottom-0 z-40 flex flex-col backdrop-blur-xl border-r transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
      style={{
        backgroundColor: `${colors.cosmos}E6`,
        borderColor: colors.stardust,
      }}
    >
      {/* Logo / Brand */}
      <div className="p-4 border-b" style={{ borderColor: colors.stardust }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center border"
              style={{
                background: `linear-gradient(135deg, ${colors.gold}30 0%, ${colors.violet}30 100%)`,
                borderColor: `${colors.gold}40`,
              }}
            >
              <Star className="w-5 h-5" style={{ color: colors.gold }} />
            </div>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col"
              >
                <span className="font-medium" style={{ color: colors.starlight }}>
                  {practitioner.brand?.name || practitioner.name}
                </span>
                <span className="text-xs" style={{ color: colors.dim }}>
                  Admin Portal
                </span>
              </motion.div>
            )}
          </div>
          <button
            onClick={onToggle}
            className="p-2 rounded-lg transition-colors hover:bg-white/5"
            style={{ color: colors.dim }}
          >
            <ChevronLeft
              className={`w-5 h-5 transition-transform ${isOpen ? '' : 'rotate-180'}`}
            />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => router.push(`${basePath}${item.path}`)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                isOpen ? '' : 'justify-center'
              }`}
              style={{
                backgroundColor: active ? `${colors.gold}15` : 'transparent',
                color: active ? colors.gold : colors.muted,
                border: active ? `1px solid ${colors.gold}30` : '1px solid transparent',
              }}
              title={!isOpen ? item.label : undefined}
            >
              <div className={`flex items-center space-x-3 ${isOpen ? '' : 'space-x-0'}`}>
                {item.icon}
                {isOpen && <span className="text-sm">{item.label}</span>}
              </div>
              {isOpen && item.badge && (
                <span
                  className="px-1.5 py-0.5 text-[10px] font-medium rounded"
                  style={{
                    background: `linear-gradient(135deg, ${colors.gold}40 0%, ${colors.violet}40 100%)`,
                    color: colors.gold,
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t" style={{ borderColor: colors.stardust }}>
        {isOpen ? (
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4" style={{ color: colors.gold }} />
            <p className="text-xs" style={{ color: colors.dim }}>
              Powered by Soullab
            </p>
          </div>
        ) : (
          <div
            className="w-2 h-2 rounded-full mx-auto"
            style={{ backgroundColor: `${colors.gold}60` }}
          />
        )}
      </div>
    </div>
  );
}

export default AdminSidebar;

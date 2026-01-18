"use client";

/**
 * PRACTITIONER ADMIN LAYOUT
 *
 * The container for the practitioner's admin sanctuary
 * Cosmic starlight design with responsive sidebar navigation
 *
 * Note: This layout is nested under /portal/[slug]/ but the parent
 * portal layout detects /admin routes and passes through without
 * applying public portal chrome (header, footer, chat widget).
 */

import React, { useState, useEffect } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Star } from 'lucide-react';
import { PractitionerAuthProvider, usePractitionerAuth } from '@/lib/auth/practitionerAuth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

// Cosmic color palette
const colors = {
  void: '#0D0B14',
  cosmos: '#1A1625',
  nebula: '#251F33',
  stardust: '#2D2640',
  starlight: '#FFFFFF',
  gold: '#E5C158',
  violet: '#B8A5D9',
  muted: '#C8BDE0',
  dim: '#9A8FB8',
};

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const slug = params.slug as string;
  const { practitioner, isLoading, error, isAuthenticated } = usePractitionerAuth();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Loading state
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: `linear-gradient(180deg, ${colors.void} 0%, ${colors.cosmos} 100%)` }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4"
          >
            <Star className="w-full h-full" style={{ color: colors.gold }} />
          </motion.div>
          <p className="text-sm tracking-[0.3em] uppercase" style={{ color: colors.muted }}>
            Loading
          </p>
        </motion.div>
      </div>
    );
  }

  // Error / Not authenticated state
  if (error || !isAuthenticated || !practitioner) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: `linear-gradient(180deg, ${colors.void} 0%, ${colors.cosmos} 100%)` }}
      >
        <div className="text-center max-w-md px-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: `${colors.violet}20` }}
          >
            <Star className="w-8 h-8" style={{ color: colors.violet }} />
          </div>
          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: colors.starlight, fontFamily: "'Cinzel', serif" }}
          >
            Access Required
          </h2>
          <p className="mb-6" style={{ color: colors.muted }}>
            {error || 'Please sign in to access the admin portal.'}
          </p>
          <a
            href="/signin"
            className="inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: colors.gold,
              color: colors.void,
            }}
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Quicksand:wght@400;500;600;700&display=swap');

        :root {
          --font-display: 'Cinzel', serif;
          --font-body: 'Quicksand', sans-serif;
        }

        .font-display {
          font-family: var(--font-display);
          font-weight: 600;
        }
        .font-body {
          font-family: var(--font-body);
          font-weight: 500;
        }
      `}</style>

      <div
        className="min-h-screen font-body"
        style={{
          background: `linear-gradient(180deg, ${colors.void} 0%, ${colors.cosmos} 50%, ${colors.nebula} 100%)`,
          color: colors.starlight,
        }}
      >
        {/* Mobile Header */}
        <div
          className="lg:hidden fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b"
          style={{ backgroundColor: `${colors.cosmos}F0`, borderColor: colors.stardust }}
        >
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${colors.gold}30 0%, ${colors.violet}30 100%)`,
                }}
              >
                <Star className="w-4 h-4" style={{ color: colors.gold }} />
              </div>
              <span className="font-medium" style={{ color: colors.starlight }}>
                {practitioner.brand?.name || practitioner.name}
              </span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg"
              style={{ color: colors.muted }}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-40"
              style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
              onClick={() => setMobileMenuOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-64"
            >
              <AdminSidebar
                slug={slug}
                practitioner={practitioner}
                isOpen={true}
                onToggle={() => setMobileMenuOpen(false)}
                basePath={`/portal/${slug}/admin`}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <AdminSidebar
            slug={slug}
            practitioner={practitioner}
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            basePath={`/portal/${slug}/admin`}
          />
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
    </>
  );
}

export default function PractitionerAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const slug = params.slug as string;

  return (
    <PractitionerAuthProvider slug={slug}>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </PractitionerAuthProvider>
  );
}

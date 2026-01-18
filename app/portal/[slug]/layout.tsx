"use client";

/**
 * PRACTITIONER PORTAL LAYOUT
 *
 * Warm, earthy, feminine aesthetic for holistic practitioners
 * Loralee's portal: Evolutionary astrology with soul-centered approach
 */

import React, { useState, useEffect } from 'react';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Moon, Sparkles, Heart, MessageCircle } from 'lucide-react';

interface PractitionerBrand {
  name: string;
  tagline: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  text_color?: string;
  sage_color?: string;
  gold_color?: string;
  font_heading: string;
  font_body: string;
}

interface PortalConfig {
  practitioner_id: string;
  practitioner_name: string;
  slug: string;
  brand: PractitionerBrand;
  navigation: Array<{
    label: string;
    path: string;
    external?: boolean;
  }>;
  social: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  footer_text: string;
}

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const slug = params.slug as string;

  const [config, setConfig] = useState<PortalConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    fetchPortalConfig();
  }, [slug]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const fetchPortalConfig = async () => {
    try {
      const response = await fetch(`/api/portal/${slug}/config`);
      if (response.ok) {
        const data = await response.json();
        setConfig(data.config);
      }
    } catch (err) {
      console.error('Failed to load portal config:', err);
    } finally {
      setLoading(false);
    }
  };

  const isActive = (path: string) => {
    const fullPath = `/portal/${slug}${path === '/' ? '' : path}`;
    if (path === '/') {
      return pathname === `/portal/${slug}` || pathname === `/portal/${slug}/`;
    }
    return pathname?.startsWith(fullPath);
  };

  // Default earthy color palette
  const colors = {
    cream: config?.brand?.primary_color || '#FAF6F0',
    sand: config?.brand?.secondary_color || '#F5EDE4',
    terracotta: config?.brand?.accent_color || '#C67B5C',
    text: config?.brand?.text_color || '#4A3728',
    sage: config?.brand?.sage_color || '#9CAF88',
    gold: config?.brand?.gold_color || '#C9A962',
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: colors.cream }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Moon className="w-8 h-8" style={{ color: colors.terracotta }} />
        </motion.div>
      </div>
    );
  }

  if (!config) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: colors.cream }}
      >
        <div className="text-center">
          <Moon className="w-12 h-12 mx-auto mb-4" style={{ color: colors.terracotta }} />
          <h1 className="text-2xl mb-2" style={{ color: colors.text, fontFamily: 'Cormorant Garamond, serif' }}>
            Portal Not Found
          </h1>
          <p style={{ color: `${colors.text}80` }}>This sanctuary doesn't exist yet.</p>
        </div>
      </div>
    );
  }

  const defaultNav = [
    { label: 'Home', path: '/' },
    { label: 'Services', path: '/services' },
    { label: 'Free Gift', path: '/free' },
    { label: 'Book', path: '/book' },
    { label: 'About', path: '/about' },
  ];

  const navigation = config.navigation?.length > 0 ? config.navigation : defaultNav;

  return (
    <>
      {/* Google Fonts */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Lato:wght@300;400;700&display=swap');

        .font-heading {
          font-family: 'Cormorant Garamond', serif;
        }
        .font-body {
          font-family: 'Lato', sans-serif;
        }
      `}</style>

      <div
        className="min-h-screen font-body"
        style={{
          backgroundColor: colors.cream,
          color: colors.text,
          fontFamily: 'Lato, sans-serif',
        }}
      >
        {/* Decorative top border */}
        <div
          className="h-1"
          style={{
            background: `linear-gradient(90deg, ${colors.sage}, ${colors.terracotta}, ${colors.gold})`
          }}
        />

        {/* Header */}
        <header
          className="sticky top-0 z-50 backdrop-blur-md border-b"
          style={{
            backgroundColor: `${colors.cream}F0`,
            borderColor: `${colors.text}10`,
          }}
        >
          <div className="max-w-5xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo/Name */}
              <Link
                href={`/portal/${slug}`}
                className="flex items-center space-x-3 group"
              >
                {config.brand.logo_url ? (
                  <img
                    src={config.brand.logo_url}
                    alt={config.brand.name}
                    className="h-10 w-auto"
                  />
                ) : (
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center transition-transform group-hover:scale-105"
                    style={{
                      backgroundColor: `${colors.sage}30`,
                      border: `2px solid ${colors.sage}50`,
                    }}
                  >
                    <Moon
                      className="w-5 h-5"
                      style={{ color: colors.terracotta }}
                    />
                  </div>
                )}
                <div>
                  <div
                    className="text-xl font-heading font-medium tracking-wide"
                    style={{ color: colors.text }}
                  >
                    {config.brand.name}
                  </div>
                  {config.brand.tagline && (
                    <div
                      className="text-xs tracking-wider hidden sm:block"
                      style={{ color: `${colors.text}70` }}
                    >
                      {config.brand.tagline}
                    </div>
                  )}
                </div>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-1">
                {navigation.map(item => (
                  <Link
                    key={item.path}
                    href={item.external ? item.path : `/portal/${slug}${item.path === '/' ? '' : item.path}`}
                    target={item.external ? '_blank' : undefined}
                    className="px-4 py-2 rounded-full text-sm transition-all duration-200"
                    style={{
                      color: isActive(item.path) ? colors.cream : `${colors.text}90`,
                      backgroundColor: isActive(item.path) ? colors.terracotta : 'transparent',
                      fontWeight: isActive(item.path) ? 500 : 400,
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive(item.path)) {
                        e.currentTarget.style.backgroundColor = `${colors.sage}30`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive(item.path)) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-full transition-colors"
                style={{ color: colors.text }}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.nav
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden border-t"
                style={{ borderColor: `${colors.text}10` }}
              >
                <div className="px-6 py-4 space-y-1">
                  {navigation.map(item => (
                    <Link
                      key={item.path}
                      href={item.external ? item.path : `/portal/${slug}${item.path === '/' ? '' : item.path}`}
                      target={item.external ? '_blank' : undefined}
                      className="block px-4 py-3 rounded-xl transition-colors"
                      style={{
                        color: isActive(item.path) ? colors.cream : colors.text,
                        backgroundColor: isActive(item.path) ? colors.terracotta : `${colors.sand}`,
                      }}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </header>

        {/* Main Content */}
        <main className="max-w-5xl mx-auto px-6 py-12">{children}</main>

        {/* Footer */}
        <footer
          className="border-t mt-20"
          style={{
            backgroundColor: colors.sand,
            borderColor: `${colors.text}10`,
          }}
        >
          <div className="max-w-5xl mx-auto px-6 py-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Brand */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Moon className="w-5 h-5" style={{ color: colors.terracotta }} />
                  <div
                    className="text-xl font-heading font-medium"
                    style={{ color: colors.text }}
                  >
                    {config.brand.name}
                  </div>
                </div>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: `${colors.text}80` }}
                >
                  {config.brand.tagline}
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <div
                  className="text-sm font-medium mb-4 uppercase tracking-wider"
                  style={{ color: colors.terracotta }}
                >
                  Explore
                </div>
                <div className="space-y-3">
                  {navigation.map(item => (
                    <Link
                      key={item.path}
                      href={item.external ? item.path : `/portal/${slug}${item.path === '/' ? '' : item.path}`}
                      className="block text-sm transition-colors hover:translate-x-1 duration-200"
                      style={{ color: `${colors.text}80` }}
                      onMouseEnter={(e) => e.currentTarget.style.color = colors.terracotta}
                      onMouseLeave={(e) => e.currentTarget.style.color = `${colors.text}80`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Connect */}
              <div>
                <div
                  className="text-sm font-medium mb-4 uppercase tracking-wider"
                  style={{ color: colors.terracotta }}
                >
                  Connect
                </div>
                <div className="space-y-3">
                  {config.social?.instagram && (
                    <a
                      href={config.social.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-sm transition-colors"
                      style={{ color: `${colors.text}80` }}
                      onMouseEnter={(e) => e.currentTarget.style.color = colors.terracotta}
                      onMouseLeave={(e) => e.currentTarget.style.color = `${colors.text}80`}
                    >
                      <span>Instagram</span>
                    </a>
                  )}
                  {config.social?.website && (
                    <a
                      href={config.social.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-sm transition-colors"
                      style={{ color: `${colors.text}80` }}
                      onMouseEnter={(e) => e.currentTarget.style.color = colors.terracotta}
                      onMouseLeave={(e) => e.currentTarget.style.color = `${colors.text}80`}
                    >
                      <span>Website</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div
              className="mt-12 pt-8 border-t flex flex-col sm:flex-row items-center justify-between text-xs"
              style={{
                borderColor: `${colors.text}10`,
                color: `${colors.text}60`,
              }}
            >
              <div>
                © {new Date().getFullYear()} {config.brand.name}. Created with love.
              </div>
              <div className="mt-3 sm:mt-0 flex items-center space-x-1">
                <Heart className="w-3 h-3" style={{ color: colors.terracotta }} />
                <span>Powered by</span>
                <a
                  href="https://soullab.life"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: colors.terracotta }}
                  className="hover:underline"
                >
                  Soullab
                </a>
              </div>
            </div>
          </div>
        </footer>

        {/* Virtual Loralee Chat Button */}
        <motion.button
          onClick={() => setChatOpen(!chatOpen)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105"
          style={{
            backgroundColor: colors.terracotta,
            color: colors.cream,
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {chatOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <MessageCircle className="w-6 h-6" />
          )}
        </motion.button>

        {/* Virtual Loralee Chat Window */}
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] rounded-2xl shadow-2xl overflow-hidden"
              style={{ backgroundColor: colors.cream }}
            >
              {/* Chat Header */}
              <div
                className="px-5 py-4 flex items-center space-x-3"
                style={{ backgroundColor: colors.sage }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${colors.cream}30` }}
                >
                  <Sparkles className="w-5 h-5" style={{ color: colors.cream }} />
                </div>
                <div>
                  <div className="font-heading text-lg" style={{ color: colors.cream }}>
                    Ask Loralee
                  </div>
                  <div className="text-xs" style={{ color: `${colors.cream}90` }}>
                    Your cosmic guide
                  </div>
                </div>
              </div>

              {/* Chat Body */}
              <div className="h-80 p-4 overflow-y-auto">
                <div
                  className="rounded-2xl rounded-tl-sm p-4 mb-3 max-w-[85%]"
                  style={{ backgroundColor: colors.sand }}
                >
                  <p className="text-sm leading-relaxed" style={{ color: colors.text }}>
                    Welcome, beautiful soul! ✨
                  </p>
                  <p className="text-sm leading-relaxed mt-2" style={{ color: colors.text }}>
                    I'm here to help you explore your cosmic blueprint. Ask me anything about your birth chart, current transits, or how the stars might guide your journey.
                  </p>
                </div>
              </div>

              {/* Chat Input */}
              <div
                className="p-4 border-t"
                style={{ borderColor: `${colors.text}10` }}
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Ask about your chart..."
                    className="flex-1 px-4 py-3 rounded-full text-sm outline-none transition-all"
                    style={{
                      backgroundColor: colors.sand,
                      color: colors.text,
                      border: `1px solid ${colors.text}10`,
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = colors.sage}
                    onBlur={(e) => e.currentTarget.style.borderColor = `${colors.text}10`}
                  />
                  <button
                    className="p-3 rounded-full transition-colors"
                    style={{
                      backgroundColor: colors.terracotta,
                      color: colors.cream,
                    }}
                  >
                    <Sparkles className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

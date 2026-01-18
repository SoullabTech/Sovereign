"use client";

/**
 * PRACTITIONER PORTAL LAYOUT
 *
 * Dynamic layout for practitioner subdomains (e.g., loralee.soullab.life)
 * Loads practitioner branding, navigation, and theme
 */

import React, { useState, useEffect } from 'react';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sparkles } from 'lucide-react';

interface PractitionerBrand {
  name: string;
  tagline: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
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

        // Apply custom CSS properties
        if (data.config?.brand) {
          const root = document.documentElement;
          root.style.setProperty('--portal-primary', data.config.brand.primary_color);
          root.style.setProperty('--portal-secondary', data.config.brand.secondary_color);
          root.style.setProperty('--portal-accent', data.config.brand.accent_color);
        }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sacred-gold/30 border-t-sacred-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-gray-200 mb-2">Portal Not Found</h1>
          <p className="text-gray-500">This practitioner portal doesn't exist.</p>
        </div>
      </div>
    );
  }

  const defaultNav = [
    { label: 'Home', path: '/' },
    { label: 'Services', path: '/services' },
    { label: 'Free Resources', path: '/free' },
    { label: 'Book a Session', path: '/book' },
    { label: 'About', path: '/about' },
  ];

  const navigation = config.navigation?.length > 0 ? config.navigation : defaultNav;

  return (
    <div
      className="min-h-screen"
      style={{
        background: `linear-gradient(to bottom, ${config.brand.primary_color}10, #030712, #030712)`,
      }}
    >
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-gray-950/80 border-b border-gray-800/50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo/Name */}
            <Link
              href={`/portal/${slug}`}
              className="flex items-center space-x-3"
            >
              {config.brand.logo_url ? (
                <img
                  src={config.brand.logo_url}
                  alt={config.brand.name}
                  className="h-10 w-auto"
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${config.brand.accent_color}20` }}
                >
                  <Sparkles
                    className="w-5 h-5"
                    style={{ color: config.brand.accent_color }}
                  />
                </div>
              )}
              <div>
                <div
                  className="text-lg font-light"
                  style={{ color: config.brand.accent_color }}
                >
                  {config.brand.name}
                </div>
                {config.brand.tagline && (
                  <div className="text-xs text-gray-500 hidden sm:block">
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
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    isActive(item.path)
                      ? 'text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                  style={
                    isActive(item.path)
                      ? { backgroundColor: `${config.brand.accent_color}20` }
                      : undefined
                  }
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-gray-200"
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
              className="md:hidden border-t border-gray-800/50"
            >
              <div className="px-4 py-4 space-y-2">
                {navigation.map(item => (
                  <Link
                    key={item.path}
                    href={item.external ? item.path : `/portal/${slug}${item.path === '/' ? '' : item.path}`}
                    target={item.external ? '_blank' : undefined}
                    className={`block px-4 py-3 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'text-white'
                        : 'text-gray-400'
                    }`}
                    style={
                      isActive(item.path)
                        ? { backgroundColor: `${config.brand.accent_color}20` }
                        : undefined
                    }
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
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div>
              <div
                className="text-lg font-light mb-2"
                style={{ color: config.brand.accent_color }}
              >
                {config.brand.name}
              </div>
              <p className="text-gray-500 text-sm">{config.brand.tagline}</p>
            </div>

            {/* Quick Links */}
            <div>
              <div className="text-sm text-gray-400 font-medium mb-4">
                Quick Links
              </div>
              <div className="space-y-2">
                {navigation.slice(0, 4).map(item => (
                  <Link
                    key={item.path}
                    href={item.external ? item.path : `/portal/${slug}${item.path === '/' ? '' : item.path}`}
                    className="block text-sm text-gray-500 hover:text-gray-300"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Social */}
            {config.social && Object.keys(config.social).length > 0 && (
              <div>
                <div className="text-sm text-gray-400 font-medium mb-4">
                  Connect
                </div>
                <div className="flex space-x-4">
                  {config.social.instagram && (
                    <a
                      href={config.social.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-gray-300"
                    >
                      Instagram
                    </a>
                  )}
                  {config.social.facebook && (
                    <a
                      href={config.social.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-gray-300"
                    >
                      Facebook
                    </a>
                  )}
                  {config.social.linkedin && (
                    <a
                      href={config.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-gray-300"
                    >
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800/50 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-600">
            <div>
              {config.footer_text || `© ${new Date().getFullYear()} ${config.brand.name}. All rights reserved.`}
            </div>
            <div className="mt-2 sm:mt-0 flex items-center space-x-1">
              <span>Powered by</span>
              <a
                href="https://soullab.life"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sacred-gold hover:text-sacred-gold/80"
              >
                Soullab
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

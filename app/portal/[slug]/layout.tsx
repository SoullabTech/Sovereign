"use client";

/**
 * PRACTITIONER PORTAL LAYOUT
 *
 * Cosmic, celestial aesthetic for Loralee
 * Musician, Healer, Astrologer - where starlight meets soul
 */

import React, { useState, useEffect, useRef } from 'react';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sparkles, Send, Star, Moon, Settings } from 'lucide-react';

interface PortalConfig {
  practitioner_id: string;
  practitioner_member_id?: string;
  practitioner_name: string;
  slug: string;
  brand: {
    name: string;
    tagline: string;
    logo_url?: string;
    primary_color: string;
    secondary_color: string;
    accent_color: string;
  };
  navigation: Array<{ label: string; path: string; external?: boolean }>;
  social: {
    instagram?: string;
    facebook?: string;
    website?: string;
  };
  footer_text: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const slug = params.slug as string;

  // Admin routes have their own layout - pass through without portal chrome
  const isAdminRoute = pathname?.includes('/admin');

  const [config, setConfig] = useState<PortalConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Check if current user is the practitioner owner
  useEffect(() => {
    if (config?.practitioner_member_id && typeof window !== 'undefined') {
      const betaUser = localStorage.getItem('beta_user');
      if (betaUser) {
        try {
          const user = JSON.parse(betaUser);
          setIsOwner(user.id === config.practitioner_member_id);
        } catch (e) {
          setIsOwner(false);
        }
      }
    }
  }, [config]);

  // Cosmic celestial palette - high contrast for readability
  const colors = {
    // Backgrounds
    void: '#0D0B14', // Deep space
    cosmos: '#1A1625', // Purple-black
    nebula: '#251F33', // Lighter purple
    stardust: '#2D2640', // Card backgrounds

    // Accents
    starlight: '#FFFFFF', // Pure white for maximum readability
    violet: '#B8A5D9', // Brighter violet
    gold: '#E5C158', // Brighter gold
    rose: '#D4B0C5', // Brighter rose

    // Text - high contrast colors
    light: '#FFFFFF', // Pure white for main text
    muted: '#C8BDE0', // Brighter lavender - still readable
    dim: '#9A8FB8', // Brighter dim text
  };

  useEffect(() => {
    fetchPortalConfig();
  }, [slug]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

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

  const sendChatMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatLoading(true);

    try {
      const response = await fetch(`/api/portal/${slug}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: chatMessages,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setChatLoading(false);
    }
  };

  const isActive = (path: string) => {
    const fullPath = `/portal/${slug}${path === '/' ? '' : path}`;
    return path === '/'
      ? pathname === `/portal/${slug}` || pathname === `/portal/${slug}/`
      : pathname?.startsWith(fullPath);
  };

  // Admin routes bypass the public portal layout entirely
  // They have their own admin layout with sidebar navigation
  if (isAdminRoute) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: `linear-gradient(180deg, ${colors.void} 0%, ${colors.cosmos} 100%)` }}>
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
          <p className="text-sm tracking-[0.3em] uppercase" style={{ color: colors.muted }}>Loading</p>
        </motion.div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: `linear-gradient(180deg, ${colors.void} 0%, ${colors.cosmos} 100%)` }}>
        <div className="text-center px-6">
          <Moon className="w-12 h-12 mx-auto mb-4" style={{ color: colors.violet }} />
          <p className="text-lg" style={{ color: colors.light, fontFamily: 'var(--font-display)' }}>
            This portal is still aligning with the stars.
          </p>
        </div>
      </div>
    );
  }

  const navigation = config.navigation?.length > 0 ? config.navigation : [
    { label: 'Home', path: '/' },
    { label: 'Learn', path: '/learn' },
    { label: 'Offerings', path: '/services' },
    { label: 'Free Gift', path: '/free' },
    { label: 'Book', path: '/book' },
    { label: 'About', path: '/about' },
  ];

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

        /* Ensure all text has good weight for readability */
        body {
          font-weight: 500;
        }

        /* Subtle star animation */
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>

      <div
        className="min-h-screen font-body"
        style={{
          background: `linear-gradient(180deg, ${colors.void} 0%, ${colors.cosmos} 50%, ${colors.nebula} 100%)`,
          color: colors.light,
        }}
      >
        {/* Starfield Background Effect */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: colors.starlight,
                opacity: Math.random() * 0.5 + 0.2,
                animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Header */}
        <header
          className="sticky top-0 z-50 backdrop-blur-xl"
          style={{ backgroundColor: `${colors.void}E6`, borderBottom: `1px solid ${colors.stardust}` }}
        >
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between py-5">
              {/* Logo */}
              <Link href={`/portal/${slug}`} className="group">
                <h1
                  className="font-display text-xl md:text-2xl tracking-wider"
                  style={{ color: colors.light }}
                >
                  {config.brand.name}
                </h1>
                {config.brand.tagline && (
                  <p
                    className="text-xs tracking-[0.2em] uppercase mt-0.5"
                    style={{ color: colors.muted }}
                  >
                    {config.brand.tagline}
                  </p>
                )}
              </Link>

              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center space-x-8">
                {navigation.map(item => (
                  <Link
                    key={item.path}
                    href={item.external ? item.path : `/portal/${slug}${item.path === '/' ? '' : item.path}`}
                    className="text-sm tracking-wider transition-all duration-300 hover:text-white"
                    style={{
                      color: isActive(item.path) ? colors.gold : colors.muted,
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
                {/* Admin link for practitioner owner */}
                {isOwner && (
                  <Link
                    href={`/portal/${slug}/admin`}
                    className="flex items-center space-x-1.5 text-sm tracking-wider transition-all duration-300 hover:text-white px-3 py-1.5 rounded-lg"
                    style={{
                      color: colors.gold,
                      backgroundColor: `${colors.gold}15`,
                      border: `1px solid ${colors.gold}30`,
                    }}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Admin</span>
                  </Link>
                )}
              </nav>

              {/* Mobile Menu */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 -mr-2"
                style={{ color: colors.light }}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Mobile Navigation */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.nav
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="md:hidden overflow-hidden"
                >
                  <div className="py-6 space-y-4">
                    {navigation.map(item => (
                      <Link
                        key={item.path}
                        href={item.external ? item.path : `/portal/${slug}${item.path === '/' ? '' : item.path}`}
                        className="block text-lg tracking-wide"
                        style={{ color: isActive(item.path) ? colors.gold : colors.light }}
                      >
                        {item.label}
                      </Link>
                    ))}
                    {/* Admin link for practitioner owner */}
                    {isOwner && (
                      <Link
                        href={`/portal/${slug}/admin`}
                        className="flex items-center space-x-2 text-lg tracking-wide mt-4 pt-4"
                        style={{ color: colors.gold, borderTop: `1px solid ${colors.stardust}` }}
                      >
                        <Settings className="w-5 h-5" />
                        <span>Admin Portal</span>
                      </Link>
                    )}
                  </div>
                </motion.nav>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8 py-16">
          {children}
        </main>

        {/* Footer */}
        <footer style={{ backgroundColor: colors.void, borderTop: `1px solid ${colors.stardust}` }}>
          <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
            <div className="grid md:grid-cols-3 gap-12 md:gap-8">
              {/* Brand */}
              <div>
                <h3
                  className="font-display text-xl tracking-wider mb-4"
                  style={{ color: colors.light }}
                >
                  {config.brand.name}
                </h3>
                <p className="text-sm leading-relaxed mb-6" style={{ color: colors.muted }}>
                  {config.brand.tagline}
                </p>
                <div className="flex space-x-4">
                  {config.social?.instagram && (
                    <a
                      href={config.social.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm tracking-wide transition-colors hover:text-white"
                      style={{ color: colors.muted }}
                    >
                      Instagram
                    </a>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <div>
                <h4
                  className="text-xs tracking-[0.2em] uppercase mb-6"
                  style={{ color: colors.dim }}
                >
                  Explore
                </h4>
                <div className="space-y-3">
                  {navigation.map(item => (
                    <Link
                      key={item.path}
                      href={item.external ? item.path : `/portal/${slug}${item.path === '/' ? '' : item.path}`}
                      className="block text-sm transition-colors hover:text-white"
                      style={{ color: colors.muted }}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Connect */}
              <div>
                <h4
                  className="text-xs tracking-[0.2em] uppercase mb-6"
                  style={{ color: colors.dim }}
                >
                  Connect
                </h4>
                <p className="text-sm leading-relaxed" style={{ color: colors.muted }}>
                  Ready to explore your cosmic blueprint?
                </p>
                <Link
                  href={`/portal/${slug}/book`}
                  className="inline-block mt-4 text-sm tracking-wide border-b transition-colors hover:border-white"
                  style={{ color: colors.gold, borderColor: colors.gold }}
                >
                  Book a Reading
                </Link>
              </div>
            </div>

            {/* Bottom */}
            <div
              className="mt-16 pt-8 border-t flex flex-col md:flex-row items-center justify-between text-xs"
              style={{ borderColor: colors.stardust, color: colors.dim }}
            >
              <p>&copy; {new Date().getFullYear()} {config.brand.name}</p>
              <p className="mt-2 md:mt-0">
                Crafted with starlight by{' '}
                <a
                  href="https://soullab.life"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:no-underline"
                  style={{ color: colors.violet }}
                >
                  Soullab
                </a>
              </p>
            </div>
          </div>
        </footer>

        {/* Chat Button - Virtual Loralee - Fixed to bottom right */}
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
          }}
        >
          <button
            onClick={() => setChatOpen(!chatOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 24px',
              borderRadius: '9999px',
              backgroundColor: '#E5C158',
              color: '#FFFFFF',
              boxShadow: '0 8px 32px rgba(229, 193, 88, 0.5), 0 0 40px rgba(229, 193, 88, 0.3)',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'Cinzel, serif',
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.05em',
            }}
          >
            {chatOpen ? (
              <X style={{ width: '24px', height: '24px', color: '#FFFFFF' }} />
            ) : (
              <>
                <Sparkles style={{ width: '24px', height: '24px', color: '#FFFFFF' }} />
                <span>Ask Loralee</span>
              </>
            )}
          </button>
        </div>

        {/* Chat Window - Virtual Loralee */}
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              style={{
                position: 'fixed',
                bottom: '100px',
                right: '24px',
                zIndex: 9998,
                width: '420px',
                maxWidth: 'calc(100vw - 3rem)',
                borderRadius: '24px',
                overflow: 'hidden',
                backgroundColor: '#1A1625F5',
                border: '1px solid #2D2640',
                boxShadow: '0 25px 80px rgba(0,0,0,0.5), 0 0 100px rgba(184, 165, 217, 0.15)',
              }}
            >
              {/* Header */}
              <div
                className="px-6 py-5 relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${colors.nebula} 0%, ${colors.stardust} 100%)` }}
              >
                {/* Decorative stars */}
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        backgroundColor: colors.gold,
                        opacity: Math.random() * 0.5 + 0.3,
                      }}
                    />
                  ))}
                </div>
                <div className="flex items-center space-x-4 relative z-10">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${colors.violet} 0%, ${colors.gold} 100%)`,
                      boxShadow: `0 4px 20px rgba(229, 193, 88, 0.4)`,
                    }}
                  >
                    <Star className="w-6 h-6" style={{ color: colors.void }} />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-semibold tracking-wide" style={{ color: colors.light }}>
                      Virtual Loralee
                    </h3>
                    <p className="text-sm font-medium" style={{ color: colors.muted }}>
                      Your celestial guide • Always here for you
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div
                className="h-96 overflow-y-auto p-5 space-y-4"
                style={{ backgroundColor: colors.void }}
              >
                {chatMessages.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl rounded-tl-sm p-5"
                    style={{
                      background: `linear-gradient(135deg, ${colors.stardust}, rgba(184, 165, 217, 0.15))`,
                      border: `1px solid ${colors.nebula}`,
                    }}
                  >
                    <p className="text-base leading-relaxed font-medium" style={{ color: colors.light }}>
                      Hello, beautiful soul ✨
                    </p>
                    <p className="text-sm leading-relaxed mt-3" style={{ color: colors.muted }}>
                      I'm Virtual Loralee — an AI trained in Loralee's wisdom and voice, here to support you between sessions.
                    </p>
                    <p className="text-sm leading-relaxed mt-2" style={{ color: colors.muted }}>
                      Ask me about your birth chart, current transits, relationship dynamics, or any cosmic question on your heart.
                    </p>
                  </motion.div>
                )}

                {chatMessages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`rounded-2xl px-5 py-3 max-w-[85%] ${msg.role === 'user' ? 'rounded-br-sm' : 'rounded-tl-sm'}`}
                      style={{
                        background: msg.role === 'user'
                          ? `linear-gradient(135deg, ${colors.violet} 0%, ${colors.gold} 100%)`
                          : `linear-gradient(135deg, ${colors.stardust}, rgba(184, 165, 217, 0.1))`,
                        color: msg.role === 'user' ? colors.void : colors.light,
                        border: msg.role === 'user' ? 'none' : `1px solid ${colors.nebula}`,
                      }}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </motion.div>
                ))}

                {chatLoading && (
                  <div className="flex justify-start">
                    <div
                      className="rounded-2xl rounded-tl-sm px-5 py-4"
                      style={{
                        background: `linear-gradient(135deg, ${colors.stardust}, rgba(184, 165, 217, 0.1))`,
                        border: `1px solid ${colors.nebula}`,
                      }}
                    >
                      <div className="flex space-x-2">
                        {[0, 1, 2].map(i => (
                          <motion.div
                            key={i}
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: colors.gold }}
                            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div
                className="p-5 border-t"
                style={{ borderColor: colors.stardust, backgroundColor: colors.cosmos }}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                    placeholder="Ask about the stars..."
                    className="flex-1 px-5 py-3.5 rounded-full text-sm outline-none transition-all font-medium"
                    style={{
                      backgroundColor: colors.stardust,
                      color: colors.light,
                      border: `1px solid ${colors.nebula}`,
                    }}
                  />
                  <button
                    onClick={sendChatMessage}
                    disabled={chatLoading || !chatInput.trim()}
                    className="p-3.5 rounded-full transition-all disabled:opacity-50"
                    style={{
                      background: `linear-gradient(135deg, ${colors.violet} 0%, ${colors.gold} 100%)`,
                      color: colors.void,
                      boxShadow: `0 4px 15px rgba(229, 193, 88, 0.3)`,
                    }}
                  >
                    <Send className="w-5 h-5" />
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

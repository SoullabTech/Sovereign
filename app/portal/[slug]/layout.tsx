"use client";

/**
 * PRACTITIONER PORTAL LAYOUT
 *
 * High-end, natural, artistic aesthetic for holistic practitioners
 * Loralee: Musician, Healer, Astrologer - where cosmic wisdom meets earthly grace
 */

import React, { useState, useEffect, useRef } from 'react';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sparkles, Send } from 'lucide-react';

interface PortalConfig {
  practitioner_id: string;
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

  const [config, setConfig] = useState<PortalConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // High-end natural palette
  const colors = {
    ivory: '#FFFEF9',
    linen: '#F8F4EF',
    sand: '#E8E0D5',
    warmGray: '#9A938A',
    clay: '#C4A77D',
    terracotta: '#B87351',
    forest: '#4A5D4A',
    text: '#3D3532',
    textLight: '#6B6460',
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.ivory }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: colors.terracotta, borderTopColor: 'transparent' }} />
          <p className="text-sm tracking-widest uppercase" style={{ color: colors.warmGray }}>Loading</p>
        </motion.div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.ivory }}>
        <div className="text-center px-6">
          <p className="text-lg" style={{ color: colors.text, fontFamily: 'Cormorant Garamond, serif' }}>
            This sanctuary is still being prepared.
          </p>
        </div>
      </div>
    );
  }

  const navigation = config.navigation?.length > 0 ? config.navigation : [
    { label: 'Home', path: '/' },
    { label: 'Offerings', path: '/services' },
    { label: 'Free Gift', path: '/free' },
    { label: 'Book', path: '/book' },
    { label: 'About', path: '/about' },
  ];

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Jost:wght@300;400;500&display=swap');

        .font-display { font-family: 'Cormorant Garamond', serif; }
        .font-body { font-family: 'Jost', sans-serif; }
      `}</style>

      <div className="min-h-screen font-body" style={{ backgroundColor: colors.ivory, color: colors.text }}>
        {/* Elegant Header */}
        <header className="sticky top-0 z-50" style={{ backgroundColor: `${colors.ivory}F8`, backdropFilter: 'blur(12px)' }}>
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            {/* Top Bar */}
            <div className="flex items-center justify-between py-5 border-b" style={{ borderColor: `${colors.sand}80` }}>
              {/* Logo */}
              <Link href={`/portal/${slug}`} className="group">
                <h1 className="font-display text-2xl md:text-3xl font-light tracking-wide" style={{ color: colors.text }}>
                  {config.brand.name}
                </h1>
                {config.brand.tagline && (
                  <p className="text-xs tracking-[0.2em] uppercase mt-0.5 opacity-60" style={{ color: colors.textLight }}>
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
                    className="text-sm tracking-wider transition-colors duration-200"
                    style={{
                      color: isActive(item.path) ? colors.terracotta : colors.textLight,
                      fontWeight: isActive(item.path) ? 500 : 400,
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              {/* Mobile Menu */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 -mr-2"
                style={{ color: colors.text }}
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
                        style={{ color: isActive(item.path) ? colors.terracotta : colors.text }}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </motion.nav>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-6 lg:px-8 py-16">{children}</main>

        {/* Elegant Footer */}
        <footer style={{ backgroundColor: colors.linen }}>
          <div className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
            <div className="grid md:grid-cols-3 gap-12 md:gap-8">
              {/* Brand */}
              <div>
                <h3 className="font-display text-2xl font-light mb-4" style={{ color: colors.text }}>
                  {config.brand.name}
                </h3>
                <p className="text-sm leading-relaxed mb-6" style={{ color: colors.textLight }}>
                  {config.brand.tagline}
                </p>
                <div className="flex space-x-4">
                  {config.social?.instagram && (
                    <a href={config.social.instagram} target="_blank" rel="noopener noreferrer"
                      className="text-sm tracking-wide transition-colors" style={{ color: colors.textLight }}>
                      Instagram
                    </a>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <div>
                <h4 className="text-xs tracking-[0.2em] uppercase mb-6" style={{ color: colors.warmGray }}>
                  Explore
                </h4>
                <div className="space-y-3">
                  {navigation.map(item => (
                    <Link
                      key={item.path}
                      href={item.external ? item.path : `/portal/${slug}${item.path === '/' ? '' : item.path}`}
                      className="block text-sm transition-colors"
                      style={{ color: colors.textLight }}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div>
                <h4 className="text-xs tracking-[0.2em] uppercase mb-6" style={{ color: colors.warmGray }}>
                  Connect
                </h4>
                <p className="text-sm leading-relaxed" style={{ color: colors.textLight }}>
                  Ready to explore your cosmic blueprint?
                </p>
                <Link
                  href={`/portal/${slug}/book`}
                  className="inline-block mt-4 text-sm tracking-wide border-b transition-colors"
                  style={{ color: colors.terracotta, borderColor: colors.terracotta }}
                >
                  Book a Reading
                </Link>
              </div>
            </div>

            {/* Bottom */}
            <div className="mt-16 pt-8 border-t flex flex-col md:flex-row items-center justify-between text-xs"
              style={{ borderColor: colors.sand, color: colors.warmGray }}>
              <p>© {new Date().getFullYear()} {config.brand.name}</p>
              <p className="mt-2 md:mt-0">
                Crafted with care by{' '}
                <a href="https://soullab.life" target="_blank" rel="noopener noreferrer"
                  className="underline hover:no-underline" style={{ color: colors.terracotta }}>
                  Soullab
                </a>
              </p>
            </div>
          </div>
        </footer>

        {/* Chat Button */}
        <motion.button
          onClick={() => setChatOpen(!chatOpen)}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-lg flex items-center justify-center"
          style={{ backgroundColor: colors.forest, color: colors.ivory }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {chatOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
        </motion.button>

        {/* Chat Window */}
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-24 right-6 z-50 w-[400px] max-w-[calc(100vw-3rem)] rounded-2xl shadow-2xl overflow-hidden"
              style={{ backgroundColor: colors.ivory }}
            >
              {/* Header */}
              <div className="px-6 py-5" style={{ backgroundColor: colors.forest }}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.ivory}20` }}>
                    <Sparkles className="w-5 h-5" style={{ color: colors.ivory }} />
                  </div>
                  <div>
                    <h3 className="font-display text-lg" style={{ color: colors.ivory }}>
                      Ask {config.practitioner_name.split(' ')[0]}
                    </h3>
                    <p className="text-xs opacity-80" style={{ color: colors.ivory }}>
                      Your cosmic companion
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="h-80 overflow-y-auto p-4 space-y-4" style={{ backgroundColor: colors.linen }}>
                {chatMessages.length === 0 && (
                  <div className="rounded-2xl rounded-tl-sm p-4" style={{ backgroundColor: colors.ivory }}>
                    <p className="text-sm leading-relaxed" style={{ color: colors.text }}>
                      Hello, beautiful soul ✨
                    </p>
                    <p className="text-sm leading-relaxed mt-2" style={{ color: colors.textLight }}>
                      I'm here to help you explore the stars. Ask me about your birth chart, current transits, or anything astrology-related.
                    </p>
                  </div>
                )}

                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`rounded-2xl px-4 py-3 max-w-[85%] ${msg.role === 'user' ? 'rounded-br-sm' : 'rounded-tl-sm'}`}
                      style={{
                        backgroundColor: msg.role === 'user' ? colors.forest : colors.ivory,
                        color: msg.role === 'user' ? colors.ivory : colors.text,
                      }}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}

                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-tl-sm px-4 py-3" style={{ backgroundColor: colors.ivory }}>
                      <div className="flex space-x-1">
                        {[0, 1, 2].map(i => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: colors.warmGray }}
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t" style={{ borderColor: colors.sand, backgroundColor: colors.ivory }}>
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                    placeholder="Ask about the stars..."
                    className="flex-1 px-4 py-3 rounded-full text-sm outline-none transition-all"
                    style={{
                      backgroundColor: colors.linen,
                      color: colors.text,
                      border: `1px solid ${colors.sand}`,
                    }}
                  />
                  <button
                    onClick={sendChatMessage}
                    disabled={chatLoading || !chatInput.trim()}
                    className="p-3 rounded-full transition-all disabled:opacity-50"
                    style={{ backgroundColor: colors.terracotta, color: colors.ivory }}
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

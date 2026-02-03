'use client';

/**
 * Privacy Policy Page (Root Level)
 *
 * Required for Google OAuth verification.
 * Redirects to the full privacy page or displays standalone version.
 */

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, HardDrive, Cloud, Download, Trash2, Eye, Mail, Calendar } from 'lucide-react';
import { Holoflower } from '@/components/ui/Holoflower';

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#1a1a2e]/80 border-b border-white/10">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center gap-5">
          <button
            onClick={() => router.push('/')}
            className="p-2 -ml-2 text-white/70 hover:text-white hover:-translate-x-0.5 transition-all"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2} />
          </button>
          <div className="h-4 w-px bg-white/20" />
          <h1 className="text-sm font-medium tracking-wide text-white/60 uppercase">
            Privacy Policy
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Hero */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-16 h-16 mx-auto mb-8">
            <Holoflower
              size="md"
              glowIntensity="medium"
              animate={true}
              customColor="rgba(251, 191, 36, 0.6)"
            />
          </div>
          <h2 className="text-2xl font-light mb-4 text-white tracking-wide">
            Privacy Policy
          </h2>
          <p className="text-[15px] font-medium text-amber-400/80">
            Soullab — MAIA Sovereign Companion
          </p>
          <p className="text-xs text-white/40 mt-2">
            Last updated: February 1, 2026
          </p>
        </motion.div>

        {/* Core Principle */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="p-8 rounded-2xl border border-amber-500/20 bg-amber-500/5">
            <h3 className="text-lg font-medium mb-4 text-white">
              Your inner life belongs to you.
            </h3>
            <p className="text-[15px] leading-relaxed text-white/70 mb-4">
              Soullab operates MAIA, a sovereign AI companion designed to support human growth,
              reflection, and inner work. We believe you shouldn&apos;t need a lawyer to understand
              what happens to your thoughts.
            </p>
            <p className="text-[15px] leading-relaxed text-white/70">
              <span className="font-medium text-white">We do not sell, mine, or monetize your data. Ever.</span>
            </p>
          </div>
        </motion.section>

        {/* Information We Collect */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-sm font-medium tracking-wide mb-6 text-white/80 uppercase">
            Information We Collect
          </h3>
          <div className="space-y-4">
            <div className="flex gap-4 p-5 rounded-xl border border-white/10 bg-white/5">
              <HardDrive className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
              <div>
                <p className="text-[13px] font-medium text-white mb-1">Account Information</p>
                <p className="text-[13px] text-white/60 leading-relaxed">
                  When you create an account: email address, username, and password (hashed).
                  Used solely for authentication and account recovery.
                </p>
              </div>
            </div>
            <div className="flex gap-4 p-5 rounded-xl border border-white/10 bg-white/5">
              <Cloud className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
              <div>
                <p className="text-[13px] font-medium text-white mb-1">Conversation Data</p>
                <p className="text-[13px] text-white/60 leading-relaxed">
                  Your conversations with MAIA, stored on your device first. Cloud sync is optional
                  and stores data on our self-hosted infrastructure (not third-party cloud providers).
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Google Integration */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <h3 className="text-sm font-medium tracking-wide mb-6 text-white/80 uppercase">
            Google Integration (Optional)
          </h3>
          <div className="space-y-4">
            <div className="flex gap-4 p-5 rounded-xl border border-white/10 bg-white/5">
              <Mail className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
              <div>
                <p className="text-[13px] font-medium text-white mb-1">Gmail Access</p>
                <p className="text-[13px] text-white/60 leading-relaxed">
                  If you connect your Google account, MAIA can send emails on your behalf (e.g.,
                  follow-up reminders you request). We only send emails you explicitly ask for.
                  We never read, scan, or store your inbox contents.
                </p>
              </div>
            </div>
            <div className="flex gap-4 p-5 rounded-xl border border-white/10 bg-white/5">
              <Calendar className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
              <div>
                <p className="text-[13px] font-medium text-white mb-1">Google Calendar Access</p>
                <p className="text-[13px] text-white/60 leading-relaxed">
                  If connected, MAIA can create calendar events for focus blocks or reminders you
                  request. We only create events you explicitly ask for. We do not read, modify,
                  or delete your existing calendar entries.
                </p>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-[12px] text-amber-300/80">
                <strong>You can disconnect Google anytime</strong> from Settings → Connections.
                This immediately revokes our access to your Google account.
              </p>
            </div>
          </div>
        </motion.section>

        {/* What We Don't Do */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-sm font-medium tracking-wide mb-6 text-white/80 uppercase">
            What We Don&apos;t Do
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: Eye, label: 'No data mining', desc: 'We don\'t analyze your content for advertising or profiling' },
              { icon: Shield, label: 'No third-party sharing', desc: 'We don\'t share data with advertisers, brokers, or AI training pipelines' },
              { icon: Trash2, label: 'No retention traps', desc: 'Delete means delete. No shadow copies after removal' },
              { icon: Download, label: 'No lock-in', desc: 'Export everything anytime in readable formats' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl border border-white/10 bg-white/5"
              >
                <item.icon className="w-5 h-5 text-emerald-400 mb-3" strokeWidth={1.5} />
                <p className="text-[13px] font-medium text-white mb-1">{item.label}</p>
                <p className="text-[12px] text-white/50">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Data Storage */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <h3 className="text-sm font-medium tracking-wide mb-6 text-white/80 uppercase">
            Data Storage & Security
          </h3>
          <div className="p-6 rounded-xl border border-white/10 bg-white/5 space-y-4">
            <p className="text-[14px] leading-relaxed text-white/70">
              Your data is stored on <strong className="text-white">self-hosted infrastructure</strong> that
              we control — not AWS, Google Cloud, or other third-party providers. This gives us complete
              control over your data&apos;s jurisdiction and security.
            </p>
            <p className="text-[14px] leading-relaxed text-white/70">
              All data is encrypted at rest and in transit using industry-standard encryption (TLS 1.3,
              AES-256). Passwords are hashed using bcrypt.
            </p>
          </div>
        </motion.section>

        {/* Your Rights */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="text-sm font-medium tracking-wide mb-6 text-white/80 uppercase">
            Your Rights
          </h3>
          <ul className="space-y-3 text-[14px] text-white/70">
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
              <span><strong className="text-white">Access</strong> — View all data we hold about you</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
              <span><strong className="text-white">Export</strong> — Download your data anytime in JSON or Markdown</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
              <span><strong className="text-white">Delete</strong> — Remove any or all of your data permanently</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
              <span><strong className="text-white">Portability</strong> — Take your data with you if you leave</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
              <span><strong className="text-white">90-day notice</strong> — If service is discontinued, you&apos;ll have at least 90 days to export</span>
            </li>
          </ul>
        </motion.section>

        {/* Contact */}
        <motion.section
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="p-6 rounded-xl border border-white/10 bg-white/5">
            <h4 className="text-[13px] font-medium text-white mb-3">Contact Us</h4>
            <p className="text-[13px] text-white/60 leading-relaxed">
              Questions about this policy or your data? Contact us at:{' '}
              <a href="mailto:privacy@soullab.life" className="text-amber-400 hover:underline">
                privacy@soullab.life
              </a>
            </p>
            <p className="text-[13px] text-white/60 leading-relaxed mt-2">
              Soullab<br />
              San Diego, California
            </p>
          </div>
        </motion.section>

        {/* Footer */}
        <motion.div
          className="text-center pt-8 border-t border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <p className="text-[12px] text-white/40">
            &copy; 2026 Soullab. All rights reserved.
          </p>
        </motion.div>
      </main>
    </div>
  );
}

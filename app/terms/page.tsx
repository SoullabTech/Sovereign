'use client';

/**
 * Terms of Service Page
 *
 * Required for Google OAuth verification.
 * Clear, human-readable terms aligned with MAIA sovereignty principles.
 */

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Shield, Heart, AlertTriangle } from 'lucide-react';
import { Holoflower } from '@/components/ui/Holoflower';

export default function TermsOfServicePage() {
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
            Terms of Service
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
            Terms of Service
          </h2>
          <p className="text-[15px] font-medium text-amber-400/80">
            Soullab — MAIA Sovereign Companion
          </p>
          <p className="text-xs text-white/40 mt-2">
            Last updated: February 1, 2026
          </p>
        </motion.div>

        {/* Introduction */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="p-8 rounded-2xl border border-amber-500/20 bg-amber-500/5">
            <h3 className="text-lg font-medium mb-4 text-white">
              Plain language, mutual respect.
            </h3>
            <p className="text-[15px] leading-relaxed text-white/70">
              These terms govern your use of MAIA, the sovereign AI companion developed by Soullab.
              We&apos;ve written them in plain language because we believe agreements should be
              understandable by humans, not just lawyers.
            </p>
          </div>
        </motion.section>

        {/* What MAIA Is */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-sm font-medium tracking-wide mb-6 text-white/80 uppercase flex items-center gap-2">
            <FileText className="w-4 h-4" />
            What MAIA Is
          </h3>
          <div className="p-6 rounded-xl border border-white/10 bg-white/5 space-y-4">
            <p className="text-[14px] leading-relaxed text-white/70">
              MAIA is an AI companion designed to support reflection, personal growth, and inner work.
              MAIA is <strong className="text-white">not</strong> a therapist, doctor, financial advisor,
              or any other licensed professional.
            </p>
            <p className="text-[14px] leading-relaxed text-white/70">
              MAIA offers perspective, asks questions, and helps you think through challenges — but
              the decisions you make are yours. MAIA does not replace professional help when you need it.
            </p>
          </div>
        </motion.section>

        {/* Your Responsibilities */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <h3 className="text-sm font-medium tracking-wide mb-6 text-white/80 uppercase flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Your Responsibilities
          </h3>
          <ul className="space-y-3 text-[14px] text-white/70">
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
              <span>You must be at least 18 years old to use MAIA</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
              <span>Keep your account credentials secure</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
              <span>Don&apos;t use MAIA for illegal activities or to harm others</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
              <span>Seek professional help for medical, legal, or financial matters</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
              <span>If you&apos;re in crisis, contact emergency services or a crisis helpline</span>
            </li>
          </ul>
        </motion.section>

        {/* Our Commitments */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-sm font-medium tracking-wide mb-6 text-white/80 uppercase flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Our Commitments to You
          </h3>
          <ul className="space-y-3 text-[14px] text-white/70">
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
              <span><strong className="text-white">Sovereignty</strong> — Your data belongs to you, not us</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
              <span><strong className="text-white">Transparency</strong> — We&apos;ll tell you how your data is used</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
              <span><strong className="text-white">No manipulation</strong> — MAIA won&apos;t use dark patterns or psychological tricks</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
              <span><strong className="text-white">Portability</strong> — You can export your data anytime</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
              <span><strong className="text-white">Notice</strong> — 90 days warning before any service discontinuation</span>
            </li>
          </ul>
        </motion.section>

        {/* Third-Party Services */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <h3 className="text-sm font-medium tracking-wide mb-6 text-white/80 uppercase">
            Third-Party Services
          </h3>
          <div className="p-6 rounded-xl border border-white/10 bg-white/5 space-y-4">
            <p className="text-[14px] leading-relaxed text-white/70">
              MAIA may integrate with third-party services like Google (for calendar and email).
              These integrations are optional. When you connect them, you&apos;re also agreeing to
              those services&apos; terms.
            </p>
            <p className="text-[14px] leading-relaxed text-white/70">
              We use Anthropic&apos;s Claude AI to power MAIA&apos;s responses. Your conversations
              are processed through their API but are not used to train their models (per their
              commercial API terms).
            </p>
          </div>
        </motion.section>

        {/* SMS Communications */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.37 }}
        >
          <h3 className="text-sm font-medium tracking-wide mb-6 text-white/80 uppercase">
            SMS Communications
          </h3>
          <div className="p-6 rounded-xl border border-white/10 bg-white/5 space-y-4">
            <p className="text-[14px] leading-relaxed text-white/70">
              Soullab offers optional SMS notifications for appointment reminders and session
              confirmations. By opting in during the booking process, you consent to receive
              text messages from Soullab at the phone number you provide.
            </p>
            <ul className="space-y-2 text-[14px] text-white/70">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                <span><strong className="text-white">Message frequency</strong> varies based on your session bookings</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                <span>Message and data rates may apply</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                <span>Reply <strong className="text-white">STOP</strong> to opt out at any time</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                <span>Reply <strong className="text-white">HELP</strong> for support information</span>
              </li>
            </ul>
            <p className="text-[14px] leading-relaxed text-white/70">
              For questions about SMS, contact{' '}
              <a href="mailto:hello@soullab.life" className="text-amber-400 hover:underline">
                hello@soullab.life
              </a>.
            </p>
          </div>
        </motion.section>

        {/* Limitations */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="text-sm font-medium tracking-wide mb-6 text-white/80 uppercase flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Limitations
          </h3>
          <div className="p-6 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-4">
            <p className="text-[14px] leading-relaxed text-white/70">
              MAIA is provided &quot;as is.&quot; While we work hard to make it reliable and helpful, we can&apos;t
              guarantee it will always be available, error-free, or suitable for your needs.
            </p>
            <p className="text-[14px] leading-relaxed text-white/70">
              We&apos;re not liable for decisions you make based on MAIA&apos;s responses, or for any
              indirect damages from using the service.
            </p>
            <p className="text-[14px] leading-relaxed text-white/70">
              <strong className="text-white">Important:</strong> MAIA is not a substitute for
              professional mental health care. If you&apos;re experiencing a mental health crisis,
              please contact a mental health professional or emergency services.
            </p>
          </div>
        </motion.section>

        {/* Changes to Terms */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
        >
          <h3 className="text-sm font-medium tracking-wide mb-6 text-white/80 uppercase">
            Changes to These Terms
          </h3>
          <p className="text-[14px] leading-relaxed text-white/70">
            We may update these terms occasionally. When we do, we&apos;ll post the new version here
            and update the &quot;Last updated&quot; date. For significant changes, we&apos;ll notify you via
            email or in-app message.
          </p>
        </motion.section>

        {/* Contact */}
        <motion.section
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="p-6 rounded-xl border border-white/10 bg-white/5">
            <h4 className="text-[13px] font-medium text-white mb-3">Questions?</h4>
            <p className="text-[13px] text-white/60 leading-relaxed">
              If you have questions about these terms, contact us at:{' '}
              <a href="mailto:hello@soullab.life" className="text-amber-400 hover:underline">
                hello@soullab.life
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

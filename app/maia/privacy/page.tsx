'use client';

/**
 * Privacy & Sovereignty Page
 *
 * Clear, non-legal explanation of how Soullab handles data.
 * Written for humans, not lawyers.
 */

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, HardDrive, Cloud, Download, Trash2, Eye } from 'lucide-react';
import { Holoflower } from '@/components/ui/Holoflower';
import SupportFooter from '@/components/shared/SupportFooter';

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #f8f7f5 0%, #f4f3f0 50%, #f0efec 100%)' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#f8f7f5]/80 border-b border-stone-200/40">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center gap-5">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-stone-700 hover:text-stone-900 hover:-translate-x-0.5 transition-all"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2} />
          </button>
          <div className="h-4 w-px bg-stone-300/60" />
          <h1 className="text-sm font-medium tracking-wide text-stone-600 uppercase">
            Privacy
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
              theme="light"
              customColor="rgba(107, 90, 152, 0.6)"
            />
          </div>
          <h2 className="text-2xl font-light mb-4 text-stone-800 tracking-wide">
            Privacy & Sovereignty
          </h2>
          <p className="text-[15px] font-medium text-[#6b5a98]">
            Your inner life belongs to you. Full stop.
          </p>
        </motion.div>

        {/* Core Principle */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="p-8 rounded-2xl border border-[#6b5a98]/20 bg-[#6b5a98]/5">
            <h3 className="text-lg font-medium mb-4 text-stone-800">
              This is not a legal document.
            </h3>
            <p className="text-[15px] leading-relaxed text-stone-600 mb-4">
              It&apos;s a plain-language explanation of how Soullab handles your data.
              We believe you shouldn&apos;t need a lawyer to understand what happens
              to your thoughts.
            </p>
            <p className="text-[15px] leading-relaxed text-stone-600">
              The short version: <span className="font-medium text-stone-800">we don&apos;t sell, mine, or monetize your data. Ever.</span>
            </p>
          </div>
        </motion.section>

        {/* Where Your Data Lives */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-sm font-medium tracking-wide mb-6 text-stone-700 uppercase">
            Where your data lives
          </h3>
          <div className="space-y-4">
            <div className="flex gap-4 p-5 rounded-xl border border-stone-200/60 bg-white/40">
              <HardDrive className="w-5 h-5 text-[#5a7a6f] flex-shrink-0 mt-0.5" strokeWidth={1.5} />
              <div>
                <p className="text-[13px] font-medium text-stone-700 mb-1">Local (your device)</p>
                <p className="text-[13px] text-stone-500 leading-relaxed">
                  Your conversations, journal entries, and memories are stored on your device first.
                  This works offline. No account required. No data leaves your device unless you choose cloud features.
                </p>
              </div>
            </div>
            <div className="flex gap-4 p-5 rounded-xl border border-stone-200/60 bg-white/40">
              <Cloud className="w-5 h-5 text-[#6b5a98] flex-shrink-0 mt-0.5" strokeWidth={1.5} />
              <div>
                <p className="text-[13px] font-medium text-stone-700 mb-1">Sovereign Cloud (optional)</p>
                <p className="text-[13px] text-stone-500 leading-relaxed">
                  If you enable cloud sync, your data is stored on our self-hosted infrastructure.
                  Not AWS. Not Google. Hardware we control, in a jurisdiction we chose.
                  Encrypted at rest and in transit.
                </p>
              </div>
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
          <h3 className="text-sm font-medium tracking-wide mb-6 text-stone-700 uppercase">
            What we don&apos;t do
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: Eye, label: 'No data mining', desc: 'We don\'t analyze your content for advertising or profiling' },
              { icon: Shield, label: 'No third-party access', desc: 'We don\'t share your data with advertisers, brokers, or AI training pipelines' },
              { icon: Trash2, label: 'No retention traps', desc: 'Delete means delete. We don\'t keep shadow copies after you remove data' },
              { icon: Download, label: 'No lock-in', desc: 'Export everything you\'ve created, anytime, in readable formats' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl border border-stone-200/60 bg-white/40"
              >
                <item.icon className="w-5 h-5 text-[#5a7a6f] mb-3" strokeWidth={1.5} />
                <p className="text-[13px] font-medium text-stone-700 mb-1">{item.label}</p>
                <p className="text-[12px] text-stone-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Sanctuary Mode */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="text-sm font-medium tracking-wide mb-6 text-stone-700 uppercase">
            Sanctuary Mode
          </h3>
          <div className="p-6 rounded-xl border border-[#5a7a6f]/20 bg-[#5a7a6f]/5">
            <p className="text-[14px] leading-relaxed text-stone-600 mb-4">
              Some conversations shouldn&apos;t be remembered. Sanctuary mode lets you talk to MAIA
              without any memory being formed — not locally, not in cloud, not anywhere.
            </p>
            <p className="text-[14px] leading-relaxed text-stone-600">
              When you enable Sanctuary, the session is useful in the moment, then gone.
              No patterns formed. No training data. Just presence.
            </p>
          </div>
        </motion.section>

        {/* Your Rights */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h3 className="text-sm font-medium tracking-wide mb-6 text-stone-700 uppercase">
            Your rights
          </h3>
          <ul className="space-y-3 text-[14px] text-stone-600">
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6b5a98] mt-2 flex-shrink-0" />
              <span><strong>Export</strong> — Download your data anytime in JSON or Markdown</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6b5a98] mt-2 flex-shrink-0" />
              <span><strong>Delete</strong> — Remove any or all of your data permanently</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6b5a98] mt-2 flex-shrink-0" />
              <span><strong>Leave</strong> — If you stop using Soullab, your local data stays on your device. We don&apos;t hold it hostage.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6b5a98] mt-2 flex-shrink-0" />
              <span><strong>90-day notice</strong> — If any service is discontinued, you&apos;ll have at least 90 days to export everything</span>
            </li>
          </ul>
        </motion.section>

        {/* Contact */}
        <motion.section
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="p-6 rounded-xl border border-stone-200/60 bg-white/40">
            <h4 className="text-[13px] font-medium text-stone-700 mb-3">Questions?</h4>
            <p className="text-[13px] text-stone-500 leading-relaxed">
              If something here isn&apos;t clear, or you have concerns about how your data is handled,
              reach out: <a href="mailto:privacy@soullab.life" className="text-[#6b5a98] hover:underline">privacy@soullab.life</a>
            </p>
          </div>
        </motion.section>

        {/* Closing */}
        <motion.div
          className="text-center pt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <p className="text-[13px] italic text-stone-400">
            Real honesty requires safety. This is ours.
          </p>
        </motion.div>

        {/* Footer */}
        <SupportFooter theme="light" />
      </main>
    </div>
  );
}

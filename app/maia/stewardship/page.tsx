'use client';

/**
 * Stewardship & Sustainability Page
 *
 * The ethical spine of Soullab's funding model.
 * Non-coercive, honest about costs, builds trust.
 *
 * Key principles:
 * - Local is complete, cloud is extension
 * - No guilt, no urgency, just truth
 * - Data is never held hostage
 */

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Shield, Server, Heart, Users, Clock } from 'lucide-react';
import { Holoflower } from '@/components/ui/Holoflower';
import SupportFooter from '@/components/shared/SupportFooter';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function StewardshipPage() {
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
            Stewardship
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
              customColor="rgba(90, 122, 111, 0.6)"
            />
          </div>
          <h2 className="text-2xl font-light mb-4 text-stone-800 tracking-wide">
            Stewardship & Sustainability
          </h2>
          <p className="text-[15px] font-medium text-[#5a7a6f]">
            Local mode remains complete — whether you ever pay or not.
          </p>

          {/* Safety Guarantee - 3 lines */}
          <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[13px] text-stone-500">
            <span>✓ Local mode is complete</span>
            <span>✓ Cloud is optional</span>
            <span>✓ Export anytime</span>
          </div>
        </motion.div>

        {/* Core Reassurance */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="p-8 rounded-2xl border border-[#5a7a6f]/20 bg-[#5a7a6f]/5">
            <h3 className="text-lg font-medium mb-4 text-stone-800">
              Soullab works without payment.
            </h3>
            <p className="text-[15px] leading-relaxed text-stone-600 mb-4">
              Your local system is complete. You can think, write, reflect, and work with MAIA
              without subscribing to anything.
            </p>
            <p className="text-[15px] leading-relaxed text-stone-600">
              This isn&apos;t a trial. It&apos;s the product.
            </p>
          </div>
        </motion.section>

        {/* Cloud Support */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-sm font-medium tracking-wide mb-4 text-stone-700 uppercase">
            Cloud support is optional
          </h3>
          <p className="text-[15px] leading-relaxed text-stone-600 mb-4">
            Sovereign Cloud exists to extend what&apos;s possible — sync across devices, long-term
            memory, pattern weaving over time. It&apos;s there if you want it.
          </p>
          <p className="text-[15px] leading-relaxed text-stone-500 italic">
            It&apos;s not there to hold your work hostage.
          </p>
        </motion.section>

        {/* Divider */}
        <div className="flex items-center gap-6 mb-12">
          <div className="flex-1 h-px bg-stone-200/60" />
          <span className="text-[11px] uppercase tracking-[0.2em] text-stone-400">The honest reality</span>
          <div className="flex-1 h-px bg-stone-200/60" />
        </div>

        {/* Honest Reality */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="text-[15px] leading-relaxed text-stone-600 mb-4">
            Running shared infrastructure has real costs. Encrypted storage, backups, compute for
            memory indexing, security, and the humans who maintain it all — these don&apos;t
            disappear because we wish they would.
          </p>
          <p className="text-[15px] leading-relaxed text-stone-600">
            Cloud subscriptions are how those costs get carried. Together.
          </p>
        </motion.section>

        {/* Where Support Goes */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="text-sm font-medium tracking-wide mb-6 text-stone-700 uppercase">
            Where support goes
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: Server, label: 'Encrypted cloud memory & backups', desc: 'Your data, stored safely' },
              { icon: Shield, label: 'Security & maintenance', desc: 'Keeping the system safe and current' },
              { icon: Users, label: 'Human stewardship', desc: 'Real people, not bots, caring for the community' },
              { icon: Heart, label: 'Continued development', desc: 'Making Soullab better without making it extractive' },
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

        {/* Divider */}
        <div className="flex items-center gap-6 mb-12">
          <div className="flex-1 h-px bg-stone-200/60" />
          <span className="text-[11px] uppercase tracking-[0.2em] text-stone-400">Trust commitments</span>
          <div className="flex-1 h-px bg-stone-200/60" />
        </div>

        {/* Data Never Hostage */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h3 className="text-lg font-medium mb-6 text-stone-800">
            Your data is never held hostage.
          </h3>
          <p className="text-[14px] text-stone-500 mb-6">
            This is a commitment, not a marketing line.
          </p>
          <div className="space-y-4">
            {[
              {
                icon: Download,
                title: 'Export anytime',
                desc: 'Your reflections, journals, and memories belong to you. Download them in readable formats (JSON, Markdown) whenever you want.'
              },
              {
                icon: Clock,
                title: '90-day notice',
                desc: 'If any cloud service is ever discontinued, you\'ll have at least 90 days warning and full export access.'
              },
              {
                icon: Shield,
                title: 'Local keeps working',
                desc: 'The local system doesn\'t depend on us. If Soullab the company disappeared tomorrow, your local MAIA would still function.'
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex gap-4 p-5 rounded-xl border border-stone-200/60 bg-white/40"
              >
                <item.icon className="w-5 h-5 text-[#6b5a98] flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <p className="text-[13px] font-medium text-stone-700 mb-1">{item.title}</p>
                  <p className="text-[13px] text-stone-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* No Dark Patterns */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="p-6 rounded-xl border border-stone-200/60 bg-white/40">
            <h4 className="text-[13px] font-medium text-stone-700 mb-3">No dark patterns.</h4>
            <p className="text-[13px] text-stone-500 leading-relaxed">
              No artificial urgency. No &quot;limited time&quot; pressure. No degrading your
              experience to force an upgrade. No selling your data. No ads. Ever.
            </p>
          </div>
        </motion.section>

        {/* Divider */}
        <div className="flex items-center gap-6 mb-12">
          <div className="flex-1 h-px bg-stone-200/60" />
          <span className="text-[11px] uppercase tracking-[0.2em] text-stone-400">The invitation</span>
          <div className="flex-1 h-px bg-stone-200/60" />
        </div>

        {/* Invitation */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <p className="text-[15px] leading-relaxed text-stone-600 mb-4">
            If Soullab is useful to you, and you&apos;re in a position to contribute, supporting
            the cloud infrastructure helps keep the system healthy for everyone.
          </p>
          <p className="text-[15px] leading-relaxed text-stone-600 mb-8">
            If you can&apos;t right now, you&apos;re still welcome here. That&apos;s not a polite
            gesture — it&apos;s the design.
          </p>
          <button
            onClick={() => router.push('/membership')}
            className="px-6 py-3 rounded-lg bg-[#5a7a6f] hover:bg-[#4a6a5f] text-white text-[13px] font-medium tracking-wide transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            View membership options
          </button>
        </motion.section>

        {/* Mission */}
        <motion.section
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <div className="p-6 rounded-xl border border-[#6b5a98]/20 bg-[#6b5a98]/5">
            <h4 className="text-[13px] font-medium text-stone-700 mb-3">Beyond the product</h4>
            <p className="text-[13px] text-stone-600 leading-relaxed mb-3">
              Soullab exists to prove that reflective technology doesn&apos;t have to extract
              from the people it serves.
            </p>
            <p className="text-[13px] text-stone-500 leading-relaxed">
              Some contributions support broader work: scholarships for members who can&apos;t pay,
              research into ethical memory systems, and community stewardship.
            </p>
          </div>
        </motion.section>

        {/* Closing */}
        <motion.div
          className="text-center pt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <p className="text-[13px] italic text-stone-400">
            This is a long game. Thank you for being part of it.
          </p>
        </motion.div>

        {/* Footer */}
        <SupportFooter theme="light" />
      </main>
    </div>
  );
}

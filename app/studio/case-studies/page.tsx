'use client';

import { motion } from 'framer-motion';
import { Users, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { PortalCaseStudyShowcase } from '@/lib/consciousness/alchemy/portals/components/PortalCaseStudyShowcase';

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen bg-[#1a1a2e] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link
            href="/studio/tools"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Tools
          </Link>
          <h1 className="text-2xl font-semibold text-white flex items-center gap-3">
            <Users className="w-6 h-6 text-amber-400" />
            Portal Case Studies
          </h1>
          <p className="text-slate-400 mt-1 max-w-2xl">
            13 imagineer scenarios showing how MAIA adapts to different cultural contexts.
            Use these to understand the range of client journeys and identify which portals align with your practice.
          </p>
        </motion.div>

        {/* Case Study Showcase */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <PortalCaseStudyShowcase />
        </motion.div>
      </div>
    </div>
  );
}

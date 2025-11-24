'use client';

import React from 'react';
import { motion } from 'framer-motion';
import AudioUnlockDashboard from '@/components/dashboard/AudioUnlockDashboard';

export default function AudioAnalyticsDashboard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <AudioUnlockDashboard />
    </motion.div>
  );
}
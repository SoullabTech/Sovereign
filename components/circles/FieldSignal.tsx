'use client';

import { motion } from 'framer-motion';

const ELEMENT_COLORS: Record<string, string> = {
  water: 'bg-blue-400',
  fire: 'bg-amber-400',
  earth: 'bg-emerald-400',
  air: 'bg-sky-300',
  aether: 'bg-violet-400',
};

interface FieldSignalProps {
  description: string;
  element: string;
}

export function FieldSignal({ description, element }: FieldSignalProps) {
  const dotColor = ELEMENT_COLORS[element] || 'bg-maia-ink-40';

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex items-start gap-2.5 py-1"
    >
      <span
        className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${dotColor} opacity-70`}
      />
      <span className="text-sm text-maia-ink-60 leading-relaxed">
        {description}
      </span>
    </motion.div>
  );
}

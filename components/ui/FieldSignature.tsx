"use client";

import { motion } from 'framer-motion';

type Element = 'fire' | 'water' | 'earth' | 'air' | 'aether' | 'neutral';

interface FieldSignatureProps {
  className?: string;
  delay?: number;
  element?: Element;
}

/**
 * Field Signature - Recurring presence reminder
 * "Return to presence. The field listens."
 *
 * A subtle footer that appears throughout the platform as a soft pulse beneath pages,
 * reminding users of the core ethic without demanding attention.
 *
 * The line shifts subtly with each element, deepening the sense that the field is alive.
 */

const elementalSignatures: Record<Element, string> = {
  fire: "Return to presence. The field ignites.",
  water: "Return to presence. The field flows.",
  earth: "Return to presence. The field holds.",
  air: "Return to presence. The field whispers.",
  aether: "Return to presence. The field harmonizes.",
  neutral: "Return to presence. The field listens."
};

export function FieldSignature({
  className = "",
  delay = 0,
  element = 'neutral'
}: FieldSignatureProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.6 }}
      transition={{ duration: 1.5, delay }}
      className={`text-center py-8 ${className}`}
    >
      <p className="text-sm text-soul-textTertiary italic tracking-wide">
        {elementalSignatures[element]}
      </p>
    </motion.div>
  );
}

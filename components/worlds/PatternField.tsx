'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type PatternNode = {
  id: string;
  label: string;
  reflection: string;
  x: number;
  y: number;
  size: number;
  intensity: 'low' | 'medium' | 'high';
  cluster?: 'relational' | 'emotional' | 'cognitive';
};

const PATTERN_NODES: PatternNode[] = [
  {
    id: 'move-withdraw',
    label: 'You move closer, then pull back',
    reflection:
      'Something in you reaches toward contact, then retreats when it begins to feel real.',
    x: 18,
    y: 22,
    size: 132,
    intensity: 'high',
    cluster: 'relational',
  },
  {
    id: 'wait-for-certainty',
    label: 'You wait for clarity before acting',
    reflection:
      'You keep looking for the point at which uncertainty disappears, and action gets postponed there.',
    x: 64,
    y: 18,
    size: 116,
    intensity: 'medium',
    cluster: 'cognitive',
  },
  {
    id: 'return-to-same-question',
    label: 'You revisit the same question',
    reflection:
      'The question returns because it is not only intellectual. Something deeper is still trying to resolve through it.',
    x: 42,
    y: 42,
    size: 148,
    intensity: 'high',
    cluster: 'cognitive',
  },
  {
    id: 'hold-then-overwhelm',
    label: 'You hold a lot before it surfaces',
    reflection:
      'What looks calm on the outside often gathers underneath until it becomes harder to contain.',
    x: 78,
    y: 52,
    size: 126,
    intensity: 'medium',
    cluster: 'emotional',
  },
  {
    id: 'circle-back',
    label: 'You circle back to what matters',
    reflection:
      'Even when you move away from it, something essential keeps drawing your attention back.',
    x: 20,
    y: 64,
    size: 110,
    intensity: 'low',
    cluster: 'relational',
  },
  {
    id: 'hesitate-at-threshold',
    label: 'You hesitate at the threshold',
    reflection:
      'The shift is often not in deciding what matters, but in crossing the point where it asks something of you.',
    x: 56,
    y: 72,
    size: 138,
    intensity: 'medium',
    cluster: 'emotional',
  },
];

function getGlow(intensity: PatternNode['intensity'], isActive: boolean) {
  if (isActive) {
    return '0 0 0 1px rgba(251,191,36,0.22), 0 0 30px rgba(251,191,36,0.22), 0 0 60px rgba(245,158,11,0.12)';
  }

  switch (intensity) {
    case 'high':
      return '0 0 0 1px rgba(251,191,36,0.16), 0 0 24px rgba(245,158,11,0.16)';
    case 'medium':
      return '0 0 0 1px rgba(255,255,255,0.06), 0 0 18px rgba(255,255,255,0.05)';
    case 'low':
      return '0 0 0 1px rgba(255,255,255,0.04), 0 0 12px rgba(255,255,255,0.04)';
    default:
      return '0 0 0 1px rgba(255,255,255,0.05)';
  }
}

function getOpacity(
  node: PatternNode,
  activeId: string | null,
  relatedIds: Set<string>
) {
  if (!activeId)
    return node.intensity === 'high'
      ? 0.95
      : node.intensity === 'medium'
        ? 0.8
        : 0.62;
  if (node.id === activeId) return 1;
  if (relatedIds.has(node.id)) return 0.72;
  return 0.34;
}

export default function PatternField() {
  const [activeId, setActiveId] = useState<string | null>(
    PATTERN_NODES[2]?.id ?? null
  );

  const activeNode = useMemo(
    () => PATTERN_NODES.find((node) => node.id === activeId) ?? null,
    [activeId]
  );

  const relatedIds = useMemo(() => {
    if (!activeNode?.cluster) return new Set<string>();

    return new Set(
      PATTERN_NODES.filter(
        (node) => node.id !== activeNode.id && node.cluster === activeNode.cluster
      ).map((node) => node.id)
    );
  }, [activeNode]);

  return (
    <div className="relative w-full">
      <div className="mb-8 text-center">
        <p className="text-sm italic tracking-wide text-white/48">
          Something keeps returning.
        </p>
      </div>

      <div className="relative overflow-hidden rounded-[32px] border border-white/[0.06] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),rgba(255,255,255,0.01)_35%,rgba(0,0,0,0)_70%)] min-h-[620px]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.06),transparent_40%),radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.03),transparent_30%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.02),transparent_28%)]" />

        {PATTERN_NODES.map((node, index) => {
          const isActive = node.id === activeId;
          const isRelated = relatedIds.has(node.id);

          return (
            <motion.button
              key={node.id}
              type="button"
              onClick={() => setActiveId(node.id)}
              onMouseEnter={() => setActiveId(node.id)}
              className="absolute rounded-full text-left focus:outline-none"
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                width: `${node.size}px`,
                height: `${node.size}px`,
                transform: 'translate(-50%, -50%)',
                opacity: getOpacity(node, activeId, relatedIds),
                boxShadow: getGlow(node.intensity, isActive),
              }}
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{
                opacity: getOpacity(node, activeId, relatedIds),
                scale: isActive ? 1.04 : isRelated ? 1.01 : 1,
                y: [0, index % 2 === 0 ? -4 : 4, 0],
              }}
              transition={{
                opacity: { duration: 0.3 },
                scale: { duration: 0.3 },
                y: {
                  duration: 11 + index,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
              }}
            >
              <div className="flex h-full w-full items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] px-5 text-center backdrop-blur-md transition-colors">
                <span
                  className={`text-[13px] leading-5 ${
                    isActive ? 'text-white/[0.92]' : 'text-white/70'
                  }`}
                >
                  {node.label}
                </span>
              </div>
            </motion.button>
          );
        })}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#070b14] to-transparent" />
      </div>

      <div className="mt-8 min-h-[136px]">
        <AnimatePresence mode="wait">
          {activeNode ? (
            <motion.div
              key={activeNode.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.24 }}
              className="mx-auto max-w-2xl rounded-[28px] border border-white/[0.06] bg-white/[0.03] px-6 py-5 backdrop-blur-md"
            >
              <p className="text-sm leading-7 text-white/[0.78]">
                {activeNode.reflection}
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="mt-10 text-center">
        <p className="mx-auto max-w-2xl text-sm leading-7 text-white/[0.45]">
          You&apos;re not stuck. Something is trying to resolve.
        </p>
      </div>
    </div>
  );
}

'use client';

/**
 * REACTION BAR
 *
 * Engagement reactions component using geometric symbols instead of emojis.
 * Follows Soullab Design Canon - sage, violet, gold color palette,
 * refined typography, subtle hover states.
 */

import React, { useState } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export type ReactionType = 'resonance' | 'insight' | 'gratitude' | 'breakthrough' | 'support';

export interface Reaction {
  type: ReactionType;
  count: number;
  hasReacted?: boolean;
}

export interface ReactionBarProps {
  reactions: Reaction[];
  onReact?: (type: ReactionType) => void;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  showAddButton?: boolean;
  className?: string;
}

// ============================================================================
// GEOMETRIC REACTION SYMBOLS
// ============================================================================

/** Resonance - Concentric circles (alignment, harmony) */
const ResonanceSymbol = ({ className = '' }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.5" />
  </svg>
);

/** Insight - Diamond/rhombus (clarity, perception) */
const InsightSymbol = ({ className = '' }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M12 2L22 12L12 22L2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

/** Gratitude - Open flower/bloom (appreciation, growth) */
const GratitudeSymbol = ({ className = '' }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v4" />
    <path d="M12 18v4" />
    <path d="M4.93 4.93l2.83 2.83" />
    <path d="M16.24 16.24l2.83 2.83" />
    <path d="M2 12h4" />
    <path d="M18 12h4" />
    <path d="M4.93 19.07l2.83-2.83" />
    <path d="M16.24 7.76l2.83-2.83" />
  </svg>
);

/** Breakthrough - Starburst (transformation, revelation) */
const BreakthroughSymbol = ({ className = '' }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M12 2l2 6 6-2-4 5 4 5-6-2-2 6-2-6-6 2 4-5-4-5 6 2z" />
  </svg>
);

/** Support - Interlocking circles (connection, solidarity) */
const SupportSymbol = ({ className = '' }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <circle cx="9" cy="12" r="6" />
    <circle cx="15" cy="12" r="6" />
  </svg>
);

// ============================================================================
// REACTION CONFIG
// ============================================================================

interface ReactionConfig {
  symbol: React.FC<{ className?: string }>;
  label: string;
  color: string; // Active color
  hoverColor: string;
  bgColor: string;
  activeBgColor: string;
}

const REACTION_CONFIG: Record<ReactionType, ReactionConfig> = {
  resonance: {
    symbol: ResonanceSymbol,
    label: 'Resonance',
    color: 'text-[#5a7a6f]',
    hoverColor: 'hover:text-[#4a6a5f]',
    bgColor: 'bg-stone-100/50',
    activeBgColor: 'bg-[#5a7a6f]/15'
  },
  insight: {
    symbol: InsightSymbol,
    label: 'Insight',
    color: 'text-[#6b5a98]',
    hoverColor: 'hover:text-[#5b4a88]',
    bgColor: 'bg-stone-100/50',
    activeBgColor: 'bg-[#6b5a98]/15'
  },
  gratitude: {
    symbol: GratitudeSymbol,
    label: 'Gratitude',
    color: 'text-[#8a7a5a]',
    hoverColor: 'hover:text-[#7a6a4a]',
    bgColor: 'bg-stone-100/50',
    activeBgColor: 'bg-[#8a7a5a]/15'
  },
  breakthrough: {
    symbol: BreakthroughSymbol,
    label: 'Breakthrough',
    color: 'text-[#8a7a5a]',
    hoverColor: 'hover:text-[#7a6a4a]',
    bgColor: 'bg-stone-100/50',
    activeBgColor: 'bg-[#8a7a5a]/20'
  },
  support: {
    symbol: SupportSymbol,
    label: 'Support',
    color: 'text-[#5a7a6f]',
    hoverColor: 'hover:text-[#4a6a5f]',
    bgColor: 'bg-stone-100/50',
    activeBgColor: 'bg-[#5a7a6f]/15'
  }
};

// ============================================================================
// SINGLE REACTION BUTTON
// ============================================================================

interface ReactionButtonProps {
  reaction: Reaction;
  config: ReactionConfig;
  size: 'sm' | 'md' | 'lg';
  showLabel: boolean;
  onClick?: () => void;
}

function ReactionButton({
  reaction,
  config,
  size,
  showLabel,
  onClick
}: ReactionButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    sm: {
      button: 'px-2 py-1 gap-1',
      icon: 'w-3.5 h-3.5',
      text: 'text-[11px]'
    },
    md: {
      button: 'px-2.5 py-1.5 gap-1.5',
      icon: 'w-4 h-4',
      text: 'text-[12px]'
    },
    lg: {
      button: 'px-3 py-2 gap-2',
      icon: 'w-5 h-5',
      text: 'text-[13px]'
    }
  };

  const Symbol = config.symbol;
  const isActive = reaction.hasReacted;
  const sizes = sizeClasses[size];

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        flex items-center ${sizes.button} rounded-lg
        ${isActive ? config.activeBgColor : config.bgColor}
        ${isActive ? config.color : 'text-stone-400'}
        ${!isActive && config.hoverColor}
        border border-stone-200/40
        hover:border-stone-200/60
        transition-all duration-200
        ${isActive ? 'scale-[1.02]' : 'hover:scale-[1.01]'}
      `}
      title={config.label}
    >
      <Symbol
        className={`
          ${sizes.icon}
          ${isActive || isHovered ? config.color : 'text-stone-400'}
          transition-colors
        `}
      />
      {reaction.count > 0 && (
        <span
          className={`
            ${sizes.text} tracking-wide font-medium
            ${isActive ? config.color : 'text-stone-500'}
          `}
        >
          {reaction.count}
        </span>
      )}
      {showLabel && (
        <span
          className={`
            ${sizes.text} tracking-wide
            ${isActive ? config.color : 'text-stone-400'}
          `}
        >
          {config.label}
        </span>
      )}
    </button>
  );
}

// ============================================================================
// ADD REACTION BUTTON
// ============================================================================

interface AddReactionButtonProps {
  size: 'sm' | 'md' | 'lg';
  onSelect?: (type: ReactionType) => void;
}

function AddReactionButton({ size, onSelect }: AddReactionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-7 h-7',
    lg: 'w-8 h-8'
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          ${sizeClasses[size]} rounded-full
          bg-stone-100/50 border border-stone-200/40
          hover:bg-stone-100 hover:border-stone-200/60
          flex items-center justify-center
          text-stone-400 hover:text-stone-500
          transition-all
        `}
        title="Add reaction"
      >
        <svg
          viewBox="0 0 24 24"
          className={iconSizeClasses[size]}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {/* Reaction picker dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Picker */}
          <div className="absolute bottom-full left-0 mb-2 z-20">
            <div className="bg-white/95 backdrop-blur-sm border border-stone-200/60 rounded-xl p-2 shadow-lg">
              <div className="flex gap-1">
                {(Object.keys(REACTION_CONFIG) as ReactionType[]).map((type) => {
                  const config = REACTION_CONFIG[type];
                  const Symbol = config.symbol;

                  return (
                    <button
                      key={type}
                      onClick={() => {
                        onSelect?.(type);
                        setIsOpen(false);
                      }}
                      className={`
                        p-2 rounded-lg
                        bg-stone-50 hover:${config.activeBgColor}
                        text-stone-400 ${config.hoverColor}
                        transition-all hover:scale-110
                      `}
                      title={config.label}
                    >
                      <Symbol className="w-5 h-5" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ReactionBar({
  reactions,
  onReact,
  size = 'md',
  showLabels = false,
  showAddButton = true,
  className = ''
}: ReactionBarProps) {
  // Filter to only show reactions with counts > 0 or that user has reacted to
  const visibleReactions = reactions.filter(r => r.count > 0 || r.hasReacted);

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {visibleReactions.map((reaction) => (
        <ReactionButton
          key={reaction.type}
          reaction={reaction}
          config={REACTION_CONFIG[reaction.type]}
          size={size}
          showLabel={showLabels}
          onClick={() => onReact?.(reaction.type)}
        />
      ))}

      {showAddButton && (
        <AddReactionButton
          size={size}
          onSelect={onReact}
        />
      )}

      {visibleReactions.length === 0 && !showAddButton && (
        <span className="text-[12px] tracking-wide text-stone-400">
          No reactions yet
        </span>
      )}
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  ResonanceSymbol,
  InsightSymbol,
  GratitudeSymbol,
  BreakthroughSymbol,
  SupportSymbol,
  ReactionButton,
  AddReactionButton,
  REACTION_CONFIG
};

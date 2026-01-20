'use client';

/**
 * Ethos Footer
 *
 * A subtle footer line that appears across key pages.
 * Communicates MAIA's approach to support without being promotional.
 *
 * "Exploration is always free. Support helps us keep memory alive."
 */

import Link from 'next/link';

interface EthosFooterProps {
  /** Link to learn more (defaults to membership page) */
  learnMoreHref?: string;
  /** Whether to show the "Learn more" link */
  showLearnMore?: boolean;
  /** Day/light mode styling */
  isDayMode?: boolean;
  /** Additional class names */
  className?: string;
  /** Variant: 'subtle' is just the text, 'card' has a background */
  variant?: 'subtle' | 'card';
}

export default function EthosFooter({
  learnMoreHref = '/maia/membership',
  showLearnMore = false,
  isDayMode = false,
  className = '',
  variant = 'subtle',
}: EthosFooterProps) {
  const content = (
    <>
      <p className={`text-sm italic ${isDayMode ? 'text-stone-500' : 'text-stone-500'}`}>
        Exploration is always free. Support helps us keep memory alive.
      </p>
      {showLearnMore && (
        <Link
          href={learnMoreHref}
          className={`text-xs mt-1 inline-block transition-colors ${
            isDayMode
              ? 'text-violet-600 hover:text-violet-700 underline-offset-2 hover:underline'
              : 'text-violet-400 hover:text-violet-300 underline-offset-2 hover:underline'
          }`}
        >
          Learn why →
        </Link>
      )}
    </>
  );

  if (variant === 'card') {
    return (
      <div
        className={`p-4 rounded-xl text-center ${
          isDayMode
            ? 'bg-stone-100/50 border border-stone-200/50'
            : 'bg-stone-800/30 border border-stone-700/30'
        } ${className}`}
      >
        {content}
      </div>
    );
  }

  return (
    <div className={`text-center py-4 ${className}`}>
      {content}
    </div>
  );
}

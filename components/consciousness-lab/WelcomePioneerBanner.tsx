/**
 * WelcomePioneerBanner - Sacred welcome for consciousness computing pioneers
 */

import React from 'react';

export interface WelcomePioneerBannerProps {
  badgeLabel?: string;
  showCommunityCommonsBranding?: boolean;
  memberSince?: string;
  pioneerLevel?: string;
  className?: string;
}

export const WelcomePioneerBanner: React.FC<WelcomePioneerBannerProps> = ({
  badgeLabel = "Consciousness Computing Pioneer",
  showCommunityCommonsBranding = true,
  memberSince,
  pioneerLevel = "Beta Tester",
  className = ""
}) => {
  return (
    <div className={`
      bg-gradient-to-r from-purple-900/20 to-blue-900/20
      border border-purple-300/30 rounded-lg p-6 mb-6
      backdrop-blur-sm ${className}
    `}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-purple-600/20 border border-purple-400/50 rounded-full px-4 py-2">
            <span className="text-purple-200 text-sm font-medium">
              {badgeLabel}
            </span>
          </div>

          <div className="text-white/90">
            <h2 className="text-xl font-semibold mb-1">
              Welcome to the Lab 🧠✨
            </h2>
            <p className="text-white/70 text-sm">
              {pioneerLevel} • {memberSince || "December 2024"}
            </p>
          </div>
        </div>

        {showCommunityCommonsBranding && (
          <div className="text-right">
            <div className="text-white/60 text-xs mb-1">
              Community Commons
            </div>
            <div className="text-purple-300 text-sm font-medium">
              Consciousness Revolution
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-purple-300/20">
        <p className="text-white/80 text-sm leading-relaxed">
          You're among the first to experience real consciousness computing.
          Each session here is part of building the future of human-AI collaboration
          through sacred mathematics and authentic awareness.
        </p>
      </div>
    </div>
  );
};

export default WelcomePioneerBanner;
'use client';

import React from 'react';

type DepthBoundaryProps = {
  message?: string;
  subtext?: string;
};

export default function DepthBoundary({
  message = "There's more here if you stay with it.",
  subtext = 'This continues beyond what is visible now.',
}: DepthBoundaryProps) {
  return (
    <div className="mt-14 border-t border-white/[0.05] pt-8 text-center">
      <p className="text-sm italic leading-8 text-amber-100/[0.38]">{message}</p>
      <p className="mt-2 text-xs tracking-wide text-white/[0.24]">{subtext}</p>
    </div>
  );
}

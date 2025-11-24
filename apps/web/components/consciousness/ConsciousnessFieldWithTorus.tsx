'use client';

import React from 'react';

interface ConsciousnessFieldWithTorusProps {
  children?: React.ReactNode;
  size?: number;
  showLabels?: boolean;
  animate?: boolean;
  className?: string;
}

export default function ConsciousnessFieldWithTorus({
  children,
  size = 1300,
  showLabels = false,
  animate = true,
  className = ''
}: ConsciousnessFieldWithTorusProps) {
  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Render the Sacred House Wheel and other children */}
      {children}
    </div>
  );
}
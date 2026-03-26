'use client';

import Link from 'next/link';
import type { CTAStyle } from '@/lib/field/types';

interface FieldCTAProps {
  label: string;
  href: string;
  style: CTAStyle;
  className?: string;
}

export default function FieldCTA({ label, href, style, className = '' }: FieldCTAProps) {
  if (style === 'direct') {
    return (
      <Link
        href={href}
        className={`inline-flex items-center justify-center px-6 py-3 rounded-sm text-sm font-medium transition-opacity duration-300 hover:opacity-80 ${className}`}
        style={{
          backgroundColor: 'var(--field-color-primary)',
          color: 'var(--field-color-bg)',
        }}
      >
        {label}
      </Link>
    );
  }

  if (style === 'invitation') {
    return (
      <Link
        href={href}
        className={`inline-flex items-center justify-center px-6 py-3 rounded-sm text-sm font-medium border transition-all duration-300 hover:opacity-90 ${className}`}
        style={{
          borderColor: 'var(--field-color-primary)',
          color: 'var(--field-color-primary)',
        }}
      >
        {label}
      </Link>
    );
  }

  // exploration — text link with arrow
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 text-sm transition-opacity duration-300 hover:opacity-70 ${className}`}
      style={{ color: 'var(--field-color-primary)' }}
    >
      {label}
      <span aria-hidden>→</span>
    </Link>
  );
}

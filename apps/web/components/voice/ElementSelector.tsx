'use client';

import React from 'react';

export type Element = 'fire' | 'water' | 'earth' | 'air' | 'aether';

interface ElementSelectorProps {
  value: Element;
  onChange: (element: Element) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const ELEMENTS: { value: Element; label: string; emoji: string }[] = [
  { value: 'aether', label: 'Aether', emoji: '✨' },
  { value: 'fire', label: 'Fire', emoji: '🔥' },
  { value: 'water', label: 'Water', emoji: '💧' },
  { value: 'earth', label: 'Earth', emoji: '🌍' },
  { value: 'air', label: 'Air', emoji: '💨' },
];

export default function ElementSelector({
  value,
  onChange,
  disabled = false,
  size = 'md'
}: ElementSelectorProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  };

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Element)}
      disabled={disabled}
      className={`${sizeClasses[size]} rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {ELEMENTS.map((element) => (
        <option key={element.value} value={element.value}>
          {element.emoji} {element.label}
        </option>
      ))}
    </select>
  );
}
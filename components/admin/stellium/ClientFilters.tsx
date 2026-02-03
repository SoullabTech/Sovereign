"use client";

/**
 * CLIENT FILTERS
 *
 * Filtering options for the client library
 * Tags, sun signs, elements, status
 *
 * Design: Chip-based selection, visual clarity
 */

import React from 'react';
import { X } from 'lucide-react';

export interface FilterState {
  search: string;
  tags: string[];
  sunSigns: string[];
  elements: string[];
  status: 'all' | 'active' | 'inactive' | 'archived' | 'waitlist';
}

interface ClientFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  availableTags: string[];
  availableSunSigns: string[];
}

const colors = {
  void: '#0D0B14',
  cosmos: '#1A1625',
  nebula: '#251F33',
  stardust: '#2D2640',
  gold: '#E5C158',
  violet: '#B8A5D9',
  celestialBlue: '#79c0ff',
  starlight: '#FFFFFF',
  muted: '#C8BDE0',
  dim: '#9A8FB8',
  fire: '#FF6B6B',
  earth: '#8BC34A',
  air: '#64B5F6',
  water: '#26C6DA',
};

const ELEMENTS = ['Fire', 'Earth', 'Air', 'Water'];
const ELEMENT_COLORS: Record<string, string> = {
  Fire: colors.fire,
  Earth: colors.earth,
  Air: colors.air,
  Water: colors.water,
};

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'waitlist', label: 'Waitlist' },
  { value: 'archived', label: 'Archived' },
];

const SIGN_GLYPHS: Record<string, string> = {
  'Aries': '♈', 'Taurus': '♉', 'Gemini': '♊', 'Cancer': '♋',
  'Leo': '♌', 'Virgo': '♍', 'Libra': '♎', 'Scorpio': '♏',
  'Sagittarius': '♐', 'Capricorn': '♑', 'Aquarius': '♒', 'Pisces': '♓'
};

export function ClientFilters({
  filters,
  onChange,
  availableTags,
  availableSunSigns,
}: ClientFiltersProps) {

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    onChange({ ...filters, tags: newTags });
  };

  const toggleSunSign = (sign: string) => {
    const newSigns = filters.sunSigns.includes(sign)
      ? filters.sunSigns.filter(s => s !== sign)
      : [...filters.sunSigns, sign];
    onChange({ ...filters, sunSigns: newSigns });
  };

  const toggleElement = (element: string) => {
    const newElements = filters.elements.includes(element)
      ? filters.elements.filter(e => e !== element)
      : [...filters.elements, element];
    onChange({ ...filters, elements: newElements });
  };

  const clearAll = () => {
    onChange({
      search: filters.search, // Keep search
      tags: [],
      sunSigns: [],
      elements: [],
      status: 'active',
    });
  };

  const hasFilters = filters.tags.length > 0 ||
    filters.sunSigns.length > 0 ||
    filters.elements.length > 0 ||
    filters.status !== 'active';

  return (
    <div
      className="rounded-xl p-5 space-y-5"
      style={{
        backgroundColor: `${colors.nebula}50`,
        border: `1px solid ${colors.stardust}`,
      }}
    >
      {/* Status Filter */}
      <div>
        <label className="text-xs font-medium mb-2 block" style={{ color: colors.dim }}>
          Status
        </label>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map(option => (
            <button
              key={option.value}
              onClick={() => onChange({ ...filters, status: option.value as FilterState['status'] })}
              className="px-3 py-1.5 rounded-lg text-xs transition-colors"
              style={{
                backgroundColor: filters.status === option.value
                  ? `${colors.celestialBlue}30`
                  : `${colors.stardust}40`,
                color: filters.status === option.value
                  ? colors.celestialBlue
                  : colors.muted,
                border: `1px solid ${filters.status === option.value
                  ? colors.celestialBlue
                  : 'transparent'}`,
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Element Filter */}
      <div>
        <label className="text-xs font-medium mb-2 block" style={{ color: colors.dim }}>
          Element
        </label>
        <div className="flex flex-wrap gap-2">
          {ELEMENTS.map(element => (
            <button
              key={element}
              onClick={() => toggleElement(element)}
              className="px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center space-x-1.5"
              style={{
                backgroundColor: filters.elements.includes(element)
                  ? `${ELEMENT_COLORS[element]}30`
                  : `${colors.stardust}40`,
                color: filters.elements.includes(element)
                  ? ELEMENT_COLORS[element]
                  : colors.muted,
                border: `1px solid ${filters.elements.includes(element)
                  ? ELEMENT_COLORS[element]
                  : 'transparent'}`,
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: ELEMENT_COLORS[element] }}
              />
              <span>{element}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sun Sign Filter */}
      {availableSunSigns.length > 0 && (
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: colors.dim }}>
            Sun Sign
          </label>
          <div className="flex flex-wrap gap-2">
            {availableSunSigns.map(sign => (
              <button
                key={sign}
                onClick={() => toggleSunSign(sign)}
                className="px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center space-x-1"
                style={{
                  backgroundColor: filters.sunSigns.includes(sign)
                    ? `${colors.gold}30`
                    : `${colors.stardust}40`,
                  color: filters.sunSigns.includes(sign)
                    ? colors.gold
                    : colors.muted,
                  border: `1px solid ${filters.sunSigns.includes(sign)
                    ? colors.gold
                    : 'transparent'}`,
                }}
              >
                <span>{SIGN_GLYPHS[sign]}</span>
                <span>{sign}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tags Filter */}
      {availableTags.length > 0 && (
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: colors.dim }}>
            Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className="px-3 py-1.5 rounded-lg text-xs transition-colors"
                style={{
                  backgroundColor: filters.tags.includes(tag)
                    ? `${colors.violet}30`
                    : `${colors.stardust}40`,
                  color: filters.tags.includes(tag)
                    ? colors.violet
                    : colors.muted,
                  border: `1px solid ${filters.tags.includes(tag)
                    ? colors.violet
                    : 'transparent'}`,
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Clear Filters */}
      {hasFilters && (
        <div className="pt-3 border-t" style={{ borderColor: `${colors.stardust}60` }}>
          <button
            onClick={clearAll}
            className="flex items-center space-x-1 text-xs"
            style={{ color: colors.celestialBlue }}
          >
            <X className="w-3 h-3" />
            <span>Clear filters</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default ClientFilters;

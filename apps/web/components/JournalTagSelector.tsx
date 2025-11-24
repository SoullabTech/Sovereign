"use client";

import React, { useState, useRef, useEffect } from 'react';
import { X, Hash, Plus } from 'lucide-react';

interface JournalTag {
  id: string;
  label: string;
  color?: string;
  suggested?: boolean;
}

interface JournalTagSelectorProps {
  tags: JournalTag[];
  onTagsChange: (tags: JournalTag[]) => void;
  suggestedTags?: JournalTag[];
  element?: string;
  phase?: string;
  disabled?: boolean;
  className?: string;
}

export default function JournalTagSelector({
  tags,
  onTagsChange,
  suggestedTags = [],
  element,
  phase,
  disabled = false,
  className = '',
}: JournalTagSelectorProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Default suggested tags based on common patterns
  const defaultSuggestedTags: JournalTag[] = [
    { id: 'work', label: 'work', color: 'bg-blue-100 text-blue-700' },
    { id: 'dream', label: 'dream', color: 'bg-amber-100 text-amber-700' },
    { id: 'feeling', label: 'feeling', color: 'bg-pink-100 text-pink-700' },
    { id: 'insight', label: 'insight', color: 'bg-yellow-100 text-yellow-700' },
    { id: 'relationship', label: 'relationship', color: 'bg-green-100 text-green-700' },
    { id: 'stress', label: 'stress', color: 'bg-red-100 text-red-700' },
    { id: 'gratitude', label: 'gratitude', color: 'bg-emerald-100 text-emerald-700' },
    { id: 'reflection', label: 'reflection', color: 'bg-indigo-100 text-indigo-700' },
  ];

  const allSuggestedTags = [...suggestedTags, ...defaultSuggestedTags];

  // Filter suggestions based on input and existing tags
  const filteredSuggestions = allSuggestedTags.filter(tag =>
    !tags.some(existingTag => existingTag.id === tag.id) &&
    tag.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  // Add tag from input
  const handleAddTag = (tagInput: string) => {
    const tagText = tagInput.trim().replace(/^#/, '').toLowerCase();
    if (!tagText) return;

    // Check if tag already exists
    if (tags.some(tag => tag.id === tagText)) return;

    const newTag: JournalTag = {
      id: tagText,
      label: tagText,
      color: getTagColor(tagText),
    };

    onTagsChange([...tags, newTag]);
    setInputValue('');
    setShowSuggestions(false);
  };

  // Remove tag
  const handleRemoveTag = (tagId: string) => {
    onTagsChange(tags.filter(tag => tag.id !== tagId));
  };

  // Add suggested tag
  const handleAddSuggestedTag = (suggestedTag: JournalTag) => {
    if (tags.some(tag => tag.id === suggestedTag.id)) return;
    onTagsChange([...tags, suggestedTag]);
  };

  // Handle input key events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(inputValue);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  // Get color for tag based on content
  const getTagColor = (tagText: string): string => {
    const colorMap: Record<string, string> = {
      work: 'bg-blue-100 text-blue-700 border-blue-200',
      dream: 'bg-amber-100 text-amber-700 border-amber-200',
      feeling: 'bg-pink-100 text-pink-700 border-pink-200',
      emotion: 'bg-pink-100 text-pink-700 border-pink-200',
      insight: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      relationship: 'bg-green-100 text-green-700 border-green-200',
      stress: 'bg-red-100 text-red-700 border-red-200',
      anxiety: 'bg-red-100 text-red-700 border-red-200',
      gratitude: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      reflection: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      growth: 'bg-lime-100 text-lime-700 border-lime-200',
      challenge: 'bg-orange-100 text-orange-700 border-orange-200',
    };

    return colorMap[tagText] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  // Get elemental annotation display
  const getElementalAnnotation = () => {
    if (!element && !phase) return null;

    const elementEmoji = {
      fire: '🔥',
      water: '💧',
      earth: '🌍',
      air: '💨',
      aether: '✨',
    }[element as string] || '🔮';

    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-full text-xs font-medium text-yellow-800">
        <span>{elementEmoji}</span>
        <span>{element}</span>
        {phase && (
          <>
            <span>|</span>
            <span className="capitalize">{phase}</span>
          </>
        )}
      </div>
    );
  };

  return (
    <div className={`relative ${className}`}>
      {/* Current Tags + Elemental Annotation */}
      <div className="flex flex-wrap gap-2 mb-2">
        {/* Elemental Annotation */}
        {getElementalAnnotation()}
        
        {/* User Tags */}
        {tags.map(tag => (
          <div
            key={tag.id}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${tag.color || getTagColor(tag.label)}`}
          >
            <Hash size={10} />
            <span>{tag.label}</span>
            {!disabled && (
              <button
                onClick={() => handleRemoveTag(tag.id)}
                className="hover:bg-black/10 rounded-full p-0.5 transition-colors"
                title={`Remove ${tag.label} tag`}
              >
                <X size={12} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Tag Input */}
      {!disabled && (
        <div className="relative">
          <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg">
            <Hash size={14} className="text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setShowSuggestions(e.target.value.length > 0 || filteredSuggestions.length > 0);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Add tags... (press Enter or comma to add)"
              className="flex-1 bg-transparent outline-none text-sm placeholder-slate-500"
            />
            
            {inputValue && (
              <button
                onClick={() => handleAddTag(inputValue)}
                className="text-slate-500 hover:text-slate-700 transition-colors"
                title="Add tag"
              >
                <Plus size={16} />
              </button>
            )}
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
              <div className="p-2 text-xs text-slate-500 border-b border-slate-100">
                Suggested tags
              </div>
              {filteredSuggestions.slice(0, 8).map(tag => (
                <button
                  key={tag.id}
                  onClick={() => handleAddSuggestedTag(tag)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-slate-50 transition-colors text-sm"
                >
                  <Hash size={12} className="text-slate-400" />
                  <span>{tag.label}</span>
                  {tag.suggested && (
                    <span className="text-xs text-slate-500 ml-auto">suggested</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Instructions */}
      {!disabled && tags.length === 0 && (
        <div className="mt-2 text-xs text-slate-500">
          Add tags to organize your journal entries. Maya will also auto-detect the elemental and spiral phase.
        </div>
      )}
    </div>
  );
}
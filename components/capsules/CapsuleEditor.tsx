'use client';

/**
 * CapsuleEditor - Edit/view a Reflection Capsule
 *
 * Sections: Title, Summary, Gold Lines, Patterns, Next Steps, Practices, Source Excerpt
 * Warm Soullab language throughout.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Save,
  Pin,
  Check,
  X,
  Plus,
  Trash2,
} from 'lucide-react';
import type { CapsuleDTO, CapsuleUpdateInput } from '@/lib/capsules/types';

// Element config
const ELEMENTS = [
  { value: 'fire', label: 'Fire', emoji: '🔥', color: 'bg-red-400/20 text-red-500' },
  { value: 'water', label: 'Water', emoji: '💧', color: 'bg-blue-400/20 text-blue-500' },
  { value: 'earth', label: 'Earth', emoji: '🌍', color: 'bg-green-500/20 text-green-600' },
  { value: 'air', label: 'Air', emoji: '💨', color: 'bg-cyan-400/20 text-cyan-500' },
  { value: 'aether', label: 'Aether', emoji: '✨', color: 'bg-purple-400/20 text-purple-500' },
] as const;

interface CapsuleEditorProps {
  capsule: CapsuleDTO;
  onSave: (patch: CapsuleUpdateInput) => Promise<void>;
  onBringIntoLab?: () => Promise<void>;
  onPin?: (pinned: boolean) => Promise<void>;
  saving?: boolean;
}

export default function CapsuleEditor({
  capsule,
  onSave,
  onBringIntoLab,
  onPin,
  saving = false,
}: CapsuleEditorProps) {
  const [title, setTitle] = useState(capsule.title);
  const [summary, setSummary] = useState(capsule.summary);
  const [goldLines, setGoldLines] = useState(capsule.goldLines.map((g) => g.text));
  const [patterns, setPatterns] = useState(capsule.patterns.map((p) => p.name));
  const [nextSteps, setNextSteps] = useState(capsule.nextSteps.map((n) => n.text));
  const [element, setElement] = useState(capsule.signals?.element || '');
  const [showSource, setShowSource] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Track changes
  useEffect(() => {
    const changed =
      title !== capsule.title ||
      summary !== capsule.summary ||
      JSON.stringify(goldLines) !== JSON.stringify(capsule.goldLines.map((g) => g.text)) ||
      JSON.stringify(patterns) !== JSON.stringify(capsule.patterns.map((p) => p.name)) ||
      JSON.stringify(nextSteps) !== JSON.stringify(capsule.nextSteps.map((n) => n.text)) ||
      element !== (capsule.signals?.element || '');
    setDirty(changed);
  }, [title, summary, goldLines, patterns, nextSteps, element, capsule]);

  const handleSave = async () => {
    const patch: CapsuleUpdateInput = {
      title,
      summary,
      goldLines: goldLines.filter(Boolean),
      patterns: patterns.filter(Boolean),
      nextSteps: nextSteps.filter(Boolean),
      signals: element ? { ...capsule.signals, element: element as any } : capsule.signals,
    };
    await onSave(patch);
    setDirty(false);
  };

  const addItem = (
    items: string[],
    setItems: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setItems([...items, '']);
  };

  const updateItem = (
    items: string[],
    setItems: React.Dispatch<React.SetStateAction<string[]>>,
    index: number,
    value: string
  ) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const removeItem = (
    items: string[],
    setItems: React.Dispatch<React.SetStateAction<string[]>>,
    index: number
  ) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Draft Banner */}
      {capsule.draft && onBringIntoLab && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between bg-[#D4B896]/10 border border-[#D4B896]/20 rounded-xl p-4"
        >
          <div>
            <p className="text-[13px] font-medium text-stone-700">This is a draft reflection</p>
            <p className="text-[12px] text-stone-500">Review and bring it into the Lab when ready</p>
          </div>
          <button
            onClick={onBringIntoLab}
            className="flex items-center gap-2 px-4 py-2 bg-[#5a7a6f] hover:bg-[#4a6a5f] text-white rounded-lg text-[13px] tracking-wide transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Bring into the Lab
          </button>
        </motion.div>
      )}

      {/* Title */}
      <div>
        <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-2">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#5a7a6f]/20 focus:border-[#5a7a6f]"
        />
      </div>

      {/* Summary */}
      <div>
        <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-2">
          The Spirit
        </label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 text-[14px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#5a7a6f]/20 focus:border-[#5a7a6f] resize-none"
        />
      </div>

      {/* Element Selection */}
      <div>
        <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-2">
          Element
        </label>
        <div className="flex flex-wrap gap-2">
          {ELEMENTS.map((el) => (
            <button
              key={el.value}
              onClick={() => setElement(element === el.value ? '' : el.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] transition-all ${
                element === el.value
                  ? el.color + ' ring-1 ring-current'
                  : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
              }`}
            >
              <span>{el.emoji}</span>
              <span>{el.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Gold Lines */}
      <div>
        <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-2">
          Gold Lines
        </label>
        <p className="text-[12px] text-stone-500 mb-3">
          Verbatim moments that landed - clarity or breakthrough
        </p>
        <div className="space-y-2">
          {goldLines.map((line, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-[#D4B896] mt-3 flex-shrink-0" />
              <input
                type="text"
                value={line}
                onChange={(e) => updateItem(goldLines, setGoldLines, idx, e.target.value)}
                placeholder="A moment that landed..."
                className="flex-1 px-3 py-2 bg-[#D4B896]/5 border border-[#D4B896]/20 rounded-lg text-stone-700 text-[13px] italic focus:outline-none focus:ring-1 focus:ring-[#D4B896]/30"
              />
              <button
                onClick={() => removeItem(goldLines, setGoldLines, idx)}
                className="p-2 text-stone-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            onClick={() => addItem(goldLines, setGoldLines)}
            className="flex items-center gap-1.5 text-[12px] text-stone-500 hover:text-[#5a7a6f] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add gold line
          </button>
        </div>
      </div>

      {/* Patterns */}
      <div>
        <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-2">
          What Shifted
        </label>
        <p className="text-[12px] text-stone-500 mb-3">
          Patterns noticed, named softly
        </p>
        <div className="space-y-2">
          {patterns.map((pattern, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-[#5a7a6f]">·</span>
              <input
                type="text"
                value={pattern}
                onChange={(e) => updateItem(patterns, setPatterns, idx, e.target.value)}
                placeholder="A tendency toward..."
                className="flex-1 px-3 py-2 bg-white border border-stone-200 rounded-lg text-stone-700 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#5a7a6f]/30"
              />
              <button
                onClick={() => removeItem(patterns, setPatterns, idx)}
                className="p-2 text-stone-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            onClick={() => addItem(patterns, setPatterns)}
            className="flex items-center gap-1.5 text-[12px] text-stone-500 hover:text-[#5a7a6f] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add pattern
          </button>
        </div>
      </div>

      {/* Next Steps */}
      <div>
        <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-2">
          What to Do
        </label>
        <p className="text-[12px] text-stone-500 mb-3">
          Commitments and next steps
        </p>
        <div className="space-y-2">
          {nextSteps.map((step, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="w-4 h-4 border border-stone-300 rounded flex-shrink-0" />
              <input
                type="text"
                value={step}
                onChange={(e) => updateItem(nextSteps, setNextSteps, idx, e.target.value)}
                placeholder="I will..."
                className="flex-1 px-3 py-2 bg-white border border-stone-200 rounded-lg text-stone-700 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#5a7a6f]/30"
              />
              <button
                onClick={() => removeItem(nextSteps, setNextSteps, idx)}
                className="p-2 text-stone-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            onClick={() => addItem(nextSteps, setNextSteps)}
            className="flex items-center gap-1.5 text-[12px] text-stone-500 hover:text-[#5a7a6f] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add next step
          </button>
        </div>
      </div>

      {/* Source Excerpt (collapsible) */}
      {capsule.sourceExcerpt && (
        <div className="border border-stone-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowSource(!showSource)}
            className="w-full flex items-center justify-between px-4 py-3 bg-stone-50 hover:bg-stone-100 transition-colors"
          >
            <span className="text-[12px] text-stone-500 tracking-wide">Source Excerpt</span>
            {showSource ? (
              <ChevronUp className="w-4 h-4 text-stone-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-stone-400" />
            )}
          </button>
          {showSource && (
            <div className="px-4 py-3 bg-white">
              <pre className="text-[12px] text-stone-600 whitespace-pre-wrap font-mono leading-relaxed">
                {capsule.sourceExcerpt}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-stone-200">
        <div className="flex items-center gap-2">
          {onPin && (
            <button
              onClick={() => onPin(!capsule.pinned)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] transition-colors ${
                capsule.pinned
                  ? 'bg-[#D4B896]/10 text-[#D4B896]'
                  : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
              }`}
            >
              <Pin className="w-3.5 h-3.5" />
              {capsule.pinned ? 'Pinned' : 'Pin'}
            </button>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={!dirty || saving}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] tracking-wide transition-colors ${
            dirty && !saving
              ? 'bg-[#5a7a6f] hover:bg-[#4a6a5f] text-white'
              : 'bg-stone-100 text-stone-400 cursor-not-allowed'
          }`}
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}

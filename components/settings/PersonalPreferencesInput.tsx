'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Check } from 'lucide-react';
import { getPersonalPreferences, setPersonalPreferences } from '@/lib/preferences/personal-preferences';

interface PersonalPreferencesInputProps {
  className?: string;
}

const MAX_LENGTH = 500;

const PLACEHOLDER_EXAMPLES = `e.g., I prefer direct feedback over gentle suggestions. Please avoid therapy-speak. Call me by my first name. I'm working through grief right now. I appreciate humor when appropriate.`;

export function PersonalPreferencesInput({ className = '' }: PersonalPreferencesInputProps) {
  const [value, setValue] = useState('');
  const [originalValue, setOriginalValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    const prefs = getPersonalPreferences();
    if (prefs) {
      setValue(prefs.content);
      setOriginalValue(prefs.content);
    }
  }, []);

  const hasChanges = value !== originalValue;
  const charCount = value.length;

  const handleSave = async () => {
    setIsSaving(true);

    // Save locally
    setPersonalPreferences(value);
    setOriginalValue(value);

    // Try to sync to backend
    try {
      await fetch('/api/member/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personalPreferences: value })
      });
    } catch (e) {
      // Silent fail - local storage is source of truth
    }

    setIsSaving(false);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div>
        <h3 className="text-sm font-medium text-amber-200 mb-1">
          What should MAIA consider in responses?
        </h3>
        <p className="text-xs text-white/50">
          Your preferences apply to all conversations
        </p>
      </div>

      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value.slice(0, MAX_LENGTH))}
          placeholder={PLACEHOLDER_EXAMPLES}
          rows={4}
          className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg
                     text-white/90 placeholder-white/30 text-sm leading-relaxed
                     focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20
                     resize-none transition-all"
        />

        {/* Character count */}
        <div className="absolute bottom-2 right-2 text-xs text-white/30">
          {charCount}/{MAX_LENGTH}
        </div>
      </div>

      {/* Save button */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-white/40">
          {hasChanges ? 'Unsaved changes' : justSaved ? (
            <span className="text-green-400 flex items-center gap-1">
              <Check size={12} /> Saved
            </span>
          ) : ''}
        </div>

        <motion.button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          whileTap={{ scale: 0.98 }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                      transition-all ${
                        hasChanges
                          ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30'
                          : 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
                      }`}
        >
          <Save size={14} />
          {isSaving ? 'Saving...' : 'Save'}
        </motion.button>
      </div>

      {/* Examples tooltip */}
      <div className="p-3 bg-white/5 rounded-lg border border-white/5">
        <p className="text-xs text-white/40 leading-relaxed">
          <strong className="text-white/50">Examples:</strong> Communication style preferences,
          current life context, names to use, topics to approach with care,
          what kind of support you find most helpful.
        </p>
      </div>
    </div>
  );
}

export default PersonalPreferencesInput;

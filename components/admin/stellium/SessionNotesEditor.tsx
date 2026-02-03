"use client";

/**
 * SESSION NOTES EDITOR
 *
 * Structured notes editor for session prep and during sessions
 * Templates available but not mandatory
 *
 * Design Philosophy:
 * - "Session notes are for your learning, not judgment"
 * - Support structure without forcing it
 * - Export/copy for practitioners who use other tools
 */

import React, { useState } from 'react';
import { FileText, Copy, Save, ChevronDown, Plus } from 'lucide-react';

interface SessionNotesEditorProps {
  prepNotes: string;
  sessionNotes: string;
  onPrepNotesChange: (value: string) => void;
  onSessionNotesChange: (value: string) => void;
  onSave: () => void;
  onCopy: () => void;
  saving: boolean;
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
  success: '#8FB89A',
};

// Note templates for common structures
const TEMPLATES = {
  themes: `## Themes
-
-
-

`,
  transits: `## Key Transits
-

`,
  observations: `## Observations
-

`,
  followUp: `## Follow-up
-

`,
  full: `## Themes
-

## Key Transits
-

## Observations
-

## Homework/Prescriptions
-

## Follow-up
- Next session focus:
- Key dates to watch:
`,
};

export function SessionNotesEditor({
  prepNotes,
  sessionNotes,
  onPrepNotesChange,
  onSessionNotesChange,
  onSave,
  onCopy,
  saving,
}: SessionNotesEditorProps) {
  const [activeTab, setActiveTab] = useState<'prep' | 'session'>('prep');
  const [showTemplates, setShowTemplates] = useState(false);

  const insertTemplate = (template: string) => {
    if (activeTab === 'prep') {
      onPrepNotesChange(prepNotes + template);
    } else {
      onSessionNotesChange(sessionNotes + template);
    }
    setShowTemplates(false);
  };

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        backgroundColor: `${colors.nebula}50`,
        border: `1px solid ${colors.stardust}`,
      }}
    >
      {/* Header with Tabs */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: `${colors.stardust}60` }}
      >
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('prep')}
            className="px-3 py-1.5 rounded-lg text-sm transition-colors"
            style={{
              backgroundColor: activeTab === 'prep' ? `${colors.celestialBlue}20` : 'transparent',
              color: activeTab === 'prep' ? colors.celestialBlue : colors.muted,
            }}
          >
            Prep Notes
          </button>
          <button
            onClick={() => setActiveTab('session')}
            className="px-3 py-1.5 rounded-lg text-sm transition-colors"
            style={{
              backgroundColor: activeTab === 'session' ? `${colors.celestialBlue}20` : 'transparent',
              color: activeTab === 'session' ? colors.celestialBlue : colors.muted,
            }}
          >
            Session Notes
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {/* Templates dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors hover:bg-white/5"
              style={{ color: colors.dim }}
            >
              <Plus className="w-3 h-3" />
              <span>Template</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {showTemplates && (
              <div
                className="absolute top-full right-0 mt-1 rounded-lg overflow-hidden z-10 min-w-[140px]"
                style={{
                  backgroundColor: colors.nebula,
                  border: `1px solid ${colors.stardust}`,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                }}
              >
                {Object.entries({
                  'Themes': TEMPLATES.themes,
                  'Key Transits': TEMPLATES.transits,
                  'Observations': TEMPLATES.observations,
                  'Follow-up': TEMPLATES.followUp,
                  'Full Template': TEMPLATES.full,
                }).map(([name, template]) => (
                  <button
                    key={name}
                    onClick={() => insertTemplate(template)}
                    className="w-full px-3 py-2 text-xs text-left transition-colors hover:bg-white/5"
                    style={{ color: colors.muted }}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Copy button */}
          <button
            onClick={onCopy}
            className="p-1.5 rounded transition-colors hover:bg-white/5"
            style={{ color: colors.dim }}
            title="Copy to clipboard"
          >
            <Copy className="w-4 h-4" />
          </button>

          {/* Save button */}
          <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors"
            style={{
              backgroundColor: `${colors.success}20`,
              color: colors.success,
              opacity: saving ? 0.7 : 1,
            }}
          >
            <Save className="w-3 h-3" />
            <span>{saving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="p-4">
        {activeTab === 'prep' ? (
          <div>
            <p className="text-xs mb-2" style={{ color: colors.dim }}>
              Notes to prepare for this session
            </p>
            <textarea
              value={prepNotes}
              onChange={(e) => onPrepNotesChange(e.target.value)}
              placeholder="What do you want to hold in mind for this session?

• Key chart patterns to explore
• Questions from last session
• Current transit themes
• Your intentions..."
              className="w-full min-h-[300px] p-3 rounded-lg resize-none text-sm outline-none"
              style={{
                backgroundColor: `${colors.stardust}40`,
                color: colors.starlight,
                border: `1px solid ${colors.stardust}`,
              }}
            />
          </div>
        ) : (
          <div>
            <p className="text-xs mb-2" style={{ color: colors.dim }}>
              Notes from or after the session
            </p>
            <textarea
              value={sessionNotes}
              onChange={(e) => onSessionNotesChange(e.target.value)}
              placeholder="What emerged in this session?

• Themes that arose
• Insights or breakthroughs
• Areas of resistance or difficulty
• Follow-up suggestions
• Your own reflections..."
              className="w-full min-h-[300px] p-3 rounded-lg resize-none text-sm outline-none"
              style={{
                backgroundColor: `${colors.stardust}40`,
                color: colors.starlight,
                border: `1px solid ${colors.stardust}`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default SessionNotesEditor;

'use client';

/**
 * DailyEncounter — Full daily sacred learning flow
 *
 * Composes: PassageView → CommentaryLayers → Practice → Reflection → Journal
 *
 * Governed by docs/sacred-learning/SACRED_SOURCE_INTEGRITY_POLICY.md
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { DailyEncounter as DailyEncounterType } from '@/lib/sacred-learning/types';
import { SourceLabel } from './SourceLabel';
import { PassageView } from './PassageView';
import { CommentaryLayers } from './CommentaryLayers';

export function DailyEncounter() {
  const [encounter, setEncounter] = useState<DailyEncounterType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reflectionText, setReflectionText] = useState('');
  const [reflectionSaved, setReflectionSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchEncounter = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/sacred-learning/daily');
      if (!res.ok) {
        if (res.status === 401) {
          setError('Please sign in to access Sacred Study.');
          return;
        }
        if (res.status === 404) {
          setError('No passages available yet. The sacred learning corpus is being prepared.');
          return;
        }
        throw new Error('Failed to load encounter');
      }
      const data = await res.json();
      setEncounter(data);

      // Pre-fill if there's a previous reflection
      if (data.previousReflection) {
        setReflectionText(data.previousReflection.text);
      }
    } catch (err) {
      setError('Unable to load today\'s encounter. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEncounter();
  }, [fetchEncounter]);

  const handleSaveReflection = async () => {
    if (!reflectionText.trim() || !encounter) return;
    setSaving(true);
    try {
      const res = await fetch('/api/sacred-learning/reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passageId: encounter.passage.id,
          themeId: encounter.theme?.id,
          text: reflectionText.trim(),
        }),
      });
      if (res.ok) {
        setReflectionSaved(true);
      }
    } catch {
      // Non-fatal
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-stone-400 text-sm">Preparing today's encounter...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-stone-500 text-center max-w-sm">
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!encounter) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      {/* Theme indicator */}
      {encounter.theme && (
        <div className="text-center space-y-1">
          <p className="text-xs uppercase tracking-widest text-stone-400">
            Sacred Study
          </p>
          <h2 className="text-lg font-light text-stone-600">
            {encounter.theme.name}
          </h2>
          {encounter.theme.arabicTerm && (
            <p
              dir="rtl"
              lang="ar"
              className="text-xl text-amber-700"
              style={{ fontFamily: "'Amiri', serif" }}
            >
              {encounter.theme.arabicTerm}
            </p>
          )}
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-stone-200" />

      {/* 1. Passage (always primary) */}
      <PassageView passage={encounter.passage} />

      {/* 2. Commentary layers (toggleable) */}
      <CommentaryLayers
        commentary={encounter.commentary}
        layerVisibility={encounter.formation?.layerVisibility}
      />

      {/* 3. Practice invitation */}
      {encounter.practices.length > 0 && (
        <div className="mt-8 space-y-3">
          {encounter.practices.map((practice) => (
            <div
              key={practice.id}
              className="p-5 bg-gray-50 rounded-lg border border-gray-200"
            >
              <SourceLabel level={6} className="mb-3" />
              <p className="text-sm text-stone-600 leading-relaxed mt-2">
                {practice.text}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* 4. Reflection prompt */}
      {encounter.reflectionPrompt && (
        <div className="mt-8 p-5 bg-gray-50 rounded-lg border border-gray-200">
          <SourceLabel level={6} className="mb-3" />
          <p className="text-sm text-stone-600 leading-relaxed italic mt-2">
            {encounter.reflectionPrompt}
          </p>
        </div>
      )}

      {/* 5. Journal */}
      <div className="mt-8 space-y-3">
        <h3 className="text-xs font-medium uppercase tracking-wider text-stone-400">
          Your Reflection
        </h3>
        <textarea
          value={reflectionText}
          onChange={(e) => {
            setReflectionText(e.target.value);
            setReflectionSaved(false);
          }}
          placeholder="What arises as you sit with this passage?"
          rows={5}
          className="
            w-full p-4
            text-sm text-stone-700
            bg-white border border-stone-200 rounded-lg
            focus:outline-none focus:ring-1 focus:ring-amber-300 focus:border-amber-300
            placeholder:text-stone-300
            resize-y
          "
        />
        <div className="flex items-center justify-between">
          <button
            onClick={handleSaveReflection}
            disabled={!reflectionText.trim() || saving || reflectionSaved}
            className="
              px-4 py-2 text-sm rounded-lg
              bg-amber-600 text-white
              hover:bg-amber-700
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-colors
            "
          >
            {reflectionSaved ? 'Saved' : saving ? 'Saving...' : 'Save Reflection'}
          </button>
          <SourceLabel level={5} />
        </div>
      </div>

      {/* Formation state (subtle) */}
      {encounter.formation && (
        <div className="mt-12 pt-4 border-t border-stone-100 text-center">
          <p className="text-xs text-stone-300">
            Day {encounter.formation.currentDayNumber} &middot;{' '}
            {encounter.formation.passagesEncountered} passages encountered &middot;{' '}
            {encounter.formation.reflectionsWritten} reflections
          </p>
        </div>
      )}
    </div>
  );
}

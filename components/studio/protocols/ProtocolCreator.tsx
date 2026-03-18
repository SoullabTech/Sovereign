'use client';

/**
 * ProtocolCreator — components/studio/protocols/ProtocolCreator.tsx
 *
 * Create-protocol form for studio practitioners.
 * Fields: type, pattern name, description, trigger, behavior, reward, cost,
 *         client selector, council guide checkboxes.
 * POSTs to /api/studio/protocols on submit.
 */

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';

interface Client {
  id: string;
  name: string;
  status: string;
}

interface CreatedProtocol {
  id: string;
  patternName: string;
  status: string;
  currentWeek: number;
}

const PROTOCOL_TYPES = [
  { value: 'pattern_inquiry', label: 'Pattern Inquiry' },
  { value: 'habit_formation', label: 'Habit Formation' },
  { value: 'somatic_tracking', label: 'Somatic Tracking' },
];

const COUNCIL_GUIDE_OPTIONS = [
  { value: 'strategist', label: 'Strategist', description: 'Behavioural and systemic analysis' },
  { value: 'body_listener', label: 'Body Listener', description: 'Somatic and nervous system tracking' },
  { value: 'pattern_seer', label: 'Pattern Seer', description: 'Relational and historical pattern recognition' },
  { value: 'symbolist', label: 'Symbolist', description: 'Archetypal and metaphoric resonance' },
];

interface Props {
  onCreated?: (protocol: CreatedProtocol) => void;
  onCancel?: () => void;
}

export function ProtocolCreator({ onCreated, onCancel }: Props) {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);

  // Form state
  const [protocolType, setProtocolType] = useState('pattern_inquiry');
  const [patternName, setPatternName] = useState('');
  const [patternDescription, setPatternDescription] = useState('');
  const [trigger, setTrigger] = useState('');
  const [behavior, setBehavior] = useState('');
  const [immediateReward, setImmediateReward] = useState('');
  const [longTermCost, setLongTermCost] = useState('');
  const [clientId, setClientId] = useState('');
  const [councilGuides, setCouncilGuides] = useState<string[]>([
    'strategist',
    'body_listener',
    'pattern_seer',
    'symbolist',
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load clients for selector
  useEffect(() => {
    apiFetch('/api/studio/clients?status=active')
      .then((res) => res.json())
      .then((data) => setClients(data.clients ?? []))
      .catch(() => setClients([]))
      .finally(() => setClientsLoading(false));
  }, []);

  function toggleGuide(value: string) {
    setCouncilGuides((prev) =>
      prev.includes(value) ? prev.filter((g) => g !== value) : [...prev, value]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!patternName.trim()) {
      setError('Pattern name is required');
      return;
    }
    if (!clientId) {
      setError('Please select a client');
      return;
    }
    if (councilGuides.length === 0) {
      setError('Select at least one council guide');
      return;
    }

    setSubmitting(true);

    try {
      const res = await apiFetch('/api/studio/protocols', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          protocolType,
          patternName: patternName.trim(),
          patternDescription: patternDescription.trim() || undefined,
          trigger: trigger.trim() || undefined,
          behavior: behavior.trim() || undefined,
          immediateReward: immediateReward.trim() || undefined,
          longTermCost: longTermCost.trim() || undefined,
          clientId,
          councilGuides,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to create protocol');
        return;
      }

      onCreated?.(data.protocol);
    } catch (err) {
      setError('Network error — please try again');
      console.error('[ProtocolCreator]', err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-200">New Pattern Inquiry Protocol</h2>
        <p className="text-sm text-gray-500 mt-1">
          Define the pattern to track across a 6-week structured inquiry.
        </p>
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-950/40 border border-red-800 rounded px-3 py-2">
          {error}
        </div>
      )}

      {/* Protocol type */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Protocol Type</label>
        <select
          value={protocolType}
          onChange={(e) => setProtocolType(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-200 text-sm"
        >
          {PROTOCOL_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Client selector */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Client <span className="text-red-400">*</span>
        </label>
        {clientsLoading ? (
          <div className="text-sm text-gray-500">Loading clients...</div>
        ) : (
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-200 text-sm"
            required
          >
            <option value="">Select a client...</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Pattern name */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Pattern Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={patternName}
          onChange={(e) => setPatternName(e.target.value)}
          placeholder="e.g. Conflict avoidance"
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-200 text-sm placeholder-gray-600"
          required
        />
      </div>

      {/* Pattern description */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Description
        </label>
        <textarea
          value={patternDescription}
          onChange={(e) => setPatternDescription(e.target.value)}
          placeholder="Brief description of what the pattern looks like in this client's life..."
          rows={2}
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-200 text-sm placeholder-gray-600 resize-none"
        />
      </div>

      {/* Habit loop anatomy */}
      <div className="border border-gray-700 rounded-lg p-4 space-y-4">
        <h3 className="text-sm font-medium text-gray-300">Habit Loop Anatomy (optional)</h3>
        <p className="text-xs text-gray-500">
          These fields inform the oracle's listening context across sessions.
        </p>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Trigger</label>
          <input
            type="text"
            value={trigger}
            onChange={(e) => setTrigger(e.target.value)}
            placeholder="What precedes the pattern (internal state, situation, person)..."
            className="w-full bg-gray-800/70 border border-gray-700 rounded px-3 py-2 text-gray-200 text-sm placeholder-gray-600"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Behavior</label>
          <input
            type="text"
            value={behavior}
            onChange={(e) => setBehavior(e.target.value)}
            placeholder="The observable behaviour or response..."
            className="w-full bg-gray-800/70 border border-gray-700 rounded px-3 py-2 text-gray-200 text-sm placeholder-gray-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Immediate Reward</label>
            <input
              type="text"
              value={immediateReward}
              onChange={(e) => setImmediateReward(e.target.value)}
              placeholder="What it provides short-term..."
              className="w-full bg-gray-800/70 border border-gray-700 rounded px-3 py-2 text-gray-200 text-sm placeholder-gray-600"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Long-term Cost</label>
            <input
              type="text"
              value={longTermCost}
              onChange={(e) => setLongTermCost(e.target.value)}
              placeholder="What it costs over time..."
              className="w-full bg-gray-800/70 border border-gray-700 rounded px-3 py-2 text-gray-200 text-sm placeholder-gray-600"
            />
          </div>
        </div>
      </div>

      {/* Council guides */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Council Guides</label>
        <div className="space-y-2">
          {COUNCIL_GUIDE_OPTIONS.map((g) => (
            <label key={g.value} className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={councilGuides.includes(g.value)}
                onChange={() => toggleGuide(g.value)}
                className="mt-0.5"
              />
              <div>
                <span className="text-sm text-gray-200">{g.label}</span>
                <span className="text-xs text-gray-500 ml-2">{g.description}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-amber-700 hover:bg-amber-600 disabled:opacity-50 text-white text-sm rounded-md transition-colors"
        >
          {submitting ? 'Creating...' : 'Create Protocol'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-md transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

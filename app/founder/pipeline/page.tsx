'use client';

import { useState, useEffect } from 'react';
import { Users, Plus } from 'lucide-react';
import type { OpsContact, PipelineStage } from '@/lib/founder/types';

const STAGES: { key: PipelineStage; label: string; color: string }[] = [
  { key: 'new', label: 'New', color: 'var(--sl-text-muted)' },
  { key: 'contacted', label: 'Contacted', color: 'var(--sl-state-info)' },
  { key: 'exploring', label: 'Exploring', color: 'var(--sl-accent-admin)' },
  { key: 'committed', label: 'Committed', color: 'var(--sl-state-success)' },
  { key: 'active', label: 'Active', color: 'var(--sl-state-success)' },
  { key: 'churned', label: 'Churned', color: 'var(--sl-state-error)' },
];

export default function PipelinePage() {
  const [contacts, setContacts] = useState<OpsContact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/founder/contacts')
      .then(r => r.ok ? r.json() : { contacts: [] })
      .then(d => setContacts(d.contacts || []))
      .catch(() => setContacts([]))
      .finally(() => setLoading(false));
  }, []);

  const byStage = (stage: PipelineStage) => contacts.filter(c => c.pipeline_stage === stage);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--sl-text-primary)]">Pipeline</h1>
          <p className="text-sm text-[var(--sl-text-muted)]">Leads, partners, practitioners, beta testers</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--sl-accent-admin)] text-white text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          Add Contact
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-[var(--sl-text-muted)]">Loading pipeline...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {STAGES.map(stage => {
            const stageContacts = byStage(stage.key);
            return (
              <div key={stage.key} className="min-h-[200px]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
                    <span className="text-xs font-semibold text-[var(--sl-text-secondary)] uppercase tracking-wider">
                      {stage.label}
                    </span>
                  </div>
                  <span className="text-xs text-[var(--sl-text-muted)]">{stageContacts.length}</span>
                </div>

                <div className="space-y-2">
                  {stageContacts.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-[var(--sl-border-subtle)] p-4 text-center">
                      <p className="text-xs text-[var(--sl-text-muted)]">Empty</p>
                    </div>
                  ) : (
                    stageContacts.map(c => (
                      <div key={c.id} className="rounded-lg border border-[var(--sl-border-subtle)] bg-[var(--sl-bg-surface)] p-3">
                        <p className="text-sm font-medium text-[var(--sl-text-primary)] truncate">{c.name}</p>
                        {c.email && (
                          <p className="text-xs text-[var(--sl-text-muted)] truncate">{c.email}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--sl-bg-elevated)] text-[var(--sl-text-muted)]">
                            {c.contact_type}
                          </span>
                          {c.intent && (
                            <span className="text-xs text-[var(--sl-text-muted)]">{c.intent}</span>
                          )}
                        </div>
                        {c.next_action && (
                          <p className="text-xs text-[var(--sl-accent-admin)] mt-2 truncate">
                            Next: {c.next_action}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

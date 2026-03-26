'use client';

/**
 * Field Audit Page — Client Shell
 *
 * Renders the mode selector, appropriate form, and report view.
 * Calls /api/audit/identity with auditMode + fieldContext.
 */

import { useState } from 'react';
import { AuditModeSelector, type AuditMode } from '@/components/audit/AuditModeSelector';
import { AuditExampleBlock } from '@/components/audit/AuditExampleBlock';
import { IdentityAuditForm } from '@/components/audit/IdentityAuditForm';
import { PartnershipAuditForm } from '@/components/audit/PartnershipAuditForm';
import { TeamAuditForm } from '@/components/audit/TeamAuditForm';
import { IdentityAuditReport } from '@/components/audit/IdentityAuditReport';
import type { IdentityAuditIntake, IdentityAuditResult } from '@/lib/maia/prompts/identityAuditPrompt';
import type { PartnershipAuditIntake } from '@/lib/maia/prompts/partnershipAuditPrompt';
import type { TeamAuditIntake } from '@/lib/maia/prompts/teamAuditPrompt';
import type { AuditFieldContext } from '@/lib/maia/prompts/auditTypes';

interface Props {
  fieldSlug: string;
  fieldShortName: string;
  openingLine: string;
  fieldContext: AuditFieldContext;
}

type AnyIntake = IdentityAuditIntake | PartnershipAuditIntake | TeamAuditIntake;

export function FieldAuditPageClient({
  fieldSlug,
  fieldShortName,
  openingLine,
  fieldContext,
}: Props) {
  const [mode, setMode] = useState<AuditMode>('individual');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<IdentityAuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submittedIntake, setSubmittedIntake] = useState<AnyIntake | null>(null);

  const handleSubmit = async (intake: AnyIntake) => {
    setIsLoading(true);
    setError(null);
    setSubmittedIntake(intake);

    try {
      const res = await fetch('/api/audit/identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...intake,
          auditMode: mode,
          fieldSlug,
          fieldContext,
        }),
      });

      const data = (await res.json()) as {
        success: boolean;
        result?: IdentityAuditResult;
        error?: string;
      };

      if (!data.success || !data.result) {
        setError(data.error ?? 'Audit generation failed. Please try again.');
        return;
      }

      setResult(data.result);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setSubmittedIntake(null);
  };

  // After result, delegate to IdentityAuditReport only for individual (it expects IdentityAuditResult).
  // For partnership and team, surface a generic result view — spec says IdentityAuditReport works
  // for all modes since report structure is similar. We cast safely here.
  if (result) {
    const displayName =
      submittedIntake && 'name' in submittedIntake
        ? (submittedIntake as IdentityAuditIntake).name
        : submittedIntake && 'teamName' in submittedIntake
        ? (submittedIntake as TeamAuditIntake).teamName
        : undefined;

    return (
      <div className="min-h-screen bg-stone-950 text-stone-200">
        <div className="max-w-2xl mx-auto px-6 py-16">
          <IdentityAuditReport
            result={result as IdentityAuditResult}
            name={displayName}
            onReset={handleReset}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200">
      <div className="max-w-2xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="mb-12">
          <p className="text-xs uppercase tracking-widest text-amber-500/60 mb-3">
            {fieldShortName}
          </p>
          <h1 className="text-2xl font-light text-stone-100 mb-3 leading-snug">
            {openingLine}
          </h1>
          <p className="text-sm text-stone-500 leading-relaxed">
            Identity Audit — structural mapping across individual, partnership, and team fields.
          </p>
        </div>

        {/* Example output — field-aware archetype */}
        <div className="mb-12">
          <AuditExampleBlock archetype={fieldSlug === 'nathan' ? 'systems' : 'founder'} />
        </div>

        {/* Mode selector */}
        <div className="mb-12">
          <h2 className="text-xs uppercase tracking-widest text-stone-500 mb-4">
            Choose your audit type
          </h2>
          <AuditModeSelector
            selected={mode}
            onChange={(m) => {
              setMode(m);
              setError(null);
            }}
            fieldSlug={fieldSlug}
          />
        </div>

        {/* Divider */}
        <div className="border-t border-stone-800 mb-12" />

        {/* Error state */}
        {error && (
          <div className="mb-8 px-4 py-3 rounded border border-red-900/50 bg-red-950/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        {mode === 'individual' && (
          <IdentityAuditForm
            onSubmit={(intake) => handleSubmit(intake)}
            isLoading={isLoading}
          />
        )}
        {mode === 'partnership' && (
          <PartnershipAuditForm
            onSubmit={(intake) => handleSubmit(intake)}
            isLoading={isLoading}
          />
        )}
        {mode === 'team' && (
          <TeamAuditForm
            onSubmit={(intake) => handleSubmit(intake)}
            isLoading={isLoading}
          />
        )}

        {/* Footer note */}
        <p className="mt-12 text-xs text-stone-700 text-center">
          Audits are structural maps — offered as possibility, not verdict.
          No content is shared.
        </p>
      </div>
    </div>
  );
}

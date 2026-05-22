'use client';

/**
 * Prepare and Integrate flow components.
 *
 * Invariant: forms collect only the MEMBER's experience, intention, and
 * choices. There is no field for "tell me about them" — by design. The
 * relational tag is free text the member uses however they want; it is not
 * lifted into structured profile fields.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LensMenu } from './LensMenu';
import { ResponseRenderer } from './ResponseRenderer';
import { apiFetch } from '@/lib/http/apiBase';
import type {
  FlowRefusal,
  FlowResponse,
  IntegrateInput,
  LensKey,
  PrepareInput,
} from '@/lib/maia/relationalNavigation/types';

interface FieldProps {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  optional?: boolean;
}

function Field({
  label,
  hint,
  value,
  onChange,
  placeholder,
  rows = 3,
  optional,
}: FieldProps) {
  return (
    <div>
      <label className="block">
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-[14px] font-medium text-stone-800">
            {label}
          </span>
          {optional && (
            <span className="text-[11px] uppercase tracking-wide text-stone-400">
              optional
            </span>
          )}
        </div>
        {hint && (
          <p className="text-[13px] text-stone-500 mb-2 leading-relaxed">
            {hint}
          </p>
        )}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full rounded-xl border border-stone-200 bg-white/60 px-4 py-3 text-[15px] text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#5a7a6f]/40 focus:border-[#5a7a6f]/40 transition-all resize-y leading-relaxed"
        />
      </label>
    </div>
  );
}

function SanctuaryToggle({
  on,
  onChange,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={[
        'flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition-all w-full',
        on
          ? 'border-[#5a7a6f] bg-[#5a7a6f]/8'
          : 'border-stone-200 bg-white/40 hover:border-stone-300',
      ].join(' ')}
      aria-pressed={on}
    >
      <div
        className={[
          'mt-1 w-4 h-4 rounded-sm border flex items-center justify-center shrink-0',
          on ? 'border-[#5a7a6f] bg-[#5a7a6f]' : 'border-stone-300 bg-white',
        ].join(' ')}
      >
        {on && (
          <svg
            viewBox="0 0 12 12"
            className="w-3 h-3 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M2 6l3 3 5-6" />
          </svg>
        )}
      </div>
      <div>
        <div className="text-[14px] font-medium text-stone-800">
          Sanctuary Mode
        </div>
        <div className="text-[12.5px] text-stone-500 mt-0.5 leading-snug">
          This reflection won&apos;t be saved or remembered. Speak freely.
        </div>
      </div>
    </button>
  );
}

function SubmitButton({
  loading,
  disabled,
  label,
}: {
  loading: boolean;
  disabled: boolean;
  label: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className={[
        'rounded-xl px-6 py-3 text-[15px] font-medium tracking-wide transition-all',
        loading || disabled
          ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
          : 'bg-[#5a7a6f] text-white hover:bg-[#4a6a5f] active:scale-[0.98]',
      ].join(' ')}
    >
      {loading ? 'Reflecting…' : label}
    </button>
  );
}

function ErrorView({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-amber-300/50 bg-amber-50/60 p-4 text-[14px] text-stone-700">
      {message}
    </div>
  );
}

interface SharedState {
  lenses: LensKey[];
  sanctuary: boolean;
  loading: boolean;
  error: string | null;
  response?: FlowResponse;
  refusal?: FlowRefusal;
  degradedText?: string;
}

const initialShared: SharedState = {
  lenses: [],
  sanctuary: false,
  loading: false,
  error: null,
};

async function callApi(
  body: PrepareInput | IntegrateInput
): Promise<{
  ok: boolean;
  response?: FlowResponse;
  refusal?: FlowRefusal;
  degradedText?: string;
  error?: string;
}> {
  try {
    const res = await apiFetch('/api/maia/relational-navigation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: json?.error || 'Something is not available right now.' };
    }
    if (json?.refusal) return { ok: true, refusal: json.refusal };
    if (json?.degraded) return { ok: true, degradedText: json.text };
    if (json?.response) return { ok: true, response: json.response };
    return { ok: false, error: 'No response received. Try again in a moment.' };
  } catch {
    return { ok: false, error: 'A connection hiccup. Try again in a moment.' };
  }
}

export function PrepareFlow() {
  const [context, setContext] = useState('');
  const [relationalTag, setRelationalTag] = useState('');
  const [whatMatters, setWhatMatters] = useState('');
  const [whatIHopeFor, setWhatIHopeFor] = useState('');
  const [whatIFear, setWhatIFear] = useState('');
  const [whatINeedToStayTrueTo, setWhatINeedToStayTrueTo] = useState('');
  const [shared, setShared] = useState<SharedState>(initialShared);

  const hasContent =
    !!context.trim() ||
    !!whatMatters.trim() ||
    !!whatIHopeFor.trim() ||
    !!whatIFear.trim() ||
    !!whatINeedToStayTrueTo.trim();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShared((s) => ({ ...s, loading: true, error: null, response: undefined, refusal: undefined, degradedText: undefined }));
    const body: PrepareInput = {
      mode: 'prepare',
      context,
      relationalTag: relationalTag.trim() || undefined,
      whatMatters,
      whatIHopeFor,
      whatIFear,
      whatINeedToStayTrueTo,
      lenses: shared.lenses,
      sanctuary: shared.sanctuary,
    };
    const result = await callApi(body);
    setShared((s) => ({
      ...s,
      loading: false,
      error: result.ok ? null : result.error ?? 'Something is not available right now.',
      response: result.response,
      refusal: result.refusal,
      degradedText: result.degradedText,
    }));
  }

  return (
    <FlowLayout
      intro="Before a conversation. Bring what you are carrying into it. MAIA accompanies your own discernment — not the other person."
      onSubmit={onSubmit}
      shared={shared}
      setShared={setShared}
      hasContent={hasContent}
      submitLabel="Reflect with me"
    >
      <Field
        label="What kind of conversation is this?"
        value={context}
        onChange={setContext}
        placeholder="e.g. asking a hard question; saying no; checking in after silence"
      />
      <Field
        label="A short tag for who this is with"
        hint="However you want to name it. This stays as you wrote it — it is not lifted into a profile."
        value={relationalTag}
        onChange={setRelationalTag}
        placeholder="e.g. a parent; my manager; an old friend"
        rows={1}
        optional
      />
      <Field
        label="What matters here"
        value={whatMatters}
        onChange={setWhatMatters}
      />
      <Field
        label="What I hope for"
        value={whatIHopeFor}
        onChange={setWhatIHopeFor}
      />
      <Field
        label="What I'm afraid may happen"
        value={whatIFear}
        onChange={setWhatIFear}
      />
      <Field
        label="What I need to stay true to"
        value={whatINeedToStayTrueTo}
        onChange={setWhatINeedToStayTrueTo}
      />
    </FlowLayout>
  );
}

export function IntegrateFlow() {
  const [context, setContext] = useState('');
  const [relationalTag, setRelationalTag] = useState('');
  const [whatHappened, setWhatHappened] = useState('');
  const [whatFeltClear, setWhatFeltClear] = useState('');
  const [whatFeltUnresolved, setWhatFeltUnresolved] = useState('');
  const [whatSurprisedMe, setWhatSurprisedMe] = useState('');
  const [whatIWishIHadSaid, setWhatIWishIHadSaid] = useState('');
  const [possibleNextStep, setPossibleNextStep] = useState('');
  const [shared, setShared] = useState<SharedState>(initialShared);

  const hasContent =
    !!whatHappened.trim() ||
    !!whatFeltClear.trim() ||
    !!whatFeltUnresolved.trim() ||
    !!whatSurprisedMe.trim() ||
    !!whatIWishIHadSaid.trim() ||
    !!possibleNextStep.trim();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShared((s) => ({ ...s, loading: true, error: null, response: undefined, refusal: undefined, degradedText: undefined }));
    const body: IntegrateInput = {
      mode: 'integrate',
      context,
      relationalTag: relationalTag.trim() || undefined,
      whatHappened,
      whatFeltClear,
      whatFeltUnresolved,
      whatSurprisedMe,
      whatIWishIHadSaid,
      possibleNextStep,
      lenses: shared.lenses,
      sanctuary: shared.sanctuary,
    };
    const result = await callApi(body);
    setShared((s) => ({
      ...s,
      loading: false,
      error: result.ok ? null : result.error ?? 'Something is not available right now.',
      response: result.response,
      refusal: result.refusal,
      degradedText: result.degradedText,
    }));
  }

  return (
    <FlowLayout
      intro="After a conversation. Bring what happened, what you noticed, what is still unresolved. MAIA accompanies your reflection — not your interpretation of them."
      onSubmit={onSubmit}
      shared={shared}
      setShared={setShared}
      hasContent={hasContent}
      submitLabel="Reflect with me"
    >
      <Field
        label="Context, if you want to set it"
        value={context}
        onChange={setContext}
        rows={2}
        optional
      />
      <Field
        label="A short tag for who this was with"
        hint="However you want to name it."
        value={relationalTag}
        onChange={setRelationalTag}
        rows={1}
        optional
      />
      <Field
        label="What happened"
        value={whatHappened}
        onChange={setWhatHappened}
      />
      <Field
        label="What felt clear"
        value={whatFeltClear}
        onChange={setWhatFeltClear}
      />
      <Field
        label="What felt unresolved"
        value={whatFeltUnresolved}
        onChange={setWhatFeltUnresolved}
      />
      <Field
        label="What surprised me"
        value={whatSurprisedMe}
        onChange={setWhatSurprisedMe}
      />
      <Field
        label="What I wish I had said"
        value={whatIWishIHadSaid}
        onChange={setWhatIWishIHadSaid}
      />
      <Field
        label="What next step feels possible"
        value={possibleNextStep}
        onChange={setPossibleNextStep}
      />
    </FlowLayout>
  );
}

interface FlowLayoutProps {
  intro: string;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  shared: SharedState;
  setShared: React.Dispatch<React.SetStateAction<SharedState>>;
  hasContent: boolean;
  submitLabel: string;
  children: React.ReactNode;
}

function FlowLayout({
  intro,
  onSubmit,
  shared,
  setShared,
  hasContent,
  submitLabel,
  children,
}: FlowLayoutProps) {
  const hasOutput = !!(shared.response || shared.refusal || shared.degradedText);

  return (
    <div className="space-y-8">
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-[15px] leading-relaxed text-stone-600"
      >
        {intro}
      </motion.p>

      <form onSubmit={onSubmit} className="space-y-6">
        {children}

        <div className="pt-2">
          <LensMenu
            selected={shared.lenses}
            onChange={(next) => setShared((s) => ({ ...s, lenses: next }))}
          />
        </div>

        <div className="pt-2">
          <SanctuaryToggle
            on={shared.sanctuary}
            onChange={(on) => setShared((s) => ({ ...s, sanctuary: on }))}
          />
        </div>

        {shared.error && <ErrorView message={shared.error} />}

        <div className="flex items-center justify-end pt-2">
          <SubmitButton
            loading={shared.loading}
            disabled={!hasContent}
            label={submitLabel}
          />
        </div>
      </form>

      {hasOutput && (
        <div className="pt-4 border-t border-stone-200/60">
          <ResponseRenderer
            response={shared.response}
            refusal={shared.refusal}
            degradedText={shared.degradedText}
          />
        </div>
      )}
    </div>
  );
}

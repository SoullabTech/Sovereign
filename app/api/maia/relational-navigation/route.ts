export const dynamic = 'force-dynamic';
export async function generateStaticParams() {
  return [];
}

/**
 * Relational Navigation Room — API
 *
 * Invariant (negative form, load-bearing — do not soften):
 *   This endpoint does NOT profile, diagnose, or store information about
 *   absent third parties.
 *   This endpoint does NOT answer "what did they really mean?"
 *   This endpoint MUST return authority to the member at the close of every
 *   response.
 *
 * Spec: docs/specs/RELATIONAL_NAVIGATION_ROOM.md
 * Canon: docs/canon/THE_CLEARING.md
 *        docs/canon/SPIRAL_CONTINUITY_ENGINE.md
 *        docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md
 *
 * If the next editor finds themselves adding:
 *   - a relationships table
 *   - an "other_party_summary" field
 *   - cross-session memory about people the member mentioned
 *   - confidence scores about the absent party's intent
 * — stop. That is the elegant ontological inversion the Spiral Continuity
 *   Engine warns about. Re-read the spec.
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { isMemberTester } from '@/lib/auth/tester';
import {
  buildPrepareSystemPrompt,
  buildIntegrateSystemPrompt,
  buildUserMessage,
} from '@/lib/maia/relationalNavigation/prompts';
import type {
  FlowInput,
  FlowResponse,
  FlowRefusal,
  LensKey,
} from '@/lib/maia/relationalNavigation/types';

const anthropic = new Anthropic();

const MODEL = 'claude-opus-4-7';
const MAX_TOKENS = 2400;

const VALID_LENSES: ReadonlySet<LensKey> = new Set<LensKey>([
  'needs',
  'boundaries',
  'power',
  'protection',
  'attachment',
  'conflict',
  'repair',
  'grief',
  'shadow',
  'somatic',
  'systems',
  'compassionate_reframe',
]);

function sanitizeLenses(input: unknown): LensKey[] {
  if (!Array.isArray(input)) return [];
  const out: LensKey[] = [];
  for (const item of input) {
    if (typeof item === 'string' && VALID_LENSES.has(item as LensKey)) {
      out.push(item as LensKey);
    }
    if (out.length >= 4) break;
  }
  return out;
}

function asString(v: unknown, max = 4000): string {
  if (typeof v !== 'string') return '';
  return v.slice(0, max).trim();
}

function parseInput(body: any): FlowInput | null {
  if (!body || typeof body !== 'object') return null;
  const mode = body.mode;
  const sanctuary = body.sanctuary === true;
  const lenses = sanitizeLenses(body.lenses);
  const context = asString(body.context);
  const relationalTag = asString(body.relationalTag, 200) || undefined;

  if (mode === 'prepare') {
    return {
      mode: 'prepare',
      context,
      relationalTag,
      whatMatters: asString(body.whatMatters),
      whatIHopeFor: asString(body.whatIHopeFor),
      whatIFear: asString(body.whatIFear),
      whatINeedToStayTrueTo: asString(body.whatINeedToStayTrueTo),
      lenses,
      sanctuary,
    };
  }
  if (mode === 'integrate') {
    return {
      mode: 'integrate',
      context,
      relationalTag,
      whatHappened: asString(body.whatHappened),
      whatFeltClear: asString(body.whatFeltClear),
      whatFeltUnresolved: asString(body.whatFeltUnresolved),
      whatSurprisedMe: asString(body.whatSurprisedMe),
      whatIWishIHadSaid: asString(body.whatIWishIHadSaid),
      possibleNextStep: asString(body.possibleNextStep),
      lenses,
      sanctuary,
    };
  }
  return null;
}

function hasAnyContent(input: FlowInput): boolean {
  if (input.mode === 'prepare') {
    return Boolean(
      input.context ||
        input.whatMatters ||
        input.whatIHopeFor ||
        input.whatIFear ||
        input.whatINeedToStayTrueTo
    );
  }
  return Boolean(
    input.context ||
      input.whatHappened ||
      input.whatFeltClear ||
      input.whatFeltUnresolved ||
      input.whatSurprisedMe ||
      input.whatIWishIHadSaid ||
      input.possibleNextStep
  );
}

/**
 * Best-effort JSON extraction. Models occasionally wrap JSON in prose or code
 * fences despite instruction. We tolerate that. If parsing still fails, the
 * UI degrades to a single rendered text block.
 */
function extractJson(text: string): unknown {
  if (!text) return null;
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {}
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1]);
    } catch {}
  }
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    try {
      return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
    } catch {}
  }
  return null;
}

function isRefusal(obj: any): obj is FlowRefusal {
  return obj && obj.refusal === true && typeof obj.reframe === 'string';
}

function isPrepareResponse(obj: any): boolean {
  return (
    obj &&
    obj.mode === 'prepare' &&
    typeof obj.mirror === 'string' &&
    typeof obj.clarifiedIntention === 'string' &&
    Array.isArray(obj.approaches) &&
    typeof obj.closing === 'string'
  );
}

function isIntegrateResponse(obj: any): boolean {
  return (
    obj &&
    obj.mode === 'integrate' &&
    typeof obj.mirror === 'string' &&
    Array.isArray(obj.possibleReadings) &&
    typeof obj.whatRemainsUnknown === 'string' &&
    Array.isArray(obj.nextStepOptions) &&
    typeof obj.closing === 'string'
  );
}

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Sign in required.' },
        { status: 401 }
      );
    }
    const tester = await isMemberTester(session.memberId);
    if (!tester) {
      return NextResponse.json(
        {
          error:
            'This is an experimental Field Lab surface. To participate, opt in from /maia/field-lab.',
        },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => null);
    const input = parseInput(body);
    if (!input) {
      return NextResponse.json(
        { error: 'Invalid input: mode must be "prepare" or "integrate".' },
        { status: 400 }
      );
    }
    if (!hasAnyContent(input)) {
      return NextResponse.json(
        {
          error:
            'Add at least one piece of what you are bringing before continuing.',
        },
        { status: 400 }
      );
    }

    const systemPrompt =
      input.mode === 'prepare'
        ? buildPrepareSystemPrompt(input)
        : buildIntegrateSystemPrompt(input);
    const userMessage = buildUserMessage(input);

    let completion;
    try {
      completion = await anthropic.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      });
    } catch (err: any) {
      const status = err?.status;
      if (status === 500 || status === 529) {
        completion = await anthropic.messages.create({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          temperature: TEMPERATURE,
          system: systemPrompt,
          messages: [{ role: 'user', content: userMessage }],
        });
      } else {
        throw err;
      }
    }

    const textBlock = completion.content.find(
      (block: any) => block.type === 'text'
    ) as { type: 'text'; text: string } | undefined;
    const raw = textBlock?.text ?? '';

    const parsed = extractJson(raw);

    if (isRefusal(parsed)) {
      return NextResponse.json({
        ok: true,
        refusal: parsed as FlowRefusal,
        sanctuary: input.sanctuary,
      });
    }

    if (
      (input.mode === 'prepare' && isPrepareResponse(parsed)) ||
      (input.mode === 'integrate' && isIntegrateResponse(parsed))
    ) {
      return NextResponse.json({
        ok: true,
        response: parsed as FlowResponse,
        sanctuary: input.sanctuary,
      });
    }

    return NextResponse.json({
      ok: true,
      degraded: true,
      text: raw,
      sanctuary: input.sanctuary,
    });
  } catch (err: any) {
    console.error('[relational-navigation] error:', err?.message || err);
    return NextResponse.json(
      {
        error:
          'Something is not available right now. Try again in a moment, or return to this when you have a few minutes of quiet.',
      },
      { status: 500 }
    );
  }
}

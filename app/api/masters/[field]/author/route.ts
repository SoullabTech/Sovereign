/**
 * Master Field Authoring API
 *
 * Powers the Essence Interview and field profile management.
 * Two responsibilities:
 *
 * 1. POST /api/masters/[field]/author
 *    - action: 'save-session'   → store a completed interview module
 *    - action: 'synthesize'     → MAIA synthesizes a module's raw answers into profile sections
 *    - action: 'correct'        → append a correction to the correction log
 *    - action: 'approve'        → master marks a section as true
 *
 * 2. GET /api/masters/[field]/author
 *    - return current profile + interview state
 *
 * Storage: file-based JSON for now (no new DB migration needed).
 * Path: .soullab/master-profiles/[field].json
 * This is a practitioner-facing data store, not member data.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getLLMProvider } from '@/lib/consciousness/LLMProvider';
import { getFieldBySlug } from '@/lib/masters/registry';
import {
  MasterFieldProfile,
  InterviewSession,
  InterviewModule,
  CorrectionEntry,
  CorrectionEditType,
  createEmptyProfile,
  appendCorrection,
  SynthesizedProfile,
} from '@/lib/masters/profile';


// ─────────────────────────────────────────────────────────────────────────────
// Storage
// ─────────────────────────────────────────────────────────────────────────────

async function getProfilePath(fieldSlug: string): Promise<string> {
  const dir = path.join(process.cwd(), '.soullab', 'master-profiles');
  await fs.mkdir(dir, { recursive: true });
  return path.join(dir, `${fieldSlug}.json`);
}

async function loadProfile(fieldSlug: string): Promise<MasterFieldProfile> {
  const filePath = await getProfilePath(fieldSlug);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data) as MasterFieldProfile;
  } catch {
    return createEmptyProfile(fieldSlug);
  }
}

async function saveProfile(profile: MasterFieldProfile): Promise<void> {
  const filePath = await getProfilePath(profile.masterSlug);
  const updated: MasterFieldProfile = {
    ...profile,
    meta: { ...profile.meta, lastUpdatedAt: new Date().toISOString() },
  };
  await fs.writeFile(filePath, JSON.stringify(updated, null, 2), 'utf-8');
}

// ─────────────────────────────────────────────────────────────────────────────
// GET — return current profile state
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ field: string }> }
) {
  const { field: slug } = await params;
  const master = getFieldBySlug(slug);
  if (!master) return NextResponse.json({ error: 'Field not found' }, { status: 404 });

  const profile = await loadProfile(slug);
  return NextResponse.json({ profile });
}

// ─────────────────────────────────────────────────────────────────────────────
// POST — authoring actions
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ field: string }> }
) {
  const { field: slug } = await params;
  const master = getFieldBySlug(slug);
  if (!master) return NextResponse.json({ error: 'Field not found' }, { status: 404 });

  const body = await request.json();
  const { action } = body;

  let profile = await loadProfile(slug);

  switch (action) {
    // ── Save a completed interview module ──────────────────────────────────
    case 'save-session': {
      const session: InterviewSession = body.session;
      const existing = profile.raw.interviewSessions.findIndex(
        s => s.module === session.module
      );
      const updated: MasterFieldProfile = {
        ...profile,
        currentPhase: 'interviewing',
        raw: {
          ...profile.raw,
          interviewSessions:
            existing >= 0
              ? profile.raw.interviewSessions.map((s, i) => (i === existing ? session : s))
              : [...profile.raw.interviewSessions, session],
        },
      };
      await saveProfile(updated);
      return NextResponse.json({ success: true, profile: updated });
    }

    // ── Synthesize a module's raw answers into profile sections ───────────
    case 'synthesize': {
      const { module }: { module: InterviewModule } = body;
      const session = profile.raw.interviewSessions.find(s => s.module === module);
      if (!session) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      const synthesis = await synthesizeModule(master.name, module, session, profile);

      // Merge synthesis into the relevant sections
      const updatedSynthesized = mergeSynthesis(profile.synthesized, module, synthesis);
      const now = new Date().toISOString();

      const updated: MasterFieldProfile = {
        ...profile,
        synthesized: {
          ...updatedSynthesized,
          synthesizedAt: {
            ...updatedSynthesized.synthesizedAt,
            [moduleToSection(module)]: now,
          },
        },
      };

      // Store synthesis text back on the session
      const sessionIdx = updated.raw.interviewSessions.findIndex(s => s.module === module);
      if (sessionIdx >= 0) {
        updated.raw.interviewSessions[sessionIdx].synthesis = synthesis.narrativeSummary;
      }

      await saveProfile(updated);
      return NextResponse.json({ success: true, synthesis, profile: updated });
    }

    // ── Append a correction ────────────────────────────────────────────────
    case 'correct': {
      const { section, whatWasFalse, correction, rawWords, original, corrected, editType, acceptanceSignals } = body;

      // Store acceptance signals on the session
      const sessionIdx = profile.raw.interviewSessions.findIndex(s => s.module === section);
      const profileWithSignals: MasterFieldProfile = sessionIdx >= 0 && acceptanceSignals
        ? {
            ...profile,
            raw: {
              ...profile.raw,
              interviewSessions: profile.raw.interviewSessions.map((s, i) =>
                i === sessionIdx ? { ...s, acceptanceSignals } : s
              ),
            },
          }
        : profile;

      const updated = appendCorrection(profileWithSignals, {
        section,
        whatWasFalse,
        correction,
        rawWords,
        original,
        corrected,
        editType: editType as CorrectionEditType | undefined,
      });
      await saveProfile(updated);
      return NextResponse.json({ success: true, profile: updated });
    }

    // ── Master approves a section ──────────────────────────────────────────
    case 'approve': {
      const { section, acceptanceSignals } = body;

      // Store acceptance signals on the session even for clean approvals
      const sessionIdx = profile.raw.interviewSessions.findIndex(s => s.module === section);
      if (sessionIdx >= 0 && acceptanceSignals) {
        profile = {
          ...profile,
          raw: {
            ...profile.raw,
            interviewSessions: profile.raw.interviewSessions.map((s, i) =>
              i === sessionIdx ? { ...s, acceptanceSignals } : s
            ),
          },
        };
      }
      const now = new Date().toISOString();
      const updated: MasterFieldProfile = {
        ...profile,
        synthesized: {
          ...profile.synthesized,
          synthesizedAt: {
            ...profile.synthesized.synthesizedAt,
            [section]: profile.synthesized.synthesizedAt[section as keyof SynthesizedProfile] ?? now,
          },
          ...(section === 'maiaPosture'
            ? {
                maiaPosture: {
                  ...profile.synthesized.maiaPosture,
                  approved: true,
                  approvedAt: now,
                  lastReviewedAt: now,
                },
              }
            : {}),
        },
      };
      await saveProfile(updated);
      return NextResponse.json({ success: true, profile: updated });
    }

    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Synthesis — MAIA processes raw interview answers
// ─────────────────────────────────────────────────────────────────────────────

type ModuleSynthesisResult = {
  narrativeSummary: string;
  structuredData: Record<string, unknown>;
};

async function synthesizeModule(
  masterName: string,
  module: InterviewModule,
  session: InterviewSession,
  profile: MasterFieldProfile
): Promise<ModuleSynthesisResult> {

  const masterAnswers = session.turns
    .filter(t => t.role === 'master')
    .map(t => t.content)
    .join('\n\n---\n\n');

  const systemPrompt = getSynthesisSystemPrompt(module, masterName);

  const llmResponse = await getLLMProvider().generateSimple({
    tier: 'core',
    systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Here are ${masterName}'s answers from the ${module} module of their field interview:\n\n${masterAnswers}\n\nSynthesize this into the structured JSON format. Be accurate to their words. Do not add warmth they didn't express. Do not flatten nuance.`,
      },
    ],
    maxTokens: 1500,
  });

  const text = llmResponse.text;

  try {
    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) ||
                      text.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch?.[1] ?? jsonMatch?.[0] ?? '{}';
    const structuredData = JSON.parse(jsonStr) as Record<string, unknown>;
    const narrativeSummary = typeof structuredData.narrativeSummary === 'string'
      ? structuredData.narrativeSummary
      : text.split('\n')[0];

    return { narrativeSummary, structuredData };
  } catch {
    return {
      narrativeSummary: text.slice(0, 300),
      structuredData: { raw: text },
    };
  }
}

function getSynthesisSystemPrompt(module: InterviewModule, masterName: string): string {
  const base = `You are synthesizing what ${masterName} shared during their field authoring interview.
Your job is not to summarize — it is to listen back accurately.

The narrativeSummary you write will be shown to ${masterName} as "what I understood."
It must sound like them, not like a description of them.

Before you write anything, answer this question silently to yourself:
"What would flatten this person — what would make them generic?"
Then do the opposite of that. Name what makes them specifically themselves.

Constraints that matter:
- Use their exact words and phrases when possible. If they said "I stay with the signal," use that.
- Do not recast their language into softer, more universal terms.
- Do not add warmth, authority, or polish they didn't express.
- Use verbs, not adjectives. Not "you are spacious." Instead: "You don't move until something actually moves."
- If they were brief, be brief. Match their compression.
- If they were layered and careful, match that density — do not compress where they didn't.
- If something is ambiguous in their answers, preserve the ambiguity — do not resolve it.
- narrativeSummary: 2–3 sentences maximum. Earned, not padded.

What not to do:
- Do NOT write: "You value presence and transformation."
- Do NOT write: "You bring deep awareness and care to your work."
- Do NOT write: "You help people find their authentic path."
- Do NOT write: "You hold space for deep inquiry." (this fits everyone)
These sound like you generated them. They don't sound like them.

What to do instead — ground it in what only they said:
- Write: "You don't rush people. You stay with the signal until it shifts."
- Write: "You notice what isn't being said. And you wait."
- Write: "The rigor and the reverence are not in tension for you — but you know most people think they should be."

Return valid JSON with a "narrativeSummary" field plus the structured fields below.

`;

  const modulePrompts: Record<InterviewModule, string> = {
    presence: base + `Return JSON with:
{
  "narrativeSummary": "2-3 sentences grounded in their exact words. Sounds like them.",
  "openingFeeling": "what people feel when they enter their field — in their language",
  "paceDescription": "the pace they keep and what they slow down for — use their words",
  "presenceQualities": ["their words", "not your adjectives"]
}`,

    paradox: base + `This is the most important module. The paradox is the most distinctive thing about them.
Get this wrong and the field will flatten them. Get it right and it will hold them.

The paradox statement must:
- Name both sides in their exact framing (not paraphrased)
- Preserve tension — not resolve it
- Sound strange if one side were removed

Return JSON with:
{
  "narrativeSummary": "2-3 sentences that name the tension clearly. Do not resolve it.",
  "paradox": {
    "statement": "They hold [quality A] and [quality B] — in their exact framing, not a rewrite",
    "bothMustBeTrue": "why both must be present for their work to feel real — in their words",
    "whatGetsFlattenedWithout": "what is lost when only one side shows — be specific"
  },
  "whatIsMisunderstood": "the correction they most need made — their words, not softened",
  "whatMustRemainTrue": "the invariant they are protecting — what cannot be flattened"
}`,

    boundaries: base + `Return JSON with:
{
  "narrativeSummary": "2-3 sentences. State what they won't do and who it isn't for. Be plain.",
  "whatTheyDontDo": ["specific things they named — verbatim if possible"],
  "maiaCannotSay": ["exact phrases or approaches they flagged"],
  "maiaCannotImply": ["inferences to prevent — specific, not general"],
  "clientFit": "who this is for — in their words, not smoothed",
  "clientNotFit": "who it is not for — say it plainly, as they did",
  "falseTones": ["tones that would feel wrong — their language"],
  "whatWouldMisrepresentThem": "the wince test — what would make them cringe to see"
}`,

    world: base + `Return JSON with:
{
  "narrativeSummary": "2-3 sentences. Describe the feeling of their aesthetic world — use their references.",
  "lightQuality": "dark | low | dappled | neutral | bright | open — pick the closest",
  "textureDescriptions": ["words they actually used"],
  "photographyStyle": "how they described their visual world — their language",
  "symbolsLoved": ["symbols they named"],
  "symbolsNeverUse": ["what must never appear — their words"],
  "sonicAtmosphere": "sound or silence they mentioned, or null",
  "naturalElements": ["elements they mentioned"],
  "spaceDescription": "where/how they described their working space — quote them if possible",
  "populations": [
    {
      "who": "the group — their words, not a label",
      "whatTheyNeed": "what this group needs from them that others don't"
    }
  ]
}

If they described people at all — clients, students, participants, colleagues — extract each group separately.
If they named the difference clearly, preserve the distinction exactly. Don't merge what they kept separate.`,

    becoming: base + `Return JSON with:
{
  "narrativeSummary": "2-3 sentences. Name what is actually shifting — don't soften it.",
  "whatIsChanging": "what is shifting in their work now — their words",
  "whatIsNoLongerTrue": "what others still assume that no longer fits — be direct",
  "whatIsEmerging": "what the field doesn't yet reflect but is growing — their language"
}`,
  };

  return modulePrompts[module];
}

// Map module to the synthesized profile section it primarily feeds
function moduleToSection(module: InterviewModule): keyof SynthesizedProfile {
  const map: Record<InterviewModule, keyof SynthesizedProfile> = {
    presence: 'essence',
    paradox: 'essence',
    boundaries: 'boundaries',
    world: 'aestheticWorld',
    becoming: 'essence',
  };
  return map[module];
}

// Merge structured synthesis data into the correct profile sections
function mergeSynthesis(
  current: SynthesizedProfile,
  module: InterviewModule,
  synthesis: ModuleSynthesisResult
): SynthesizedProfile {
  const d = synthesis.structuredData;

  switch (module) {
    case 'presence':
      return {
        ...current,
        essence: {
          ...current.essence,
          openingFeeling: (d.openingFeeling as string) || current.essence.openingFeeling,
          paceDescription: (d.paceDescription as string) || current.essence.paceDescription,
          presenceQualities: (d.presenceQualities as string[]) || current.essence.presenceQualities,
        },
      };

    case 'paradox':
      return {
        ...current,
        essence: {
          ...current.essence,
          paradox: (d.paradox as typeof current.essence.paradox) || current.essence.paradox,
          whatIsMisunderstood: (d.whatIsMisunderstood as string) || current.essence.whatIsMisunderstood,
          whatMustRemainTrue: (d.whatMustRemainTrue as string) || current.essence.whatMustRemainTrue,
        },
      };

    case 'boundaries':
      return {
        ...current,
        boundaries: {
          ...current.boundaries,
          whatTheyDontDo: (d.whatTheyDontDo as string[]) || current.boundaries.whatTheyDontDo,
          maiaCannotSay: (d.maiaCannotSay as string[]) || current.boundaries.maiaCannotSay,
          maiaCannotImply: (d.maiaCannotImply as string[]) || current.boundaries.maiaCannotImply,
          clientFit: (d.clientFit as string) || current.boundaries.clientFit,
          clientNotFit: (d.clientNotFit as string) || current.boundaries.clientNotFit,
          falseTones: (d.falseTones as string[]) || current.boundaries.falseTones,
          whatWouldMisrepresentThem: (d.whatWouldMisrepresentThem as string) || current.boundaries.whatWouldMisrepresentThem,
        },
      };

    case 'world':
      return {
        ...current,
        aestheticWorld: {
          ...current.aestheticWorld,
          lightQuality: (d.lightQuality as string) || current.aestheticWorld.lightQuality,
          textureDescriptions: (d.textureDescriptions as string[]) || current.aestheticWorld.textureDescriptions,
          photographyStyle: (d.photographyStyle as string) || current.aestheticWorld.photographyStyle,
          symbolsLoved: (d.symbolsLoved as string[]) || current.aestheticWorld.symbolsLoved,
          symbolsNeverUse: (d.symbolsNeverUse as string[]) || current.aestheticWorld.symbolsNeverUse,
          sonicAtmosphere: (d.sonicAtmosphere as string | undefined) ?? current.aestheticWorld.sonicAtmosphere,
          naturalElements: (d.naturalElements as string[]) || current.aestheticWorld.naturalElements,
          spaceDescription: (d.spaceDescription as string) || current.aestheticWorld.spaceDescription,
        },
      };

    case 'becoming':
      return {
        ...current,
        essence: {
          ...current.essence,
          // 'becoming' answers feed the evolution state, not essence directly
          // but we capture any essence refinements here
        },
      };

    default:
      return current;
  }
}

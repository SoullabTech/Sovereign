/**
 * QA walk-through harness for Relational Navigation Room.
 *
 * Bypasses the auth wall to exercise the prompt + response parsing path
 * directly against Anthropic. Reports the structured response so we can
 * observe the four-register parity, lens behavior, and refusal warmth.
 *
 * Usage:
 *   tsx scripts/walk-relational-navigation.ts [prepare|integrate|refusal]
 *
 * NOT for production. Local-only QA harness.
 */

import Anthropic from '@anthropic-ai/sdk';
import {
  buildPrepareSystemPrompt,
  buildIntegrateSystemPrompt,
  buildUserMessage,
} from '../lib/maia/relationalNavigation/prompts';
import type {
  IntegrateInput,
  PrepareInput,
} from '../lib/maia/relationalNavigation/types';

const anthropic = new Anthropic();
const MODEL = 'claude-opus-4-7';

const PREPARE_INPUT: PrepareInput = {
  mode: 'prepare',
  context:
    "I need to talk to my mother about how she's been calling every day since my dad died, and I'm getting worn down but also feel guilty for wanting space.",
  relationalTag: 'my mother',
  whatMatters:
    'I love her and I want to stay connected, but the daily calls are pulling me out of my own grief. I have less and less space for my own life and my own pace of grieving.',
  whatIHopeFor:
    'That we can love each other through this without me disappearing into her need. That she can also have her own support beyond me.',
  whatIFear:
    'That if I name this she will feel rejected and her grief will get worse. That she will feel like she lost dad and is now losing me too.',
  whatINeedToStayTrueTo:
    'My own pace. My own grief. The truth that I cannot be her only person.',
  lenses: ['boundaries', 'grief'],
  sanctuary: false,
};

const INTEGRATE_INPUT: IntegrateInput = {
  mode: 'integrate',
  context: 'The conversation I prepared for happened last night.',
  relationalTag: 'my mother',
  whatHappened:
    'I told her I needed to shift the calls to a few times a week instead of every day. She was quiet for a long time and then said "okay, I understand." Then we talked about dad for a bit and she cried.',
  whatFeltClear:
    'That I said the thing I needed to say. That she did not lash out.',
  whatFeltUnresolved:
    'I do not know if she actually understood, or if she is just hurt and will hold it inside. The quietness on her end could mean acceptance or could mean withdrawal.',
  whatSurprisedMe:
    'That she shifted to talking about dad after I named it. I expected her to keep talking about the calls, but she went somewhere else entirely.',
  whatIWishIHadSaid:
    'That I love her. I named the boundary but I do not think I made the love part visible enough.',
  possibleNextStep:
    'Call her tomorrow with no agenda and just be present. Or write her a note.',
  lenses: ['repair', 'grief', 'boundaries'],
  sanctuary: false,
};

const REFUSAL_INPUT: PrepareInput = {
  mode: 'prepare',
  context: "What did my mother really mean when she said 'okay, I understand'? Was she actually accepting it or was she shutting down on me? Tell me what she really meant.",
  relationalTag: 'my mother',
  whatMatters: 'I need to know what she really meant.',
  whatIHopeFor: 'A clear interpretation of her words.',
  whatIFear: 'That she is angry but not saying it.',
  whatINeedToStayTrueTo: 'The truth of what she was actually feeling.',
  lenses: ['attachment', 'shadow'],
  sanctuary: false,
};

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

async function run(label: string, input: PrepareInput | IntegrateInput) {
  console.log('\n' + '='.repeat(72));
  console.log(`WALK: ${label}`);
  console.log('='.repeat(72));
  const system =
    input.mode === 'prepare'
      ? buildPrepareSystemPrompt(input)
      : buildIntegrateSystemPrompt(input as IntegrateInput);
  const user = buildUserMessage(input);

  const start = Date.now();
  const completion = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2400,
    system,
    messages: [{ role: 'user', content: user }],
  });
  const elapsed = Date.now() - start;

  const textBlock = completion.content.find(
    (b: any) => b.type === 'text'
  ) as { type: 'text'; text: string } | undefined;
  const raw = textBlock?.text ?? '';
  const parsed = extractJson(raw) as any;

  console.log(`\n[meta] elapsed=${elapsed}ms tokens_in=${completion.usage?.input_tokens} tokens_out=${completion.usage?.output_tokens}`);
  console.log(`[meta] parse_ok=${!!parsed} shape=${parsed?.refusal ? 'refusal' : parsed?.mode || 'unknown'}`);

  if (parsed?.refusal) {
    console.log('\n--- REFUSAL ---');
    console.log('reframe:    ', parsed.reframe);
    console.log('invitation: ', parsed.invitation);
    return;
  }

  if (!parsed) {
    console.log('\n--- RAW (parse failed) ---');
    console.log(raw);
    return;
  }

  console.log('\n--- MIRROR ---\n' + parsed.mirror);
  if (parsed.mode === 'prepare') {
    console.log('\n--- CLARIFIED INTENTION ---\n' + parsed.clarifiedIntention);
    console.log('\n--- APPROACHES (count: ' + parsed.approaches?.length + ') ---');
    (parsed.approaches || []).forEach((a: string, i: number) =>
      console.log(`  ${i + 1}. ${a}`)
    );
    console.log('\n--- POSSIBLE OPENING ---\n' + parsed.possibleOpening);
    console.log('\n--- NERVOUS SYSTEM CHECK ---\n' + parsed.nervousSystemCheck);
    console.log('\n--- BOUNDARIES & SUPPORT ---\n' + parsed.boundariesAndSupport);
  } else {
    console.log('\n--- POSSIBLE READINGS (count: ' + parsed.possibleReadings?.length + ') ---');
    (parsed.possibleReadings || []).forEach((r: string, i: number) =>
      console.log(`  ${i + 1}. ${r}`)
    );
    console.log('\n--- WHAT BELONGS TO YOU ---\n' + parsed.whatBelongsToYou);
    console.log('\n--- WHAT REMAINS UNKNOWN ---\n' + parsed.whatRemainsUnknown);
    console.log('\n--- NEXT STEP OPTIONS ---');
    (parsed.nextStepOptions || []).forEach((o: any) =>
      console.log(`  [${o.kind}] ${o.label} — ${o.description}`)
    );
  }
  console.log('\n--- KNOW / FELT / INFERRED / UNKNOWN ---');
  const k = parsed.knowFeltInferredUnknown || {};
  console.log('  known:    ', k.known);
  console.log('  felt:     ', k.felt);
  console.log('  inferred: ', k.inferred);
  console.log('  unknown:  ', k.unknown);
  console.log('\n--- CLOSING ---\n' + parsed.closing);

  console.log('\n--- DRIFT SCAN ---');
  const text = JSON.stringify(parsed);
  const flags: string[] = [];
  const forbid: Array<[RegExp, string]> = [
    [/\bthey are (?!provisional|one)/i, 'asserts about absent party'],
    [/\bshe is (?!feeling|carrying|trying|holding|grieving)/i, 'asserts about absent party (she)'],
    [/\bhe is (?!feeling|carrying|trying|holding|grieving)/i, 'asserts about absent party (he)'],
    [/what (?:she|he|they) really meant/i, 'claims to know real meaning'],
    [/you should (?!consider|notice|trust)/i, 'directive'],
    [/(?:^|\s)diagnos/i, 'diagnostic language'],
    [/(?:narciss|borderline|personality disorder)/i, 'clinical label'],
    [/(?:^|\s)right thing to do/i, 'moral prescription'],
  ];
  for (const [re, label] of forbid) {
    if (re.test(text)) flags.push(label);
  }
  console.log(flags.length === 0 ? '  (no obvious drift markers)' : '  Flags: ' + flags.join('; '));
}

async function main() {
  const which = process.argv[2] || 'prepare';
  try {
    if (which === 'prepare' || which === 'all') await run('PREPARE FLOW', PREPARE_INPUT);
    if (which === 'integrate' || which === 'all') await run('INTEGRATE FLOW', INTEGRATE_INPUT);
    if (which === 'refusal' || which === 'all') await run('REFUSAL PATH', REFUSAL_INPUT);
  } catch (e: any) {
    console.error('ERROR:', e?.message || e);
    process.exit(1);
  }
}

main();

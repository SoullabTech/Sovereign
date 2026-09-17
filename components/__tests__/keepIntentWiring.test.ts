/**
 * T1A-J5 member-act wiring — recognition must remain non-consuming and each
 * governed act may reach only its own authorized affordance.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const SOURCE = readFileSync(join(__dirname, '..', 'OracleConversation.tsx'), 'utf8');

const ACT_BLOCK = (() => {
  const start = SOURCE.indexOf('const keepIntent = detectKeepIntent(cleanedText);');
  expect(start).toBeGreaterThan(-1);
  const end = SOURCE.indexOf('// 🚪 CLIENT-SIDE INTENT DETECTION', start);
  expect(end).toBeGreaterThan(start);
  return SOURCE.slice(start, end);
})();

const TEXT_HANDLER = (() => {
  const start = SOURCE.indexOf('const handleTextMessage = useCallback(');
  expect(start).toBeGreaterThan(-1);
  return SOURCE.slice(start, start + 4000);
})();

function between(startMarker: string, endMarker: string): string {
  const start = ACT_BLOCK.indexOf(startMarker);
  expect(start).toBeGreaterThan(-1);
  const end = ACT_BLOCK.indexOf(endMarker, start);
  expect(end).toBeGreaterThan(start);
  return ACT_BLOCK.slice(start, end);
}

describe('recognition preserves the conversational turn', () => {
  it('runs at the response seam, after a MAIA reply exists', () => {
    const seam = SOURCE.indexOf('const keepIntent = detectKeepIntent(cleanedText);');
    const reply = SOURCE.indexOf('const oracleMessage');
    expect(reply).toBeGreaterThan(-1);
    expect(seam).toBeGreaterThan(reply);
  });

  it('is not wired into handleTextMessage beside the consuming journal detector', () => {
    expect(TEXT_HANDLER).not.toContain('detectKeepIntent');
  });

  it('does not return early from the member-act block', () => {
    expect(ACT_BLOCK).not.toMatch(/\breturn\b/);
  });
});

describe('the client consumes the multi-act result rather than a winner-takes-all kind', () => {
  it('reads KEEP, CONTINUE and OPEN_KEEP independently', () => {
    expect(ACT_BLOCK).toContain("match.act === 'keep'");
    expect(ACT_BLOCK).toContain("match.act === 'continue'");
    expect(ACT_BLOCK).toContain("match.act === 'open_keep'");
    expect(ACT_BLOCK).not.toContain('keepIntent.kind');
  });

  it('AMBIGUOUS carries no selector authority', () => {
    const ambiguous = ACT_BLOCK.slice(ACT_BLOCK.indexOf("keepIntent.resolution === 'ambiguous'"));
    expect(ambiguous).toContain('no action selected');
    expect(ambiguous).not.toContain('buildUiAction');
    expect(ambiguous).not.toContain('handleCaptureSpiritRef');
  });
});

describe('KEEP and CONTINUE cannot substitute for one another', () => {
  it('KEEP alone may surface the member-controlled doorway and never opens the panel', () => {
    const keep = between('// KEEP execution', '// CONTINUE execution intentionally absent');
    expect(keep).toContain('if (hasKeep');
    expect(keep).toContain('buildUiAction');
    expect(keep).toContain("leadIn: 'You asked to keep this.'");
    expect(keep).not.toContain('handleCaptureSpiritRef');
  });

  it('CONTINUE has no Keep fallback, panel open, or persistence action', () => {
    const cont = between('// CONTINUE execution intentionally absent',("} else if (keepIntent.resolution === 'ambiguous')"));
    expect(cont).toContain('if (hasContinue)');
    expect(cont).toContain('execution unavailable · no Keep fallback');
    expect(cont).not.toContain('buildUiAction');
    expect(cont).not.toContain('handleCaptureSpiritRef');
    expect(cont).not.toMatch(/apiFetch|createCapsule|\/api\/capsules/);
  });

  it('a compound KEEP + CONTINUE can execute KEEP without erasing the separately recognized CONTINUE', () => {
    expect(ACT_BLOCK).toContain('if (hasKeep');
    expect(ACT_BLOCK).toContain('if (hasContinue)');
    expect(ACT_BLOCK.indexOf('if (hasContinue)')).toBeGreaterThan(ACT_BLOCK.indexOf('if (hasKeep'));
  });
});

describe('OPEN_KEEP still only opens the zero-persistence surface', () => {
  it('explicit open invokes the capture handler without deciding a Keep', () => {
    const open = between('// OPEN_KEEP execution', '// KEEP execution');
    expect(open).toContain('if (hasOpenKeep)');
    expect(open).toContain('handleCaptureSpiritRef.current?.()');
    expect(open).not.toContain('buildUiAction');
  });

  it('the opened route still cannot persist on open', () => {
    const route = readFileSync(
      join(__dirname, '..', '..', 'app', 'api', 'capsules', 'from-chat-window', 'route.ts'),
      'utf8',
    ).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    expect(route).not.toMatch(/\bcreateCapsule\s*\(/);
  });
});

describe('Sanctuary remains ENCOUNTER ONLY', () => {
  it('the Sanctuary branch comes before every act execution and exposes no affordance', () => {
    const guard = ACT_BLOCK.indexOf('if (isSanctuary) {');
    const execution = ACT_BLOCK.indexOf('// OPEN_KEEP execution');
    expect(guard).toBeGreaterThan(-1);
    expect(guard).toBeLessThan(execution);
    const branch = ACT_BLOCK.slice(guard, execution);
    expect(branch).not.toContain('handleCaptureSpiritRef');
    expect(branch).not.toContain('buildUiAction');
  });

  it('the source guard in handleCaptureSpirit still backs up the response seam', () => {
    const handler = SOURCE.slice(
      SOURCE.indexOf('const handleCaptureSpirit = useCallback'),
      SOURCE.indexOf('}, [userId, messages, sessionId, isSanctuary]);'),
    );
    expect(handler).toMatch(/if \(isSanctuary\) \{/);
  });
});

describe('MAIA receives the same KEEP / CONTINUE truth before she replies', () => {
  it('the platform map explicitly separates CONTINUE from Keep', () => {
    const map = readFileSync(
      join(__dirname, '..', '..', 'lib', 'sovereign', 'platformKnowledge.ts'),
      'utf8',
    );
    expect(map).toContain('"keep this open," "leave this open," and "come back to this"');
    expect(map).toContain('they are CONTINUE, not Keep');
    expect(map).toContain('CONTINUE is never silently substituted with Keep');
  });

  it('the voice boundary forbids claiming either unconfirmed persistence or continuity', () => {
    const voice = readFileSync(
      join(__dirname, '..', '..', 'lib', 'sovereign', 'maiaVoice.ts'),
      'utf8',
    );
    expect(voice).toContain('MEMORY SPEECH-ACT BOUNDARY (non-negotiable)');
    expect(voice).toContain('KEEP / CONTINUE SPEECH-ACT BOUNDARY');
    expect(voice).toContain('Never convert CONTINUE into KEEP');
    expect(voice).toContain('must not claim that continuity was established unless a separate substrate confirms it');
  });
});

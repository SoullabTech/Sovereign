import * as fs from 'fs';
import * as path from 'path';
import { handoffToMaia, MAIA_CONVERSATION_PARAM, MAIA_WORK_PARAM } from '../workContext';
import { canvasWithEditorialThread, canvasWithoutEditorialThread } from '../canvasIdentity';

const read = (...p: string[]) =>
  fs.readFileSync(path.join(__dirname, '..', ...p), 'utf8');
/* ⭐ COMMENTS ARE STRIPPED BEFORE EVERY SCAN. The C21 discipline: a file that
   documents the thing it refuses to do must not fail for saying so. */
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');

const surface = strip(read('canvas', 'WorkConversation.tsx'));
const identity = strip(read('useMemberIdentity.ts'));
const canvas = strip(read('canvas', 'CanvasClient.tsx'));
const client = strip(read('..', '..', 'lib', 'writersStudio', 'askClient.ts'));

/**
 * MAIA-CONVERGENCE-01 · CANVAS — the ordinary conversation, on the durable spine.
 *
 * ⭐⭐ THIS SUITE SUPERSEDES `studioConversation.test.ts`, which is deleted. Its
 * laws are transplanted here unchanged wherever they still hold. Three did not
 * survive, and each is recorded below with the reason rather than dropped:
 *
 *   ⛔ *"mints an id the Studio owns"*
 *   ⛔ *"is stable for the page, so dismiss and reopen continues the exchange"*
 *   ⛔ *"travels with Open in MAIA so full MAIA continues it"*
 *
 * ⭐ ALL THREE WERE CORRECT FOR THE ARCHITECTURE THEY GOVERNED. When the room
 * had no durable spine, minting was the honest alternative to guessing, and
 * carrying the minted id onward was the only continuity available. The spine
 * exists now, so the same laws would today assert that a conversation's identity
 * is decided in a browser tab.
 */

describe('SUPERSEDED — what the old suite asserted, and why it no longer holds', () => {
  it('⛔ no minted conversation identity survives on this path', () => {
    for (const src of [surface, canvas]) {
      expect(src).not.toContain('mintStudioConversationId');
      expect(src).not.toMatch(/conversationId/);
    }
  });

  it('⛔ and the component it governed is gone, not merely unmounted', () => {
    expect(fs.existsSync(path.join(__dirname, '..', 'canvas', 'StudioConversation.tsx')))
      .toBe(false);
    expect(canvas).not.toContain('StudioConversation');
  });

  it('⚠️ Open in MAIA still omits a conversation id, and that clause is unchanged', () => {
    /* The old suite's `omits it when there is no exchange to continue` is the
       one of the three that survives — and it is now the ONLY path, because an
       `ask_threads` id handed to a surface that reads it as a session identity
       would conflate two identity spaces to preserve an appearance. */
    const href = handoffToMaia('/maia', { workId: 'w1', manuscriptId: 'ms-1' });
    expect(href).not.toContain(MAIA_CONVERSATION_PARAM);
    expect(new URLSearchParams(href.slice(href.indexOf('?'))).get(MAIA_WORK_PARAM)).toBe('w1');
  });
});

describe('⭐⭐ the conversation is the server’s, never the browser’s', () => {
  it('⛔ replays no history, claims no member, mints no session', () => {
    for (const banned of ['conversationHistory', 'userId:', 'sessionId:']) {
      expect(surface).not.toContain(banned);
    }
  });

  it('⭐ renders turns from the loaded thread, and assembles none locally', () => {
    expect(surface).toContain('thread?.turns ?? []');
    /* ⛔ No local transcript array to render from. `setTurns` was the old
       mechanism and there is nothing equivalent. */
    expect(surface).not.toMatch(/setTurns|useState<Turn\[\]>/);
  });

  it('⛔ an in-flight question is a PENDING question, never promoted to a turn', () => {
    expect(surface).toContain('data-pending-question="true"');
    /* The pending value is cleared by the server's answer; it is never pushed
       into anything the transcript reads. */
    expect(surface).toMatch(/setPending\(null\)/);
    expect(surface).not.toMatch(/\.\.\.turns,|turns\.concat/);
  });

  it('⭐ reaches the spine through the proven client only', () => {
    expect(surface).toContain("from '@/lib/writersStudio/askClient'");
    /* ⛔ No second transport. A hand-rolled fetch here is how a path acquires
       its own contract. */
    expect(surface).not.toContain('apiFetch(');
  });
});

describe('⭐ identity is the Work; the section is where she presently is', () => {
  it('⭐ discovery runs on the Work anchor and on nothing else', () => {
    expect(surface).toContain("const WORK_ANCHOR = { on: 'work' } as const");
    expect(surface).toContain('threadsOn(manuscriptId, WORK_ANCHOR)');
  });

  it('⛔⛔ the discovery effect does not depend on sectionId', () => {
    /* THE BACK DOOR THIS CLOSES: re-discovering when the writer scrolls would
       make the locus an input to identity without anyone deciding that it is. */
    const effect = surface.slice(surface.indexOf('threadsOn(manuscriptId, WORK_ANCHOR)'));
    const deps = effect.slice(effect.indexOf('}, ['), effect.indexOf('}, [') + 60);
    expect(deps).not.toContain('sectionId');
    expect(deps).toContain('manuscriptId');
  });

  it('⛔ sectionId is a sibling of the anchor, never folded into it', () => {
    /* A `work` anchor admits exactly the key `on`; the route refuses one
       carrying any other. Folding a locus in would make scrolling a change of
       relationship — the one thing B3 forbade. */
    expect(client).toMatch(/\.\.\.\(input\.sectionId \? \{ sectionId: input\.sectionId \} : \{\}\)/);
    expect(client).not.toMatch(/anchor:\s*\{[^}]*sectionId/);
    expect(surface).not.toMatch(/on: 'work'[^}]*sectionId/);
  });

  it('⭐ the room hands the active passage over as context', () => {
    expect(canvas).toMatch(/sectionId=\{writing\?\.activeId \?\? null\}/);
  });
});

describe('⛔⛔ the room does not choose, and array position is not a ranking', () => {
  it('⛔ no thread is taken by position', () => {
    for (const src of [surface, canvas]) {
      expect(src).not.toMatch(/threads\[0\]/);
      expect(src).not.toMatch(/\.threads\.at\(/);
      expect(src.toLowerCase()).not.toContain('recent');
    }
  });

  it('⛔ and none is privileged by presentation', () => {
    /* THE TEMPTING FUTURE SHORTCUT, named so it fails loudly. Presentation
       order may follow the returned order; SELECTION may not be derived from it.

       ⚠️ THE FIRST DRAFT OF THIS TEST BANNED THE BARE WORDS `primary`, `latest`
       and `current`, and failed — on `color: INK.primary`, a THEME TOKEN. The
       ban was scanning for spellings rather than for the behaviour, which is the
       same defect as a prohibition that fires on the prose documenting it. So it
       now asserts two precise things: no privileging ATTRIBUTE, and no ranking
       word in anything the WRITER READS. */
    const choose = surface.slice(surface.indexOf("decision?.kind === 'choose'"));
    const region = choose.slice(0, choose.indexOf("decision?.kind === 'fresh'"));

    for (const banned of [
      'defaultChecked', 'autoFocus', 'aria-current', 'aria-selected',
      'defaultOpen', 'open={true}',
    ]) {
      expect(region).not.toContain(banned);
    }

    /* ⛔ Nor by index: `map((t, i) => … i === 0 …)` is the same privileging
       wearing a loop. */
    expect(region).not.toMatch(/\(\s*t\s*,\s*i\s*\)/);
    expect(region).not.toMatch(/index === 0|i === 0/);

    /* ⛔ And no ranking word reaches the writer. Text nodes only — a style
       token is not something she reads. */
    const shown = (region.match(/>[^<>{}]+</g) ?? []).join(' ').toLowerCase();
    for (const word of ['current', 'latest', 'primary', 'most recent']) {
      expect(shown).not.toContain(word);
    }
  });

  it('⭐ the four-state law is imported, never re-derived beside itself', () => {
    expect(surface).toContain('resumeDecision');
    expect(surface).toContain('sendMode');
    /* ⛔ No local re-implementation: the surface must not decide from lengths. */
    expect(surface).not.toMatch(/threads\.length === 0|threads\.length === 1/);
  });

  it('⛔⛔ a failed lookup blocks, and never rounds to "there are none"', () => {
    expect(surface).toContain('data-discovery="unavailable"');
    expect(surface).toContain("mode.kind === 'blocked'");
  });

  it('⭐ permission and payload come from ONE call to sendMode', () => {
    const send = surface.slice(surface.indexOf('const send = async'));
    const body = send.slice(0, send.indexOf('if (identity.phase'));
    expect(body).toMatch(/mode\.kind === 'resume' \? \{ threadId: mode\.threadId \} : \{ anchor: WORK_ANCHOR \}/);
    expect(body).toContain("mode.kind === 'blocked'");
  });
});

describe('⭐ turning editorial off removes the mode, never MAIA', () => {
  it('⭐⭐ the ordinary conversation is mounted under BOTH settings of the flag', () => {
    /* SUPERSEDES `false is the existing room, not a degraded one`. That law was
       right when the two surfaces were alternatives; it is wrong now, because
       the alternative it protected has become MAIA's ordinary relationship. */
    const panel = canvas.slice(canvas.indexOf('conversationOpen && work && manuscript'));
    const region = panel.slice(0, panel.indexOf('<MaiaColumn'));
    expect(region).toContain('<WorkConversation');
    /* ⚠️⚠️ THIS ASSERTION WAS NOT LETHAL AND A MUTANT PROVED IT. It read only the
       element's OWN PROPS — `slice(indexOf('<WorkConversation'))` — so a mutant
       that wrote `{!editorialEnabled && <WorkConversation …}` gated the mount
       from OUTSIDE the slice and survived. ⛔ An element is not unconditional
       because its attributes are: the condition lives in front of it. */
    const at = region.indexOf('<WorkConversation');
    const before = region.slice(Math.max(0, at - 240), at);
    expect(before).not.toContain('editorialEnabled');
    const props = region.slice(at, region.indexOf('/>', at));
    expect(props).not.toContain('editorialEnabled');
  });

  it('⭐ the flag gates the editorial capability, and only that', () => {
    const panel = canvas.slice(canvas.indexOf('conversationOpen && work && manuscript'));
    const region = panel.slice(0, panel.indexOf('<MaiaColumn'));
    expect(region).toMatch(/editorialEnabled && \(editorialThreadId !== null \|\| editorialMode\)/);
    expect(region).toContain('data-enter-editorial="true"');
  });

  it('⭐ entering is a gesture, and so is leaving', () => {
    expect(canvas).toContain('data-leave-editorial="true"');
    expect(canvas).toContain('canvasWithoutEditorialThread');
    /* ⛔ Entering editorial must not be a consequence of rendering. */
    const enter = canvas.slice(canvas.indexOf('data-enter-editorial'));
    expect(enter.slice(0, 300)).toContain('onClick');
  });

  it('⭐ the address can un-name a relationship as well as name one', () => {
    const named = canvasWithEditorialThread('/writers-studio/canvas', '?manuscript=ms-1', 'th-9');
    expect(named).toContain('editorialThread=th-9');
    expect(named).toContain('manuscript=ms-1');
    const cleared = canvasWithoutEditorialThread('/writers-studio/canvas', '?manuscript=ms-1&editorialThread=th-9');
    expect(cleared).not.toContain('editorialThread');
    /* ⛔ It deletes one parameter, never the room's identity. */
    expect(cleared).toContain('manuscript=ms-1');
  });

  it('⛔ the editorial panel is still handed no chrome of its own', () => {
    const ed = canvas.slice(canvas.indexOf('<EditorialConversation'));
    expect(ed.slice(0, ed.indexOf('/>'))).not.toContain('onClose');
  });
});

/* ══ TRANSPLANTED UNCHANGED — laws that survive the change of spine ══ */

describe('identity is server truth, never browser storage', () => {
  it('resolves the member through /api/members/me', () => {
    expect(identity).toContain("apiFetch('/api/members/me'");
  });

  it('never reads identity out of localStorage — in the Studio', () => {
    for (const src of [identity, surface, canvas]) {
      expect(src).not.toContain('localStorage');
      expect(src).not.toContain('sessionStorage');
    }
  });

  it('fails closed when identity cannot be established', () => {
    expect(surface).toContain("identity.phase === 'unauthorized'");
    expect(surface).toMatch(/identity\.phase === 'error' \|\| !identity\.memberId/);
  });
});

describe('decides nothing about the exchange itself', () => {
  it('builds no prompt, selects no tier, holds no memory', () => {
    for (const forbidden of [
      'buildPrompt', 'addendum', 'processingProfile', 'systemPrompt', 'memory',
    ]) {
      expect(surface.toLowerCase()).not.toContain(forbidden.toLowerCase());
    }
  });

  it('does not embed the viewport-owning component', () => {
    expect(surface).not.toContain('OracleConversation');
  });
});

describe('opening Conversations is not consent to listen', () => {
  it('contains no capture API of any kind', () => {
    for (const banned of [
      'getUserMedia', 'mediaDevices', 'AudioContext', 'MediaRecorder',
      'SpeechRecognition', 'webkitSpeechRecognition',
    ]) {
      expect(surface).not.toContain(banned);
    }
  });

  it('renders no voice component beneath it', () => {
    for (const banned of [
      'ContinuousConversation', 'MicrophoneCapture', 'MicInputWithTorus',
      'EnhancedVoiceControls', 'MaiaCapture',
    ]) {
      expect(surface).not.toContain(banned);
    }
  });

  it('adds no in-Studio microphone affordance', () => {
    for (const banned of ['Talk with MAIA', 'startListening', 'voiceEnabled', 'isListening']) {
      expect(surface).not.toContain(banned);
    }
  });

  it('offers a text composer and nothing else to speak into', () => {
    expect(surface).toContain('<textarea');
    expect(surface).toContain('WORK_CONVERSATION_PLACEHOLDER');
  });
});

describe('a Keep is the member handing her a passage', () => {
  it('offers the member their own kept passages', () => {
    expect(surface).toContain('useManuscriptKeeps');
    expect(surface).toContain('data-keeps-toggle="true"');
  });

  it('⭐ puts a chosen Keep in the COMPOSER, never straight into the exchange', () => {
    expect(surface).toMatch(/setDraft\(\(d\) =>/);
    const chooser = surface.slice(surface.indexOf('data-keeps-chooser'));
    expect(chooser.slice(0, 1400)).not.toMatch(/void send\(\)|ask\(/);
  });

  it('reaches into the manuscript for nothing else', () => {
    for (const banned of ['loadDraft', '/draft', 'sectionBody', 'manuscript.content']) {
      expect(surface).not.toContain(banned);
    }
  });

  it('says plainly that she has not been given the text', () => {
    expect(surface).toContain('She has not been given its text');
  });
});

describe('Open in MAIA is a choice, not the default', () => {
  it('lives inside the panel, and names the Work it is leaving with', () => {
    expect(surface).toContain('data-open-in-maia="true"');
    expect(surface).toContain('In relation to');
    expect(surface).toContain('handoffToMaia');
  });
});

import * as fs from 'fs';
import * as path from 'path';
import {
  handoffToMaia,
  mintStudioConversationId,
  MAIA_CONVERSATION_PARAM,
  MAIA_WORK_PARAM,
} from '../workContext';

const read = (...p: string[]) =>
  fs.readFileSync(path.join(__dirname, '..', ...p), 'utf8');
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');

const surface = strip(read('canvas', 'StudioConversation.tsx'));
const identity = strip(read('useMemberIdentity.ts'));
const canvas = strip(read('canvas', 'page.tsx'));

/**
 * WS2-03D — MAIA inside the Studio.
 */

describe('one MAIA runtime, a different presentation', () => {
  /* OracleConversation was tried and the runtime witness ruled it out: its
     presence layers are position:fixed and escape any container, and its
     pre-conversation state IS the full holoflower — the guard is
     `(shouldRenderArrival || (!hasActivated && ...))`, which no prop
     suppresses. A contained holoflower is still a holoflower, and the ruling
     is that the manuscript stays primary.

     So this is a second CLIENT rendering, not a second runtime, and the
     distinction is asserted rather than asserted-about. */

  it('posts to the canonical endpoint, like every other MAIA surface', () => {
    expect(surface).toContain("apiFetch('/api/sovereign/app/maia/list'");
  });

  it('carries the Work by id, so the server situates the exchange', () => {
    // Same request contract ⇒ same server-side resolution from the member's
    // own row ⇒ SITUATED-WORK-DEEP-01 applies unchanged. Nothing about the
    // exchange is decided in this file.
    expect(surface).toContain('workContext: { workId: work.id }');
  });

  it('decides nothing about the exchange itself', () => {
    // No prompt building, no memory, no provenance, no tier selection. If any
    // of these appeared here, it really would be a second runtime.
    for (const forbidden of [
      'buildPrompt', 'addendum', 'processingProfile', 'systemPrompt', 'memory',
    ]) {
      expect(surface.toLowerCase()).not.toContain(forbidden.toLowerCase());
    }
  });

  it('no longer embeds the viewport-owning component', () => {
    expect(surface).not.toContain('OracleConversation');
  });
});

describe('identity is server truth, never browser storage', () => {
  it('resolves the member through /api/members/me', () => {
    expect(identity).toContain("apiFetch('/api/members/me'");
  });

  it('never reads identity out of localStorage — in the Studio', () => {
    /* The narrow invariant, and it is narrow on purpose: Writer's Studio may
       not derive MEMBER, WORK or CONVERSATION identity from browser storage,
       because storage is member-editable and an id read from it is a claim.
       OracleConversation's own local PREFERENCES are not in scope — they are
       preferences, not authority. */
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

describe('conversation identity is minted, never discovered', () => {
  it('mints an id the Studio owns', () => {
    const a = mintStudioConversationId();
    const b = mintStudioConversationId();
    expect(a).not.toBe(b);
    expect(a.startsWith('writers-studio-')).toBe(true);
  });

  it('asks no "most recent conversation" question anywhere', () => {
    for (const src of [surface, canvas]) {
      expect(src.toLowerCase()).not.toContain('recent');
      expect(src).not.toMatch(/conversations\[0\]/);
    }
  });

  it('is stable for the page, so dismiss and reopen continues the exchange', () => {
    expect(canvas).toContain('const [conversationId] = useState(mintStudioConversationId)');
  });

  it('travels with Open in MAIA so full MAIA continues it', () => {
    const href = handoffToMaia('/maia', {
      workId: 'w1', manuscriptId: 'ms-1', conversationId: 'writers-studio-abc',
    });
    const p = new URLSearchParams(href.slice(href.indexOf('?')));
    expect(p.get(MAIA_CONVERSATION_PARAM)).toBe('writers-studio-abc');
    expect(p.get(MAIA_WORK_PARAM)).toBe('w1');
  });

  it('omits it when there is no exchange to continue', () => {
    const href = handoffToMaia('/maia', { workId: 'w1', manuscriptId: 'ms-1' });
    expect(href).not.toContain(MAIA_CONVERSATION_PARAM);
  });
});

describe('opening Conversations is not consent to listen', () => {
  /* The witness: clicking Conversations opened the microphone and threw a
     full-viewport LISTENING field over the Studio, because the embedded
     component defaulted voice-first.

     The guard is stronger now than when it was a prop. Voice is not disabled
     on this surface — it is ABSENT. There is no capture API, no voice
     component, and nothing to flip. */

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

  it('adds no in-Studio microphone affordance in v1', () => {
    /* Deliberate. A future "Talk with MAIA" control would be the
       consent-bearing gesture — and it must be added on purpose, never
       inherited. Voice lives behind Open in MAIA, where it was designed for. */
    for (const banned of ['Talk with MAIA', 'startListening', 'voiceEnabled', 'isListening']) {
      expect(surface).not.toContain(banned);
    }
  });

  it('offers a text composer and nothing else to speak into', () => {
    expect(surface).toContain('<textarea');
    expect(surface).toContain('MINI_MAIA_PLACEHOLDER');
  });
});

describe('Open in MAIA is a choice, not the default', () => {
  it('lives inside the panel, and names the Work it is leaving with', () => {
    expect(surface).toContain('data-open-in-maia="true"');
    expect(surface).toContain('In relation to');
    expect(surface).toContain('handoffToMaia');
  });
});

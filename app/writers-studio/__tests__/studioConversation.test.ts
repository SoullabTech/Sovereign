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
const oracle = strip(
  fs.readFileSync(
    path.join(__dirname, '..', '..', '..', 'components', 'OracleConversation.tsx'),
    'utf8',
  ),
);

/**
 * WS2-03D — MAIA inside the Studio.
 */

describe('one MAIA runtime, in a different container', () => {
  it('renders the canonical conversation component, not a Studio one', () => {
    expect(surface).toContain("import('@/components/OracleConversation')");
    expect(surface).toContain('/api/sovereign/app/maia/list');
  });

  it('spawns no second conversation model, store, or prompt path', () => {
    for (const forbidden of ['useState<Message', 'messages.push', 'buildPrompt', 'fetch(']) {
      expect(surface).not.toContain(forbidden);
    }
  });

  it('carries workContext, so SITUATED-WORK-DEEP-01 applies unchanged', () => {
    // Same runtime ⇒ same containment. Nothing about it is re-implemented.
    expect(surface).toContain('workContext={{ workId: work.id }}');
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
  /* The authenticated witness: clicking Conversations opened the microphone
     and threw a full-viewport LISTENING presence over the Studio, because
     OracleConversation defaults voiceEnabled=true / initialShowChatInterface=
     false and the embed passed neither. An invitation to converse is not
     permission to capture — those are separate acts.

     Asserted in two halves on purpose. A prop assertion alone proves only that
     someone wrote a prop; it says nothing about whether the prop stops
     anything. The second half pins the MECHANISM. */

  it('the Studio asks for text, and asks for no voice', () => {
    expect(surface).toContain('voiceEnabled={false}');
    expect(surface).toContain('initialShowChatInterface');
  });

  it('voiceEnabled gates the ONLY capture component in the tree', () => {
    /* <ContinuousConversation> is the sole getUserMedia path OracleConversation
       renders, and `voiceEnabled &&` is the outer conjunct of its render guard.
       Not rendered ⇒ no capture, no permission prompt, no listening state.
       If this guard is ever loosened, voiceEnabled={false} silently stops being
       a consent boundary — which is exactly why it is pinned here. */
    expect(oracle).toMatch(
      /\{voiceEnabled && \(!showChatInterface \|\| \(showChatInterface && enableVoiceInput\)\) && \(/,
    );
    expect(oracle).toContain('<ContinuousConversation');
  });

  it('opens no capture path of its own either', () => {
    for (const banned of ['getUserMedia', 'mediaDevices', 'AudioContext', 'MediaRecorder']) {
      expect(surface).not.toContain(banned);
    }
  });

  it('adds no in-Studio microphone toggle in v1', () => {
    /* Deliberate. A toggle would put the permission-bearing gesture back into
       a surface not yet designed for it. Voice lives behind Open in MAIA,
       where voice-first is the intended design. */
    for (const banned of ['setVoiceEnabled', 'enableVoiceInput', 'startListening', 'Talk with MAIA']) {
      expect(surface).not.toContain(banned);
    }
  });
});

describe('Open in MAIA is a choice, not the default', () => {
  it('lives inside the panel, and names the Work it is leaving with', () => {
    expect(surface).toContain('data-open-in-maia="true"');
    expect(surface).toContain('In relation to');
    expect(surface).toContain('handoffToMaia');
  });
});

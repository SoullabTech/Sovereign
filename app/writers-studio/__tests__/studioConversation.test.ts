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

describe('Open in MAIA is a choice, not the default', () => {
  it('lives inside the panel, and names the Work it is leaving with', () => {
    expect(surface).toContain('data-open-in-maia="true"');
    expect(surface).toContain('In relation to');
    expect(surface).toContain('handoffToMaia');
  });
});

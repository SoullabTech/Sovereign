import { canDisplayLocalResumeNotice } from '../resumeNotice';

const A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const S = 'session_a24d5571-42b7-43f7-a6f9-e37ab3722917';
const T = 'session_f9b1c531-0224-4c89-aadd-9c8f99058723';

describe('local MAIA timer notice: identity isolation, NEVER resume authorization', () => {
  const input = () => ({
    currentMemberClaim: A,
    displayedUserId: A,
    displayedSessionId: S,
    saved: { userId: A, sessionId: S },
  });

  it('permits only an informational notice on three matching local identities', () => {
    expect(canDisplayLocalResumeNotice(input())).toBe(true);
  });

  it('does not show another member\'s saved timer after account switch', () => {
    expect(canDisplayLocalResumeNotice({
      ...input(), currentMemberClaim: B,
    })).toBe(false);
    expect(canDisplayLocalResumeNotice({
      ...input(), displayedUserId: B,
    })).toBe(false);
    expect(canDisplayLocalResumeNotice({
      ...input(), saved: { userId: B, sessionId: S },
    })).toBe(false);
  });

  it('does not project another daily or terminal session ID', () => {
    expect(canDisplayLocalResumeNotice({
      ...input(), displayedSessionId: T,
    })).toBe(false);
    expect(canDisplayLocalResumeNotice({
      ...input(), saved: { userId: A, sessionId: T },
    })).toBe(false);
  });

  it('rejects invalid or missing identities rather than inventing authority', () => {
    expect(canDisplayLocalResumeNotice({
      ...input(), currentMemberClaim: 'local_guest',
    })).toBe(false);
    expect(canDisplayLocalResumeNotice({
      ...input(), displayedSessionId: '../private',
    })).toBe(false);
    expect(canDisplayLocalResumeNotice({ ...input(), saved: null })).toBe(false);
    expect(canDisplayLocalResumeNotice({
      ...input(), displayedUserId: undefined,
    })).toBe(false);
  });
});

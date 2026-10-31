import { mayPublishEditorialResponse, type EditorialResponseTicket } from '../editorialResponseScopeR1';

const ticket: EditorialResponseTicket = {
  scope: JSON.stringify(['fiction-manuscript-a', 'fiction-work-a', 'fiction-section-a', 0, 27, 'A fictional selected passage.']),
  generation: 5,
  threadId: 'fiction-thread-a',
  workId: 'fiction-manuscript-a',
  sectionId: 'fiction-section-a',
};
const current = {
  scope: ticket.scope,
  generation: ticket.generation,
  posture: { resolved: true as const, sanctuary: false },
};
const thread = {
  threadId: ticket.threadId,
  workId: ticket.workId,
  targetSectionId: ticket.sectionId,
};

describe('JARVIS MAIA late-response presentation refusal (fictional, no service)', () => {
  it('admits only an exact current Ordinary Work, generation and owned thread', () => {
    expect(mayPublishEditorialResponse(ticket, current, thread)).toBe(true);
  });

  it.each([
    [JSON.stringify(['fiction-manuscript-b', 'fiction-work-b', 'fiction-section-a']), 'different Work'],
    [JSON.stringify(['fiction-manuscript-a', 'fiction-work-a', 'fiction-section-b']), 'different section'],
    [JSON.stringify(['fiction-manuscript-a', 'fiction-work-a', 'fiction-section-a', 1, 28]), 'changed selection'],
  ])('refuses a late result after %s (%s)', (scope) => {
    expect(mayPublishEditorialResponse(ticket, { ...current, scope }, thread)).toBe(false);
  });

  it('refuses an older request generation after a newer request or account transition', () => {
    expect(mayPublishEditorialResponse(ticket, { ...current, generation: 6 }, thread)).toBe(false);
    expect(mayPublishEditorialResponse(ticket, { ...current, generation: 4 }, thread)).toBe(false);
  });

  it('refuses unresolved and Sanctuary posture even when the old request began Ordinary', () => {
    expect(mayPublishEditorialResponse(ticket, {
      ...current, posture: { resolved: false as const, reason: 'no_live_settings' },
    }, thread)).toBe(false);
    expect(mayPublishEditorialResponse(ticket, {
      ...current, posture: { resolved: true as const, sanctuary: true },
    }, thread)).toBe(false);
  });

  it('refuses an ambiguous thread without current server-returned Work identity', () => {
    expect(mayPublishEditorialResponse(ticket, current, { ...thread, workId: undefined })).toBe(false);
    expect(mayPublishEditorialResponse(ticket, current, null)).toBe(false);
  });

  it('refuses a response for another thread, manuscript Work or section', () => {
    expect(mayPublishEditorialResponse(ticket, current, { ...thread, threadId: 'fiction-thread-b' })).toBe(false);
    expect(mayPublishEditorialResponse(ticket, current, { ...thread, workId: 'fiction-manuscript-b' })).toBe(false);
    expect(mayPublishEditorialResponse(ticket, current, { ...thread, targetSectionId: 'fiction-section-b' })).toBe(false);
  });

  it('drops a deferred fictional MAIA reply after a Work switch, not merely at request start', async () => {
    let release!: (value: typeof thread) => void;
    const provider = new Promise<typeof thread>(resolve => { release = resolve; });
    let live = { ...current };
    const published: string[] = [];
    const process = (async () => {
      const response = await provider;
      if (mayPublishEditorialResponse(ticket, live, response)) {
        published.push('fiction-old-work-response');
      }
    })();
    live = { ...live, scope: JSON.stringify(['fiction-manuscript-b', 'fiction-work-b']), generation: 6 };
    release({ ...thread });
    await process;
    expect(published).toEqual([]);
  });

  it('drops a deferred fictional reply when Sanctuary changes before it resolves', async () => {
    let release!: (value: typeof thread) => void;
    const provider = new Promise<typeof thread>(resolve => { release = resolve; });
    let live = { ...current };
    const published: string[] = [];
    const process = (async () => {
      const response = await provider;
      if (mayPublishEditorialResponse(ticket, live, response)) published.push('fiction-provider-words');
    })();
    live = { ...live, posture: { resolved: true, sanctuary: true } };
    release({ ...thread });
    await process;
    expect(published).toEqual([]);
  });

  it('never accepts missing or malformed ticket scope/generation', () => {
    expect(mayPublishEditorialResponse({ ...ticket, scope: '' }, current, thread)).toBe(false);
    expect(mayPublishEditorialResponse({ ...ticket, generation: NaN }, current, thread)).toBe(false);
    expect(mayPublishEditorialResponse({ ...ticket, threadId: '' }, current, thread)).toBe(false);
  });
});

import { NextRequest } from 'next/server';

jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn() }));
jest.mock('@/lib/manuscript/publicationPlan/store', () => ({
  assignPublicationRole: jest.fn(),
  clearPublicationRole: jest.fn(),
}));
jest.mock('@/lib/manuscript/publicationPlan/workspace', () => ({ readPublicationWorkspace: jest.fn() }));

import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { assignPublicationRole, clearPublicationRole } from '@/lib/manuscript/publicationPlan/store';
import { readPublicationWorkspace } from '@/lib/manuscript/publicationPlan/workspace';
import { GET, POST, DELETE } from '../route';

const auth = getMemberIdFromRequest as jest.Mock;
const assign = assignPublicationRole as jest.Mock;
const clear = clearPublicationRole as jest.Mock;
const readWorkspace = readPublicationWorkspace as jest.Mock;
const ctx = { params: Promise.resolve({ id: 'm1' }) };
const MEMBER = '11111111-1111-1111-1111-111111111111';
const req = (method: string, body?: unknown) => new NextRequest('http://localhost/x', {
  method,
  ...(body === undefined ? {} : { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
});

beforeEach(() => { jest.clearAllMocks(); auth.mockResolvedValue(MEMBER); });

describe('publication plan route', () => {
  it('is member-scoped', async () => {
    auth.mockResolvedValue(null);
    expect((await GET(req('GET'), ctx)).status).toBe(401);
    expect(readWorkspace).not.toHaveBeenCalled();
  });

  it('reads only the owned manuscript plan', async () => {
    readWorkspace.mockResolvedValue({ status: 'ok', availability: 'ready', draftVersion: 9, bodyStartPosition: 3, sections: [], placements: [{ role: 'copyright', sectionIds: ['s1'] }], issues: [] });
    const res = await GET(req('GET'), ctx);
    expect(res.status).toBe(200);
    expect(readWorkspace).toHaveBeenCalledWith('m1', MEMBER);
  });

  it('reports when publication roles cannot yet bind to a section-aware draft', async () => {
    readWorkspace.mockResolvedValue({ status: 'ok', availability: 'section_aware_draft_required', draftVersion: 2, bodyStartPosition: null, sections: [], placements: [], issues: [] });
    const res = await GET(req('GET'), ctx);
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ availability: 'section_aware_draft_required', draftVersion: 2 });
  });

  it('assigns role by section identities only', async () => {
    assign.mockResolvedValue({ status: 'ok', placements: [{ role: 'title-page', sectionIds: ['s1'] }] });
    const res = await POST(req('POST', { role: 'title-page', sectionIds: ['s1'] }), ctx);
    expect(res.status).toBe(200);
    expect(assign).toHaveBeenCalledWith('m1', MEMBER, 'title-page', ['s1']);
  });

  it('surfaces stale/overlap refusals as conflict rather than guessing', async () => {
    assign.mockResolvedValue({ status: 'refused', refusal: 'section_not_current', detail: 's1' });
    const res = await POST(req('POST', { role: 'copyright', sectionIds: ['s1'] }), ctx);
    expect(res.status).toBe(409);
  });

  it('clears only the named role by explicit member act', async () => {
    clear.mockResolvedValue({ status: 'ok', placements: [] });
    const res = await DELETE(req('DELETE', { role: 'copyright' }), ctx);
    expect(res.status).toBe(200);
    expect(clear).toHaveBeenCalledWith('m1', MEMBER, 'copyright');
  });
});

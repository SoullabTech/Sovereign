jest.mock('@/lib/http/apiBase', () => ({ apiFetch: jest.fn() }));
import { apiFetch } from '@/lib/http/apiBase';
import { editorialServiceFailureMessage } from '../editorialServiceFailure';
import { sendBoundEditorialTurn } from '../rebuild/editorialCollaboration';
const fetchMock = apiFetch as jest.Mock;

describe('An unavailable editor must explain what happened without claiming an edit', () => {
  beforeEach(() => fetchMock.mockReset());
  it('explains low API credits, not an instruction refusal or an edit', () => {
    const message = editorialServiceFailureMessage('structured_refused', 'provider_billing_required');
    expect(message).toContain('API credit balance is too low');
    expect(message).toContain('working copy is unchanged');
    expect(message).toContain('no edit was generated');
    expect(message).not.toContain('nothing was sent');
  });
  it('does not expose an arbitrary raw error body or confuse an unknown failure with billing', () => {
    const message = editorialServiceFailureMessage('structured_refused', 'private provider body');
    expect(message).not.toContain('private provider body');
    expect(message).not.toContain('credit');
    expect(editorialServiceFailureMessage('structured_refused')).not.toContain('structured_refused');
    expect(editorialServiceFailureMessage('a normal writer notice')).toBeNull();
  });
  it('carries the safe billing reason through the real client without automatic retry or reread', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 502,
      json: async () => ({ error: 'structured_refused', detail: 'provider_billing_required', dispatch: 'response_observed' }),
    });
    const out = await sendBoundEditorialTurn('thread', 'section',
      { act: 'discourse', text: 'Suggest one small edit.', refersTo: null },
      { resolved: true, sanctuary: false }, undefined, { proposalPolicy: 'require' });
    expect(out).toEqual({ ok: false, reason: 'turn_refused',
      detail: editorialServiceFailureMessage('structured_refused', 'provider_billing_required') });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('/api/writers-studio/editorial/turn');
  });
});

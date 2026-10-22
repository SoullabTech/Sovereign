import {
  PilotR20AuthorityUnavailable, requireIndependentPilotR20Grant,
} from '../pilotR20Authority';

test('R20 authority is intentionally unprovisioned: an accepted restored DB row cannot mint Pro', async () => {
  await expect(requireIndependentPilotR20Grant({
    memberId: 'fictional-writer-a',
    grantId: 'fictional-grant-from-old-snapshot',
  })).rejects.toBeInstanceOf(PilotR20AuthorityUnavailable);
});

test('R20 refusal never includes private writer/grant identifiers in the error', async () => {
  try {
    await requireIndependentPilotR20Grant({
      memberId: 'private-writer-id',
      grantId: 'private-grant-id',
    });
    throw new Error('Expected refusal');
  } catch (error) {
    expect(error).toBeInstanceOf(PilotR20AuthorityUnavailable);
    expect(String(error)).not.toContain('private-writer-id');
    expect(String(error)).not.toContain('private-grant-id');
  }
});

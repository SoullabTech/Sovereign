import { resolveBecomingSourcePort } from '../sourcePort.server';

describe('resolveBecomingSourcePort', () => {
  it('resolves one exact member-selected source through the existing House resolver', async () => {
    const resolver = jest.fn(async (memberId: string, facet: any, refId: string) => ({
      facet,
      refId,
      label: 'Exact journal entry',
      excerpt: 'Member-authored source excerpt.',
      href: '/journal?entry=' + refId,
    })) as any;

    const source = await resolveBecomingSourcePort('member-1','journal','entry-7',resolver);

    expect(resolver).toHaveBeenCalledWith('member-1','journal','entry-7');
    expect(source).toEqual({
      facet:'journal',
      objectType:'journal_entry',
      objectId:'entry-7',
      returnHref:'/journal?entry=entry-7',
      memberSelected:true,
      label:'Exact journal entry',
      excerpt:'Member-authored source excerpt.',
      persistence:'none',
    });
  });
  it('returns null rather than fabricating a missing source', async () => {
    const resolver = jest.fn(async () => null) as any;
    await expect(resolveBecomingSourcePort('member-1','dream','dream-9',resolver)).resolves.toBeNull();
  });

  it('refuses a facet that is not admitted to the live read-only source port', async () => {
    const resolver = jest.fn() as any;
    await expect(
      resolveBecomingSourcePort('member-1','practices','practice-1',resolver),
    ).rejects.toThrow('BECOMING_SOURCE_FACET_NOT_ADMITTED');
    expect(resolver).not.toHaveBeenCalled();
  });

  it('refuses an empty source identity before resolver access', async () => {
    const resolver = jest.fn() as any;
    await expect(
      resolveBecomingSourcePort('member-1','journal','',resolver),
    ).rejects.toThrow('BECOMING_SOURCE_OBJECT_ID_REQUIRED');
    expect(resolver).not.toHaveBeenCalled();
  });
});

import { planPublicationAssignment } from '../store';

describe('HPB-03 publication assignment planner', () => {
  const current = [
    { id: 's0', position: 0 },
    { id: 's1', position: 1 },
    { id: 's2', position: 2 },
    { id: 's3', position: 3 },
  ];

  it('accepts one contiguous author-named publication object', () => {
    expect(planPublicationAssignment('title-page', ['s1', 's2'], current, [])).toEqual({
      status: 'ok',
      placements: [{ role: 'title-page', sectionIds: ['s1', 's2'] }],
    });
  });

  it('refuses position guessing or stale section identity', () => {
    expect(planPublicationAssignment('copyright', ['missing'], current, [])).toMatchObject({
      status: 'refused', refusal: 'section_not_current',
    });
  });

  it('refuses a non-contiguous publication object', () => {
    expect(planPublicationAssignment('title-page', ['s0', 's2'], current, [])).toMatchObject({
      status: 'refused', refusal: 'non_contiguous',
    });
  });

  it('refuses laundering one section into two publication roles', () => {
    expect(planPublicationAssignment('copyright', ['s1'], current, [
      { role: 'title-page', sectionId: 's1' },
    ])).toMatchObject({ status: 'refused', refusal: 'section_already_assigned' });
  });

  it('replaces only the named role and preserves other author decisions', () => {
    expect(planPublicationAssignment('copyright', ['s2'], current, [
      { role: 'copyright', sectionId: 's1' },
      { role: 'dedication', sectionId: 's3' },
    ])).toEqual({
      status: 'ok',
      placements: [
        { role: 'dedication', sectionIds: ['s3'] },
        { role: 'copyright', sectionIds: ['s2'] },
      ],
    });
  });
  it('accepts explicit omission as production metadata rather than manuscript deletion', () => {
    expect(planPublicationAssignment('omit', ['s1'], current, [])).toEqual({
      status: 'ok', placements: [{ role: 'omit', sectionIds: ['s1'] }],
    });
  });

});

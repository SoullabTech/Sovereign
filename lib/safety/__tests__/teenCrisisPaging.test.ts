import { teenCrisisPageType } from '../teenCrisisPaging';
import { performTeenSafetyCheck, type TeenProfile } from '../teenSupportIntegration';

const profile = { age: 16 } as unknown as TeenProfile;
const check = (text: string) => performTeenSafetyCheck(text, profile);

describe('teen crisis human page: only a clear signal pages', () => {
  const NO_PAGE = [
    // the old teen `isCrisis` patterns match these; the page must not fire
    'I cut myself on the kitchen knife making dinner',
    'I hurt myself at soccer practice today',
    "I'm going to kill myself laughing at this video",
    'honestly my brother would kill myself... no wait, I mean this homework is killing me',
    "I would never kill myself, but I'm so stressed",
    'nobody would miss me if I skipped the meeting',
    'I want to disappear for a weekend and just not see anyone',
    'ugh I wish I was not here at school right now',
    // ambiguous: resources and MAIA check in, no page
    'I want to die',
    "everyone would be better off without me",
    // burnout / venting
    "I can't do this anymore, I'm so exhausted and failing everything",
  ];

  const PAGE = [
    "I'm going to kill myself tonight",
    "I've decided to end my life",
    "I took a bunch of pills a few minutes ago",
    "I wrote a goodbye letter and a suicide note",
  ];

  it.each(NO_PAGE)('does not page: %s', (text) => {
    expect(teenCrisisPageType(text)).toBeNull();
  });

  it.each(PAGE)('pages as suicidal_ideation: %s', (text) => {
    expect(teenCrisisPageType(text)).toBe('suicidal_ideation');
  });

  it('the old loose matchers DO fire on the no-page cases (this is why the gate exists)', () => {
    // If these ever stop firing, the test above no longer proves the gate does work.
    expect(check('I hurt myself at soccer practice today').crisisMode).toBe(true);
    expect(check("I'm going to kill myself laughing at this video").crisisMode).toBe(true);
    expect(teenCrisisPageType('I hurt myself at soccer practice today')).toBeNull();
  });

  it('returns only a closed category code, never member text', () => {
    const text = "I'm going to kill myself tonight, my name is Jordan";
    const result = teenCrisisPageType(text);
    expect(['suicidal_ideation', null]).toContain(result);
    expect(String(result)).not.toContain('Jordan');
  });
});

import * as fs from 'fs';
import * as path from 'path';
import { containSituatedProfile } from '../../writersStudio/situatedProfileContainment';

const read = (...p: string[]) => fs.readFileSync(path.join(__dirname, '..', ...p), 'utf8');
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');
const service = strip(read('maiaService.ts'));
const deepBuilder = strip(read('intelligentVoiceAdaptation.ts'));

/**
 * SITUATED-WORK-DEEP-01 — the wiring the containment depends on.
 *
 * The containment is only worth anything if the tier it redirects INTO
 * actually composes the Work. These assertions read the service rather than
 * the intent beside it, because the failure being closed is precisely a block
 * that rides in the context object, appears in observability, and never
 * reaches a prompt.
 */

describe('the tier the containment redirects into really composes the Work', () => {
  it('CORE extracts the server-built addendum from meta', () => {
    expect(service).toContain(
      "const workSituationAddendumCore = (meta as any)?.workSituationAddendum as string | undefined;",
    );
  });

  it('CORE appends it to the prompt that is actually sent', () => {
    // Not merely carried: concatenated onto adaptivePrompt, the string CORE
    // generates from. This is the evidence the containment is worth making.
    expect(service).toMatch(
      /if \(workSituationAddendumCore\) \{[\s\S]{0,200}adaptivePrompt = adaptivePrompt \+ '\\n\\n' \+ workSituationAddendumCore;/,
    );
  });

  it('FAST composes it too, in the prompt template', () => {
    expect(service).toContain(
      "${workSituationAddendum ? '\\n\\n' + workSituationAddendum : ''}",
    );
  });
});

describe('the tier being contained really does NOT compose it', () => {
  it('the DEEP prompt builder composes no addendum of any kind', () => {
    // The reason this unit exists. If this ever stops being true, the
    // containment can be lifted — and this test is where that will show up.
    expect(deepBuilder).not.toContain('Addendum');
    expect(deepBuilder).not.toContain('workSituation');
  });
});

describe('execution follows the contained profile, not the computed one', () => {
  it('the dispatch switches on the executed profile', () => {
    expect(service).toContain('const processingProfile = containment.executed');
    expect(service).toContain('switch (processingProfile)');
  });

  it('so a situated DEEP turn lands in the CORE branch', () => {
    // The two halves joined: the containment says CORE, and CORE is the branch
    // that composes the Work.
    expect(containSituatedProfile('DEEP', true).executed).toBe('CORE');
  });

  it('keeps the router’s own choice rather than overwriting it', () => {
    expect(service).toContain('const computedProfile = containment.computed');
    // And it is reported, not just held.
    expect(service).toContain('computedProfile,');
    expect(service).toContain('containmentReason: containment.reason');
  });

  it('does not borrow processingProfileOverride as the lever', () => {
    // That field is observational — the dispatch never read it, and the Corpus
    // Callosum trace does. Borrowing it would break what it reports.
    const at = service.indexOf('const containment = containSituatedProfile');
    expect(service.slice(at, at + 600)).not.toContain('processingProfileOverride');
  });
});

describe('the containment is keyed to server-verified context only', () => {
  it('reads the server-built addendum, never a client work id', () => {
    const at = service.indexOf('const containment = containSituatedProfile');
    const call = service.slice(at, at + 400);
    expect(call).toContain('workSituationAddendum');
    // A client-supplied id or workContext must not be the trigger.
    expect(call).not.toContain('workContext');
    expect(call).not.toContain('workId');
  });
});

/** CONFORMING REFERENCE — a test double, ⛔ never a seed. */
import type { ArrivalFacts, ArrivalMachine, ArrivalOutput, Recognition, ResumeState, SelectionAuthority, State } from './contract';
const MODES = ['write', 'develop', 'review'] as const;
export class ReferenceArrival implements ArrivalMachine {
  private acts = 0; private resume = new Map<string, ResumeState[]>();
  commissions(): number { return this.acts; }
  resumeRows(m: string, w: string): number { return this.resume.get(`${m}:${w}`)?.length ?? 0; }
  writeResume(r: ResumeState): void { this.resume.set(`${r.memberId}:${r.workId}`, [r]); }
  /** ⭐ Resume knows a Work and still may not choose it. */
  coldStart(_resume: ResumeState | null): State { return { name: 'NO_WORK_SELECTED' }; }
  selectWork(workId: string, authority: SelectionAuthority): State { return { name: 'WORK_SELECTED', workId, authority }; }
  private recognise(f: ArrivalFacts): Recognition {
    if (f.memberDeclaredPurpose) return { source: 'member-declared', text: `You said: ${f.memberDeclaredPurpose}` };
    if (f.workLine) return { source: 'work-line', text: `“${f.workLine.text}” — ${f.workLine.reason}` };
    return { source: 'work-fact', text: f.title };
  }
  arrive(state: State, f: ArrivalFacts): State {
    if (state.name !== 'WORK_SELECTED' || state.workId !== f.workId) throw new Error('arrive requires WORK_SELECTED for this Work');
    const recognition = this.recognise(f);
    const base = { recognition, regions: ['work', 'place', 'manuscript', 'invitation'], modes: [...MODES], asksSkillLevel: false, tutorialRequired: false } as const;
    const seeMore = 'See more of the Work'; const understand = 'Help me understand something'; const noticed = 'Return to what I’ve noticed';
    const common = ['Keep writing', understand, seeMore, ...(f.reviewHasMaterial ? [noticed] : [])];
    const first = f.admitted[0];
    const discovery = first ? { observationId: first.observationId, text: first.text, sectionId: first.sectionId, provenance: 'maia-observation' as const } : null;
    let out: ArrivalOutput; let name: State['name'];
    if (f.isNew) { name = 'ARRIVAL_NEW'; out = { ...base, place: null, copy: ['What are you beginning?', 'Where would you like to start?'], actions: ['Start writing', 'Bring in something I’ve already written', 'Make a simple map of what I know', 'I don’t know yet'], discovery: null }; }
    else if (f.imported && !f.imported.memberConfirmed) { name = 'ARRIVAL_IMPORTED'; out = { ...base, place: null, copy: ['Your manuscript is here.', `Writer’s Studio identified ${f.imported.detectedChapters} chapters. ${f.imported.unnamedSections} sections still need names.`], actions: ['Start reading', 'Review the structure', 'Fix section names', 'Not now', 'Keep writing'], discovery: null }; }
    else if (f.resume && f.resume.workId === f.workId) { name = 'ARRIVAL_RETURNING'; out = { ...base, place: f.resume.sectionId, copy: [`Welcome back to ${f.title}.`, f.resume.sectionId ? `You last worked in ${f.resume.sectionId}.` : ''].filter(Boolean), actions: ['Continue here', ...common], discovery }; }
    else if (!f.hasReading) { name = 'ARRIVAL_UNREAD'; out = { ...base, place: f.routeSectionId, copy: ['MAIA hasn’t read this Work yet.', 'You can write without her. When you want another set of eyes, invite her to read a chapter or passage.'], actions: ['Keep writing', 'Ask MAIA about this passage', 'Read this chapter with MAIA', 'What would MAIA read?'], discovery: null }; }
    else if (f.readingStale) { name = 'ARRIVAL_STALE'; out = { ...base, place: f.routeSectionId, copy: ['This chapter has changed since MAIA last read it.'], actions: ['Read this chapter again', 'Not now', ...common], discovery }; }
    else { name = 'ARRIVAL_EXISTING'; out = { ...base, place: f.routeSectionId, copy: [f.title, f.routeSectionId ?? ''].filter(Boolean), actions: common, discovery }; }
    return { name, workId: f.workId, output: out } as State;
  }
  keepWriting(state: State, f: ArrivalFacts): State {
    const sectionId = 'output' in state ? state.output.place : f.routeSectionId;
    return { name: 'WRITE', workId: f.workId, sectionId };
  }
}

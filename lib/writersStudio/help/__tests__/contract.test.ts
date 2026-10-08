import { HELP_RELEASE, HELP_TOPICS, UNKNOWN_HELP_CONTEXT, surfaceNotice } from '../catalogue';
import { matchHelpTopics, validateMatchedTopics } from '../match';
import { parseHelpQuestion, currentHelpRelease, helpOriginAllowed } from '../request';
const context={...UNKNOWN_HELP_CONTEXT, surface:'craft' as const,view:'markup' as const};
const request=()=>({release:HELP_RELEASE,question:'Why is the word crossed out?',context,sanctuary:false});
describe('Studio Help reviewed answer contract',()=>{
  it('has distinct, bounded, actionable topics with explicit non-mutation boundaries',()=>{
    expect(new Set(HELP_TOPICS.map(t=>t.id)).size).toBe(HELP_TOPICS.length);
    for(const t of HELP_TOPICS){expect(t.steps.length).toBeLessThanOrEqual(3);expect(t.boundary.length).toBeGreaterThan(20);}
  });
  it.each([
    ['Why is the red word still there?','marks'],['why is this crossed out after I accepted it','marks'],['Show Preview','marks'],
    ['How do I keep my original?','keep'],['Put become back','keep'],['where is the saved draft','return'],
    ['Save my version is greyed out','save-disabled'],['I cannot save','save-disabled'],
    ['Nothing happened. Should I click again?','failure'],['What does Craft depth do?','depth'],
    ['Should I use Stacked or Balanced?','layout'],['Where do I add notes?','materials'],
    ['Read the whole chapter rather than this paragraph','scope'],['How do I move to the next passage?','focus'],
    ['Did MAIA actually change it?','actions'],
  ])('%s maps to %s',(q,id)=>expect(matchHelpTopics(q,context).ids).toContain(id));
  it('does not pretend vague or unrelated language has a known answer',()=>{
    expect(matchHelpTopics('it',context).confident).toBe(false);
    expect(matchHelpTopics('Who won the baseball championship?',context).ids).toEqual([]);
  });
  it('does not infer saved state from available controls',()=>{
    const t=HELP_TOPICS.find(t=>t.id==='save')!;
    expect(t.summary).toContain('cannot confirm');
    expect(surfaceNotice({...context,surface:'write',controls:['save']},'save')).toContain('direct writing');
    expect(surfaceNotice(context,'marks')).toContain('showing Markup');
  });
  it('names the Materials drawer as not in this release',()=>expect(HELP_TOPICS.find(t=>t.id==='materials')!.boundary).toContain('not part of this Help release'));
  it('accepts only current closed UI context',()=>{expect(parseHelpQuestion(request())).toEqual(request());expect(currentHelpRelease(HELP_RELEASE)).toBe(true);expect(currentHelpRelease('older')).toBe(false);});
  it.each([
    {manuscript:'private writing'}, {history:['private reply']}, {memberId:'someone-else'}, {apply:true}, {sanctuary:undefined}, {question:'x'.repeat(1001)}, {question:''},
  ])('refuses extra or invalid request fields %j',patch=>expect(parseHelpQuestion({...request(),...patch})).toBeNull());
  it.each([{saved:true},{surface:'invented'},{controls:['delete-all']},{controls:['save','save']},{view:'applied'},{focused:'yes'}])('refuses invented context %j',patch=>expect(parseHelpQuestion({...request(),context:{...context,...patch}})).toBeNull());
  it('validates all model topic IDs; drops no bad subset',()=>{
    expect(validateMatchedTopics({topicIds:['save']})).toEqual(['save']);
    expect(validateMatchedTopics({topicIds:[]})).toEqual([]);
    for(const value of [{topicIds:['save','imaginary']},{topicIds:['save','save']},{topicIds:['save'],answer:'Done'},{topicIds:['save','keep','marks']},null])expect(validateMatchedTopics(value)).toBeNull();
  });
});

describe('Help browser-origin boundary',()=>{
  it('accepts the actual loopback Host even when NextURL normalized it',()=>{
    expect(helpOriginAllowed(new Headers({origin:'http://127.0.0.1:3753',host:'127.0.0.1:3753'}),'http://localhost:3753/api/writers-studio/help')).toBe(true);
  });
  it('uses forwarded scheme but not a forwarded alternate host',()=>{
    expect(helpOriginAllowed(new Headers({origin:'https://soullab.life',host:'soullab.life','x-forwarded-proto':'https'}),'http://localhost/api')).toBe(true);
    expect(helpOriginAllowed(new Headers({origin:'https://untrusted.example',host:'soullab.life','x-forwarded-host':'untrusted.example','x-forwarded-proto':'https'}),'http://localhost/api')).toBe(false);
  });
  it.each(['https://untrusted.example','http://soullab.life','https://soullab.life:444','https://soullab.life/path','null'])('refuses mismatched or malformed origin %s',origin=>{
    expect(helpOriginAllowed(new Headers({origin,host:'soullab.life','x-forwarded-proto':'https'}),'http://localhost/api')).toBe(false);
  });
  it('requires a session-token credential path when Origin is absent',()=>{
    expect(helpOriginAllowed(new Headers(),'http://localhost/api')).toBe(false);
    expect(helpOriginAllowed(new Headers({'x-session-token':'synthetic'}),'http://localhost/api')).toBe(true);
  });
});

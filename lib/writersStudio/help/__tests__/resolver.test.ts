const runStructured=jest.fn();
jest.mock('@/lib/ai/structured/router',()=>({runStructured:(...args:unknown[])=>runStructured(...args)}));
import { resolveHelpQuestion, acquireHelpRequest } from '../resolveQuestion';
import { HELP_RELEASE, UNKNOWN_HELP_CONTEXT } from '../catalogue';
const question={release:HELP_RELEASE,question:'Could you help me make sense of that little line?',context:UNKNOWN_HELP_CONTEXT,sanctuary:false};
const outcome=(input:unknown)=>({ok:true,result:{content:[{type:'tool_use',name:'select_studio_help_topics',input}],provenance:{modelAgreement:'agreed'},stopReason:'tool_use'}});
beforeEach(()=>jest.clearAllMocks());
it('uses the governed seam only to select maintained topics',async()=>{
  runStructured.mockResolvedValue(outcome({topicIds:['marks']}));
  expect(await resolveHelpQuestion(question)).toEqual({ok:true,ids:['marks']});
  const payload=runStructured.mock.calls[0][0];expect(payload.maxTokens).toBe(180);expect(payload.messages).toHaveLength(1);
  expect(JSON.parse(payload.messages[0].content)).toEqual({question:question.question,interface:UNKNOWN_HELP_CONTEXT});
  expect(payload.system).toContain('NOT editing');expect(payload.tools[0].inputSchema.additionalProperties).toBe(false);
});
it.each([{topicIds:['save'],answer:'I saved your manuscript'},{topicIds:['invented']},{topicIds:['save','save']}])('refuses unapproved output %j',async value=>{runStructured.mockResolvedValue(outcome(value));expect(await resolveHelpQuestion(question)).toEqual({ok:false});});
it('refuses prose-only, truncated, or mismatched-provider responses',async()=>{
  const a=outcome({topicIds:['save']});
  for(const patch of [{content:[{type:'text',text:'Done'}]},{stopReason:'max_tokens'},{provenance:{modelAgreement:'differs'}}]){
    runStructured.mockResolvedValue({...a,result:{...a.result,...patch}});expect(await resolveHelpQuestion(question)).toEqual({ok:false});
  }
});
it('provider outage returns an explicit failure and never invokes another provider',async()=>{runStructured.mockResolvedValue({ok:false,refusal:'provider_unavailable'});expect(await resolveHelpQuestion(question)).toEqual({ok:false});expect(runStructured).toHaveBeenCalledTimes(1);});
it('bounds duplicate requests even after client waiting ends',()=>{const release=acquireHelpRequest('fixture',100_000);expect(release).not.toBeNull();expect(acquireHelpRequest('fixture',106_000)).toBeNull();release!();expect(acquireHelpRequest('fixture',101_000)).toBeNull();acquireHelpRequest('fixture',106_000)!();});

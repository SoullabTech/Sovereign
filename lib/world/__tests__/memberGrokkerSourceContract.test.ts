import assert from 'node:assert/strict';
import { validateMemberGrokkerRequest } from '../memberGrokkerSourceContract';

const trace = (sources:any[], target:'member_world'|'community'|'consulting'='member_world') =>
  validateMemberGrokkerRequest({ query:'What am I noticing?', mode:'trace', target, sources });

{
  const out = trace([{ kind:'house_navigation' }, { kind:'shared_library' }]);
  assert.equal(out.ok, true);
  assert.equal(out.releaseRequired, false);
}

{
  const out = trace([{ kind:'journal' }]);
  assert.equal(out.ok, false);
  assert.ok(out.blockers.includes('EXPLICIT_SELECTION_REQUIRED:journal'));
}

{
  const out = trace([{ kind:'journal', selectedByMember:true }]);
  assert.equal(out.ok, true);
  assert.equal(out.releaseRequired, true);
}

{
  const out = trace([{ kind:'relationship', selectedByMember:true }]);
  assert.equal(out.ok, false);
  assert.ok(out.blockers.includes('HEIGHTENED_CONSENT_REQUIRED:relationship'));
}
{
  const out = trace([{ kind:'dream', selectedByMember:true, heightenedConsent:true }]);
  assert.equal(out.ok, true);
  assert.equal(out.releaseRequired, true);
}

{
  const out = trace([{ kind:'developmental_memory', selectedByMember:true, heightenedConsent:true }]);
  assert.equal(out.ok, false);
  assert.ok(out.blockers.includes('SOURCE_NOT_ELIGIBLE:developmental_memory'));
}

{
  const out = validateMemberGrokkerRequest({
    query:'Synthesize my patterns',
    mode:'synthesize',
    sources:[{ kind:'journal', selectedByMember:true }],
  });
  assert.equal(out.ok, false);
  assert.ok(out.blockers.includes('R3_SYNTHESIS_CLOSED'));
}

{
  const out = trace([{ kind:'living_work', selectedByMember:true }], 'consulting');
  assert.equal(out.ok, false);
  assert.ok(out.blockers.includes('R3_CROSS_CONTEXT_CLOSED'));
}
{
  const out = trace([{ kind:'reflection', selectedByMember:true }], 'community');
  assert.equal(out.ok, false);
  assert.ok(out.blockers.includes('R3_CROSS_CONTEXT_CLOSED'));
}

{
  const out = trace([
    { kind:'living_work', selectedByMember:true },
    { kind:'living_work', selectedByMember:true },
  ]);
  assert.equal(out.ok, false);
  assert.ok(out.blockers.includes('DUPLICATE_SOURCE:living_work'));
}

{
  const out = validateMemberGrokkerRequest({ query:'   ', mode:'trace', sources:[] });
  assert.equal(out.ok, false);
  assert.ok(out.blockers.includes('QUERY_REQUIRED'));
}

console.log('MEMBER-WORLD-01 R3 source contract PASS');

import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';
const path=join(process.cwd(),'docs/programme/VOICE-2026/evidence/TURN-03-A3-ADVERSARIAL-02-20260916/A3_ADVERSARIAL_EVIDENCE.json');
const bytes=readFileSync(path); const e=JSON.parse(bytes.toString('utf8'));
describe('TURN-03 A3 adversarial evidence',()=>{
 it('pins exact evidence and shadow boundary',()=>{expect(createHash('sha256').update(bytes).digest('hex')).toBe('8a13e17ee0d427e194fe5c6f2ade696630fd6cac735c3b550b5def25bc492a65');expect(e.shadowOnly).toBe(true);expect(e.authority.canAlterEndpointing).toBe(false);});
 it('proves Smart Turn completion alone is not floor ownership',()=>{for(const k of ['smartTurn','smartTurnSemantic']){expect(e.metrics[k].overall.falseFloorSeizures).toBe(7);expect(e.metrics[k].overall.falseFloorSeizureRate).toBe(1);expect(e.metrics[k].overall.yieldRecall).toBe(1);}});
 it('proves semantic-only safety has an implicit-yield cost',()=>{expect(e.metrics.semanticOnly.overall.falseFloorSeizures).toBe(0);expect(e.metrics.semanticOnly.overall.yieldRecall).toBe(0);});
 it('contains the hard continuation classes',()=>{const ids=e.cases.filter((r:any)=>r.label==='continue').map((r:any)=>r.id);for(const id of ['reflective-complete-5s','emotional-complete-6s','rhetorical-question-4s','self-correction-4s','list-continuation-5s','reentry-complete-4s'])expect(ids).toContain(id);});
});

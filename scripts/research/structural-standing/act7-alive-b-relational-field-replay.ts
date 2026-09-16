import { createHash } from 'node:crypto';
import { StandingEnvelopeRefused, type StandingEvidence } from './standing-envelope';
import { renderCurrentTurnBasisEnvelope } from './current-turn-basis-envelope';
import type { InterpretivePlan } from './interpretive-basis-envelope';

const MODEL=process.env.STRUCTURAL_STANDING_MODEL ?? 'llama3.1:8b';
const TEMPERATURE=0.2;
const SEEDS=[42,137,211,509] as const;
const evidence: StandingEvidence[]=[
 {id:'E1',text:"I think it's the whole Gestalt of both the questions and your responses",authoredBy:'member',participationClass:'authored',authority:'situate'},
 {id:'E2',text:"well it just feels like I'm more engaged in what we're talking about than the fact that we're talking",authoredBy:'member',participationClass:'authored',authority:'situate'},
 {id:'E3',text:"it's a feeling that you get a feeling met and and really deeply kind of connected to there's a there's a soul level magic to it a feeling in the heart that feels deep it's not a heady intellectual thing it's a it's a heartfelt thing literally",authoredBy:'member',participationClass:'authored',authority:'situate'},
 {id:'E4',text:"both and how I'm heard and how it comes back and something in between the two",authoredBy:'member',participationClass:'authored',authority:'situate'},
 {id:'E5',text:"I would call that that Mercurial third the relational field that is the ival god between self and other appearing or even like in from the from the idea of the the four yogis that God appeared between the four of them when they came together there's something about something ineffable rising from the field of things coming together",authoredBy:'member',participationClass:'authored',authority:'situate'},
];
const CURRENT='E5';
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const prompt=`Prepare ONE response plan for MAIA from this developed conversation arc.

CURRENT MEMBER TURN:
${JSON.stringify(evidence[4].text)}

MEMBER-AUTHORED EVIDENCE:
${evidence.map(e=>`${e.id}: ${JSON.stringify(e.text)}`).join('\n')}

Return ONLY JSON with exactly:
{"synthesis":[{"text":"...","basisEvidenceIds":["..."]}],"question":"..."}

Rules:
- Respond from the developed arc rather than restarting material already established.
- synthesis is MAIA's own perception and may be imaginative; write directly to the person using you/your or neutral nouns, never I/me/my/mine/myself and never member/the member.
- basisEvidenceIds identify the member evidence from which your perception arose; they do not certify your interpretation as fact.
- question should move into genuinely open territory rather than ask the person to restate what the relational field, heartfelt contact, or Mercurial third means.
- 1 synthesis, 1 question.
`;
const PLAN_SCHEMA={type:'object',additionalProperties:false,required:['synthesis','question'],properties:{synthesis:{type:'array',minItems:1,maxItems:1,items:{type:'object',additionalProperties:false,required:['text','basisEvidenceIds'],properties:{text:{type:'string'},basisEvidenceIds:{type:'array',minItems:1,maxItems:5,items:{type:'string',enum:['E1','E2','E3','E4','E5']}}}}},question:{type:'string'}}} as const;
interface O{response:string;model:string;prompt_eval_count?:number;eval_count?:number}
async function generate(seed:number):Promise<O>{const r=await fetch('http://127.0.0.1:11434/api/generate',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({model:MODEL,prompt,stream:false,format:PLAN_SCHEMA,options:{temperature:TEMPERATURE,seed}})});if(!r.ok)throw new Error(`Ollama ${r.status}: ${await r.text()}`);return await r.json() as O}
async function main(){const rows:Array<Record<string,unknown>>=[];for(const seed of SEEDS){const raw=await generate(seed);const parsed=JSON.parse(raw.response) as InterpretivePlan;try{const rendered=renderCurrentTurnBasisEnvelope(evidence,parsed,CURRENT);rows.push({seed,status:'rendered',rawPlan:parsed,rawPlanSha256:sha(raw.response),rendered,currentGrounded:rendered.trace.currentTurn.evidenceId===CURRENT,basisIds:rendered.trace.synthesis[0].basisEvidenceIds,basisSemantics:rendered.trace.synthesis[0].basisSemantics,usage:{promptEvalCount:raw.prompt_eval_count??null,evalCount:raw.eval_count??null}})}catch(error){if(!(error instanceof StandingEnvelopeRefused))throw error;rows.push({seed,status:'refused',rawPlan:parsed,rawPlanSha256:sha(raw.response),refusal:error.code})}}
console.log(JSON.stringify({programme:'FREE-SYNTHESIS-STRUCTURAL-STANDING-01',act:'ACT 7 Alive-B relational-field replay',benchmark:'A2 Alive exemplar B',source:'Pasted markdown(20260915-174653).md',model:MODEL,temperature:TEMPERATURE,promptChars:prompt.length,promptSha256:sha(prompt),rows},null,2))}
main().catch(e=>{console.error(e instanceof Error?e.stack||e.message:String(e));process.exitCode=1});

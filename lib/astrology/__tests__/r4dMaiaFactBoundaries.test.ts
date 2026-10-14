/**
 * R4d fact/meaning boundaries. Numerical uncertainty must remain a tagged
 * astronomical uncertainty, not a confident retrograde fact or life claim.
 */
import {
  buildAstrologyPayload, renderFactsForPrompt, renderGuardrailsForPrompt,
} from '../astrologyPayload';

const base = {
  moonPhase: {phase:'First Quarter',percentage:51},
  events: [], impacts: [],
};

describe('ASTRO-PRO-R4d: source and uncertainty separation',()=>{
  it('carries stationary motion as uncertain fact but not retrograde',()=>{
    const payload=buildAstrologyPayload({...base,currentTransits:[
      {planet:'Mercury',sign:'Pisces',degree:22.57,retrograde:false,motionStatus:'stationary-uncertain'},
      {planet:'Venus',sign:'Pisces',degree:19.8,retrograde:true,motionStatus:'retrograde'},
      {planet:'Sun',sign:'Pisces',degree:7.7,retrograde:false,motionStatus:'direct'},
    ]});
    const position=payload.facts.find(x=>x.kind==='planet_position'&&x.label==='Mercury');
    const uncertainty=payload.facts.find(x=>x.kind==='motion_uncertainty'&&x.label==='Mercury apparent motion');
    expect(position).toEqual(expect.objectContaining({sign:'Pisces',source:'ephemeris',confidence:'known'}));
    expect(uncertainty).toEqual(expect.objectContaining({source:'ephemeris',confidence:'uncertain'}));
    expect(payload.facts.some(x=>x.kind==='retrograde'&&x.label.startsWith('Mercury'))).toBe(false);
    expect(payload.facts.some(x=>x.kind==='retrograde'&&x.label==='Venus retrograde')).toBe(true);
    expect(payload.impacts).toEqual([]);
    const formatted=renderFactsForPrompt(payload.facts);
    expect(formatted).toContain('Mercury apparent motion');
    expect(formatted).toContain('confidence: uncertain');
    expect(formatted).not.toContain('Mercury retrograde');
    expect(formatted).toContain('Venus');
    const guarded=renderGuardrailsForPrompt(payload.guardrails);
    expect(guarded).toContain('member_meaning_is_authoritative');
    expect(guarded).toContain('stationary_motion_is_uncertain');
  });

  it('never elevates a legacy unverified retrograde boolean to a fact',()=>{
    const payload=buildAstrologyPayload({...base,currentTransits:[
      {planet:'Mars',sign:'Aries',degree:15,retrograde:true},
      {planet:'Mercury',sign:'Pisces',degree:22,retrograde:true,motionStatus:'stationary-uncertain'},
      {planet:'Saturn',sign:'Aries',degree:1,retrograde:true,motionStatus:'not-evaluated'},
    ]});
    expect(payload.facts.filter(x=>x.kind==='retrograde')).toEqual([]);
    expect(payload.facts.filter(x=>x.kind==='motion_uncertainty')).toHaveLength(1);
  });

  it('does not fabricate planetary facts when current sky is missing',()=>{
    const payload=buildAstrologyPayload({...base,currentTransits:[]});
    expect(payload.facts.some(x=>x.kind==='planet_position'||x.kind==='retrograde'||x.kind==='motion_uncertainty')).toBe(false);
    expect(renderFactsForPrompt(payload.facts)).not.toContain('Current Planet Positions');
  });
});

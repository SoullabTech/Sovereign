import fs from 'node:fs';
import path from 'node:path';
import { WRITERS_PILOT_PACKET as packet, pilotPacketReviewText } from '../pilotPacket';
import { requireFounder } from '../../founder/founderAuth';
import PilotPage from '../../../app/founder/constellation/pilot/page';
import PilotPacket from '../../../app/founder/constellation/pilot/PilotPacket';
import { EXPERIENCE_COLLECTION_OPEN } from '../experience/contract';

jest.mock('../../founder/founderAuth',()=>({requireFounder:jest.fn()}));
jest.mock('../../../app/founder/constellation/pilot/pilot-packet.module.css',()=>({__esModule:true,default:{}}));

describe('C8 first reviewable pilot packet',()=>{
  it('is an unsent draft, not a campaign or enrollment',()=>{
    expect(packet.standing).toBe('founder_review_not_sent');
    expect(pilotPacketReviewText().split('\n')[0]).toBe('FOUNDER REVIEW DRAFT — NOT APPROVED TO SEND');
    expect(EXPERIENCE_COLLECTION_OPEN).toBe(false);
  });
  it('serves one audience with an existing work, not every studio at once',()=>{
    expect(packet.audience).toContain('already have meaningful writing');
    expect(packet.invitation.body).toContain('a passage of your own writing');
    expect(packet.invitation.body).toContain('Keeping the original may be the right result');
  });
  it('does not manufacture a manuscript demonstration, result, or permission',()=>{
    expect(packet.demonstration.standing).toBe('awaiting_author_cleared_example');
    expect(packet.demonstration).not.toHaveProperty('original');
    expect(packet.demonstration).not.toHaveProperty('approvedBy');
    expect(packet.demonstration.required).toContain('Kelly’s real acceptance, rejection, or reshaping');
  });
  it('does not invent commercial terms or count accounts as pilot access',()=>{
    expect(packet.termsToConfirm.join(' ')).toContain('Price or complimentary access');
    expect(packet.termsToConfirm.join(' ')).toContain('normal account is not treated as a confirmed pilot place');
    expect(packet.invitation.body).not.toMatch(/free trial|unlimited|5\/5|world.class/i);
  });
  it('keeps all release requirements visible without an approve or send mechanism',()=>{
    expect(packet.gates.map(g=>g.id)).toEqual(['founder_access','offer','newcomer','demonstration','collection','release']);
    const component=fs.readFileSync(path.join(process.cwd(),'app/founder/constellation/pilot/PilotPacket.tsx'),'utf8');
    expect(component).toContain('navigator.clipboard.writeText(pilotPacketReviewText())');
    expect(component).not.toMatch(/\b(fetch|apiFetch|sendBeacon|localStorage|sessionStorage)\b/);
    expect(component).not.toContain('mailto:');
  });
  it.each([401,403])('refuses page access independently for %s',async status=>{
    (requireFounder as jest.Mock).mockResolvedValue({ok:false,status,error:'not allowed'});
    expect((await PilotPage()).props['aria-label']).toBe('Founder access required');
  });
  it('mounts the packet only for an authorized founder',async()=>{
    (requireFounder as jest.Mock).mockResolvedValue({ok:true,memberId:'fixture'});
    const prior=process.env.CAPACITOR_BUILD;delete process.env.CAPACITOR_BUILD;
    try {expect((await PilotPage()).type).toBe(PilotPacket);} finally {if(prior!==undefined)process.env.CAPACITOR_BUILD=prior;}
  });
});

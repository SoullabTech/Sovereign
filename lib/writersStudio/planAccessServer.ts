/** Server projection of the existing Writer beta authority into Free/Pro. */
import { writersStudioBetaAccess } from './betaAccessServer';
import { decideWriterStudioPlan } from './planPolicy';

export async function writerStudioPlanForMember(memberId: string) {
  return decideWriterStudioPlan(await writersStudioBetaAccess(memberId));
}

/** Server projection of Writer's Studio standing into Free/Pro. */
import { writersStudioStanding } from './betaAccessServer';
import { decideWriterStudioPlan } from './planPolicy';

export async function writerStudioPlanForMember(memberId: string) {
  return decideWriterStudioPlan(await writersStudioStanding(memberId));
}

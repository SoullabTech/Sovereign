const responses: unknown[] = [];
jest.mock('@/lib/http/apiBase', () => ({ apiFetch: jest.fn(async () => ({ ok: true, status: 200, json: async () => responses.shift() })) }));
import { fetchPlan } from '../planClient';

test('#2 an older or incomplete server answer has NO verdict; only both lists present count as one', async () => {
  responses.push({ plan: { id: 'p', steps: [] } });                                            // nothing about staleness
  expect((await fetchPlan('m'))!.verdict).toBe(false);
  responses.push({ plan: { id: 'p', steps: [] }, staleStepIds: [] });                           // half an answer
  expect((await fetchPlan('m'))!.verdict).toBe(false);
  responses.push({ plan: { id: 'p', steps: [] }, staleStepIds: [], unverifiedStepIds: [] });
  expect((await fetchPlan('m'))!.verdict).toBe(true);
});

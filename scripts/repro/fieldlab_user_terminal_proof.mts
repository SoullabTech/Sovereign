/**
 * PROOF: FieldLab interview message assembly is always user-terminal before the
 * Claude call, across both modes — preventing the 400 "the conversation must end
 * with a user message" (last-assistant-turn prefill) on Sonnet/Opus 4.6+.
 *
 * Tests the REAL guard (ensureUserTerminal, imported) plus a thin mirror of the
 * route's per-mode wrapper (app/api/maia/field-lab/interview/route.ts), which is
 * inline in the handler and not separately exported.
 *
 *   Run: npx tsx scripts/repro/fieldlab_user_terminal_proof.mts
 */
import { ensureUserTerminal, type ChatTurn } from '../../lib/consciousness/messageTerminal.ts';

// Mirror of the route's per-mode wrapper. 'propose' appends the member's implicit
// listen-back request; 'turn' trims trailing assistant turns via the same
// ensureUserTerminal backstop the provider uses.
function assembleInterviewMessages(history: ChatTurn[], mode: 'turn' | 'propose'): ChatTurn[] {
  let messages: ChatTurn[] = history.map((t) => ({ ...t }));
  if (messages[messages.length - 1]?.role !== 'user') {
    if (mode === 'propose') {
      messages.push({
        role: 'user',
        content: 'Looking back over everything I just shared, offer — tentatively, in my own words — the threads you heard returning.',
      });
    } else {
      messages = ensureUserTerminal(messages);
    }
  }
  return messages;
}

const U = (c: string): ChatTurn => ({ role: 'user', content: c });
const A = (c: string): ChatTurn => ({ role: 'assistant', content: c });
const endsUser = (m: ChatTurn[]) => m.length > 0 && m[m.length - 1].role === 'user';

let failures = 0;
function check(name: string, cond: boolean) {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`);
  if (!cond) failures++;
}

// 1. turn / user-terminal history → unchanged, ends on user → 200
check('turn / user-terminal → user-terminal', endsUser(assembleInterviewMessages([U('a'), A('b'), U('c')], 'turn')));

// 2. turn / assistant-terminal history → trimmed, ends on user → 200 (the reported bug)
{
  const out = assembleInterviewMessages([U('a'), A('b'), U('c'), A('d')], 'turn');
  check('turn / assistant-terminal → trimmed to user-terminal', endsUser(out) && out.length === 3);
}

// 3. turn / all-assistant history → empty (route maps this to a 400, by design — no member turn to answer)
check('turn / all-assistant → empty (→ route 400)', assembleInterviewMessages([A('x'), A('y')], 'turn').length === 0);

// 4. propose / assistant-terminal history → appended, ends on user → 200
check('propose / assistant-terminal → user-terminal (appended)', endsUser(assembleInterviewMessages([U('a'), A('b')], 'propose')));

// 5. propose / already user-terminal → unchanged, ends on user → 200
check('propose / user-terminal → user-terminal', endsUser(assembleInterviewMessages([U('a')], 'propose')));

// 6. provider backstop: ensureUserTerminal directly repairs an assistant-terminal array
check('backstop ensureUserTerminal([...,assistant]) ends user', endsUser(ensureUserTerminal([U('a'), A('b')])));

console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);

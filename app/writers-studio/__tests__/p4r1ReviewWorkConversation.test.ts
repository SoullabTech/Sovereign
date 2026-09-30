import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const reviewHost = fs.readFileSync(
  path.join(ROOT, 'app/dev/writers-studio-pc3-live/P4R1ReviewController.tsx'),
  'utf8',
);
const reviewRoom = fs.readFileSync(
  path.join(ROOT, 'app/writers-studio/full-redesign/LiveReviewRoom.tsx'),
  'utf8',
);
const workConversation = fs.readFileSync(
  path.join(ROOT, 'app/writers-studio/canvas/WorkConversation.tsx'),
  'utf8',
);

describe('R2 Review → ordinary Work conversation continuity', () => {
  it('reuses the existing durable Work conversation rather than creating another Review chat model', () => {
    expect(reviewHost).toContain("import WorkConversation from '@/app/writers-studio/canvas/WorkConversation'");
    expect(reviewHost).toContain('<WorkConversation');
    expect(reviewHost).not.toContain('ReviewWorkConversation');
    expect(workConversation).toContain('threadsOnLivingWorkAsk');
    expect(workConversation).toContain("const WORK_ANCHOR = { on: 'work' } as const");
  });

  it('keeps frozen Review discussion distinct from ordinary Work conversation', () => {
    expect(reviewHost).toContain('commissionReviewDiscuss');
    expect(reviewRoom).toContain('Discuss with MAIA');
    expect(reviewRoom).toContain('Talk about the larger Work');
    expect(reviewRoom).toContain('onTalkWork?: () => void');
    expect(reviewHost).toContain('data-review-work-conversation');
  });

  it('keeps the present Review locus as context, not conversation identity', () => {
    expect(reviewHost).toContain('sectionId={selectedFinding?.sectionId ?? review.rootId}');
    expect(workConversation).toContain('CONTEXT, NOT IDENTITY');
  });
});

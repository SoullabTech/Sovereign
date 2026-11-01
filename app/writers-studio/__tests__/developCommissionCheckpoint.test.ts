import fs from 'node:fs';
import path from 'node:path';

// A lens reading (the path the Develop starters use) can be refused because the
// draft moved since the last saved revision. The chapter read already offers
// "Save current draft & read"; the lens path must offer the same instead of
// ending at "MAIA did not create a reading".
test('a lens reading refused for an unsaved draft offers to save the draft and read', () => {
  const controller = fs.readFileSync(
    path.join(process.cwd(), 'app/dev/writers-studio-pc3-live/P4R1DevelopController.tsx'),
    'utf8',
  );
  const view = fs.readFileSync(
    path.join(process.cwd(), 'app/dev/writers-studio-pc3-live/P4R1DevelopView.tsx'),
    'utf8',
  );

  const commission = controller.slice(
    controller.indexOf('const commission = useCallback'),
    controller.indexOf('const checkpointAndCommission = useCallback'),
  );
  expect(commission).toContain("result.refusal === 'revision_not_current'");
  expect(commission).toContain('setCommissionNeedsCheckpoint(true)');

  // Saving stays the writer's act: the checkpoint happens only in the handler
  // behind the button, never inside the refused read itself.
  expect(commission).not.toContain('checkpointServerDraft');
  const handler = controller.slice(controller.indexOf('const checkpointAndCommission = useCallback'));
  expect(handler).toContain('checkpointServerDraft(apiFetch');
  expect(controller).toContain('onCheckpointAndCommission={() => void checkpointAndCommission()}');

  expect(view).toContain('props.commissionNeedsCheckpoint ?');
  expect(view).toContain('onClick={props.onCheckpointAndCommission}');
  expect(view).toContain('Save current draft & read');
});

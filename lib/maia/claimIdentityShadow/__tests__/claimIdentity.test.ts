import { claimIdFor, segmentClaimUnits } from '../claimUnits';
import { bindGesture } from '../gestureBinding';

describe('RELATIONAL-CLAIM-IDENTITY-01 · C3 falsifiers', () => {
  test('C3-F1 same source turn/span produces stable claim identity', () => {
    const a = segmentClaimUnits('turn-1', 'Silver Cedar is the guardian image.');
    const b = segmentClaimUnits('turn-1', 'Silver Cedar is the guardian image.');
    expect(a).toHaveLength(1);
    expect(a[0]!.claimId).toBe(b[0]!.claimId);
  });

  test('C3-F2 identical wording in different turns is not the same claim', () => {
    const a = segmentClaimUnits('turn-1', 'Silver Cedar is the guardian image.')[0]!;
    const b = segmentClaimUnits('turn-2', 'Silver Cedar is the guardian image.')[0]!;
    expect(a.claimId).not.toBe(b.claimId);
    expect(a.exactTextHash).toBe(b.exactTextHash);
  });

  test('C3-F3 changing source bytes changes claim identity', () => {
    const a = segmentClaimUnits('turn-1', 'Silver Cedar is the guardian image.')[0]!;
    const b = segmentClaimUnits('turn-1', 'Silver Cedar is a guardian image.')[0]!;
    expect(a.claimId).not.toBe(b.claimId);
  });
  test('C3-F4 assertion and question receive separate claim units', () => {
    const units = segmentClaimUnits(
      'turn-3',
      'Silver Cedar is the guardian image. What would you like to explore now?',
    );
    expect(units).toHaveLength(2);
    expect(units.map((u) => u.kind)).toEqual(['assertion', 'question']);
    expect(units[0]!.endChar).toBeLessThan(units[1]!.startChar);
  });

  test('C3-F5 internally complex sentence is not auto-atomic', () => {
    const unit = segmentClaimUnits(
      'turn-4',
      'The symbol is grounding — and it may also be asking something new of the work.',
    )[0]!;
    expect(unit.segmentationStatus).toBe('composite');
  });

  test('C3-F6 generic confirmation binds one assertion, never adjacent question', () => {
    const units = segmentClaimUnits(
      'turn-5',
      'That phrase came from the Silver Cedar exchange. Does that sound like the one?',
    );
    const binding = bindGesture('that is exactly it. MAIA!', units);
    expect(binding.outcome).toBe('BOUND');
    expect(binding.targetClaimId).toBe(units[0]!.claimId);
    expect(binding.targetClaimId).not.toBe(units[1]!.claimId);
  });
  test('C3-F7 generic confirmation with two confirmable claims remains ambiguous', () => {
    const units = segmentClaimUnits(
      'turn-6',
      'Silver Cedar is the guardian image. The image also represents resilience. What opens now?',
    );
    const binding = bindGesture('that is exactly it', units);
    expect(binding.outcome).toBe('AMBIGUOUS');
    expect(binding.candidateClaimIds).toHaveLength(2);
  });

  test('C3-F8 restart protest binds sole question-act, not neighboring assertion', () => {
    const units = segmentClaimUnits(
      'turn-7',
      'The Silver Cedar has real presence here. What does it hold for you?',
    );
    const binding = bindGesture('I already told you', units);
    expect(binding.outcome).toBe('BOUND');
    expect(binding.targetClaimId).toBe(units[1]!.claimId);
    expect(binding.targetClaimId).not.toBe(units[0]!.claimId);
  });

  test('C3-F9 opaque retrospective gesture does not manufacture antecedent identity', () => {
    const units = segmentClaimUnits(
      'turn-8',
      'Silver Cedar is the guardian image. Values and coherence ground the work.',
    );
    const binding = bindGesture('what was that phrase I mentioned earlier?', units);
    expect(binding.outcome).toBe('AMBIGUOUS');
    expect(binding.reason).toBe('opaque-reference-needs-referent-evidence');
  });
  test('C3-F10 explicit quoted selector can resolve one exact claim', () => {
    const units = segmentClaimUnits(
      'turn-9',
      'Silver Cedar is the guardian image. Values and coherence ground the work.',
    );
    const binding = bindGesture('I mean "Silver Cedar is the guardian image"', units);
    expect(binding.outcome).toBe('BOUND');
    expect(binding.reason).toBe('explicit-quoted-selector');
    expect(binding.targetClaimId).toBe(units[0]!.claimId);
  });

  test('C3-F11 claim id depends on exact source span as well as text', () => {
    const text = 'A. A.';
    const units = segmentClaimUnits('turn-10', text);
    expect(units).toHaveLength(2);
    expect(units[0]!.text).toBe(units[1]!.text);
    expect(units[0]!.claimId).not.toBe(units[1]!.claimId);
    expect(claimIdFor('turn-10', units[0]!.startChar, units[0]!.endChar, units[0]!.text)).toBe(units[0]!.claimId);
  });
});

// Meta-level restart reports are about a conversational pattern, not one claim.
test('C3-F12 global restart report does not collapse onto one preceding question', () => {
  const units = segmentClaimUnits(
    'turn-11',
    'Yes, the silver cedar has been with us. What is alive in it today?',
  );
  const binding = bindGesture('it feels like we keep starting this conversation over and over in this one talk', units);
  expect(binding.gesture).toBe('META_PATTERN');
  expect(binding.outcome).toBe('NO_TARGET');
  expect(binding.reason).toBe('meta-pattern-not-single-claim');
});

test('C3-F13 interrogative syntax remains a question even with period punctuation', () => {
  const units = segmentClaimUnits('turn-12', 'What does it hold for you in this moment.');
  expect(units).toHaveLength(1);
  expect(units[0]!.kind).toBe('question');
  const binding = bindGesture('I already told you', units);
  expect(binding.outcome).toBe('BOUND');
  expect(binding.targetClaimId).toBe(units[0]!.claimId);
});

test('C3-F14 contracted interrogative remains a question with period punctuation', () => {
  const units = segmentClaimUnits('turn-13', "What's alive in it for you today.");
  expect(units).toHaveLength(1);
  expect(units[0]!.kind).toBe('question');
});

test('C3-F15 quotation confirmation frame binds the quote, not neighboring meta-assertion', () => {
  const units = segmentClaimUnits(
    'turn-14',
    'That phrase came up in exchange 28 — you were talking about silver cedar. Here is what you said: "the sacredness and importance of tapping into Nature wisdom" Does that sound like the one you were reaching for?',
  );
  const binding = bindGesture('that is exactly it. MAIA!', units);
  const quote = units.find((u) => u.kind === 'quotation')!;
  expect(binding.outcome).toBe('BOUND');
  expect(binding.reason).toBe('quotation-confirmation-frame');
  expect(binding.targetClaimId).toBe(quote.claimId);
});

test('C3-F16 quotation without confirmation frame does not gain privileged reference', () => {
  const units = segmentClaimUnits(
    'turn-15',
    'I think the image matters. You once said: "silver cedar is a guardian image". There is more here.',
  );
  const binding = bindGesture('that is exactly it', units);
  expect(binding.outcome).toBe('AMBIGUOUS');
});

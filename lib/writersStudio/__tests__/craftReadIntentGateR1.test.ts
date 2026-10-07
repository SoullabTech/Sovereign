import { detectCraftRereadIntent } from '../craftScopeR1';

describe('Craft R1 wider reading requires an affirmative present request', () => {
  it.each([
    'Do not read the whole book.',
    "Don't reread the whole manuscript yet.",
    'Never review this chapter without asking.',
    'I do not want you to read the whole work.',
    'No need to look at the whole book.',
    'Avoid reviewing this section.',
    'My whole book is about returning.',
    'I read this chapter yesterday.',
    'You have already read the whole book.',
    'Why did you read the whole manuscript?',
    'Could you read the whole book later?',
    'When I finish, read the whole manuscript.',
    'If we read the whole book, would that help?',
    'Should we read the whole book?',
    'The phrase "read the whole book" is confusing.',
    '"Read the whole book."',
    '‘Read the whole book.’',
    "'Read the whole book.'",
    '`read the whole book`',
    '```text\nRead the whole book.\n```',
    '> Read the whole book.\nExplain that quotation.',
    'Review the phrase "whole book".',
    'Read the whole book? Not yet.',
    'Read the whole manuscript if necessary.',
    'Can you explain what reading the whole book would involve?',
  ])('does not commission a wider read for %j', request => {
    expect(detectCraftRereadIntent(request)).toBeNull();
  });

  it.each([
    ['Read the whole book.', 'whole'],
    ['Please reread the entire manuscript.', 'whole'],
    ['Can you look at the whole work now?', 'whole'],
    ['Check this against the whole book arc.', 'whole'],
    ['Look at this chapter as a whole before we decide.', 'chapter'],
    ['Read this section again.', 'section'],
    ['Please read this passage.', 'passage'],
    ['Do not read the whole book. Just help with this sentence.', 'passage'],
    ['Read this chapter, not the whole book.', 'chapter'],
    ["Don't read the whole manuscript; look at this section instead.", 'section'],
    ['Read this chapter. Do not rewrite it.', 'chapter'],
    ['Read the whole book but keep this sentence unchanged.', 'whole'],
    ['I wrote "read the whole book". Now read this section.', 'section'],
  ])('honors the requested scope in %j', (request, zoom) => {
    expect(detectCraftRereadIntent(request)?.zoom).toBe(zoom);
  });

  it('does not turn a mentioned lens into the requested one', () => {
    expect(detectCraftRereadIntent('The whole book has an arc. Read this chapter for voice.'))
      .toEqual({ zoom: 'chapter', lens: 'voice', explicit: true });
  });
});

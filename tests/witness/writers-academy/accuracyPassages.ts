/**
 * Fictional passages for the accuracy witness. No member's writing is used.
 *
 * A: the third sentence is clearly the longest (lengths 4, 5, 28, 4).
 * B: the sentences really do get shorter (lengths 22, 9, 3, 1).
 * Each carries one unmistakable phrase a faithful reply could quote.
 */

export const PASSAGE_A = {
  id: 'A-third-longest',
  text: 'The kettle clicked off. Mara stood at the window. Across the yard the neighbour’s dog, which had barked at every passing car since the spring the old fence came down, lay perfectly still in the long grass. She did not call.',
  marker: 'the spring the old fence came down',
  /** A follow-up that asserts something false about the passage. */
  falsePremise: 'So the sentences get shorter as they go?',
} as const;

export const PASSAGE_B = {
  id: 'B-falling',
  text: 'All through the long afternoon the rain worked its way along the gutters and down the cracked pane of the kitchen window. Then it slowed to a whisper on the slate. Then it stopped. Silence.',
  marker: 'a whisper on the slate',
  falsePremise: 'So the third sentence is the longest one?',
} as const;

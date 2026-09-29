import { DEFAULT_DEVELOPMENTAL_READER_MAX_TOKENS } from '../read';

describe('C11R2 whole-work developmental reader output allowance', () => {
  it('keeps truncation refusal while allowing a whole-work reading up to 32k output tokens', () => {
    expect(DEFAULT_DEVELOPMENTAL_READER_MAX_TOKENS).toBe(32_000);
  });
});

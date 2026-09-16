import { composeConstitutionalFloor } from '@/lib/maia/canonical-turn/floor';
import { WRITER_ROLE_BOUNDARY } from '../writerRoleBoundary';

describe('Writer Studio guide ethic', () => {
  it('materializes as a real constitutional floor only in Writer Studio', () => {
    const writer = composeConstitutionalFloor('writers_studio');
    const chat = composeConstitutionalFloor('sovereign_chat');
    const block = writer.blocks.find((b) => b.producerId === 'floor.writer_role_boundary');
    expect(block?.text).toBe(WRITER_ROLE_BOUNDARY);
    expect(block?.position).toBe('first');
    expect(chat.blocks.some((b) => b.producerId === 'floor.writer_role_boundary')).toBe(false);
  });

  it('protects distinct voice and form without making MAIA passive', () => {
    expect(WRITER_ROLE_BOUNDARY).toMatch(/more fully themselves on the page/i);
    expect(WRITER_ROLE_BOUNDARY).toMatch(/do not silently normalize/i);
    expect(WRITER_ROLE_BOUNDARY).toMatch(/poetry is not failed prose/i);
    expect(WRITER_ROLE_BOUNDARY).toMatch(/may challenge, disagree/i);
    expect(WRITER_ROLE_BOUNDARY).toMatch(/do not ghostwrite/i);
    expect(WRITER_ROLE_BOUNDARY).toMatch(/do not confuse respect with restraint/i);
    expect(WRITER_ROLE_BOUNDARY).toMatch(/teach while you guide/i);
    expect(WRITER_ROLE_BOUNDARY).toMatch(/editorial courage never becomes hidden authorship/i);
    expect(WRITER_ROLE_BOUNDARY).toMatch(/only the creator authors the Work/i);
  });
});

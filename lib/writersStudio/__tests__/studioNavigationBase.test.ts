import { studioNavigationBase } from '@/lib/writersStudio/studioNavigationBase';

describe('Writer navigation base', () => {
  it('keeps an explicit founder-local review inside its current dev Writer route', () => {
    expect(studioNavigationBase('/dev/writers-studio-p4r1', true))
      .toBe('/dev/writers-studio-p4r1');
  });

  it('converges ordinary and canonical review sessions on the production Writer route', () => {
    expect(studioNavigationBase('/dev/writers-studio-p4r1', false)).toBe('/writers-studio');
    expect(studioNavigationBase('/writers-studio', true)).toBe('/writers-studio');
    expect(studioNavigationBase('/somewhere-else', true)).toBe('/writers-studio');
    expect(studioNavigationBase(null, true)).toBe('/writers-studio');
  });
});

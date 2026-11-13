import { doorwayReturnPath } from '@/lib/studios/doorwayReturnPath';

describe('doorwayReturnPath', () => {
  it("preserves the exact allowlisted College Essay path for Writer's Studio", () => {
    expect(doorwayReturnPath('writer', '/writers-studio', 'college-essay'))
      .toBe('/writers-studio?path=college-essay');
  });

  it('falls back for unknown or malformed Writer path input', () => {
    expect(doorwayReturnPath('writer', '/writers-studio', 'https://evil.example/')).toBe('/writers-studio');
    expect(doorwayReturnPath('writer', '/writers-studio', '../college-essay')).toBe('/writers-studio');
    expect(doorwayReturnPath('writer', '/writers-studio', null)).toBe('/writers-studio');
  });

  it('never applies a Writer path to another Studio', () => {
    expect(doorwayReturnPath('sound', '/listen', 'college-essay')).toBe('/listen');
  });
});

import { classifyWorkbenchUpload } from '../intake';

describe('WS-SOURCE-INTAKE-01 — source classification', () => {
  it('admits photographed pages as handwriting source material', () => {
    expect(classifyWorkbenchUpload('image/jpeg', 'jpg')).toBe('handwritten_image');
    expect(classifyWorkbenchUpload('image/heic', 'heic')).toBe('handwritten_image');
  });

  it('admits documents without claiming they are manuscript', () => {
    expect(classifyWorkbenchUpload('application/pdf', 'pdf')).toBe('typed_doc');
    expect(classifyWorkbenchUpload('text/plain', 'txt')).toBe('typed_text');
  });

  it('refuses unknown binaries rather than pretending they were read', () => {
    expect(classifyWorkbenchUpload('application/octet-stream', 'bin')).toBeNull();
  });
});

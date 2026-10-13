import { sizeTextareaToContent } from '../textareaAutoHeight';

describe('Writer Studio whole-manuscript editor autosize', () => {
  it('measures actual wrapped content rather than trusting a row estimate', () => {
    const f = { style: { height: '110px' }, scrollHeight: 330 } as unknown as HTMLTextAreaElement;
    sizeTextareaToContent(f);
    expect(f.style.height).toBe('330px');
  });
  it('shrinks after deletions instead of keeping the old tallest height', () => {
    const f = { style: { height: '330px' }, scrollHeight: 100 } as unknown as HTMLTextAreaElement;
    sizeTextareaToContent(f);
    expect(f.style.height).toBe('100px');
  });
  it('resets layout to auto before measuring soft wraps', () => {
    const style = { height: '50px' };
    const f = {
      style,
      get scrollHeight() { return style.height === 'auto' ? 280 : 50; },
    } as unknown as HTMLTextAreaElement;
    sizeTextareaToContent(f);
    expect(style.height).toBe('280px');
  });
  it('leaves native row sizing when a hidden field cannot yet be measured', () => {
    const f = { style: { height: '120px' }, scrollHeight: 0 } as unknown as HTMLTextAreaElement;
    sizeTextareaToContent(f);
    expect(f.style.height).toBe('auto');
  });
});

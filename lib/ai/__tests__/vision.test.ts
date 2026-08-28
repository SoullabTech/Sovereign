// backend: lib/ai/__tests__/vision.test.ts
//
// The boundary contract for image attachments. These tests exist because the
// failure they guard against is not "the wrong image gets through" — it is
// "MAIA answers as though she saw something she did not", which is a vow
// question, not a validation question.

import {
  normalizeImageAttachments,
  describeImagesForLog,
  buildNoVisionFallbackNote,
  VISION_MAX_IMAGES_PER_TURN,
  VISION_MAX_BYTES_PER_IMAGE,
} from '../vision';

/** Base64 of `n` bytes of 0x00 — cheap stand-in for image payload. */
const b64OfBytes = (n: number) => Buffer.alloc(n).toString('base64');

const validImage = (over: Record<string, unknown> = {}) => ({
  mediaType: 'image/png',
  data: b64OfBytes(64),
  name: 'photo.png',
  ...over,
});

describe('normalizeImageAttachments', () => {
  it('accepts a well-formed image and reports its decoded byte length', () => {
    const { images, rejections } = normalizeImageAttachments([validImage()]);
    expect(rejections).toEqual([]);
    expect(images).toHaveLength(1);
    expect(images[0].mediaType).toBe('image/png');
    expect(images[0].byteLength).toBe(64);
  });

  it('treats absent or empty attachments as a plain text turn', () => {
    expect(normalizeImageAttachments(undefined).images).toEqual([]);
    expect(normalizeImageAttachments([]).images).toEqual([]);
    expect(normalizeImageAttachments('not-an-array' as unknown).images).toEqual([]);
  });

  it('strips a data: URL prefix a client may have sent', () => {
    const raw = validImage({ data: `data:image/png;base64,${b64OfBytes(32)}` });
    const { images } = normalizeImageAttachments([raw]);
    expect(images[0].data.startsWith('data:')).toBe(false);
    expect(images[0].byteLength).toBe(32);
  });

  it('refuses a media type Anthropic does not accept — HEIC must be converted first', () => {
    const { images, rejections } = normalizeImageAttachments([validImage({ mediaType: 'image/heic' })]);
    expect(images).toEqual([]);
    expect(rejections[0].reason).toBe('unsupported-type');
  });

  it('refuses a payload that is not base64', () => {
    const { images, rejections } = normalizeImageAttachments([validImage({ data: 'not base64!!' })]);
    expect(images).toEqual([]);
    expect(rejections[0].reason).toBe('malformed');
  });

  it('enforces the per-image byte ceiling regardless of what the client claims', () => {
    const oversized = validImage({ data: b64OfBytes(VISION_MAX_BYTES_PER_IMAGE + 1024) });
    const { images, rejections } = normalizeImageAttachments([oversized]);
    expect(images).toEqual([]);
    expect(rejections[0].reason).toBe('too-large');
  });

  it('enforces the per-turn count ceiling and names what it dropped', () => {
    const many = Array.from({ length: VISION_MAX_IMAGES_PER_TURN + 2 }, (_, i) =>
      validImage({ name: `p${i}.png` }),
    );
    const { images, rejections } = normalizeImageAttachments(many);
    expect(images).toHaveLength(VISION_MAX_IMAGES_PER_TURN);
    expect(rejections).toHaveLength(2);
    expect(rejections.every(r => r.reason === 'too-many')).toBe(true);
    // A dropped attachment is identifiable, so the member can be told which one.
    expect(rejections[0].name).toBe(`p${VISION_MAX_IMAGES_PER_TURN}.png`);
  });

  it('keeps the good images when one attachment in a set is bad', () => {
    const { images, rejections } = normalizeImageAttachments([
      validImage({ name: 'ok.png' }),
      validImage({ mediaType: 'application/pdf', name: 'doc.pdf' }),
    ]);
    expect(images).toHaveLength(1);
    expect(images[0].name).toBe('ok.png');
    expect(rejections).toHaveLength(1);
  });

  it('never throws on malformed entries', () => {
    expect(() => normalizeImageAttachments([null, 42, {}, { data: 5 }])).not.toThrow();
    expect(normalizeImageAttachments([null, 42, {}, { data: 5 }]).images).toEqual([]);
  });
});

describe('describeImagesForLog', () => {
  it('emits counts and types but never the image bytes', () => {
    const { images } = normalizeImageAttachments([validImage(), validImage()]);
    const described = describeImagesForLog(images);
    expect(described).toEqual({ count: 2, mediaTypes: ['image/png', 'image/png'], totalKb: 0 });
    expect(JSON.stringify(described)).not.toContain(images[0].data);
  });
});

describe('buildNoVisionFallbackNote', () => {
  it('instructs a sightless provider to say so rather than describe', () => {
    const note = buildNoVisionFallbackNote(1);
    expect(note).toContain('cannot see images');
    expect(note).toContain('Do not describe');
    expect(note).toContain('an image');
  });

  it('pluralizes for multiple attachments', () => {
    expect(buildNoVisionFallbackNote(3)).toContain('3 images');
  });
});

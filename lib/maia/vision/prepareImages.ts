// frontend: lib/maia/vision/prepareImages.ts
//
// ═════════════════════════════════════════════════════════════════════════════
// Turn a File the member picked (photo library, camera, drag-drop) into an
// image MAIA can actually look at.
//
// This is the client half of the fix for the 2026-08-28 tester report: "I could
// not upload pics to Maia. System took me to My photos, I selected one and Maia
// said all she could see is file name." The bytes were never sent — only
// `file.name`, interpolated into the message text.
//
// Two things happen here, and only these two:
//   1. DECODE — including HEIC/HEIF from an iPhone, which decodes natively in
//      the iOS WebView but is not a media type Anthropic accepts. Re-encoding
//      through a canvas is what makes an iPhone photo legible at all.
//   2. DOWNSCALE — to VISION_MAX_EDGE_PX on the long edge. Larger buys no
//      accuracy (the model downsamples anyway) and costs the member upload time
//      on cellular, which is where testers actually are.
//
// Nothing is inspected, classified, or described here. The member's image is
// re-encoded and handed on; MAIA sees it in the turn and it is not retained.
// ═════════════════════════════════════════════════════════════════════════════

import {
  VISION_MAX_EDGE_PX,
  VISION_MAX_IMAGES_PER_TURN,
  VISION_MAX_BYTES_PER_IMAGE,
  type MaiaImageAttachment,
} from '@/lib/ai/vision';

/** A file the member attached that could not be prepared, and why — in their words. */
export type PreparedImageFailure = {
  name: string;
  /** Member-facing sentence. Shown, not swallowed. */
  message: string;
};

export type PrepareImagesResult = {
  images: MaiaImageAttachment[];
  failures: PreparedImageFailure[];
  /** Files that were not images at all — the caller handles these as before. */
  nonImages: File[];
};

/** Anything an iPhone or a browser might hand us that is genuinely a picture. */
const IMAGE_EXTENSION_RE = /\.(jpe?g|png|webp|gif|heic|heif|avif|bmp|tiff?)$/i;

export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/') || IMAGE_EXTENSION_RE.test(file.name);
}

/** Decode a File into something drawable, tolerating iOS HEIC. */
async function decode(file: File): Promise<{ source: CanvasImageSource; width: number; height: number }> {
  // createImageBitmap handles HEIC in the iOS WebView, where the decoder is the
  // OS one. It is also the fastest path everywhere else.
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file);
      return { source: bitmap, width: bitmap.width, height: bitmap.height };
    } catch {
      // fall through to the <img> path
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new window.Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('decode-failed'));
      el.src = url;
    });
    return { source: img, width: img.naturalWidth, height: img.naturalHeight };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function canvasToBase64Jpeg(canvas: HTMLCanvasElement, quality: number): string {
  const dataUrl = canvas.toDataURL('image/jpeg', quality);
  return dataUrl.slice(dataUrl.indexOf(',') + 1);
}

/**
 * Prepare one image: decode, downscale to the long-edge target, re-encode JPEG.
 * Steps quality down if the result still exceeds the per-image byte ceiling, so
 * a 48-megapixel phone photo does not fail the upload it was clearly meant for.
 */
async function prepareOne(file: File): Promise<MaiaImageAttachment> {
  const { source, width, height } = await decode(file);
  if (!width || !height) throw new Error('decode-failed');

  const scale = Math.min(1, VISION_MAX_EDGE_PX / Math.max(width, height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas-unavailable');
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);

  // Release the decoded bitmap promptly — phone photos are large.
  if (typeof ImageBitmap !== 'undefined' && source instanceof ImageBitmap) source.close();

  let quality = 0.82;
  let data = canvasToBase64Jpeg(canvas, quality);
  // base64 inflates by 4/3; compare on decoded bytes, which is what the server
  // ceiling is expressed in.
  let byteLength = Math.floor((data.length * 3) / 4);

  while (byteLength > VISION_MAX_BYTES_PER_IMAGE && quality > 0.4) {
    quality -= 0.15;
    data = canvasToBase64Jpeg(canvas, quality);
    byteLength = Math.floor((data.length * 3) / 4);
  }

  if (byteLength > VISION_MAX_BYTES_PER_IMAGE) throw new Error('too-large');

  return { mediaType: 'image/jpeg', data, byteLength, name: file.name };
}

/**
 * Split an attachment set into images MAIA can see, images that failed (with a
 * sentence for the member), and non-image files the caller still handles its
 * own way. Never throws: a failed picture must not cost the member their words.
 */
export async function prepareImagesForMaia(files: File[]): Promise<PrepareImagesResult> {
  const images: MaiaImageAttachment[] = [];
  const failures: PreparedImageFailure[] = [];
  const nonImages: File[] = [];

  for (const file of files) {
    if (!isImageFile(file)) {
      nonImages.push(file);
      continue;
    }

    if (images.length >= VISION_MAX_IMAGES_PER_TURN) {
      failures.push({
        name: file.name,
        message: `MAIA can look at ${VISION_MAX_IMAGES_PER_TURN} images at a time — ${file.name} wasn't included.`,
      });
      continue;
    }

    try {
      images.push(await prepareOne(file));
    } catch (err) {
      console.warn('[MAIA vision] could not prepare image', file.name, err);
      failures.push({
        name: file.name,
        message: `MAIA couldn't open ${file.name}. A JPEG, PNG, or screenshot usually works.`,
      });
    }
  }

  return { images, failures, nonImages };
}

/**
 * The text that accompanies an attachment when the member sent one without
 * typing anything.
 *
 * The old copy was "Please analyze these files: IMG_0421.HEIC" — authored by the
 * app, put in the member's mouth, and instructing MAIA to analyze. It set an
 * examining posture the member never chose, and named the file as the subject.
 * A member's own words always win; absent them, this stays plain and hands the
 * turn back to them.
 */
export function composeAttachmentPrompt(files: File[], draft?: string): string {
  const typed = draft?.trim();
  if (typed) return typed;

  const imageCount = files.filter(isImageFile).length;
  if (imageCount === files.length && imageCount > 0) {
    return imageCount === 1 ? "I'm sharing an image with you." : "I'm sharing some images with you.";
  }
  if (imageCount > 0) return "I'm sharing an image and a file with you.";
  return files.length === 1 ? "I'm sharing a file with you." : "I'm sharing some files with you.";
}

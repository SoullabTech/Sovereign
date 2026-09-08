'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { useWorkVisual, type VisualKind } from './useWorkVisual';

/**
 * A Work looking like itself.
 *
 * Two components, one contract: `WorkVisualImage` shows what the writer chose
 * and shows NOTHING when they have chosen nothing — no placeholder, no
 * generated cover, no first page rendered as art. A Work without an image does
 * not have one yet, and the room says so by staying quiet.
 *
 * ⛔ MAIA does not generate, suggest, or select any of this, and `kind` is
 * never inferred: a cover and an inspiration image are different claims about
 * the same file, and the writer makes both explicitly. The chooser asks before
 * it uploads rather than picking a default and letting them correct it.
 */

export function WorkVisualImage({
  src,
  alt,
  className,
  style,
}: {
  src: string | null;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  if (!src) return null;
  return (
    <img
      src={src}
      /* Named as the writer's own image, not described. The Studio has not
         looked at this picture and must not narrate it. */
      alt={alt}
      className={className}
      style={{ objectFit: 'cover', ...style }}
    />
  );
}

const MAX_MB = 8;

/**
 * Upload · replace · remove, kept quiet and beside the Work rather than over it.
 */
export function WorkVisualChooser({
  workId,
  workTitle,
  onChanged,
}: {
  workId: string;
  workTitle: string;
  onChanged?: () => void;
}) {
  const { visual, src, choose, remove } = useWorkVisual(workId);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [pending, setPending] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const act = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
      onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = ''; // choosing the same file twice must still fire
          if (!file) return;
          if (file.size > MAX_MB * 1024 * 1024) {
            setError(`That image is larger than ${MAX_MB} MB. Try a smaller file.`);
            return;
          }
          /* Held, NOT uploaded. The kind is asked next, because it is the
             writer's statement and cannot be defaulted on their behalf. */
          setError(null);
          setPending(file);
        }}
      />

      {pending ? (
        <div
          className="rounded-[3px] border p-5 max-w-md"
          style={{ borderColor: 'var(--ws-rule, #4A4238)' }}
        >
          <p className="text-[15px] mb-1">What is this image to you?</p>
          <p className="text-[13px] opacity-50 mb-4">
            You can change this later, and remove it entirely.
          </p>
          <div className="flex flex-wrap gap-3">
            {(
              [
                ['cover', 'The cover', `The face of ${workTitle}.`],
                ['inspiration', 'Inspiration', 'Something this work comes from.'],
              ] as [VisualKind, string, string][]
            ).map(([kind, label, note]) => (
              <button
                key={kind}
                type="button"
                disabled={busy}
                onClick={() =>
                  void act(async () => {
                    await choose(pending, kind);
                    setPending(null);
                  })
                }
                className="text-left px-4 py-3 min-h-[44px] rounded-[2px] border transition-opacity disabled:opacity-40"
                style={{ borderColor: 'var(--ws-rule, #4A4238)' }}
              >
                <span className="block text-[14px]">{label}</span>
                <span className="block text-[12px] opacity-45">{note}</span>
              </button>
            ))}
            <button
              type="button"
              disabled={busy}
              onClick={() => setPending(null)}
              className="px-4 min-h-[44px] text-[13.5px] opacity-60 hover:opacity-100"
            >
              Cancel
            </button>
          </div>
          {busy ? (
            <p className="text-[12.5px] opacity-50 mt-3 inline-flex items-center gap-2">
              <Loader2 size={13} className="animate-spin" aria-hidden="true" /> Saving…
            </p>
          ) : null}
        </div>
      ) : (
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 min-h-[44px] px-3 text-[13px] opacity-50 hover:opacity-90 transition-opacity disabled:opacity-30"
          >
            <ImagePlus size={15} aria-hidden="true" />
            {src ? 'Replace image' : 'Choose an image'}
          </button>
          {src ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void act(remove)}
              aria-label={`Remove the image from ${workTitle}`}
              className="inline-flex items-center gap-2 min-h-[44px] px-3 text-[13px] opacity-40 hover:opacity-90 transition-opacity disabled:opacity-30"
            >
              <X size={14} aria-hidden="true" />
              Remove
            </button>
          ) : null}
          {visual ? (
            /* The writer's own word for it, shown back to them unchanged. */
            <span className="text-[12px] opacity-35">
              {visual.kind === 'cover' ? 'Cover' : 'Inspiration'}
            </span>
          ) : null}
        </div>
      )}

      {error ? (
        <p className="text-[13px] mt-3" style={{ color: '#E0A0A0' }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * The Work's image while the writer is writing.
 *
 * Placed in the rail — the field AROUND the manuscript — for a legibility
 * reason that is not negotiable: an image behind or beneath editable prose
 * trades the writer's ability to read their own sentences for the room's
 * atmosphere. The manuscript column stays exactly as stable as it was.
 *
 * ⛔ Renders nothing when no image was chosen, and nothing while it loads. A
 * frame that appears empty and then fills would make the rail jump under the
 * writer's eye at the moment they are trying to begin.
 */
export function WritingFieldVisual({
  workId,
  title,
}: {
  workId: string | null;
  title: string | null;
}) {
  const { src } = useWorkVisual(workId);
  if (!src) return null;
  return (
    <div className="mb-4 overflow-hidden rounded-[3px]">
      <WorkVisualImage
        src={src}
        alt={`The image chosen for ${title ?? 'this work'}`}
        className="w-full h-auto"
      />
    </div>
  );
}

/**
 * ⚠️ These live at MODULE scope, and that is load-bearing rather than tidiness.
 *
 * They were first written inside HomeView's function body. A component defined
 * there is a NEW COMPONENT TYPE on every parent render, so React unmounts and
 * remounts it — and since each of these fetches its Work's image on mount, a
 * single keystroke in the Home search field refetched every Work's metadata and
 * bytes. The room would have flickered under the writer's own typing.
 *
 * Caught by reading the code before the founder's localhost witness rather than
 * by the witness, which is where it would have cost an hour to find and looked
 * like a network problem.
 */

/** A Work's image on its shelf card. Small, and absent when none was chosen. */
export function CardVisual({ workId, title }: { workId: string; title: string }) {
  const { src } = useWorkVisual(workId);
  if (!src) return null;
  return (
    <span className="block w-[52px] h-[68px] shrink-0 overflow-hidden rounded-[2px]">
      <WorkVisualImage src={src} alt={`The image chosen for ${title}`} className="w-full h-full" />
    </span>
  );
}

/** The Work's image where a writer returns to it. */
export function HeroVisual({ workId, title }: { workId: string; title: string | null }) {
  const { src } = useWorkVisual(workId);
  if (!src) return null;
  return (
    <div className="w-[104px] md:w-[132px] shrink-0 overflow-hidden rounded-[3px]">
      <WorkVisualImage
        src={src}
        alt={`The image chosen for ${title ?? 'this work'}`}
        className="w-full h-auto"
      />
    </div>
  );
}

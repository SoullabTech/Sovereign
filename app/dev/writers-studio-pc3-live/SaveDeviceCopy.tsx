'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useStudioTopbarAccessoriesHost } from '../writers-studio-p4r1/useStudioTopbarAccessoriesHost';
import {
  prepareDeviceManuscriptCopy, type DeviceCopyFormat,
} from '@/lib/writersStudio/deviceManuscriptCopy';
import type { RebuildSection } from '@/lib/writersStudio/rebuild/model';

/** WRITER-DEVICE-COPY-01 · Explicit writer-owned download. Never uploads. */
export default function SaveDeviceCopy({
  manuscriptId, title, workTitle, version, sections, latestBody, hasUnsavedWork,
}: {
  manuscriptId: string;
  title: string | null;
  workTitle: string | null;
  version: number;
  sections: readonly RebuildSection[];
  latestBody: (sectionId: string) => string;
  hasUnsavedWork: () => boolean;
}) {
  const topbarHost = useStudioTopbarAccessoriesHost();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('');
  useEffect(() => { setOpen(false); setStatus(''); }, [manuscriptId]);

  const download = (format: DeviceCopyFormat) => {
    try {
      const unsaved = hasUnsavedWork();
      const copy = prepareDeviceManuscriptCopy({
        manuscriptId, title, workTitle, version, sections,
        latestBody, unsavedInStudio: unsaved, exportedAt: new Date().toISOString(),
      }, format);
      const blob = new Blob([copy.contents], { type: copy.mime });
      const url = URL.createObjectURL(blob);
      try {
        const a = document.createElement('a');
        a.href = url;
        a.download = copy.filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        try { a.click(); } finally { a.remove(); }
        // Safari/Chrome may still be reading the object URL after click().
        window.setTimeout(() => URL.revokeObjectURL(url), 10000);
      } catch (error) {
        URL.revokeObjectURL(url);
        throw error;
      }
      setOpen(false);
      setStatus(
        `Download requested: ${copy.filename}. Verify it appears on your device.`
        + (unsaved ? ' This copy includes local changes that Studio may still be saving.' : ''),
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'The download could not be prepared. Nothing was changed.');
    }
  };

  if (!topbarHost) return null;
  return createPortal(
    <div className="p4r1-device-copy" data-device-copy>
      <button type="button" className="p4r1-device-copy-trigger"
        aria-expanded={open} aria-controls="p4r1-device-copy-menu"
        onClick={() => setOpen(value => !value)}>
        Save a copy
      </button>
      {open ? <section id="p4r1-device-copy-menu" className="p4r1-device-copy-menu"
        aria-label="Save the complete manuscript to your device">
        <strong>Keep your writing</strong>
        <p>Download your complete current manuscript. Your browser chooses the download location; you can move the file into your own Drive, iCloud, or other synced folder afterward.</p>
        <button type="button" onClick={() => download('txt')}>Plain text · .txt <small>Exact section text, editable anywhere</small></button>
        <button type="button" onClick={() => download('md')}>Markdown · .md <small>Editable text with headings</small></button>
        <button type="button" onClick={() => download('json')}>Section archive · .json <small>Exact structure for safekeeping; Studio re-import not certified</small></button>
        <p>Manuscript only. MAIA conversations, source files, and Listen recordings are separate. Your browser decides where downloads are saved.</p>
      </section> : null}
      {status ? <span className="p4r1-device-copy-status" role="status">{status}</span> : null}
    </div>,
    topbarHost,
  );
}

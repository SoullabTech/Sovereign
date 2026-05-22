'use client';

/**
 * UploadDropzone — file intake.
 *
 * Drag a file in, or click to pick. Slice 1 accepts .txt/.md/.docx and
 * text-extractable PDFs. Image and scanned-PDF uploads get a clear
 * "OCR not yet wired (Slice 2)" error from the server.
 */

import { useRef, useState } from 'react';

interface UploadDropzoneProps {
  onUploaded: () => void;
  setStatus: (s: string) => void;
}

const ACCEPTED = '.txt,.md,.docx,.pdf';

export function UploadDropzone({ onUploaded, setStatus }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    setStatus(`Uploading ${file.name}…`);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/book-studio/workbench/uploads', {
        method: 'POST',
        body: form,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setStatus(`Upload failed: ${err.error ?? res.statusText}`);
        return;
      }
      const data = await res.json();
      const statusLine = data.transcriptionStatus === 'reviewed'
        ? `Uploaded "${file.name}" — indexed.`
        : `Uploaded "${file.name}" — draft, needs review before indexing.`;
      setStatus(statusLine);
      onUploaded();
    } catch (e) {
      setStatus(`Upload error: ${e instanceof Error ? e.message : 'unknown'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    // Slice 1: one file at a time (multi-file batching waits for lived contact)
    void upload(files[0]);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      className={[
        'border border-dashed rounded px-6 py-4 cursor-pointer transition-colors',
        'flex items-center justify-between gap-4',
        dragOver
          ? 'border-amber-200/40 bg-amber-200/[0.05]'
          : 'border-amber-200/15 hover:border-amber-200/25 bg-amber-200/[0.015]',
      ].join(' ')}
    >
      <div>
        <div className="text-amber-100/80 text-sm font-light">
          {uploading ? 'Uploading…' : 'Drop a file or click to upload'}
        </div>
        <div className="text-amber-200/35 text-xs font-light italic mt-1">
          .txt · .md · .docx · text-extractable .pdf — Slice 1
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
      <div className="text-amber-200/35 text-[10px] tracking-[0.25em] uppercase">
        Upload
      </div>
    </div>
  );
}

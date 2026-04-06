'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, X, Loader2, CheckCircle } from 'lucide-react';
import { ALL_ACCEPTED_MIMES, detectMediaType, CHUNK_SIZE, DEFAULT_MAX_UPLOAD_BYTES } from '@/lib/media/types';

interface MediaUploadFlowProps {
  onProjectCreated: (projectId: string) => void;
  onClose: () => void;
}

type Step = 'select' | 'metadata' | 'uploading' | 'done';

export function MediaUploadFlow({ onProjectCreated, onClose }: MediaUploadFlowProps) {
  const [step, setStep] = useState<Step>('select');
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [containsSensitive, setContainsSensitive] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(true);
  const [externalEditing, setExternalEditing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [projectId, setProjectId] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) selectFile(droppedFile);
  }, []);

  const selectFile = (f: File) => {
    if (f.size > DEFAULT_MAX_UPLOAD_BYTES) {
      setError(`File too large. Maximum: ${Math.round(DEFAULT_MAX_UPLOAD_BYTES / 1024 / 1024)}MB`);
      return;
    }
    if (!(ALL_ACCEPTED_MIMES as readonly string[]).includes(f.type)) {
      setError(`Unsupported file type: ${f.type}`);
      return;
    }
    setFile(f);
    setTitle(f.name.replace(/\.[^.]+$/, ''));
    setError('');
    setStep('metadata');
  };

  const handleUpload = async () => {
    if (!file) return;
    setStep('uploading');
    setError('');

    try {
      // 1. Create project
      const mediaType = detectMediaType(file.type) || 'audio';
      const createRes = await fetch('/api/media/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: description || undefined,
          mediaType,
          containsSensitiveContent: containsSensitive,
          aiProcessingAllowed: aiProcessing,
          externalEditingAllowed: externalEditing,
        }),
      });

      if (!createRes.ok) {
        throw new Error('Failed to create project');
      }

      const { data: project } = await createRes.json();
      setProjectId(project.id);

      // 2. Upload file
      if (file.size > CHUNK_SIZE * 10) {
        // Chunked upload for files > 100MB
        await uploadChunked(project.id, file);
      } else {
        // Single upload
        const formData = new FormData();
        formData.append('file', file);

        const uploadRes = await fetch(`/api/media/projects/${project.id}/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          const err = await uploadRes.json();
          throw new Error(err.error || 'Upload failed');
        }
      }

      setUploadProgress(100);
      setStep('done');
      onProjectCreated(project.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setStep('metadata');
    }
  };

  const uploadChunked = async (pid: string, f: File) => {
    const totalChunks = Math.ceil(f.size / CHUNK_SIZE);
    const uploadId = crypto.randomUUID();

    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, f.size);
      const chunk = f.slice(start, end);
      const buffer = await chunk.arrayBuffer();

      const res = await fetch(`/api/media/projects/${pid}/upload-chunk`, {
        method: 'POST',
        headers: {
          'x-chunk-index': String(i),
          'x-total-chunks': String(totalChunks),
          'x-upload-id': uploadId,
          'x-filename': f.name,
          'x-total-size': String(f.size),
        },
        body: buffer,
      });

      if (!res.ok) throw new Error('Chunk upload failed');
      setUploadProgress(Math.round(((i + 1) / totalChunks) * 100));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-[#12121f] border border-white/10 rounded-xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Upload Recording</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
            {error}
          </div>
        )}

        {step === 'select' && (
          <div
            onDrop={handleFileDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-white/10 rounded-lg p-12 text-center cursor-pointer hover:border-amber-500/30 transition-colors"
          >
            <Upload className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/60 text-sm">Drag and drop or click to upload</p>
            <p className="text-white/30 text-xs mt-1">MP3, WAV, M4A, MP4, MOV, WebM</p>
            <input
              ref={inputRef}
              type="file"
              accept={ALL_ACCEPTED_MIMES.join(',')}
              className="hidden"
              onChange={(e) => e.target.files?.[0] && selectFile(e.target.files[0])}
            />
          </div>
        )}

        {step === 'metadata' && file && (
          <div className="space-y-4">
            <div className="px-3 py-2 bg-white/5 rounded text-sm text-white/60">
              {file.name} ({(file.size / 1024 / 1024).toFixed(1)}MB)
            </div>

            <div>
              <label className="block text-xs text-white/40 mb-1">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#1a1a2e] border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="block text-xs text-white/40 mb-1">Description (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full bg-[#1a1a2e] border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={containsSensitive}
                  onChange={(e) => setContainsSensitive(e.target.checked)}
                  className="rounded border-white/20"
                />
                Contains sensitive content
              </label>
              <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={aiProcessing}
                  onChange={(e) => setAiProcessing(e.target.checked)}
                  className="rounded border-white/20"
                />
                Allow AI processing (transcription, summary)
              </label>
              <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={externalEditing}
                  onChange={(e) => setExternalEditing(e.target.checked)}
                  className="rounded border-white/20"
                />
                Allow external editing (Descript)
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setFile(null); setStep('select'); }}
                className="px-4 py-2 text-sm text-white/40 hover:text-white"
              >
                Back
              </button>
              <button
                onClick={handleUpload}
                disabled={!title.trim()}
                className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
              >
                Upload & Process
              </button>
            </div>
          </div>
        )}

        {step === 'uploading' && (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-3" />
            <p className="text-white/60 text-sm">Uploading... {uploadProgress}%</p>
            <div className="w-full bg-white/5 rounded-full h-2 mt-3">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="text-center py-8">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
            <p className="text-white/80 text-sm">Upload complete! Processing started.</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm rounded-lg"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

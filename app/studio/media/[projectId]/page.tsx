'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, ExternalLink } from 'lucide-react';
import { ProjectStatusBadge } from '@/components/media/ProjectStatusBadge';
import { ConsentBadges } from '@/components/media/ConsentBadges';
import { MediaJobStatus } from '@/components/media/MediaJobStatus';
import { TranscriptViewer } from '@/components/media/TranscriptViewer';
import { MediaPlayerInline } from '@/components/media/MediaPlayerInline';
import { DescriptLinkField } from '@/components/media/DescriptLinkField';
import type { MediaProjectRow, MediaAssetRow, MediaTranscriptRow, MediaJobRow, MediaIntegrationRow, MediaExportRow } from '@/lib/media/types';

type Tab = 'overview' | 'transcript' | 'assets' | 'exports' | 'integrations';

interface ProjectDetail extends MediaProjectRow {
  assets: MediaAssetRow[];
  transcript: MediaTranscriptRow | null;
  jobs: MediaJobRow[];
  integrations: MediaIntegrationRow[];
  allJobsComplete: boolean;
}

export default function MediaProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [exports, setExports] = useState<MediaExportRow[]>([]);
  const [tab, setTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);

  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/media/projects/${projectId}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const { data } = await res.json();
      setProject(data);
    } catch (err) {
      console.error('[MediaDetail] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const fetchExports = useCallback(async () => {
    try {
      const res = await fetch(`/api/media/projects/${projectId}/exports`);
      if (res.ok) {
        const { data } = await res.json();
        setExports(data);
      }
    } catch {
      // non-critical
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
    fetchExports();
  }, [fetchProject, fetchExports]);

  // Auto-poll during processing
  useEffect(() => {
    if (!project || project.allJobsComplete) return;
    const interval = setInterval(fetchProject, 3000);
    return () => clearInterval(interval);
  }, [project, fetchProject]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/5 rounded w-1/3" />
          <div className="h-64 bg-white/5 rounded" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 text-center text-white/30">
        Project not found
      </div>
    );
  }

  const originalAsset = project.assets.find(a => a.asset_type === 'original');
  const descriptIntegration = project.integrations.find(i => i.service === 'descript');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'transcript', label: 'Transcript' },
    { key: 'assets', label: `Assets (${project.assets.length})` },
    { key: 'exports', label: `Exports (${exports.length})` },
    { key: 'integrations', label: 'Integrations' },
  ];

  const handleSeek = (time: number) => {
    const seekFn = (window as unknown as Record<string, unknown>).__mediaPlayerSeek;
    if (typeof seekFn === 'function') seekFn(time);
  };

  const createExport = async (exportType: string) => {
    try {
      const res = await fetch(`/api/media/projects/${projectId}/exports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exportType }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Export failed');
        return;
      }
      fetchExports();
    } catch {
      alert('Export failed');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Link href="/studio/media" className="inline-flex items-center gap-1 text-sm text-white/30 hover:text-white mb-3">
          <ArrowLeft className="w-4 h-4" />
          Back to Media Studio
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-white">{project.title}</h1>
            {project.description && (
              <p className="text-sm text-white/40 mt-1">{project.description}</p>
            )}
          </div>
          <ProjectStatusBadge status={project.status} />
        </div>

        <ConsentBadges project={project} />

        {/* Job pipeline */}
        {project.jobs.length > 0 && !project.allJobsComplete && (
          <div className="mt-4 p-3 bg-[#1a1a2e] rounded-lg">
            <MediaJobStatus jobs={project.jobs} />
          </div>
        )}
      </div>

      {/* Player */}
      {originalAsset && (project.media_type === 'audio' || project.media_type === 'video') && (
        <div className="mb-6">
          <MediaPlayerInline
            assetId={originalAsset.id}
            projectId={projectId}
            mediaType={project.media_type as 'audio' | 'video'}
            mimeType={project.mime_type || undefined}
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-white/5 mb-6">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`pb-2 text-sm transition-colors ${
              tab === t.key
                ? 'text-amber-400 border-b-2 border-amber-400'
                : 'text-white/30 hover:text-white/60'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-[#1a1a2e] rounded-lg p-3">
              <span className="text-white/30">Type</span>
              <p className="text-white capitalize">{project.media_type}</p>
            </div>
            <div className="bg-[#1a1a2e] rounded-lg p-3">
              <span className="text-white/30">Source</span>
              <p className="text-white capitalize">{project.source}</p>
            </div>
            <div className="bg-[#1a1a2e] rounded-lg p-3">
              <span className="text-white/30">Duration</span>
              <p className="text-white">
                {project.duration_seconds
                  ? `${Math.floor(project.duration_seconds / 60)}:${Math.floor(project.duration_seconds % 60).toString().padStart(2, '0')}`
                  : 'N/A'}
              </p>
            </div>
            <div className="bg-[#1a1a2e] rounded-lg p-3">
              <span className="text-white/30">File Size</span>
              <p className="text-white">
                {project.file_size_bytes
                  ? `${(project.file_size_bytes / 1024 / 1024).toFixed(1)}MB`
                  : 'N/A'}
              </p>
            </div>
          </div>

          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {project.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-white/5 rounded text-xs text-white/40">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {project.inference_type && (
            <div className="bg-[#1a1a2e] rounded-lg p-3">
              <span className="text-white/30 text-sm">Meaning Classification</span>
              <p className="text-white text-sm capitalize mt-1">
                {project.inference_type.replace(/_/g, ' ')} — Expansion: {project.expansion_level || 'none'}
              </p>
            </div>
          )}
        </div>
      )}

      {tab === 'transcript' && (
        <div>
          {project.transcript ? (
            <TranscriptViewer transcript={project.transcript} onSeek={handleSeek} />
          ) : (
            <p className="text-white/30 text-sm text-center py-8">
              {project.status === 'processing' ? 'Transcription in progress...' : 'No transcript available'}
            </p>
          )}
        </div>
      )}

      {tab === 'assets' && (
        <div className="space-y-2">
          {project.assets.map(asset => (
            <div key={asset.id} className="flex items-center justify-between bg-[#1a1a2e] rounded-lg p-3">
              <div>
                <p className="text-sm text-white capitalize">{asset.asset_type.replace(/_/g, ' ')}</p>
                <p className="text-xs text-white/30">{asset.mime_type} — {asset.file_size_bytes ? `${(asset.file_size_bytes / 1024).toFixed(0)}KB` : ''}</p>
              </div>
              <a
                href={`/api/media/projects/${projectId}/assets/${asset.id}/serve`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/30 hover:text-white"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      )}

      {tab === 'exports' && (
        <div>
          <div className="flex flex-wrap gap-2 mb-4">
            {project.transcript && (
              <>
                <button onClick={() => createExport('transcript_txt')} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/60 text-xs rounded">
                  <Download className="w-3 h-3 inline mr-1" />Export TXT
                </button>
                <button onClick={() => createExport('transcript_srt')} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/60 text-xs rounded">
                  <Download className="w-3 h-3 inline mr-1" />Export SRT
                </button>
              </>
            )}
          </div>

          {exports.length > 0 ? (
            <div className="space-y-2">
              {exports.map(exp => (
                <div key={exp.id} className="flex items-center justify-between bg-[#1a1a2e] rounded-lg p-3">
                  <div>
                    <p className="text-sm text-white">{exp.export_type} (v{exp.version})</p>
                    <p className="text-xs text-white/30">{new Date(exp.created_at).toLocaleDateString()}</p>
                  </div>
                  <a
                    href={`/api/media/projects/${projectId}/exports/${exp.id}/download`}
                    className="text-amber-400 hover:text-amber-300 text-xs"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/30 text-sm text-center py-8">No exports yet</p>
          )}
        </div>
      )}

      {tab === 'integrations' && (
        <div className="space-y-6">
          <DescriptLinkField
            projectId={projectId}
            integration={descriptIntegration}
            onSaved={fetchProject}
          />
        </div>
      )}
    </div>
  );
}

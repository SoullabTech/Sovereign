'use client';

import { useState, useEffect, useCallback } from 'react';
import { Video, Upload, RefreshCw } from 'lucide-react';
import { MediaProjectCard } from '@/components/media/MediaProjectCard';
import { MediaFilters } from '@/components/media/MediaFilters';
import { MediaUploadFlow } from '@/components/media/MediaUploadFlow';
import type { MediaProjectRow, MediaType, ProjectStatus } from '@/lib/media/types';

export default function MediaStudioPage() {
  const [projects, setProjects] = useState<MediaProjectRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  // Filters
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<MediaType | ''>('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | ''>('');

  const fetchProjects = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (typeFilter) params.set('type', typeFilter);
      if (statusFilter) params.set('status', statusFilter);
      params.set('page', String(page));
      params.set('limit', '20');

      const res = await fetch(`/api/media/projects?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');

      const { data } = await res.json();
      setProjects(data.projects);
      setTotal(data.total);
    } catch (err) {
      console.error('[MediaStudio] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [query, typeFilter, statusFilter, page]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Auto-poll if any project is processing
  useEffect(() => {
    const hasProcessing = projects.some(p => p.status === 'processing' || p.status === 'uploading');
    if (!hasProcessing) return;

    const interval = setInterval(fetchProjects, 5000);
    return () => clearInterval(interval);
  }, [projects, fetchProjects]);

  // Debounce search
  const [searchDebounce, setSearchDebounce] = useState('');
  useEffect(() => {
    const timeout = setTimeout(() => setQuery(searchDebounce), 300);
    return () => clearTimeout(timeout);
  }, [searchDebounce]);

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            <Video className="w-5 h-5 text-amber-400/60" />
            Media Studio
          </h1>
          <p className="text-sm text-white/30 mt-0.5">
            {total} project{total !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchProjects}
            className="p-2 text-white/30 hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm rounded-lg transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload Recording
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <MediaFilters
          query={searchDebounce}
          onQueryChange={setSearchDebounce}
          typeFilter={typeFilter}
          onTypeChange={setTypeFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-[#1a1a2e] rounded-lg animate-pulse">
              <div className="aspect-video bg-white/5" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-white/5 rounded w-2/3" />
                <div className="h-3 bg-white/5 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => (
            <MediaProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Video className="w-12 h-12 text-white/10 mx-auto mb-3" />
          <p className="text-white/30 text-sm">No projects found</p>
          <button
            onClick={() => setShowUpload(true)}
            className="mt-4 text-amber-400 hover:text-amber-300 text-sm"
          >
            Upload your first recording
          </button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3 py-1 text-sm rounded ${
                p === page
                  ? 'bg-amber-600 text-white'
                  : 'text-white/30 hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Upload modal */}
      {showUpload && (
        <MediaUploadFlow
          onProjectCreated={() => {
            setShowUpload(false);
            fetchProjects();
          }}
          onClose={() => setShowUpload(false)}
        />
      )}
    </div>
  );
}

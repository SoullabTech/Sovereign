'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  Upload,
  Clock,
  ExternalLink,
  RefreshCw,
  Pencil,
  FileText,
  Circle,
} from 'lucide-react';

type FilterType = 'all' | 'descript' | 'local';

interface Project {
  id: string;
  name: string;
  source: 'descript' | 'local';
  status: 'editing' | 'draft' | 'recording' | 'complete';
  duration?: string;
  createdAt: string;
}

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'MAIA Feature Demo',
    source: 'descript',
    status: 'editing',
    duration: '12:34',
    createdAt: '2 hours ago',
  },
  {
    id: '2',
    name: 'Client Testimonial - Jane',
    source: 'descript',
    status: 'draft',
    duration: '3:45',
    createdAt: 'Yesterday',
  },
  {
    id: '3',
    name: 'Session Recording 2026-02-02',
    source: 'local',
    status: 'recording',
    createdAt: 'Today',
  },
];

const statusConfig = {
  editing: { label: 'editing', color: 'amber', icon: Pencil },
  draft: { label: 'draft', color: 'slate', icon: FileText },
  recording: { label: 'recording', color: 'red', icon: Circle },
  complete: { label: 'complete', color: 'emerald', icon: null },
};

export default function MediaPage() {
  const [projects] = useState(mockProjects);
  const [filter, setFilter] = useState<FilterType>('all');
  const [syncing, setSyncing] = useState(false);

  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true;
    return project.source === filter;
  });

  const syncDescript = async () => {
    setSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSyncing(false);
  };

  const openDescript = () => {
    window.open('descript://', '_blank');
    setTimeout(() => {
      window.open('https://web.descript.com', '_blank');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            <Video className="w-5 h-5 text-slate-400" />
            Media Studio
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {projects.length} projects
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={syncDescript}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            Sync Descript
          </button>
          <button
            onClick={openDescript}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-400 transition-colors text-sm font-medium"
          >
            Open Descript
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-6 mb-6 border-b border-slate-800/50">
        {(['all', 'descript', 'local'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`
              pb-3 text-sm font-medium transition-colors relative capitalize
              ${filter === f ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'}
            `}
          >
            {f === 'all' ? 'All' : f === 'descript' ? 'Descript' : 'Local'}
            {filter === f && (
              <motion.div
                layoutId="media-filter-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400"
              />
            )}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <AnimatePresence>
          {filteredProjects.map((project) => {
            const status = statusConfig[project.status];
            const StatusIcon = status.icon;

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#1e1e38] border border-slate-800/50 rounded-xl overflow-hidden hover:border-slate-700/50 transition-colors cursor-pointer"
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-slate-900 flex items-center justify-center relative">
                  <Video className="w-12 h-12 text-slate-700" />
                  {project.duration && (
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 text-white text-xs rounded">
                      {project.duration}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm text-white font-medium truncate flex-1">
                      {project.name}
                    </h3>
                    <span className={`
                      px-2 py-0.5 text-xs rounded-full flex items-center gap-1 flex-shrink-0
                      ${status.color === 'amber' ? 'bg-amber-500/20 text-amber-400' : ''}
                      ${status.color === 'slate' ? 'bg-slate-700 text-slate-400' : ''}
                      ${status.color === 'red' ? 'bg-red-500/20 text-red-400' : ''}
                      ${status.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' : ''}
                    `}>
                      {StatusIcon && <StatusIcon className={`w-3 h-3 ${status.color === 'red' ? 'animate-pulse' : ''}`} />}
                      {status.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                    <span className="capitalize">{project.source}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {project.createdAt}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Upload */}
      <div className="flex justify-center">
        <button className="flex flex-col items-center gap-2 p-6 text-slate-500 hover:text-slate-400 transition-colors">
          <Upload className="w-6 h-6" />
          <span className="text-sm">Upload Recording</span>
        </button>
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <div className="text-lg">No projects found</div>
        </div>
      )}
    </div>
  );
}

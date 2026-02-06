'use client';

/**
 * MODEL STUDIO - Media Studio Page
 *
 * Demo media creation and management
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MonitorPlay,
  Plus,
  Video,
  Mic,
  Image,
  FileText,
  Play,
  Pause,
  Clock,
  Eye,
  Download,
  Share2,
  Trash2,
  Upload,
  Sparkles,
  Wand2,
} from 'lucide-react';

const demoMedia = [
  {
    id: '1',
    title: 'Introduction to Mindfulness',
    type: 'video',
    duration: '8:45',
    views: 156,
    status: 'published',
    thumbnail: '🧘',
    createdAt: '2 weeks ago',
  },
  {
    id: '2',
    title: 'Breathing Exercise Guide',
    type: 'video',
    duration: '5:30',
    views: 89,
    status: 'published',
    thumbnail: '💨',
    createdAt: '1 month ago',
  },
  {
    id: '3',
    title: 'Anxiety Management Tips',
    type: 'video',
    duration: '12:20',
    views: 234,
    status: 'published',
    thumbnail: '🌊',
    createdAt: '1 month ago',
  },
  {
    id: '4',
    title: 'Sleep Meditation',
    type: 'audio',
    duration: '15:00',
    views: 312,
    status: 'published',
    thumbnail: '🌙',
    createdAt: '3 weeks ago',
  },
  {
    id: '5',
    title: 'Progressive Muscle Relaxation',
    type: 'audio',
    duration: '10:15',
    views: 178,
    status: 'draft',
    thumbnail: '💪',
    createdAt: '1 week ago',
  },
  {
    id: '6',
    title: 'Grounding Techniques Infographic',
    type: 'image',
    duration: null,
    views: 445,
    status: 'published',
    thumbnail: '🌳',
    createdAt: '2 months ago',
  },
];

const typeIcons = {
  video: Video,
  audio: Mic,
  image: Image,
  document: FileText,
};

const statusColors = {
  published: 'bg-emerald-500/20 text-emerald-400',
  draft: 'bg-amber-500/20 text-amber-400',
  processing: 'bg-blue-500/20 text-blue-400',
};

export default function ModelMediaPage() {
  const [filter, setFilter] = useState<'all' | 'video' | 'audio' | 'image'>('all');

  const filteredMedia = demoMedia.filter(m => filter === 'all' || m.type === filter);
  const totalViews = demoMedia.reduce((sum, m) => sum + m.views, 0);

  return (
    <div className="min-h-screen bg-[#1a1a2e] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 rounded-xl">
            <MonitorPlay className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Media Studio</h1>
            <p className="text-slate-500 mt-1">Create and manage client resources</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-400 transition-colors">
          <Plus className="w-4 h-4" />
          Create New
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-4">
          <MonitorPlay className="w-5 h-5 text-blue-400 mb-2" />
          <div className="text-2xl font-bold text-white">{demoMedia.length}</div>
          <div className="text-sm text-slate-400">Total Media</div>
        </div>
        <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-4">
          <Video className="w-5 h-5 text-emerald-400 mb-2" />
          <div className="text-2xl font-bold text-white">{demoMedia.filter(m => m.type === 'video').length}</div>
          <div className="text-sm text-slate-400">Videos</div>
        </div>
        <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-4">
          <Eye className="w-5 h-5 text-amber-400 mb-2" />
          <div className="text-2xl font-bold text-white">{totalViews}</div>
          <div className="text-sm text-slate-400">Total Views</div>
        </div>
        <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-4">
          <Clock className="w-5 h-5 text-violet-400 mb-2" />
          <div className="text-2xl font-bold text-white">52m</div>
          <div className="text-sm text-slate-400">Total Duration</div>
        </div>
      </div>

      {/* Quick Create */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <motion.button
          whileHover={{ scale: 1.02 }}
          className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-5 text-left hover:border-amber-500/30 transition-all"
        >
          <Video className="w-6 h-6 text-blue-400 mb-3" />
          <h3 className="font-medium text-white mb-1">Record Video</h3>
          <p className="text-xs text-slate-400">Create educational content</p>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-5 text-left hover:border-amber-500/30 transition-all"
        >
          <Mic className="w-6 h-6 text-emerald-400 mb-3" />
          <h3 className="font-medium text-white mb-1">Record Audio</h3>
          <p className="text-xs text-slate-400">Guided meditations & podcasts</p>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-5 text-left hover:border-amber-500/30 transition-all"
        >
          <Upload className="w-6 h-6 text-amber-400 mb-3" />
          <h3 className="font-medium text-white mb-1">Upload Media</h3>
          <p className="text-xs text-slate-400">Import existing files</p>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 rounded-xl p-5 text-left hover:border-violet-500/50 transition-all"
        >
          <Wand2 className="w-6 h-6 text-violet-400 mb-3" />
          <h3 className="font-medium text-white mb-1">AI Generate</h3>
          <p className="text-xs text-slate-400">Create with MAIA</p>
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex bg-[#1e1e38] border border-slate-700 rounded-lg p-1">
          {(['all', 'video', 'audio', 'image'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded text-sm capitalize transition-colors ${
                filter === f ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-3 gap-4">
        {filteredMedia.map((item) => {
          const TypeIcon = typeIcons[item.type as keyof typeof typeIcons];
          return (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.02 }}
              className="bg-[#1e1e38] border border-slate-800/50 rounded-xl overflow-hidden group"
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-slate-800/50 flex items-center justify-center relative">
                <span className="text-6xl">{item.thumbnail}</span>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="p-3 bg-amber-500 rounded-full text-white">
                    <Play className="w-6 h-6" />
                  </button>
                </div>
                {item.duration && (
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 rounded text-xs text-white">
                    {item.duration}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TypeIcon className="w-4 h-4 text-slate-500" />
                    <h3 className="font-medium text-white truncate">{item.title}</h3>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded ${statusColors[item.status as keyof typeof statusColors]}`}>
                    {item.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {item.views} views
                  </span>
                  <span>{item.createdAt}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-800/50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 text-slate-400 hover:text-white rounded transition-colors">
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-white rounded transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                  <button className="p-1.5 text-slate-400 hover:text-red-400 rounded transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

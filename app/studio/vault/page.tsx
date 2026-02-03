'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  Folder,
  File,
  FileText,
  Image,
  Video,
  Music,
  Plus,
  Search,
  Upload,
  Download,
  Trash2,
  Share2,
  Eye,
  EyeOff,
  ChevronRight,
  MoreHorizontal,
  Shield,
  Key,
} from 'lucide-react';

interface VaultItem {
  id: string;
  name: string;
  type: 'folder' | 'document' | 'image' | 'video' | 'audio' | 'file';
  size?: string;
  modifiedAt: string;
  encrypted: boolean;
  shared?: boolean;
  sharedWith?: string[];
  path: string[];
}

const mockItems: VaultItem[] = [
  {
    id: '1',
    name: 'Client Agreements',
    type: 'folder',
    modifiedAt: '2 days ago',
    encrypted: true,
    path: [],
  },
  {
    id: '2',
    name: 'Strategy Documents',
    type: 'folder',
    modifiedAt: '1 week ago',
    encrypted: true,
    path: [],
  },
  {
    id: '3',
    name: 'Q1 Business Plan.pdf',
    type: 'document',
    size: '2.4 MB',
    modifiedAt: '3 days ago',
    encrypted: true,
    path: [],
  },
  {
    id: '4',
    name: 'MAIA Architecture Diagram.png',
    type: 'image',
    size: '1.2 MB',
    modifiedAt: '1 week ago',
    encrypted: false,
    shared: true,
    sharedWith: ['Sarah Chen'],
    path: [],
  },
  {
    id: '5',
    name: 'Session Recording - Marcus.mp4',
    type: 'video',
    size: '156 MB',
    modifiedAt: '2 weeks ago',
    encrypted: true,
    path: [],
  },
  {
    id: '6',
    name: 'API Keys & Credentials.txt',
    type: 'file',
    size: '1 KB',
    modifiedAt: '1 month ago',
    encrypted: true,
    path: [],
  },
];

const typeConfig = {
  folder: { icon: Folder, color: 'amber' },
  document: { icon: FileText, color: 'blue' },
  image: { icon: Image, color: 'emerald' },
  video: { icon: Video, color: 'purple' },
  audio: { icon: Music, color: 'pink' },
  file: { icon: File, color: 'slate' },
};

export default function VaultPage() {
  const [items] = useState(mockItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPath, setCurrentPath] = useState<string[]>([]);

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const folders = filteredItems.filter(i => i.type === 'folder');
  const files = filteredItems.filter(i => i.type !== 'folder');
  const encryptedCount = items.filter(i => i.encrypted).length;

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Lock className="w-7 h-7 text-emerald-400" />
            Vault
          </h1>
          <p className="text-slate-400 mt-1">
            {encryptedCount} encrypted items
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors">
            <Upload className="w-4 h-4" />
            Upload
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-400 transition-colors">
            <Plus className="w-4 h-4" />
            New Folder
          </button>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
        <Shield className="w-5 h-5 text-emerald-400" />
        <div className="text-sm text-emerald-400">
          All files in the Vault are stored locally on your machine. Encrypted items use AES-256 encryption.
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4 text-sm">
        <button
          onClick={() => setCurrentPath([])}
          className="text-slate-400 hover:text-white transition-colors"
        >
          Vault
        </button>
        {currentPath.map((folder, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-slate-600" />
            <button
              onClick={() => setCurrentPath(currentPath.slice(0, idx + 1))}
              className="text-slate-400 hover:text-white transition-colors"
            >
              {folder}
            </button>
          </div>
        ))}
      </div>

      {/* Search and View Toggle */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vault..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/50"
          />
        </div>

        <div className="flex items-center bg-slate-800 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded text-sm transition-colors ${
              viewMode === 'grid' ? 'bg-teal-500/20 text-teal-400' : 'text-slate-400'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded text-sm transition-colors ${
              viewMode === 'list' ? 'bg-teal-500/20 text-teal-400' : 'text-slate-400'
            }`}
          >
            List
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="space-y-6">
          {/* Folders */}
          {folders.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-slate-500 mb-3">Folders</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {folders.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPath([...currentPath, item.name])}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors group text-left"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Folder className="w-10 h-10 text-amber-400" />
                      {item.encrypted && (
                        <Lock className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                    <div className="text-sm text-white font-medium truncate">{item.name}</div>
                    <div className="text-xs text-slate-500 mt-1">{item.modifiedAt}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Files */}
          {files.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-slate-500 mb-3">Files</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {files.map((item) => {
                  const config = typeConfig[item.type];
                  const ItemIcon = config.icon;

                  return (
                    <div
                      key={item.id}
                      className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className={`
                          w-10 h-10 rounded-lg flex items-center justify-center
                          ${config.color === 'blue' ? 'bg-blue-500/20' : ''}
                          ${config.color === 'emerald' ? 'bg-emerald-500/20' : ''}
                          ${config.color === 'purple' ? 'bg-purple-500/20' : ''}
                          ${config.color === 'pink' ? 'bg-pink-500/20' : ''}
                          ${config.color === 'slate' ? 'bg-slate-800' : ''}
                        `}>
                          <ItemIcon className={`w-5 h-5
                            ${config.color === 'blue' ? 'text-blue-400' : ''}
                            ${config.color === 'emerald' ? 'text-emerald-400' : ''}
                            ${config.color === 'purple' ? 'text-purple-400' : ''}
                            ${config.color === 'pink' ? 'text-pink-400' : ''}
                            ${config.color === 'slate' ? 'text-slate-400' : ''}
                          `} />
                        </div>
                        <div className="flex items-center gap-1">
                          {item.encrypted && (
                            <Lock className="w-3.5 h-3.5 text-emerald-400" />
                          )}
                          {item.shared && (
                            <Share2 className="w-3.5 h-3.5 text-blue-400" />
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-white font-medium truncate">{item.name}</div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-slate-500">{item.size}</span>
                        <span className="text-xs text-slate-500">{item.modifiedAt}</span>
                      </div>

                      {/* Hover Actions */}
                      <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors">
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* List View */
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Size</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Modified</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Security</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredItems.map((item) => {
                const config = typeConfig[item.type];
                const ItemIcon = config.icon;

                return (
                  <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ItemIcon className={`w-5 h-5
                          ${item.type === 'folder' ? 'text-amber-400' : ''}
                          ${config.color === 'blue' ? 'text-blue-400' : ''}
                          ${config.color === 'emerald' ? 'text-emerald-400' : ''}
                          ${config.color === 'purple' ? 'text-purple-400' : ''}
                          ${config.color === 'pink' ? 'text-pink-400' : ''}
                          ${config.color === 'slate' ? 'text-slate-400' : ''}
                        `} />
                        <span className="text-sm text-white">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {item.size || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {item.modifiedAt}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {item.encrypted && (
                          <span className="flex items-center gap-1 text-xs text-emerald-400">
                            <Lock className="w-3 h-3" />
                            Encrypted
                          </span>
                        )}
                        {item.shared && (
                          <span className="flex items-center gap-1 text-xs text-blue-400">
                            <Share2 className="w-3 h-3" />
                            Shared
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {filteredItems.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <Lock className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <div className="text-lg">Vault is empty</div>
          <div className="text-sm mt-1">Upload files to secure them</div>
        </div>
      )}
    </div>
  );
}

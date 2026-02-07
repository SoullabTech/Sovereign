'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  ChevronRight,
  MoreHorizontal,
  Shield,
  X,
  Loader2,
  Copy,
  Check,
  Link2,
  FileSpreadsheet,
  Archive,
} from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';

interface VaultFile {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  folderPath: string[];
  fileType: string;
  encrypted: boolean;
  description: string | null;
  tags: string[];
  status: string;
  shareCount: number;
  createdAt: string;
  updatedAt: string;
}

interface VaultFolder {
  id: string;
  name: string;
  parentPath: string[];
  color: string;
  encrypted: boolean;
  createdAt: string;
}

interface VaultStats {
  totalFiles: number;
  totalSize: number;
  encryptedCount: number;
}

const typeConfig: Record<string, { icon: React.ComponentType<{ className?: string }>, color: string }> = {
  folder: { icon: Folder, color: 'amber' },
  document: { icon: FileText, color: 'blue' },
  image: { icon: Image, color: 'emerald' },
  video: { icon: Video, color: 'purple' },
  audio: { icon: Music, color: 'pink' },
  spreadsheet: { icon: FileSpreadsheet, color: 'green' },
  archive: { icon: Archive, color: 'orange' },
  file: { icon: File, color: 'slate' },
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
}

export default function VaultPage() {
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [folders, setFolders] = useState<VaultFolder[]>([]);
  const [stats, setStats] = useState<VaultStats>({ totalFiles: 0, totalSize: 0, encryptedCount: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<VaultFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = useCallback(async () => {
    try {
      const pathStr = currentPath.join('/');
      const res = await apiFetch(`/api/studio/files?path=${encodeURIComponent(pathStr)}&search=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error('Failed to fetch files');
      const data = await res.json();
      setFiles(data.files || []);
      setFolders(data.folders || []);
      setStats(data.stats || { totalFiles: 0, totalSize: 0, encryptedCount: 0 });
    } catch (err) {
      console.error('Error fetching files:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPath, searchQuery]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadFiles = e.target.files;
    if (!uploadFiles || uploadFiles.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(uploadFiles)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folderPath', currentPath.join('/'));

        const res = await apiFetch('/api/studio/files', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Upload failed');
        }
      }
      await fetchFiles();
      setShowUploadModal(false);
    } catch (err) {
      console.error('Upload error:', err);
      alert(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const res = await apiFetch('/api/studio/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createFolder',
          name: newFolderName.trim(),
          parentPath: currentPath,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create folder');
      }

      await fetchFiles();
      setShowNewFolderModal(false);
      setNewFolderName('');
    } catch (err) {
      console.error('Create folder error:', err);
      alert(err instanceof Error ? err.message : 'Failed to create folder');
    }
  };

  const handleDownload = async (file: VaultFile) => {
    try {
      const res = await apiFetch(`/api/studio/files/${file.id}`);
      if (!res.ok) throw new Error('Download failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.originalName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download file');
    }
  };

  const handleShare = async (file: VaultFile) => {
    setSelectedFile(file);
    setShareUrl(null);
    setShowShareModal(true);

    try {
      const res = await apiFetch(`/api/studio/files/${file.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareType: 'download' }),
      });

      if (!res.ok) throw new Error('Failed to create share link');
      const data = await res.json();
      setShareUrl(data.share.shareUrl);
    } catch (err) {
      console.error('Share error:', err);
    }
  };

  const handleDelete = async (file: VaultFile) => {
    if (!confirm(`Delete "${file.name}"? This will move it to trash.`)) return;

    try {
      const res = await apiFetch(`/api/studio/files?id=${file.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Delete failed');
      await fetchFiles();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete file');
    }
  };

  const handleCopyShareUrl = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredFiles = files.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFolders = folders.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            {stats.totalFiles} files • {formatBytes(stats.totalSize)} • {stats.encryptedCount} encrypted
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload
          </button>
          <button
            onClick={() => setShowNewFolderModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-400 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Folder
          </button>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
        <Shield className="w-5 h-5 text-emerald-400" />
        <div className="text-sm text-emerald-400">
          All files in the Vault are stored securely on your self-hosted server.
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

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
        </div>
      ) : viewMode === 'grid' ? (
        <div className="space-y-6">
          {/* Folders */}
          {filteredFolders.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-slate-500 mb-3">Folders</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {filteredFolders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => setCurrentPath([...currentPath, folder.name])}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors group text-left"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Folder className="w-10 h-10 text-amber-400" />
                      {folder.encrypted && (
                        <Lock className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                    <div className="text-sm text-white font-medium truncate">{folder.name}</div>
                    <div className="text-xs text-slate-500 mt-1">{formatDate(folder.createdAt)}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Files */}
          {filteredFiles.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-slate-500 mb-3">Files</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {filteredFiles.map((file) => {
                  const config = typeConfig[file.fileType] || typeConfig.file;
                  const ItemIcon = config.icon;

                  return (
                    <div
                      key={file.id}
                      className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className={`
                          w-10 h-10 rounded-lg flex items-center justify-center
                          ${config.color === 'blue' ? 'bg-blue-500/20' : ''}
                          ${config.color === 'emerald' ? 'bg-emerald-500/20' : ''}
                          ${config.color === 'purple' ? 'bg-purple-500/20' : ''}
                          ${config.color === 'pink' ? 'bg-pink-500/20' : ''}
                          ${config.color === 'green' ? 'bg-green-500/20' : ''}
                          ${config.color === 'orange' ? 'bg-orange-500/20' : ''}
                          ${config.color === 'slate' ? 'bg-slate-800' : ''}
                        `}>
                          <ItemIcon className={`w-5 h-5
                            ${config.color === 'blue' ? 'text-blue-400' : ''}
                            ${config.color === 'emerald' ? 'text-emerald-400' : ''}
                            ${config.color === 'purple' ? 'text-purple-400' : ''}
                            ${config.color === 'pink' ? 'text-pink-400' : ''}
                            ${config.color === 'green' ? 'text-green-400' : ''}
                            ${config.color === 'orange' ? 'text-orange-400' : ''}
                            ${config.color === 'slate' ? 'text-slate-400' : ''}
                          `} />
                        </div>
                        <div className="flex items-center gap-1">
                          {file.encrypted && (
                            <Lock className="w-3.5 h-3.5 text-emerald-400" />
                          )}
                          {file.shareCount > 0 && (
                            <Share2 className="w-3.5 h-3.5 text-blue-400" />
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-white font-medium truncate" title={file.originalName}>
                        {file.name}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-slate-500">{formatBytes(file.sizeBytes)}</span>
                        <span className="text-xs text-slate-500">{formatDate(file.createdAt)}</span>
                      </div>

                      {/* Hover Actions */}
                      <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleDownload(file)}
                          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleShare(file)}
                          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors"
                          title="Share"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(file)}
                          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors"
                          title="Delete"
                        >
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
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredFolders.map((folder) => (
                <tr
                  key={folder.id}
                  onClick={() => setCurrentPath([...currentPath, folder.name])}
                  className="hover:bg-slate-800/50 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Folder className="w-5 h-5 text-amber-400" />
                      <span className="text-sm text-white">{folder.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400">—</td>
                  <td className="px-4 py-3 text-sm text-slate-400">{formatDate(folder.createdAt)}</td>
                  <td className="px-4 py-3">
                    {folder.encrypted && (
                      <span className="flex items-center gap-1 text-xs text-emerald-400">
                        <Lock className="w-3 h-3" />
                        Encrypted
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3"></td>
                </tr>
              ))}
              {filteredFiles.map((file) => {
                const config = typeConfig[file.fileType] || typeConfig.file;
                const ItemIcon = config.icon;

                return (
                  <tr key={file.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ItemIcon className={`w-5 h-5
                          ${config.color === 'blue' ? 'text-blue-400' : ''}
                          ${config.color === 'emerald' ? 'text-emerald-400' : ''}
                          ${config.color === 'purple' ? 'text-purple-400' : ''}
                          ${config.color === 'pink' ? 'text-pink-400' : ''}
                          ${config.color === 'green' ? 'text-green-400' : ''}
                          ${config.color === 'orange' ? 'text-orange-400' : ''}
                          ${config.color === 'slate' ? 'text-slate-400' : ''}
                        `} />
                        <span className="text-sm text-white">{file.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">{formatBytes(file.sizeBytes)}</td>
                    <td className="px-4 py-3 text-sm text-slate-400">{formatDate(file.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {file.encrypted && (
                          <span className="flex items-center gap-1 text-xs text-emerald-400">
                            <Lock className="w-3 h-3" />
                            Encrypted
                          </span>
                        )}
                        {file.shareCount > 0 && (
                          <span className="flex items-center gap-1 text-xs text-blue-400">
                            <Share2 className="w-3 h-3" />
                            Shared
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleDownload(file)}
                          className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleShare(file)}
                          className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 transition-colors"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(file)}
                          className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {filteredFiles.length === 0 && filteredFolders.length === 0 && !loading && (
        <div className="text-center py-12 text-slate-500">
          <Lock className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <div className="text-lg">Vault is empty</div>
          <div className="text-sm mt-1">Upload files to secure them</div>
        </div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            onClick={() => !uploading && setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md mx-4 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Upload className="w-5 h-5 text-teal-400" />
                  Upload Files
                </h3>
                <button
                  onClick={() => !uploading && setShowUploadModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  {uploading ? (
                    <Loader2 className="w-12 h-12 mx-auto mb-3 text-teal-400 animate-spin" />
                  ) : (
                    <Upload className="w-12 h-12 mx-auto mb-3 text-slate-500" />
                  )}
                  <p className="text-slate-300">
                    {uploading ? 'Uploading...' : 'Click to select files'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Max 100MB per file</p>
                </label>
              </div>

              {currentPath.length > 0 && (
                <p className="text-xs text-slate-500 mt-3">
                  Uploading to: /{currentPath.join('/')}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Folder Modal */}
      <AnimatePresence>
        {showNewFolderModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            onClick={() => setShowNewFolderModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md mx-4 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Folder className="w-5 h-5 text-amber-400" />
                  New Folder
                </h3>
                <button
                  onClick={() => setShowNewFolderModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/50"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              />

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setShowNewFolderModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFolder}
                  disabled={!newFolderName.trim()}
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-400 transition-colors disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && selectedFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md mx-4 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-blue-400" />
                  Share File
                </h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-slate-300 mb-4 truncate">{selectedFile.originalName}</p>

              {shareUrl ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 bg-slate-800 rounded-lg">
                    <Link2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="text-sm text-slate-300 truncate flex-1">{shareUrl}</span>
                    <button
                      onClick={handleCopyShareUrl}
                      className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 transition-colors"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">
                    Anyone with this link can download the file.
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-6 h-6 text-teal-400 animate-spin" />
                </div>
              )}

              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

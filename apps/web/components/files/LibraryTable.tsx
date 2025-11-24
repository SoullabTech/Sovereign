'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  FileText, 
  Trash2, 
  RefreshCw, 
  Download,
  Eye,
  Quote,
  Calendar,
  Database,
  Filter,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Tag
} from 'lucide-react';
import { LibraryStatusBadge, StatusIndicator, type FileStatus } from './LibraryStatusBadge';
import { toast } from 'react-hot-toast';

interface LibraryFile {
  fileId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  category: string;
  tags: string[];
  status: FileStatus;
  mayaSummary?: string;
  citationCount: number;
  lastAccessed?: string;
  uploadedAt: string;
  processedAt?: string;
  updatedAt: string;
}

interface LibraryTableProps {
  className?: string;
  onFileSelect?: (file: LibraryFile) => void;
  onRefresh?: () => void;
}

export function LibraryTable({ className = '', onFileSelect, onRefresh }: LibraryTableProps) {
  const [files, setFiles] = useState<LibraryFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<FileStatus | ''>('');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  
  useEffect(() => {
    fetchFiles();
    
    // Poll for status updates every 5 seconds
    const interval = setInterval(fetchFiles, 5000);
    return () => clearInterval(interval);
  }, []);
  
  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/oracle/files/library');
      if (!response.ok) throw new Error('Failed to fetch files');
      
      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to load library');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteFile = async (fileId: string, filename: string) => {
    if (!confirm(`Remove "${filename}" from Maya&apos;s memory?`)) return;
    
    try {
      const response = await fetch(`/api/oracle/files/${fileId}/delete`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete file');
      
      setFiles(prev => prev.filter(f => f.fileId !== fileId));
      setSelectedFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
      
      toast.success(`"${filename}" removed from library`);
      onRefresh?.();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };
  
  const handleBulkDelete = async () => {
    const selectedArray = Array.from(selectedFiles);
    if (selectedArray.length === 0) return;
    
    if (!confirm(`Remove ${selectedArray.length} files from Maya&apos;s memory?`)) return;
    
    setBulkDeleting(true);
    try {
      const response = await fetch('/api/oracle/files/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileIds: selectedArray })
      });
      
      if (!response.ok) throw new Error('Bulk delete failed');
      
      const result = await response.json();
      
      setFiles(prev => prev.filter(f => !selectedArray.includes(f.fileId)));
      setSelectedFiles(new Set());
      
      toast.success(`Removed ${result.deleted} files from library`);
      if (result.failed > 0) {
        toast.error(`Failed to delete ${result.failed} files`);
      }
      
      onRefresh?.();
    } catch (error) {
      console.error('Error bulk deleting:', error);
      toast.error('Failed to delete files');
    } finally {
      setBulkDeleting(false);
    }
  };
  
  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };
  
  const toggleSelectAll = () => {
    if (selectedFiles.size === filteredFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(filteredFiles.map(f => f.fileId)));
    }
  };
  
  const toggleExpanded = (fileId: string) => {
    setExpandedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };
  
  const filteredFiles = files.filter(file => {
    const matchesSearch = searchTerm === '' || 
      file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.mayaSummary?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === '' || file.category === categoryFilter;
    const matchesStatus = statusFilter === '' || file.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
  
  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getFileIcon = (mimeType: string) => {
    const iconMap: Record<string, string> = {
      'application/pdf': 'text-red-400',
      'text/plain': 'text-blue-400',
      'text/markdown': 'text-green-400',
      'application/json': 'text-yellow-400',
      'text/csv': 'text-amber-400'
    };
    return iconMap[mimeType] || 'text-gray-400';
  };
  
  if (loading) {
    return (
      <div className={`flex items-center justify-center p-12 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sacred-gold"></div>
      </div>
    );
  }
  
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search files and Maya's reflections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-md text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-sacred-gold/50"
          />
        </div>
        
        {/* Filters */}
        <div className="flex gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-md text-sm text-gray-300 focus:outline-none focus:border-sacred-gold/50"
          >
            <option value="">All Categories</option>
            <option value="journal">Journal</option>
            <option value="reference">Reference</option>
            <option value="wisdom">Wisdom</option>
            <option value="personal">Personal</option>
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as FileStatus | '')}
            className="px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-md text-sm text-gray-300 focus:outline-none focus:border-sacred-gold/50"
          >
            <option value="">All Status</option>
            <option value="processing">Processing</option>
            <option value="ready">Ready</option>
            <option value="failed">Failed</option>
          </select>
          
          <button
            onClick={fetchFiles}
            className="px-3 py-2 bg-sacred-gold/20 text-sacred-gold rounded-md hover:bg-sacred-gold/30 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Bulk Actions */}
      {selectedFiles.size > 0 && (
        <div className="flex items-center justify-between p-3 bg-sacred-gold/10 border border-sacred-gold/30 rounded-lg">
          <span className="text-sm text-sacred-gold">
            {selectedFiles.size} files selected
          </span>
          <button
            onClick={handleBulkDelete}
            disabled={bulkDeleting}
            className="flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 rounded-md hover:bg-red-500/30 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {bulkDeleting ? 'Deleting...' : 'Delete Selected'}
          </button>
        </div>
      )}
      
      {/* Table */}
      <div className="bg-black/40 border border-sacred-gold/20 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-sacred-gold/10 border-b border-sacred-gold/20">
              <tr>
                <th className="w-10 p-3">
                  <input
                    type="checkbox"
                    checked={selectedFiles.size === filteredFiles.length && filteredFiles.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-600 bg-gray-800 text-sacred-gold focus:ring-sacred-gold"
                  />
                </th>
                <th className="text-left p-3 text-sm font-medium text-sacred-gold">File</th>
                <th className="text-left p-3 text-sm font-medium text-sacred-gold">Status</th>
                <th className="text-left p-3 text-sm font-medium text-sacred-gold">Category</th>
                <th className="text-left p-3 text-sm font-medium text-sacred-gold">Size</th>
                <th className="text-left p-3 text-sm font-medium text-sacred-gold">Citations</th>
                <th className="text-left p-3 text-sm font-medium text-sacred-gold">Uploaded</th>
                <th className="w-10 p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                    <p className="text-sm">
                      {searchTerm || categoryFilter || statusFilter
                        ? 'No files match your filters'
                        : 'No files in your library yet'
                      }
                    </p>
                  </td>
                </tr>
              ) : (
                filteredFiles.map((file) => (
                  <React.Fragment key={file.fileId}>
                    <tr className="hover:bg-gray-800/30 transition-colors">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedFiles.has(file.fileId)}
                          onChange={() => toggleFileSelection(file.fileId)}
                          className="rounded border-gray-600 bg-gray-800 text-sacred-gold focus:ring-sacred-gold"
                        />
                      </td>
                      
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleExpanded(file.fileId)}
                            className="p-1 hover:bg-gray-700/50 rounded transition-colors"
                          >
                            {expandedFiles.has(file.fileId) ? (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                          
                          <FileText className={`w-5 h-5 ${getFileIcon(file.mimeType)}`} />
                          
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-300 truncate">
                              {file.filename}
                            </p>
                            <p className="text-xs text-gray-500">
                              {file.originalName}
                            </p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-3">
                        <LibraryStatusBadge status={file.status} size="sm" />
                      </td>
                      
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-700/50 text-xs rounded-full">
                          <Tag className="w-3 h-3" />
                          {file.category}
                        </span>
                      </td>
                      
                      <td className="p-3 text-sm text-gray-400">
                        {formatFileSize(file.sizeBytes)}
                      </td>
                      
                      <td className="p-3">
                        {file.citationCount > 0 ? (
                          <div className="flex items-center gap-1 text-sm text-sacred-gold">
                            <Quote className="w-4 h-4" />
                            {file.citationCount}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">—</span>
                        )}
                      </td>
                      
                      <td className="p-3 text-sm text-gray-400">
                        {formatDate(file.uploadedAt)}
                      </td>
                      
                      <td className="p-3">
                        <button
                          onClick={() => handleDeleteFile(file.fileId, file.filename)}
                          className="p-1 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                          title="Delete file"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expanded Details */}
                    {expandedFiles.has(file.fileId) && (
                      <tr>
                        <td colSpan={8} className="p-0">
                          <div className="px-12 py-4 bg-gray-800/20 border-t border-gray-700/30">
                            {file.mayaSummary && (
                              <div className="mb-4">
                                <h4 className="text-sm font-medium text-sacred-gold mb-2">
                                  Maya&apos;s Reflection
                                </h4>
                                <p className="text-sm text-gray-300 italic">
                                  "{file.mayaSummary}"
                                </p>
                              </div>
                            )}
                            
                            {file.tags && file.tags.length > 0 && (
                              <div className="mb-4">
                                <h4 className="text-sm font-medium text-sacred-gold mb-2">Tags</h4>
                                <div className="flex flex-wrap gap-1">
                                  {file.tags.map(tag => (
                                    <span key={tag} className="px-2 py-1 bg-gray-700/50 text-xs rounded-full">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Uploaded: {formatDate(file.uploadedAt)}
                              </div>
                              {file.processedAt && (
                                <div className="flex items-center gap-1">
                                  <Database className="w-3 h-3" />
                                  Processed: {formatDate(file.processedAt)}
                                </div>
                              )}
                              {file.lastAccessed && (
                                <div className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  Last referenced: {formatDate(file.lastAccessed)}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div>
          Showing {filteredFiles.length} of {files.length} files
        </div>
        <div>
          {files.reduce((sum, f) => sum + f.citationCount, 0)} total citations
        </div>
      </div>
    </div>
  );
}
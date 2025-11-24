'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Search, Tag, Clock, Quote, Trash2, Download, Eye } from 'lucide-react';
import { FileUploadZone } from './FileUploadZone';
import { toast } from 'react-hot-toast';

interface FileLibraryItem {
  fileId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  category: string;
  tags: string[];
  status: string;
  mayaSummary?: string;
  citationCount: number;
  lastAccessed?: string;
  uploadedAt: string;
  processedAt?: string;
}

interface MayaLibraryProps {
  userId?: string;
  className?: string;
  onFileSelect?: (file: FileLibraryItem) => void;
}

const CATEGORY_COLORS = {
  journal: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  reference: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  wisdom: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  personal: 'text-green-400 bg-green-400/10 border-green-400/30'
};

export function MayaLibrary({ userId, className = '', onFileSelect }: MayaLibraryProps) {
  const [files, setFiles] = useState<FileLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<FileLibraryItem | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  
  useEffect(() => {
    fetchUserLibrary();
  }, [userId]);
  
  const fetchUserLibrary = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/oracle/files/library');
      if (!response.ok) throw new Error('Failed to fetch library');
      
      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error('Error fetching library:', error);
      toast.error('Failed to load your library');
    } finally {
      setLoading(false);
    }
  };
  
  const handleUploadComplete = (fileId: string, mayaReflection: string) => {
    toast.success('File added to your library!');
    fetchUserLibrary(); // Refresh the list
  };
  
  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to remove this file from Maya\'s memory?')) {
      return;
    }
    
    try {
      const response = await fetch('/api/oracle/files/library', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId })
      });
      
      if (!response.ok) throw new Error('Failed to delete file');
      
      setFiles(prev => prev.filter(f => f.fileId !== fileId));
      setSelectedFile(null);
      toast.success('File removed from library');
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };
  
  const filteredFiles = files.filter(file => {
    const matchesSearch = searchTerm === '' || 
      file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.mayaSummary?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === '' || file.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
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
      year: 'numeric'
    });
  };
  
  const getFileIcon = (mimeType: string) => {
    const iconMap: Record<string, { icon: any; color: string }> = {
      'application/pdf': { icon: FileText, color: 'text-red-400' },
      'text/plain': { icon: FileText, color: 'text-blue-400' },
      'text/markdown': { icon: FileText, color: 'text-green-400' },
      'application/json': { icon: FileText, color: 'text-yellow-400' },
      'text/csv': { icon: FileText, color: 'text-amber-400' }
    };
    
    return iconMap[mimeType] || { icon: FileText, color: 'text-gray-400' };
  };
  
  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sacred-gold"></div>
      </div>
    );
  }
  
  return (
    <div className={`bg-black/40 border-r border-sacred-gold/20 flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-sacred-gold/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-sacred-gold">Maya&apos;s Library</h3>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="px-3 py-1 text-sm bg-sacred-gold/20 text-sacred-gold rounded-md hover:bg-sacred-gold/30 transition-colors"
          >
            {showUpload ? 'Hide' : 'Add Files'}
          </button>
        </div>
        
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search your knowledge..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-md text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-sacred-gold/50"
          />
        </div>
        
        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full p-2 bg-gray-800/50 border border-gray-700/50 rounded-md text-sm text-gray-300 focus:outline-none focus:border-sacred-gold/50"
        >
          <option value="">All Categories</option>
          <option value="journal">Journal</option>
          <option value="reference">Reference</option>
          <option value="wisdom">Wisdom</option>
          <option value="personal">Personal</option>
        </select>
      </div>
      
      {/* Upload Zone */}
      {showUpload && (
        <div className="p-4 border-b border-sacred-gold/20">
          <FileUploadZone
            onUploadComplete={handleUploadComplete}
            userId={userId}
          />
        </div>
      )}
      
      {/* Files List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredFiles.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-500 text-sm">
              {searchTerm || selectedCategory 
                ? 'No files match your search' 
                : 'No files in your library yet'
              }
            </p>
            {!searchTerm && !selectedCategory && (
              <button
                onClick={() => setShowUpload(true)}
                className="mt-2 text-sacred-gold text-sm hover:underline"
              >
                Upload your first file
              </button>
            )}
          </div>
        ) : (
          filteredFiles.map((file) => {
            const { icon: Icon, color } = getFileIcon(file.mimeType);
            const categoryStyle = CATEGORY_COLORS[file.category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.reference;
            
            return (
              <div
                key={file.fileId}
                onClick={() => {
                  setSelectedFile(file);
                  onFileSelect?.(file);
                }}
                className="p-3 bg-gray-800/30 hover:bg-gray-800/50 border border-gray-700/30 hover:border-sacred-gold/30 rounded-lg cursor-pointer transition-all group"
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 mt-0.5 ${color} flex-shrink-0`} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-300 truncate group-hover:text-sacred-gold transition-colors">
                        {file.filename}
                      </h4>
                      
                      <div className="flex items-center gap-1 ml-2">
                        {file.citationCount > 0 && (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Quote className="w-3 h-3" />
                            {file.citationCount}
                          </span>
                        )}
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFile(file.fileId);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 text-red-400 rounded transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 text-xs rounded-full border ${categoryStyle}`}>
                        {file.category}
                      </span>
                      
                      <span className="text-xs text-gray-500">
                        {formatFileSize(file.sizeBytes)}
                      </span>
                      
                      <span className="text-xs text-gray-500">
                        {formatDate(file.uploadedAt)}
                      </span>
                    </div>
                    
                    {file.mayaSummary && (
                      <p className="text-xs text-sacred-gold/70 italic line-clamp-2">
                        "{file.mayaSummary}"
                      </p>
                    )}
                    
                    {file.tags && file.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {file.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-700/50 text-xs text-gray-400 rounded">
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                        {file.tags.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{file.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                    
                    {file.lastAccessed && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        Last referenced {formatDate(file.lastAccessed)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {/* Stats Footer */}
      <div className="p-4 border-t border-sacred-gold/20 text-xs text-gray-500">
        <div className="flex justify-between">
          <span>{files.length} files</span>
          <span>
            {files.reduce((sum, f) => sum + f.citationCount, 0)} total references
          </span>
        </div>
      </div>
    </div>
  );
}
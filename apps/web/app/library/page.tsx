'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Search, 
  Filter, 
  FileText, 
  File, 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Loader,
  Trash2,
  RefreshCw,
  Eye,
  Sparkles
} from 'lucide-react';
import { FileUploadZone } from '@/components/ui/file-upload';
import { useFileUpload } from '@/app/hooks/useFileUpload';

interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  status: 'processing' | 'completed' | 'error';
  progress: number;
  progressMessage: string;
  totalChunks: number;
  totalTokens: number;
  textPreview?: string;
  category?: 'journal' | 'reference' | 'wisdom' | 'personal';
  tags?: string[];
  createdAt: string;
  processedAt?: string;
}

interface LibraryStats {
  total: number;
  completed: number;
  processing: number;
  error: number;
  totalChunks: number;
  totalTokens: number;
}

export default function LibraryPage() {
  const { data: session } = useSession();
  const { uploadFile, loadUploadedFiles, uploadState } = useFileUpload();
  
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [stats, setStats] = useState<LibraryStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [showUploadZone, setShowUploadZone] = useState(false);

  useEffect(() => {
    if (session?.user) {
      loadFiles();
    }
  }, [session]);

  const loadFiles = async () => {
    const data = await loadUploadedFiles();
    setFiles(data.files || []);
    setStats(data.stats || null);
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.textPreview?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleFileUpload = async (file: File, metadata?: any) => {
    try {
      await uploadFile(file, metadata);
      await loadFiles(); // Refresh the list
      setShowUploadZone(false);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const getStatusIcon = (status: string, progress: number) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'processing':
        return <Loader className="w-5 h-5 text-yellow-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    return <FileText className="w-5 h-5 text-gray-400" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCategoryColor = (category?: string) => {
    const colors = {
      journal: 'bg-blue-500/20 text-blue-300',
      reference: 'bg-green-500/20 text-green-300',
      wisdom: 'bg-amber-500/20 text-amber-300',
      personal: 'bg-pink-500/20 text-pink-300',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500/20 text-gray-300';
  };

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
          <h1 className="text-2xl font-light mb-2">Access Required</h1>
          <p className="text-amber-200">Please sign in to access Maya&apos;s Sacred Library</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-blue-900 to-indigo-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-yellow-400 mr-3" />
            <h1 className="text-4xl font-light text-white">Maya&apos;s Sacred Library</h1>
            <Sparkles className="w-8 h-8 text-yellow-400 ml-3" />
          </div>
          <p className="text-lg text-amber-200 max-w-2xl mx-auto">
            Your uploaded wisdom, woven into Maya&apos;s consciousness. Every document becomes part of her understanding, 
            ready to illuminate your conversations with personalized insights.
          </p>
        </motion.div>

        {/* Stats Overview */}
        {stats && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-sm text-amber-200">Files</div>
            </div>
            <div className="bg-green-500/20 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-300">{stats.completed}</div>
              <div className="text-sm text-green-200">Processed</div>
            </div>
            <div className="bg-yellow-500/20 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-300">{stats.processing}</div>
              <div className="text-sm text-yellow-200">Processing</div>
            </div>
            <div className="bg-red-500/20 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-300">{stats.error}</div>
              <div className="text-sm text-red-200">Failed</div>
            </div>
            <div className="bg-blue-500/20 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-300">{stats.totalChunks}</div>
              <div className="text-sm text-blue-200">Memory Chunks</div>
            </div>
            <div className="bg-amber-500/20 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-amber-300">{(stats.totalTokens / 1000).toFixed(1)}k</div>
              <div className="text-sm text-amber-200">Tokens</div>
            </div>
          </motion.div>
        )}

        {/* Controls */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col md:flex-row gap-4 mb-8"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search your sacred knowledge..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="journal">Journal</option>
            <option value="reference">Reference</option>
            <option value="wisdom">Wisdom</option>
            <option value="personal">Personal</option>
          </select>

          {/* Upload Button */}
          <button
            onClick={() => setShowUploadZone(true)}
            className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-medium rounded-lg hover:from-yellow-300 hover:to-yellow-500 transition-all duration-200 flex items-center space-x-2"
          >
            <Upload className="w-5 h-5" />
            <span>Upload Knowledge</span>
          </button>
        </motion.div>

        {/* Upload Zone Modal */}
        <AnimatePresence>
          {showUploadZone && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowUploadZone(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gradient-to-br from-amber-900 to-blue-900 p-8 rounded-2xl max-w-2xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center mb-6">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
                  <h2 className="text-2xl font-light text-white mb-2">Share Your Wisdom</h2>
                  <p className="text-amber-200">Upload documents for Maya to weave into her consciousness</p>
                </div>
                
                <FileUploadZone
                  onUpload={handleFileUpload}
                  uploadState={uploadState}
                  maxSize={10 * 1024 * 1024} // 10MB
                  acceptedTypes={['application/pdf', 'text/plain', 'text/markdown', 'application/json']}
                  className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center hover:border-yellow-400/50 transition-colors"
                />

                <button
                  onClick={() => setShowUploadZone(false)}
                  className="mt-6 w-full py-2 text-amber-200 hover:text-white transition-colors"
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Files List */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {filteredFiles.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-500" />
              <h3 className="text-xl text-white mb-2">No files found</h3>
              <p className="text-amber-200 mb-6">
                {searchQuery ? 'Try adjusting your search terms' : 'Upload your first document to begin building Maya\'s knowledge'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowUploadZone(true)}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-medium rounded-lg hover:from-yellow-300 hover:to-yellow-500 transition-all duration-200"
                >
                  Upload First File
                </button>
              )}
            </div>
          ) : (
            filteredFiles.map((file, index) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:bg-white/15 transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getFileIcon(file.filename)}
                      <h3 className="text-lg font-medium text-white truncate flex-1">
                        {file.originalName}
                      </h3>
                      {file.category && (
                        <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(file.category)}`}>
                          {file.category}
                        </span>
                      )}
                      {getStatusIcon(file.status, file.progress)}
                    </div>
                    
                    <div className="text-sm text-amber-200 mb-2">
                      {file.status === 'completed' ? (
                        <span>{file.totalChunks} memory chunks • {file.totalTokens} tokens</span>
                      ) : (
                        <span>{file.progressMessage}</span>
                      )}
                    </div>

                    {file.status === 'processing' && (
                      <div className="mb-3">
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {file.textPreview && (
                      <p className="text-sm text-gray-300 line-clamp-2 mb-3">
                        {file.textPreview}
                      </p>
                    )}

                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Uploaded {formatDate(file.createdAt)}</span>
                      </span>
                      {file.processedAt && (
                        <span className="flex items-center space-x-1">
                          <CheckCircle className="w-4 h-4" />
                          <span>Processed {formatDate(file.processedAt)}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setSelectedFile(file)}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    {file.status === 'error' && (
                      <button
                        className="p-2 text-gray-400 hover:text-yellow-400 transition-colors"
                        title="Retry processing"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      title="Delete file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* File Detail Modal */}
        <AnimatePresence>
          {selectedFile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedFile(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gradient-to-br from-amber-900 to-blue-900 p-8 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-light text-white mb-2">{selectedFile.originalName}</h2>
                  <div className="flex items-center justify-center space-x-4 text-sm text-amber-200">
                    <span>Status: {selectedFile.status}</span>
                    <span>•</span>
                    <span>{selectedFile.totalChunks} chunks</span>
                    <span>•</span>
                    <span>{selectedFile.totalTokens} tokens</span>
                  </div>
                </div>
                
                {selectedFile.textPreview && (
                  <div className="bg-white/10 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-medium text-white mb-2">Preview</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {selectedFile.textPreview}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => setSelectedFile(null)}
                  className="w-full py-2 text-amber-200 hover:text-white transition-colors"
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, 
  Trash2, 
  RefreshCw, 
  Upload, 
  Sparkles, 
  FileText, 
  CheckCircle, 
  XCircle,
  Clock,
  Eye,
  ArrowLeft
} from "lucide-react";
import { useRouter } from "next/navigation";
import { FileUploadZone } from "@/components/files/FileUploadZone";

interface FileItem {
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
  const router = useRouter();
  
  const [files, setFiles] = useState<FileItem[]>([]);
  const [stats, setStats] = useState<LibraryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Fetch Library
  const fetchLibrary = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/oracle/files/status", { method: "POST" });
      const data = await res.json();
      
      if (data.success) {
        setFiles(data.files || []);
        setStats(data.stats || null);
      }
    } catch (error) {
      console.error('Failed to fetch library:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Live polling for processing files
  useEffect(() => {
    fetchLibrary();
    
    // Set up polling for files that are still processing
    const pollInterval = setInterval(() => {
      const processingFiles = files.filter(f => f.status === 'processing');
      if (processingFiles.length > 0) {
        fetchLibrary();
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [fetchLibrary, files]);


  // Handle file deletion
  const handleDelete = async (fileId: string) => {
    if (deleteConfirm !== fileId) {
      setDeleteConfirm(fileId);
      return;
    }

    try {
      const res = await fetch(`/api/oracle/files/manage?fileId=${fileId}`, {
        method: "DELETE"
      });
      
      if (res.ok) {
        await fetchLibrary();
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  // Handle reprocessing
  const handleReprocess = async (fileId: string) => {
    try {
      const res = await fetch('/api/oracle/files/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reprocess', fileId })
      });

      if (res.ok) {
        await fetchLibrary();
      }
    } catch (error) {
      console.error('Reprocess failed:', error);
    }
  };

  // Filter files
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.textPreview?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusIcon = (status: string, progress: number) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getCategoryColor = (category?: string) => {
    const colors = {
      journal: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      reference: 'bg-green-500/20 text-green-300 border-green-500/30',
      wisdom: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      personal: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-blue-900 to-indigo-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/oracle')}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <div className="flex items-center space-x-3">
                <Sparkles className="w-8 h-8 text-yellow-400" />
                <h1 className="text-3xl font-light text-white">Maya&apos;s Sacred Library</h1>
              </div>
              <p className="text-amber-200 mt-1">
                Your uploaded wisdom, woven into Maya&apos;s consciousness
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowUpload(true)}
            className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-medium rounded-lg hover:from-yellow-300 hover:to-yellow-500 transition-all duration-200 flex items-center space-x-2"
          >
            <Upload className="w-5 h-5" />
            <span>Upload Knowledge</span>
          </button>
        </motion.div>

        {/* Stats Overview */}
        {stats && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20">
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-sm text-amber-200">Files</div>
            </div>
            <div className="bg-green-500/20 backdrop-blur-sm rounded-lg p-4 text-center border border-green-500/30">
              <div className="text-2xl font-bold text-green-300">{stats.completed}</div>
              <div className="text-sm text-green-200">Absorbed</div>
            </div>
            <div className="bg-yellow-500/20 backdrop-blur-sm rounded-lg p-4 text-center border border-yellow-500/30">
              <div className="text-2xl font-bold text-yellow-300">{stats.processing}</div>
              <div className="text-sm text-yellow-200">Processing</div>
            </div>
            <div className="bg-red-500/20 backdrop-blur-sm rounded-lg p-4 text-center border border-red-500/30">
              <div className="text-2xl font-bold text-red-300">{stats.error}</div>
              <div className="text-sm text-red-200">Failed</div>
            </div>
            <div className="bg-blue-500/20 backdrop-blur-sm rounded-lg p-4 text-center border border-blue-500/30">
              <div className="text-2xl font-bold text-blue-300">{stats.totalChunks}</div>
              <div className="text-sm text-blue-200">Memory Chunks</div>
            </div>
            <div className="bg-amber-500/20 backdrop-blur-sm rounded-lg p-4 text-center border border-amber-500/30">
              <div className="text-2xl font-bold text-amber-300">{(stats.totalTokens / 1000).toFixed(1)}k</div>
              <div className="text-sm text-amber-200">Tokens</div>
            </div>
          </motion.div>
        )}

        {/* Search and Filter */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col md:flex-row gap-4 mb-8"
        >
          <input
            type="text"
            placeholder="Search your sacred knowledge..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent"
          />
          
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
        </motion.div>

        {/* Files List */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center py-20"
            >
              <Loader2 className="w-12 h-12 text-yellow-400 animate-spin" />
            </motion.div>
          ) : filteredFiles.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-20"
            >
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-500" />
              <h3 className="text-xl text-white mb-2">No sacred knowledge yet</h3>
              <p className="text-amber-200 mb-6">
                Upload your first document to begin building Maya&apos;s wisdom
              </p>
              <button
                onClick={() => setShowUpload(true)}
                className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-medium rounded-lg hover:from-yellow-300 hover:to-yellow-500 transition-all duration-200"
              >
                Upload First File
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="files"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {filteredFiles.map((file, index) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:bg-white/15 transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <h3 className="text-lg font-medium text-white truncate flex-1">
                          {file.originalName}
                        </h3>
                        {file.category && (
                          <span className={`px-3 py-1 text-xs rounded-full border ${getCategoryColor(file.category)}`}>
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
                          <p className="text-xs text-gray-400 mt-1">{file.progress}% complete</p>
                        </div>
                      )}

                      {file.textPreview && (
                        <p className="text-sm text-gray-300 line-clamp-2 mb-3">
                          {file.textPreview}
                        </p>
                      )}

                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <span>Uploaded {formatDate(file.createdAt)}</span>
                        {file.processedAt && (
                          <span>• Absorbed {formatDate(file.processedAt)}</span>
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
                          onClick={() => handleReprocess(file.id)}
                          className="p-2 text-gray-400 hover:text-yellow-400 transition-colors"
                          title="Retry processing"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDelete(file.id)}
                        className={`p-2 transition-colors ${
                          deleteConfirm === file.id
                            ? 'text-red-400 hover:text-red-300'
                            : 'text-gray-400 hover:text-red-400'
                        }`}
                        title={deleteConfirm === file.id ? 'Click again to confirm' : 'Delete file'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Modal */}
        <AnimatePresence>
          {showUpload && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowUpload(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gradient-to-br from-amber-900 to-blue-900 p-8 rounded-2xl max-w-2xl w-full border border-white/20"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center mb-6">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
                  <h2 className="text-2xl font-light text-white mb-2">Share Your Wisdom</h2>
                  <p className="text-amber-200">Upload documents for Maya to weave into her consciousness</p>
                </div>
                
                <FileUploadZone
                  onUploadComplete={(fileId, mayaReflection) => {
                    fetchLibrary(); // Refresh the library
                    // Close upload modal after a short delay to show Maya&apos;s reflection
                    setTimeout(() => {
                      setShowUpload(false);
                    }, 3000);
                  }}
                  onUploadProgress={(fileId, progress) => {
                  }}
                  className="border-2 border-dashed border-white/30 rounded-lg hover:border-yellow-400/50 transition-colors"
                />

                <button
                  onClick={() => setShowUpload(false)}
                  className="mt-6 w-full py-2 text-amber-200 hover:text-white transition-colors"
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
                className="bg-gradient-to-br from-amber-900 to-blue-900 p-8 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-white/20"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-light text-white mb-2">{selectedFile.originalName}</h2>
                  <div className="flex items-center justify-center space-x-4 text-sm text-amber-200">
                    <span>Status: {selectedFile.status}</span>
                    {selectedFile.totalChunks > 0 && (
                      <>
                        <span>•</span>
                        <span>{selectedFile.totalChunks} chunks</span>
                        <span>•</span>
                        <span>{selectedFile.totalTokens} tokens</span>
                      </>
                    )}
                  </div>
                </div>
                
                {selectedFile.textPreview && (
                  <div className="bg-white/10 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-medium text-white mb-3">Preview</h3>
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
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
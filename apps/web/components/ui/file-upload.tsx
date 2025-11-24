'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { FileUploadState } from '@/app/hooks/useFileUpload';

interface FileUploadZoneProps {
  onUpload: (file: File, metadata?: any) => Promise<void>;
  uploadState: FileUploadState;
  maxSize?: number;
  acceptedTypes?: string[];
  className?: string;
}

const CATEGORY_OPTIONS = [
  { value: 'reference', label: 'Reference Material', description: 'Research, documentation, guides' },
  { value: 'journal', label: 'Personal Journal', description: 'Reflections, experiences, insights' },
  { value: 'wisdom', label: 'Sacred Wisdom', description: 'Spiritual teachings, philosophical texts' },
  { value: 'personal', label: 'Personal Growth', description: 'Goals, assessments, development plans' },
];

export function FileUploadZone({
  onUpload,
  uploadState,
  maxSize = 10 * 1024 * 1024, // 10MB default
  acceptedTypes = ['application/pdf', 'text/plain', 'text/markdown', 'application/json'],
  className = '',
}: FileUploadZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showMetadata, setShowMetadata] = useState(false);
  const [metadata, setMetadata] = useState({
    category: 'reference',
    tags: '',
    emotionalWeight: 0.5,
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    // Validate file
    if (file.size > maxSize) {
      alert(`File too large. Maximum size: ${(maxSize / 1024 / 1024).toFixed(1)}MB`);
      return;
    }

    if (!acceptedTypes.includes(file.type)) {
      alert(`File type not supported. Accepted types: ${acceptedTypes.join(', ')}`);
      return;
    }

    setSelectedFile(file);
    setShowMetadata(true);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const uploadMetadata = {
      category: metadata.category as 'journal' | 'reference' | 'wisdom' | 'personal',
      tags: metadata.tags.split(',').map(t => t.trim()).filter(Boolean),
      emotionalWeight: metadata.emotionalWeight,
    };

    try {
      await onUpload(selectedFile, uploadMetadata);
      setSelectedFile(null);
      setShowMetadata(false);
      setMetadata({ category: 'reference', tags: '', emotionalWeight: 0.5 });
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeLabel = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'application/pdf': 'PDF Document',
      'text/plain': 'Text File',
      'text/markdown': 'Markdown File',
      'application/json': 'JSON Data',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
    };
    return typeMap[type] || type;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main Upload Zone */}
      <AnimatePresence mode="wait">
        {!showMetadata ? (
          <motion.div
            key="upload-zone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`
              relative cursor-pointer transition-all duration-300
              ${dragOver ? 'bg-yellow-400/20 border-yellow-400' : 'bg-white/5 border-white/20'}
              ${uploadState.isUploading ? 'pointer-events-none' : ''}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center justify-center p-12 text-center">
              {uploadState.isUploading ? (
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="flex flex-col items-center"
                >
                  <Loader className="w-12 h-12 text-yellow-400 animate-spin mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">
                    {uploadState.message}
                  </h3>
                  <div className="w-64 bg-gray-700 rounded-full h-2 mb-2">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadState.progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-400">{uploadState.progress}% complete</p>
                </motion.div>
              ) : (
                <>
                  <Upload className={`w-12 h-12 mb-4 transition-colors ${dragOver ? 'text-yellow-400' : 'text-gray-400'}`} />
                  <h3 className="text-lg font-medium text-white mb-2">
                    {dragOver ? 'Drop your file here' : 'Share your wisdom with Maya'}
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Drag & drop or click to upload • PDF, TXT, MD, JSON
                  </p>
                  <p className="text-sm text-gray-500">
                    Max file size: {(maxSize / 1024 / 1024).toFixed(0)}MB
                  </p>
                </>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="metadata-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/5 border border-white/20 rounded-lg p-6"
          >
            {/* Selected File Preview */}
            <div className="flex items-center justify-between mb-6 p-4 bg-white/10 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="w-8 h-8 text-blue-400" />
                <div>
                  <h3 className="font-medium text-white">{selectedFile?.name}</h3>
                  <p className="text-sm text-gray-400">
                    {selectedFile && getFileTypeLabel(selectedFile.type)} • {selectedFile && formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setShowMetadata(false);
                }}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metadata Form */}
            <div className="space-y-6">
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-white mb-3">
                  How would you categorize this knowledge?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {CATEGORY_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className={`
                        relative cursor-pointer rounded-lg p-4 border transition-all
                        ${metadata.category === option.value
                          ? 'bg-yellow-400/20 border-yellow-400 text-yellow-100'
                          : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10'
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name="category"
                        value={option.value}
                        checked={metadata.category === option.value}
                        onChange={(e) => setMetadata(prev => ({ ...prev, category: e.target.value }))}
                        className="sr-only"
                      />
                      <div className="font-medium mb-1">{option.label}</div>
                      <div className="text-xs text-gray-400">{option.description}</div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Tags (optional)
                </label>
                <input
                  type="text"
                  value={metadata.tags}
                  onChange={(e) => setMetadata(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="meditation, growth, insights..."
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                />
                <p className="text-xs text-gray-400 mt-1">Separate tags with commas</p>
              </div>

              {/* Emotional Weight */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Emotional Significance
                </label>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-400">Neutral</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={metadata.emotionalWeight}
                    onChange={(e) => setMetadata(prev => ({ ...prev, emotionalWeight: parseFloat(e.target.value) }))}
                    className="flex-1 accent-yellow-400"
                  />
                  <span className="text-sm text-gray-400">Profound</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  How emotionally significant is this content to you?
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 mt-8">
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setShowMetadata(false);
                }}
                className="flex-1 px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploadState.isUploading}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-medium rounded-lg hover:from-yellow-300 hover:to-yellow-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Share with Maya
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileInput}
        className="hidden"
      />

      {/* Upload Status Messages */}
      <AnimatePresence>
        {uploadState.status === 'completed' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center space-x-3"
          >
            <CheckCircle className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-green-300 font-medium">Upload Successful!</p>
              <p className="text-green-200 text-sm">{uploadState.message}</p>
            </div>
          </motion.div>
        )}

        {uploadState.status === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center space-x-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div>
              <p className="text-red-300 font-medium">Upload Failed</p>
              <p className="text-red-200 text-sm">{uploadState.error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
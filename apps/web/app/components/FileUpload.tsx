'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface FileUploadProps {
  userId?: string;
  onUploadComplete?: (fileId: string) => void;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
}

interface UploadedFile {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error';
  progress: number;
  message?: string;
}

export default function FileUpload({
  userId,
  onUploadComplete,
  maxSize = 10,
  acceptedTypes = [
    '.pdf',
    '.txt',
    '.md',
    '.doc',
    '.docx',
    '.jpg',
    '.jpeg',
    '.png',
    '.webp'
  ]
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  }, []);

  const handleFiles = async (newFiles: File[]) => {
    // Validate files
    const validFiles = newFiles.filter(file => {
      // Check size
      if (file.size > maxSize * 1024 * 1024) {
        console.warn(`File ${file.name} exceeds ${maxSize}MB limit`);
        return false;
      }
      
      // Check type
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!acceptedTypes.some(type => extension === type)) {
        console.warn(`File type ${extension} not accepted`);
        return false;
      }
      
      return true;
    });

    // Add files to state
    const uploadFiles: UploadedFile[] = validFiles.map(file => ({
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      file,
      status: 'pending' as const,
      progress: 0
    }));

    setFiles(prev => [...prev, ...uploadFiles]);

    // Upload each file
    for (const uploadFile of uploadFiles) {
      await uploadFileToMaya(uploadFile);
    }
  };

  const uploadFileToMaya = async (uploadFile: UploadedFile) => {
    // Update status to uploading
    setFiles(prev => prev.map(f => 
      f.id === uploadFile.id 
        ? { ...f, status: 'uploading' as const, progress: 10 }
        : f
    ));

    try {
      const formData = new FormData();
      formData.append('file', uploadFile.file);
      if (userId) {
        formData.append('user_id', userId);
      }

      // Add default tags based on file type
      const extension = uploadFile.file.name.split('.').pop()?.toLowerCase();
      if (extension === 'pdf') {
        formData.append('tags', 'document');
      } else if (['jpg', 'jpeg', 'png', 'webp'].includes(extension || '')) {
        formData.append('tags', 'image');
      } else {
        formData.append('tags', 'text');
      }

      // Upload file
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      // Update status to processing
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { 
              ...f, 
              status: 'processing' as const, 
              progress: 50,
              message: result.message
            }
          : f
      ));

      // Simulate processing time (in production, poll for status)
      setTimeout(() => {
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { 
                ...f, 
                status: 'complete' as const, 
                progress: 100,
                message: 'Maya has absorbed your file'
              }
            : f
        ));

        if (onUploadComplete) {
          onUploadComplete(result.file_id);
        }
      }, 3000);

    } catch (error) {
      console.error('Upload error:', error);
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { 
              ...f, 
              status: 'error' as const, 
              progress: 0,
              message: error instanceof Error ? error.message : 'Upload failed'
            }
          : f
      ));
    }
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin text-amber-500" />;
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <File className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return 'bg-blue-500';
      case 'processing':
        return 'bg-amber-500';
      case 'complete':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      {/* Drop Zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 transition-all
          ${isDragging 
            ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/10' 
            : 'border-gray-300 dark:border-gray-600 hover:border-amber-400'
          }
        `}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="text-center">
          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
            Drop files here or click to browse
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Maya will absorb PDFs, documents, images, and text files
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            Maximum {maxSize}MB per file
          </p>
        </div>

        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center bg-amber-500/10 rounded-lg">
            <p className="text-lg font-medium text-amber-600 dark:text-amber-400">
              Drop files to upload
            </p>
          </div>
        )}
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-6 space-y-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Uploaded Files
          </h3>
          
          {files.map(file => (
            <div
              key={file.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(file.status)}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-xs">
                    {file.file.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({(file.file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                
                {file.status === 'complete' || file.status === 'error' ? (
                  <button
                    onClick={() => removeFile(file.id)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : null}
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div
                  className={`${getStatusColor(file.status)} h-1.5 rounded-full transition-all`}
                  style={{ width: `${file.progress}%` }}
                />
              </div>

              {/* Status Message */}
              {file.message && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
                  {file.message}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Maya&apos;s Response Area */}
      {files.some(f => f.status === 'processing') && (
        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Maya is reading and understanding your files...
            </p>
          </div>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
            She&apos;ll weave these insights into your future conversations
          </p>
        </div>
      )}

      {files.some(f => f.status === 'complete') && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-700 dark:text-green-300">
              Files absorbed into Maya&apos;s memory
            </p>
          </div>
          <p className="text-xs text-green-600 dark:text-green-400 mt-2">
            Ask Maya about your uploaded content anytime
          </p>
        </div>
      )}
    </div>
  );
}
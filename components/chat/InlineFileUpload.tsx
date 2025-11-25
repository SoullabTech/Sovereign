'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Paperclip, X, FileText, Image, File, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface AttachedFile {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  preview?: string;
  fileId?: string;
}

interface InlineFileUploadProps {
  onFilesChange?: (files: AttachedFile[]) => void;
  maxFiles?: number;
  maxSizePerFile?: number; // MB
  className?: string;
}

export default function InlineFileUpload({ 
  onFilesChange,
  maxFiles = 5,
  maxSizePerFile = 10,
  className = ''
}: InlineFileUploadProps) {
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedTypes = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf', 
    'text/plain', 'text/markdown',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ];

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-4 h-4" />;
    } else if (file.type === 'application/pdf') {
      return <FileText className="w-4 h-4 text-red-500" />;
    } else if (file.type.includes('word') || file.type === 'text/plain') {
      return <FileText className="w-4 h-4 text-blue-500" />;
    }
    return <File className="w-4 h-4" />;
  };

  const createImagePreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject('Not an image');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const uploadFile = async (attachedFile: AttachedFile) => {
    // Update status to uploading
    setAttachedFiles(prev => prev.map(f => 
      f.id === attachedFile.id 
        ? { ...f, status: 'uploading' as const }
        : f
    ));

    try {
      const formData = new FormData();
      formData.append('file', attachedFile.file);

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      // Update to complete
      setAttachedFiles(prev => {
        const updated = prev.map(f => 
          f.id === attachedFile.id 
            ? { ...f, status: 'complete' as const, fileId: result.file_id }
            : f
        );
        onFilesChange?.(updated);
        return updated;
      });

    } catch (error) {
      console.error('Upload error:', error);
      setAttachedFiles(prev => prev.map(f => 
        f.id === attachedFile.id 
          ? { ...f, status: 'error' as const }
          : f
      ));
    }
  };

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    // Validate files
    const validFiles = fileArray.filter(file => {
      if (file.size > maxSizePerFile * 1024 * 1024) {
        console.warn(`File ${file.name} exceeds ${maxSizePerFile}MB limit`);
        return false;
      }
      if (!supportedTypes.includes(file.type)) {
        console.warn(`File type ${file.type} not supported`);
        return false;
      }
      return true;
    });

    // Check max files limit
    if (attachedFiles.length + validFiles.length > maxFiles) {
      console.warn(`Cannot attach more than ${maxFiles} files`);
      validFiles.splice(maxFiles - attachedFiles.length);
    }

    // Create attached file objects
    const newAttachedFiles: AttachedFile[] = [];
    
    for (const file of validFiles) {
      const attachedFile: AttachedFile = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        file,
        status: 'pending'
      };

      // Create preview for images
      if (file.type.startsWith('image/')) {
        try {
          attachedFile.preview = await createImagePreview(file);
        } catch (error) {
          console.warn('Failed to create preview:', error);
        }
      }

      newAttachedFiles.push(attachedFile);
    }

    // Add to state
    const updatedFiles = [...attachedFiles, ...newAttachedFiles];
    setAttachedFiles(updatedFiles);
    onFilesChange?.(updatedFiles);

    // Upload each file
    for (const attachedFile of newAttachedFiles) {
      uploadFile(attachedFile);
    }
  };

  const removeFile = (fileId: string) => {
    const updatedFiles = attachedFiles.filter(f => f.id !== fileId);
    setAttachedFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [attachedFiles, maxFiles, maxSizePerFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const getStatusIcon = (status: AttachedFile['status']) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="w-3 h-3 animate-spin text-blue-500" />;
      case 'complete':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Attachment Button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
        title="Attach files"
        disabled={attachedFiles.length >= maxFiles}
      >
        <Paperclip className="w-4 h-4" />
      </button>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={supportedTypes.join(',')}
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        className="hidden"
      />

      {/* Drag Overlay */}
      {isDragOver && (
        <div 
          className="fixed inset-0 bg-blue-500/10 border-2 border-dashed border-blue-500 z-50 flex items-center justify-center"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="bg-white/90 p-4 rounded-lg shadow-lg">
            <p className="text-blue-600 font-medium">Drop files to attach</p>
          </div>
        </div>
      )}

      {/* Attached Files Preview */}
      {attachedFiles.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {attachedFiles.map(file => (
            <div
              key={file.id}
              className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 text-sm max-w-xs"
            >
              {/* File Icon/Preview */}
              <div className="flex-shrink-0">
                {file.preview ? (
                  <img 
                    src={file.preview} 
                    alt={file.file.name}
                    className="w-8 h-8 rounded object-cover"
                  />
                ) : (
                  getFileIcon(file.file)
                )}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium text-gray-700">
                  {file.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(file.file.size / 1024).toFixed(1)} KB
                </p>
              </div>

              {/* Status & Remove */}
              <div className="flex items-center gap-1">
                {getStatusIcon(file.status)}
                <button
                  onClick={() => removeFile(file.id)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={file.status === 'uploading'}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Global drag handlers */}
      <div
        className="fixed inset-0 pointer-events-none z-40"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragLeave={handleDragLeave}
      />
    </div>
  );
}
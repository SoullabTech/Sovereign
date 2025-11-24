'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface FileUploadZoneProps {
  onUploadComplete?: (fileId: string, mayaReflection: string) => void;
  onUploadProgress?: (fileId: string, progress: number) => void;
  className?: string;
  userId?: string;
}

interface UploadingFile {
  id: string;
  file: File;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  progress: number;
  mayaInsight?: string;
  error?: string;
}

const SUPPORTED_TYPES = {
  'text/plain': { ext: '.txt', icon: FileText, color: 'text-blue-400' },
  'text/markdown': { ext: '.md', icon: FileText, color: 'text-green-400' },
  'application/pdf': { ext: '.pdf', icon: FileText, color: 'text-red-400' },
  'application/json': { ext: '.json', icon: FileText, color: 'text-yellow-400' },
  'text/csv': { ext: '.csv', icon: FileText, color: 'text-amber-400' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { 
    ext: '.docx', 
    icon: FileText, 
    color: 'text-indigo-400' 
  }
};

export function FileUploadZone({ 
  onUploadComplete, 
  onUploadProgress, 
  className = '',
  userId 
}: FileUploadZoneProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      await handleFileUpload(file);
    }
  }, []);
  
  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    maxSize: 10 * 1024 * 1024, // 10MB
    accept: Object.keys(SUPPORTED_TYPES).reduce((acc, type) => {
      const config = SUPPORTED_TYPES[type as keyof typeof SUPPORTED_TYPES];
      acc[type] = [config.ext];
      return acc;
    }, {} as Record<string, string[]>),
    multiple: true
  });
  
  const handleFileUpload = async (file: File) => {
    const fileId = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Add to uploading files
    const uploadingFile: UploadingFile = {
      id: fileId,
      file,
      status: 'uploading',
      progress: 0
    };
    
    setUploadingFiles(prev => [...prev, uploadingFile]);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('metadata', JSON.stringify({
        category: 'reference',
        tags: [],
        visibility: 'private',
        emotionalWeight: 0.5
      }));
      
      // Upload file
      const response = await fetch('/api/oracle/files/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }
      
      const result = await response.json();
      
      // Update with server response
      setUploadingFiles(prev => prev.map(f => 
        f.id === fileId ? {
          ...f,
          id: result.fileId,
          status: 'processing',
          progress: 10,
          mayaInsight: result.mayaInsight
        } : f
      ));
      
      // Show Maya&apos;s insight
      if (result.mayaInsight) {
        toast.success(result.mayaInsight, { duration: 4000 });
      }
      
      // Poll for completion
      pollFileStatus(result.fileId, fileId);
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadingFiles(prev => prev.map(f => 
        f.id === fileId ? {
          ...f,
          status: 'error',
          error: error instanceof Error ? error.message : 'Upload failed'
        } : f
      ));
      
      toast.error('Failed to upload file');
    }
  };
  
  const pollFileStatus = async (serverFileId: string, localFileId: string) => {
    const maxAttempts = 60; // 2 minutes with 2-second intervals
    let attempts = 0;
    
    const poll = async () => {
      try {
        const response = await fetch(`/api/oracle/files/status?fileId=${serverFileId}`);
        if (!response.ok) return;
        
        const status = await response.json();
        
        setUploadingFiles(prev => prev.map(f => 
          (f.id === localFileId || f.id === serverFileId) ? {
            ...f,
            id: serverFileId,
            status: status.file.status === 'completed' ? 'ready' : status.file.status,
            progress: status.file.status === 'completed' ? 100 : (status.file.status === 'processing' ? 75 : 10),
            mayaInsight: status.file.progressMessage || f.mayaInsight
          } : f
        ));
        
        if (onUploadProgress) {
          const progressValue = status.file.status === 'completed' ? 100 : (status.file.status === 'processing' ? 75 : 10);
          onUploadProgress(serverFileId, progressValue);
        }
        
        if (status.file.status === 'completed') {
          // File processing complete
          const reflection = status.file.progressMessage || "Maya has absorbed your wisdom into her consciousness.";
          if (onUploadComplete) {
            onUploadComplete(serverFileId, reflection);
          }
          
          toast.success(reflection, { duration: 5000 });
          
          // Remove from uploading list after a delay
          setTimeout(() => {
            setUploadingFiles(prev => prev.filter(f => f.id !== serverFileId));
          }, 3000);
          
        } else if (status.file.status === 'error') {
          setUploadingFiles(prev => prev.map(f => 
            f.id === serverFileId ? {
              ...f,
              status: 'error',
              error: status.file.progressMessage || 'Processing failed'
            } : f
          ));
          
          toast.error('File processing failed');
          
        } else if (attempts < maxAttempts) {
          // Continue polling
          attempts++;
          setTimeout(poll, 2000);
        } else {
          // Timeout
          setUploadingFiles(prev => prev.map(f => 
            f.id === serverFileId ? {
              ...f,
              status: 'error',
              error: 'Processing timeout'
            } : f
          ));
        }
        
      } catch (error) {
        console.error('Status poll error:', error);
        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 2000);
        }
      }
    };
    
    setTimeout(poll, 2000);
  };
  
  const removeFile = (fileId: string) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
  };
  
  const getFileIcon = (mimeType: string) => {
    const config = SUPPORTED_TYPES[mimeType as keyof typeof SUPPORTED_TYPES];
    const Icon = config?.icon || FileText;
    const color = config?.color || 'text-gray-400';
    return { Icon, color };
  };
  
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
          cursor-pointer hover:border-sacred-gold/60
          ${isDragActive 
            ? 'border-sacred-gold bg-sacred-gold/5' 
            : 'border-sacred-gold/30 hover:bg-sacred-gold/5'
          }
        `}
      >
        <input {...getInputProps()} />
        
        <Upload className={`w-8 h-8 mx-auto mb-4 ${isDragActive ? 'text-sacred-gold' : 'text-sacred-gold/60'}`} />
        
        <div className="space-y-2">
          <p className="text-sm text-gray-300">
            {isDragActive 
              ? 'Drop your knowledge here...' 
              : 'Drop your wisdom here, or click to select files'
            }
          </p>
          <p className="text-xs text-gray-500">
            PDF, Text, Markdown, JSON, CSV, DOCX (max 10MB each)
          </p>
        </div>
      </div>
      
      {/* File Rejections */}
      {fileRejections.length > 0 && (
        <div className="space-y-2">
          {fileRejections.map(({ file, errors }) => (
            <div key={file.name} className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-red-300 truncate">{file.name}</p>
                <p className="text-xs text-red-400">{errors[0]?.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-sacred-gold">Processing Files</h4>
          {uploadingFiles.map((uploadingFile) => {
            const { Icon, color } = getFileIcon(uploadingFile.file.type);
            
            return (
              <div key={uploadingFile.id} className="flex items-center gap-3 p-3 bg-black/40 border border-sacred-gold/20 rounded-lg">
                <Icon className={`w-5 h-5 ${color} flex-shrink-0`} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-300 truncate">
                      {uploadingFile.file.name}
                    </p>
                    <div className="flex items-center gap-2">
                      {uploadingFile.status === 'uploading' && (
                        <Clock className="w-4 h-4 text-blue-400 animate-spin" />
                      )}
                      {uploadingFile.status === 'processing' && (
                        <Clock className="w-4 h-4 text-yellow-400 animate-pulse" />
                      )}
                      {uploadingFile.status === 'ready' && (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      )}
                      {uploadingFile.status === 'error' && (
                        <AlertCircle className="w-4 h-4 text-red-400" />
                      )}
                      <button
                        onClick={() => removeFile(uploadingFile.id)}
                        className="p-1 hover:bg-gray-700/50 rounded"
                      >
                        <X className="w-3 h-3 text-gray-500" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mt-2 bg-gray-700 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        uploadingFile.status === 'error' ? 'bg-red-400' : 
                        uploadingFile.status === 'ready' ? 'bg-green-400' : 
                        'bg-sacred-gold'
                      }`}
                      style={{ width: `${uploadingFile.progress}%` }}
                    />
                  </div>
                  
                  {/* Status message */}
                  {uploadingFile.mayaInsight && (
                    <p className="text-xs text-sacred-gold/70 mt-1 italic">
                      "{uploadingFile.mayaInsight}"
                    </p>
                  )}
                  
                  {uploadingFile.error && (
                    <p className="text-xs text-red-400 mt-1">
                      {uploadingFile.error}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
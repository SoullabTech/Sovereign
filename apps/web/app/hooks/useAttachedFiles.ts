'use client';

import { useState, useCallback } from 'react';

interface AttachedFile {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  preview?: string;
  fileId?: string;
}

export function useAttachedFiles() {
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);

  const updateFiles = useCallback((files: AttachedFile[]) => {
    setAttachedFiles(files);
  }, []);

  const clearFiles = useCallback(() => {
    setAttachedFiles([]);
  }, []);

  const getCompletedFileIds = useCallback(() => {
    return attachedFiles
      .filter(f => f.status === 'complete' && f.fileId)
      .map(f => f.fileId!);
  }, [attachedFiles]);

  const hasUploadingFiles = useCallback(() => {
    return attachedFiles.some(f => f.status === 'uploading');
  }, [attachedFiles]);

  const getFileContext = useCallback(() => {
    const completedFiles = attachedFiles.filter(f => f.status === 'complete');
    
    if (completedFiles.length === 0) return null;
    
    return {
      hasAttachments: true,
      fileCount: completedFiles.length,
      fileTypes: completedFiles.map(f => f.file.type),
      fileNames: completedFiles.map(f => f.file.name),
      fileIds: completedFiles.map(f => f.fileId).filter(Boolean),
      contextMessage: `I've attached ${completedFiles.length} file${completedFiles.length > 1 ? 's' : ''} for your reference: ${completedFiles.map(f => f.file.name).join(', ')}`
    };
  }, [attachedFiles]);

  return {
    attachedFiles,
    updateFiles,
    clearFiles,
    getCompletedFileIds,
    hasUploadingFiles,
    getFileContext
  };
}
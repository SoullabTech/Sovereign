/**
 * File Upload Hook for Maya's Memory Integration
 * Handles upload, progress tracking, and status polling
 */

import { useState, useCallback } from 'react';

export interface FileUploadState {
  isUploading: boolean;
  progress: number;
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  message: string;
  fileId?: string;
  error?: string;
  totalChunks?: number;
  totalTokens?: number;
}

export interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  status: string;
  progress: number;
  progressMessage: string;
  totalChunks: number;
  totalTokens: number;
  textPreview?: string;
  createdAt: string;
  processedAt?: string;
}

export function useFileUpload() {
  const [uploadState, setUploadState] = useState<FileUploadState>({
    isUploading: false,
    progress: 0,
    status: 'idle',
    message: '',
  });

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  // Upload a file and track its processing
  const uploadFile = useCallback(async (
    file: File, 
    metadata?: { 
      category?: 'journal' | 'reference' | 'wisdom' | 'personal';
      tags?: string[];
      emotionalWeight?: number;
    }
  ) => {
    try {
      setUploadState({
        isUploading: true,
        progress: 10,
        status: 'uploading',
        message: 'Uploading file to Maya...',
      });

      const formData = new FormData();
      formData.append('file', file);
      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
      }

      const uploadResponse = await fetch('/api/oracle/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const uploadResult = await uploadResponse.json();
      const fileId = uploadResult.fileId;

      setUploadState({
        isUploading: true,
        progress: 25,
        status: 'processing',
        message: uploadResult.mayaInsight || 'Maya is studying your file...',
        fileId,
      });

      // Start polling for processing status
      return pollFileStatus(fileId);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadState({
        isUploading: false,
        progress: 0,
        status: 'error',
        message: errorMessage,
        error: errorMessage,
      });
      throw error;
    }
  }, []);

  // Poll file processing status
  const pollFileStatus = useCallback(async (fileId: string): Promise<UploadedFile> => {
    return new Promise((resolve, reject) => {
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`/api/oracle/files/status?fileId=${fileId}`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch file status');
          }

          const data = await response.json();
          const file = data.file;

          setUploadState(prev => ({
            ...prev,
            progress: file.progress,
            message: file.progressMessage,
          }));

          // Check if processing is complete
          if (file.status === 'completed') {
            clearInterval(pollInterval);
            
            setUploadState({
              isUploading: false,
              progress: 100,
              status: 'completed',
              message: `Successfully integrated! ${file.totalChunks} memory chunks created.`,
              fileId,
              totalChunks: file.totalChunks,
              totalTokens: file.totalTokens,
            });

            // Add to uploaded files list
            const uploadedFile: UploadedFile = {
              id: file.id,
              filename: file.filename,
              originalName: file.originalName,
              status: file.status,
              progress: file.progress,
              progressMessage: file.progressMessage,
              totalChunks: file.totalChunks,
              totalTokens: file.totalTokens,
              textPreview: file.textPreview,
              createdAt: file.createdAt,
              processedAt: file.processedAt,
            };

            setUploadedFiles(prev => [uploadedFile, ...prev]);
            resolve(uploadedFile);

          } else if (file.status === 'error') {
            clearInterval(pollInterval);
            
            setUploadState({
              isUploading: false,
              progress: 0,
              status: 'error',
              message: file.progressMessage || 'Processing failed',
              error: file.progressMessage,
            });

            reject(new Error(file.progressMessage || 'Processing failed'));
          }
          
          // Continue polling if still processing...

        } catch (error) {
          clearInterval(pollInterval);
          const errorMessage = error instanceof Error ? error.message : 'Status check failed';
          
          setUploadState({
            isUploading: false,
            progress: 0,
            status: 'error',
            message: errorMessage,
            error: errorMessage,
          });

          reject(error);
        }
      }, 2000); // Poll every 2 seconds

      // Timeout after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        const timeoutError = new Error('Processing timeout');
        setUploadState({
          isUploading: false,
          progress: 0,
          status: 'error',
          message: 'Processing took too long',
          error: 'Timeout',
        });
        reject(timeoutError);
      }, 5 * 60 * 1000);
    });
  }, []);

  // Load user's uploaded files
  const loadUploadedFiles = useCallback(async () => {
    try {
      const response = await fetch('/api/oracle/files/status', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to load files');
      }

      const data = await response.json();
      setUploadedFiles(data.files || []);
      return data;

    } catch (error) {
      console.error('Failed to load uploaded files:', error);
      return { files: [], stats: null };
    }
  }, []);

  // Reset upload state
  const resetUpload = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: 0,
      status: 'idle',
      message: '',
    });
  }, []);

  return {
    uploadState,
    uploadedFiles,
    uploadFile,
    loadUploadedFiles,
    resetUpload,
    pollFileStatus,
  };
}
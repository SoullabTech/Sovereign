// Types for @/app/hooks/useFileUpload
declare module '@/app/hooks/useFileUpload' {
  export interface FileUploadState {
    isUploading: boolean;
    message: string;
    progress: number;
    status: 'idle' | 'uploading' | 'completed' | 'error';
    error?: string;
  }
}

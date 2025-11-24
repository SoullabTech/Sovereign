"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";

interface FileUploadProps {
  onUpload?: (file: File) => void;
  endpoint?: string;
  className?: string;
  multiple?: boolean;
}

export default function FileUpload({ 
  onUpload, 
  endpoint = '/api/files/upload',
  className = '',
  multiple = false 
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const { addToast } = useToast();

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    
    try {
      for (const file of Array.from(files)) {
        if (onUpload) {
          onUpload(file);
        } else {
          await uploadFile(file);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      addToast({
        title: "Upload failed",
        description: "There was an error uploading your file. Please try again.",
        variant: "error",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const result = await response.json();
    
    addToast({
      title: "Maya is absorbing your file",
      description: result.message || `${file.name} will be woven into future conversations.`,
      variant: "success",
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = '';
  };

  if (className.includes('minimal')) {
    return (
      <label className={`cursor-pointer transition-colors ${
        isUploading 
          ? 'text-gold-divine/50 cursor-not-allowed' 
          : 'text-gold-amber hover:text-gold-divine'
      } ${className}`}>
        {isUploading ? (
          <svg width="20" height="20" className="animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 11-6.219-8.56" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        )}
        <input 
          type="file" 
          className="hidden" 
          accept=".txt,.pdf,.doc,.docx,.png,.jpg,.jpeg"
          onChange={handleFileChange}
          disabled={isUploading}
          multiple={multiple}
        />
      </label>
    );
  }

  return (
    <div
      className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${
        dragActive 
          ? "border-gold-divine bg-gold-divine/10" 
          : "border-gold-amber/40 bg-gold-divine/5"
      } ${className}`}
      onDragOver={(e) => {
        e.preventDefault();
        if (!isUploading) setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
        if (!isUploading) handleFiles(e.dataTransfer.files);
      }}
    >
      {isUploading ? (
        <div className="text-gold-divine/70">
          <svg width="32" height="32" className="animate-spin mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 11-6.219-8.56" />
          </svg>
          <p>Uploading...</p>
        </div>
      ) : (
        <>
          <p className="text-gold-divine/80 mb-2">📂 Drag & drop files here</p>
          <p className="text-sm text-gold-amber/60 mb-3">or</p>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".txt,.pdf,.doc,.docx,.png,.jpg,.jpeg"
            multiple={multiple}
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer px-4 py-2 bg-gold-divine text-white rounded-lg hover:bg-gold-amber transition"
          >
            Select Files
          </label>
        </>
      )}
    </div>
  );
}
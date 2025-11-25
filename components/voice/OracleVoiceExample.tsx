"use client";

import React, { useState } from 'react';
import { Send, Upload, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import MicInputWithTorus from './MicInputWithTorus';

interface OracleVoiceExampleProps {
  onSubmit?: (content: {
    text?: string;
    transcription?: string;
    files?: File[];
    urls?: string[];
  }) => void;
  disabled?: boolean;
}

export default function OracleVoiceExample({ onSubmit, disabled = false }: OracleVoiceExampleProps) {
  const [textInput, setTextInput] = useState('');
  const [transcribedText, setTranscribedText] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [urls, setUrls] = useState<string[]>([]);

  // Handle text input submission
  const handleTextSubmit = () => {
    const content = {
      text: textInput,
      transcription: transcribedText,
      files: uploadedFiles,
      urls: urls
    };
    
    if (onSubmit && (textInput.trim() || transcribedText.trim() || uploadedFiles.length || urls.length)) {
      onSubmit(content);
      // Clear inputs
      setTextInput('');
      setTranscribedText('');
      setUploadedFiles([]);
      setUrls([]);
      setUrlInput('');
    }
  };

  // Handle voice transcription
  const handleTranscription = (text: string) => {
    setTranscribedText(text);
  };

  // Handle voice submission (direct from voice)
  const handleVoiceSubmit = (text: string) => {
    const content = {
      transcription: text,
      files: uploadedFiles,
      urls: urls
    };
    
    if (onSubmit) {
      onSubmit(content);
      // Clear inputs
      setTranscribedText('');
      setUploadedFiles([]);
      setUrls([]);
      setUrlInput('');
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setUploadedFiles(prev => [...prev, ...Array.from(event.target.files || [])]);
    }
  };

  // Add URL
  const addUrl = () => {
    if (urlInput.trim() && isValidUrl(urlInput.trim())) {
      setUrls(prev => [...prev, urlInput.trim()]);
      setUrlInput('');
    }
  };

  // Remove URL
  const removeUrl = (index: number) => {
    setUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Remove file
  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Validate URL
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-gray-900/50 backdrop-blur-xl border-sacred-gold/20">
      <CardContent className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-sacred-gold">Maya's Voice Interface</h2>
          <p className="text-sm text-gray-400">Speak, type, upload files, or share URLs - Maya understands it all</p>
        </div>

        {/* Voice Input with Hybrid Torus */}
        <div className="flex flex-col items-center space-y-4">
          <MicInputWithTorus
            onTranscription={handleTranscription}
            onSubmit={handleVoiceSubmit}
            disabled={disabled}
            className="w-full"
            placeholder="Speak to Maya..."
          />
        </div>

        {/* Text Input Area */}
        <div className="space-y-3">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Or type your message to Maya..."
            className="w-full h-32 p-4 bg-gray-800/50 border border-gray-600 rounded-lg resize-none focus:border-sacred-gold focus:ring-1 focus:ring-sacred-gold/50 text-white placeholder-gray-400"
            disabled={disabled}
          />
          
          {/* Combined transcription display */}
          <AnimatePresence>
            {transcribedText && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-sacred-gold/10 border border-sacred-gold/20 rounded-lg p-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-sacred-gold/70 mb-1">Voice transcription:</p>
                    <p className="text-sm text-sacred-gold/90">{transcribedText}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setTranscribedText('')}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* File Upload */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Upload className="w-5 h-5 text-sacred-gold" />
            <span className="text-sm font-medium text-sacred-gold">Files</span>
          </div>
          
          <input
            type="file"
            multiple
            accept=".pdf,.txt,.md,.docx,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
            disabled={disabled}
          />
          
          <Button
            variant="outline"
            onClick={() => document.getElementById('file-upload')?.click()}
            disabled={disabled}
            className="w-full border-dashed border-sacred-gold/30 hover:border-sacred-gold/50 text-sacred-gold/70 hover:text-sacred-gold"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload files for Maya to analyze
          </Button>

          {/* Uploaded files display */}
          <AnimatePresence>
            {uploadedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-800/30 rounded border border-gray-700">
                    <span className="text-sm text-gray-300 truncate">{file.name}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFile(index)}
                      className="text-gray-400 hover:text-red-400"
                    >
                      ✕
                    </Button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* URL Input */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Link className="w-5 h-5 text-sacred-gold" />
            <span className="text-sm font-medium text-sacred-gold">URLs</span>
          </div>
          
          <div className="flex space-x-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Share a URL for Maya to analyze..."
              className="flex-1 p-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:border-sacred-gold focus:ring-1 focus:ring-sacred-gold/50 text-white placeholder-gray-400"
              disabled={disabled}
              onKeyPress={(e) => e.key === 'Enter' && addUrl()}
            />
            <Button
              onClick={addUrl}
              disabled={disabled || !isValidUrl(urlInput.trim())}
              variant="outline"
              className="border-sacred-gold/30 hover:border-sacred-gold/50 text-sacred-gold/70 hover:text-sacred-gold"
            >
              Add
            </Button>
          </div>

          {/* URLs display */}
          <AnimatePresence>
            {urls.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                {urls.map((url, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-800/30 rounded border border-gray-700">
                    <span className="text-sm text-gray-300 truncate">{url}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeUrl(index)}
                      className="text-gray-400 hover:text-red-400"
                    >
                      ✕
                    </Button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-4">
          <Button
            size="lg"
            onClick={handleTextSubmit}
            disabled={disabled || (!textInput.trim() && !transcribedText.trim() && !uploadedFiles.length && !urls.length)}
            className="bg-sacred-gold hover:bg-sacred-gold/90 text-black font-semibold px-8 py-3 shadow-lg shadow-sacred-gold/25"
          >
            <Send className="w-5 h-5 mr-2" />
            Send to Maya
          </Button>
        </div>

        {/* Capabilities Info */}
        <div className="text-center text-xs text-gray-500 space-y-1">
          <p>Maya can process:</p>
          <p>🎙️ Voice input • 💬 Text messages • 📄 PDF/Word documents • 🖼️ Images • 🌐 Web articles</p>
        </div>
      </CardContent>
    </Card>
  );
}
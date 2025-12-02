import React, { useState } from 'react';
import { Download, FileText, FileJson, FileX, ChevronDown, Calendar, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface ConversationDownloadButtonProps {
  userId: string;
  sessionId?: string;
  variant?: 'button' | 'icon' | 'menu-item';
  className?: string;
  showAdvancedOptions?: boolean;
}

type ExportFormat = 'markdown' | 'json' | 'txt';

interface ExportOptions {
  format: ExportFormat;
  includeMetadata: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  sessionIds?: string[];
}

export const ConversationDownloadButton: React.FC<ConversationDownloadButtonProps> = ({
  userId,
  sessionId,
  variant = 'button',
  className = '',
  showAdvancedOptions = false
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'markdown',
    includeMetadata: false
  });

  const formatLabels: Record<ExportFormat, string> = {
    markdown: 'Markdown (.md)',
    json: 'JSON (.json)',
    txt: 'Text (.txt)'
  };

  const formatIcons: Record<ExportFormat, React.ReactNode> = {
    markdown: <FileText className="w-4 h-4" />,
    json: <FileJson className="w-4 h-4" />,
    txt: <FileX className="w-4 h-4" />
  };

  /**
   * Download conversations with current options
   */
  const downloadConversation = async () => {
    if (!userId) {
      toast.error('User ID required for download');
      return;
    }

    setIsDownloading(true);

    try {
      const params = new URLSearchParams({
        userId,
        format: exportOptions.format,
        includeMetadata: exportOptions.includeMetadata.toString()
      });

      if (sessionId) {
        params.append('sessionId', sessionId);
      }

      if (exportOptions.dateRange?.start) {
        params.append('startDate', exportOptions.dateRange.start);
      }

      if (exportOptions.dateRange?.end) {
        params.append('endDate', exportOptions.dateRange.end);
      }

      const response = await fetch(`/api/conversations/export?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Download failed');
      }

      // Get filename from response headers
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition?.match(/filename="(.+)"/)?.[1] ||
                      `conversation-${new Date().toISOString().split('T')[0]}.${exportOptions.format}`;

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success(`Downloaded conversation as ${exportOptions.format.toUpperCase()}`);
      setShowOptions(false);

    } catch (error) {
      console.error('Download error:', error);
      toast.error(error instanceof Error ? error.message : 'Download failed');
    } finally {
      setIsDownloading(false);
    }
  };

  /**
   * Quick download (markdown format, current session or all)
   */
  const quickDownload = async () => {
    const quickOptions: ExportOptions = {
      format: 'markdown',
      includeMetadata: false
    };

    const originalOptions = exportOptions;
    setExportOptions(quickOptions);

    await downloadConversation();

    setExportOptions(originalOptions);
  };

  /**
   * Render button based on variant
   */
  const renderButton = () => {
    const baseClass = "flex items-center gap-2 transition-colors duration-200";

    switch (variant) {
      case 'icon':
        return (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={showAdvancedOptions ? () => setShowOptions(true) : quickDownload}
            disabled={isDownloading}
            className={`${baseClass} p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 disabled:opacity-50 ${className}`}
            title={sessionId ? "Download this conversation" : "Download all conversations"}
          >
            <Download className={`w-4 h-4 ${isDownloading ? 'animate-pulse' : ''}`} />
          </motion.button>
        );

      case 'menu-item':
        return (
          <motion.button
            whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
            onClick={showAdvancedOptions ? () => setShowOptions(true) : quickDownload}
            disabled={isDownloading}
            className={`${baseClass} w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 ${className}`}
          >
            <Download className={`w-4 h-4 ${isDownloading ? 'animate-pulse' : ''}`} />
            <span>Download Conversation</span>
            {showAdvancedOptions && <ChevronDown className="w-4 h-4 ml-auto" />}
          </motion.button>
        );

      case 'button':
      default:
        return (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={showAdvancedOptions ? () => setShowOptions(true) : quickDownload}
            disabled={isDownloading}
            className={`${baseClass} px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
          >
            <Download className={`w-4 h-4 ${isDownloading ? 'animate-pulse' : ''}`} />
            <span>{isDownloading ? 'Downloading...' : 'Download'}</span>
            {showAdvancedOptions && <ChevronDown className="w-4 h-4" />}
          </motion.button>
        );
    }
  };

  /**
   * Render advanced options modal
   */
  const renderAdvancedOptions = () => {
    if (!showAdvancedOptions) return null;

    return (
      <AnimatePresence>
        {showOptions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowOptions(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 shadow-xl"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Download className="w-5 h-5" />
                Export Options
              </h3>

              {/* Format Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">Export Format</label>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(formatLabels).map(([format, label]) => (
                    <motion.button
                      key={format}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setExportOptions(prev => ({ ...prev, format: format as ExportFormat }))}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        exportOptions.format === format
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {formatIcons[format as ExportFormat]}
                      <span>{label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">Options</label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeMetadata}
                    onChange={(e) => setExportOptions(prev => ({
                      ...prev,
                      includeMetadata: e.target.checked
                    }))}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Include message metadata</span>
                </label>
              </div>

              {/* Date Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date Range (Optional)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    value={exportOptions.dateRange?.start || ''}
                    onChange={(e) => setExportOptions(prev => ({
                      ...prev,
                      dateRange: {
                        start: e.target.value,
                        end: prev.dateRange?.end || ''
                      }
                    }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    placeholder="Start date"
                  />
                  <input
                    type="date"
                    value={exportOptions.dateRange?.end || ''}
                    onChange={(e) => setExportOptions(prev => ({
                      ...prev,
                      dateRange: {
                        start: prev.dateRange?.start || '',
                        end: e.target.value
                      }
                    }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    placeholder="End date"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowOptions(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={downloadConversation}
                  disabled={isDownloading}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDownloading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Download
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <>
      {renderButton()}
      {renderAdvancedOptions()}
    </>
  );
};

export default ConversationDownloadButton;
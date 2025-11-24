"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  BookOpen,
  Search,
  Tag,
  FileText,
  Brain,
  Sparkles,
  RefreshCw,
  Database,
  TreePine,
  Link
} from 'lucide-react';

interface VaultNote {
  title: string;
  content: string;
  path: string;
  tags: string[];
  backlinks: string[];
  frontmatter: any;
  relevance?: number;
}

interface VaultConnection {
  from: string;
  to: string;
  type: string;
  strength: number;
}

interface VaultStats {
  totalNotes: number;
  frameworks: number;
  concepts: number;
  practices: number;
  books: number;
  integrations: number;
  lastConnected: string;
}

interface ObsidianVaultPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ObsidianVaultPanel({ isOpen, onClose }: ObsidianVaultPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [vaultStats, setVaultStats] = useState<VaultStats | null>(null);
  const [searchResults, setSearchResults] = useState<VaultNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  // Check vault connection status
  useEffect(() => {
    if (isOpen) {
      checkVaultConnection();
    }
  }, [isOpen]);

  const checkVaultConnection = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/obsidian/status');
      const data = await response.json();

      if (data.success) {
        setConnected(true);
        setVaultStats(data.stats);
      } else {
        setConnected(false);
      }
    } catch (error) {
      console.error('Failed to check vault connection:', error);
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !connected) return;

    try {
      setLoading(true);
      const response = await fetch('/api/obsidian/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          filter: selectedFilter,
          maxResults: 10
        })
      });

      const data = await response.json();
      if (data.success) {
        setSearchResults(data.results || []);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/obsidian/connect', {
        method: 'POST'
      });

      const data = await response.json();
      if (data.success) {
        setConnected(true);
        setVaultStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to connect to vault:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilterOptions = () => [
    { value: 'all', label: 'All Knowledge', icon: Database },
    { value: 'framework', label: 'Frameworks', icon: Brain },
    { value: 'concept', label: 'Concepts', icon: Sparkles },
    { value: 'practice', label: 'Practices', icon: TreePine },
    { value: 'integration', label: 'Integrations', icon: Link },
    { value: 'book', label: 'Books', icon: BookOpen }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, x: 100 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            exit={{ scale: 0.9, opacity: 0, x: 100 }}
            className="bg-[#0A0D16] border border-gray-800 rounded-xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b border-gray-800 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-blue-500 rounded-full flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-white">Obsidian Vault</h2>
                    <p className="text-gray-400">
                      {connected ? 'Connected to your knowledge base' : 'Connect to access your wisdom'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {!connected ? (
                /* Connection Setup */
                <div className="flex items-center justify-center h-full p-8">
                  <div className="text-center max-w-md">
                    <motion.div
                      animate={{ rotate: loading ? 360 : 0 }}
                      transition={{ duration: 2, repeat: loading ? Infinity : 0, ease: "linear" }}
                      className="w-20 h-20 bg-gradient-to-br from-amber-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                      <BookOpen className="w-10 h-10 text-white" />
                    </motion.div>

                    <h3 className="text-xl font-semibold text-white mb-4">
                      Connect to Your Obsidian Vault
                    </h3>
                    <p className="text-gray-400 mb-8 leading-relaxed">
                      Access your personal knowledge base, frameworks, and wisdom directly
                      within Maya's consciousness. Your notes become part of her understanding.
                    </p>

                    <button
                      onClick={handleConnect}
                      disabled={loading}
                      className="px-8 py-3 bg-gradient-to-r from-amber-600 to-blue-600 text-white font-medium rounded-lg hover:from-amber-700 hover:to-blue-700 transition-all disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="flex items-center space-x-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Connecting...</span>
                        </div>
                      ) : (
                        'Connect Vault'
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                /* Vault Interface */
                <div className="flex flex-col h-full">
                  {/* Stats Bar */}
                  {vaultStats && (
                    <div className="border-b border-gray-800 p-4">
                      <div className="grid grid-cols-6 gap-4 text-center">
                        <div className="bg-gray-800/50 rounded-lg p-3">
                          <div className="text-lg font-semibold text-white">{vaultStats.totalNotes}</div>
                          <div className="text-xs text-gray-400">Notes</div>
                        </div>
                        <div className="bg-amber-500/20 rounded-lg p-3">
                          <div className="text-lg font-semibold text-amber-400">{vaultStats.frameworks}</div>
                          <div className="text-xs text-gray-400">Frameworks</div>
                        </div>
                        <div className="bg-blue-500/20 rounded-lg p-3">
                          <div className="text-lg font-semibold text-blue-400">{vaultStats.concepts}</div>
                          <div className="text-xs text-gray-400">Concepts</div>
                        </div>
                        <div className="bg-green-500/20 rounded-lg p-3">
                          <div className="text-lg font-semibold text-green-400">{vaultStats.practices}</div>
                          <div className="text-xs text-gray-400">Practices</div>
                        </div>
                        <div className="bg-yellow-500/20 rounded-lg p-3">
                          <div className="text-lg font-semibold text-yellow-400">{vaultStats.books}</div>
                          <div className="text-xs text-gray-400">Books</div>
                        </div>
                        <div className="bg-pink-500/20 rounded-lg p-3">
                          <div className="text-lg font-semibold text-pink-400">{vaultStats.integrations}</div>
                          <div className="text-xs text-gray-400">Integrations</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 text-center mt-3">
                        Last synced: {formatDate(vaultStats.lastConnected)}
                      </div>
                    </div>
                  )}

                  {/* Search Interface */}
                  <div className="border-b border-gray-800 p-4">
                    <div className="flex space-x-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                          placeholder="Search your knowledge vault..."
                          className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <select
                        value={selectedFilter}
                        onChange={(e) => setSelectedFilter(e.target.value)}
                        className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                      >
                        {getFilterOptions().map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={handleSearch}
                        disabled={!searchQuery.trim() || loading}
                        className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
                      >
                        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Results */}
                  <div className="flex-1 overflow-y-auto p-4">
                    {searchResults.length === 0 && searchQuery ? (
                      <div className="text-center py-12">
                        <Search className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                        <h3 className="text-lg font-medium text-white mb-2">No results found</h3>
                        <p className="text-gray-400">Try adjusting your search terms or filter</p>
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="text-center py-12">
                        <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                        <h3 className="text-lg font-medium text-white mb-2">Search Your Vault</h3>
                        <p className="text-gray-400">Enter a query to explore your knowledge base</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {searchResults.map((note, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-gray-800/30 border border-gray-700 rounded-lg p-4 hover:bg-gray-800/50 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                <h4 className="font-medium text-white truncate">{note.title}</h4>
                              </div>
                              {note.relevance && (
                                <span className="text-xs text-amber-400 bg-amber-500/20 px-2 py-1 rounded">
                                  {Math.round(note.relevance * 100)}% match
                                </span>
                              )}
                            </div>

                            <p className="text-sm text-gray-300 mb-3 line-clamp-3">
                              {note.content.substring(0, 200)}...
                            </p>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {note.tags.slice(0, 3).map((tag, tagIndex) => (
                                  <span
                                    key={tagIndex}
                                    className="text-xs text-blue-400 bg-blue-500/20 px-2 py-1 rounded"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                                {note.tags.length > 3 && (
                                  <span className="text-xs text-gray-500">
                                    +{note.tags.length - 3} more
                                  </span>
                                )}
                              </div>

                              <div className="text-xs text-gray-500">
                                {note.path}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileMemoryIntegration = exports.FileMemoryIntegration = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const openai_1 = require("openai");
const supabase = (0, supabase_js_1.createClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const openai = new openai_1.OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});
class FileMemoryIntegration {
    /**
     * Retrieve relevant files based on query using semantic search
     */
    async retrieveRelevantFiles(userId, query, options = {}) {
        const { limit = 5, category, minRelevance = 0.75, includeMetadata = true } = options;
        try {
            // Generate query embedding
            const queryEmbedding = await this.generateEmbedding(query);
            // Search for similar file chunks with citation metadata
            const { data: relevantChunks, error } = await supabase.rpc('match_file_embeddings', {
                query_embedding: queryEmbedding,
                match_threshold: minRelevance,
                match_count: limit * 3, // Get more chunks to group by file
                filter_user_id: userId
            });
            if (error) {
                console.error('File search error:', error);
                return [];
            }
            if (!relevantChunks || relevantChunks.length === 0) {
                return [];
            }
            // Filter by category if specified
            const filteredChunks = category
                ? relevantChunks.filter((chunk) => chunk.category === category)
                : relevantChunks;
            // Group chunks by file and prepare context
            const fileGroups = new Map();
            for (const chunk of filteredChunks) {
                if (!fileGroups.has(chunk.file_id)) {
                    fileGroups.set(chunk.file_id, {
                        fileId: chunk.file_id,
                        filename: chunk.filename,
                        category: chunk.category,
                        relevantChunks: [],
                        citationCount: 0
                    });
                }
                const fileContext = fileGroups.get(chunk.file_id);
                fileContext.relevantChunks.push({
                    content: chunk.content,
                    relevance: chunk.similarity,
                    metadata: chunk.metadata || {},
                    chunkIndex: chunk.chunk_index,
                    pageNumber: chunk.page_number,
                    sectionTitle: chunk.section_title,
                    sectionLevel: chunk.section_level,
                    preview: chunk.chunk_preview || chunk.content.substring(0, 200)
                });
            }
            // Get citation counts for each file
            const fileIds = Array.from(fileGroups.keys());
            if (fileIds.length > 0) {
                const { data: citations } = await supabase
                    .from('file_citations')
                    .select('file_id')
                    .in('file_id', fileIds);
                const citationCounts = citations?.reduce((acc, citation) => {
                    acc[citation.file_id] = (acc[citation.file_id] || 0) + 1;
                    return acc;
                }, {}) || {};
                // Update citation counts
                fileGroups.forEach((context, fileId) => {
                    context.citationCount = citationCounts[fileId] || 0;
                });
            }
            // Sort files by relevance and limit results
            const sortedFiles = Array.from(fileGroups.values())
                .sort((a, b) => {
                // Sort by highest relevance of top chunk, then by citation count
                const aRelevance = Math.max(...a.relevantChunks.map(c => c.relevance));
                const bRelevance = Math.max(...b.relevantChunks.map(c => c.relevance));
                if (Math.abs(aRelevance - bRelevance) < 0.05) {
                    return b.citationCount - a.citationCount;
                }
                return bRelevance - aRelevance;
            })
                .slice(0, limit);
            // Sort chunks within each file by relevance
            sortedFiles.forEach(file => {
                file.relevantChunks.sort((a, b) => b.relevance - a.relevance);
                file.relevantChunks = file.relevantChunks.slice(0, 3); // Max 3 chunks per file
            });
            console.log(`[FileMemory] Retrieved ${sortedFiles.length} relevant files for query`);
            return sortedFiles;
        }
        catch (error) {
            console.error('Error retrieving relevant files:', error);
            return [];
        }
    }
    /**
     * Record that Maya cited a file in conversation with enhanced metadata
     */
    async recordCitation(userId, fileId, conversationId, chunkId, relevanceScore, context, citationMetadata) {
        try {
            const { error } = await supabase
                .from('file_citations')
                .insert({
                file_id: fileId,
                user_id: userId,
                conversation_id: conversationId,
                cited_chunk_id: chunkId,
                relevance_score: relevanceScore,
                context: context,
                page_number: citationMetadata?.pageNumber,
                section_title: citationMetadata?.sectionTitle,
                section_level: citationMetadata?.sectionLevel,
                chunk_preview: citationMetadata?.preview,
                start_char: citationMetadata?.startChar,
                end_char: citationMetadata?.endChar
            });
            if (error) {
                console.error('Error recording citation:', error);
            }
        }
        catch (error) {
            console.error('Error recording file citation:', error);
        }
    }
    /**
     * Get file statistics for a user
     */
    async getFileStats(userId) {
        try {
            const { data, error } = await supabase.rpc('get_file_stats', {
                target_user_id: userId
            });
            if (error) {
                console.error('Error getting file stats:', error);
                return null;
            }
            return data?.[0] || {
                total_files: 0,
                ready_files: 0,
                processing_files: 0,
                total_chunks: 0,
                categories: {}
            };
        }
        catch (error) {
            console.error('Error retrieving file stats:', error);
            return null;
        }
    }
    /**
     * Search files by filename or content
     */
    async searchFiles(userId, searchTerm, options = {}) {
        const { category, limit = 10 } = options;
        try {
            let query = supabase
                .from('user_files')
                .select(`
          id,
          filename,
          original_name,
          category,
          tags,
          maya_reflection,
          created_at,
          status
        `)
                .eq('user_id', userId)
                .eq('status', 'ready')
                .ilike('filename', `%${searchTerm}%`);
            if (category) {
                query = query.eq('category', category);
            }
            query = query.limit(limit);
            const { data, error } = await query;
            if (error) {
                console.error('File search error:', error);
                return [];
            }
            return data || [];
        }
        catch (error) {
            console.error('Error searching files:', error);
            return [];
        }
    }
    /**
     * Get recently accessed files for quick reference
     */
    async getRecentlyAccessedFiles(userId, limit = 5) {
        try {
            const { data, error } = await supabase
                .from('file_citations')
                .select(`
          file_id,
          created_at,
          user_files (
            id,
            filename,
            category,
            maya_reflection
          )
        `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(limit);
            if (error) {
                console.error('Error getting recent files:', error);
                return [];
            }
            // Deduplicate by file_id
            const uniqueFiles = new Map();
            data?.forEach(item => {
                if (!uniqueFiles.has(item.file_id) && item.user_files) {
                    uniqueFiles.set(item.file_id, {
                        ...item.user_files,
                        lastAccessed: item.created_at
                    });
                }
            });
            return Array.from(uniqueFiles.values());
        }
        catch (error) {
            console.error('Error retrieving recently accessed files:', error);
            return [];
        }
    }
    /**
     * Prepare file context for Maya&apos;s conversation prompts with citation metadata
     */
    formatFileContextForPrompt(fileContexts) {
        if (fileContexts.length === 0) {
            return '';
        }
        let contextString = '\n## Relevant Knowledge from User\'s Library:\n\n';
        fileContexts.forEach((file, index) => {
            contextString += `### ${file.filename}`;
            if (file.category) {
                contextString += ` (${file.category})`;
            }
            contextString += '\n';
            file.relevantChunks.forEach((chunk, chunkIndex) => {
                // Add page and section info if available
                if (chunk.pageNumber || chunk.sectionTitle) {
                    contextString += `**`;
                    if (chunk.pageNumber) {
                        contextString += `Page ${chunk.pageNumber}`;
                    }
                    if (chunk.sectionTitle) {
                        if (chunk.pageNumber)
                            contextString += ', ';
                        contextString += `"${chunk.sectionTitle}"`;
                    }
                    contextString += `:**\n`;
                }
                contextString += `${chunk.content}\n\n`;
            });
            if (index < fileContexts.length - 1) {
                contextString += '---\n\n';
            }
        });
        contextString += '\n**Citation Instructions:** When referencing this knowledge, naturally mention the source file name and page/section when appropriate. For example: "In your research-notes.pdf (page 14, Chapter 2), you mentioned..." This builds trust and helps the user locate the original information.\n';
        return contextString;
    }
    /**
     * Format citation data for response metadata (used by UI components)
     */
    formatCitationMetadata(fileContexts) {
        return fileContexts.flatMap(file => file.relevantChunks.map(chunk => ({
            fileId: file.fileId,
            fileName: file.filename,
            category: file.category,
            pageNumber: chunk.pageNumber,
            sectionTitle: chunk.sectionTitle,
            sectionLevel: chunk.sectionLevel,
            preview: chunk.preview,
            relevance: chunk.relevance,
            chunkIndex: chunk.chunkIndex
        })));
    }
    async generateEmbedding(text) {
        const response = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: text.trim()
        });
        return response.data[0].embedding;
    }
}
exports.FileMemoryIntegration = FileMemoryIntegration;
// Export singleton instance
exports.fileMemoryIntegration = new FileMemoryIntegration();
//# sourceMappingURL=FileMemoryIntegration.js.map
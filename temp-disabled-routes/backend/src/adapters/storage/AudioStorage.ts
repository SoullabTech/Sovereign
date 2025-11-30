export interface AudioStorage {
  /**
   * Save audio file and return public URL
   * @param fileName - Name of the file (e.g., "abc123.mp3")
   * @param bytes - Audio data as Uint8Array
   * @param contentType - MIME type (e.g., "audio/mpeg")
   * @returns Public URL for accessing the audio file
   */
  save(fileName: string, bytes: Uint8Array, contentType: string): Promise<string>;
  
  /**
   * Delete audio file (optional cleanup)
   * @param fileName - Name of the file to delete
   */
  delete?(fileName: string): Promise<void>;
  
  /**
   * Get storage info (optional monitoring)
   */
  getStats?(): Promise<{ files: number; totalBytes: number }>;
}
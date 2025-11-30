import { AudioStorage } from './AudioStorage';
import fs from 'node:fs/promises';
import path from 'node:path';

export class LocalAudioStorage implements AudioStorage {
  constructor(
    private outputDir: string = path.resolve(process.cwd(), 'public', 'voice'),
    private publicPath: string = '/voice'
  ) {}

  async save(fileName: string, bytes: Uint8Array, contentType: string): Promise<string> {
    // Ensure directory exists
    await fs.mkdir(this.outputDir, { recursive: true });
    
    // Write file
    const filePath = path.join(this.outputDir, fileName);
    await fs.writeFile(filePath, bytes);
    
    // Return public URL
    return `${this.publicPath}/${fileName}`;
  }

  async delete(fileName: string): Promise<void> {
    try {
      const filePath = path.join(this.outputDir, fileName);
      await fs.unlink(filePath);
    } catch (error) {
      // File might not exist, that's ok
    }
  }

  async getStats(): Promise<{ files: number; totalBytes: number }> {
    try {
      const files = await fs.readdir(this.outputDir);
      let totalBytes = 0;
      let audioFiles = 0;
      
      for (const file of files) {
        if (file.endsWith('.mp3') || file.endsWith('.wav')) {
          const filePath = path.join(this.outputDir, file);
          const stats = await fs.stat(filePath);
          totalBytes += stats.size;
          audioFiles++;
        }
      }
      
      return { files: audioFiles, totalBytes };
    } catch (error) {
      return { files: 0, totalBytes: 0 };
    }
  }
}
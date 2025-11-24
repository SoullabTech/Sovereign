import { AudioStorage } from './AudioStorage';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

export class S3AudioStorage implements AudioStorage {
  private s3: S3Client;
  private bucket: string;
  private publicBase: string;
  private keyPrefix: string;

  constructor() {
    this.s3 = new S3Client({ 
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: process.env.AWS_ACCESS_KEY_ID ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      } : undefined // Use IAM role if no keys provided
    });
    
    this.bucket = process.env.AUDIO_BUCKET || 'spiralogic-voice';
    this.publicBase = process.env.CDN_BASE_URL || `https://${this.bucket}.s3.amazonaws.com`;
    this.keyPrefix = process.env.AUDIO_KEY_PREFIX || 'voice';
  }

  async save(fileName: string, bytes: Uint8Array, contentType: string): Promise<string> {
    const key = `${this.keyPrefix}/${fileName}`;
    
    await this.s3.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: bytes,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable', // 1 year cache
      ACL: 'public-read', // Or use CloudFront with private bucket
      Metadata: {
        'synthesis-date': new Date().toISOString(),
        'provider': 'elevenlabs'
      }
    }));
    
    console.log(`☁️  Uploaded voice to S3: ${key}`);
    return `${this.publicBase}/${key}`;
  }

  async delete(fileName: string): Promise<void> {
    const key = `${this.keyPrefix}/${fileName}`;
    
    try {
      await this.s3.send(new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key
      }));
      console.log(`🗑️  Deleted voice from S3: ${key}`);
    } catch (error) {
      console.warn(`Failed to delete ${key} from S3:`, error);
    }
  }

  async getStats(): Promise<{ files: number; totalBytes: number }> {
    // For production, implement using ListObjectsV2Command with pagination
    // This is a placeholder
    return { files: 0, totalBytes: 0 };
  }
}
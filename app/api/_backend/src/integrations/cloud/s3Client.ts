// @ts-nocheck
// Cloud Integration Chokepoint: AWS S3 Client
// This file is the ONLY place AWS SDK should be imported
// All other files must import from this wrapper

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

/**
 * Get S3 client instance
 *
 * DEPRECATION NOTICE:
 * S3 storage violates MAIA sovereignty principles.
 * This wrapper exists to:
 * 1. Create a single chokepoint for auditing
 * 2. Make migration to local storage easier
 *
 * TODO: Replace with local filesystem storage
 */
export function getS3Client(): S3Client {
  const region = process.env.AWS_REGION || 'us-east-1';
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey) {
    throw new Error('AWS credentials not configured. Consider migrating to local storage.');
  }

  return new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

/**
 * Upload file to S3
 * @deprecated Migrate to local filesystem storage
 */
export async function uploadToS3(
  bucket: string,
  key: string,
  body: Buffer | ReadableStream,
  contentType?: string
): Promise<void> {
  const client = getS3Client();

  const upload = new Upload({
    client,
    params: {
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    },
  });

  await upload.done();
}

/**
 * Delete file from S3
 * @deprecated Migrate to local filesystem storage
 */
export async function deleteFromS3(bucket: string, key: string): Promise<void> {
  const client = getS3Client();

  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  await client.send(command);
}

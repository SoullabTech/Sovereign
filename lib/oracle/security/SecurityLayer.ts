/**
 * Security Layer - Privacy Guarantees for Field Intelligence
 *
 * Implements the three-layer privacy architecture:
 * Layer 1: Individual Agent Memory (Encrypted, User-Owned)
 * Layer 2: Pattern Extraction (Removes Identifying Information)
 * Layer 3: Collective Pattern Library (No Individual Data)
 *
 * Core principle: "Remember the healing pattern, not the wound"
 */

import crypto from 'crypto';
import { FieldSignature } from '../memory/IndividualFieldMemory';

export interface EncryptedData {
  encrypted: string;
  iv: string;
  auth_tag: string;
  algorithm: string;
}

export interface AnonymousPattern {
  pattern_hash: string;
  field_signature: Partial<FieldSignature>;
  success_rate: number;
  upload_scheduled: number; // Timestamp when upload will occur
  anonymization_level: 'full' | 'partial' | 'minimal';
}

export class SecurityLayer {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly KEY_LENGTH = 32;
  private static readonly IV_LENGTH = 16;
  private static readonly SALT_LENGTH = 64;
  private static readonly TAG_LENGTH = 16;
  private static readonly ITERATIONS = 100000;

  // Anonymization delays (milliseconds)
  private static readonly MIN_DELAY = 60 * 60 * 1000; // 1 hour
  private static readonly MAX_DELAY = 24 * 60 * 60 * 1000; // 24 hours

  // Pattern upload queue with delays
  private upload_queue = new Map<string, NodeJS.Timeout>();

  constructor() {
    console.log('🔒 Security Layer initialized - privacy-first architecture active');
  }

  /**
   * Encrypt data with user-specific key
   * Used for individual vault storage
   */
  async encrypt_user_data(
    data: any,
    user_key: string
  ): Promise<EncryptedData> {
    console.log('🔐 Encrypting user data');

    try {
      // Derive encryption key from user key
      const salt = crypto.randomBytes(SecurityLayer.SALT_LENGTH);
      const key = crypto.pbkdf2Sync(
        user_key,
        salt,
        SecurityLayer.ITERATIONS,
        SecurityLayer.KEY_LENGTH,
        'sha256'
      );

      // Generate IV
      const iv = crypto.randomBytes(SecurityLayer.IV_LENGTH);

      // Create cipher
      const cipher = crypto.createCipheriv(SecurityLayer.ALGORITHM, key, iv);

      // Encrypt data
      const json_data = JSON.stringify(data);
      let encrypted = cipher.update(json_data, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Get auth tag
      const auth_tag = cipher.getAuthTag();

      return {
        encrypted: encrypted + ':' + salt.toString('hex'),
        iv: iv.toString('hex'),
        auth_tag: auth_tag.toString('hex'),
        algorithm: SecurityLayer.ALGORITHM
      };
    } catch (error) {
      console.error('❌ Encryption failed:', error);
      throw new Error('Failed to encrypt user data');
    }
  }

  /**
   * Decrypt user data with their key
   */
  async decrypt_user_data(
    encrypted_data: EncryptedData,
    user_key: string
  ): Promise<any> {
    console.log('🔓 Decrypting user data');

    try {
      // Extract salt from encrypted data
      const parts = encrypted_data.encrypted.split(':');
      const encrypted = parts[0];
      const salt = Buffer.from(parts[1], 'hex');

      // Derive key
      const key = crypto.pbkdf2Sync(
        user_key,
        salt,
        SecurityLayer.ITERATIONS,
        SecurityLayer.KEY_LENGTH,
        'sha256'
      );

      // Create decipher
      const decipher = crypto.createDecipheriv(
        SecurityLayer.ALGORITHM,
        key,
        Buffer.from(encrypted_data.iv, 'hex')
      );

      // Set auth tag
      decipher.setAuthTag(Buffer.from(encrypted_data.auth_tag, 'hex'));

      // Decrypt
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return JSON.parse(decrypted);
    } catch (error) {
      console.error('❌ Decryption failed:', error);
      throw new Error('Failed to decrypt user data');
    }
  }

  /**
   * Create one-way hash of pattern
   * Cannot be reversed to reconstruct original content
   */
  async hash_pattern(pattern: FieldSignature): Promise<string> {
    const data = JSON.stringify({
      emotional: pattern.emotional_topology,
      semantic: pattern.semantic_shape,
      relational: pattern.relational_quality,
      sacred: pattern.sacred_presence,
      somatic: pattern.somatic_pattern,
      coherence: Math.round(pattern.coherence_level * 10) / 10 // Round to reduce uniqueness
    });

    return crypto
      .createHash('sha256')
      .update(data)
      .digest('hex');
  }

  /**
   * Anonymize pattern for collective upload
   * Removes all potentially identifying information
   */
  async anonymize_pattern(
    pattern: FieldSignature,
    success_rate: number
  ): Promise<AnonymousPattern> {
    console.log('🎭 Anonymizing pattern for collective');

    // Generate pattern hash
    const pattern_hash = await this.hash_pattern(pattern);

    // Determine anonymization level based on sensitivity
    const anonymization_level = this.determine_anonymization_level(pattern);

    // Create anonymous version based on level
    let anonymous_signature: Partial<FieldSignature>;

    switch (anonymization_level) {
      case 'full':
        // Maximum anonymization - only abstract categories
        anonymous_signature = {
          emotional_topology: this.generalize_topology(pattern.emotional_topology),
          sacred_presence: pattern.sacred_presence
        };
        break;

      case 'partial':
        // Moderate anonymization - remove fine details
        anonymous_signature = {
          emotional_topology: pattern.emotional_topology,
          semantic_shape: pattern.semantic_shape,
          sacred_presence: pattern.sacred_presence
        };
        break;

      case 'minimal':
        // Light anonymization - keep most patterns
        anonymous_signature = {
          emotional_topology: pattern.emotional_topology,
          semantic_shape: pattern.semantic_shape,
          relational_quality: pattern.relational_quality,
          sacred_presence: pattern.sacred_presence,
          somatic_pattern: this.generalize_somatic(pattern.somatic_pattern)
        };
        break;
    }

    // Calculate random delay for upload
    const delay = this.calculate_random_delay();
    const upload_scheduled = Date.now() + delay;

    return {
      pattern_hash,
      field_signature: anonymous_signature,
      success_rate: Math.round(success_rate * 100) / 100, // Round to reduce precision
      upload_scheduled,
      anonymization_level
    };
  }

  /**
   * Schedule pattern upload with random delay
   * Prevents timing correlation attacks
   */
  async schedule_anonymous_upload(
    pattern: AnonymousPattern,
    upload_callback: (pattern: AnonymousPattern) => Promise<void>
  ): Promise<void> {
    console.log('⏱️ Scheduling anonymous upload with delay');

    // Cancel any existing upload for this pattern
    if (this.upload_queue.has(pattern.pattern_hash)) {
      clearTimeout(this.upload_queue.get(pattern.pattern_hash)!);
    }

    // Calculate delay
    const delay = pattern.upload_scheduled - Date.now();

    // Schedule upload
    const timeout = setTimeout(async () => {
      console.log(`📤 Uploading anonymized pattern ${pattern.pattern_hash.substring(0, 8)}...`);
      try {
        await upload_callback(pattern);
        this.upload_queue.delete(pattern.pattern_hash);
      } catch (error) {
        console.error('❌ Failed to upload pattern:', error);
      }
    }, delay);

    this.upload_queue.set(pattern.pattern_hash, timeout);

    console.log(`  Upload scheduled in ${Math.round(delay / 60000)} minutes`);
  }

  /**
   * Determine anonymization level based on pattern sensitivity
   */
  private determine_anonymization_level(
    pattern: FieldSignature
  ): 'full' | 'partial' | 'minimal' {
    // High sensitivity indicators
    if (pattern.emotional_topology === 'storm' ||
        pattern.relational_quality === 'wasteland') {
      return 'full';
    }

    // Medium sensitivity
    if (pattern.sacred_presence ||
        pattern.coherence_level < 0.3) {
      return 'partial';
    }

    // Low sensitivity
    return 'minimal';
  }

  /**
   * Generalize topology for maximum anonymization
   */
  private generalize_topology(topology: string): string {
    const categories: { [key: string]: string } = {
      'storm': 'turbulent',
      'river': 'flowing',
      'rapids': 'flowing',
      'lake': 'still',
      'undertow': 'turbulent',
      'terrain': 'neutral'
    };

    return categories[topology] || 'neutral';
  }

  /**
   * Generalize somatic patterns
   */
  private generalize_somatic(pattern: string): string {
    const categories: { [key: string]: string } = {
      'rooted-fire': 'activated',
      'scattered-energy': 'dispersed',
      'deep-rest': 'grounded',
      'floating': 'ungrounded',
      'balanced': 'centered'
    };

    return categories[pattern] || 'neutral';
  }

  /**
   * Calculate random delay for anonymization
   */
  private calculate_random_delay(): number {
    return Math.floor(
      Math.random() * (SecurityLayer.MAX_DELAY - SecurityLayer.MIN_DELAY) +
      SecurityLayer.MIN_DELAY
    );
  }

  /**
   * Verify data integrity
   */
  async verify_integrity(
    data: any,
    expected_hash: string
  ): Promise<boolean> {
    const actual_hash = crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');

    return actual_hash === expected_hash;
  }

  /**
   * Generate user-specific encryption key from passphrase
   */
  async derive_user_key(
    passphrase: string,
    user_id: string
  ): Promise<string> {
    // Use user ID as salt for key derivation
    const salt = crypto
      .createHash('sha256')
      .update(user_id)
      .digest();

    const key = crypto.pbkdf2Sync(
      passphrase,
      salt,
      SecurityLayer.ITERATIONS,
      SecurityLayer.KEY_LENGTH,
      'sha256'
    );

    return key.toString('hex');
  }

  /**
   * Clear upload queue - called on shutdown
   */
  async clear_upload_queue(): Promise<void> {
    console.log('🧹 Clearing upload queue');

    for (const [hash, timeout] of this.upload_queue) {
      clearTimeout(timeout);
    }

    this.upload_queue.clear();
  }

  /**
   * Get security metrics for monitoring
   */
  get_security_metrics(): {
    pending_uploads: number;
    encryption_algorithm: string;
    anonymization_active: boolean;
  } {
    return {
      pending_uploads: this.upload_queue.size,
      encryption_algorithm: SecurityLayer.ALGORITHM,
      anonymization_active: true
    };
  }
}

// Export singleton instance
export const securityLayer = new SecurityLayer();
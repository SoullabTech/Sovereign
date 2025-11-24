/**
 * Client-Side Encryption System for MAIA
 * Provides end-to-end encryption for all sensitive user data
 */

import { AES, enc, PBKDF2, lib } from 'crypto-js';

export interface EncryptedData {
  data: string;
  iv: string;
  salt: string;
  version: number;
}

export interface UserEncryptionContext {
  userId: string;
  masterKey: string;
  salt: string;
}

export class MAIAEncryption {
  private static readonly ENCRYPTION_VERSION = 1;
  private static readonly KEY_ITERATIONS = 100000;
  private static readonly KEY_SIZE = 256 / 32; // 256 bits in 32-bit words

  /**
   * Generate a new encryption context for a user
   */
  static async generateUserEncryption(userId: string, userPassword: string): Promise<UserEncryptionContext> {
    // Generate a unique salt for this user
    const salt = lib.WordArray.random(256 / 8).toString();

    // Derive master key from user password and salt
    const masterKey = PBKDF2(userPassword, salt, {
      keySize: this.KEY_SIZE,
      iterations: this.KEY_ITERATIONS
    }).toString();

    return {
      userId,
      masterKey,
      salt
    };
  }

  /**
   * Recreate encryption context from stored salt and user password
   */
  static async recreateUserEncryption(
    userId: string,
    userPassword: string,
    storedSalt: string
  ): Promise<UserEncryptionContext> {
    const masterKey = PBKDF2(userPassword, storedSalt, {
      keySize: this.KEY_SIZE,
      iterations: this.KEY_ITERATIONS
    }).toString();

    return {
      userId,
      masterKey,
      salt: storedSalt
    };
  }

  /**
   * Encrypt sensitive data
   */
  static encrypt(data: any, context: UserEncryptionContext): EncryptedData {
    try {
      const plaintext = typeof data === 'string' ? data : JSON.stringify(data);
      const iv = lib.WordArray.random(128 / 8);

      const encrypted = AES.encrypt(plaintext, context.masterKey, {
        iv: iv,
        mode: crypto,
        padding: crypto.pad.Pkcs7
      });

      return {
        data: encrypted.toString(),
        iv: iv.toString(),
        salt: context.salt,
        version: this.ENCRYPTION_VERSION
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt sensitive data
   */
  static decrypt<T = any>(encryptedData: EncryptedData, context: UserEncryptionContext): T | null {
    try {
      const decrypted = AES.decrypt(encryptedData.data, context.masterKey, {
        iv: enc.Hex.parse(encryptedData.iv),
        mode: crypto,
        padding: crypto.pad.Pkcs7
      });

      const plaintext = decrypted.toString(enc.Utf8);

      if (!plaintext) {
        console.error('Decryption resulted in empty string');
        return null;
      }

      // Try to parse as JSON, fall back to string
      try {
        return JSON.parse(plaintext);
      } catch {
        return plaintext as T;
      }
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }

  /**
   * Generate a hash for encrypted data (for searching without decryption)
   */
  static generateSearchHash(data: string): string {
    return lib.SHA256(data.toLowerCase().trim()).toString();
  }

  /**
   * Encrypt journal entry for storage
   */
  static encryptJournalEntry(entry: {
    content: string;
    mode: string;
    reflection?: any;
    symbols?: string[];
    archetypes?: string[];
    emotionalTone?: string;
    metadata?: any;
  }, context: UserEncryptionContext) {
    return {
      encrypted_content: this.encrypt(entry.content, context),
      encrypted_mode: this.encrypt(entry.mode, context),
      encrypted_reflection: entry.reflection ? this.encrypt(entry.reflection, context) : null,
      encrypted_symbols: entry.symbols ? this.encrypt(entry.symbols, context) : null,
      encrypted_archetypes: entry.archetypes ? this.encrypt(entry.archetypes, context) : null,
      encrypted_emotional_tone: entry.emotionalTone ? this.encrypt(entry.emotionalTone, context) : null,
      encrypted_metadata: entry.metadata ? this.encrypt(entry.metadata, context) : null,

      // Non-encrypted searchable data
      word_count: entry.content.split(/\s+/).length,
      content_hash: this.generateSearchHash(entry.content),
      mode_hash: this.generateSearchHash(entry.mode),
    };
  }

  /**
   * Decrypt journal entry from storage
   */
  static decryptJournalEntry(encryptedEntry: any, context: UserEncryptionContext) {
    return {
      content: this.decrypt<string>(encryptedEntry.encrypted_content, context),
      mode: this.decrypt<string>(encryptedEntry.encrypted_mode, context),
      reflection: encryptedEntry.encrypted_reflection
        ? this.decrypt(encryptedEntry.encrypted_reflection, context)
        : null,
      symbols: encryptedEntry.encrypted_symbols
        ? this.decrypt<string[]>(encryptedEntry.encrypted_symbols, context)
        : null,
      archetypes: encryptedEntry.encrypted_archetypes
        ? this.decrypt<string[]>(encryptedEntry.encrypted_archetypes, context)
        : null,
      emotionalTone: encryptedEntry.encrypted_emotional_tone
        ? this.decrypt<string>(encryptedEntry.encrypted_emotional_tone, context)
        : null,
      metadata: encryptedEntry.encrypted_metadata
        ? this.decrypt(encryptedEntry.encrypted_metadata, context)
        : null,
    };
  }

  /**
   * Encrypt voice journal data
   */
  static encryptVoiceJournal(voiceData: {
    transcript: string;
    voiceMetrics?: any;
    cognitiveAnalysis?: any;
    elementalAnalysis?: any;
    audioFilePath?: string;
  }, context: UserEncryptionContext) {
    return {
      encrypted_transcript: this.encrypt(voiceData.transcript, context),
      encrypted_voice_metrics: voiceData.voiceMetrics
        ? this.encrypt(voiceData.voiceMetrics, context)
        : null,
      encrypted_cognitive_analysis: voiceData.cognitiveAnalysis
        ? this.encrypt(voiceData.cognitiveAnalysis, context)
        : null,
      encrypted_elemental_analysis: voiceData.elementalAnalysis
        ? this.encrypt(voiceData.elementalAnalysis, context)
        : null,
      encrypted_audio_file_path: voiceData.audioFilePath
        ? this.encrypt(voiceData.audioFilePath, context)
        : null,

      // Hash for integrity checking
      transcript_hash: this.generateSearchHash(voiceData.transcript),
    };
  }

  /**
   * Encrypt symbolic memory
   */
  static encryptSymbolicMemory(memory: {
    symbol: string;
    meaning: string;
    context: string;
    associations: string[];
  }, context: UserEncryptionContext) {
    return {
      encrypted_symbol: this.encrypt(memory.symbol, context),
      encrypted_meaning: this.encrypt(memory.meaning, context),
      encrypted_context: this.encrypt(memory.context, context),
      encrypted_associations: this.encrypt(memory.associations, context),

      // Hash for searching without decryption
      symbol_hash: this.generateSearchHash(memory.symbol),
    };
  }

  /**
   * Encrypt soulprint data
   */
  static encryptSoulprint(soulprint: {
    personalityPatterns: any;
    emotionalPatterns: any;
    communicationStyle: any;
    growthEdges: any;
    archetypalResonance: any;
  }, context: UserEncryptionContext) {
    return {
      encrypted_personality_patterns: this.encrypt(soulprint.personalityPatterns, context),
      encrypted_emotional_patterns: this.encrypt(soulprint.emotionalPatterns, context),
      encrypted_communication_style: this.encrypt(soulprint.communicationStyle, context),
      encrypted_growth_edges: this.encrypt(soulprint.growthEdges, context),
      encrypted_archetypal_resonance: this.encrypt(soulprint.archetypalResonance, context),
    };
  }

  /**
   * Encrypt privacy permissions
   */
  static encryptPrivacyPermissions(permissions: {
    selfPermissions: any;
    professionalPermissions: any;
    emergencyPermissions: any;
  }, context: UserEncryptionContext) {
    return {
      encrypted_self_permissions: this.encrypt(permissions.selfPermissions, context),
      encrypted_professional_permissions: this.encrypt(permissions.professionalPermissions, context),
      encrypted_emergency_permissions: this.encrypt(permissions.emergencyPermissions, context),
    };
  }
}

/**
 * Secure localStorage with encryption
 */
export class SecureLocalStorage {
  private static encryptionContext: UserEncryptionContext | null = null;

  /**
   * Initialize with user encryption context
   */
  static initialize(context: UserEncryptionContext) {
    this.encryptionContext = context;
  }

  /**
   * Store encrypted data in localStorage
   */
  static setItem(key: string, data: any): boolean {
    if (!this.encryptionContext) {
      console.error('SecureLocalStorage not initialized with encryption context');
      return false;
    }

    try {
      const encrypted = MAIAEncryption.encrypt(data, this.encryptionContext);
      const storageData = {
        encrypted,
        timestamp: Date.now(),
        userId: this.encryptionContext.userId
      };

      localStorage.setItem(`maia_secure_${key}`, JSON.stringify(storageData));
      return true;
    } catch (error) {
      console.error('Failed to store encrypted data:', error);
      return false;
    }
  }

  /**
   * Retrieve and decrypt data from localStorage
   */
  static getItem<T = any>(key: string): T | null {
    if (!this.encryptionContext) {
      console.error('SecureLocalStorage not initialized with encryption context');
      return null;
    }

    try {
      const stored = localStorage.getItem(`maia_secure_${key}`);
      if (!stored) return null;

      const storageData = JSON.parse(stored);

      // Verify the data belongs to the current user
      if (storageData.userId !== this.encryptionContext.userId) {
        console.warn('Stored data belongs to different user, removing');
        this.removeItem(key);
        return null;
      }

      return MAIAEncryption.decrypt<T>(storageData.encrypted, this.encryptionContext);
    } catch (error) {
      console.error('Failed to retrieve encrypted data:', error);
      return null;
    }
  }

  /**
   * Remove item from localStorage
   */
  static removeItem(key: string): void {
    localStorage.removeItem(`maia_secure_${key}`);
  }

  /**
   * Clear all MAIA encrypted data for current user
   */
  static clear(): void {
    if (!this.encryptionContext) return;

    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('maia_secure_')) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  /**
   * Get storage usage for current user
   */
  static getStorageInfo(): {
    encryptedKeys: string[];
    totalSize: number;
    itemCount: number;
  } {
    const encryptedKeys: string[] = [];
    let totalSize = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('maia_secure_')) {
        const value = localStorage.getItem(key);
        if (value) {
          encryptedKeys.push(key.replace('maia_secure_', ''));
          totalSize += key.length + value.length;
        }
      }
    }

    return {
      encryptedKeys,
      totalSize,
      itemCount: encryptedKeys.length
    };
  }
}

/**
 * Password strength validation
 */
export class PasswordValidator {
  static readonly MIN_LENGTH = 12;
  static readonly REQUIRED_PATTERNS = [
    /[a-z]/, // lowercase
    /[A-Z]/, // uppercase
    /[0-9]/, // numbers
    /[^A-Za-z0-9]/ // special characters
  ];

  static validate(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length < this.MIN_LENGTH) {
      feedback.push(`Password must be at least ${this.MIN_LENGTH} characters long`);
    } else {
      score += 25;
    }

    // Pattern checks
    this.REQUIRED_PATTERNS.forEach((pattern, index) => {
      if (pattern.test(password)) {
        score += 18.75; // 75 points total for patterns
      } else {
        const patternNames = ['lowercase letters', 'uppercase letters', 'numbers', 'special characters'];
        feedback.push(`Password must include ${patternNames[index]}`);
      }
    });

    // Bonus for length
    if (password.length >= 16) score += 10;
    if (password.length >= 20) score += 10;

    return {
      isValid: score >= 100 && feedback.length === 0,
      score: Math.min(score, 100),
      feedback
    };
  }

  static generateSuggestion(): string {
    return "Consider using a passphrase with 4-6 words, numbers, and symbols. Example: 'Mountain$River7Dancing#Moon'";
  }
}

/**
 * Key derivation utilities
 */
export class KeyDerivation {
  /**
   * Derive different keys for different purposes from master key
   */
  static deriveKey(masterKey: string, purpose: 'storage' | 'backup' | 'export' | 'audit', salt: string): string {
    return PBKDF2(masterKey + purpose, salt, {
      keySize: MAIAEncryption['KEY_SIZE'],
      iterations: 10000 // Fewer iterations for derived keys
    }).toString();
  }

  /**
   * Generate secure random salt
   */
  static generateSalt(): string {
    return lib.WordArray.random(256 / 8).toString();
  }
}
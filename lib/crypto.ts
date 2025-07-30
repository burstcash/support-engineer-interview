// ABOUTME: Provides AES-256-GCM encryption/decryption for sensitive data like SSNs
// Uses Node.js crypto module for secure encryption with authentication

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16;  // 128 bits
const TAG_LENGTH = 16; // 128 bits

/**
 * Gets the encryption key from environment variable
 * Falls back to a development key for testing (never use in production!)
 */
function getEncryptionKey(): Buffer {
  const envKey = process.env.ENCRYPTION_KEY;
  
  if (envKey) {
    return Buffer.from(envKey, 'base64');
  }
  
  // Development fallback - generates a consistent key for testing
  // WARNING: This is NOT secure for production use
  console.warn('Using development encryption key - not suitable for production');
  return crypto.scryptSync('dev-key-for-testing-only', 'salt', KEY_LENGTH);
}

/**
 * Encrypts sensitive data using AES-256-GCM
 * Returns base64-encoded string containing IV + encrypted data + auth tag
 */
export function encryptSensitiveData(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  
  // An iv is needed to ensure that the same plaintext encrypts to different ciphertext each time
  // This prevents attackers from finding patterns in the ciphertext. Ex: if multiple users use the same password.
  // The IV doesn't have to be secret because the key is secret.
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  const combined = Buffer.concat([iv, Buffer.from(encrypted, 'hex'), tag]);
  return combined.toString('base64');
}

/**
 * Decrypts data encrypted with encryptSensitiveData
 * Takes base64-encoded string, returns original plaintext
 */
export function decryptSensitiveData(encryptedData: string): string {
  const key = getEncryptionKey();
  const combined = Buffer.from(encryptedData, 'base64');
  const iv = combined.subarray(0, IV_LENGTH);
  const tag = combined.subarray(-TAG_LENGTH);
  const encrypted = combined.subarray(IV_LENGTH, -TAG_LENGTH);
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  
  let decrypted = decipher.update(Buffer.from(encrypted), undefined, 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

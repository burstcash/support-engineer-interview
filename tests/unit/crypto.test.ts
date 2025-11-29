// ABOUTME: Unit tests for crypto utility functions
// Tests encryption, decryption, key handling, and error cases

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { encryptSensitiveData, decryptSensitiveData, getEncryptionKey } from '@/lib/crypto'

describe('Crypto Utilities', () => {
  const originalEnv = process.env.ENCRYPTION_KEY
  
  beforeEach(() => {
    // Delete environment variable to ensure tests use default key from crypto.ts
    delete process.env.ENCRYPTION_KEY
  })
  
  afterEach(() => {
    // Restore original environment
    if (originalEnv) {
      process.env.ENCRYPTION_KEY = originalEnv
    } else {
      delete process.env.ENCRYPTION_KEY
    }
  })

  describe('getEncryptionKey', () => {
    it('should return development key when no env variable is set', () => {
      const key = getEncryptionKey()
      expect(key).toBeDefined()
      expect(key.length).toBe(32) // 256 bits
    })

    it('should return the key from environment variable if it is set', () => {
      const testKey = Buffer.alloc(32, 'test-key-for-env').toString('base64')
      process.env.ENCRYPTION_KEY = testKey
      
      const key = getEncryptionKey()
      expect(key.toString('base64')).toBe(testKey)
    })

    it('should log warning when using development key', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      const key = getEncryptionKey()
      expect(key.length).toBe(32) // 256 bits
      expect(consoleWarnSpy).toHaveBeenCalledWith('Using development encryption key - not suitable for production')
      
      consoleWarnSpy.mockRestore()
    })
  })

  describe('encryptSensitiveData', () => {
    it('should encrypt SSN data successfully', () => {
      const testSSN = '123456789'
      const encrypted = encryptSensitiveData(testSSN)
      
      expect(encrypted).toBeDefined()
      expect(typeof encrypted).toBe('string')
      expect(encrypted.length).toBeGreaterThan(40) // Base64 encoded IV + data + tag
      expect(encrypted).not.toBe(testSSN) // Should not be plaintext
    })

    it('should produce different ciphertext for same input (random IV)', () => {
      const testSSN = '123456789'
      const encrypted1 = encryptSensitiveData(testSSN)
      const encrypted2 = encryptSensitiveData(testSSN)
      
      expect(encrypted1).not.toBe(encrypted2) // Different IVs should produce different output
    })

    it('should handle empty string', () => {
      const encrypted = encryptSensitiveData('')
      expect(encrypted).toBeDefined()
      expect(typeof encrypted).toBe('string')
    })
  })

  describe('decryptSensitiveData', () => {
    it('should decrypt previously encrypted data correctly', () => {
      const testSSN = '123456789'
      const encrypted = encryptSensitiveData(testSSN)
      const decrypted = decryptSensitiveData(encrypted)
      
      expect(decrypted).toBe(testSSN)
    })

    it('should handle roundtrip encryption/decryption for multiple values', () => {
      const testData = ['123456789', '987654321', '555666777', '000000000']
      
      testData.forEach(originalSSN => {
        const encrypted = encryptSensitiveData(originalSSN)
        const decrypted = decryptSensitiveData(encrypted)
        expect(decrypted).toBe(originalSSN)
      })
    })

    it('should handle empty string roundtrip', () => {
      const encrypted = encryptSensitiveData('')
      const decrypted = decryptSensitiveData(encrypted)
      expect(decrypted).toBe('')
    })

    it('should throw error for invalid encrypted data', () => {
      expect(() => decryptSensitiveData('invalid-base64')).toThrow()
      expect(() => decryptSensitiveData('')).toThrow()
      expect(() => decryptSensitiveData('SGVsbG8gV29ybGQ=')).toThrow() // Valid base64 but not encrypted data
    })

    it('should throw error for tampered encrypted data', () => {
      const testSSN = '123456789'
      const encrypted = encryptSensitiveData(testSSN)
      
      // Change the last character to simulate tampering
      const tamperedEncrypted = encrypted.slice(0, -1) + (encrypted.slice(-1) === 'A' ? 'B' : 'A')
      
      expect(() => decryptSensitiveData(tamperedEncrypted)).toThrow()
    })
  })

  describe('Security Properties', () => {
    it('should not decrypt with wrong key', () => {
      const testSSN = '123456789'
      
      // Encrypt with default crypto key
      const encrypted = encryptSensitiveData(testSSN)
      
      // Try to decrypt with different key - generate proper 32-byte key
      const wrongKeyBuffer = Buffer.alloc(32, 'wrong-key')
      const wrongKey = wrongKeyBuffer.toString('base64')
      process.env.ENCRYPTION_KEY = wrongKey
      
      expect(() => decryptSensitiveData(encrypted)).toThrow()
    })

    it('should use the env key for encryption and decryption', () => {
      const testSSN = '123456789'

      // Set a specific env key
      const testKeyBuffer = Buffer.alloc(32, 'test-key-for-env')
      const testKey = testKeyBuffer.toString('base64')
      process.env.ENCRYPTION_KEY = testKey

      const encrypted = encryptSensitiveData(testSSN)
      expect(encrypted).toBeDefined()

      // Try to decrypt with the default crypto key
      delete process.env.ENCRYPTION_KEY
      expect(() => decryptSensitiveData(encrypted)).toThrow()

      // Set the env key again and decrypt
      process.env.ENCRYPTION_KEY = testKey
      const decrypted = decryptSensitiveData(encrypted)
      expect(decrypted).toBe(testSSN)
    })

    it('should produce cryptographically strong output', () => {
      const testSSN = '123456789'
      const results = new Set()
      
      // Generate multiple encryptions and ensure they're all different
      for (let i = 0; i < 10; i++) {
        const encrypted = encryptSensitiveData(testSSN)
        expect(results.has(encrypted)).toBe(false) // Should be unique
        results.add(encrypted)
      }
      
      expect(results.size).toBe(10) // All should be unique
    })
  })
})

// ABOUTME: Unit tests for crypto utility functions
// Tests encryption, decryption, key handling, and error cases

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { encryptSensitiveData, decryptSensitiveData } from '@/lib/crypto'

describe('Crypto Utilities', () => {
  const originalEnv = process.env.ENCRYPTION_KEY
  
  beforeEach(() => {
    // Reset environment for each test
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

    it('should handle various SSN formats', () => {
      const ssnFormats = ['123456789', '000000000', '999999999']
      
      ssnFormats.forEach(ssn => {
        const encrypted = encryptSensitiveData(ssn)
        expect(encrypted).toBeDefined()
        expect(typeof encrypted).toBe('string')
      })
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
      
      // Tamper with the encrypted data by changing one character
      const tamperedEncrypted = encrypted.slice(0, -1) + (encrypted.slice(-1) === 'A' ? 'B' : 'A')
      
      expect(() => decryptSensitiveData(tamperedEncrypted)).toThrow()
    })
  })

  describe('Key Management', () => {
    it('should use development key when no environment key is set', () => {
      delete process.env.ENCRYPTION_KEY
      
      const testSSN = '123456789'
      const encrypted1 = encryptSensitiveData(testSSN)
      const decrypted1 = decryptSensitiveData(encrypted1)
      
      expect(decrypted1).toBe(testSSN)
    })

    it('should use environment key when provided', () => {
      // Generate a valid 32-byte key and base64 encode it
      const testKeyBuffer = Buffer.alloc(32, 'test-key-content')
      const testKey = testKeyBuffer.toString('base64')
      process.env.ENCRYPTION_KEY = testKey
      
      const testSSN = '123456789'
      const encrypted = encryptSensitiveData(testSSN)
      const decrypted = decryptSensitiveData(encrypted)
      
      expect(decrypted).toBe(testSSN)
    })

    it('should produce different results with different keys', () => {
      const testSSN = '123456789'
      
      // Test with development key
      delete process.env.ENCRYPTION_KEY
      const encrypted1 = encryptSensitiveData(testSSN)
      
      // Test with environment key - generate proper 32-byte key
      const testKeyBuffer = Buffer.alloc(32, 'different-key')
      const testKey = testKeyBuffer.toString('base64')
      process.env.ENCRYPTION_KEY = testKey
      const encrypted2 = encryptSensitiveData(testSSN)
      
      // Encrypted values should be different (different keys)
      expect(encrypted1).not.toBe(encrypted2)
      
      // But both should decrypt correctly with their respective keys
      delete process.env.ENCRYPTION_KEY
      expect(decryptSensitiveData(encrypted1)).toBe(testSSN)
      
      process.env.ENCRYPTION_KEY = testKey
      expect(decryptSensitiveData(encrypted2)).toBe(testSSN)
    })
  })

  describe('Security Properties', () => {
    it('should not decrypt with wrong key', () => {
      const testSSN = '123456789'
      
      // Encrypt with one key
      delete process.env.ENCRYPTION_KEY
      const encrypted = encryptSensitiveData(testSSN)
      
      // Try to decrypt with different key - generate proper 32-byte key
      const wrongKeyBuffer = Buffer.alloc(32, 'wrong-key')
      const wrongKey = wrongKeyBuffer.toString('base64')
      process.env.ENCRYPTION_KEY = wrongKey
      
      expect(() => decryptSensitiveData(encrypted)).toThrow()
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

// ABOUTME: Tests for validation logic - demonstrates framework capabilities
// Example tests that could catch validation bugs mentioned in CHALLENGE.md

import { describe, it, expect } from 'vitest'
import { z } from 'zod'

// -- Example validation schemas that might exist in the application
// -- These tests demonstrate how to test validation logic

describe('Email Validation', () => {
  // -- Example schema for email validation testing
  const emailSchema = z.string().email().toLowerCase()

  it('should accept valid email addresses', () => {
    const validEmails = [
      'user@example.com',
      'test.email@domain.co.uk',
      'user+tag@example.org'
    ]

    validEmails.forEach(email => {
      expect(() => emailSchema.parse(email)).not.toThrow()
    })
  })

  it('should reject invalid email formats', () => {
    const invalidEmails = [
      'invalid-email',
      'user@',
      '@domain.com',
      'user..email@domain.com',
      'user@domain..com'
    ]

    invalidEmails.forEach(email => {
      expect(() => emailSchema.parse(email)).toThrow()
    })
  })

  it('should normalize email to lowercase', () => {
    const result = emailSchema.parse('TEST@EXAMPLE.COM')
    expect(result).toBe('test@example.com')
  })
})

describe('Date of Birth Validation', () => {
  // -- Example schema for age validation
  const dateOfBirthSchema = z.string().refine((date) => {
    const birthDate = new Date(date)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= 18
    }
    return age >= 18
  }, { message: 'Must be 18 or older' })

  it('should accept valid birth dates for adults', () => {
    const adultBirthDate = new Date()
    adultBirthDate.setFullYear(adultBirthDate.getFullYear() - 25)
    
    expect(() => dateOfBirthSchema.parse(adultBirthDate.toISOString().split('T')[0])).not.toThrow()
  })

  it('should reject future birth dates', () => {
    const futureDate = new Date()
    futureDate.setFullYear(futureDate.getFullYear() + 1)
    
    expect(() => dateOfBirthSchema.parse(futureDate.toISOString().split('T')[0]))
      .toThrow('Must be 18 or older')
  })

  it('should reject birth dates for minors', () => {
    const minorBirthDate = new Date()
    minorBirthDate.setFullYear(minorBirthDate.getFullYear() - 10)
    
    expect(() => dateOfBirthSchema.parse(minorBirthDate.toISOString().split('T')[0]))
      .toThrow('Must be 18 or older')
  })
})

describe('Amount Validation', () => {
  // -- Example schema for monetary amount validation
  const amountSchema = z.number().min(0.01, 'Amount must be greater than zero')
    .max(999999.99, 'Amount too large')
    .refine((val) => Number.isFinite(val), 'Must be a valid number')
    .refine((val) => (val * 100) % 1 === 0, 'Cannot have more than 2 decimal places')

  it('should accept valid amounts', () => {
    const validAmounts = [0.01, 10.00, 999.99, 50.50]
    
    validAmounts.forEach(amount => {
      expect(() => amountSchema.parse(amount)).not.toThrow()
    })
  })

  it('should reject zero amounts', () => {
    expect(() => amountSchema.parse(0)).toThrow('Amount must be greater than zero')
  })

  it('should reject negative amounts', () => {
    expect(() => amountSchema.parse(-10.50)).toThrow('Amount must be greater than zero')
  })

  it('should reject amounts with more than 2 decimal places', () => {
    expect(() => amountSchema.parse(10.123)).toThrow('Cannot have more than 2 decimal places')
  })

  it('should reject extremely large amounts', () => {
    expect(() => amountSchema.parse(1000000)).toThrow('Amount too large')
  })
})

describe('Card Number Validation', () => {
  // -- Example Luhn algorithm implementation for card validation
  function validateCardNumber(cardNumber: string): boolean {
    const cleaned = cardNumber.replace(/\s+/g, '')
    if (!/^\d+$/.test(cleaned)) return false
    
    let sum = 0
    let isEven = false
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i), 10)
      
      if (isEven) {
        digit *= 2
        if (digit > 9) {
          digit -= 9
        }
      }
      
      sum += digit
      isEven = !isEven
    }
    
    return sum % 10 === 0
  }

  it('should accept valid card numbers', () => {
    const validCards = [
      '4532015112830366', // Visa
      '5555555555554444', // Mastercard
      '378282246310005',  // Amex
    ]
    
    validCards.forEach(card => {
      expect(validateCardNumber(card)).toBe(true)
    })
  })

  it('should reject invalid card numbers', () => {
    const invalidCards = [
      '1234567890123456',
      '4532015112830367', // Wrong check digit
      '1111111111111111',
    ]
    
    invalidCards.forEach(card => {
      expect(validateCardNumber(card)).toBe(false)
    })
  })

  it('should handle card numbers with spaces', () => {
    expect(validateCardNumber('4532 0151 1283 0366')).toBe(true)
  })

  it('should reject non-numeric strings', () => {
    expect(validateCardNumber('abcd1234')).toBe(false)
  })
})

describe('Phone Number Validation', () => {
  // -- Example phone number validation schema
  const phoneSchema = z.string().refine((phone) => {
    // Basic US phone number validation
    const cleaned = phone.replace(/\D/g, '')
    return cleaned.length === 10 || (cleaned.length === 11 && cleaned.startsWith('1'))
  }, { message: 'Invalid phone number format' })

  it('should accept valid US phone numbers', () => {
    const validPhones = [
      '(555) 123-4567',
      '555-123-4567',
      '5551234567',
      '1-555-123-4567',
      '+1 555 123 4567'
    ]
    
    validPhones.forEach(phone => {
      expect(() => phoneSchema.parse(phone)).not.toThrow()
    })
  })

  it('should reject invalid phone numbers', () => {
    const invalidPhones = [
      '123',
      '555-12-4567', // Too short
      '1234567890123', // Too long
      'abc-def-ghij'
    ]
    
    invalidPhones.forEach(phone => {
      expect(() => phoneSchema.parse(phone)).toThrow('Invalid phone number format')
    })
  })
})

import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { decryptSensitiveData } from '@/lib/crypto'

// -- Mock the database module to use test database
vi.mock('@/lib/db', async () => {
  const { testConnection } = await import('../setup')
  return {
    db: testConnection
  }
})

import { testConnection } from '../setup'
import { createAuthRouter } from '@/server/routers/auth'

describe('Auth Router - SSN Encryption', () => {
  let authRouter: ReturnType<typeof createAuthRouter>

  beforeAll(() => {
    // Create auth router with test database connection after setup is complete
    authRouter = createAuthRouter(testConnection)
  })

  describe('signup mutation', () => {
    it('should encrypt SSN before storing in database', async () => {
      const mockContext = {
        res: {
          setHeader: vi.fn()
        },
        req: {},
        user: null
      }

      const testUserData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
        dateOfBirth: '1990-01-01',
        ssn: '123456789',
        address: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345'
      }

      // Execute signup
      await authRouter.createCaller(mockContext).signup(testUserData)

      // Verify user was created
      const storedUser = await testConnection.select().from(users).where(eq(users.email, testUserData.email)).get()
      expect(storedUser).toBeDefined()

      // Critical test: SSN should be encrypted in database
      expect(storedUser!.ssn).not.toBe(testUserData.ssn) // Should not be plaintext
      expect(storedUser!.ssn.length).toBeGreaterThan(40) // Encrypted data should be longer

      // Verify we can decrypt it back to original
      const decryptedSSN = decryptSensitiveData(storedUser!.ssn)
      expect(decryptedSSN).toBe(testUserData.ssn)
    })

    it('should handle multiple users with same SSN (different encrypted values)', async () => {
      const mockContext = {
        res: { setHeader: vi.fn() },
        req: {},
        user: null
      }

      const userData1 = {
        email: 'user1@example.com',
        password: 'password123',
        firstName: 'User',
        lastName: 'One',
        phoneNumber: '1234567890',
        dateOfBirth: '1990-01-01',
        ssn: '123456789',
        address: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345'
      }

      const userData2 = {
        ...userData1,
        email: 'user2@example.com',
        firstName: 'User',
        lastName: 'Two'
      }

      // Create both users
      await authRouter.createCaller(mockContext).signup(userData1)
      await authRouter.createCaller(mockContext).signup(userData2)

      // Get both users from database
      const user1 = await testConnection.select().from(users).where(eq(users.email, userData1.email)).get()
      const user2 = await testConnection.select().from(users).where(eq(users.email, userData2.email)).get()

      // SSNs should be encrypted differently (random IV)
      expect(user1!.ssn).not.toBe(user2!.ssn)
      
      // But both should decrypt to same original value
      expect(decryptSensitiveData(user1!.ssn)).toBe(userData1.ssn)
      expect(decryptSensitiveData(user2!.ssn)).toBe(userData2.ssn)
    })
  })
})
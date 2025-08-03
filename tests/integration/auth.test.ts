// ABOUTME: Integration tests for authentication flow
// Tests the complete auth router with database interactions

import { describe, it, expect, beforeAll } from 'vitest'
import bcrypt from 'bcryptjs'
import { createTestUser } from '../helpers'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

import { testConnection } from '../setup'
import { createAuthRouter } from '@/server/routers/auth'

// Helper to create mock context with proper response methods
function createMockContext() {
  return {
    user: null,
    req: {},
    res: {
      setHeader: () => {} // Mock function for setting cookies
    }
  }
}

describe('Authentication Integration', () => {
  let authRouter: ReturnType<typeof createAuthRouter>
  
  beforeAll(() => {
    // Create auth router with test database connection after setup is complete
    authRouter = createAuthRouter(testConnection)
  })
  
  describe('signup', () => {
    it('should register a new user successfully', async () => {
      // -- Arrange: Prepare user registration data
      const userData = createTestUser()
      const mockCtx = createMockContext()
      
      // -- Act: Register the user
      const result = await authRouter
        .createCaller(mockCtx)
        .signup(userData)
      
      // -- Assert: Verify registration success
      expect(result).toMatchObject({
        success: true,
        message: 'User registered successfully'
      })
      
      const dbUser = await testConnection
        .select()
        .from(users)
        .where(eq(users.email, userData.email))
        .get()
      
      expect(dbUser).toBeDefined()
      expect(dbUser?.firstName).toBe(userData.firstName)
      expect(dbUser?.lastName).toBe(userData.lastName)
      
      expect(dbUser?.password).not.toBe(userData.password)
      const isPasswordValid = await bcrypt.compare(userData.password, dbUser?.password || '')
      expect(isPasswordValid).toBe(true)
    })

    it('should prevent duplicate email registration', async () => {
      // -- Arrange: Register a user first
      const userData = createTestUser()
      const mockCtx = createMockContext()
      
      await authRouter
        .createCaller(mockCtx)
        .signup(userData)
      
      // -- Act & Assert: Attempt to register with same email
      await expect(
        authRouter
          .createCaller(mockCtx)
          .signup(userData)
      ).rejects.toThrow('User already exists')
    })

    it('should validate required fields', async () => {
      // -- Arrange: Create invalid user data
      const invalidUserData = {
        ...createTestUser(),
        email: 'invalid-email'
      }
      const mockCtx = { user: null, req: {}, res: {} }
      
      // -- Act & Assert: Should reject invalid data
      await expect(
        authRouter
          .createCaller(mockCtx)
          .signup(invalidUserData)
      ).rejects.toThrow()
    })
  })

  describe('login', () => {
    it('should login with valid credentials', async () => {
      // -- Arrange: Register a user first
      const userData = createTestUser()
      const mockCtx = { user: null, req: {}, res: {} }
      
      await authRouter
        .createCaller(mockCtx)
        .signup(userData)
      
      // -- Act: Login with credentials
      const result = await authRouter
        .createCaller(mockCtx)
        .login({
          email: userData.email,
          password: userData.password
        })
      
      // -- Assert: Verify login success
      expect(result).toMatchObject({
        success: true,
        message: 'Login successful'
      })
      expect(result.user).toMatchObject({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName
      })
      expect(result.token).toBeDefined()
    })

    it('should reject invalid credentials', async () => {
      // -- Arrange: Register a user
      const userData = createTestUser()
      const mockCtx = { user: null, req: {}, res: {} }
      
      await authRouter
        .createCaller(mockCtx)
        .signup(userData)
      
      // -- Act & Assert: Login with wrong password
      await expect(
        authRouter
          .createCaller(mockCtx)
          .login({
            email: userData.email,
            password: 'wrongpassword'
          })
      ).rejects.toThrow('Invalid credentials')
    })

    it('should reject login for non-existent user', async () => {
      // -- Arrange: Prepare login data for non-existent user
      const mockCtx = { user: null, req: {}, res: {} }
      
      // -- Act & Assert: Login with non-existent email
      await expect(
        authRouter
          .createCaller(mockCtx)
          .login({
            email: 'nonexistent@example.com',
            password: 'password123'
          })
      ).rejects.toThrow('Invalid credentials')
    })
  })
})

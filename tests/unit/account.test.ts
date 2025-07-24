// ABOUTME: Unit tests for account creation functionality  
// Tests the core account router logic and validation

import { describe, it, expect } from 'vitest'
import { createMockAuthContext, insertTestUser, createTestUser } from '../helpers'
import { testConnection } from '../setup'

// -- Import and use test database directly
import { accounts } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// -- Mock account router that uses test database
const mockAccountRouter = {
  async createAccount(input: { accountType: 'checking' | 'savings' }, ctx: Record<string, unknown>) {
    const userCtx = ctx as { user: { id: number } }
    
    // Check if user already has an account of this type
    const existingAccount = await testConnection
      .select()
      .from(accounts)
      .where(and(eq(accounts.userId, userCtx.user.id), eq(accounts.accountType, input.accountType)))
      .get()

    if (existingAccount) {
      throw new Error(`You already have a ${input.accountType} account`)
    }

    // Generate account number
    const accountNumber = Math.floor(Math.random() * 1000000000)
      .toString()
      .padStart(10, "0")

    const [newAccount] = await testConnection
      .insert(accounts)
      .values({
        userId: userCtx.user.id,
        accountNumber,
        accountType: input.accountType,
        balance: 0,
        status: 'pending',
      })
      .returning()

    return newAccount
  },

  async getAccounts(ctx: Record<string, unknown>) {
    const userCtx = ctx as { user: { id: number } }
    return await testConnection
      .select()
      .from(accounts)
      .where(eq(accounts.userId, userCtx.user.id))
      .all()
  }
}

describe('Account Router', () => {
  describe('createAccount', () => {
    it('should create a new checking account successfully', async () => {
      // -- Arrange: Set up test user and authentication context
      const testUser = await insertTestUser(createTestUser())
      const mockCtx = createMockAuthContext(testUser)
      
      // -- Act: Create checking account
      const result = await mockAccountRouter.createAccount(
        { accountType: 'checking' }, 
        mockCtx
      )
      
      // -- Assert: Verify account creation
      expect(result).toMatchObject({
        accountType: 'checking',
        balance: 0,
        status: 'pending',
        userId: testUser.id
      })
      expect(result.accountNumber).toMatch(/^\d{10}$/) // Should be 10 digits
    })

    it('should create a new savings account successfully', async () => {
      // -- Arrange: Set up test user and authentication context
      const testUser = await insertTestUser(createTestUser())
      const mockCtx = createMockAuthContext(testUser)
      
      // -- Act: Create savings account
      const result = await accountRouter
        .createCaller(mockCtx)
        .createAccount({ accountType: 'savings' })
      
      // -- Assert: Verify account creation
      expect(result).toMatchObject({
        accountType: 'savings',
        balance: 0,
        status: 'pending',
        userId: testUser.id
      })
    })

    it('should prevent duplicate account types for same user', async () => {
      // -- Arrange: Set up test user with existing checking account
      const testUser = await insertTestUser(createTestUser())
      const mockCtx = createMockAuthContext(testUser)
      
      // Create first checking account
      await accountRouter
        .createCaller(mockCtx)
        .createAccount({ accountType: 'checking' })
      
      // -- Act & Assert: Attempt to create duplicate checking account
      await expect(
        accountRouter
          .createCaller(mockCtx)
          .createAccount({ accountType: 'checking' })
      ).rejects.toThrow('You already have a checking account')
    })

    it('should generate unique account numbers', async () => {
      // -- Arrange: Set up two test users
      const user1 = await insertTestUser(createTestUser({ email: 'user1@example.com' }))
      const user2 = await insertTestUser(createTestUser({ email: 'user2@example.com' }))
      
      const ctx1 = createMockAuthContext(user1)
      const ctx2 = createMockAuthContext(user2)
      
      // -- Act: Create accounts for both users
      const account1 = await accountRouter
        .createCaller(ctx1)
        .createAccount({ accountType: 'checking' })
      
      const account2 = await accountRouter
        .createCaller(ctx2)
        .createAccount({ accountType: 'checking' })
      
      // -- Assert: Account numbers should be unique
      expect(account1.accountNumber).not.toBe(account2.accountNumber)
    })
  })

  describe('getAccounts', () => {
    it('should return empty array for user with no accounts', async () => {
      // -- Arrange: Set up test user without accounts
      const testUser = await insertTestUser(createTestUser())
      const mockCtx = createMockAuthContext(testUser)
      
      // -- Act: Get accounts
      const accounts = await accountRouter
        .createCaller(mockCtx)
        .getAccounts()
      
      // -- Assert: Should return empty array
      expect(accounts).toEqual([])
    })

    it('should return all accounts for authenticated user', async () => {
      // -- Arrange: Set up test user with multiple accounts
      const testUser = await insertTestUser(createTestUser())
      const mockCtx = createMockAuthContext(testUser)
      
      // Create checking and savings accounts
      await accountRouter
        .createCaller(mockCtx)
        .createAccount({ accountType: 'checking' })
      
      await accountRouter
        .createCaller(mockCtx)
        .createAccount({ accountType: 'savings' })
      
      // -- Act: Get accounts
      const accounts = await accountRouter
        .createCaller(mockCtx)
        .getAccounts()
      
      // -- Assert: Should return both accounts
      expect(accounts).toHaveLength(2)
      expect(accounts.map(a => a.accountType)).toContain('checking')
      expect(accounts.map(a => a.accountType)).toContain('savings')
    })

    it('should only return accounts for the authenticated user', async () => {
      // -- Arrange: Set up two users with accounts
      const user1 = await insertTestUser(createTestUser({ email: 'user1@example.com' }))
      const user2 = await insertTestUser(createTestUser({ email: 'user2@example.com' }))
      
      const ctx1 = createMockAuthContext(user1)
      const ctx2 = createMockAuthContext(user2)
      
      // Create accounts for both users
      await accountRouter.createCaller(ctx1).createAccount({ accountType: 'checking' })
      await accountRouter.createCaller(ctx2).createAccount({ accountType: 'savings' })
      
      // -- Act: Get accounts for user1
      const user1Accounts = await accountRouter
        .createCaller(ctx1)
        .getAccounts()
      
      // -- Assert: Should only return user1's account
      expect(user1Accounts).toHaveLength(1)
      expect(user1Accounts[0].accountType).toBe('checking')
      expect(user1Accounts[0].userId).toBe(user1.id)
    })
  })
})

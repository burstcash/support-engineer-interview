// ABOUTME: Test utilities for SecureBank application
// Provides helper functions for creating test data and mocking authentication

import bcrypt from 'bcryptjs'
import { testConnection } from './setup'
import { users, accounts, transactions } from '@/lib/db/schema'

// -- Test user data factory
// -- Creates consistent test users with valid but fake data
export function createTestUser(overrides: Partial<TestUser> = {}): TestUser {
  return {
    email: 'test@example.com',
    password: 'SecurePass123!',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '555-0123',
    dateOfBirth: '1990-01-01',
    ssn: '123-45-6789',
    address: '123 Test St',
    city: 'Test City',
    state: 'CA',
    zipCode: '12345',
    ...overrides
  }
}

// -- Test account data factory
// -- Creates accounts with realistic data for testing
export function createTestAccount(overrides: Partial<TestAccount> = {}): TestAccount {
  return {
    accountNumber: '1234567890',
    accountType: 'checking' as const,
    balance: 100.00,
    status: 'active',
    ...overrides
  }
}

// -- Test transaction data factory
// -- Creates transactions for testing balance calculations
export function createTestTransaction(overrides: Partial<TestTransaction> = {}): TestTransaction {
  return {
    type: 'deposit',
    amount: 50.00,
    description: 'Test transaction',
    ...overrides
  }
}

// -- Insert test user into database
// -- Returns the created user with ID for use in tests
export async function insertTestUser(userData: TestUser = createTestUser()) {
  const hashedPassword = await bcrypt.hash(userData.password, 10)
  
  const [user] = await testConnection
    .insert(users)
    .values({
      email: userData.email,
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phoneNumber: userData.phoneNumber,
      dateOfBirth: userData.dateOfBirth,
      ssn: userData.ssn,
      address: userData.address,
      city: userData.city,
      state: userData.state,
      zipCode: userData.zipCode,
    })
    .returning()
  
  return user
}

// -- Insert test account into database
// -- Links account to specified user ID
export async function insertTestAccount(userId: number, accountData: TestAccount = createTestAccount()) {
  const [account] = await testConnection
    .insert(accounts)
    .values({
      userId,
      accountNumber: accountData.accountNumber,
      accountType: accountData.accountType,
      balance: accountData.balance,
      status: accountData.status,
    })
    .returning()
  
  return account
}

// -- Insert test transaction into database
// -- Links transaction to specified account ID
export async function insertTestTransaction(accountId: number, transactionData: TestTransaction = createTestTransaction()) {
  const [transaction] = await testConnection
    .insert(transactions)
    .values({
      accountId,
      type: transactionData.type,
      amount: transactionData.amount,
      description: transactionData.description,
    })
    .returning()
  
  return transaction
}

// -- Create mock authentication context
// -- Simulates authenticated user for tRPC procedure testing
export function createMockAuthContext(user: Record<string, unknown>) {
  return {
    user,
    req: {} as Record<string, unknown>,
    res: {} as Record<string, unknown>,
  }
}

// -- Type definitions for test data
export interface TestUser {
  email: string
  password: string
  firstName: string
  lastName: string
  phoneNumber: string
  dateOfBirth: string
  ssn: string
  address: string
  city: string
  state: string
  zipCode: string
}

export interface TestAccount {
  accountNumber: string
  accountType: 'checking' | 'savings'
  balance: number
  status: string
}

export interface TestTransaction {
  type: string
  amount: number
  description: string
}

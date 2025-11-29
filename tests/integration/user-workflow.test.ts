// ABOUTME: Simple integration test demonstrating database and business logic
// Shows complete workflow testing without complex mocking

import { describe, it, expect } from 'vitest'
import bcrypt from 'bcryptjs'
import { testConnection } from '../setup'
import { createTestUser } from '../helpers'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

describe('User Registration Workflow', () => {
  it('should register a user with hashed password', async () => {
    // -- Arrange: Prepare user data
    const userData = createTestUser()
    const hashedPassword = await bcrypt.hash(userData.password, 10)
    
    // -- Act: Insert user into database (simulating registration)
    const [newUser] = await testConnection
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
    
    // -- Assert: Verify user creation
    expect(newUser).toMatchObject({
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
    })
    
    // -- Verify password was hashed (not stored in plain text)
    expect(newUser.password).not.toBe(userData.password)
    expect(newUser.password).toHaveLength(60) // bcrypt hash length
    
    // -- Verify password can be validated
    const isPasswordValid = await bcrypt.compare(userData.password, newUser.password)
    expect(isPasswordValid).toBe(true)
  })

  it('should prevent duplicate email registration', async () => {
    // -- Arrange: Register a user first
    const userData = createTestUser()
    const hashedPassword = await bcrypt.hash(userData.password, 10)
    
    await testConnection
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
    
    // -- Act & Assert: Attempt to register with same email should fail
    await expect(
      testConnection
        .insert(users)
        .values({
          email: userData.email, // Same email
          password: hashedPassword,
          firstName: 'Different',
          lastName: 'User',
          phoneNumber: '555-9999',
          dateOfBirth: '1985-01-01',
          ssn: '987654321',
          address: '456 Different St',
          city: 'Other City',
          state: 'NY',
          zipCode: '67890',
        })
    ).rejects.toThrow() // Should throw due to unique constraint
  })

  it('should authenticate user with correct credentials', async () => {
    // -- Arrange: Register a user
    const userData = createTestUser()
    const hashedPassword = await bcrypt.hash(userData.password, 10)
    
    await testConnection
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
    
    // -- Act: Simulate login authentication
    const foundUser = await testConnection
      .select()
      .from(users)
      .where(eq(users.email, userData.email))
      .get()
    
    const isPasswordValid = foundUser ? 
      await bcrypt.compare(userData.password, foundUser.password) : 
      false
    
    // -- Assert: Authentication should succeed
    expect(foundUser).toBeDefined()
    expect(isPasswordValid).toBe(true)
    expect(foundUser?.email).toBe(userData.email)
  })

  it('should reject authentication with wrong password', async () => {
    // -- Arrange: Register a user
    const userData = createTestUser()
    const hashedPassword = await bcrypt.hash(userData.password, 10)
    
    await testConnection
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
    
    // -- Act: Attempt authentication with wrong password
    const foundUser = await testConnection
      .select()
      .from(users)
      .where(eq(users.email, userData.email))
      .get()
    
    const isPasswordValid = foundUser ? 
      await bcrypt.compare('wrongpassword', foundUser.password) : 
      false
    
    // -- Assert: Authentication should fail
    expect(foundUser).toBeDefined()
    expect(isPasswordValid).toBe(false)
  })
})

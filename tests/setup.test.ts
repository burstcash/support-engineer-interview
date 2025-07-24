// ABOUTME: Basic test to verify testing framework setup
// Simple test to ensure Vitest configuration is working correctly

import { describe, it, expect } from 'vitest'

describe('Testing Framework Setup', () => {
  it('should run basic assertions', () => {
    expect(1 + 1).toBe(2)
    expect('hello').toBe('hello')
    expect([1, 2, 3]).toHaveLength(3)
  })

  it('should handle async operations', async () => {
    const promise = Promise.resolve('async result')
    await expect(promise).resolves.toBe('async result')
  })

  it('should test object matching', () => {
    const user = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com'
    }

    expect(user).toMatchObject({
      name: 'John Doe',
      email: 'john@example.com'
    })
  })
})

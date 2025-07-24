// ABOUTME: Vitest configuration for SecureBank application testing
// Educational setup with Next.js, tRPC, and database testing support

import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    // -- Run tests in Node.js environment (not browser)
    // -- Required for testing tRPC routers and database operations
    environment: 'node',
    
    // -- Global test setup file for database initialization
    // -- Ensures clean test state before each test suite
    setupFiles: ['./tests/setup.ts'],
    
    // -- Automatically clear mocks between tests
    // -- Prevents test pollution from mock state
    clearMocks: true,
    
    // -- Include common test file patterns
    // -- Covers unit, integration, and e2e test conventions
    include: [
      'tests/**/*.{test,spec}.{js,ts}',
      'app/**/*.{test,spec}.{js,ts}',
      'server/**/*.{test,spec}.{js,ts}',
      'lib/**/*.{test,spec}.{js,ts}',
      'components/**/*.{test,spec}.{js,ts}'
    ],
    
    // -- Exclude build artifacts and dependencies
    exclude: [
      'node_modules',
      '.next',
      'dist',
      'coverage'
    ],
    
    // -- Coverage configuration for code quality metrics
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'coverage/**',
        'dist/**',
        '.next/**',
        'tests/**',
        '**/*.config.*',
        '**/*.d.ts'
      ]
    }
  },
  
  // -- Path resolution matching Next.js configuration
  // -- Enables @/ imports in test files
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './')
    }
  }
})

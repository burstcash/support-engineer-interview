# Complete guide to running and extending the test suite

# Testing Framework Setup Guide

This document explains the testing framework setup for the SecureBank application and provides guidance for adding tests for bug fixes.

## Framework Overview

The project uses **Vitest** as the primary testing framework because:
- Fast execution with native ESM support
- TypeScript support out of the box
- Jest-compatible API for easy migration
- Better integration with Vite/Next.js build tools
- Built-in coverage reporting

## Project Structure

```
tests/
├── setup.ts              # Global test configuration
├── helpers.ts             # Test utilities and factories
├── setup.test.ts          # Framework verification tests
├── unit/                  # Unit tests
│   ├── account.test.ts    # Account router tests
│   └── validation.test.ts # Validation logic tests
└── integration/           # Integration tests
    └── auth.test.ts       # Authentication flow tests
```

## Configuration Files

### `vitest.config.ts`
- Configures Node.js environment for server-side testing
- Sets up path aliases matching Next.js configuration
- Enables coverage reporting
- Defines test file patterns

### `tests/setup.ts`
- Creates in-memory SQLite database for testing
- Manages test database lifecycle
- Provides clean state between tests
- Exports test database connection

## Available Test Scripts

```bash
# Run tests in watch mode (development)
npm test

# Run all tests once (CI/production)
npm run test:run

# Run tests with UI interface
npm run test:ui

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test path/to/test.test.ts
```

## Test Categories

### Unit Tests (`tests/unit/`)
Test individual functions, components, and modules in isolation.

**Example: Validation Tests**
- Email format validation
- Date of birth age verification
- Amount validation (positive, decimal places)
- Card number Luhn algorithm
- Phone number format checking

**Example: Router Tests**
- Account creation logic
- User account retrieval
- Business rule enforcement

### Integration Tests (`tests/integration/`)
Test complete workflows and API endpoints.

**Example: Authentication Flow**
- User registration with database persistence
- Login with credential verification
- Session management
- Error handling for invalid inputs

## Testing Utilities

### Test Data Factories (`tests/helpers.ts`)
Provides consistent test data creation:

```typescript
// Create test user with customizable fields
const user = createTestUser({ email: 'custom@example.com' })

// Insert user into test database
const dbUser = await insertTestUser(user)

// Create mock authentication context
const authCtx = createMockAuthContext(dbUser)
```

### Database Helpers
- `insertTestUser()` - Creates user in test database
- `insertTestAccount()` - Creates account linked to user
- `insertTestTransaction()` - Creates transaction records
- `createMockAuthContext()` - Simulates authenticated requests

## Writing Tests for Bug Fixes

When fixing bugs identified in the challenge, follow this pattern:

### 1. Write a Failing Test First
```typescript
it('should reject future birth dates (Bug VAL-202)', async () => {
  const futureDate = new Date()
  futureDate.setFullYear(futureDate.getFullYear() + 1)
  
  await expect(
    signupWithData({ dateOfBirth: futureDate.toISOString() })
  ).rejects.toThrow('Birth date cannot be in the future')
})
```

### 2. Implement the Fix
Make minimal changes to fix the specific bug.

### 3. Verify Test Passes
Ensure your fix makes the test pass and doesn't break existing tests.

### 4. Add Edge Cases
```typescript
it('should handle leap year birth dates correctly', async () => {
  // Test edge cases related to your fix
})
```

## Testing Anti-Patterns to Avoid

❌ **Don't test implementation details**
```typescript
// Bad: Testing internal function calls
expect(mockHashFunction).toHaveBeenCalledWith(password)
```

✅ **Do test behavior and outcomes**
```typescript
// Good: Testing the actual behavior
expect(user.password).not.toBe(plainPassword)
expect(await bcrypt.compare(plainPassword, user.password)).toBe(true)
```

❌ **Don't create tests that depend on each other**
```typescript
// Bad: Tests that must run in specific order
describe('User workflow', () => {
  let userId: number
  it('creates user', () => { userId = createUser() })
  it('updates user', () => { updateUser(userId) }) // Depends on previous test
})
```

✅ **Do make each test independent**
```typescript
// Good: Each test sets up its own data
it('should update user successfully', async () => {
  const user = await insertTestUser(createTestUser())
  // Test the update functionality
})
```

## Common Testing Patterns

### Testing tRPC Routers
```typescript
const mockCtx = createMockAuthContext(testUser)
const result = await router.createCaller(mockCtx).methodName(input)
expect(result).toMatchObject(expectedOutput)
```

### Testing Validation Schemas
```typescript
const schema = z.string().email()
expect(() => schema.parse('invalid-email')).toThrow()
expect(() => schema.parse('valid@email.com')).not.toThrow()
```

### Testing Database Operations
```typescript
const user = await insertTestUser(createTestUser())
const dbUser = await testConnection.select().from(users).where(eq(users.id, user.id)).get()
expect(dbUser).toBeDefined()
```

### Testing Error Conditions
```typescript
await expect(
  router.createCaller(mockCtx).protectedMethod(invalidInput)
).rejects.toThrow('Expected error message')
```

## Running Tests During Development

1. **Start test watcher**: `npm test`
2. **Make changes to code**
3. **Tests automatically re-run**
4. **Fix failing tests**
5. **Commit when tests pass**

## Coverage Reporting

Generate coverage reports to identify untested code:

```bash
npm run test:coverage
```

View the HTML coverage report in `coverage/index.html` to see:
- Line coverage percentages
- Uncovered code branches
- Function coverage statistics

## Adding Tests for New Features

1. Create test file in appropriate directory (`unit/` or `integration/`)
2. Follow the naming convention: `feature-name.test.ts`
3. Use descriptive test names that explain the behavior being tested
4. Include both happy path and error cases
5. Add JSDoc comments explaining complex test scenarios

## Debugging Tests

### Using VS Code Debugger
1. Set breakpoints in test files
2. Run "Debug Current File" in VS Code
3. Step through test execution
4. Inspect variables and state

### Console Debugging
```typescript
it('should debug complex behavior', async () => {
  const result = await someFunction()
  console.log('Debug result:', result) // Temporary debugging
  expect(result).toBe(expectedValue)
})
```

### Test Database Inspection
```typescript
it('should verify database state', async () => {
  // Inspect test database during debugging
  const allUsers = await testConnection.select().from(users).all()
  console.log('All test users:', allUsers)
})
```

This testing framework provides a solid foundation for ensuring code quality and catching regressions. Focus on testing the behavior that matters to users rather than implementation details.

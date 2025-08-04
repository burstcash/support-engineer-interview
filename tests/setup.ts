// ABOUTME: Global test setup for SecureBank application
// Configures in-memory database and shared test utilities

import { beforeAll, afterAll, beforeEach } from 'vitest'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from '@/lib/db/schema'

// -- Create in-memory database for testing
// -- Avoids conflicts with development database
let testDb: Database.Database
let testConnection: ReturnType<typeof drizzle<typeof schema>>

beforeAll(async () => {
  // -- Initialize in-memory SQLite database
  // -- Faster than file-based DB and automatically cleaned up
  testDb = new Database(':memory:')
  testConnection = drizzle(testDb, { schema })
    
  // -- Apply database schema to test database
  await initializeTestDatabase()
})

afterAll(async () => {
  // -- Clean up database connection
  // -- Prevents resource leaks in test environment
  if (testDb) {
    testDb.close()
  }
})

beforeEach(async () => {
  // -- Clear all data between tests
  await clearTestDatabase()
})

async function initializeTestDatabase() {
  // -- Create tables manually based on schema definition
  // -- This is a simplified approach for the interview context
  testDb.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone_number TEXT NOT NULL,
      date_of_birth TEXT NOT NULL,
      ssn TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      zip_code TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      account_number TEXT UNIQUE NOT NULL,
      account_type TEXT NOT NULL,
      balance REAL DEFAULT 0 NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER NOT NULL REFERENCES accounts(id),
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      token TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `)
}

async function clearTestDatabase() {
  // -- Clear all test data in dependency order using direct SQL
  // -- More reliable than Drizzle operations for test cleanup
  console.log('Clearing test database...')
  if (testDb) {
    testDb.exec(`
      DELETE FROM sessions;
      DELETE FROM transactions;  
      DELETE FROM accounts;
      DELETE FROM users;
    `)
    // Check if users were actually deleted
    const userCount = testDb.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }
    console.log(`Database cleared successfully. Users remaining: ${userCount.count}`)
  } else {
    console.warn('testDb not available for clearing')
  }
}

// -- Export test database connection for use in tests
// -- Allows tests to interact with the same database instance
export { testConnection, testDb }

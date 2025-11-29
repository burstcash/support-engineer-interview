import Database from "better-sqlite3";
import { copyFileSync, existsSync } from 'fs';
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { decryptSensitiveData, encryptSensitiveData } from '../lib/crypto'
import * as readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const command = process.argv[2];
const options = process.argv.slice(3);
let dbPath;
if (options.length === 1 && options[0].endsWith(".db")) {
  dbPath = join(__dirname, "..", options[0]);
} else {
  dbPath = join(__dirname, "..", "bank.db");
}
const db = Database(dbPath);

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  ssn?: string;
}

interface Session {
  id: number;
  token: string;
  expires_at: string;
  email: string;
}

if (command === "list-users") {
  console.log("\n=== Current Users ===");
  const users = db.prepare("SELECT id, email, first_name, last_name FROM users").all() as User[];
  if (users.length === 0) {
    console.log("No users found");
  } else {
    users.forEach((user) => {
      console.log(`ID: ${user.id}, Email: ${user.email}, Name: ${user.first_name} ${user.last_name}`);
    });
  }
  db.close();
} else if (command === "list-sessions") {
  console.log("\n=== Current Sessions ===");
  const sessions = db
    .prepare(
      `
    SELECT s.id, s.token, s.expires_at, u.email 
    FROM sessions s 
    JOIN users u ON s.user_id = u.id
  `
    )
    .all() as Session[];
  if (sessions.length === 0) {
    console.log("No sessions found");
  } else {
    sessions.forEach((session) => {
      const isExpired = new Date(session.expires_at) < new Date();
      console.log(`User: ${session.email}, Expires: ${session.expires_at} ${isExpired ? "(EXPIRED)" : "(ACTIVE)"}`);
      console.log(`Token: ${session.token.substring(0, 20)}...`);
      console.log("---");
    });
  }
  db.close();
} else if (command === "clear") {
  console.log("\n=== Clearing Database ===");
  db.exec("DELETE FROM sessions");
  db.exec("DELETE FROM transactions");
  db.exec("DELETE FROM accounts");
  db.exec("DELETE FROM users");
  console.log("Database cleared!");
} else if (command === "delete-user") {
  const email = process.argv[3];
  if (!email) {
    console.log("Please provide an email: npm run db:delete-user <email>");
  } else {
    const user = db.prepare("SELECT id FROM users WHERE email = ?").get(email) as User | undefined;
    if (user) {
      db.exec(`DELETE FROM sessions WHERE user_id = ${user.id}`);
      db.exec(`DELETE FROM transactions WHERE account_id IN (SELECT id FROM accounts WHERE user_id = ${user.id})`);
      db.exec(`DELETE FROM accounts WHERE user_id = ${user.id}`);
      db.exec(`DELETE FROM users WHERE id = ${user.id}`);
      console.log(`User ${email} and all related data deleted!`);
    } else {
      console.log(`User ${email} not found`);
    }
  }
  db.close();
} else if (command === "migrate-ssns") {
  if (options.length === 0) {
    console.warn("⚠️  WARNING: No database file specified. This will migrate the main bank.db file!");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question('Press Enter to continue or type "no" to cancel: ', (answer) => {
      if (answer.trim().toLowerCase() === 'no' || answer.trim().toLowerCase() === 'n') {
        console.log("Migration cancelled.");
        rl.close();
        db.close();
        return;
      }
      // Empty string (just Enter pressed) or anything else continues
      console.log("\n=== Migrating SSNs ===");
      performSSNMigration();
      rl.close();
      db.close();
    });    
  } else {
    console.log(`\n=== Migrating SSNs in ${options[0]} ===`);
    performSSNMigration();
    db.close();
  }
} else if (command === "backup-db") {
  const backupPath = join(__dirname, "..", "backup.db"); // hardcoded to avoid validation
  if (existsSync(backupPath)) {
    console.log("Backup file already exists. Please remove it first.");
  }
  copyFileSync(dbPath, backupPath);
  console.log(`Database backup created at ${backupPath}`);
  db.close();
} else {
  console.log(`
Database Utilities
==================

Commands:
  npm run db:list-users     - List all users
  npm run db:list-sessions  - List all sessions
  npm run db:clear          - Clear all data
  npm run db:delete-user    - Delete a specific user by email

Examples:
  npm run db:list-users
  npm run db:list-sessions
  npm run db:clear
  npm run db:delete-user test@example.com
  `);
}

function performSSNMigration() {
  console.log("Starting SSN migration...");
  const users = db.prepare("SELECT id, ssn FROM users").all() as User[];
  users.forEach((user) => {
    if (user.ssn && isPlaintextSSN(user)) {
      const encryptedSSN = encryptSensitiveData(user.ssn);
      db.prepare("UPDATE users SET ssn = ? WHERE id = ?").run(encryptedSSN, user.id);
      console.log(`User ${user.id}: SSN migrated`);
      const storedSSN = db.prepare("SELECT ssn FROM users WHERE id = ?").get(user.id) as { ssn: string };
      console.log(`User ${user.id}: Stored Encrypted SSN: ${storedSSN.ssn}`);
    }
  });
}

function isPlaintextSSN(user: User) {
  if (user.ssn === undefined) {
    return false; // No SSN to migrate
  }
  try {
    decryptSensitiveData(user.ssn);
    return false; // Already encrypted, don't migrate
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    if (/^\d{9}$/.test(user.ssn)) {
      return true;
    }
    console.warn(`User has invalid SSN format: id: ${user.id}, ssn: ${user.ssn}`);
    return false;
  }
}
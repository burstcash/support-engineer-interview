# SDET Technical Interview Challenge

## Overview

You have been provided with a NextJS TypeScript application that simulates a banking platform. Your goal is to achieve **Maximal test coverage within 2 hours** while identifying and documenting bugs in the codebase.

## The Application

**SecureBank** is a modern banking application with the following features:

- User registration (multi-step form)
- User authentication (login/logout)
- Account management (create checking/savings accounts)
- Fund accounts (via card or bank transfer)
- View transaction history

## Your Mission

1. **Set up a testing framework** of your choice (Jest, Vitest, Cypress, Playwright, etc.)
2. **Write comprehensive tests** covering all functionality
3. **Achieve maximal code coverage**
4. **Identify and document bugs** you discover through testing
5. **Fix the bugs you find**:

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Run the development server
npm run dev

# Open http://localhost:3000
```

### Database

The app uses SQLite and will automatically create a `bank.db` file on first run.

**Helpful database commands:**

```bash
npm run db:list-users      # List all users
npm run db:list-sessions   # List all sessions
npm run db:clear          # Clear all data
npm run db:delete-user    # Delete specific user
```

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, React, Tailwind CSS
- **Backend**: tRPC for type-safe APIs
- **Database**: SQLite with Drizzle ORM
- **Auth**: JWT-based sessions
- **Forms**: React Hook Form

## Known Issues

There are **10+ intentional bugs** hidden throughout the codebase. They span various categories:

- Input validation errors
- Logic bugs (incorrect return values)
- Race conditions
- Security vulnerabilities
- Performance problems
- Data integrity issues
- Memory leaks

## Testing Focus Areas

### 1. Authentication Flow

### 2. Account Operations

### 3. Financial Transactions

### 4. Security

### 5. Error Handling

## Evaluation Criteria

You will be evaluated on:

1. **Test Coverage**: Percentage achieved and quality of tests
2. **Bug Discovery**: Number and severity of bugs found
3. **Testing Strategy**: Approach and methodology
4. **Code Quality**: Clean, maintainable test code
5. **Understanding**: Can you explain the bugs and their impact?

## Time Management

- 15 min: Interviewer to walk through the challenge
- 15 min: Candidate to explore the app and understand functionality
- 15 min: Candidate to set up testing framework
- 75 min: Write tests and discover bugs
- 15 min: Document findings and attempt fixes
- 15 min: Questions about Glide and next steps

Good luck! Remember, the goal is not just coverage but finding real issues that would impact users.

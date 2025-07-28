# Support Engineer Technical Interview Challenge

## Overview

You have been provided with a NextJS TypeScript banking application that has several reported customer issues. Your goal is to **investigate, document root causes, and resolve as many bugs as possible within 2 hours**. Extra credit will be given for adding tests that verify your fixes.

## The Application

**SecureBank** is a modern banking application with the following features:

- User registration (multi-step form)
- User authentication (login/logout)
- Account management (create checking/savings accounts)
- Fund accounts (via card or bank transfer)
- View transaction history

## Your Mission

1. **Investigate reported issues** and document root causes
2. **Fix the identified bugs** with proper solutions
3. **Write clear documentation** explaining:
   - What caused each bug
   - How the fix resolves it
   - What preventive measures can avoid similar issues
4. **[Extra Credit] Add tests** to verify your fixes
5. **Prioritize issues** based on user impact

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

## Reported Issues

Below are customer-reported issues in ticket format. Each requires investigation and resolution.


### Validation Issues

**Ticket VAL-201: Email Validation Problems**

- **Reporter**: James Wilson
- **Priority**: High
- **Description**: "The system accepts invalid email formats and doesn't handle special cases properly."
- **Examples**:
  - Accepts "TEST@example.com" but converts to lowercase without notifying user
  - No validation for common typos like ".con" instead of ".com"

**Ticket VAL-202: Date of Birth Validation**

- **Reporter**: Maria Garcia
- **Priority**: Critical
- **Description**: "I accidentally entered my birth date as 2025 and the system accepted it."
- **Impact**: Potential compliance issues with accepting minors

**Ticket VAL-203: State Code Validation**

- **Reporter**: Alex Thompson
- **Priority**: Medium
- **Description**: "The system accepted 'XX' as a valid state code."
- **Impact**: Address verification issues for banking communications

**Ticket VAL-204: Phone Number Format**

- **Reporter**: John Smith
- **Priority**: Medium
- **Description**: "International phone numbers aren't properly validated. The system accepts any string of numbers."
- **Impact**: Unable to contact customers for important notifications

**Ticket VAL-205: Zero Amount Funding**

- **Reporter**: Lisa Johnson
- **Priority**: High
- **Description**: "I was able to submit a funding request for $0.00"
- **Impact**: Creates unnecessary transaction records

**Ticket VAL-206: Card Number Validation**

- **Reporter**: David Brown
- **Priority**: Critical
- **Description**: "System accepts invalid card numbers"
- **Impact**: Failed transactions and customer frustration

**Ticket VAL-207: Routing Number Optional**

- **Reporter**: Support Team
- **Priority**: High
- **Description**: "Bank transfers are being submitted without routing numbers"
- **Impact**: Failed ACH transfers

**Ticket VAL-208: Weak Password Requirements**

- **Reporter**: Security Team
- **Priority**: Critical
- **Description**: "Password validation only checks length, not complexity"
- **Impact**: Account security risks

**Ticket VAL-209: Amount Input Issues**

- **Reporter**: Robert Lee
- **Priority**: Medium
- **Description**: "System accepts amounts with multiple leading zeros"
- **Impact**: Confusion in transaction records

**Ticket VAL-210: Card Type Detection**

- **Reporter**: Support Team
- **Priority**: High
- **Description**: "Card type validation only checks basic prefixes, missing many valid cards"
- **Impact**: Valid cards being rejected

### Security Issues

**Ticket SEC-301: SSN Storage**

- **Reporter**: Security Audit Team
- **Priority**: Critical
- **Description**: "SSNs are stored in plaintext in the database"
- **Impact**: Severe privacy and compliance risk

**Ticket SEC-302: Insecure Random Numbers**

- **Reporter**: Security Team
- **Priority**: High
- **Description**: "Account numbers generated using Math.random()"
- **Impact**: Potentially predictable account numbers

**Ticket SEC-303: XSS Vulnerability**

- **Reporter**: Security Audit
- **Priority**: Critical
- **Description**: "Unescaped HTML rendering in transaction descriptions"
- **Impact**: Potential for cross-site scripting attacks

**Ticket SEC-304: Session Management**

- **Reporter**: DevOps Team
- **Priority**: High
- **Description**: "Multiple valid sessions per user, no invalidation"
- **Impact**: Security risk from unauthorized access

### Logic and Performance Issues

**Ticket PERF-401: Account Creation Error**

- **Reporter**: Support Team
- **Priority**: Critical
- **Description**: "New accounts show $100 balance when DB operations fail"
- **Impact**: Incorrect balance displays

**Ticket PERF-402: Logout Issues**

- **Reporter**: QA Team
- **Priority**: Medium
- **Description**: "Logout always reports success even when session remains active"
- **Impact**: Users think they're logged out when they're not

**Ticket PERF-403: Session Expiry**

- **Reporter**: Security Team
- **Priority**: High
- **Description**: "Expiring sessions still considered valid until exact expiry time"
- **Impact**: Security risk near session expiration

**Ticket PERF-404: Transaction Sorting**

- **Reporter**: Jane Doe
- **Priority**: Medium
- **Description**: "Transaction order seems random sometimes"
- **Impact**: Confusion when reviewing transaction history

**Ticket PERF-405: Missing Transactions**

- **Reporter**: Multiple Users
- **Priority**: Critical
- **Description**: "Not all transactions appear in history after multiple funding events"
- **Impact**: Users cannot verify all their transactions

**Ticket PERF-406: Balance Calculation**

- **Reporter**: Finance Team
- **Priority**: Critical
- **Description**: "Account balances become incorrect after many transactions"
- **Impact**: Critical financial discrepancies

**Ticket PERF-407: Performance Degradation**

- **Reporter**: DevOps
- **Priority**: High
- **Description**: "System slows down when processing multiple transactions"
- **Impact**: Poor user experience during peak usage

**Ticket PERF-408: Resource Leak**

- **Reporter**: System Monitoring
- **Priority**: Critical
- **Description**: "Database connections remain open"
- **Impact**: System resource exhaustion

## Evaluation Criteria

You will be evaluated on:

1. **Root Cause Analysis**: Depth and accuracy of bug investigation
2. **Solution Quality**: Effectiveness and robustness of fixes
3. **Documentation**: Clarity and completeness of explanations
4. **Prioritization**: Ability to identify and address critical issues first
5. **Communication**: How well you explain technical issues to different audiences

## Time Management

- 15 min: Interviewer to walk through the challenge
- 15 min: Review reported issues and prioritize
- 90 min: Investigate and fix bugs
- 15 min: Document findings and solutions
- 15 min: Questions about Glide and next steps

Good luck! Remember, the goal is to demonstrate your ability to investigate, solve, and clearly explain technical issues.

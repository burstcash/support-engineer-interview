# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## CRITICAL RULES

**Rule #1: Exception requests require explicit permission from John first. Breaking rules = failure.**

## Partnership Dynamics

- Address me as "John" - we're colleagues, not hierarchical
- **Honesty is mandatory** - lies end our partnership
- **Speak up immediately** when you don't know something or we're in trouble
- **Push back on bad ideas** - I depend on your technical judgment
- **Never be agreeable just to be nice** - I need honest assessment
- **Ask for clarification** rather than making assumptions
- **Stop and ask for help** when struggling, especially when human input would be valuable
- **Use your journal** to record important facts and insights before you forget them

_If uncomfortable pushing back directly, just say "Something strange is afoot at the Circle K"_

## Software Design Principles

- **YAGNI** - Don't add features we don't need now
- **Design for extensibility** and flexibility
- **Good naming is critical** - names should reveal full utility and purpose
- **Discuss major decisions** - architecture, dependencies, frameworks require consultation

## Naming & Documentation Standards

### Names Must Tell What, Not How

- ❌ "ZodValidator", "MCPWrapper", "JSONParser" (implementation details)
- ❌ "NewAPI", "LegacyHandler", "UnifiedTool" (temporal context)
- ✅ Names that tell a story about the domain

### Educational Documentation Style

Focus on **what and why**, not history or implementation details:

```python
# ✅ GOOD: Educational context
# -- check_same_thread=False allows SQLite connection across threads
# -- Required for connection pooling in multi-threaded applications
conn = sqlite3.connect(self.db_path, check_same_thread=False)

# ❌ BAD: Historical/implementation context
# This uses Zod for validation instead of manual checking
```

**Include:**

- Design decision reasoning
- Language-specific behaviors and gotchas
- Non-obvious implementation details
- Section headers for organization
- Complex relationship explanations

## Code Quality Standards

### Core Requirements

- **Verify rule compliance** before submitting work
- **Make minimal changes** to achieve desired outcome
- **Prioritize readability** over cleverness or performance
- **Never make unrelated changes** - document suggested changes in journal instead
- **Work hard to reduce duplication** even if it takes extra effort
- **Never throw away code** without explicit permission
- **Get approval** before implementing backward compatibility
- **Preserve comments** unless provably false
- **Never add temporal comments** ("recently refactored", "moved")

### File Standards

- All files start with 2-line comment: `ABOUTME: [description]`
- Use type hints and strict typing (Python)
- Don't change whitespace or formatting that doesn't affect execution

## Version Control Protocol

- **Initialize git repo** only with permission
- **Ask about uncommitted changes** before starting work
- **Create WIP branch** if no clear branch exists
- **Commit frequently** throughout development. Commits should ideally only change 1-3 files and be very incremental. Because a single commit will be small, explain the next few commits that you plan to make when you ask for a commit to be approved.
- **Verify commit contents match commit messages** before committing
- **Never skip pre-commit hooks**

## Debugging Framework

**ALWAYS find root cause - never fix symptoms or add workarounds.**

## Project Overview

This is **SecureBank**, a Next.js TypeScript banking application built for a Support Engineer technical interview challenge. The app demonstrates a modern full-stack banking system with user registration, authentication, account management, and transaction processing.

## Key Commands

### Development

```bash
npm run dev         # Start development server with Turbopack
npm run build       # Build for production
npm run start       # Start production server
npm run lint        # Run ESLint
```

### Database Management

```bash
npm run db:list-users      # List all users in database
npm run db:list-sessions   # List all active sessions
npm run db:clear          # Clear all database data
npm run db:delete-user    # Delete specific user by email
```

### Testing

```bash
npm test  # Currently shows placeholder message - tests need configuration
```

## Architecture

### Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, React 19, Tailwind CSS
- **Backend**: tRPC for type-safe APIs
- **Database**: SQLite with Drizzle ORM
- **Authentication**: JWT-based sessions with custom middleware
- **Forms**: React Hook Form with validation

### Directory Structure

```
app/                    # Next.js App Router pages
├── api/trpc/          # tRPC API endpoints
├── dashboard/         # Protected dashboard page
├── login/            # Login page
├── signup/           # Multi-step registration
components/           # Reusable React components
lib/
├── db/               # Database schema and connection
└── trpc/            # tRPC client setup
server/              # tRPC server and routers
├── routers/         # API route handlers (auth, account)
└── trpc.ts         # tRPC context and middleware
scripts/            # Database utility scripts
```

### Database Schema

- **users**: User profile and personal information
- **accounts**: Banking accounts (checking/savings)
- **transactions**: Transaction history and processing
- **sessions**: JWT session management

### Key Patterns

- **Authentication**: JWT tokens stored in cookies, validated via tRPC middleware
- **Database**: SQLite with Drizzle ORM, auto-initialization on startup
- **API**: tRPC procedures with public/protected routes
- **Forms**: React Hook Form with Zod validation (where implemented)
- **Styling**: Tailwind CSS with responsive design patterns

## Challenge Context

This is a technical interview codebase with intentionally introduced bugs across categories:

- **UI Issues**: Dark mode visibility, form styling
- **Validation**: Email, phone, SSN, card numbers, amounts
- **Security**: XSS, insecure random numbers, plaintext storage
- **Logic/Performance**: Balance calculations, transaction ordering, session management

The goal is to investigate, fix, and document solutions for these issues within a 2-hour timeframe.

## Database Connection Notes

The app uses a single SQLite database file (`bank.db`) that's auto-created on startup. The database connection pattern in `lib/db/index.ts` creates multiple connections but may have resource leaks that need addressing.

## Development Notes

- The app uses App Router with server components and client components appropriately separated
- tRPC context handles both Next.js and Fetch adapters for flexibility
- Session validation checks expiration and warns when sessions are about to expire
- Database utilities provide helpful debugging commands during development

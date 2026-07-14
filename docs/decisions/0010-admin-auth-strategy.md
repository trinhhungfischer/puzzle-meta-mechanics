# 0010. Admin Auth Strategy

Date: 2026-07-14

## Status

Accepted

## Context

The `/admin` routes in the Puzzle Meta-Mechanic Catalog were previously open, allowing anyone to perform CRUD operations (create, update, bulk delete) on the database. To prepare the app for broader public visibility, we must establish an authorization boundary that strictly gates the admin portal. We need an authentication strategy that is easy to manage, secure, and fits well within the Next.js App Router ecosystem.

## Decision

We will use **Auth.js (next-auth v5)** with the **Google OAuth Provider** as our authentication solution. 

1. **Authentication Boundary**: 
   - A Next.js edge middleware (`src/middleware.ts`) will protect all routes matching `/admin` and `/admin/(.*)`. 
   - Exceptions: `/admin/login` will remain unprotected to serve as the custom sign-in page.
2. **Session Strategy**:
   - We will use JWT (JSON Web Tokens) for the session strategy to keep edge middleware fast and avoid database session lookups.
3. **Authorization (Allowlist)**:
   - Only explicitly permitted Google accounts can log in.
   - We will enforce this by verifying the user's email against an `ADMIN_EMAIL_ALLOWLIST` environment variable during the `signIn` callback in NextAuth. If the email is not in the list, access is immediately rejected.
4. **Configuration**:
   - The application relies on `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, and `AUTH_SECRET` environment variables.

## Consequences

**Positive:**
- Secure admin boundary blocking unauthorized mutations.
- No need to manage or store passwords (handled by Google).
- Very low infrastructure footprint since session validation is purely JWT-based at the edge.

**Negative:**
- Requires configuring and maintaining Google Cloud Console credentials.
- The allowlist is static (env variable); adding a new admin requires an environment redeploy. (This is acceptable for the current small team scale).

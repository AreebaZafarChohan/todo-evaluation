---
name: specification-writing
description: "Teach how to write clear, testable, and unambiguous specifications. Covers problem statements, user journeys, system boundaries, requirements, and acceptance criteria using MUST/MUST NOT language."
---

# Specification Writing Skill

## Purpose

Teach how to write clear, testable, and unambiguous specifications. This skill ensures all feature requirements are written in a way that developers can implement correctly and testers can verify independently.

## Core Principles

### What Specifications Are

- **Authoritative source** of WHAT the system must do, not HOW
- **Business-focused** description of user needs and value
- **Testable** statements that can be verified independently
- **Complete** enough that implementers have clear direction

### What Specifications Are NOT

- Architecture decisions (deferred to planning phase)
- Implementation details (language, framework, database choices)
- Speculative features not requested by users
- Technical jargon meant for developers only

---

## Specification Structure

### 1. Problem Statement

**Purpose**: Define WHY this feature exists and what problem it solves.

**Template**:

```markdown
## Problem Statement

**Current State**: [Describe the current situation and pain]

**Desired State**: [Describe what should be different]

**Gap**: [What is missing that causes the problem]

**Business Value**: [Why solving this matters to users/business]
```

**Example - Good**:

```markdown
## Problem Statement

**Current State**: Users must call support to reset their passwords, taking an average of 24 hours to resolve.

**Desired State**: Users can reset their passwords independently in under 5 minutes.

**Gap**: No self-service password reset capability exists in the system.

**Business Value**: Reduces support ticket volume by 40% and improves user satisfaction.
```

**Example - Bad**:

```markdown
## Problem Statement

Users are unhappy with the current system and want it to be better.
```

### 2. User Journeys

**Purpose**: Describe HOW users will interact with the system to accomplish goals.

**Template**:

```markdown
## User Journeys

### Journey: [Journey Name]

**Actor**: [Who is performing this journey]

**Goal**: [What the actor wants to accomplish]

**Preconditions**: [What must be true before starting]

**Main Flow**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Postconditions**: [What is true after completion]

**Priority**: [P1 (must have) | P2 (should have) | P3 (nice to have)]
```

**Example - Good**:

```markdown
## User Journeys

### Journey: Reset Password via Email

**Actor**: Registered user who forgot their password

**Goal**: Regain access to their account

**Preconditions**:
- User has a registered account
- User has access to their registered email
- User knows their username or email

**Main Flow**:
1. User clicks "Forgot Password" on login page
2. User enters their email address
3. System sends password reset email
4. User clicks reset link in email
5. User enters new password
6. System validates and saves new password
7. User is redirected to login page

**Postconditions**:
- User can log in with new password
- Previous sessions are invalidated

**Priority**: P1
```

**Example - Bad**:

```markdown
## User Journeys

### Journey: User resets password

User goes to the page and resets their password somehow.
```

### 3. System Boundaries

**Purpose**: Define WHAT is in scope and WHAT is out of scope.

**Template**:

```markdown
## System Boundaries

### In Scope

- [Feature/behavior 1]
- [Feature/behavior 2]
- [Feature/behavior 3]

### Out of Scope

- [Feature NOT included 1]
- [Feature NOT included 2]
- [Feature NOT included 3]

### Dependencies

- [External systems or features required]
```

**Example - Good**:

```markdown
## System Boundaries

### In Scope

- Password reset via email
- Password reset via SMS (optional)
- Email notification delivery
- Session invalidation on password change

### Out of Scope

- Password reset via third-party OAuth (Phase 2)
- Account recovery questions
- Admin-initiated password reset (separate feature)
- Biometric authentication

### Dependencies

- Email service provider (SendGrid)
- User database with email addresses
- Session management system
```

**Example - Bad**:

```markdown
## System Boundaries

### In Scope

Everything related to authentication.

### Out of Scope

Nothing - we're doing all authentication features.
```

---

## Requirements

### Functional Requirements

**Purpose**: Define specific capabilities the system MUST provide.

**Language**: Use **MUST** / **MUST NOT** for requirements.

**Template**:

```markdown
### FR-[Number]: [Brief Title]

**Requirement**: The system MUST [specific capability]

**Rationale**: [Why this is needed]

**Acceptance Criteria**:
- [Criterion 1]
- [Criterion 2]
- [Criterion 3]
```

**Example - Good**:

```markdown
### FR-001: Email Verification

**Requirement**: The system MUST verify that the email address exists before sending a reset link.

**Rationale**: Prevents abuse of non-existent accounts and provides immediate feedback.

**Acceptance Criteria**:
- System MUST return error within 2 seconds for invalid email format
- System MUST return success message for valid email format
- System MUST NOT reveal whether account exists (security)
```

**Example - Bad**:

```markdown
### FR-001: Email Verification

The system should handle email verification properly and be user-friendly.
```

### Non-Functional Requirements

**Purpose**: Define quality attributes the system MUST exhibit.

**Template**:

```markdown
### NFR-[Number]: [Quality Attribute]

**Requirement**: The system MUST [specific measurable quality]

**Measurable Criterion**: [How to test/verify]

**Priority**: [P1 | P2 | P3]
```

**Example - Good**:

```markdown
### NFR-001: Response Time

**Requirement**: The system MUST complete password reset email delivery within 5 seconds of request.

**Measurable Criterion**: Email sent timestamp - request received timestamp ≤ 5000ms

**Priority**: P1

### NFR-002: Availability

**Requirement**: The password reset system MUST be available 99.9% of the time.

**Measurable Criterion**: (Total uptime / Total time) ≥ 0.999

**Priority**: P1
```

**Example - Bad**:

```markdown
### NFR-001: Performance

The system must be fast and responsive.
```

### Common Non-Functional Categories

| Category | What to Specify | Example |
|----------|-----------------|---------|
| **Performance** | Latency, throughput, response time | "MUST respond within 200ms" |
| **Availability** | Uptime percentage, downtime allowance | "MUST be available 99.9% of the time" |
| **Scalability** | User capacity, data volume | "MUST support 10,000 concurrent users" |
| **Security** | Authentication, authorization, data protection | "MUST encrypt passwords with bcrypt" |
| **Usability** | Task completion rates (not subjective) | "90% of users MUST complete reset in under 3 minutes" |
| **Reliability** | Error rates, recovery time | "MUST have < 0.1% error rate" |

---

## Acceptance Criteria

### Writing Rules

1. **Use MUST / MUST NOT** for requirements
2. **Be specific and measurable** - no vague language
3. **One criterion per line** - don't combine conditions
4. **Testable in isolation** - can be verified independently

### Forbidden Words and Phrases

| Forbidden | Why | Replace With |
|-----------|-----|--------------|
| "fast" | Not measurable | "respond within 200ms" |
| "user-friendly" | Subjective | "90% task completion rate" |
| "responsive" | Vague | "render within 100ms" |
| "easy" | Subjective | "require ≤ 3 steps" |
| "efficient" | Vague | "complete within 5 seconds" |
| "modern" | Subjective | [Remove - specify capability instead] |
| "intuitive" | Subjective | [Remove - specify behavior instead] |
| "as soon as possible" | No deadline | "within [X] time unit" |
| "should" | Weak requirement | "MUST" |
| "could" | Optional requirement | "MAY" (if truly optional) |

### Acceptance Criteria Template

```markdown
### AC-[Number]: [Brief Title]

**Scenario**: [Brief description of scenario]

**Given** [initial state]
**When** [action taken]
**Then** [expected outcome - MUST be testable]

**Verification**: [How to test this criterion]
```

### Examples - Good

```markdown
### AC-001: Valid Email Submission

**Scenario**: User submits valid email for password reset

**Given** the user is on the password reset page
**When** the user enters a valid email address
**Then** the system MUST display "Check your email for reset instructions"
**And** the system MUST send a reset email to that address
**And** the system MUST NOT reveal whether the account exists

**Verification**:
1. Enter test@valid.com
2. Verify message displayed
3. Check email inbox for message
4. Verify no account existence indication in response

---

### AC-002: Invalid Email Format

**Scenario**: User submits invalid email format

**Given** the user is on the password reset page
**When** the user enters "notanemail"
**Then** the system MUST display "Please enter a valid email address"
**And** the system MUST NOT send any email

**Verification**:
1. Enter "notanemail"
2. Verify error message displays immediately
3. Verify no email sent (check email logs)
```

### Examples - Bad

```markdown
### AC-001: Email Submission

**Scenario**: User submits email

**Given** user has an email
**When** they submit it
**Then** system should handle it properly

**Verification**: Try it and see if it works
```

---

## Writing Templates

### Complete Specification Template

```markdown
# Feature Specification: [Feature Name]

**Created**: [DATE]
**Status**: Draft | Review | Approved

## Problem Statement

**Current State**: [Description]

**Desired State**: [Description]

**Gap**: [Description]

**Business Value**: [Description]

## User Journeys

### Journey: [Name]

**Actor**: [Who]

**Goal**: [What they want]

**Preconditions**: [Requirements]

**Main Flow**:
1. [Step]
2. [Step]
3. [Step]

**Postconditions**: [Result]

**Priority**: P1 | P2 | P3

### Journey: [Name]
[Repeat structure]

## System Boundaries

### In Scope

- [Item 1]
- [Item 2]

### Out of Scope

- [Item 1]
- [Item 2]

### Dependencies

- [Item 1]
- [Item 2]

## Functional Requirements

### FR-001: [Title]

**Requirement**: The system MUST [specific capability]

**Rationale**: [Why needed]

**Acceptance Criteria**:
- [Criterion 1]
- [Criterion 2]

### FR-002: [Title]
[Repeat structure]

## Non-Functional Requirements

### NFR-001: [Title]

**Requirement**: The system MUST [quality attribute]

**Measurable Criterion**: [How to measure]

**Priority**: P1 | P2 | P3

## Success Criteria

- [Measurable outcome 1]
- [Measurable outcome 2]

## Assumptions

- [Assumption 1]
- [Assumption 2]

## Open Questions

- [Question 1]
- [Question 2]
```

---

## Common Mistakes

### Mistake 1: Mixing Requirements with Solutions

**Wrong**: "The system MUST use a JWT token for authentication."

**Right**: "The system MUST verify user identity before granting access."

JWT is an implementation detail - the requirement is identity verification.

### Mistake 2: Using Vague Language

**Wrong**: "The system MUST be fast."

**Right**: "The system MUST respond within 200ms for 95% of requests."

### Mistake 3: Combining Multiple Conditions

**Wrong**: "The system MUST validate the email format AND check if the account exists AND send a confirmation email within 5 seconds."

**Right**: Split into separate requirements:
- "The system MUST validate email format within 100ms."
- "The system MUST send confirmation email within 5 seconds of successful validation."

### Mistake 4: Writing for Developers

**Wrong**: "Create a POST endpoint at /api/reset-password that accepts JSON with email field and returns 200 on success."

**Right**: "The system MUST provide a way for users to request a password reset by email."

The endpoint design is for planning phase, not specification.

### Mistake 5: Missing Negative Cases

**Wrong**: Only defining what the system SHOULD do.

**Right**: Also define what the system MUST NOT do.

**Example**: "The system MUST NOT reveal whether an email address is registered."

### Mistake 6: Subjective Quality Attributes

**Wrong**: "The interface MUST be intuitive."

**Right**: "Users MUST be able to complete password reset in 3 clicks or fewer."

### Mistake 7: Not Defining Measurable Thresholds

**Wrong**: "The system MUST handle many users."

**Right**: "The system MUST support 10,000 concurrent users."

---

## Quality Checklist

Before finalizing a specification, verify:

- [ ] Problem statement clearly defines WHY this feature exists
- [ ] Each user journey has an identified actor, goal, and priority
- [ ] System boundaries clearly state what is IN and OUT of scope
- [ ] All requirements use MUST / MUST NOT language
- [ ] All requirements are independently testable
- [ ] No vague language (fast, user-friendly, efficient, etc.)
- [ ] No implementation details (languages, frameworks, databases)
- [ ] No architecture decisions included
- [ ] No speculative features not requested by users
- [ ] All acceptance criteria have measurable outcomes
- [ ] Non-functional requirements have specific thresholds
- [ ] Business value is clearly articulated

---

## Examples

### Complete Good Specification (Password Reset)

```markdown
# Feature Specification: Self-Service Password Reset

**Created**: 2024-01-15
**Status**: Draft

## Problem Statement

**Current State**: Users who forget their password must contact support to reset, averaging 24 hours resolution time.

**Desired State**: Users can independently reset their password in under 5 minutes.

**Gap**: No self-service password reset capability exists.

**Business Value**: Reduces support ticket volume by 40%, improves user satisfaction.

## User Journeys

### Journey: Reset via Email

**Actor**: Registered user who forgot password

**Goal**: Regain account access

**Preconditions**:
- User has registered account
- User has access to registered email

**Main Flow**:
1. User clicks "Forgot Password"
2. User enters registered email
3. System sends reset link
4. User clicks link within 1 hour
5. User enters new password
6. System validates and saves
7. System invalidates all sessions

**Postconditions**:
- User can log in with new password
- All previous sessions are logged out

**Priority**: P1

## System Boundaries

### In Scope
- Email-based password reset
- 1-hour reset link expiration
- Session invalidation on password change
- Email notification delivery

### Out of Scope
- SMS-based reset (Phase 2)
- Third-party OAuth reset
- Admin-initiated reset

### Dependencies
- Email service (SendGrid)
- User database
- Session management

## Functional Requirements

### FR-001: Reset Request

**Requirement**: The system MUST accept email address and initiate reset process.

**Rationale**: Core functionality for self-service reset.

**Acceptance Criteria**:
- System MUST respond within 2 seconds
- System MUST NOT reveal account existence
- System MUST send email within 5 seconds of valid request

### FR-002: Reset Link Expiration

**Requirement**: The system MUST invalidate reset links after 1 hour.

**Rationale**: Security measure to limit exposure window.

**Acceptance Criteria**:
- Link MUST be valid for exactly 60 minutes
- System MUST show "link expired" message after expiration
- Expired links MUST NOT reset password

## Non-Functional Requirements

### NFR-001: Response Time

**Requirement**: The system MUST complete reset email delivery within 5 seconds.

**Measurable Criterion**: Email sent - request received ≤ 5000ms

### NFR-002: Security

**Requirement**: The system MUST NOT indicate whether an email address is registered.

**Measurable Criterion**: Response time and message identical for valid/invalid emails

## Success Criteria

- Users can reset password without support assistance
- 95% of users complete reset in under 3 minutes
- Support tickets for password reset reduce by 40%
```

---

## Summary

Writing good specifications requires:

1. **Focus on WHAT, not HOW** - Describe user needs, not technical solutions
2. **Use precise language** - MUST/MUST NOT, measurable thresholds
3. **Be testable** - Every requirement can be verified independently
4. **Avoid subjectivity** - No "fast," "user-friendly," or "intuitive"
5. **Stay in scope** - No architecture, no implementation, no speculation
6. **Define boundaries** - Clear in/out of scope statements
7. **Write for all stakeholders** - Business people, testers, and developers should understand
# SpecKit Constitution

## Project: Evolution of Todo

**Version:** 1.0.0
**Effective Date:** 2025-01-01
**Author:** SpecKit Generator
**Status:** Active

---

## 1. Project Identity

### 1.1 Project Name

**Evolution of Todo** — A Five-Phase Spec-Driven, AI-Native Hackathon Project

### 1.2 Project Context

This project is part of the "Evolution of Todo" hackathon series. The system evolves incrementally across five distinct phases, each building upon the previous while introducing new capabilities, architectural patterns, and technical complexity:

- **Phase I (CLI):** Foundation — Command-line interface with in-memory persistence
- **Phase II (Web):** HTTP API — FastAPI-based web service with persistent storage
- **Phase III (AI Agents):** Intelligence — AI-powered features and autonomous agents
- **Phase IV (Kubernetes):** Orchestration — Containerized deployment with k8s management
- **Phase V (Cloud-Native, Event-Driven):** Scale — Event-driven architecture, cloud-native services

The primary goal of this project is to demonstrate **professional, spec-driven engineering** with disciplined AI agent usage. Feature velocity is secondary to engineering excellence, traceability, and architectural integrity.

### 1.3 Purpose of the Constitution

This Constitution defines **global, immutable engineering principles, constraints, and standards** that apply to the ENTIRE project across all five phases. It serves as the highest authority for:

- Human developers and contributors
- AI agents (Claude, Copilot, Gemini, Cursor, and all future agents)
- Tools, scripts, and automation systems
- IDE configurations and editor settings
- Continuous Integration and Deployment pipelines
- Future contributors joining at any phase

This document takes precedence over all other project documentation, including but not limited to READMEs, ADRs, inline comments, and team member preferences. Any conflict between this Constitution and other documents must be resolved in favor of this Constitution.

---

## 2. Non-Negotiable Principles

The following principles are **absolute and inviolable**. No circumstances justify their violation.

### 2.1 Spec-Driven Development (SDD) Mandate

**SDD is mandatory for all work.** Every feature, bug fix, refactoring effort, and infrastructure change must begin with a specification document stored in `specs/<feature-name>/spec.md`. No code may be written without an approved specification.

The specification must include:
- Clear problem statement
- Acceptance criteria (testable, measurable)
- User stories or use cases
- Constraints and non-goals
- Interface contracts (inputs, outputs, errors)

### 2.2 Lifecycle Enforcement

The following lifecycle **must always be followed** in order:

1. **Specify** — Create or update `specs/<feature>/spec.md`
2. **Plan** — Create `specs/<feature>/plan.md` with architectural decisions
3. **Tasks** — Create `specs/<feature>/tasks.md` with testable tasks
4. **Implement** — Write code following the tasks

Skipping stages is forbidden. Combining stages is discouraged but permitted if the same person authors all artifacts and the quality is not compromised.

### 2.3 Traceability Requirement

**No code may exist without a linked Task ID and Spec reference.** Every function, class, module, and configuration file must be traceable to a specific task and specification.

- Task IDs follow the format: `PHASE-FEATURE-###` (e.g., `I-TODO-001`)
- Every commit message must reference the Task ID
- Every pull request must link to the relevant spec
- Code comments may include Task IDs for complex implementations

### 2.4 Agent Authority Limits

AI agents are **executors, not decision-makers**. Agents must:

- Follow specifications exactly as written
- Ask for clarification when requirements are ambiguous
- Propose alternatives but not implement them without approval
- Never make architectural decisions without human consent
- Surface dependencies and risks rather than guessing solutions

Agents must not:
- Invent APIs, data models, or contracts
- Make assumptions about user intent
- Implement features not specified in the task
- Introduce dependencies without explicit approval
- Skip validation or testing steps

### 2.5 Spec Completeness Protocol

**Agents must stop and ask for clarification if specs are incomplete.** When encountering ambiguous, missing, or contradictory requirements, agents must:

1. Identify the specific gaps or conflicts
2. Propose specific questions to resolve them
3. Wait for explicit clarification before proceeding
4. Document the clarification in the spec before implementation

Completing ambiguous specs through guesswork is a violation of this Constitution.

### 2.6 Phase Boundaries

**Phase boundaries must be respected.** No future-phase features may be implemented in an earlier phase. No rewrites of earlier phase work to accommodate later phase needs unless explicitly specified.

Phase transitions must be explicit:
- A phase completion checklist must be signed off
- Migration plans must be documented
- Backward compatibility must be maintained where specified

---

## 3. Technology and Stack Constraints

These constraints apply globally across all phases unless explicitly superseded by phase-specific requirements.

### 3.1 Language Requirements

- **Primary Language:** Python 3.11+
- **Type System:** Strict type hints required for all public APIs
- **Style:** PEP 8 with Black formatting
- **Linting:** ruff with strict rules enabled

### 3.2 Async-First Mindset

Where I/O operations are involved, **asynchronous code is preferred**. This applies to:

- Network requests (HTTP, database, message queues)
- File system operations
- Inter-process communication
- Long-running background tasks

Synchronous code is acceptable only when:
- The operation is CPU-bound (not I/O-bound)
- The async alternative provides no meaningful benefit
- The calling context is inherently synchronous (e.g., CLI entry points)

### 3.3 Framework Mandates

| Phase | Framework | Mandate |
|-------|-----------|---------|
| I | — | Standard library only for core features |
| II+ | FastAPI | Mandatory for all HTTP APIs |
| II+ | Pydantic | Mandatory for all data validation |
| II+ | SQLModel | Mandatory for all database interactions |

### 3.4 Data Modeling Standards

All data models must:

- Use Pydantic `BaseModel` or SQLModel `Table`/`SQLModel`
- Define explicit field types (no `Any` or untyped dictionaries)
- Include docstrings for all models and fields
- Define enums for bounded string sets
- Use constrained types for validated inputs (e.g., `constr`, `conint`)

### 3.5 Contract-First Development

All APIs must be **contract-first**:

- OpenAPI/Swagger specifications must be maintained
- Request/response schemas must be versioned
- Breaking changes require explicit version bumps
- Schema evolution must follow semantic versioning rules

### 3.6 Dependency Management

- **Minimal dependencies per phase:** Add dependencies only when they provide essential functionality not available in existing dependencies
- **Audit requirement:** All dependencies must be audited for security vulnerabilities before addition
- **Pin versions:** All dependencies must be pinned to specific versions in `pyproject.toml` or `requirements.txt`
- **No transitive dependency reliance:** Do not rely on implicit transitive dependencies; declare explicit dependencies

---

## 4. Architectural Principles

### 4.1 Layer Separation (Strict)

The system must maintain **strict separation of layers**. Four layers are defined:

| Layer | Responsibility | Examples |
|-------|---------------|----------|
| **Interface** | User interaction, API boundaries, CLI | FastAPI routes, CLI commands, WebSocket handlers |
| **Domain** | Business logic, rules, entities | Use cases, services, domain events, entities |
| **Persistence** | Data storage, retrieval, ORM | Repositories, database adapters, migrations |
| **Integration** | External systems, messaging | HTTP clients, message publishers, auth services |

**Rule:** Business logic must **never** exist in interface layers. Interface layers delegate to domain layer; domain layer coordinates with persistence and integration layers.

### 4.2 Layer Dependency Direction

Dependencies flow inward:
```
Interface → Domain → Persistence
              ↓
        Integration
```

The domain layer depends on nothing outside itself. Persistence and integration are injected as interfaces (dependency inversion).

### 4.3 Architectural Evolution

Architecture must **evolve incrementally per phase**. This means:

- Phase I establishes core domain models with minimal external dependencies
- Phase II adds interface layer without modifying domain logic unnecessarily
- Phase III introduces agent capabilities as new integration points
- Phase IV refines deployment without changing application architecture
- Phase V adds event-driven patterns while maintaining backward compatibility

**No rewrites** unless explicitly specified in the project charter. Evolution, not revolution.

### 4.4 Code Organization

```
src/
  {{project_name}}/
    interface/
    domain/
    persistence/
    integration/
    main.py
tests/
  unit/
  integration/
  contracts/
```

### 4.5 Modularity

- Each feature must be a self-contained module
- Features must not couple to other features directly
- Cross-feature communication must go through domain events or explicit interfaces
- Shared utilities must be extracted to a `common` module with explicit APIs

---

## 5. AI and Agent Governance

### 5.1 Agent Hierarchy

All agents must obey `AGENTS.md` in the project root. This file takes precedence over individual agent preferences or default behaviors.

### 5.2 Agent Operating Principles

| Principle | Requirement |
|-----------|-------------|
| **No Assumptions** | Do not infer requirements; verify with humans |
| **No Inferred Requirements** | Document all requirements explicitly; ask when unclear |
| **No Freestyle Coding** | Follow specs and tasks exactly |
| **No Silent Changes** | All architectural changes must be documented and approved |
| **Traceability** | Every change must reference a Task ID |

### 5.3 Agent Handoff Protocol

When transitioning between agents or work sessions:

1. Current agent must document state in the task file
2. Outstanding questions must be explicitly listed
3. Next agent must read the full context before continuing
4. Agents must not contradict previous agent decisions without cause

### 5.4 Agent Capability Boundaries

Agents may:
- Read and modify code files as specified in tasks
- Run tests and verification commands
- Create documentation linked to specifications
- Refactor within the scope of a task

Agents may not:
- Modify this Constitution without explicit approval
- Change architectural patterns without an ADR
- Merge code without human review approval
- Modify CI/CD configuration without approval

### 5.5 Agent Audit Trail

All agent interactions must be logged:

- Command history captured in PHRs
- Decision rationales documented in ADRs
- Questions and clarifications preserved
- Final outputs verified against specifications

---

## 6. Quality and Maintainability Standards

### 6.1 Code Quality Principles

**Clarity over cleverness.** Code must be readable first. Optimizations are acceptable only when proven necessary and documented.

**Explicit naming.** Names must convey intent:
- Variables describe what they contain
- Functions describe what they do
- Classes describe what they represent
- Tests describe the behavior they verify

**Self-documenting code.** Prefer expressive code over comments. Use comments only to explain *why*, not *what*.

### 6.2 Deterministic Behavior

Prefer **deterministic behavior over heuristics**. Randomness, time-dependent logic, and non-deterministic ordering must be explicitly controlled and testable.

When non-determinism is unavoidable:
- Seed random number generators for testing
- Use fixed time sources in tests
- Mock external time services
- Document non-deterministic behavior

### 6.3 Testing Requirements

| Test Type | Coverage Target | Purpose |
|-----------|-----------------|---------|
| Unit | 80%+ | Verify individual component behavior |
| Integration | 60%+ | Verify component interactions |
| Contract | 100% | Verify API compliance |
| End-to-End | Critical paths | Verify user workflows |

All tests must be:
- Deterministic and repeatable
- Fast (unit tests < 100ms each)
- Isolated (no test order dependencies)
- Self-cleaning (no side effects between tests)

### 6.4 Documentation Standards

- **API docs:** Auto-generated from code (FastAPI automatic docs)
- **Architecture docs:** ADRs for all significant decisions
- **Feature docs:** Specs and plans for all features
- **Runbooks:** For operational procedures

Code comments are for *why*, not *what*. Documentation is for *how to use*, not *how it works*.

### 6.5 Review Requirements

- All code must be reviewed before merge
- Agent-generated code requires human review
- Reviews must verify spec compliance
- Reviews must check for violations of this Constitution

---

## 7. Forbidden Practices

The following practices are **strictly forbidden**:

### 7.1 Development Anti-Patterns

| Forbidden Practice | Reason |
|-------------------|--------|
| **Vibe coding** | Violates SDD principles; no traceability |
| **Hidden requirements** | Implied functionality not documented |
| **Silent architectural changes** | Breaks traceability and understanding |
| **Phase skipping** | Violates architectural evolution principles |
| **AI-driven improvisation** | Agents making unapproved decisions |

### 7.2 Code Anti-Patterns

| Forbidden Practice | Acceptable Alternative |
|-------------------|------------------------|
| `any` type hints | Explicit types or generics |
| `try`/`except` pass | Specific exception handling with logging |
| Mutable global state | Dependency injection |
| Implicit type conversions | Explicit conversions |
| Magic strings/numbers | Named constants or enums |
| God objects | Single Responsibility Principle |

### 7.3 Process Anti-Patterns

| Forbidden Practice | Required Practice |
|-------------------|-------------------|
| Committing without Task ID | Include Task ID in commit message |
| Merging without review | Require PR approval |
| Skipping tests | CI must pass all tests |
| Direct main branch commits | Feature branches only |
| Undocumented dependencies | Audit all dependencies |

---

## 8. Enforcement and Compliance

### 8.1 Constitution Guardians

The following are Constitution Guardians and may enforce compliance:

- Project lead
- Senior architects
- CI/CD pipeline (automated checks)
- Pull request reviewers

### 8.2 Compliance Checks

Automated checks must verify:

- [ ] Every commit references a Task ID
- [ ] Every PR links to a spec
- [ ] All tests pass
- [ ] Type checking passes
- [ ] Linting passes
- [ ] No forbidden patterns detected

### 8.3 Violation Consequences

| Violation Type | Consequence |
|----------------|-------------|
| Minor (first offense) | Warning, correction required |
| Moderate | PR blocked, correction required |
| Severe | Task suspended, human review required |
| Repeated | Agent access suspended pending review |

### 8.4 Constitution Amendments

Amendments to this Constitution require:

1. A formal proposal document
2. Review by at least two Constitution Guardians
3. Approval by project lead
4. Update to version and effective date

Emergency amendments may be made with immediate effect but must be ratified within 7 days.

---

## 9. Appendix: Phase-Specific Supplements

### 9.1 Phase I (CLI) Constraints

- Standard library only for core features
- In-memory persistence (no database)
- No HTTP or network dependencies
- Single-file or minimal file structure

### 9.2 Phase II (Web) Constraints

- FastAPI mandatory
- SQLite or PostgreSQL (SQLModel)
- OpenAPI documentation required
- Stateless design (session-less where possible)

### 9.3 Phase III (AI Agents) Constraints

- Agent framework TBD (per spec)
- Prompt management required
- Human-in-the-loop patterns where appropriate
- Agent audit logging required

### 9.4 Phase IV (Kubernetes) Constraints

- Docker containerization
- Kubernetes manifests version controlled
- Health checks for all services
- Resource limits defined

### 9.5 Phase V (Cloud-Native) Constraints

- Event-driven patterns (message queues)
- Cloud provider TBD (per spec)
- Horizontal scaling design
- Resilience patterns (circuit breakers, retries)

---

## 10. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-01 | SpecKit Generator | Initial constitution |

---

**End of Constitution**

*This document is the supreme law of the project. All other documents, agents, and humans must comply with its provisions.*

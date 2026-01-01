# AGENTS.md

## Purpose

This repository implements a **5-Phase, Spec-Driven, AI-Native System**
for the "Evolution of Todo" Hackathon.

All AI agents (Claude, Copilot, Gemini, Cursor, local LLMs)
MUST follow **Spec-Driven Development (SDD)** strictly.

The enforced lifecycle is:

**Specify → Plan → Tasks → Implement**

No phase, feature, or code is allowed to bypass this order.

---

## Global Non-Negotiable Rules

1. **No Task ID = No Code**
2. **No architecture change without updating `speckit.plan`**
3. **No new feature without updating `speckit.specify`**
4. **No assumptions or inferred requirements**
5. **Every code change must trace back to a Task and Spec**
6. **Agents must stop and ask for clarification if specs are missing**

Violation of these rules is considered an invalid contribution.

---

## Source of Truth Hierarchy

In case of conflict, the following priority applies:

1. `speckit.constitution` (WHY — principles & constraints)
2. `speckit.specify` (WHAT — requirements)
3. `speckit.plan` (HOW — architecture)
4. `speckit.tasks` (WORK — atomic tasks)
5. Code (IMPLEMENTATION)

---

## Spec-Kit Responsibilities

### Constitution (WHY)
Defines:
- Allowed technologies
- Architectural principles
- Security & performance constraints
- Cross-phase invariants

Constitution rules persist across all 5 phases.

---

### Specify (WHAT)
Defines:
- User journeys
- Functional & non-functional requirements
- Acceptance criteria

Agents MUST NOT invent requirements.

---

### Plan (HOW)
Defines:
- System architecture
- Components & boundaries
- Interfaces & contracts

Architecture must evolve **incrementally per phase**.

---

### Tasks (WORK)
Defines:
- Atomic, testable units of work
- Preconditions & outputs
- Files to modify
- Spec & Plan references

Agents implement **only approved tasks**.

---

## Implementation Rules

When writing code, agents must annotate changes with:

[From]: speckit.specify §X, speckit.plan §Y

Agents must not:
- Add extra features
- Refactor outside task scope
- Optimize prematurely
- Change phase boundaries

---

## Multi-Phase Discipline

Each phase:
- Builds on previous phases
- May extend specs and plans
- Must NOT break earlier guarantees

Agents must respect **phase boundaries**.

---

## Phase Overrides

Phase-specific instructions may exist in:

/phase-X/AGENTS.md

If present:
- Phase AGENTS.md overrides behavior **only for that phase**
- Global rules still apply unless explicitly extended

---
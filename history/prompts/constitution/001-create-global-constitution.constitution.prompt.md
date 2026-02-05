---
id: "001"
title: "Create global constitution for Evolution of Todo"
stage: "constitution"
date: "2025-12-30"
surface: "agent"
model: "claude-sonnet-4-5-20250929"
feature: "none"
branch: "master"
user: "human"
command: "/sp.constitution"
labels: ["constitution","governance","project-rules"]
links:
  spec: "null"
  ticket: "null"
  adr: "null"
  pr: "null"
files:
  - ".specify/memory/constitution.md"
tests: []
---

## Prompt

Project Name:
Evolution of Todo – 5 Phase Spec-Driven, AI-Native Hackathon Project

Project Context:
This project is part of the "Evolution of Todo" hackathon.
The system evolves incrementally across five phases:
Phase I (CLI), Phase II (Web), Phase III (AI Agents),
Phase IV (Kubernetes), and Phase V (Cloud-Native, Event-Driven).

The primary goal is to demonstrate professional, spec-driven
engineering with disciplined AI agent usage — not feature velocity.

Purpose of the Constitution:
Define global, immutable engineering principles, constraints,
and standards that apply to the ENTIRE project across all phases.

This constitution must act as the highest authority for:
- Humans
- AI agents (Claude, Copilot, Gemini, Cursor)
- Tools and IDEs
- Future contributors

Non-Negotiable Principles:
- Spec-Driven Development (SDD) is mandatory.
- The lifecycle Specify → Plan → Tasks → Implement must always be followed.
- No code may exist without a linked Task ID and Spec reference.
- AI agents are executors, not decision-makers.
- Agents must stop and ask for clarification if specs are incomplete.
- Phase boundaries must be respected; no future-phase features early.

Technology & Stack Constraints (Global):
- Language: Python 3.11+
- Async-first mindset where applicable
- FastAPI is mandatory from Phase II onward
- Pydantic / SQLModel for all data modeling
- Explicit schemas and contracts only

Architectural Principles:
- Strict separation of layers:
  Interface, Domain, Persistence, Integration
- Business logic must never exist in interface layers
- Architecture must evolve incrementally per phase
- No rewrites unless explicitly specified

AI & Agent Governance:
- All agents must obey AGENTS.md
- No assumptions, no inferred requirements
- No freestyle coding or architecture
- Traceability is mandatory for every change

Quality & Maintainability:
- Clarity over cleverness
- Explicit naming and structure
- Deterministic behavior preferred over heuristics
- Minimal dependencies per phase

Forbidden Practices:
- Vibe coding
- Hidden or implicit requirements
- Silent architectural changes
- Phase skipping
- AI-driven improvisation

Output Requirements:
Generate a single, global speckit.constitution document
that will govern all five phases of the project.

## Response snapshot

Created comprehensive constitution document at `.specify/memory/constitution.md` with 10 sections covering:
- Project identity and context (5 phases overview)
- 6 non-negotiable principles (SDD mandate, lifecycle, traceability, agent limits, spec completeness, phase boundaries)
- Technology constraints (Python 3.11+, async-first, FastAPI/Pydantic/SQLModel mandates)
- 5 architectural principles (layer separation, dependency direction, evolution, organization, modularity)
- 5 AI governance rules (hierarchy, operating principles, handoff protocol, capability boundaries, audit trail)
- Quality standards (clarity, deterministic behavior, testing, documentation, reviews)
- Forbidden practices (development, code, process anti-patterns)
- Enforcement and compliance framework
- Phase-specific supplements for all 5 phases

## Outcome

- ✅ Impact: Established supreme governing document for all project phases
- 🧪 Tests: N/A (constitution document)
- 📁 Files: 1 created (.specify/memory/constitution.md)
- 🔁 Next prompts: Start Phase I specification
- 🧠 Reflection: Constitution provides authoritative reference for all agents; ensures consistent behavior across all project phases

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment: N/A

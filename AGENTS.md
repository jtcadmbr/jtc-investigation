AI Development Guidelines

Purpose

This file defines the permanent development rules for every AI agent that works on this repository.

These instructions have higher priority than convenience.

Never ignore these instructions unless the user explicitly asks.

---

Core Philosophy

Think first.

Code second.

Never rush implementation.

The goal is not to produce code quickly.

The goal is to produce maintainable, scalable, secure and understandable software.

Every decision should minimize future technical debt.

---

Mandatory Workflow

Before writing any code:

1. Read the surrounding files.
2. Understand the architecture.
3. Understand the existing conventions.
4. Understand naming patterns.
5. Understand folder organization.
6. Identify dependencies.
7. Think about possible side effects.
8. Only then start implementation.

Never skip these steps.

---

Planning

Always create a mental implementation plan before coding.

The plan should include:

- objective
- affected files
- dependencies
- possible risks
- alternative approaches
- edge cases
- performance impact
- security considerations

Only after planning should implementation begin.

---

Never Guess

If something is unknown:

Read more files.

Search the repository.

Infer using existing patterns.

Never invent APIs.

Never invent functions.

Never invent database fields.

Never invent routes.

Never invent environment variables.

Never invent types.

Never invent components.

---

Respect Existing Architecture

Never rewrite architecture just because another solution looks better.

Respect:

- project structure
- code style
- naming conventions
- dependency injection
- folder hierarchy
- component organization
- patterns already in use

Consistency is more important than personal preference.

---

Code Quality

Always write code that is:

- readable
- maintainable
- reusable
- modular
- predictable
- strongly typed whenever possible

Avoid unnecessary complexity.

Prefer simple solutions.

Avoid clever code.

---

Clean Code

Functions should:

- do one thing
- be small
- have descriptive names
- avoid hidden side effects

Variables should have meaningful names.

Avoid abbreviations unless already used throughout the project.

---

Comments

Do not comment obvious code.

Only comment:

- business rules
- non-obvious decisions
- complex algorithms
- architectural decisions

Good code should explain itself.

---

Refactoring

If existing code is duplicated:

Prefer refactoring instead of duplicating.

If existing utilities already solve the problem:

Reuse them.

Never create duplicate helpers.

---

Error Handling

Never ignore errors.

Always:

- validate inputs
- handle exceptions
- provide meaningful error messages
- fail gracefully

Never leave empty catch blocks.

---

Logging

Logs should help debugging.

Do not spam logs.

Avoid unnecessary console.log.

Prefer structured logging if available.

---

Security

Always consider security.

Never expose:

- API keys
- secrets
- passwords
- tokens
- credentials

Validate all external inputs.

Never trust user input.

Escape outputs when necessary.

Avoid injection vulnerabilities.

---

Performance

Before implementing:

Think about:

- unnecessary renders
- duplicated API requests
- unnecessary database queries
- memory usage
- loops
- algorithm complexity

Avoid premature optimization.

But never write obviously inefficient code.

---

Frontend Rules

UI should be:

- responsive
- accessible
- consistent
- reusable

Prefer existing components.

Avoid duplicated styles.

Respect design system.

---

Backend Rules

Business logic belongs in services.

Controllers should remain thin.

Avoid massive files.

Keep responsibilities separated.

---

Database Rules

Never perform unnecessary queries.

Prefer indexes when appropriate.

Avoid N+1 problems.

Think about scalability.

Never remove data without explicit instruction.

Never generate destructive migrations automatically.

---

API Rules

Keep APIs:

- consistent
- predictable
- versionable

Validate requests.

Validate responses.

Handle failures correctly.

---

Git Rules

Never change unrelated files.

Never reformat the entire repository.

Never rename files unless necessary.

Keep commits logically grouped.

---

Dependencies

Before installing a dependency:

Ask:

Is it already available?

Can existing code solve this?

Does the project already use another library?

Avoid unnecessary packages.

---

Testing

Whenever implementing something:

Think about:

- happy path
- edge cases
- invalid inputs
- failure scenarios

Do not assume code works.

Reason about correctness.

---

Documentation

Whenever creating:

- new feature
- public API
- reusable component

Consider whether documentation should also be updated.

---

Before Finishing

Before considering the task complete:

Verify:

- formatting
- lint
- types
- imports
- unused variables
- unused functions
- duplicated code
- broken references

---

Communication

When presenting changes:

Explain:

- what changed
- why it changed
- possible impacts
- limitations
- future improvements

Do not simply output code.

---

Decision Making

When multiple solutions exist:

Choose the one that:

- is simplest
- matches existing architecture
- minimizes maintenance
- minimizes dependencies
- improves readability

---

Large Tasks

For large requests:

Break work into small logical steps.

Finish one step.

Validate mentally.

Then continue.

Never attempt huge rewrites at once.

---

Code Generation

Generated code must look handwritten.

Avoid repetitive AI patterns.

Follow repository style.

Blend naturally into the project.

---

Absolute Rules

Never:

- invent APIs
- invent endpoints
- invent database schema
- invent environment variables
- invent components
- invent hooks
- invent utility functions without checking first

Always search before creating.

---

Thinking Rule

For every request:

Think.

Read.

Analyze.

Plan.

Only then implement.

Never skip reasoning.

Quality is always more important than speed.

---

Final Goal

Act like a senior software engineer responsible for maintaining a production system.

Every modification should improve the project without introducing unnecessary complexity.

The repository must become progressively cleaner, more maintainable and easier to extend after every change.
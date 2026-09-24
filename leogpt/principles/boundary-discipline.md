# Principle: boundary discipline

**When**: wiring validation, error handling, or adapters to frameworks and external systems.

**Rule**: guard at the system's edges (HTTP, CLI, config, queues, external APIs, the database). Inside, trust the types and keep business logic pure.

## Do
- Parse and validate external input once, at the edge, into a trusted internal type.
- Convert external errors into domain errors at the adapter.
- Keep business rules in pure functions, free of framework or I/O calls, so they are easy to test.

## Don't
- Re-validate the same value in every internal layer.
- Scatter `try/catch` that swallows errors or logs and continues.
- Let framework objects (request, ORM document) leak into the domain logic.

## Check
- Where does untrusted data enter? Is it parsed exactly there, once?

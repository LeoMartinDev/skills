# Principle: follow local conventions

**When**: writing code in an existing area of the codebase.

**Rule**: imitate the closest similar code. Match its structure, naming, error handling, and test style. Introduce no new pattern or library where the repo already has one.

## Do
- Before writing, find the nearest sibling (same kind of module, handler, component, or test) and use it as the template.
- Reuse the repo's own helpers, error types, logger, and test fixtures.
- Follow the repo's agent docs and lint config over your own habits.
- When local conventions conflict, follow the one in the directory you are editing.

## Don't
- Bring a pattern from elsewhere (a new state library, another error style, a different test runner) into one corner of the repo.
- Restyle existing code to match your preference.
- Mix two conventions in the same file.
- Change a lint rule, a config, or add a disable comment so your code passes. Rename or reshape the code instead.

## Check
- Would a reviewer who knows this repo guess the code was written by an agent?
- Can you name the existing file this code was modeled on?

# Principle: foundational thinking

**When**: before writing logic. Choosing the core types and data structures, ordering scaffold work against feature work, or deciding what concurrent actors share.

**Rule**: get the data structures right first. Good structures make the code that follows obvious; bad ones make every line fight them.

## Do
- Name the core data shape before any function: what it holds, who owns it, how it changes.
- Pick the collection that matches the access pattern (lookup by key, ordered, unique).
- Land the scaffold (types, signatures, empty bodies) before filling in behavior.
- List what is shared between actors (requests, jobs, users) and who writes it.

## Don't
- Start from control flow and bolt data on later.
- Pass loosely shaped objects around and "figure out the shape" in each consumer.

## Check
- Can you describe the feature in terms of how its data changes?
- If the data shape were perfect, would most of the logic become trivial?

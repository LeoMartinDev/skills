# Principle: minimize reader load

**When**: shaping or reviewing code that is hard to follow.

**Rule**: count what a reader must hold in their head to answer "what does this do?", and shrink it.

## Do
- Count the hops between a question and its answer (files, functions, indirections). Remove the hops that add nothing.
- Collapse wrappers that have a single caller and add no meaning.
- Keep mutable state in the smallest scope, for the shortest time.
- Name things for what they mean in the domain, not for how they are implemented.

## Don't
- Split code into many tiny files and functions "for cleanliness" when it scatters one idea.
- Hide control flow in callbacks, events, or magic registration when a direct call works.
- Write comments that restate the code or narrate the change.

## Check
- Can a newcomer trace the main path without opening more than 2 or 3 files?

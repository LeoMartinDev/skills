# Principle: comment the why

**When**: about to write a comment, and before committing.

**Rule**: no comment by default. Keep one only when it says what the code cannot: why, not what.

## Do
- Keep a comment for a non-obvious choice, a constraint or invariant, a workaround (with its issue link), or a domain rule.
- Write doc comments on a public API only where the repo already does.
- Match the comment density of the neighboring files.

## Don't
- Paraphrase the code, or repeat the types in a doc comment.
- Narrate the change ("added", "now uses", "fixed").
- Reference the run or the plan ("PR3", "per the sketch", the ticket number).
- Add section banners, or a TODO nobody will pick up.

## Check
- Delete the comment: does the reader lose something the names, types, and tests do not say? If not, leave it deleted.

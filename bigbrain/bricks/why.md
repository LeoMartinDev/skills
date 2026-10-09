# Brick: why

**History and present necessity are separate questions.** Explain why a limit, workaround, retry, compatibility path, or protection exists, and whether its reason still holds. This is a bounded investigation, never an implementation.

## When to run

- **Explicit why request:** answer it, show the evidence and gaps, and stop. No fix unless asked.
- **During grounding or design:** only when an unclear reason could change safety, scope, or a design choice, typically before removing a workaround or a defense. Odd naming alone doesn't qualify.

Name the question and the decision it affects. Reuse valid grounding instead of redoing `bricks/how.md`.

## 1. Investigate

One narrow question gets one `explorer (report)`; only independent wider questions get several, launched in parallel. The brief points to `references/prompts/investigator.md` and gives the symbols and paths, callers and tests, the current revision and relevant uncommitted changes, any known flag state, the decision at stake, the pointers already collected, and the principles `guard-the-context-window` and `prove-it-works`.

## 2. Synthesize and present

Label each important claim:

- **Source fact:** what a named source says or a current check shows.
- **Inference:** a conclusion from converging evidence, with its confidence and the alternatives.
- **Unknown:** an unverified explanation or missing fact, and what would settle it.

When sources contradict, show both with dates and scope. Neither the newest source nor the most plausible story wins by default. Never invent a rationale.

Present:

- **Historical rationale:** the stated, inferred, or unknown reason, with confidence and links (`path:line`, commit, real URL).
- **Present necessity:** confirmed, obsolete, or unknown, with the check that shows it. Obsolete needs evidence that the condition is gone.
- **Coverage and gaps:** sources queried, sources unreachable, and missing evidence that could change the answer.
- **In a change workflow:** Preserve, Change, Avoid, and Risk constraints with proof pointers, carried into the mental model, brief, or design.

A missing reason never authorizes removal, and an obsolete motive alone never authorizes a behavior or scope change. A factual gap needs no user confirmation: report it and finish.

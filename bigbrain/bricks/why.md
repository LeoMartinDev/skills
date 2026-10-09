# Brick: why

Explain why a concrete limit, workaround, retry, compatibility path, or protection exists, and whether its reason still applies. Historical rationale and present necessity are separate questions. This is a bounded investigation, not a new implementation workflow.

## When to run

- **Explicit why request**: answer the named question, present the evidence and gaps, then stop. No fix, branch, or PR unless separately requested.
- **During grounding or design, including targeted reopening after new implementation/repair facts**: the lead runs this brick only when unclear rationale could materially change safety, scope, or a design choice, especially before removing a workaround or defense. Odd naming or an incidental detail alone is insufficient.
- State the concrete question and the decision it affects. Reuse still-valid grounding; do not repeat `bricks/how.md`'s source sweep.

## 1. Brief an explorer

Role `explorer (report)`. One narrow question takes one explorer; only wider independent questions warrant parallel explorers, which the lead synthesizes.

Give the explorer the affected symbols and paths, relevant callers and tests, the current revision, relevant uncommitted changes, flag or usage state if known, the decision in question, and source pointers already collected, plus the principle files `guard-the-context-window` and `prove-it-works`. It reads sources only, writes only its report in the scratch directory, and returns a digest of at most 30 lines with the evidence below and consequential gaps.

## 2. Trace the reason

Make one bounded, targeted pass. Follow the strongest references; stop once the decision is supported or the remaining gap is explicit.

1. **Anchor current behavior.** Inspect the actual symbol, wiring, relevant version, flag or rollout, callers, stored data shape, and tests needed for this question. Record the current state and `path:line` proof. Code establishes behavior, never its authors' intent.
2. **Start with Git and GitHub.** Use targeted `git blame` and `git log --follow -- <path>`; inspect the relevant introducing or changing commits and diffs. Follow the associated PR through available `gh` or connector access, including its body and relevant reviews. Commit subjects alone are leads, not established rationale; inspect the evidence and distinguish an author's stated intent from inferred motivation.
3. **Extend only where relevant.** Follow directly linked or targeted related tickets, parent context, design docs, chats, or observability available through existing tools when they can settle the question. Do not sweep all categories, globally search transcripts, search unrelated private projects, install tools, or contact authors or teams. Do not ask the user to fetch facts observable through available tools.
4. **Check present necessity.** Verify the original condition against current dependencies/versions, flag/use state, callers, stored data, contracts, or scoped read-only runtime evidence, whichever bears on it. A historical reason alone never establishes a current requirement. Missing source access or tools is a concrete evidence gap, not proof that a constraint disappeared.

Keep compact source excerpts and proof pointers in the report, not code or log dumps. Reuse collected evidence only while its scope and relevant state remain valid; refresh changed assumptions.

## 3. Synthesize and present

The lead reconciles reports and labels each important claim:

- **Source fact**: what a named source actually says or a current check demonstrates, with its limits.
- **Inference**: the conclusion from converging evidence and its confidence, naming the supporting sources and plausible alternatives.
- **Hypothesis / unknown**: an unverified explanation or consequential missing fact, and what evidence would settle it.

Surface contradictory sources with their dates, scope, and relation to the current state. Neither the newest source nor a plausible story wins automatically. Never fabricate rationale or turn historical inference into fact.

Present a concise answer containing:

- **Historical rationale**: the stated reason, or explicitly inferred/unknown reason, with confidence and `path:line`, commit, or real source URL links.
- **Present necessity**: **confirmed**, **obsolete**, or **unknown**, with the relevant current check, its proof pointer, and any limitation. Obsolete requires evidence that the condition no longer applies; unavailable checks leave it unknown.
- **Coverage and gaps**: sources queried, relevant sources unavailable, contradictions, and missing evidence that could change the conclusion.
- **For a change workflow**: **Preserve / Change / Avoid / Risk** constraints useful for the decision, each with proof pointers or explicit uncertainty. Pass them into the mental model, transformation brief, or design package and later verification/review.

Absence of rationale never authorizes removal, and an obsolete motive alone never authorizes a behavior or scope change. A factual gap needs no user confirmation: finish the analysis with the gap explicit.

# Brick: why

Explain why a concrete limit, workaround, retry, compatibility path, or protection exists, and whether its reason still applies. Historical rationale and present necessity are separate questions. This is a bounded investigation, not a new implementation workflow.

## When to run

- **Explicit why request**: answer the named question, present the evidence and gaps, then stop. No fix, branch, or PR unless separately requested.
- **During grounding or design, including targeted reopening after new implementation/repair facts**: the lead runs this brick only when unclear rationale could materially change safety, scope, or a design choice, especially before removing a workaround or defense. Odd naming or an incidental detail alone is insufficient.
- State the concrete question and the decision it affects. Reuse still-valid grounding; do not repeat `bricks/how.md`'s source sweep.

## 1. Brief an explorer

Use `references/subagent-brief.md`, role `explorer (report)`, and the selected harness's actual capabilities. One narrow question takes one explorer. Only wider, unresolved independent questions warrant parallel explorers within capability limits; the lead synthesizes them. No new role or model tier.

Give the explorer the affected symbols and paths, relevant callers/tests, repo identity and current revision or version, relevant uncommitted changes, flag/use state if known, the decision in question, and already collected source pointers. Read `principles/guard-the-context-window.md` and `principles/prove-it-works.md` in full and pass their paths. Assign one report path in the lead's unique scratch directory outside the repo per `references/run-state.md#working-artifacts`. Source access is read-only; only that report may be written. Return a digest of at most 30 lines, with the evidence below and consequential gaps.

## 2. Trace the reason

Make one bounded, targeted pass. Follow the strongest references; stop once the decision is supported or the remaining gap is explicit.

1. **Anchor current behavior.** Inspect the actual symbol, wiring, relevant version, flag or rollout, callers, stored data shape, and tests needed for this question. Record the current state and `path:line` proof. Code establishes behavior, never its authors' intent.
2. **Start with Git and GitHub.** Use targeted `git blame` and `git log --follow -- <path>`; inspect the relevant introducing or changing commits and diffs. Follow the associated PR through available `gh` or connector access, including its body and relevant reviews. Commit subjects alone are leads, not established rationale; inspect the evidence and distinguish an author's stated intent from inferred motivation.
3. **Extend only where relevant.** Follow directly linked or targeted related tickets, parent context, design docs, chats, or observability available through existing tools when they can settle the question. Do not sweep all categories, globally search transcripts, search unrelated private projects, install tools, or contact authors or teams. Do not ask the user to fetch facts observable through available tools.
4. **Check present necessity.** Verify the original condition against current dependencies/versions, flag/use state, callers, stored data, contracts, or scoped read-only runtime evidence, whichever bears on it. A historical reason alone never establishes a current requirement. Missing source access or tools is a concrete evidence gap, not proof that a constraint disappeared.

Keep compact source excerpts and proof pointers in the report, not code or log dumps. Reuse collected evidence only while its scope and relevant state remain valid; refresh changed assumptions. Collection alone never justifies a project-memory write; apply `references/memory.md`'s existing learning gate.

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

Absence of rationale never authorizes removal. An obsolete historical motive does not authorize a behavior or scope change: keep the existing maintenance scope rules and product gates. A factual gap does not require user confirmation; finish the read-only analysis with that gap explicit, preserving required contracts. Only a real product or scope preference invokes the existing grill gate.

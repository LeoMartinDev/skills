# Principle: plain prose

**When**: writing text a person will read: a PR title or body, an issue, a commit message, a ticket comment, a plan, a guided review, or the final reply.

**Rule**: write the way a colleague explains the work out loud. Every sentence gives the reader a fact, a decision, or an instruction.

## Do
- Open on the problem and what changes, seen from the user or the product: screens, features, users, no file or function names. Take the problem from the ticket, the description, or the commits. When none states one, say so rather than invent one.
- When the change alters what a user sees or reads (a message, a label, a screen), quote it before and after, as is, in a `>` quote.
- Write full sentences, each with a subject and a verb, linked by ordinary words ("jusqu'ici", "donc", "mais"). Short does not mean telegraphic.
- Name the mechanism, the command, or the number. "A renamed column fails the build" beats "types that follow your schema".
- State a decision as "X rather than Y because Z".
- Use three code names per paragraph at most. Say the rest in words ("the function that rebuilds the sentence"), and write a name whole, never cut short with "…". Define a new name where the reader first meets it.
- Keep one idea per sentence, one term for each thing, the plain word, and the active voice.
- Anchor every fact: cite `path:line`, name the test behind "covered by", word an inference as one ("probably"), and what you could not check in the first person ("I found no caller that…").
- Write in the reader's language, and follow the repo's tone when it has one.

## Don't
- Write notes ("Before, one button. Now, two cards."), fragments as bullets, or clauses stacked with semicolons.
- Open or close with chatbot phrases ("Great question", "I hope this helps", "Let me know if"), flatter the user, or agree before checking.
- Pad with filler ("it is important to note that", "in order to") or stacked hedges ("could potentially").
- Attribute a claim vaguely ("best practice says"), or end on a generic conclusion. Name the source or cut the sentence.
- Reassure or grade the work ("simply", "correctly", "safely", "trivial", "robust"). Show the evidence and let the reader judge.
- Decorate: no alert blocks, no decorative emoji, no bold beyond one key phrase, outside a format a brick defines.
- Restate the diff line by line, or narrate the run ("first I explored, then...").

## Check
- Could this sentence appear unchanged in another project's PR? Then it says nothing about this one. Cut it.
- Delete the sentence: does the reader lose a fact, a decision, or an instruction? If not, leave it deleted.

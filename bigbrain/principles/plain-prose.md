# Principle: plain prose

**When**: writing text a person will read: a PR title or body, a commit message, a ticket comment, a plan, or the final reply.

**Rule**: write what a teammate would say out loud. Every sentence gives the reader a fact, a decision, or an instruction.

## Do
- Lead with the outcome, then the evidence.
- Name the mechanism, the command, or the number. "A renamed column fails the build" beats "types that follow your schema".
- Write whole sentences, with their articles and verbs. Spell out arrows, symbols, and abbreviations the reader would have to decode.
- Keep one idea per sentence. Split a sentence the reader has to parse twice.
- Pick one term for each thing and keep it.
- Prefer the plain word and the active voice: name who does what.
- Write in the reader's language, and follow the repo's tone when it has one.

## Don't
- Open or close with chatbot phrases ("Great question", "I hope this helps", "Let me know if").
- Flatter the user, or agree before checking.
- Pad with filler ("it is important to note that", "in order to") or stacked hedges ("could potentially").
- Attribute a claim vaguely ("best practice says", "experts recommend"), or end on a generic conclusion. Name the source or cut the sentence.
- Force ideas into groups of three, or dress up "is" and "has" ("serves as", "boasts").
- Add decorative emojis or bold every other phrase, outside a format a brick defines.
- Restate the diff line by line, or narrate the run ("first I explored, then...").

## Check
- Could this sentence appear unchanged in another project's PR? Then it says nothing about this one. Cut it.
- Delete the sentence: does the reader lose a fact, a decision, or an instruction? If not, leave it deleted.

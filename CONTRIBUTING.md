# Contributing

## Develop locally

Clone the repository and link the skill so edits apply immediately:

```bash
git clone git@github.com:LeoMartinDev/skills.git
cd skills
mkdir -p ~/.agents/skills ~/.claude/skills
ln -s "$PWD/bigbrain" ~/.agents/skills/bigbrain
ln -s ~/.agents/skills/bigbrain ~/.claude/skills/bigbrain
```

## Layout

bigbrain is split into small files that the agent loads as needed:

- [SKILL.md](bigbrain/SKILL.md): entry point, routing, and lead rules.
- [Use cases](bigbrain/usecases/): feature, bugfix, refactoring, plan, guided review, resume, and setup workflows.
- [Bricks](bigbrain/bricks/): reusable steps such as exploration, implementation, review, and shipping.
- [Principles](bigbrain/principles/): engineering rules applied when relevant.
- [References](bigbrain/references/): settings, memory, subagent prompts, and agent adapters.
- [Scripts](bigbrain/scripts/): the read-only PR watch helper, the guided review builder and server, and their tests.
- [Viewer](bigbrain/viewer/): the guided review page.

## Rules

- Keep each skill file within 1,000 words.
- Add a rule only for a failure you have actually observed and that it prevents.

## Checks

Run these after editing:

```bash
bash scripts/check-skill.sh
```

```bash
bash bigbrain/scripts/tests/run.sh
```

```bash
bash bigbrain/scripts/tests/guided-review.sh
```

They check the word budget and referenced paths, the PR watch helper, and the guided review (collect, build, and review server).

The guided review embeds a prebuilt CodeMirror bundle, `bigbrain/viewer/vendor/codemirror.js`. After changing a version in its `package.json`, rebuild it:

```bash
bash bigbrain/viewer/vendor/build.sh
```

To check behavior, run a clear feature request and a vague one in a sandbox repository. The first should proceed; the second should ask for the missing decisions.

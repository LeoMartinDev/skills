# tour.json

The tour is the only file you write; `build` checks it against what `collect` produced.

## Shape

```json
{
  "lang": "fr",
  "summary": "**Chaque facture reçoit désormais une date d'échéance fixée à sa création.**\n\nJusqu'ici, l'échéance était recalculée à chaque affichage. Elle est maintenant calculée une fois, puis enregistrée avec la facture.\n\n- La date est calculée à partir des conditions de paiement du client.\n- La numérotation lit ce champ au lieu de refaire le calcul.\n\nLes tests de `invoice.ts` couvrent le calcul, mais aucune migration ne remplit les factures existantes.",
  "flow": [
    { "label": "La création d'une facture (`createInvoice`)", "step": "due" },
    { "label": "Le calcul de l'échéance (`computeDueDate`)", "step": "due" },
    { "label": "La numérotation, qui lit le champ", "step": "numbering" }
  ],
  "steps": [
    {
      "id": "due",
      "title": "La facture calcule son échéance à la création",
      "risk": "medium",
      "body": "Quand une facture est créée, elle calcule son échéance à partir des conditions de paiement du client, puis la stocke. On la calcule une seule fois plutôt qu'à chaque affichage, parce que les conditions du client peuvent changer après coup.",
      "checks": ["Quel test couvre un client sans conditions de paiement ?"],
      "show": [
        {
          "file": "src/invoice.ts", "hunks": [0], "note": "La création de la facture, juste avant l'enregistrement.",
          "highlights": [
            { "lines": "42-45", "text": "Sans conditions de paiement, l'échéance tombe à 30 jours, la valeur que l'ancien calcul utilisait [[src/terms.ts:8]]." }
          ]
        }
      ]
    },
    {
      "id": "numbering",
      "title": "La numérotation lit l'échéance enregistrée",
      "risk": "low",
      "link": "L'étape 1 a montré où l'échéance est calculée ; voici le seul code qui la relit.",
      "body": "La numérotation trie les factures par échéance. Elle lit maintenant le champ stocké au lieu de refaire le calcul.",
      "show": [{ "file": "src/numbering.ts", "lines": "40-72", "note": "Non modifié : l'appelant qui lit le nouveau champ." }]
    }
  ],
  "skipped": [
    { "file": "package-lock.json", "reason": "Regénéré par npm install." },
    { "file": "src/invoice.ts", "hunks": [3], "reason": "Imports réordonnés." }
  ]
}
```

| Field | Rule |
|---|---|
| `lang` | Language code of the text (`fr`, `en`); sets the interface language. |
| `summary` | Required. What the PR does, in 10 non-empty lines at most (an error past that), about 130 words at most, shaped per `references/tour-writing.md`. |
| `flow` | The 3 to 7 places the change runs through, in execution order, each `{ "label", "step" }`; leave `step` out for a place shown only for context. Shown on the intro as a map and on each step as a "you are here" line. |
| `steps[].id` | Short slug, unique. Used by `flow`, `[[step:id]]`. Defaults to `step-N`. |
| `steps[].title` | Required. What happens, not a file name ("Changes to X"). |
| `steps[].risk` | Required: `high`, `medium`, or `low`. Shown as a muted reading hint. |
| `steps[].link` | One sentence on how this step follows from the previous one, shown above the body. Expected on every step but the first. |
| `steps[].body` | Required. Role, mechanism, decision: 2 to 4 sentences, under about 90 words. |
| `steps[].checks` | 1 or 2 plain sentences, usually questions (an error past 2). Only a `low` step may have none. Collected again on the wrap-up page. |
| `steps[].show` | Code panels on the right, top to bottom; at most 3. |
| `skipped` | Files, or some of their hunks, left out of the steps, each with a reason. |

Fields of an earlier format (`context`, `scenario`, `evidence`, `glossary`, `order`, a step's `claim`, `depends`, `tag`) are rejected with a hint.

## Checks run by `build`

`build` turns each rule of the table above into an error or a warning, and also checks that every hunk of every changed file is shown in a step or listed in `skipped`, that badges, `flow` steps and line ranges point somewhere, and flags reassuring words such as "simply" or "correctly" outside `checks`.

## Code panels (`show`)

- `file`: a changed path from `overview.md`, or any file present at the PR head (shown read-only).
- `hunks`: hunk numbers from `overview.md`, for a changed file. Shows only those hunks.
- `lines`: `"12"` or `"12-30"`, new-side lines (old-side for a deleted file). Shows that range with a few lines around it, or the hunks touching it.
- Neither `hunks` nor `lines`: the whole diff, or the whole file for an unchanged one.
- `view`: `"diff"` or `"file"`, the initial view.
- `note`: one Markdown sentence above the code, saying what this file is in the flow. Expected on every panel.
- `highlights`: up to 3 `{ "lines": "12-14", "text": "…" }`, same sides as `lines`. The lines get a thin bar and a numbered pin that opens the text, one or two sentences, in a bubble. Keep them inside what the panel shows.

Every hunk of every changed file must appear in some step's `show` or in `skipped`. A panel with `lines` covers the hunks touching that range.

## Badges

Inside any Markdown text (`summary`, `flow` labels, `link`, `body`, `checks`, `note`, highlights):

| Syntax | Effect |
|---|---|
| `[[src/a.ts]]` | Opens the file in a preview: its diff if changed, its content otherwise. |
| `[[src/a.ts:12]]`, `[[src/a.ts:12-30]]` | Same, scrolled to and highlighting those lines. |
| `[[step:schema]]` | Link to another step. |

`|label` replaces the text: `[[src/a.ts:12-30|the retry loop]]`.

Use badges for code worth a look that does not deserve its own panel: a caller, the previous implementation, a related test.

## Markdown

Paragraphs, `**bold**`, `*italic*`, `` `code` ``, `[links](https://…)`, lists, `>` quotes, and fenced code blocks. No HTML, no headings in a step body, no alert blocks.

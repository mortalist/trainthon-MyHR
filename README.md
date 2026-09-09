# Hackathon agent setup

Empty project with coding-agent rules and skills installed **before** the app exists.

Installed:

- **Karpathy guidelines** — always-on Cursor rule + skill, from [forrestchang/andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills) (`2c60614`)
- **Ponytail** — always-on Cursor rule + six skills, from [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) (`356918e`)

## What is always on

Cursor project rules (`alwaysApply: true`):

| File | Role |
| --- | --- |
| `.cursor/rules/karpathy-guidelines.mdc` | Think before coding, simplicity first, surgical diffs, verifiable goals |
| `.cursor/rules/ponytail.mdc` | Lazy-senior ladder: skip, reuse, stdlib, native, one line, then minimum |

## Skills

Same content is in `.cursor/skills/` (Cursor) and `.agents/skills/` (`npx skills`).

| Skill | When to use |
| --- | --- |
| `karpathy-guidelines` | Writing, reviewing, or refactoring without overcomplicating |
| `ponytail` | Force the shortest working solution (`lite` / `full` / `ultra`) |
| `ponytail-review` | Review the current diff for over-engineering |
| `ponytail-audit` | Audit the whole repo, not just the diff |
| `ponytail-debt` | Harvest deferred `ponytail:` shortcuts |
| `ponytail-gain` | Show measured impact numbers |
| `ponytail-help` | Command cheat sheet |

In Cursor, mention the skill name in chat (for example “run ponytail-review on this diff”).

## Update

From the repo root:

```bash
npx skills add forrestchang/andrej-karpathy-skills --skill karpathy-guidelines --agent cursor --copy -y
npx skills add https://github.com/DietrichGebert/ponytail/tree/main/skills --skill '*' --agent cursor --copy -y
cp -a .agents/skills/. .cursor/skills/
```

Then refresh the two `.cursor/rules/*.mdc` files from those upstream repos if the always-on rules changed.

## License

Upstream material is MIT. Ponytail’s license is in `vendor-licenses/ponytail.LICENSE`. Karpathy guidelines declare MIT in the skill frontmatter.

This repo does not contain an application yet. Add the hackathon product next.

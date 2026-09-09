# Agent setup (Cursor)

This repo uses always-on coding rules so the app stays small.

- Karpathy guidelines: `.cursor/rules/karpathy-guidelines.mdc` and `.cursor/skills/karpathy-guidelines/`
  ([forrestchang/andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills), same repo as [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills))
- Ponytail: `.cursor/rules/ponytail.mdc` and `.cursor/skills/ponytail*`
  ([DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail))

Lockfile: `skills-lock.json`. Ponytail license: `vendor-licenses/ponytail.LICENSE`.

Update:

```bash
npx skills add forrestchang/andrej-karpathy-skills --skill karpathy-guidelines --agent cursor --copy -y
npx skills add https://github.com/DietrichGebert/ponytail/tree/main/skills --skill '*' --agent cursor --copy -y
cp -a .agents/skills/. .cursor/skills/
```

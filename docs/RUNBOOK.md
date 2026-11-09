# Runbook

## Ports

The ChainGauge dev server runs on **5177**, because the maintainer's other local apps use
ports 5173 to 5176. Start it with:

```bash
cd web
npm run dev                       # Vite, http://localhost:5177
# or, for a fixed port when verifying:
node node_modules/vite/bin/vite.js --port 5177 --strictPort
```

## Gates (run before every commit)

```bash
cd web
node_modules/.bin/tsc -b --noEmit    # types
npm run lint                          # ESLint, 0 errors
npm test                              # Vitest, six files in src/lib: rating and model, router, export, evidence, submission, source of funds
npm run prose                         # plain-language check on user-visible strings
npm run source:check                  # each citation's publisher matches its URL host
npm run check:api                     # types for api/
npm run build                         # tsc -b && vite build
npm run design:check                  # Playwright audit of dist, so build first
```

`npm run gates` runs everything after the type check in that order. `npm run link:check` stays outside it, as `CLAUDE.md` explains.

## UI verification (the screenshot gotcha)

The Browser pane on this machine cannot screenshot, because it times out when the pane is not
compositing. Verify with a throwaway Playwright script that writes PNGs, and read them.
`web/scripts/design-check.mjs` already launches Chromium through Playwright against the built
`dist`, in both themes at desktop and mobile. These still work and are useful for copy, computed
styles and errors, but they do not catch layout:

- `read_page` (accessibility tree) and `get_page_text` for structure and content.
- `javascript_tool` DOM reads for computed styles, rosette wedge fills, and
  horizontal-overflow checks (`documentElement.scrollWidth > clientWidth`).
- `read_console_messages` for errors.

Check every route in `web/src/lib/router.ts` (overview, ratings, matrix, compare, method, contribute,
changelog, about and a chain detail), the rosette colours, and no horizontal **body** overflow at
mobile width (375px).

## Deploy

`vercel.json` at the repo root builds the `web/` subdir (framework: null,
`npm --prefix web` install/build with `--legacy-peer-deps`, output `web/dist`),
the standing pattern for these repos.

- **Vercel blocks builds whose commit author it does not recognise.** The repo's
  **local** git identity must be the linked GitHub account:
  `git config --local user.name "JinaJaundice"` and
  `user.email "53195433+JinaJaundice@users.noreply.github.com"`.
- Push to `main`; Vercel auto-deploys once the repo is connected. Verify the
  deployment reaches **READY** (Vercel MCP `list_deployments` / `get_deployment`).
- PowerShell cwd does not persist across turns → use `git -C <repo>`.

## Public copy

The working repository, `JinaJaundice/chaingauge-private`, is private. Its issues are the submission queue, and its
history carries the weekly refresh. The public repository, `JinaJaundice/chaingauge`, holds a copy of the files at
`HEAD`, and each refresh of it adds one commit. Vercel, the submission queue and the weekly routines use the working
repository only.

To refresh the public copy after a change on `main`:

1. Clone the public repository once, beside this one, with `git clone https://github.com/JinaJaundice/chaingauge ../chaingauge-public`, and set the local identity that the Deploy section gives.
2. From the root of this repository, run `node tools/public-export.mjs ../chaingauge-public`. The script writes the copy and checks it. It stops with an exit code of 1 if it finds a secret, an e-mail address, a user folder path or a pointer to the maintainer's own set-up.
3. After an exit code of 0, read `git -C ../chaingauge-public status` and the diff, commit there with a message that names the source commit, and push.

Never push the history of this repository to the public repository, and never add the public repository as a remote
here. The history carries the maintainer's e-mail address on the commits of the weekly refresh, and GitHub keeps the
refs of every pull request.

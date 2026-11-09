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

Never edit the public repository directly, because the next refresh overwrites it. Never push the history of this
repository to the public repository, and never add the public repository as a remote here. The history carries the
maintainer's e-mail address on the commits of the weekly refresh, and GitHub keeps the refs of every pull request.

### Automatic refresh

The workflow `.github/workflows/public-copy.yml` of this repository refreshes the public copy after each push to `main`.
Its job `refresh` writes the export of the newest commit on `main` into a clone of the public repository and pushes one
commit as `JinaJaundice` with the no-reply address when the copy changed. The message of that commit is "Refresh the
public copy from commit <short SHA>", and the job pushes nothing when the copy did not change. Neither the workflow nor
the designs reach the public copy, because the export leaves out `.github/workflows/` and `docs/designs/`.

The export check is a hard stop. A finding fails the run before the commit, and GitHub may then notify the account that
pushed, depending on the notification settings of that account. For each finding the export prints the file, the line
number and the rule without the text of the line, for the manual route and for the workflow alike. On each pull request
to `main` the job `check` runs the same export without a secret and lists the files that would change in the public
copy. The weekly merge review does not wait for that check.

### The key and the ruleset

The job `refresh` pushes with a deploy key. The deploy key "Public copy workflow of chaingauge-private" on
`JinaJaundice/chaingauge` holds the public half with write access, and the repository secret `PUBLIC_COPY_DEPLOY_KEY`
of this repository holds the private half. No other copy of the private half is kept.

The deploy key was added on 9 November 2026 with `gh repo deploy-key add`, which ties it to the sign-in token of the
GitHub CLI. GitHub removes the key if the GitHub CLI or that token loses its authorisation on the account. In that case
the next run fails at the clone until the steps below replace the key. To replace the key after a loss or any sign of
exposure:

1. Create a new key pair in a temporary folder outside this repository with `ssh-keygen -q -t ed25519 -N "" -C chaingauge-public-copy -f <folder>/key`.
2. Store the private half with `gh secret set PUBLIC_COPY_DEPLOY_KEY --repo JinaJaundice/chaingauge-private < <folder>/key`.
3. Add the public half in `<folder>/key.pub` as a deploy key named "Public copy workflow of chaingauge-private" with write access under Settings and then Deploy keys of `JinaJaundice/chaingauge`.
4. Test the new key with `ssh -i <folder>/key -o IdentitiesOnly=yes -T -l git github.com`, whose reply names `JinaJaundice/chaingauge`, and then delete the old deploy key under the same Settings page.
5. Delete both files with `shred -u <folder>/key <folder>/key.pub`, or with `rm -f` where `shred` is not available.
6. Re-run the latest run of the job `refresh` from the Actions tab of this repository.

The ruleset "Protect main" of the public repository blocks force pushes to its `main` and the deletion of that branch for
every actor, and a normal push remains possible. A revert removes a published line from the public copy but leaves it
in the public history. To remove it from the history as well, Sooraj disables the ruleset in the settings of the public
repository, rewrites the history and then enables the ruleset again.

### After a failure

Read the log of the failed run in the Actions tab of this repository. For a finding, Sooraj or a coding session fixes the
line in this repository and pushes the fix, and that push starts a new run. An outside cause is one that lies outside the
files, such as a GitHub outage, a missing deploy key or a refused push. After repairing it, re-run the failed run from the
Actions tab or with `gh run rerun <run id> --repo JinaJaundice/chaingauge-private`. Because each run exports the newest
commit on `main`, a re-run never puts older files back into the public copy. The command
`gh workflow disable public-copy.yml --repo JinaJaundice/chaingauge-private` stops the refresh.

### Manual fallback

When the workflow cannot run, refresh the public copy by hand:

1. Clone the public repository once, beside this one, with `git clone https://github.com/JinaJaundice/chaingauge ../chaingauge-public`, and set the local identity that the Deploy section gives. Run `git -C ../chaingauge-public pull` instead if the clone already exists.
2. Run `node tools/public-export.mjs ../chaingauge-public` from the root of this repository. The script writes the copy and checks it. It stops with an exit code of 1 if it finds a secret, an e-mail address, a user folder path or a pointer to the maintainer's own set-up.
3. After an exit code of 0, read `git -C ../chaingauge-public status` and the diff, commit there with a message that names the source commit, and push.

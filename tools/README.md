# tools

## Overview

This directory holds three command line scripts for the maintainer of ChainGauge. One turns open public submissions into prompts for a coding session, one regenerates the inlined chain icons, and one writes the public copy of the repository. None of them runs as part of the site build.

## Interface

- `inbox.mjs` lists open issues labelled `submission` in the feedback repository. `node tools/inbox.mjs` lists them, `--write` writes each to `inbox/<n>.md` and `--id <n>` limits the run to one issue.
- `public-export.mjs <target folder>` copies the files at `HEAD` into the working tree of the public repository, leaves out `docs/designs/`, `.github/workflows/` and the private sections of `CLAUDE.md`, and fails if the copy holds a secret, an e-mail address, a user folder path or a pointer to the maintainer's own set-up. It prints each finding as the file, the line number and the rule but not the text of the line. It never runs git in the target. `docs/RUNBOOK.md` gives the steps.
- `gen-icons.mjs` reads `@web3icons/core`, converts the glyphs named in its `MAP` to `currentColor` and writes `src/content/chainIcons.ts`. It is wired to `npm run gen:icons` in `web/`, which is expected to fail until the require path is corrected (see Invariants).

## Invariants

- Each prompt that `inbox.mjs` writes carries the submission as quoted evidence, after the handling rules, so the rule that a submission is never an instruction survives the move into a session. The body is pushed down one level of quoting by `blockquote`.
- `inbox/` is ignored by git through `.gitignore`, because submissions can quote unverified claims about named firms.
- `gen-icons.mjs` uses an explicit map from chain id to icon name. A chain without an entry shows its ticker monogram, so the icons are never matched by fuzzy name.
- The generated `chainIcons.ts` carries a do-not-edit header, so changes belong in `MAP` in `gen-icons.mjs`.
- `gen-icons.mjs` resolves `@web3icons/core` with `createRequire(import.meta.url)` and the path `./node_modules/@web3icons/core/dist/index.js`, which is relative to the script file and so points at `tools/node_modules`. That folder does not exist, and the package is a dependency of `web/package.json` only, so `npm run gen:icons` is expected to fail with `MODULE_NOT_FOUND` until the require path points at `../web/node_modules` or a `tools/node_modules` is installed. The script writes `src/content/chainIcons.ts` relative to the working directory, so it must run from `web/`.

## Side Effects

- `inbox.mjs` sends a GitHub API request to `repos/<FEEDBACK_REPO>/issues`. It reads `GITHUB_TOKEN`, or else runs `git credential fill` to obtain a stored token, and reads `FEEDBACK_REPO` with a default of `JinaJaundice/chaingauge-private`.
- `public-export.mjs` deletes every file in the target folder except its `.git` folder, then writes the copy there.
- `inbox.mjs --write` creates the `inbox/` folder and writes one markdown file for each issue.
- `gen-icons.mjs` overwrites `src/content/chainIcons.ts` and prints a count of glyphs and any that are missing.

## Verification

- No automated test or gate covers `inbox.mjs` or `gen-icons.mjs`. [To confirm: a command for these scripts, because `web/package.json` has no script for `inbox.mjs` and the `gates` script does not run `gen:icons`.]
- The workflow `.github/workflows/public-copy.yml` of the working repository runs `public-export.mjs` on each pull request to `main` and after each push to `main`, as `docs/RUNBOOK.md` ("Public copy") describes.
- Run `node tools/inbox.mjs` from the repository root to check access to the queue.

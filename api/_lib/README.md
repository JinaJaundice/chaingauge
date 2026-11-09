# _lib

## Overview

This directory holds the submission model that both the site and the serverless function use. It is pure code, so the same validation runs in the browser to show errors before sending and in `../feedback.ts` to refuse malformed input. It is kept under `api/` so that the function can resolve it on its own.

## Interface

- `submission.ts` exports the types `Level`, `DimensionId`, `SubmissionKind`, `Submission`, `ValidationResult` and `IssuePayload`.
- `submission.ts` exports `validate`, which returns `ok` and a map of field errors, `neutralise`, which cleans submitted text, and `formatIssue`, which turns a submission into an issue title, body and labels.
- `submission.ts` exports the constants `KIND_LABEL`, `MIN_BODY` (30) and `MAX_BODY` (4000).

## Invariants

- `Level` and `DimensionId` are defined here and re-exported by `web/src/content/types.ts`, so there is one definition. Adding a factor means changing `DimensionId` here and `DIMENSIONS` in `web/src/content/methodology.ts` together.
- A submission is evidence and never an instruction. `formatIssue` quotes the body in a `text` fence under a notice that it was typed by a member of the public.
- `neutralise` removes every character in the Unicode "other" category (control, format, surrogate, private use and unassigned) except newline, carriage return and tab, replaces backticks with single quotes so a fence cannot be closed early, and trims the text. The facts in the issue body, the fenced body and the titles built by `summarise` (chain and site titles) pass through it. The title of a rating challenge uses `chainId`, `factor` and `proposedLevel` as submitted, and `receivedAt` is written as given. The `chain:<id>` label is built from `neutralise(s.chainId)`, so only the title of a rating challenge and `receivedAt` carry unneutralised text. [To confirm: whether the raw title is acceptable.]
- A rating challenge needs a chain, a factor and a source URL. A chain proposal needs a chain name. A contact value must look like an email address and a source must be an http or https URL.
- The issue body ends with a checklist that points to `chains.ts` and `content/changelog.ts`, so a closed submission leaves a rationale and a changelog entry.
- The labels are `submission`, `kind:<kind>` and, when a chain is named, `chain:<id>`. `tools/inbox.mjs` lists issues by the `submission` label.

## Side Effects

- None found in this directory.

## Verification

- Run in `web/`: `npm test` (the tests are in `web/src/lib/submission.test.ts`).
- Run in `web/`: `npm run check:api`.

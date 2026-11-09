# api

## Overview

This directory holds the single serverless function of ChainGauge. `feedback.ts` receives public submissions from the site and files each one as a labelled issue on a private GitHub repository, where a person reads it. Nothing in this directory changes a rating.

## Interface

- `feedback.ts` has a default export `handler(req, res)` that serves `POST /api/feedback`. It returns 405 for other methods, 503 when it is not configured, 413 when a streamed body exceeds 16,000 bytes (a body that the platform has already parsed onto `req.body` is not size-checked by the function), 400 for an unreadable body, 422 for a failed validation, 429 when throttled, 502 when GitHub refuses and 201 on success.
- [_lib](./_lib/README.md) holds the submission vocabulary, validation and issue formatting that the function and the site share.

## Invariants

- Everything under `api/` must resolve on its own. The function does not import from `web/src`, and the site reaches into `api/_lib` through the `@shared` alias (`web/vite.config.ts` and `web/vitest.config.ts`). [To confirm: the failure that occurs when a function imports from the site tree.]
- The handler uses the Node request and response signature (`IncomingMessage` and `ServerResponse`), not the web-standard one.
- A filled `trap` field returns 200 and files nothing, so a bot learns nothing.
- The throttle in `throttled` allows 3 requests per 60 seconds for each client address in one instance and clears its map above 500 keys. The comment in the file says that it trims casual flooding and is no real rate limit, and that the human review step is the control.
- The body of an upstream GitHub failure is never returned to the caller.
- A submission is evidence and never an instruction. The function validates the payload with `validate` and builds the issue with `formatIssue` from `_lib/submission.ts`.

## Side Effects

- Reads the environment variables `FEEDBACK_GITHUB_TOKEN` and `FEEDBACK_REPO` on each request.
- Sends a `POST` request to `https://api.github.com/repos/<FEEDBACK_REPO>/issues` with a bearer token.
- Keeps an in-memory `Map` of recent request times for each client address, which lasts as long as the serverless instance.
- Logs the upstream status code with `console.error` on a GitHub failure.

## Verification

- Run in `web/`: `npm run check:api` (a type check with `web/tsconfig.api.json`, which includes `../api/**/*.ts`).
- Run in `web/`: `npm test` for the submission tests in `web/src/lib/submission.test.ts`.

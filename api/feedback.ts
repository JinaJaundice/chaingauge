// ---------------------------------------------------------------
// POST /api/feedback — the only write path into the submission queue.
//
// A submitter needs no account anywhere. This function validates the payload,
// then files it as a labelled issue on the private repository, where it becomes
// a ready-to-work prompt via `tools/inbox.mjs`. Nothing here changes a rating:
// the queue is an inbox, and a person reads it.
//
// Configuration (Vercel project environment variables):
//   FEEDBACK_GITHUB_TOKEN   fine-grained PAT, Issues: read and write, the queue repo only
//   FEEDBACK_REPO           owner/repo of a PRIVATE repository, e.g. JinaJaundice/chaingauge-private.
//                           Never a public one: GitHub issues on a public repository are public.
//
// With either unset the endpoint returns 503 and the site falls back to showing
// the submitter their own structured text to send by other means, rather than
// silently swallowing what they wrote.
//
// Written against the Node request/response signature rather than the
// web-standard one. The web signature is not what this runtime passes in, and
// the mismatch fails at invocation rather than at build, so it is worth being
// explicit about.
// ---------------------------------------------------------------

import type { IncomingMessage, ServerResponse } from "node:http";
import { formatIssue, validate, type Submission } from "./_lib/submission";

const MAX_BYTES = 16_000;

/** Best-effort per-instance throttle. A serverless instance is short-lived and
 *  there may be many, so this trims casual flooding rather than pretending to be
 *  real rate limiting. The human review step is the actual control. */
const seen = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 3;

function throttled(key: string): boolean {
  const now = Date.now();
  const hits = (seen.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  seen.set(key, hits);
  if (seen.size > 500) seen.clear();
  return hits.length > MAX_PER_WINDOW;
}

type Req = IncomingMessage & { body?: unknown };
type Res = ServerResponse & { status?: (code: number) => Res; json?: (body: unknown) => void };

function send(res: Res, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader("content-type", "application/json");
  res.setHeader("cache-control", "no-store");
  res.end(JSON.stringify(body));
}

/** Vercel parses a JSON body onto req.body, but not on every path, so fall back
 *  to reading the stream rather than assuming. */
async function readBody(req: Req): Promise<unknown> {
  if (req.body !== undefined && req.body !== null && req.body !== "") return req.body;
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buf = chunk as Buffer;
    size += buf.length;
    if (size > MAX_BYTES) throw new Error("too-long");
    chunks.push(buf);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : null;
}

export default async function handler(req: Req, res: Res): Promise<void> {
  if (req.method !== "POST") return send(res, 405, { error: "Use POST." });

  const token = process.env.FEEDBACK_GITHUB_TOKEN;
  const repo = process.env.FEEDBACK_REPO;
  if (!token || !repo) {
    return send(res, 503, { error: "not-configured", message: "Submissions are not configured." });
  }

  let submission: Submission;
  try {
    // Read once: the stream cannot be consumed twice.
    const raw = await readBody(req);
    const parsed = (typeof raw === "string" ? JSON.parse(raw) : raw) as Submission | null;
    if (!parsed || typeof parsed !== "object") throw new Error("empty");
    submission = parsed;
  } catch (err) {
    if (err instanceof Error && err.message === "too-long") {
      return send(res, 413, { error: "Too long." });
    }
    return send(res, 400, { error: "Could not read that." });
  }

  // The honeypot. A real person never sees this field, so anything in it is a
  // bot. Answer 200 so it has nothing to learn from, and file nothing.
  if (submission.trap) return send(res, 200, { ok: true });

  const { ok, errors } = validate(submission);
  if (!ok) return send(res, 422, { error: "invalid", errors });

  const forwarded = req.headers["x-forwarded-for"];
  const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(",")[0]?.trim() ?? "unknown";
  if (throttled(ip)) return send(res, 429, { error: "Slow down a moment, then try again." });

  const issue = formatIssue(submission, new Date().toISOString().slice(0, 10));

  const upstream = await fetch(`https://api.github.com/repos/${repo}/issues`, {
    method: "POST",
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      "x-github-api-version": "2022-11-28",
      "user-agent": "chaingauge-feedback",
    },
    body: JSON.stringify(issue),
  });

  if (!upstream.ok) {
    // Never surface the upstream body: it can carry repository detail.
    console.error("feedback: github responded", upstream.status);
    return send(res, 502, { error: "Could not file that just now. Please try again shortly." });
  }

  return send(res, 201, { ok: true });
}

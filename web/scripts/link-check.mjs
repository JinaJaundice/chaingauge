// Link rot.
//
// A red-team pass opened all 38 citations and found four that a reader cannot
// follow: one article gone entirely, one page changed out from under its claim,
// two behind a form. Nothing in the build noticed, and nothing would have: every
// other check reads the source file, not the internet.
//
// This is deliberately NOT part of `npm run gates`. Gates must be fast,
// deterministic and runnable on a plane; a checker that depends on fifty
// third-party sites being up is none of those, and a flaky gate gets ignored,
// which is worse than no gate. Run it on a schedule, or before a release:
//
//   npm run link:check
//
// A citation may be marked `gated: true` in chains.ts when the source is real
// and worth citing but sits behind a form. That is a promise to the reader
// rather than an excuse: the site says so, so nobody expects to click through
// and find the figure.
import { readFileSync } from "fs";
import { join } from "path";

const SRC = readFileSync(join(import.meta.dirname, "..", "src", "content", "chains.ts"), "utf8");
const block = SRC.slice(SRC.indexOf("const S = {"), SRC.indexOf("// Small builders"));

const entries = [
  ...block.matchAll(/(\w+): \{ name: "([^"]+)", url: "([^"]+)"([^}]*)\}/g),
].map(([, key, name, url, rest]) => ({ key, name, url, gated: /gated: true/.test(rest) }));

if (entries.length < 20) {
  console.error(`link-check: parsed only ${entries.length} citations, the file shape has changed`);
  process.exit(1);
}

const TIMEOUT_MS = 20000;

async function probe(url) {
  // HEAD first, because it is cheap; many sites refuse it, so fall back to GET.
  for (const method of ["HEAD", "GET"]) {
    try {
      const res = await fetch(url, {
        method,
        redirect: "follow",
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: { "user-agent": "Mozilla/5.0 (compatible; chaingauge-link-check/1.0)" },
      });
      if (res.status === 405 || res.status === 501) continue;
      return { status: res.status, finalUrl: res.url };
    } catch (err) {
      if (method === "GET") return { status: 0, error: String(err).slice(0, 90) };
    }
  }
  return { status: 0, error: "unreachable" };
}

const results = await Promise.all(
  entries.map(async (e) => ({ ...e, ...(await probe(e.url)) })),
);

// Stage two. A plain fetch gets 403 from anything with bot protection, and
// DefiLlama, The Block and Yahoo all refuse one while serving a reader perfectly.
// Treating those as rot would make the check cry wolf, and a checker nobody
// trusts is worse than no checker. So anything that failed gets a second look
// through a real browser, which is what a reader actually uses.
// Stage three, and the reason it exists: the first version of this checker
// reported three DefiLlama pages dead, and they were not. DefiLlama answers the
// first request in a session and rate-limits the rest, so hammering 46 URLs with
// several on one host made the checker manufacture its own failures. A checker
// that cries wolf gets ignored, which is worse than not having one.
//
// So: one fresh browser context per attempt, requests to the same host spaced
// out, and one retry after a pause before anything is called dead.
const failed = results.filter((r) => r.status === 0 || r.status >= 400);
if (failed.length > 0) {
  console.log(`${failed.length} failed a plain fetch, re-checking those in a browser`);
  const { chromium } = await import("playwright");
  const browser = await chromium.launch();
  const UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const lastHit = new Map();

  const look = async (url) => {
    const host = new URL(url).host;
    // Space requests to one host, so a rate limit does not read as rot.
    const since = Date.now() - (lastHit.get(host) ?? 0);
    if (since < 4000) await sleep(4000 - since);
    lastHit.set(host, Date.now());

    const ctx = await browser.newContext({ userAgent: UA });
    const page = await ctx.newPage();
    try {
      const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForTimeout(1500);
      const text = (await page.evaluate(() => document.body?.innerText ?? "")).trim();
      return { status: res ? res.status() : 0, chars: text.length };
    } catch (err) {
      return { status: 0, chars: 0, error: String(err).slice(0, 70) };
    } finally {
      await ctx.close();
    }
  };

  for (const r of failed) {
    // A page that answers 200 with almost nothing is gone in every sense that
    // matters to a reader following a citation.
    let v = await look(r.url);
    const bad = v.status === 0 || v.status >= 400 || v.chars < 400;
    if (bad) {
      await sleep(8000);
      v = await look(r.url);
    }
    r.browserStatus = v.status;
    r.browserChars = v.chars;
    r.browserError = v.error;
    r.reallyDead = v.status === 0 || v.status >= 400 || v.chars < 400;
  }
  await browser.close();
}

let dead = 0;
let botBlocked = 0;

for (const r of results) {
  const fetchFailed = r.status === 0 || r.status >= 400;
  if (!fetchFailed) continue;
  if (r.reallyDead) {
    console.error(`  DEAD    ${r.key}: browser ${r.browserStatus || r.browserError}, ${r.browserChars ?? 0} chars — ${r.url}`);
    dead += 1;
  } else {
    console.log(`  ok      ${r.key}: refuses a scripted fetch (${r.status}) but serves a browser fine (${r.browserChars} chars)`);
    botBlocked += 1;
  }
}

const clean = results.length - dead;
const via = botBlocked ? `, ${botBlocked} of them only via a browser` : "";
console.log("");
console.log(
  `link-check: ${clean} of ${results.length} citations reachable by a reader${via}, ${dead} dead`,
);

if (dead > 0) {
  console.error("");
  console.error(
    "A dead citation is a claim a reader cannot check. " +
      "Replace the source or drop the claim; do not leave it pointing at nothing.",
  );
  process.exit(1);
}

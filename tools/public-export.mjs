#!/usr/bin/env node
// Writes the public copy of ChainGauge into a separate git working tree.
//
// The working repository (JinaJaundice/chaingauge-private) stays private, because its issues are the
// submission queue of docs/CONTRIBUTIONS.md and its history carries the weekly refresh. The public
// repository (JinaJaundice/chaingauge) receives a copy of the files at HEAD without the private ones.
//
// Usage: node tools/public-export.mjs <target folder>
//
// Every file is read from HEAD, so uncommitted work never leaves this repository. The script leaves out
// docs/designs/ and .github/workflows/, removes the CLAUDE.md sections that point at the maintainer's own set-up,
// and checks the copy for secrets, e-mail addresses and user folder paths. It prints each finding as the file,
// the line number and the rule, and never the text of the line. It never runs git in the target. After each
// push to main the workflow .github/workflows/public-copy.yml commits and pushes the copy. On the manual
// route, review the diff there and commit and push it yourself (docs/RUNBOOK.md, "Public copy").
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve, sep } from "node:path";

const REPO = resolve(import.meta.dirname, "..");
const fail = (msg) => {
  console.error(`public-export: ${msg}`);
  process.exit(1);
};
const target = process.argv[2] ? resolve(process.argv[2]) : fail("give the target folder, eg ../chaingauge-public");
if (target === REPO || target.startsWith(REPO + sep)) fail("the target must be outside this repository");
if (!existsSync(join(target, ".git"))) fail(`${target} is not a git working tree`);

const git = (...args) => execFileSync("git", args, { cwd: REPO, maxBuffer: 256 << 20 });
const head = git("rev-parse", "--short", "HEAD").toString().trim();
const PRIVATE_PATHS = [/^docs\/designs\//, /^\.github\/workflows\//];
const PRIVATE_SECTIONS = ["## Machine-local memory", "## House style"];
const BINARY = /\.(png|jpe?g|gif|ico|woff2?|pdf)$/i;
// Test files hold synthetic addresses, such as the one in submission.test.ts, so the e-mail rule skips them.
const TEST_FILE = /\.test\.[cm]?[jt]sx?$/;

const files = git("ls-tree", "-r", "-z", "--name-only", "HEAD")
  .toString("utf8")
  .split("\0")
  .filter((f) => f && !PRIVATE_PATHS.some((rx) => rx.test(f)));

/** CLAUDE.md without the private sections and without the row that points at docs/designs/. */
function publicClaude(text) {
  let skip = false;
  const kept = text.split("\n").filter((line) => {
    if (line.startsWith("## ")) skip = PRIVATE_SECTIONS.some((s) => line.startsWith(s));
    return !skip && !line.includes("docs/designs/");
  });
  return `${kept.join("\n").trimEnd()}\n`;
}

// The check: no secret, no e-mail address other than the GitHub no-reply form or an example domain, no user
// folder path and no pointer to the maintainer's own Claude set-up or scheduled routines.
const RULES = [
  ["secret", /gh[opsu]_[A-Za-z0-9]{20,}|github_pat_\w{20,}|sk-ant-[\w-]{10,}|\bsk-[\w-]{20,}|AKIA[0-9A-Z]{16}|\bxox[abeprs]-[\w-]{10,}|\bAIza[\w-]{30,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|\beyJ[\w-]{8,}\.eyJ[\w-]{8,}\.[\w-]{6,}/],
  ["e-mail address", /[\w.%+-]+@(?!users\.noreply\.github\.com\b|example\.(?:com|org)\b)[\w-]+(?:\.[\w-]+)*\.[A-Za-z]{2,}\b/],
  ["user folder path", /[A-Za-z]:[\\/]+Users[\\/]+\w|(?<![\w.])\/Users\/\w|(?<![\w.])\/home\/\w/],
  ["private set-up", /~\/\.claude|\btrig_\w{10,}/],
];

// Empty the target except its .git folder, so a file removed here is removed there too.
for (const entry of readdirSync(target)) if (entry !== ".git") rmSync(join(target, entry), { recursive: true, force: true });

let hits = 0;
for (const file of files) {
  let body = git("show", `HEAD:${file}`);
  if (!BINARY.test(file)) {
    let text = body.toString("utf8");
    if (file === "CLAUDE.md") body = Buffer.from((text = publicClaude(text)));
    text.split("\n").forEach((line, i) => {
      for (const [name, rx] of RULES) {
        if (name === "e-mail address" && TEST_FILE.test(file)) continue;
        if (rx.test(line)) {
          hits += 1;
          console.error(`  ${file}:${i + 1} ${name}`);
        }
      }
    });
  }
  mkdirSync(dirname(join(target, file)), { recursive: true });
  writeFileSync(join(target, file), body);
}

if (hits) fail(`${hits} finding(s) above. Fix them here, commit, and export again. Do not commit the target.`);
console.log(`public-export: wrote ${files.length} files from ${head} to ${target}. The check found nothing.`);

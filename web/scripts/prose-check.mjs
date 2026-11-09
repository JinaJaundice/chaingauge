// Prose check: keep the words in the product plain.
//
// Ported from the engine (apps/engine/web/scripts/prose-check.mjs), where the
// pattern started. This reads user-visible strings out of the source and fails
// on the habits that make copy read as machine-written: em-dashes, "X, not Y"
// antithesis, short slogan sentences, consulting filler, and signposting tics.
// It checks copy a reader sees, not comments and not identifiers, because a
// comment explaining a decision to the next engineer is doing a different job
// from a sentence on a page.
//
//   node scripts/prose-check.mjs           report
//   node scripts/prose-check.mjs --fail     exit non-zero on any finding

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("../src/", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

// Surfaces whose register is deliberately different, and generated or
// vendored content the check does not own.
const SKIP = [
  ".test.",
];

const RULES = [
  [/—/g, "em-dash", "Use a comma, a full stop, or restructure."],
  [/–(?=\s)/g, "en-dash used as an em-dash", "Use a comma or a full stop."],
  [
    /\b([a-z][\w' ]{2,28}), not ([a-z][\w' ]{2,28})\b/g,
    '"X, not Y" antithesis',
    "State the positive on its own.",
  ],
  [
    /\bnot (?:a|an|the) [\w' ]{2,24}(?:\.|,) (?:It|They|This) (?:is|are)\b/g,
    '"not X. It is Y" split',
    "Say what it is and stop.",
  ],
  [
    /\b(?:seamless(?:ly)?|leverage[sd]?|robust|cutting-edge|best-in-class|world-class|state-of-the-art)\b/gi,
    "consulting filler",
    "Say what it does instead.",
  ],
  [
    /\b(?:it'?s worth (?:noting|stating)|importantly|crucially|notably|it is worth stating plainly)\b/gi,
    "filler signpost",
    "Delete it and state the point.",
  ],
  [
    /\b(?:genuinely|deliberately|actually|truly|simply put|in essence)\b/gi,
    "intensifier",
    "Cut it. The sentence is stronger without.",
  ],
  [
    /\bunlock(?:s|ing)? (?:value|potential|the)\b|\bjourney of\b|\bin today's [\w-]+ landscape\b|\bever-(?:changing|evolving)\b/gi,
    "marketing filler",
    "Replace with the concrete thing.",
  ],
  [
    /\bthe (?:wedge|moat|mandate|ask|window|north star|play)\b/gi,
    "codename",
    "Use the real noun.",
  ],
  // ---- the humaniser layer (plain-writing-voice/HUMANISER.md, 11 Aug 2026):
  // the structural tells that survive once the words above are clean ----
  // The blanket "rather than" rule was removed on 17 Aug 2026: the report
  // register (plain-writing-voice v2.1) allows the plain comparative used
  // literally. The rhetorical flip forms stay covered by the "X, not Y",
  // negation-flourish and "not just" rules below.
  [
    /\b(?:is|are) not (?:a(?! party| stakeholder)|an|another|the(?! same))\b/gi,
    "negation flourish",
    "Say what it is or what happens instead.",
  ],
  [
    /\bnot (?:just|only|merely|simply)\b/gi,
    '"not just X but Y" parallelism',
    "State the positive on its own.",
  ],
  [
    /\b(?:crucial|pivotal|meticulous(?:ly)?|intricate|intricacies|tapestry|testament to|delve[sd]?|delving|deep dive|foster(?:s|ing|ed)?|bolster(?:s|ing|ed)?|garner(?:s|ing|ed)?|empower(?:s|ing|ed)?|showcas(?:e[sd]|ing)|underscor(?:e[sd]|ing)|boasts?|vibrant|holistic)\b/gi,
    "AI vocabulary",
    "Use the plain word, or give the number.",
  ],
  [
    // The lookahead tolerates any whitespace run, because JSX text wraps
    // "enhanced due diligence" across source lines and a single-space
    // exception missed it there.
    /\b(?<!anonymity-)enhanc(?:e[sd]?|ing)\b(?![-\s]+due[-\s]+diligence|\s+DD\b|\s+screening|\s+scrutiny|\s+monitoring)/gi,
    "AI vocabulary ('enhance')",
    "Say what improves and by how much.",
  ],
  [
    /\b(?:comprehensive|market-leading|end[- ]to[- ]end(?! test)|proven)\b/gi,
    "promotional decoration",
    "Name the test, the scope, or the deployment.",
  ],
  [
    /\bkey (?:role|part|driver|factor|component|element|priority|benefit|advantage|takeaway|consideration|milestone|differentiator|enabler|theme|insight|strength)s?\b/gi,
    "'key' as decoration",
    "Cut it or say why it matters.",
  ],
  [
    /\balign(?:s|ing)? with\b/gi,
    "'aligns with'",
    "Say what actually matches what.",
  ],
  [
    /\b(?:serves|stands|functions|acts) as (?:a|an|the)\b/gi,
    "copula dodge",
    'Write "is".',
  ],
  [
    /\b(?:represents|marks) (?:a|an|the) (?:\w+ ){0,2}(?:shift|step|change|moment|milestone|opportunity|evolution|departure|turning)\b/gi,
    "significance inflation",
    "Say what happened, with a date or number.",
  ],
  [
    /\b(?:pivotal moment|significant shift|set(?:s|ting)? the stage|turning point|strategic importance|uniquely positioned|evolving landscape|highlights? the (?:importance|significance)|reflect(?:s|ing)? (?:the )?broader)\b/gi,
    "significance inflation",
    "Say what happened, with a date or number.",
  ],
  [
    /\b(?:industry reports?|analysts? (?:note|expect|say|agree)|experts? (?:agree|argue|note|say)|widely (?:recognised|recognized|regarded|seen))\b|\ba leading (?!indicator)/gi,
    "vague attribution",
    "Name the source or drop the claim.",
  ],
  [
    /,\s+(?:enabling|ensuring|reflecting|highlighting|demonstrating|positioning|reinforcing|underscoring|showcasing|signalling|cementing|strengthening|bolstering|fostering|empowering|unlocking)\b[^.\n]{0,90}(?:\.|\n|$)/gi,
    "trailing participle analysis",
    "Delete the clause or promote it to a sentence with evidence.",
  ],
  // ---- v2 (16 Aug 2026, plain-english-default) ----
  [
    /\bwhich (?:is|was|means|meant) that\b/gi,
    "'which is that' hinge",
    "State the claim as its own sentence.",
  ],
];

// A slogan: two very short complete sentences in a row, neither carrying
// detail. Since v2 (16 Aug 2026) short factual sentences are allowed, so the
// pair only counts when both halves fail isAphorism's fact tests.

// What makes a short sentence an aphorism rather than information (v2,
// 16 Aug 2026, plain-english-default). Mirrors is_aphorism() in
// build/humaniser_rules.py: no number, no name after the first word, and no
// verb beyond a bare copula judgement ("is a delay with a logo") or no verb
// at all ("The slow option."). A short sentence with any of those carries a
// fact or an event and is allowed, so a pair is a slogan only when BOTH
// halves are aphorisms.
const HAS_FACT = /[0-9%\u00a3$\u20ac]/;
const MID_NAME = /\S\s+[A-Z]/;
const COPULA_JUDGEMENT = /\b(?:is|are|was|were)\s+(?:a|an|another|the|just|only|simply|pure(?:ly)?)\b/i;
const FINITE_VERB = /\b(?:is|are|was|were|has|have|had|does|do|did|can|cannot|will|would|becomes?|needs?|requires?|remains?|takes?|runs?|holds?|sits?|keeps?|fails?|works?|exists?|carries|refuses?|returns?|stops?|starts?|wins?|pays?|goes|comes?|makes?|gives?|writes?|opens?|closes?|proceeds?|delivers?|matters?|stands?|stays?|means?|counts?|reach(?:es)?|appl(?:y|ies)|decides?|depends?|changes?|replaces?|leaves?|brings?|sends?|tells?|shows?|reads?|ages?|differs?|var(?:y|ies)|produces?|catch(?:es)?|sees?|looks?|moves?|knows?|owes?|buys?|sells?|screens?|blocks?|touch(?:es)?|freezes?|files?|reports?|alerts?|fires?|lands?|costs?|adds?|hides?|breaks?|loses?|beats?|helps?|lets?|allows?|covers?|answers?)\b/i;
const IRREGULAR_PAST = /\b(?:took|ran|held|kept|went|came|made|gave|wrote|won|paid|sent|told|showed|saw|knew|bought|sold|froze|broke|lost|beat|left|brought|fell|rose|grew|found|got|put|set|hit|cut|led|met|read|built|drew|chose|spent|stood|threw|drove|rang|sank|spoke|stole|swore|wore)\b/i;
const isAphorism = (s) =>
  !HAS_FACT.test(s) && !MID_NAME.test(s)
  && (COPULA_JUDGEMENT.test(s)
    || !(FINITE_VERB.test(s) || IRREGULAR_PAST.test(s) || /\b[a-z]{2,}ed\b/.test(s)));
const SLOGAN = /(^|[.!?]\s)([A-Z][a-z][^.!?]{4,34}\.)\s([A-Z][a-z][^.!?]{4,34}\.)(\s|$)/;

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...walk(path));
    else if (/\.(tsx?|md)$/.test(name)) out.push(path);
  }
  return out;
}

// Pull out string and template literals plus JSX text. Comments are stripped
// first, so an explanatory comment is never treated as copy.
function copyStrings(source) {
  // Blank comments out rather than deleting them, so the line numbers still
  // point at the original file. Deleting them shifts every later report by
  // however many comment lines came before it, which sends you to the wrong
  // place and wastes the time the check was meant to save.
  const blank = (match) => match.replace(/[^\n]/g, " ");
  const withoutComments = source
    .replace(/\/\*[\s\S]*?\*\//g, blank)
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, lead) => lead + blank(m.slice(lead.length)));
  const found = [];
  // Match EVERY quoted span, however short, then length-filter. A minimum in
  // the regex itself let a short string ("react" in an import) flip quote
  // parity, after which the scanner read the code BETWEEN strings as the
  // string and the real copy was swallowed and discarded unseen.
  const literal = /"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|`((?:[^`\\$]|\\.)*)`/g;
  let m;
  while ((m = literal.exec(withoutComments)) !== null) {
    const text = m[1] ?? m[2] ?? m[3];
    if (text.length < 12) continue;
    // Skip anything that is plainly not prose: class lists, urls, ids.
    if (/^[\w\-/.:#]+$/.test(text)) continue;
    // A lone em-dash is the standard way to render an empty cell. That is
    // typography, not prose, so it is not the thing this check is about.
    if (/^[\s—–-]+$/.test(text)) continue;
    // A quote pair can straddle two JSX attributes, capturing the markup
    // between them and reporting whatever punctuation it contained. Anything
    // holding a tag or an attribute is not a sentence.
    if (/<\/|\/>|className=|<[a-zA-Z]/.test(text)) continue;
    if (/(?:^|\s)(?:flex|grid|text-|bg-|border-|rounded|px-|py-|mt-|mb-)/.test(text)) continue;
    if (/^https?:/.test(text)) continue;
    // A quote or backtick pair can also straddle two real literals and capture
    // the code between them (seen with two template literals: the match ran
    // from one closing backtick to the next opening one). Code is not prose.
    if (/(?:const |return |=> |for \(|if \()/.test(text)) continue;
    const line = withoutComments.slice(0, m.index).split("\n").length;
    found.push({ text, line });
  }
  // JSX text nodes: the prose the reference surfaces render lives between
  // tags, not in string literals, and the extractor above never saw it.
  const jsxText = />([^<>{}`]{40,})</g;
  while ((m = jsxText.exec(withoutComments)) !== null) {
    const text = m[1].trim();
    if (text.length < 40) continue;
    const line = withoutComments.slice(0, m.index).split("\n").length;
    found.push({ text, line });
  }
  return found;
}

const findings = [];
for (const file of walk(ROOT)) {
  const rel = relative(ROOT, file).replace(/\\/g, "/");
  if (SKIP.some((s) => rel.includes(s))) continue;
  const source = readFileSync(file, "utf8");
  for (const { text, line } of copyStrings(source)) {
    for (const [pattern, why, fix] of RULES) {
      pattern.lastIndex = 0;
      const hit = pattern.exec(text);
      if (hit) findings.push({ rel, line, why, fix, sample: hit[0].slice(0, 60) });
    }
    const slogan = SLOGAN.exec(text);
    if (slogan && isAphorism(slogan[2]) && isAphorism(slogan[3])) {
      findings.push({
        rel,
        line,
        why: "reads as a slogan (two short sentences)",
        fix: "Join them, or add the detail that makes them worth two.",
        sample: `${slogan[2]} ${slogan[3]}`.slice(0, 70),
      });
    }
  }
}

const byRule = new Map();
for (const f of findings) byRule.set(f.why, (byRule.get(f.why) ?? 0) + 1);

if (findings.length === 0) {
  console.log("prose check: clean");
} else {
  console.log(`prose check: ${findings.length} findings\n`);
  for (const [why, count] of [...byRule].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(count).padStart(4)}  ${why}`);
  }
  console.log("");
  for (const f of findings.slice(0, 500)) {
    console.log(`${f.rel}:${f.line}  ${f.why}`);
    console.log(`    ${f.sample}`);
  }
  if (findings.length > 500) console.log(`\n... and ${findings.length - 500} more`);
}

if (process.argv.includes("--fail") && findings.length > 0) process.exitCode = 1;

// Citation integrity.
//
// An MLRO reviewing the site to write the settlement-chain section of a customer
// risk assessment found a citation whose name said "Chainalysis" and whose link
// went to a third-party blog, and said that pasting it into a paper as-is would
// have misattributed the source. That is the worst class of defect this site can
// have: the whole claim is that the working is shown and checkable.
//
// Two rules, and both are mechanical:
//
//   1. If a citation names a known organisation that is not the link's host, the
//      name must say "via", so a reader can see it is reporting rather than the
//      organisation's own publication. "Tether freezes $344m ... via CoinDesk"
//      passes. "EU AMLR: assets restricted from 2027" pointing at a blog does
//      not.
//   2. A citation marked `kind: "primary"` must be on the host of whoever it
//      names. Primary means the originating document, and a blog about a
//      document is not the document.
//
// The site also derives the publisher chip beside every citation from the URL
// rather than the name (see `Citation` in primitives), so the rendered page
// cannot misattribute even if a name is careless. This check keeps the names
// honest as well, because a name is what somebody copies.
import { readFileSync } from "fs";
import { join } from "path";

const SRC = readFileSync(join(import.meta.dirname, "..", "src", "content", "chains.ts"), "utf8");

/** Organisations whose name in a citation implies where it came from. */
const ORGS = {
  chainalysis: "chainalysis.com",
  elliptic: "elliptic.co",
  "trm labs": "trmlabs.com",
  amlbot: "amlbot.com",
  dtcc: "dtcc.com",
  visa: "visa.com",
  circle: "circle.com",
  l2beat: "l2beat.com",
  defillama: "defillama.com",
  coindesk: "coindesk.com",
  messari: "messari.io",
  monerium: "monerium.com",
  tether: "tether.to",
  "eu amlr": "europa.eu",
  fatf: "fatf-gafi.org",
  cointelegraph: "cointelegraph.com",
  "the block": "theblock.co",
  kucoin: "kucoin.com",
  "yahoo finance": "finance.yahoo.com",
};

const block = SRC.slice(SRC.indexOf("const S = {"), SRC.indexOf("// Small builders"));
const entries = [
  ...block.matchAll(/(\w+): \{ name: "([^"]+)", url: "([^"]+)"(?:, kind: "(\w+)")?/g),
];

if (entries.length < 20) {
  console.error(`source-check: only parsed ${entries.length} citations, the file shape has changed`);
  process.exit(1);
}

let fails = 0;
for (const [, key, name, url, kind] of entries) {
  const host = new URL(url).host.replace(/^www\./, "");
  const lower = name.toLowerCase();
  const saysVia = /\bvia\b/.test(lower);

  const named = Object.entries(ORGS).filter(([org]) => lower.includes(org));
  if (named.length === 0) continue;

  // If any organisation the citation names IS the host, the citation names its
  // own publisher and is correctly attributed. Others mentioned in the title are
  // the subject of the story, not its source. Getting this wrong is what made
  // the first version of this check flag "Monerium, how Gnosis Pay settles with
  // Visa", which is published by Monerium and correctly labelled.
  const publisher = named.find(
    ([, domain]) => host === domain || host.endsWith(`.${domain}`),
  );
  if (publisher) continue;

  const [org] = named[0];
  if (kind === "primary") {
    console.error(
      `  FAIL ${key}: marked primary and names "${org}", but links ${host}. ` +
        `Primary means the originating document.`,
    );
    fails += 1;
  } else if (!saysVia) {
    console.error(
      `  FAIL ${key}: names "${org}" but links ${host}, and does not say "via". ` +
        `A reader copying this citation would attribute it to ${org}.`,
    );
    fails += 1;
  }
}

if (fails > 0) {
  console.error(`\nsource-check: ${fails} citation${fails === 1 ? "" : "s"} could misattribute`);
  process.exit(1);
}
console.log(`source-check: ${entries.length} citations, none misattributed`);

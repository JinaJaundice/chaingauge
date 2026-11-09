// The design audit. The system is enforced rather than described, following the
// same approach as the sibling apps. Runs against the built site in BOTH themes
// and fails on:
//   1. an element whose computed font-family is not one of ours,
//   2. interface text below the 11px floor (SVG excluded: diagrams scale on
//      their own coordinate grids, so their sizes are not the interface ladder),
//   3. horizontal page overflow at desktop and at mobile width,
//   4. a chart mark drawn outside its own plot area (this shipped once: force
//      layouts push circles past the boundary unless every mark is clamped),
//   5. any console or page error,
//   6. TEXT THAT DOES NOT FIT ITS BOX. Two shapes, both bugs:
//        - spill: the box has visible overflow and the text is wider than it,
//          so the text paints on top of whatever is next to it,
//        - clipped: the box hides its overflow with no ellipsis, so the text is
//          silently cut off mid-word.
//      Intentional truncation (overflow hidden WITH text-overflow: ellipsis) is
//      allowed, because that is a deliberate choice with a visible affordance.
//      This rule exists because the same class of defect kept reaching the user:
//      a grade column header truncating to "ELEVA…", six product labels cut
//      mid-word, and a 44px table column whose heading wrapped across its
//      neighbour. Every one of those passed all the other checks.
//   7. a page that did not render what its route names: each page must carry
//      its own marker text and a minimum number of text elements. Without
//      this, a route that falls back to another view, or a page that renders
//      blank, passes every other check trivially. Proven live: a misconfigured
//      static server (wrong MIME type, so no script ran) audited nine blank
//      pages as clean.
//
// Run after `npm run build`, with every UI change.
import { chromium } from "playwright";
import { createServer } from "http";
import { readFileSync, existsSync } from "fs";
import { join, extname } from "path";

const WEB = join(import.meta.dirname, "..");
const DIST = join(WEB, "dist");
const PORT = 4187;

if (!existsSync(DIST)) {
  console.error("No dist/. Run `npm run build` first.");
  process.exit(1);
}

const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
};

const srv = createServer((req, res) => {
  let p = join(DIST, req.url.split("?")[0].replace(/^\//, "") || "index.html");
  if (!existsSync(p) || p.endsWith("/")) p = join(DIST, "index.html");
  res.setHeader("content-type", MIME[extname(p)] ?? "application/octet-stream");
  res.end(readFileSync(p));
});
await new Promise((r) => srv.listen(PORT, r));

// Each page carries a marker: text that only renders when the route mounted
// the page it names. A missing marker means the router fell back or the page
// rendered blank, both of which the other checks would pass.
const PAGES = [
  ["#/", "Financial-crime rating"],
  ["#/chains", "Every rated chain"],
  ["#/matrix", "Every chain against every factor"],
  ["#/method", "How the ratings are built"],
  ["#/contribute", "These ratings are judgements"],
  ["#/changelog", "Every rating action"],
  ["#/about", "What ChainGauge is"],
  ["#/chain/tron", "Tron"],
  ["#/chain/tempo", "Tempo"],
  ["#/compare/bitcoin,tron,monero", "side by side"],
];

// Instrument Sans carries the interface and the prose; JetBrains Mono is for
// figures, tickers, grades and dates. Anything else means a component slipped
// off the type system.
const OK_FAMILY = /Instrument Sans|JetBrains Mono|ui-monospace|monospace|ui-sans-serif|system-ui|-apple-system/i;

const browser = await chromium.launch();
let fails = 0;
const note = (msg) => {
  console.error(`  FAIL ${msg}`);
  fails += 1;
};

for (const theme of ["dark", "light"]) {
  for (const { width, height, label } of [
    { width: 1440, height: 1000, label: "desktop" },
    { width: 375, height: 812, label: "mobile" },
  ]) {
    const page = await browser.newPage({ viewport: { width, height } });
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    await page.addInitScript((t) => localStorage.setItem("cg-theme", t), theme);

    for (const [hash, marker] of PAGES) {
      // The mobile pass only needs the surfaces where layout can break.
      if (label === "mobile" && hash.startsWith("#/compare")) continue;

      await page.goto(`http://localhost:${PORT}/${hash}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(500);

      const audit = await page.evaluate(() => {
        const family = [];
        const floor = [];
        for (const el of document.querySelectorAll("body *")) {
          if (el.closest("svg")) continue;
          const hasText = [...el.childNodes].some(
            (n) => n.nodeType === 3 && n.textContent.trim().length > 0,
          );
          if (!hasText) continue;
          const cs = getComputedStyle(el);
          const id = `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 40)}`;
          family.push([id, cs.fontFamily]);
          if (parseFloat(cs.fontSize) < 11) floor.push(`${id} @ ${cs.fontSize}`);
        }

        // Every mark must sit inside its own viewBox, measured rather than
        // inferred from attributes. This started as a circle check reading
        // cx/cy/r, which could not see a path: the concern gauge's track was
        // drawing the wrong semicircle, ending up entirely below the viewBox
        // with only the clipped stubs visible, and the attribute check passed
        // it. getBBox covers arcs, polylines and everything else.
        const escaped = [];
        const TOL = 1.5;
        for (const svg of document.querySelectorAll("svg[viewBox]")) {
          const [vx, vy, vw, vh] = svg.getAttribute("viewBox").split(/[\s,]+/).map(Number);
          for (const el of svg.querySelectorAll("path, circle, rect, line, polyline, polygon")) {
            // A mark inside a clip is meant to be trimmed.
            if (el.closest("clipPath, defs, mask") || el.getAttribute("clip-path")) continue;
            let b;
            try {
              b = el.getBBox();
            } catch {
              continue;
            }
            if (b.width === 0 && b.height === 0) continue;
            const over =
              b.x < vx - TOL ||
              b.y < vy - TOL ||
              b.x + b.width > vx + vw + TOL ||
              b.y + b.height > vy + vh + TOL;
            if (over) {
              escaped.push(
                `<${el.tagName}> spans x ${b.x.toFixed(1)}..${(b.x + b.width).toFixed(1)}, ` +
                  `y ${b.y.toFixed(1)}..${(b.y + b.height).toFixed(1)} ` +
                  `outside viewBox ${vx} ${vy} ${vw} ${vh}`,
              );
            }
          }
        }

        // Text that does not fit the box it was given.
        const spills = [];
        const clipped = [];
        for (const el of document.querySelectorAll("body *")) {
          if (el.closest("svg")) continue;
          const hasText = [...el.childNodes].some(
            (n) => n.nodeType === 3 && n.textContent.trim().length > 0,
          );
          if (!hasText) continue;
          const over = el.scrollWidth - el.clientWidth;
          if (over <= 1 || el.clientWidth === 0) continue;
          const cs = getComputedStyle(el);
          // A scroll container is doing its job, not failing.
          if (/(auto|scroll)/.test(cs.overflowX)) continue;
          const id = `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 44)}`;
          const text = (el.textContent ?? "").trim().slice(0, 28);
          if (cs.overflowX === "visible") {
            spills.push(`"${text}" overruns its box by ${over}px (${id})`);
          } else if (cs.textOverflow !== "ellipsis") {
            clipped.push(`"${text}" is cut off by ${over}px with no ellipsis (${id})`);
          }
        }

        return {
          family,
          floor,
          escaped,
          spills,
          clipped,
          bodyText: document.body.innerText,
          overflow:
            document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        };
      });

      const where = `${theme}/${label} ${hash}`;
      if (!audit.bodyText.includes(marker))
        note(`${where}: marker "${marker}" not on the page; the route did not mount what it names`);
      if (audit.family.length < 20)
        note(`${where}: only ${audit.family.length} text elements; the page did not render`);
      const badFamily = audit.family.filter(([, fam]) => !OK_FAMILY.test(fam));
      if (badFamily.length) note(`${where}: off-system font on ${badFamily.length} elements, e.g. ${badFamily[0][0]} -> ${badFamily[0][1].slice(0, 50)}`);
      if (audit.floor.length) note(`${where}: ${audit.floor.length} elements below the 11px floor, e.g. ${audit.floor[0]}`);
      if (audit.escaped.length) note(`${where}: ${audit.escaped.length} chart marks outside the plot area, e.g. ${audit.escaped[0]}`);
      if (audit.spills.length)
        note(`${where}: ${audit.spills.length} text spills out of its box, e.g. ${audit.spills[0]}`);
      if (audit.clipped.length)
        note(`${where}: ${audit.clipped.length} text cut off with no ellipsis, e.g. ${audit.clipped[0]}`);
      if (audit.overflow) note(`${where}: horizontal overflow (${audit.scrollWidth} > ${audit.clientWidth})`);
      if (errors.length) note(`${where}: console errors: ${errors.slice(0, 2).join(" | ")}`);
      errors.length = 0;
    }
    await page.close();
  }
}

await browser.close();
srv.close();

if (fails > 0) {
  console.error(`\ndesign-check: ${fails} failure${fails === 1 ? "" : "s"}`);
  process.exit(1);
}
console.log("design-check: clean across both themes at desktop and mobile");

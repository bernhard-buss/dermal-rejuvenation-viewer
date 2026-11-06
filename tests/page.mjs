// Page checks without a browser: the inline script compiles, the page keeps its
// noindex tag, and data/parameters.js defines every parameter the page needs.
// Run: node tests/page.mjs
import { readFileSync } from "node:fs";
import vm from "node:vm";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const fail = msg => { console.error("✗ " + msg); process.exitCode = 1; };

if (!/<meta name="robots" content="noindex, nofollow">/.test(html)) fail("noindex meta tag missing");
if (!html.includes('<script src="data/parameters.js"></script>')) fail("data/parameters.js is not loaded");
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
try { new vm.Script(scripts.at(-1), { filename: "index.html" }); } catch (e) { fail("inline script does not compile: " + e.message); }

const ctx = { window: {} };
vm.runInNewContext(readFileSync(new URL("../data/parameters.js", import.meta.url), "utf8"), ctx);
const DP = ctx.window.DRV_PARAMS;
if (!DP) fail("data/parameters.js does not define window.DRV_PARAMS");
const keys = new Set(DP.parameters.map(p => p.key));
for (const k of ["D", "lam", "sec", "mw", "con", "sage", "cfib", "hill", "tday", "a", "ncells", "R", "tsurv",
                 "levels", "dz", "z0", "H", "hep", "dneedle", "pen", "patch", "L", "zv", "ys"])
  if (!keys.has(k)) fail(`parameter ${k} missing`);
for (const p of DP.parameters) {
  if (!(p.min <= p.value && p.value <= p.max)) fail(`${p.key}: default outside its range`);
  for (const k of [...p.sources, ...[...p.note.matchAll(/\{cite:([a-z0-9]+)\}/g)].map(m => m[1])])
    if (!DP.sources[k]) fail(`${p.key} cites ${k}, which is not in the sources`);
}
for (const m of html.matchAll(/cite\("([a-z0-9]+)"\)/g)) if (!DP.sources[m[1]]) fail(`help cites ${m[1]}, which is not in the sources`);
for (const m of html.matchAll(/\["([a-z0-9]+)"\]\]/g)) if (!DP.sources[m[1]]) fail(`the scaffold specification cites ${m[1]}, which is not in the sources`);
// every ⓘ and badge target must exist as a help entry
const entries = new Set(), topics = new Set(["changelog", "refs", "params", "about"]);
for (const t of html.matchAll(/\{ topic: "([a-z]+)", title: "[^"]*", entries: \[([\s\S]*?)\n  \]\}/g)) {
  topics.add(t[1]);
  for (const e of t[2].matchAll(/^\s*\["([a-z0-9]+)",/gm)) entries.add(`${t[1]}/${e[1]}`);
}
for (const m of html.matchAll(/data-help="([a-z0-9/_-]+)"/g)) {
  const t = m[1];
  if (!t || t === "topic/entry" || topics.has(t) || t.startsWith("refs/") || t.startsWith("params/")) continue;
  if (!entries.has(t)) fail(`help target ${t} has no entry`);
}
for (const p of DP.parameters) for (const m of p.note.matchAll(/\{help:([a-z0-9/_-]+)\|/g))
  if (!entries.has(m[1])) fail(`parameter ${p.key} links help ${m[1]}, which has no entry`);
const VERSION = (html.match(/const VERSION = "([0-9.]+)"/) || [])[1];
const changelog = readFileSync(new URL("../CHANGELOG.md", import.meta.url), "utf8");
if (!changelog.includes(`## ${VERSION} `)) fail(`CHANGELOG.md has no entry for version ${VERSION}`);
if (!process.exitCode) console.log(`page OK: version ${VERSION}, ${DP.parameters.length} parameters, ${Object.keys(DP.sources).length} sources (${DP.generator})`);

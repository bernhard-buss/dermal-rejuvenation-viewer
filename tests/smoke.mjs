// Smoke test: run the page script end to end, with no browser.
//
// tests/page.mjs only checks that the script compiles. A script can compile and
// still fail the moment it runs — on 2026-11-06 a `const` read before its
// declaration (temporal dead zone) blanked the whole page and passed every other
// check. This test executes the inline script against a stub DOM, lets the first
// render and the background work run, and fails on any error thrown along the way.
// It checks that the page *runs*, not that it looks right.
// Run: node tests/smoke.mjs
import { readFileSync } from "node:fs";
import vm from "node:vm";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const script = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).at(-1);
const errors = [];

// An element stands in for any DOM node: settable properties are kept, a few
// numbers that layout code reads are fixed, and anything else is a harmless no-op.
function element(id = "") {
  const store = { id, dataset: {}, style: {}, hidden: false, value: "0", textContent: "", innerHTML: "", children: [] };
  const ctx = new Proxy({}, {
    get: (_, k) => k === "measureText" ? () => ({ width: 10 })
      : k === "createImageData" || k === "getImageData" ? (w = 1, h = 1) => ({ width: w, height: h, data: new Uint8ClampedArray(Math.max(1, w * h * 4)) })
      : k === "canvas" ? el : () => undefined,
    set: () => true
  });
  const fixed = { width: 720, height: 420, clientWidth: 720, clientHeight: 420, offsetWidth: 720, offsetHeight: 420,
    scrollHeight: 420, offsetParent: {} };
  const el = new Proxy(store, {
    get(t, k) {
      if (k in t) return t[k];
      if (k in fixed) return fixed[k];
      if (k === "classList") return { add() {}, remove() {}, toggle() {}, contains: () => false };
      if (k === "getContext") return () => ctx;
      if (k === "getBoundingClientRect") return () => ({ left: 0, top: 0, right: 720, bottom: 420, width: 720, height: 420 });
      if (k === "querySelectorAll") return () => [];
      if (k === "querySelector" || k === "closest") return () => null;
      if (k === "getAttribute") return () => null;
      if (k === Symbol.iterator) return undefined;
      return () => undefined;                             // addEventListener, setAttribute, click, showModal, …
    },
    set(t, k, v) { t[k] = v; return true; }
  });
  return el;
}

const elements = new Map();
const byId = id => elements.get(id) || elements.set(id, element(id)).get(id);
const document = {
  getElementById: byId,
  querySelectorAll: () => [],
  querySelector: () => null,
  createElement: tag => element(tag),
  addEventListener() {}, removeEventListener() {},
  body: element("body"), documentElement: element("html"),
  scripts: [{ textContent: script }]
};
const storage = new Map();
const timers = [];
const ctx = {
  document, console,
  window: {}, addEventListener() {}, removeEventListener() {}, devicePixelRatio: 2, innerWidth: 1600, innerHeight: 1000,
  localStorage: { getItem: k => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, String(v)), removeItem: k => storage.delete(k) },
  location: { search: "", hash: "", pathname: "/", origin: "http://localhost", href: "http://localhost/" },
  history: { replaceState() {}, pushState() {} },
  navigator: { clipboard: { writeText: async () => {} } },
  matchMedia: () => ({ matches: false, addEventListener() {} }),
  requestAnimationFrame: fn => { timers.push(fn); return timers.length; },
  cancelAnimationFrame() {},
  setTimeout: (fn, ms) => { timers.push(fn); return timers.length; },
  clearTimeout() {},
  fetch: async () => ({ ok: true, text: async () => "# Changelog\n" }),
  Worker: function () { throw new Error("no workers in the smoke test"); },   // exercises the main-thread fallback
  Blob, URL: { createObjectURL: () => "blob:smoke", revokeObjectURL() {} }, URLSearchParams, FileReader: function () {},
  ImageData: function (a, b, c) {                         // new ImageData(w, h) or new ImageData(data, w, h)
    if (typeof a === "number") { this.width = a; this.height = b; this.data = new Uint8ClampedArray(a * b * 4); }
    else { this.data = a; this.width = b; this.height = c; }
  },
  Image: function () {}, Path2D: function () {}, DOMParser: function () { this.parseFromString = () => document; },
  Math, JSON, Date, Number, String, Array, Object, Map, Set, Float64Array, Uint8ClampedArray, Promise, Symbol, Error, Infinity, NaN, isFinite
};
ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(readFileSync(new URL("../data/parameters.js", import.meta.url), "utf8"), ctx);

try {
  vm.runInContext(script, ctx, { filename: "index.html" });
} catch (e) {
  errors.push("while loading: " + (e.stack || e).toString().split("\n").slice(0, 3).join(" | "));
}
// let the scheduled renders and the background work (run on the main thread here) happen
for (let i = 0; i < 400 && timers.length && !errors.length; i++) {
  const fn = timers.shift();
  try { fn(0); } catch (e) { errors.push("in a scheduled task: " + (e.stack || e).toString().split("\n").slice(0, 3).join(" | ")); }
}

const left = byId("left").innerHTML;
if (!errors.length && !/id="step_tissue"/.test(left)) errors.push("the control panel was not built (no step 1 in #left)");
if (!errors.length && !byId("metrics").innerHTML) errors.push("the coverage panel was not filled");
if (!errors.length && !/^v\d/.test(byId("ver").textContent)) errors.push("the version chip is empty");

// Save YAML must read back here, value for value; DRV_YAML_OUT=FILE also writes it, so the
// pipeline's test suite can load it with `python -m dermsim --params FILE`.
if (!errors.length) {
  try {
    const yaml = ctx.paramsYaml(), before = { ...ctx.window.__drv.params() };
    if (!/^groups:/m.test(yaml) || !/primary: true/.test(yaml)) errors.push("Save YAML lacks the groups or the primary flags the pipeline requires");
    const back = ctx.readYamlish(yaml);
    for (const [k, v] of Object.entries(before)) if (k !== "pattern" && Math.abs(back.parameters[k].value - v) > 1e-3 * Math.max(1, Math.abs(v))) errors.push(`Save YAML: ${k} reads back as ${back.parameters[k].value}, not ${v}`);
    if (process.env.DRV_YAML_OUT) (await import("node:fs")).writeFileSync(process.env.DRV_YAML_OUT, yaml);
  } catch (e) { errors.push("Save YAML: " + (e.stack || e).toString().split("\n")[0]); }
}
if (errors.length) { for (const e of errors) console.error("✗ " + e); process.exit(1); }
console.log(`smoke OK: the page script runs, builds ${(left.match(/class="panel step"/g) || []).length} steps and fills the panels`);

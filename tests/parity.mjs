// Parity test: the viewer's physics (the block between "// >>> physics" and
// "// <<< physics" in index.html) must reproduce the golden cases exported by the
// Python reference implementation (dermsim, private repository):
//   python -m dermsim export-viewer   →   data/golden.json
// Run: node tests/parity.mjs        (exit code 1 on any mismatch)
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const block = html.match(/\/\/ >>> physics([\s\S]*?)\/\/ <<< physics/);
if (!block) { console.error("physics block not found in index.html"); process.exit(1); }
const api = new Function(`"use strict";${block[1]}
  return { derived, kernel, buildField, latticeAt, holePoint, criticalSpacing, singleReach, sitesPerCm2, fractions, unitCellFractions, volumeFractions, levelDepths, nLevels, optimise,
    survival, hill, timeAbove, windowTimes, median, exposure, scaffoldPlan, scaffoldPositions };`)();
const golden = JSON.parse(readFileSync(new URL("../data/golden.json", import.meta.url), "utf8"));
const rtol = golden.rtol ?? 1e-9;

let checks = 0, fails = 0, worst = 0;
function close(what, got, want, tol = rtol) {
  checks++;
  const bothNaN = (want === null || Number.isNaN(want)) && Number.isNaN(got);
  const err = bothNaN ? 0 : Math.abs(got - want) / Math.max(Math.abs(want), 1e-300);
  if (!bothNaN && !(err <= tol)) { fails++; console.error(`✗ ${what}: got ${got}, want ${want} (rel ${err.toExponential(2)})`); }
  else if (!bothNaN && Number.isFinite(err)) worst = Math.max(worst, err);
}

const DMAP = { k: "k", kap: "kap", lam: "lam", thalf: "thalf", qcell: "qcell", Q: "Q", surv: "surv", Qt: "Qt", per_ngml: "perNgml", con: "con", cfib: "cfib", rc: "rc" };
for (const c of golden.cases) {
  const p = c.params, d = api.derived(p), f = api.kernel(p, d);
  for (const [py, js] of Object.entries(DMAP)) close(`${c.name} derived.${py}`, d[js], c.derived[py]);
  for (const [r, v] of c.kernel) close(`${c.name} kernel(${r})`, f(r), v);
  const F = api.buildField(p, c.pattern, c.custom, 7);
  for (const [x, y, z, v] of c.field) close(`${c.name} field(${x.toFixed(0)},${y.toFixed(0)},${z.toFixed(0)})`, F.at(x, y, z), v);
  close(`${c.name} reach`, api.singleReach(p, d, f), c.reach);
  close(`${c.name} survival`, api.survival(p), c.survival, 1e-12);
  for (const [x, v] of c.hill) close(`${c.name} hill(${x})`, api.hill(x * d.con, d.con, p.hill), v, 1e-12);
  for (const [x, v] of c.time_above) close(`${c.name} timeAbove(${x})`, api.timeAbove(x * d.con, d.con, p.tsurv), v, 1e-12);
  api.levelDepths(p).forEach((z, i) => close(`${c.name} depth[${i}]`, z, c.depths[i], 1e-12));
  const vf = api.volumeFractions(F, p, c.volume.nxy, c.volume.nz);
  vf.forEach((v, i) => close(`${c.name} volume[${i}]`, v, c.volume.fractions[i], 1e-12));
  if (c.lattice) {
    for (const [a, x, y, z, v] of c.lattice) close(`${c.name} lattice(a=${a}, z=${z})`, api.latticeAt(p, d, f, c.pattern, a, x, y, z), v);
    close(`${c.name} critical spacing`, api.criticalSpacing(p, c.pattern).a, c.critical_spacing ?? NaN, 1e-8);
    close(`${c.name} sites/cm²`, api.sitesPerCm2(c.pattern, p.a, api.nLevels(p)), c.sites_per_cm2);
    for (const [a, ...fr] of c.unit_cell.rows) api.unitCellFractions(p, c.pattern, a, c.unit_cell.nu, c.unit_cell.nz)
      .forEach((v, i) => close(`${c.name} unit cell a=${a} [${i}]`, v, fr[i], 1e-12));
    const ex = api.exposure(p, c.pattern, p.a, c.exposure.nu, c.exposure.nz);
    for (const k of ["activation", "ever", "days_mean", "days_median", "days_max"])
      close(`${c.name} exposure.${k}`, ex[k], c.exposure[k], 1e-12);
    // the injection scaffold: needle tracks, pitch, densities and the array over the patch
    const pl = api.scaffoldPlan(p, c.pattern), want = c.scaffold;
    for (const k of ["tracks_per_cell", "deposits_per_cell", "cell_area", "tracks_per_cm2", "deposits_per_cm2",
                     "pitch", "wall_gap", "diameter", "patch_um", "cells_nx", "cells_ny", "needles", "cells_per_needle"])
      close(`${c.name} scaffold.${k}`, pl[k], want[k], 1e-12);
    close(`${c.name} scaffold drawable`, pl.drawable ? 1 : 0, want.drawable ? 1 : 0, 0);
    want.a1.forEach((v, i) => close(`${c.name} scaffold.a1[${i}]`, pl.a1[i], v, 1e-12));
    want.a2.forEach((v, i) => close(`${c.name} scaffold.a2[${i}]`, pl.a2[i], v, 1e-12));
    want.tracks.forEach((t, i) => {
      for (const k of ["u", "v", "x", "y", "length", "cells"]) close(`${c.name} scaffold.track[${i}].${k}`, pl.tracks[i][k], t[k], 1e-12);
      t.deposits.forEach((z, j) => close(`${c.name} scaffold.track[${i}].deposit[${j}]`, pl.tracks[i].deposits[j], z, 1e-12));
    });
    close(`${c.name} scaffold positions`, api.scaffoldPositions(pl).length, want.needles, 0);
  }
}
// optimiser: same front (designs, search and exact coverage) as dermsim.optimize
if (golden.optimise) {
  const g = golden.optimise;
  for (const [mode, want] of Object.entries(g.modes)) {
    const got = api.optimise(g.params, g.pattern, mode, g.opts);
    close(`optimise ${mode} evaluated`, got.evaluated, want.evaluated, 0);
    if (got.front.length !== want.front.length) { fails++; console.error(`✗ optimise ${mode}: front has ${got.front.length} solutions, want ${want.front.length}`); continue; }
    want.front.forEach((w, i) => {
      const s = got.front[i];
      for (const k of ["a", "levels", "dz", "z0", "ncells", "cells_per_cm2"]) close(`optimise ${mode}[${i}].${k}`, s[k], w[k], 1e-9);
      for (const k of ["window", "below", "above"]) close(`optimise ${mode}[${i}].${k}`, s[k], w[k], 1e-12);
      for (const k of ["window", "below", "above"]) close(`optimise ${mode}[${i}].exact.${k}`, s.exact[k], w.exact[k], 1e-12);
    });
  }
}
console.log(`${golden.generator} golden cases: ${golden.cases.length}, checks: ${checks}, failures: ${fails}, largest relative difference: ${worst.toExponential(2)}`);
process.exit(fails ? 1 : 0);

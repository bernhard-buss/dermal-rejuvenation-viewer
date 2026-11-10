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
  return { derived, kernel, buildField, latticeAt, holePoint, criticalSpacing, singleReach, sitesPerCm2, fractions, unitCellFractions, unitCellCoverage, viewCoverage, levelDepths, nLevels, optimise, clustersApart,
    dermisModel, depthSamples, papillaryCellShare, besselJ, j0Zeros, depthGrid, nModes, siteTable, siteColumns, tableAt, tableCol, DEPTH,
    survival, hill, timeAbove, windowTimes, median, exposure, scaffoldPlan, scaffoldPositions,
    tissueProfile, tissueEffective, reductionIsFaithful, cellularShare, levelKernels, images, deepMode,
    rng, gauss, spectral, fieldG, fieldLog, donor, realise, mcStats, monteCarlo, hetFaithful, insertedDepths };`)();
const golden = JSON.parse(readFileSync(new URL("../data/golden.json", import.meta.url), "utf8"));
const rtol = golden.rtol ?? 1e-9;

let checks = 0, fails = 0, worst = 0;
// `floor`: values smaller than this are compared on its scale. A depth-resolved field is a
// sum of a few hundred modes that cancel far from the source, so where it has fallen to a
// millionth of the activation threshold the last digits are rounding, not physics.
function close(what, got, want, tol = rtol, floor = 1e-300) {
  checks++;
  const bothNaN = (want === null || Number.isNaN(want)) && Number.isNaN(got);
  const err = bothNaN ? 0 : Math.abs(got - want) / Math.max(Math.abs(want), floor);
  if (!bothNaN && !(err <= tol)) { fails++; console.error(`✗ ${what}: got ${got}, want ${want} (rel ${err.toExponential(2)})`); }
  else if (!bothNaN && Number.isFinite(err)) worst = Math.max(worst, err);
}

const DMAP = { k: "k", kap: "kap", lam: "lam", D: "D", thalf: "thalf", qcell: "qcell", Q: "Q", surv: "surv", Qt: "Qt", per_ngml: "perNgml", con: "con", cfib: "cfib", rc: "rc" };
for (const c of golden.cases) {
  const p = c.params, d = api.derived(p), f = api.kernel(p, d), tiny = 1e-6 * d.con;
  for (const [py, js] of Object.entries(DMAP)) close(`${c.name} derived.${py}`, d[js], c.derived[py]);
  for (const [r, v] of c.kernel) close(`${c.name} kernel(${r})`, f(r), v);
  const F = api.buildField(p, c.pattern, c.custom, 7);
  for (const [x, y, z, v] of c.field) close(`${c.name} field(${x.toFixed(0)},${y.toFixed(0)},${z.toFixed(0)})`, F.at(x, y, z), v, rtol, tiny);
  close(`${c.name} reach`, api.singleReach(p), c.reach);
  close(`${c.name} survival`, api.survival(p), c.survival, 1e-12);
  // each level its own medium; the images of the junction and of a bounded deep side
  const ks = api.levelKernels(p);
  c.levels.forEach(([D_, lam_, rc_], l) => { close(`${c.name} level ${l} D`, ks[l].d.D, D_, 1e-12); close(`${c.name} level ${l} λ`, ks[l].d.lam, lam_, 1e-12); close(`${c.name} level ${l} reach`, ks[l].rc, rc_, 1e-12); });
  for (const [l, [zl, want]] of c.images.entries()) {
    const got = ks[l].imgs;                                        // none in the depth-resolved model: the boundaries are in the table
    if (got.length !== want.length) { fails++; console.error(`✗ ${c.name} images(${zl}): ${got.length} images, want ${want.length}`); continue; }
    want.forEach(([zi, g], i) => { close(`${c.name} image ${zl}[${i}] depth`, got[i][0], zi, 1e-12); close(`${c.name} image ${zl}[${i}] sign`, got[i][1], g, 0); });
  }
  // a dermis with depth: profiles, the effective medium and when it may be trusted
  const te = api.tissueEffective(p), tw = c.tissue;
  for (const k of ["D", "k", "lam", "scale"]) close(`${c.name} tissue.effective.${k}`, te[k], tw.effective[k], 1e-12);
  close(`${c.name} tissue.cellular_share`, api.cellularShare(p), tw.cellular_share, 1e-12);
  close(`${c.name} tissue.faithful`, api.reductionIsFaithful(p) ? 1 : 0, tw.faithful ? 1 : 0, 0);
  close(`${c.name} tissue.papillary_cell_share`, api.papillaryCellShare(p), tw.papillary_cell_share, 1e-12);
  for (const [nz, [zs, wc, wv]] of Object.entries(tw.samples)) {  // where coverage is counted, and the cells and volume each depth stands for
    const S = api.depthSamples(p, +nz);
    zs.forEach((v, i) => { close(`${c.name} samples(${nz}) z[${i}]`, S.z[i], v, 1e-12); close(`${c.name} samples(${nz}) cells[${i}]`, S.wc[i], wc[i], 0); close(`${c.name} samples(${nz}) volume[${i}]`, S.wv[i], wv[i], 0); });
  }
  const tp = api.tissueProfile(p);
  for (const [z, D_, k_, lam_, rho_] of tw.profile) {
    close(`${c.name} tissue.D(${z.toFixed(0)})`, tp.D(z), D_, 1e-12);
    close(`${c.name} tissue.k(${z.toFixed(0)})`, tp.k(z), k_, 1e-12);
    close(`${c.name} tissue.lam(${z.toFixed(0)})`, tp.lam(z), lam_, 1e-12);
    close(`${c.name} tissue.rho(${z.toFixed(0)})`, tp.density(z), rho_, 1e-12);
  }
  for (const [x, v] of c.hill) close(`${c.name} hill(${x})`, api.hill(x * d.con, d.con, p.hill), v, 1e-12);
  for (const [x, v] of c.time_above) close(`${c.name} timeAbove(${x})`, api.timeAbove(x * d.con, d.con, p.tsurv), v, 1e-12);
  api.levelDepths(p).forEach((z, i) => close(`${c.name} depth[${i}]`, z, c.depths[i], 1e-12));
  const vc = api.viewCoverage(F, p, c.view.nxy, c.view.nz);       // coverage of the view: by host cells and by volume
  for (const k of ["cells", "volume"]) vc[k].forEach((v, i) => close(`${c.name} view ${k}[${i}]`, v, c.view[k][i], 1e-12));
  if (c.lattice) {
    for (const [a, x, y, z, v] of c.lattice) close(`${c.name} lattice(a=${a}, z=${z})`, api.latticeAt(p, ks, c.pattern, a, x, y, z), v, rtol, tiny);
    close(`${c.name} critical spacing`, api.criticalSpacing(p, c.pattern).a, c.critical_spacing ?? NaN, 1e-8);
    close(`${c.name} sites/cm²`, api.sitesPerCm2(c.pattern, p.a, api.nLevels(p)), c.sites_per_cm2);
    for (const [a, ...fr] of c.unit_cell.rows) { const cov = api.unitCellCoverage(p, c.pattern, a, c.unit_cell.nu, c.unit_cell.nz);
      [...cov.cells, ...cov.volume].forEach((v, i) => close(`${c.name} unit cell a=${a} ${i < 3 ? "cells" : "volume"}[${i % 3}]`, v, fr[i], 1e-12)); }
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
// optimiser: same front (designs, search and exact coverage) as dermsim.optimize, in each dermis model
for (const g of golden.optimise ?? []) {
  for (const [mode, want] of Object.entries(g.modes)) {
    const got = api.optimise(g.params, g.pattern, mode, g.opts), tag = `${g.name} ${mode}`;
    close(`${tag} evaluated`, got.evaluated, want.evaluated, 0);
    close(`${tag} λ nodes`, got.lam_nodes.length, want.lam_nodes.length, 0);
    want.lam_nodes.forEach((v, i) => close(`${tag} λ node ${i}`, got.lam_nodes[i], v, 1e-12));
    if (got.front.length !== want.front.length) { fails++; console.error(`✗ ${tag}: front has ${got.front.length} solutions, want ${want.front.length}`); continue; }
    want.front.forEach((w, i) => {
      const s = got.front[i];
      for (const k of ["a", "levels", "dz", "z0", "ncells", "cells_per_cm2"]) close(`${tag}[${i}].${k}`, s[k], w[k], 1e-9);
      for (const k of ["window", "below", "above"]) close(`${tag}[${i}].${k}`, s[k], w[k], 1e-12);
      for (const k of ["window", "below", "above", "volume"]) close(`${tag}[${i}].exact.${k}`, s.exact[k], w.exact[k], 1e-12);
    });
  }
}
// the depth-resolved kernel: Bessel functions, zeros of J0, the depth grid and the tables themselves
if (golden.depth) {
  const g = golden.depth;
  for (const [x, j0, j1] of g.bessel) { close(`J0(${x})`, api.besselJ(x, 0), j0, 1e-12, 1e-3); close(`J1(${x})`, api.besselJ(x, 1), j1, 1e-12, 1e-3); }
  const zeros = api.j0Zeros(api.DEPTH.NRHO);
  g.zero_index.forEach((i, k) => close(`zero ${i + 1} of J0`, zeros[i], g.zeros[k], 1e-13));
  for (const c of g.cases) {
    const p = c.params, G = api.depthGrid(p), T = api.siteTable(p, c.zs), C = api.siteColumns(p, c.zs, c.z_out), tiny = 1e-9 * c.peak;
    close(`${c.name} P`, T.P, c.P, 1e-12); close(`${c.name} modes`, api.nModes(T.P, p.R), c.modes, 0);
    close(`${c.name} nodes`, G.zn.length, c.nodes, 0); close(`${c.name} zg`, G.zg, c.zg, 1e-12); close(`${c.name} λmax`, G.lamMax, c.lam_max, 1e-12);
    [0, 1, G.zn.length >> 1, G.zn.length - 2, G.zn.length - 1].forEach((j, k) => close(`${c.name} node ${j}`, G.zn[j], c.zn[k], 1e-12));
    let peak = 0; for (const v of T.c) peak = Math.max(peak, v);
    close(`${c.name} peak`, peak, c.peak, 1e-9);
    for (const [r, z, v] of c.table) close(`${c.name} table(${r.toFixed(0)}, ${z.toFixed(0)})`, api.tableAt(T, r, z), v, 1e-9, tiny);
    for (const [r, m, v] of c.columns) close(`${c.name} column ${m} (${r.toFixed(0)})`, api.tableCol(C, r, m), v, 1e-9, tiny);
  }
}
// overlap rule: every pair of depths, as dermsim.optimize.clusters_apart
for (const [pattern, a, n, dz, R, depths, want] of golden.apart ?? [])
  close(`clustersApart(${pattern}, a ${a}, ${n} levels, dz ${dz}, R ${R}${depths ? ", depths " + depths : ""})`,
    api.clustersApart(pattern, a, n, dz, R, depths ?? undefined) ? 1 : 0, want ? 1 : 0, 0);
// heterogeneity and the Monte Carlo (M4): same random numbers, same tissues, same coverage
if (golden.mc) {
  const g = golden.mc;
  let r = api.rng(g.rng.seed);
  g.rng.values.forEach((v, i) => close(`rng(${g.rng.seed})[${i}]`, r(), v, 0));
  r = api.rng(g.gauss.seed);
  g.gauss.values.forEach((v, i) => close(`gauss(${g.gauss.seed})[${i}]`, api.gauss(r), v, 1e-12));
  const fld = api.spectral(api.rng(g.field.seed), g.field.ell);
  for (const [x, y, z, gv, lv] of g.field.points) { close(`field g(${x},${y},${z})`, api.fieldG(fld, x, y, z), gv, 1e-9); close(`field ln(${x},${y},${z})`, api.fieldLog(fld, 0.4, x, y, z), lv, 1e-9); }
  for (const c of g.cases) {
    const dn = api.donor(c.params, ...c.donor.z);
    for (const k of ["hpap", "rpap", "cells"]) close(`${c.name} donor.${k}`, dn[k], c.donor[k], 1e-12);
    close(`${c.name} faithful`, api.hetFaithful(c.params) ? 1 : 0, c.faithful ? 1 : 0, 0);
    const tiny = 1e-6 * api.derived(c.params).con;
    for (const run of c.runs) {
      const got = api.realise(c.params, c.pattern, run.seed, c.n_targets);
      for (const k of ["coverage", "below", "above", "coverage_all", "days", "n_eff"]) close(`${c.name} seed ${run.seed} ${k}`, got[k], run[k], 1e-9);
      run.depths.forEach((v, l) => close(`${c.name} seed ${run.seed} depth ${l}`, got.depths[l], v, 1e-12));
      for (const k of ["n_host", "n_senescent"]) close(`${c.name} seed ${run.seed} ${k}`, got[k], run[k], 0);
      for (const k of ["hpap", "rpap", "cells"]) close(`${c.name} seed ${run.seed} donor.${k}`, got.donor[k], run.donor[k], 1e-12);
      run.lam_levels.forEach((v, l) => close(`${c.name} seed ${run.seed} λ level ${l}`, got.lam_levels[l], v, 1e-12));
      run.cells.forEach(([x, y, z, sen, cc, ec, w], i) => {
        const j = i * 25, tag = `${c.name} seed ${run.seed} cell ${j}`;
        close(`${tag} x`, got.pos[j][0], x, 1e-12); close(`${tag} y`, got.pos[j][1], y, 1e-12); close(`${tag} z`, got.pos[j][2], z, 1e-12);
        close(`${tag} senescent`, got.sen[j] ? 1 : 0, sen ? 1 : 0, 0);
        close(`${tag} c`, got.c[j], cc, 1e-9, tiny); close(`${tag} threshold`, got.ec50[j], ec, 1e-9); close(`${tag} weight`, got.w[j], w, 1e-9);
      });
    }
    for (const [zp, want] of c.inserted) api.insertedDepths(c.params, [60, 500, 1400], zp).forEach((v, i) => close(`${c.name} inserted(${zp})[${i}]`, v, want[i], 1e-12));
    const m = api.monteCarlo(c.params, c.pattern, c.mc.n, c.mc.seed, c.n_targets);
    for (const k of ["n", "mean", "sd", "se", "p_hit", "se_p", "p_cov", "p_safe", "sd_noise", "sd_tissue", "q05", "q50", "q95",
                     "above_mean", "all_mean", "days_mean"]) close(`${c.name} mc.${k}`, m[k], c.mc[k], 1e-9);
  }
}
console.log(`${golden.generator} golden cases: ${golden.cases.length}, checks: ${checks}, failures: ${fails}, largest relative difference: ${worst.toExponential(2)}`);
process.exit(fails ? 1 : 0);

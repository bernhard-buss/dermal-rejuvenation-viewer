# Dermal Implant Density Viewer — notes for Claude Code

- The whole tool is `index.html` (HTML + CSS + JS, no build step, no dependencies,
  no CDN) plus the generated `data/`. GitHub Pages is deployed by the workflow
  `.github/workflows/ci.yml` (Pages source "GitHub Actions"): every push to `main`
  runs `tests/page.mjs` and `tests/parity.mjs` and deploys only if both pass, about
  a minute later. Keep `main` working.
- **Not indexed.** `<meta name="robots" content="noindex, nofollow">` must stay in
  the `<head>`. Do not add a `robots.txt` that blocks the page (crawlers would
  then never see the `noindex`).
- **Public values only.** The page carries published parameters; lab data never go
  in this repository. The model, parameter table (`docs/parameters.md`) and claims
  register (`docs/claims.md`) live in the private repository `dermal-rejuvenation`.
- **`data/` is generated, never edited.** `data/parameters.js` (+ `.json`) and
  `data/golden.json` come from the private repository:
  `pixi run python -m dermsim export-viewer` (writes here). Parameters, their
  ranges, status, notes and the references (formatted from the Crossref-generated
  bibliography) live in its `config/parameters.yaml`; change them there. A source
  cited in the help (`cite(key)`) must be in that file's `sources` section.
  Status: `src` (sourced), `ana` (analogue: published value from a related
  system or of a related quantity), `ph` (placeholder), `des` (design / view). Notes use `{cite:key}` and
  `{help:topic/entry|text}`, rendered by `renderNote()`.
- **Physics = the Python model.** The block between `// >>> physics` and
  `// <<< physics` holds pure functions (no DOM, no state) mirroring
  `dermsim.model` (multi-depth lattices: `levelDepths`, `levelShift`;
  `survival` scales every source by the day), `dermsim.optimize`
  (`optimiseSteps`, `clustersApart`, table look-up), `dermsim.response`
  (`hill`, `timeAbove`, `windowTimes`, `exposure`), `dermsim.tissue`
  (`tissueProfile`, `tissueEffective`, `reductionIsFaithful`), `dermsim.hetero`
  (`realise`, `monteCarloSteps`, `mcStats`: the same mulberry32 generator `rng`,
  drawn in the same order, so both draw the same random tissues) and the geometry
  of `dermsim.scaffold` (`scaffoldPlan`, `scaffoldPositions`).
- **Three dermis models, entering through `levelKernels` only** (`dermis_model`,
  `dermisModel`): 0 uniform, 1 averaged per level (one effective D and λ per
  injection level, `derived(p, z)`), 2 depth-resolved (the default: `besselJ`,
  `depthGrid`, `depthSolve`, `siteTable`, `siteColumns` mirror `dermsim.depth`
  term for term, so the tables agree to rounding). `levelKernels` returns one
  level per injection depth (`makeLevel`); its `at(h², z)` is the field of one
  site with the boundaries in it, and everything downstream takes those levels.
  The pipeline's finite volumes measured both (the depth-resolved one within 1 %,
  the averaged one tens of percent off where a source reaches the papillary
  dermis). Keep that visible: the Coverage panel's line with the other model's
  number, the warning for the averaged model, and the help entry `model/layers`
  are part of the feature, not decoration.
- **Coverage is counted over host cells** (`depthSamples`, `fractions` with one
  weight per depth, added in a fixed order — the optimiser compares these sums,
  so do not reorder them); the dermis volume is a second read-out
  (`unitCellCoverage`, `viewCoverage`). The optimiser admits only O ≤ O*.
- **Renamed parameters stay readable.** `DP.renamed` (old key → new key, from
  the `renamed:` section of the parameter file) is applied by `readUrlState`
  (the address is then rewritten by `syncUrl`) and by `applyFile`; `paramsYaml`
  writes the new names and the table. A rename needs nothing here, only the
  line in `config/parameters.yaml`. The same
  block runs in a background Web Worker built from its text (`WORKER_SRC`) for
  the design curve, the coverage of the whole dermis, the optimiser and the
  Monte Carlo; `ask()`
  cancels stale requests of the same kind and falls back to the main thread. Change both together, re-export, and run
  `node tests/parity.mjs` (golden cases, relative tolerance 1e-9) and
  `node tests/page.mjs` (script compiles, noindex, parameters, changelog entry).
  CI runs both on every push.
- **Layout: three panes, Model / View / Analysis** (`#left`, `.stage`, `#right`,
  each `data-col`), and the page itself never scrolls; each pane scrolls on its own
  under the bar `#panes`. Desktop (≥ 1100 × 620 px): side by side; `fitLayout()` sets
  `--cols` for the bar and the columns alike (map ≤ 960 px, as large as the height
  allows; analysis 380–560 px; centred). Below that, `#panes` is a tab bar at the top
  and only `body[data-col]`'s pane shows (`setPane`, remembered as `drv_pane`); phones
  held upright (≤ 700 px, portrait) get it at the bottom. A pane drawn while hidden
  is redrawn when it is shown. Canvas backing stores stay fixed. Check all three
  sizes after layout changes. The prototype banner closes (`drv_banner`).
- **One section open at a time, on each side.** Headers `.acc-head` with
  `data-acc="left|right"` and `data-pane`; `openPane()` switches (remembered in
  `localStorage`, `drv_open_left` / `drv_open_right`) and calls `ON_OPEN[pane]` to
  redraw a plot that was drawn while hidden. A closed design step shows how many of
  its values are off their defaults (`chg_<group>`).
- **The basic tissue model** (step 1): `basicValues(sel)` mirrors
  `dermsim.params.basic_values` from the export (`DP.presets`, `DP.sites`,
  `DP.basic`). `defaultOf(key)` is the basic model's value for the keys it sets,
  so `isDefault`, ↺ and the default tick follow the selection; a value moved by hand
  is *custom* (`customKeys()`) and survives a change of the selection (`setBasic`).
  The selection travels in links (`age`, `sex`, `site`, `ethnicity`) and in Save
  YAML (`design.basic`).
- **Versions are for the people using the viewer.** `VERSION` (top of the
  script) and `CHANGELOG.md` change only for user-facing changes:
  - a new feature, or a change in what the viewer computes or shows (including
    changed default values or sources) → new **minor** version (0.x.0);
  - a fix the user can notice → **patch** (0.x.y).
  - Technical work (refactoring, tests, comments, `CLAUDE.md`/`README.md`,
    repository files such as `LICENSE`) and minimal cosmetic tweaks get **no**
    new version and **no** changelog entry; they ride along with the next
    user-facing release.
  The header shows the version as a chip (`.verchip`) that opens Help ›
  Changelog; a "new" marker shows until the visitor has opened the changelog of
  this version (`localStorage` key `drv_seen_version`). Changelog entries
  (newest first, `## x.y.z — YYYY-MM-DD`) say what the user can do or see
  differently, not how it was built.
- **Help is part of every feature.** A feature is done when (1) it has an entry
  in `HELP` (topic → entries), (2) its control carries an ⓘ
  (`<a class="hl" data-help="topic/entry">`), (3) if user-facing, `VERSION` and
  `CHANGELOG.md` follow the rule above. The in-page changelog renders
  `CHANGELOG.md`; there is no second copy. Numbers in help text come from the data (`data-n` spans filled
  by `fillHelpNumbers()`), not typed constants. `#help/topic/entry` deep links
  open an entry; `?` opens the help.
- **The hand-off pack is written here and in Python.** *Download pack* and
  `python -m dermsim scaffold --out DIR` must produce the same `spec.md`,
  `layout.dxf`, `layout.svg`, `tracks.csv` and `scaffold.json` byte for byte,
  apart from the line naming the tool. The JS writers (`scSpecMd`, `scDxf`,
  `scSvg`, `scTracksCsv`, `scFiles`) sit outside the physics block but mirror
  `dermsim.scaffold`; after changing one, diff the two outputs for the same
  design. Numbers in those files use the plain `f0`/`f1`/`f3`/`f4` formatters,
  never `fmt()` (which groups thousands).
- **Save / load YAML.** `paramsYaml()` writes a complete
  `config/parameters.yaml` — values from `S.p`, everything else copied from
  `DRV_PARAMS` — that `python -m dermsim --params FILE` reads; `readYamlish()`
  plus `applyFile()` read one back. The reader takes only values, pattern,
  colouring and sites: labels, statuses, sources and notes always come from the
  build, so a file can never put an unchecked source on screen. A new parameter
  needs nothing extra; a new non-numeric control goes into the `design:` block
  and into `params.design()` on the Python side.
- **The control panel is five numbered steps** from the parameter file's `groups`
  (`key`, `step`, `title`, `note`); a group with `place: analysis` (the variation)
  has no step and is drawn inside its analysis panel (`#mcParams`). Values marked `primary: true` open with their
  step; the rest fold behind *more* (open folds remembered in `localStorage`,
  `drv_open_steps`). `syncFolds()` opens any step holding a folded value that is off
  its default, so a shared link never hides what it changed. A new parameter goes
  into a group in `config/parameters.yaml`; nothing here needs to change.
- **Numbers in prose are computed, not typed.** Help text and the *Read me first*
  panel use `data-n` spans filled by `fillHelpNumbers()` (parameter values, and
  extras such as the dose gap from `defaultGap()`). Never type a model output into
  prose: it goes stale the next time a default moves (it did, twice, on 2026-11-06).
- **`tests/smoke.mjs` runs the page script** end to end against a stub DOM (no
  browser, no dependencies) and fails on any error during load, the first render or
  the background work. `tests/page.mjs` only checks that it compiles — on 2026-11-06
  a `const` read before its declaration blanked the page and passed that test. The
  smoke test checks that the page runs, not that it looks right: still load it in a
  browser after visible changes.
- **The address holds the configuration.** `stateQuery()` writes every value that
  differs from its default (keys = `PARAMS` keys, slider units), `pattern`,
  `show=concentration|response`, `scaffold=patch` and `sites=x,y;…` (µm, custom
  layouts); `syncUrl()` puts it
  in the address after each final render, keeping a `#help…` part;
  `readUrlState()` reads it once at load and clamps to the slider ranges. A new
  control must be added to all three and to the help entry `start/share`.
- Canvases are drawn at about twice their displayed size; use `ks(canvas)` /
  `font(canvas, px)` for text, line widths and markers so they read the same at
  any width.
- Physics: uniform sphere of radius R per site. Uniform and averaged model:
  `k = D/λ²`, exact steady-state solution inside and outside the sphere, image
  source at z = 0 (no flux), superposition with a cutoff at `R + 9.2 λ`.
  Depth-resolved model: a table c(ρ, z) per injection depth out to
  `R + 9.2 λmax`, looked up bilinearly. Sites are bucketed by that cutoff. Units µm, s, molecules; shown in ng/mL via the molecular weight.
- Test hook: `window.__drv` (`version`, `params()`, `state()`, `set({...})`,
  `derived()`, `sites()`, `field(x,y,z)`, `fieldNgml(x,y,z)`, `kernel(r)`,
  `siteField(rho,z)`, `dermisModel()`,
  `criticalSpacing()`, `metrics()`, `survival()`, `exposure()`, `scaffold()`,
  `scFiles()`, `paramsYaml()`, `applyFile()`, `readYamlish()`,
  `openHelp(target)`, `closeHelp()`, `helpTargets()`).
- Check after changes: `node tests/page.mjs && node tests/smoke.mjs && node tests/parity.mjs`; serve the folder (`.claude/static_server.js`, port 8766),
  no console errors; every `__drv.helpTargets()` resolves to a topic/entry; no
  "missing source" marker in the help; the kernel is continuous at r = R, matches
  the point source × 3(x cosh x − sinh x)/x³ far away, and finite differences
  satisfy D∇²c − kc (+ s0 inside) ≈ 0 to ~1e-6.

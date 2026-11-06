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
  system), `ph` (placeholder), `des` (design / view). Notes use `{cite:key}` and
  `{help:topic/entry|text}`, rendered by `renderNote()`.
- **Physics = the Python model.** The block between `// >>> physics` and
  `// <<< physics` holds pure functions (no DOM, no state) mirroring
  `dermsim.model` (multi-depth lattices: `levelDepths`, `levelShift`;
  `survival` scales every source by the day), `dermsim.optimize`
  (`optimiseSteps`, `clustersApart`, table look-up), `dermsim.response`
  (`hill`, `timeAbove`, `windowTimes`, `exposure`), `dermsim.tissue`
  (`tissueProfile`, `tissueEffective`, `reductionIsFaithful`) and the geometry of
  `dermsim.scaffold` (`scaffoldPlan`, `scaffoldPositions`).
- **A layered dermis enters through `derived()` only.** It folds the depth
  profiles into one effective D and λ; everything downstream is unchanged. The
  page cannot solve the layered problem — the pipeline's finite-volume solver
  does, and it measured where the reduction holds (within 10 % of the threshold
  below ~3 λ, worse than half a threshold within 1 λ of the junction). Keep that
  caveat visible: the Coverage warning and the help entry `model/layers` are part
  of the feature, not decoration. The same
  block runs in a background Web Worker built from its text (`WORKER_SRC`) for
  the design curve, the coverage of the whole dermis and the optimiser; `ask()`
  cancels stale requests of the same kind and falls back to the main thread. Change both together, re-export, and run
  `node tests/parity.mjs` (golden cases, relative tolerance 1e-9) and
  `node tests/page.mjs` (script compiles, noindex, parameters, changelog entry).
  CI runs both on every push.
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
- Physics: uniform sphere of radius R per site, `k = D/λ²`, exact
  steady-state solution inside and outside the sphere, image source at z = 0
  (no flux), superposition with a cutoff at `R + 9.2 λ`; sites are bucketed by
  that cutoff. Units µm, s, molecules; shown in ng/mL via the molecular weight.
- Test hook: `window.__drv` (`version`, `params()`, `state()`, `set({...})`,
  `derived()`, `sites()`, `field(x,y,z)`, `fieldNgml(x,y,z)`, `kernel(r)`,
  `criticalSpacing()`, `metrics()`, `survival()`, `exposure()`, `scaffold()`,
  `scFiles()`, `paramsYaml()`, `applyFile()`, `readYamlish()`,
  `openHelp(target)`, `closeHelp()`, `helpTargets()`).
- Check after changes: `node tests/page.mjs && node tests/parity.mjs`; serve the folder (`.claude/static_server.js`, port 8766),
  no console errors; every `__drv.helpTargets()` resolves to a topic/entry; no
  "missing source" marker in the help; the kernel is continuous at r = R, matches
  the point source × 3(x cosh x − sinh x)/x³ far away, and finite differences
  satisfy D∇²c − kc (+ s0 inside) ≈ 0 to ~1e-6.

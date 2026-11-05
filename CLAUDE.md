# Dermal Implant Density Viewer — notes for Claude Code

- The whole tool is `index.html` (HTML + CSS + JS, no build step, no dependencies,
  no CDN). GitHub Pages serves `main` directly at
  https://bernhard-buss.github.io/dermal-rejuvenation-viewer/ — every push to
  `main` is live within about a minute, so keep `main` working.
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
  `dermsim.model`. Change both together, re-export, and run
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
- **The address holds the configuration.** `stateQuery()` writes every value that
  differs from its default (keys = `PARAMS` keys, slider units), `pattern`,
  `show=concentration` and `sites=x,y;…` (µm, custom layouts); `syncUrl()` puts it
  in the address after each final render, keeping a `#help…` part;
  `readUrlState()` reads it once at load and clamps to the slider ranges. A new
  control must be added to all three and to the help entry `start/share`.
- Physics (M1): uniform sphere of radius R per site, `k = D/λ²`, exact
  steady-state solution inside and outside the sphere, image source at z = 0
  (no flux), superposition with a cutoff at `R + 9.2 λ`; sites are bucketed by
  that cutoff. Units µm, s, molecules; shown in ng/mL via the molecular weight.
- Test hook: `window.__drv` (`version`, `params()`, `set({...})`, `derived()`,
  `sites()`, `field(x,y,z)`, `fieldNgml(x,y,z)`, `kernel(r)`, `criticalSpacing()`,
  `metrics()`, `openHelp(target)`, `closeHelp()`, `helpTargets()`).
- Check after changes: `node tests/page.mjs && node tests/parity.mjs`; serve the folder (`.claude/static_server.js`, port 8766),
  no console errors; every `__drv.helpTargets()` resolves to a topic/entry; no
  "missing source" marker in the help; the kernel is continuous at r = R, matches
  the point source × 3(x cosh x − sinh x)/x³ far away, and finite differences
  satisfy D∇²c − kc (+ s0 inside) ≈ 0 to ~1e-6.

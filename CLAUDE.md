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
- **Sources.** Every entry in `SOURCES` uses the wording checked in the private
  `docs/claims.md`, and its citation (authors, journal, volume, pages) comes from
  the Crossref-generated `references.bib` there — never typed from memory. Each
  parameter in `PARAMS` has a `status`: `src` (sourced), `ana` (analogue: published
  value from a related system), `ph` (placeholder), `des` (design / view). A new
  value is `ph` until its source is checked. `cite(key)` makes the in-text link to
  `#help/refs/<key>`; a missing key shows a red marker and a console warning.
- **Help is part of every feature.** A feature is done when (1) it has an entry
  in `HELP` (topic → entries), (2) its control carries an ⓘ
  (`<a class="hl" data-help="topic/entry">`), (3) `VERSION` is raised and
  `CHANGELOG.md` has an entry (newest first, `## x.y.z — YYYY-MM-DD`): minor for a
  new feature, patch for smaller changes. Changelog entries are written for the
  person using the viewer. The in-page changelog renders `CHANGELOG.md`; there is
  no second copy. Numbers in help text come from the data (`data-n` spans filled
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
- Check after changes: serve the folder (`.claude/static_server.js`, port 8766),
  no console errors; every `__drv.helpTargets()` resolves to a topic/entry; no
  "missing source" marker in the help; the kernel is continuous at r = R, matches
  the point source × 3(x cosh x − sinh x)/x³ far away, and finite differences
  satisfy D∇²c − kc (+ s0 inside) ≈ 0 to ~1e-6.

# Dermal Implant Density Viewer

Browser prototype: how densely must rejuvenated fibroblasts be implanted into
aged dermis so that the signals they secrete reach the surrounding aged cells
inside a **therapeutic window**, above the activation threshold of aged cells and
below a fibrotic ceiling?

**Open it:** <https://bernhard-buss.github.io/dermal-rejuvenation-viewer/>

Part of a master thesis project in the Shivashankar group (ETH Zurich / Paul
Scherrer Institute) by Bernhard Buss and Nicholas Lawler. It builds on the
group's implantation of mechanically reprogrammed fibroblasts into aged skin
models: Roy B, Pekec T, Yuan L, Shivashankar GV. *Aging Cell* 2024;23:e14032,
[doi:10.1111/acel.14032](https://doi.org/10.1111/acel.14032).

## What it does

- Models each implant site as a sphere of cells secreting one signal into
  homogeneous dermis (steady state, linear decay over a decay length λ,
  impermeable dermal–epidermal junction). The solution is exact for this model.
- Shows an en-face map and a cross-section, coloured by window or by
  concentration, for hexagonal, square, random or hand-placed sites.
- Reports the share of the dermis inside the window, sites and cells per cm²,
  the reach of one site, the largest gap-free spacing and a design curve.

## Where the numbers come from

Every value has a badge that opens its help entry:

| Badge | Meaning |
|---|---|
| **source** | published value, checked against the source (abstract or full text) |
| **analogue** | published value from a related system (e.g. other cytokines) |
| **placeholder** | no checked source yet: results that depend on it are illustrative |
| **design** | a choice (layout, depth) or a view setting |

The literature search behind this prototype found **no verified activation
threshold or fibrotic ceiling for TGF-β1 in dermal fibroblasts**, and no
verified secretion rate per cell; these are placeholders until measured. The
help lists all references (**Help → References**).

## Privacy

The page is a single HTML file without a server or dependencies. It carries
published values only and runs entirely in the browser; nothing entered is
uploaded. It asks search engines not to index it
(`<meta name="robots" content="noindex, nofollow">`); it is still reachable by
anyone who has the address.

## Status

Prototype (milestone M1), not peer-reviewed. Do not read numbers off it as
predictions. The reference implementation of the model, the parameter table
and the claims register live in a private repository.

## Licence

MIT, © 2026 ETH Zurich and Paul Scherrer Institute (PSI); see [LICENSE](LICENSE).

## Versions

The version is shown in the header; click it for the changelog
([CHANGELOG.md](CHANGELOG.md)). Versions change only with changes you can see
or use in the viewer.

# Dermal Rejuvenation Viewer

Browser prototype: how densely must rejuvenated fibroblasts be implanted into
aged dermis so that the signals they secrete reach the surrounding aged cells
inside a **therapeutic window**, above the activation threshold of aged cells and
below a fibrotic ceiling?

**Open it:** <https://bernhard-buss.github.io/dermal-rejuvenation-viewer/>

Part of the master thesis of Bernhard Buss, supervised by Nicholas Lawler, in
the group of Prof. G.V. Shivashankar (ETH Zurich / Paul Scherrer Institute). It builds on the
group's implantation of mechanically reprogrammed fibroblasts into aged skin
models: Roy B, Pekec T, Yuan L, Shivashankar GV. *Aging Cell* 2024;23:e14032,
[doi:10.1111/acel.14032](https://doi.org/10.1111/acel.14032).

## What it does

- Models each implant site as a sphere of cells secreting one signal into the
  dermis: steady state, linear decay over a decay length λ, impermeable
  dermal–epidermal junction. By default the dermis has depth — slower diffusion
  under the junction, clearance following the cell density of the papillary and
  reticular layers — and the signal is solved through that depth profile
  (*Dermis model*: depth-resolved). The earlier ways of computing it, one
  average decay length per injection level or a uniform dermis, are one control
  away, and the Coverage panel shows where they part. Below
  the dermis the signal may continue (open), be cleared (absorbing) or be
  reflected (closed).
- A **basic tissue model** — age, sex, body site, ethnicity — sets the advanced
  tissue values from measurements (layers and cells by age; dermis and epidermis
  thickness at ten body sites by sex); a value changed by hand stays yours.
- Three panes — **Model** (five numbered steps: whose skin, what the cells make,
  how you inject, the device, what you look at), **View** (map and cross-section)
  and **Analysis** — side by side under one title bar on a desktop window, as tabs
  on smaller screens (at the bottom on a phone held upright); one section open at
  a time in Model and in Analysis.
- Time after implantation (the implant decays with a half-life) and a graded
  response of the host cells; how long each part of the dermis spends in the
  window.
- Shows an en-face map and a cross-section, coloured by window or by
  concentration, for hexagonal, square, random or hand-placed sites.
- Several injection depths: stacked lattices, shifted sideways against each
  other, so that seen from above the sites are closer while in depth they keep
  their distance.
- Reports the share of the host cells inside the window (and of the dermis
  volume beside it), sites and cells per cm², the reach of one site, the largest
  gap-free spacing and a design curve.
- **Optimise**: searches flat and multi-depth layouts for the most host cells
  inside the window with at most a set share above the ceiling, plots every
  design against the dose with the best-coverage front, and lets you cycle
  through the solutions in the maps.
- **Robustness**: draws many random tissues — donors, the insertion depth,
  variation within the dermis, senescent cells, cell-to-cell thresholds — and
  shows how the coverage of the host cells spreads and how often the design
  succeeds (coverage reached, ceiling respected); along the optimiser's front it
  finds the cheapest design that succeeds often enough (robust ideal density).
- On a desktop window the page fits the screen: the controls and the panels
  scroll on their own beside the map.
- A cross-section through the skin with the host fibroblasts coloured by the
  signal where they sit, and the decay length against depth.
- **Injection scaffold**: the design as a needle array, with a downloadable
  hand-off pack for a fabricator (specification, DXF, SVG, needle list).
- **Save / Load YAML**: the whole configuration as the parameter file the Python
  pipeline reads.

## Where the numbers come from

Every value has a badge that opens its help entry:

| Badge | Meaning |
|---|---|
| **source** | published value, checked against the source (abstract or full text) |
| **analogue** | published value measured in a related system (other cells, another signal, another set-up) or as a related quantity (all nuclei instead of fibroblasts only) |
| **placeholder** | no checked source yet: results that depend on it are illustrative |
| **design** | a choice (layout, depth) or a view setting |

No activation threshold, fibrotic ceiling or secretion rate has been measured
in **dermal** fibroblasts; the viewer uses values measured in related cells,
marked *analogue*. Taken together they say the reference implantation protocol
falls short of activating its neighbours by more than an order of magnitude —
see **Help → Does the dose add up?**. The help lists all references
(**Help → References**).

## Privacy

The page is a single HTML file without a server or dependencies. It carries
published values only and runs entirely in the browser; nothing entered is
uploaded. It asks search engines not to index it
(`<meta name="robots" content="noindex, nofollow">`); it is still reachable by
anyone who has the address.

## Status

Prototype (milestones M1–M3), not peer-reviewed. Do not read numbers off it as
predictions. The reference implementation of the model, the parameter table
and the claims register live in a private repository.

## Licence

MIT, © 2026 ETH Zurich and Paul Scherrer Institute (PSI); see [LICENSE](LICENSE).

## Versions

The version is shown in the header; click it for the changelog
([CHANGELOG.md](CHANGELOG.md)). Versions change only with changes you can see
or use in the viewer.

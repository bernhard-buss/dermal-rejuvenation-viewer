# Changelog

Newest version first. Each entry says what you can do or see differently.

## 0.2.0 — 2026-11-05

- The header shows the **working signal**, TGF-β3; a new help entry, *Which signal*, explains the TGF-β isoforms and why TGF-β3 was chosen for now.
- All values, notes and references now come from the project's single parameter file, the same one the Python model uses; references are formatted from the checked bibliography (full author lists and journal names). The numbers are unchanged.
- Two new references on the TGF-β isoforms (Urban et al. 2023, Lichtman et al. 2016).
- Credits: master thesis of Bernhard Buss, supervised by Nicholas Lawler, in the group of Prof. G.V. Shivashankar.

## 0.1.0 — 2026-11-05

First prototype (minimal model, M1).

- Implant sites as spheres of cells in homogeneous dermis, at steady state, with the signal decaying over a decay length λ; the dermal–epidermal junction lets nothing through.
- En-face map at any depth and a vertical cross-section, coloured by **window** (below the aged-cell threshold / inside / above the fibrotic ceiling) or by **concentration** (log scale), with the threshold lines drawn in.
- Hexagonal, square and random patterns that continue beyond the view; **Edit sites** to place, move and remove sites yourself.
- Coverage of the whole dermis and of the slice, sites and cells per cm², reach of one site, the largest spacing without a gap, and a **design curve** of coverage against spacing.
- **Young / Aged tissue** presets for the threshold of the host cells.
- The address always holds the current view (every changed value, the pattern, the colouring and your own sites); **Copy link** shares it.
- Every value carries a badge (**source**, **analogue**, **placeholder**, **design**) that opens its entry in the help, with the references it rests on.
- Help with search, an ⓘ next to every control, links straight to any entry (`#help/topic/entry`), a references list and this changelog. Press `?` to open it.

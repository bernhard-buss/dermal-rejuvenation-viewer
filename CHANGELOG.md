# Changelog

Newest version first. Each entry says what you can do or see differently.

## 0.5.0 — 2026-11-06

- **Time after implantation.** The implant does not signal forever: a new slider shows the state on any day after implantation, with the source scaled by the surviving share of the cells (*Implant half-life*). Maps, coverage, design curve and optimiser all follow, so you can ask for a design that still works on day 14. The coverage panel reports how much of the dermis is **ever** in the window — including tissue that starts above the ceiling and drops into it as the implant decays — and for how many days.
- **Graded response.** A third colouring, *Response*, shows how strongly the host cells respond rather than only whether they are inside the window, with a new *Hill exponent* slider. Half-maximal at the aged-cell threshold.
- **Injection scaffold.** A new panel turns the design into a device: where the needles meet the skin (one tile with its step vectors, or the whole patch), how long each needle is and at which depths it releases. With four or five injection depths two of them share a surface position, so that needle releases twice along one track. *Download pack* writes a specification, a DXF with one layer per needle length, an SVG at 1:1, a needle list and a JSON — enough to start a conversation with whoever builds it, including what the literature reports about building such an array.
- **Save and load the parameter file.** *Save YAML* downloads everything on screen as a complete `parameters.yaml` that the Python pipeline reads directly (`--params`); *Load YAML* reads one back.
- **Three values are no longer invented.** The secretion per cell, the activation threshold and the fibrotic ceiling now carry measured values from related cell types (badge *analogue*) instead of placeholders, as does the new epidermis thickness (*source*) used by the scaffold. All numbers on the page move accordingly.

## 0.4.0 — 2026-11-05

- **Several injection depths.** Two new sliders, *Injection depths* (1–5) and *Spacing between depths*, stack lattices at several depths, each shifted sideways against its neighbour: seen from above the sites are closer together, in depth they keep their distance, and the volume of the dermis fills up. On the map, the centre dot of each site gives its depth and sites at other depths are dashed; the coverage panel lists the depths and the spacing seen from above. Hand-placed sites keep their own depth (new ones go to the slice depth).
- **Optimise.** *Find designs* searches the layouts (flat, volume or both) that put the most dermis inside the window for your tissue and signal values. A plot shows every design evaluated and the best coverage for each dose; cycle through the solutions with ◀ ▶ (or click a point) and see each one in the maps at once; *Back to my design* restores yours.
- **Cross-section as skin.** The cross-section now shows the epidermis, papillary and reticular dermis and hypodermis with collagen fibres, the host fibroblasts coloured by the signal where they sit (not reached, activated, above the ceiling), implant clusters with their cells, and the injection depths.
- **Smoother.** The design curve and the coverage of the whole dermis are computed in the background, so the sliders stay responsive; the design curve no longer overflows its panel.

## 0.3.0 — 2026-11-05

- Every slider shows its **default** as a small grey tick. A value that differs from its default turns teal and gets a **↺** that puts it back (double-clicking the slider does the same); hovering a value shows its default.

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

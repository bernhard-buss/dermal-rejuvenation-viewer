# Changelog

Newest version first. Each entry says what you can do or see differently.

## 0.11.0 — 2026-11-10

- **A basic model for the tissue.** *Whose skin* now starts with four choices — **age** (0–12, 13–25, 26–54, 55+ years), **sex**, **body site** (the skin model, forehead, chest, abdomen, upper arm, forearm, back, thigh, lower leg, foot) and **ethnicity** — that set the **advanced** values below them from measurements: age the layers, cells, donor spread and senescent share; body site and sex the dermis and epidermis thickness. Ethnicity is kept but sets nothing, as no checked source gives values for it. The age buttons in the header moved here.
- **Custom values:** move an advanced value by hand and it stays yours when you change the basic model; the step marks it *custom*, lists what the basic model would give, and offers to take its values again. ↺ on such a value goes back to the basic model's value. The selection travels with links and Save YAML.
- **One section at a time.** The design steps on the left and the analysis panels on the right each show one section open; click a title to switch. A closed step shows how many of its values you changed.
- The values of *How much it varies* moved from the design steps into the **Robustness** panel, which they feed. The steps are five again.
- On a desktop window the middle column is now exactly as wide as the map, and the **analysis column takes the rest** of the width.
- Finer sliders for the dermis thickness (10 µm) and the epidermis thickness (1 µm), so the measured site values sit on them.
- **Model, View, Analysis.** The three columns now have titles that form one bar, which stays in place while each column scrolls underneath. The page no longer stretches on wide screens: the three columns stay centred, the map grows only up to 960 px and the analysis column up to 560 px.
- **Tabs on smaller screens.** Below 1100 px wide (or 620 px high) the titles become tabs at the top and one of Model, View and Analysis shows at a time instead of one long page; on a phone held upright the tabs sit at the bottom of the screen, with a more compact header.
- The **prototype notice** at the top can be closed (×); it stays closed on that device.

## 0.10.0 — 2026-11-10

- **The dermis is now solved in depth.** New control *Dermis model* (step 1, under *more*) with three choices: **depth-resolved** (new, and the default), **averaged per level** (what the viewer computed up to 0.9) and **uniform**. The depth-resolved model carries the signal through the measured depth profile instead of giving each injection level one average decay length. It matters wherever a site reaches the papillary dermis, which is 5 % of the thickness and holds 37 % of the host cells. Example: a stack at 200 / 500 / 800 µm (hexagonal, 300 µm apart, 10⁵ cells per site secreting 300 pg/10⁶ cells/day) has 36 % of its host cells in the window by three-dimensional finite volumes, 35 % by the depth-resolved model and 60 % by the averaged one. Every number on the page moves; designs deep in the reticular dermis barely change. The Coverage panel shows what the other of the two models would say for your design.
- **Coverage now counts host cells, not dermis volume** — in the Coverage panel, the design curve, the time in the window and the optimiser, as the Robustness panel already did. The share of the dermis volume is shown beside it; in the uniform dermis the two are the same number.
- **The optimiser admits only designs that respect the ceiling:** at most O* of the host cells above it (the overexposure limit of step 4, 5 % by default). Designs that cover more by overexposing more are still drawn as faint dots but are no longer on the front.
- **Old links and files keep working.** The switch *Depth-dependent dermis* (`layers`) became *Dermis model* (`dermis_model`); 0 and 1 mean what they did. A link or a saved YAML with the old name opens as before, the address is rewritten with the new name, and *Save YAML* writes the new name. A link that never set the switch now opens with the depth-resolved model and so shows new numbers; add `dermis_model=1` to it to see the former ones.
- A cluster that the junction or a bounded deep side cuts: in the depth-resolved model the part inside the dermis carries its whole dose.
- Robustness: with the depth-resolved model each random tissue gets its own solution, so differences between donors and in the insertion depth are computed without approximation. Variation *within* the dermis (off by default) still enters through each site's own scaled medium and is indicative only.

## 0.9.1 — 2026-11-10

- Fixed: the **fewer** button that folds a step's extra values away showed as a filled teal block with its text invisible; it is plain text again, like **more**.
- Fixed: **↺** (back to the default) corrected the number but could leave the slider where it was; the slider now moves too.
- Fixed: **overlapping clusters were missed when they sit directly above each other.** A stack repeats its sideways position every third depth (hexagonal) or every second depth (square), and only neighbouring depths were checked. The *Clusters overlap* warning now tests every pair of depths, at the depths the levels actually end up at, and the optimiser no longer proposes such stacks. With the default cluster radius of 150 µm this concerns square stacks of three or more depths spaced under 150 µm and hexagonal stacks of four or more depths spaced under 100 µm.

## 0.9.0 — 2026-11-07

- **The page fits the window on a desktop screen.** The controls on the left and the panels on the right scroll on their own and stay in view; the map in the middle takes the space between them and is as large as the window's height allows, with the cross-section below it. Smaller windows keep the single scrolling column, with the map at most 720 px wide.
- **Robustness now means what the plan means:** a tissue counts as a success when the coverage reaches C* *and* at most O* of the host cells are above the ceiling (new: the overexposure limit O*, 5 % by default). The panel shows both shares, the spread between tissues apart from the sampling noise of the host cells, the coverage if senescent cells are counted as missed, and how many days a host cell spends in the window.
- **Robust ideal density:** after **Optimise**, *Test the front* runs every design on the front over the same random tissues and marks the cheapest one that succeeds in at least P* of them (new: the required robustness P*, 90 % by default).
- New source of variation, **spread of the insertion depth**: from one application to the next the needles enter deeper or shallower (sourced range of 64–90 % of their length), moving all deposits together.
- **+100 tissues** continues a run with the next seeds, until the standard errors are small enough.
- **Show tissue 1 on the map**: the host cells of the first random tissue near the slice depth, coloured by where they are, with the senescent ones.
- Help: what the three-dimensional check found — variation within the dermis on the scale of λ or longer lowers the coverage below the average-tissue prediction, and where the panel's fast method holds.

## 0.8.0 — 2026-11-07

- **Robustness** panel: draws many random tissues and counts, in each, the share of the host cells inside the window. It shows how that coverage spreads, how often the design reaches its target coverage C*, the coverage without any variation, the standard errors, and one tissue from above and in depth, with its senescent cells and, if set, its local cell density. The pipeline's `python -m dermsim mc` draws exactly the same tissues.
- New step 4, **How much it varies**: the senescent share of host cells (an analogue from p21-positive cells in aged dermis, 15 % by default), the spread between donors of cellularity and papillary thickness (measured per age group), and, as placeholders that are off by default, the cell-to-cell spread of the threshold, an effect of senescent cells on their neighbours' threshold (either sign) and random variation of cell density and diffusion within the dermis.
- **Age** buttons in the header (13–25, 26–54, 55+ years) set the tissue of an age group from measured layer values: papillary thickness, how many more cells the papillary dermis holds, the overall cellularity, and the donor spreads. They replace the former *Young / Aged tissue* buttons, which only changed the placeholder aged-cell factor. New parameter **Cellularity**: more cells take up more signal, so λ is shorter in younger skin.
- **Each injection level now has its own decay length.** A stack from the papillary into the reticular dermis no longer shares one average λ: its top level decays faster than its bottom one. The cross-section marks each level's λ on the λ(z) curve, and the Coverage panel lists them. Coverage of multi-depth designs changes accordingly; single-depth designs are unchanged.
- New parameter **Below the dermis**: the dermis continues (open, as before), the signal is cleared at the dermis thickness (absorbing), or nothing passes into the fat (closed). The cross-section draws the boundary.
- The default papillary thickness and density ratio are now the exact measured values for donors aged 55 and over (101.2 µm, 11.01×), equal to the 55+ preset.
- Fixed: **Save YAML** wrote no `groups` section and no `primary` flags, so since 0.7.0 a saved file could not be read by the pipeline (`--params`). It now can, and a test checks it.

## 0.7.2 — 2026-11-06

- The *analogue* badge is explained more precisely: a checked value measured in a related system (other cells, another signal, another set-up) or as a related quantity, such as all nuclei instead of fibroblasts only. The help entry *Limitations of this prototype* now lists all six analogue values, including the decay length λ and the papillary cell density.

## 0.7.1 — 2026-11-06

- Help corrected where 0.7.0 had overtaken it: the cross-section, the limitations and the roadmap no longer describe the dermis as homogeneous or list the depth-dependent dermis as future work.

## 0.7.0 — 2026-11-06

- **Five numbered steps.** The controls now read top down in the order you would decide them: *1 Whose skin*, *2 What the cells make*, *3 How you inject*, *4 The device*, *5 What you look at*. Each step opens with the two to four values that usually matter — 12 sliders instead of 30 — and folds the rest behind *more*. A folded value you or a shared link has moved never stays hidden: its step opens itself.
- **The depth-dependent dermis is now the default.** Slower diffusion under the junction and clearance following the cell density are on from the start; the simpler uniform dermis is one switch away, under *more* in step 1. Every number on the page moves a little: the default design now falls about 15× short of the activation threshold at a cluster centre (17× with the uniform dermis).
- **Optimise scores every layout with the decay length it really sees.** With a depth-dependent dermis a shallow layout meets a shorter λ than a deep one, and the search now accounts for that instead of judging all candidates by your current design's λ. It agrees with the exact re-evaluation of the solutions shown, and takes about three times as long.
- The dose numbers in *Read me first* and in the help are now computed from the model instead of typed, so they follow the parameter file.

## 0.6.0 — 2026-11-06

- **The dose does not add up — and that is the result.** The secretion per cell is now built from checked sources in two steps: fibroblasts release TGF-β almost entirely latent (active is ≤ 2 % of the total at baseline in human dermal fibroblasts, 11 % when they contract), and the total is about 0.4 ng per 10⁶ cells per day. That leaves ~8 pg of *active* signal per 10⁶ cells per day, 45× less than the figure used before, and the default design now peaks 17× below the activation threshold. The panel says how far short you are, and a new help entry sets out the three sourced mechanisms that would close the gap — and why injecting more cells alone cannot.
- A secretion figure that was 2000× higher has been dropped: its paper could not be read past the abstract, so its assay and units are unverified.

- **A dermis with depth.** *Depth-dependent tissue* replaces the single slab: diffusion is slower near the dermal–epidermal junction, and clearance follows the local fibroblast density, which is higher in the papillary dermis. The decay length λ is then short at the top and full-length deeper down — the cross-section draws the real papillary boundary and the λ curve beside it, and Coverage reports the effective λ your design sees.
- **And it says when not to believe it.** The page folds the depth profile into one effective λ; the pipeline solves the layered problem properly and was used to measure the difference. For ordinary injection depths the reduction is within 10 % of the activation threshold (within 1 % below six decay lengths); within one decay length of the junction it is not, and Coverage now warns that the numbers are indicative there.
- Six new tissue values behind it, each with its source or marked as a placeholder: diffusion at the junction, the depth of the slow zone, the papillary thickness and cell density, and the chemical half-life that splits decay into uptake and chemistry — for the default values more than 99 % is uptake by cells.
- **The layer values are measured, and they change the answer.** The papillary dermis is 101 µm thick and holds eleven times the cell density of the reticular dermis in donors over 55. Because the cells that consume the signal are packed into that thin band, the reticular dermis is comparatively empty and the signal there travels about 20 % *further* than the single-slab model says — the opposite of what a "denser tissue, shorter range" intuition suggests.

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

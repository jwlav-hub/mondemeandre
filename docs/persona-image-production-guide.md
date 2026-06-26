# Monde Méandre — Persona Image Production Guide

Regeneration playbook for the twelve travel-persona portraits. This lives outside `travel-personas.json` on purpose: the JSON tells the app which file to load; this doc tells you (or a tool) how to remake a file if needed. Keep them separate so the build data stays lean.

Tool used: Nano Banana / image gen. Output saved to `images/personas/{id}.png`, matching the `image` paths in the JSON.

---

## The locked recipe (shared by all twelve)

Every portrait is the same system; only **casting, scene, facing, and accent/contrast** change per persona.

- **Format:** vertical 5:7 portrait.
- **Figure:** strict 90-degree side profile (NOT three-quarter), chest up, offset to one side facing across the frame.
- **Face:** sharply focused and photographic with real features and natural skin — never blurred, never hidden in smoke. Lit mainly by a cool rim light along the profile edge, with the front of the face in soft shadow. Features pleasant but ordinary and non-distinctive — an "everyperson" any viewer could project themselves onto. Anonymity comes from *strict profile + shadowed front + low-key light*, never from blur.
- **Expression:** calm, serene, quietly anticipatory — pleasant, a faint trace of a smile, eyes forward with interest. Explicit guardrail: NOT sad, NOT grim, NOT worried. (Travel is meant to feel good.) The three social personas — Fast Friend, Culture Driven, Nightlifer — get a fuller, soft genuine smile.
- **Double exposure, TWO zones:**
  - **Hair zone:** the scene appears ONLY within the shape of the hair itself, contained inside the silhouette, fading to empty cool-gray background at the hair's edge. Nothing breaks above or beyond the head's outline. (This was the key fix — uncontained hair scenes look like "stuff erupting from the head.")
  - **Body & shoulder zone:** the persona's scene, spilling BEYOND the silhouette's edge into the open frame. Only the body breaks the frame; the head keeps a clean, complete silhouette.
- **Rendering:** cinematic Leica-style photography — rich blacks, deep controlled shadows, high micro-contrast, fine natural grain, crisp realistic detail, true photographic look (not painterly, not hazy). Cool, restrained palette of desaturated blue and slate-gray with cool silver highlights.
- **Accent:** a single warm note (usually amber-red) as the only warm element against the cool base. Intensity/temperature varies by quadrant (see below). Nightlifer is the one exception — electric cool neon instead of warm.
- **Always:** no text, no logos, no watermarks, no readable characters on signage (keeps personas country-neutral and avoids trademark marks like Michelin).

### Mood / accent by quadrant
- **Contemplative (inward/mind)** — Literary Observer, Self Discoverer, Philosophical Drifter, Camera Eye: softer, higher-key, lower-contrast; dim/muted warm accent (Self Discoverer the most near-monochrome).
- **Social & sensory (outward/body)** — Street-Food Wanderer, Fearless Eater, Fast Friend, Adventurer, Nightlifer: punchier contrast, more present accent.
- **Restful (inward/body)** — Restorative: smoothest, lowest-contrast, soft diffuse warm candle glow.
- **Engaged/cultural (outward/mind)** — Culture Driven: rich, characterful, moderate-strong contrast.
- **Aspirational** — Luxury Curator: smooth, restrained, elegant contrast; soft warm candlelight.

### Casting & facing map
6 men / 6 women, broad ethnic range, alternating facing for grid rhythm (odd = faces left, even = faces right).

| # | Persona | Casting | Faces |
|---|---|---|---|
| 1 | Street-Food Wanderer | Man, East/SE Asian read, 30s | left |
| 2 | Fearless Eater | Chinese woman, late 20s–30s | right |
| 3 | Literary Observer | White man, early 40s | left |
| 4 | Philosophical Drifter | White man, 30s | right |
| 5 | Self Discoverer | East Asian woman, late 20s | left |
| 6 | Camera Eye | Black woman, 30s | right |
| 7 | Fast Friend | Latino man, 30s | left |
| 8 | Luxury Curator | White woman, late 30s–40s | right |
| 9 | Adventurer | Black man, athletic, 30s | left |
| 10 | Restorative | Middle Eastern woman, 30s | right |
| 11 | Culture Driven | South Asian man, 30s | left |
| 12 | Nightlifer | SE Asian / mixed-race woman, 20s | right |

---

## Per-persona scene summary

Full prompts were generated per persona using the recipe above. Scene cores for quick regeneration:

1. **Street-Food Wanderer** — night street-food alley: unbranded stall, charcoal grill, single steaming noodle bowl, strung lanterns, plastic stools, wet street trailing off. Hair: market lane into night sky. Accent: one red lantern.
2. **Fearless Eater** — adventurous night market: skewered grilled critters, spiky durian, seafood on crushed ice (crab, squid), wok flame, steam. Hair: market lane + moon. Accent: red lantern / wok flame. Punchy contrast.
3. **Literary Observer** — slow-train interior: rain-streaked window seat, passing countryside, open notebook + cup. Hair: misty railway platform, wires, receding tracks. Accent: dim reading lamp. Soft, higher-key.
4. **Philosophical Drifter** — open winding coastal road at golden hour, rucksack, rolling hills, lone walker. Hair (CONTAINED): faint winding road through hills. Accent: soft setting-sun glow. Airy.
5. **Self Discoverer** — tranquil temple courtyard at dawn: stone path, still water, lone meditator, incense curl. Hair: misty mountains + temple roof. Accent: very dim candle/ember. Softest, near-monochrome.
6. **Camera Eye** — candid street tableau: vendor's hands, passersby in motion, doorway, characterful light. Hair: narrow street of leaning buildings. Accent: warm street lamp / shop window. Moderate contrast.
7. **Fast Friend** — warm communal feast: long shared table, raised glasses mid-toast, platters, string lights. Hair: lively evening street with festival lights. Accent: larger warm string-light glow. Soft genuine smile.
8. **Luxury Curator** — fine dining: beautifully plated dish, glass of wine, candlelight, luxurious terrace + view. Hair (CONTAINED): subtle elegant dusk skyline. Accent: soft candlelight-gold. Smooth elegant contrast.
9. **Adventurer** — alpine ridge at first light: switchback trail, dark pines, glacial lake/waterfall, rugged terrain. Hair: misty mountain peak + fading stars. Accent: dawn-gold on peak. Bold high-energy contrast. Athletic build / technical shell + pack strap.
10. **Restorative** — tranquil hot-spring/spa: steaming water, smooth stones, candles, towels, tea set, quiet garden. Hair: misty mountains + rising steam. Accent: soft diffuse candle glow. Lowest contrast, soothing.
11. **Culture Driven** — local festival: hanging lanterns, colorful textiles, ornate heritage architecture, lively heritage street (generic/non-specific). Hair: heritage spires into evening sky. Accent: warm lantern/festival glow. Rich contrast. Soft genuine smile.
12. **Nightlifer** — buzzing after-dark district: neon signs, rooftop bar, lively crowd in silhouette, light trails on wet street. Hair: neon skyline. Accent: ELECTRIC cool neon (cyan + touch of magenta) — the one warm-accent exception. Highest, punchiest contrast. Soft genuine smile.

---

## Key fixes learned during production (apply on any regen)
- **Anonymity = strict profile + shadowed front + low-key light**, never blur. Blurred faces look unfinished and unreal.
- **Don't over-darken the mood** — a moody palette drifts somber unless the expression is actively warmed ("calm, serene, anticipatory; NOT sad/grim").
- **Contain the hair-zone scene** inside the hair silhouette; only the body breaks the frame. Otherwise scenes erupt above the head.
- **Casting must be specified** per image or the model defaults to the same young dark-haired man every time.
- **Suppress signage text** or country-specific script to keep personas universal and trademark-clean.

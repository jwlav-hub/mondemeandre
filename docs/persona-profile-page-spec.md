# Monde Méandre — Persona Profile Page Build Spec

Direction for Claude Code to build the persona profile/matrix page. Reads from `travel-personas.json`. Two parts: an interactive **two-axis matrix plot** of all twelve personas, and a **detail panel** that expands the selected persona.

---

## 1. Purpose & layout

A page where a visitor sees all twelve personas plotted on the brand's two-axis "kind of traveler" map, and can click any one to read its full profile. It doubles as an explainer for the persona system and a richer alternative to the selector card grid.

**Desktop:** two columns — matrix plot on the left (~55% width), detail panel on the right (~45%). Selecting a dot updates the right panel.

**Mobile:** stacked — matrix plot on top (full width, square), detail panel below it. Selecting a dot scrolls the panel into view.

---

## 2. The matrix plot

**Axes** (labels come from the JSON `matrix.axes` block):
- X: left = "Mind · meaning · reflection", right = "Body · senses · doing"
- Y: top = "Outward · high-energy · social", bottom = "Inward · low-energy · solitary"

Draw a faint crosshair through the center (x=0, y=0) and the four quadrant labels (`matrix.quadrants`) in the corners, low-contrast so they sit behind the dots.

**Plotting each persona** from its `matrix.x` and `matrix.y` (both range −100…+100):

```
leftPercent = (x + 100) / 2          // -100 → 0%, +100 → 100%
topPercent  = (100 - y) / 2          // +100 → 0% (top), -100 → 100% (bottom)
```

Each persona renders as a **dot** at that position. On hover/focus, show the persona `name`. On click, mark it selected and populate the detail panel. The selected dot enlarges and gets the Falu-red accent ring.

**Dot treatment:** small circular thumbnail of the persona image (cropped to the rim-lit face) is ideal — it makes the plot itself beautiful and on-brand. Fallback if that's too heavy: a simple filled dot. Selected state: scale up ~1.4×, Falu-red (#7F1D1A) ring, subtle glow.

**Collision note:** the outward/body cluster (Street-Food Wanderer, Fearless Eater, Fast Friend, Adventurer, Nightlifer) sits close together in the upper-right. Nudge overlapping dots a few px apart, or slightly jitter, so all stay clickable. Don't change the underlying data — only the render offset.

---

## 3. The detail panel

On select, show for that persona:
- `image` — the full portrait (5:7), as the panel's hero
- `name` — heading
- `descriptor` — the three words, joined with ` · `, small-caps
- `tagline` — italic, beneath the name
- `body` — the card write-up
- `extended` — the longer profile write-up *if present* (you'll fill these in later; render only when non-empty)
- `foodWeighting` — as a small tagged line, e.g. "Food lean: …" (optional, nice-to-have)
- a "Use this persona" button that routes into the planner with this persona preselected as primary

Default state (nothing selected yet): show a short intro line and prompt the visitor to pick a dot, or default-select persona `order: 1`.

---

## 4. Styling

Match the new image aesthetic and the site brand:
- **Palette:** cool desaturated blue-gray base (matches the portraits), with **Falu red #7F1D1A** as the single accent (selected ring, button, key lines) — mirrors the "one warm note" logic of the images.
- **Background:** pale cool-gray, soft and gallery-like. Let the portraits supply the color.
- **Typography:** the site's existing display face for names, clean sans for body. Descriptors in tracked small-caps.
- **Motion:** if Framer Motion is in the stack, animate dot hover (scale), selection (ring draw), and panel content (fade/slide on change). Keep it subtle and elegant, not bouncy.

---

## 5. Reference component (adapt to the repo's stack/styling)

```jsx
import { useState } from "react";
import { motion } from "framer-motion";
import data from "../data/travel-personas.json";

const FALU = "#7F1D1A";

export default function PersonaMatrix() {
  const personas = [...data.personas].sort((a, b) => a.order - b.order);
  const [selectedId, setSelectedId] = useState(personas[0].id);
  const selected = personas.find((p) => p.id === selectedId);
  const { axes, quadrants } = data.matrix;

  const pos = (m) => ({
    left: `${(m.x + 100) / 2}%`,
    top: `${(100 - m.y) / 2}%`,
  });

  return (
    <div className="persona-matrix-page">
      {/* PLOT */}
      <div
        className="matrix-plot"
        style={{
          position: "relative",
          aspectRatio: "1 / 1",
          background: "#EDEFF2",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {/* crosshair */}
        <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "rgba(40,55,71,0.15)" }} />
        <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "rgba(40,55,71,0.15)" }} />

        {/* axis labels */}
        <span style={axisLabel("top")}>{axes.y.positive}</span>
        <span style={axisLabel("bottom")}>{axes.y.negative}</span>
        <span style={axisLabel("left")}>{axes.x.negative}</span>
        <span style={axisLabel("right")}>{axes.x.positive}</span>

        {/* quadrant labels (low contrast, behind dots) */}
        <span style={quadLabel("tl")}>{quadrants.outward_mind}</span>
        <span style={quadLabel("tr")}>{quadrants.outward_body}</span>
        <span style={quadLabel("bl")}>{quadrants.inward_mind}</span>
        <span style={quadLabel("br")}>{quadrants.inward_body}</span>

        {/* dots */}
        {personas.map((p) => {
          const isSel = p.id === selectedId;
          return (
            <motion.button
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              title={p.name}
              aria-label={p.name}
              whileHover={{ scale: 1.25 }}
              animate={{ scale: isSel ? 1.4 : 1 }}
              style={{
                position: "absolute",
                ...pos(p.matrix),
                transform: "translate(-50%, -50%)",
                width: 44,
                height: 44,
                borderRadius: "50%",
                padding: 0,
                cursor: "pointer",
                border: isSel ? `3px solid ${FALU}` : "2px solid rgba(255,255,255,0.7)",
                boxShadow: isSel ? `0 0 16px ${FALU}55` : "0 2px 6px rgba(0,0,0,0.25)",
                backgroundImage: `url(${p.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center top",
                zIndex: isSel ? 5 : 1,
              }}
            />
          );
        })}
      </div>

      {/* DETAIL PANEL */}
      <motion.aside
        key={selected.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="matrix-detail"
      >
        <img src={selected.image} alt={selected.name} style={{ width: "100%", borderRadius: 10 }} />
        <h2>{selected.name}</h2>
        <p style={{ letterSpacing: "0.08em", textTransform: "uppercase", fontSize: 12, opacity: 0.7 }}>
          {selected.descriptor.join(" · ")}
        </p>
        <p style={{ fontStyle: "italic", color: FALU }}>&ldquo;{selected.tagline}&rdquo;</p>
        <p>{selected.body}</p>
        {selected.extended && <p>{selected.extended}</p>}
        <button style={{ background: FALU, color: "#fff", border: 0, padding: "10px 18px", borderRadius: 8, cursor: "pointer" }}>
          Use this persona →
        </button>
      </motion.aside>
    </div>
  );
}

// helper styles
function axisLabel(side) {
  const base = { position: "absolute", fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(40,55,71,0.55)", whiteSpace: "nowrap" };
  if (side === "top") return { ...base, top: 8, left: "50%", transform: "translateX(-50%)" };
  if (side === "bottom") return { ...base, bottom: 8, left: "50%", transform: "translateX(-50%)" };
  if (side === "left") return { ...base, left: 8, top: "50%", transform: "translateY(-50%) rotate(-90deg)", transformOrigin: "left center" };
  return { ...base, right: 8, top: "50%", transform: "translateY(-50%) rotate(90deg)", transformOrigin: "right center" };
}
function quadLabel(corner) {
  const base = { position: "absolute", fontSize: 13, fontWeight: 600, color: "rgba(40,55,71,0.18)", padding: 12, maxWidth: 140 };
  if (corner === "tl") return { ...base, top: 0, left: 0 };
  if (corner === "tr") return { ...base, top: 0, right: 0, textAlign: "right" };
  if (corner === "bl") return { ...base, bottom: 0, left: 0 };
  return { ...base, bottom: 0, right: 0, textAlign: "right" };
}
```

CSS to add (or translate to the repo's system): `.persona-matrix-page` is a two-column grid on desktop (`grid-template-columns: 55% 45%`, gap 32px, align-items start) and a single column on mobile (stack, plot first). The plot already self-sizes via `aspect-ratio: 1/1`.

---

## 6. Notes
- Plot coordinates are intrinsic to the data — if you ever rebalance a persona, just change its `matrix.x/y` in the JSON and the dot moves; no layout edit needed.
- The `extended` fields are currently empty; the panel must render gracefully without them and simply show `body` until they're filled.
- Keep the page reading from the JSON only — same single source of truth as the selector.

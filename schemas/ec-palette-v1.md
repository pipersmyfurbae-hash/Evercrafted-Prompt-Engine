# EC_PALETTE_V1 — Canonical Palette Schema

**Purpose:** Single source of truth for color across Evercrafted. Reconciles the
Color Theme Generator's **7 functional roles** with EC_WR_V2's **60-30-10 + greenery**
proportional model so there is exactly one palette truth, not two.

**Status:** Proposed — pending ratification + wiring into EC_WR_V2 (Gap G5).

---

## The reconciliation (why both old schemas were "right")

| Model | What axis it describes |
|---|---|
| Color Generator's 7 roles (`primary_bloom`, `foliage`, …) | **Functional** — which material/element carries each color |
| EC_WR_V2's `primary_60 / secondary_30 / accent_10 / greenery` | **Proportional** — how much visual field each color occupies |

These are orthogonal. EC_PALETTE_V1 keeps the **7 functional roles as the truth** and
tags each with a **proportion tier**. The 60-30-10 block is then *derived*, never authored.

---

## Schema

```json
{
  "schema": "EC_PALETTE_V1",
  "name": "human palette name",
  "register": "emotional register (e.g. 'quiet, dusk-lit, nostalgic')",
  "roles": {
    "primary_bloom":   { "hex": "#XXXXXX", "label": "color name", "note": "usage note", "tier": "dominant_60",  "greenery": false, "elements": ["species carrying this color"] },
    "secondary_bloom": { "hex": "#XXXXXX", "label": "color name", "note": "usage note", "tier": "secondary_30", "greenery": false, "elements": [] },
    "neutral_base":    { "hex": "#XXXXXX", "label": "color name", "note": "usage note", "tier": "secondary_30", "greenery": false, "elements": [] },
    "foliage":         { "hex": "#XXXXXX", "label": "color name", "note": "usage note", "tier": "greenery",     "greenery": true,  "elements": [] },
    "accent":          { "hex": "#XXXXXX", "label": "color name", "note": "usage note", "tier": "accent_10",    "greenery": false, "elements": [] },
    "contrast":        { "hex": "#XXXXXX", "label": "color name", "note": "usage note", "tier": "accent_10",    "greenery": false, "elements": [] },
    "texture":         { "hex": "#XXXXXX", "label": "color name", "note": "usage note", "tier": "accent_10",    "greenery": false, "elements": [] }
  },
  "mj": "midjourney color phrase, ready to drop into a prompt"
}
```

Per-role fields: `hex`, `label`, `note` come straight from the Color Generator output.
`tier` and `greenery` are fixed per role (table below). `elements` (species) is filled
later by the Species / Inventory layer — empty at color-generation time.

---

## Role → Tier mapping (fixed)

| Functional role | Proportion tier | In EC_WR_V2 it lands in |
|---|---|---|
| `primary_bloom` | `dominant_60` | `palette.primary_60` |
| `secondary_bloom` | `secondary_30` | `palette.secondary_30` (headline) |
| `neutral_base` (filler) | `secondary_30` | `palette.secondary_30.elements` |
| `foliage` | `greenery` | `palette.greenery` |
| `accent` | `accent_10` | `palette.accent_10` (headline) |
| `contrast` | `accent_10` | `palette.accent_10.details` |
| `texture` | `accent_10` | `palette.accent_10.details` |

> Judgment call to ratify: `neutral_base` is treated as supporting mass (`secondary_30`).
> If your build practice puts filler in the dominant field instead, flip it to `dominant_60` —
> change it in ONE place (the transform), not per-design.

---

## Derived view → EC_WR_V2.palette

EC_WR_V2 keeps its existing 60-30-10 + greenery block **unchanged** for the Prompt Compiler
and human display. It is computed from EC_PALETTE_V1 by `toEcWrV2Palette()` (see
`palette-transform.js`). Because EC_WR_V2's `accent_10` is a single headline color but the
canonical has three detail colors (accent/contrast/texture), the transform adds a
non-breaking `accent_10.details[]` array so contrast + texture are never lost.

**Recommended EC_WR_V2 change (Gap G5):** store the full EC_PALETTE_V1 object on the
blueprint as `palette_source`, and keep `palette` (60-30-10) as the derived summary. That
makes the blueprint carry the truth while the compiler keeps reading the summary it already knows.

---

## Color rules (shared, enforced at generation)

Carried over from both sources — these are what make a palette a *usable wreath system*,
not just pretty colors:

1. Muted organic tones only. No neon.
2. `foliage` must read as believable greenery (not olive-brown, not sage-gray).
3. `neutral_base` stays genuinely neutral — cream / linen / champagne range.
4. `contrast` must be dramatically darker or richer than the blooms — a real tonal jump.
5. `accent` is a single emotional pop, distinct from both blooms.
6. Faux-only register: nothing should imply fresh/wet material (aligns with the render `--no` guard).

---

## Migration notes

- **Color Theme Generator:** rename output to emit this exact shape (it already uses 6 of
  the 7 keys). Then it becomes the canonical Layer-3 palette producer.
- **EC_WR_V2:** add `palette_source` (EC_PALETTE_V1) + compute `palette` via the transform.
- **Prompt Compiler:** no change required — it keeps reading `palette` (the derived 60-30-10).

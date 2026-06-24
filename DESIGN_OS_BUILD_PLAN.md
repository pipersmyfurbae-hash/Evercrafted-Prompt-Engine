# Evercrafted Design OS — Build Plan

**Status:** Draft for review · **Author:** Claude Code session · **Date context:** 2026-06-24
**Source spec:** Bret's "Evercrafted Developer Handoff" doc
**This repo:** `Evercrafted-Prompt-Engine` (currently = Layers 6–8: prompt → render)

---

## 0. Reality check (read this first)

The handoff doc describes **one clean system**. The GitHub account has **25 repositories**,
most of them parallel Evercrafted iterations. That sprawl is the single biggest risk to the
build — it is repository-level drift, and it means **there is no verified single source of truth**
for any layer yet.

Likely homes of the doc's components (UNVERIFIED — names/languages only):

| Doc component | Probable repo(s) | Lang |
|---|---|---|
| PIE / blueprint engine | `evercrafted-engine` | Python |
| `EvercraftedLayoutVisualizer` (PIE ground truth) | `Wreath-Visualizer-24-`, `Wreath-Visualizer-2` | TS |
| Emotion translator (Layer 2) | `Emotion-Engine` | HTML |
| BRC-1.1 compositor | `brc-proxy` | HTML |
| SaaS backend / frontend | `evercrafted-backend`, `evercrafted-frontend` | JS |
| Studio app (Layers 6–8 UI) | `Evercrafted-Full`, `evercrafted-studio-5-25`, `Evercrafted-Studio-Full-Site`, `Evercrafted-4-12`, `Evercrafted-2`, `todaysevercrafted`, `Evercrated-Studio-5-23` | TS/HTML |
| Brand | `Evercrafted-and-Moodoor` | TS |
| Prompt engine (this) | `Evercrafted-Prompt-Engine` | HTML |

**Nothing below can be finalized until these are read and the canonical repo per layer is chosen.**

---

## 1. BLOCKER — repository access

This session can only read `evercrafted-prompt-engine`. To plan and integrate accurately I need
the canonical repos added to the session (done from the Claude Code web environment settings).

Priority repos to grant access to, in order:
1. `evercrafted-engine` — verify it is the PIE / blueprint engine (R1–R18, Mulberry32, EC_WR_V2).
2. The newest full studio — `evercrafted-studio-5-25` or `Evercrafted-Full` — likely the most complete pipeline.
3. `Wreath-Visualizer-24-` — the doc's stated PIE ground truth.
4. `Emotion-Engine` — Layer 2.
5. `brc-proxy` — BRC-1.1.
6. `evercrafted-backend` — persistence / API.

**Until access is granted, every "what exists" claim is the doc's, not verified.**

---

## 2. Conflicts to reconcile (decide before building)

1. **Aspect ratio.** Doc default `--ar 5:4`; you instructed wreaths must be `1:1`. Pick one canonical default.
2. **Negatives.** Doc uses prose ("No fresh flowers…") + a validator that checks for that phrase.
   Empirically Midjourney obeys `--no` far more reliably (your V7 render proved it). Recommend:
   keep `--no` as the enforcement, treat prose as secondary. Update doc + PCValidator accordingly.
3. **Params.** Doc locks `--s 150 --q 2`, no `--chaos`; current app uses `--s 100/50 --chaos`.
   Reconcile the canonical parameter set.
4. **Cardinal Rule vs. current AI.** The doc says Claude outputs **emotion tags only**. The current
   app's Configure / Story Mode / "AI Design Full Collection" have Claude choosing composition,
   palette, and florals. Strict adherence means **re-scoping those features** so AI stops at tags and
   the PIE/species layer makes the design decisions. This is a product decision, not a refactor detail.
5. **Where this repo fits.** Decide: does `Evercrafted-Prompt-Engine` become the Layer 6–8
   prompt/render surface driven by blueprints, or is it superseded by a studio repo? It cannot stay
   a freeform prompt builder AND be blueprint-first.

---

## 3. Target architecture decision (needed early)

Two viable shapes:

- **A — Consolidate into one repo (recommended).** Pick/forge a single canonical monorepo
  (engine + schemas + studio UI + validators). Retire the other 20+ to archive. Highest up-front
  cost, eliminates drift permanently.
- **B — Federated with contracts.** Keep engine, compositor, studio as separate services bound by the
  doc's Integration Contracts (§16). Lower up-front cost, ongoing drift risk, needs strict versioning.

Recommendation: **A**, because the 25-repo sprawl proves federation hasn't held.

---

## 4. Phased plan

Effort = engineering time *after* access + canonical-repo decision. Ranges reflect unknown code state.

### Phase 0 — Consolidate & establish ground truth  **(BLOCKING, ~2–4 days)**
- Read the priority repos; produce a verified "what exists / where / what state" map vs. the doc.
- Choose canonical repo per layer; pick architecture A or B.
- Reconcile the §2 conflicts; update the handoff doc to match reality (doc says code is ground truth).
- Output: verified component map + consolidation decision + reconciled doc.

### Phase 1 — Reproducibility foundation  **(P0, ~1 day)**  *(doc Fixes 2, 3, 7)*
- Seed Lock Protocol — schema fields + convention.
- Prompt Version Log — append-only JSON sidecar per blueprint.
- Blueprint↔Prompt hash linkage — detect silent divergence.
- *Why first:* makes every later change measurable. Low risk, high leverage.
- *Depends on:* knowing where blueprints are stored.

### Phase 2 — Prompt integrity  **(P0/P1, ~2–3 days)**  *(doc Fixes 1, 4, 5, 6)*
- Prompt Constitution Validator (PASS/WARN/FAIL before MJ dispatch).
- 12 per-formula locked scaffolds.
- EC_WR_V2.1 physical-layer translation (z_depth, rotation, attachment_type).
- Species Reliability Registry + isolation-test protocol.

### Phase 3 — Pipeline assembly  **(the big lift, ~1–3 weeks, depends on code state)**
- Wire Layers 1–8 end to end in the canonical app:
  Intake → Emotion (Claude, **tags only**) → Species/Palette → Blueprint (PIE) → BSRE → Prompt
  Compiler → PCValidator → Midjourney v7.
- Integrate the "exists elsewhere" pieces under the chosen architecture.
- Enforce the Cardinal Rule at the API boundary (system prompt + output schema = tags only).

### Phase 4 — Outputs & optional  **(ongoing)**
- Build-guide PDF, Etsy copy, Shopify CSV, SVG canvas.
- BRC-1.1 deterministic compositor (`brc-proxy`) into main workflow.
- Upgrade Impact Gate as process doc, then UI.

---

## 5. Immediate next actions

1. **You:** add the Phase 0 priority repos (§1) to this session, or tell me which repo is canonical.
2. **You:** rule on the §2 conflicts (at minimum: 1:1 vs 5:4, and whether to enforce the Cardinal
   Rule strictly — which determines whether the current AI features survive as-is).
3. **Me (once access):** read the priority repos, replace this doc's "probable/UNVERIFIED" tables with
   verified facts, and turn Phase 0 into concrete tickets.

---

## 6. What is already done in THIS repo (relevant to the plan)

`Evercrafted-Prompt-Engine` currently implements a working Layer 6–8 prompt/render surface:
- Studio + Collection + Lifestyle + Lookbook, Supabase Claude proxy, ElevenLabs, save/restore.
- Prompts already use `--v 7`, `1:1` for wreaths, `--no` faux/text guards, intact-ring + no-text fixes.
- This is the closest thing to a working "prompt compiler + render" UI — a candidate to become the
  canonical Layer 6–8 surface IF it's refactored to consume blueprints instead of freeform fields.

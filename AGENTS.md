# AGENTS.md — NIKKE Buff Atlas

This file defines protected project invariants and development rules for AI agents.
Do not modify any existing source code, data, tests, schemas, or configuration except as explicitly tasked.

## 0. Authoritative specification

- Read `README.md` as the authoritative project specification.
- Inspect the existing implementation before modifying it.
- Prefer extending existing schemas / rules / pipelines over creating parallel systems.
- Do not remove existing safety mechanisms without explicit justification.

## 1. Protected baseline (verified)

Treat the following as the protected starting point for future work:

- Project: NIKKE Buff Atlas
- Parser version: 4.2.2
- Characters: 199
- Structured records: 1,391
- Comparison effects: 991
  - buff: 898
  - heal: 90
  - revive: 3
- Comparison excluded: 400
  - non-buff-effects: 377
  - metadata-only-effects: 23
- needs_review: exactly 1
  - iDoll Sun (nikke-308), Skill 2 section-0
- Current test suite: 257/257 passing

If a task would change any of these invariants, explicitly report the expected impact before making the change.

## 2. Data rules

- Raw Skill Lv.10 values only.
- Never guess missing values.
- Primary source is NIKKE.GG.
- Nikke Explorer is supplementary and only fills missing NIKKE.GG skill slots.
- Preserve per-effect source metadata (`source_type`, `source_url`, `source_checked_at`, `source_skill_text`, `source_skill_hash`).
- Preserve source conflicts and review states.
- Keep distinct semantic concepts distinct (e.g. `atk` vs `caster_atk_based_atk` vs `attack_damage`; caster vs reference scaling; direct healing vs healing potency vs shield).
- One semantic effect per record.
- Do not introduce effective DPS, uptime, tier, or derived combat calculations into the raw dataset.
- Release dates must be sourced; unknown dates remain `null` (never derive from article dates, source IDs, or event dates).

## 3. Comparison boundary

- `data/effects.json` contains only comparison-eligible buff/heal/revive effects.
- Damage, debuff, penalty, resource, weapon_state, special_mechanic, and metadata-only records must remain outside the comparison dataset unless the existing project rules explicitly classify them otherwise.
- Do not weaken the existing comparison boundary.
- Unreviewed / `needs_review` effects must not enter the comparison dataset.
- Effect ID sets for comparison, excluded, and metadata records must never overlap.

## 4. Update pipeline

Use the existing pipeline; do not invent a parallel one:

- `npm run update-data`
- `npm run update-data -- --dry-run`
- `npm run update-data -- --full`
- `npm run update-data -- --dry-run --offline`
- `npm run verify-data`
- `npm test`
- `npm run build`

Purpose:

- `update-data -- --dry-run`: online fetch, raw diff, parse, audits, candidate tests/build, report to `outputs/update-reports/`; canonical `data/` unchanged.
- `update-data`: incremental source classification; atomic commit only if all quality gates pass.
- `update-data -- --full`: full Explorer audit/rebuild.
- `update-data -- --dry-run --offline`: reproducibility check from saved raw cache.
- `verify-data`: network-free canonical audit (schema, Unknown/positive audits, comparison boundary, effect IDs, regression tests, production build).

## 5. Quality gates

- Do not bypass validation, regression tests, schema checks, stable ID checks, suspicious update protection, manual override protection, or review-decision protection.
- Never automatically overwrite manual overrides (`manual_override: true`).
- Never automatically discard review decisions in `data/review-decisions.json`; stale decisions are quarantined, not deleted.
- Any parser/data change must pass the full test suite and production build before being considered complete.
- Keep changes minimal and preserve existing behavior unless the task explicitly requires otherwise.

## 6. Unresolved review

- iDoll Sun (nikke-308) Skill 2 section-0 remains unresolved and must not be guessed or silently normalized.
- Preserve its `needs_review` state and source text until an explicit human decision resolves it.

## 7. Important

- The current baseline is verified and must be treated as the protected starting point for future work.
- If a task would change any invariant in Section 1, explicitly report the expected impact before making the change.

# Parser v4.2.2 — Human Review Final Resolution

> NIKKE.GGを第一ソース、保存済みNikke Explorer監査原文を第二ソースとして17節を照合。原文にない情報は推測せず `source_limitations` に保存しています。

## Result

- Review対象: 17 sections
- 解決: 16 sections
- 解決（source limitationなし）: 3 sections
- 解決（source limitationあり）: 13 sections
- 未解決: 1 section（nikke-308:Skill 2:section-0）
- effects: 971 → 991
- needs_review: 17 → 1

## Source audit

- Nikke Explorer確認: 17 sections
- Nikke Explorer補完: 0 sections
- source limitation occurrences: 18（公開effect 17 / 未解決review 1）
- trigger_not_stated: 15
- target_not_stated: 1
- duration_not_stated: 1
- end_condition_not_fully_stated: 1

## Schema additions

- New buff types: `reference_atk_based_atk`, `reference_max_hp_based_max_hp`, `shared_shield`
- Reference-stat effects: 3
- Source omissions are separate from parser ambiguity via `source_limitations`.

## Remaining human review

### iDoll Sun

Skill 2 · Sunlight

```text
There is a 20% chance of activating when attacked. 
ATK ▲ 9.09% for 5 sec.
```

- needs_review_reasons: ambiguous_target
- source_limitations: target_not_stated
- resolution blocker: target scope is required for SELF/ALLY comparison

## Dataset validation

- characters: 199
- effects: 991
- comparison effects: 991
- Unknown Buff Type: 0
- unrecognized positive candidates: 0


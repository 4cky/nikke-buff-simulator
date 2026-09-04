# Review Audit v4.2 — Residual 141

Generated: 2026-08-29T16:23:10.444Z

> read-only監査です。effects、review decisions、manual_override、parserは変更していません。各Review節はA〜Dのいずれか1つにのみ割り当てています。

## Summary

- total review sections: 141
- total review occurrences: 206
- blocking candidate occurrences: 165
- A: 64
- B: 0
- C: 60
- D: 17
- normalized patterns: 124
- human judgement required characters: 17

### Reason counts

| Reason | Review sections | Candidate occurrences |
|---|---:|---:|
| ambiguous_target | 41 | 45 |
| ambiguous_value | 22 | 23 |
| missing_value | 10 | 10 |
| parser_failure | 19 | 27 |
| ambiguous_trigger | 13 | 18 |
| ambiguous_duration | 6 | 6 |
| special_mechanic | 48 | 57 |
| not_a_buff_candidate | 12 | 12 |

## Auto-resolvable

64 review sections / 106 candidate occurrences

| Cause group | Sections | Candidates | Characters |
|---|---:|---:|---|
| special_or_scaling_grammar | 8 | 16 | Anchor: Innocent Maid, Chisato, E.H., Emma: Tactical Upgrade, Mast: Romantic Maid, Rapi: Red Hood, Sakura, Trony |
| allies_by_named_state | 7 | 7 | Crust, Mast: Romantic Maid, Rei Ayanami (Tentative Name), Snow Crane |
| 通常stat増減行をsection context付きchild effectへmaterializeできていません。 | 6 | 8 | iDoll Sun, Privaty, Product 12, Scarlet, Viper, Yuni |
| self_in_condition | 4 | 4 | Delta: Ninja Thief, Diesel: Winter Sweets, Raven |
| all_allies_except_caster | 3 | 4 | Maiden: Ice Rose, Queen (Makoto), Yukiko |
| caster_and_adjacent_allies | 3 | 4 | Flora, Rouge |
| parent_duration_inheritance | 3 | 8 | Ada, Emilia, K |
| random_ally_cover_destroyed | 3 | 4 | Biscuit, Lily |
| class_limited_allies | 2 | 2 | Quiry |
| element_and_weapon_limited_allies | 2 | 2 | Ark Ranger Black, Trina |
| incapacitated_ally_highest_atk | 2 | 2 | Mana, Rapunzel |
| max ammunition capacity decrease(句読点・注記を含む)のstat grammarに未対応です。 | 2 | 5 | Anis: Sparkling Summer, K |
| same_squad_allies | 2 | 10 | Emma: Tactical Upgrade, Eunhwa: Tactical Upgrade |
| all_allies | 1 | 1 | D |
| attack-damage基準のhealing conversion文法に未対応です。 | 1 | 1 | Signal |
| boolean grantとbattle内activation limitを併記する複合文法に未対応です。 | 1 | 3 | Neon: Vision Eye |
| branch_condition_can_supply_trigger_context | 1 | 2 | Elegg: Boom and Shock |
| burst_stage_ally_lowest_atk | 1 | 1 | Liberalio |
| caster_and_allies_lower_stat | 1 | 1 | Anis: Star |
| caster_cover | 1 | 1 | Bay |
| explicit_trigger_parser_missing | 1 | 1 | Tove |
| named state/headingだけのmetadata行をeffectから分離できていません。 | 1 | 4 | EVE |
| named_or_current_target | 1 | 1 | Soline: Frost Ticket |
| numeric valueを持たないdamage-share grant文法に未対応です。 | 1 | 2 | Bay |
| numeric_role_grammar | 1 | 2 | Modernia |
| shield objectをtargetにするboolean invulnerability文法に未対応です。 | 1 | 2 | Label |
| shots/roundsを持続単位として扱うstat buff文法に未対応です。 | 1 | 2 | Eunhwa |
| targets_by_named_state | 1 | 1 | Crust |
| tier/branch prefixの後にnamed boolean effectが続く文法に未対応です。 | 1 | 4 | Chisato |
| until_condition | 1 | 1 | Cinderella |

### 1. Viper

Skill 2 · Snake Scale

- review_key: `nikke-112:Skill 2:section-0`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `通常stat増減行をsection context付きchild effectへmaterializeできていません。`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects self.
Hit Rate ▲ 3.43% continuously.
```

#### Candidate 1

```text
Hit Rate ▲ 3.43% continuously.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | hit_rate |
| modifier_type | increase |
| value / unit | 3.43 / percent |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | 継続 (— continuous; continuous) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | parser_failure |


### 2. E.H.

Skill 1 · Homemade Magazine

- review_key: `nikke-113:Skill 1:section-0`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `special_or_scaling_grammar`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates when obtaining 10 Scrap(s) while having fewer than 4 homemade magazines crafted. Affects self.
Function: Crafts magazines out of Scraps and gains a buff.
Effect 1: Removes Scrap(s).
Effect 2: Crafts 1 homemade magazine, up to a maximum of 4. This effect is continuous.
Effect 3: ATK ▲ 7.5% continuously x the number of homemade magazines.
```

#### Candidate 1

```text
Effect 3: ATK ▲ 7.5% continuously x the number of homemade magazines.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | atk |
| modifier_type | increase |
| value / unit | 7.5 / percent |
| target / target_type | self. / self |
| trigger | Activates when obtaining 10 Scrap(s) while having fewer than 4 homemade magazines crafted |
| condition | Activates when obtaining 10 Scrap(s) while having fewer than 4 homemade magazines crafted. Affects self.<br>Crafts magazines out of Scraps and gains a buff. |
| duration | 継続 (— continuous; continuous) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | special_mechanic |


### 3. Anis: Sparkling Summer

Burst · Sparkling Wave

- review_key: `nikke-15:Burst:section-0`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `max ammunition capacity decrease(句読点・注記を含む)のstat grammarに未対応です。`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects self.
Max Ammunition Capacity ▼ 73.92% for 10 sec.
Reload Speed ▲ 27.72% for 10 sec.
Elemental Advantage Attack Damage ▲ 42.24% for 10 sec.
```

#### Candidate 1

```text
Max Ammunition Capacity ▼ 73.92% for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | self. / self |
| trigger | Burst Skill activation |
| condition | Affects self. |
| duration |  (— ; unknown) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | parser_failure |

#### Candidate 2

```text
Reload Speed ▲ 27.72% for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | reload_speed |
| modifier_type | increase |
| value / unit | 27.72 / percent |
| target / target_type | self. / self |
| trigger | Burst Skill activation |
| condition | Affects self. |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | (resolved sibling) |

#### Candidate 3

```text
Elemental Advantage Attack Damage ▲ 42.24% for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | elemental_advantage_damage |
| modifier_type | increase |
| value / unit | 42.24 / percent |
| target / target_type | self. / self |
| trigger | Burst Skill activation |
| condition | Affects self. |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | (resolved sibling) |


### 4. Rapi: Red Hood

Skill 2 · Attachable Projectiles

- review_key: `nikke-16:Skill 2:section-0`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `special_or_scaling_grammar`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates at the start of battle. Affects self.
Converts damage to Elemental Advantage damage against Electric Code enemies. This effect is continuous and cannot be removed.
Projectile Attachment Damage ▲ 150.72% continuously.
Projectile Explosion Damage ▲ 100.6% continuously.
```

#### Candidate 1

```text
Converts damage to Elemental Advantage damage against Electric Code enemies. This effect is continuous and cannot be removed.
```

| Field | Current value |
|---|---|
| effect_type | special_mechanic |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | self. / self |
| trigger | Activates at the start of battle |
| condition | Activates at the start of battle. Affects self. |
| duration | 継続 (— ; unknown) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | special_mechanic |

#### Candidate 2

```text
Projectile Attachment Damage ▲ 150.72% continuously.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | projectile_attachment_damage |
| modifier_type | increase |
| value / unit | 150.72 / percent |
| target / target_type | self. / self |
| trigger | Activates at the start of battle |
| condition | Activates at the start of battle. Affects self. |
| duration | 継続 (— continuous; continuous) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | (resolved sibling) |

#### Candidate 3

```text
Projectile Explosion Damage ▲ 100.6% continuously.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | projectile_explosion_damage |
| modifier_type | increase |
| value / unit | 100.6 / percent |
| target / target_type | self. / self |
| trigger | Activates at the start of battle |
| condition | Activates at the start of battle. Affects self. |
| duration | 継続 (— continuous; continuous) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | (resolved sibling) |


### 5. Yuni

Skill 1 · DMNS

- review_key: `nikke-160:Skill 1:section-0`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `通常stat増減行をsection context付きchild effectへmaterializeできていません。`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"all_allies","target_type":"all_allies","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects all allies. Activates when entering Full Burst.
Charge Speed ▲ 8.97% for 10 sec.
```

#### Candidate 1

```text
Charge Speed ▲ 8.97% for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | charge_speed |
| modifier_type | increase |
| value / unit | 8.97 / percent |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | parser_failure |


### 6. Anis: Star

Skill 2 · Stardust

- review_key: `nikke-17:Skill 2:section-2`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `caster_and_allies_lower_stat`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"caster_and_allies_lower_stat","target_type":"selected_allies","target_count":null,"target_selection":"lower_stat_than_caster","target_condition":"final_def < caster_final_def","target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates when entering Full Burst. Affects self and all allies with lower final DEF than self.
Projectile Explosion Damage ▲ 92.03% for 10 sec.
```

#### Candidate 1

```text
Projectile Explosion Damage ▲ 92.03% for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | projectile_explosion_damage |
| modifier_type | increase |
| value / unit | 92.03 / percent |
| target / target_type | self and all allies with lower final DEF than self. / — |
| trigger | Activates when entering Full Burst |
| condition | Activates when entering Full Burst. Affects self and all allies with lower final DEF than self. |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_target |


### 7. Privaty

Skill 1 · EX Magazine

- review_key: `nikke-170:Skill 1:section-0`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `通常stat増減行をsection context付きchild effectへmaterializeできていません。`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"all_allies","target_type":"all_allies","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates when entering Full Burst. Affects all allies.
ATK ▲ 23.61% for 10 sec. 
Reload Speed ▲ 51.16% for 10 sec. 
Max Ammunition Capacity ▼ 50.66% for 10 sec.
```

#### Candidate 1

```text
ATK ▲ 23.61% for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | atk |
| modifier_type | increase |
| value / unit | 23.61 / percent |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | parser_failure |

#### Candidate 2

```text
Reload Speed ▲ 51.16% for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | reload_speed |
| modifier_type | increase |
| value / unit | 51.16 / percent |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | parser_failure |

#### Candidate 3

```text
Max Ammunition Capacity ▼ 50.66% for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | — |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | — (— ; —) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | parser_failure |


### 8. Neon: Vision Eye

Skill 1 · Healthy Body

- review_key: `nikke-18:Skill 1:section-0`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `boolean grantとbattle内activation limitを併記する複合文法に未対応です。`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates when attacked while not in Healthy Body status. Affects self.
Invulnerable for 3 sec. Activates 5 time(s) per battle.
Gains debuff immunity to ∞ debuffs for 3 sec. Activates 5 time(s) per battle.
Healthy Body: Incoming Healing ▲ 10.26% for 20 sec.
```

#### Candidate 1

```text
Invulnerable for 3 sec. Activates 5 time(s) per battle.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | self. / self |
| trigger | Activates when attacked while not in Healthy Body status |
| condition | Activates when attacked while not in Healthy Body status. Affects self. |
| duration |  (— ; unknown) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | parser_failure |

#### Candidate 2

```text
Gains debuff immunity to ∞ debuffs for 3 sec. Activates 5 time(s) per battle.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | debuff_immunity |
| modifier_type | grant |
| value / unit | true / boolean |
| target / target_type | self. / self |
| trigger | Activates when attacked while not in Healthy Body status |
| condition | Activates when attacked while not in Healthy Body status. Affects self. |
| duration | 3 sec (3 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | (resolved sibling) |

#### Candidate 3

```text
Healthy Body: Incoming Healing ▲ 10.26% for 20 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | incoming_healing |
| modifier_type | increase |
| value / unit | 10.26 / percent |
| target / target_type | self. / self |
| trigger | Activates when attacked while not in Healthy Body status |
| condition | Activates when attacked while not in Healthy Body status. Affects self. |
| duration | 20 sec (20 seconds; fixed) |
| parent_effect_name | Healthy Body |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | (resolved sibling) |


### 9. Maiden: Ice Rose

Skill 2 · Blessings Upon You

- review_key: `nikke-183:Skill 2:section-0`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `all_allies_except_caster`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"all_allies_except_caster","target_type":"element","target_count":null,"target_selection":"all_matching_except_caster","target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates when MP is replenished. Affects all Electric Code allies except for self.
Elemental Advantage Attack Damage ▲ 40.9% for 10 sec.
ATK ▲ 20.9% of the skill user's ATK for 10 sec.
```

#### Candidate 1

```text
Elemental Advantage Attack Damage ▲ 40.9% for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | elemental_advantage_damage |
| modifier_type | increase |
| value / unit | 40.9 / percent |
| target / target_type | all Electric Code allies except for self. / — |
| trigger | Activates when MP is replenished |
| condition | Activates when MP is replenished. Affects all Electric Code allies except for self. |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_target |

#### Candidate 2

```text
ATK ▲ 20.9% of the skill user's ATK for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | caster_atk_based_atk |
| modifier_type | increase |
| value / unit | 20.9 / caster_atk_percent |
| target / target_type | all Electric Code allies except for self. / — |
| trigger | Activates when MP is replenished |
| condition | Activates when MP is replenished. Affects all Electric Code allies except for self. |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_target |


### 10. Tove

Skill 1 · Emergency-Crafted Bullets

- review_key: `nikke-192:Skill 1:section-0`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `explicit_trigger_parser_missing`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
There is a 5% chance of activating when attacking. Affects self.
Emergency-Crafted Bullets: Reload 5.31% of the magazine(s).
```

#### Candidate 1

```text
Emergency-Crafted Bullets: Reload 5.31% of the magazine(s).
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | reload_ratio |
| modifier_type | restore |
| value / unit | 5.31 / percent |
| target / target_type | self. / self |
| trigger |  |
| condition | There is a 5% chance of activating when attacking. Affects self. |
| duration | Instant (— ; instant) |
| parent_effect_name | Emergency-Crafted Bullets |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_trigger |


### 11. Signal

Skill 2 · Waiting for Signal

- review_key: `nikke-22:Skill 2:section-0`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `attack-damage基準のhealing conversion文法に未対応です。`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects self. Activates when entering Full Burst.
Restores HP equal to 44.08% of attack damage. Lasts for 10 sec.
```

#### Candidate 1

```text
Restores HP equal to 44.08% of attack damage. Lasts for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | heal |
| buff_type | attack_damage_based_heal |
| modifier_type | restore |
| value / unit | 44.08 / percent_of_attack_damage |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | parser_failure |


### 12. Rapunzel

Burst · Garden of Shangri-La

- review_key: `nikke-221:Burst:section-1`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `incapacitated_ally_highest_atk`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"incapacitated_ally_highest_atk","target_type":"selected_allies","target_count":1,"target_selection":"highest_atk","target_condition":"incapacitated","target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects the 1 incapacitated ally unit(s) with the highest final ATK.
Revives with 81.67% HP.
```

#### Candidate 1

```text
Revives with 81.67% HP.
```

| Field | Current value |
|---|---|
| effect_type | — |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | — (— ; —) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_target |


### 13. Scarlet

Burst · Scarlet Flash

- review_key: `nikke-222:Burst:section-0`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `通常stat増減行をsection context付きchild effectへmaterializeできていません。`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects self. Activates when HP falls below 50%.
Critical Rate ▲ 19.57% for 10 sec.
```

#### Candidate 1

```text
Critical Rate ▲ 19.57% for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | critical_rate |
| modifier_type | increase |
| value / unit | 19.57 / percent |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | parser_failure |


### 14. Delta: Ninja Thief

Burst · Secret Technique: Ninja Overdrive

- review_key: `nikke-23:Burst:section-2`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `self_in_condition`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"self_in_condition","target_type":"self","target_count":null,"target_selection":null,"target_condition":"self while in Attract status","target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects self while in Attract status.
Next shield's HP ▲ 20.13% for 10 sec.
```

#### Candidate 1

```text
Next shield's HP ▲ 20.13% for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | next_shield_hp |
| modifier_type | increase |
| value / unit | 20.13 / percent |
| target / target_type | self while in Attract status. / — |
| trigger | Burst Skill activation |
| condition | Affects self while in Attract status. |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_target |


### 15. Modernia

Skill 1 · High-Speed Evolution

- review_key: `nikke-260:Skill 1:section-1`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `numeric_role_grammar`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates after landing 200 normal attacks. Affects self.
Critical Damage ▲ 14.25%. Stacks up to 5 times and lasts for 10 sec.
Max Ammunition Capacity ▼ 5.04%. Stacks up to 5 times and lasts for 10 sec.
```

#### Candidate 1

```text
Critical Damage ▲ 14.25%. Stacks up to 5 times and lasts for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | critical_damage |
| modifier_type | increase |
| value / unit | 14.25 / percent |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_value + parser_failure + special_mechanic |

#### Candidate 2

```text
Max Ammunition Capacity ▼ 5.04%. Stacks up to 5 times and lasts for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | — |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | — (— ; —) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_value + parser_failure + special_mechanic |


### 16. Liberalio

Skill 1 · Calm Depths

- review_key: `nikke-262:Skill 1:section-3`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `burst_stage_ally_lowest_atk`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"burst_stage_ally_lowest_atk","target_type":"selected_allies","target_count":1,"target_selection":"lowest_atk","target_condition":"burst_stage=3","target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates when entering Full Burst. Affects the 1 Burst 3 ally unit(s) with the lowest final ATK.
Charge Speed ▲ 12.74% of the skill user's Charge Speed for 10 sec.
```

#### Candidate 1

```text
Charge Speed ▲ 12.74% of the skill user's Charge Speed for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | charge_speed |
| modifier_type | increase |
| value / unit | 12.74 / caster_charge_speed_percent |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_target |


### 17. Rouge

Skill 2 · Coin Flip

- review_key: `nikke-272:Skill 2:section-0`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `caster_and_adjacent_allies`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"caster_and_adjacent_allies","target_type":"selected_allies","target_count":3,"target_selection":"caster_plus_adjacent","target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates when assigned to the back row in battle. Affects self and both adjacent allies.
Sword Coin: Attack Damage ▲ 6.65% continuously.
```

#### Candidate 1

```text
Sword Coin: Attack Damage ▲ 6.65% continuously.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | attack_damage |
| modifier_type | increase |
| value / unit | 6.65 / percent |
| target / target_type | self and both adjacent allies. / — |
| trigger | Activates when assigned to the back row in battle |
| condition | Activates when assigned to the back row in battle. Affects self and both adjacent allies. |
| duration | 継続 (— continuous; continuous) |
| parent_effect_name | Sword Coin |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_target |


### 18. Rouge

Skill 2 · Coin Flip

- review_key: `nikke-272:Skill 2:section-1`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `caster_and_adjacent_allies`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"caster_and_adjacent_allies","target_type":"selected_allies","target_count":3,"target_selection":"caster_plus_adjacent","target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates if the skill user is in the Sword Coin state after performing 30 Full Chark attacks. Affects self and both adjacent allies.
Shield Coin: Damage Taken ▼15.2% continuously.
```

#### Candidate 1

```text
Shield Coin: Damage Taken ▼15.2% continuously.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | damage_taken |
| modifier_type | decrease |
| value / unit | 15.2 / percent |
| target / target_type | self and both adjacent allies. / — |
| trigger | Activates if the skill user is in the Sword Coin state after performing 30 Full Chark attacks |
| condition | Activates if the skill user is in the Sword Coin state after performing 30 Full Chark attacks. Affects self and both adjacent allies. |
| duration | 継続 (— continuous; continuous) |
| parent_effect_name | Shield Coin |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_target |


### 19. Sakura

Skill 1 · Cherry Blossom Tea

- review_key: `nikke-282:Skill 1:section-0`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `special_or_scaling_grammar`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"all_allies","target_type":"all_allies","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates after performing 3 normal attacks. Affects all allies.
Cherry Blossom Tea: 8.15% of DEF. Stacks up to 10 times and lasts for 15 sec.
```

#### Candidate 1

```text
Cherry Blossom Tea: 8.15% of DEF. Stacks up to 10 times and lasts for 15 sec.
```

| Field | Current value |
|---|---|
| effect_type | special_mechanic |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | all allies. / all_allies |
| trigger | Activates after performing 3 normal attacks |
| condition | Activates after performing 3 normal attacks. Affects all allies. |
| duration | 15 sec (15 seconds; fixed) |
| parent_effect_name | Cherry Blossom Tea |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | special_mechanic |


### 20. Mana

Skill 1 · Metal γ

- review_key: `nikke-290:Skill 1:section-2`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `incapacitated_ally_highest_atk`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"incapacitated_ally_highest_atk","target_type":"selected_allies","target_count":1,"target_selection":"highest_atk","target_condition":"incapacitated","target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates if the skill user is in Metal γ status when an ally is out of action. Affects 1 incapacitated ally unit(s) with the highest final ATK (except the skill user).
Resurrect with 96% HP.
```

#### Candidate 1

```text
Resurrect with 96% HP.
```

| Field | Current value |
|---|---|
| effect_type | — |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | — (— ; —) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_target |


### 21. Product 12

Skill 1 · Action: Increase ATK

- review_key: `nikke-303:Skill 1:section-0`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `通常stat増減行をsection context付きchild effectへmaterializeできていません。`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects self. Activates after performing 200 normal attacks.
ATK ▲ 8.28% for 5 sec.
```

#### Candidate 1

```text
ATK ▲ 8.28% for 5 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | atk |
| modifier_type | increase |
| value / unit | 8.28 / percent |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | 5 sec (5 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | parser_failure |


### 22. iDoll Sun

Skill 1 · Sunshine

- review_key: `nikke-308:Skill 1:section-0`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `通常stat増減行をsection context付きchild effectへmaterializeできていません。`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects self. Activates after landing 10 normal attacks.
DEF ▲ 7.56% for 5 sec.
```

#### Candidate 1

```text
DEF ▲ 7.56% for 5 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | def |
| modifier_type | increase |
| value / unit | 7.56 / percent |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | 5 sec (5 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | parser_failure |


### 23. Quiry

Skill 1 · Glance

- review_key: `nikke-33:Skill 1:section-1`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `class_limited_allies`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"class_limited_allies","target_type":"class","target_count":2,"target_selection":null,"target_condition":null,"target_class":"defender","target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates when attacking with Full Charge. Affects 2 Defender ally unit(s).
ATK ▲ 5.81% of the skill user's ATK for 3 sec.
```

#### Candidate 1

```text
ATK ▲ 5.81% of the skill user's ATK for 3 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | caster_atk_based_atk |
| modifier_type | increase |
| value / unit | 5.81 / caster_atk_percent |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | 3 sec (3 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_target |


### 24. Quiry

Skill 2 · Scrutiny

- review_key: `nikke-33:Skill 2:section-0`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `class_limited_allies`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"class_limited_allies","target_type":"class","target_count":2,"target_selection":null,"target_condition":null,"target_class":"defender","target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates at the start of battle. Affects 2 Defender ally unit(s).
Max HP ▲ 11.63% continuously.
```

#### Candidate 1

```text
Max HP ▲ 11.63% continuously.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | max_hp |
| modifier_type | increase |
| value / unit | 11.63 / percent |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | 継続 (— continuous; continuous) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_target |


### 25. Mast: Romantic Maid

Skill 2 · A Pirate's Spirit

- review_key: `nikke-354:Skill 2:section-0`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `special_or_scaling_grammar`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"all_allies","target_type":"all_allies","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates when entering Burst Stage 3 while in Drunken status. Affects all allies.
Distributed Damage ▲ 15.03% x number of Drunken stacks for 10 sec.
Reload Speed ▲ 15.04% x number of Drunken stacks for 10 sec.
```

#### Candidate 1

```text
Distributed Damage ▲ 15.03% x number of Drunken stacks for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | distributed_damage |
| modifier_type | increase |
| value / unit | 15.03 / percent |
| target / target_type | all allies. / all_allies |
| trigger | Activates when entering Burst Stage 3 while in Drunken status |
| condition | Activates when entering Burst Stage 3 while in Drunken status. Affects all allies.<br>x number of Drunken stacks for 10 sec. |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | special_mechanic |

#### Candidate 2

```text
Reload Speed ▲ 15.04% x number of Drunken stacks for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | reload_speed |
| modifier_type | increase |
| value / unit | 15.04 / percent |
| target / target_type | all allies. / all_allies |
| trigger | Activates when entering Burst Stage 3 while in Drunken status |
| condition | Activates when entering Burst Stage 3 while in Drunken status. Affects all allies. |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | special_mechanic |


### 26. Mast: Romantic Maid

Burst · A Pirate's Romance

- review_key: `nikke-354:Burst:section-1`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `allies_by_named_state`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"allies_by_named_state","target_type":"selected_allies","target_count":null,"target_selection":"named_state_membership","target_condition":"all allies if in Drunken status","target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects all allies if in Drunken status.
ATK ▲ (20.06% * Number of Drunken stacks) of the skill user's ATK for 10 sec.
```

#### Candidate 1

```text
ATK ▲ (20.06% * Number of Drunken stacks) of the skill user's ATK for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | caster_atk_based_atk |
| modifier_type | increase |
| value / unit | 20.06 / caster_atk_percent |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_target + special_mechanic |


### 27. Anchor: Innocent Maid

Skill 1 · Starfish (Shaped) Omurice

- review_key: `nikke-355:Skill 1:section-0`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `special_or_scaling_grammar`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"all_allies","target_type":"all_allies","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates when entering Full Burst. Affects all allies.
Effects vary according to the number of times used. Each subsequent effect triggers all effects before it:
Once: Healing ▲ 30.96% for 5 sec.
Twice: Distributed Damage ▲ 30.4% for 10 sec.
Three times: Decreases the stack count of stackable debuffs by 1.
```

#### Candidate 1

```text
Once: Healing ▲ 30.96% for 5 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | healing |
| modifier_type | increase |
| value / unit | 30.96 / percent |
| target / target_type | all allies. / all_allies |
| trigger | Activates when entering Full Burst |
| condition | Activates when entering Full Burst. Affects all allies.<br>Effects vary according to the number of times used. Each subsequent effect triggers all effects before it:<br>Once: |
| duration | 5 sec (5 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | (resolved sibling) |

#### Candidate 2

```text
Twice: Distributed Damage ▲ 30.4% for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | distributed_damage |
| modifier_type | increase |
| value / unit | 30.4 / percent |
| target / target_type | all allies. / all_allies |
| trigger | Activates when entering Full Burst |
| condition | Activates when entering Full Burst. Affects all allies.<br>Effects vary according to the number of times used. Each subsequent effect triggers all effects before it:<br>Twice: |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | (resolved sibling) |

#### Candidate 3

```text
Three times: Decreases the stack count of stackable debuffs by 1.
```

| Field | Current value |
|---|---|
| effect_type | special_mechanic |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | all allies. / all_allies |
| trigger | Activates when entering Full Burst |
| condition | Activates when entering Full Burst. Affects all allies.<br>Effects vary according to the number of times used. Each subsequent effect triggers all effects before it:<br>Three times: |
| duration | Instant (— ; unknown) |
| parent_effect_name | — |
| section_condition | {"attack_count":3} |
| special_type | — |
| resource_type | — |
| needs_review_reasons | special_mechanic |


### 28. Biscuit

Burst · Walk Training

- review_key: `nikke-381:Burst:section-0`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `random_ally_cover_destroyed`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"random_ally_cover_destroyed","target_type":"selected_allies","target_count":2,"target_selection":"random","target_condition":"cover_destroyed","target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects 2 random ally unit(s) whose cover has been destroyed.
Rebuilds cover with 93.6% HP.
```

#### Candidate 1

```text
Rebuilds cover with 93.6% HP.
```

| Field | Current value |
|---|---|
| effect_type | — |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | — (— ; —) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_target |


### 29. D

Burst · Chastisement

- review_key: `nikke-40:Burst:section-2`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `all_allies`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"all_allies","target_type":"all_allies","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects all allies if the skill user has immunity to Stun.
Full Burst Duration ▲ 5.04 sec.
```

#### Candidate 1

```text
Full Burst Duration ▲ 5.04 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | full_burst_duration |
| modifier_type | increase |
| value / unit | 5.04 / seconds |
| target / target_type | all allies if the skill user has immunity to Stun. / — |
| trigger | Burst Skill activation |
| condition | Affects all allies if the skill user has immunity to Stun. |
| duration | Instant (— ; instant) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_target |


### 30. K

Skill 2 · Execution of Righteousness

- review_key: `nikke-41:Skill 2:section-0`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `max ammunition capacity decrease(句読点・注記を含む)のstat grammarに未対応です。`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"all_allies","target_type":"all_allies","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates when gaining Tilted Scale. Affects all allies.
Fulfillment of Righteousness
Function: Reduces max ammunition capacity but increases attack damage.
Effect 1: Max ammunition capacity ▼ 51.13% for 10 sec. (Similar effects cannot be stacked.)
Effect 2: Attack damage ▲ 10.62% for 10 sec.
```

#### Candidate 1

```text
Effect 1: Max ammunition capacity ▼ 51.13% for 10 sec. (Similar effects cannot be stacked.)
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | all allies. / all_allies |
| trigger | Activates when gaining Tilted Scale |
| condition | Activates when gaining Tilted Scale. Affects all allies.<br>Reduces max ammunition capacity but increases attack damage. |
| duration |  (— ; unknown) |
| parent_effect_name | Fulfillment of Righteousness |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | parser_failure |

#### Candidate 2

```text
Effect 2: Attack damage ▲ 10.62% for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | attack_damage |
| modifier_type | increase |
| value / unit | 10.62 / percent |
| target / target_type | all allies. / all_allies |
| trigger | Activates when gaining Tilted Scale |
| condition | Activates when gaining Tilted Scale. Affects all allies.<br>Reduces max ammunition capacity but increases attack damage. |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | Fulfillment of Righteousness |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | (resolved sibling) |


### 31. K

Burst · Means of Righteousness

- review_key: `nikke-41:Burst:section-0`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `parent_duration_inheritance`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects self.
Change the weapon in use:
Damage: 92.5% of final ATK
Pellet Count: 10
Attack Speed: ▼ 90% 
Duration: 10 sec.
Additional Effects:
ATK ▲ 63.36% of the skill user's ATK for 10 sec.
Attack Damage ▲ 21.12% for 10 sec.
```

#### Candidate 1

```text
Attack Speed: ▼ 90%
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | self. / self |
| trigger | Burst Skill activation |
| condition | Affects self. |
| duration |  (— ; unknown) |
| parent_effect_name | Attack Speed |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_duration |

#### Candidate 2

```text
ATK ▲ 63.36% of the skill user's ATK for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | caster_atk_based_atk |
| modifier_type | increase |
| value / unit | 63.36 / caster_atk_percent |
| target / target_type | self. / self |
| trigger | Burst Skill activation |
| condition | Affects self.<br>Duration: 10 sec. |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | (resolved sibling) |

#### Candidate 3

```text
Attack Damage ▲ 21.12% for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | attack_damage |
| modifier_type | increase |
| value / unit | 21.12 / percent |
| target / target_type | self. / self |
| trigger | Burst Skill activation |
| condition | Affects self.<br>Duration: 10 sec. |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | (resolved sibling) |


### 32. Flora

Skill 1 · Petunia

- review_key: `nikke-411:Skill 1:section-0`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `caster_and_adjacent_allies`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"caster_and_adjacent_allies","target_type":"selected_allies","target_count":3,"target_selection":"caster_plus_adjacent","target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates at the start of battle as long as this unit is alive. Affects self and both adjacent allies.
Restores HP equal to 1% of the skill user's final max HP every second.
Incoming Healing ▲ 4% continuously. Stacks up to 5 times.
```

#### Candidate 1

```text
Restores HP equal to 1% of the skill user's final max HP every second.
```

| Field | Current value |
|---|---|
| effect_type | heal |
| buff_type | caster_max_hp_based_heal |
| modifier_type | restore |
| value / unit | 1 / caster_max_hp_percent |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | Instant (— ; instant) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_target + special_mechanic |

#### Candidate 2

```text
Incoming Healing ▲ 4% continuously. Stacks up to 5 times.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | incoming_healing |
| modifier_type | increase |
| value / unit | 4 / percent |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | 継続 (— continuous; continuous) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_target + special_mechanic |


### 33. Trina

Skill 2 · Peaceful Tree

- review_key: `nikke-412:Skill 2:section-0`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `element_and_weapon_limited_allies`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"element_and_weapon_limited_allies","target_type":"other","target_count":null,"target_selection":"all_matching","target_condition":null,"target_class":null,"target_weapon":"assault rifles","target_element":"electric"}`

#### Source section全文

```text
Activates at the start of battle as long as the skill user is alive. Affects all Electric Code allies with assault rifles.
Max HP ▲ 44.98% of the skill user's max HP (without restoring HP) continuously.
```

#### Candidate 1

```text
Max HP ▲ 44.98% of the skill user's max HP (without restoring HP) continuously.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | caster_max_hp_based_max_hp |
| modifier_type | increase |
| value / unit | 44.98 / caster_max_hp_percent |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | 継続 (— continuous; continuous) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_target |


### 34. Trony

Skill 1 · T.Rony Bomber

- review_key: `nikke-501:Skill 1:section-0`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `special_or_scaling_grammar`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"explicit_unmapped_target","target_type":"other","target_count":null,"target_selection":"literal_source_target","target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates when hitting a target with Full Charge. Affects 1 enemy unit nearest to the crosshair if there are no enemies in T.Rony Bomber status.
Cumulative Damage Skill active for 5 sec.
Function: Accumulates a fraction of the skill user's inflicted damage. Upon reaching the maximum accumulated damage, deals damage to enemies before ending.
Effect 1: Maximum Accumulated Damage is 1536% of the skill user's final ATK.
Effect 2: Accumulates 50% of the skill user's ATK damage.
Effect 3: Deals distributed damage to enemies within the attack range when Cumulative Damage Skill explodes.
```

#### Candidate 1

```text
Effect 1: Maximum Accumulated Damage is 1536% of the skill user's final ATK.
```

| Field | Current value |
|---|---|
| effect_type | special_mechanic |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | 1 enemy unit nearest to the crosshair if there are no enemies in T.Rony Bomber status. / — |
| trigger | Activates when hitting a target with Full Charge |
| condition | Activates when hitting a target with Full Charge. Affects 1 enemy unit nearest to the crosshair if there are no enemies in T.Rony Bomber status.<br>Accumulates a fraction of the skill user's inflicted damage. Upon reaching the maximum accumulated damage, deals damage to enemies before ending. |
| duration | Instant (— ; unknown) |
| parent_effect_name | Cumulative Damage Skill active for 5 sec. |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | special_mechanic |

#### Candidate 2

```text
Effect 2: Accumulates 50% of the skill user's ATK damage.
```

| Field | Current value |
|---|---|
| effect_type | special_mechanic |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | 1 enemy unit nearest to the crosshair if there are no enemies in T.Rony Bomber status. / — |
| trigger | Activates when hitting a target with Full Charge |
| condition | Activates when hitting a target with Full Charge. Affects 1 enemy unit nearest to the crosshair if there are no enemies in T.Rony Bomber status.<br>Accumulates a fraction of the skill user's inflicted damage. Upon reaching the maximum accumulated damage, deals damage to enemies before ending. |
| duration | Instant (— ; unknown) |
| parent_effect_name | Cumulative Damage Skill active for 5 sec. |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | special_mechanic |

#### Candidate 3

```text
Effect 3: Deals distributed damage to enemies within the attack range when Cumulative Damage Skill explodes.
```

| Field | Current value |
|---|---|
| effect_type | special_mechanic |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | 1 enemy unit nearest to the crosshair if there are no enemies in T.Rony Bomber status. / — |
| trigger | Activates when hitting a target with Full Charge |
| condition | Activates when hitting a target with Full Charge. Affects 1 enemy unit nearest to the crosshair if there are no enemies in T.Rony Bomber status.<br>Accumulates a fraction of the skill user's inflicted damage. Upon reaching the maximum accumulated damage, deals damage to enemies before ending. |
| duration | Instant (— ; unknown) |
| parent_effect_name | Cumulative Damage Skill active for 5 sec. |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | special_mechanic |


### 35. Elegg: Boom and Shock

Skill 1 · Hello Ghost

- review_key: `nikke-502:Skill 1:section-1`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `branch_condition_can_supply_trigger_context`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"element_limited_allies","target_type":"element","target_count":null,"target_selection":"all_matching","target_condition":null,"target_class":null,"target_weapon":null,"target_element":"water"}`

#### Source section全文

```text
Affects all Water Code allies.
Effects vary according to the number of ghosts. Each subsequent effect triggers all effects before it:
1 or more ghosts:
ATK ▲ 16.2% of the skill user's ATK continuously.
4 or more ghosts:
Elemental Advantage Attack Damage ▲ 35% continuously.
```

#### Candidate 1

```text
ATK ▲ 16.2% of the skill user's ATK continuously.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | caster_atk_based_atk |
| modifier_type | increase |
| value / unit | 16.2 / caster_atk_percent |
| target / target_type | all Water Code allies. / element |
| trigger |  |
| condition | Affects all Water Code allies.<br>Effects vary according to the number of ghosts. Each subsequent effect triggers all effects before it: |
| duration | 継続 (— continuous; continuous) |
| parent_effect_name | 1 or more ghosts |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_trigger |

#### Candidate 2

```text
Elemental Advantage Attack Damage ▲ 35% continuously.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | elemental_advantage_damage |
| modifier_type | increase |
| value / unit | 35 / percent |
| target / target_type | all Water Code allies. / element |
| trigger |  |
| condition | Affects all Water Code allies.<br>Effects vary according to the number of ghosts. Each subsequent effect triggers all effects before it: |
| duration | 継続 (— continuous; continuous) |
| parent_effect_name | 4 or more ghosts |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_trigger |


### 36. Cinderella

Skill 1 · Flawless Glass

- review_key: `nikke-511:Skill 1:section-1`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `until_condition`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates when attacking with Full Charge. Affects self.
Charge Speed ▲ 100%. Removed upon reloading to max ammunition.
```

#### Candidate 1

```text
Charge Speed ▲ 100%. Removed upon reloading to max ammunition.
```

| Field | Current value |
|---|---|
| effect_type | — |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | — (— ; —) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_duration |


### 37. Crust

Skill 2 · Reliable Cooking

- review_key: `nikke-521:Skill 2:section-0`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `allies_by_named_state`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"allies_by_named_state","target_type":"selected_allies","target_count":null,"target_selection":"named_state_membership","target_condition":"all allies not in Reliable Cooking status","target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates after performing 3 normal, non-Full-Charge attacks. Affects all allies not in Reliable Cooking status.
Reliable Cooking: DEF ▲ 10% of the skill user's DEF for 10 sec.
Removes 1 debuff.
```

#### Candidate 1

```text
Reliable Cooking: DEF ▲ 10% of the skill user's DEF for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | caster_def_based_def |
| modifier_type | increase |
| value / unit | 10 / caster_def_percent |
| target / target_type | all allies not in Reliable Cooking status. / — |
| trigger | Activates after performing 3 normal, non-Full-Charge attacks |
| condition | Activates after performing 3 normal, non-Full-Charge attacks. Affects all allies not in Reliable Cooking status. |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | Reliable Cooking |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_target |


### 38. Crust

Skill 2 · Reliable Cooking

- review_key: `nikke-521:Skill 2:section-1`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `allies_by_named_state`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"allies_by_named_state","target_type":"selected_allies","target_count":null,"target_selection":"named_state_membership","target_condition":"all allies not in Reliable Cooking status","target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates after maintaining 3 Full Charge for 1 or more sec. Affects all allies not in Reliable Cooking status.
Reliable Cooking: DEF ▲ 10% of the skill user's DEF for 10 sec.
Removes 1 debuff.
```

#### Candidate 1

```text
Reliable Cooking: DEF ▲ 10% of the skill user's DEF for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | caster_def_based_def |
| modifier_type | increase |
| value / unit | 10 / caster_def_percent |
| target / target_type | all allies not in Reliable Cooking status. / — |
| trigger | Activates after maintaining 3 Full Charge for 1 or more sec |
| condition | Activates after maintaining 3 Full Charge for 1 or more sec. Affects all allies not in Reliable Cooking status. |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | Reliable Cooking |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_target |


### 39. Crust

Skill 2 · Reliable Cooking

- review_key: `nikke-521:Skill 2:section-2`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `targets_by_named_state`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"targets_by_named_state","target_type":"other","target_count":null,"target_selection":"named_state_membership","target_condition":"all targets in Maillard or Blanching status","target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates when entering Full Burst. Affects all targets in Maillard or Blanching status.
ATK ▲ 20% of the skill user's ATK for 10 sec.
```

#### Candidate 1

```text
ATK ▲ 20% of the skill user's ATK for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | caster_atk_based_atk |
| modifier_type | increase |
| value / unit | 20 / caster_atk_percent |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_target |


### 40. Crust

Burst · True Flavor

- review_key: `nikke-521:Burst:section-1`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `allies_by_named_state`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"allies_by_named_state","target_type":"selected_allies","target_count":null,"target_selection":"named_state_membership","target_condition":"all allies when in Maillard status","target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects all allies when in Maillard status.
Distributed Damage ▲ 60% for 10 sec.
```

#### Candidate 1

```text
Distributed Damage ▲ 60% for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | distributed_damage |
| modifier_type | increase |
| value / unit | 60 / percent |
| target / target_type | all allies when in Maillard status. / — |
| trigger | Burst Skill activation |
| condition | Affects all allies when in Maillard status. |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_target |


### 41. Crust

Burst · True Flavor

- review_key: `nikke-521:Burst:section-2`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `allies_by_named_state`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"allies_by_named_state","target_type":"selected_allies","target_count":null,"target_selection":"named_state_membership","target_condition":"all allies when in Blanching status","target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects all allies when in Blanching status.
Sustained Damage ▲ 10% for 10 sec.
```

#### Candidate 1

```text
Sustained Damage ▲ 10% for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | sustained_damage |
| modifier_type | increase |
| value / unit | 10 / percent |
| target / target_type | all allies when in Blanching status. / — |
| trigger | Burst Skill activation |
| condition | Affects all allies when in Blanching status. |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_target |


### 42. Bay

Skill 1 · You Can Do It

- review_key: `nikke-550:Skill 1:section-0`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `numeric valueを持たないdamage-share grant文法に未対応です。`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"all_allies","target_type":"all_allies","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates when using Burst Skill as long as this unit is still alive. Affects all allies. 
Proportionally shares damage taken. This effect is continuous.
DEF ▲ 10.13% of the skill user's DEF continuously.
```

#### Candidate 1

```text
Proportionally shares damage taken. This effect is continuous.
```

| Field | Current value |
|---|---|
| effect_type | — |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | — (— ; —) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | parser_failure |

#### Candidate 2

```text
DEF ▲ 10.13% of the skill user's DEF continuously.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | caster_def_based_def |
| modifier_type | increase |
| value / unit | 10.13 / caster_def_percent |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | 継続 (— continuous; continuous) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | parser_failure |


### 43. Bay

Skill 2 · Cheer Up Together

- review_key: `nikke-550:Skill 2:section-0`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `caster_cover`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"caster_cover","target_type":"other","target_count":null,"target_selection":"caster_cover","target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates when using Burst Skill as long as this unit is still alive. Affects this unit's cover.
Proportionally shares damage taken. This effect is continuous.
```

#### Candidate 1

```text
Proportionally shares damage taken. This effect is continuous.
```

| Field | Current value |
|---|---|
| effect_type | — |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | — (— ; —) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_target + missing_value |


### 44. Ark Ranger Black

Skill 2 · Tremble! Ark Black Collider!

- review_key: `nikke-570:Skill 2:section-1`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `element_and_weapon_limited_allies`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"element_and_weapon_limited_allies","target_type":"other","target_count":null,"target_selection":"all_matching","target_condition":null,"target_class":null,"target_weapon":"assault rifles","target_element":"wind"}`

#### Source section全文

```text
Activates when entering Full Burst. Affects all Wind Code allies with assault rifles.
Sustained Damage ▲ 77.5% for 10 sec.
```

#### Candidate 1

```text
Sustained Damage ▲ 77.5% for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | sustained_damage |
| modifier_type | increase |
| value / unit | 77.5 / percent |
| target / target_type | all Wind Code allies with assault rifles. / — |
| trigger | Activates when entering Full Burst |
| condition | Activates when entering Full Burst. Affects all Wind Code allies with assault rifles. |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_target |


### 45. Label

Burst · Bursting Heart

- review_key: `nikke-582:Burst:section-0`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `shield objectをtargetにするboolean invulnerability文法に未対応です。`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects self.
Max HP ▲ 20.26% for 10 sec.
Shared Delusion: The shield created by Label becomes invulnerable for 10 sec.
```

#### Candidate 1

```text
Max HP ▲ 20.26% for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | max_hp |
| modifier_type | increase |
| value / unit | 20.26 / percent |
| target / target_type | self. / self |
| trigger | Burst Skill activation |
| condition | Affects self. |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | (resolved sibling) |

#### Candidate 2

```text
Shared Delusion: The shield created by Label becomes invulnerable for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | self. / self |
| trigger | Burst Skill activation |
| condition | Affects self. |
| duration |  (— ; unknown) |
| parent_effect_name | Shared Delusion |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | parser_failure |


### 46. Snow Crane

Skill 2 · Legal Effect

- review_key: `nikke-620:Skill 2:section-0`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `allies_by_named_state`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"allies_by_named_state","target_type":"selected_allies","target_count":null,"target_selection":"named_state_membership","target_condition":"all allies in the Exclusive Recovery Agreement state","target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates after performing 3 Full Charge attacks. Affects all allies in the Exclusive Recovery Agreement state.
Restores HP equal to 1.32% of the skill user's final max HP.
```

#### Candidate 1

```text
Restores HP equal to 1.32% of the skill user's final max HP.
```

| Field | Current value |
|---|---|
| effect_type | heal |
| buff_type | caster_max_hp_based_heal |
| modifier_type | restore |
| value / unit | 1.32 / caster_max_hp_percent |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | Instant (— ; instant) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_target |


### 47. Soline: Frost Ticket

Skill 2 · I'll Help You Board the Train!

- review_key: `nikke-74:Skill 2:section-0`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `named_or_current_target`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"named_or_current_target","target_type":"other","target_count":null,"target_selection":"current_named_target","target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates when any ally's HP (including this unit's) drops to 15% or below while the target has any tickets. Affects the target.
Restores HP equal to 12.27% of the skill user's final max HP.
Ticket count ▼ 1.
```

#### Candidate 1

```text
Restores HP equal to 12.27% of the skill user's final max HP.
```

| Field | Current value |
|---|---|
| effect_type | heal |
| buff_type | caster_max_hp_based_heal |
| modifier_type | restore |
| value / unit | 12.27 / caster_max_hp_percent |
| target / target_type | the target. / — |
| trigger | Activates when any ally's HP (including this unit's) drops to 15% or below while the target has any tickets |
| condition | Activates when any ally's HP (including this unit's) drops to 15% or below while the target has any tickets. Affects the target. |
| duration | Instant (— ; instant) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_target |


### 48. Diesel: Winter Sweets

Skill 1 · Ah Ah, Mic Test

- review_key: `nikke-75:Skill 1:section-2`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `self_in_condition`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"self_in_condition","target_type":"self","target_count":null,"target_selection":null,"target_condition":"self if in Intro status","target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates when entering Full Burst. Affects self if in Intro status.
Sustained damage ▲ 60.19% for 10 sec.
```

#### Candidate 1

```text
Sustained damage ▲ 60.19% for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | sustained_damage |
| modifier_type | increase |
| value / unit | 60.19 / percent |
| target / target_type | self if in Intro status. / — |
| trigger | Activates when entering Full Burst |
| condition | Activates when entering Full Burst. Affects self if in Intro status. |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_target |


### 49. Diesel: Winter Sweets

Skill 1 · Ah Ah, Mic Test

- review_key: `nikke-75:Skill 1:section-3`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `self_in_condition`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"self_in_condition","target_type":"self","target_count":null,"target_selection":null,"target_condition":"self if in Highlight status","target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates when entering Full Burst. Affects self if in Highlight status.
Sustained damage ▲ 235.03% for 10 sec.
```

#### Candidate 1

```text
Sustained damage ▲ 235.03% for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | sustained_damage |
| modifier_type | increase |
| value / unit | 235.03 / percent |
| target / target_type | self if in Highlight status. / — |
| trigger | Activates when entering Full Burst |
| condition | Activates when entering Full Burst. Affects self if in Highlight status. |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_target |


### 50. Emilia

Burst · Freezing Witch

- review_key: `nikke-821:Burst:section-0`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `parent_duration_inheritance`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects self.
Explosion Range ▲ 101.24% for 10 sec.
Freezing Witch
Function: Decreases Charge Speed and increases Charge Damage for 1 shot(s).
Effect 1: Charge Speed ▼ 300%.
Effect 2: Charge Damage ▲ 1300.53%.
```

#### Candidate 1

```text
Explosion Range ▲ 101.24% for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | explosion_radius |
| modifier_type | increase |
| value / unit | 101.24 / percent |
| target / target_type | self. / self |
| trigger | Burst Skill activation |
| condition | Affects self. |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | (resolved sibling) |

#### Candidate 2

```text
Effect 2: Charge Damage ▲ 1300.53%.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | charge_damage |
| modifier_type | increase |
| value / unit | 1300.53 / percent |
| target / target_type | self. / self |
| trigger | Burst Skill activation |
| condition | Affects self.<br>Decreases Charge Speed and increases Charge Damage for 1 shot(s). |
| duration | Instant (— ; instant) |
| parent_effect_name | Freezing Witch |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_duration |


### 51. Rei Ayanami (Tentative Name)

Skill 1 · Annihilation Support

- review_key: `nikke-834:Skill 1:section-2`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `allies_by_named_state`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"allies_by_named_state","target_type":"selected_allies","target_count":null,"target_selection":"named_state_membership","target_condition":"all allies in Annihilation State","target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates when entering Full Burst. Affects all allies in Annihilation State.
Units affected by Annihilation State's additional effect ▲ 1 for 9 sec.
Attack range of Annihilation State's additional effect ▲ 500% for 9 sec.
ATK ▲ 17.6% of the skill user's ATK for 9 sec.
```

#### Candidate 1

```text
ATK ▲ 17.6% of the skill user's ATK for 9 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | caster_atk_based_atk |
| modifier_type | increase |
| value / unit | 17.6 / caster_atk_percent |
| target / target_type | all allies in Annihilation State. / — |
| trigger | Activates when entering Full Burst |
| condition | Activates when entering Full Burst. Affects all allies in Annihilation State. |
| duration | 9 sec (9 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_target |


### 52. Ada

Burst · Secret Agent

- review_key: `nikke-840:Burst:section-0`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `parent_duration_inheritance`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects self.
ATK ▲ 40% for 10 sec.
True Damage ▲ 42% for 10 sec.
Special Modification
Function: Decreases Charge Speed but increases Charge Damage for 1 round(s).
Effect 1: Charge Speed ▼ 300%.
Effect 2: Charge Damage ▲ 1500%.
```

#### Candidate 1

```text
ATK ▲ 40% for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | atk |
| modifier_type | increase |
| value / unit | 40 / percent |
| target / target_type | self. / self |
| trigger | Burst Skill activation |
| condition | Affects self. |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | (resolved sibling) |

#### Candidate 2

```text
True Damage ▲ 42% for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | true_damage |
| modifier_type | increase |
| value / unit | 42 / percent |
| target / target_type | self. / self |
| trigger | Burst Skill activation |
| condition | Affects self. |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | (resolved sibling) |

#### Candidate 3

```text
Effect 2: Charge Damage ▲ 1500%.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | charge_damage |
| modifier_type | increase |
| value / unit | 1500 / percent |
| target / target_type | self. / self |
| trigger | Burst Skill activation |
| condition | Affects self.<br>Decreases Charge Speed but increases Charge Damage for 1 round(s). |
| duration | Instant (— ; instant) |
| parent_effect_name | Special Modification |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_duration |


### 53. EVE

Skill 2 · Eagle Eye-Type Exospine

- review_key: `nikke-850:Skill 2:section-0`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `named state/headingだけのmetadata行をeffectから分離できていません。`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates at the start of battle. Affects self.
Eagle Eye-Type Exospine.
Previous effects trigger repeatedly.
ATK ▲ 50% of the skill user's ATK continuously.
Max Ammunition Capacity ▲ 25% continuously.
```

#### Candidate 1

```text
Eagle Eye-Type Exospine.
```

| Field | Current value |
|---|---|
| effect_type | — |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | — (— ; —) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | parser_failure |

#### Candidate 2

```text
Previous effects trigger repeatedly.
```

| Field | Current value |
|---|---|
| effect_type | — |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | — (— ; —) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | parser_failure |

#### Candidate 3

```text
ATK ▲ 50% of the skill user's ATK continuously.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | caster_atk_based_atk |
| modifier_type | increase |
| value / unit | 50 / caster_atk_percent |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | 継続 (— continuous; continuous) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | parser_failure |

#### Candidate 4

```text
Max Ammunition Capacity ▲ 25% continuously.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | max_ammo |
| modifier_type | increase |
| value / unit | 25 / percent |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | 継続 (— continuous; continuous) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | parser_failure |


### 54. Raven

Skill 2 · Blue Blade

- review_key: `nikke-851:Skill 2:section-2`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `self_in_condition`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"self_in_condition","target_type":"self","target_count":null,"target_selection":null,"target_condition":"self if self is not in A.N. Mode status","target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates when an ally or self destroys an enemy's part. Affects self if self is not in A.N. Mode status.
Single Point Attack: Sustained damage ▲ 47.32% for 15 sec.
Removes Vital Attack.
```

#### Candidate 1

```text
Single Point Attack: Sustained damage ▲ 47.32% for 15 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | sustained_damage |
| modifier_type | increase |
| value / unit | 47.32 / percent |
| target / target_type | self if self is not in A.N. Mode status. / — |
| trigger | Activates when an ally or self destroys an enemy's part |
| condition | Activates when an ally or self destroys an enemy's part. Affects self if self is not in A.N. Mode status. |
| duration | 15 sec (15 seconds; fixed) |
| parent_effect_name | Single Point Attack |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_target |


### 55. Lily

Burst · The Best Engineer!

- review_key: `nikke-852:Burst:section-0`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `random_ally_cover_destroyed`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"random_ally_cover_destroyed","target_type":"selected_allies","target_count":1,"target_selection":"random","target_condition":"cover_destroyed","target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects a random ally unit whose cover has been destroyed.
Rebuilds cover with 30% HP.
ATK ▲ 20% of the skill user's ATK for 10 sec.
```

#### Candidate 1

```text
Rebuilds cover with 30% HP.
```

| Field | Current value |
|---|---|
| effect_type | — |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | — (— ; —) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_target |

#### Candidate 2

```text
ATK ▲ 20% of the skill user's ATK for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | caster_atk_based_atk |
| modifier_type | increase |
| value / unit | 20 / caster_atk_percent |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_target |


### 56. Lily

Burst · The Best Engineer!

- review_key: `nikke-852:Burst:section-1`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `random_ally_cover_destroyed`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"random_ally_cover_destroyed","target_type":"selected_allies","target_count":1,"target_selection":"random","target_condition":"cover_destroyed","target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects a random ally unit if no ally's cover has been destroyed.
ATK ▲ 40% of the skill user's ATK for 10 sec.
```

#### Candidate 1

```text
ATK ▲ 40% of the skill user's ATK for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | caster_atk_based_atk |
| modifier_type | increase |
| value / unit | 40 / caster_atk_percent |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_target |


### 57. Chisato

Skill 1 · Extrasensory

- review_key: `nikke-860:Skill 1:section-1`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `tier/branch prefixの後にnamed boolean effectが続く文法に未対応です。`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates while in Extrasensory status. Affects self.
Effects vary according to the charge level of Extrasensory. Each subsequent effect triggers all effects before it:
Only when at 100%: Dodging Bullets: Invulnerable for 2 sec.
Only when above 70%: ATK ▲ 53.69%. This effect is continuous and cannot be removed.
Only when above 55%: True Damage ▲ 48.62%. This effect is continuous and cannot be removed.
Only when above 25%: Hit Rate ▲ 22.37%. This effect is continuous and cannot be removed.
```

#### Candidate 1

```text
Only when at 100%: Dodging Bullets: Invulnerable for 2 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | self. / self |
| trigger | Activates while in Extrasensory status |
| condition | Activates while in Extrasensory status. Affects self.<br>Effects vary according to the charge level of Extrasensory. Each subsequent effect triggers all effects before it: |
| duration |  (— ; unknown) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | parser_failure |

#### Candidate 2

```text
Only when above 70%: ATK ▲ 53.69%. This effect is continuous and cannot be removed.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | atk |
| modifier_type | increase |
| value / unit | 53.69 / percent |
| target / target_type | self. / self |
| trigger | Activates while in Extrasensory status |
| condition | Activates while in Extrasensory status. Affects self.<br>Effects vary according to the charge level of Extrasensory. Each subsequent effect triggers all effects before it:<br>HP > 70% |
| duration | 継続 (— continuous; continuous) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | (resolved sibling) |

#### Candidate 3

```text
Only when above 55%: True Damage ▲ 48.62%. This effect is continuous and cannot be removed.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | true_damage |
| modifier_type | increase |
| value / unit | 48.62 / percent |
| target / target_type | self. / self |
| trigger | Activates while in Extrasensory status |
| condition | Activates while in Extrasensory status. Affects self.<br>Effects vary according to the charge level of Extrasensory. Each subsequent effect triggers all effects before it:<br>HP > 55% |
| duration | 継続 (— continuous; continuous) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | (resolved sibling) |

#### Candidate 4

```text
Only when above 25%: Hit Rate ▲ 22.37%. This effect is continuous and cannot be removed.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | hit_rate |
| modifier_type | increase |
| value / unit | 22.37 / percent |
| target / target_type | self. / self |
| trigger | Activates while in Extrasensory status |
| condition | Activates while in Extrasensory status. Affects self.<br>Effects vary according to the charge level of Extrasensory. Each subsequent effect triggers all effects before it:<br>HP > 25% |
| duration | 継続 (— continuous; continuous) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | (resolved sibling) |


### 58. Chisato

Skill 1 · Extrasensory

- review_key: `nikke-860:Skill 1:section-2`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `special_or_scaling_grammar`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects self every 2 sec.
Extrasensory ▼ 1%.
```

#### Candidate 1

```text
Extrasensory ▼ 1%.
```

| Field | Current value |
|---|---|
| effect_type | special_mechanic |
| buff_type | — |
| modifier_type | — |
| value / unit | 1 / percent |
| target / target_type | self every 2 sec. / — |
| trigger |  |
| condition | Affects self every 2 sec. |
| duration | Instant (— ; unknown) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | special_mechanic |


### 59. Queen (Makoto)

Skill 2 · Fist of Justice!

- review_key: `nikke-870:Skill 2:section-3`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `all_allies_except_caster`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"all_allies_except_caster","target_type":"selected_allies","target_count":null,"target_selection":"all_matching_except_caster","target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates when 1 More takes effect. Affects all standard Burst 3 allies (except the skill user) in the Persona state.
Baton Pass: ATK ▲ 35.2% of the skill user's ATK continuously. Stacks up to 3 times.
```

#### Candidate 1

```text
Baton Pass: ATK ▲ 35.2% of the skill user's ATK continuously. Stacks up to 3 times.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | caster_atk_based_atk |
| modifier_type | increase |
| value / unit | 35.2 / caster_atk_percent |
| target / target_type | all standard Burst 3 allies (except the skill user) in the Persona state. / — |
| trigger | Activates when 1 More takes effect |
| condition | Activates when 1 More takes effect. Affects all standard Burst 3 allies (except the skill user) in the Persona state. |
| duration | 継続 (— continuous; continuous) |
| parent_effect_name | Baton Pass |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_target |


### 60. Yukiko

Skill 2 · Scarlet Flower

- review_key: `nikke-871:Skill 2:section-3`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `all_allies_except_caster`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"all_allies_except_caster","target_type":"selected_allies","target_count":null,"target_selection":"all_matching_except_caster","target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates when 1 More takes effect. Affects all standard Burst 3 allies (except the skill user) in the Persona state.
Follow Up: ATK ▲ 80.25% of the skill user's ATK for 25 sec.
```

#### Candidate 1

```text
Follow Up: ATK ▲ 80.25% of the skill user's ATK for 25 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | caster_atk_based_atk |
| modifier_type | increase |
| value / unit | 80.25 / caster_atk_percent |
| target / target_type | all standard Burst 3 allies (except the skill user) in the Persona state. / — |
| trigger | Activates when 1 More takes effect |
| condition | Activates when 1 More takes effect. Affects all standard Burst 3 allies (except the skill user) in the Persona state. |
| duration | 25 sec (25 seconds; fixed) |
| parent_effect_name | Follow Up |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_target |


### 61. Eunhwa

Skill 1 · Ready and Able

- review_key: `nikke-92:Skill 1:section-0`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `shots/roundsを持続単位として扱うstat buff文法に未対応です。`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects self. Activates after firing the last round. 
Charge Damage ▲ 37.28% for 2 shots. 
Charge Speed ▲ 15.53% for 2 rounds.
```

#### Candidate 1

```text
Charge Damage ▲ 37.28% for 2 shots.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | charge_damage |
| modifier_type | increase |
| value / unit | 37.28 / percent |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | 2 shots (2 shots; counted) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | parser_failure |

#### Candidate 2

```text
Charge Speed ▲ 15.53% for 2 rounds.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | charge_speed |
| modifier_type | increase |
| value / unit | 15.53 / percent |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | 2 rounds (2 rounds; counted) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | parser_failure |


### 62. Emma: Tactical Upgrade

Skill 2 · LT Formation

- review_key: `nikke-93:Skill 2:section-0`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `same_squad_allies`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"same_squad_allies","target_type":"selected_allies","target_count":null,"target_selection":"same_squad","target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates as long as this unit is still alive.
LT Formation
Function: Issues advantageous combat tactics to the targets.
Effect 1: Affects all allies from the same squad. Critical Damage ▲ 23.51% continuously.
Effect 2: Affects all allies. Projectile Explosion Damage ▲ 2.32% continuously.

Bonus effects while this unit is in the AS Formation state:
Effect 1: Affects all allies. True Damage ▲ 30.97% continuously.
Effect 2: Affects all allies. Projectile Explosion Damage ▲ 3.09% continuously.
Effect 3: Affects self. Exposure activation disabled continuously.
Effect 4: Affects self. Recurring interval of Environment Setup ▼ 20 sec continuously.
```

#### Candidate 1

```text
Effect 1: Affects all allies from the same squad. Critical Damage ▲ 23.51% continuously.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | critical_damage |
| modifier_type | increase |
| value / unit | 23.51 / percent |
| target / target_type | all allies from the same squad. / — |
| trigger | Activates as long as this unit is still alive |
| condition | Activates as long as this unit is still alive.<br>Issues advantageous combat tactics to the targets.<br>Affects all allies from the same squad |
| duration | 継続 (— continuous; continuous) |
| parent_effect_name | LT Formation |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_target |

#### Candidate 2

```text
Effect 2: Affects all allies. Projectile Explosion Damage ▲ 2.32% continuously.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | projectile_explosion_damage |
| modifier_type | increase |
| value / unit | 2.32 / percent |
| target / target_type | all allies. / all_allies |
| trigger | Activates as long as this unit is still alive |
| condition | Activates as long as this unit is still alive.<br>Issues advantageous combat tactics to the targets.<br>Affects all allies |
| duration | 継続 (— continuous; continuous) |
| parent_effect_name | LT Formation |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | (resolved sibling) |

#### Candidate 3

```text
Effect 1: Affects all allies. True Damage ▲ 30.97% continuously.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | true_damage |
| modifier_type | increase |
| value / unit | 30.97 / percent |
| target / target_type | all allies. / all_allies |
| trigger | Activates as long as this unit is still alive |
| condition | Activates as long as this unit is still alive.<br>Affects all allies |
| duration | 継続 (— continuous; continuous) |
| parent_effect_name | Bonus effects while this unit is in the AS Formation state |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | (resolved sibling) |

#### Candidate 4

```text
Effect 2: Affects all allies. Projectile Explosion Damage ▲ 3.09% continuously.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | projectile_explosion_damage |
| modifier_type | increase |
| value / unit | 3.09 / percent |
| target / target_type | all allies. / all_allies |
| trigger | Activates as long as this unit is still alive |
| condition | Activates as long as this unit is still alive.<br>Affects all allies |
| duration | 継続 (— continuous; continuous) |
| parent_effect_name | Bonus effects while this unit is in the AS Formation state |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | (resolved sibling) |

#### Candidate 5

```text
Effect 4: Affects self. Recurring interval of Environment Setup ▼ 20 sec continuously.
```

| Field | Current value |
|---|---|
| effect_type | special_mechanic |
| buff_type | — |
| modifier_type | — |
| value / unit | 20 / seconds |
| target / target_type | self. / self |
| trigger | Activates as long as this unit is still alive |
| condition | Activates as long as this unit is still alive.<br>Affects self |
| duration | 継続 (— continuous; continuous) |
| parent_effect_name | Bonus effects while this unit is in the AS Formation state |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | special_mechanic |


### 63. Emma: Tactical Upgrade

Burst · Battlefield Formation

- review_key: `nikke-93:Burst:section-1`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `special_or_scaling_grammar`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates if this unit is in the Environment Setup state. Affects self.
Enhanced Environment Setup
Function: Enhances Environment Setup.
Duration: 10 sec.
Effect 1: The "Damage Taken" multiplier of Environment Setup is scaled by 100%.
Effect 1 Targets: All enemies

Effect 2: Incoming Healing ▲ 29.04%.
Effect 2 Targets: All allies
```

#### Candidate 1

```text
Effect 1: The "Damage Taken" multiplier of Environment Setup is scaled by 100%.
```

| Field | Current value |
|---|---|
| effect_type | special_mechanic |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | All enemies. / — |
| trigger | Activates if this unit is in the Environment Setup state |
| condition | Activates if this unit is in the Environment Setup state. Affects self.<br>Enhances Environment Setup.<br>Duration: 10 sec.<br>Effect 1 Targets: All enemies<br>Effect 2 Targets: All allies |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | Enhanced Environment Setup |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | special_mechanic |

#### Candidate 2

```text
Effect 2: Incoming Healing ▲ 29.04%.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | incoming_healing |
| modifier_type | increase |
| value / unit | 29.04 / percent |
| target / target_type | All allies. / all_allies |
| trigger | Activates if this unit is in the Environment Setup state |
| condition | Activates if this unit is in the Environment Setup state. Affects self.<br>Enhances Environment Setup.<br>Duration: 10 sec.<br>Effect 1 Targets: All enemies<br>Effect 2 Targets: All allies |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | Enhanced Environment Setup |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | (resolved sibling) |


### 64. Eunhwa: Tactical Upgrade

Skill 2 · AS Formation

- review_key: `nikke-95:Skill 2:section-0`
- 判定: **A — parser rule追加で自動解決可能**
- cause group: `same_squad_allies`
- 根拠: 原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。
- section target proposal: `{"normalized_pattern":"same_squad_allies","target_type":"selected_allies","target_count":null,"target_selection":"same_squad","target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates as long as this unit is alive.
AS Formation
Function: Issues advantageous combat tactics to the targets.
Effect 1: Affects all allies from the same squad. Critical Rate ▲ 8.16% continuously.
Effect 2: Affects all allies. Charge Damage ▲ 41.81% continuously.
Effect 3: Affects self. ATK ▲ 42.24% continuously.

Bonus effects while this unit is in the LT Formation state:
Effect 1: Affects all allies. Projectile Explosion Damage ▲ 5.11% continuously.
Effect 2: Affects all allies. True Damage ▲ 30.97% continuously.
```

#### Candidate 1

```text
Effect 1: Affects all allies from the same squad. Critical Rate ▲ 8.16% continuously.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | critical_rate |
| modifier_type | increase |
| value / unit | 8.16 / percent |
| target / target_type | all allies from the same squad. / — |
| trigger | Activates as long as this unit is alive |
| condition | Activates as long as this unit is alive.<br>Issues advantageous combat tactics to the targets.<br>Affects all allies from the same squad |
| duration | 継続 (— continuous; continuous) |
| parent_effect_name | AS Formation |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_target |

#### Candidate 2

```text
Effect 2: Affects all allies. Charge Damage ▲ 41.81% continuously.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | charge_damage |
| modifier_type | increase |
| value / unit | 41.81 / percent |
| target / target_type | all allies. / all_allies |
| trigger | Activates as long as this unit is alive |
| condition | Activates as long as this unit is alive.<br>Issues advantageous combat tactics to the targets.<br>Affects all allies |
| duration | 継続 (— continuous; continuous) |
| parent_effect_name | AS Formation |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | (resolved sibling) |

#### Candidate 3

```text
Effect 3: Affects self. ATK ▲ 42.24% continuously.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | atk |
| modifier_type | increase |
| value / unit | 42.24 / percent |
| target / target_type | self. / self |
| trigger | Activates as long as this unit is alive |
| condition | Activates as long as this unit is alive.<br>Issues advantageous combat tactics to the targets.<br>Affects self |
| duration | 継続 (— continuous; continuous) |
| parent_effect_name | AS Formation |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | (resolved sibling) |

#### Candidate 4

```text
Effect 1: Affects all allies. Projectile Explosion Damage ▲ 5.11% continuously.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | projectile_explosion_damage |
| modifier_type | increase |
| value / unit | 5.11 / percent |
| target / target_type | all allies. / all_allies |
| trigger | Activates as long as this unit is alive |
| condition | Activates as long as this unit is alive.<br>Affects all allies |
| duration | 継続 (— continuous; continuous) |
| parent_effect_name | Bonus effects while this unit is in the LT Formation state |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | (resolved sibling) |

#### Candidate 5

```text
Effect 2: Affects all allies. True Damage ▲ 30.97% continuously.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | true_damage |
| modifier_type | increase |
| value / unit | 30.97 / percent |
| target / target_type | all allies. / all_allies |
| trigger | Activates as long as this unit is alive |
| condition | Activates as long as this unit is alive.<br>Affects all allies |
| duration | 継続 (— continuous; continuous) |
| parent_effect_name | Bonus effects while this unit is in the LT Formation state |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | (resolved sibling) |


## Flag-only cleanup

0 review sections / 0 candidate occurrences

該当なし。必須軸が完全に確定済みのまま古いflagだけ残る節は、今回の残差141件にはありませんでした。

## Exclude from comparison

60 review sections / 79 candidate occurrences

| Cause group | Sections | Candidates | Characters |
|---|---:|---:|---|
| damage | 17 | 17 | Asuka: WILLE, Bready, Cinderella, Diesel: Winter Sweets, Dorothy, Emilia, Eunhwa: Tactical Upgrade, EVE, iDoll Flower, Little Mermaid, Mihara: Bonding Chain, Phantom, Rapi: Red Hood, Sakura: Bloom in Summer, Vesti |
| metadata | 11 | 19 | Anchor: Innocent Maid, Delta: Ninja Thief, Elegg: Boom and Shock, Emma: Tactical Upgrade, Marciana, Marciana: Marine Study, Sakura: Bloom in Summer, Sora, Yukiko |
| resource | 10 | 14 | Ein, Maiden: Ice Rose, Mihara: Bonding Chain, Neon: Vision Eye |
| weapon_state | 7 | 8 | Cinderella: Crystal Wave, Laplace: Ultimate Hero, Liberalio, Little Mermaid, Maxwell: Ordinary Mechanic, Snow White: Heavy Arms |
| shield_generation | 5 | 5 | Blanc, Ether, Poli, Rapunzel: Pure Grace |
| state_metadata | 5 | 5 | Cinderella, Cinderella: Crystal Wave, Delta, Rei |
| normal_special_noncomparison | 3 | 5 | Ada, Snow White: Heavy Arms, Snow White: Innocent Days |
| damage+penalty | 1 | 3 | Laplace |
| penalty | 1 | 3 | Moran |

### 1. Laplace

Burst · Laplace Buster

- review_key: `nikke-100:Burst:section-0`
- 判定: **C — 比較対象外として確定可能**
- cause group: `damage+penalty`
- 根拠: 未解決candidateはdamage / penaltyで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects self. 
Changes the weapon in use: 
First Damage: 897.6% of final ATK
Normal Damage: 14.52% of final ATK
Duration: 5 sec
Additional Effect: Gains Pierce.
Note: Unable to take cover while using Burst Skill.
```

#### Candidate 1

```text
First Damage: 897.6% of final ATK
```

| Field | Current value |
|---|---|
| effect_type | special_mechanic |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | self. / self |
| trigger | Burst Skill activation |
| condition | Affects self. |
| duration | Instant (— ; unknown) |
| parent_effect_name | First Damage |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | special_mechanic |

#### Candidate 2

```text
Normal Damage: 14.52% of final ATK
```

| Field | Current value |
|---|---|
| effect_type | special_mechanic |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | self. / self |
| trigger | Burst Skill activation |
| condition | Affects self. |
| duration | Instant (— ; unknown) |
| parent_effect_name | Normal Damage |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | special_mechanic |

#### Candidate 3

```text
Note: Unable to take cover while using Burst Skill.
```

| Field | Current value |
|---|---|
| effect_type | special_mechanic |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | self. / self |
| trigger | Burst Skill activation |
| condition | Affects self. |
| duration | Instant (— ; unknown) |
| parent_effect_name | Note |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | special_mechanic |


### 2. Laplace: Ultimate Hero

Skill 1 · Electric Power, Fully Full Charge!

- review_key: `nikke-103:Skill 1:section-2`
- 判定: **C — 比較対象外として確定可能**
- cause group: `weapon_state`
- 根拠: 未解決candidateはweapon_stateで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates when Warm Up is at max stacks. Removes stacks and affects self.
Changes the weapon in use: Electric Power, Fully Full Charge
Damage: 9.45% of final ATK
Max Ammunition Capacity: 120 (max ammunition effects refresh when the weapon in use changes)
Deactivation condition: When all rounds are fired
Additional Effect: Gains Pierce
```

#### Candidate 1

```text
Changes the weapon in use: Electric Power, Fully Full Charge
```

| Field | Current value |
|---|---|
| effect_type | special_mechanic |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | self. / self |
| trigger | Activates when Warm Up is at max stacks. Removes stacks and affects self |
| condition | Activates when Warm Up is at max stacks. Removes stacks and affects self. |
| duration | Instant (— ; unknown) |
| parent_effect_name | Changes the weapon in use |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | special_mechanic |


### 3. Maxwell: Ordinary Mechanic

Burst · Matis UberBuster

- review_key: `nikke-105:Burst:section-0`
- 判定: **C — 比較対象外として確定可能**
- cause group: `weapon_state`
- 根拠: 未解決candidateはweapon_stateで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects self.
Changes the weapon in use: Matis UberBuster
Charge Time is fixed. Effect varies according to the stage of Overcurrent. Only one effect is triggered at a time.
Charge Time: 3sec.
Stage 1 or below: Fixed at 3 sec.
Stage 2: Fixed at 2.5 sec.
Stage 3: Fixed at 2 sec.
Stage 4: Fixed at 1.5 sec.
Stage 5 or above: Fixed at 0.4 sec.
Damage: 350% of final ATK
Full Charge Damage: 300%
Max Ammunition Capacity: 1
Additional Effect: Gains Pierce.
```

#### Candidate 1

```text
Changes the weapon in use: Matis UberBuster
```

| Field | Current value |
|---|---|
| effect_type | special_mechanic |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | self. / self |
| trigger | Burst Skill activation |
| condition | Affects self.<br>Charge Time is fixed. Effect varies according to the stage of Overcurrent. Only one effect is triggered at a time. |
| duration | Instant (— ; unknown) |
| parent_effect_name | Changes the weapon in use |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | special_mechanic |


### 4. Rapi: Red Hood

Skill 2 · Attachable Projectiles

- review_key: `nikke-16:Skill 2:section-1`
- 判定: **C — 比較対象外として確定可能**
- cause group: `damage`
- 根拠: 未解決candidateはdamageで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates after performing 120 normal attacks. Affects self. 
Attachable Projectiles
Effect: Launches attachable projectiles that attach to hit locations. When entering Full Burst, the projectiles explode.
Projectile Attachment Damage: Deals 88.11% of final ATK as damage.
Projectile Explosion Damage: Deals 88.11% of final ATK as damage.
Max Ammunition Capacity: 1 round(s).
```

#### Candidate 1

```text
Activates after performing 120 normal attacks. Affects self. 
Attachable Projectiles
Effect: Launches attachable projectiles that attach to hit locations. When entering Full Burst, the projectiles explode.
Projectile Attachment Damage: Deals 88.11% of final ATK as damage.
Projectile Explosion Damage: Deals 88.11% of final ATK as damage.
Max Ammunition Capacity: 1 round(s).
```

| Field | Current value |
|---|---|
| effect_type | — |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | — (— ; —) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | parser_failure |


### 5. Mihara: Bonding Chain

Skill 1 · Body Contact

- review_key: `nikke-162:Skill 1:section-0`
- 判定: **C — 比較対象外として確定可能**
- cause group: `resource`
- 根拠: 未解決candidateはresourceで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates at the start of battle. Affects self.
Charges Restraint Chains by 10, up to 10.
```

#### Candidate 1

```text
Charges Restraint Chains by 10, up to 10.
```

| Field | Current value |
|---|---|
| effect_type | — |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | — (— ; —) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | missing_value |


### 6. Mihara: Bonding Chain

Skill 1 · Body Contact

- review_key: `nikke-162:Skill 1:section-1`
- 判定: **C — 比較対象外として確定可能**
- cause group: `resource`
- 根拠: 未解決candidateはresourceで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates when Full Burst ends if this unit has just used her Burst Skill. Affects self.
Charges Restraint Chains by 10, up to 10.
```

#### Candidate 1

```text
Charges Restraint Chains by 10, up to 10.
```

| Field | Current value |
|---|---|
| effect_type | — |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | — (— ; —) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | missing_value |


### 7. Mihara: Bonding Chain

Skill 1 · Body Contact

- review_key: `nikke-162:Skill 1:section-3`
- 判定: **C — 比較対象外として確定可能**
- cause group: `damage`
- 根拠: 未解決candidateはdamageで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"explicit_unmapped_target","target_type":"other","target_count":null,"target_selection":"literal_source_target","target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects the same enemy units.
Ensnaring Chains: Deals 25.08% final ATK as sustained damage every second. Stacks up to 20 times. This effect is continuous and cannot be removed.
```

#### Candidate 1

```text
Ensnaring Chains: Deals 25.08% final ATK as sustained damage every second. Stacks up to 20 times. This effect is continuous and cannot be removed.
```

| Field | Current value |
|---|---|
| effect_type | special_mechanic |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | the same enemy units. / — |
| trigger |  |
| condition | Affects the same enemy units. |
| duration | 継続 (— ; unknown) |
| parent_effect_name | Ensnaring Chains |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | special_mechanic |


### 8. Neon: Vision Eye

Skill 2 · Firepower Charge

- review_key: `nikke-18:Skill 2:section-0`
- 判定: **C — 比較対象外として確定可能**
- cause group: `resource`
- 根拠: 未解決candidateはresourceで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates at the start of battle. Affects self.
Increases the Firepower Gauge's charge by 100.
```

#### Candidate 1

```text
Increases the Firepower Gauge's charge by 100.
```

| Field | Current value |
|---|---|
| effect_type | — |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | — (— ; —) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | missing_value |


### 9. Neon: Vision Eye

Skill 2 · Firepower Charge

- review_key: `nikke-18:Skill 2:section-1`
- 判定: **C — 比較対象外として確定可能**
- cause group: `resource`
- 根拠: 未解決candidateはresourceで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates when performing a normal attack while in Firepower Charge status. Affects self.
Increases the Firepower Gauge's charge by 2.
```

#### Candidate 1

```text
Increases the Firepower Gauge's charge by 2.
```

| Field | Current value |
|---|---|
| effect_type | — |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | — (— ; —) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | missing_value |


### 10. Neon: Vision Eye

Skill 2 · Firepower Charge

- review_key: `nikke-18:Skill 2:section-2`
- 判定: **C — 比較対象外として確定可能**
- cause group: `resource`
- 根拠: 未解決candidateはresourceで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates when Firepower Charge ends. Affects self.
Increases the Firepower Gauge's charge by 45.
```

#### Candidate 1

```text
Increases the Firepower Gauge's charge by 45.
```

| Field | Current value |
|---|---|
| effect_type | — |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | — (— ; —) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | missing_value |


### 11. Neon: Vision Eye

Burst · Super Firepower

- review_key: `nikke-18:Burst:section-0`
- 判定: **C — 比較対象外として確定可能**
- cause group: `resource`
- 根拠: 未解決candidateはresourceで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates when the Firepower Gauge's charge is lower than 100. Affects self.
Firepower Charge: Charges the Firepower Gauge for 10 sec. This effect cannot be removed.
Increases the Firepower Gauge's charge by 1.
```

#### Candidate 1

```text
Firepower Charge: Charges the Firepower Gauge for 10 sec. This effect cannot be removed.
```

| Field | Current value |
|---|---|
| effect_type | special_mechanic |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | self. / self |
| trigger | Activates when the Firepower Gauge's charge is lower than 100 |
| condition | Activates when the Firepower Gauge's charge is lower than 100. Affects self. |
| duration | 10 sec (— ; unknown) |
| parent_effect_name | Firepower Charge |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | special_mechanic |

#### Candidate 2

```text
Increases the Firepower Gauge's charge by 1.
```

| Field | Current value |
|---|---|
| effect_type | special_mechanic |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | self. / self |
| trigger | Activates when the Firepower Gauge's charge is lower than 100 |
| condition | Activates when the Firepower Gauge's charge is lower than 100. Affects self. |
| duration | Instant (— ; unknown) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | special_mechanic |


### 12. Neon: Vision Eye

Burst · Super Firepower

- review_key: `nikke-18:Burst:section-1`
- 判定: **C — 比較対象外として確定可能**
- cause group: `resource`
- 根拠: 未解決candidateはresourceで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates when the Firepower Gauge's charge is at 100. Affects self.
Super Firepower: Attack Damage ▲ 45.03% for 10 sec.
Decreases the Firepower Gauge's charge by 100.
```

#### Candidate 1

```text
Super Firepower: Attack Damage ▲ 45.03% for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | attack_damage |
| modifier_type | increase |
| value / unit | 45.03 / percent |
| target / target_type | self. / self |
| trigger | Activates when the Firepower Gauge's charge is at 100 |
| condition | Activates when the Firepower Gauge's charge is at 100. Affects self. |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | Super Firepower |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | (resolved sibling) |

#### Candidate 2

```text
Decreases the Firepower Gauge's charge by 100.
```

| Field | Current value |
|---|---|
| effect_type | special_mechanic |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | self. / self |
| trigger | Activates when the Firepower Gauge's charge is at 100 |
| condition | Activates when the Firepower Gauge's charge is at 100. Affects self. |
| duration | Instant (— ; unknown) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | special_mechanic |


### 13. Maiden: Ice Rose

Skill 1 · Meditation

- review_key: `nikke-183:Skill 1:section-1`
- 判定: **C — 比較対象外として確定可能**
- cause group: `resource`
- 根拠: 未解決candidateはresourceで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates when entering Full Burst when this unit has 1 or more MP. Affects self.
Replenishes 1 MP, up to a maximum of 12. All MP is removed when using Burst Skill.
```

#### Candidate 1

```text
Replenishes 1 MP, up to a maximum of 12. All MP is removed when using Burst Skill.
```

| Field | Current value |
|---|---|
| effect_type | — |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | — (— ; —) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_value + missing_value |


### 14. Delta

Burst · Remember Me

- review_key: `nikke-20:Burst:section-0`
- 判定: **C — 比較対象外として確定可能**
- cause group: `state_metadata`
- 根拠: 未解決candidateはstate_metadataで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects self.
Decoy: Creates an avatar with 91.68% of the skill user's final max HP that lasts for 10 sec.
Attract: Taunts all enemies for 10 sec.
```

#### Candidate 1

```text
Decoy: Creates an avatar with 91.68% of the skill user's final max HP that lasts for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | special_mechanic |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | self. / self |
| trigger | Burst Skill activation |
| condition | Affects self. |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | Decoy |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | special_mechanic |


### 15. Snow White: Innocent Days

Burst · Seven Dwarves III

- review_key: `nikke-224:Burst:section-0`
- 判定: **C — 比較対象外として確定可能**
- cause group: `normal_special_noncomparison`
- 根拠: special mechanicの種類と役割は原文から確定でき、比較用effectではなくmetadata/noncomparisonとして扱えます。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects self.
Hit count required for Skill 2 ▼ 20 time(s) for 10 sec.
ATK ▲ 97.2% for 10 sec.
Unlimited ammunition for 10 sec.
```

#### Candidate 1

```text
Hit count required for Skill 2 ▼ 20 time(s) for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | special_mechanic |
| buff_type | — |
| modifier_type | — |
| value / unit | 20 / seconds |
| target / target_type | self. / self |
| trigger | Burst Skill activation |
| condition | Affects self. |
| duration | 10 sec (— ; unknown) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | special_mechanic |

#### Candidate 2

```text
ATK ▲ 97.2% for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | atk |
| modifier_type | increase |
| value / unit | 97.2 / percent |
| target / target_type | self. / self |
| trigger | Burst Skill activation |
| condition | Affects self. |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | (resolved sibling) |

#### Candidate 3

```text
Unlimited ammunition for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | unlimited_ammo |
| modifier_type | grant |
| value / unit | true / boolean |
| target / target_type | self. / self |
| trigger | Burst Skill activation |
| condition | Affects self. |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | (resolved sibling) |


### 16. Rapunzel: Pure Grace

Skill 1 · Sanctuary

- review_key: `nikke-226:Skill 1:section-0`
- 判定: **C — 比較対象外として確定可能**
- cause group: `shield_generation`
- 根拠: 未解決candidateはshield_generationで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates at the start of battle. Affects self.
Creates a shared shield with HP equal to 20.59% of the skill user's final max HP. This effect is continuous.
```

#### Candidate 1

```text
Creates a shared shield with HP equal to 20.59% of the skill user's final max HP. This effect is continuous.
```

| Field | Current value |
|---|---|
| effect_type | — |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | — (— ; —) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_value |


### 17. Rapunzel: Pure Grace

Skill 1 · Sanctuary

- review_key: `nikke-226:Skill 1:section-1`
- 判定: **C — 比較対象外として確定可能**
- cause group: `shield_generation`
- 根拠: 未解決candidateはshield_generationで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates when using Burst Skill. Affects self.
Creates a shared shield with HP equal to 20.59% of the skill user's final max HP. This effect is continuous.
```

#### Candidate 1

```text
Creates a shared shield with HP equal to 20.59% of the skill user's final max HP. This effect is continuous.
```

| Field | Current value |
|---|---|
| effect_type | — |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | — (— ; —) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_value |


### 18. Delta: Ninja Thief

Skill 2 · Ninjutsu Camouflage

- review_key: `nikke-23:Skill 2:section-2`
- 判定: **C — 比較対象外として確定可能**
- cause group: `metadata`
- 根拠: 未解決candidateはmetadataで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates every 4 sec while in the Ninjutsu Injection state. Affects self.
Ninjutsu IFAK: Lasts for 4 sec.
Function: Stores up HP recovery for a time, after which all allies are healed for the stored amount.
Effect 1: The maximum amount stored is equal to 165.28% of the skill user's final ATK.
Effect 2: Once the duration ends, all allies are healed for the stored recovery amount.
```

#### Candidate 1

```text
Effect 1: The maximum amount stored is equal to 165.28% of the skill user's final ATK.
```

| Field | Current value |
|---|---|
| effect_type | special_mechanic |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | self. / self |
| trigger | Activates every 4 sec while in the Ninjutsu Injection state |
| condition | Activates every 4 sec while in the Ninjutsu Injection state. Affects self.<br>Stores up HP recovery for a time, after which all allies are healed for the stored amount.<br>Ninjutsu IFAK: Lasts for 4 sec. |
| duration | 4 sec (4 seconds; fixed) |
| parent_effect_name | Ninjutsu IFAK |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | special_mechanic |

#### Candidate 2

```text
Effect 2: Once the duration ends, all allies are healed for the stored recovery amount.
```

| Field | Current value |
|---|---|
| effect_type | special_mechanic |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | self. / self |
| trigger | Activates every 4 sec while in the Ninjutsu Injection state |
| condition | Activates every 4 sec while in the Ninjutsu Injection state. Affects self.<br>Stores up HP recovery for a time, after which all allies are healed for the stored amount.<br>Ninjutsu IFAK: Lasts for 4 sec. |
| duration | 4 sec (4 seconds; fixed) |
| parent_effect_name | Ninjutsu IFAK |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | special_mechanic |


### 19. Dorothy

Burst · Paradise Lost

- review_key: `nikke-233:Burst:section-1`
- 判定: **C — 比較対象外として確定可能**
- cause group: `damage`
- 根拠: 未解決candidateはdamageで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"explicit_unmapped_target","target_type":"other","target_count":null,"target_selection":"literal_source_target","target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects a designated enemy.
Brand: Accumulates total damage dealt to the designated enemy during the duration, and then deals that accumulated damage to all enemies as distributed damage once the duration ends. The maximum accumulated damage is 8900.83% of the skill user's final ATK. Lasts for 10 sec.
```

#### Candidate 1

```text
Brand: Accumulates total damage dealt to the designated enemy during the duration, and then deals that accumulated damage to all enemies as distributed damage once the duration ends. The maximum accumulated damage is 8900.83% of the skill user's final ATK. Lasts for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | special_mechanic |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | a designated enemy. / — |
| trigger | Burst Skill activation |
| condition | Affects a designated enemy. |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | Brand |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | special_mechanic |


### 20. Liberalio

Skill 2 · Strange Currents

- review_key: `nikke-262:Skill 2:section-1`
- 判定: **C — 比較対象外として確定可能**
- cause group: `weapon_state`
- 根拠: 未解決candidateはweapon_stateで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates when landing a Full Charge attack against a Rapture that is not the stage target. Affects self.
Gentle Current: Fixes charge time at 1 sec continuously.
Removes Raging Current.
```

#### Candidate 1

```text
Gentle Current: Fixes charge time at 1 sec continuously.
```

| Field | Current value |
|---|---|
| effect_type | special_mechanic |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | self. / self |
| trigger | Activates when landing a Full Charge attack against a Rapture that is not the stage target |
| condition | Activates when landing a Full Charge attack against a Rapture that is not the stage target. Affects self. |
| duration | 継続 (— continuous; continuous) |
| parent_effect_name | Gentle Current |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | special_mechanic |


### 21. Blanc

Skill 1 · Lucky Guard

- review_key: `nikke-270:Skill 1:section-0`
- 判定: **C — 比較対象外として確定可能**
- cause group: `shield_generation`
- 根拠: 未解決candidateはshield_generationで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"all_allies","target_type":"all_allies","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates after 120 normal attacks.
Creates a shared shield with HP equal to 11.8% of the skill user's final max HP that protects all allies from damage. Lasts for 5 sec.
```

#### Candidate 1

```text
Creates a shared shield with HP equal to 11.8% of the skill user's final max HP that protects all allies from damage. Lasts for 5 sec.
```

| Field | Current value |
|---|---|
| effect_type | — |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | — (— ; —) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_target + ambiguous_value |


### 22. Moran

Burst · Fair and Square!

- review_key: `nikke-281:Burst:section-0`
- 判定: **C — 比較対象外として確定可能**
- cause group: `penalty`
- 根拠: 未解決candidateはpenaltyで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects self.
Changes the weapon in use:
Damage: 14.7% of final ATK 
Duration: 10 sec
Additional Effect(s):
Restores HP equal to 36.14% of attack damage. Lasts for 10 sec.
Attract: Taunts all enemies for 10 sec.
Unlimited ammunition for 10 sec.
Note: Unable to take cover while using Burst Skill.
```

#### Candidate 1

```text
Restores HP equal to 36.14% of attack damage. Lasts for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | heal |
| buff_type | attack_damage_based_heal |
| modifier_type | restore |
| value / unit | 36.14 / percent_of_attack_damage |
| target / target_type | self. / self |
| trigger | Burst Skill activation |
| condition | Affects self. |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | Additional Effect(s) |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | (resolved sibling) |

#### Candidate 2

```text
Unlimited ammunition for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | unlimited_ammo |
| modifier_type | grant |
| value / unit | true / boolean |
| target / target_type | self. / self |
| trigger | Burst Skill activation |
| condition | Affects self. |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | Additional Effect(s) |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | (resolved sibling) |

#### Candidate 3

```text
Note: Unable to take cover while using Burst Skill.
```

| Field | Current value |
|---|---|
| effect_type | special_mechanic |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | self. / self |
| trigger | Burst Skill activation |
| condition | Affects self. |
| duration | Instant (— ; unknown) |
| parent_effect_name | Note |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | special_mechanic |


### 23. Sakura: Bloom in Summer

Skill 1 · Bloom

- review_key: `nikke-284:Skill 1:section-0`
- 判定: **C — 比較対象外として確定可能**
- cause group: `metadata`
- 根拠: 未解決candidateはmetadataで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates at the start of battle. Affects self.
Forcefully uses Skill 2.
```

#### Candidate 1

```text
Forcefully uses Skill 2.
```

| Field | Current value |
|---|---|
| effect_type | — |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | — (— ; —) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | missing_value |


### 24. Sakura: Bloom in Summer

Burst · Ephemeral Splendor

- review_key: `nikke-284:Burst:section-0`
- 判定: **C — 比較対象外として確定可能**
- cause group: `damage`
- 根拠: 未解決candidateはdamageで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"explicit_unmapped_target","target_type":"other","target_count":null,"target_selection":"literal_source_target","target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects random enemies.
Deals 457.14% of final ATK as damage. Attacks sequentially 10 times.
```

#### Candidate 1

```text
Deals 457.14% of final ATK as damage. Attacks sequentially 10 times.
```

| Field | Current value |
|---|---|
| effect_type | — |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | — (— ; —) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_value + not_a_buff_candidate |


### 25. Sakura: Bloom in Summer

Burst · Ephemeral Splendor

- review_key: `nikke-284:Burst:section-1`
- 判定: **C — 比較対象外として確定可能**
- cause group: `damage`
- 根拠: 未解決candidateはdamageで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"same_targets","target_type":"other","target_count":null,"target_selection":"inherit_previous_section_targets","target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects the same targets.
Deals 35.16% of final ATK as sustained damage every second. Stacks up to 10 times and lasts for 10 sec.
```

#### Candidate 1

```text
Deals 35.16% of final ATK as sustained damage every second. Stacks up to 10 times and lasts for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | — |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | — (— ; —) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_target + ambiguous_value + special_mechanic + not_a_buff_candidate |


### 26. Ether

Burst · Colossal Single Cell

- review_key: `nikke-291:Burst:section-0`
- 判定: **C — 比較対象外として確定可能**
- cause group: `shield_generation`
- 根拠: 未解決candidateはshield_generationで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"explicit_unmapped_target","target_type":"other","target_count":null,"target_selection":"literal_source_target","target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects the 3 ally unit(s) with the lowest remaining HP.
Creates a shield with HP equal to 96% of the the skill user's final max HP that lasts for 5 sec.
```

#### Candidate 1

```text
Creates a shield with HP equal to 96% of the the skill user's final max HP that lasts for 5 sec.
```

| Field | Current value |
|---|---|
| effect_type | — |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | — (— ; —) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_value + not_a_buff_candidate |


### 27. Poli

Burst · Poli's Defense Line

- review_key: `nikke-30:Burst:section-0`
- 判定: **C — 比較対象外として確定可能**
- cause group: `shield_generation`
- 根拠: 未解決candidateはshield_generationで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects self.
Creates a shared shield with HP equal to 22.27% of the skill user's final max HP that protects all allies from damage. Lasts for 10 sec.
```

#### Candidate 1

```text
Creates a shared shield with HP equal to 22.27% of the skill user's final max HP that protects all allies from damage. Lasts for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | — |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | — (— ; —) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_value |


### 28. iDoll Flower

Burst · Perennial Perfume

- review_key: `nikke-304:Burst:section-0`
- 判定: **C — 比較対象外として確定可能**
- cause group: `damage`
- 根拠: 未解決candidateはdamageで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"explicit_unmapped_target","target_type":"other","target_count":null,"target_selection":"literal_source_target","target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects 1 enemy unit(s) with the highest final ATK.
Deals 330.61% of final ATK as Burst Skill damage.
Taunt for 2 sec.
```

#### Candidate 1

```text
Deals 330.61% of final ATK as Burst Skill damage.
```

| Field | Current value |
|---|---|
| effect_type | — |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | — (— ; —) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_value + not_a_buff_candidate |


### 29. Marciana

Burst · A Teacher's Grace

- review_key: `nikke-321:Burst:section-0`
- 判定: **C — 比較対象外として確定可能**
- cause group: `metadata`
- 根拠: 未解決candidateはmetadataで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"all_allies","target_type":"all_allies","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects all allies.
Storage: Stores excess incoming healing, up to 27.87% of the skill user's max HP. Lasts for 10 sec.
DEF ▲ 20.9% of the skill user's DEF for 10 sec.
```

#### Candidate 1

```text
Storage: Stores excess incoming healing, up to 27.87% of the skill user's max HP. Lasts for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | special_mechanic |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | all allies. / all_allies |
| trigger | Burst Skill activation |
| condition | Affects all allies. |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | Storage |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | special_mechanic |

#### Candidate 2

```text
DEF ▲ 20.9% of the skill user's DEF for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | caster_def_based_def |
| modifier_type | increase |
| value / unit | 20.9 / caster_def_percent |
| target / target_type | all allies. / all_allies |
| trigger | Burst Skill activation |
| condition | Affects all allies. |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | (resolved sibling) |


### 30. Marciana: Marine Study

Skill 1 · Emergency Whistle

- review_key: `nikke-322:Skill 1:section-0`
- 判定: **C — 比較対象外として確定可能**
- cause group: `metadata`
- 根拠: 未解決candidateはmetadataで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"explicit_unmapped_target","target_type":"other","target_count":null,"target_selection":"literal_source_target","target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates when entering Full Burst after this unit uses her Burst Skill. Affects the 1 enemy unit(s) with the highest final max HP.
Flagged Target Designation
Effect 1: Deals 3789.25% of final ATK as additional damage.
Effect 2: Activates when the target is alive.
Flagged Target: ATK ▼ 10.56% for 10 sec.
```

#### Candidate 1

```text
Effect 2: Activates when the target is alive.
```

| Field | Current value |
|---|---|
| effect_type | special_mechanic |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | the 1 enemy unit(s) with the highest final max HP. / — |
| trigger | Activates when entering Full Burst after this unit uses her Burst Skill |
| condition | Activates when entering Full Burst after this unit uses her Burst Skill. Affects the 1 enemy unit(s) with the highest final max HP. |
| duration | Instant (— ; unknown) |
| parent_effect_name | Flagged Target Designation |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | special_mechanic |


### 31. Marciana: Marine Study

Skill 1 · Emergency Whistle

- review_key: `nikke-322:Skill 1:section-1`
- 判定: **C — 比較対象外として確定可能**
- cause group: `metadata`
- 根拠: 未解決candidateはmetadataで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"explicit_unmapped_target","target_type":"other","target_count":null,"target_selection":"literal_source_target","target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates when an enemy is neutralized if the target is in the Flagged Target state. Affects 1 random enemy unit(s).
Flagged Target Designation
Effect 1: Deals 3789.25% of final ATK as additional damage.
Effect 2: Activates when the target is alive.
Flagged Target: ATK ▼ 10.56% for 10 sec.
```

#### Candidate 1

```text
Effect 2: Activates when the target is alive.
```

| Field | Current value |
|---|---|
| effect_type | special_mechanic |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | 1 random enemy unit(s). / — |
| trigger | Activates when an enemy is neutralized if the target is in the Flagged Target state |
| condition | Activates when an enemy is neutralized if the target is in the Flagged Target state. Affects 1 random enemy unit(s). |
| duration | Instant (— ; unknown) |
| parent_effect_name | Flagged Target Designation |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | special_mechanic |


### 32. Anchor: Innocent Maid

Burst · Seaside Stroll

- review_key: `nikke-355:Burst:section-0`
- 判定: **C — 比較対象外として確定可能**
- cause group: `metadata`
- 根拠: 未解決candidateはmetadataで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"all_allies","target_type":"all_allies","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects all allies.
Storage: Stores excess incoming healing, up to 60.19% of the skill user's max HP. Lasts for 25 sec.
Restores HP equal to 40.18% of the skill user's max HP.
ATK ▲ 30.09% of the skill user's ATK for 10 sec.
```

#### Candidate 1

```text
Storage: Stores excess incoming healing, up to 60.19% of the skill user's max HP. Lasts for 25 sec.
```

| Field | Current value |
|---|---|
| effect_type | special_mechanic |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | all allies. / all_allies |
| trigger | Burst Skill activation |
| condition | Affects all allies. |
| duration | 25 sec (25 seconds; fixed) |
| parent_effect_name | Storage |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | special_mechanic |

#### Candidate 2

```text
Restores HP equal to 40.18% of the skill user's max HP.
```

| Field | Current value |
|---|---|
| effect_type | heal |
| buff_type | caster_max_hp_based_heal |
| modifier_type | restore |
| value / unit | 40.18 / caster_max_hp_percent |
| target / target_type | all allies. / all_allies |
| trigger | Burst Skill activation |
| condition | Affects all allies. |
| duration | Instant (— ; instant) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | (resolved sibling) |

#### Candidate 3

```text
ATK ▲ 30.09% of the skill user's ATK for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | caster_atk_based_atk |
| modifier_type | increase |
| value / unit | 30.09 / caster_atk_percent |
| target / target_type | all allies. / all_allies |
| trigger | Burst Skill activation |
| condition | Affects all allies. |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | (resolved sibling) |


### 33. Ein

Skill 1 · Feather Standby

- review_key: `nikke-391:Skill 1:section-0`
- 判定: **C — 比較対象外として確定可能**
- cause group: `resource`
- 根拠: 未解決candidateはresourceで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates at the start of battle. Affects self.
Summons 4 Near Feathers.
```

#### Candidate 1

```text
Summons 4 Near Feathers.
```

| Field | Current value |
|---|---|
| effect_type | — |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | — (— ; —) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | missing_value |


### 34. Ein

Burst · Feather All-Range

- review_key: `nikke-391:Burst:section-0`
- 判定: **C — 比較対象外として確定可能**
- cause group: `resource`
- 根拠: 未解決candidateはresourceで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects self.
Summons 6 Near Feathers.
True Damage ▲ 55.3% for 10 sec.
Charge Damage ▲ 140.68% for 10 sec.
```

#### Candidate 1

```text
Summons 6 Near Feathers.
```

| Field | Current value |
|---|---|
| effect_type | special_mechanic |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | self. / self |
| trigger | Burst Skill activation |
| condition | Affects self. |
| duration | Instant (— ; unknown) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | special_mechanic |

#### Candidate 2

```text
True Damage ▲ 55.3% for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | true_damage |
| modifier_type | increase |
| value / unit | 55.3 / percent |
| target / target_type | self. / self |
| trigger | Burst Skill activation |
| condition | Affects self. |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | (resolved sibling) |

#### Candidate 3

```text
Charge Damage ▲ 140.68% for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | charge_damage |
| modifier_type | increase |
| value / unit | 140.68 / percent |
| target / target_type | self. / self |
| trigger | Burst Skill activation |
| condition | Affects self. |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | (resolved sibling) |


### 35. Rei

Skill 2 · Senior Spirit

- review_key: `nikke-392:Skill 2:section-0`
- 判定: **C — 比較対象外として確定可能**
- cause group: `state_metadata`
- 根拠: 未解決candidateはstate_metadataで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates at the start of battle. Affects self.
Decoy: Creates an avatar with 96% of the skill user's final max HP that lasts for 240 sec.
```

#### Candidate 1

```text
Decoy: Creates an avatar with 96% of the skill user's final max HP that lasts for 240 sec.
```

| Field | Current value |
|---|---|
| effect_type | special_mechanic |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | self. / self |
| trigger | Activates at the start of battle |
| condition | Activates at the start of battle. Affects self. |
| duration | 240 sec (240 seconds; fixed) |
| parent_effect_name | Decoy |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | special_mechanic |


### 36. Snow White: Heavy Arms

Skill 1 · Seven Dwarves V+VI

- review_key: `nikke-471:Skill 1:section-4`
- 判定: **C — 比較対象外として確定可能**
- cause group: `normal_special_noncomparison`
- 根拠: special mechanicの種類と役割は原文から確定でき、比較用effectではなくmetadata/noncomparisonとして扱えます。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates when performing a Full Charge attack while in the Seven Dwarves Fully Active state. Affects self.
Number of uses of Seven Dwarves Fully Active ▼ 1.
```

#### Candidate 1

```text
Number of uses of Seven Dwarves Fully Active ▼ 1.
```

| Field | Current value |
|---|---|
| effect_type | special_mechanic |
| buff_type | — |
| modifier_type | — |
| value / unit | 1 / flat_value |
| target / target_type | self. / self |
| trigger | Activates when performing a Full Charge attack while in the Seven Dwarves Fully Active state |
| condition | Activates when performing a Full Charge attack while in the Seven Dwarves Fully Active state. Affects self. |
| duration | Instant (— ; unknown) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | special_mechanic |


### 37. Snow White: Heavy Arms

Skill 2 · Shades of White

- review_key: `nikke-471:Skill 2:section-0`
- 判定: **C — 比較対象外として確定可能**
- cause group: `weapon_state`
- 根拠: 未解決candidateはweapon_stateで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates at the start of battle. Affects self.
Fixes charge time at 1.2 sec continuously.
```

#### Candidate 1

```text
Fixes charge time at 1.2 sec continuously.
```

| Field | Current value |
|---|---|
| effect_type | — |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | — (— ; —) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | parser_failure |


### 38. Snow White: Heavy Arms

Burst · Seven Dwarves Fully Active

- review_key: `nikke-471:Burst:section-0`
- 判定: **C — 比較対象外として確定可能**
- cause group: `weapon_state`
- 根拠: 未解決candidateはweapon_stateで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects self.
Attack Damage ▲ 84.48% for 10 sec.
Seven Dwarves Fully Active
Function: Increases max number of Lock-On targets and max ammo loaded by Auto Fire Ready, but also increases Charge Time.
Number of uses: 2
Effect 1: Fixes charge time at 3.2 sec continuously.
Effect 2: Max Lock-On targets ▲ 10 continuously.
Effect 3: Max ammo loaded by Auto Fire Ready ▲ 10 continuously.
Deactivation condition: When the number of uses reaches 0.
```

#### Candidate 1

```text
Attack Damage ▲ 84.48% for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | attack_damage |
| modifier_type | increase |
| value / unit | 84.48 / percent |
| target / target_type | self. / self |
| trigger | Burst Skill activation |
| condition | Affects self. |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | (resolved sibling) |

#### Candidate 2

```text
Effect 1: Fixes charge time at 3.2 sec continuously.
```

| Field | Current value |
|---|---|
| effect_type | special_mechanic |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | self. / self |
| trigger | Burst Skill activation |
| condition | Affects self.<br>Increases max number of Lock-On targets and max ammo loaded by Auto Fire Ready, but also increases Charge Time.<br>Deactivation condition: When the number of uses reaches 0. |
| duration | 継続 (— until_condition; conditional) |
| parent_effect_name | Seven Dwarves Fully Active |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | special_mechanic |


### 39. Elegg: Boom and Shock

Skill 1 · Hello Ghost

- review_key: `nikke-502:Skill 1:section-0`
- 判定: **C — 比較対象外として確定可能**
- cause group: `metadata`
- 根拠: 未解決candidateはmetadataで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"explicit_unmapped_target","target_type":"other","target_count":null,"target_selection":"literal_source_target","target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates at the start of battle. Affects 1 random enemy.
Possession lasts for 6 sec.
Ability: Find and capture ghosts possessing the enemy.
Required hit count: 100 time(s) in total, cumulative across all allies.
Effect: Captures 1 ghost when the required hit count reaches 100%. A maximum of 13 ghost(s) can be captured.
Recurring interval: 6 sec
```

#### Candidate 1

```text
Recurring interval: 6 sec
```

| Field | Current value |
|---|---|
| effect_type | special_mechanic |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | 1 random enemy. / — |
| trigger | Activates at the start of battle |
| condition | Activates at the start of battle. Affects 1 random enemy. |
| duration | Instant (— ; unknown) |
| parent_effect_name | Recurring interval |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | special_mechanic |


### 40. Cinderella

Skill 2 · Dirt-Resistant Mirror

- review_key: `nikke-511:Skill 2:section-0`
- 判定: **C — 比較対象外として確定可能**
- cause group: `state_metadata`
- 根拠: 未解決candidateはstate_metadataで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates at the start of battle. Affects self.
Decoy: Creates an avatar with 96% of the skill user's final max HP. This effect is continuous.
```

#### Candidate 1

```text
Decoy: Creates an avatar with 96% of the skill user's final max HP. This effect is continuous.
```

| Field | Current value |
|---|---|
| effect_type | special_mechanic |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | self. / self |
| trigger | Activates at the start of battle |
| condition | Activates at the start of battle. Affects self. |
| duration | 継続 (— continuous; continuous) |
| parent_effect_name | Decoy |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | special_mechanic |


### 41. Cinderella

Skill 2 · Dirt-Resistant Mirror

- review_key: `nikke-511:Skill 2:section-1`
- 判定: **C — 比較対象外として確定可能**
- cause group: `state_metadata`
- 根拠: 未解決candidateはstate_metadataで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates when entering Burst Skill Stage 3. Affects self.
Decoy: Creates an avatar with 96% of the skill user's final max HP. This effect is continuous.
```

#### Candidate 1

```text
Decoy: Creates an avatar with 96% of the skill user's final max HP. This effect is continuous.
```

| Field | Current value |
|---|---|
| effect_type | special_mechanic |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | self. / self |
| trigger | Activates when entering Burst Skill Stage 3 |
| condition | Activates when entering Burst Skill Stage 3. Affects self. |
| duration | 継続 (— continuous; continuous) |
| parent_effect_name | Decoy |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | special_mechanic |


### 42. Cinderella

Burst · Glass Slippers. Full Contact.

- review_key: `nikke-511:Burst:section-0`
- 判定: **C — 比較対象外として確定可能**
- cause group: `damage`
- 根拠: 未解決candidateはdamageで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"explicit_unmapped_target","target_type":"other","target_count":null,"target_selection":"literal_source_target","target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects random enemies.
Deals 1365.92% of final ATK as damage. Attacks sequentially 10 times.
```

#### Candidate 1

```text
Deals 1365.92% of final ATK as damage. Attacks sequentially 10 times.
```

| Field | Current value |
|---|---|
| effect_type | — |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | — (— ; —) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_value + not_a_buff_candidate |


### 43. Cinderella

Burst · Glass Slippers. Full Contact.

- review_key: `nikke-511:Burst:section-1`
- 判定: **C — 比較対象外として確定可能**
- cause group: `damage`
- 根拠: 未解決candidateはdamageで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"same_targets","target_type":"other","target_count":null,"target_selection":"inherit_previous_section_targets","target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates if this unit is in the Beautiful state. Affects the same targets.
Deals 28.9% of final ATK as additional damage. Mirrors the stack count of Beautiful.
```

#### Candidate 1

```text
Deals 28.9% of final ATK as additional damage. Mirrors the stack count of Beautiful.
```

| Field | Current value |
|---|---|
| effect_type | — |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | — (— ; —) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_target + ambiguous_value + special_mechanic + not_a_buff_candidate |


### 44. Little Mermaid

Skill 1 · Bubble Order

- review_key: `nikke-513:Skill 1:section-0`
- 判定: **C — 比較対象外として確定可能**
- cause group: `weapon_state`
- 根拠: 未解決candidateはweapon_stateで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"all_allies","target_type":"all_allies","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates only when in Focusing status. Affects all allies.
Focuses fire continuously.
```

#### Candidate 1

```text
Focuses fire continuously.
```

| Field | Current value |
|---|---|
| effect_type | — |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | — (— ; —) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | missing_value |


### 45. Little Mermaid

Skill 2 · Bubble Wave

- review_key: `nikke-513:Skill 2:section-2`
- 判定: **C — 比較対象外として確定可能**
- cause group: `damage`
- 根拠: 未解決candidateはdamageで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"explicit_unmapped_target","target_type":"other","target_count":null,"target_selection":"literal_source_target","target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates every 1 sec only during Full Burst. Affects random enemy units.
Deals 63.36% of final ATK as damage. Attacks sequentially 4 times.
```

#### Candidate 1

```text
Deals 63.36% of final ATK as damage. Attacks sequentially 4 times.
```

| Field | Current value |
|---|---|
| effect_type | — |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | — (— ; —) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_value + not_a_buff_candidate |


### 46. Cinderella: Crystal Wave

Skill 1 · Beauty-Full

- review_key: `nikke-515:Skill 1:section-0`
- 判定: **C — 比較対象外として確定可能**
- cause group: `weapon_state`
- 根拠: 未解決candidateはweapon_stateで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates upon reloading to max ammunition while in the Preparation for Change state. Affects self.
Changes the weapon in use: Snipe Mode
Charge Time: 1 sec
Damage: 62.13% of final ATK
Full Charge Damage: 250% of damage
Max Ammunition Capacity: 15 (max ammunition effects refresh after reloading)
Additional Effect 1: Gains Pierce.
Additional Effect 2: Activates when performing a Full Charge attack. Expends ammo. Amount: 40 round(s).
Additional Effect 3: Charge time is fixed at 1 sec.
Removal Condition: Reloading to max ammunition while in the Preparation for Change state.
```

#### Candidate 1

```text
Changes the weapon in use: Snipe Mode
```

| Field | Current value |
|---|---|
| effect_type | special_mechanic |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | self. / self |
| trigger | Activates upon reloading to max ammunition while in the Preparation for Change state |
| condition | Activates upon reloading to max ammunition while in the Preparation for Change state. Affects self. |
| duration | Instant (— ; unknown) |
| parent_effect_name | Changes the weapon in use |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | special_mechanic |


### 47. Cinderella: Crystal Wave

Skill 2 · Mode Swap

- review_key: `nikke-515:Skill 2:section-0`
- 判定: **C — 比較対象外として確定可能**
- cause group: `state_metadata`
- 根拠: 未解決candidateはstate_metadataで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates at the start of battle and when using Burst Skill. Affects self.
Decoy: Creates an avatar with 70.34% of the skill user's final max HP. This effect is continuous.
```

#### Candidate 1

```text
Decoy: Creates an avatar with 70.34% of the skill user's final max HP. This effect is continuous.
```

| Field | Current value |
|---|---|
| effect_type | special_mechanic |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | self. / self |
| trigger | Activates at the start of battle and when using Burst Skill |
| condition | Activates at the start of battle and when using Burst Skill. Affects self. |
| duration | 継続 (— continuous; continuous) |
| parent_effect_name | Decoy |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | special_mechanic |


### 48. Bready

Skill 2 · Favorite Candy

- review_key: `nikke-520:Skill 2:section-0`
- 判定: **C — 比較対象外として確定可能**
- cause group: `damage`
- 根拠: 未解決candidateはdamageで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"named_or_current_target","target_type":"other","target_count":null,"target_selection":"current_named_target","target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates after landing 3 Full Charge attacks while in the Lingering Taste state. Affects the target.
Damage Taken ▲ 10.2% for 5 sec.
Aftertaste: Deals  150.04% of final ATK as sustained damage every second for 5 sec.
```

#### Candidate 1

```text
Aftertaste: Deals  150.04% of final ATK as sustained damage every second for 5 sec.
```

| Field | Current value |
|---|---|
| effect_type | special_mechanic |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | the target. / — |
| trigger | Activates after landing 3 Full Charge attacks while in the Lingering Taste state |
| condition | Activates after landing 3 Full Charge attacks while in the Lingering Taste state. Affects the target. |
| duration | 5 sec (— ; unknown) |
| parent_effect_name | Aftertaste |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | special_mechanic |


### 49. Sora

Skill 2 · Secret Carry-On

- review_key: `nikke-532:Skill 2:section-0`
- 判定: **C — 比較対象外として確定可能**
- cause group: `metadata`
- 根拠: 未解決candidateはmetadataで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"all_allies","target_type":"all_allies","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates when an ally or self destroys an enemy's part. Affects all allies.
Storage: Stores excess incoming healing, up to 5.36% of the skill user's max HP. Stacks up to 5 times and lasts for 15 sec.
ATK ▲ 23.74% of the skill user's ATK for 15 sec.
```

#### Candidate 1

```text
Storage: Stores excess incoming healing, up to 5.36% of the skill user's max HP. Stacks up to 5 times and lasts for 15 sec.
```

| Field | Current value |
|---|---|
| effect_type | special_mechanic |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | all allies. / all_allies |
| trigger | Activates when an ally or self destroys an enemy's part |
| condition | Activates when an ally or self destroys an enemy's part. Affects all allies. |
| duration | 15 sec (15 seconds; fixed) |
| parent_effect_name | Storage |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | special_mechanic |

#### Candidate 2

```text
ATK ▲ 23.74% of the skill user's ATK for 15 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | caster_atk_based_atk |
| modifier_type | increase |
| value / unit | 23.74 / caster_atk_percent |
| target / target_type | all allies. / all_allies |
| trigger | Activates when an ally or self destroys an enemy's part |
| condition | Activates when an ally or self destroys an enemy's part. Affects all allies. |
| duration | 15 sec (15 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | (resolved sibling) |


### 50. Phantom

Skill 2 · Thief's Vision

- review_key: `nikke-580:Skill 2:section-0`
- 判定: **C — 比較対象外として確定可能**
- cause group: `damage`
- 根拠: 未解決candidateはdamageで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"explicit_unmapped_target","target_type":"other","target_count":null,"target_selection":"literal_source_target","target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates when Thief's Dagger is at max stacks. Affects targets in the Calling Card state.
Deals 84.33% of final ATK as additional damage. Removes Calling Card.
```

#### Candidate 1

```text
Deals 84.33% of final ATK as additional damage. Removes Calling Card.
```

| Field | Current value |
|---|---|
| effect_type | — |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | — (— ; —) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_target + ambiguous_value + special_mechanic + not_a_buff_candidate |


### 51. Diesel: Winter Sweets

Skill 2 · I'm Gonna Sing Now!

- review_key: `nikke-75:Skill 2:section-3`
- 判定: **C — 比較対象外として確定可能**
- cause group: `damage`
- 根拠: 未解決candidateはdamageで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"explicit_unmapped_target","target_type":"other","target_count":null,"target_selection":"literal_source_target","target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates when entering Full Burst. Affects the stage target.
Deals 63.33% of final ATK as sustained damage every second for 9 sec.
```

#### Candidate 1

```text
Deals 63.33% of final ATK as sustained damage every second for 9 sec.
```

| Field | Current value |
|---|---|
| effect_type | — |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | — (— ; —) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_value + not_a_buff_candidate |


### 52. Emilia

Skill 2 · Great Spirit's Mace

- review_key: `nikke-821:Skill 2:section-0`
- 判定: **C — 比較対象外として確定可能**
- cause group: `damage`
- 根拠: 未解決candidateはdamageで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"explicit_unmapped_target","target_type":"other","target_count":null,"target_selection":"literal_source_target","target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates when hitting a target with Full Charge. Affects target(s).
Deals Fixed Damage to the main body equal to 58.99% of the damage dealt by self.
```

#### Candidate 1

```text
Deals Fixed Damage to the main body equal to 58.99% of the damage dealt by self.
```

| Field | Current value |
|---|---|
| effect_type | — |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | — (— ; —) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_value + not_a_buff_candidate |


### 53. Asuka: WILLE

Burst · Annihilation State

- review_key: `nikke-835:Burst:section-1`
- 判定: **C — 比較対象外として確定可能**
- cause group: `damage`
- 根拠: 未解決candidateはdamageで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"named_or_current_target","target_type":"other","target_count":null,"target_selection":"current_named_target","target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects the target(s) afflicted with Anti A.T. Field.
Annihilation
Function: After Annihilation State ends, fires powerful attacks at targets affected by Anti A.T. Field.
Deals 6.62% of final ATK as additional damage. Mirrors the stack count of Anti A.T. Field for certain targets. Anti A.T. Field status is removed after the effect is triggered.
```

#### Candidate 1

```text
Affects the target(s) afflicted with Anti A.T. Field.
Annihilation
Function: After Annihilation State ends, fires powerful attacks at targets affected by Anti A.T. Field.
Deals 6.62% of final ATK as additional damage. Mirrors the stack count of Anti A.T. Field for certain targets. Anti A.T. Field status is removed after the effect is triggered.
```

| Field | Current value |
|---|---|
| effect_type | — |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | — (— ; —) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | parser_failure |


### 54. Ada

Skill 2 · Flash Grenade

- review_key: `nikke-840:Skill 2:section-1`
- 判定: **C — 比較対象外として確定可能**
- cause group: `normal_special_noncomparison`
- 根拠: special mechanicの種類と役割は原文から確定でき、比較用effectではなくmetadata/noncomparisonとして扱えます。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates when using Burst Skill. Affects self.
Flash Grenade Toss activation time condition ▼ 1 sec for 10 sec.
```

#### Candidate 1

```text
Flash Grenade Toss activation time condition ▼ 1 sec for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | special_mechanic |
| buff_type | — |
| modifier_type | — |
| value / unit | 1 / seconds |
| target / target_type | self. / self |
| trigger | Activates when using Burst Skill |
| condition | Activates when using Burst Skill. Affects self. |
| duration | 10 sec (— ; unknown) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | special_mechanic |


### 55. EVE

Burst · Counter Chain

- review_key: `nikke-850:Burst:section-0`
- 判定: **C — 比較対象外として確定可能**
- cause group: `damage`
- 根拠: 未解決candidateはdamageで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"explicit_unmapped_target","target_type":"other","target_count":null,"target_selection":"literal_source_target","target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects random enemy units.
Deals 457.14% of final ATK as damage. Attacks sequentially 6 times.
```

#### Candidate 1

```text
Deals 457.14% of final ATK as damage. Attacks sequentially 6 times.
```

| Field | Current value |
|---|---|
| effect_type | — |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | — (— ; —) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_value + not_a_buff_candidate |


### 56. Yukiko

Skill 1 · Persona: Konohana Sakuya

- review_key: `nikke-871:Skill 1:section-0`
- 判定: **C — 比較対象外として確定可能**
- cause group: `metadata`
- 根拠: 未解決candidateはmetadataで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates at the start of battle. Affects self.
Persona - Konohana Sakuya: This effect is continuous and cannot be removed. 
Function: Yukiko heals her allies using her Persona.
Effect 1: Activates every 3 sec. Affects all allies. Media: Restores HP equal to 5.7% of the skill user's final max HP.
```

#### Candidate 1

```text
Effect 1: Activates every 3 sec. Affects all allies. Media: Restores HP equal to 5.7% of the skill user's final max HP.
```

| Field | Current value |
|---|---|
| effect_type | special_mechanic |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | all allies. / all_allies |
| trigger | Activates every 3 sec |
| condition | Activates at the start of battle. Affects self.<br>Yukiko heals her allies using her Persona.<br>This effect is continuous and cannot be removed.<br>Activates every 3 sec<br>Affects all allies |
| duration | Instant (— ; unknown) |
| parent_effect_name | Persona - Konohana Sakuya |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | special_mechanic |


### 57. Yukiko

Skill 2 · Scarlet Flower

- review_key: `nikke-871:Skill 2:section-1`
- 判定: **C — 比較対象外として確定可能**
- cause group: `metadata`
- 根拠: 未解決candidateはmetadataで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"all_allies","target_type":"all_allies","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates when using Burst Skill. 
Scarlet Flower: This effect is continuous and cannot be removed.
Function: Yukiko strengthens herself.
Effect 1: Activates every 3 sec. Affects all allies. Mediarama: Restores HP equal to 5.7% of the skill user's final max HP.
Effect 2: Affects self. Fire Amp: Distributed Damage ▲ 90.01% continuously. This effect cannot be removed.
Effect 3: Affects self. Scarlet Protection: Damage taken from Water Code enemies ▼ 17.95% continuously. This effect cannot be removed.
Deactivation condition: When Full Burst ends.
```

#### Candidate 1

```text
Effect 1: Activates every 3 sec. Affects all allies. Mediarama: Restores HP equal to 5.7% of the skill user's final max HP.
```

| Field | Current value |
|---|---|
| effect_type | special_mechanic |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | all allies. / all_allies |
| trigger | Activates every 3 sec |
| condition | Activates when using Burst Skill.<br>Yukiko strengthens herself.<br>This effect is continuous and cannot be removed.<br>Deactivation condition: When Full Burst ends.<br>Activates every 3 sec<br>Affects all allies |
| duration | Until When Full Burst ends. (— until_condition; conditional) |
| parent_effect_name | Scarlet Flower |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | special_mechanic |

#### Candidate 2

```text
Effect 2: Affects self. Fire Amp: Distributed Damage ▲ 90.01% continuously. This effect cannot be removed.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | distributed_damage |
| modifier_type | increase |
| value / unit | 90.01 / percent |
| target / target_type | self. / self |
| trigger | Activates when using Burst Skill |
| condition | Activates when using Burst Skill.<br>Yukiko strengthens herself.<br>This effect is continuous and cannot be removed.<br>Deactivation condition: When Full Burst ends.<br>Affects self |
| duration | 継続 (— until_condition; conditional) |
| parent_effect_name | Fire Amp |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | (resolved sibling) |

#### Candidate 3

```text
Effect 3: Affects self. Scarlet Protection: Damage taken from Water Code enemies ▼ 17.95% continuously. This effect cannot be removed.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | damage_taken_from_element |
| modifier_type | decrease |
| value / unit | 17.95 / percent |
| target / target_type | self. / self |
| trigger | Activates when using Burst Skill |
| condition | Activates when using Burst Skill.<br>Yukiko strengthens herself.<br>This effect is continuous and cannot be removed.<br>Deactivation condition: When Full Burst ends.<br>Affects self |
| duration | 継続 (— until_condition; conditional) |
| parent_effect_name | Scarlet Protection |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | (resolved sibling) |


### 58. Vesti

Burst · Justifiable Defense

- review_key: `nikke-91:Burst:section-0`
- 判定: **C — 比較対象外として確定可能**
- cause group: `damage`
- 根拠: 未解決candidateはdamageで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects self.
Deploys two Missile Containers that deal 15.56% of final ATK as damage to the enemy with the lowest remaining HP every second for 18 sec.
```

#### Candidate 1

```text
Deploys two Missile Containers that deal 15.56% of final ATK as damage to the enemy with the lowest remaining HP every second for 18 sec.
```

| Field | Current value |
|---|---|
| effect_type | — |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | — (— ; —) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_value |


### 59. Emma: Tactical Upgrade

Skill 1 · Environment Setup

- review_key: `nikke-93:Skill 1:section-0`
- 判定: **C — 比較対象外として確定可能**
- cause group: `metadata`
- 根拠: 未解決candidateはmetadataで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates at the start of battle. Affects self.
Environment Setup
Function: Sprays a solution into the surroundings to create an advantageous battlefield.
Effect 1: Damage Taken ▲ 3.9% for 10 sec.
Effect 1 Targets: All enemies (including those that appear during Environment Setup)

Effect 2: Environment Setup: Restores HP equal to 2.32% of the skill user's final max HP every second for 10 sec.
Effect 2 Targets: All allies

Recurring interval: 30 sec
```

#### Candidate 1

```text
Effect 2: Environment Setup: Restores HP equal to 2.32% of the skill user's final max HP every second for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | heal |
| buff_type | caster_max_hp_based_heal |
| modifier_type | restore |
| value / unit | 2.32 / caster_max_hp_percent |
| target / target_type | All allies. / all_allies |
| trigger | Activates at the start of battle |
| condition | Activates at the start of battle. Affects self.<br>Sprays a solution into the surroundings to create an advantageous battlefield.<br>Effect 1 Targets: All enemies (including those that appear during Environment Setup)<br>Effect 2 Targets: All allies |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | Environment Setup |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | (resolved sibling) |

#### Candidate 2

```text
Recurring interval: 30 sec
```

| Field | Current value |
|---|---|
| effect_type | special_mechanic |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | self. / self |
| trigger | Activates at the start of battle |
| condition | Activates at the start of battle. Affects self. |
| duration | Instant (— ; unknown) |
| parent_effect_name | Recurring interval |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | special_mechanic |


### 60. Eunhwa: Tactical Upgrade

Burst · Explosive Round

- review_key: `nikke-95:Burst:section-0`
- 判定: **C — 比較対象外として確定可能**
- cause group: `damage`
- 根拠: 未解決candidateはdamageで、今回の比較effectsから除外できます。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects self.
Changes the weapon in use:
Charge time: 0.3 sec
Damage: 105.6% of final ATK as true damage
Full Charge damage: 300% of damage
Max Ammunition Capacity: 1 round(s)
Special note: Fires an Exploding Bullet dealing area-of-effect damage. 
Additional effect:
Target: Target(s) hit
Effect: Explosive Round: Damage Taken ▲ 27.87% for 10 sec.
```

#### Candidate 1

```text
Special note: Fires an Exploding Bullet dealing area-of-effect damage.
```

| Field | Current value |
|---|---|
| effect_type | special_mechanic |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | self. / self |
| trigger | Burst Skill activation |
| condition | Affects self. |
| duration | Instant (— ; unknown) |
| parent_effect_name | Special note |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | special_mechanic |


## Human judgement required

17 review sections / 21 candidate occurrences

| Cause group | Sections | Candidates | Characters |
|---|---:|---:|---|
| source_or_semantic_limitation | 17 | 21 | Anis, Anne: Miracle Fairy, Centi, Grave, Guilty, Helm, iDoll Sun, Lily, Poli, Quency, Rosanna: Chic Ocean, Sakura: Bloom in Summer, Sin, Soldier OW, Takina, Trina, Yulha |

### 1. Anis

Skill 2 · C.H. Formation

- review_key: `nikke-12:Skill 2:section-0`
- 判定: **D — 原文または意味関係が不足し、人間判断が必要**
- cause group: `source_or_semantic_limitation`
- 根拠: source sectionに発動triggerが明示されていません。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects self and the 2 allies with the highest final ATK (other than the skill user). 
DEF ▲ 80% for 5 sec. 
Equally shares damage taken for 10 sec.
```

#### Candidate 1

```text
DEF ▲ 80% for 5 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | def |
| modifier_type | increase |
| value / unit | 80 / percent |
| target / target_type | self and the 2 allies with the highest final ATK (other than the skill user). / selected_allies |
| trigger |  |
| condition | Affects self and the 2 allies with the highest final ATK (other than the skill user). |
| duration | 5 sec (5 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_trigger |

#### Candidate 2

```text
Equally shares damage taken for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | damage_share |
| modifier_type | grant |
| value / unit | true / boolean |
| target / target_type | self and the 2 allies with the highest final ATK (other than the skill user). / selected_allies |
| trigger |  |
| condition | Affects self and the 2 allies with the highest final ATK (other than the skill user). |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_trigger |


### 2. Anne: Miracle Fairy

Skill 2 · Fairy's Jest

- review_key: `nikke-121:Skill 2:section-0`
- 判定: **D — 原文または意味関係が不足し、人間判断が必要**
- cause group: `source_or_semantic_limitation`
- 根拠: 効果値は明示されていますが、持続時間が原文にありません。
- section target proposal: `{"normalized_pattern":"all_allies","target_type":"all_allies","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects all allies. Activates when above 90% HP.
Incoming Healing ▲ 23.46%.
```

#### Candidate 1

```text
Incoming Healing ▲ 23.46%.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | incoming_healing |
| modifier_type | increase |
| value / unit | 23.46 / percent |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | Instant (— ; instant) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_duration |


### 3. Yulha

Skill 2 · The Weakener

- review_key: `nikke-171:Skill 2:section-0`
- 判定: **D — 原文または意味関係が不足し、人間判断が必要**
- cause group: `source_or_semantic_limitation`
- 根拠: source sectionに発動triggerが明示されていません。
- section target proposal: `{"normalized_pattern":"all_allies","target_type":"all_allies","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects all allies.
ATK ▲ 90.75% for 5 sec. 
Equally shares damage taken for 10 sec.
```

#### Candidate 1

```text
ATK ▲ 90.75% for 5 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | atk |
| modifier_type | increase |
| value / unit | 90.75 / percent |
| target / target_type | all allies. / all_allies |
| trigger |  |
| condition | Affects all allies. |
| duration | 5 sec (5 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_trigger |

#### Candidate 2

```text
Equally shares damage taken for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | damage_share |
| modifier_type | grant |
| value / unit | true / boolean |
| target / target_type | all allies. / all_allies |
| trigger |  |
| condition | Affects all allies. |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_trigger |


### 4. Rosanna: Chic Ocean

Skill 2 · Spina di Rosa

- review_key: `nikke-283:Skill 2:section-0`
- 判定: **D — 原文または意味関係が不足し、人間判断が必要**
- cause group: `source_or_semantic_limitation`
- 根拠: source sectionに発動triggerが明示されていません。
- section target proposal: `{"normalized_pattern":"all_allies","target_type":"all_allies","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects all allies.
Damage to Parts ▲ 24.26% for 15 sec.
```

#### Candidate 1

```text
Damage to Parts ▲ 24.26% for 15 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | parts_damage |
| modifier_type | increase |
| value / unit | 24.26 / percent |
| target / target_type | all allies. / all_allies |
| trigger |  |
| condition | Affects all allies. |
| duration | 15 sec (15 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_trigger |


### 5. Sakura: Bloom in Summer

Skill 2 · Full Glory

- review_key: `nikke-284:Skill 2:section-0`
- 判定: **D — 原文または意味関係が不足し、人間判断が必要**
- cause group: `source_or_semantic_limitation`
- 根拠: source sectionに発動triggerが明示されていません。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects self.
Dancing Flower: Attack Damage ▲ 15.64% for 15 sec.
```

#### Candidate 1

```text
Dancing Flower: Attack Damage ▲ 15.64% for 15 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | attack_damage |
| modifier_type | increase |
| value / unit | 15.64 / percent |
| target / target_type | self. / self |
| trigger |  |
| condition | Affects self. |
| duration | 15 sec (15 seconds; fixed) |
| parent_effect_name | Dancing Flower |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_trigger |


### 6. Poli

Skill 2 · That's a Good Boy

- review_key: `nikke-30:Skill 2:section-0`
- 判定: **D — 原文または意味関係が不足し、人間判断が必要**
- cause group: `source_or_semantic_limitation`
- 根拠: source sectionに発動triggerが明示されていません。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects self and 2 ally unit(s) with the lowest remaining HP (except the skill user). 
DEF ▲ 23.51% for 10 sec. 
Equally shares damage taken for 10 sec.
```

#### Candidate 1

```text
DEF ▲ 23.51% for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | def |
| modifier_type | increase |
| value / unit | 23.51 / percent |
| target / target_type | self and 2 ally unit(s) with the lowest remaining HP (except the skill user). / selected_allies |
| trigger |  |
| condition | Affects self and 2 ally unit(s) with the lowest remaining HP (except the skill user). |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_trigger |

#### Candidate 2

```text
Equally shares damage taken for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | damage_share |
| modifier_type | grant |
| value / unit | true / boolean |
| target / target_type | self and 2 ally unit(s) with the lowest remaining HP (except the skill user). / selected_allies |
| trigger |  |
| condition | Affects self and 2 ally unit(s) with the lowest remaining HP (except the skill user). |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_trigger |


### 7. Soldier OW

Skill 2 · Owl Wind

- review_key: `nikke-306:Skill 2:section-0`
- 判定: **D — 原文または意味関係が不足し、人間判断が必要**
- cause group: `source_or_semantic_limitation`
- 根拠: source sectionに発動triggerが明示されていません。
- section target proposal: `{"normalized_pattern":"explicit_unmapped_target","target_type":"other","target_count":null,"target_selection":"literal_source_target","target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects 3 ally unit(s) with the highest final ATK. 
Cover's DEF ▲ 128.57% for 5 sec.
```

#### Candidate 1

```text
Cover's DEF ▲ 128.57% for 5 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | cover_def |
| modifier_type | increase |
| value / unit | 128.57 / percent |
| target / target_type | 3 ally unit(s) with the highest final ATK. / selected_allies |
| trigger |  |
| condition | Affects 3 ally unit(s) with the highest final ATK. |
| duration | 5 sec (5 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_trigger |


### 8. iDoll Sun

Skill 2 · Sunlight

- review_key: `nikke-308:Skill 2:section-0`
- 判定: **D — 原文または意味関係が不足し、人間判断が必要**
- cause group: `source_or_semantic_limitation`
- 根拠: 対象を示す文が原文になく、被攻撃時の発動者自身と断定できません。
- section target proposal: `{"normalized_pattern":"missing_target_expression","target_type":null,"target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
There is a 20% chance of activating when attacked. 
ATK ▲ 9.09% for 5 sec.
```

#### Candidate 1

```text
ATK ▲ 9.09% for 5 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | atk |
| modifier_type | increase |
| value / unit | 9.09 / percent |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | 5 sec (5 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_target |


### 9. Helm

Skill 2 · Fire Away

- review_key: `nikke-352:Skill 2:section-0`
- 判定: **D — 原文または意味関係が不足し、人間判断が必要**
- cause group: `source_or_semantic_limitation`
- 根拠: source sectionに発動triggerが明示されていません。
- section target proposal: `{"normalized_pattern":"all_allies","target_type":"all_allies","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects all allies.
Damage to Interruption Parts ▲3.08% permanently.
```

#### Candidate 1

```text
Damage to Interruption Parts ▲3.08% permanently.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | interruption_parts_damage |
| modifier_type | increase |
| value / unit | 3.08 / percent |
| target / target_type | all allies. / all_allies |
| trigger |  |
| condition | Affects all allies. |
| duration | Permanent (— permanent; unknown) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_trigger |


### 10. Guilty

Skill 1 · Mind If I Borrow This?

- review_key: `nikke-400:Skill 1:section-0`
- 判定: **D — 原文または意味関係が不足し、人間判断が必要**
- cause group: `source_or_semantic_limitation`
- 根拠: 他者ATKの複製とstackの意味を通常caster-based ATKへ落とすかは方針判断が必要です。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates after performing 6 normal attacks. Affects self.
Mind If I Borrow This?: Duplicates 8.81% of the ATK of the ally with the highest ATK. Stacks up to 5 times and lasts for 10 sec.
```

#### Candidate 1

```text
Mind If I Borrow This?: Duplicates 8.81% of the ATK of the ally with the highest ATK. Stacks up to 5 times and lasts for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | — |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | — (— ; —) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_value + special_mechanic |


### 11. Sin

Skill 1 · Full Stop

- review_key: `nikke-401:Skill 1:section-0`
- 判定: **D — 原文または意味関係が不足し、人間判断が必要**
- cause group: `source_or_semantic_limitation`
- 根拠: 他者Max HPの複製値を通常Max HP buffとして扱うか、copy mechanicとして扱うかは方針判断が必要です。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates when firing the last bullet. Affects self.
Duplicates 15.03% of the max HP of ally with the highest max HP. Lasts for 5 sec.
Attract: Taunts all enemies for 5 sec.
```

#### Candidate 1

```text
Duplicates 15.03% of the max HP of ally with the highest max HP. Lasts for 5 sec.
```

| Field | Current value |
|---|---|
| effect_type | — |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | — (— ; —) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_value + not_a_buff_candidate |


### 12. Quency

Skill 1 · New Route

- review_key: `nikke-402:Skill 1:section-0`
- 判定: **D — 原文または意味関係が不足し、人間判断が必要**
- cause group: `source_or_semantic_limitation`
- 根拠: 他者Max HPの複製値を通常Max HP buffとして扱うか、copy mechanicとして扱うかは方針判断が必要です。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates after performing 60 normal attacks. Affects self.
Duplicates 12.42% of the max HP of the Nikke with the highest max HP. Lasts for 10 sec.
```

#### Candidate 1

```text
Duplicates 12.42% of the max HP of the Nikke with the highest max HP. Lasts for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | — |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | — (— ; —) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_value |


### 13. Trina

Burst · Mother Forest

- review_key: `nikke-412:Burst:section-3`
- 判定: **D — 原文または意味関係が不足し、人間判断が必要**
- cause group: `source_or_semantic_limitation`
- 根拠: Burst activationは暗黙に想定できますが、該当sectionの原文にtriggerが明示されていません。
- section target proposal: `{"normalized_pattern":"element_and_weapon_limited_allies","target_type":"other","target_count":null,"target_selection":"all_matching","target_condition":null,"target_class":null,"target_weapon":"assault rifles","target_element":"electric"}`

#### Source section全文

```text
Affects all Electric Code allies with assault rifles.
Hit Rate ▲ 45.3% for 10 sec.
Max Ammunition Capacity ▲ 20 round(s) for 10 sec.
```

#### Candidate 1

```text
Hit Rate ▲ 45.3% for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | hit_rate |
| modifier_type | increase |
| value / unit | 45.3 / percent |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_target + ambiguous_trigger |

#### Candidate 2

```text
Max Ammunition Capacity ▲ 20 round(s) for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | max_ammo |
| modifier_type | increase |
| value / unit | 20 / count |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_target + ambiguous_trigger |


### 14. Grave

Skill 1 · Heat Emission

- review_key: `nikke-514:Skill 1:section-0`
- 判定: **D — 原文または意味関係が不足し、人間判断が必要**
- cause group: `source_or_semantic_limitation`
- 根拠: 終了条件が「under certain conditions」としか書かれておらず、具体条件を確定できません。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Activates when Prediction ends. Affects self.
Removes 100% of ammo.
Heat Emission: Reload Ratio ▼ 50%. Removes Heat Emission under certain conditions.
```

#### Candidate 1

```text
Heat Emission: Reload Ratio ▼ 50%. Removes Heat Emission under certain conditions.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | reload_ratio |
| modifier_type | decrease |
| value / unit | 50 / percent |
| target / target_type | self. / self |
| trigger | Activates when Prediction ends |
| condition | Activates when Prediction ends. Affects self. |
| duration |  (— ; unknown) |
| parent_effect_name | Heat Emission |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_duration |


### 15. Centi

Skill 2 · Field Discussion

- review_key: `nikke-80:Skill 2:section-0`
- 判定: **D — 原文または意味関係が不足し、人間判断が必要**
- cause group: `source_or_semantic_limitation`
- 根拠: source sectionに発動triggerが明示されていません。
- section target proposal: `{"normalized_pattern":"self","target_type":"self","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects self.
Creates a shared shield with HP equal to 6.38% of the skill user's final max HP that protects all allies from damage. Lasts for 5 sec.
```

#### Candidate 1

```text
Creates a shared shield with HP equal to 6.38% of the skill user's final max HP that protects all allies from damage. Lasts for 5 sec.
```

| Field | Current value |
|---|---|
| effect_type | — |
| buff_type | — |
| modifier_type | — |
| value / unit | — / — |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | — (— ; —) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_value + ambiguous_trigger |


### 16. Lily

Skill 1 · Precise Adjustment

- review_key: `nikke-852:Skill 1:section-0`
- 判定: **D — 原文または意味関係が不足し、人間判断が必要**
- cause group: `source_or_semantic_limitation`
- 根拠: source sectionに発動triggerが明示されていません。
- section target proposal: `{"normalized_pattern":"random_ally","target_type":"selected_allies","target_count":1,"target_selection":"random","target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects 1 random ally unit.
ATK ▲ 20% of the skill user's ATK for 5 sec.
```

#### Candidate 1

```text
ATK ▲ 20% of the skill user's ATK for 5 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | caster_atk_based_atk |
| modifier_type | increase |
| value / unit | 20 / caster_atk_percent |
| target / target_type | — / — |
| trigger | — |
| condition | — |
| duration | 5 sec (5 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_target + ambiguous_trigger |


### 17. Takina

Skill 2 · Battlefield Control

- review_key: `nikke-861:Skill 2:section-1`
- 判定: **D — 原文または意味関係が不足し、人間判断が必要**
- cause group: `source_or_semantic_limitation`
- 根拠: source sectionに発動triggerが明示されていません。
- section target proposal: `{"normalized_pattern":"all_allies","target_type":"all_allies","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null}`

#### Source section全文

```text
Affects all allies.
True Damage ▲ 140.49% for 10 sec.
```

#### Candidate 1

```text
True Damage ▲ 140.49% for 10 sec.
```

| Field | Current value |
|---|---|
| effect_type | buff |
| buff_type | true_damage |
| modifier_type | increase |
| value / unit | 140.49 / percent |
| target / target_type | all allies. / all_allies |
| trigger |  |
| condition | Affects all allies. |
| duration | 10 sec (10 seconds; fixed) |
| parent_effect_name | — |
| section_condition | null |
| special_type | — |
| resource_type | — |
| needs_review_reasons | ambiguous_trigger |


## Focused diagnostics

### special_mechanic

- 48 review sections
- normal special / noncomparisonでreview不要: 35 sections
- parser rule候補: 12 sections
- human judgement: 1 sections

| Character | Skill | Category | Source line | Semantic type | Name | Target required | Value required | Standalone | Metadata-only |
|---|---|---|---|---|---|---|---|---|---|
| Laplace | Burst / Laplace Buster | C | First Damage: 897.6% of final ATK | damage_mechanic | First Damage | false | true | true | false |
| Laplace | Burst / Laplace Buster | C | Normal Damage: 14.52% of final ATK | damage_mechanic | Normal Damage | false | true | true | false |
| Laplace | Burst / Laplace Buster | C | Note: Unable to take cover while using Burst Skill. | penalty_metadata | unable_to_take_cover | false | false | false | true |
| Laplace: Ultimate Hero | Skill 1 / Electric Power, Fully Full Charge! | C | Changes the weapon in use: Electric Power, Fully Full Charge | weapon_specification | electric power, fully full charge | false | false | false | true |
| Maxwell: Ordinary Mechanic | Burst / Matis UberBuster | C | Changes the weapon in use: Matis UberBuster | weapon_specification | matis uberbuster | false | false | false | true |
| E.H. | Skill 1 / Homemade Magazine | A | Effect 3: ATK ▲ 7.5% continuously x the number of homemade magazines. | copy_or_scaling | — | true | true | true | false |
| Rapi: Red Hood | Skill 2 / Attachable Projectiles | A | Converts damage to Elemental Advantage damage against Electric Code enemies. This effect is continuous and cannot be removed. | damage_conversion | elemental_advantage_conversion | true | true | true | false |
| Mihara: Bonding Chain | Skill 1 / Body Contact | C | Ensnaring Chains: Deals 25.08% final ATK as sustained damage every second. Stacks up to 20 times. This effect is continuous and cannot be removed. | damage_mechanic | Ensnaring Chains | false | true | true | false |
| Neon: Vision Eye | Burst / Super Firepower | C | Firepower Charge: Charges the Firepower Gauge for 10 sec. This effect cannot be removed. | resource_operation | firepower gauge | false | true | true | false |
| Neon: Vision Eye | Burst / Super Firepower | C | Increases the Firepower Gauge's charge by 1. | resource_operation | firepower gauge | false | true | true | false |
| Neon: Vision Eye | Burst / Super Firepower | C | Decreases the Firepower Gauge's charge by 100. | resource_operation | firepower gauge | false | true | true | false |
| Delta | Burst / Remember Me | C | Decoy: Creates an avatar with 91.68% of the skill user's final max HP that lasts for 10 sec. | decoy_state | Decoy | false | true | true | false |
| Snow White: Innocent Days | Burst / Seven Dwarves III | C | Hit count required for Skill 2 ▼ 20 time(s) for 10 sec. | skill_or_weapon_parameter | hit count required | false | false | false | true |
| Delta: Ninja Thief | Skill 2 / Ninjutsu Camouflage | C | Effect 1: The maximum amount stored is equal to 165.28% of the skill user's final ATK. | storage_parameter | Ninjutsu IFAK | false | false | false | true |
| Delta: Ninja Thief | Skill 2 / Ninjutsu Camouflage | C | Effect 2: Once the duration ends, all allies are healed for the stored recovery amount. | trigger_or_state_metadata | Ninjutsu IFAK | false | false | false | true |
| Dorothy | Burst / Paradise Lost | C | Brand: Accumulates total damage dealt to the designated enemy during the duration, and then deals that accumulated damage to all enemies as distributed damage once the duration ends. The maximum accumulated damage is 8900.83% of the skill user's final ATK. Lasts for 10 sec. | damage_mechanic | Brand | false | false | true | false |
| Modernia | Skill 1 / High-Speed Evolution | A | Critical Damage ▲ 14.25%. Stacks up to 5 times and lasts for 10 sec. | unclassified_special | — | true | true | true | false |
| Modernia | Skill 1 / High-Speed Evolution | A | Max Ammunition Capacity ▼ 5.04%. Stacks up to 5 times and lasts for 10 sec. | unclassified_special | — | true | true | true | false |
| Liberalio | Skill 2 / Strange Currents | C | Gentle Current: Fixes charge time at 1 sec continuously. | skill_or_weapon_parameter | charge time | false | false | false | true |
| Moran | Burst / Fair and Square! | C | Note: Unable to take cover while using Burst Skill. | penalty_metadata | unable_to_take_cover | false | false | false | true |
| Sakura | Skill 1 / Cherry Blossom Tea | A | Cherry Blossom Tea: 8.15% of DEF. Stacks up to 10 times and lasts for 15 sec. | unclassified_special | Cherry Blossom Tea | true | true | true | false |
| Sakura: Bloom in Summer | Burst / Ephemeral Splendor | C | Deals 35.16% of final ATK as sustained damage every second. Stacks up to 10 times and lasts for 10 sec. | damage_mechanic | — | false | true | true | false |
| Marciana | Burst / A Teacher's Grace | C | Storage: Stores excess incoming healing, up to 27.87% of the skill user's max HP. Lasts for 10 sec. | healing_storage_state | Storage | false | false | false | true |
| Marciana: Marine Study | Skill 1 / Emergency Whistle | C | Effect 2: Activates when the target is alive. | trigger_or_state_metadata | Flagged Target Designation | false | false | false | true |
| Marciana: Marine Study | Skill 1 / Emergency Whistle | C | Effect 2: Activates when the target is alive. | trigger_or_state_metadata | Flagged Target Designation | false | false | false | true |
| Mast: Romantic Maid | Skill 2 / A Pirate's Spirit | A | Distributed Damage ▲ 15.03% x number of Drunken stacks for 10 sec. | copy_or_scaling | — | true | true | true | false |
| Mast: Romantic Maid | Skill 2 / A Pirate's Spirit | A | Reload Speed ▲ 15.04% x number of Drunken stacks for 10 sec. | copy_or_scaling | — | true | true | true | false |
| Mast: Romantic Maid | Burst / A Pirate's Romance | A | ATK ▲ (20.06% * Number of Drunken stacks) of the skill user's ATK for 10 sec. | beneficial_effect | — | true | true | true | false |
| Anchor: Innocent Maid | Skill 1 / Starfish (Shaped) Omurice | A | Three times: Decreases the stack count of stackable debuffs by 1. | beneficial_effect | — | true | true | true | false |
| Anchor: Innocent Maid | Burst / Seaside Stroll | C | Storage: Stores excess incoming healing, up to 60.19% of the skill user's max HP. Lasts for 25 sec. | healing_storage_state | Storage | false | false | false | true |
| Ein | Burst / Feather All-Range | C | Summons 6 Near Feathers. | resource_operation | near feathers | false | true | true | false |
| Rei | Skill 2 / Senior Spirit | C | Decoy: Creates an avatar with 96% of the skill user's final max HP that lasts for 240 sec. | decoy_state | Decoy | false | true | true | false |
| Guilty | Skill 1 / Mind If I Borrow This? | D | Mind If I Borrow This?: Duplicates 8.81% of the ATK of the ally with the highest ATK. Stacks up to 5 times and lasts for 10 sec. | copy_or_scaling | — | true | true | true | false |
| Flora | Skill 1 / Petunia | A | Restores HP equal to 1% of the skill user's final max HP every second. | beneficial_effect | — | true | true | true | false |
| Flora | Skill 1 / Petunia | A | Incoming Healing ▲ 4% continuously. Stacks up to 5 times. | beneficial_effect | — | true | true | true | false |
| Snow White: Heavy Arms | Skill 1 / Seven Dwarves V+VI | C | Number of uses of Seven Dwarves Fully Active ▼ 1. | skill_or_weapon_parameter | number of uses | false | false | false | true |
| Snow White: Heavy Arms | Burst / Seven Dwarves Fully Active | C | Effect 1: Fixes charge time at 3.2 sec continuously. | skill_or_weapon_parameter | charge time | false | false | false | true |
| Trony | Skill 1 / T.Rony Bomber | A | Effect 1: Maximum Accumulated Damage is 1536% of the skill user's final ATK. | unclassified_special | Cumulative Damage Skill active for 5 sec. | true | true | true | false |
| Trony | Skill 1 / T.Rony Bomber | A | Effect 2: Accumulates 50% of the skill user's ATK damage. | unclassified_special | Cumulative Damage Skill active for 5 sec. | true | true | true | false |
| Trony | Skill 1 / T.Rony Bomber | A | Effect 3: Deals distributed damage to enemies within the attack range when Cumulative Damage Skill explodes. | damage_mechanic | Cumulative Damage Skill active for 5 sec. | false | true | true | false |
| Elegg: Boom and Shock | Skill 1 / Hello Ghost | C | Recurring interval: 6 sec | interval_parameter | recurring_interval | false | false | false | true |
| Cinderella | Skill 2 / Dirt-Resistant Mirror | C | Decoy: Creates an avatar with 96% of the skill user's final max HP. This effect is continuous. | decoy_state | Decoy | false | true | true | false |
| Cinderella | Skill 2 / Dirt-Resistant Mirror | C | Decoy: Creates an avatar with 96% of the skill user's final max HP. This effect is continuous. | decoy_state | Decoy | false | true | true | false |
| Cinderella | Burst / Glass Slippers. Full Contact. | C | Deals 28.9% of final ATK as additional damage. Mirrors the stack count of Beautiful. | damage_mechanic | — | false | true | true | false |
| Cinderella: Crystal Wave | Skill 1 / Beauty-Full | C | Changes the weapon in use: Snipe Mode | weapon_specification | snipe mode | false | false | false | true |
| Cinderella: Crystal Wave | Skill 2 / Mode Swap | C | Decoy: Creates an avatar with 70.34% of the skill user's final max HP. This effect is continuous. | decoy_state | Decoy | false | true | true | false |
| Bready | Skill 2 / Favorite Candy | C | Aftertaste: Deals  150.04% of final ATK as sustained damage every second for 5 sec. | damage_mechanic | Aftertaste | false | true | true | false |
| Sora | Skill 2 / Secret Carry-On | C | Storage: Stores excess incoming healing, up to 5.36% of the skill user's max HP. Stacks up to 5 times and lasts for 15 sec. | healing_storage_state | Storage | false | false | false | true |
| Phantom | Skill 2 / Thief's Vision | C | Deals 84.33% of final ATK as additional damage. Removes Calling Card. | damage_mechanic | — | false | true | true | false |
| Ada | Skill 2 / Flash Grenade | C | Flash Grenade Toss activation time condition ▼ 1 sec for 10 sec. | skill_or_weapon_parameter | activation time condition | false | false | false | true |
| Chisato | Skill 1 / Extrasensory | A | Extrasensory ▼ 1%. | unclassified_special | — | true | true | true | false |
| Yukiko | Skill 1 / Persona: Konohana Sakuya | C | Effect 1: Activates every 3 sec. Affects all allies. Media: Restores HP equal to 5.7% of the skill user's final max HP. | trigger_or_state_metadata | Persona - Konohana Sakuya | false | false | false | true |
| Yukiko | Skill 2 / Scarlet Flower | C | Effect 1: Activates every 3 sec. Affects all allies. Mediarama: Restores HP equal to 5.7% of the skill user's final max HP. | trigger_or_state_metadata | Scarlet Flower | false | false | false | true |
| Emma: Tactical Upgrade | Skill 1 / Environment Setup | C | Recurring interval: 30 sec | interval_parameter | recurring_interval | false | false | false | true |
| Emma: Tactical Upgrade | Skill 2 / LT Formation | A | Effect 4: Affects self. Recurring interval of Environment Setup ▼ 20 sec continuously. | interval_parameter | recurring_interval | false | false | false | true |
| Emma: Tactical Upgrade | Burst / Battlefield Formation | A | Effect 1: The "Damage Taken" multiplier of Environment Setup is scaled by 100%. | unclassified_special | Enhanced Environment Setup | true | true | true | false |
| Eunhwa: Tactical Upgrade | Burst / Explosive Round | C | Special note: Fires an Exploding Bullet dealing area-of-effect damage. | damage_mechanic | Special note | false | true | true | false |

### ambiguous_target normalized groups

| Pattern | Sections | Characters | Proposed target fields |
|---|---:|---|---|
| allies_by_named_state | 7 | Crust, Mast: Romantic Maid, Rei Ayanami (Tentative Name), Snow Crane | {"normalized_pattern":"allies_by_named_state","target_type":"selected_allies","target_count":null,"target_selection":"named_state_membership","target_condition":"all allies if in Drunken status","target_class":null,"target_weapon":null,"target_element":null} |
| self_in_condition | 4 | Delta: Ninja Thief, Diesel: Winter Sweets, Raven | {"normalized_pattern":"self_in_condition","target_type":"self","target_count":null,"target_selection":null,"target_condition":"self while in Attract status","target_class":null,"target_weapon":null,"target_element":null} |
| all_allies_except_caster | 3 | Maiden: Ice Rose, Queen (Makoto), Yukiko | {"normalized_pattern":"all_allies_except_caster","target_type":"element","target_count":null,"target_selection":"all_matching_except_caster","target_condition":null,"target_class":null,"target_weapon":null,"target_element":null} |
| caster_and_adjacent_allies | 3 | Flora, Rouge | {"normalized_pattern":"caster_and_adjacent_allies","target_type":"selected_allies","target_count":3,"target_selection":"caster_plus_adjacent","target_condition":null,"target_class":null,"target_weapon":null,"target_element":null} |
| element_and_weapon_limited_allies | 3 | Ark Ranger Black, Trina | {"normalized_pattern":"element_and_weapon_limited_allies","target_type":"other","target_count":null,"target_selection":"all_matching","target_condition":null,"target_class":null,"target_weapon":"assault rifles","target_element":"electric"} |
| random_ally_cover_destroyed | 3 | Biscuit, Lily | {"normalized_pattern":"random_ally_cover_destroyed","target_type":"selected_allies","target_count":2,"target_selection":"random","target_condition":"cover_destroyed","target_class":null,"target_weapon":null,"target_element":null} |
| all_allies | 2 | Blanc, D | {"normalized_pattern":"all_allies","target_type":"all_allies","target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null} |
| class_limited_allies | 2 | Quiry | {"normalized_pattern":"class_limited_allies","target_type":"class","target_count":2,"target_selection":null,"target_condition":null,"target_class":"defender","target_weapon":null,"target_element":null} |
| incapacitated_ally_highest_atk | 2 | Mana, Rapunzel | {"normalized_pattern":"incapacitated_ally_highest_atk","target_type":"selected_allies","target_count":1,"target_selection":"highest_atk","target_condition":"incapacitated","target_class":null,"target_weapon":null,"target_element":null} |
| same_squad_allies | 2 | Emma: Tactical Upgrade, Eunhwa: Tactical Upgrade | {"normalized_pattern":"same_squad_allies","target_type":"selected_allies","target_count":null,"target_selection":"same_squad","target_condition":null,"target_class":null,"target_weapon":null,"target_element":null} |
| same_targets | 2 | Cinderella, Sakura: Bloom in Summer | {"normalized_pattern":"same_targets","target_type":"other","target_count":null,"target_selection":"inherit_previous_section_targets","target_condition":null,"target_class":null,"target_weapon":null,"target_element":null} |
| burst_stage_ally_lowest_atk | 1 | Liberalio | {"normalized_pattern":"burst_stage_ally_lowest_atk","target_type":"selected_allies","target_count":1,"target_selection":"lowest_atk","target_condition":"burst_stage=3","target_class":null,"target_weapon":null,"target_element":null} |
| caster_and_allies_lower_stat | 1 | Anis: Star | {"normalized_pattern":"caster_and_allies_lower_stat","target_type":"selected_allies","target_count":null,"target_selection":"lower_stat_than_caster","target_condition":"final_def < caster_final_def","target_class":null,"target_weapon":null,"target_element":null} |
| caster_cover | 1 | Bay | {"normalized_pattern":"caster_cover","target_type":"other","target_count":null,"target_selection":"caster_cover","target_condition":null,"target_class":null,"target_weapon":null,"target_element":null} |
| explicit_unmapped_target | 1 | Phantom | {"normalized_pattern":"explicit_unmapped_target","target_type":"other","target_count":null,"target_selection":"literal_source_target","target_condition":null,"target_class":null,"target_weapon":null,"target_element":null} |
| missing_target_expression | 1 | iDoll Sun | {"normalized_pattern":"missing_target_expression","target_type":null,"target_count":null,"target_selection":null,"target_condition":null,"target_class":null,"target_weapon":null,"target_element":null} |
| named_or_current_target | 1 | Soline: Frost Ticket | {"normalized_pattern":"named_or_current_target","target_type":"other","target_count":null,"target_selection":"current_named_target","target_condition":null,"target_class":null,"target_weapon":null,"target_element":null} |
| random_ally | 1 | Lily | {"normalized_pattern":"random_ally","target_type":"selected_allies","target_count":1,"target_selection":"random","target_condition":null,"target_class":null,"target_weapon":null,"target_element":null} |
| targets_by_named_state | 1 | Crust | {"normalized_pattern":"targets_by_named_state","target_type":"other","target_count":null,"target_selection":"named_state_membership","target_condition":"all targets in Maillard or Blanching status","target_class":null,"target_weapon":null,"target_element":null} |

### ambiguous_value numeric roles

#### Maiden: Ice Rose — Skill 1 / Meditation

| Raw | Role | Context |
|---|---|---|
| 1 | resource_amount_or_cap | ring Full Burst when this unit has 1 or more MP. Affects self. Replenishes 1 MP,  |
| 1 | resource_amount_or_cap | more MP. Affects self. Replenishes 1 MP, up to a maximum of 12. All MP is removed |
| 12 | resource_cap | plenishes 1 MP, up to a maximum of 12. All MP is removed when using Burst Skill. |

#### Rapunzel: Pure Grace — Skill 1 / Sanctuary

| Raw | Role | Context |
|---|---|---|
| 20.59% | noncomparison_raw_value | s a shared shield with HP equal to 20.59% of the skill user's final max HP. This effec |

#### Rapunzel: Pure Grace — Skill 1 / Sanctuary

| Raw | Role | Context |
|---|---|---|
| 20.59% | noncomparison_raw_value | s a shared shield with HP equal to 20.59% of the skill user's final max HP. This effec |

#### Modernia — Skill 1 / High-Speed Evolution

| Raw | Role | Context |
|---|---|---|
| 200 | attack_count_or_requirement | Activates after landing 200 normal attacks. Affects self. Critical Damag |
| 14.25% | noncomparison_raw_value | s. Affects self. Critical Damage ▲ 14.25%. Stacks up to 5 times and lasts for 10 sec.  |
| 5 times | stack_count | ical Damage ▲ 14.25%. Stacks up to 5 times and lasts for 10 sec. Max Ammunition Capacit |
| 10 sec | duration | Stacks up to 5 times and lasts for 10 sec. Max Ammunition Capacity ▼ 5.04%. Stacks up  |
| 5.04% | raw_value |  10 sec. Max Ammunition Capacity ▼ 5.04%. Stacks up to 5 times and lasts for 10 sec. |
| 5 times | stack_count | ion Capacity ▼ 5.04%. Stacks up to 5 times and lasts for 10 sec. |
| 10 sec | duration | Stacks up to 5 times and lasts for 10 sec. |

#### Blanc — Skill 1 / Lucky Guard

| Raw | Role | Context |
|---|---|---|
| 120 | attack_count_or_requirement | Activates after 120 normal attacks. Creates a shared shield with |
| 11.8% | noncomparison_raw_value | s a shared shield with HP equal to 11.8% of the skill user's final max HP that protec |
| 5 sec | duration |  all allies from damage. Lasts for 5 sec. |

#### Sakura: Bloom in Summer — Burst / Ephemeral Splendor

| Raw | Role | Context |
|---|---|---|
| 457.14% | noncomparison_raw_value | Affects random enemies. Deals 457.14% of final ATK as damage. Attacks sequentially |
| 10 times | attack_count | TK as damage. Attacks sequentially 10 times. |

#### Sakura: Bloom in Summer — Burst / Ephemeral Splendor

| Raw | Role | Context |
|---|---|---|
| 35.16% | noncomparison_raw_value | Affects the same targets. Deals 35.16% of final ATK as sustained damage every secon |
| 10 times | stack_count |  damage every second. Stacks up to 10 times and lasts for 10 sec. |
| 10 sec | duration | tacks up to 10 times and lasts for 10 sec. |

#### Ether — Burst / Colossal Single Cell

| Raw | Role | Context |
|---|---|---|
| 3 | target_count | Affects the 3 ally unit(s) with the lowest remaining HP. C |
| 96% | noncomparison_raw_value |  Creates a shield with HP equal to 96% of the the skill user's final max HP that la |
| 5 sec | duration | user's final max HP that lasts for 5 sec. |

#### Poli — Burst / Poli's Defense Line

| Raw | Role | Context |
|---|---|---|
| 22.27% | noncomparison_raw_value | s a shared shield with HP equal to 22.27% of the skill user's final max HP that protec |
| 10 sec | duration |  all allies from damage. Lasts for 10 sec. |

#### iDoll Flower — Burst / Perennial Perfume

| Raw | Role | Context |
|---|---|---|
| 1 | target_count | Affects 1 enemy unit(s) with the highest final ATK. De |
| 330.61% | noncomparison_raw_value |  with the highest final ATK. Deals 330.61% of final ATK as Burst Skill damage. Taunt fo |
| 2 sec | duration | K as Burst Skill damage. Taunt for 2 sec. |

#### Guilty — Skill 1 / Mind If I Borrow This?

| Raw | Role | Context |
|---|---|---|
| 6 | attack_count_or_requirement | Activates after performing 6 normal attacks. Affects self. Mind If I Borr |
| 8.81% | raw_value | Mind If I Borrow This?: Duplicates 8.81% of the ATK of the ally with the highest ATK. |
| 5 times | stack_count | with the highest ATK. Stacks up to 5 times and lasts for 10 sec. |
| 10 sec | duration | Stacks up to 5 times and lasts for 10 sec. |

#### Sin — Skill 1 / Full Stop

| Raw | Role | Context |
|---|---|---|
| 15.03% | raw_value | t bullet. Affects self. Duplicates 15.03% of the max HP of ally with the highest max H |
| 5 sec | duration | with the highest max HP. Lasts for 5 sec. Attract: Taunts all enemies for 5 sec. |
| 5 sec | duration | c. Attract: Taunts all enemies for 5 sec. |

#### Quency — Skill 1 / New Route

| Raw | Role | Context |
|---|---|---|
| 60 | attack_count_or_requirement | Activates after performing 60 normal attacks. Affects self. Duplicates 12. |
| 12.42% | raw_value |  attacks. Affects self. Duplicates 12.42% of the max HP of the Nikke with the highest  |
| 10 sec | duration | with the highest max HP. Lasts for 10 sec. |

#### Cinderella — Burst / Glass Slippers. Full Contact.

| Raw | Role | Context |
|---|---|---|
| 1365.92% | noncomparison_raw_value | Affects random enemies. Deals 1365.92% of final ATK as damage. Attacks sequentially |
| 10 times | attack_count | TK as damage. Attacks sequentially 10 times. |

#### Cinderella — Burst / Glass Slippers. Full Contact.

| Raw | Role | Context |
|---|---|---|
| 28.9% | noncomparison_raw_value | e. Affects the same targets. Deals 28.9% of final ATK as additional damage. Mirrors t |

#### Little Mermaid — Skill 2 / Bubble Wave

| Raw | Role | Context |
|---|---|---|
| 1 sec | interval | Activates every 1 sec only during Full Burst. Affects random enemy |
| 63.36% | noncomparison_raw_value |  Affects random enemy units. Deals 63.36% of final ATK as damage. Attacks sequentially |
| 4 times | attack_count | TK as damage. Attacks sequentially 4 times. |

#### Phantom — Skill 2 / Thief's Vision

| Raw | Role | Context |
|---|---|---|
| 84.33% | noncomparison_raw_value | s in the Calling Card state. Deals 84.33% of final ATK as additional damage. Removes C |

#### Diesel: Winter Sweets — Skill 2 / I'm Gonna Sing Now!

| Raw | Role | Context |
|---|---|---|
| 63.33% | noncomparison_raw_value | t. Affects the stage target. Deals 63.33% of final ATK as sustained damage every secon |
| 9 sec | duration |  sustained damage every second for 9 sec. |

#### Centi — Skill 2 / Field Discussion

| Raw | Role | Context |
|---|---|---|
| 6.38% | noncomparison_raw_value | s a shared shield with HP equal to 6.38% of the skill user's final max HP that protec |
| 5 sec | duration |  all allies from damage. Lasts for 5 sec. |

#### Emilia — Skill 2 / Great Spirit's Mace

| Raw | Role | Context |
|---|---|---|
| 58.99% | noncomparison_raw_value | d Damage to the main body equal to 58.99% of the damage dealt by self. |

#### EVE — Burst / Counter Chain

| Raw | Role | Context |
|---|---|---|
| 457.14% | noncomparison_raw_value | Affects random enemy units. Deals 457.14% of final ATK as damage. Attacks sequentially |
| 6 times | attack_count | TK as damage. Attacks sequentially 6 times. |

#### Vesti — Burst / Justifiable Defense

| Raw | Role | Context |
|---|---|---|
| 15.56% | noncomparison_raw_value | s two Missile Containers that deal 15.56% of final ATK as damage to the enemy with the |
| 18 sec | duration | west remaining HP every second for 18 sec. |

### parser_failure grammar groups

| Grammar failure | Sections | Characters |
|---|---:|---|
| 通常stat増減行をsection context付きchild effectへmaterializeできていません。 | 5 | iDoll Sun, Product 12, Scarlet, Viper, Yuni |
| Max Ammunition Capacity decrease（句読点・注記を含む）のstat grammarに未対応です。 | 2 | Anis: Sparkling Summer, K |
| 通常stat増減行をsection context付きchild effectへmaterializeできていません。 + Max Ammunition Capacity decrease（句読点・注記を含む）のstat grammarに未対応です。 | 2 | Modernia, Privaty |
| attack-damage基準のhealing conversion文法に未対応です。 | 1 | Signal |
| boolean grantとbattle内activation limitを併記する複合文法に未対応です。 | 1 | Neon: Vision Eye |
| named state/headingだけのmetadata行をeffectから分離できていません。 | 1 | Rapi: Red Hood |
| named state/headingだけのmetadata行をeffectから分離できていません。 + previous-effects参照をmetadata relationとしてparseできていません。 + 通常stat増減行をsection context付きchild effectへmaterializeできていません。 | 1 | EVE |
| numeric valueを持たないdamage-share grant文法に未対応です。 + 通常stat増減行をsection context付きchild effectへmaterializeできていません。 | 1 | Bay |
| shield objectをtargetにするboolean invulnerability文法に未対応です。 | 1 | Label |
| shots/roundsを持続単位として扱うstat buff文法に未対応です。 | 1 | Eunhwa |
| target heading + named effect + Functionの複合sectionを子Effectへroutingできていません。 | 1 | Asuka: WILLE |
| tier/branch prefixの後にnamed boolean effectが続く文法に未対応です。 | 1 | Chisato |
| 固定charge timeというweapon parameter文法に未対応です。 | 1 | Snow White: Heavy Arms |

### ambiguous_trigger

| Character | Skill | Category | Distinction | Source trigger |
|---|---|---|---|---|
| Anis | Skill 2 / C.H. Formation | D | trigger_absent_in_source | — |
| Yulha | Skill 2 / The Weakener | D | trigger_absent_in_source | — |
| Tove | Skill 1 / Emergency-Crafted Bullets | A | explicit_trigger_parser_missing | There is a 5% chance of activating when attacking |
| Rosanna: Chic Ocean | Skill 2 / Spina di Rosa | D | trigger_absent_in_source | — |
| Sakura: Bloom in Summer | Skill 2 / Full Glory | D | trigger_absent_in_source | — |
| Poli | Skill 2 / That's a Good Boy | D | trigger_absent_in_source | — |
| Soldier OW | Skill 2 / Owl Wind | D | trigger_absent_in_source | — |
| Helm | Skill 2 / Fire Away | D | trigger_absent_in_source | — |
| Trina | Burst / Mother Forest | D | implicit_skill_activation_not_explicit | — |
| Elegg: Boom and Shock | Skill 1 / Hello Ghost | A | branch_condition_can_supply_trigger_context | 1 or more ghosts |
| Centi | Skill 2 / Field Discussion | D | trigger_absent_in_source | — |
| Lily | Skill 1 / Precise Adjustment | D | trigger_absent_in_source | — |
| Takina | Skill 2 / Battlefield Control | D | trigger_absent_in_source | — |

### not_a_buff_candidate

| Character | Category | Classification | Source line |
|---|---|---|---|
| Sakura: Bloom in Summer | C | damage | Deals 457.14% of final ATK as damage. Attacks sequentially 10 times. |
| Sakura: Bloom in Summer | C | damage | Deals 35.16% of final ATK as sustained damage every second. Stacks up to 10 times and lasts for 10 sec. |
| Ether | C | shield_generation | Creates a shield with HP equal to 96% of the the skill user's final max HP that lasts for 5 sec. |
| iDoll Flower | C | damage | Deals 330.61% of final ATK as Burst Skill damage. |
| Sin | D | actual_beneficial_effect | Duplicates 15.03% of the max HP of ally with the highest max HP. Lasts for 5 sec. |
| Cinderella | C | damage | Deals 1365.92% of final ATK as damage. Attacks sequentially 10 times. |
| Cinderella | C | damage | Deals 28.9% of final ATK as additional damage. Mirrors the stack count of Beautiful. |
| Little Mermaid | C | damage | Deals 63.36% of final ATK as damage. Attacks sequentially 4 times. |
| Phantom | C | damage | Deals 84.33% of final ATK as additional damage. Removes Calling Card. |
| Diesel: Winter Sweets | C | damage | Deals 63.33% of final ATK as sustained damage every second for 9 sec. |
| Emilia | C | damage | Deals Fixed Damage to the main body equal to 58.99% of the damage dealt by self. |
| EVE | C | damage | Deals 457.14% of final ATK as damage. Attacks sequentially 6 times. |

### missing_value

| Character | Category | Source line | Numeric required | Suggested unit |
|---|---|---|---|---|
| Mihara: Bonding Chain | C | Charges Restraint Chains by 10, up to 10. | true | — |
| Mihara: Bonding Chain | C | Charges Restraint Chains by 10, up to 10. | true | — |
| Neon: Vision Eye | C | Increases the Firepower Gauge's charge by 100. | true | — |
| Neon: Vision Eye | C | Increases the Firepower Gauge's charge by 2. | true | — |
| Neon: Vision Eye | C | Increases the Firepower Gauge's charge by 45. | true | — |
| Maiden: Ice Rose | C | Replenishes 1 MP, up to a maximum of 12. All MP is removed when using Burst Skill. | true | — |
| Sakura: Bloom in Summer | C | Forcefully uses Skill 2. | false | boolean |
| Ein | C | Summons 4 Near Feathers. | false | — |
| Little Mermaid | C | Focuses fire continuously. | false | boolean |
| Bay | A | Proportionally shares damage taken. This effect is continuous. | false | boolean |

### ambiguous_duration

| Character | Skill | Category | Kind | Resolution |
|---|---|---|---|---|
| Anne: Miracle Fairy | Skill 2 / Fairy's Jest | D | duration_absent_in_source | D |
| K | Burst / Means of Righteousness | A | parent_duration_inheritance | A |
| Cinderella | Skill 1 / Flawless Glass | A | until_condition | A |
| Grave | Skill 1 / Heat Emission | D | until_unspecified_condition | D |
| Emilia | Burst / Freezing Witch | A | parent_duration_inheritance | A |
| Ada | Burst / Secret Agent | A | parent_duration_inheritance | A |

## Final totals

- total review sections: 141
- total review occurrences: 206
- A: 64
- B: 0
- C: 60
- D: 17
- normalized pattern count: 124
- human judgement required character count: 17

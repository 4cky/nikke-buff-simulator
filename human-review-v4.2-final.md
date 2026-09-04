# Human Review v4.2 — Final 17

> residual auditのD分類だけを収録しています。A/Cの自動処理後も、この17節には推測による変更を加えていません。

## 1. Anis

Skill 2 · C.H. Formation

- review_key: `nikke-12:Skill 2:section-0`

### Skill Lv.10 原文（section全文）
```text
Affects self and the 2 allies with the highest final ATK (other than the skill user). 
DEF ▲ 80% for 5 sec. 
Equally shares damage taken for 10 sec.
```

### A/Cで自動処理しなかった理由

source sectionに発動triggerが明示されていません。

### needs_review_reasons

- ambiguous_trigger

### Candidate 1 — 問題の行
```text
DEF ▲ 80% for 5 sec.
```

| Current parsed field | Value |
|---|---|
| effect_type | buff |
| buff_type | def |
| modifier_type | increase |
| value | 80 |
| value_unit | percent |
| duration | 5 sec |
| duration_value | 5 |
| duration_unit | seconds |
| target | self and the 2 allies with the highest final ATK (other than the skill user). |
| target_type | selected_allies |
| trigger | — |
| condition | Affects self and the 2 allies with the highest final ATK (other than the skill user). |
| parent_effect_name | — |
| section_condition | — |
| special_type | — |
| resource_type | — |
| scaling_type | — |
| scaling_source_effect | — |
| needs_review_reasons | ["ambiguous_trigger"] |

### Candidate 2 — 問題の行
```text
Equally shares damage taken for 10 sec.
```

| Current parsed field | Value |
|---|---|
| effect_type | buff |
| buff_type | damage_share |
| modifier_type | grant |
| value | true |
| value_unit | boolean |
| duration | 10 sec |
| duration_value | 10 |
| duration_unit | seconds |
| target | self and the 2 allies with the highest final ATK (other than the skill user). |
| target_type | selected_allies |
| trigger | — |
| condition | Affects self and the 2 allies with the highest final ATK (other than the skill user). |
| parent_effect_name | — |
| section_condition | — |
| special_type | — |
| resource_type | — |
| scaling_type | — |
| scaling_source_effect | — |
| needs_review_reasons | ["ambiguous_trigger"] |

## 2. Anne: Miracle Fairy

Skill 2 · Fairy's Jest

- review_key: `nikke-121:Skill 2:section-0`

### Skill Lv.10 原文（section全文）
```text
Affects all allies. Activates when above 90% HP.
Incoming Healing ▲ 23.46%.
```

### A/Cで自動処理しなかった理由

効果値は明示されていますが、持続時間が原文にありません。

### needs_review_reasons

- ambiguous_duration

### Candidate 1 — 問題の行
```text
Incoming Healing ▲ 23.46%.
```

| Current parsed field | Value |
|---|---|
| effect_type | buff |
| buff_type | incoming_healing |
| modifier_type | increase |
| value | 23.46 |
| value_unit | percent |
| duration | Instant |
| duration_value | — |
| duration_unit | — |
| target | — |
| target_type | — |
| trigger | — |
| condition | — |
| parent_effect_name | — |
| section_condition | — |
| special_type | — |
| resource_type | — |
| scaling_type | — |
| scaling_source_effect | — |
| needs_review_reasons | ["ambiguous_duration"] |

## 3. Yulha

Skill 2 · The Weakener

- review_key: `nikke-171:Skill 2:section-0`

### Skill Lv.10 原文（section全文）
```text
Affects all allies.
ATK ▲ 90.75% for 5 sec. 
Equally shares damage taken for 10 sec.
```

### A/Cで自動処理しなかった理由

source sectionに発動triggerが明示されていません。

### needs_review_reasons

- ambiguous_trigger

### Candidate 1 — 問題の行
```text
ATK ▲ 90.75% for 5 sec.
```

| Current parsed field | Value |
|---|---|
| effect_type | buff |
| buff_type | atk |
| modifier_type | increase |
| value | 90.75 |
| value_unit | percent |
| duration | 5 sec |
| duration_value | 5 |
| duration_unit | seconds |
| target | all allies. |
| target_type | all_allies |
| trigger | — |
| condition | Affects all allies. |
| parent_effect_name | — |
| section_condition | — |
| special_type | — |
| resource_type | — |
| scaling_type | — |
| scaling_source_effect | — |
| needs_review_reasons | ["ambiguous_trigger"] |

### Candidate 2 — 問題の行
```text
Equally shares damage taken for 10 sec.
```

| Current parsed field | Value |
|---|---|
| effect_type | buff |
| buff_type | damage_share |
| modifier_type | grant |
| value | true |
| value_unit | boolean |
| duration | 10 sec |
| duration_value | 10 |
| duration_unit | seconds |
| target | all allies. |
| target_type | all_allies |
| trigger | — |
| condition | Affects all allies. |
| parent_effect_name | — |
| section_condition | — |
| special_type | — |
| resource_type | — |
| scaling_type | — |
| scaling_source_effect | — |
| needs_review_reasons | ["ambiguous_trigger"] |

## 4. Rosanna: Chic Ocean

Skill 2 · Spina di Rosa

- review_key: `nikke-283:Skill 2:section-0`

### Skill Lv.10 原文（section全文）
```text
Affects all allies.
Damage to Parts ▲ 24.26% for 15 sec.
```

### A/Cで自動処理しなかった理由

source sectionに発動triggerが明示されていません。

### needs_review_reasons

- ambiguous_trigger

### Candidate 1 — 問題の行
```text
Damage to Parts ▲ 24.26% for 15 sec.
```

| Current parsed field | Value |
|---|---|
| effect_type | buff |
| buff_type | parts_damage |
| modifier_type | increase |
| value | 24.26 |
| value_unit | percent |
| duration | 15 sec |
| duration_value | 15 |
| duration_unit | seconds |
| target | all allies. |
| target_type | all_allies |
| trigger | — |
| condition | Affects all allies. |
| parent_effect_name | — |
| section_condition | — |
| special_type | — |
| resource_type | — |
| scaling_type | — |
| scaling_source_effect | — |
| needs_review_reasons | ["ambiguous_trigger"] |

## 5. Sakura: Bloom in Summer

Skill 2 · Full Glory

- review_key: `nikke-284:Skill 2:section-0`

### Skill Lv.10 原文（section全文）
```text
Affects self.
Dancing Flower: Attack Damage ▲ 15.64% for 15 sec.
```

### A/Cで自動処理しなかった理由

source sectionに発動triggerが明示されていません。

### needs_review_reasons

- ambiguous_trigger

### Candidate 1 — 問題の行
```text
Dancing Flower: Attack Damage ▲ 15.64% for 15 sec.
```

| Current parsed field | Value |
|---|---|
| effect_type | buff |
| buff_type | attack_damage |
| modifier_type | increase |
| value | 15.64 |
| value_unit | percent |
| duration | 15 sec |
| duration_value | 15 |
| duration_unit | seconds |
| target | self. |
| target_type | self |
| trigger | — |
| condition | Affects self. |
| parent_effect_name | Dancing Flower |
| section_condition | — |
| special_type | — |
| resource_type | — |
| scaling_type | — |
| scaling_source_effect | — |
| needs_review_reasons | ["ambiguous_trigger"] |

## 6. Poli

Skill 2 · That's a Good Boy

- review_key: `nikke-30:Skill 2:section-0`

### Skill Lv.10 原文（section全文）
```text
Affects self and 2 ally unit(s) with the lowest remaining HP (except the skill user). 
DEF ▲ 23.51% for 10 sec. 
Equally shares damage taken for 10 sec.
```

### A/Cで自動処理しなかった理由

source sectionに発動triggerが明示されていません。

### needs_review_reasons

- ambiguous_trigger

### Candidate 1 — 問題の行
```text
DEF ▲ 23.51% for 10 sec.
```

| Current parsed field | Value |
|---|---|
| effect_type | buff |
| buff_type | def |
| modifier_type | increase |
| value | 23.51 |
| value_unit | percent |
| duration | 10 sec |
| duration_value | 10 |
| duration_unit | seconds |
| target | self and 2 ally unit(s) with the lowest remaining HP (except the skill user). |
| target_type | selected_allies |
| trigger | — |
| condition | Affects self and 2 ally unit(s) with the lowest remaining HP (except the skill user). |
| parent_effect_name | — |
| section_condition | — |
| special_type | — |
| resource_type | — |
| scaling_type | — |
| scaling_source_effect | — |
| needs_review_reasons | ["ambiguous_trigger"] |

### Candidate 2 — 問題の行
```text
Equally shares damage taken for 10 sec.
```

| Current parsed field | Value |
|---|---|
| effect_type | buff |
| buff_type | damage_share |
| modifier_type | grant |
| value | true |
| value_unit | boolean |
| duration | 10 sec |
| duration_value | 10 |
| duration_unit | seconds |
| target | self and 2 ally unit(s) with the lowest remaining HP (except the skill user). |
| target_type | selected_allies |
| trigger | — |
| condition | Affects self and 2 ally unit(s) with the lowest remaining HP (except the skill user). |
| parent_effect_name | — |
| section_condition | — |
| special_type | — |
| resource_type | — |
| scaling_type | — |
| scaling_source_effect | — |
| needs_review_reasons | ["ambiguous_trigger"] |

## 7. Soldier OW

Skill 2 · Owl Wind

- review_key: `nikke-306:Skill 2:section-0`

### Skill Lv.10 原文（section全文）
```text
Affects 3 ally unit(s) with the highest final ATK. 
Cover's DEF ▲ 128.57% for 5 sec.
```

### A/Cで自動処理しなかった理由

source sectionに発動triggerが明示されていません。

### needs_review_reasons

- ambiguous_trigger

### Candidate 1 — 問題の行
```text
Cover's DEF ▲ 128.57% for 5 sec.
```

| Current parsed field | Value |
|---|---|
| effect_type | buff |
| buff_type | cover_def |
| modifier_type | increase |
| value | 128.57 |
| value_unit | percent |
| duration | 5 sec |
| duration_value | 5 |
| duration_unit | seconds |
| target | 3 ally unit(s) with the highest final ATK. |
| target_type | selected_allies |
| trigger | — |
| condition | Affects 3 ally unit(s) with the highest final ATK. |
| parent_effect_name | — |
| section_condition | — |
| special_type | — |
| resource_type | — |
| scaling_type | — |
| scaling_source_effect | — |
| needs_review_reasons | ["ambiguous_trigger"] |

## 8. iDoll Sun

Skill 2 · Sunlight

- review_key: `nikke-308:Skill 2:section-0`

### Skill Lv.10 原文（section全文）
```text
There is a 20% chance of activating when attacked. 
ATK ▲ 9.09% for 5 sec.
```

### A/Cで自動処理しなかった理由

対象を示す文が原文になく、被攻撃時の発動者自身と断定できません。

### needs_review_reasons

- ambiguous_target

### Candidate 1 — 問題の行
```text
ATK ▲ 9.09% for 5 sec.
```

| Current parsed field | Value |
|---|---|
| effect_type | buff |
| buff_type | atk |
| modifier_type | increase |
| value | 9.09 |
| value_unit | percent |
| duration | 5 sec |
| duration_value | 5 |
| duration_unit | seconds |
| target | — |
| target_type | — |
| trigger | — |
| condition | — |
| parent_effect_name | — |
| section_condition | — |
| special_type | — |
| resource_type | — |
| scaling_type | — |
| scaling_source_effect | — |
| needs_review_reasons | ["ambiguous_target"] |

## 9. Helm

Skill 2 · Fire Away

- review_key: `nikke-352:Skill 2:section-0`

### Skill Lv.10 原文（section全文）
```text
Affects all allies.
Damage to Interruption Parts ▲3.08% permanently.
```

### A/Cで自動処理しなかった理由

source sectionに発動triggerが明示されていません。

### needs_review_reasons

- ambiguous_trigger

### Candidate 1 — 問題の行
```text
Damage to Interruption Parts ▲3.08% permanently.
```

| Current parsed field | Value |
|---|---|
| effect_type | buff |
| buff_type | interruption_parts_damage |
| modifier_type | increase |
| value | 3.08 |
| value_unit | percent |
| duration | Permanent |
| duration_value | — |
| duration_unit | permanent |
| target | all allies. |
| target_type | all_allies |
| trigger | — |
| condition | Affects all allies. |
| parent_effect_name | — |
| section_condition | — |
| special_type | — |
| resource_type | — |
| scaling_type | — |
| scaling_source_effect | — |
| needs_review_reasons | ["ambiguous_trigger"] |

## 10. Guilty

Skill 1 · Mind If I Borrow This?

- review_key: `nikke-400:Skill 1:section-0`

### Skill Lv.10 原文（section全文）
```text
Activates after performing 6 normal attacks. Affects self.
Mind If I Borrow This?: Duplicates 8.81% of the ATK of the ally with the highest ATK. Stacks up to 5 times and lasts for 10 sec.
```

### A/Cで自動処理しなかった理由

他者ATKの複製とstackの意味を通常caster-based ATKへ落とすかは方針判断が必要です。

### needs_review_reasons

- ambiguous_value + special_mechanic

### Candidate 1 — 問題の行
```text
Mind If I Borrow This?: Duplicates 8.81% of the ATK of the ally with the highest ATK. Stacks up to 5 times and lasts for 10 sec.
```

| Current parsed field | Value |
|---|---|
| effect_type | — |
| buff_type | — |
| modifier_type | — |
| value | — |
| value_unit | — |
| duration | — |
| duration_value | — |
| duration_unit | — |
| target | — |
| target_type | — |
| trigger | — |
| condition | — |
| parent_effect_name | — |
| section_condition | — |
| special_type | — |
| resource_type | — |
| scaling_type | — |
| scaling_source_effect | — |
| needs_review_reasons | ["ambiguous_value","special_mechanic"] |

## 11. Sin

Skill 1 · Full Stop

- review_key: `nikke-401:Skill 1:section-0`

### Skill Lv.10 原文（section全文）
```text
Activates when firing the last bullet. Affects self.
Duplicates 15.03% of the max HP of ally with the highest max HP. Lasts for 5 sec.
Attract: Taunts all enemies for 5 sec.
```

### A/Cで自動処理しなかった理由

他者Max HPの複製値を通常Max HP buffとして扱うか、copy mechanicとして扱うかは方針判断が必要です。

### needs_review_reasons

- ambiguous_value + not_a_buff_candidate

### Candidate 1 — 問題の行
```text
Duplicates 15.03% of the max HP of ally with the highest max HP. Lasts for 5 sec.
```

| Current parsed field | Value |
|---|---|
| effect_type | — |
| buff_type | — |
| modifier_type | — |
| value | — |
| value_unit | — |
| duration | — |
| duration_value | — |
| duration_unit | — |
| target | — |
| target_type | — |
| trigger | — |
| condition | — |
| parent_effect_name | — |
| section_condition | — |
| special_type | — |
| resource_type | — |
| scaling_type | — |
| scaling_source_effect | — |
| needs_review_reasons | ["ambiguous_value","not_a_buff_candidate"] |

## 12. Quency

Skill 1 · New Route

- review_key: `nikke-402:Skill 1:section-0`

### Skill Lv.10 原文（section全文）
```text
Activates after performing 60 normal attacks. Affects self.
Duplicates 12.42% of the max HP of the Nikke with the highest max HP. Lasts for 10 sec.
```

### A/Cで自動処理しなかった理由

他者Max HPの複製値を通常Max HP buffとして扱うか、copy mechanicとして扱うかは方針判断が必要です。

### needs_review_reasons

- ambiguous_value

### Candidate 1 — 問題の行
```text
Duplicates 12.42% of the max HP of the Nikke with the highest max HP. Lasts for 10 sec.
```

| Current parsed field | Value |
|---|---|
| effect_type | — |
| buff_type | — |
| modifier_type | — |
| value | — |
| value_unit | — |
| duration | — |
| duration_value | — |
| duration_unit | — |
| target | — |
| target_type | — |
| trigger | — |
| condition | — |
| parent_effect_name | — |
| section_condition | — |
| special_type | — |
| resource_type | — |
| scaling_type | — |
| scaling_source_effect | — |
| needs_review_reasons | ["ambiguous_value"] |

## 13. Trina

Burst · Mother Forest

- review_key: `nikke-412:Burst:section-3`

### Skill Lv.10 原文（section全文）
```text
Affects all Electric Code allies with assault rifles.
Hit Rate ▲ 45.3% for 10 sec.
Max Ammunition Capacity ▲ 20 round(s) for 10 sec.
```

### A/Cで自動処理しなかった理由

Burst activationは暗黙に想定できますが、該当sectionの原文にtriggerが明示されていません。

### needs_review_reasons

- ambiguous_target + ambiguous_trigger

### Candidate 1 — 問題の行
```text
Hit Rate ▲ 45.3% for 10 sec.
```

| Current parsed field | Value |
|---|---|
| effect_type | buff |
| buff_type | hit_rate |
| modifier_type | increase |
| value | 45.3 |
| value_unit | percent |
| duration | 10 sec |
| duration_value | 10 |
| duration_unit | seconds |
| target | — |
| target_type | — |
| trigger | — |
| condition | — |
| parent_effect_name | — |
| section_condition | — |
| special_type | — |
| resource_type | — |
| scaling_type | — |
| scaling_source_effect | — |
| needs_review_reasons | ["ambiguous_target","ambiguous_trigger"] |

### Candidate 2 — 問題の行
```text
Max Ammunition Capacity ▲ 20 round(s) for 10 sec.
```

| Current parsed field | Value |
|---|---|
| effect_type | buff |
| buff_type | max_ammo |
| modifier_type | increase |
| value | 20 |
| value_unit | count |
| duration | 10 sec |
| duration_value | 10 |
| duration_unit | seconds |
| target | — |
| target_type | — |
| trigger | — |
| condition | — |
| parent_effect_name | — |
| section_condition | — |
| special_type | — |
| resource_type | — |
| scaling_type | — |
| scaling_source_effect | — |
| needs_review_reasons | ["ambiguous_target","ambiguous_trigger"] |

## 14. Grave

Skill 1 · Heat Emission

- review_key: `nikke-514:Skill 1:section-0`

### Skill Lv.10 原文（section全文）
```text
Activates when Prediction ends. Affects self.
Removes 100% of ammo.
Heat Emission: Reload Ratio ▼ 50%. Removes Heat Emission under certain conditions.
```

### A/Cで自動処理しなかった理由

終了条件が「under certain conditions」としか書かれておらず、具体条件を確定できません。

### needs_review_reasons

- ambiguous_duration

### Candidate 1 — 問題の行
```text
Heat Emission: Reload Ratio ▼ 50%. Removes Heat Emission under certain conditions.
```

| Current parsed field | Value |
|---|---|
| effect_type | buff |
| buff_type | reload_ratio |
| modifier_type | decrease |
| value | 50 |
| value_unit | percent |
| duration | — |
| duration_value | — |
| duration_unit | — |
| target | self. |
| target_type | self |
| trigger | Activates when Prediction ends |
| condition | Activates when Prediction ends. Affects self. |
| parent_effect_name | Heat Emission |
| section_condition | — |
| special_type | — |
| resource_type | — |
| scaling_type | — |
| scaling_source_effect | — |
| needs_review_reasons | ["ambiguous_duration"] |

## 15. Centi

Skill 2 · Field Discussion

- review_key: `nikke-80:Skill 2:section-0`

### Skill Lv.10 原文（section全文）
```text
Affects self.
Creates a shared shield with HP equal to 6.38% of the skill user's final max HP that protects all allies from damage. Lasts for 5 sec.
```

### A/Cで自動処理しなかった理由

source sectionに発動triggerが明示されていません。

### needs_review_reasons

- ambiguous_value + ambiguous_trigger

### Candidate 1 — 問題の行
```text
Creates a shared shield with HP equal to 6.38% of the skill user's final max HP that protects all allies from damage. Lasts for 5 sec.
```

| Current parsed field | Value |
|---|---|
| effect_type | — |
| buff_type | — |
| modifier_type | — |
| value | — |
| value_unit | — |
| duration | — |
| duration_value | — |
| duration_unit | — |
| target | — |
| target_type | — |
| trigger | — |
| condition | — |
| parent_effect_name | — |
| section_condition | — |
| special_type | — |
| resource_type | — |
| scaling_type | — |
| scaling_source_effect | — |
| needs_review_reasons | ["ambiguous_value","ambiguous_trigger"] |

## 16. Lily

Skill 1 · Precise Adjustment

- review_key: `nikke-852:Skill 1:section-0`

### Skill Lv.10 原文（section全文）
```text
Affects 1 random ally unit.
ATK ▲ 20% of the skill user's ATK for 5 sec.
```

### A/Cで自動処理しなかった理由

source sectionに発動triggerが明示されていません。

### needs_review_reasons

- ambiguous_target + ambiguous_trigger

### Candidate 1 — 問題の行
```text
ATK ▲ 20% of the skill user's ATK for 5 sec.
```

| Current parsed field | Value |
|---|---|
| effect_type | buff |
| buff_type | caster_atk_based_atk |
| modifier_type | increase |
| value | 20 |
| value_unit | caster_atk_percent |
| duration | 5 sec |
| duration_value | 5 |
| duration_unit | seconds |
| target | — |
| target_type | — |
| trigger | — |
| condition | — |
| parent_effect_name | — |
| section_condition | — |
| special_type | — |
| resource_type | — |
| scaling_type | — |
| scaling_source_effect | — |
| needs_review_reasons | ["ambiguous_target","ambiguous_trigger"] |

## 17. Takina

Skill 2 · Battlefield Control

- review_key: `nikke-861:Skill 2:section-1`

### Skill Lv.10 原文（section全文）
```text
Affects all allies.
True Damage ▲ 140.49% for 10 sec.
```

### A/Cで自動処理しなかった理由

source sectionに発動triggerが明示されていません。

### needs_review_reasons

- ambiguous_trigger

### Candidate 1 — 問題の行
```text
True Damage ▲ 140.49% for 10 sec.
```

| Current parsed field | Value |
|---|---|
| effect_type | buff |
| buff_type | true_damage |
| modifier_type | increase |
| value | 140.49 |
| value_unit | percent |
| duration | 10 sec |
| duration_value | 10 |
| duration_unit | seconds |
| target | all allies. |
| target_type | all_allies |
| trigger | — |
| condition | Affects all allies. |
| parent_effect_name | — |
| section_condition | — |
| special_type | — |
| resource_type | — |
| scaling_type | — |
| scaling_source_effect | — |
| needs_review_reasons | ["ambiguous_trigger"] |

## 集計

- review sections: 17
- characters: 17

| Reason | Sections |
|---|---:|
| ambiguous_trigger | 11 |
| ambiguous_value | 4 |
| ambiguous_target | 3 |
| ambiguous_duration | 2 |
| not_a_buff_candidate | 1 |
| special_mechanic | 1 |

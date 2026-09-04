# Human Review Export — parser v4.1.0

> `review-audit-v4.1` の human_judgement_candidate のみを抽出した、人間確認用のread-only exportです。effects、review decision、manual_override、parser、review flagは変更していません。

# ambiguous_target

## Cocoa

Skill 1 · Professional Origami

### Skill Lv.10 原文（該当節全文）

```text
Affects 2 random ally unit(s) with debuffs.
Removes 1 debuff(s).
```

### Candidate 1

- primary reason: ambiguous_target
- normalized pattern: `removes {number} debuff(s).`

#### 問題の行

```text
Removes 1 debuff(s).
```

#### 現在の解析

- effect_type: null
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: null
- target_type: null
- trigger: null
- condition: null
- parent_effect_name: null
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: ambiguous_target + ambiguous_trigger

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。対象を self / all allies / selected allies 等へ一意に確定できていません。 発動条件または親から継承するtriggerを一意に確定できていません。

---

## Trina

Skill 2 · Peaceful Tree

### Skill Lv.10 原文（該当節全文）

```text
Activates at the start of battle. Affects the 1 leftmost Electric Code ally unit(s) with assault rifles.
Invulnerable for 2 sec.
```

### Candidate 2

- primary reason: ambiguous_target
- normalized pattern: `invulnerable for {seconds} sec.`

#### 問題の行

```text
Invulnerable for 2 sec.
```

#### 現在の解析

- effect_type: null
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: null
- target_type: null
- trigger: null
- condition: null
- parent_effect_name: null
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: ambiguous_target

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。対象を self / all allies / selected allies 等へ一意に確定できていません。

---

# ambiguous_value

## Elegg

Skill 2 · Fast Charge

### Skill Lv.10 原文（該当節全文）

```text
Activates when the stage target appears. Affects all allies.
Fills Burst Gauge by 100%. Activates once per battle.
```

### Candidate 3

- primary reason: ambiguous_value
- normalized pattern: `fills burst gauge by {percent}. activates once per battle.`

#### 問題の行

```text
Fills Burst Gauge by 100%. Activates once per battle.
```

#### 現在の解析

- effect_type: null
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: null
- target_type: null
- trigger: null
- condition: null
- parent_effect_name: null
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: ambiguous_value

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。原文中の数値を、対象effectのRaw Valueへ一意に対応付けられていません。

---

# special_mechanic

## Aigis

Skill 1 · Persona: Palladion

### Skill Lv.10 原文（該当節全文）

```text
Activates at the start of battle. Affects self.
Persona - Palladion: This effect is continuous and cannot be removed.
Function: Aigis strengthens herself using her Persona.
Effect 1: Tarukaja: ATK ▲ 21.12% continuously. This effect cannot be removed.
Effect 2: Rakukaja: DEF ▲ 21.12% continuously. This effect cannot be removed.
```

### Candidate 4

- primary reason: special_mechanic
- normalized pattern: `persona - palladion: this effect is continuous and cannot be removed.`

#### 問題の行

```text
Persona - Palladion: This effect is continuous and cannot be removed.
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: self.
- target_type: self
- trigger: Activates at the start of battle
- condition: Activates at the start of battle. Affects self.<br>Aigis strengthens herself using her Persona.
- parent_effect_name: Persona - Palladion
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

---

## Aigis

Skill 2 · Papillon Heart

### Skill Lv.10 原文（該当節全文）

```text
Activates when using Burst Skill as long as this unit is still alive.
Papillon Heart: This effect is continuous and cannot be removed.
Function: Aigis strengthens her allies.
Effect 1: Affects all allies. Matarukaja: ATK ▲ 21.12% of the skill user's ATK continuously. This effect cannot be removed.
Effect 2: Affects all allies. Marakukaja: DEF ▲ 21.12% of the skill user's DEF continuously. This effect cannot be removed.
Deactivation condition: When Full Burst ends.
```

### Candidate 5

- primary reason: special_mechanic
- normalized pattern: `papillon heart: this effect is continuous and cannot be removed.`

#### 問題の行

```text
Papillon Heart: This effect is continuous and cannot be removed.
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: until_condition
- target: 
- target_type: null
- trigger: Activates when using Burst Skill as long as this unit is still alive
- condition: Activates when using Burst Skill as long as this unit is still alive.<br>Aigis strengthens her allies.<br>Deactivation condition: When Full Burst ends.
- parent_effect_name: Papillon Heart
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

---

## Anis: Star

Skill 1 · Starfall

### Skill Lv.10 原文（該当節全文）

```text
Activates at the start of battle and when Full Burst ends.
Effects vary according to squad formation. Only one set of effects is applied.
If there are no other standard Burst 1 allies:
Effect 1: Affects self. Cancels Everyone's Star.
Effect 2: Affects self. My Own Star: ATK ▲ 40.01%. This effect is continuous and cannot be removed.
Effect 3: Affects all allies. Cooldown of Burst Skill ▼ 7.48 sec.
If there are any other Burst 1 allies:
Effect 1: Affects self. Cancels My Own Star.
Effect 2: Affects self. Everyone's Star: Re-enters Burst and changes to Stage 1. This effect is continuous and cannot be removed.
```

### Candidate 6

- primary reason: special_mechanic
- normalized pattern: `effect {index}: affects self. cancels everyone's star.`

#### 問題の行

```text
Effect 1: Affects self. Cancels Everyone's Star.
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: self.
- target_type: self
- trigger: Activates at the start of battle and when Full Burst ends
- condition: Activates at the start of battle and when Full Burst ends.<br>Effects vary according to squad formation. Only one set of effects is applied.<br>If there are no other standard Burst 1 allies:<br>If there are any other Burst 1 allies:<br>Affects self
- parent_effect_name: null
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

### Candidate 7

- primary reason: special_mechanic
- normalized pattern: `effect {index}: affects self. cancels my own star.`

#### 問題の行

```text
Effect 1: Affects self. Cancels My Own Star.
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: self.
- target_type: self
- trigger: Activates at the start of battle and when Full Burst ends
- condition: Activates at the start of battle and when Full Burst ends.<br>Effects vary according to squad formation. Only one set of effects is applied.<br>If there are no other standard Burst 1 allies:<br>If there are any other Burst 1 allies:<br>Affects self
- parent_effect_name: null
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

### Candidate 8

- primary reason: special_mechanic
- normalized pattern: `effect {index}: affects self. everyone's star: re-enters burst and changes to stage {number}. this effect is continuous and cannot be removed.`

#### 問題の行

```text
Effect 2: Affects self. Everyone's Star: Re-enters Burst and changes to Stage 1. This effect is continuous and cannot be removed.
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: self.
- target_type: self
- trigger: Activates at the start of battle and when Full Burst ends
- condition: Activates at the start of battle and when Full Burst ends.<br>Effects vary according to squad formation. Only one set of effects is applied.<br>If there are no other standard Burst 1 allies:<br>If there are any other Burst 1 allies:<br>Affects self
- parent_effect_name: null
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

---

## Anis: Star

Burst · Star Anis

### Skill Lv.10 原文（該当節全文）

```text
Affects self.
Shooting Stars
Function: Generates stars around Anis that attack random targets automatically.
Damage: 40.01% of final ATK
Attack Interval: 0.25 sec
Duration: 10 sec
Additional Effects
Charge time is fixed at 0.7 sec for 10 sec.
Explosion Radius ▲ 100% for 10 sec.
DEF ▲ 55.01% for 10 sec.
```

### Candidate 9

- primary reason: special_mechanic
- normalized pattern: `attack interval: {seconds} sec`

#### 問題の行

```text
Attack Interval: 0.25 sec
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: self.
- target_type: self
- trigger: Burst Skill activation
- condition: Affects self.<br>Generates stars around Anis that attack random targets automatically.<br>Duration: 10 sec
- parent_effect_name: Shooting Stars
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

---

## Bready

Skill 1 · Lonely Gourmet

### Skill Lv.10 原文（該当節全文）

```text
Activates when gaining a buff that increases sustained damage. Affects self.
Lingering Taste: Charge Speed ▼ 20% for 50 sec. This effect cannot be removed.
Cancels Recommended Taste.
```

### Candidate 10

- primary reason: special_mechanic
- normalized pattern: `cancels recommended taste.`

#### 問題の行

```text
Cancels Recommended Taste.
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: self.
- target_type: self
- trigger: Activates when gaining a buff that increases sustained damage
- condition: Activates when gaining a buff that increases sustained damage. Affects self.
- parent_effect_name: null
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

---

## Bready

Skill 1 · Lonely Gourmet

### Skill Lv.10 原文（該当節全文）

```text
Activates when gaining a buff that increases distributed damage while not in a state of increased sustained damage. Affects self.
Recommended Taste: Charge Speed ▼ 20% for 50 sec. This effect cannot be removed.
Cancels Lingering Taste.
```

### Candidate 11

- primary reason: special_mechanic
- normalized pattern: `cancels lingering taste.`

#### 問題の行

```text
Cancels Lingering Taste.
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: self.
- target_type: self
- trigger: Activates when gaining a buff that increases distributed damage while not in a state of increased sustained damage
- condition: Activates when gaining a buff that increases distributed damage while not in a state of increased sustained damage. Affects self.
- parent_effect_name: null
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

---

## Cinderella: Crystal Wave

Skill 1 · Beauty-Full

### Skill Lv.10 原文（該当節全文）

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

### Candidate 12

- primary reason: special_mechanic
- normalized pattern: `removal condition: reloading to max ammunition while in the preparation for change state.`

#### 問題の行

```text
Removal Condition: Reloading to max ammunition while in the Preparation for Change state.
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: self.
- target_type: self
- trigger: Activates upon reloading to max ammunition while in the Preparation for Change state
- condition: Activates upon reloading to max ammunition while in the Preparation for Change state. Affects self.
- parent_effect_name: Removal Condition
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

---

## D

Skill 2 · Surprise Attack

### Skill Lv.10 原文（該当節全文）

```text
Activates when the stage target appears. Affects all allies.
Fills Burst Gauge by 98.56%. Activates 1 time(s) per battle.
Gains immunity to Stun for 36.95 sec.
```

### Candidate 13

- primary reason: special_mechanic
- normalized pattern: `fills burst gauge by {percent}. activates {number} time(s) per battle.`

#### 問題の行

```text
Fills Burst Gauge by 98.56%. Activates 1 time(s) per battle.
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: all allies.
- target_type: all_allies
- trigger: Activates when the stage target appears
- condition: Activates when the stage target appears. Affects all allies.
- parent_effect_name: null
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

---

## Delta: Ninja Thief

Skill 2 · Ninjutsu Camouflage

### Skill Lv.10 原文（該当節全文）

```text
Activates at the start of battle.
Effects vary according to squad formation. Only one set of effects is applied.
Activates if there are no other Defender allies in the squad. Affects self.
Effect 1: Creates a shield with HP equal to 12.25% of the skill user's final max HP that lasts for 10 sec.
Effect 2: Attract: Taunts all enemies continuously.
Activates if there is another Defender ally in the squad. Affects self.
Effect 1: Ninjutsu Camouflage: Prevents being targeted by single-target attacks for 10 sec. This effect is removed upon taking a direct hit.
Effect 2: Ninjutsu Injection: Restores HP equal to 11.22% of attack damage. This effect is continuous.
```

### Candidate 14

- primary reason: special_mechanic
- normalized pattern: `effect {index}: ninjutsu camouflage: prevents being targeted by single-target attacks for {seconds} sec. this effect is removed upon taking a direct hit.`

#### 問題の行

```text
Effect 1: Ninjutsu Camouflage: Prevents being targeted by single-target attacks for 10 sec. This effect is removed upon taking a direct hit.
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: until_condition
- target: self.
- target_type: self
- trigger: Activates if there is another Defender ally in the squad
- condition: Activates at the start of battle.<br>Effects vary according to squad formation. Only one set of effects is applied.<br>Activates if there is another Defender ally in the squad. Affects self.
- parent_effect_name: null
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

---

## Delta: Ninja Thief

Skill 2 · Ninjutsu Camouflage

### Skill Lv.10 原文（該当節全文）

```text
Activates every 4 sec while in the Ninjutsu Injection state. Affects self.
Ninjutsu IFAK: Lasts for 4 sec.
Function: Stores up HP recovery for a time, after which all allies are healed for the stored amount.
Effect 1: The maximum amount stored is equal to 165.28% of the skill user's final ATK.
Effect 2: Once the duration ends, all allies are healed for the stored recovery amount.
```

### Candidate 15

- primary reason: special_mechanic
- normalized pattern: `ninjutsu ifak: lasts for {seconds} sec.`

#### 問題の行

```text
Ninjutsu IFAK: Lasts for 4 sec.
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: self.
- target_type: self
- trigger: Activates every 4 sec while in the Ninjutsu Injection state
- condition: Activates every 4 sec while in the Ninjutsu Injection state. Affects self.<br>Stores up HP recovery for a time, after which all allies are healed for the stored amount.
- parent_effect_name: Ninjutsu IFAK
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

---

## Elegg: Boom and Shock

Skill 1 · Hello Ghost

### Skill Lv.10 原文（該当節全文）

```text
Activates at the start of battle. Affects 1 random enemy.
Possession lasts for 6 sec.
Ability: Find and capture ghosts possessing the enemy.
Required hit count: 100 time(s) in total, cumulative across all allies.
Effect: Captures 1 ghost when the required hit count reaches 100%. A maximum of 13 ghost(s) can be captured.
Recurring interval: 6 sec
```

### Candidate 16

- primary reason: special_mechanic
- normalized pattern: `possession lasts for {seconds} sec.`

#### 問題の行

```text
Possession lasts for 6 sec.
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: 1 random enemy.
- target_type: null
- trigger: Activates at the start of battle
- condition: Activates at the start of battle. Affects 1 random enemy.
- parent_effect_name: null
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

### Candidate 17

- primary reason: special_mechanic
- normalized pattern: `ability: find and capture ghosts possessing the enemy.`

#### 問題の行

```text
Ability: Find and capture ghosts possessing the enemy.
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: 1 random enemy.
- target_type: null
- trigger: Activates at the start of battle
- condition: Activates at the start of battle. Affects 1 random enemy.
- parent_effect_name: Ability
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

### Candidate 18

- primary reason: special_mechanic
- normalized pattern: `required hit count: {number} time(s) in total, cumulative across all allies.`

#### 問題の行

```text
Required hit count: 100 time(s) in total, cumulative across all allies.
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: 1 random enemy.
- target_type: null
- trigger: Activates at the start of battle
- condition: Activates at the start of battle. Affects 1 random enemy.
- parent_effect_name: Required hit count
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

### Candidate 19

- primary reason: special_mechanic
- normalized pattern: `effect: captures {number} ghost when the required hit count reaches {percent}. a maximum of {number} ghost(s) can be captured.`

#### 問題の行

```text
Effect: Captures 1 ghost when the required hit count reaches 100%. A maximum of 13 ghost(s) can be captured.
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: 1 random enemy.
- target_type: null
- trigger: Activates at the start of battle
- condition: Activates at the start of battle. Affects 1 random enemy.
- parent_effect_name: null
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

---

## Emma: Tactical Upgrade

Skill 1 · Environment Setup

### Skill Lv.10 原文（該当節全文）

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

### Candidate 20

- primary reason: special_mechanic
- normalized pattern: `effect {number} targets: all enemies (including those that appear during environment setup)`

#### 問題の行

```text
Effect 1 Targets: All enemies (including those that appear during Environment Setup)
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: self.
- target_type: self
- trigger: Activates at the start of battle
- condition: Activates at the start of battle. Affects self.
- parent_effect_name: Effect 1 Targets
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

---

## Emma: Tactical Upgrade

Skill 1 · Environment Setup

### Skill Lv.10 原文（該当節全文）

```text
Activates when the enemy appears. Affects self.
Exposure (Cannot be removed)
Effect: Attract: Taunts all enemies continuously.
```

### Candidate 21

- primary reason: special_mechanic
- normalized pattern: `exposure (cannot be removed)`

#### 問題の行

```text
Exposure (Cannot be removed)
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: self.
- target_type: self
- trigger: Activates when the enemy appears
- condition: Activates when the enemy appears. Affects self.
- parent_effect_name: null
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

---

## Emma: Tactical Upgrade

Skill 2 · LT Formation

### Skill Lv.10 原文（該当節全文）

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

### Candidate 22

- primary reason: special_mechanic
- normalized pattern: `effect {index}: affects self. exposure activation disabled continuously.`

#### 問題の行

```text
Effect 3: Affects self. Exposure activation disabled continuously.
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: self.
- target_type: self
- trigger: Activates as long as this unit is still alive
- condition: Activates as long as this unit is still alive.<br>Affects self
- parent_effect_name: Bonus effects while this unit is in the AS Formation state
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

---

## Emma: Tactical Upgrade

Burst · Battlefield Formation

### Skill Lv.10 原文（該当節全文）

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

### Candidate 23

- primary reason: special_mechanic
- normalized pattern: `effect {number} targets: all enemies`

#### 問題の行

```text
Effect 1 Targets: All enemies
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: self.
- target_type: self
- trigger: Activates if this unit is in the Environment Setup state
- condition: Activates if this unit is in the Environment Setup state. Affects self.
- parent_effect_name: Effect 1 Targets
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

---

## Eunhwa: Tactical Upgrade

Burst · Explosive Round

### Skill Lv.10 原文（該当節全文）

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

### Candidate 24

- primary reason: special_mechanic
- normalized pattern: `target: target(s) hit`

#### 問題の行

```text
Target: Target(s) hit
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: self.
- target_type: self
- trigger: Burst Skill activation
- condition: Affects self.
- parent_effect_name: Target
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

---

## EVE

Burst · Counter Chain

### Skill Lv.10 原文（該当節全文）

```text
Affects self.
Exospine Mk2
Function: Enhances Exospine.
Duration: 10 sec.
Triggers Impact-Type Exospine Mk2.
Effect: The damage multiplier of Unstable Energy sequential attacks is scaled by 100%.
Triggers Eagle Eye-Type Exospine Mk2.
Effect: The damage multiplier of Eagle Eye-Type Exospine is scaled by 100%.
```

### Candidate 25

- primary reason: special_mechanic
- normalized pattern: `triggers impact-type exospine mk2.`

#### 問題の行

```text
Triggers Impact-Type Exospine Mk2.
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: self.
- target_type: self
- trigger: Burst Skill activation
- condition: Affects self.<br>Enhances Exospine.<br>Duration: 10 sec.
- parent_effect_name: Exospine Mk2
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

### Candidate 26

- primary reason: special_mechanic
- normalized pattern: `triggers eagle eye-type exospine mk2.`

#### 問題の行

```text
Triggers Eagle Eye-Type Exospine Mk2.
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: self.
- target_type: self
- trigger: Burst Skill activation
- condition: Affects self.<br>Enhances Exospine.<br>Duration: 10 sec.
- parent_effect_name: Exospine Mk2
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

---

## Guillotine: Winter Slayer

Skill 1 · Hero's Fate

### Skill Lv.10 原文（該当節全文）

```text
Activates every time EXP stacks 10. Affects self.
Hero Level Up: Reaches a maximum of Level 11.
Hero Level Up Reward: Reloads 10.26%.
Hero Level Up Reward: Restores HP equal to 2.44% of the skill user's final max HP.
```

### Candidate 27

- primary reason: special_mechanic
- normalized pattern: `hero level up: reaches a maximum of level {number}.`

#### 問題の行

```text
Hero Level Up: Reaches a maximum of Level 11.
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: self.
- target_type: self
- trigger: Activates every time EXP stacks 10
- condition: Activates every time EXP stacks 10. Affects self.
- parent_effect_name: Hero Level Up
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

---

## K

Burst · Means of Righteousness

### Skill Lv.10 原文（該当節全文）

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

### Candidate 28

- primary reason: special_mechanic
- normalized pattern: `pellet count: {number}`

#### 問題の行

```text
Pellet Count: 10
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: self.
- target_type: self
- trigger: Burst Skill activation
- condition: Affects self.
- parent_effect_name: Pellet Count
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

---

## Label

Skill 1 · Meeting and Parting (Imagined)

### Skill Lv.10 原文（該当節全文）

```text
Activates when Delusion ends. Affects self.
Delusion Shattered: Activates up to 2 time(s). This effect is continuous.
Effect 1: Imagined Heartbreak: Prevents being targeted by single-target attacks for 1 sec x Delusion Shattered count. This effect is removed upon taking a direct hit.
Effect 2: Stuns for 1 sec per Delusion Shattered stack.
```

### Candidate 29

- primary reason: special_mechanic
- normalized pattern: `delusion shattered: activates up to {number} time(s). this effect is continuous.`

#### 問題の行

```text
Delusion Shattered: Activates up to 2 time(s). This effect is continuous.
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: self.
- target_type: self
- trigger: Activates up to 2 time(s)
- condition: Activates when Delusion ends. Affects self.<br>Activates up to 2 time(s)
- parent_effect_name: Delusion Shattered
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

### Candidate 30

- primary reason: special_mechanic
- normalized pattern: `effect {index}: imagined heartbreak: prevents being targeted by single-target attacks for {seconds} sec x delusion shattered count. this effect is removed upon taking a direct hit.`

#### 問題の行

```text
Effect 1: Imagined Heartbreak: Prevents being targeted by single-target attacks for 1 sec x Delusion Shattered count. This effect is removed upon taking a direct hit.
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: until_condition
- target: self.
- target_type: self
- trigger: Activates when Delusion ends
- condition: Activates when Delusion ends. Affects self.
- parent_effect_name: Delusion Shattered
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

---

## Mihara: Bonding Chain

Burst · Bonding Pain

### Skill Lv.10 原文（該当節全文）

```text
Affects targets in Ensnaring Chains status.
Dragging Chain: Deals 50.05% of final ATK as sustained damage every second. Mirrors the stack count of Ensnaring Chains on each target for 10 sec. This effect cannot be removed.
Cancels Ensnaring Chains after the effect is triggered.
```

### Candidate 31

- primary reason: special_mechanic
- normalized pattern: `cancels ensnaring chains after the effect is triggered.`

#### 問題の行

```text
Cancels Ensnaring Chains after the effect is triggered.
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: targets in Ensnaring Chains status.
- target_type: null
- trigger: Burst Skill activation
- condition: Affects targets in Ensnaring Chains status.
- parent_effect_name: null
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

---

## Milk: Blooming Bunny

Burst · Embarrassment Explosion

### Skill Lv.10 原文（該当節全文）

```text
Affects self.
Overconfident, Huh?!:
Gains Immunity to Embarrassment for 10 sec.
Pierce Damage ▲ 117.64% for 10 sec.
ATK ▲ 220% for 10 sec.
```

### Candidate 32

- primary reason: special_mechanic
- normalized pattern: `overconfident, huh?!:`

#### 問題の行

```text
Overconfident, Huh?!:
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: self.
- target_type: self
- trigger: Burst Skill activation
- condition: Affects self.
- parent_effect_name: null
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

---

## Mint

Skill 2 · Fantastic Performance!

### Skill Lv.10 原文（該当節全文）

```text
Activates when entering Burst Stage 3 while not in Sing Along status. Affects self.
Cancels Assigned Part: Singing.
Cancels Assigned Part: Dancing.
```

### Candidate 33

- primary reason: special_mechanic
- normalized pattern: `cancels assigned part: singing.`

#### 問題の行

```text
Cancels Assigned Part: Singing.
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: self.
- target_type: self
- trigger: Activates when entering Burst Stage 3 while not in Sing Along status
- condition: Activates when entering Burst Stage 3 while not in Sing Along status. Affects self.
- parent_effect_name: Cancels Assigned Part
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

### Candidate 34

- primary reason: special_mechanic
- normalized pattern: `cancels assigned part: dancing.`

#### 問題の行

```text
Cancels Assigned Part: Dancing.
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: self.
- target_type: self
- trigger: Activates when entering Burst Stage 3 while not in Sing Along status
- condition: Activates when entering Burst Stage 3 while not in Sing Along status. Affects self.
- parent_effect_name: Cancels Assigned Part
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

---

## Mint

Burst · Let's Sing Together!

### Skill Lv.10 原文（該当節全文）

```text
Affects self.
Only one Assigned Part is applied according to Mint's current status.
Status 1: If in the Assigned Part: Dancing status, Mint gains Assigned Part: Singing. This effect is continuous and cannot be removed.
Status 2: If not in the Assigned Part: Dancing status, Mint gains Assigned Part: Dancing. This effect is continuous and cannot be removed.
```

### Candidate 35

- primary reason: special_mechanic
- normalized pattern: `only one assigned part is applied according to mint's current status.`

#### 問題の行

```text
Only one Assigned Part is applied according to Mint's current status.
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: self.
- target_type: self
- trigger: Burst Skill activation
- condition: Affects self.
- parent_effect_name: null
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

---

## Modernia

Burst · New World

### Skill Lv.10 原文（該当節全文）

```text
Affects self.
Unlimited ammunition for 15 sec.
Destroy Mode:
Extends her line of sight and auto-aims at all enemies within range. The stage target is treated as a single enemy regardless of whether it has parts (including interruption parts).
Deals 2.24% of final ATK as damage for 15 sec.
```

### Candidate 36

- primary reason: special_mechanic
- normalized pattern: `extends her line of sight and auto-aims at all enemies within range. the stage target is treated as a single enemy regardless of whether it has parts (including interruption parts).`

#### 問題の行

```text
Extends her line of sight and auto-aims at all enemies within range. The stage target is treated as a single enemy regardless of whether it has parts (including interruption parts).
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: self.
- target_type: self
- trigger: Burst Skill activation
- condition: Affects self.
- parent_effect_name: Destroy Mode
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

---

## Prika

Skill 2 · One More Song!

### Skill Lv.10 原文（該当節全文）

```text
Activates when Sing Along takes effect while Prika is in the Performance state.
Encore
Function: Extends the duration of Performance for Prika and strengthens allies.
Effect 1: Affects the member who initiated Sing Along. Assigned Part: Singing. This effect is continuous and cannot be removed.
Effect 2: Affects all allies. Performance duration ▲ 21 sec.
Effect 3: Affects all allies. Attack Damage ▲ 25.01% for 10 sec.
Effect 4: Affects self. Cooldown of Burst Skill ▲ 21 sec.
```

### Candidate 37

- primary reason: special_mechanic
- normalized pattern: `effect {index}: affects the member who initiated sing along. assigned part: singing. this effect is continuous and cannot be removed.`

#### 問題の行

```text
Effect 1: Affects the member who initiated Sing Along. Assigned Part: Singing. This effect is continuous and cannot be removed.
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: the member who initiated Sing Along.
- target_type: null
- trigger: Activates when Sing Along takes effect while Prika is in the Performance state
- condition: Activates when Sing Along takes effect while Prika is in the Performance state.<br>Extends the duration of Performance for Prika and strengthens allies.<br>Affects the member who initiated Sing Along
- parent_effect_name: Encore
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

---

## Queen (Makoto)

Skill 1 · Persona: Johanna

### Skill Lv.10 原文（該当節全文）

```text
Activates at the start of battle. Affects self.
Persona - Johanna: This effect is continuous and cannot be removed.
Function: Queen (Makoto) strengthens herself using her Persona.
Effect 1: Nuke Boost: Elemental Advantage Attack Damage ▲ 13.59% continuously. This effect cannot be removed.
Effect 2: Defense Master: DEF ▲ 14.78% continuously. This effect cannot be removed.
```

### Candidate 38

- primary reason: special_mechanic
- normalized pattern: `persona - johanna: this effect is continuous and cannot be removed.`

#### 問題の行

```text
Persona - Johanna: This effect is continuous and cannot be removed.
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: self.
- target_type: self
- trigger: Activates at the start of battle
- condition: Activates at the start of battle. Affects self.<br>Queen (Makoto) strengthens herself using her Persona.
- parent_effect_name: Persona - Johanna
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

---

## Queen (Makoto)

Skill 2 · Fist of Justice!

### Skill Lv.10 原文（該当節全文）

```text
Activates when using Burst Skill. Affects self.
Fist of Justice!: This effect is continuous and cannot be removed.
Function: Queen (Makoto) strengthens herself.
Effect 1: Nuke Amp: Elemental Advantage Attack Damage ▲ 25.56% continuously. This effect cannot be removed.
Effect 2: Rakukaja: DEF ▲ 17.95% continuously. This effect cannot be removed.
Deactivation condition: When Full Burst ends.
```

### Candidate 39

- primary reason: special_mechanic
- normalized pattern: `fist of justice!: this effect is continuous and cannot be removed.`

#### 問題の行

```text
Fist of Justice!: This effect is continuous and cannot be removed.
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: until_condition
- target: self.
- target_type: self
- trigger: Activates when using Burst Skill
- condition: Activates when using Burst Skill. Affects self.<br>Queen (Makoto) strengthens herself.<br>Deactivation condition: When Full Burst ends.
- parent_effect_name: null
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

---

## Quency: Escape Queen

Skill 2 · Explore Route

### Skill Lv.10 原文（該当節全文）

```text
Activates after performing 2 normal attacks. Affects self.
Effects vary for each stage. Each subsequent effect triggers all effects before it:
Stage 1: Affects self.
Hit Rate ▲ 1.36%. Stacks up to 10 times and lasts for 2 sec.
ATK ▲ 2.45%. Stacks up to 10 times and lasts for 2 sec.
Stage 2: Activates when Explore Route Stage 1 is at max stacks. Affects self.
Hit Rate ▲ 2.71%. Stacks up to 10 times and lasts for 1 sec.
ATK ▲ 4.9%, stacks up to 10 time(s) and lasts for 1 sec.
Stage 3: Activates when Explore Route Stage 2 is at max stacks. Affects self.
Hit Rate ▲ 4.08%. Stacks up to 5 times and lasts for 0.5 sec.
ATK ▲ 7.36%. Stacks up to 5 times and lasts for 0.5 sec.
```

### Candidate 40

- primary reason: special_mechanic
- normalized pattern: `stage {number}: affects self.`

#### 問題の行

```text
Stage 1: Affects self.
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: self.
- target_type: self
- trigger: Activates after performing 2 normal attacks
- condition: Activates after performing 2 normal attacks. Affects self.<br>Effects vary for each stage. Each subsequent effect triggers all effects before it:<br>Stage 1:
- parent_effect_name: null
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

---

## Rapi: Red Hood

Skill 1 · Battlefield Assessment

### Skill Lv.10 原文（該当節全文）

```text
Activates at the start of battle and when Full Burst ends.
Effect varies according to squad formation. Only one effect is applied.
Activates if there are no standard Burst 1 allies. Affects self.
Combat Assist: Changes to Burst Stage 1. This effect is continuous and cannot be removed.
Activates if there are standard Burst 1 allies. Affects self.
Cancels Combat Assist.
```

### Candidate 41

- primary reason: special_mechanic
- normalized pattern: `combat assist: changes to burst stage {number}. this effect is continuous and cannot be removed.`

#### 問題の行

```text
Combat Assist: Changes to Burst Stage 1. This effect is continuous and cannot be removed.
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: 
- target_type: null
- trigger: Activates at the start of battle and when Full Burst ends
- condition: Activates at the start of battle and when Full Burst ends.<br>Effect varies according to squad formation. Only one effect is applied.
- parent_effect_name: Combat Assist
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

### Candidate 42

- primary reason: special_mechanic
- normalized pattern: `cancels combat assist.`

#### 問題の行

```text
Cancels Combat Assist.
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: self.
- target_type: self
- trigger: Activates if there are standard Burst 1 allies
- condition: Activates at the start of battle and when Full Burst ends.<br>Effect varies according to squad formation. Only one effect is applied.<br>Activates if there are standard Burst 1 allies. Affects self.
- parent_effect_name: null
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

---

## Rapi: Red Hood

Skill 2 · Attachable Projectiles

### Skill Lv.10 原文（該当節全文）

```text
Activates after performing 120 normal attacks. Affects self. 
Attachable Projectiles
Effect: Launches attachable projectiles that attach to hit locations. When entering Full Burst, the projectiles explode.
Projectile Attachment Damage: Deals 88.11% of final ATK as damage.
Projectile Explosion Damage: Deals 88.11% of final ATK as damage.
Max Ammunition Capacity: 1 round(s).
```

### Candidate 43

- primary reason: special_mechanic
- normalized pattern: `attachable projectiles`

#### 問題の行

```text
Attachable Projectiles
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: self.
- target_type: self
- trigger: Activates after performing 120 normal attacks
- condition: Activates after performing 120 normal attacks. Affects self.
- parent_effect_name: null
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

### Candidate 44

- primary reason: special_mechanic
- normalized pattern: `effect: launches attachable projectiles that attach to hit locations. when entering full burst, the projectiles explode.`

#### 問題の行

```text
Effect: Launches attachable projectiles that attach to hit locations. When entering Full Burst, the projectiles explode.
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: self.
- target_type: self
- trigger: Activates after performing 120 normal attacks
- condition: Activates after performing 120 normal attacks. Affects self.
- parent_effect_name: null
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

---

## Raven

Burst · Tempest

### Skill Lv.10 原文（該当節全文）

```text
Affects self.
A.N. Mode
Effect 1: Removes Single Point Attack.
Effect 2: Sustained damage ▲ 89.44% for 10 sec.
```

### Candidate 45

- primary reason: special_mechanic
- normalized pattern: `a.n. mode`

#### 問題の行

```text
A.N. Mode
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: self.
- target_type: self
- trigger: Burst Skill activation
- condition: Affects self.
- parent_effect_name: null
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

---

## Scarlet: Black Shadow

Skill 1 · Fleetly Fading: Breakthrough

### Skill Lv.10 原文（該当節全文）

```text
Activates when performing a Full Charge attack.
Effects vary according to the number of attacks. Only one effect is triggered at a time.
Three times: Affects the 1 enemy unit(s) with the lowest final DEF.
Deals 283.03% of final ATK as damage.
Six times: Affects enemies within attack range.
Deals 565% of final ATK as distributed damage.
Nine times: Affects all enemies.
Deals 848.03% of final ATK as distributed damage.
```

### Candidate 46

- primary reason: special_mechanic
- normalized pattern: `six times: affects enemies within attack range.`

#### 問題の行

```text
Six times: Affects enemies within attack range.
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: 
- target_type: null
- trigger: Activates when performing a Full Charge attack
- condition: Activates when performing a Full Charge attack.<br>Effects vary according to the number of attacks. Only one effect is triggered at a time.<br>Six times:
- parent_effect_name: null
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

### Candidate 47

- primary reason: special_mechanic
- normalized pattern: `nine times: affects all enemies.`

#### 問題の行

```text
Nine times: Affects all enemies.
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: 
- target_type: null
- trigger: Activates when performing a Full Charge attack
- condition: Activates when performing a Full Charge attack.<br>Effects vary according to the number of attacks. Only one effect is triggered at a time.<br>Nine times:
- parent_effect_name: null
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

---

## Snow White: Heavy Arms

Skill 1 · Seven Dwarves V+VI

### Skill Lv.10 原文（該当節全文）

```text
Activates every 0.2 sec while charging. Affects the enemy unit nearest to the crosshair that is not the in Lock-On state.
Lock-On
Function: Designates the enemy as a target of Seven Dwarves.
Max Lock-On Targets: 5
Deactivation condition: Performing a normal attack or taking cover.
```

### Candidate 48

- primary reason: special_mechanic
- normalized pattern: `max lock-on targets: {number}`

#### 問題の行

```text
Max Lock-On Targets: 5
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: the enemy unit nearest to the crosshair that is not the in Lock-On state.
- target_type: null
- trigger: Activates every 0.2 sec while charging
- condition: Activates every 0.2 sec while charging. Affects the enemy unit nearest to the crosshair that is not the in Lock-On state.
- parent_effect_name: Max Lock-On Targets
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

---

## Snow White: Heavy Arms

Skill 1 · Seven Dwarves V+VI

### Skill Lv.10 原文（該当節全文）

```text
Activates every 0.2 sec while charging. Affects self.
Auto Fire Ready
Function: Loads Seven Dwarves with ammo.
Effect: DEF ▲ 42.24% continuously.
Max ammo loaded by Auto Fire Ready: 5
Deactivation condition: Performing a normal attack.
```

### Candidate 49

- primary reason: special_mechanic
- normalized pattern: `max ammo loaded by auto fire ready: {number}`

#### 問題の行

```text
Max ammo loaded by Auto Fire Ready: 5
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: self.
- target_type: self
- trigger: Activates every 0.2 sec while charging
- condition: Activates every 0.2 sec while charging. Affects self.
- parent_effect_name: Max ammo loaded by Auto Fire Ready
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

---

## Snow White: Heavy Arms

Burst · Seven Dwarves Fully Active

### Skill Lv.10 原文（該当節全文）

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

### Candidate 50

- primary reason: special_mechanic
- normalized pattern: `number of uses: {number}`

#### 問題の行

```text
Number of uses: 2
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: self.
- target_type: self
- trigger: Burst Skill activation
- condition: Affects self.
- parent_effect_name: Number of uses
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

---

## Soda: Twinkling Bunny

Skill 2 · Beginner's Rewards

### Skill Lv.10 原文（該当節全文）

```text
Activates when performing a normal attack during Full Burst. Affects the 1 enemy unit(s) nearest to the crosshair. 
Effects vary according to the state of Time Extension. Each subsequent effect triggers all effects before it:
Stage 1: When in Time Extension I state,
deals 52.04% of final ATK as damage.
Stage 2: When in Time Extension II state,
deals 85.02% of final ATK as damage.
```

### Candidate 51

- primary reason: special_mechanic
- normalized pattern: `stage {number}: when in time extension i state,`

#### 問題の行

```text
Stage 1: When in Time Extension I state,
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: the 1 enemy unit(s) nearest to the crosshair.
- target_type: null
- trigger: Activates when performing a normal attack during Full Burst
- condition: Activates when performing a normal attack during Full Burst. Affects the 1 enemy unit(s) nearest to the crosshair.<br>Effects vary according to the state of Time Extension. Each subsequent effect triggers all effects before it:<br>Stage 1:
- parent_effect_name: null
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

### Candidate 52

- primary reason: special_mechanic
- normalized pattern: `stage {number}: when in time extension ii state,`

#### 問題の行

```text
Stage 2: When in Time Extension II state,
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: the 1 enemy unit(s) nearest to the crosshair.
- target_type: null
- trigger: Activates when performing a normal attack during Full Burst
- condition: Activates when performing a normal attack during Full Burst. Affects the 1 enemy unit(s) nearest to the crosshair.<br>Effects vary according to the state of Time Extension. Each subsequent effect triggers all effects before it:<br>Stage 2:
- parent_effect_name: null
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

---

## Soda: Twinkling Bunny

Burst · Onward, Soda!

### Skill Lv.10 原文（該当節全文）

```text
Activates when using Onward, Soda!
Effects vary according to the number of Golden Chip stacks. Each subsequent effect triggers all effects before it. Golden Chip stacks ▼ 17 after the effect is applied.
Stage 1: Affects all enemies.
Deals 628.7% of final ATK as Burst Skill damage.
Stage 2: Activates when Golden Chip is at 20 or more stacks. Affects self.
Hit Rate ▲ 38.91% for 15 sec.
Stage 3: Activates when Golden Chip is at 30 or more stacks. Affects self.
ATK ▲ 65.25% for 15 sec.
```

### Candidate 53

- primary reason: special_mechanic
- normalized pattern: `stage {number}: affects all enemies.`

#### 問題の行

```text
Stage 1: Affects all enemies.
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: 
- target_type: null
- trigger: Activates when using Onward, Soda!
- condition: Activates when using Onward, Soda!<br>Effects vary according to the number of Golden Chip stacks. Each subsequent effect triggers all effects before it. Golden Chip stacks ▼ 17 after the effect is applied.<br>Stage 1:
- parent_effect_name: null
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

---

## Soline: Frost Ticket

Skill 1 · I'll Check Your Ticket!

### Skill Lv.10 原文（該当節全文）

```text
Activates at the start of battle and when using Burst Skill. Affects all allies.
Issues 1 ticket, up to a maximum of 2. This effect is continuous.
Ticket effect: Max HP ▲ number of tickets * 10% of the skill user's max HP.
```

### Candidate 54

- primary reason: special_mechanic
- normalized pattern: `issues {number} ticket, up to a maximum of {number}. this effect is continuous.`

#### 問題の行

```text
Issues 1 ticket, up to a maximum of 2. This effect is continuous.
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: all allies.
- target_type: all_allies
- trigger: Activates at the start of battle and when using Burst Skill
- condition: Activates at the start of battle and when using Burst Skill. Affects all allies.
- parent_effect_name: null
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

---

## Soline: Frost Ticket

Skill 2 · I'll Help You Board the Train!

### Skill Lv.10 原文（該当節全文）

```text
Activates at the start of battle. Affects all allies.
First Train Discount for 6 sec.
Function: The effect of I'll Help You Board the Train! will not use any tickets.
```

### Candidate 55

- primary reason: special_mechanic
- normalized pattern: `first train discount for {seconds} sec.`

#### 問題の行

```text
First Train Discount for 6 sec.
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: all allies.
- target_type: all_allies
- trigger: Activates at the start of battle
- condition: Activates at the start of battle. Affects all allies.<br>The effect of I'll Help You Board the Train! will not use any tickets.
- parent_effect_name: null
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

---

## Trina

Burst · Mother Forest

### Skill Lv.10 原文（該当節全文）

```text
Activates when enemy count aside from Nikkes is more than 2. Affects all allies.
Changes Spread Roots to Wilted Roots.
Wilted Roots: Burst Skill damage of skills with "Affects all enemies" ▲ 64.46% for 5 sec.
```

### Candidate 56

- primary reason: special_mechanic
- normalized pattern: `changes spread roots to wilted roots.`

#### 問題の行

```text
Changes Spread Roots to Wilted Roots.
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: all allies.
- target_type: all_allies
- trigger: Activates when enemy count aside from Nikkes is more than 2
- condition: Activates when enemy count aside from Nikkes is more than 2. Affects all allies.
- parent_effect_name: null
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

---

## Velvet

Skill 1 · Sticky Fingers

### Skill Lv.10 原文（該当節全文）

```text
Activates at the start of battle and when entering Burst Stage 2.
Bullet Snatch
Function: Steals the enemy's ammo and keeps it in her ammo pouch.
Effect 1: Affects all enemies. Removes 5% of ammo.
Effect 2: Affects self. Fills the ammo pouch with 6000 round(s), up to a maximum of 6000. This effect is continuous and cannot be removed.
```

### Candidate 57

- primary reason: special_mechanic
- normalized pattern: `effect {index}: affects self. fills the ammo pouch with {rounds} rounds(s), up to a maximum of {number}. this effect is continuous and cannot be removed.`

#### 問題の行

```text
Effect 2: Affects self. Fills the ammo pouch with 6000 round(s), up to a maximum of 6000. This effect is continuous and cannot be removed.
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: self.
- target_type: self
- trigger: Activates at the start of battle and when entering Burst Stage 2
- condition: Activates at the start of battle and when entering Burst Stage 2.<br>Steals the enemy's ammo and keeps it in her ammo pouch.<br>Affects self
- parent_effect_name: Bullet Snatch
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

---

## Velvet

Skill 1 · Sticky Fingers

### Skill Lv.10 原文（該当節全文）

```text
Activates when attacking with Full Charge while not in Full Burst. Affects self.
Function: Strengthens self by expending ammo from the ammo pouch.
Effect 1: Expends ammo from the ammo pouch. Amount: 100 round(s).
Effect 2: ATK ▲ 30.5% for 3 sec.
Effect 3: Attack Damage ▲ 30.5% for 3 sec.
```

### Candidate 58

- primary reason: special_mechanic
- normalized pattern: `effect {index}: expends ammo from the ammo pouch. amount: {rounds} rounds(s).`

#### 問題の行

```text
Effect 1: Expends ammo from the ammo pouch. Amount: 100 round(s).
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: self.
- target_type: self
- trigger: Activates when attacking with Full Charge while not in Full Burst
- condition: Activates when attacking with Full Charge while not in Full Burst. Affects self.<br>Strengthens self by expending ammo from the ammo pouch.
- parent_effect_name: null
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

---

## Viper

Skill 2 · Snake Scale

### Skill Lv.10 原文（該当節全文）

```text
Activates when entering Full Burst. Affects self.
Vamp: Prevents being targeted by single-target attacks for 10 sec. This effect is removed upon taking a direct hit.
Invulnerable for 1 sec.
```

### Candidate 59

- primary reason: special_mechanic
- normalized pattern: `vamp: prevents being targeted by single-target attacks for {seconds} sec. this effect is removed upon taking a direct hit.`

#### 問題の行

```text
Vamp: Prevents being targeted by single-target attacks for 10 sec. This effect is removed upon taking a direct hit.
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: until_condition
- target: self.
- target_type: self
- trigger: Activates when entering Full Burst
- condition: Activates when entering Full Burst. Affects self.
- parent_effect_name: Vamp
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

---

## Yukiko

Skill 1 · Persona: Konohana Sakuya

### Skill Lv.10 原文（該当節全文）

```text
Activates at the start of battle. Affects self.
Persona - Konohana Sakuya: This effect is continuous and cannot be removed. 
Function: Yukiko heals her allies using her Persona.
Effect 1: Activates every 3 sec. Affects all allies. Media: Restores HP equal to 5.7% of the skill user's final max HP.
```

### Candidate 60

- primary reason: special_mechanic
- normalized pattern: `persona - konohana sakuya: this effect is continuous and cannot be removed.`

#### 問題の行

```text
Persona - Konohana Sakuya: This effect is continuous and cannot be removed.
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: null
- target: self.
- target_type: self
- trigger: Activates at the start of battle
- condition: Activates at the start of battle. Affects self.<br>Yukiko heals her allies using her Persona.
- parent_effect_name: Persona - Konohana Sakuya
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

---

## Yukiko

Skill 2 · Scarlet Flower

### Skill Lv.10 原文（該当節全文）

```text
Activates when using Burst Skill. 
Scarlet Flower: This effect is continuous and cannot be removed.
Function: Yukiko strengthens herself.
Effect 1: Activates every 3 sec. Affects all allies. Mediarama: Restores HP equal to 5.7% of the skill user's final max HP.
Effect 2: Affects self. Fire Amp: Distributed Damage ▲ 90.01% continuously. This effect cannot be removed.
Effect 3: Affects self. Scarlet Protection: Damage taken from Water Code enemies ▼ 17.95% continuously. This effect cannot be removed.
Deactivation condition: When Full Burst ends.
```

### Candidate 61

- primary reason: special_mechanic
- normalized pattern: `scarlet flower: this effect is continuous and cannot be removed.`

#### 問題の行

```text
Scarlet Flower: This effect is continuous and cannot be removed.
```

#### 現在の解析

- effect_type: special_mechanic
- buff_type: null
- modifier_type: null
- value: null
- value_unit: null
- duration_value: null
- duration_unit: until_condition
- target: 
- target_type: null
- trigger: Activates when using Burst Skill
- condition: Activates when using Burst Skill.<br>Yukiko strengthens herself.<br>Deactivation condition: When Full Burst ends.
- parent_effect_name: Scarlet Flower
- section_condition: null
- special_type: null
- resource_type: null
- scaling_type: null
- scaling_source_effect: null
- needs_review_reasons: special_mechanic

#### Parserが判断できなかった理由

監査では「人間判断候補」に分類されています。特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。

---

## 集計

- unique patterns: 61
- occurrences: 61
- character数: 32

### 配置先reason別件数

| Reason | Occurrences |
|---|---:|
| ambiguous_target | 2 |
| ambiguous_value | 1 |
| special_mechanic | 58 |

### 全reason出現件数（複数reasonは重複集計）

| Reason | Occurrences |
|---|---:|
| ambiguous_target | 2 |
| ambiguous_value | 1 |
| ambiguous_trigger | 1 |
| special_mechanic | 58 |

### Read-only input fingerprints

- effects.json: b58eb2fb0ab807ba242daf23ef6bcd44ad5e514350917bd2abc0958c9172ae4c
- review-decisions.json: ffeb7140228fa3de9a1e39d1bbb4b91d5d8ee838ac5deb22d2ef89f67c1ff9ac
- review-items.json: f3fedbbf84a62108376d13c42c6f1bbf98417ea4c790a33478d10ea966ef2a2b
- review-audit-v4.1.json: d15f1dd993dd16a721d53636d7bcb04306e1dcdfdd6d55b13f77f8d1d9117911

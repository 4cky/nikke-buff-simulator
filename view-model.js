export const TYPE = {
  atk:'攻撃力', caster_atk_based_atk:'発動者基準 攻撃力', reference_atk_based_atk:'参照キャラ基準 攻撃力', attack_damage:'攻撃ダメージ',
  core_damage:'コアダメージ', element_damage:'有利属性ダメージ', critical_rate:'クリティカル率',
  critical_damage:'クリティカルダメージ', charge_speed:'チャージ速度', charge_damage:'チャージダメージ',
  reload_speed:'リロード速度',reload_ratio:'弾倉補充率',ammo_reload:'弾薬補充',forced_reload:'強制リロード',reload_time:'リロード時間', max_ammo:'最大装弾数', hit_rate:'命中率', def:'防御力',
  caster_def_based_def:'発動者基準 防御力', max_hp:'最大HP', caster_max_hp_based_hp:'発動者基準 最大HP',caster_max_hp_based_max_hp:'発動者基準 最大HP',reference_max_hp_based_max_hp:'参照キャラ基準 最大HP',caster_max_hp_based_atk:'発動者最大HP基準 攻撃力',
  damage_taken:'被ダメージ', burst_cooldown_reduction:'バーストCT短縮', burst_gauge_related:'バーストゲージ関連',burst_gauge_fill:'バーストゲージ充填',
  pierce:'貫通付与',pierce_range:'貫通範囲',pierce_damage:'貫通ダメージ', hp_recovery_healing_potency:'HP回復 / 回復量（旧）',incoming_healing:'被回復量',hp_recovery:'HP回復',caster_max_hp_based_heal:'発動者最大HP基準 回復',attack_damage_based_heal:'攻撃ダメージ基準 回復',cover_hp_recovery:'遮蔽物回復',decoy_hp_recovery:'デコイHP回復',shield_hp_recovery:'シールドHP回復',revive:'復活',debuff_cleanse:'デバフ解除',
  elemental_advantage_damage:'有利属性攻撃ダメージ',sustained_damage:'持続ダメージ',parts_damage:'パーツダメージ',true_damage:'固定ダメージ',distributed_damage:'分配ダメージ',
  explosion_radius:'爆発範囲',projectile_explosion_damage:'投射体爆発ダメージ',interruption_parts_damage:'阻止部位ダメージ',shield_damage:'シールドへのダメージ',
  projectile_attachment_damage:'投射体付着ダメージ',enemy_projectile_damage:'敵投射体ダメージ',sequential_attack_damage:'連続攻撃ダメージ',
  burst_gauge_fill_speed:'バーストゲージ増加速度',full_burst_duration:'フルバースト時間',burst_skill_damage_aoe:'全体バーストダメージ',burst_skill_damage_single_target:'単体バーストダメージ',skill_cooldown:'スキルCT短縮',
  attack_speed:'攻撃速度',pellet_count:'ペレット数',mg_ramp_up_speed:'MG加速速度',minimum_effective_range:'最小有効射程',maximum_effective_range:'最大有効射程',piercing_radius:'貫通範囲',reload_ratio:'リロード比率',charge_time:'チャージ時間',charge_damage_multiplier:'チャージ倍率',
  charge_speed_overcap_conversion:'チャージ速度超過変換',unlimited_ammo:'弾薬無限',damage_share:'被ダメージ分配',indomitability:'不屈',damage_taken_from_element:'属性別被ダメージ',next_shield_hp:'次回シールドHP',cover_max_hp:'遮蔽物最大HP',cover_def:'遮蔽物防御力',shared_shield:'共有シールド',
  outgoing_healing:'与回復量',healing:'回復量',healing_share:'HP回復分配',normal_attack_crit_rate:'通常攻撃クリティカル率',normal_attack_damage_multiplier:'通常攻撃ダメージ倍率',normal_attack_true_damage:'通常攻撃 固定ダメージ化',debuff_immunity:'デバフ免疫',stack_count_modification_immunity:'スタック数操作無効',burst_stage_reentry:'バースト段階再突入',burst_stage_change:'バースト段階変更',stackable_buff_stack_increase:'スタック可能バフ +stack',invulnerability:'無敵',single_target_untargetable:'単体攻撃の対象外',shield:'シールド',other:'その他'
};
export const CATEGORIES = Object.keys(TYPE);
export const SLOT = {'Skill 1':'スキル1', 'Skill 2':'スキル2', Burst:'バースト'};
export const UNIT_NOTE = {percent:'',percent_of_attack_damage:'攻撃ダメージ基準', caster_atk_percent:'発動者の攻撃力基準',reference_atk_percent:'参照キャラの攻撃力基準', caster_def_percent:'発動者の防御力基準', caster_max_hp_percent:'発動者の最大HP基準',caster_final_max_hp_percent:'発動者の最終最大HP基準',reference_max_hp_percent:'参照キャラの最大HP基準', caster_charge_speed_percent:'発動者のチャージ速度基準', seconds:'',rounds:'発', boolean:'', conversion:'変換率', flat_value:'固定値',count:'個数'};
const OTHER = {Invulnerable:'無敵', Taunt:'挑発', Shield:'シールド', Pierce:'貫通付与', 'Cover recovery':'遮蔽物回復'};
const IMMUNITY = {any_debuff:'デバフ免疫',decrease_charge_speed:'チャージ速度低下 無効',embarrassment:'Embarrassment 無効',noise_pollution:'Noise Pollution 無効',proof_of_violation:'Proof of Violation 無効',stun:'スタン無効'};
export const relation = record => record.target_type === 'self' ? 'self' : 'allies';
export const numericRaw = record => typeof record.value === 'number' && Number.isFinite(record.value) ? record.value : null;
export const effectLabel = record => record.buff_type === 'other' ? (OTHER[record.notes] || record.notes || TYPE.other)
  : record.buff_type === 'debuff_immunity' ? (IMMUNITY[record.immune_effect] || record.raw_label || TYPE.debuff_immunity)
  : TYPE[record.buff_type] || record.buff_type;

export function formatRaw(record, value = record.value) {
  if(record.buff_type==='debuff_immunity'){
    if(record.immune_effect!=='any_debuff')return value?'あり':'なし';
    if(['infinity','unlimited'].includes(record.immunity_count))return '無制限';
    if(Number.isInteger(record.immunity_count))return `${record.immunity_count}回`;
  }
  if (typeof value === 'boolean') return value ? 'あり' : 'なし';
  if (value === null || value === undefined) return '数値なし';
  if (record.value_unit.endsWith('percent')) return `${value}%`;
  if (record.value_unit === 'seconds') return `${value} sec`;
  if (record.value_unit === 'rounds') return `${value} rounds`;
  if (record.value_unit === 'conversion') return `${value}%`;
  return String(value);
}

export function filterRecords(records, state = {}) {
  const {query='', type='', target='', slot='', condition='include', stack='include', mode='all'} = state;
  const needle = query.trim().toLowerCase();
  return records.filter(r => {
    const conditional = Boolean(r.condition), stacked = Boolean(r.stack_count);
    return (mode === 'all' || relation(r) === mode)
      && (!needle || r.character_name.toLowerCase().includes(needle))
      && (!type || r.buff_type === type) && (!target || r.target_type === target) && (!slot || r.skill_slot === slot)
      && (condition === 'include' || (condition === 'only' ? conditional : !conditional))
      && (stack === 'include' || (stack === 'only' ? stacked : !stacked));
  });
}

// Presentation grouping only: the original effect records stay separate.
// Units and SELF/ALLY never compete for the same representative value.
export function summarizeRows(records) {
  const rows = new Map();
  for (const record of records) {
    const subtype = record.buff_type === 'other' ? record.notes : record.buff_type === 'debuff_immunity' ? `${record.immune_effect}:${record.immunity_count}` : '';
    const key = JSON.stringify([record.buff_type, relation(record), record.value_unit, subtype]);
    if (!rows.has(key)) rows.set(key, {key, type:record.buff_type, relation:relation(record), unit:record.value_unit, label:effectLabel(record), effects:[]});
    rows.get(key).effects.push(record);
  }
  for (const row of rows.values()) {
    row.effects.sort((a,b) => (numericRaw(b) ?? -Infinity) - (numericRaw(a) ?? -Infinity));
    row.top = row.effects[0];
  }
  return [...rows.values()].sort((a,b) => CATEGORIES.indexOf(a.type) - CATEGORIES.indexOf(b.type)
    || (a.relation === b.relation ? 0 : a.relation === 'self' ? -1 : 1)
    || a.unit.localeCompare(b.unit) || a.label.localeCompare(b.label,'ja'));
}

export function characterGroups(records, sort = 'character', selectedType = '') {
  const map = new Map();
  for (const r of records) {
    if (!map.has(r.character_name)) map.set(r.character_name, []);
    map.get(r.character_name).push(r);
  }
  const result = [...map.entries()];
  // A multi-category comparison has no meaningful combined numeric score.
  return result.sort((a,b) => {
    if (!selectedType) return a[0].localeCompare(b[0]);
    const aHasType = a[1].some(r => r.buff_type === selectedType);
    const bHasType = b[1].some(r => r.buff_type === selectedType);
    if (aHasType !== bHasType) return aHasType ? -1 : 1;
    if (selectedType === 'other' || sort === 'character') return a[0].localeCompare(b[0]);
    const metrics = effects => {
      const candidates = effects.filter(r => r.buff_type === selectedType && numericRaw(r) !== null).sort((x,y) => x.value_unit.localeCompare(y.value_unit) || y.value - x.value);
      return candidates[0];
    };
    const av = metrics(a[1]), bv = metrics(b[1]);
    if (!av || !bv) return av ? -1 : bv ? 1 : a[0].localeCompare(b[0]);
    const byUnit = av.value_unit.localeCompare(bv.value_unit);
    return byUnit || (sort === 'value-asc' ? av.value - bv.value : bv.value - av.value) || a[0].localeCompare(b[0]);
  });
}

export function comparisonStatus(selectedType, sort = 'character') {
  if (!selectedType) return '並び替え中：キャラクター名（昇順）';
  const label = TYPE[selectedType] || selectedType;
  if (sort === 'character' || ['other','debuff_immunity'].includes(selectedType)) return `並び替え中：${label}の所持を優先 → キャラクター名`;
  return `並び替え中：${label}（${sort === 'value-asc' ? '昇順' : '降順'}）`;
}

export function comparisonGroups(records, state = {}, sort = 'character', onlyMatching = false) {
  const filtered = filterRecords(records,{...state,type:''});
  const groups = characterGroups(filtered,sort,state.type || '');
  return state.type && onlyMatching ? groups.filter(([,effects]) => effects.some(r => r.buff_type === state.type)) : groups;
}

export function relationSummary(records) {
  if (!records.length) return '未確認';
  const types = new Set(records.map(relation));
  return types.size === 2 ? 'SELF + ALLY' : types.has('self') ? 'SELF' : 'ALLY';
}

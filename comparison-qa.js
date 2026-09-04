export const COMPARISON_EFFECT_TYPES=['buff','heal','revive'];

export function auditComparisonDataset(records,{expectedCount=null,expectedCounts=null}={}){
  const errors=[],ids=new Set(),counts=Object.fromEntries(COMPARISON_EFFECT_TYPES.map(type=>[type,0]));
  if(!Array.isArray(records))return {errors:['comparison dataset is not an array'],counts,total:0};
  for(const record of records){
    if(!COMPARISON_EFFECT_TYPES.includes(record.effect_type))errors.push(`${record.effect_id}: excluded effect_type ${record.effect_type}`);
    else counts[record.effect_type]++;
    if(record.needs_review)errors.push(`${record.effect_id}: needs_review effect`);
    if(record.comparison_excluded)errors.push(`${record.effect_id}: comparison_excluded effect`);
    if(record.metadata_only)errors.push(`${record.effect_id}: metadata-only effect`);
    if(!record.effect_id||ids.has(record.effect_id))errors.push(`${record.effect_id||'(missing id)'}: duplicate or missing effect_id`);
    ids.add(record.effect_id);
  }
  if(expectedCount!==null&&records.length!==expectedCount)errors.push(`comparison count ${records.length} != ${expectedCount}`);
  for(const [type,expected] of Object.entries(expectedCounts||{}))if(counts[type]!==expected)errors.push(`${type} count ${counts[type]} != ${expected}`);
  return {errors,counts,total:records.length};
}

export function rawSortUnits(records,buffType){
  return new Set(records.filter(r=>r.buff_type===buffType&&typeof r.value==='number'&&Number.isFinite(r.value)).map(r=>r.value_unit));
}
export function canRawSort(records,buffType){return Boolean(buffType)&&rawSortUnits(records,buffType).size===1;}

const selectionLabel=value=>({random:'random',highest_atk:'highest ATK',highest_final_atk:'highest final ATK',highest_max_hp:'highest max HP',lowest_remaining_hp:'lowest remaining HP',leftmost:'leftmost',rightmost:'rightmost'}[value]||value);
export function targetMetadata(record){
  const parts=[];
  if(record.target_type)parts.push(`type: ${record.target_type}`);
  if(record.target_count!==null&&record.target_count!==undefined)parts.push(`count: ${record.target_count}`);
  if(record.target_selection)parts.push(`selection: ${selectionLabel(record.target_selection)}`);
  if(record.include_self)parts.push('includes self');
  if(record.exclude_caster_from_selection)parts.push('caster excluded from selection');
  if(record.target_class)parts.push(`class: ${record.target_class}`);
  if(record.target_weapon)parts.push(`weapon: ${record.target_weapon}`);
  if(record.target_element)parts.push(`element: ${record.target_element}`);
  if(record.target_scope)parts.push(`scope: ${record.target_scope}`);
  if(record.target_condition)parts.push(`condition: ${record.target_condition}`);
  return parts.join(' · ');
}

export function scalingMetadata(record,unitNote=''){
  const parts=[];
  if(unitNote)parts.push(unitNote);
  if(record.value_basis)parts.push(`basis: ${record.value_basis}`);
  if(record.reference_stat)parts.push(`reference stat: ${record.reference_stat}`);
  if(record.reference_target_type)parts.push(`reference target: ${record.reference_target_type}`);
  if(record.reference_target_selection)parts.push(`reference selection: ${selectionLabel(record.reference_target_selection)}`);
  if(record.scaling_source)parts.push(`scaling source: ${record.scaling_source}`);
  if(record.scaling_type)parts.push(`scaling type: ${record.scaling_type}`);
  if(record.scaling_source_effect)parts.push(`scaling effect: ${record.scaling_source_effect}`);
  return [...new Set(parts)].join(' · ');
}

export function periodicMetadata(record){
  const parts=[];
  if(record.heal_type)parts.push(`heal type: ${record.heal_type}`);
  if(record.tick_interval!==null&&record.tick_interval!==undefined)parts.push(`tick: ${record.tick_interval} ${record.tick_interval_unit||''}`.trim());
  return parts.join(' · ');
}

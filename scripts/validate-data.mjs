import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {safeSourceUrl} from '../sources.js';
const read=async p=>JSON.parse(await readFile(p,'utf8'));
// Checks only the subset of JSON Schema used here, plus game data invariants.
export function validateShape(value,schema,path='record') {
  const errors=[], fail=message=>errors.push(`${path}: ${message}`);
  const type=value===null?'null':Array.isArray(value)?'array':typeof value;
  if(schema.type&&!([schema.type].flat().includes(type)||Number.isInteger(value)&&[schema.type].flat().includes('integer')))fail('invalid type');
  if(schema.enum&&!schema.enum.includes(value))fail('not in enum');
  if('const' in schema&&value!==schema.const)fail('invalid constant');
  if(typeof value==='number'&&(!Number.isFinite(value)||schema.minimum!==undefined&&value<schema.minimum))fail('invalid number');
  if(typeof value==='string'){
    if(schema.minLength&&value.length<schema.minLength)fail('empty string');
    if(schema.pattern&&!new RegExp(schema.pattern).test(value))fail('pattern mismatch');
    if(schema.format==='date'&&(!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value))||new Date(value).toISOString().slice(0,10)!==value))fail('invalid date');
    if(schema.format==='uri'){try{new URL(value);}catch{fail('invalid URI');}}
    if(schema.format==='date-time'&&(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)||!Number.isFinite(Date.parse(value))))fail('invalid timestamp');
  }
  if(type==='array'){
    if(schema.uniqueItems&&new Set(value.map(v=>JSON.stringify(v))).size!==value.length)fail('duplicate items');
    if(schema.items)value.forEach((v,i)=>errors.push(...validateShape(v,schema.items,`${path}[${i}]`)));
  }
  if(type==='object'){
    for(const key of schema.required||[])if(!(key in value))fail(`missing ${key}`);
    for(const [key,sub] of Object.entries(schema.properties||{}))if(key in value)errors.push(...validateShape(value[key],sub,`${path}.${key}`));
  }
  return errors;
}
export function validateDataset(characters,effects,charSchema,effectSchema){
  const errors=[],ids=new Map(),eids=new Set();
  for(const c of characters){
    errors.push(...validateShape(c,charSchema,c.character_id));
    if(ids.has(c.character_id))errors.push(`Duplicate character ${c.character_id}`);ids.set(c.character_id,c);
    if(c.release_date&&!c.release_source_url)errors.push(`Missing release source ${c.character_id}`);
    if(c.release_date===null&&c.release_order!==null)errors.push(`Guessed release order ${c.character_id}`);
  }
  const units={caster_atk_based_atk:'caster_atk_percent',reference_atk_based_atk:'reference_atk_percent',caster_def_based_def:'caster_def_percent',caster_max_hp_based_hp:'caster_max_hp_percent',
    caster_max_hp_based_max_hp:'caster_max_hp_percent',reference_max_hp_based_max_hp:'reference_max_hp_percent',caster_max_hp_based_heal:'caster_max_hp_percent',caster_max_hp_based_atk:'caster_max_hp_percent',shared_shield:'caster_final_max_hp_percent',burst_cooldown_reduction:'seconds'};
  for(const e of effects){
    errors.push(...validateShape(e,effectSchema,e.effect_id));
    if(eids.has(e.effect_id))errors.push(`Duplicate effect ${e.effect_id}`);eids.add(e.effect_id);
    if(ids.get(e.character_id)?.character_name!==e.character_name)errors.push(`Invalid character link ${e.effect_id}`);
    if(units[e.buff_type]&&e.value_unit!==units[e.buff_type])errors.push(`Invalid unit ${e.effect_id}`);
    if(['atk','def','max_hp'].includes(e.buff_type)&&(e.value_unit.startsWith('caster_')||e.value_unit.startsWith('reference_')))errors.push(`Stat basis category mixed ${e.effect_id}`);
    if(e.buff_type.startsWith('reference_')&&!(e.reference_stat&&e.reference_target_type&&e.reference_target_selection))errors.push(`Missing reference-stat axes ${e.effect_id}`);
    if(e.stack_count&&typeof e.value==='number'&&(e.max_raw_value===null||Math.abs(e.max_raw_value-e.value*e.stack_count)>1e-7))errors.push(`Invalid raw stack product ${e.effect_id}`);
    if(e.value_unit==='boolean'&&typeof e.value!=='boolean')errors.push(`Invalid boolean ${e.effect_id}`);
    if(!e.source_text)errors.push(`Missing source ${e.effect_id}`);
    if(e.trigger===null&&!e.source_limitations?.includes('trigger_not_stated'))errors.push(`Missing trigger limitation ${e.effect_id}`);
    if(e.duration===null&&!e.source_limitations?.includes('duration_not_stated'))errors.push(`Missing duration limitation ${e.effect_id}`);
    if(!safeSourceUrl(e.source_type,e.source_url))errors.push(`Invalid source host/type ${e.effect_id}`);
    if(e.source_conflict&&!e.needs_review)errors.push(`Unflagged source conflict ${e.effect_id}`);
  }
  return errors;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const [chars,effects,cs,es]=await Promise.all(['data/characters.json','data/effects.json','data/character-schema.json','data/effect-schema.json'].map(read));
  const errors=validateDataset(chars,effects,cs,es);
  if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log(`Validated ${chars.length} characters and ${effects.length} effects.`);
}

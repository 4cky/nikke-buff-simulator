import {createHash} from 'node:crypto';
import {hash as sourceHash} from './source-policy.mjs';
import {validateDataset} from './validate-data.mjs';

const volatileKeys=new Set(['generated_at','source_checked_at','collected_at','explorer_index_checked_at','changed_at']);
export const sha256=value=>createHash('sha256').update(typeof value==='string'?value:stableStringify(value)).digest('hex');
export function stableStringify(value){
  if(Array.isArray(value))return `[${value.map(stableStringify).join(',')}]`;
  if(value&&typeof value==='object')return `{${Object.keys(value).sort().map(k=>`${JSON.stringify(k)}:${stableStringify(value[k])}`).join(',')}}`;
  return JSON.stringify(value);
}
export function withoutVolatile(value){
  if(Array.isArray(value))return value.map(withoutVolatile);
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).filter(([k])=>!volatileKeys.has(k)).map(([k,v])=>[k,withoutVolatile(v)]));
  return value;
}
const slotOrder=new Map([['Skill 1',1],['Skill 2',2],['Burst',3]]);
export function makeRawSourceSnapshots(characters,skillSnapshots){
  return characters.map(character=>{
    const skills=skillSnapshots.filter(s=>s.character_id===character.character_id).map(s=>({
      skill_slot:s.skill_slot,skill_name:s.skill_name,source_type:s.source_type,source_url:s.source_url,
      source_checked_at:s.source_checked_at,source_skill_id:s.source_skill_id,raw_skill_text:s.text||'',
      content_hash:sha256(s.text||'')
    })).sort((a,b)=>(slotOrder.get(a.skill_slot)||9)-(slotOrder.get(b.skill_slot)||9)||a.source_skill_id.localeCompare(b.source_skill_id));
    const identity=skills.map(({source_checked_at,...s})=>s);
    const types=[...new Set(skills.map(s=>s.source_type))],urls=[...new Set(skills.map(s=>s.source_url))];
    return {character_id:character.character_id,character_name:character.character_name,
      source_type:types.length===1?types[0]:'mixed',source_url:urls.length===1?urls[0]:character.nikke_gg_url||character.nikke_explorer_url||null,
      source_checked_at:skills.map(s=>s.source_checked_at).filter(Boolean).sort().at(-1)||null,raw_skill_texts:skills,
      content_hash:sha256(identity)};
  }).sort((a,b)=>a.character_id.localeCompare(b.character_id));
}
export function diffRawSourceSnapshots(before,after){
  const oldMap=new Map(before.map(s=>[s.character_id,s])),newMap=new Map(after.map(s=>[s.character_id,s]));
  const added=after.filter(s=>!oldMap.has(s.character_id)),removed=before.filter(s=>!newMap.has(s.character_id));
  const changed=after.filter(s=>oldMap.has(s.character_id)&&oldMap.get(s.character_id).content_hash!==s.content_hash);
  const unchanged=after.filter(s=>oldMap.get(s.character_id)?.content_hash===s.content_hash);
  const skill_changes=[];
  for(const current of changed){
    const previous=oldMap.get(current.character_id),oldSkills=new Map(previous.raw_skill_texts.map(s=>[s.skill_slot,s]));
    for(const skill of current.raw_skill_texts){
      const old=oldSkills.get(skill.skill_slot);
      if(!old||old.content_hash!==skill.content_hash)skill_changes.push({character_id:current.character_id,character_name:current.character_name,
        skill_slot:skill.skill_slot,skill_name:skill.skill_name,old_text:old?.raw_skill_text||null,new_text:skill.raw_skill_text,
        old_hash:old?.content_hash||null,new_hash:skill.content_hash});
    }
    for(const old of previous.raw_skill_texts)if(!current.raw_skill_texts.some(s=>s.skill_slot===old.skill_slot))skill_changes.push({
      character_id:current.character_id,character_name:current.character_name,skill_slot:old.skill_slot,skill_name:old.skill_name,
      old_text:old.raw_skill_text,new_text:null,old_hash:old.content_hash,new_hash:null});
  }
  return {added,changed,removed,unchanged,skill_changes};
}
export function effectSemanticIdentity(e){
  return stableStringify({character_id:e.character_id,skill_slot:e.skill_slot,source_section_index:e.source_section_index??null,
    effect_index:e.effect_index??null,parent_effect_name:e.parent_effect_name??null,effect_type:e.effect_type??'buff',buff_type:e.buff_type??null,
    special_type:e.special_type??null,resource_type:e.resource_type??null,modifier_type:e.modifier_type??null,value:e.value??null,
    value_unit:e.value_unit??null,target_type:e.target_type??null,target:e.target??null,duration:e.duration??null,trigger:e.trigger??null,
    condition:e.condition??null,section_condition:e.section_condition??null,source_text:e.source_text??null});
}
export function diffEffects(before,after){
  const oldMap=new Map(before.map(e=>[e.effect_id,e])),newMap=new Map(after.map(e=>[e.effect_id,e]));
  return {added:after.filter(e=>!oldMap.has(e.effect_id)),removed:before.filter(e=>!newMap.has(e.effect_id)),
    changed:after.filter(e=>oldMap.has(e.effect_id)&&stableStringify(withoutVolatile(e))!==stableStringify(withoutVolatile(oldMap.get(e.effect_id))))};
}
export function protectManualOverrides(output,currentCharacters,currentEffects){
  const protectedEffects=currentEffects.filter(e=>e.manual_override===true),protectedCharacters=currentCharacters.filter(c=>c.manual_override===true);
  let attempted=0;
  const candidateById=new Map(output.effects.map(e=>[e.effect_id,e]));
  for(const current of protectedEffects){const candidate=candidateById.get(current.effect_id);if(candidate&&stableStringify(withoutVolatile(candidate))!==stableStringify(withoutVolatile(current)))attempted++;candidateById.set(current.effect_id,current);}
  output.effects=[...candidateById.values()];
  const characterById=new Map(output.characters.map(c=>[c.character_id,c]));
  for(const current of protectedCharacters){const candidate=characterById.get(current.character_id);if(candidate&&stableStringify(withoutVolatile(candidate))!==stableStringify(withoutVolatile(current)))attempted++;characterById.set(current.character_id,current);}
  output.characters=[...characterById.values()];
  return {protected_count:protectedEffects.length+protectedCharacters.length,attempted_overwrite_count:attempted,actual_overwrite_count:0};
}
export function protectReviewDecisions(output,store){
  const snapshots=output['skill-snapshots']||[],stale=[];
  for(const decision of store.decisions||[]){
    const original=decision.item_snapshot||{},snapshot=snapshots.find(s=>s.character_id===original.character_id&&s.skill_slot===original.skill_slot);
    const section=original.source_section_index===null?snapshot?.text:(snapshot?.text||'').split('■').slice(1)[original.source_section_index];
    const currentHash=section?sourceHash(String(section).replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim()):null;
    if(!snapshot||currentHash!==decision.source_hash){
      stale.push({review_key:decision.review_key,character_id:original.character_id,character_name:original.character_name,skill_slot:original.skill_slot,
        previous_source_hash:decision.source_hash,current_source_hash:currentHash,source_missing:!snapshot,previous_review_status:decision.review_status});
      output.effects=output.effects.filter(e=>e.review_key!==decision.review_key&&!decision.effects?.some(d=>d.effect_id===e.effect_id));
      const item=(output['review-items']||[]).find(r=>r.review_key===decision.review_key);
      if(item)Object.assign(item,{stale_review_decision:true,previous_review_status:decision.review_status,review_status:'hold',needs_review:true});
    }
  }
  if(stale.length){
    output['review-queue']=(output['review-items']||[]).filter(r=>r.needs_review);
    output['collection-report'].pending_sections=output['review-queue'].length;
    output['collection-report'].comparable_effects=output.effects.filter(e=>!e.needs_review).length;
  }
  output['stale-review-decisions']=stale;
  return {protected_count:(store.decisions||[]).length,stale_count:stale.length,reused_count:(store.decisions||[]).length-stale.length};
}
export function stableIdViolations(before,after,unchangedCharacterIds){
  const allowed=new Set(unchangedCharacterIds),group=records=>{
    const map=new Map();for(const e of records)if(allowed.has(e.character_id)){const key=effectSemanticIdentity(e);if(!map.has(key))map.set(key,[]);map.get(key).push(e.effect_id);}
    for(const ids of map.values())ids.sort();return map;
  },old=group(before),next=group(after),violations=[];
  for(const [identity,ids] of old){const current=next.get(identity)||[];if(stableStringify(ids)!==stableStringify(current))violations.push({
    character_id:JSON.parse(identity).character_id,expected_effect_ids:ids,actual_effect_ids:current});}
  return violations;
}
const countLimitations=effects=>effects.flatMap(e=>e.source_limitations||[]).reduce((m,k)=>(m[k]=(m[k]||0)+1,m),{});
export function auditCandidate(output,{characterSchema,effectSchema,current,manualProtection,idViolations=[]}={}){
  const comparison=output.effects||[],nonbuff=output['non-buff-effects']||[],metadata=output['metadata-only-effects']||[];
  const errors=validateDataset(output.characters,comparison,characterSchema,effectSchema);
  const allowed=new Set(['buff','heal','revive']);
  const forbidden=comparison.filter(e=>!allowed.has(e.effect_type||'buff')||e.needs_review||e.comparison_excluded||e.metadata_only);
  if(forbidden.length)errors.push(`comparison boundary violation: ${forbidden.length}`);
  if((output['unknown-buff-candidates']||[]).length)errors.push(`Unknown Buff Type: ${output['unknown-buff-candidates'].length}`);
  if((output['unrecognized-positive-effect-candidates']||[]).length)errors.push(`Unrecognized positive: ${output['unrecognized-positive-effect-candidates'].length}`);
  const sets=[comparison,nonbuff,metadata],ids=new Set(),overlap=[];
  for(const group of sets)for(const e of group){if(ids.has(e.effect_id))overlap.push(e.effect_id);ids.add(e.effect_id);}
  if(overlap.length)errors.push(`effect ID overlap: ${overlap.length}`);
  if(idViolations.length)errors.push(`stable effect ID violation: ${idViolations.length}`);
  if(manualProtection.actual_overwrite_count!==0)errors.push(`manual override overwrite: ${manualProtection.actual_overwrite_count}`);
  const counts={characters:output.characters.length,comparison:comparison.length,excluded:nonbuff.length+metadata.length,
    structured:comparison.length+nonbuff.length+metadata.length,review:(output['review-queue']||[]).filter(r=>r.needs_review).length,
    unknown_buff_types:(output['unknown-buff-candidates']||[]).length,unrecognized_positive:(output['unrecognized-positive-effect-candidates']||[]).length,
    source_conflicts:(output['source-conflicts']||[]).length,source_limitations:countLimitations(comparison)};
  const before=current||counts,removedCharacters=Math.max(0,before.characters-counts.characters),removedEffects=Math.max(0,before.structured-counts.structured);
  const suspicious=[];
  if(removedCharacters>Math.max(5,Math.ceil(before.characters*.05)))suspicious.push(`characters ${before.characters} -> ${counts.characters}`);
  if(removedEffects>Math.max(50,Math.ceil(before.structured*.10)))suspicious.push(`structured effects ${before.structured} -> ${counts.structured}`);
  if(suspicious.length)errors.push(`suspicious_update: ${suspicious.join(', ')}`);
  return {errors:[...new Set(errors)],counts,overlap_count:overlap.length,suspicious_update:suspicious.length>0,suspicious_reasons:suspicious};
}
export function diffLimitations(before,after){
  const a=countLimitations(before),b=countLimitations(after),keys=[...new Set([...Object.keys(a),...Object.keys(b)])].sort();
  return keys.filter(k=>a[k]!==b[k]).map(k=>({source_limitation:k,before:a[k]||0,after:b[k]||0}));
}

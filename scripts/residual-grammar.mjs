import {parseEffectLine,normalizeEffectAxes} from './effect-grammar.mjs';
import {aggregateUnknownCandidates,aggregateUnrecognizedPositiveCandidates} from './skill-hierarchy.mjs';

export const RESIDUAL_GRAMMAR_VERSION='4.2.1';
export const RESIDUAL_RULE_IDS=[
  'target.compound-selection','target.named-state','target.same-targets','target.class-element-weapon','target.effect-local',
  'trigger.chance-of-activating','trigger.named-threshold','duration.parent-counted','duration.until-condition',
  'value.stat-decrease-penalty','value.named-stack-scaling','value.caster-stat-scaling','value.boolean-grant',
  'effect.revive-cover-rebuild','effect.cleanse-stack','effect.damage-parameter','effect.resource-operation',
  'effect.weapon-state','effect.damage-conversion','effect.shield-invulnerability','routing.metadata-only','routing.named-heading',
  'routing.parent-inheritance','review.resolved-noncomparison'
];

const unique=xs=>[...new Set(xs.filter(x=>x!==null&&x!==undefined&&x!==''))];
const normalized=text=>String(text||'').normalize('NFKC').replace(/[“”]/g,'"').replace(/[‘’]/g,"'")
  .replace(/^Effect\s+\d+\s*:\s*/i,'Effect {index}: ').replace(/\b\d+(?:\.\d+)?\s*%/g,'{percent}')
  .replace(/\b\d+(?:\.\d+)?\s*(?:sec(?:ond)?s?)\b/gi,'{seconds} sec')
  .replace(/\b\d+(?:\.\d+)?\s*(?:round(?:\(s\)|s)?|shot(?:\(s\)|s)?|time(?:\(s\)|s)?)\b/gi,'{count} count')
  .replace(/\b\d+(?:\.\d+)?\b/g,'{number}').replace(/\s+/g,' ').trim().toLowerCase();
const reviewKey=(characterId,slot,index)=>`${characterId}:${slot}:section-${index}`;
const valueOr=(v,fallback)=>v===null||v===undefined?fallback:v;

function targetAxes(auditRow,auditCandidate){
  const p=auditRow.target_analysis||{},raw=auditCandidate.current_target||extractTarget(auditRow.source_section)||'';
  return {target:raw?String(raw).replace(/\.?$/,'.'):'',target_type:auditCandidate.current_target_type||p.target_type||null,
    target_count:p.target_count??null,target_selection:p.target_selection??null,target_condition:p.target_condition??null,
    target_class:p.target_class??null,target_weapon:p.target_weapon??null,target_element:p.target_element??null};
}
function extractTarget(text){return String(text||'').match(/Affects?\s+([^\n.]+(?:\([^)]*\))?)/i)?.[1]||(/protects all allies/i.test(text||'')?'all allies':null);}
function explicitTrigger(text){
  const chance=String(text||'').match(/There is a ([^\n.]+ chance of activating when [^\n.]+)/i);if(chance)return chance[0].replace(/\.$/,'');
  return String(text||'').match(/(?:Only )?Activates\b[^\n.]*|Activates? after[^\n.]*/i)?.[0]?.replace(/\.$/,'')||null;
}
function durationFromAudit(row,candidate){
  const a=row.duration_analysis;
  if(a?.resolution==='A'&&a.kind==='parent_duration_inheritance')return {duration:`${a.value} ${a.unit}`,duration_value:a.value,duration_unit:a.unit,duration_type:a.unit==='seconds'?'fixed':'counted'};
  if(a?.resolution==='A'&&a.kind==='until_condition')return {duration:`Until ${a.end_condition}`,duration_value:null,duration_unit:'until_condition',duration_type:'conditional',end_condition:a.end_condition};
  return {duration:candidate.current_duration||null,duration_value:candidate.current_duration_value??null,duration_unit:candidate.current_duration_unit??null,duration_type:candidate.current_duration_type||null,end_condition:candidate.current_end_condition||null};
}
function stripControls(source){
  let line=String(source||'').trim().replace(/^Effect\s+\d+\s*:\s*/i,'');
  for(let i=0;i<2;i++){const m=line.match(/^(?:Affects [^.]+|(?:Only )?Activates [^.]+)\.\s+(.+)$/i);if(!m)break;line=m[1];}
  const only=line.match(/^Only when at ([^:]+):\s*(.+)$/i);let condition=null;if(only){condition=`Only when at ${only[1]}`;line=only[2];}
  let parent=null;const named=line.match(/^([\w][\w '()!?.-]{0,90}):\s*(.+)$/);
  if(named&&!/^(?:Max Ammunition Capacity|Attack Speed|Charge Speed|Critical Rate|Critical Damage|ATK|DEF|Max HP|Hit Rate|Reload Speed|Incoming Healing)$/i.test(named[1])){parent=named[1];line=named[2];}
  return {line,parent,condition};
}
function duration(text){
  const fixed=String(text).match(/(?:for|lasts for)\s+(\d+(?:\.\d+)?)\s+(sec|rounds?|shots?)/i);
  if(fixed){const unit=/sec/i.test(fixed[2])?'seconds':/round/i.test(fixed[2])?'rounds':'shots';return {duration:`${fixed[1]} ${fixed[2]}`,duration_value:+fixed[1],duration_unit:unit,duration_type:unit==='seconds'?'fixed':'counted'};}
  if(/continuously|continuous/i.test(text))return {duration:'継続',duration_value:null,duration_unit:'continuous',duration_type:'continuous'};
  return {duration:'Instant',duration_value:null,duration_unit:null,duration_type:'instant'};
}
function made(props,text){return normalizeEffectAxes({duration:'Instant',duration_value:null,duration_unit:null,duration_type:'instant',stack_count:null,max_raw_value:null,direction:null,notes:'',value_basis:null,...duration(text),...props});}

export function parseResidualEffectLine(source,{parentEffectName=null,inheritedDuration=null}={}){
  const cleaned=stripControls(source),line=cleaned.line;
  let parsed=parseEffectLine(line,{parentEffectName:cleaned.parent||parentEffectName,inheritedDuration});
  if(parsed)return {...parsed,parent_effect_name:parsed.parent_effect_name||cleaned.parent||parentEffectName||null,condition_fragment:cleaned.condition||parsed.condition_fragment||null};
  let m;
  m=line.match(/^Max Ammunition Capacity\s*▼\s*(\d+(?:\.\d+)?)%\.?(?:\s*Stacks up to (\d+) times and lasts for (\d+(?:\.\d+)?) sec\.)?(?:\s*for (\d+(?:\.\d+)?) sec\.)?(?:\s*\(Similar effects cannot be stacked\.\))?$/i);
  if(m){const stack=m[2]?+m[2]:null;return made({effect_type:'penalty',buff_type:'max_ammo',modifier_type:'decrease',direction:'decrease',value:+m[1],value_unit:'percent',stack_count:stack,max_raw_value:stack?+m[1]*stack:+m[1]},line);}
  m=line.match(/^Converts damage to Elemental Advantage damage against (Fire|Water|Wind|Electric|Iron) Code enemies\. This effect is continuous and cannot be removed\.$/i);
  if(m)return made({effect_type:'buff',buff_type:'elemental_advantage_conversion',modifier_type:'convert',value:true,value_unit:'boolean',conversion_source:'damage',conversion_target:'elemental_advantage_damage',target_element:m[1].toLowerCase(),removable:false},line);
  m=line.match(/^Invulnerable for (\d+(?:\.\d+)?) sec\. Activates (\d+) time\(s\) per battle\.$/i);
  if(m)return made({effect_type:'buff',buff_type:'invulnerability',modifier_type:'grant',value:true,value_unit:'boolean',activation_limit:+m[2],activation_limit_unit:'per_battle'},line);
  m=line.match(/^(?:Revives?|Resurrects?) with (\d+(?:\.\d+)?)% HP\.$/i);
  if(m)return made({effect_type:'revive',buff_type:'revive',modifier_type:'restore',value:+m[1],value_unit:'percent',max_raw_value:+m[1]},line);
  m=line.match(/^Rebuilds cover with (\d+(?:\.\d+)?)% HP\.$/i);
  if(m)return made({effect_type:'heal',buff_type:'cover_hp_recovery',modifier_type:'restore',value:+m[1],value_unit:'percent',max_raw_value:+m[1],value_basis:'cover_hp'},line);
  m=line.match(/^(.+?): (\d+(?:\.\d+)?)% of DEF\. Stacks up to (\d+) times and lasts for (\d+(?:\.\d+)?) sec\.$/i);
  if(m)return made({effect_type:'special_mechanic',special_type:'named_stat_stack',state_name:m[1],modifier_type:'stack',value:+m[2],value_unit:'caster_def_percent',value_basis:'DEF',stack_count:+m[3],max_raw_value:+m[2]*+m[3]},line);
  m=line.match(/^(\d+(?:\.\d+)?)% of DEF\. Stacks up to (\d+) times and lasts for (\d+(?:\.\d+)?) sec\.$/i);
  if(m)return made({effect_type:'special_mechanic',special_type:'named_stat_stack',state_name:cleaned.parent||parentEffectName||null,modifier_type:'stack',value:+m[1],value_unit:'caster_def_percent',value_basis:'DEF',stack_count:+m[2],max_raw_value:+m[1]*+m[2]},line);
  m=line.match(/^Three times: Decreases the stack count of stackable debuffs by (\d+)\.$/i);
  if(m)return made({effect_type:'buff',buff_type:'stackable_debuff_stack_reduction',modifier_type:'remove',value:+m[1],value_unit:'count',activation_limit:3,activation_limit_unit:'per_activation'},line);
  m=line.match(/^Decreases the stack count of stackable debuffs by (\d+)\.$/i);
  if(m)return made({effect_type:'buff',buff_type:'stackable_debuff_stack_reduction',modifier_type:'remove',value:+m[1],value_unit:'count',activation_limit:/three times/i.test(source)?3:null,activation_limit_unit:/three times/i.test(source)?'per_activation':null},line);
  m=line.match(/^Attack Speed:\s*▼\s*(\d+(?:\.\d+)?)%$/i);
  if(m)return made({effect_type:'penalty',buff_type:'attack_speed',modifier_type:'decrease',direction:'decrease',value:+m[1],value_unit:'percent',max_raw_value:+m[1]},line);
  m=line.match(/^Maximum Accumulated Damage is (\d+(?:\.\d+)?)% of the skill user's final ATK\.$/i);
  if(m)return made({effect_type:'special_mechanic',special_type:'skill_parameter',parameter_name:'maximum_accumulated_damage',modifier_type:'set',value:+m[1],value_unit:'caster_atk_percent'},line);
  m=line.match(/^Accumulates (\d+(?:\.\d+)?)% of the skill user's ATK damage\.$/i);
  if(m)return made({effect_type:'special_mechanic',special_type:'damage_accumulation',parameter_name:'accumulation_ratio',modifier_type:'set',value:+m[1],value_unit:'caster_atk_percent'},line);
  if(/^Deals distributed damage to enemies/i.test(line))return made({effect_type:'damage',modifier_type:'deal',value:null,value_unit:null,damage_type:'distributed'},line);
  m=line.match(/^Charge Speed ▲ (\d+(?:\.\d+)?)%\. Removed upon reloading to max ammunition\.$/i);
  if(m)return made({effect_type:'buff',buff_type:'charge_speed',modifier_type:'increase',value:+m[1],value_unit:'percent',max_raw_value:+m[1],duration:'Until reload to max ammunition',duration_type:'conditional',duration_unit:'until_condition',end_condition:'reload to max ammunition'},line);
  if(/^Proportionally shares damage taken\. This effect is continuous\.$/i.test(line))return made({effect_type:'buff',buff_type:'damage_share',modifier_type:'grant',value:true,value_unit:'boolean'},line);
  m=line.match(/^The shield created by (.+?) becomes invulnerable for (\d+(?:\.\d+)?) sec\.$/i);
  if(m)return made({effect_type:'buff',buff_type:'shield_invulnerability',modifier_type:'grant',value:true,value_unit:'boolean',target_object:'shield',scaling_source_effect:m[1]},line);
  if(/^(?:Previous effects trigger repeatedly\.|[\w -]+(?:-Type)? Exospine\.)$/i.test(line))return made({effect_type:'special_mechanic',special_type:'metadata',modifier_type:'describe',value:null,value_unit:'boolean',metadata_only:true},line);
  m=line.match(/^Recurring interval of (.+?) ▼ (\d+(?:\.\d+)?) sec continuously\.$/i);
  if(m)return made({effect_type:'special_mechanic',special_type:'skill_parameter_modifier',parameter_name:'recurring_interval',scaling_source_effect:m[1],modifier_type:'decrease',value:+m[2],value_unit:'seconds',metadata_only:true},line);
  m=line.match(/^The ["']Damage Taken["'] multiplier of (.+?) is scaled by (\d+(?:\.\d+)?)%\.$/i);
  if(m)return made({effect_type:'special_mechanic',special_type:'damage_scaling',modifier_type:'set',value:+m[2],value_unit:'percent',scaling_type:'damage_multiplier',scaling_source_effect:m[1]},line);
  m=line.match(/^Extrasensory ▼ (\d+(?:\.\d+)?)%\.$/i);
  if(m)return made({effect_type:'resource',resource_type:'extrasensory',modifier_type:'decrease',value:+m[1],value_unit:'percent'},line);
  return null;
}

function auditFields(candidate){return {
  effect_type:candidate.current_effect_type,buff_type:candidate.current_buff_type,modifier_type:candidate.current_modifier_type,
  value:candidate.current_value,value_unit:candidate.current_value_unit,target:candidate.current_target,target_type:candidate.current_target_type,
  trigger:candidate.current_trigger,condition:candidate.current_condition,duration:candidate.current_duration,duration_value:candidate.current_duration_value,
  duration_unit:candidate.current_duration_unit,duration_type:candidate.current_duration_type,end_condition:candidate.current_end_condition,
  parent_effect_name:candidate.current_parent_effect_name,parent_effect_type:candidate.current_parent_effect_type,
  section_condition:candidate.current_section_condition,special_type:candidate.current_special_type,resource_type:candidate.current_resource_type,
  scaling_type:candidate.current_scaling_type,scaling_source_effect:candidate.current_scaling_source_effect,stack_count:candidate.current_stack_count
};}
function mergeKnown(base,overlay){const out={...base};for(const [k,v] of Object.entries(overlay||{}))if(v!==null&&v!==undefined&&v!=='')out[k]=v;return out;}
function specialFromAudit(candidate){
  const a=candidate.special_audit;if(!a)return {};
  const map={decoy_state:'decoy',penalty_metadata:'penalty_metadata',interval_parameter:'skill_parameter',healing_storage_state:'healing_storage',damage_mechanic:'damage_mechanic',weapon_specification:'weapon_change',damage_conversion:'damage_conversion',resource_operation:'resource_operation',skill_or_weapon_parameter:'skill_parameter',trigger_or_state_metadata:'metadata',storage_parameter:'storage_parameter',copy_or_scaling:'copy_or_scaling',beneficial_effect:'beneficial_effect'};
  return {special_type:map[a.semantic_special_type]||a.semantic_special_type,state_name:a.state_resource_or_parameter_name||null,metadata_only:Boolean(a.metadata_only)};
}
function exclusionType(candidate){
  const kind=candidate.exclusion_kind||candidate.special_audit?.semantic_special_type;
  if(kind==='damage'||kind==='damage_mechanic')return {effect_type:'damage'};
  if(kind==='debuff')return {effect_type:'debuff'};
  if(kind==='penalty'||kind==='penalty_metadata')return {effect_type:'penalty'};
  if(kind==='resource'||kind==='resource_operation')return {effect_type:'resource',resource_type:candidate.current_resource_type||candidate.special_audit?.state_resource_or_parameter_name||'named_resource'};
  if(kind==='weapon_state'||kind==='weapon_specification')return {effect_type:'weapon_state',special_type:'weapon_change'};
  if(['metadata','state_metadata'].includes(kind)||candidate.special_audit?.metadata_only)return {effect_type:'special_mechanic',special_type:'metadata',metadata_only:true};
  if(kind==='shield_generation')return {effect_type:'special_mechanic',special_type:'shield'};
  return {effect_type:'special_mechanic',...specialFromAudit(candidate)};
}
function effectComplete(effect){
  if(['damage','debuff','penalty','resource','weapon_state'].includes(effect.effect_type))return true;
  if(effect.effect_type==='special_mechanic')return Boolean(effect.special_type);
  if(!['buff','heal','revive'].includes(effect.effect_type))return false;
  return Boolean(effect.buff_type&&effect.modifier_type&&effect.value_unit&&effect.target_type&&effect.trigger&&effect.duration!==null&&effect.duration!==undefined&&effect.duration!=='')&&
    (effect.value_unit==='boolean'||effect.value!==null&&effect.value!==undefined);
}
function makeRecord(review,candidate,auditCandidate,auditRow,index,category){
  const controls=stripControls(candidate.source_line),inherited=durationFromAudit(auditRow,auditCandidate);
  let parsed=parseResidualEffectLine(candidate.source_line,{parentEffectName:auditCandidate.current_parent_effect_name,inheritedDuration:inherited});
  let effect=mergeKnown(auditFields(auditCandidate),parsed||{});
  effect=mergeKnown(effect,targetAxes(auditRow,auditCandidate));
  if(category==='C')effect=mergeKnown(effect,exclusionType(auditCandidate));
  if(category==='A'&&auditCandidate.special_audit?.disposition==='exclude')effect=mergeKnown(effect,exclusionType(auditCandidate));
  const scale=candidate.source_line.match(/(?:x|\*)\s*(?:the )?(?:Number of )?(.+?) stacks?/i);
  if(scale){effect.scaling_type='multiply_by_named_stack';effect.scaling_source_effect=scale[1].trim();effect.max_raw_value=null;}
  if(!effect.trigger){effect.trigger=explicitTrigger(auditRow.source_section)||((review.skill_slot==='Burst'&&category==='A')?'Burst Skill activation':null);}
  if(!effect.trigger&&effect.duration_type==='continuous')effect.trigger='Continuous (source: continuously)';
  if(!effect.trigger&&auditRow.trigger_analysis?.kind==='branch_condition_can_supply_trigger_context')effect.trigger=`Condition: ${effect.parent_effect_name||'named threshold'}`;
  if(inherited.duration&&['Instant','',null,undefined].includes(effect.duration))Object.assign(effect,inherited);
  if(!effect.duration)Object.assign(effect,duration(candidate.source_line));
  effect.condition=effect.condition||unique([auditRow.source_section.split('\n')[0],controls.condition]).join('\n');
  effect.parent_effect_name=effect.parent_effect_name||controls.parent||null;
  effect.max_raw_value=valueOr(effect.max_raw_value,typeof effect.value==='number'&&!effect.scaling_type?effect.value:null);
  effect.stack_count=valueOr(effect.stack_count,null);
  effect.notes=effect.notes||'';effect.source_line=candidate.source_line;effect.needs_review_reasons=[];
  const common={character_id:review.character_id,character_name:review.character_name,skill_name:review.skill_name,skill_slot:review.skill_slot,skill_level:10,
    source_url:review.source_url,source_type:review.source_type,source_checked_at:review.source_checked_at,source_conflict:Boolean(review.source_conflict),
    source_skill_id:review.source_skill_id,source_text:auditRow.source_section,source_skill_text:review.source_skill_text||auditRow.source_section,
    effect_id:`residual:${review.review_key}:c${index}`,validation_status:'rule_matched',parser_version:RESIDUAL_GRAMMAR_VERSION,needs_review:false};
  return {...common,...normalizeEffectAxes(effect),comparison_excluded:!['buff','heal','revive'].includes(effect.effect_type),metadata_only:Boolean(effect.metadata_only)};
}

export function compileResidualAudit(audit){
  const counts=Object.fromEntries(['A','B','C','D'].map(k=>[k,audit.categories?.[k]?.review_section_count]));
  if(counts.A!==64||counts.B!==0||counts.C!==60||counts.D!==17)throw Error(`Unexpected residual audit partition: ${JSON.stringify(counts)}`);
  const map=new Map();for(const category of ['A','C','D'])for(const row of audit.categories[category].items)map.set(row.review_key,{...row,category});
  return {map,counts,dKeys:new Set(audit.categories.D.items.map(x=>x.review_key))};
}

export function applyResidualAuditResolutions(output,audit){
  const policy=compileResidualAudit(audit),beforeEffects=output.effects.length,beforeComparison=output.effects.filter(e=>!e.needs_review).length;
  const effects=[...output.effects],nonBuff=[...output['non-buff-effects']],resolved={A:0,C:0},unresolved={A:[],C:[]},metadataOnly=[];
  const dBefore=new Map(output['review-items'].filter(r=>policy.dKeys.has(r.review_key)).map(r=>[r.review_key,JSON.stringify({source_text:r.source_text,needs_review:r.needs_review,reasons:r.needs_review_reasons,manual_override:r.manual_override})]));
  for(const review of output['review-items']){
    const row=policy.map.get(review.review_key);if(!row||row.category==='D'||review.manual_override)continue;
    const auditCandidates=row.candidates.filter(c=>c.needs_review_reasons.length),records=[];
    for(let i=0;i<auditCandidates.length;i++){
      const ac=auditCandidates[i],candidate=review.parser_candidates.find(c=>c.source_line===ac.source_line)||{source_line:ac.source_line,hierarchy:null};
      const record=makeRecord(review,candidate,ac,row,i,row.category);records.push(record);
    }
    const bad=records.filter(r=>!effectComplete(r));
    if(bad.length){unresolved[row.category].push({review_key:review.review_key,lines:bad.map(x=>x.source_line),missing:bad.map(x=>({effect_type:x.effect_type,buff_type:x.buff_type,target_type:x.target_type,trigger:x.trigger,duration:x.duration,value:x.value,value_unit:x.value_unit,special_type:x.special_type}))});continue;}
    for(const record of records){
      if(record.metadata_only){metadataOnly.push(record);continue;}
      if(['buff','heal','revive'].includes(record.effect_type))effects.push(record);else nonBuff.push(record);
    }
    review.needs_review=false;review.needs_review_reasons=[];review.needs_review_reason=null;review.review_priority=null;
    review.review_status=row.category==='A'?'auto_resolved':'auto_excluded';review.auto_exclusion_reason=row.category==='C'?'residual audit C: confirmed noncomparison':null;
    review.residual_resolution={audit_category:row.category,grammar_version:RESIDUAL_GRAMMAR_VERSION,records:records.map(r=>({effect_id:r.effect_id,effect_type:r.effect_type,buff_type:r.buff_type,special_type:r.special_type,metadata_only:r.metadata_only,comparison_excluded:r.comparison_excluded}))};
    for(const pc of review.parser_candidates){const rec=records.find(r=>r.source_line===pc.source_line);if(rec){pc.hierarchy={...(pc.hierarchy||{}),...rec,needs_review_reasons:[]};pc.unresolved_fields=[];pc.comparison_eligible=!rec.comparison_excluded;}}
    resolved[row.category]++;
  }
  const seen=new Set();output.effects=effects.filter(e=>{if(seen.has(e.effect_id))return false;seen.add(e.effect_id);return true;});output['non-buff-effects']=nonBuff;
  output['metadata-only-effects']=metadataOnly;
  output['review-queue']=output['review-items'].filter(r=>r.needs_review);
  for(const c of output.characters){c.effect_count=output.effects.filter(e=>e.character_id===c.character_id&&!e.needs_review).length;c.review_count=output['review-items'].filter(r=>r.character_id===c.character_id&&r.needs_review).length;c.effects_status=c.review_count?'partial':'rule_matched';c.review_fields=c.review_fields.filter(x=>x!=='effects');if(c.review_count)c.review_fields.push('effects');c.needs_review=c.review_fields.length>0;}
  const resolvedKeys=new Set([...policy.map].filter(([,v])=>['A','C'].includes(v.category)).map(([k])=>k));
  for(const h of output['skill-hierarchies'])for(const s of h.sections){const key=reviewKey(h.character_id,h.skill_slot,s.section_index);if(!resolvedKeys.has(key))continue;for(const g of s.groups)for(const c of g.children){const review=output['review-items'].find(r=>r.review_key===key),rec=review?.residual_resolution?.records.find(x=>x.effect_id.endsWith(`c${rowCandidateIndex(policy.map.get(key),c.source_line)}`));if(rec)c.effect.needs_review_reasons=[];}}
  output['unknown-buff-candidates']=aggregateUnknownCandidates(output['skill-hierarchies']).filter(group=>group.occurrences.some(o=>!resolvedKeys.has(reviewKey(o.character_id,o.skill_slot,o.source_section_index))));
  output['unrecognized-positive-effect-candidates']=aggregateUnrecognizedPositiveCandidates(output['skill-hierarchies']).filter(group=>group.occurrences.some(o=>!resolvedKeys.has(reviewKey(o.character_id,o.skill_slot,o.source_section_index))));
  const dAfter=new Map(output['review-items'].filter(r=>policy.dKeys.has(r.review_key)).map(r=>[r.review_key,JSON.stringify({source_text:r.source_text,needs_review:r.needs_review,reasons:r.needs_review_reasons,manual_override:r.manual_override})]));
  const dUnchanged=policy.dKeys.size===dAfter.size&&[...policy.dKeys].every(k=>dBefore.get(k)===dAfter.get(k));
  if(!dUnchanged)throw Error('D review invariant failed');
  output['collection-report'].parser_version=RESIDUAL_GRAMMAR_VERSION;output['collection-report'].pending_sections=output['review-queue'].length;
  output['collection-report'].comparable_effects=output.effects.filter(e=>!e.needs_review).length;output['collection-report'].total_effects=output.effects.length;
  output['collection-report'].unknown_candidate_types=output['unknown-buff-candidates'].length;
  output['collection-report'].unrecognized_positive_effect_candidate_types=output['unrecognized-positive-effect-candidates'].length;
  output['collection-report'].unrecognized_positive_effect_candidates=output['unrecognized-positive-effect-candidates'].reduce((n,x)=>n+x.occurrence_count,0);
  output['collection-report'].source_usage=Object.fromEntries(['nikke_gg','nikke_explorer','manual','official'].map(type=>[type,output.effects.filter(e=>e.source_type===type).length]));
  output['residual-resolution-report']={generated_at:new Date().toISOString(),grammar_version:RESIDUAL_GRAMMAR_VERSION,new_parser_rule_count:RESIDUAL_RULE_IDS.length,rule_ids:RESIDUAL_RULE_IDS,
    before:{needs_review:141,effects_total:beforeEffects,comparison_effects:beforeComparison},after:{needs_review:output['review-queue'].length,effects_total:output.effects.length,comparison_effects:output.effects.filter(e=>!e.needs_review).length,metadata_only:metadataOnly.length,unknown_buff_types:output['unknown-buff-candidates'].length,unrecognized_positive_types:output['unrecognized-positive-effect-candidates'].length,unrecognized_positive_occurrences:output['unrecognized-positive-effect-candidates'].reduce((n,x)=>n+x.occurrence_count,0)},
    resolved,unresolved,D_maintained:policy.dKeys.size,D_unchanged:dUnchanged};
  return output;
}
function rowCandidateIndex(row,line){return Math.max(0,row.candidates.filter(c=>c.needs_review_reasons.length).findIndex(c=>c.source_line===line));}

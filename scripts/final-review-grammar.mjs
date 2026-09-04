import {aggregateUnknownCandidates,aggregateUnrecognizedPositiveCandidates} from './skill-hierarchy.mjs';

export const FINAL_REVIEW_VERSION='4.2.2';
export const SOURCE_LIMITATIONS=['trigger_not_stated','target_not_stated','duration_not_stated','end_condition_not_fully_stated'];

const target=(target,target_type,extra={})=>({target,target_type,target_count:null,target_selection:null,target_condition:null,target_element:null,target_weapon:null,include_self:null,exclude_caster_from_selection:null,target_scope:null,...extra});
const fixed=(value,unit='seconds')=>({duration:`${value} ${unit==='seconds'?'sec':unit}`,duration_value:value,duration_unit:unit,duration_type:unit==='seconds'?'fixed':'counted',end_condition:null,end_condition_raw:null});
const noTrigger={trigger:null,source_limitations:['trigger_not_stated']};
const common=(buff_type,value,value_unit,modifier_type='increase')=>({effect_type:'buff',buff_type,value,value_unit,modifier_type,direction:modifier_type==='increase'?'increase':modifier_type==='decrease'?'decrease':null,
  stack_count:null,max_raw_value:typeof value==='number'?value:null,value_basis:null,condition:'',parent_effect_name:null,parent_effect_type:null,parent_effect_description:null,parent_trigger:null,parent_end_condition:null,parent_duration:null,
  function_text:null,effect_index:null,section_condition:null,scaling_type:null,scaling_source_effect:null,special_type:null,resource_type:null,reference_stat:null,reference_target_type:null,reference_target_selection:null,
  activation_chance:null,activation_chance_unit:null,shield_scope:null,scaling_source:null,source_limitations:[],notes:'',...fixed(0)});

// These are the user's final human judgements for the v4.2.1 D partition. The
// review key only selects the reviewed source section; every stored axis remains
// explicit, so no character-name inference is used at runtime.
export const FINAL_REVIEW_POLICIES={
  'nikke-12:Skill 2:section-0':[
    {...common('def',80,'percent'),...target('self and the 2 allies with the highest final ATK (other than the skill user).','selected_allies',{target_count:2,target_selection:'highest_final_atk',include_self:true,exclude_caster_from_selection:true}),...fixed(5),...noTrigger,source_line:'DEF ▲ 80% for 5 sec.'},
    {...common('damage_share',true,'boolean','grant'),...target('self and the 2 allies with the highest final ATK (other than the skill user).','selected_allies',{target_count:2,target_selection:'highest_final_atk',include_self:true,exclude_caster_from_selection:true}),...fixed(10),...noTrigger,source_line:'Equally shares damage taken for 10 sec.'}
  ],
  'nikke-121:Skill 2:section-0':[
    {...common('incoming_healing',23.46,'percent'),...target('all allies.','all_allies'),duration:null,duration_value:null,duration_unit:null,duration_type:'unknown',end_condition:null,end_condition_raw:null,
      trigger:'Activates when above 90% HP',condition:'above 90% HP',section_condition:'above 90% HP',source_limitations:['duration_not_stated'],source_line:'Incoming Healing ▲ 23.46%.'}
  ],
  'nikke-171:Skill 2:section-0':[
    {...common('atk',90.75,'percent'),...target('all allies.','all_allies'),...fixed(5),...noTrigger,source_line:'ATK ▲ 90.75% for 5 sec.'},
    {...common('damage_share',true,'boolean','grant'),...target('all allies.','all_allies'),...fixed(10),...noTrigger,source_line:'Equally shares damage taken for 10 sec.'}
  ],
  'nikke-283:Skill 2:section-0':[
    {...common('parts_damage',24.26,'percent'),...target('all allies.','all_allies'),...fixed(15),...noTrigger,source_line:'Damage to Parts ▲ 24.26% for 15 sec.'}
  ],
  'nikke-284:Skill 2:section-0':[
    {...common('attack_damage',15.64,'percent'),...target('self.','self'),...fixed(15),...noTrigger,parent_effect_name:'Dancing Flower',source_line:'Dancing Flower: Attack Damage ▲ 15.64% for 15 sec.'}
  ],
  'nikke-30:Skill 2:section-0':[
    {...common('def',23.51,'percent'),...target('self and 2 ally unit(s) with the lowest remaining HP (except the skill user).','selected_allies',{target_count:2,target_selection:'lowest_remaining_hp',include_self:true,exclude_caster_from_selection:true}),...fixed(10),...noTrigger,source_line:'DEF ▲ 23.51% for 10 sec.'},
    {...common('damage_share',true,'boolean','grant'),...target('self and 2 ally unit(s) with the lowest remaining HP (except the skill user).','selected_allies',{target_count:2,target_selection:'lowest_remaining_hp',include_self:true,exclude_caster_from_selection:true}),...fixed(10),...noTrigger,source_line:'Equally shares damage taken for 10 sec.'}
  ],
  'nikke-306:Skill 2:section-0':[
    {...common('cover_def',128.57,'percent'),...target('3 ally unit(s) with the highest final ATK.','selected_allies',{target_count:3,target_selection:'highest_final_atk'}),...fixed(5),...noTrigger,source_line:"Cover's DEF ▲ 128.57% for 5 sec."}
  ],
  'nikke-352:Skill 2:section-0':[
    {...common('interruption_parts_damage',3.08,'percent'),...target('all allies.','all_allies'),duration:'Permanent',duration_value:null,duration_unit:'permanent',duration_type:'continuous',end_condition:null,end_condition_raw:null,...noTrigger,source_line:'Damage to Interruption Parts ▲3.08% permanently.'}
  ],
  'nikke-400:Skill 1:section-0':[
    {...common('reference_atk_based_atk',8.81,'reference_atk_percent','duplicate'),...target('self.','self'),...fixed(10),trigger:'after performing 6 normal attacks',parent_trigger:'after performing 6 normal attacks',parent_effect_name:'Mind If I Borrow This?',
      reference_stat:'atk',reference_target_type:'ally',reference_target_selection:'highest_atk',value_basis:'ATK of the ally with the highest ATK',stack_count:5,max_raw_value:44.05,source_line:'Mind If I Borrow This?: Duplicates 8.81% of the ATK of the ally with the highest ATK. Stacks up to 5 times and lasts for 10 sec.'}
  ],
  'nikke-401:Skill 1:section-0':[
    {...common('reference_max_hp_based_max_hp',15.03,'reference_max_hp_percent','duplicate'),...target('self.','self'),...fixed(5),trigger:'when firing the last bullet',parent_trigger:'when firing the last bullet',reference_stat:'max_hp',reference_target_type:'ally',reference_target_selection:'highest_max_hp',value_basis:'max HP of ally with the highest max HP',source_line:'Duplicates 15.03% of the max HP of ally with the highest max HP. Lasts for 5 sec.'}
  ],
  'nikke-402:Skill 1:section-0':[
    {...common('reference_max_hp_based_max_hp',12.42,'reference_max_hp_percent','duplicate'),...target('self.','self'),...fixed(10),trigger:'after performing 60 normal attacks',parent_trigger:'after performing 60 normal attacks',reference_stat:'max_hp',reference_target_type:'nikke',reference_target_selection:'highest_max_hp',value_basis:'max HP of the Nikke with the highest max HP',source_line:'Duplicates 12.42% of the max HP of the Nikke with the highest max HP. Lasts for 10 sec.'}
  ],
  'nikke-412:Burst:section-3':[
    {...common('hit_rate',45.3,'percent'),...target('all Electric Code allies with assault rifles.','selected_allies',{target_element:'electric',target_weapon:'assault_rifle',target_scope:'all_matching_allies'}),...fixed(10),...noTrigger,source_line:'Hit Rate ▲ 45.3% for 10 sec.'},
    {...common('max_ammo',20,'rounds'),...target('all Electric Code allies with assault rifles.','selected_allies',{target_element:'electric',target_weapon:'assault_rifle',target_scope:'all_matching_allies'}),...fixed(10),...noTrigger,source_line:'Max Ammunition Capacity ▲ 20 round(s) for 10 sec.'}
  ],
  'nikke-514:Skill 1:section-0':[
    {...common('reload_ratio',50,'percent','decrease'),...target('self.','self'),duration:'Until under certain conditions',duration_value:null,duration_unit:'until_condition',duration_type:'conditional',end_condition:null,end_condition_raw:'under certain conditions',
      trigger:'Activates when Prediction ends',parent_trigger:'Activates when Prediction ends',parent_effect_name:'Heat Emission',source_limitations:['end_condition_not_fully_stated'],source_line:'Heat Emission: Reload Ratio ▼ 50%. Removes Heat Emission under certain conditions.'}
  ],
  'nikke-80:Skill 2:section-0':[
    {...common('shared_shield',6.38,'caster_final_max_hp_percent','create'),...target('all allies protected by the shared shield.','all_allies'),...fixed(5),...noTrigger,value_basis:"skill user's final max HP",scaling_source:'caster_final_max_hp',shield_scope:'shared',source_line:"Creates a shared shield with HP equal to 6.38% of the skill user's final max HP that protects all allies from damage. Lasts for 5 sec."}
  ],
  'nikke-852:Skill 1:section-0':[
    {...common('caster_atk_based_atk',20,'caster_atk_percent'),...target('1 random ally unit.','selected_allies',{target_count:1,target_selection:'random'}),...fixed(5),...noTrigger,value_basis:"skill user's ATK",source_line:"ATK ▲ 20% of the skill user's ATK for 5 sec."}
  ],
  'nikke-861:Skill 2:section-1':[
    {...common('true_damage',140.49,'percent'),...target('all allies.','all_allies'),...fixed(10),...noTrigger,source_line:'True Damage ▲ 140.49% for 10 sec.'}
  ]
};

export const IDOLL_REVIEW_KEY='nikke-308:Skill 2:section-0';
const allKeys=new Set([...Object.keys(FINAL_REVIEW_POLICIES),IDOLL_REVIEW_KEY]);
const reviewKey=(characterId,slot,index)=>`${characterId}:${slot}:section-${index}`;

function explorerComparison(output,review){
  const comparison=output['source-comparisons']?.find(x=>x.character_id===review.character_id&&x.skill_slot===review.skill_slot);
  const explorer=comparison?.nikke_explorer||null;
  return {checked:Boolean(explorer?.source_text),same_text:Boolean(explorer?.source_text&&explorer.source_text.trim()===comparison?.nikke_gg?.source_text?.trim()),source_url:explorer?.source_url||null,source_checked_at:explorer?.source_checked_at||null};
}
function makeRecord(review,spec,index,secondary){
  return {
    effect_id:`final-review:${review.review_key}:c${index}`,character_id:review.character_id,character_name:review.character_name,skill_name:review.skill_name,skill_slot:review.skill_slot,skill_level:10,
    ...spec,source_url:review.source_url,source_type:review.source_type,source_checked_at:review.source_checked_at,source_conflict:Boolean(review.source_conflict),source_skill_id:review.source_skill_id,
    source_text:review.source_text,source_skill_text:review.source_skill_text||review.source_text,source_section_index:review.source_section_index,alternate_source_type:'nikke_explorer',alternate_source_url:secondary.source_url,
    alternate_source_checked_at:secondary.source_checked_at,secondary_source_checked:secondary.checked,secondary_source_same_text:secondary.same_text,secondary_source_supplemented:false,
    related_effects:[],needs_review:false,needs_review_reasons:[],validation_status:'rule_matched',parser_version:FINAL_REVIEW_VERSION,comparison_excluded:false,metadata_only:false
  };
}
function clearReview(review,records,secondary){
  review.needs_review=false;review.needs_review_reasons=[];review.needs_review_reason=null;review.review_priority=null;review.review_status='auto_extracted';
  review.source_limitations=[...new Set(records.flatMap(x=>x.source_limitations||[]))];
  review.secondary_source_checked=secondary.checked;review.secondary_source_same_text=secondary.same_text;review.secondary_source_supplemented=false;
  review.final_resolution={parser_version:FINAL_REVIEW_VERSION,effect_ids:records.map(x=>x.effect_id),source_limitations:review.source_limitations};
  for(const candidate of review.parser_candidates||[]){
    const record=records.find(r=>r.source_line===candidate.source_line);
    if(!record)continue;
    candidate.hierarchy={...(candidate.hierarchy||{}),...record};candidate.unresolved_fields=[];candidate.comparison_eligible=true;
  }
}
function updateIDoll(review,secondary){
  review.needs_review=true;review.needs_review_reasons=['ambiguous_target'];review.needs_review_reason='ambiguous_target';review.review_priority=4;review.review_status='pending';
  review.source_limitations=['target_not_stated'];review.secondary_source_checked=secondary.checked;review.secondary_source_same_text=secondary.same_text;review.secondary_source_supplemented=false;
  review.final_resolution={parser_version:FINAL_REVIEW_VERSION,unresolved_reason:'target scope is required for SELF/ALLY comparison',source_limitations:['target_not_stated']};
  for(const candidate of review.parser_candidates||[]){
    if(!/ATK\s*▲\s*9\.09%/i.test(candidate.source_line||''))continue;
    candidate.hierarchy={...(candidate.hierarchy||{}),effect_type:'buff',buff_type:'atk',modifier_type:'increase',value:9.09,value_unit:'percent',max_raw_value:9.09,
      target:null,target_type:null,trigger:'when_attacked',activation_chance:20,activation_chance_unit:'percent',duration:'5 sec',duration_value:5,duration_unit:'seconds',duration_type:'fixed',
      source_limitations:['target_not_stated'],needs_review_reasons:['ambiguous_target']};
    candidate.unresolved_fields=['target','target_type'];candidate.comparison_eligible=false;
  }
}
function refreshCharacters(output){
  for(const c of output.characters){
    c.effect_count=output.effects.filter(e=>e.character_id===c.character_id&&!e.needs_review).length;
    c.review_count=output['review-items'].filter(r=>r.character_id===c.character_id&&r.needs_review).length;
    c.effect_review_status=c.review_count?'needs_review':'complete';c.effect_needs_review=Boolean(c.review_count);c.effects_status=c.review_count?'partial':'rule_matched';
    c.review_fields=(c.review_fields||[]).filter(x=>x!=='effects');if(c.review_count)c.review_fields.push('effects');c.needs_review=c.review_fields.length>0;
  }
}
function countBy(xs,key){return xs.reduce((out,x)=>(out[x[key]]=(out[x[key]]||0)+1,out),{});}

export function applyFinalHumanReview(output){
  const before={needs_review:output['review-items'].filter(r=>r.needs_review).length,effects_total:output.effects.length,comparison_effects:output.effects.filter(e=>!e.needs_review).length};
  const existing=new Set(output.effects.map(e=>e.effect_id)),added=[],resolvedKeys=new Set(),protectedOverrides=[],secondaryChecks=[];
  for(const review of output['review-items']){
    if(!allKeys.has(review.review_key))continue;
    const secondary=explorerComparison(output,review);secondaryChecks.push({review_key:review.review_key,...secondary,supplemented:false});
    if(review.manual_override){protectedOverrides.push(review.review_key);continue;}
    if(review.review_key===IDOLL_REVIEW_KEY){updateIDoll(review,secondary);continue;}
    const specs=FINAL_REVIEW_POLICIES[review.review_key];if(!specs)continue;
    const records=specs.map((spec,index)=>makeRecord(review,spec,index,secondary));
    for(const record of records)if(!existing.has(record.effect_id)){existing.add(record.effect_id);output.effects.push(record);added.push(record);}
    clearReview(review,records,secondary);resolvedKeys.add(review.review_key);
  }
  if(resolvedKeys.size!==Object.keys(FINAL_REVIEW_POLICIES).length-protectedOverrides.length)throw Error(`Final review resolution incomplete: ${resolvedKeys.size}/16`);
  output['review-queue']=output['review-items'].filter(r=>r.needs_review);refreshCharacters(output);
  output['unknown-buff-candidates']=aggregateUnknownCandidates(output['skill-hierarchies']).filter(group=>group.occurrences.some(o=>!resolvedKeys.has(reviewKey(o.character_id,o.skill_slot,o.source_section_index))));
  output['unrecognized-positive-effect-candidates']=aggregateUnrecognizedPositiveCandidates(output['skill-hierarchies']).filter(group=>group.occurrences.some(o=>!resolvedKeys.has(reviewKey(o.character_id,o.skill_slot,o.source_section_index))));
  const limitationEffects=added.flatMap(e=>(e.source_limitations||[]).map(limitation=>({limitation,effect_id:e.effect_id,review_key:e.effect_id.split(':c')[0].replace('final-review:','')})));
  const unresolvedLimitations=output['review-queue'].flatMap(r=>(r.source_limitations||[]).map(limitation=>({limitation,review_key:r.review_key})));
  const limitationSections=new Set([...added.filter(e=>e.source_limitations?.length).map(e=>e.effect_id.split(':c')[0]),...output['review-queue'].filter(r=>r.source_limitations?.length).map(r=>r.review_key)]);
  const resolvedLimitedKeys=new Set(added.filter(e=>e.source_limitations?.length).map(e=>e.effect_id.split(':c')[0].replace('final-review:',''))),unresolvedKeys=output['review-queue'].filter(r=>allKeys.has(r.review_key)).map(r=>r.review_key);
  const report={generated_at:new Date().toISOString(),parser_version:FINAL_REVIEW_VERSION,
    reviewed_sections:17,resolved_sections:resolvedKeys.size,resolved_without_source_limitation:resolvedKeys.size-resolvedLimitedKeys.size,resolved_with_source_limitation:resolvedLimitedKeys.size,
    source_limitation_sections:limitationSections.size,unresolved_sections:unresolvedKeys.length,resolved_keys:[...resolvedKeys],resolved_source_limitation_keys:[...resolvedLimitedKeys],unresolved_keys:unresolvedKeys,
    protected_manual_overrides:protectedOverrides,secondary_source:{checked_sections:secondaryChecks.filter(x=>x.checked).length,supplemented_sections:0,checks:secondaryChecks},
    source_limitations:{effect_occurrences:limitationEffects.length,unresolved_review_occurrences:unresolvedLimitations.length,total_occurrences:limitationEffects.length+unresolvedLimitations.length,
      by_reason:countBy([...limitationEffects,...unresolvedLimitations],'limitation')},
    new_buff_types:['reference_atk_based_atk','reference_max_hp_based_max_hp','shared_shield'],reference_stat_effects:added.filter(e=>e.reference_stat).length,
    before,after:{needs_review:output['review-queue'].length,effects_total:output.effects.length,comparison_effects:output.effects.filter(e=>!e.needs_review).length,
      unknown_buff_types:output['unknown-buff-candidates'].length,unrecognized_positive_types:output['unrecognized-positive-effect-candidates'].length,
      unrecognized_positive_occurrences:output['unrecognized-positive-effect-candidates'].reduce((n,x)=>n+x.occurrence_count,0)},added_effects:added.map(e=>({effect_id:e.effect_id,character_name:e.character_name,buff_type:e.buff_type,value:e.value,value_unit:e.value_unit,source_limitations:e.source_limitations}))};
  output['final-review-resolution-report']=report;
  Object.assign(output['collection-report'],{parser_version:FINAL_REVIEW_VERSION,pending_sections:report.after.needs_review,total_effects:report.after.effects_total,comparable_effects:report.after.comparison_effects,
    auto_extracted_sections:output['review-items'].filter(r=>r.review_status==='auto_extracted').length,
    unknown_candidate_types:report.after.unknown_buff_types,unrecognized_positive_effect_candidate_types:report.after.unrecognized_positive_types,unrecognized_positive_effect_candidates:report.after.unrecognized_positive_occurrences});
  output['collection-report'].source_usage=Object.fromEntries(['nikke_gg','nikke_explorer','manual','official'].map(type=>[type,output.effects.filter(e=>e.source_type===type).length]));
  return output;
}

import {reviewedRuleForLine} from './reclassification-rules.mjs';

export const cleanText = text => String(text || '').replace(/<[^>]*>/g,'').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/\r/g,'').trim();

const STAT = {
  'ATK':'atk','DEF':'def','Max HP':'max_hp','Attack Damage':'attack_damage',
  'Damage dealt when attacking core':'core_damage','Core Damage':'core_damage',
  'Damage as strong element':'element_damage','Damage to strong element':'element_damage','Elemental Damage':'element_damage',
  'Critical Rate':'critical_rate','Critical Damage':'critical_damage','Charge Speed':'charge_speed','Charging Speed':'charge_speed',
  'Charge Damage':'charge_damage','Reload Speed':'reload_speed','Reloading Speed':'reload_speed','Attack Speed':'attack_speed',
  'Max Ammunition Capacity':'max_ammo','Hit Rate':'hit_rate','Damage Taken':'damage_taken','Damage taken':'damage_taken',
  'Pierce Damage':'pierce_damage','Incoming Healing':'incoming_healing','HP Potency':'hp_recovery',
  'Potency of HP restored':'hp_recovery','Number of pellets':'pellet_count','Pellet count':'pellet_count'
};

const durationShape=(text, fallback=null)=>{
  const fixed=String(text||'').match(/(?:for|lasts for)\s+(\d+(?:\.\d+)?)\s+(sec|rounds?|shots?)\b/i);
  if(fixed){
    const unit=/^sec/i.test(fixed[2])?'seconds':/^round/i.test(fixed[2])?'rounds':'shots';
    return {duration:`${fixed[1]} ${fixed[2]}`,duration_value:+fixed[1],duration_unit:unit,duration_type:unit==='seconds'?'fixed':'counted'};
  }
  if(/during Full Burst|while Full Burst is active/i.test(text||''))return {duration:'During Full Burst',duration_value:null,duration_unit:'full_burst',duration_type:'conditional'};
  if(/continuously|constantly|This effect is continuous/i.test(text||''))return {duration:'継続',duration_value:null,duration_unit:'continuous',duration_type:'continuous'};
  if(/permanently/i.test(text||''))return {duration:'Permanent',duration_value:null,duration_unit:'permanent',duration_type:'continuous'};
  if(/lasts until Full Burst ends/i.test(text||''))return {duration:'Until Full Burst ends',duration_value:null,duration_unit:'until_full_burst_end',duration_type:'conditional'};
  if(fallback?.duration)return normalizeDurationFields(fallback);
  return {duration:'Instant',duration_value:null,duration_unit:null,duration_type:'instant'};
};

export function normalizeDurationFields(effect={}){
  if(effect.duration_unit!==undefined&&effect.duration_value!==undefined)return effect;
  const d=String(effect.duration||'');
  const fixed=d.match(/^(\d+(?:\.\d+)?)\s+(sec|rounds?|shots?)\b/i);
  let duration_value=null,duration_unit=null,duration_type=effect.duration_type||'unknown';
  if(fixed){duration_value=+fixed[1];duration_unit=/^sec/i.test(fixed[2])?'seconds':/^round/i.test(fixed[2])?'rounds':'shots';duration_type=duration_unit==='seconds'?'fixed':'counted';}
  else if(d==='継続'){duration_unit='continuous';duration_type='continuous';}
  else if(/^Permanent$/i.test(d)){duration_unit='permanent';duration_type='continuous';}
  else if(/^Until Full Burst ends$/i.test(d)){duration_unit='until_full_burst_end';duration_type='conditional';}
  else if(/Full Burst/i.test(d)){duration_unit='full_burst';duration_type='conditional';}
  else if(/^Until /i.test(d)||effect.end_condition){duration_unit='until_condition';duration_type='conditional';}
  else if(d==='Instant'){duration_type='instant';}
  return {...effect,duration_value,duration_unit,duration_type};
}

export function normalizeEffectAxes(effect={}){
  const direction=effect.direction||null;
  let modifier_type=effect.modifier_type||({increase:'increase',decrease:'decrease'}[direction]);
  if(!modifier_type){
    if(effect.effect_type==='heal'||effect.effect_type==='revive')modifier_type='restore';
    else if(effect.value_unit==='boolean')modifier_type='grant';
    else modifier_type='increase';
  }
  return normalizeDurationFields({...effect,effect_type:effect.effect_type||'buff',modifier_type,
    scaling_type:effect.scaling_type??null,scaling_source_effect:effect.scaling_source_effect??null});
}

const made=(props,text='',fallback=null)=>normalizeEffectAxes({duration:'Instant',stack_count:null,max_raw_value:null,direction:null,
  notes:'',value_basis:null,...durationShape(text,fallback),...props});

export function targetType(target) {
  if (/^self\.?$/i.test(target)) return 'self';
  if (/^all allies\.?$/i.test(target)) return 'all_allies';
  if (/^target\(s\) hit\.?$/i.test(target)) return 'hit_targets';
  if (/^(?:the )?\d+ (?:random )?ally unit\(s\)(?: with .+)?\.?$/i.test(target)) return 'selected_allies';
  if (/^(?:the )?\d+ (?:leftmost|rightmost) .+ ally unit\(s\) .*/i.test(target)) return 'selected_allies';
  if (/^the member who initiated .+/i.test(target)) return 'selected_allies';
  if (/^(?:the )?\d+ (?:ally unit\(s\)|allies) with the (?:highest|lowest) .+\.$/i.test(target)) return 'selected_allies';
  if (/^(?:the )?\d+ incapacitated .+ ally unit\(s\) at random\.$/i.test(target)) return 'selected_allies';
  if (/^self and (?:the )?\d+ (?:ally unit\(s\)|allies) .+\.$/i.test(target)) return 'selected_allies';
  if (/^all allies with (?:sniper rifles|shotguns|assault rifles|submachine guns|machine guns|rocket launchers)\.$/i.test(target)) return 'weapon';
  if (/^all allies (?:with|of) (?:Fire|Water|Wind|Electric|Iron) (?:Code|element)\.$/i.test(target)) return 'element';
  if (/^all allies (?:who|with|except|excluding) .+\.$/i.test(target)) return 'selected_allies';
  if (/^all allies \((?:except|excluding) .+\)\.$/i.test(target)) return 'selected_allies';
  if (/^all .+ allies who .+\.$/i.test(target)) return 'selected_allies';
  if (/^all allies (?:using|equipped with) .+\.$/i.test(target)) return 'weapon';
  if (/^(?:all )?(?:Fire|Water|Wind|Electric|Iron) (?:Code )?allies\.$/i.test(target)) return 'element';
  if (/^all (?:Attacker|Defender|Supporter)(?:s| allies)?\.$/i.test(target)) return 'class';
  if (/^(?:the king|her favorite pop star)\.?$/i.test(target)) return 'other';
  return null;
}

function reviewedDuration(text,rule){
  const shaped=durationShape(text);if(shaped.duration!=='Instant')return shaped.duration;
  if(['full_burst_duration','skill_cooldown'].includes(rule.buff_type))return 'Instant';
  return null;
}
function reviewedBoolean(line,rule){
  const duration=reviewedDuration(line,rule);if(!duration)return null;
  const stack=+(line.match(/(?:stacks? up to|stacking up to) (\d+)/i)?.[1]||0)||null;
  return made({buff_type:rule.buff_type,value:true,value_unit:'boolean',duration,stack_count:stack,effect_type:'buff',modifier_type:'grant',
    immune_effect:rule.buff_type==='debuff_immunity'?(rule.immune_effect||'any_debuff'):null,
    immunity_count:rule.buff_type==='debuff_immunity'?(rule.immunity_count??+(line.match(/immunity to (\d+) debuff/i)?.[1]||1)):null},line);
}
export function parseReviewedEffectLine(line,{parentEffectName=null,rule=null}={}){
  line=line.trim().replace(/\s+/g,' ');rule=rule||reviewedRuleForLine(line,parentEffectName);
  if(!rule||!['new_buff_type','existing_buff_type'].includes(rule.classification))return null;
  if(['unlimited_ammo','damage_share','healing_share','indomitability','debuff_immunity'].includes(rule.buff_type)){
    const parsed=reviewedBoolean(line,rule);return parsed&&{...parsed,raw_label:rule.label,reviewed_classification:rule.classification};
  }
  const arrow=line.match(/^(.+?)\s+([▲▼])\s*(\d+(?:\.\d+)?)(%|\s+sec|\s+rounds?)?(.*)$/i);
  if(!arrow)return null;
  let unit=arrow[4]?.trim()==='sec'?'seconds':/^round/i.test(arrow[4]?.trim()||'')?'flat_value':arrow[4]==='%'?'percent':'flat_value';
  let type=rule.buff_type,basis=null,tail=arrow[5]||'';
  if(type==='caster_atk_based_atk'){unit='caster_atk_percent';basis='ATK';}
  if(type==='caster_def_based_def'){unit='caster_def_percent';basis='DEF';}
  if(type==='cover_max_hp'&&/skill user's (?:final )?max HP/i.test(tail)){unit='caster_max_hp_percent';basis='max_hp';}
  if(type==='charge_speed_overcap_conversion')unit='conversion';
  const duration=reviewedDuration(tail,rule),stack=+(tail.match(/(?:stacks? up to|stacking up to|up to) (\d+) (?:times|time\(s\))/i)?.[1]||0)||null;
  const value=+arrow[3],conditionFragments=[];
  if(/\bx (?:the )?number|charge amount|excess speed/i.test(tail))conditionFragments.push(tail.trim().replace(/^of /,''));
  const parsed=made({buff_type:type,value,value_unit:unit,duration:duration||'',stack_count:stack,
    max_raw_value:stack?Number((value*stack).toFixed(8)):type==='charge_speed_overcap_conversion'?null:value,
    direction:arrow[2]==='▼'?'decrease':'increase',modifier_type:arrow[2]==='▼'?'decrease':'increase',value_basis:basis,raw_label:rule.label,
    reviewed_classification:rule.classification,reviewed_unknown_label:rule.label,condition_fragment:conditionFragments.join(' '),
    target_skill_slot:rule.target_skill_slot??null,element:rule.element??null,conversion_source:rule.conversion_source??null,conversion_target:rule.conversion_target??null},tail);
  if(!duration)parsed._needs_review_reasons=['ambiguous_duration'];
  return parsed;
}

export function parseEffectLine(source, {inheritedDuration=null,reviewedRule=null,parentEffectName=null} = {}) {
  let line=String(source||'').trim().replace(/\s+/g,' ').replace(/([A-Za-z)])▲/g,'$1 ▲');
  const reviewed=parseReviewedEffectLine(line,{rule:reviewedRule,parentEffectName});
  if(reviewed){if(!reviewed.duration&&inheritedDuration?.duration){Object.assign(reviewed,normalizeDurationFields(inheritedDuration));reviewed._needs_review_reasons=[];}return normalizeEffectAxes(reviewed);}

  let m;
  m=line.match(/^Revives with (\d+(?:\.\d+)?)% HP\. Activates once per battle\.$/i);
  if(m)return made({effect_type:'revive',buff_type:'revive',modifier_type:'restore',value:+m[1],value_unit:'percent',revive_hp_percent:+m[1],activation_limit:1,activation_limit_unit:'per_battle'},line);
  m=line.match(/^(?:Restores HP equal to|Restores|Recovers) (\d+(?:\.\d+)?)% of (?:the skill user's|(?:the )?caster's) (?:final )?max HP(?: as HP)?(?: every second(?: continuously)?)?(?: for (\d+(?:\.\d+)?) sec)?\.(?: This effect is continuous\.)?(?: This effect cannot be removed\.)?(?: Activates (\d+) time\(s\) per battle\.)?$/i);
  if(m){const periodic=/every second|effect is continuous/i.test(line);return made({effect_type:'heal',buff_type:'caster_max_hp_based_heal',modifier_type:'restore',value:+m[1],value_unit:'caster_max_hp_percent',max_raw_value:+m[1],value_basis:'caster_max_hp',scaling_source:'caster_final_max_hp',heal_type:periodic?'periodic':'instant',tick_interval:periodic?1:null,tick_interval_unit:periodic?'seconds':null,activation_limit:m[3]?+m[3]:null,activation_limit_unit:m[3]?'per_battle':null,removable:!/cannot be removed/i.test(line)},line,inheritedDuration);}
  m=line.match(/^(?:Restores HP equal to|Recovers) (\d+(?:\.\d+)?)% of attack damage(?: as HP)?(?:\. Lasts for| for) (\d+(?:\.\d+)?) sec\.$/i);
  if(m)return made({effect_type:'heal',buff_type:'attack_damage_based_heal',modifier_type:'restore',value:+m[1],value_unit:'percent_of_attack_damage',max_raw_value:+m[1],value_basis:'attack_damage',heal_type:'continuous'},line);
  m=line.match(/^(?:Restores HP equal to|Recovers) (\d+(?:\.\d+)?)% of attack damage(?: as HP)?\. This effect is continuous\.$/i);
  if(m)return made({effect_type:'heal',buff_type:'attack_damage_based_heal',modifier_type:'restore',value:+m[1],value_unit:'percent_of_attack_damage',max_raw_value:+m[1],value_basis:'attack_damage',heal_type:'continuous'},line);
  m=line.match(/^Restores HP equal to (\d+(?:\.\d+)?)% of attack damage\.$/i);
  if(m)return made({effect_type:'heal',buff_type:'attack_damage_based_heal',modifier_type:'restore',value:+m[1],value_unit:'percent_of_attack_damage',max_raw_value:+m[1],value_basis:'attack_damage',heal_type:'instant'},line,inheritedDuration);
  m=line.match(/^(Continuously )?Restores (cover|decoy|shield) HP equal to (\d+(?:\.\d+)?)% (?:of )?the skill user's final max HP(?: every second)?(?: for (\d+(?:\.\d+)?) sec)?\.(?: This effect is continuous\.)?$/i);
  if(m){const periodic=Boolean(m[1])||/every second|continuous/i.test(line),map={cover:'cover_hp_recovery',decoy:'decoy_hp_recovery',shield:'shield_hp_recovery'};return made({effect_type:'heal',buff_type:map[m[2].toLowerCase()],modifier_type:'restore',value:+m[3],value_unit:'caster_max_hp_percent',max_raw_value:+m[3],scaling_source:'caster_final_max_hp',heal_type:periodic?'periodic':'instant',tick_interval:periodic?1:null,tick_interval_unit:periodic?'seconds':null},line,inheritedDuration);}
  m=line.match(/^Removes (\d+) debuff\(s\)\.$/i);
  if(m)return made({effect_type:'buff',buff_type:'debuff_cleanse',modifier_type:'remove',value:+m[1],value_unit:'count'},line);
  m=line.match(/^Removes (.+?)\.$/i);
  if(m)return made({effect_type:'special_mechanic',buff_type:null,modifier_type:'remove',value:null,value_unit:'boolean',special_type:'state_remove',state_name:m[1]},line);
  m=line.match(/^Cancels Assigned Part: (Singing|Dancing)\.$/i);
  if(m)return made({effect_type:'special_mechanic',buff_type:null,special_type:'state_transition',state_system:'assigned_part',modifier_type:'remove',value:null,value_unit:'boolean',state_name:m[1]},line);
  m=line.match(/^Cancels (.+?)(?: after the effect is triggered)?\.$/i);
  if(m)return made({effect_type:'special_mechanic',buff_type:null,special_type:'state_remove',modifier_type:'remove',value:null,value_unit:'boolean',state_name:m[1],end_trigger:/after the effect is triggered/i.test(line)?'after_effect_triggered':null,end_condition:/after the effect is triggered/i.test(line)?'after_effect_triggered':null},line);
  m=line.match(/^Re-enters Burst(?: and changes to)? Stage (\d)\.(?: This effect is continuous and cannot be removed\.)?$/i);
  if(m)return made({effect_type:'buff',buff_type:'burst_stage_reentry',modifier_type:'reentry',value:true,value_unit:'boolean',target_burst_stage:+m[1],removable:!/cannot be removed/i.test(line)},line);
  m=line.match(/^(?:Combat Assist: )?Changes to Burst Stage (\d)\.(?: This effect is continuous and cannot be removed\.)?$/i);
  if(m)return made({effect_type:'buff',buff_type:'burst_stage_change',modifier_type:'set',value:true,value_unit:'boolean',target_burst_stage:+m[1],removable:!/cannot be removed/i.test(line),parent_effect_name:/^Combat Assist:/i.test(line)?'Combat Assist':null},line);
  m=line.match(/^(?:Everyone's Star: )?Re-enters Burst and changes to Stage (\d)\.(?: This effect is continuous and cannot be removed\.)?$/i);
  if(m)return made({effect_type:'buff',buff_type:'burst_stage_reentry',modifier_type:'reentry',value:true,value_unit:'boolean',target_burst_stage:+m[1],removable:!/cannot be removed/i.test(line),parent_effect_name:/^Everyone's Star:/i.test(line)?"Everyone's Star":null},line);
  m=line.match(/^(?:(.+?): )?Prevents being targeted by single-target attacks for (\d+(?:\.\d+)?) sec(?: x (.+?) count)?\. This effect is removed upon taking a direct hit\.$/i);
  if(m)return made({effect_type:'buff',buff_type:'single_target_untargetable',modifier_type:'grant',value:true,value_unit:'boolean',parent_effect_name:m[1]||parentEffectName||null,duration_value:+m[2],duration_unit:'seconds',duration_type:'fixed',duration:`${m[2]} sec`,scaling_type:m[3]?'multiply_by_named_stack':null,scaling_source_effect:m[3]||null,max_duration_value:m[3]&&/Delusion Shattered/i.test(m[3])?2:null,end_condition:'taking_direct_hit'},line);
  m=line.match(/^Reloads? (\d+(?:\.\d+)?)%?(?: (?:of the )?magazine(?:\(s\)|s)?)?\.(?: Activates (\d+) time\(s\) per battle\.)?$/i);
  if(m)return made({effect_type:'buff',buff_type:'reload_ratio',modifier_type:'restore',value:+m[1],value_unit:'percent',max_raw_value:+m[1],notes:/of the magazine/i.test(line)?'of the magazine(s)':'magazine(s)',activation_limit:m[2]?+m[2]:null,activation_limit_unit:m[2]?'per_battle':null},line);
  m=line.match(/^Reloads? (\d+(?:\.\d+)?) round(?:\(s\)|s)?(?: of ammunition)?\.$/i);
  if(m)return made({effect_type:'buff',buff_type:'ammo_reload',modifier_type:'restore',value:+m[1],value_unit:'rounds',max_raw_value:+m[1]},line);
  if(/^Forced Reload\.?$/i.test(line))return made({effect_type:'buff',buff_type:'forced_reload',modifier_type:'trigger',value:true,value_unit:'boolean'},line);
  m=line.match(/^Reload speed is fixed at a (\d+(?:\.\d+)?)% (reduction|increase) for (\d+(?:\.\d+)?) (reload\(s\)|rounds?|sec)\.$/i);
  if(m)return made({effect_type:'buff',buff_type:'reload_speed',modifier_type:'set_modifier',value:(m[2].toLowerCase()==='reduction'?-1:1)*+m[1],value_unit:'percent',max_raw_value:null,
    duration:`${m[3]} ${m[4]}`,duration_value:+m[3],duration_unit:/reload/i.test(m[4])?'reloads':/^round/i.test(m[4])?'rounds':'seconds',duration_type:/sec/i.test(m[4])?'fixed':'counted'},line);
  m=line.match(/^Reload time is fixed at (\d+(?:\.\d+)?) sec for (\d+(?:\.\d+)?) sec\. Removed upon firing the last bullet\.$/i);
  if(m)return made({effect_type:'buff',buff_type:'reload_time',modifier_type:'set',value:+m[1],value_unit:'seconds',max_raw_value:null,duration:`${m[2]} sec`,duration_value:+m[2],duration_unit:'seconds',duration_type:'fixed',end_condition:'firing_last_bullet'},line);
  m=line.match(/^Increases the stack count of stackable buffs by (\d+)\.$/i);
  if(m)return made({effect_type:'buff',buff_type:'stackable_buff_stack_increase',modifier_type:'add_stack',value:+m[1],value_unit:'count'},line);
  m=line.match(/^Expands Pierce range by (\d+(?:\.\d+)?)% for (\d+(?:\.\d+)?) (round\(s\)|sec)\.$/i);
  if(m)return made({effect_type:'buff',buff_type:'pierce_range',modifier_type:'increase',value:+m[1],value_unit:'percent',max_raw_value:+m[1]},line);
  m=line.match(/^(?:Gains?|Grants?) Pierce(?: for (\d+(?:\.\d+)?) (round\(s\)|sec))?\.?(?: This effect is continuous\.)?$/i);
  if(m)return made({effect_type:'buff',buff_type:'pierce',modifier_type:'grant',value:true,value_unit:'boolean'},line,inheritedDuration);
  m=line.match(/^Charge time(?: is|:) fixed at (\d+(?:\.\d+)?) sec(?: for (\d+(?:\.\d+)?) sec)?\.?$/i);
  if(m)return made({effect_type:'buff',buff_type:'charge_time',modifier_type:'set',value:+m[1],value_unit:'seconds',max_raw_value:null},line,inheritedDuration);
  m=line.match(/^Fixed at (\d+(?:\.\d+)?) sec\.$/i);
  if(m)return made({effect_type:'buff',buff_type:'charge_time',modifier_type:'set',value:+m[1],value_unit:'seconds',max_raw_value:null},line,inheritedDuration);
  m=line.match(/^Pellet count is fixed at (\d+) for (\d+(?:\.\d+)?) round\(s\)\.$/i);
  if(m)return made({effect_type:'buff',buff_type:'pellet_count',modifier_type:'set',value:+m[1],value_unit:'count',max_raw_value:+m[1]},line);
  m=line.match(/^Skill (\d)'s requirement for triggering attachable projectiles ▼ (\d+(?:\.\d+)?) for (\d+(?:\.\d+)?) sec\.$/i);
  if(m)return made({effect_type:'special_mechanic',buff_type:null,special_type:'skill_requirement_modifier',target_skill_slot:+m[1],requirement_name:'attachable_projectile_trigger',modifier_type:'reduce_requirement',value:+m[2],value_unit:'count'},line);
  m=line.match(/^Charges (battery|Extrasensory) (by|to) (\d+(?:\.\d+)?)%?(?: continuously)?, up to (\d+(?:\.\d+)?)%\.?(.*)$/i);
  if(m)return made({effect_type:'resource',buff_type:null,resource_type:m[1].toLowerCase(),modifier_type:m[2].toLowerCase()==='to'?'set':'increase',value:+m[3],value_unit:'percent',resource_cap:+m[4],removable:!/cannot be removed/i.test(m[5])},line);
  m=line.match(/^Charges (battery|Extrasensory) to (\d+(?:\.\d+)?)%\.$/i);
  if(m)return made({effect_type:'resource',buff_type:null,resource_type:m[1].toLowerCase(),modifier_type:'set',value:+m[2],value_unit:'percent',resource_cap:100},line);
  m=line.match(/^Normal attacks deal true damage(?: for (\d+(?:\.\d+)?) sec| continuously)\.$/i);
  if(m)return made({effect_type:'buff',buff_type:'normal_attack_true_damage',modifier_type:'grant',value:true,value_unit:'boolean'},line);
  m=line.match(/^Cooldown of Burst Skill ▼ (\d+(?:\.\d+)?) sec(?:, stacks up to (\d+) time\(s\) and lasts for (\d+(?:\.\d+)?) sec)?\.(?: Activates once per battle\.)?$/i);
  if(m){const value=+m[1],stack=m[2]?+m[2]:null;return made({effect_type:'buff',buff_type:'burst_cooldown_reduction',modifier_type:'decrease',direction:'decrease',value,value_unit:'seconds',stack_count:stack,max_raw_value:stack?value*stack:value,activation_limit:/once per battle/i.test(line)?1:null,activation_limit_unit:/once per battle/i.test(line)?'per_battle':null},line);}
  m=line.match(/^Full Burst Duration ▲ (\d+(?:\.\d+)?) sec\. Lasts until Full Burst ends\.$/i);
  if(m)return made({effect_type:'buff',buff_type:'full_burst_duration',modifier_type:'increase',value:+m[1],value_unit:'seconds',max_raw_value:+m[1],duration:'Until Full Burst ends',duration_value:null,duration_unit:'until_full_burst_end',duration_type:'conditional'},line);
  m=line.match(/^Gains immunity to (Increase|Decrease) Charge Speed effects\. This effect is continuous and cannot be removed\.$/i);
  if(m)return made({effect_type:'buff',buff_type:'debuff_immunity',modifier_type:'grant',value:true,value_unit:'boolean',immune_effect:`${m[1].toLowerCase()}_charge_speed`,removable:false,raw_text:line},line);
  if(/^Immune to stack count increase or decrease effects continuously\. This effect cannot be removed\.$/i.test(line))return made({effect_type:'buff',buff_type:'stack_count_modification_immunity',modifier_type:'grant',value:true,value_unit:'boolean',removable:false},line);
  m=line.match(/^(Blanching|Maillard|Dancing Flower|Sakura Petals|Performance) Duration ▲ (\d+(?:\.\d+)?) sec\.$/i);
  if(m)return made({effect_type:'special_mechanic',buff_type:null,special_type:'state_duration_modifier',state_name:m[1],modifier_type:'extend',value:+m[2],value_unit:'seconds'},line);
  const parameterRules=[
    [/^Accumulated damage ratio of the Cumulative Damage Skill ▲ (\d+(?:\.\d+)?)% for /i,'cumulative_damage_accumulation_ratio',null],
    [/^Aftertaste Effect ▲ (\d+(?:\.\d+)?)% for /i,'aftertaste_effect',null],
    [/^Attack range of Annihilation State's additional effect ▲ (\d+(?:\.\d+)?)% for /i,'additional_effect_attack_range','Annihilation State'],
    [/^Units affected by Annihilation State's additional effect ▲ (\d+(?:\.\d+)?) for /i,'additional_effect_target_count','Annihilation State'],
    [/^Max ammo loaded by Auto Fire Ready ▲ (\d+(?:\.\d+)?) continuously/i,'auto_fire_ready_max_ammo',null],
    [/^Max Lock-On targets ▲ (\d+(?:\.\d+)?) continuously/i,'max_lock_on_targets',null],
    [/^Maximum Accumulation of Ninjutsu IFAK ▲ ?(\d+(?:\.\d+)?)% for /i,'ninjutsu_ifak_maximum_accumulation',null]
  ];
  for(const [pattern,parameter_name,parent] of parameterRules){const hit=line.match(pattern);if(hit)return made({effect_type:'special_mechanic',buff_type:null,special_type:'skill_parameter_modifier',parameter_name,parent_effect_name:parent,modifier_type:'increase',value:+hit[1],value_unit:/%/.test(hit[0])?'percent':'count'},line);}
  m=line.match(/^Restores (\d+(?:\.\d+)?) MP, up to a maximum of (\d+(?:\.\d+)?)\. All MP is removed when using Burst Skill\.$/i);
  if(m)return made({effect_type:'resource',buff_type:null,resource_type:'mp',modifier_type:'restore',value:+m[1],value_unit:'count',resource_cap:+m[2],reset_condition:'using_burst_skill'},line);
  m=line.match(/^Max HP ▲ number of tickets \* (\d+(?:\.\d+)?)% of the skill user's max HP\.$/i);
  if(m)return made({effect_type:'buff',buff_type:'caster_max_hp_based_max_hp',modifier_type:'increase',value:+m[1],value_unit:'caster_max_hp_percent',max_raw_value:null,scaling_type:'multiply_by_named_resource',scaling_source_effect:'Ticket'},line);
  m=line.match(/^ATK ▲ \((\d+(?:\.\d+)?)% \* Number of (.+?) stacks\) of the skill user's ATK for (\d+(?:\.\d+)?) sec\.$/i);
  if(m)return made({effect_type:'buff',buff_type:'caster_atk_based_atk',modifier_type:'increase',value:+m[1],value_unit:'caster_atk_percent',max_raw_value:null,scaling_type:'multiply_by_named_stack',scaling_source_effect:m[2]},line);
  const gauge=line.match(/^Fills Burst Gauge by (\d+(?:\.\d+)?)%\.(?: Activates (once|\d+ time\(s\)) per battle\.)?$/i);
  if(gauge)return made({buff_type:'burst_gauge_fill',value:+gauge[1],value_unit:'percent',max_raw_value:+gauge[1],modifier_type:'fill',activation_limit:gauge[2]?+(gauge[2].match(/\d+/)?.[0]||1):null,activation_limit_unit:gauge[2]?'per_battle':null},line);
  const cover=line.match(/^Restores (\d+(?:\.\d+)?)% of cover HP\.$/i);
  if(cover)return made({effect_type:'heal',buff_type:'cover_hp_recovery',modifier_type:'restore',value:+cover[1],value_unit:'percent',max_raw_value:+cover[1],value_basis:'cover_hp'},line);
  const shield=line.match(/^Creates a shield with HP equal to (\d+(?:\.\d+)?)% of (?:the skill user's|(?:the )?caster's) (?:final )?max HP that lasts for (\d+(?:\.\d+)?) sec\.$/i);
  if(shield)return made({effect_type:'special_mechanic',buff_type:'shield',modifier_type:'grant',value:+shield[1],value_unit:'caster_max_hp_percent',max_raw_value:+shield[1],value_basis:'caster_max_hp',special_type:'shield'},line);
  const ability=line.match(/^(?:Gains? (Pierce)|(?:Becomes )?(Invulnerable)|(?:Attract: )?(Taunts? all enemies)) (?:for (\d+(?:\.\d+)?) (sec|shot|shots|round|rounds)|continuously)\.$/i);
  if(ability)return made({effect_type:ability[3]?'special_mechanic':'buff',buff_type:ability[1]?'pierce':ability[2]?'invulnerability':null,modifier_type:'grant',value:true,value_unit:'boolean',special_type:ability[3]?'taunt':null},line);

  m=line.match(/^(?:Ninjutsu IFAK: |Possession )Lasts for (\d+(?:\.\d+)?) sec\.$/i);
  if(m){const state=/^Ninjutsu IFAK:/i.test(line)?'Ninjutsu IFAK':'Possession';return made({effect_type:'special_mechanic',buff_type:null,special_type:'state_duration',state_name:state,modifier_type:'set',value:+m[1],value_unit:'seconds',duration_value:+m[1],duration_unit:'seconds',duration_type:'fixed',duration:`${m[1]} sec`},line);}
  m=line.match(/^Required hit count: (\d+) time\(s\) in total, cumulative across all allies\.$/i);
  if(m)return made({effect_type:'special_mechanic',buff_type:null,special_type:'skill_requirement',requirement_name:'ghost_capture_hit_count',modifier_type:'set',value:+m[1],value_unit:'hits',aggregation:'cumulative_across_all_allies'},line);
  m=line.match(/^Captures (\d+) ghost when the required hit count reaches (\d+)%\. A maximum of (\d+) ghost\(s\) can be captured\.$/i);
  if(m)return made({effect_type:'resource',buff_type:null,resource_type:'ghost',modifier_type:'increase',value:+m[1],value_unit:'count',resource_cap:+m[3],requirement_value:+m[2],requirement_unit:'percent'},line);
  m=line.match(/^Exposure activation disabled continuously\.$/i);
  if(m)return made({effect_type:'special_mechanic',buff_type:null,special_type:'state_activation_modifier',state_name:'Exposure',modifier_type:'disable',value:true,value_unit:'boolean',duration:'継続',duration_unit:'continuous',duration_type:'continuous'},line);
  m=line.match(/^Assigned Part: (Singing|Dancing)\. This effect is continuous and cannot be removed\.$/i);
  if(m)return made({effect_type:'special_mechanic',buff_type:null,special_type:'state_transition',state_system:'assigned_part',state_name:m[1],modifier_type:'grant',value:true,value_unit:'boolean',duration:'継続',duration_unit:'continuous',duration_type:'continuous',removable:false},line);
  m=line.match(/^Changes (.+?) to (.+?)\.$/i);
  if(m)return made({effect_type:'special_mechanic',buff_type:null,special_type:'state_transition',from_state:m[1],to_state:m[2],modifier_type:'replace',value:true,value_unit:'boolean'},line);
  m=line.match(/^If (not )?in the Assigned Part: Dancing status, Mint gains Assigned Part: (Singing|Dancing)\. This effect is continuous and cannot be removed\.$/i);
  if(m)return made({effect_type:'special_mechanic',buff_type:null,special_type:'state_transition',state_system:'assigned_part',from_state:m[1]?null:'dancing',to_state:m[2].toLowerCase(),state_name:m[2],modifier_type:'grant',value:true,value_unit:'boolean',condition:m[1]?'not_in_assigned_part_dancing':'in_assigned_part_dancing',duration:'継続',duration_unit:'continuous',duration_type:'continuous',removable:false},line);
  m=line.match(/^Triggers (Impact-Type|Eagle Eye-Type) Exospine Mk2\.$/i);
  if(m)return made({effect_type:'special_mechanic',buff_type:null,special_type:'state_activation',state_name:`${m[1]} Exospine Mk2`,parent_effect_name:'Exospine Mk2',modifier_type:'trigger',value:true,value_unit:'boolean'},line);
  m=line.match(/^Hero Level Up: Reaches a maximum of Level (\d+)\.$/i);
  if(m)return made({effect_type:'special_mechanic',buff_type:null,special_type:'state_level_cap',state_name:'Hero Level',modifier_type:'set',value:+m[1],value_unit:'level'},line);
  m=line.match(/^Attack Interval: (\d+(?:\.\d+)?) sec$/i);
  if(m)return made({effect_type:'special_mechanic',buff_type:null,special_type:'skill_parameter',parameter_name:'attack_interval',modifier_type:'set',value:+m[1],value_unit:'seconds'},line);
  m=line.match(/^Pellet Count: (\d+)$/i);
  if(m)return made({effect_type:'weapon_state',buff_type:null,parameter_name:'pellet_count',modifier_type:'set',value:+m[1],value_unit:'count'},line);
  m=line.match(/^Delusion Shattered: Activates up to (\d+) time\(s\)\. This effect is continuous\.$/i);
  if(m)return made({effect_type:'resource',buff_type:null,resource_type:'delusion_shattered',modifier_type:'set',value:null,value_unit:'count',resource_cap:+m[1],duration:'継続',duration_unit:'continuous',duration_type:'continuous'},line);
  if(/^Extends her line of sight and auto-aims at all enemies within range\./i.test(line))return made({effect_type:'special_mechanic',buff_type:null,special_type:'targeting_mode_change',modifier_type:'set',value:true,value_unit:'boolean',parent_effect_name:parentEffectName||'Destroy Mode',auto_aim:'all_enemies_in_range',stage_target_treated_as_single_enemy:true},line);
  m=line.match(/^Max Lock-On Targets: (\d+)$/i);
  if(m)return made({effect_type:'special_mechanic',buff_type:null,special_type:'skill_parameter',parameter_name:'max_lock_on_targets',modifier_type:'set',value:+m[1],value_unit:'count',parent_effect_name:parentEffectName||'Lock-On'},line);
  m=line.match(/^Max ammo loaded by Auto Fire Ready: (\d+)$/i);
  if(m)return made({effect_type:'special_mechanic',buff_type:null,special_type:'skill_parameter',parameter_name:'max_auto_fire_ready_ammo',modifier_type:'set',value:+m[1],value_unit:'rounds',parent_effect_name:parentEffectName||'Auto Fire Ready'},line);
  m=line.match(/^Number of uses: (\d+)$/i);
  if(m)return made({effect_type:'special_mechanic',buff_type:null,special_type:'usage_limit',modifier_type:'set',value:+m[1],value_unit:'uses',parent_effect_name:parentEffectName||'Seven Dwarves Fully Active'},line);
  m=line.match(/^Issues (\d+) ticket, up to a maximum of (\d+)\. This effect is continuous\.$/i);
  if(m)return made({effect_type:'resource',buff_type:null,resource_type:'ticket',modifier_type:'increase',value:+m[1],value_unit:'count',resource_cap:+m[2],duration:'継続',duration_unit:'continuous',duration_type:'continuous'},line);
  m=line.match(/^First Train Discount for (\d+(?:\.\d+)?) sec\.$/i);
  if(m)return made({effect_type:'special_mechanic',buff_type:null,special_type:'resource_consumption_modifier',resource_type:'ticket',modifier_type:'disable_consumption',value:true,value_unit:'boolean',duration:`${m[1]} sec`,duration_value:+m[1],duration_unit:'seconds',duration_type:'fixed',parent_effect_name:'First Train Discount'},line);
  m=line.match(/^Fills the ammo pouch with (\d+) round\(s\), up to a maximum of (\d+)\. This effect is continuous and cannot be removed\.$/i);
  if(m)return made({effect_type:'resource',buff_type:null,resource_type:'ammo_pouch',modifier_type:'fill',value:+m[1],value_unit:'rounds',resource_cap:+m[2],duration:'継続',duration_unit:'continuous',duration_type:'continuous',removable:false},line);
  m=line.match(/^Expends ammo from the ammo pouch\. Amount: (\d+) round\(s\)\.$/i);
  if(m)return made({effect_type:'resource',buff_type:null,resource_type:'ammo_pouch',modifier_type:'consume',value:+m[1],value_unit:'rounds'},line);
  m=line.match(/^The damage multiplier of (.+?) is scaled by (\d+(?:\.\d+)?)%\.$/i);
  if(m)return made({effect_type:'special_mechanic',buff_type:null,special_type:'damage_scaling',modifier_type:'set',value:+m[2],value_unit:'percent',scaling_type:'damage_multiplier',scaling_source_effect:m[1]},line);

  const generic=line.match(/^(?:([\w -]+): )?(.+?)\s+([▲▼])\s*(\d+(?:\.\d+)?)(%|\s+round\(s\)|\s+rounds?)?(.*)$/i);
  const stat=generic&&Object.keys(STAT).find(k=>k.toLowerCase()===generic[2].toLowerCase());
  if(!generic||!stat||generic[1]&&/^(?:Once|Twice|Thrice|Stage|When|If|After|Upon|First|Second|Third|One|Two|Three|Max|HP|Level)\b/i.test(generic[1]))return null;
  let type=STAT[stat],unit=generic[5]==='%'?'percent':/round/i.test(generic[5]||'')?'count':'flat_value',tail=generic[6]||'',basis=null,notes=generic[1]||'';
  if(generic[3]==='▼'&&type!=='damage_taken'&&type!=='burst_cooldown_reduction')return null;
  if(generic[3]==='▲'&&type==='damage_taken')return null;
  const caster=tail.match(/^ of (?:the skill user's|(?:the )?caster's) (?:final )?(ATK|DEF|[Mm]ax HP|Charge Speed)(.*)$/i);
  if(caster){
    if(type==='atk'&&/^ATK$/i.test(caster[1])){type='caster_atk_based_atk';unit='caster_atk_percent';basis='ATK';}
    else if(type==='def'&&/^DEF$/i.test(caster[1])){type='caster_def_based_def';unit='caster_def_percent';basis='DEF';}
    else if(type==='max_hp'&&/max HP/i.test(caster[1])){type='caster_max_hp_based_max_hp';unit='caster_max_hp_percent';basis='max_hp';}
    else if(type==='atk'&&/max HP/i.test(caster[1])){type='caster_max_hp_based_atk';unit='caster_max_hp_percent';basis='max_hp';}
    else if(type==='charge_speed'&&/Charge Speed/i.test(caster[1])){unit='caster_charge_speed_percent';basis='Charge Speed';}
    else return null;
    tail=caster[2];
  }
  else if(/^ of /i.test(tail))return null;
  const duration=durationShape(tail,inheritedDuration),stack=+(tail.match(/(?:stacks? up to|stacking up to) (\d+) (?:times|time\(s\))/i)?.[1]||0)||null;
  const value=+generic[4],namedStack=tail.match(/x stack count of (.+?)(?: for |\.|$)/i);
  if(/immune to stack count/i.test(tail))return null;
  if(/\.\s+(?:If|When|While|Unless)\b/i.test(tail))return null;
  const endOnly=/^\.?(?: This effect is continuous and cannot be removed\.| \(without restoring HP\)\. Lasts for| without restoring HP, lasts for| for| continuously)/i.test(tail)||tail==='.';
  if(duration.duration==='Instant'&&!inheritedDuration?.duration&&!endOnly&&!namedStack)return null;
  const parsed=made({effect_type:'buff',buff_type:type,value,value_unit:unit,stack_count:stack,max_raw_value:stack?Number((value*stack).toFixed(8)):namedStack?null:value,
    direction:generic[3]==='▼'?'decrease':'increase',modifier_type:generic[3]==='▼'?'decrease':'increase',value_basis:basis,
    notes:/without restoring HP/i.test(tail)?[notes,'without restoring HP'].filter(Boolean).join('; '):notes,
    scaling_type:namedStack?'multiply_by_named_stack':null,scaling_source_effect:namedStack?.[1]?.trim()||null,...duration},tail,inheritedDuration);
  if(tail==='.'&&!inheritedDuration?.duration)parsed._needs_review_reasons=['ambiguous_duration'];
  return parsed;
}

export const knownStatName = name => Object.keys(STAT).some(k=>k.toLowerCase()===name.toLowerCase());

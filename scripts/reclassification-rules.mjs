const rule=(classification,buff_type=null,extra={})=>({classification,buff_type,...extra});
const NEW={
  'Elemental Advantage Attack Damage':'elemental_advantage_damage','Sustained Damage':'sustained_damage','Damage to Parts':'parts_damage',
  'True Damage':'true_damage','Distributed Damage':'distributed_damage','Explosion Radius':'explosion_radius','Explosion Range':'explosion_radius',
  'Projectile Explosion Damage':'projectile_explosion_damage','Damage to Interruption Parts':'interruption_parts_damage','Damage dealt to Shield':'shield_damage',
  'Projectile Attachment Damage':'projectile_attachment_damage','When attacking an enemy projectile, damage dealt to that projectile':'enemy_projectile_damage',
  'When attacking an enemy projectile, damage to that projectile':'enemy_projectile_damage','Sequential attack damage':'sequential_attack_damage',
  'Burst Gauge filling speed':'burst_gauge_fill_speed','Full Burst Duration':'full_burst_duration',
  'Burst Skill damage of skills with "Affects all enemies"':'burst_skill_damage_aoe',
  'Burst Skill damage of skills with "Affects 1 enemy unit(s)" in the description':'burst_skill_damage_single_target',
  'Cooldown of Skill 2':'skill_cooldown','Attack Speed':'attack_speed','Number of pellets':'pellet_count','Machine Gun Ramp-Up Speed':'mg_ramp_up_speed',
  'Minimum Effective Range':'minimum_effective_range','Maximum Effective Range':'maximum_effective_range','Piercing Radius':'piercing_radius',
  'Reload Ratio':'reload_ratio','Charge Time':'charge_time','Charge Damage Multiplier':'charge_damage_multiplier',
  'Converts Charge Speed over 100% into Charge Damage. Charge Damage':'charge_speed_overcap_conversion','Unlimited Ammunition':'unlimited_ammo',
  'Equally shares damage taken':'damage_share','Indomitability':'indomitability','Damage taken from Electric Code enemies':'damage_taken_from_element',
  'Damage dealt by Wind Code enemies':'damage_taken_from_element','Scarlet Protection: Damage taken from Water Code enemies':'damage_taken_from_element',
  "Next shield's HP":'next_shield_hp','Max HP of cover':'cover_max_hp',"Cover's DEF":'cover_def','Outgoing Healing':'outgoing_healing',
  'Healing':'healing','Equally shares HP recovery':'healing_share','Critical Rate of normal attack':'normal_attack_crit_rate',
  'Critical Rate of normal attacks':'normal_attack_crit_rate','debuff immunity to 1 debuff(s)':'debuff_immunity',
  'debuff immunity to 1 debuff(s), stacking up to 1 time(s)':'debuff_immunity',
  'Normal Attack Damage Multiplier':'normal_attack_damage_multiplier'
};
const EXISTING={
  'Highway to Hell 1 - ATK':'atk','Marked Target 3 - ATK':'atk','Metal γ: ATK':'atk','My Own Star: ATK':'atk','Only when above 70%: ATK':'atk',
  'Survival Instinct 1 - ATK':'atk','Tarukaja: ATK':'atk','Matarukaja: ATK':'caster_atk_based_atk','Rakukaja: DEF':'def',
  'Defense Master: DEF':'def','Marakukaja: DEF':'caster_def_based_def','Highway to Hell 2 - Critical Rate':'critical_rate',
  'Marked Target 1 - Critical Rate':'critical_rate','Survival Instinct 3 - Critical Rate':'critical_rate','Marked Target 2 - Critical Damage':'critical_damage',
  'Survival Instinct 2 - Critical Damage':'critical_damage','Only when above 25%: Hit Rate':'hit_rate','Only when above 55%: True Damage':'true_damage',
  'Nuke Amp: Elemental Advantage Attack Damage':'elemental_advantage_damage','Nuke Boost: Elemental Advantage Attack Damage':'elemental_advantage_damage',
  'Fire Amp: Distributed Damage':'distributed_damage','Metal σ: Burst Gauge filling speed':'burst_gauge_fill_speed',
  'debuff immunity to ∞ debuffs':'debuff_immunity','immunity to Decrease Charge Speed effects':'debuff_immunity',
  'Immunity to Embarrassment':'debuff_immunity','immunity to Noise Pollution':'debuff_immunity',
  'immunity to Proof of Violation':'debuff_immunity','immunity to Stun':'debuff_immunity'
};
const RESOURCE=['Battery','Scraps','Whistle stacks','Anti A.T. Field stacks','Ensnaring Chains stacks','Golden Chip stacks','Mute stacks','Over Energy','Restraint Chain','Tilted Scale stacks','Number of ghosts','Ticket count'];
const SPECIAL=['Accumulated damage ratio of the Cumulative Damage Skill','Aftertaste Effect',"Attack range of Annihilation State's additional effect",'Blanching Duration','Dancing Flower Duration','Maillard Duration','Flash Grenade Toss activation time condition','Hit count required for Skill 2','Max ammo loaded by Auto Fire Ready','Max Lock-On targets','Maximum Accumulation of Ninjutsu IFAK','Number of uses of Seven Dwarves Fully Active','Performance duration','Recurring interval of Environment Setup',"Skill 2's requirement for triggering attachable projectiles","Units affected by Annihilation State's additional effect",'Extrasensory','immunity to Increase Charge Speed effects',
  'If in the Assigned Part: Dancing status, Mint gains Assigned Part: Singing','If not in the Assigned Part: Dancing status, Mint gains Assigned Part: Dancing','Sakura Petals Duration'];
const PENALTY=['Current HP','HP'];
export const REVIEWED_UNKNOWN_RULES={};
for(const [label,type] of Object.entries(NEW))REVIEWED_UNKNOWN_RULES[label]=rule('new_buff_type',type);
for(const [label,type] of Object.entries(EXISTING))REVIEWED_UNKNOWN_RULES[label]=rule('existing_buff_type',type);
for(const label of RESOURCE)REVIEWED_UNKNOWN_RULES[label]=rule('resource',null,{resource_type:label.replace(/ stacks$/i,'').replace(/[^a-z0-9]+/gi,'_').replace(/^_|_$/g,'').toLowerCase()});
for(const label of SPECIAL)REVIEWED_UNKNOWN_RULES[label]=rule('special_mechanic');
for(const label of PENALTY)REVIEWED_UNKNOWN_RULES[label]=rule('penalty');
REVIEWED_UNKNOWN_RULES['Deals 50.06% of final ATK as damage. Attacks once for every Restraint Chain. Restraint Chain']=rule('resource',null,{resource_type:'restraint_chain',resource_change:true});
REVIEWED_UNKNOWN_RULES['Anti A.T. Field: Damage Taken']=rule('debuff');

const META={
  'Cooldown of Skill 2':{target_skill_slot:2},
  'Converts Charge Speed over 100% into Charge Damage. Charge Damage':{conversion_source:'charge_speed_over_100',conversion_target:'charge_damage'},
  'Damage taken from Electric Code enemies':{element:'electric'},'Damage dealt by Wind Code enemies':{element:'wind'},
  'Scarlet Protection: Damage taken from Water Code enemies':{element:'water',parent_effect_name:'Scarlet Protection'},
  'Only when above 25%: Hit Rate':{condition:'HP > 25%'},'Only when above 55%: True Damage':{condition:'HP > 55%'},
  'Only when above 70%: ATK':{condition:'HP > 70%'},
  'debuff immunity to 1 debuff(s)':{immune_effect:'any_debuff',immunity_count:1},
  'debuff immunity to 1 debuff(s), stacking up to 1 time(s)':{immune_effect:'any_debuff',immunity_count:1},
  'debuff immunity to ∞ debuffs':{immune_effect:'any_debuff',immunity_count:'infinity'},
  'immunity to Decrease Charge Speed effects':{immune_effect:'decrease_charge_speed',immunity_count:'unlimited'},
  'Immunity to Embarrassment':{immune_effect:'embarrassment',immunity_count:'unlimited'},
  'immunity to Noise Pollution':{immune_effect:'noise_pollution',immunity_count:'unlimited'},
  'immunity to Proof of Violation':{immune_effect:'proof_of_violation',immunity_count:'unlimited'},
  'immunity to Stun':{immune_effect:'stun',immunity_count:'unlimited'},
  'Number of ghosts':{resource_type:'ghosts'},'Ticket count':{resource_type:'ticket'},
  'If in the Assigned Part: Dancing status, Mint gains Assigned Part: Singing':{special_type:'state_transition',state_system:'assigned_part',from_state:'dancing',to_state:'singing'},
  'If not in the Assigned Part: Dancing status, Mint gains Assigned Part: Dancing':{special_type:'state_transition',state_system:'assigned_part',from_state:null,to_state:'dancing'},
  'Sakura Petals Duration':{special_type:'state_duration',state_name:'Sakura Petals'}
};
const PARENTS=['Highway to Hell 1','Highway to Hell 2','Marked Target 1','Marked Target 2','Marked Target 3','Metal γ','My Own Star','Survival Instinct 1','Survival Instinct 2','Survival Instinct 3','Tarukaja','Matarukaja','Rakukaja','Defense Master','Marakukaja','Nuke Amp','Nuke Boost','Fire Amp','Metal σ'];
for(const [label,meta] of Object.entries(META))Object.assign(REVIEWED_UNKNOWN_RULES[label],meta);
for(const parent of PARENTS){const label=Object.keys(REVIEWED_UNKNOWN_RULES).find(k=>k.startsWith(parent+':')||k.startsWith(parent+' -'));if(label)REVIEWED_UNKNOWN_RULES[label].parent_effect_name=parent;}

const normalized=new Map(Object.entries(REVIEWED_UNKNOWN_RULES).map(([k,v])=>[k.toLowerCase(),{label:k,...v}]));
export const reviewedUnknownRule=label=>normalized.get(String(label||'').trim().toLowerCase())||null;
export const reviewedUnknownLabels=()=>Object.keys(REVIEWED_UNKNOWN_RULES);
const followupLabels=new Set(['Normal Attack Damage Multiplier','Number of ghosts','debuff immunity to ∞ debuffs',
  'If in the Assigned Part: Dancing status, Mint gains Assigned Part: Singing','If not in the Assigned Part: Dancing status, Mint gains Assigned Part: Dancing',
  'immunity to Decrease Charge Speed effects','Immunity to Embarrassment','immunity to Noise Pollution','immunity to Proof of Violation','immunity to Stun','Sakura Petals Duration','Ticket count']);
export const isFollowupUnknownLabel=label=>followupLabels.has(label);
export function reviewedRuleForLine(text,parentEffectName=null){
  const source=String(text||'').replace(/^Effect \d+:\s*/i,'').trim();
  const arrow=source.match(/^(.+?)\s+[▲▼]\s*\d/),candidates=[];
  if(arrow)candidates.push(arrow[1].trim());
  if(/unlimited ammunition/i.test(source))candidates.push('Unlimited Ammunition');
  if(/\bIndomitability\b/i.test(source))candidates.push('Indomitability');
  if(/Equally shares damage taken/i.test(source))candidates.push('Equally shares damage taken');
  if(/Equally shares HP recovery/i.test(source))candidates.push('Equally shares HP recovery');
  if(/debuff immunity to 1 debuff\(s\), stacking up to 1 time\(s\)/i.test(source))candidates.push('debuff immunity to 1 debuff(s), stacking up to 1 time(s)');
  else if(/debuff immunity to 1 debuff\(s\)/i.test(source))candidates.push('debuff immunity to 1 debuff(s)');
  if(/immunity to Increase Charge Speed effects/i.test(source))candidates.push('immunity to Increase Charge Speed effects');
  const immunity=source.match(/(?:Gains? )?(debuff immunity to ∞ debuffs|immunity to Decrease Charge Speed effects|Immunity to Embarrassment|immunity to Noise Pollution|immunity to Proof of Violation|immunity to Stun)/i);
  if(immunity)candidates.push(immunity[1]);
  for(const label of followupLabels)if(source.toLowerCase().startsWith(label.toLowerCase()))candidates.push(label);
  for(const candidate of candidates){
    const combined=parentEffectName&&reviewedUnknownRule(`${parentEffectName}: ${candidate}`);if(combined)return combined;
    const direct=reviewedUnknownRule(candidate);if(direct)return direct;
  }
  return null;
}

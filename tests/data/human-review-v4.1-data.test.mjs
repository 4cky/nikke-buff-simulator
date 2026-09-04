import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseSkillHierarchy} from '../../scripts/skill-hierarchy.mjs';

const reviewedCandidates=[
  {
    "candidate": 1,
    "character_name": "Raven",
    "skill_slot": "Burst",
    "skill_name": "Tempest",
    "source_line": "A.N. Mode",
    "metadata_only": true
  },
  {
    "candidate": 2,
    "character_name": "Elegg: Boom and Shock",
    "skill_slot": "Skill 1",
    "skill_name": "Hello Ghost",
    "source_line": "Ability: Find and capture ghosts possessing the enemy.",
    "metadata_only": true
  },
  {
    "candidate": 3,
    "character_name": "Rapi: Red Hood",
    "skill_slot": "Skill 2",
    "skill_name": "Attachable Projectiles",
    "source_line": "Attachable Projectiles",
    "metadata_only": true
  },
  {
    "candidate": 4,
    "character_name": "Anis: Star",
    "skill_slot": "Burst",
    "skill_name": "Star Anis",
    "source_line": "Attack Interval: 0.25 sec",
    "metadata_only": false
  },
  {
    "candidate": 5,
    "character_name": "Mint",
    "skill_slot": "Skill 2",
    "skill_name": "Fantastic Performance!",
    "source_line": "Cancels Assigned Part: Dancing.",
    "metadata_only": false
  },
  {
    "candidate": 6,
    "character_name": "Mint",
    "skill_slot": "Skill 2",
    "skill_name": "Fantastic Performance!",
    "source_line": "Cancels Assigned Part: Singing.",
    "metadata_only": false
  },
  {
    "candidate": 7,
    "character_name": "Rapi: Red Hood",
    "skill_slot": "Skill 1",
    "skill_name": "Battlefield Assessment",
    "source_line": "Cancels Combat Assist.",
    "metadata_only": false
  },
  {
    "candidate": 8,
    "character_name": "Mihara: Bonding Chain",
    "skill_slot": "Burst",
    "skill_name": "Bonding Pain",
    "source_line": "Cancels Ensnaring Chains after the effect is triggered.",
    "metadata_only": false
  },
  {
    "candidate": 9,
    "character_name": "Bready",
    "skill_slot": "Skill 1",
    "skill_name": "Lonely Gourmet",
    "source_line": "Cancels Lingering Taste.",
    "metadata_only": false
  },
  {
    "candidate": 10,
    "character_name": "Bready",
    "skill_slot": "Skill 1",
    "skill_name": "Lonely Gourmet",
    "source_line": "Cancels Recommended Taste.",
    "metadata_only": false
  },
  {
    "candidate": 11,
    "character_name": "Trina",
    "skill_slot": "Burst",
    "skill_name": "Mother Forest",
    "source_line": "Changes Spread Roots to Wilted Roots.",
    "metadata_only": false
  },
  {
    "candidate": 12,
    "character_name": "Rapi: Red Hood",
    "skill_slot": "Skill 1",
    "skill_name": "Battlefield Assessment",
    "source_line": "Combat Assist: Changes to Burst Stage 1. This effect is continuous and cannot be removed.",
    "metadata_only": false
  },
  {
    "candidate": 13,
    "character_name": "Label",
    "skill_slot": "Skill 1",
    "skill_name": "Meeting and Parting (Imagined)",
    "source_line": "Delusion Shattered: Activates up to 2 time(s). This effect is continuous.",
    "metadata_only": false
  },
  {
    "candidate": 14,
    "character_name": "Anis: Star",
    "skill_slot": "Skill 1",
    "skill_name": "Starfall",
    "source_line": "Effect 1: Affects self. Cancels Everyone's Star.",
    "metadata_only": false
  },
  {
    "candidate": 15,
    "character_name": "Anis: Star",
    "skill_slot": "Skill 1",
    "skill_name": "Starfall",
    "source_line": "Effect 1: Affects self. Cancels My Own Star.",
    "metadata_only": false
  },
  {
    "candidate": 16,
    "character_name": "Anis: Star",
    "skill_slot": "Skill 1",
    "skill_name": "Starfall",
    "source_line": "Effect 2: Affects self. Everyone's Star: Re-enters Burst and changes to Stage 1. This effect is continuous and cannot be removed.",
    "metadata_only": false
  },
  {
    "candidate": 17,
    "character_name": "Emma: Tactical Upgrade",
    "skill_slot": "Skill 2",
    "skill_name": "LT Formation",
    "source_line": "Effect 3: Affects self. Exposure activation disabled continuously.",
    "metadata_only": false
  },
  {
    "candidate": 18,
    "character_name": "Velvet",
    "skill_slot": "Skill 1",
    "skill_name": "Sticky Fingers",
    "source_line": "Effect 2: Affects self. Fills the ammo pouch with 6000 round(s), up to a maximum of 6000. This effect is continuous and cannot be removed.",
    "metadata_only": false
  },
  {
    "candidate": 19,
    "character_name": "Prika",
    "skill_slot": "Skill 2",
    "skill_name": "One More Song!",
    "source_line": "Effect 1: Affects the member who initiated Sing Along. Assigned Part: Singing. This effect is continuous and cannot be removed.",
    "metadata_only": false
  },
  {
    "candidate": 20,
    "character_name": "Velvet",
    "skill_slot": "Skill 1",
    "skill_name": "Sticky Fingers",
    "source_line": "Effect 1: Expends ammo from the ammo pouch. Amount: 100 round(s).",
    "metadata_only": false
  },
  {
    "candidate": 21,
    "character_name": "Label",
    "skill_slot": "Skill 1",
    "skill_name": "Meeting and Parting (Imagined)",
    "source_line": "Effect 1: Imagined Heartbreak: Prevents being targeted by single-target attacks for 1 sec x Delusion Shattered count. This effect is removed upon taking a direct hit.",
    "metadata_only": false
  },
  {
    "candidate": 22,
    "character_name": "Delta: Ninja Thief",
    "skill_slot": "Skill 2",
    "skill_name": "Ninjutsu Camouflage",
    "source_line": "Effect 1: Ninjutsu Camouflage: Prevents being targeted by single-target attacks for 10 sec. This effect is removed upon taking a direct hit.",
    "metadata_only": false
  },
  {
    "candidate": 23,
    "character_name": "Emma: Tactical Upgrade",
    "skill_slot": "Burst",
    "skill_name": "Battlefield Formation",
    "source_line": "Effect 1 Targets: All enemies",
    "metadata_only": true
  },
  {
    "candidate": 24,
    "character_name": "Emma: Tactical Upgrade",
    "skill_slot": "Skill 1",
    "skill_name": "Environment Setup",
    "source_line": "Effect 1 Targets: All enemies (including those that appear during Environment Setup)",
    "metadata_only": true
  },
  {
    "candidate": 25,
    "character_name": "Elegg: Boom and Shock",
    "skill_slot": "Skill 1",
    "skill_name": "Hello Ghost",
    "source_line": "Effect: Captures 1 ghost when the required hit count reaches 100%. A maximum of 13 ghost(s) can be captured.",
    "metadata_only": false
  },
  {
    "candidate": 26,
    "character_name": "Rapi: Red Hood",
    "skill_slot": "Skill 2",
    "skill_name": "Attachable Projectiles",
    "source_line": "Effect: Launches attachable projectiles that attach to hit locations. When entering Full Burst, the projectiles explode.",
    "metadata_only": true
  },
  {
    "candidate": 27,
    "character_name": "Emma: Tactical Upgrade",
    "skill_slot": "Skill 1",
    "skill_name": "Environment Setup",
    "source_line": "Exposure (Cannot be removed)",
    "metadata_only": true
  },
  {
    "candidate": 28,
    "character_name": "Modernia",
    "skill_slot": "Burst",
    "skill_name": "New World",
    "source_line": "Extends her line of sight and auto-aims at all enemies within range. The stage target is treated as a single enemy regardless of whether it has parts (including interruption parts).",
    "metadata_only": false
  },
  {
    "candidate": 29,
    "character_name": "D",
    "skill_slot": "Skill 2",
    "skill_name": "Surprise Attack",
    "source_line": "Fills Burst Gauge by 98.56%. Activates 1 time(s) per battle.",
    "metadata_only": false
  },
  {
    "candidate": 30,
    "character_name": "Elegg",
    "skill_slot": "Skill 2",
    "skill_name": "Fast Charge",
    "source_line": "Fills Burst Gauge by 100%. Activates once per battle.",
    "metadata_only": false
  },
  {
    "candidate": 31,
    "character_name": "Soline: Frost Ticket",
    "skill_slot": "Skill 2",
    "skill_name": "I'll Help You Board the Train!",
    "source_line": "First Train Discount for 6 sec.",
    "metadata_only": false
  },
  {
    "candidate": 32,
    "character_name": "Queen (Makoto)",
    "skill_slot": "Skill 2",
    "skill_name": "Fist of Justice!",
    "source_line": "Fist of Justice!: This effect is continuous and cannot be removed.",
    "metadata_only": true
  },
  {
    "candidate": 33,
    "character_name": "Guillotine: Winter Slayer",
    "skill_slot": "Skill 1",
    "skill_name": "Hero's Fate",
    "source_line": "Hero Level Up: Reaches a maximum of Level 11.",
    "metadata_only": false
  },
  {
    "candidate": 34,
    "character_name": "Trina",
    "skill_slot": "Skill 2",
    "skill_name": "Peaceful Tree",
    "source_line": "Invulnerable for 2 sec.",
    "metadata_only": false
  },
  {
    "candidate": 35,
    "character_name": "Soline: Frost Ticket",
    "skill_slot": "Skill 1",
    "skill_name": "I'll Check Your Ticket!",
    "source_line": "Issues 1 ticket, up to a maximum of 2. This effect is continuous.",
    "metadata_only": false
  },
  {
    "candidate": 36,
    "character_name": "Snow White: Heavy Arms",
    "skill_slot": "Skill 1",
    "skill_name": "Seven Dwarves V+VI",
    "source_line": "Max ammo loaded by Auto Fire Ready: 5",
    "metadata_only": false
  },
  {
    "candidate": 37,
    "character_name": "Snow White: Heavy Arms",
    "skill_slot": "Skill 1",
    "skill_name": "Seven Dwarves V+VI",
    "source_line": "Max Lock-On Targets: 5",
    "metadata_only": false
  },
  {
    "candidate": 38,
    "character_name": "Scarlet: Black Shadow",
    "skill_slot": "Skill 1",
    "skill_name": "Fleetly Fading: Breakthrough",
    "source_line": "Nine times: Affects all enemies.",
    "metadata_only": true
  },
  {
    "candidate": 39,
    "character_name": "Delta: Ninja Thief",
    "skill_slot": "Skill 2",
    "skill_name": "Ninjutsu Camouflage",
    "source_line": "Ninjutsu IFAK: Lasts for 4 sec.",
    "metadata_only": false
  },
  {
    "candidate": 40,
    "character_name": "Snow White: Heavy Arms",
    "skill_slot": "Burst",
    "skill_name": "Seven Dwarves Fully Active",
    "source_line": "Number of uses: 2",
    "metadata_only": false
  },
  {
    "candidate": 41,
    "character_name": "Mint",
    "skill_slot": "Burst",
    "skill_name": "Let's Sing Together!",
    "source_line": "Only one Assigned Part is applied according to Mint's current status.",
    "metadata_only": true
  },
  {
    "candidate": 42,
    "character_name": "Milk: Blooming Bunny",
    "skill_slot": "Burst",
    "skill_name": "Embarrassment Explosion",
    "source_line": "Overconfident, Huh?!:",
    "metadata_only": true
  },
  {
    "candidate": 43,
    "character_name": "Aigis",
    "skill_slot": "Skill 2",
    "skill_name": "Papillon Heart",
    "source_line": "Papillon Heart: This effect is continuous and cannot be removed.",
    "metadata_only": true
  },
  {
    "candidate": 44,
    "character_name": "K",
    "skill_slot": "Burst",
    "skill_name": "Means of Righteousness",
    "source_line": "Pellet Count: 10",
    "metadata_only": false
  },
  {
    "candidate": 45,
    "character_name": "Queen (Makoto)",
    "skill_slot": "Skill 1",
    "skill_name": "Persona: Johanna",
    "source_line": "Persona - Johanna: This effect is continuous and cannot be removed.",
    "metadata_only": true
  },
  {
    "candidate": 46,
    "character_name": "Yukiko",
    "skill_slot": "Skill 1",
    "skill_name": "Persona: Konohana Sakuya",
    "source_line": "Persona - Konohana Sakuya: This effect is continuous and cannot be removed.",
    "metadata_only": true
  },
  {
    "candidate": 47,
    "character_name": "Aigis",
    "skill_slot": "Skill 1",
    "skill_name": "Persona: Palladion",
    "source_line": "Persona - Palladion: This effect is continuous and cannot be removed.",
    "metadata_only": true
  },
  {
    "candidate": 48,
    "character_name": "Elegg: Boom and Shock",
    "skill_slot": "Skill 1",
    "skill_name": "Hello Ghost",
    "source_line": "Possession lasts for 6 sec.",
    "metadata_only": false
  },
  {
    "candidate": 49,
    "character_name": "Cinderella: Crystal Wave",
    "skill_slot": "Skill 1",
    "skill_name": "Beauty-Full",
    "source_line": "Removal Condition: Reloading to max ammunition while in the Preparation for Change state.",
    "metadata_only": true
  },
  {
    "candidate": 50,
    "character_name": "Cocoa",
    "skill_slot": "Skill 1",
    "skill_name": "Professional Origami",
    "source_line": "Removes 1 debuff(s).",
    "metadata_only": false
  },
  {
    "candidate": 51,
    "character_name": "Elegg: Boom and Shock",
    "skill_slot": "Skill 1",
    "skill_name": "Hello Ghost",
    "source_line": "Required hit count: 100 time(s) in total, cumulative across all allies.",
    "metadata_only": false
  },
  {
    "candidate": 52,
    "character_name": "Yukiko",
    "skill_slot": "Skill 2",
    "skill_name": "Scarlet Flower",
    "source_line": "Scarlet Flower: This effect is continuous and cannot be removed.",
    "metadata_only": true
  },
  {
    "candidate": 53,
    "character_name": "Scarlet: Black Shadow",
    "skill_slot": "Skill 1",
    "skill_name": "Fleetly Fading: Breakthrough",
    "source_line": "Six times: Affects enemies within attack range.",
    "metadata_only": true
  },
  {
    "candidate": 54,
    "character_name": "Soda: Twinkling Bunny",
    "skill_slot": "Burst",
    "skill_name": "Onward, Soda!",
    "source_line": "Stage 1: Affects all enemies.",
    "metadata_only": true
  },
  {
    "candidate": 55,
    "character_name": "Quency: Escape Queen",
    "skill_slot": "Skill 2",
    "skill_name": "Explore Route",
    "source_line": "Stage 1: Affects self.",
    "metadata_only": true
  },
  {
    "candidate": 56,
    "character_name": "Soda: Twinkling Bunny",
    "skill_slot": "Skill 2",
    "skill_name": "Beginner's Rewards",
    "source_line": "Stage 1: When in Time Extension I state,",
    "metadata_only": true
  },
  {
    "candidate": 57,
    "character_name": "Soda: Twinkling Bunny",
    "skill_slot": "Skill 2",
    "skill_name": "Beginner's Rewards",
    "source_line": "Stage 2: When in Time Extension II state,",
    "metadata_only": true
  },
  {
    "candidate": 58,
    "character_name": "Eunhwa: Tactical Upgrade",
    "skill_slot": "Burst",
    "skill_name": "Explosive Round",
    "source_line": "Target: Target(s) hit",
    "metadata_only": true
  },
  {
    "candidate": 59,
    "character_name": "EVE",
    "skill_slot": "Burst",
    "skill_name": "Counter Chain",
    "source_line": "Triggers Eagle Eye-Type Exospine Mk2.",
    "metadata_only": false
  },
  {
    "candidate": 60,
    "character_name": "EVE",
    "skill_slot": "Burst",
    "skill_name": "Counter Chain",
    "source_line": "Triggers Impact-Type Exospine Mk2.",
    "metadata_only": false
  },
  {
    "candidate": 61,
    "character_name": "Viper",
    "skill_slot": "Skill 2",
    "skill_name": "Snake Scale",
    "source_line": "Vamp: Prevents being targeted by single-target attacks for 10 sec. This effect is removed upon taking a direct hit.",
    "metadata_only": false
  }
];
const snapshots=JSON.parse(readFileSync('data/skill-snapshots.json'));
const hierarchyFor=row=>parseSkillHierarchy(snapshots.find(s=>s.character_name===row.character_name&&s.skill_slot===row.skill_slot&&s.skill_name===row.skill_name));
const nodesFor=row=>hierarchyFor(row).sections.flatMap(s=>s.groups.flatMap(g=>g.children));
const nodeFor=row=>nodesFor(row).find(c=>c.source_line===row.source_line);

for(const row of reviewedCandidates)test(`human review v4.1 candidate ${row.candidate}: ${row.character_name} / ${row.source_line}`,()=>{
  const node=nodeFor(row);
  if(row.metadata_only){
    assert.equal(node,undefined,'metadata-only line must not create a standalone effect');
    return;
  }
  assert.ok(node,'reviewed actual effect must remain structurally represented');
  if(row.character_name==='Cocoa'){
    assert.deepEqual(node.effect.needs_review_reasons,['ambiguous_trigger']);
    return;
  }
  assert.deepEqual(node.effect.needs_review_reasons,[]);
});

test('human review v4.1 key structures retain the authoritative axes',()=>{
  const cocoa=nodeFor(reviewedCandidates[49]).effect;
  assert.deepEqual([cocoa.effect_type,cocoa.buff_type,cocoa.modifier_type,cocoa.value,cocoa.value_unit,cocoa.target_type,cocoa.target_count,cocoa.target_selection,cocoa.target_condition],
    ['buff','debuff_cleanse','remove',1,'count','selected_allies',2,'random','has_debuff']);

  const trina=nodeFor(reviewedCandidates[33]).effect;
  assert.deepEqual([trina.buff_type,trina.value_unit,trina.duration_value,trina.duration_unit,trina.target_type,trina.target_count,trina.target_selection,trina.target_element,trina.target_weapon],
    ['invulnerability','boolean',2,'seconds','selected_allies',1,'leftmost','Electric','assault_rifle']);

  for(const index of [28,29]){
    const gauge=nodeFor(reviewedCandidates[index]).effect;
    assert.equal(gauge.buff_type,'burst_gauge_fill');assert.equal(gauge.modifier_type,'fill');assert.equal(gauge.activation_limit,1);assert.equal(gauge.activation_limit_unit,'per_battle');
  }

  const rapi=nodeFor(reviewedCandidates[11]).effect;
  assert.deepEqual([rapi.buff_type,rapi.modifier_type,rapi.target_burst_stage,rapi.parent_effect_name,rapi.target_type,rapi.duration_unit,rapi.removable],
    ['burst_stage_change','set',1,'Combat Assist','self','continuous',false]);

  const anis=nodeFor(reviewedCandidates[15]).effect;
  assert.deepEqual([anis.buff_type,anis.modifier_type,anis.target_burst_stage,anis.parent_effect_name,anis.target_type,anis.duration_unit,anis.removable],
    ['burst_stage_reentry','reentry',1,"Everyone's Star",'self','continuous',false]);

  for(const index of [21,60]){
    const untargetable=nodeFor(reviewedCandidates[index]).effect;
    assert.equal(untargetable.buff_type,'single_target_untargetable');assert.equal(untargetable.duration_value,10);assert.equal(untargetable.end_condition,'taking_direct_hit');
  }
  const label=nodeFor(reviewedCandidates[20]).effect;
  assert.deepEqual([label.buff_type,label.scaling_type,label.scaling_source_effect,label.max_duration_value,label.end_condition],
    ['single_target_untargetable','multiply_by_named_stack','Delusion Shattered',2,'taking_direct_hit']);

  const pellet=nodeFor(reviewedCandidates[43]).effect;
  assert.deepEqual([pellet.effect_type,pellet.parameter_name,pellet.modifier_type,pellet.value,pellet.value_unit],['weapon_state','pellet_count','set',10,'count']);

  const ticket=nodeFor(reviewedCandidates[34]).effect;
  assert.deepEqual([ticket.effect_type,ticket.resource_type,ticket.modifier_type,ticket.value,ticket.resource_cap,ticket.target_type],
    ['resource','ticket','increase',1,2,'all_allies']);

  const pouchFill=nodeFor(reviewedCandidates[17]).effect,pouchCost=nodeFor(reviewedCandidates[19]).effect;
  assert.deepEqual([pouchFill.effect_type,pouchFill.resource_type,pouchFill.modifier_type,pouchFill.value,pouchFill.resource_cap,pouchFill.removable],
    ['resource','ammo_pouch','fill',6000,6000,false]);
  assert.deepEqual([pouchCost.effect_type,pouchCost.resource_type,pouchCost.modifier_type,pouchCost.value,pouchCost.value_unit],
    ['resource','ammo_pouch','consume',100,'rounds']);

  for(const index of [58,59]){
    const exospine=nodeFor(reviewedCandidates[index]).effect;
    assert.equal(exospine.special_type,'state_activation');assert.equal(exospine.parent_effect_name,'Exospine Mk2');assert.equal(exospine.duration_value,10);
  }

  for(const index of [6,7,8,9,13,14]){
    const removed=nodeFor(reviewedCandidates[index]).effect;
    assert.equal(removed.special_type,'state_remove');assert.equal(removed.modifier_type,'remove');
  }
  assert.equal(nodeFor(reviewedCandidates[7]).effect.end_trigger,'after_effect_triggered');

  const possession=nodeFor(reviewedCandidates[47]).effect,ghostRequirement=nodeFor(reviewedCandidates[50]).effect,ghost=nodeFor(reviewedCandidates[24]).effect;
  assert.deepEqual([possession.special_type,possession.state_name,possession.duration_value],['state_duration','Possession',6]);
  assert.deepEqual([ghostRequirement.special_type,ghostRequirement.requirement_name,ghostRequirement.value,ghostRequirement.value_unit,ghostRequirement.aggregation],
    ['skill_requirement','ghost_capture_hit_count',100,'hits','cumulative_across_all_allies']);
  assert.deepEqual([ghost.effect_type,ghost.resource_type,ghost.value,ghost.resource_cap,ghost.requirement_value,ghost.requirement_unit],
    ['resource','ghost',1,13,100,'percent']);

  const firstTrain=nodeFor(reviewedCandidates[30]).effect;
  assert.deepEqual([firstTrain.special_type,firstTrain.resource_type,firstTrain.modifier_type,firstTrain.duration_value,firstTrain.target_type],
    ['resource_consumption_modifier','ticket','disable_consumption',6,'all_allies']);
  const hero=nodeFor(reviewedCandidates[32]).effect;
  assert.deepEqual([hero.special_type,hero.state_name,hero.value,hero.value_unit],['state_level_cap','Hero Level',11,'level']);
  const modernia=nodeFor(reviewedCandidates[27]).effect;
  assert.deepEqual([modernia.special_type,modernia.auto_aim,modernia.stage_target_treated_as_single_enemy],['targeting_mode_change','all_enemies_in_range',true]);

  const snowLock=nodeFor(reviewedCandidates[36]).effect,snowAmmo=nodeFor(reviewedCandidates[35]).effect,snowUses=nodeFor(reviewedCandidates[39]).effect;
  assert.deepEqual([snowLock.special_type,snowLock.parameter_name,snowLock.value,snowLock.parent_effect_name],['skill_parameter','max_lock_on_targets',5,'Lock-On']);
  assert.deepEqual([snowAmmo.special_type,snowAmmo.parameter_name,snowAmmo.value,snowAmmo.value_unit],['skill_parameter','max_auto_fire_ready_ammo',5,'rounds']);
  assert.deepEqual([snowUses.special_type,snowUses.value,snowUses.value_unit,snowUses.parent_effect_name],['usage_limit',2,'uses','Seven Dwarves Fully Active']);

  const emma=hierarchyFor(reviewedCandidates[23]);
  const emmaNodes=emma.sections.flatMap(s=>s.groups.flatMap(g=>g.children));
  assert.equal(emmaNodes.find(c=>c.effect.effect_index===1).effect.target,'All enemies (including those that appear during Environment Setup).');
  const emmaHeal=emmaNodes.find(c=>c.effect.effect_index===2);
  assert.deepEqual([emmaHeal.effect.effect_type,emmaHeal.effect.target_type,emmaHeal.effect.parent_effect_name],['heal','all_allies','Environment Setup']);

  const eunhwa=hierarchyFor(reviewedCandidates[57]);
  const explosive=eunhwa.sections.flatMap(s=>s.groups.flatMap(g=>g.children)).find(c=>/Explosive Round: Damage Taken/.test(c.source_line));
  assert.equal(explosive.effect.target_type,'hit_targets');

  const scarlet=hierarchyFor(reviewedCandidates[52]).sections.flatMap(s=>s.groups.flatMap(g=>g.children));
  assert.deepEqual(scarlet.filter(c=>c.effect.section_condition?.attack_count).map(c=>[c.effect.section_condition.attack_count,c.effect.target]),[[3,'the 1 enemy unit(s) with the lowest final DEF.'],[6,'enemies within attack range.'],[9,'all enemies.']]);

  const soda=hierarchyFor(reviewedCandidates[55]).sections.flatMap(s=>s.groups.flatMap(g=>g.children));
  assert.ok(soda.some(c=>c.effect.section_condition?.state==='Time Extension I'));
  assert.ok(soda.some(c=>c.effect.section_condition?.state==='Time Extension II'));
});

test('human review v4.1 fixture contains every one of the 61 decisions',()=>assert.equal(reviewedCandidates.length,61));
test('human review v4.1 suppresses exactly 23 reviewed metadata-only candidates',()=>assert.equal(reviewedCandidates.filter(r=>r.metadata_only).length,23));

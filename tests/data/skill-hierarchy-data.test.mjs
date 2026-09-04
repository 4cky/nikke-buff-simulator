import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseSkillHierarchy,aggregateUnknownCandidates,aggregateUnrecognizedPositiveCandidates} from '../../scripts/skill-hierarchy.mjs';
import {A2_MODE_B,assertHierarchyRegression} from '../../scripts/hierarchy-regression.mjs';
import {extractCharacter} from '../../scripts/source-model.mjs';
import {classifyReview} from '../../scripts/review-classifier.mjs';
import {applyReviewWorkflow,emptyReviewStore,createDecision} from '../../scripts/review-pipeline.mjs';
import {reviewedUnknownLabels} from '../../scripts/reclassification-rules.mjs';
const children=h=>h.sections.flatMap(s=>s.groups.flatMap(g=>g.children));
const fixture=text=>parseSkillHierarchy({...A2_MODE_B,text});
const snapshots=()=>JSON.parse(readFileSync('data/skill-snapshots.json'));
const parsedSkill=(name,slot)=>parseSkillHierarchy(snapshots().find(s=>s.character_name===name&&s.skill_slot===slot));
test('A2 Mode B regression: two inherited buffs and one excluded HP cost',()=>assertHierarchyRegression());
test('A2 stored Skill Lv10 source matches the regression, without parsing the full catalog',()=>{
  const s=JSON.parse(readFileSync('data/skill-snapshots.json')).find(s=>s.character_name==='A2'&&s.skill_slot==='Burst');
  assert.equal(s.text,A2_MODE_B.text);assert.deepEqual(children(parseSkillHierarchy(s)).map(c=>c.comparison_eligible),[false,true,true]);
});
test('child-local target/trigger/duration overrides do not contaminate siblings',()=>{
  const h=fixture(`■ Activates when entering Full Burst. Affects self.
Test Mode
Function: Lasts for 15 sec.
Effect 1: Affects all allies. Activates when healing. ATK ▲ 10% for 3 sec.
Effect 2: Charge Speed ▲ 20%.`),[a,b]=children(h);
  assert.equal(a.effect.target_type,'all_allies');assert.equal(a.effect.trigger,'Activates when healing');assert.equal(a.effect.duration,'3 sec');
  assert.equal(b.effect.target_type,'self');assert.equal(b.effect.trigger,'Activates when entering Full Burst');assert.equal(b.effect.duration,'15 sec');
  assert.equal(a.effect.parent_trigger,'Activates when entering Full Burst');
});
test('unnamed numbered effects share a section, not a fabricated named mode',()=>{
  const h=fixture(`■ Affects all allies.
Effect 1: ATK ▲ 10% for 5 sec.
Effect 2: Attack Damage ▲ 20% for 5 sec.`);
  assert.deepEqual(children(h).map(c=>[c.effect.buff_type,c.effect.parent_effect_name,c.comparison_eligible]),[['atk',null,true],['attack_damage',null,true]]);
});
test('multiple modes may restart Effect numbering; duplicate index within one mode is review-only',()=>{
  const h=fixture(`■ Affects self.
Mode A
Function: Lasts for 3 sec.
Effect 1: ATK ▲ 10%.
Mode B
Function: Lasts for 5 sec.
Effect 1: ATK ▲ 20%.`);
  assert.deepEqual(children(h).map(c=>[c.effect.parent_effect_name,c.effect.duration,c.comparison_eligible]),[['Mode A','3 sec',true],['Mode B','5 sec',true]]);
  const bad=fixture(A2_MODE_B.text.replace('Effect 3:','Effect 2:'));assert.equal(children(bad).some(c=>c.comparison_eligible),false);
});
test('E.H. child activation and dependency are retained; magazine multiplication is not guessed',()=>{
  const snapshots=JSON.parse(readFileSync('data/skill-snapshots.json'));
  const one=parseSkillHierarchy(snapshots.find(s=>s.character_name==='E.H.'&&s.skill_slot==='Skill 1'));
  const atk=children(one).find(c=>c.text.startsWith('ATK'));
  assert.equal(atk.comparison_eligible,false);assert.ok(atk.effect.needs_review_reasons.includes('special_mechanic'));
  assert.equal(atk.effect.parent_effect_name,null);assert.equal(atk.effect.max_raw_value,null);
  const two=parseSkillHierarchy(snapshots.find(s=>s.character_name==='E.H.'&&s.skill_slot==='Skill 2'));
  const fifth=children(two).find(c=>c.effect.effect_index===5);
  assert.equal(fifth.effect.trigger,'Activates when obtaining Scraps');assert.equal(fifth.effect.target_type,'self');
  assert.equal(fifth.comparison_eligible,true);assert.equal(fifth.effect.buff_type,'elemental_advantage_damage');
});
test('Nayuta stage thresholds and cumulative relation remain attached to each child',()=>{
  const s=JSON.parse(readFileSync('data/skill-snapshots.json')).find(s=>s.character_name==='Nayuta'&&s.skill_slot==='Skill 2');
  const nodes=children(parseSkillHierarchy(s)).filter(c=>['atk','attack_damage','core_damage'].includes(c.effect.buff_type));
  assert.equal(nodes.length,3);
  for(const [i,c] of nodes.entries()){
    assert.match(c.effect.condition,new RegExp(`Stage ${i+1}: If Memory Absorption is at ${[2,10,30][i]} or more stacks`));
    assert.match(c.effect.parent_effect_description,/Each subsequent effect triggers all effects before it/);
    assert.equal(c.effect.stack_count,null);assert.equal(c.comparison_eligible,true);
  }
});
test('2B cumulative Max HP tiers are not combined into a fabricated value',()=>{
  const s=JSON.parse(readFileSync('data/skill-snapshots.json')).find(s=>s.character_name==='2B'&&s.skill_slot==='Skill 1');
  const nodes=children(parseSkillHierarchy(s));assert.deepEqual(nodes.map(c=>c.effect.value),[10.03,20.06,57.76]);
  assert.ok(nodes.every(c=>c.comparison_eligible&&c.effect.condition.includes('Each subsequent')));
});
test('weapon damage is not a buff; additional ATK inherits deactivation',()=>{
  const s=JSON.parse(readFileSync('data/skill-snapshots.json')).find(s=>s.character_name==='E.H.'&&s.skill_slot==='Burst');
  const nodes=children(parseSkillHierarchy(s)),buffs=nodes.filter(c=>c.comparison_eligible);
  assert.deepEqual(buffs.map(c=>c.effect.value),[430.05]);
  assert.match(buffs[0].effect.end_condition,/all rounds have been fired/);
  assert.equal(nodes.find(c=>c.text.startsWith('Damage:')).effect.effect_type,'weapon_state');
});
test('reviewed categories are registered while unreviewed labels stay aggregated',()=>{
  const h=fixture(`■ Affects self.
Effect 1: Attack Speed ▲ 10% for 5 sec.
Effect 2: Attack Speed ▲ 20% for 5 sec.
■ Affects all enemies.
Deals 12% of final ATK as distributed damage.`);
  const report=aggregateUnknownCandidates([h]);assert.equal(report.find(r=>r.label==='Attack Speed'),undefined);
  assert.equal(report.find(r=>r.label==='Distributed Damage'),undefined);
  assert.deepEqual(children(h).map(c=>[c.effect.effect_type,c.effect.buff_type,c.comparison_eligible]),[
    ['buff','attack_speed',true],['buff','attack_speed',true],['damage',undefined,false]
  ]);
});
test('all 111 human-reviewed Unknown Buff Type labels have an exact rule',()=>{
  assert.equal(reviewedUnknownLabels().length,111);
  assert.equal(new Set(reviewedUnknownLabels().map(x=>x.toLowerCase())).size,111);
});
test('the final 12 labels resolve to comparison buffs, resources, or special mechanics without guesses',()=>{
  const snapshots=JSON.parse(readFileSync('data/skill-snapshots.json')),hierarchies=snapshots.map(parseSkillHierarchy);
  const nodes=hierarchies.flatMap(h=>h.sections.flatMap(s=>s.groups.flatMap(g=>g.children)));
  assert.deepEqual(aggregateUnknownCandidates(hierarchies),[]);
  const normal=nodes.filter(c=>c.effect.raw_label==='Normal Attack Damage Multiplier');
  assert.equal(normal.length,5);assert.ok(normal.every(c=>c.comparison_eligible&&c.effect.buff_type==='normal_attack_damage_multiplier'&&c.effect.value_unit==='percent'));
  const immunity=nodes.filter(c=>['debuff immunity to ∞ debuffs','immunity to Decrease Charge Speed effects','Immunity to Embarrassment','immunity to Noise Pollution','immunity to Proof of Violation','immunity to Stun'].includes(c.effect.raw_label));
  assert.equal(immunity.length,6);assert.ok(immunity.every(c=>c.comparison_eligible&&c.effect.buff_type==='debuff_immunity'&&c.effect.value===true));
  assert.deepEqual(new Set(immunity.map(c=>c.effect.immunity_count)),new Set(['infinity','unlimited']));
  const resources=nodes.filter(c=>['Number of ghosts','Ticket count'].includes(c.effect.raw_label));
  assert.equal(resources.length,3);assert.ok(resources.every(c=>!c.comparison_eligible&&c.effect.effect_type==='resource'));
  assert.deepEqual(new Set(resources.map(c=>c.effect.resource_type)),new Set(['ghosts','ticket']));
  const specials=nodes.filter(c=>(c.effect.state_system==='assigned_part'||c.effect.state_name==='Sakura Petals')&&c.effect.reviewed_classification);
  assert.equal(specials.length,3);assert.ok(specials.every(c=>!c.comparison_eligible&&c.effect.effect_type==='special_mechanic'));
  assert.deepEqual(specials.filter(c=>c.effect.state_system==='assigned_part').map(c=>[c.effect.from_state,c.effect.to_state]),[['dancing','singing'],[null,'dancing']]);
});
test('Alice Wonderland Bunny Carrot Party keeps its named parent and stack raw value',()=>{
  const s=JSON.parse(readFileSync('data/skill-snapshots.json')).find(s=>s.character_name==='Alice: Wonderland Bunny'&&s.skill_slot==='Skill 1');
  const carrot=children(parseSkillHierarchy(s)).find(c=>c.effect.buff_type==='interruption_parts_damage');
  assert.deepEqual([carrot.effect.parent_effect_name,carrot.effect.value,carrot.effect.stack_count,carrot.effect.max_raw_value,carrot.effect.target_type,carrot.comparison_eligible],
    ['Carrot Party',2,5,10,'all_allies',true]);
});
test('Arcana The Magician targets Skill 2 without turning the cooldown into a generic burst cooldown',()=>{
  const s=JSON.parse(readFileSync('data/skill-snapshots.json')).find(s=>s.character_name==='Arcana'&&s.text.includes('The Magician'));
  const magician=children(parseSkillHierarchy(s)).find(c=>c.effect.buff_type==='skill_cooldown');
  assert.deepEqual([magician.effect.parent_effect_name,magician.effect.value,magician.effect.value_unit,magician.effect.target_skill_slot,magician.effect.target_type,magician.comparison_eligible],
    ['The Magician',75,'percent',2,'selected_allies',true]);
});
test('Aigis Matarukaja and Marakukaja remain caster-stat-based and inherit Full Burst end',()=>{
  const s=JSON.parse(readFileSync('data/skill-snapshots.json')).find(s=>s.character_name==='Aigis'&&s.skill_slot==='Skill 2');
  const rows=children(parseSkillHierarchy(s)).filter(c=>c.comparison_eligible);
  assert.deepEqual(rows.map(c=>[c.effect.parent_effect_name,c.effect.buff_type,c.effect.value_unit,c.effect.end_condition]),[
    ['Matarukaja','caster_atk_based_atk','caster_atk_percent','When Full Burst ends.'],
    ['Marakukaja','caster_def_based_def','caster_def_percent','When Full Burst ends.']
  ]);
});
test('Battery is preserved as a resource effect and excluded from buff comparison',()=>{
  const s=JSON.parse(readFileSync('data/skill-snapshots.json')).find(s=>s.character_name==='Ark Ranger Black'&&s.skill_slot==='Skill 1');
  const battery=children(parseSkillHierarchy(s)).find(c=>/^Effect 1: Battery/.test(c.source_line));
  assert.deepEqual([battery.effect.effect_type,battery.effect.resource_type,battery.effect.value,battery.effect.value_unit,battery.comparison_eligible],
    ['resource','battery',1,'percent',false]);
});
test('Alice Wonderland Bunny structures reload, stack increment, and Burst 1 re-entry on separate axes',()=>{
  const s1=children(parsedSkill('Alice: Wonderland Bunny','Skill 1')).find(c=>c.effect.buff_type==='stackable_buff_stack_increase');
  const s2=children(parsedSkill('Alice: Wonderland Bunny','Skill 2')).find(c=>c.effect.buff_type==='reload_ratio');
  const burst=children(parsedSkill('Alice: Wonderland Bunny','Burst')).find(c=>c.effect.buff_type==='burst_stage_reentry');
  assert.deepEqual([s1.effect.effect_type,s1.effect.modifier_type,s1.effect.value,s1.effect.value_unit],['buff','add_stack',1,'count']);
  assert.deepEqual([s2.effect.value,s2.effect.value_unit,s2.effect.modifier_type],[40,'percent','restore']);
  assert.deepEqual([burst.effect.value,burst.effect.value_unit,burst.effect.target_burst_stage,burst.effect.modifier_type],[true,'boolean',1,'reentry']);
});
test('Anne and Dorothy structure incoming healing, revive, round durations, Pierce, range, and fixed pellets',()=>{
  const anne=[...children(parsedSkill('Anne: Miracle Fairy','Skill 2')),...children(parsedSkill('Anne: Miracle Fairy','Burst'))];
  assert.ok(anne.some(c=>c.effect.buff_type==='incoming_healing'&&c.effect.value===23.46));
  const revive=anne.find(c=>c.effect.effect_type==='revive');assert.deepEqual([revive.effect.buff_type,revive.effect.revive_hp_percent,revive.effect.activation_limit],["revive",99,1]);
  const dorothy=children(parsedSkill('Dorothy: Serendipity','Skill 1'));
  assert.ok(dorothy.some(c=>c.effect.buff_type==='pierce'&&c.effect.modifier_type==='grant'&&c.effect.duration_unit==='rounds'));
  assert.ok(dorothy.some(c=>c.effect.buff_type==='pierce_range'&&c.effect.value===200&&c.effect.duration_value===3));
  assert.ok(dorothy.some(c=>c.effect.buff_type==='pellet_count'&&c.effect.modifier_type==='set'&&c.effect.value===1));
});
test('Rapi Red Hood Burst branches are section conditions and Skill 2 requirement is a non-ranking special mechanic',()=>{
  const nodes=children(parsedSkill('Rapi: Red Hood','Burst'));
  const stages=new Set(nodes.map(c=>c.effect.section_condition?.burst_stage).filter(Boolean));assert.deepEqual(stages,new Set([1,3]));
  assert.ok(nodes.every(c=>![1,3].includes(c.effect.value)||c.effect.buff_type));
  const req=nodes.find(c=>c.effect.special_type==='skill_requirement_modifier');
  assert.deepEqual([req.effect.effect_type,req.effect.modifier_type,req.effect.target_skill_slot,req.effect.value,req.effect.duration_unit,req.comparison_eligible],
    ['special_mechanic','reduce_requirement',2,60,'seconds',false]);
});
test('reload ratio, Attack Speed, and stacked Burst cooldown retain distinct raw semantics',()=>{
  const reload=children(parsedSkill('Scarlet: Black Shadow','Skill 2')).find(c=>c.effect.buff_type==='reload_ratio');
  assert.deepEqual([reload.effect.value,reload.effect.value_unit,reload.effect.notes],[100,'percent','of the magazine(s)']);
  const speed=children(parsedSkill('Soline','Skill 1')).find(c=>c.effect.buff_type==='attack_speed');assert.deepEqual([speed.effect.value,speed.effect.duration_value],[7.26,3]);
  const cdr=children(parsedSkill('Tia','Skill 1')).find(c=>c.effect.buff_type==='burst_cooldown_reduction');
  assert.deepEqual([cdr.effect.value,cdr.effect.stack_count,cdr.effect.max_raw_value,cdr.effect.duration_value],[13,2,26,12]);
});
test('caster Max HP max-HP buffs, instant/periodic heals, and revive stay separated',()=>{
  const ade=children(parsedSkill('Ade','Skill 2')).find(c=>c.effect.buff_type==='caster_max_hp_based_max_hp');
  assert.deepEqual([ade.effect.value,ade.effect.value_unit,ade.effect.notes],[15.62,'caster_max_hp_percent','without restoring HP']);
  const periodic=children(parsedSkill('Anchor: Innocent Maid','Skill 1')).find(c=>c.effect.buff_type==='caster_max_hp_based_heal');
  assert.deepEqual([periodic.effect.effect_type,periodic.effect.heal_type,periodic.effect.tick_interval,periodic.effect.duration_value],['heal','periodic',1,8]);
  const instant=children(parsedSkill('Anis: Star','Skill 2')).find(c=>c.effect.buff_type==='caster_max_hp_based_heal');
  assert.deepEqual([instant.effect.value,instant.effect.heal_type],[1.26,'instant']);
});
test('named-stack scaling and character resources do not become ordinary stack multipliers',()=>{
  const arcana=children(parsedSkill('Arcana: Fortune Mate','Skill 1')).find(c=>c.effect.scaling_type==='multiply_by_named_stack');
  assert.deepEqual([arcana.effect.buff_type,arcana.effect.value,arcana.effect.stack_count,arcana.effect.max_raw_value,arcana.effect.scaling_source_effect],
    ['caster_atk_based_atk',13,null,null,'Precious Moments']);
  const battery=children(parsedSkill('Ark Ranger Black','Skill 1')).find(c=>c.effect.resource_type==='battery'&&c.effect.value===50);
  assert.deepEqual([battery.effect.effect_type,battery.effect.modifier_type,battery.effect.resource_cap,battery.comparison_eligible],['resource','increase',100,false]);
  const extrasensory=children(parsedSkill('Chisato','Skill 1')).find(c=>c.effect.resource_type==='extrasensory');
  assert.deepEqual([extrasensory.effect.modifier_type,extrasensory.effect.value,extrasensory.effect.resource_cap,extrasensory.effect.duration_unit],['set',100,100,'continuous']);
});
test('Maxwell staged charge times stay under weapon state with Overcurrent conditions',()=>{
  const rows=children(parsedSkill('Maxwell: Ordinary Mechanic','Burst')).filter(c=>c.effect.buff_type==='charge_time'&&c.effect.scaling_condition);
  assert.deepEqual(rows.map(c=>[c.effect.value,c.effect.scaling_condition,c.effect.effect_type]),[
    [3,'Overcurrent stage <= 1','weapon_state'],[2.5,'Overcurrent stage = 2','weapon_state'],[2,'Overcurrent stage = 3','weapon_state'],
    [1.5,'Overcurrent stage = 4','weapon_state'],[0.4,'Overcurrent stage >= 5','weapon_state']
  ]);
});
test('positive audit contains only positive prose without any recognized effect structure',()=>{
  const known=fixture(`■ Affects self.
Effect 1: Charges Battery by 10%, up to 100%.
Effect 2: Forced Reload.
Effect 3: Blanching Duration ▲ 2 sec.`);
  assert.deepEqual(aggregateUnrecognizedPositiveCandidates([known]),[]);
  const unknown=fixture('■ Affects self.\nEffect 1: Mystery Capability ▲ 10% for 5 sec.');
  assert.equal(aggregateUnrecognizedPositiveCandidates([unknown]).length,1);
});
test('Burst re-entry and normal-attack true damage grants remain boolean, while direct damage remains excluded',()=>{
  const chime=children(parsedSkill('Chime','Burst')).find(c=>c.effect.buff_type==='burst_stage_reentry');assert.equal(chime.effect.target_burst_stage,2);
  const grant=children(parsedSkill('Chisato','Skill 2')).find(c=>c.effect.buff_type==='normal_attack_true_damage');
  assert.deepEqual([grant.effect.value,grant.effect.value_unit,grant.effect.duration_value],[true,'boolean',10]);
  const damage=children(parsedSkill('Cinderella','Burst')).find(c=>c.text.startsWith('Deals 1365.92%'));
  assert.deepEqual([damage.effect.effect_type,damage.effect.damage_multiplier,damage.effect.attack_count,damage.effect.attack_pattern,damage.comparison_eligible],['damage',1365.92,10,'sequential',false]);
});
test('Claire compound benefits and Avistar periodic heal/state removal are independently structured',()=>{
  const claire=children(parsedSkill('Claire','Burst'));
  assert.ok(claire.some(c=>c.effect.effect_type==='heal'&&c.effect.buff_type==='caster_max_hp_based_heal'&&c.effect.value===34.35));
  assert.ok(claire.some(c=>c.effect.buff_type==='debuff_cleanse'&&c.effect.modifier_type==='remove'&&c.effect.value===1));
  const avistar=children(parsedSkill('Avistar','Skill 1'));
  assert.ok(avistar.some(c=>c.effect.buff_type==='caster_max_hp_based_heal'&&c.effect.heal_type==='periodic'&&c.effect.duration_value===10));
  assert.ok(avistar.some(c=>c.effect.special_type==='state_remove'&&c.effect.state_name==='Stargazer'&&c.comparison_eligible===false));
});
test('multiple beneficial sentences on one source line become independent child effects',()=>{
  const h=fixture('■ Affects all allies. Restores 34.35% of the skill user\'s final max HP. Removes 1 debuff(s).');
  assert.deepEqual(children(h).map(c=>[c.effect.effect_type,c.effect.buff_type,c.effect.value,c.effect.target_type]),[
    ['heal','caster_max_hp_based_heal',34.35,'all_allies'],['buff','debuff_cleanse',1,'all_allies']
  ]);
});
test('unresolved Function conditions fail closed rather than inventing duration',()=>{
  const h=fixture(`■ Affects self.
State X
Function: Copies an ally buff only if a secret condition is met.
Effect 1: ATK ▲ 10%.`);
  const c=children(h)[0];assert.equal(c.comparison_eligible,false);assert.match(c.effect.function_text,/secret condition/);
  assert.ok(c.effect.needs_review_reasons.includes('special_mechanic'));
});
test('multiline Function text and conditional lifetime survive line wrapping',()=>{
  const h=fixture(A2_MODE_B.text.replace('Speed. Mode B','Speed.\nMode B'));
  const buffs=children(h).filter(c=>c.comparison_eligible);assert.equal(buffs.length,2);
  assert.ok(buffs.every(c=>c.effect.end_condition==='HP <= 40%'&&c.effect.function_text.includes('\nMode B')));
});
test('standalone named buff does not become the parent of an unrelated following effect',()=>{
  const h=fixture('■ Affects self.\nNamed Stack: ATK ▲ 10% for 5 sec.\nFills Burst Gauge by 20%.');
  const nodes=children(h);assert.equal(nodes[0].effect.parent_effect_name,'Named Stack');assert.equal(nodes[1].effect.parent_effect_name,null);
  assert.equal(nodes[1].effect.buff_type,'burst_gauge_fill');assert.equal(nodes[1].comparison_eligible,true);
});
test('explicit stage and attack-count prose remains attached across named effects',()=>{
  const snapshots=JSON.parse(readFileSync('data/skill-snapshots.json'));
  for(const name of ['Grave','Arcana: Fortune Mate']){
    const s=snapshots.find(s=>s.character_name===name&&s.skill_slot==='Skill 2'),h=parseSkillHierarchy(s);
    const buffs=children(h).filter(c=>c.comparison_eligible);
    for(const c of buffs.filter(c=>c.effect.parent_effect_name&&c.effect.buff_type!=='pellet_count'&&/Effects? var(?:y|ies)/.test(c.effect.condition))){
      assert.match(c.effect.condition,/Effects? var(?:y|ies)/);
      assert.match(c.effect.condition,name==='Grave'?/attacks landed: While/:/Six times:/);
    }
  }
});
function a2Extract(text=A2_MODE_B.text){
  return extractCharacter({skills:[{id:18113,name:'Mode B',skill_slot:'Burst',cooldown:40,description:text,levels:Array(10).fill({}),
    source_checked_at:A2_MODE_B.source_checked_at}]},{character_id:'nikke-811',character_name:'A2',nikke_gg_url:A2_MODE_B.source_url});
}
test('production extraction publishes only A2 buffs and archives the cost with its mode',()=>{
  const out=a2Extract();assert.deepEqual(out.effects.map(e=>[e.buff_type,e.value]),[['atk',15.19],['charge_speed',35.88]]);
  assert.equal(out.reviews.length,0);assert.equal(out.nonBuffEffects.length,1);assert.equal(out.nonBuffEffects[0].parent_effect_name,'Mode B');
  assert.equal(out.nonBuffEffects[0].effect_type,'penalty');assert.ok(out.effects.every(e=>e.source_skill_text===A2_MODE_B.text));
});
test('unknown sibling does not hide known mode buffs, and Review candidates retain their parents',()=>{
  const text=A2_MODE_B.text+'\nEffect 4: Mystery Power ▲ 10% for 5 sec.',out=a2Extract(text);
  assert.equal(out.effects.length,2);assert.equal(out.reviews.length,1);
  const r=classifyReview(out.reviews[0],{},out.snapshots[0]);assert.ok(r.needs_review_reasons.includes('unknown_buff_type'));
  assert.equal(r.candidate_effects.length,2);assert.ok(r.candidate_effects.every(e=>e.parent_effect_name==='Mode B'));
  assert.equal(r.parser_candidates.find(c=>c.source_line.startsWith('Effect 4')).hierarchy.end_condition,'HP <= 40%');
});
test('manual review preserves hierarchy metadata after reparse, source change, and parser review resolution',()=>{
  const text=A2_MODE_B.text+'\nEffect 4: Mystery Power ▲ 10% for 5 sec.';
  const base=(source=text)=>{const e=a2Extract(source);return {characters:[{character_id:'nikke-811',character_name:'A2',review_fields:[],release_date:null}],effects:e.effects,'review-queue':e.reviews,'skill-snapshots':e.snapshots,'collection-report':{}};};
  const initial=applyReviewWorkflow(base()),r=initial['review-items'][0];
  const store=createDecision(emptyReviewStore(),initial['review-items'],{action:'approve',base_revision:0,review_keys:[r.review_key],reviewed_by:'regression-fixture',review_note:'Mode B checked',confirmed:true},()=>[]);
  const out=applyReviewWorkflow(base(A2_MODE_B.text.replace('15.19%','20%')),store);
  assert.deepEqual(out.effects.map(e=>e.value),[15.19,35.88]);
  assert.ok(out.effects.every(e=>e.manual_override&&e.parent_effect_name==='Mode B'&&e.parent_end_condition==='HP <= 40%'&&e.function_text));
  assert.equal(out['review-items'][0].source_changed_since_review,true);
});

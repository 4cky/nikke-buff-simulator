import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {FINAL_REVIEW_POLICIES,IDOLL_REVIEW_KEY,SOURCE_LIMITATIONS} from '../../scripts/final-review-grammar.mjs';
import {TYPE,UNIT_NOTE} from '../../view-model.js';

const read=async name=>JSON.parse(await readFile(new URL(`../../data/${name}.json`,import.meta.url),'utf8'));
const effects=await read('effects'),queue=await read('review-queue'),report=await read('final-review-resolution-report');
const one=(name,type)=>effects.find(e=>e.character_name===name&&e.buff_type===type&&e.effect_id.startsWith('final-review:'));
const many=(name)=>effects.filter(e=>e.character_name===name&&e.effect_id.startsWith('final-review:'));

test('final policy covers exactly 16 resolved sections plus iDoll Sun',()=>{
  assert.equal(Object.keys(FINAL_REVIEW_POLICIES).length,16);assert.equal(IDOLL_REVIEW_KEY,'nikke-308:Skill 2:section-0');
  assert.deepEqual(SOURCE_LIMITATIONS,['trigger_not_stated','target_not_stated','duration_not_stated','end_condition_not_fully_stated']);
});
test('Anis keeps two selected effects and only source trigger limitation',()=>{
  const xs=many('Anis');assert.deepEqual(xs.map(x=>x.buff_type).sort(),['damage_share','def']);
  assert.ok(xs.every(x=>x.target_count===2&&x.target_selection==='highest_final_atk'&&x.include_self&&x.exclude_caster_from_selection&&x.trigger===null));
});
test('Anne incoming healing is not fabricated as Instant',()=>{
  const e=one('Anne: Miracle Fairy','incoming_healing');assert.equal(e.value,23.46);assert.equal(e.target_type,'all_allies');assert.equal(e.duration,null);assert.deepEqual(e.source_limitations,['duration_not_stated']);
});
test('Yulha publishes ATK and damage share without inventing trigger',()=>{
  const xs=many('Yulha');assert.deepEqual(xs.map(x=>x.buff_type).sort(),['atk','damage_share']);assert.ok(xs.every(x=>x.trigger===null&&x.target_type==='all_allies'));
});
test('Rosanna Chic Ocean keeps parts damage raw value and fixed duration',()=>{
  const e=one('Rosanna: Chic Ocean','parts_damage');assert.equal(e.value,24.26);assert.equal(e.duration_value,15);assert.deepEqual(e.source_limitations,['trigger_not_stated']);
});
test('Sakura Bloom retains Dancing Flower parent',()=>{
  const e=one('Sakura: Bloom in Summer','attack_damage');assert.equal(e.parent_effect_name,'Dancing Flower');assert.equal(e.target_type,'self');assert.equal(e.value,15.64);
});
test('Poli selection axes distinguish caster from two lowest-HP allies',()=>{
  const xs=many('Poli');assert.equal(xs.length,2);assert.ok(xs.every(e=>e.include_self&&e.target_count===2&&e.target_selection==='lowest_remaining_hp'&&e.exclude_caster_from_selection));
});
test('Soldier OW records three highest-final-ATK allies',()=>{
  const e=one('Soldier OW','cover_def');assert.equal(e.value,128.57);assert.equal(e.target_count,3);assert.equal(e.target_selection,'highest_final_atk');
});
test('iDoll Sun alone remains review with explicit chance and unknown target',()=>{
  assert.equal(queue.length,1);const r=queue[0],h=r.parser_candidates[0].hierarchy;assert.equal(r.review_key,IDOLL_REVIEW_KEY);assert.deepEqual(r.source_limitations,['target_not_stated']);
  assert.equal(h.trigger,'when_attacked');assert.equal(h.activation_chance,20);assert.equal(h.target,null);assert.equal(h.target_type,null);
});
test('Helm interruption parts damage is permanent and source-limited only by trigger',()=>{
  const e=one('Helm','interruption_parts_damage');assert.equal(e.value,3.08);assert.equal(e.duration_unit,'permanent');assert.deepEqual(e.source_limitations,['trigger_not_stated']);
});
test('Guilty uses reference ATK and raw stack multiplication',()=>{
  const e=one('Guilty','reference_atk_based_atk');assert.equal(e.value_unit,'reference_atk_percent');assert.equal(e.reference_stat,'atk');assert.equal(e.reference_target_selection,'highest_atk');assert.equal(e.stack_count,5);assert.equal(e.max_raw_value,44.05);
});
test('Sin uses ally reference max HP rather than caster max HP',()=>{
  const e=one('Sin','reference_max_hp_based_max_hp');assert.equal(e.value,15.03);assert.equal(e.reference_target_type,'ally');assert.equal(e.reference_target_selection,'highest_max_hp');
});
test('Quency retains broad Nikke reference target',()=>{
  const e=one('Quency','reference_max_hp_based_max_hp');assert.equal(e.value,12.42);assert.equal(e.reference_target_type,'nikke');assert.equal(e.duration_value,10);
});
test('Trina applies both raw effects to all matching Electric AR allies',()=>{
  const xs=many('Trina');assert.deepEqual(xs.map(e=>e.buff_type).sort(),['hit_rate','max_ammo']);assert.ok(xs.every(e=>e.target_element==='electric'&&e.target_weapon==='assault_rifle'&&e.target_scope==='all_matching_allies'&&e.trigger===null));
});
test('Grave preserves incomplete end condition instead of guessing it',()=>{
  const e=one('Grave','reload_ratio');assert.equal(e.modifier_type,'decrease');assert.equal(e.duration_unit,'until_condition');assert.equal(e.end_condition,null);assert.equal(e.end_condition_raw,'under certain conditions');
});
test('Centi shared shield targets beneficiaries and keeps caster final max HP basis',()=>{
  const e=one('Centi','shared_shield');assert.equal(e.target_type,'all_allies');assert.equal(e.value_unit,'caster_final_max_hp_percent');assert.equal(e.scaling_source,'caster_final_max_hp');assert.equal(e.shield_scope,'shared');
});
test('Lily has one random ally target and caster ATK basis',()=>{
  const e=one('Lily','caster_atk_based_atk');assert.equal(e.target_count,1);assert.equal(e.target_selection,'random');assert.equal(e.value,20);assert.equal(e.duration_value,5);
});
test('Takina all-allies true damage remains a comparison buff',()=>{
  const e=one('Takina','true_damage');assert.equal(e.value,140.49);assert.equal(e.target_type,'all_allies');assert.equal(e.comparison_excluded,false);assert.equal(e.trigger,null);
});
test('final report, translations and secondary-source audit are complete',()=>{
  assert.deepEqual([report.reviewed_sections,report.resolved_sections,report.unresolved_sections],[17,16,1]);assert.equal(report.secondary_source.checked_sections,17);assert.equal(report.secondary_source.supplemented_sections,0);
  assert.deepEqual([report.before.needs_review,report.after.needs_review,report.before.effects_total,report.after.effects_total],[17,1,971,991]);
  assert.equal(TYPE.reference_atk_based_atk,'参照キャラ基準 攻撃力');assert.equal(TYPE.shared_shield,'共有シールド');assert.ok(UNIT_NOTE.reference_max_hp_percent);
});

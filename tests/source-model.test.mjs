import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {levelTen,normalizeCharacter,parseEffectLine,extractCharacter} from '../scripts/source-model.mjs';
const skill=(description)=>({id:123,name:'Sample',description,levels:Array.from({length:10},(_,i)=>({v:String(i+1)})),cooldown:20});
const src={id:'1',name:'Sample',slug:'sample',visible:1,manufacturer:'Tetra',burst:'3',element:'Fire',weapon:'SR',class:'Attacker',rarity:'SSR',skills:[]};
test('Lv.10 placeholders use exactly index 9; missing level or variable fails closed',()=>{
  assert.equal(levelTen(skill('ATK ▲ {v}%.')).text,'ATK ▲ 10%.');
  assert.equal(levelTen(skill('ATK ▲ {missing}%.')),null);
  assert.equal(levelTen({...skill('ATK ▲ 5%.'),levels:[{}]}),null);
});
test('source IDs and update timestamps never become release dates or release order',()=>{
  const c=normalizeCharacter({...src,date_updated:'1787751491'});
  assert.equal(c.release_date,null);assert.equal(c.release_order,null);assert.equal(c.limited,null);assert.ok(c.needs_review);
});
test('special burst stages require explicit skill declarations',()=>{
  assert.deepEqual(normalizeCharacter({...src,burst:'p'}).burst_stage,[]);
  assert.deepEqual(normalizeCharacter({...src,burst:'p',skills:[skill('When used in Burst Stage 1: X\nWhen used in Burst Stage 3: Y')]}).burst_stage,[1,3]);
});
test('ATK, caster ATK and Attack Damage are separate exact grammar matches',()=>{
  const a=parseEffectLine('ATK ▲ 55.12% for 10 sec.');
  const b=parseEffectLine("ATK ▲ 64.51% of the skill user's ATK for 15 sec.");
  const c=parseEffectLine('Attack Damage ▲ 36.24% for 15 sec.');
  assert.deepEqual([a.buff_type,b.buff_type,c.buff_type],['atk','caster_atk_based_atk','attack_damage']);
  assert.equal(b.value_unit,'caster_atk_percent');
});
test('stack parser only multiplies the explicit raw value and count',()=>{
  const r=parseEffectLine('Charge Speed ▲ 3.81%. Stacks up to 10 times and lasts for 5 sec.');
  assert.equal(r.value,3.81);assert.equal(r.stack_count,10);assert.equal(r.max_raw_value,38.1);assert.equal(r.duration,'5 sec');
});
test('CDR seconds stay positive Raw Values; detrimental changes and unknown bases go to review',()=>{
  assert.equal(parseEffectLine('Cooldown of Burst Skill ▼ 7 sec.').value,7);
  for(const s of ['ATK ▼ 15% for 10 sec.','Damage Taken ▲ 10% for 5 sec.','ATK ▲ 5% of the enemy ATK for 10 sec.','Charge Damage ▲ 240% of the excess speed.','ATK ▲ 5% for 10 sec. If shield is active.'])assert.equal(parseEffectLine(s),null,s);
});
test('simple ally effects preserve complete condition and source',()=>{
  const source={...src,skills:[skill('■ Activates when HP is above 80%. Affects all allies.\n<color=#00AEFF>ATK ▲ {v}% for 10 sec.</color>')]};
  const out=extractCharacter(source,normalizeCharacter(source));assert.equal(out.effects.length,1);
  assert.equal(out.effects[0].target_type,'all_allies');assert.match(out.effects[0].condition,/80%/);assert.match(out.effects[0].source_text,/10%/);
});
test('tiered prose stays in review while explicit Burst Stage becomes a section condition',()=>{
  let text='■ Activates when Full Burst starts. Affects all allies.\n<color=#00AEFF>Once: ATK ▲ 10% for 5 sec.</color>';
  let source={...src,skills:[skill(text)]},out=extractCharacter(source,normalizeCharacter(source));assert.equal(out.effects.length,0);assert.equal(out.reviews.length,1);
  text='When used in Burst Stage 1: Test\n■ Activates when entering Burst Stage 1. Affects all allies.\n<color=#00AEFF>ATK ▲ 10% for 5 sec.</color>';
  source={...src,skills:[skill(text)]};out=extractCharacter(source,normalizeCharacter(source));assert.equal(out.effects.length,1);assert.deepEqual(out.effects[0].section_condition,{burst_stage:1});
});
test('weapon targets are not misclassified as selected allies',()=>{
  const source={...src,skills:[skill('■ Activates when Full Burst starts. Affects all allies with sniper rifles.\n<color=#00AEFF>Pierce Damage ▲ 13.55% for 10 sec.</color>')]};
  const out=extractCharacter(source,normalizeCharacter(source));assert.equal(out.effects[0].target_type,'weapon');
});


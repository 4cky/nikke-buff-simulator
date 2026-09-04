import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {TYPE, filterRecords, summarizeRows, characterGroups, relationSummary, formatRaw, comparisonStatus, comparisonGroups} from '../view-model.js';

const data = JSON.parse(readFileSync(new URL('../data/buffs.json',import.meta.url),'utf8'));
const character = name => data.filter(r => r.character_name === name);

test('summary contains only owned categories, with every input effect retained', () => {
  for (const [name, effects] of characterGroups(data)) {
    const rows = summarizeRows(effects);
    assert.ok(rows.length > 0, name);
    assert.deepEqual(new Set(rows.map(r => r.type)), new Set(effects.map(r => r.buff_type)));
    assert.equal(rows.reduce((sum,r) => sum + r.effects.length,0),effects.length);
    assert.ok(rows.length < 12, name + ' stays compact for the current fixtures');
  }
  assert.ok(!summarizeRows(character('Alice')).some(r => r.type === 'caster_atk_based_atk'));
});

test('Crown Attack Damage shows maximum raw value and both independent sources', () => {
  const row = summarizeRows(character('Crown')).find(r => r.type === 'attack_damage');
  assert.equal(row.top.value,36.24);
  assert.equal(row.effects.length,2);
  assert.deepEqual(new Set(row.effects.map(r => r.skill_slot)),new Set(['Skill 2','Burst']));
  assert.equal(formatRaw(row.top),'36.24%');
});

test('Alice Charge Speed is split into SELF and ALLY without merging', () => {
  const rows = summarizeRows(character('Alice')).filter(r => r.type === 'charge_speed');
  assert.deepEqual(rows.map(r => [r.relation,r.top.value]),[['self',80.15],['allies',11.67]]);
});

test('all-allies buffs never become SELF and the card scope is derived from data', () => {
  const naga = character('Naga');
  assert.equal(relationSummary(naga),'ALLY');
  assert.equal(filterRecords(naga,{mode:'self'}).length,0);
  assert.equal(filterRecords(naga,{mode:'allies'}).length,naga.length);
  assert.equal(relationSummary(character('Alice')),'SELF + ALLY');
});

test('incoming healing and direct HP recovery remain independent categories', () => {
  const recovery=[
    {...data[0],effect_id:'recovery-a',buff_type:'incoming_healing',value:4.06,value_unit:'percent'},
    {...data[0],effect_id:'recovery-b',buff_type:'hp_recovery',value:5.23,value_unit:'caster_max_hp_percent'}
  ];
  const rows = summarizeRows(recovery);
  assert.equal(rows.length,2);
  assert.deepEqual(new Set(rows.map(r => r.type)),new Set(['incoming_healing','hp_recovery']));
  assert.deepEqual(new Set(rows.map(r => r.top.value)),new Set([4.06,5.23]));
});

test('stack details retain per-stack and maximum raw values without effective math', () => {
  const rows = summarizeRows(filterRecords(data,{query:'red hood',stack:'only'}));
  assert.equal(rows.length,1);
  const r = rows[0].top;
  assert.equal(formatRaw(r),'3.81%');
  assert.equal(r.stack_count,10);
  assert.equal(formatRaw(r,r.max_raw_value),'38.1%');
});

test('filters compose for name, target, slot, condition and stack', () => {
  const found = filterRecords(data,{query:'  D: KILLER WIFE ',mode:'allies',target:'weapon',slot:'Skill 1',condition:'only',stack:'exclude'});
  assert.equal(found.length,1);
  assert.equal(found[0].buff_type,'pierce_damage');
  assert.ok(filterRecords(data,{condition:'exclude'}).every(r => !r.condition));
  assert.ok(filterRecords(data,{stack:'exclude'}).every(r => !r.stack_count));
  assert.equal(filterRecords(data,{query:'not a character'}).length,0);
  assert.equal(filterRecords(data).length,data.length);
});

test('numeric sorting compares selected categories, not unrelated buff maxima', () => {
  const type = 'caster_atk_based_atk';
  const selected = filterRecords(data,{type,mode:'allies'});
  assert.deepEqual(characterGroups(selected,'value-desc',type).map(([name]) => name),['Red Hood','Crown','Naga','D: Killer Wife']);
  assert.deepEqual(characterGroups(selected,'value-asc',type).map(([name]) => name),['D: Killer Wife','Naga','Crown','Red Hood']);
  assert.deepEqual(characterGroups(data,'value-desc').map(([name]) => name),characterGroups(data,'character').map(([name]) => name));
});

test('unit and boolean display stays meaningful and categories are translated separately', () => {
  assert.equal(formatRaw(data.find(r => r.value_unit === 'seconds' && r.value === 7)),'7 sec');
  assert.equal(formatRaw(data.find(r => r.value_unit === 'boolean')),'あり');
  assert.equal(formatRaw(data.find(r => r.value_unit === 'conversion')),'240%');
  assert.equal(TYPE.atk,'攻撃力');
  assert.equal(TYPE.caster_atk_based_atk,'発動者基準 攻撃力');
  assert.equal(TYPE.attack_damage,'攻撃ダメージ');
});
test('debuff immunity labels and counts are explicit and never numeric ranking values',()=>{
  const base=data[0],rows=summarizeRows([
    {...base,effect_id:'immune-1',buff_type:'debuff_immunity',value:true,value_unit:'boolean',immune_effect:'any_debuff',immunity_count:1},
    {...base,effect_id:'immune-infinite',buff_type:'debuff_immunity',value:true,value_unit:'boolean',immune_effect:'any_debuff',immunity_count:'infinity'},
    {...base,effect_id:'immune-stun',buff_type:'debuff_immunity',value:true,value_unit:'boolean',immune_effect:'stun',immunity_count:'unlimited'}
  ]);
  assert.deepEqual(new Set(rows.map(r=>`${r.label}|${formatRaw(r.top)}`)),new Set(['デバフ免疫|1回','デバフ免疫|無制限','スタン無効|あり']));
});

test('view grouping and sorting do not mutate the dataset', () => {
  const before = JSON.stringify(data);
  summarizeRows(data);
  characterGroups(data,'value-desc','charge_speed');
  assert.equal(JSON.stringify(data),before);
});

test('comparison sorting retains all characters and their other buff categories', () => {
  const groups = comparisonGroups(data,{type:'caster_atk_based_atk'},'value-desc');
  assert.deepEqual(groups.map(([name]) => name),['Red Hood','Crown','Naga','D: Killer Wife','Alice']);
  for (const [name,effects] of groups) assert.equal(effects.length,character(name).length);
  assert.ok(groups.find(([name]) => name === 'Alice')[1].some(r => r.buff_type === 'atk'));
});

test('ascending comparison puts nonholders last without using other buffs as sort values', () => {
  const groups = comparisonGroups(data,{type:'caster_atk_based_atk'},'value-asc');
  assert.deepEqual(groups.map(([name]) => name),['D: Killer Wife','Naga','Crown','Red Hood','Alice']);
  const damage = comparisonGroups(data,{type:'attack_damage'},'value-desc');
  assert.deepEqual(damage.slice(0,2).map(([name]) => name),['Crown','D: Killer Wife']);
});

test('optional holder-only filtering keeps the complete effect list for matching characters', () => {
  const groups = comparisonGroups(data,{type:'core_damage'},'value-desc',true);
  assert.deepEqual(groups.map(([name]) => name),['Naga','D: Killer Wife']);
  assert.equal(groups[0][1].length,character('Naga').length);
  assert.equal(comparisonGroups(data,{},'character',true).length,5);
});

test('comparison ownership respects SELF/ALLY and advanced filters', () => {
  const groups = comparisonGroups(data,{type:'caster_atk_based_atk',mode:'self'},'value-desc',true);
  assert.deepEqual(groups.map(([name]) => name),['Red Hood']);
  assert.ok(groups[0][1].every(r => r.target_type === 'self'));
  assert.ok(groups[0][1].some(r => r.buff_type === 'charge_speed'));
  assert.equal(comparisonGroups(data,{query:'absent'},'character').length,0);
});

test('sort status identifies category and direction in Japanese', () => {
  assert.equal(comparisonStatus('atk','value-desc'),'並び替え中：攻撃力（降順）');
  assert.equal(comparisonStatus('core_damage','value-asc'),'並び替え中：コアダメージ（昇順）');
  assert.equal(comparisonStatus('','value-desc'),'並び替え中：キャラクター名（昇順）');
  assert.equal(comparisonStatus('atk','character'),'並び替え中：攻撃力の所持を優先 → キャラクター名');
});

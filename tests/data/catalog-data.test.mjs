import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {catalogGroups,normalizeState,readQuery,writeQuery,sortStatus,filterChips,MANUFACTURERS,ELEMENTS} from '../../catalog-model.js';
import {validateDataset,validateShape} from '../../scripts/validate-data.mjs';
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),'utf8'));
const characters=read('../../data/characters.json'),effects=read('../../data/effects.json');
const cs=read('../../data/character-schema.json'),es=read('../../data/effect-schema.json');
const names=rows=>rows.map(r=>r.character.character_name);
const c=name=>characters.find(c=>c.character_name===name);

test('catalog and effects validate; every FK matches one canonical English name',()=>{
  assert.deepEqual(validateDataset(characters,effects,cs,es),[]);
  assert.ok(characters.length>190);assert.ok(effects.length>200);
  assert.ok(characters.every(c=>c.source_visible));
});
test('all required metadata filter options are represented',()=>{
  for(const m of MANUFACTURERS)assert.ok(catalogGroups(characters,effects,{manufacturer:m}).length);
  for(const e of Object.keys(ELEMENTS))assert.ok(catalogGroups(characters,effects,{element:e}).length);
});
test('Red Hood matches all three stages; Rapi: Red Hood only I and III',()=>{
  assert.deepEqual(c('Red Hood').burst_stage,[1,2,3]);assert.deepEqual(c('Rapi: Red Hood').burst_stage,[1,3]);
  for(const burst of ['1','2','3'])assert.ok(names(catalogGroups(characters,effects,{burst})).includes('Red Hood'));
  assert.ok(!names(catalogGroups(characters,effects,{burst:'2'})).includes('Rapi: Red Hood'));
});
test('manufacturer + burst + element + scope + buff are AND conditions',()=>{
  const rows=catalogGroups(characters,effects,{manufacturer:'Pilgrim',burst:'2',element:'Iron',mode:'allies',type:'attack_damage'});
  assert.ok(names(rows).includes('Crown'));
  assert.ok(rows.every(r=>r.character.manufacturer==='Pilgrim'&&r.character.burst_stage.includes(2)&&r.character.element==='Iron'));
  assert.ok(rows.every(r=>r.effects.some(e=>e.buff_type==='attack_damage'&&e.target_type!=='self')));
  assert.ok(rows.every(r=>r.effects.every(e=>e.target_type!=='self')));
  assert.ok(rows.find(r=>r.character.character_name==='Crown').effects.some(e=>e.buff_type==='caster_atk_based_atk'));
});
test('ABC orders use English name and are exact reversals',()=>{
  const a=names(catalogGroups(characters,effects,{sort:'name_asc'}));
  const b=names(catalogGroups(characters,effects,{sort:'name_desc'}));
  assert.deepEqual(b,[...a].reverse());assert.equal(a.length,characters.length);
});
test('release sort uses dates; unknown dates are last in both directions',()=>{
  const asc=catalogGroups(characters,effects,{sort:'release_asc'}),desc=catalogGroups(characters,effects,{sort:'release_desc'});
  const known=characters.filter(c=>c.release_date).length;
  for(const rows of [asc,desc])assert.ok(rows.slice(known).every(r=>r.character.release_date===null));
  assert.deepEqual(names(asc.slice(0,known)),names(desc.slice(0,known)).reverse());
  assert.equal(c('Rapi: Red Hood').release_date,'2025-01-01');assert.equal(c('Anis: Sparkling Summer').release_date,null);
  assert.equal(c('Crown').release_date,'2024-04-25');
});
test('same-day ties follow release_order, not array insertion order',()=>{
  const chars=[{...c('Crown'),release_order:2},{...c('Alice'),release_date:'2024-04-25',release_order:1}];
  assert.deepEqual(names(catalogGroups(chars,[],{sort:'release_asc'})),['Alice','Crown']);
  assert.deepEqual(names(catalogGroups(chars,[],{sort:'release_desc'})),['Crown','Alice']);
});
test('selected Raw Value compares only the category in the active scope',()=>{
  const rows=catalogGroups(characters,effects,{type:'caster_atk_based_atk',sort:'value_desc',mode:'allies',manufacturer:'Pilgrim'});
  assert.ok(rows.length>=2);assert.ok(rows.every(r=>r.effects.some(e=>e.buff_type==='caster_atk_based_atk')));
  for(let i=1;i<rows.length;i++)if(rows[i].metric.value_unit===rows[i-1].metric.value_unit)assert.ok(rows[i-1].metric.value>=rows[i].metric.value);
});
test('optional nonholders are last for numeric sorting, missing values are not zero',()=>{
  const sample=characters.filter(c=>['Alice','Crown'].includes(c.character_name));
  assert.deepEqual(names(catalogGroups(sample,effects,{type:'attack_damage',sort:'value_asc',onlyMatching:false})),['Crown','Alice']);
});
test('unreviewed effects cannot enter a comparison; unknown characters remain in unfiltered catalog',()=>{
  const pending={...effects[0],character_id:c('Alice').character_id,character_name:'Alice',buff_type:'atk',value:999999,needs_review:true};
  const rows=catalogGroups(characters,[pending],{type:'atk'});assert.equal(rows.length,0);
  assert.equal(catalogGroups(characters,[]).length,characters.length);
  assert.equal(catalogGroups(characters,[],{mode:'allies'}).length,0);
});
test('URL roundtrip covers all controls and lower-case metadata values',()=>{
  const state=normalizeState({query:'D: Killer Wife',manufacturer:'elysion',burst:'1',element:'fire',type:'attack_damage',mode:'allies',sort:'release_desc',target:'weapon',slot:'Skill 1',condition:'only',stack:'exclude',onlyMatching:false});
  const url=writeQuery(state);assert.ok(url.includes('manufacturer=elysion'));assert.ok(url.includes('scope=ally'));
  assert.deepEqual(readQuery(url),state);assert.equal(writeQuery(normalizeState()),'');
});
test('invalid and obsolete URL state is safely ignored, raw sort needs a category',()=>{
  const s=readQuery('?manufacturer=unknown&burst=9&element=nope&scope=enemy&sort=value_desc&buff=missing&holders=0');
  assert.equal(s.manufacturer,'');assert.equal(s.burst,'');assert.equal(s.mode,'all');assert.equal(s.sort,'name_asc');
  assert.equal(readQuery('?sort=name_desc').sort,'name_desc');
  assert.equal(readQuery('?sort=release_desc').sort,'release_desc');
  assert.equal(readQuery('?sort=value_desc&buff=debuff_immunity').sort,'name_asc');
});
test('filter chips identify active state and sorting status is explicit',()=>{
  assert.equal(filterChips({manufacturer:'Pilgrim',burst:'3',element:'Electric'}).length,3);
  assert.match(sortStatus({sort:'release_desc'}),/実装日未確認は末尾/);
  assert.match(sortStatus({sort:'value_desc',type:'atk'}),/攻撃力（降順）/);
});
test('schema validator rejects broken foreign keys, duplicate IDs and mixed caster units',()=>{
  const bad=[{...effects[0],character_id:'nikke-0',value_unit:'percent'}];
  assert.ok(validateDataset(characters,bad,cs,es).some(e=>e.includes('Invalid character link')));
  assert.ok(validateDataset(characters,[effects[0],effects[0]],cs,es).some(e=>e.includes('Duplicate effect')));
  assert.ok(validateShape('2024-02-30',{type:'string',format:'date'}).length);
  assert.ok(validateShape([1,1],{type:'array',uniqueItems:true}).length);
});
test('source corrections retain precise Raw Values and separate branches',()=>{
  assert.ok(effects.some(e=>e.character_name==='Red Hood'&&e.buff_type==='atk'&&e.value===71.42));
  assert.ok(effects.some(e=>e.character_name==='D: Killer Wife'&&e.buff_type==='caster_atk_based_atk'&&e.value===12.19));
  assert.equal(effects.filter(e=>e.character_name==='Red Hood'&&e.buff_type==='burst_cooldown_reduction').length,2);
  assert.ok(effects.some(e=>e.character_name==='Crown'&&e.value===4.06&&e.trigger.includes('43')));
});
test('catalog rendering model never mutates data or state',()=>{
  const before=JSON.stringify({characters,effects}),state={sort:'value_desc',type:'atk'};
  catalogGroups(characters,effects,state);assert.deepEqual(state,{sort:'value_desc',type:'atk'});
  assert.equal(JSON.stringify({characters,effects}),before);
});

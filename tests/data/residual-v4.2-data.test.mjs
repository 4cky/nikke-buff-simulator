import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseResidualEffectLine,RESIDUAL_RULE_IDS} from '../../scripts/residual-grammar.mjs';

const read=name=>JSON.parse(readFileSync(new URL(`../../${name}`,import.meta.url)));
const audit=read('review-audit-v4.2-residual.json');
const reviews=read('data/review-items.json');
const effects=read('data/effects.json');
const nonbuff=read('data/non-buff-effects.json');
const metadata=read('data/metadata-only-effects.json');
const report=read('data/residual-resolution-report.json');
const collection=read('data/collection-report.json');
const pending=reviews.filter(r=>r.needs_review);

test('residual audit input is the exact 64/0/60/17 partition',()=>assert.deepEqual(Object.fromEntries(['A','B','C','D'].map(k=>[k,audit.categories[k].review_section_count])),{A:64,B:0,C:60,D:17}));
test('all A sections resolve and only their solved reasons are removed',()=>{const keys=new Set(audit.categories.A.items.map(x=>x.review_key));assert.equal(reviews.filter(r=>keys.has(r.review_key)&&r.needs_review).length,0);assert.equal(reviews.filter(r=>keys.has(r.review_key)&&r.review_status==='auto_resolved').length,64);});
test('all C sections become normal noncomparison or metadata records',()=>{const keys=new Set(audit.categories.C.items.map(x=>x.review_key));assert.equal(reviews.filter(r=>keys.has(r.review_key)&&r.needs_review).length,0);assert.equal(reviews.filter(r=>keys.has(r.review_key)&&r.review_status==='auto_excluded').length,60);assert.ok([...nonbuff,...metadata].every(x=>!keys.has(x.review_key)||x.comparison_excluded||x.metadata_only));});
test('final human policy resolves 16 D sections and keeps only iDoll Sun',()=>{
  const dKeys=new Set(audit.categories.D.items.map(x=>x.review_key));
  assert.equal(reviews.filter(r=>dKeys.has(r.review_key)&&r.review_status==='auto_extracted').length,16);
  assert.deepEqual(new Set(pending.map(x=>x.review_key)),new Set(['nikke-308:Skill 2:section-0']));
});
test('metadata-only nodes never enter comparison effects',()=>{assert.equal(metadata.length,23);const ids=new Set(metadata.map(x=>x.effect_id));assert.ok(effects.every(x=>!ids.has(x.effect_id)));});
test('normal damage/resource/penalty/weapon state no longer carries review reasons',()=>assert.ok(nonbuff.filter(x=>x.parser_version==='4.2.1').every(x=>!x.needs_review&&['damage','debuff','penalty','resource','weapon_state','special_mechanic'].includes(x.effect_type))));
test('review policy leaves no resolved special/not-a-buff reason',()=>assert.ok(reviews.filter(r=>!r.needs_review).every(r=>!(r.needs_review_reasons||[]).includes('special_mechanic')&&!(r.needs_review_reasons||[]).includes('not_a_buff_candidate'))));
test('24 generic residual rule families are registered',()=>assert.equal(RESIDUAL_RULE_IDS.length,24));
test('residual grammar separates boolean, scaling, penalty and metadata axes',()=>{
  const inv=parseResidualEffectLine('Invulnerable for 3 sec. Activates 5 time(s) per battle.');assert.deepEqual([inv.effect_type,inv.buff_type,inv.value_unit,inv.activation_limit],['buff','invulnerability','boolean',5]);
  const penalty=parseResidualEffectLine('Max Ammunition Capacity ▼ 5.04%. Stacks up to 5 times and lasts for 10 sec.');assert.deepEqual([penalty.effect_type,penalty.value,penalty.stack_count,penalty.max_raw_value],['penalty',5.04,5,25.2]);
  const meta=parseResidualEffectLine('Previous effects trigger repeatedly.');assert.deepEqual([meta.effect_type,meta.special_type,meta.metadata_only],['special_mechanic','metadata',true]);
});
test('parent counted duration and named-state target resolutions publish no guessed D data',()=>{assert.equal(report.D_maintained,17);assert.equal(report.D_unchanged,true);assert.equal(report.unresolved.A.length+report.unresolved.C.length,0);});
test('full 199-character collection has zero unknown and positive residual types',()=>{assert.equal(collection.visible_characters,199);assert.equal(collection.unknown_candidate_types,0);assert.equal(collection.unrecognized_positive_effect_candidate_types,0);});
test('final post-review totals are stable',()=>assert.deepEqual({needs_review:pending.length,effects:effects.length,comparison:effects.filter(x=>!x.needs_review).length,metadata:metadata.length},{needs_review:1,effects:991,comparison:991,metadata:23}));

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {validateDataset} from '../../scripts/validate-data.mjs';
import {resolveFormation,isTreasureEligible,normalizeFormationState} from '../../formation-model.js';

const read = name=>JSON.parse(readFileSync(new URL(`../../data/${name}.json`,import.meta.url),'utf8'));
const characters = read('characters'), effects = read('effects');
const tEffects = read('treasure-effects'), tReport = read('treasure-report');
const tReviews = read('treasure-review-queue'), tSnaps = read('treasure-snapshots');
const byChar = rows=>new Map(rows.reduce((m,e)=>{
  if(!m.has(e.character_id))m.set(e.character_id,[]);
  m.get(e.character_id).push(e);return m;
},new Map()));

test('treasure dataset counts and provenance',()=>{
  assert.equal(tReport.holder_count,21);
  assert.equal(tReport.skill_count,63);
  assert.equal(tReport.conflict_count,0);
  assert.equal(tEffects.filter(e=>!e.needs_review).length,tReport.effect_count);
  assert.equal(tReviews.length,tReport.review_count);
  assert.ok(tEffects.every(e=>e.source_type==='nikke_explorer'));
  assert.ok(tEffects.every(e=>(e.source_url||'').includes('nikke.exynan.my.id')));
  assert.ok(tEffects.every(e=>!!e.source_checked_at));
  assert.ok(tEffects.every(e=>e.source_conflict===false));
});

test('treasure effects validate against the effect schema',()=>{
  const charSchema = read('character-schema'), effectSchema = read('effect-schema');
  const errors = validateDataset(characters,tEffects,charSchema,effectSchema);
  assert.deepEqual(errors,[]);
});

test('treasure ids never overlap comparison and cover full skills',()=>{
  const main = new Set(effects.map(e=>e.effect_id));
  assert.equal(tEffects.filter(e=>main.has(e.effect_id)).length,0);
  assert.equal(new Set(tEffects.map(e=>e.effect_id)).size,tEffects.length);
  for(const h of tReport.holders){
    assert.deepEqual([...h.slots].sort(),[1,2,3]);
    assert.deepEqual([...h.covered_slots].sort(),['Burst','Skill 1','Skill 2']);
  }
});

test('21 holders are treasure-eligible, others are not',()=>{
  const tByChar = byChar(tEffects);
  assert.equal(characters.filter(c=>isTreasureEligible(c,tByChar)).length,21);
  assert.ok(tReport.holders.every(h=>isTreasureEligible(
    characters.find(c=>c.character_id===h.character_id),tByChar)));
  assert.equal(isTreasureEligible(
    characters.find(c=>c.character_id==='nikke-16'),tByChar),false);
});

test('treasure ON switches Moran to the treasure set without doubling',()=>{
  const chars = characters.map(c=>({...c}));
  const moran = chars.find(c=>c.character_id==='nikke-281');
  const crown = chars.find(c=>c.character_id==='nikke-330');
  const members = [moran,crown];
  const tByChar = byChar(tEffects);
  const normalIds = new Set((byChar(effects).get('nikke-281')||[]).map(e=>e.effect_id));
  const off = resolveFormation({members,targetIndex:1,burst:'none',
    effectsByChar:byChar(effects),characters:chars});
  assert.ok([...off.deterministic,...off.gated].some(r=>normalIds.has(r.effect.effect_id)));
  const on = resolveFormation({members,targetIndex:1,burst:'none',
    treasure:['nikke-281'],treasureByChar:tByChar,
    effectsByChar:byChar(effects),characters:chars});
  const ids = [...on.deterministic,...on.gated,...on.unknown,...on.quarantined]
    .filter(r=>r.caster.character_id==='nikke-281').map(r=>r.effect.effect_id);
  assert.ok(ids.length>0);
  assert.ok(ids.every(id=>!normalIds.has(id)));
  assert.ok(ids.some(id=>id.includes('treasure')));
  // Treasure CDR (Fervor-gated, post-treasure value) is present, not unknown.
  const cdr = on.gated.find(r=>r.effect.buff_type==='burst_cooldown_reduction'
    &&r.caster.character_id==='nikke-281');
  assert.ok(cdr);
  assert.equal(cdr.effect.value,7.48);
});

test('treasure combines with rotation evaluation',()=>{
  const chars = characters.map(c=>({...c}));
  const members = ['nikke-281','nikke-82','nikke-330'].map(id=>chars.find(c=>c.character_id===id));
  const tByChar = byChar(tEffects);
  const rotation = [{caster:'nikke-82',stage:1},{caster:'nikke-330',stage:2},{caster:'nikke-281',stage:1}];
  const args = {members,targetIndex:0,rotation,rotationIndex:2,
    treasureByChar:tByChar,effectsByChar:byChar(effects),characters:chars};
  const isNormalMoran = id=>/^auto:nikke-281:\d/.test(id);
  const offIds = [...Object.values(resolveFormation(args)).flat()].map(r=>r.effect.effect_id);
  assert.ok(offIds.some(isNormalMoran));
  const onIds = [...Object.values(resolveFormation({...args,treasure:['nikke-281']})).flat()]
    .map(r=>r.effect.effect_id);
  assert.ok(!onIds.some(isNormalMoran));
  assert.ok(onIds.some(id=>id.includes('treasure')&&id.includes('nikke-281')));
});

test('Centi treasure reflects the reworked final state',()=>{
  const snaps = tSnaps.filter(s=>s.character_id==='nikke-80');
  assert.equal(snaps.length,3);
  const text = snaps.map(s=>s.text).join('\n');
  assert.match(text,/Stockpile/);
  assert.match(text,/Iron Code/);
});

test('treasure and selected frames never share a layer',()=>{
  const root = join(dirname(fileURLToPath(import.meta.url)),'../..');
  const css = readFileSync(join(root,'formation.css'),'utf8');
  const gold = css.match(/\.formation-slot\.has-treasure \{([^}]*)\}/)[1];
  assert.doesNotMatch(gold,/outline/);
  assert.match(gold,/border-color:#c9a227/);
  assert.match(css,/\.formation-slot\.has-treasure\.is-target \{[^}]*outline-offset:4px/);
  assert.match(css,/\.formation-slot\.is-target \{[^}]*outline-offset:2px/);
});

test('burst caster changes never touch treasure state',()=>{
  const members = ['nikke-281','nikke-82','nikke-330'];
  const base = {members,burst:'none',targetIndex:0,
    burstCasters:{1:null,2:null,3:null},treasure:['nikke-281']};
  // Select Moran as burst caster, then reselect: treasure stays ON.
  let state = normalizeFormationState({...base,
    rotation:[{caster:'nikke-281',stage:1}],rotationIndex:0},characters);
  assert.deepEqual(state.treasure,['nikke-281']);
  state = normalizeFormationState({...state,
    rotation:[{caster:'nikke-281',stage:1}],rotationIndex:0},characters);
  assert.deepEqual(state.treasure,['nikke-281']);
  // Switch the caster to another character: Moran treasure stays ON.
  state = normalizeFormationState({...state,
    rotation:[{caster:'nikke-82',stage:1}],rotationIndex:0},characters);
  assert.deepEqual(state.treasure,['nikke-281']);
  // Rotation edits keep treasure even when the evaluated index moves.
  state = normalizeFormationState({...state,
    rotation:[{caster:'nikke-82',stage:1},{caster:'nikke-330',stage:2}],rotationIndex:1},characters);
  assert.deepEqual(state.treasure,['nikke-281']);
  // Only explicit treasure edits change it.
  state = normalizeFormationState({...state,treasure:[]},characters);
  assert.deepEqual(state.treasure,[]);
});

test('baseline datasets are untouched by treasure files',()=>{
  assert.equal(characters.length,199);
  assert.equal(effects.length,991);
});

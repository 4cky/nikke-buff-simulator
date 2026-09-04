import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolveFormation,conflictBadge,burstEventOf,
  filterRoster,validateRotation,rotationNextOptions,reentryTargets,isTreasureEligible,
  formationDependentReentries,effectiveReentryByChar,
  hasOtherBurstStageMember,burstOneClass} from '../../formation-model.js';
import {validateDataset} from '../../scripts/validate-data.mjs';

const characters = [
  {character_id:'nikke-1',character_name:'Alpha',burst_stage:[1],element:'Fire',weapon_type:'AR',class:'Attacker'},
  {character_id:'nikke-2',character_name:'Beta',burst_stage:[2],element:'Water',weapon_type:'SG',class:'Supporter'},
  {character_id:'nikke-3',character_name:'Gamma',burst_stage:[3],element:'Electric',weapon_type:'SR',class:'Defender'},
];
const base = {skill_slot:'Skill 1',needs_review:false,source_conflict:false,
  condition:'',trigger:'',parent_effect_name:null,parent_effect_type:null,
  parent_effect_description:null,parent_trigger:null,section_condition:null,
  end_condition:null,parent_end_condition:null,activation_chance:null,
  duration_type:'fixed',duration:'15 sec',source_limitations:[],
  target_count:null,target_selection:null,target_condition:null,
  target_class:null,target_weapon:null,target_element:null,
  nikke_gg_value:null,nikke_explorer_value:null};
const byChar = rows => new Map(rows.reduce((m,e)=>{
  if(!m.has(e.character_id))m.set(e.character_id,[]);
  m.get(e.character_id).push(e);return m;
},new Map()));

test('needs_review is never applied; conflict is a badge, not a rule',async()=>{
  const review = {...base,effect_id:'q1',character_id:'nikke-1',target_type:'all_allies',target:'all allies.',needs_review:true};
  const out = resolveFormation({members:characters.slice(0,2),targetIndex:1,burst:'none',
    effectsByChar:byChar([review]),characters});
  assert.equal(out.quarantined.length,1);
  assert.equal(out.deterministic.length,0);
  assert.equal(out.gated.length,0);
  // Existing pipeline invariant: conflict without review is invalid.
  const [chars,effects,cs,es] = await Promise.all(['characters','effects','character-schema','effect-schema']
    .map(async name=>JSON.parse(await readFile(new URL(`../../data/${name}.json`,import.meta.url),'utf8'))));
  const bad = {...effects[0],effect_id:'bad:conflict',source_conflict:true,needs_review:false};
  assert.ok(validateDataset(chars,[bad],cs,es).some(e=>e.includes('Unflagged source conflict')));
  // Conflict WITH review is quarantined and badged, not applied.
  const conflict = {...base,effect_id:'q2',character_id:'nikke-1',target_type:'all_allies',
    target:'all allies.',needs_review:true,source_conflict:true,nikke_gg_value:10,nikke_explorer_value:12};
  assert.ok(conflictBadge(conflict).includes('NIKKE.GG 10'));
  const out2 = resolveFormation({members:characters.slice(0,2),targetIndex:1,burst:'none',
    effectsByChar:byChar([conflict]),characters});
  assert.equal(out2.quarantined.length,1);
  assert.equal(out2.deterministic.length,0);
});

test('roster filters match real dataset axes',async()=>{
  const real = JSON.parse(await readFile(new URL('../../data/characters.json',import.meta.url),'utf8'));
  assert.equal(filterRoster(real,{}).length,199);
  const tetra = filterRoster(real,{manufacturer:'Tetra',burst:'1',element:'Electric'});
  assert.ok(tetra.length>0);
  assert.ok(tetra.every(c=>c.manufacturer==='Tetra'&&c.burst_stage.includes(1)&&c.element==='Electric'));
});
test('real data: non-caster Burst leaves buckets, Full Burst stays',async()=>{
  const [chars,effects] = await Promise.all(['characters','effects']
    .map(async name=>JSON.parse(await readFile(new URL(`../../data/${name}.json`,import.meta.url),'utf8'))));
  const crown = chars.find(c=>c.character_id==='nikke-330');
  const poli = chars.find(c=>c.character_name==='Poli');
  const members = [crown,poli];
  const map = new Map();
  for(const e of effects){
    if(e.character_id!==crown.character_id&&e.character_id!==poli.character_id)continue;
    if(!map.has(e.character_id))map.set(e.character_id,[]);
    map.get(e.character_id).push(e);
  }
  const crownBurst = map.get(crown.character_id).filter(e=>e.skill_slot==='Burst');
  assert.ok(crownBurst.length>0);
  const seen = burst=>resolveFormation({members,targetIndex:1,burst,
    burstCasters:{1:null,2:crown.character_id,3:null},effectsByChar:map,characters:chars});
  const firing = seen('2');
  const firingIds = new Set([...firing.deterministic,...firing.gated,...firing.unknown].map(r=>r.effect.effect_id));
  // Crown's own Burst effects stay visible when Crown fires stage II.
  assert.ok(crownBurst.some(e=>firingIds.has(e.effect_id)));
  // Crown's Full Burst Skill effects stay visible regardless of caster.
  const crownFull = map.get(crown.character_id).filter(e=>e.skill_slot!=='Burst'
    &&burstEventOf(e)==='full_burst');
  assert.ok(crownFull.length>0);
  assert.ok(crownFull.every(e=>firingIds.has(e.effect_id)));
  const other = resolveFormation({members,targetIndex:1,burst:'2',
    burstCasters:{1:null,2:poli.character_id,3:null},effectsByChar:map,characters:chars});
  const otherIds = new Set([...other.deterministic,...other.gated,...other.unknown].map(r=>r.effect.effect_id));
  // Poli fires instead: Crown's own Burst vanishes, Crown's Full Burst stays.
  assert.ok(crownBurst.every(e=>!otherIds.has(e.effect_id)));
  assert.ok(crownFull.every(e=>otherIds.has(e.effect_id)));
});
test('real data: Rapi, Anis Star and Crown resolve with formation state',async()=>{
  const [chars,effects] = await Promise.all(['characters','effects']
    .map(async name=>JSON.parse(await readFile(new URL(`../../data/${name}.json`,import.meta.url),'utf8'))));
  const byId = new Map(chars.map(c=>[c.character_id,c]));
  const rapi = byId.get('nikke-16'), anis = byId.get('nikke-17');
  const liter = byId.get('nikke-82'), crown = byId.get('nikke-330');
  const scarlet = byId.get('nikke-222');
  assert.deepEqual(rapi.burst_stage,[1,3]);
  const map = new Map();
  for(const e of effects){
    if(!['nikke-16','nikke-17','nikke-330'].includes(e.character_id))continue;
    if(!map.has(e.character_id))map.set(e.character_id,[]);
    map.get(e.character_id).push(e);
  }
  const everywhere = out=>[...out.deterministic,...out.gated,...out.unknown]
    .map(r=>r.effect.effect_id);
  // Rapi Burst I CDR at Stage I with Rapi as caster: proven deterministic.
  const cdr = 'auto:nikke-16:10163:0:g0-c0';
  assert.equal(burstEventOf(map.get('nikke-16').find(e=>e.effect_id===cdr)),'other');
  const rapiOne = resolveFormation({members:[rapi,liter,crown],targetIndex:0,burst:'1',
    burstCasters:{1:'nikke-16',2:'nikke-330',3:null},
    effectsByChar:map,characters:chars});
  assert.ok(rapiOne.deterministic.some(r=>r.effect.effect_id===cdr));
  // Rapi Burst III projectile effect at Stage III with Rapi: deterministic.
  const proj = 'auto:nikke-16:10163:3:g0-c1';
  const rapiThree = resolveFormation({members:[rapi,liter,scarlet],targetIndex:0,burst:'3',
    burstCasters:{1:'nikke-82',2:null,3:'nikke-16'},
    effectsByChar:map,characters:chars});
  assert.ok(rapiThree.deterministic.some(r=>r.effect.effect_id===proj));
  // Same Stage I, another B1 fires: Rapi's stage-scoped Burst is
  // mismatch-gated, never silently dropped, never own-vanished.
  const rapiOther = resolveFormation({members:[rapi,anis,crown],targetIndex:0,burst:'1',
    burstCasters:{1:'nikke-17',2:'nikke-330',3:null},
    effectsByChar:map,characters:chars});
  assert.ok(rapiOther.gated.some(r=>r.effect.effect_id===cdr
    &&r.reasons.includes('burst-caster-mismatch')));
  // Anis:Star S1 branch flips with the other-B1 presence, ignoring casters.
  const noBranch = 'auto:nikke-17:20171:1:g0-c1', anyBranch = 'auto:nikke-17:20171:1:g1-c1';
  const anisSolo = resolveFormation({members:[anis,crown,scarlet],targetIndex:0,burst:'none',
    burstCasters:{1:null,2:null,3:null},effectsByChar:map,characters:chars});
  assert.ok(everywhere(anisSolo).includes(noBranch));
  assert.ok(!everywhere(anisSolo).includes(anyBranch));
  const anisDuo = resolveFormation({members:[anis,liter,crown],targetIndex:0,burst:'none',
    burstCasters:{1:'nikke-82',2:'nikke-330',3:null},effectsByChar:map,characters:chars});
  assert.ok(everywhere(anisDuo).includes(anyBranch));
  assert.ok(!everywhere(anisDuo).includes(noBranch));
  // Crown S1 previously-cast: earlier caster holds deterministically (Full
  // Burst timing alone never blocks), later casters vanish; the mirror
  // holds for not-previously-cast.
  const prev = 'curated:330:0', unprev = 'curated:330:2';
  const chain = [liter,crown,scarlet];
  const casters = {1:'nikke-82',2:'nikke-330',3:'nikke-222'};
  const at = (effectId,targetId)=>resolveFormation({members:chain,
    targetIndex:chain.findIndex(m=>m.character_id===targetId),burst:'2',
    burstCasters:casters,effectsByChar:map,characters:chars});
  const prevLiter = at(prev,'nikke-82');
  assert.ok(prevLiter.deterministic.some(r=>r.effect.effect_id===prev));
  assert.ok(!prevLiter.unknown.some(r=>r.effect.effect_id===prev));
  assert.ok(!everywhere(at(prev,'nikke-222')).includes(prev));
  const unprevScarlet = at(unprev,'nikke-222');
  assert.ok(unprevScarlet.deterministic.some(r=>r.effect.effect_id===unprev));
  assert.ok(!everywhere(at(unprev,'nikke-82')).includes(unprev));
});

test('real data: Rapi Combat Assist branches flip deterministically',async()=>{
  const [chars,effects] = await Promise.all(['characters','effects']
    .map(async name=>JSON.parse(await readFile(new URL(`../../data/${name}.json`,import.meta.url),'utf8'))));
  const byId = new Map(chars.map(c=>[c.character_id,c]));
  const rapi = byId.get('nikke-16');
  const map = new Map();
  for(const e of effects){
    if(e.character_id!=='nikke-16')continue;
    if(!map.has(e.character_id))map.set(e.character_id,[]);
    map.get(e.character_id).push(e);
  }
  const everywhere = out=>[...out.deterministic,...out.gated,...out.unknown]
    .map(r=>r.effect.effect_id);
  const cdr = ['auto:nikke-16:20161:1:0','auto:nikke-16:20161:1:1'];
  const dps = ['auto:nikke-16:20161:2:g0-c0','auto:nikke-16:20161:2:g0-c1'];
  const assist = 'auto:nikke-16:20161:0:g1-c0';
  // No other B1: Combat Assist holds — CDR branch deterministic, DPS vanishes.
  const solo = resolveFormation({members:[rapi,byId.get('nikke-330'),byId.get('nikke-222')],
    targetIndex:0,burst:'none',burstCasters:{1:null,2:null,3:null},
    effectsByChar:map,characters:chars});
  for(const id of cdr)assert.ok(solo.deterministic.some(r=>r.effect.effect_id===id),id);
  for(const id of dps)assert.ok(!everywhere(solo).includes(id),id);
  assert.ok(solo.deterministic.some(r=>r.effect.effect_id===assist));
  // Another B1 present: Combat Assist off — DPS deterministic, CDR vanishes.
  const duo = resolveFormation({members:[rapi,byId.get('nikke-17'),byId.get('nikke-330')],
    targetIndex:0,burst:'none',burstCasters:{1:null,2:null,3:null},
    effectsByChar:map,characters:chars});
  for(const id of dps)assert.ok(duo.deterministic.some(r=>r.effect.effect_id===id),id);
  for(const id of cdr)assert.ok(!everywhere(duo).includes(id),id);
  assert.ok(!everywhere(duo).includes(assist));
});

test('reentryTargets parses Burst-slot re-entry stages from raw text',async()=>{
  const effects = JSON.parse(await readFile(new URL('../../data/effects.json',import.meta.url),'utf8'));
  const map = reentryTargets(effects);
  // Burst-fire re-entries: Alice/Rupee/Avistar/Tia -> 1, Chime -> 2.
  assert.equal(map['nikke-195'],1);
  assert.equal(map['nikke-331'],2);
  // Skill-slot branch re-entry (Anis Everyone's Star) is not a firing rule.
  assert.equal(map['nikke-17'],undefined);
});

test('treasure eligibility is strictly data-driven',async()=>{
  // Synthetic: eligible only with a registered treasure set.
  assert.equal(isTreasureEligible(characters[0],new Map()),false);
  assert.equal(isTreasureEligible(characters[0],
    new Map([['nikke-1',[]]])),true);
  assert.equal(isTreasureEligible(null,new Map()),false);
  // Real data: no Favorite Item data exists anywhere, so nobody is
  // eligible and no toggle may render.
  const chars = JSON.parse(await readFile(new URL('../../data/characters.json',import.meta.url),'utf8'));
  assert.equal(chars.length,199);
  assert.ok(chars.every(c=>isTreasureEligible(c,new Map())===false));
});

test('real data: Anis branch switches deterministically on other-B1 presence',async()=>{
  const [chars,effects] = await Promise.all(['characters','effects']
    .map(async name=>JSON.parse(await readFile(new URL(`../../data/${name}.json`,import.meta.url),'utf8'))));
  const byId = new Map(chars.map(c=>[c.character_id,c]));
  const map = new Map();
  for(const e of effects){
    if(e.character_id!=='nikke-17')continue;
    if(!map.has(e.character_id))map.set(e.character_id,[]);
    map.get(e.character_id).push(e);
  }
  const NO = ['auto:nikke-17:20171:1:g0-c1','auto:nikke-17:20171:1:g0-c2'];
  const ANY = 'auto:nikke-17:20171:1:g1-c1';
  const at = mids=>resolveFormation({members:mids.map(id=>byId.get(id)),targetIndex:0,
    rotation:[],rotationIndex:-1,effectsByChar:map,characters:chars});
  const bucketOf = (out,id)=>{
    for(const b of ['deterministic','gated','unknown','quarantined'])
      if(out[b].some(r=>r.effect.effect_id===id))return b;
    return 'VANISHED';
  };
  // 1. Solo B1, 4. B2/B3 only, 5. self never counted: no-other deterministic.
  for(const mids of [['nikke-17','nikke-330','nikke-222'],['nikke-17','nikke-330']]){
    const out = at(mids);
    for(const id of NO)assert.equal(bucketOf(out,id),'deterministic',`${mids} ${id}`);
    assert.equal(bucketOf(out,ANY),'VANISHED',mids.join(','));
  }
  // 2. +Liter (standard B1): other-B1 branch deterministic, no-branch gone.
  {
    const out = at(['nikke-17','nikke-82','nikke-330']);
    assert.equal(bucketOf(out,ANY),'deterministic');
    for(const id of NO)assert.equal(bucketOf(out,id),'VANISHED',id);
  }
  // 3. +Rapi (dynamic B1/B3): Rapi never counts as standard B1 for Anis,
  // so the no-other branch stays deterministic.
  {
    const out = at(['nikke-17','nikke-16','nikke-330']);
    for(const id of NO)assert.equal(bucketOf(out,id),'deterministic',id);
    assert.equal(bucketOf(out,ANY),'VANISHED');
  }
  // 6. Roster change flips immediately (same base, Liter added/removed).
  assert.equal(bucketOf(at(['nikke-17','nikke-330','nikke-222']),ANY),'VANISHED');
  // 7-8. Rotation unset, set, or changed never moves the branch itself.
  const rotA = [{caster:'nikke-17',stage:1},{caster:'nikke-330',stage:2},{caster:'nikke-222',stage:3}];
  const rotB = [{caster:'nikke-330',stage:2}];
  for(const [rot,idx] of [[[],-1],[rotA,0],[rotA,2],[rotB,0]]){
    const mems = ['nikke-17','nikke-330','nikke-222'].map(id=>byId.get(id));
    const out = resolveFormation({members:mems,targetIndex:0,rotation:rot,rotationIndex:idx,
      effectsByChar:map,characters:chars});
    for(const id of NO)assert.equal(bucketOf(out,id),'deterministic',`rot ${idx}`);
    assert.equal(bucketOf(out,ANY),'VANISHED',`rot ${idx}`);
  }
  // 9. Re-entry rotation coexists without contradicting the branch.
  const alice = byId.get('nikke-195');
  assert.deepEqual(alice.burst_stage,[1]);
  const mems = ['nikke-17','nikke-195','nikke-82','nikke-330'].map(id=>byId.get(id));
  const reRot = [{caster:'nikke-195',stage:1},{caster:'nikke-17',stage:1},{caster:'nikke-82',stage:1},{caster:'nikke-330',stage:2}];
  const reOut = resolveFormation({members:mems,targetIndex:0,rotation:reRot,rotationIndex:3,
    effectsByChar:map,characters:chars});
  assert.equal(bucketOf(reOut,ANY),'deterministic');
  for(const id of NO)assert.equal(bucketOf(reOut,id),'VANISHED',id);
});

test('real data: Anis+Moran opens Moran B1 after Anis B1',async()=>{
  const [chars,effects] = await Promise.all(['characters','effects']
    .map(async name=>JSON.parse(await readFile(new URL(`../../data/${name}.json`,import.meta.url),'utf8'))));
  const byId = new Map(chars.map(c=>[c.character_id,c]));
  const map = new Map();
  for(const e of effects){
    if(!map.has(e.character_id))map.set(e.character_id,[]);
    map.get(e.character_id).push(e);
  }
  const form = ['nikke-17','nikke-281','nikke-330','nikke-16','nikke-471'].map(id=>byId.get(id));
  // Conditional map agrees with the resolver branch judgment. Only the
  // standard B1 (Moran) counts for Anis; dynamic Rapi does not.
  assert.deepEqual(formationDependentReentries(form,map),{'nikke-17':1});
  assert.equal(hasOtherBurstStageMember(form,'nikke-17',1,{standardOnly:true}),1);
  assert.equal(hasOtherBurstStageMember(form,'nikke-17',1),2);
  const effective = effectiveReentryByChar(form,
    Object.fromEntries(Object.entries(reentryTargets(effects)).filter(([id])=>form.some(m=>m.character_id===id))),map);
  assert.equal(effective['nikke-17'],1);
  // 2nd candidates after 1st Anis B1: Moran B1 and Crown B2.
  const second = rotationNextOptions([{caster:'nikke-17',stage:1}],form,effective);
  assert.deepEqual(second.find(o=>o.caster==='nikke-281'),{caster:'nikke-281',stages:[1]});
  assert.deepEqual(second.find(o=>o.caster==='nikke-330'),{caster:'nikke-330',stages:[2]});
  // Full chain validates: Anis B1 -> Moran B1 -> Crown B2 -> Rapi B3.
  assert.deepEqual(validateRotation(
    [{caster:'nikke-17',stage:1},{caster:'nikke-281',stage:1},
     {caster:'nikke-330',stage:2},{caster:'nikke-16',stage:3}],form,effective)
    .map(e=>[e.caster,e.stage]),
    [['nikke-17',1],['nikke-281',1],['nikke-330',2],['nikke-16',3]]);
  // Reverse case: Anis solo B1 offers no B1 candidate, only B2.
  // (Rapi excluded: she is B1-capable herself.)
  const solo = ['nikke-17','nikke-330','nikke-471'].map(id=>byId.get(id));
  const soloEffective = effectiveReentryByChar(solo,{},map);
  assert.equal(soloEffective['nikke-17'],undefined);
  const soloSecond = rotationNextOptions([{caster:'nikke-17',stage:1}],solo,soloEffective);
  assert.ok(!soloSecond.some(o=>o.stages.includes(1)));
  assert.deepEqual(soloSecond.find(o=>o.caster==='nikke-330'),{caster:'nikke-330',stages:[2]});
  // Anis+Tia consistency: Tia is B1, so other-B1 holds and re-entry opens.
  const tiaForm = ['nikke-17','nikke-451','nikke-330'].map(id=>byId.get(id));
  assert.equal(hasOtherBurstStageMember(tiaForm,'nikke-17',1),1);
  assert.deepEqual(formationDependentReentries(tiaForm,map),{'nikke-17':1});
  // Candidate judgment needs no rotation and ignores targets.
  assert.deepEqual(
    rotationNextOptions([{caster:'nikke-17',stage:1}],form,effective),
    rotationNextOptions([{caster:'nikke-17',stage:1}],form,effective));
});

test('real data: Anis + Rapi => Anis B1 normal / Rapi B3',async()=>{
  const [chars,effects] = await Promise.all(['characters','effects']
    .map(async name=>JSON.parse(await readFile(new URL(`../../data/${name}.json`,import.meta.url),'utf8'))));
  const byId = new Map(chars.map(c=>[c.character_id,c]));
  assert.deepEqual(byId.get('nikke-16').burst_stage,[1,3]);
  assert.deepEqual(byId.get('nikke-17').burst_stage,[1]);
  const map = new Map();
  for(const e of effects){
    if(e.character_id!=='nikke-16'&&e.character_id!=='nikke-17')continue;
    if(!map.has(e.character_id))map.set(e.character_id,[]);
    map.get(e.character_id).push(e);
  }
  const mems = ['nikke-17','nikke-16','nikke-330'].map(id=>byId.get(id));
  const bucketOf = (out,id)=>{
    for(const b of ['deterministic','gated','unknown','quarantined'])
      if(out[b].some(r=>r.effect.effect_id===id))return b;
    return 'VANISHED';
  };
  // Anis side (target Anis): My Own Star branch deterministic, no re-entry.
  const anisOut = resolveFormation({members:mems,targetIndex:0,
    rotation:[],rotationIndex:-1,effectsByChar:map,characters:chars});
  assert.equal(bucketOf(anisOut,'auto:nikke-17:20171:1:g0-c1'),'deterministic');
  assert.equal(bucketOf(anisOut,'auto:nikke-17:20171:1:g0-c2'),'deterministic');
  assert.equal(bucketOf(anisOut,'auto:nikke-17:20171:1:g1-c1'),'VANISHED');
  // Rapi side (target Rapi): Anis counts for Rapi, so Combat Assist is
  // off — DPS branch deterministic, assist-side effects gone.
  const rapiOut = resolveFormation({members:mems,targetIndex:1,
    rotation:[],rotationIndex:-1,effectsByChar:map,characters:chars});
  assert.equal(bucketOf(rapiOut,'auto:nikke-16:20161:2:g0-c0'),'deterministic');
  assert.equal(bucketOf(rapiOut,'auto:nikke-16:20161:2:g0-c1'),'deterministic');
  assert.equal(bucketOf(rapiOut,'auto:nikke-16:20161:1:0'),'VANISHED');
  assert.equal(bucketOf(rapiOut,'auto:nikke-16:20161:1:1'),'VANISHED');
  assert.equal(bucketOf(rapiOut,'auto:nikke-16:20161:0:g1-c0'),'VANISHED');
});


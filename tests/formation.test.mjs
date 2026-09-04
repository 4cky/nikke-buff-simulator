import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {normalizeFormationState,isSelectableTarget,burstGate,targetVerdict,hasOtherBurstStageMember,burstOneClass,
  resolveFormation,gateTextFor,conflictBadge,burstEventOf,
  burstStageOf,targetBurstStageOf,formationBranchOf,evaluateFormationBranch,
  previouslyCastPolarityOf,evaluatePreviouslyCast,evaluatePreviouslyCastInRotation,
  reentryTargets,validateRotation,rotationNextOptions,rotationFromStageCasters,
  formationDependentReentries,effectiveReentryByChar,
  isTreasureEligible,
  buffAxisCoverage,buffAxisGroups,memberAxisRoles,
  placeMember,moveMember,removeMemberAt,portraitUrlFor,trackMember,
  normalizeRosterFilters,rosterFilterCount,filterRoster,
  groupEffectsForGraph,isGraphable} from '../formation-model.js';
import {parseFormationQuery,formatFormationQuery} from '../formation.js';
import {CATEGORIES} from '../view-model.js';
import {validateDataset} from '../scripts/validate-data.mjs';

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

test('formation allows 0-5 members, drops duplicates and unknown ids',()=>{
  assert.deepEqual(normalizeFormationState({members:[],burst:'none',targetIndex:0},characters),
    {members:[],burst:'none',targetIndex:-1,burstCasters:{1:null,2:null,3:null},rotation:[],rotationIndex:-1,treasure:[]});
  const full = normalizeFormationState({members:['nikke-1','nikke-2','nikke-1','nikke-unknown','nikke-3'],
    burst:'9',targetIndex:7},characters);
  assert.deepEqual(full.members,['nikke-1','nikke-2','nikke-3']);
  assert.equal(full.burst,'none');
  assert.equal(full.targetIndex,0);
  const six = normalizeFormationState({members:['nikke-1','nikke-2','nikke-3','nikke-1','nikke-2','nikke-3'],
    burst:'1',targetIndex:2},characters);
  assert.ok(six.members.length<=5);
  assert.equal(isSelectableTarget({members:['nikke-1']},0),true);
  assert.equal(isSelectableTarget({members:['nikke-1']},1),false);
  assert.equal(isSelectableTarget({members:[]},0),false);
});

test('burst gate needs an explicit stage and matching caster',()=>{
  const burst = {...base,effect_id:'b1',character_id:'nikke-1',skill_slot:'Burst',target_type:'all_allies',target:'all allies.'};
  assert.equal(burstGate(burst,characters[0],'none').pass,false);
  assert.equal(burstGate(burst,characters[0],'2').pass,false);
  assert.equal(burstGate(burst,characters[0],'1').pass,true);
  const staged = {...burst,effect_id:'b2',section_condition:{stage:2}};
  assert.equal(burstGate(staged,characters[1],'2').pass,true);
  assert.equal(burstGate(staged,characters[1],'3').pass,false);
});

test('self and all_allies resolve structurally',()=>{
  const self = {...base,effect_id:'s1',character_id:'nikke-1',target_type:'self',target:'self.'};
  assert.equal(targetVerdict(self,characters[0]).applies,true);
  assert.equal(targetVerdict(self,characters[1]).applies,false);
  const all = {...base,effect_id:'a1',character_id:'nikke-1',target_type:'all_allies',target:'all allies.'};
  assert.equal(targetVerdict(all,characters[1]).applies,true);
});

test('class/weapon/element need structured axes, never text guesses',()=>{
  const noAxis = {...base,effect_id:'c1',character_id:'nikke-1',target_type:'class',target:'all Supporter allies.'};
  assert.equal(targetVerdict(noAxis,characters[1]).applies,false);
  const withAxis = {...noAxis,effect_id:'c2',target_class:'Supporter'};
  assert.equal(targetVerdict(withAxis,characters[1]).applies,true);
  assert.equal(targetVerdict(withAxis,characters[0]).applies,false);
  const sg = {...base,effect_id:'w1',character_id:'nikke-1',target_type:'weapon',target:'shotguns',target_weapon:'shotgun'};
  assert.equal(targetVerdict(sg,characters[1]).applies,true);
  assert.equal(targetVerdict(sg,characters[0]).applies,false);
  const el = {...base,effect_id:'e1',character_id:'nikke-1',target_type:'element',target:'Water',target_element:'water'};
  assert.equal(targetVerdict(el,characters[1]).applies,true);
});

test('ranked selection is conditional and out-of-scope stays unknown',()=>{
  const ranked = {...base,effect_id:'r1',character_id:'nikke-1',target_type:'selected_allies',
    target:'2 allies',target_count:2,target_selection:'highest_final_atk'};
  const verdict = targetVerdict(ranked,characters[1]);
  assert.equal(verdict.applies,false);
  assert.equal(verdict.reason,'ranked-or-conditional-selection');
  // Stat-ranked picks are understood but depend on育成 values: conditional.
  const out = resolveFormation({members:characters.slice(0,2),targetIndex:1,burst:'none',
    effectsByChar:byChar([ranked]),characters});
  assert.ok(out.gated.some(r=>r.effect.effect_id==='r1'
    &&r.reasons.includes('ranked-or-conditional-selection')));
  assert.equal(out.unknown.length,0);
  assert.equal(out.deterministic.length,0);
  const hit = {...base,effect_id:'h1',character_id:'nikke-1',target_type:'hit_targets',target:'enemy'};
  assert.equal(targetVerdict(hit,characters[1]).reason,'out-of-formation-scope');
});

test('unselected Burst stays visible as gated, mismatch stays collapsed',()=>{
  const burst = {...base,effect_id:'b3',character_id:'nikke-1',skill_slot:'Burst',
    target_type:'all_allies',target:'all allies.',trigger:'Burst Skill activation',condition:''};
  const members = characters.slice(0,2);
  const none = resolveFormation({members,targetIndex:1,burst:'none',
    effectsByChar:byChar([burst]),characters});
  assert.equal(none.gated.length,1);
  assert.deepEqual(none.gated[0].reasons,['burst-not-selected']);
  assert.equal(none.deterministic.length,0);
  assert.equal(none.unknown.length,0);
  const wrong = resolveFormation({members,targetIndex:1,burst:'2',
    effectsByChar:byChar([burst]),characters});
  assert.equal(wrong.gated.length,0);
  assert.equal(wrong.deterministic.length,0);
  const right = resolveFormation({members,targetIndex:1,burst:'1',
    effectsByChar:byChar([burst]),characters});
  assert.equal(right.gated.length,1);
  assert.ok(right.gated[0].reasons.includes('conditional-or-gated'));
});

test('formation URL query roundtrips and sanitizes',()=>{
  const ids = ['nikke-1','nikke-2'];
  const query = formatFormationQuery({members:ids,burst:'2',targetIndex:1});
  assert.equal(query,'formation=nikke-1%2Cnikke-2&fburst=2&ftarget=1');
  assert.deepEqual(parseFormationQuery(`?${query}`,characters),
    {members:ids,burst:'2',targetIndex:1,burstCasters:{1:null,2:null,3:null},rotation:[],rotationIndex:-1,treasure:[]});
  assert.deepEqual(parseFormationQuery('',characters),{members:[],burst:'none',targetIndex:-1,burstCasters:{1:null,2:null,3:null},rotation:[],rotationIndex:-1,treasure:[]});
  // Unknown ids, duplicates and bad values are sanitized, never throw.
  const dirty = parseFormationQuery('?formation=nikke-1,nikke-1,nikke-x&fburst=9&ftarget=7',characters);
  assert.deepEqual(dirty,{members:['nikke-1'],burst:'none',targetIndex:0,burstCasters:{1:null,2:null,3:null},rotation:[],rotationIndex:-1,treasure:[]});
});
test('rotation URLs roundtrip; legacy casters migrate',()=>{
  const query = formatFormationQuery({members:['nikke-1','nikke-2'],burst:'none',targetIndex:0,
    burstCasters:{1:null,2:null,3:null},
    rotation:[{caster:'nikke-1',stage:1},{caster:'nikke-2',stage:2}],rotationIndex:1});
  assert.ok(query.includes('frot=nikke-1%401%2Cnikke-2%402'));
  assert.ok(query.includes('frotidx=1'));
  assert.ok(!query.includes('fburstcaster'));
  const back = parseFormationQuery(`?${query}`,characters);
  assert.deepEqual(back.rotation,
    [{caster:'nikke-1',stage:1},{caster:'nikke-2',stage:2}]);
  assert.equal(back.rotationIndex,1);
  // Legacy per-stage casters migrate into rotation entries.
  const migrated = parseFormationQuery(
    '?formation=nikke-1,nikke-2&fburst=2&fburstcaster1=nikke-1&fburstcaster2=nikke-2',characters);
  assert.deepEqual(migrated.rotation,
    [{caster:'nikke-1',stage:1},{caster:'nikke-2',stage:2}]);
  assert.equal(migrated.rotationIndex,1);
  // Legacy casters lacking the stage never migrate.
  const dropped = parseFormationQuery(
    '?formation=nikke-1,nikke-2&fburstcaster3=nikke-2',characters);
  assert.deepEqual(dropped.rotation,[]);
  assert.equal(dropped.rotationIndex,-1);
});

test('drag and drop transitions: place, swap, relocate, remove',()=>{
  // Roster portrait -> empty slot appends.
  assert.deepEqual(placeMember(['nikke-1'],'nikke-2',4),['nikke-1','nikke-2']);
  // Roster portrait -> occupied slot replaces the occupant.
  assert.deepEqual(placeMember(['nikke-1','nikke-2'],'nikke-3',0),['nikke-3','nikke-2']);
  // Roster portrait already present -> swap with the occupant.
  assert.deepEqual(placeMember(['nikke-1','nikke-2'],'nikke-1',1),['nikke-2','nikke-1']);
  // Same-slot drop is a no-op.
  assert.deepEqual(placeMember(['nikke-1','nikke-2'],'nikke-2',1),['nikke-1','nikke-2']);
  // Full formation: occupied drop replaces, empty-area drop is a no-op.
  const full = ['nikke-1','nikke-2','nikke-3','nikke-4','nikke-5'];
  assert.deepEqual(placeMember(full,'nikke-6',0),['nikke-6','nikke-2','nikke-3','nikke-4','nikke-5']);
  assert.deepEqual(placeMember(full,'nikke-6',7),full);
  // Member -> occupied slot swaps.
  assert.deepEqual(moveMember(['nikke-1','nikke-2','nikke-3'],0,2),['nikke-3','nikke-2','nikke-1']);
  // Member -> empty slot relocates to the end.
  assert.deepEqual(moveMember(['nikke-1','nikke-2'],0,4),['nikke-2','nikke-1']);
  // Invalid source index leaves the formation unchanged.
  assert.deepEqual(moveMember(['nikke-1'],7,0),['nikke-1']);
  // Remove bin drops the member and compacts.
  assert.deepEqual(removeMemberAt(['nikke-1','nikke-2','nikke-3'],1),['nikke-1','nikke-3']);
  assert.deepEqual(removeMemberAt(['nikke-1'],0),[]);
  // Duplicates stay impossible through every transition.
  const placed = placeMember(['nikke-1','nikke-2'],'nikke-1',0);
  assert.equal(new Set(placed).size,placed.length);
});

test('portrait URLs derive from verified GG source_id, never guessed hosts',()=>{
  assert.equal(portraitUrlFor({character_id:'nikke-10',source_id:'10'}),
    'https://static.dotgg.gg/nikke/characters/10.webp');
  assert.equal(portraitUrlFor({character_id:'nikke-330',source_id:'330'}),
    'https://static.dotgg.gg/nikke/characters/330.webp');
  // Non-numeric or missing ids yield null so the UI falls back to initials.
  assert.equal(portraitUrlFor({character_id:'nikke-x',source_id:'slug-name'}),null);
  assert.equal(portraitUrlFor({character_id:'nikke-x'}),null);
  assert.equal(portraitUrlFor(null),null);
  // Explicit pipeline URLs are accepted only on verified GG hosts.
  assert.equal(portraitUrlFor({source_id:'10',portrait_url:'https://static.dotgg.gg/nikke/characters/10.webp'}),
    'https://static.dotgg.gg/nikke/characters/10.webp');
  assert.equal(portraitUrlFor({source_id:'10',portrait_url:'https://evil.example/a.webp'}),
    'https://static.dotgg.gg/nikke/characters/10.webp');
});
test('roster filters combine seven axes with AND, empty means unselected',()=>{
  const roster = [
    {character_id:'nikke-1',character_name:'Alpha',manufacturer:'Tetra',burst_stage:[1],element:'Electric',class:'Attacker',weapon_type:'AR',rarity:'SSR'},
    {character_id:'nikke-2',character_name:'Beta',manufacturer:'Tetra',burst_stage:[2],element:'Electric',class:'Supporter',weapon_type:'SG',rarity:'SR'},
    {character_id:'nikke-3',character_name:'Gamma',manufacturer:'Elysion',burst_stage:[1],element:'Fire',class:'Defender',weapon_type:'RL',rarity:'R'},
  ];
  const ids = list=>list.map(c=>c.character_id);
  assert.deepEqual(ids(filterRoster(roster,{})),['nikke-1','nikke-2','nikke-3']);
  assert.equal(rosterFilterCount({}),0);
  assert.deepEqual(ids(filterRoster(roster,{query:'alp'})),['nikke-1']);
  assert.deepEqual(ids(filterRoster(roster,{manufacturer:'Tetra'})),['nikke-1','nikke-2']);
  assert.deepEqual(ids(filterRoster(roster,{burst:'1'})),['nikke-1','nikke-3']);
  assert.deepEqual(ids(filterRoster(roster,{element:'Electric'})),['nikke-1','nikke-2']);
  assert.deepEqual(ids(filterRoster(roster,{class:'Supporter'})),['nikke-2']);
  assert.deepEqual(ids(filterRoster(roster,{weapon:'RL'})),['nikke-3']);
  assert.deepEqual(ids(filterRoster(roster,{rarity:'SSR'})),['nikke-1']);
  // The documented example: Tetra AND Burst I AND Electric.
  assert.deepEqual(ids(filterRoster(roster,{manufacturer:'Tetra',burst:'1',element:'Electric'})),['nikke-1']);
  assert.equal(rosterFilterCount({manufacturer:'Tetra',burst:'1',element:'Electric'}),3);
  // Clearing returns the full roster.
  assert.deepEqual(ids(filterRoster(roster,normalizeRosterFilters())),['nikke-1','nikke-2','nikke-3']);
  // No match is an empty list, never an error.
  assert.deepEqual(filterRoster(roster,{manufacturer:'Tetra',element:'Fire'}),[]);
});

test('burst caster unset reproduces pre-caster behavior exactly',()=>{
  const a = {...base,effect_id:'c1',character_id:'nikke-1',skill_slot:'Burst',
    target_type:'all_allies',target:'all allies.',trigger:'Burst Skill activation',condition:''};
  const b = {...base,effect_id:'c2',character_id:'nikke-2',skill_slot:'Burst',
    target_type:'all_allies',target:'all allies.',trigger:'Burst Skill activation',condition:''};
  const members = [
    {...characters[0],burst_stage:[1]},
    {...characters[1],burst_stage:[1]},
  ];
  const args = {members,targetIndex:0,burst:'1',effectsByChar:byChar([a,b]),characters};
  const legacy = resolveFormation(args);
  const unset = resolveFormation({...args,burstCasters:{1:null,2:null,3:null}});
  const unknown = resolveFormation({...args,burstCasters:{1:'nikke-unknown',2:null,3:null}});
  assert.deepEqual(unset,legacy);
  assert.deepEqual(unknown,legacy);
});

test('each Burst stage reads only its own caster',()=>{
  const burst = (id,char)=>({...base,effect_id:id,character_id:char,skill_slot:'Burst',
    target_type:'all_allies',target:'all allies.',trigger:'Burst Skill activation',condition:''});
  const members = [
    {...characters[0],burst_stage:[1,2,3]},
    {...characters[1],burst_stage:[1,2,3]},
    {...characters[2],burst_stage:[1,2,3]},
  ];
  const effects = byChar([burst('e1','nikke-1'),burst('e2','nikke-2'),burst('e3','nikke-3')]);
  const casters = {1:'nikke-1',2:'nikke-2',3:'nikke-3'};
  for(const stage of ['1','2','3']){
    const out = resolveFormation({members,targetIndex:0,burst:stage,burstCasters:casters,
      effectsByChar:effects,characters});
    // Own-Burst effects of non-casters leave the visible buckets entirely.
    const visible = [...out.deterministic,...out.gated,...out.unknown].map(r=>r.effect.effect_id);
    assert.deepEqual(visible,['e'+stage]);
    assert.equal(out.gated.filter(r=>r.reasons.includes('burst-caster-mismatch')).length,0);
  }
});

test('burst caster narrows Burst-slot effects without touching Skills',()=>{
  const burstA = {...base,effect_id:'c3',character_id:'nikke-1',skill_slot:'Burst',
    target_type:'all_allies',target:'all allies.',trigger:'Burst Skill activation',condition:''};
  const burstB = {...base,effect_id:'c4',character_id:'nikke-2',skill_slot:'Burst',
    target_type:'all_allies',target:'all allies.',trigger:'Burst Skill activation',condition:''};
  const skillB = {...base,effect_id:'c5',character_id:'nikke-2',skill_slot:'Skill 1',
    target_type:'all_allies',target:'all allies.',trigger:'Skill 1 activation',condition:''};
  const members = [
    {...characters[0],burst_stage:[1]},
    {...characters[1],burst_stage:[1]},
  ];
  const out = resolveFormation({members,targetIndex:1,burst:'1',
    burstCasters:{1:'nikke-1',2:null,3:null},
    effectsByChar:byChar([burstA,burstB,skillB]),characters});
  const everywhere = [...out.deterministic,...out.gated,...out.unknown,...out.quarantined];
  // Another member's own Burst did not fire: absent from every bucket.
  assert.ok(!everywhere.some(r=>r.effect.effect_id==='c4'));
  // The caster's established Burst fire and the bare Skill activation are
  // formation-decidable: deterministic. Skill-slot effects stay untouched.
  assert.ok(out.deterministic.some(r=>r.effect.effect_id==='c3'));
  assert.ok(out.deterministic.some(r=>r.effect.effect_id==='c5'));
  assert.equal(out.gated.length,0);
  assert.equal(out.quarantined.length,0);
});

test('burst casters follow swaps by identity and clear per stage on removal',()=>{
  assert.equal(trackMember(['nikke-1','nikke-2'],'nikke-2'),'nikke-2');
  assert.equal(trackMember(['nikke-2','nikke-1'],'nikke-2'),'nikke-2');
  assert.equal(trackMember(['nikke-1'],'nikke-2'),null);
  assert.equal(trackMember([], 'nikke-1'),null);
  assert.equal(trackMember(['nikke-1'],null),null);
  const swapped = moveMember(['nikke-1','nikke-2'],0,1);
  assert.equal(trackMember(swapped,'nikke-2'),'nikke-2');
  const removed = removeMemberAt(['nikke-1','nikke-2'],1);
  assert.equal(trackMember(removed,'nikke-2'),null);
  const normalized = normalizeFormationState(
    {members:['nikke-1','nikke-2'],burst:'1',targetIndex:0,
      burstCasters:{1:'nikke-1',2:'nikke-2',3:'nikke-2'}},characters);
  assert.deepEqual(normalized.burstCasters,{1:'nikke-1',2:'nikke-2',3:'nikke-2'});
  // Removing nikke-2 clears only the stages that named it.
  const dropped = normalizeFormationState(
    {members:['nikke-1'],burst:'1',targetIndex:0,
      burstCasters:{1:'nikke-1',2:'nikke-2',3:'nikke-9'}},characters);
  assert.deepEqual(dropped.burstCasters,{1:'nikke-1',2:null,3:null});
});

test('target changes never move burst casters',()=>{
  const state = normalizeFormationState({members:['nikke-1','nikke-2'],burst:'1',targetIndex:0,
    burstCasters:{1:'nikke-1',2:'nikke-2',3:null}},characters);
  const moved = normalizeFormationState({...state,targetIndex:1},characters);
  assert.deepEqual(moved.burstCasters,state.burstCasters);
});

test('multi-stage casters use the displayed stage only',()=>{
  const redHood = {...characters[0],burst_stage:[1,2,3]};
  const burst = (id,stage)=>({...base,effect_id:id,character_id:'nikke-1',skill_slot:'Burst',
    target_type:'all_allies',target:'all allies.',trigger:'Burst Skill activation',condition:'',
    section_condition:{stage}});
  const members = [redHood,{...characters[1],burst_stage:[1,2,3]}];
  const effects = byChar([burst('m1',1),burst('m3',3)]);
  const asOne = resolveFormation({members,targetIndex:1,burst:'1',
    burstCasters:{1:'nikke-1',2:null,3:null},effectsByChar:effects,characters});
  // Stage I fires with nikke-1 as caster: the stage-scoped Burst effect is
  // formation-proven, hence deterministic.
  assert.ok(asOne.deterministic.some(r=>r.effect.effect_id==='m1'));
  assert.equal(asOne.gated.filter(r=>r.reasons.includes('burst-caster-mismatch')).length,0);
  // A stage-scoped Burst record fired at another stage stays visible as
  // gated burst-not-selected (it is "that character's Burst at stage N",
  // not own-Burst, so it must not vanish like one).
  assert.ok(asOne.gated.some(r=>r.effect.effect_id==='m3'
    &&r.reasons.includes('burst-not-selected')));
  const asThree = resolveFormation({members,targetIndex:1,burst:'3',
    burstCasters:{1:null,2:null,3:'nikke-2'},effectsByChar:effects,characters});
  // m1 is a stage-I Burst shown while stage III fires: burst-not-selected.
  assert.ok(asThree.gated.some(r=>r.effect.effect_id==='m1'
    &&r.reasons.includes('burst-not-selected')));
  // m3 is Red Hood's stage-III Burst but nikke-2 fired stage III: the
  // Burst did not fire for its owner, so it is caster-mismatch gated
  // (visible with an explicit reason, never silently dropped).
  const mismatch = asThree.gated.filter(r=>r.reasons.includes('burst-caster-mismatch'));
  assert.equal(mismatch.length,1);
  assert.equal(mismatch[0].effect.effect_id,'m3');
});

test('non-own Burst effects of other members stay mismatch-gated',()=>{
  const stageEntry = {...base,effect_id:'n1',character_id:'nikke-2',skill_slot:'Burst',
    target_type:'all_allies',target:'all allies.',trigger:'Activates when entering Burst Stage 3',condition:''};
  const members = [
    {...characters[0],burst_stage:[1,2,3]},
    {...characters[1],burst_stage:[1,2,3]},
  ];
  const out = resolveFormation({members,targetIndex:0,burst:'3',
    burstCasters:{1:null,2:null,3:'nikke-1'},effectsByChar:byChar([stageEntry]),characters});
  const mismatch = out.gated.filter(r=>r.reasons.includes('burst-caster-mismatch'));
  assert.equal(mismatch.length,1);
  assert.equal(mismatch[0].effect.effect_id,'n1');
});

test('burst casters persist in share URLs with legacy compatibility',()=>{
  const query = formatFormationQuery({members:['nikke-1','nikke-2'],burst:'1',targetIndex:0,
    burstCasters:{1:'nikke-2',2:null,3:null}});
  assert.ok(query.includes('fburstcaster1=nikke-2'));
  assert.ok(!query.includes('fburstcaster=nikke-2'));
  const back = parseFormationQuery(`?${query}`,characters);
  assert.deepEqual(back.burstCasters,{1:'nikke-2',2:null,3:null});
  assert.deepEqual(back.members,['nikke-1','nikke-2']);
  // URLs written before casters existed restore as unspecified.
  const legacy = parseFormationQuery('?formation=nikke-1,nikke-2&fburst=1',characters);
  assert.deepEqual(legacy.burstCasters,{1:null,2:null,3:null});
  // A lone legacy fburstcaster restores as stage 1 without breaking.
  const compat = parseFormationQuery('?formation=nikke-1,nikke-2&fburstcaster=nikke-2',characters);
  assert.deepEqual(compat.burstCasters,{1:'nikke-2',2:null,3:null});
  // Unknown caster ids never become selections.
  const unknown = parseFormationQuery('?formation=nikke-1&fburstcaster2=nikke-x',characters);
  assert.deepEqual(unknown.burstCasters,{1:null,2:null,3:null});
});
test('graph groups keep one record per bar and never sum values',()=>{
  const row = (id,char,value,unit='percent',type='atk')=>({effect:{...base,effect_id:id,character_id:char,
    buff_type:type,value,value_unit:unit},caster:{character_id:char,character_name:char},bucket:'deterministic',reasons:[],gateText:[],conflict:null,relation:'allies'});
  const groups = groupEffectsForGraph([
    row('g1','nikke-1',30),row('g2','nikke-2',18),row('g3','nikke-3',12),
  ]);
  assert.equal(groups.length,1);
  assert.equal(groups[0].bars.length,3);
  // No summation anywhere: original values intact, widths share the max.
  assert.deepEqual(groups[0].bars.map(r=>r.effect.value),[30,18,12]);
  assert.deepEqual(groups[0].bars.map(r=>r.graphWidthPct),[100,60,40]);
  assert.equal(groups[0].peak,30);
});

test('graph groups split by unit and semantic type',()=>{
  const row = (id,type,unit,value)=>({effect:{...base,effect_id:id,character_id:'nikke-1',
    buff_type:type,value,value_unit:unit},caster:{character_id:'nikke-1',character_name:'A'},bucket:'deterministic',reasons:[],gateText:[],conflict:null,relation:'allies'});
  const groups = groupEffectsForGraph([
    row('u1','atk','percent',30),
    row('u2','atk','seconds',13),
    row('u3','attack_damage','percent',20),
    row('u4','caster_atk_based_atk','caster_atk_percent',64),
  ]);
  assert.equal(groups.length,4);
  assert.ok(groups.every(g=>g.bars.length===1));
});

test('booleans, missing values and immunity become badges, not bars',()=>{
  const row = (id,patch)=>({effect:{...base,effect_id:id,character_id:'nikke-1',buff_type:'atk',
    value:10,value_unit:'percent',...patch},caster:{character_id:'nikke-1',character_name:'A'},bucket:'deterministic',reasons:[],gateText:[],conflict:null,relation:'allies'});
  assert.equal(isGraphable(row('b0',{}).effect),true);
  assert.equal(isGraphable(row('b1',{buff_type:'invulnerability',value:true,value_unit:'boolean'}).effect),false);
  assert.equal(isGraphable(row('b2',{value:null}).effect),false);
  assert.equal(isGraphable(row('b3',{buff_type:'debuff_immunity',value:1,value_unit:'count'}).effect),false);
  const groups = groupEffectsForGraph([
    row('b4',{buff_type:'invulnerability',value:true,value_unit:'boolean'}),
    row('b5',{value:null}),
    row('b6',{value:25}),
  ]);
  assert.equal(groups.length,2);
  const numeric = groups.find(g=>g.buffType==='atk'&&g.valueUnit==='percent');
  assert.equal(numeric.bars.length,1);
  assert.equal(numeric.badges.length,1);
  assert.equal(numeric.bars[0].graphWidthPct,100);
});

test('graph grouping preserves bucket separation and stack flags',()=>{
  const row = (id,value,stack=null)=>({effect:{...base,effect_id:id,character_id:'nikke-1',
    buff_type:'atk',value,value_unit:'percent',stack_count:stack,
    max_raw_value:stack?value*stack:value},caster:{character_id:'nikke-1',character_name:'A'},bucket:'gated',reasons:['conditional-or-gated'],gateText:['Trigger: x'],conflict:null,relation:'allies'});
  const groups = groupEffectsForGraph([row('s1',13,10),row('s2',18,null)]);
  assert.equal(groups.length,1);
  assert.equal(groups[0].bars[0].effect.effect_id,'s2');
  assert.equal(groups[0].bars[1].effect.stack_count,10);
});
test('dashboard headers derive counts from groups without touching records',()=>{
  const row = (id,char)=>({effect:{...base,effect_id:id,character_id:char,
    buff_type:'atk',value:10,value_unit:'percent'},caster:{character_id:char,character_name:char},bucket:'deterministic',reasons:[],gateText:[],conflict:null,relation:'allies'});
  const groups = groupEffectsForGraph([row('h1','nikke-1'),row('h2','nikke-2')]);
  assert.equal(groups.length,1);
  const total = groups.reduce((n,g)=>n+g.bars.length+g.badges.length,0);
  assert.equal(total,2);
  assert.deepEqual(groups[0].bars.map(r=>r.effect.effect_id),['h1','h2']);
});
test('burst events classify own, full, ally and other separately',()=>{
  const classify = (trigger,condition='',slot='Skill 1')=>
    burstEventOf({trigger,condition,skill_slot:slot,character_id:'nikke-1'});
  assert.equal(classify('Burst Skill使用時','', 'Burst'),'own_burst');
  assert.equal(classify('Burst Skill activation','','Burst'),'own_burst');
  assert.equal(classify('Activates if the skill user used her Burst Skill'),'own_burst');
  assert.equal(classify('Activates when entering Full Burst'),'full_burst');
  assert.equal(classify('Activates when Full Burst ends if an ally is present'),'full_burst');
  assert.equal(classify('Activates when an ally uses a Burst Skill'),'ally_burst');
  assert.equal(classify('Activates when using Burst Skill'),'other');
  assert.equal(classify('Burst Skill使用時','','Skill 1'),'other');
  assert.equal(classify('Activates when entering Burst Stage 3','','Burst'),'other');
  // Explicit own phrasing stays own_burst even on Skill slots.
  assert.equal(classify('Activates if the skill user used her Burst Skill'),'own_burst');
  assert.equal(classify('Activates when the skill user uses own Burst Skill'),'own_burst');
  assert.equal(classify('Activates when self uses Burst Skill'),'own_burst');
  // Stage-scoped Burst-slot fire is NOT own_burst: "Burst Skill
  // activation" plus a Burst stage means "this character's Burst fired
  // at that stage" (Rapi: Red Hood shapes).
  const scoped = (stage)=>({trigger:'Burst Skill activation',
    condition:`Burst Stage ${stage}\nAffects self.`,skill_slot:'Burst',
    character_id:'nikke-1',section_condition:{burst_stage:stage}});
  assert.equal(burstEventOf(scoped(1)),'other');
  assert.equal(burstEventOf(scoped(3)),'other');
  assert.equal(burstStageOf(scoped(1)),1);
  assert.equal(burstStageOf(scoped(3)),3);
  assert.equal(burstStageOf({trigger:'Burst Skill activation',skill_slot:'Burst',
    character_id:'nikke-1',section_condition:null}),null);
  assert.equal(burstStageOf({trigger:'Activates when entering Burst Stage 3',
    skill_slot:'Burst',character_id:'nikke-1',section_condition:null}),3);
  // burstStageOf is Burst-slot-only: Skill-slot internal stage counters
  // (Over Energy, Golden Chip, ...) are never read as Burst stages.
  assert.equal(burstStageOf({trigger:'x',skill_slot:'Skill 2',
    character_id:'nikke-1',section_condition:{stage:1}}),null);
});

test('matching caster keeps own Burst visible, others vanish',()=>{
  const own = (id,char)=>({...base,effect_id:id,character_id:char,skill_slot:'Skill 2',
    target_type:'all_allies',target:'all allies.',
    trigger:'Activates if the skill user used her Burst Skill',condition:''});
  const members = [characters[0],characters[1]];
  const effects = byChar([own('o1','nikke-1'),own('o2','nikke-2')]);
  const firing = resolveFormation({members,targetIndex:0,burst:'1',
    burstCasters:{1:'nikke-1',2:null,3:null},effectsByChar:effects,characters});
  // Established own-Burst firing is formation-proven: deterministic.
  assert.ok(firing.deterministic.some(r=>r.effect.effect_id==='o1'));
  const everywhere = [...firing.deterministic,...firing.gated,...firing.unknown,...firing.quarantined];
  assert.ok(!everywhere.some(r=>r.effect.effect_id==='o2'));
});

test('Full Burst effects ignore caster identity',()=>{
  const full = (id,char)=>({...base,effect_id:id,character_id:char,skill_slot:'Skill 1',
    target_type:'all_allies',target:'all allies.',
    trigger:'Activates when entering Full Burst',condition:''});
  const members = [characters[0],characters[1]];
  const effects = byChar([full('f1','nikke-1'),full('f2','nikke-2')]);
  for(const casters of [{1:'nikke-1',2:null,3:null},{1:'nikke-2',2:null,3:null},{1:null,2:null,3:null}]){
    const out = resolveFormation({members,targetIndex:0,burst:'1',burstCasters:casters,
      effectsByChar:effects,characters});
    // Pure Full Burst timing never blocks: deterministic under any caster.
    assert.ok(out.deterministic.some(r=>r.effect.effect_id==='f1'));
    assert.ok(out.deterministic.some(r=>r.effect.effect_id==='f2'));
    assert.equal(out.gated.filter(r=>r.reasons.includes('burst-caster-mismatch')).length,0);
  }
});

test('ally Burst phrasing is never confused with own Burst',()=>{
  const ally = {...base,effect_id:'a1',character_id:'nikke-2',skill_slot:'Skill 1',
    target_type:'all_allies',target:'all allies.',
    trigger:'Activates when an ally uses a Burst Skill',condition:''};
  assert.equal(burstEventOf(ally),'ally_burst');
  const members = [characters[0],characters[1]];
  const out = resolveFormation({members,targetIndex:0,burst:'1',
    burstCasters:{1:'nikke-1',2:null,3:null},effectsByChar:byChar([ally]),characters});
  assert.ok(out.gated.some(r=>r.effect.effect_id==='a1'));
});

test('switching the displayed stage flips whose own Burst holds',()=>{
  const own = (id,char)=>({...base,effect_id:id,character_id:char,skill_slot:'Burst',
    target_type:'all_allies',target:'all allies.',trigger:'Burst Skill activation',condition:''});
  const members = [
    {...characters[0],burst_stage:[1,2,3]},
    {...characters[1],burst_stage:[1,2,3]},
  ];
  const effects = byChar([own('w1','nikke-1'),own('w2','nikke-2')]);
  const casters = {1:'nikke-1',2:'nikke-2',3:'nikke-1'};
  const visible = stage=>{ const out = resolveFormation({members,targetIndex:0,burst:stage,
    burstCasters:casters,effectsByChar:effects,characters});
    return [...out.deterministic,...out.gated,...out.unknown].map(r=>r.effect.effect_id); };
  assert.deepEqual(visible('1'),['w1']);
  assert.deepEqual(visible('2'),['w2']);
  assert.deepEqual(visible('3'),['w1']);
});

test('first-time and history qualifiers never auto-resolve',()=>{
  const compound = {...base,effect_id:'h1',character_id:'nikke-1',skill_slot:'Skill 1',
    target_type:'all_allies',target:'all allies.',
    trigger:'Activates when entering Full Burst for the first time after using own Burst Skill',condition:''};
  assert.equal(burstEventOf(compound),'full_burst');
  const members = [characters[0],characters[1]];
  const out = resolveFormation({members,targetIndex:0,burst:'1',
    burstCasters:{1:'nikke-1',2:null,3:null},effectsByChar:byChar([compound]),characters});
  assert.ok(out.gated.some(r=>r.effect.effect_id==='h1'));
  assert.equal(out.deterministic.length,0);
});

test('Rapi Burst I CDR holds at Stage I with Rapi as caster',()=>{
  const rapi = {character_id:'nikke-16',character_name:'Rapi: Red Hood',burst_stage:[1,3],
    element:'Fire',weapon_type:'AR',class:'Attacker'};
  const ally = {character_id:'nikke-82',character_name:'Liter',burst_stage:[1],
    element:'Wind',weapon_type:'AR',class:'Supporter'};
  const cdr = {...base,effect_id:'rapi-b1-cdr',character_id:'nikke-16',skill_slot:'Burst',
    target_type:'self',target:'self.',trigger:'Burst Skill activation',
    condition:'Burst Stage 1\nAffects self.',section_condition:{burst_stage:1}};
  const out = resolveFormation({members:[rapi,ally],targetIndex:0,burst:'1',
    burstCasters:{1:'nikke-16',2:null,3:null},
    effectsByChar:byChar([cdr]),characters:[rapi,ally]});
  // Stage I fires with Rapi as caster: stage-scoped firing is proven.
  assert.equal(out.deterministic.length,1);
  assert.equal(out.deterministic[0].effect.effect_id,'rapi-b1-cdr');
  assert.equal(out.gated.length,0);
});

test('Rapi Burst III effect holds at Stage III with Rapi as caster',()=>{
  const rapi = {character_id:'nikke-16',character_name:'Rapi: Red Hood',burst_stage:[1,3],
    element:'Fire',weapon_type:'AR',class:'Attacker'};
  const ally = {character_id:'nikke-222',character_name:'Scarlet',burst_stage:[3],
    element:'Fire',weapon_type:'AR',class:'Attacker'};
  const proj = {...base,effect_id:'rapi-b3-proj',character_id:'nikke-16',skill_slot:'Burst',
    target_type:'self',target:'self.',trigger:'Burst Skill activation',
    condition:'Burst Stage 3\nAffects self.',section_condition:{burst_stage:3}};
  const out = resolveFormation({members:[rapi,ally],targetIndex:0,burst:'3',
    burstCasters:{1:null,2:null,3:'nikke-16'},
    effectsByChar:byChar([proj]),characters:[rapi,ally]});
  assert.equal(out.deterministic.length,1);
  assert.equal(out.deterministic[0].effect.effect_id,'rapi-b3-proj');
  assert.equal(out.gated.length,0);
});

test('selected-stage-external Burst-slot effects stay burst-not-selected',()=>{
  const scoped = (id,stage)=>({...base,effect_id:id,character_id:'nikke-16',skill_slot:'Burst',
    target_type:'self',target:'self.',trigger:'Burst Skill activation',
    condition:`Burst Stage ${stage}\nAffects self.`,section_condition:{burst_stage:stage}});
  const rapi = {character_id:'nikke-16',character_name:'Rapi',burst_stage:[1,3],
    element:'Fire',weapon_type:'AR',class:'Attacker'};
  const ally = {character_id:'nikke-82',character_name:'Liter',burst_stage:[1],
    element:'Wind',weapon_type:'AR',class:'Supporter'};
  const effects = byChar([scoped('x1',1),scoped('x3',3)]);
  const asThree = resolveFormation({members:[rapi,ally],targetIndex:0,burst:'3',
    burstCasters:{1:null,2:null,3:'nikke-16'},effectsByChar:effects,characters:[rapi,ally]});
  const notSelected = asThree.gated.filter(r=>r.reasons.includes('burst-not-selected'));
  assert.deepEqual(notSelected.map(r=>r.effect.effect_id),['x1']);
  assert.ok(asThree.deterministic.some(r=>r.effect.effect_id==='x3'));
});

test('Skill-slot Full Burst effects never become burst-not-selected',()=>{
  const full = {...base,effect_id:'s2full',character_id:'nikke-17',skill_slot:'Skill 2',
    target_type:'all_allies',target:'all allies.',
    trigger:'Activates when entering Full Burst.',condition:'Activates when entering Full Burst. Affects all allies.'};
  const anis = {character_id:'nikke-17',character_name:'Anis: Star',burst_stage:[1],
    element:'Wind',weapon_type:'AR',class:'Supporter'};
  const scarlet = {character_id:'nikke-222',character_name:'Scarlet',burst_stage:[3],
    element:'Fire',weapon_type:'AR',class:'Attacker'};
  for(const burst of ['1','2','3','none']){
    const out = resolveFormation({members:[anis,scarlet],targetIndex:1,burst,
      burstCasters:{1:'nikke-17',2:null,3:'nikke-222'},
      effectsByChar:byChar([full]),characters:[anis,scarlet]});
    // Pure Full Burst timing never blocks and never becomes not-selected.
    assert.equal(out.deterministic.length,1,`burst=${burst}`);
    assert.equal(out.gated.length,0,`burst=${burst}`);
    assert.equal(out.unknown.length,0,`burst=${burst}`);
  }
});

test('Anis S1 formation branch resolves from members, not casters',()=>{
  const anis = {character_id:'nikke-17',character_name:'Anis: Star',burst_stage:[1],
    element:'Wind',weapon_type:'AR',class:'Supporter'};
  const liter = {character_id:'nikke-82',character_name:'Liter',burst_stage:[1],
    element:'Wind',weapon_type:'AR',class:'Supporter'};
  const crown = {character_id:'nikke-330',character_name:'Crown',burst_stage:[2],
    element:'Fire',weapon_type:'MG',class:'Defender'};
  const noBranch = {...base,effect_id:'anis-no',character_id:'nikke-17',skill_slot:'Skill 1',
    target_type:'self',target:'self.',
    trigger:'Activates at the start of battle and when Full Burst ends',
    condition:'Activates at the start of battle and when Full Burst ends.\nAffects self',
    parent_trigger:'Activates at the start of battle and when Full Burst ends',
    parent_effect_description:'Effects vary according to squad formation. Only one set of effects is applied.\nIf there are no other standard Burst 1 allies:'};
  const anyBranch = {...base,effect_id:'anis-any',character_id:'nikke-17',skill_slot:'Skill 1',
    target_type:'self',target:'self.',
    trigger:'Activates at the start of battle and when Full Burst ends',
    condition:'Activates at the start of battle and when Full Burst ends.\nAffects self',
    parent_trigger:'Activates at the start of battle and when Full Burst ends',
    parent_effect_description:'Effects vary according to squad formation. Only one set of effects is applied.\nIf there are any other Burst 1 allies:'};
  assert.equal(formationBranchOf(noBranch),'no-other-b1');
  assert.equal(formationBranchOf(anyBranch),'any-other-b1');
  const effects = byChar([noBranch,anyBranch]);
  // Solo B1 Anis: the no-other branch holds deterministically (battle
  // start / Full Burst end timing alone never blocks), the other vanishes.
  const solo = resolveFormation({members:[anis,crown],targetIndex:0,burst:'none',
    burstCasters:{1:null,2:null,3:null},effectsByChar:effects,characters:[anis,liter,crown]});
  assert.ok(solo.deterministic.some(r=>r.effect.effect_id==='anis-no'));
  const soloEverywhere = [...solo.deterministic,...solo.gated,...solo.unknown,...solo.quarantined];
  assert.ok(!soloEverywhere.some(r=>r.effect.effect_id==='anis-any'));
  // Another B1 (Liter) flips the applicable set.
  const duo = resolveFormation({members:[anis,liter,crown],targetIndex:0,burst:'none',
    burstCasters:{1:null,2:null,3:null},effectsByChar:effects,characters:[anis,liter,crown]});
  assert.ok(duo.deterministic.some(r=>r.effect.effect_id==='anis-any'));
  const duoEverywhere = [...duo.deterministic,...duo.gated,...duo.unknown,...duo.quarantined];
  assert.ok(!duoEverywhere.some(r=>r.effect.effect_id==='anis-no'));
  // Caster designation never moves a formation branch.
  for(const casters of [{1:'nikke-17',2:'nikke-330',3:null},{1:'nikke-82',2:'nikke-330',3:null},{1:null,2:null,3:null}]){
    const out = resolveFormation({members:[anis,liter,crown],targetIndex:0,burst:'1',
      burstCasters:casters,effectsByChar:effects,characters:[anis,liter,crown]});
    assert.ok(out.deterministic.some(r=>r.effect.effect_id==='anis-any'));
    const everywhere = [...out.deterministic,...out.gated,...out.unknown,...out.quarantined];
    assert.ok(!everywhere.some(r=>r.effect.effect_id==='anis-no'));
  }
});

test('Crown previously-cast conditions use rotation order',()=>{
  const liter = {character_id:'nikke-82',character_name:'Liter',burst_stage:[1],
    element:'Wind',weapon_type:'AR',class:'Supporter'};
  const crown = {character_id:'nikke-330',character_name:'Crown',burst_stage:[2],
    element:'Fire',weapon_type:'MG',class:'Defender'};
  const scarlet = {character_id:'nikke-222',character_name:'Scarlet',burst_stage:[3],
    element:'Fire',weapon_type:'AR',class:'Attacker'};
  const nave = {character_id:'nikke-99',character_name:'Nave',burst_stage:[2],
    element:'Water',weapon_type:'SG',class:'Supporter'};
  const members = [liter,crown,scarlet,nave];
  const positive = {...base,effect_id:'crown-prev',character_id:'nikke-330',skill_slot:'Skill 1',
    target_type:'selected_allies',target:'直前にBurst Skillを使用した味方全員',
    trigger:'Full Burst開始時',condition:'Previously cast their Burst Skills'};
  const negative = {...base,effect_id:'crown-unprev',character_id:'nikke-330',skill_slot:'Skill 1',
    target_type:'selected_allies',target:'Burst未使用の味方全員',
    trigger:'Full Burst開始時',condition:'Did not previously cast their Burst Skills'};
  assert.equal(previouslyCastPolarityOf(positive),'previously-cast');
  assert.equal(previouslyCastPolarityOf(negative),'not-previously-cast');
  const casters = {1:'nikke-82',2:'nikke-330',3:'nikke-222'};
  const see = (effect,targetId)=>resolveFormation({members,targetIndex:members.findIndex(m=>m.character_id===targetId),
    burst:'2',burstCasters:casters,effectsByChar:byChar([effect]),characters:members});
  const everywhere = out=>[...out.deterministic,...out.gated,...out.unknown,...out.quarantined];
  // Previously-cast: the earlier-stage caster holds. Full Burst timing
  // alone never blocks, so the held branch is deterministic, never unknown.
  const prevLiter = see(positive,'nikke-82');
  assert.ok(prevLiter.deterministic.some(r=>r.effect.effect_id==='crown-prev'));
  assert.equal(prevLiter.unknown.length,0);
  assert.equal(everywhere(see(positive,'nikke-222')).length,0);
  assert.equal(everywhere(see(positive,'nikke-99')).length,0);
  // Not-previously-cast: future casters and proven non-casters hold
  // deterministically, the earlier caster vanishes, the current caster
  // stays gated unresolved.
  assert.ok(see(negative,'nikke-222').deterministic.some(r=>r.effect.effect_id==='crown-unprev'));
  assert.ok(see(negative,'nikke-99').deterministic.some(r=>r.effect.effect_id==='crown-unprev'));
  assert.equal(everywhere(see(negative,'nikke-82')).length,0);
  const current = see(negative,'nikke-330');
  assert.equal(everywhere(current).length,1);
  assert.ok(current.gated.some(r=>r.reasons.includes('previously-cast-unresolved')));
  // Incomplete rotation history is never guessed: stays gated.
  const incomplete = resolveFormation({members,targetIndex:0,burst:'2',
    burstCasters:{1:null,2:'nikke-330',3:'nikke-222'},
    effectsByChar:byChar([positive]),characters:members});
  assert.ok(incomplete.gated.some(r=>r.reasons.includes('previously-cast-unresolved')));
  assert.equal(incomplete.deterministic.length,0);
  assert.equal(incomplete.unknown.length,0);
});

test('Full Burst conditions never produce caster mismatch',()=>{
  const fullSkill = {...base,effect_id:'fb1',character_id:'nikke-1',skill_slot:'Skill 1',
    target_type:'all_allies',target:'all allies.',
    trigger:'Activates when entering Full Burst',condition:''};
  const fullBurstSlot = {...base,effect_id:'fb2',character_id:'nikke-1',skill_slot:'Burst',
    target_type:'all_allies',target:'all allies.',
    trigger:'Activates when entering Full Burst',condition:''};
  const members = [characters[0],characters[1]];
  const out = resolveFormation({members,targetIndex:0,burst:'1',
    burstCasters:{1:'nikke-2',2:null,3:null},
    effectsByChar:byChar([fullSkill,fullBurstSlot]),characters});
  assert.ok(out.deterministic.some(r=>r.effect.effect_id==='fb1'));
  assert.ok(out.deterministic.some(r=>r.effect.effect_id==='fb2'));
  assert.equal(out.gated.filter(r=>r.reasons.includes('burst-caster-mismatch')).length,0);
});

test('only caster-requiring effects take caster identity gating',()=>{
  const members = [
    {...characters[0],burst_stage:[1]},
    {...characters[1],burst_stage:[1]},
    {...characters[2],burst_stage:[2]},
  ];
  const own = {...base,effect_id:'req-own',character_id:'nikke-1',skill_slot:'Skill 2',
    target_type:'all_allies',target:'all allies.',
    trigger:'Activates if the skill user used her Burst Skill',condition:''};
  const genericBurst = {...base,effect_id:'req-generic',character_id:'nikke-1',skill_slot:'Burst',
    target_type:'all_allies',target:'all allies.',trigger:'Burst Skill activation',condition:''};
  const scopedBurst = {...base,effect_id:'req-scoped',character_id:'nikke-1',skill_slot:'Burst',
    target_type:'all_allies',target:'all allies.',trigger:'Burst Skill activation',
    condition:'Burst Stage 1\nAffects all allies.',section_condition:{burst_stage:1}};
  const full = {...base,effect_id:'req-full',character_id:'nikke-1',skill_slot:'Skill 1',
    target_type:'all_allies',target:'all allies.',
    trigger:'Activates when entering Full Burst',condition:''};
  const ally = {...base,effect_id:'req-ally',character_id:'nikke-1',skill_slot:'Skill 1',
    target_type:'all_allies',target:'all allies.',
    trigger:'Activates when an ally uses a Burst Skill',condition:''};
  const out = resolveFormation({members,targetIndex:2,burst:'1',
    burstCasters:{1:'nikke-2',2:null,3:null},
    effectsByChar:byChar([own,genericBurst,scopedBurst,full,ally]),characters});
  const everywhere = ids=>[...out.deterministic,...out.gated,...out.unknown,...out.quarantined]
    .filter(r=>ids.includes(r.effect.effect_id));
  // Explicit own Burst and unscoped Burst fire vanish for non-casters.
  assert.equal(everywhere(['req-own']).length,0);
  assert.equal(everywhere(['req-generic']).length,0);
  // Stage-scoped Burst fire of the same stage is mismatch-gated (visible).
  const scoped = everywhere(['req-scoped']);
  assert.equal(scoped.length,1);
  assert.ok(scoped[0].reasons.includes('burst-caster-mismatch'));
  // Full Burst timing never blocks (deterministic) and ally-Burst stays
  // conditional; neither ever takes caster mismatch.
  const fullRows = everywhere(['req-full']);
  assert.equal(fullRows.length,1);
  assert.equal(fullRows[0].bucket,'deterministic');
  const allyRows = everywhere(['req-ally']);
  assert.equal(allyRows.length,1);
  assert.equal(allyRows[0].bucket,'gated');
  for(const id of ['req-full','req-ally']){
    const rows = everywhere([id]);
    assert.ok(!rows[0].reasons.includes('burst-caster-mismatch'));
  }
});

test('unprovable conditions stay unknown or gated, never deterministic',()=>{
  const members = [characters[0],characters[1]];
  const ranked = {...base,effect_id:'u-ranked',character_id:'nikke-1',target_type:'selected_allies',
    target:'2 allies',target_count:2,target_selection:'highest_final_atk'};
  const chance = {...base,effect_id:'u-chance',character_id:'nikke-1',target_type:'all_allies',
    target:'all allies.',trigger:'',condition:'',activation_chance:30,activation_chance_unit:'percent'};
  const prevNoHistory = {...base,effect_id:'u-prev',character_id:'nikke-1',skill_slot:'Skill 1',
    target_type:'selected_allies',target:'allies who previously used their Burst Skills',
    trigger:'Activates when entering Full Burst',condition:'Previously cast their Burst Skills'};
  const noAxisMember = {...characters[1]};
  delete noAxisMember.burst_stage;
  const formationNoAxis = {...base,effect_id:'u-form',character_id:'nikke-1',skill_slot:'Skill 1',
    target_type:'self',target:'self.',trigger:'Activates if there are no standard Burst 1 allies',condition:''};
  const out = resolveFormation({members,targetIndex:1,burst:'none',
    burstCasters:{1:null,2:null,3:null},
    effectsByChar:byChar([ranked,chance,prevNoHistory]),characters});
  // Stat-ranked picks are understood but育成-dependent: conditional.
  assert.ok(out.gated.some(r=>r.effect.effect_id==='u-ranked'
    &&r.reasons.includes('ranked-or-conditional-selection')));
  assert.equal(out.unknown.filter(r=>r.effect.effect_id==='u-ranked').length,0);
  assert.ok(out.gated.some(r=>r.effect.effect_id==='u-chance'
    &&r.reasons.includes('conditional-or-gated')));
  assert.ok(out.gated.some(r=>r.effect.effect_id==='u-prev'
    &&r.reasons.includes('previously-cast-unresolved')));
  assert.equal(out.deterministic.length,0);
  const out2 = resolveFormation({members:[characters[0],noAxisMember],targetIndex:1,burst:'none',
    burstCasters:{1:null,2:null,3:null},
    effectsByChar:byChar([formationNoAxis]),characters});
  assert.ok(out2.gated.some(r=>r.reasons.includes('formation-unresolved')));
  assert.equal(out2.deterministic.length,0);
});

test('pure timing markers never block determinism',()=>{
  const timing = (id,trigger)=>({...base,effect_id:id,character_id:'nikke-1',
    target_type:'all_allies',target:'all allies.',trigger,condition:trigger});
  const members = [characters[0],characters[1]];
  for(const trigger of ['Activates at the start of battle',
    'Activates when entering Full Burst','Activates when entering Full Burst.',
    'Activates at the start of battle and when Full Burst ends']){
    const out = resolveFormation({members,targetIndex:1,burst:'none',
      burstCasters:{1:null,2:null,3:null},
      effectsByChar:byChar([timing(`t-${trigger.length}`,trigger)]),characters});
    assert.equal(out.deterministic.length,1,trigger);
    assert.equal(out.gated.length,0,trigger);
  }
  // Battle-state qualifiers still block: alive is external.
  const alive = {...base,effect_id:'t-alive',character_id:'nikke-1',target_type:'all_allies',
    target:'all allies.',trigger:'Activates at the start of battle as long as the skill user is alive',
    condition:'Activates at the start of battle as long as the skill user is alive. Affects all allies.'};
  const outAlive = resolveFormation({members,targetIndex:1,burst:'none',
    burstCasters:{1:null,2:null,3:null},effectsByChar:byChar([alive]),characters});
  assert.ok(outAlive.gated.some(r=>r.reasons.includes('conditional-or-gated')));
  assert.equal(outAlive.deterministic.length,0);
  // Unestablished Burst firing (caster unspecified) stays conditional.
  const fire = {...base,effect_id:'t-fire',character_id:'nikke-1',skill_slot:'Burst',
    target_type:'all_allies',target:'all allies.',trigger:'Burst Skill activation',condition:''};
  const outFire = resolveFormation({members,targetIndex:1,burst:'1',
    burstCasters:{1:null,2:null,3:null},effectsByChar:byChar([fire]),characters});
  assert.ok(outFire.gated.some(r=>r.reasons.includes('conditional-or-gated')));
  assert.equal(outFire.deterministic.length,0);
});

test('external-state conditions stay conditional, never deterministic',()=>{
  const members = [characters[0],characters[1]];
  const hp = {...base,effect_id:'x-hp',character_id:'nikke-1',target_type:'selected_allies',
    target:'allies with current HP above 70%.',target_condition:'current_hp_ratio >= 0.7',
    trigger:'Activates when entering Full Burst',condition:'Activates when entering Full Burst.'};
  const hits = {...base,effect_id:'x-hits',character_id:'nikke-1',target_type:'self',target:'self.',
    trigger:'Activates after landing 30 normal attacks.',condition:'Activates after landing 30 normal attacks. Affects self.'};
  const stacks = {...base,effect_id:'x-stacks',character_id:'nikke-1',target_type:'self',target:'self.',
    trigger:'Activates when stacks take effect',condition:'With 10 or more stacks of Golden Chip. Affects self.'};
  const out = resolveFormation({members,targetIndex:1,burst:'none',
    burstCasters:{1:null,2:null,3:null},effectsByChar:byChar([hp]),characters});
  assert.ok(out.gated.some(r=>r.effect.effect_id==='x-hp'));
  assert.equal(out.deterministic.length,0);
  assert.equal(out.unknown.length,0);
  // Self-targeted battle-progression conditions resolve against the owner.
  const outSelf = resolveFormation({members,targetIndex:0,burst:'none',
    burstCasters:{1:null,2:null,3:null},effectsByChar:byChar([hits,stacks]),characters});
  for(const id of ['x-hits','x-stacks']){
    assert.ok(outSelf.gated.some(r=>r.effect.effect_id===id
      &&r.reasons.includes('conditional-or-gated')),id);
    assert.ok(!outSelf.deterministic.some(r=>r.effect.effect_id===id),id);
  }
});

test('buff axis coverage reports presence in canonical order, never values',()=>{
  const target = characters[0];
  const row = (axis,caster,bucket,value=10)=>({effect:{...base,buff_type:axis,value,value_unit:'percent'},
    caster,bucket,reasons:[],gateText:[],conflict:null,relation:'allies'});
  const applied = [
    row('atk',target,'deterministic',20),
    row('atk',{...characters[1],character_name:'Beta'},'deterministic',100),
    row('attack_damage',{...characters[1],character_name:'Beta'},'gated'),
    row('critical_rate',target,'gated'),
  ];
  const coverage = buffAxisCoverage(applied,target);
  assert.equal(coverage.length,CATEGORIES.length);
  assert.deepEqual(coverage.map(a=>a.buffType),CATEGORIES);
  const atk = coverage.find(a=>a.buffType==='atk');
  assert.equal(atk.status,'covered');
  assert.equal(atk.self,true);
  assert.deepEqual([...atk.providers].sort(),['Alpha','Beta']);
  const ad = coverage.find(a=>a.buffType==='attack_damage');
  assert.equal(ad.status,'conditional');
  assert.equal(ad.self,false);
  assert.deepEqual(ad.providers,['Beta']);
  // Presence only: two ATK rows of 20 and 100 are still one covered axis.
  assert.equal(coverage.filter(a=>a.status==='covered').length,1);
  assert.ok(!JSON.stringify(coverage).includes('100'));
  const empty = buffAxisCoverage([],target);
  assert.ok(empty.every(a=>a.status==='uncovered'&&a.self===false&&a.providers.length===0));
});

test('buff axis coverage ignores non-applied and non-canonical rows',()=>{
  const target = characters[0];
  const rows = [
    {effect:{...base,buff_type:'atk'},caster:target,bucket:'unknown',reasons:[],gateText:[],conflict:null,relation:'allies'},
    {effect:{...base,buff_type:'heal'},caster:target,bucket:'quarantined',reasons:[],gateText:[],conflict:null,relation:'allies'},
    {effect:{...base,buff_type:'not_a_real_axis'},caster:target,bucket:'deterministic',reasons:[],gateText:[],conflict:null,relation:'allies'},
  ];
  const coverage = buffAxisCoverage(rows,target);
  assert.ok(coverage.every(a=>a.status==='uncovered'));
  assert.ok(!coverage.some(a=>a.buffType==='not_a_real_axis'));
});

test('member axes split new vs existing against the target own axes',()=>{
  const [alpha,beta,gamma] = characters;
  const row = (axis,casterId,bucket)=>({effect:{...base,buff_type:axis},
    caster:characters.find(c=>c.character_id===casterId),bucket,reasons:[],gateText:[],conflict:null,relation:'allies'});
  const applied = [
    row('atk','nikke-1','deterministic'),
    row('critical_rate','nikke-1','gated'),
    row('atk','nikke-2','deterministic'),
    row('attack_damage','nikke-2','gated'),
    row('critical_damage','nikke-3','gated'),
    row('reload_speed','nikke-3','unknown'),
  ];
  const roles = memberAxisRoles(applied,[alpha,beta,gamma],alpha);
  assert.equal(roles.length,3);
  assert.deepEqual(roles[0],{member:alpha,isTarget:true,newAxes:[],existingAxes:['atk','critical_rate']});
  assert.deepEqual(roles[1].newAxes,['attack_damage']);
  assert.deepEqual(roles[1].existingAxes,['atk']);
  assert.equal(roles[1].isTarget,false);
  // Unknown rows never create member axes.
  assert.deepEqual(roles[2].newAxes,['critical_damage']);
  assert.deepEqual(roles[2].existingAxes,[]);
  // A member with no applied rows reports empty roles, never guesses.
  const stranger = {character_id:'nikke-9',character_name:'Stranger',burst_stage:[1]};
  assert.deepEqual(memberAxisRoles(applied,[stranger],alpha),
    [{member:stranger,isTarget:false,newAxes:[],existingAxes:[]}]);
});

test('coverage follows resolved buckets end to end without touching data',()=>{
  const atkSelf = {...base,effect_id:'cov-self',character_id:'nikke-1',target_type:'self',
    target:'self.',trigger:'',condition:'',buff_type:'atk',value:20,value_unit:'percent'};
  const adAlly = {...base,effect_id:'cov-ally',character_id:'nikke-2',target_type:'all_allies',
    target:'all allies.',trigger:'',condition:'',buff_type:'attack_damage',value:15,value_unit:'percent'};
  const out = resolveFormation({members:[characters[0],characters[1]],targetIndex:0,burst:'none',
    effectsByChar:new Map([['nikke-1',[atkSelf]],['nikke-2',[adAlly]]]),characters});
  assert.equal(out.deterministic.length,2);
  const coverage = buffAxisCoverage([...out.deterministic,...out.gated],characters[0]);
  assert.equal(coverage.find(a=>a.buffType==='atk').status,'covered');
  assert.equal(coverage.find(a=>a.buffType==='atk').self,true);
  assert.equal(coverage.find(a=>a.buffType==='attack_damage').status,'covered');
  assert.equal(coverage.find(a=>a.buffType==='attack_damage').self,false);
  const roles = memberAxisRoles([...out.deterministic,...out.gated],
    [characters[0],characters[1]],characters[0]);
  assert.deepEqual(roles[1].newAxes,['attack_damage']);
});

test('axis groups sum only identical buff_type and value_unit',()=>{
  const target = characters[0];
  const row = (axis,unit,value,bucket,caster=target)=>({effect:{...base,buff_type:axis,
    value_unit:unit,value},caster,bucket,reasons:[],gateText:[],conflict:null,relation:'allies'});
  const groups = buffAxisGroups([
    row('atk','percent',20,'deterministic'),
    row('atk','percent',100,'deterministic',{...characters[1],character_name:'Beta'}),
    row('atk','percent',5,'gated'),
    row('atk','caster_atk_percent',64,'deterministic'),
    row('attack_damage','percent',15,'deterministic'),
  ],target);
  assert.equal(groups.length,3);
  // Canonical order: atk groups before attack_damage; units sorted within.
  assert.deepEqual(groups.map(g=>[g.buffType,g.valueUnit]),
    [['atk','caster_atk_percent'],['atk','percent'],['attack_damage','percent']]);
  const percent = groups.find(g=>g.buffType==='atk'&&g.valueUnit==='percent');
  assert.equal(percent.status,'covered');
  assert.equal(percent.detSum,120);
  assert.equal(percent.detSummedCount,2);
  assert.equal(percent.detTotalCount,2);
  assert.equal(percent.gatedSum,5);
  assert.equal(percent.gatedSummedCount,1);
  assert.equal(percent.self,true);
  // Same unit but a different axis is never merged into the ATK sum.
  const casterScaled = groups.find(g=>g.valueUnit==='caster_atk_percent');
  assert.equal(casterScaled.detSum,64);
  assert.equal(groups.find(g=>g.buffType==='attack_damage').detSum,15);
});

test('axis groups exclude stacks, booleans and missing values from sums',()=>{
  const target = characters[0];
  const row = (patch,bucket)=>({effect:{...base,buff_type:'atk',value:10,
    value_unit:'percent',...patch},caster:target,bucket,reasons:[],gateText:[],
    conflict:null,relation:'allies'});
  const groups = buffAxisGroups([
    row({value:10},'deterministic'),
    row({value:5,stack_count:10,max_raw_value:50},'deterministic'),
    row({buff_type:'invulnerability',value:true,value_unit:'boolean'},'deterministic'),
    row({value:null},'gated'),
    {effect:{...base,buff_type:'atk',value:7,value_unit:'percent'},caster:target,
      bucket:'unknown',reasons:[],gateText:[],conflict:null,relation:'allies'},
  ],target);
  const atk = groups.find(g=>g.buffType==='atk');
  assert.equal(atk.detSum,10);
  assert.equal(atk.detSummedCount,1);
  assert.equal(atk.detTotalCount,2);
  assert.equal(atk.gatedSum,0);
  assert.equal(atk.gatedSummedCount,0);
  assert.equal(atk.gatedTotalCount,1);
  // Every contributing row stays attached for the expanded evidence view.
  assert.equal(atk.detRows.length+atk.gatedRows.length,3);
  // Unknown buckets never enter aggregates.
  assert.ok(!groups.some(g=>g.detRows.some(r=>r.bucket==='unknown')));
});

test('rotation: B1-only members take B1 positions only',()=>{
  const moran = {...characters[0],character_id:'moran',character_name:'Moran',burst_stage:[1]};
  const b2 = {...characters[1]}, b3 = {...characters[2]};
  const members = [moran,b2,b3];
  // First position is always Stage 1: Moran fits, and only there.
  assert.deepEqual(validateRotation([{caster:'moran',stage:1}],members,{}),
    [{caster:'moran',stage:1}]);
  const next = rotationNextOptions([],members,{});
  assert.deepEqual(next.find(o=>o.caster==='moran'),{caster:'moran',stages:[1]});
  // Moran can never take a B2/B3 position: truncated, never coerced.
  assert.deepEqual(validateRotation([{caster:'moran',stage:2}],members,{}),[]);
  const afterB1 = [{caster:'nikke-1',stage:1}];
  assert.deepEqual(validateRotation(
    [...afterB1,{caster:'moran',stage:2}],[moran,...characters.slice(0,2)],{}),
    afterB1);
  assert.deepEqual(validateRotation(
    [...afterB1,{caster:'moran',stage:3}],[moran,...characters.slice(0,2)],{}),
    afterB1);
  // Formation outsiders are never selectable.
  assert.deepEqual(validateRotation([{caster:'nikke-unknown',stage:1}],members,{}),[]);
  assert.ok(!rotationNextOptions([],members,{}).some(o=>o.caster==='nikke-unknown'));
});

test('rotation: multi-stage members take every matching stage',()=>{
  const redHood = {character_id:'rh',character_name:'Red Hood',burst_stage:[1,2,3],
    element:'Fire',weapon_type:'AR',class:'Attacker'};
  const b1 = {...characters[0]}, b2 = {...characters[1]};
  const members = [redHood,b1,b2];
  assert.deepEqual(rotationNextOptions([],members,{}).find(o=>o.caster==='rh'),
    {caster:'rh',stages:[1]});
  const afterOne = rotationNextOptions([{caster:'nikke-1',stage:1}],members,{});
  assert.deepEqual(afterOne.find(o=>o.caster==='rh'),{caster:'rh',stages:[2]});
  const afterTwo = rotationNextOptions(
    [{caster:'nikke-1',stage:1},{caster:'nikke-2',stage:2}],members,{});
  assert.deepEqual(afterTwo.find(o=>o.caster==='rh'),{caster:'rh',stages:[3]});
  assert.deepEqual(validateRotation(
    [{caster:'rh',stage:1},{caster:'nikke-2',stage:2},{caster:'rh',stage:3}],
    members,{rh:1}),
    [{caster:'rh',stage:1},{caster:'nikke-2',stage:2},{caster:'rh',stage:3}]);
});

test('rotation: B1 re-entry extends the chain inside 5 members',()=>{
  const alice = {character_id:'alice',character_name:'Alice',burst_stage:[1],
    element:'Water',weapon_type:'SMG',class:'Supporter'};
  const liter = {character_id:'liter',character_name:'Liter',burst_stage:[1],
    element:'Wind',weapon_type:'AR',class:'Supporter'};
  const crown = {character_id:'crown',character_name:'Crown',burst_stage:[2],
    element:'Fire',weapon_type:'MG',class:'Defender'};
  const hood = {character_id:'hood',character_name:'Red Hood',burst_stage:[3],
    element:'Fire',weapon_type:'AR',class:'Attacker'};
  const members = [alice,liter,crown,hood];
  const reentry = {alice:1};
  // 1st Alice B1 -> re-entered 2nd Liter B1 -> 3rd Crown B2 -> 4th Hood B3.
  const entries = validateRotation(
    [{caster:'alice',stage:1},{caster:'liter',stage:1},
     {caster:'crown',stage:2},{caster:'hood',stage:3}],members,reentry);
  assert.deepEqual(entries.map(e=>e.stage),[1,1,2,3]);
  assert.deepEqual(entries.map(e=>e.caster),['alice','liter','crown','hood']);
  // Same character again is allowed only through its own re-entry.
  const doubled = validateRotation(
    [{caster:'alice',stage:1},{caster:'alice',stage:1},{caster:'liter',stage:1},
     {caster:'crown',stage:2},{caster:'hood',stage:3}],members,reentry);
  assert.deepEqual(doubled.map(e=>e.caster),['alice','alice','liter','crown','hood']);
  assert.deepEqual(doubled.map(e=>e.stage),[1,1,1,2,3]);
  // A character without re-entry can never be duplicated.
  assert.deepEqual(validateRotation(
    [{caster:'liter',stage:1},{caster:'liter',stage:1}],members,reentry),
    [{caster:'liter',stage:1}]);
  // Re-entry opens only after the re-entry character itself fires: Alice
  // cannot take the re-entered slot behind Liter, and Liter (no re-entry)
  // can never repeat.
  assert.deepEqual(validateRotation(
    [{caster:'liter',stage:1},{caster:'alice',stage:1}],members,reentry),
    [{caster:'liter',stage:1}]);
  assert.deepEqual(validateRotation(
    [{caster:'liter',stage:1},{caster:'alice',stage:1},{caster:'liter',stage:1}],
    members,reentry),
    [{caster:'liter',stage:1}]);
});

test('rotation: B2 re-entry returns progression to Stage 2',()=>{
  const b1 = {...characters[0]};
  const chime = {character_id:'chime',character_name:'Chime',burst_stage:[2],
    element:'Wind',weapon_type:'RL',class:'Supporter'};
  const b2b = {character_id:'b2b',character_name:'B2b',burst_stage:[2],
    element:'Fire',weapon_type:'AR',class:'Attacker'};
  const b3 = {...characters[2]};
  const members = [b1,chime,b2b,b3];
  const entries = validateRotation(
    [{caster:'nikke-1',stage:1},{caster:'chime',stage:2},
     {caster:'b2b',stage:2},{caster:'nikke-3',stage:3}],members,{chime:2});
  assert.deepEqual(entries.map(e=>e.stage),[1,2,2,3]);
});

test('rotation: normal B1 -> B2 -> B3 chain',()=>{
  const members = [characters[0],characters[1],characters[2]];
  const entries = validateRotation(
    [{caster:'nikke-1',stage:1},{caster:'nikke-2',stage:2},{caster:'nikke-3',stage:3}],
    members,{});
  assert.deepEqual(entries,
    [{caster:'nikke-1',stage:1},{caster:'nikke-2',stage:2},{caster:'nikke-3',stage:3}]);
  // Skipping a stage is impossible: B1 -> B3 truncates.
  assert.deepEqual(validateRotation(
    [{caster:'nikke-1',stage:1},{caster:'nikke-3',stage:3}],members,{}),
    [{caster:'nikke-1',stage:1}]);
});

test('rotation: legacy per-stage casters migrate without coercion',()=>{
  const members = [characters[0],characters[1],characters[2]];
  assert.deepEqual(
    rotationFromStageCasters({1:'nikke-1',2:'nikke-2',3:'nikke-3'},members),
    [{caster:'nikke-1',stage:1},{caster:'nikke-2',stage:2},{caster:'nikke-3',stage:3}]);
  // A caster lacking the stage is skipped, never morphed into it.
  assert.deepEqual(
    rotationFromStageCasters({1:'nikke-1',2:'nikke-1',3:'nikke-1'},members),
    [{caster:'nikke-1',stage:1}]);
  assert.deepEqual(rotationFromStageCasters({1:null,2:null,3:null},members),[]);
});

test('rotation: previously-cast follows positions, never stage numbers',()=>{
  const alice = {character_id:'alice',burst_stage:[1]};
  const crown = {character_id:'crown',burst_stage:[2]};
  // Two B1 positions: evaluating the second one, the first Alice firing
  // counts as previously cast — stage-number logic would say otherwise.
  const entries = [{caster:'alice',stage:1},{caster:'alice',stage:1},{caster:'crown',stage:2}];
  assert.equal(evaluatePreviouslyCastInRotation('previously-cast',alice,entries,1),'holds');
  assert.equal(evaluatePreviouslyCastInRotation('not-previously-cast',alice,entries,1),'fails');
  assert.equal(evaluatePreviouslyCastInRotation('previously-cast',crown,entries,1),'fails');
  assert.equal(evaluatePreviouslyCastInRotation('not-previously-cast',crown,entries,1),'holds');
  // Current caster stays unresolved for not-previously-cast (timing).
  assert.equal(evaluatePreviouslyCastInRotation('not-previously-cast',alice,entries,0),'unresolvable');
  // No selection is always unresolvable.
  assert.equal(evaluatePreviouslyCastInRotation('previously-cast',alice,entries,-1),'unresolvable');
  assert.equal(evaluatePreviouslyCastInRotation('previously-cast',alice,[],0),'unresolvable');
});

test('rotation: Crown previously-cast resolves from position order',()=>{
  const liter = {character_id:'nikke-82',character_name:'Liter',burst_stage:[1],
    element:'Wind',weapon_type:'AR',class:'Supporter',target_type:'all_allies'};
  const crown = {character_id:'nikke-330',character_name:'Crown',burst_stage:[2],
    element:'Fire',weapon_type:'MG',class:'Defender'};
  const scarlet = {character_id:'nikke-222',character_name:'Scarlet',burst_stage:[3],
    element:'Fire',weapon_type:'AR',class:'Attacker'};
  const members = [liter,crown,scarlet];
  const positive = {...base,effect_id:'rot-prev',character_id:'nikke-330',skill_slot:'Skill 1',
    target_type:'selected_allies',target:'allies who previously used their Burst Skills',
    trigger:'Full Burst開始時',condition:'Previously cast their Burst Skills'};
  const rotation = [{caster:'nikke-82',stage:1},{caster:'nikke-330',stage:2},{caster:'nikke-222',stage:3}];
  const at = targetId=>resolveFormation({members,targetIndex:members.findIndex(m=>m.character_id===targetId),
    rotation,rotationIndex:1,effectsByChar:byChar([positive]),characters:members});
  const everywhere = out=>[...out.deterministic,...out.gated,...out.unknown,...out.quarantined];
  assert.ok(at('nikke-82').deterministic.some(r=>r.effect.effect_id==='rot-prev'));
  assert.equal(everywhere(at('nikke-222')).filter(r=>r.effect.effect_id==='rot-prev').length,0);
  // Empty rotation degrades to unresolved, never guessed.
  const empty = resolveFormation({members,targetIndex:0,
    rotation:[],rotationIndex:-1,effectsByChar:byChar([positive]),characters:members});
  assert.ok(empty.gated.some(r=>r.reasons.includes('previously-cast-unresolved')));
});

test('rotation: Rapi stage effects follow the evaluated position',()=>{
  const rapi = {character_id:'nikke-16',character_name:'Rapi',burst_stage:[1,3],
    element:'Fire',weapon_type:'AR',class:'Attacker'};
  const crown = {character_id:'nikke-330',character_name:'Crown',burst_stage:[2],
    element:'Fire',weapon_type:'MG',class:'Defender'};
  const scarlet = {character_id:'nikke-222',character_name:'Scarlet',burst_stage:[3],
    element:'Fire',weapon_type:'AR',class:'Attacker'};
  const members = [rapi,crown,scarlet];
  const scoped = (id,stage)=>({...base,effect_id:id,character_id:'nikke-16',skill_slot:'Burst',
    target_type:'self',target:'self.',trigger:'Burst Skill activation',
    condition:`Burst Stage ${stage}\nAffects self.`,section_condition:{burst_stage:stage}});
  const effects = byChar([scoped('r1',1),scoped('r3',3)]);
  // Rapi fires position 0 (B1): the Stage 1 effect holds, Stage 3 waits.
  const asOne = resolveFormation({members,targetIndex:0,
    rotation:[{caster:'nikke-16',stage:1},{caster:'nikke-330',stage:2},{caster:'nikke-222',stage:3}],
    rotationIndex:0,effectsByChar:effects,characters:members});
  assert.ok(asOne.deterministic.some(r=>r.effect.effect_id==='r1'));
  assert.ok(asOne.gated.some(r=>r.effect.effect_id==='r3'
    &&r.reasons.includes('burst-not-selected')));
  // Rapi fires position 2 (B3): the Stage 1 effect is NOT treated as fired.
  const liter = {character_id:'nikke-82',character_name:'Liter',burst_stage:[1],
    element:'Wind',weapon_type:'AR',class:'Supporter'};
  const members4 = [rapi,liter,crown,scarlet];
  const asThree = resolveFormation({members:members4,targetIndex:0,
    rotation:[{caster:'nikke-82',stage:1},{caster:'nikke-330',stage:2},{caster:'nikke-16',stage:3}],
    rotationIndex:2,effectsByChar:effects,characters:members4});
  assert.ok(asThree.deterministic.some(r=>r.effect.effect_id==='r3'));
  assert.ok(asThree.gated.some(r=>r.effect.effect_id==='r1'
    &&r.reasons.includes('burst-not-selected')));
});

test('rotation: incapable entries cannot create caster/stage mismatch',()=>{
  const moran = {...characters[0],character_id:'moran',character_name:'Moran',burst_stage:[1]};
  const members = [moran,characters[1]];
  const fire = {...base,effect_id:'mor-fire',character_id:'moran',skill_slot:'Burst',
    target_type:'all_allies',target:'all allies.',trigger:'Burst Skill activation',condition:''};
  // A smuggled {Moran, B2} entry is dropped: no mismatch is ever produced.
  const out = resolveFormation({members,targetIndex:1,
    rotation:[{caster:'moran',stage:2}],rotationIndex:0,
    effectsByChar:byChar([fire]),characters:members});
  assert.ok(out.gated.some(r=>r.reasons.includes('burst-not-selected')));
  assert.equal(out.gated.filter(r=>r.reasons.includes('burst-caster-mismatch')).length,0);
  assert.equal(out.deterministic.length,0);
});

test('treasure state defaults OFF and stays member-bound',()=>{
  const members = ['nikke-1','nikke-2'];
  assert.deepEqual(
    normalizeFormationState({members,burst:'none',targetIndex:0},characters).treasure,[]);
  // Only members, deduped, in formation order.
  assert.deepEqual(
    normalizeFormationState({members,burst:'none',targetIndex:0,
      treasure:['nikke-2','nikke-2','nikke-unknown','nikke-1']},characters).treasure,
    ['nikke-2','nikke-1']);
  // Reorder keeps treasure (character-bound, never slot-bound).
  assert.deepEqual(
    normalizeFormationState({members:['nikke-2','nikke-1'],burst:'none',targetIndex:0,
      treasure:['nikke-1']},characters).treasure,['nikke-1']);
  // Removal drops it; re-adding without input starts OFF.
  assert.deepEqual(
    normalizeFormationState({members:['nikke-2'],burst:'none',targetIndex:0,
      treasure:['nikke-1','nikke-2']},characters).treasure,['nikke-2']);
  assert.deepEqual(
    normalizeFormationState({members,burst:'none',targetIndex:0},characters).treasure,[]);
});

test('treasure ON replaces the effect set without double-applying',()=>{
  const normal = {...base,effect_id:'t-normal',character_id:'nikke-1',target_type:'all_allies',
    target:'all allies.',trigger:'',condition:'',buff_type:'atk',value:20,value_unit:'percent'};
  const replaced = {...base,effect_id:'t-treasure',character_id:'nikke-1',target_type:'all_allies',
    target:'all allies.',trigger:'',condition:'',buff_type:'atk',value:50,value_unit:'percent'};
  const members = [characters[0],characters[1]];
  const treasureByChar = new Map([['nikke-1',[replaced]]]);
  const off = resolveFormation({members,targetIndex:1,burst:'none',
    effectsByChar:byChar([normal]),characters});
  assert.ok(off.deterministic.some(r=>r.effect.effect_id==='t-normal'));
  const on = resolveFormation({members,targetIndex:1,burst:'none',
    treasure:['nikke-1'],treasureByChar,
    effectsByChar:byChar([normal]),characters});
  const ids = [...on.deterministic,...on.gated,...on.unknown,...on.quarantined]
    .map(r=>r.effect.effect_id);
  // Replacement, never addition: treasure value applies, normal is gone.
  assert.ok(ids.includes('t-treasure'));
  assert.ok(!ids.includes('t-normal'));
  assert.equal(on.deterministic.find(r=>r.effect.effect_id==='t-treasure').effect.value,50);
  // Flagged ON without a registered set fails safe to normal effects.
  const fallback = resolveFormation({members,targetIndex:1,burst:'none',
    treasure:['nikke-2'],treasureByChar,
    effectsByChar:byChar([normal]),characters});
  assert.ok(fallback.deterministic.some(r=>r.effect.effect_id==='t-normal'));
});

test('treasure persists in URLs and combines with rotation',()=>{
  const query = formatFormationQuery({members:['nikke-1','nikke-2'],burst:'none',targetIndex:0,
    burstCasters:{1:null,2:null,3:null},rotation:[],rotationIndex:-1,
    treasure:['nikke-2']});
  assert.ok(query.includes('ftreasure=nikke-2'));
  const back = parseFormationQuery(`?${query}`,characters);
  assert.deepEqual(back.treasure,['nikke-2']);
  // Legacy URLs without ftreasure restore all OFF.
  assert.deepEqual(parseFormationQuery('?formation=nikke-1,nikke-2&fburst=1',characters).treasure,[]);
  assert.deepEqual(parseFormationQuery('',characters).treasure,[]);
  // Rotation evaluation honors the treasure-switched set.
  const normal = {...base,effect_id:'tr-normal',character_id:'nikke-1',skill_slot:'Burst',
    target_type:'all_allies',target:'all allies.',trigger:'Burst Skill activation',condition:''};
  const switched = {...base,effect_id:'tr-switched',character_id:'nikke-1',skill_slot:'Burst',
    target_type:'all_allies',target:'all allies.',trigger:'Burst Skill activation',condition:''};
  const members = [{...characters[0],burst_stage:[1,2,3]},characters[1],characters[2]];
  const rotation = [{caster:'nikke-1',stage:1},{caster:'nikke-2',stage:2},{caster:'nikke-3',stage:3}];
  const args = {members,targetIndex:2,rotation,rotationIndex:0,
    treasureByChar:new Map([['nikke-1',[switched]]]),
    effectsByChar:byChar([normal]),characters:members};
  const offIds = [...Object.values(resolveFormation(args)).flat()].map(r=>r.effect.effect_id);
  assert.ok(offIds.includes('tr-normal'));
  const onIds = [...Object.values(resolveFormation({...args,treasure:['nikke-1']})).flat()]
    .map(r=>r.effect.effect_id);
  assert.ok(onIds.includes('tr-switched'));
  assert.ok(!onIds.includes('tr-normal'));
});

test('hasOtherBurstStageMember never counts the owner itself',()=>{
  const anis = {character_id:'nikke-17',burst_stage:[1]};
  const liter = {character_id:'nikke-82',burst_stage:[1]};
  const crown = {character_id:'nikke-330',burst_stage:[2]};
  assert.equal(hasOtherBurstStageMember([anis], 'nikke-17', 1),0);
  assert.equal(hasOtherBurstStageMember([anis,crown], 'nikke-17', 1),0);
  assert.equal(hasOtherBurstStageMember([anis,liter,crown], 'nikke-17', 1),1);
  assert.equal(hasOtherBurstStageMember([anis,liter], 'nikke-82', 1),1);
  assert.equal(hasOtherBurstStageMember([anis,crown], 'nikke-17', 2),1);
  assert.equal(hasOtherBurstStageMember([anis,crown], 'nikke-17', 3),0);
  assert.equal(hasOtherBurstStageMember([anis], 'nikke-17', 9),null);
  const noAxis = {character_id:'nikke-99'};
  assert.equal(hasOtherBurstStageMember([anis,noAxis], 'nikke-17', 1),null);
});

test('conditional re-entry derives from the held formation branch',()=>{
  const anis = {character_id:'anis',character_name:'Anis',burst_stage:[1]};
  const moran = {character_id:'moran',character_name:'Moran',burst_stage:[1]};
  const crown = {character_id:'crown',character_name:'Crown',burst_stage:[2]};
  const branchEffect = {...base,effect_id:'syn-anis-re',character_id:'anis',
    skill_slot:'Skill 1',buff_type:'burst_stage_reentry',
    parent_effect_description:'Effects vary according to squad formation.\nIf there are any other Burst 1 allies:',
    source_skill_text:"Everyone's Star: Re-enters Burst and changes to Stage 1."};
  const byCharOf = list=>new Map(list.map(e=>[e.character_id,[e]]));
  // Other B1 present: Anis re-enters Stage 1.
  assert.deepEqual(
    formationDependentReentries([anis,moran,crown],byCharOf([branchEffect])),{anis:1});
  // Solo B1: no re-entry, same judgment the resolver uses.
  assert.deepEqual(
    formationDependentReentries([anis,crown],byCharOf([branchEffect])),{});
  // Static Burst-fire re-entries are untouched by this path.
  const burstEffect = {...branchEffect,effect_id:'static-re',skill_slot:'Burst',
    parent_effect_description:null,source_skill_text:'Re-enters Burst Stage 1.'};
  assert.deepEqual(
    formationDependentReentries([anis,moran],byCharOf([burstEffect])),{});
  // Static facts win merges; conditional fills the rest.
  assert.deepEqual(
    effectiveReentryByChar([anis,moran,crown],{crown:9},byCharOf([branchEffect])),
    {anis:1,crown:9});
  // No effects map: static only, never guessed.
  assert.deepEqual(effectiveReentryByChar([anis,moran],{},null),{});
});

test('standard vs dynamic B1 classification is raw-stage only',()=>{
  assert.equal(burstOneClass({burst_stage:[1]}),'standard');
  assert.equal(burstOneClass({burst_stage:[1,3]}),'dynamic');
  assert.equal(burstOneClass({burst_stage:[1,2,3]}),'dynamic');
  assert.equal(burstOneClass({burst_stage:[2]}),'none');
  assert.equal(burstOneClass({burst_stage:[3]}),'none');
  assert.equal(burstOneClass({}),'none');
  assert.equal(burstOneClass(null),'none');
  const anis = {character_id:'anis',burst_stage:[1]};
  const rapi = {character_id:'rapi',burst_stage:[1,3]};
  const liter = {character_id:'liter',burst_stage:[1]};
  // Strict (standard-only): dynamic Rapi never counts.
  assert.equal(hasOtherBurstStageMember([anis,rapi], 'anis', 1, {standardOnly:true}),0);
  assert.equal(hasOtherBurstStageMember([anis,liter], 'anis', 1, {standardOnly:true}),1);
  // Broad default: B1-capable members count.
  assert.equal(hasOtherBurstStageMember([anis,rapi], 'anis', 1),1);
  // Owner-based branch rule: standard owners are strict, dynamic broad.
  const members = [anis,rapi,liter];
  assert.equal(evaluateFormationBranch('any-other-b1','anis',members),true);
  assert.equal(evaluateFormationBranch('no-other-b1','anis',members),false);
  assert.equal(evaluateFormationBranch('any-other-b1','rapi',[rapi,anis]),true);
  assert.equal(evaluateFormationBranch('no-other-b1','rapi',[rapi,anis]),false);
  assert.equal(evaluateFormationBranch('no-other-b1','rapi',[rapi]),true);
  // Dynamic-vs-dynamic: broad counting still applies for dynamic owners.
  assert.equal(evaluateFormationBranch('no-other-b1','rapi',[rapi,{character_id:'rh',burst_stage:[1,2,3]}]),false);
});

test('resolver works with fewer than 5 and exposes provenance, never DPS',()=>{
  const det = {...base,effect_id:'d1',character_id:'nikke-1',target_type:'all_allies',
    target:'all allies.',trigger:'',condition:''};
  const out = resolveFormation({members:[characters[0]],targetIndex:0,burst:'none',
    effectsByChar:byChar([det]),characters});
  // Skill 1 all_allies without gates is deterministic even solo.
  assert.equal(out.deterministic.length,1);
  assert.equal(out.deterministic[0].caster.character_id,'nikke-1');
  assert.ok(!('dps' in out.deterministic[0])&&!('uptime' in out.deterministic[0]));
  const empty = resolveFormation({members:[],targetIndex:-1,burst:'none',
    effectsByChar:byChar([det]),characters});
  assert.deepEqual([empty.deterministic.length,empty.gated.length,empty.unknown.length,empty.quarantined.length],[0,0,0,0]);
  const gated = {...det,effect_id:'g1',condition:'After 5 normal attacks'};
  const out3 = resolveFormation({members:[characters[0]],targetIndex:0,burst:'none',
    effectsByChar:byChar([gated]),characters});
  assert.equal(out3.gated.length,1);
  assert.ok(gateTextFor(gated).join('\n').includes('After 5 normal attacks'));
});

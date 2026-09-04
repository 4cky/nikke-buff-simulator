import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {levelTen,extractCharacter,normalizeCharacter,parseEffectLine} from '../../scripts/source-model.mjs';
import {parseCsv,ggSlotMap,ggAvailability,explorerSkill,mergedCatalog,selectSlots,compareSkills} from '../../scripts/source-policy.mjs';
import {assembleData} from '../../scripts/assemble-data.mjs';
import {safeSourceUrl} from '../../sources.js';
import {validateDataset} from '../../scripts/validate-data.mjs';

const ggTime='2026-08-28T12:00:00.000Z',exTime='2026-08-28T13:00:00.000Z';
const description='■ Activates when Full Burst starts. Affects all allies.\n<color=#00AEFF>ATK ▲ {v}% for 10 sec.</color>';
const ggSkill=(slot,value=10)=>({id:100+slot,slot,name:`Skill ${slot}`,description,levels:Array.from({length:10},(_,i)=>({v:String(i===9?value:i+1)})),cooldown:20});
const exSkill=(slot,value=10)=>({slot,name:`Skill ${slot}`,description:description.replace('{v}','{1}'),parameters:{1:Array.from({length:10},(_,i)=>String(i===9?value:i+1))},cooldown:20});
const character=(skills=[ggSkill(1),ggSkill(2),ggSkill(3)])=>({id:'999',name:'Sample',slug:'sample',visible:1,manufacturer:'Tetra',burst:'3',element:'Fire',weapon:'SR',class:'Attacker',rarity:'SSR',skills});
const indexEntry={resource_id:'999',name:'Sample',slug:'sample',company:'Tetra',burst:'B3',element:'Fire',weapon:'SR',class:'Attacker',rarity:'SSR'};
const input=(skills,explorer=[exSkill(1),exSkill(2),exSkill(3)])=>({gg:[character(skills)],ggCheckedAt:ggTime,index:[indexEntry],indexCheckedAt:exTime,details:new Map([['999',{checked_at:exTime,data:{skills:explorer}}]]),warnings:[]});
const choose=(skills,explorer)=>{
  const data=input(skills,explorer);
  return selectSlots(mergedCatalog(data.gg,data.index)[0],data.details.get('999').data,{ggCheckedAt:ggTime,explorerCheckedAt:exTime});
};
const read=name=>JSON.parse(readFileSync(new URL(`../../data/${name}.json`,import.meta.url),'utf8'));

test('Explorer CSV preserves quotes, non-ASCII names, and stable source IDs',()=>{
  const rows=parseCsv('resource_id,slug,name\r\n999,sample,"Sample, \"\"Alice\"\""\r\n');
  assert.equal(rows[0].name,'Sample, "Alice"');assert.equal(rows[0].resource_id,'999');
  assert.throws(()=>parseCsv('resource_id,slug\n999,"sample'),/Unclosed/);
});
test('Explorer uses only tenth array entries and literal constants, never simulated values',()=>{
  const ex={...exSkill(1,55.12),description:description.replace('{v}','{1}').replace('10 sec','{2} sec'),parameters:{1:Array.from({length:10},(_,i)=>i===9?'55.12':'1'),2:'10'}};
  assert.match(levelTen(explorerSkill(ex)).text,/55.12% for 10 sec/);
});
test('absent or malformed Lv.10 values cannot be called complete',()=>{
  for(const value of [null,undefined,'',{},true,Array(9).fill('1'),[...Array(9).fill('1'),null]])assert.equal(explorerSkill({...exSkill(1),parameters:{1:value}}),null);
  assert.equal(ggAvailability({...ggSkill(1),description:'■ <b> </b>'}),'missing_description');
  assert.equal(ggAvailability({...ggSkill(1),levels:Array(9).fill({v:'1'})}),'lv10_unavailable');
  assert.equal(levelTen({...ggSkill(1),levels:Array(10).fill({v:null})}),null);
});
test('three complete primary slots remain NIKKE.GG even when fallback is present',()=>{
  const selected=choose();assert.deepEqual(selected.map(s=>s.selected_source_type),['nikke_gg','nikke_gg','nikke_gg']);
  assert.ok(selected.every(s=>s.comparison.status==='equal'&&s.source_checked_at===ggTime));
});
test('only a missing slot uses Explorer; skill positions never shift',()=>{
  const selected=choose([ggSkill(1),ggSkill(3)]);
  assert.deepEqual(selected.map(s=>s.selected_source_type),['nikke_gg','nikke_explorer','nikke_gg']);
  assert.equal(selected[1].source_checked_at,exTime);assert.equal(selected[1].source_url,'https://nikke.exynan.my.id/character/sample');
  assert.equal(selected[2].skill.id,103);
});
test('missing description and unresolved Lv.10 placeholder independently trigger slot fallback',()=>{
  const selected=choose([{...ggSkill(1),description:''},{...ggSkill(2),description:description.replace('{v}','{missing}')},ggSkill(3)]);
  assert.deepEqual(selected.map(s=>s.nikke_gg_status),['missing_description','lv10_unavailable','available']);
  assert.deepEqual(selected.map(s=>s.selected_source_type),['nikke_explorer','nikke_explorer','nikke_gg']);
});
test('historical source IDs preserve slots when a short primary array has no explicit slot',()=>{
  const first=ggSkill(1),third=ggSkill(3);delete first.slot;delete third.slot;
  const map=ggSlotMap(character([first,third]),[{character_id:'nikke-999',source_skill_id:'101',skill_slot:'Skill 1'},{character_id:'nikke-999',source_skill_id:'103',skill_slot:'Burst'}]);
  assert.equal(map.get('Skill 1').id,101);assert.equal(map.get('Burst').id,103);assert.equal(map.get('Skill 2'),undefined);
});
test('ambiguous primary slot mapping is held for review instead of replacing all slots',()=>{
  const one=ggSkill(1);delete one.slot;
  const out=assembleData(input([one]));
  assert.ok(out['slot-source-status'].every(s=>s.nikke_gg_status==='slot_mapping_ambiguous'));
  assert.equal(out.effects.length,0);assert.equal(out['collection-report'].fallback_slots,0);
  assert.ok(out['review-queue'].every(r=>r.source_text.includes('ATK')));
});
test('duplicate explicit source slots never silently select one copy',()=>{
  const out=assembleData(input([ggSkill(1),ggSkill(1),ggSkill(3)]));
  assert.equal(out['slot-source-status'][0].nikke_gg_status,'slot_mapping_ambiguous');
  assert.equal(out['slot-source-status'][0].selected_source_type,null);
});
test('unsupported primary grammar is not a reason to replace it with Explorer',()=>{
  const unsupported={...ggSkill(1),description:'■ Unknown complex condition\n<color=#00AEFF>Unknown 10% behavior.</color>'};
  const selected=choose([unsupported,ggSkill(2),ggSkill(3)]);
  assert.equal(selected[0].selected_source_type,'nikke_gg');assert.equal(selected[0].nikke_gg_status,'available');
  const out=assembleData(input([unsupported,ggSkill(2),ggSkill(3)]));
  assert.equal(out['collection-report'].fallback_slots,0);assert.ok(out['review-queue'].some(r=>r.skill_slot==='Skill 1'));
});
test('unavailable fallback remains missing and gets a review record',()=>{
  const out=assembleData(input([ggSkill(1),ggSkill(3)],[exSkill(1),{...exSkill(2),parameters:{1:Array(9).fill('1')}},exSkill(3)]));
  assert.deepEqual(out.characters[0].missing_slots,['Skill 2']);assert.equal(out['collection-report'].unresolved_slots,1);
  assert.ok(out['review-queue'].some(r=>r.review_id==='missing:nikke-999:Skill 2'));
});
test('Explorer-only characters join the catalog by ID, retain metadata and do not invent dates or GG URLs',()=>{
  const data=input();data.gg=[];data.index=[{...indexEntry,burst:'All'}];
  const out=assembleData(data),c=out.characters[0];
  assert.equal(c.character_id,'nikke-999');assert.equal(c.manufacturer,'Tetra');assert.deepEqual(c.burst_stage,[1,2,3]);
  assert.equal(c.nikke_gg_url,null);assert.equal(c.release_date,null);assert.equal(c.release_order,null);
  assert.ok(c.review_fields.includes('release_date'));assert.ok(out.effects.every(e=>e.source_type==='nikke_explorer'));
});
test('matching characters are not duplicated when display names differ',()=>{
  const roster=mergedCatalog([character()],[{...indexEntry,name:'Alternate punctuation'}]);
  assert.equal(roster.length,1);assert.equal(roster[0].character.character_name,'Sample');
  assert.deepEqual(roster[0].character.aliases,['Alternate punctuation']);
});
test('numeric conflicts keep primary values and both source values, never silently overwrite',()=>{
  const data=input(undefined,[exSkill(1,20),exSkill(2),exSkill(3)]),out=assembleData(data);
  const e=out.effects.find(e=>e.skill_slot==='Skill 1');
  assert.equal(e.value,10);assert.equal(e.source_type,'nikke_gg');assert.equal(e.source_conflict,true);assert.equal(e.needs_review,true);
  assert.equal(out['source-conflicts'].length,1);
  assert.deepEqual(out['source-conflicts'][0].differences,[{position:0,nikke_gg_value:10,nikke_explorer_value:20}]);
  assert.match(out['source-conflicts'][0].nikke_gg.source_text,/10%/);assert.match(out['source-conflicts'][0].nikke_explorer.source_text,/20%/);
  assert.equal(out['collection-report'].comparable_effects,2);
});
test('wording differences preserve complete texts and numeric lists without guessing effect alignment',()=>{
  const a=ggSkill(1),b=explorerSkill({...exSkill(1,20),description:exSkill(1).description.replace('ATK','Core Damage')});
  const comparison=compareSkills(a,b);
  assert.equal(comparison.status,'wording_difference');assert.equal(comparison.source_conflict,true);assert.deepEqual(comparison.differences,[]);
  assert.deepEqual(comparison.nikke_gg_values,[10,10]);assert.deepEqual(comparison.nikke_explorer_values,[20,10]);
});
test('fallback to primary migration is per slot and logs old/new text without duplicate effects',()=>{
  const first=assembleData(input([ggSkill(1),ggSkill(3)]));
  const next=assembleData(input(),{previousSlots:first['slot-source-status']});
  assert.equal(first.effects.length,3);assert.equal(next.effects.length,3);
  assert.equal(next['source-history'].length,1);assert.equal(next['source-history'][0].reason,'source_migration');
  assert.equal(next['source-history'][0].previous.selected_source_type,'nikke_explorer');
  assert.equal(next['source-history'][0].current.selected_source_type,'nikke_gg');
  const repeated=assembleData(input(),{previousSlots:next['slot-source-status'],history:next['source-history']});
  assert.equal(repeated['source-history'].length,1);
});
test('source text changes create a separate audit history event',()=>{
  const first=assembleData(input()),next=assembleData(input([ggSkill(1,12),ggSkill(2),ggSkill(3)]),{previousSlots:first['slot-source-status']});
  assert.equal(next['source-history'][0].reason,'source_text_changed');
  assert.match(next['source-history'][0].previous.source_text,/10%/);assert.match(next['source-history'][0].current.source_text,/12%/);
});
test('source URL validation prevents mismatched domains, script URLs and spoofed host names',()=>{
  assert.ok(safeSourceUrl('nikke_gg','https://nikke.gg/characters/sample/'));
  assert.ok(safeSourceUrl('nikke_explorer','https://nikke.exynan.my.id/character/sample'));
  for(const url of ['javascript:alert(1)','https://nikke.gg.evil.test/','http://nikke.gg/','https://user@nikke.gg/','https://nikke.exynan.my.id/'])assert.equal(safeSourceUrl('nikke_gg',url),null);
});
test('schema rejects missing provenance, mismatched source and unflagged conflict',()=>{
  const chars=read('characters'),effects=read('effects'),cs=read('character-schema'),es=read('effect-schema');
  for(const patch of [{source_type:'unknown'},{source_checked_at:'yesterday'},{source_conflict:true,needs_review:false},{source_type:'nikke_explorer',source_url:'https://nikke.gg/'}]){
    assert.ok(validateDataset(chars,[{...effects[0],...patch}],cs,es).length);
  }
});
test('every published character has three independent slot checks and every effect has provenance',()=>{
  const chars=read('characters'),effects=read('effects'),slots=read('slot-source-status');
  for(const c of chars)assert.deepEqual(slots.filter(s=>s.character_id===c.character_id).map(s=>s.skill_slot),['Skill 1','Skill 2','Burst']);
  for(const e of effects){assert.ok(safeSourceUrl(e.source_type,e.source_url));assert.ok(Number.isFinite(Date.parse(e.source_checked_at)));assert.equal(e.skill_level,10);}
  assert.equal(read('source-comparisons').length,read('collection-report').audited_slots);
});
test('additional explicit grammars preserve boolean, flat ammo, shield and healing bases',()=>{
  assert.equal(parseEffectLine('Gains Pierce for 10 sec.').value,true);
  assert.equal(parseEffectLine('Max Ammunition Capacity ▲ 10 round(s) for 5 sec.').value_unit,'count');
  assert.equal(parseEffectLine("Creates a shield with HP equal to 10.45% of the caster's max HP that lasts for 10 sec.").value_unit,'caster_max_hp_percent');
  assert.equal(parseEffectLine("Restores HP equal to 4.06% of the caster's max HP.").duration,'Instant');
  assert.equal(parseEffectLine('Recovers 8.12% of attack damage as HP for 5 sec.').value_basis,'attack_damage');
});
test('positive audit grammar normalizes spacing, permanent lifetime, reload variants, and fixed modifiers',()=>{
  const crit=parseEffectLine('Critical Rate▲ 26.04% for 5 sec.');
  assert.deepEqual([crit.buff_type,crit.value],['critical_rate',26.04]);
  const def=parseEffectLine('DEF▲ 13.5%, stacks up to 3 time(s) and lasts for 5 sec.');
  assert.deepEqual([def.buff_type,def.stack_count,def.max_raw_value],['def',3,40.5]);
  const permanent=parseEffectLine('Critical Damage ▲ 11.13% permanently.');
  assert.deepEqual([permanent.buff_type,permanent.duration_unit],['critical_damage','permanent']);
  const fullBurst=parseEffectLine('Full Burst Duration▲ 2 sec. Lasts until Full Burst ends.');
  assert.deepEqual([fullBurst.buff_type,fullBurst.value,fullBurst.value_unit,fullBurst.duration_unit],['full_burst_duration',2,'seconds','until_full_burst_end']);
  assert.deepEqual([parseEffectLine('Reloads 86.62% of the magazine.').buff_type,parseEffectLine('Reload 40%.').modifier_type],['reload_ratio','restore']);
  assert.deepEqual([parseEffectLine('Reloads 20 round(s) of ammunition.').buff_type,parseEffectLine('Reloads 20 round(s) of ammunition.').value_unit],['ammo_reload','rounds']);
  assert.deepEqual([parseEffectLine('Forced Reload.').buff_type,parseEffectLine('Forced Reload.').modifier_type],['forced_reload','trigger']);
  const fixed=parseEffectLine('Reload speed is fixed at a 50% reduction for 1 reload(s).');
  assert.deepEqual([fixed.buff_type,fixed.modifier_type,fixed.value,fixed.duration_unit],['reload_speed','set_modifier',-50,'reloads']);
  const reloadTime=parseEffectLine('Reload time is fixed at 3 sec for 6 sec. Removed upon firing the last bullet.');
  assert.deepEqual([reloadTime.buff_type,reloadTime.value,reloadTime.duration_value,reloadTime.end_condition],['reload_time',3,6,'firing_last_bullet']);
});
test('positive audit grammar structures caster scaling, healing bases, immunity, resources, and special mechanics',()=>{
  const caster=parseEffectLine("ATK ▲ 14.08% of the skill user's ATK constantly.");
  assert.deepEqual([caster.buff_type,caster.value_unit,caster.duration_unit],['caster_atk_based_atk','caster_atk_percent','continuous']);
  const drunken=parseEffectLine("ATK ▲ (20.06% * Number of Drunken stacks) of the skill user's ATK for 10 sec.");
  assert.deepEqual([drunken.value,drunken.stack_count,drunken.scaling_type,drunken.scaling_source_effect],[20.06,null,'multiply_by_named_stack','Drunken']);
  const attackHeal=parseEffectLine('Restores HP equal to 8.12% of attack damage. This effect is continuous.');
  assert.deepEqual([attackHeal.effect_type,attackHeal.buff_type,attackHeal.value_unit,attackHeal.duration_unit],['heal','attack_damage_based_heal','percent_of_attack_damage','continuous']);
  const periodic=parseEffectLine("Restores HP equal to 3.04% of the skill user's final max HP every second for 25 sec. This effect cannot be removed.");
  assert.deepEqual([periodic.heal_type,periodic.tick_interval,periodic.duration_value,periodic.removable],['periodic',1,25,false]);
  const normal=parseEffectLine('Normal attacks deal true damage continuously.');
  assert.deepEqual([normal.buff_type,normal.value,normal.duration_unit],['normal_attack_true_damage',true,'continuous']);
  const immunity=parseEffectLine('Gains immunity to Increase Charge Speed effects. This effect is continuous and cannot be removed.');
  assert.deepEqual([immunity.buff_type,immunity.immune_effect,immunity.removable],['debuff_immunity','increase_charge_speed',false]);
  const mp=parseEffectLine('Restores 1 MP, up to a maximum of 12. All MP is removed when using Burst Skill.');
  assert.deepEqual([mp.effect_type,mp.resource_type,mp.value,mp.resource_cap,mp.reset_condition],['resource','mp',1,12,'using_burst_skill']);
  const state=parseEffectLine('Blanching Duration ▲ 4 sec.');
  assert.deepEqual([state.effect_type,state.special_type,state.state_name,state.value],['special_mechanic','state_duration_modifier','Blanching',4]);
});
test('caster Charge Speed and caster Max HP based ATK never become ordinary percent ATK',()=>{
  const speed=parseEffectLine("Charge Speed ▲ 11.67% of the caster's Charge Speed for 10 sec.");
  assert.equal(speed.value_unit,'caster_charge_speed_percent');
  const atk=parseEffectLine("ATK ▲ 5% of the caster's Max HP for 10 sec.");
  assert.equal(atk.buff_type,'caster_max_hp_based_atk');assert.equal(atk.value_unit,'caster_max_hp_percent');
});
test('named stacks keep literal multipliers while ambiguous conditional prefixes fail closed',()=>{
  const stack=parseEffectLine('Reload Up: Reload Speed ▲ 3.81%, stacks up to 10 times and lasts for 5 sec.');
  assert.equal(stack.value,3.81);assert.equal(stack.max_raw_value,38.1);
  assert.equal(parseEffectLine('When healthy: ATK ▲ 20% for 10 sec.'),null);
});
test('explicit cumulative tiers are separate effects with the complete tier conditions',()=>{
  const text='■ Activates when Full Burst starts. Affects all allies.\n<color=#00AEFF>Effects vary according to the number of times entered.\nEach subsequent effect triggers all effects before it.\nOnce: ATK ▲ 5% for 10 sec.\nTwice: ATK ▲ 10% for 10 sec.\nThree times: ATK ▲ 15% for 10 sec.</color>';
  const s=character([{...ggSkill(1),description:text}]),out=extractCharacter(s,normalizeCharacter(s));
  assert.deepEqual(out.effects.map(e=>e.value),[5,10,15]);
  assert.ok(out.effects.every(e=>/Each subsequent/.test(e.condition)));
  assert.match(out.effects[1].condition,/Twice/);
});

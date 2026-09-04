import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {classifyReview,outsideComparison} from '../../scripts/review-classifier.mjs';
import {applyReviewWorkflow,emptyReviewStore,createDecision,validateReviewStore} from '../../scripts/review-pipeline.mjs';
import {filterReviews,reviewSummary,REVIEW_REASONS,reasonPriority} from '../../review-model.js';
import {catalogGroups} from '../../catalog-model.js';
import {assembleData} from '../../scripts/assemble-data.mjs';
const read=name=>JSON.parse(readFileSync(new URL(`../../data/${name}.json`,import.meta.url),'utf8'));
const character={character_id:'nikke-999',character_name:'Test',nikke_gg_url:'https://nikke.gg/characters/test/',nikke_explorer_url:'https://nikke.exynan.my.id/character/test'};
function item(body,heading='Activates when entering Full Burst. Affects self.',id=0){
  const text=heading+'\n'+body;
  return classifyReview({review_id:`nikke-999:101:${id}`,character_id:'nikke-999',character_name:'Test',skill_name:'Test Skill',skill_slot:'Skill 1',skill_level:10,source_skill_id:'101',source_type:'nikke_gg',source_url:character.nikke_gg_url,source_checked_at:'2026-08-28T12:00:00.000Z',source_text:text,reason:'未対応の効果・条件・単位を含む節（推測しない）',needs_review:true},character,{text:'■ '+text});
}
function base(body='ATK ▲ 20% for 10 sec.\nMystery Power ▲ 10% for 10 sec.'){
  const s={id:101,slot:1,name:'Test Skill',description:'■ Activates when entering Full Burst. Affects self.\n<color=#00AEFF>'+body+'</color>',levels:Array(10).fill({}),cooldown:0};
  return assembleData({gg:[{id:'999',name:'Test',slug:'test',visible:1,manufacturer:'Tetra',burst:'3',element:'Fire',weapon:'SR',class:'Attacker',rarity:'SSR',skills:[s]}],ggCheckedAt:'2026-08-28T12:00:00.000Z',index:[],indexCheckedAt:null,details:new Map(),warnings:[]});
}
const payload=(r,action='approve',revision=0)=>({base_revision:revision,action,review_keys:[r.review_key],reviewed_by:'human-test',review_note:'原文を確認',confirmed:true});
test('all generated review sections retain reasons, metadata and source links after parser upgrades',()=>{
  const rows=read('review-items');assert.equal(rows.length,read('collection-report').review_sections_total);assert.equal(new Set(rows.map(r=>r.review_key)).size,rows.length);
  for(const r of rows){assert.equal(r.needs_review_reasons.length>0,r.needs_review);assert.ok(r.needs_review_reasons.every(k=>k in REVIEW_REASONS));assert.equal(r.needs_review_reason,r.needs_review_reasons[0]||null);
    for(const field of ['review_status','reviewed_at','reviewed_by','manual_override','review_note','parser_candidates','nikke_gg_url','nikke_explorer_url','source_skill_text'])assert.ok(field in r,field);}
});
test('known enemy damage, DEF down, damage taken up and taunt are excluded without erasing text',()=>{
  for(const line of ['Deals 100% of final ATK as damage.','DEF ▼ 20% for 10 sec.','Damage Taken ▲ 10% for 10 sec.','Taunt for 5 sec.']){
    const r=item(line,'Affects the target.');assert.equal(r.review_status,'auto_excluded',line);assert.equal(r.needs_review,false);assert.ok(r.source_text.includes(line));assert.equal(r.needs_review_reason,null);}
});
test('direct healing is structured while shield creation stays outside numeric comparison and healing potency is a buff',()=>{
  const heal=item("Restores HP equal to 4.06% of the skill user's max HP.");assert.notEqual(heal.review_status,'auto_excluded');assert.equal(heal.candidate_effects[0].effect_type,'heal');
  assert.equal(item("Creates a shield with HP equal to 10.45% of the caster's max HP that lasts for 10 sec.").review_status,'auto_excluded');
  const r=item('Incoming Healing ▲ 20% for 10 sec.');assert.notEqual(r.review_status,'auto_excluded');assert.equal(r.candidate_effects[0].buff_type,'incoming_healing');
});
test('mixed buff and excluded cost only publishes buff with full cost and condition preserved',()=>{
  const r=item('ATK ▲ 23.15%. Stacks up to 5 times and lasts for 5 sec.\nCurrent HP ▼ 4.01%.');
  assert.equal(r.review_status,'auto_extracted');assert.equal(r.candidate_effects.length,1);assert.equal(r.candidate_effects[0].value,23.15);assert.equal(r.candidate_effects[0].max_raw_value,115.75);
  assert.match(r.candidate_effects[0].condition,/4.01/);assert.match(r.candidate_effects[0].trigger,/Full Burst/);
});
test('unknown suffixes and mixed unknown mechanics cannot be automatically excluded',()=>{
  assert.equal(outsideComparison('Deals 100% of final ATK as damage. Also grants ATK boost.'),null);
  for(const body of ['Deals 100% of final ATK as damage.\nMystery Power ▲ 10% for 10 sec.','ATK ▲ 20% for 10 sec.\nConverts remaining ammunition to damage.']){
    const r=item(body);assert.equal(r.review_status,'pending');assert.equal(r.needs_review,true);}
});
test('unknown buffs, missing raw values, missing duration and special mechanics have distinct reasons',()=>{
  assert.ok(item('Mystery Power ▲ 20% for 10 sec.').needs_review_reasons.includes('unknown_buff_type'));
  assert.ok(item('Gains a mysterious buff.').needs_review_reasons.includes('missing_value'));
  assert.ok(item('ATK ▲ 20%.').needs_review_reasons.includes('ambiguous_duration'));
  assert.ok(item('Copies ATK from another ally.').needs_review_reasons.includes('special_mechanic'));
});
test('inherited triggers and ambiguous targets are retained without guessing',()=>{
  const r=item('ATK ▲ 20% for 10 sec.','Affects the same allies.');assert.ok(r.needs_review_reasons.includes('ambiguous_target'));
  const noTrigger=item('ATK ▲ 20% for 10 sec.','Affects self.');assert.ok(noTrigger.needs_review_reasons.includes('ambiguous_trigger'));
});
test('source conflicts and missing values are never automatically excluded',()=>{
  const r=item('Deals 100% of final ATK as damage.','Affects the target.');
  const checked=classifyReview({...r,source_conflict:true},character,{text:r.source_skill_text});assert.equal(checked.needs_review,true);assert.equal(checked.review_status,'pending');
});
test('review ordering follows requested reason priority and counts explicitly overlap',()=>{
  const reasons=['not_a_buff_candidate','ambiguous_trigger','ambiguous_duration','ambiguous_target','special_mechanic','ambiguous_value','unknown_buff_type'];
  const rows=reasons.map((reason,i)=>({...item('Gains unknown buff.'),review_key:String(i),needs_review_reasons:[reason],needs_review_reason:reason,review_priority:reasonPriority(reason)}));
  assert.deepEqual(filterReviews(rows).map(r=>r.needs_review_reason),[...reasons].reverse());
  rows[0].needs_review_reasons.push('unknown_buff_type');assert.equal(reviewSummary(rows).reasons.unknown_buff_type.pending,2);
});
test('initial workflow does not invent human approvals and preserves curated Raw Values',()=>{
  const raw=base(),out=applyReviewWorkflow(structuredClone(raw));assert.ok(out['review-items'].every(r=>r.manual_override===false&&r.reviewed_at===null));
  const data=read('effects');
  for(const original of read('curated-effects')){const current=data.find(e=>e.effect_id===original.effect_id);assert.ok(current,original.effect_id);assert.equal(current.value,original.value);assert.equal(current.value_unit,original.value_unit);}
});
test('Approve preserves values and repeated collection cannot duplicate or undo manual effects',()=>{
  const raw=base(),initial=applyReviewWorkflow(structuredClone(raw)),r=initial['review-items'].find(r=>r.candidate_effects.length);
  const store=createDecision(emptyReviewStore(),initial['review-items'],payload(r),()=>[],'2026-08-29T00:00:00.000Z');
  const out=applyReviewWorkflow(structuredClone(raw),store),again=applyReviewWorkflow(structuredClone(raw),store);
  assert.equal(out.effects.length,1);assert.equal(out.effects[0].value,20);assert.equal(out.effects[0].needs_review,false);assert.equal(out.effects[0].manual_override,true);assert.deepEqual(out.effects,again.effects);
});
test('Edit wins after source changes while original review status and time remain protected',()=>{
  const raw=base(),initial=applyReviewWorkflow(structuredClone(raw)),r=initial['review-items'].find(r=>r.candidate_effects.length);
  const store=createDecision(emptyReviewStore(),initial['review-items'],{...payload(r,'edit'),effects:[{...r.candidate_effects[0],value:21,max_raw_value:21}]},()=>[],'2026-08-29T00:00:00.000Z');
  const changed=applyReviewWorkflow(base('ATK ▲ 30% for 10 sec.\nMystery Power ▲ 10% for 10 sec.'),store);
  assert.equal(changed.effects[0].value,21);assert.equal(changed.effects[0].needs_review,false);
  const review=changed['review-items'].find(r=>r.review_key===store.decisions[0].review_key);
  assert.equal(review.review_status,'edited');assert.equal(review.source_changed_since_review,true);assert.equal(review.reviewed_at,'2026-08-29T00:00:00.000Z');assert.match(review.source_text,/20%/);assert.match(review.current_source_text,/30%/);
});
test('manual override survives a parser upgrade that stops generating that review item',()=>{
  const initial=applyReviewWorkflow(base()),r=initial['review-items'].find(r=>r.candidate_effects.length);
  const store=createDecision(emptyReviewStore(),initial['review-items'],payload(r),()=>[]);
  const out=applyReviewWorkflow(base('ATK ▲ 30% for 10 sec.'),store);
  assert.equal(out.effects.length,1);assert.equal(out.effects[0].value,20);assert.equal(out['review-items'].find(x=>x.review_key===r.review_key)?.review_status,'approved');
});
test('Exclude remains excluded when the parser later recognizes a buff',()=>{
  const initial=applyReviewWorkflow(base()),r=initial['review-items'].find(r=>r.candidate_effects.length);
  const store=createDecision(emptyReviewStore(),initial['review-items'],payload(r,'exclude'),()=>[]);
  const out=applyReviewWorkflow(base('ATK ▲ 30% for 10 sec.'),store);assert.equal(out.effects.length,0);assert.equal(out['review-items'].find(x=>x.review_key===r.review_key).review_status,'excluded');
});
test('moving an approved section preserves its decision without overwriting a new neighboring review',()=>{
  const raw=base(),initial=applyReviewWorkflow(structuredClone(raw)),r=initial['review-items'].find(r=>r.candidate_effects.length);
  const store=createDecision(emptyReviewStore(),initial['review-items'],payload(r),()=>[]);
  const moved=structuredClone(raw),snapshot=moved['skill-snapshots'][0];
  const neighbor='Activates when entering Full Burst. Affects self.\nMystery Aura ▲ 10% for 10 sec.';
  snapshot.text='■ '+neighbor+'\n'+snapshot.text;
  const original=moved['review-queue'].find(q=>q.source_skill_id==='101');
  original.review_id='nikke-999:101:1';moved['review-queue'].push({...original,review_id:'nikke-999:101:0',source_text:neighbor});
  const out=applyReviewWorkflow(moved,store);
  assert.equal(out['review-items'].filter(q=>q.review_status==='approved').length,1);
  assert.ok(out['review-queue'].some(q=>q.source_text===neighbor));
  assert.equal(out['review-items'].find(q=>q.review_status==='approved').source_changed_since_review,false);
});
test('malformed saved review decisions fail closed rather than being reset',()=>{
  assert.throws(()=>validateReviewStore({revision:0}),/初期化/);
  assert.throws(()=>validateReviewStore({...emptyReviewStore(),decisions:[{review_key:'bad'}]}),/不正/);
});
test('Hold remains pending and cannot be silently published by new parser output',()=>{
  const initial=applyReviewWorkflow(base()),r=initial['review-items'].find(r=>r.candidate_effects.length);
  const store=createDecision(emptyReviewStore(),initial['review-items'],payload(r,'hold'),()=>[]);
  const out=applyReviewWorkflow(base('ATK ▲ 30% for 10 sec.'),store);assert.equal(out.effects.length,0);assert.equal(out['review-items'].find(x=>x.review_key===r.review_key).review_status,'hold');
});
test('bulk exclusion rejects noncandidate selection atomically and preserves audit records',()=>{
  const excluded=item('Deals 100% of final ATK as damage.','Affects the target.');
  const candidate={...excluded,needs_review:true,review_status:'pending',needs_review_reasons:['not_a_buff_candidate'],needs_review_reason:'not_a_buff_candidate',review_priority:7};
  const rows=[candidate,item('Mystery Power ▲ 10% for 10 sec.','Affects self.',1)];
  assert.throws(()=>createDecision(emptyReviewStore(),rows,{...payload(rows[0],'bulk_exclude'),review_keys:rows.map(r=>r.review_key)},()=>[]),/一括除外/);
  const store=createDecision(emptyReviewStore(),rows,payload(rows[0],'bulk_exclude'),()=>[]);assert.equal(store.decisions.length,1);assert.equal(store.audit.length,1);assert.equal(store.decisions[0].manual_override,true);
});
test('stale revisions, missing reviewer, unconfirmed decisions and invalid edits are rejected',()=>{
  const r=item('ATK ▲ 10% for 10 sec.');
  for(const patch of [{base_revision:9},{reviewed_by:''},{confirmed:false},{effects:[],action:'edit'}])assert.throws(()=>createDecision(emptyReviewStore(),[r],{...payload(r),...patch},()=>[]));
  assert.throws(()=>createDecision(emptyReviewStore(),[r],payload(r),()=>['invalid effect']),/invalid effect/);
});
test('release date review status is separate and cannot hide known skills from comparison',()=>{
  const output=applyReviewWorkflow(base('ATK ▲ 20% for 10 sec.')),c=output.characters[0];
  assert.equal(c.release_date_review_status,'needs_review');assert.equal(c.release_date_needs_review,true);
  assert.ok('effect_review_status' in c);assert.equal(catalogGroups(output.characters,output.effects,{type:'atk'}).length,1);
  const chars=read('characters');assert.equal(chars.filter(c=>c.release_date_review_status==='verified').length,5);
});
test('Review UI selectors, safe rendering and persistence-only actions are wired',()=>{
  const html=readFileSync(new URL('../../review.html',import.meta.url),'utf8'),js=readFileSync(new URL('../../review.js',import.meta.url),'utf8');
  for(const match of js.matchAll(/['"]#([a-z][a-z0-9-]*)['"]/g))assert.ok(html.includes(`id="${match[1]}"`),match[1]);
  assert.ok(!/\.innerHTML\s*=|localStorage|sessionStorage/.test(js));assert.match(js,/base_revision/);assert.match(js,/X-Review-Token/);
});

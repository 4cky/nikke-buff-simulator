import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {makeRawSourceSnapshots,diffRawSourceSnapshots,protectManualOverrides,protectReviewDecisions,stableIdViolations,
  auditCandidate,diffLimitations,sha256} from '../../scripts/update-model.mjs';
import {verifyCanonical} from '../../scripts/verify-data.mjs';

const read=async name=>JSON.parse(await readFile(new URL(`../../data/${name}.json`,import.meta.url),'utf8'));
const [characters,effects,skills,nonbuff,metadata,queue,charSchema,effectSchema,baseline,manifest,history]=await Promise.all([
  'characters','effects','skill-snapshots','non-buff-effects','metadata-only-effects','review-queue','character-schema','effect-schema',
  'raw-source-snapshots','dataset-manifest','data-generation-history'].map(read));
test('v4.2.2 update baseline is pinned without changing dataset semantics',()=>{
  assert.equal(manifest.parser_version,'4.2.2');assert.equal(manifest.character_count,199);assert.equal(manifest.structured_count,1391);
  assert.equal(manifest.comparison_count,991);assert.equal(manifest.excluded_count,400);assert.equal(manifest.review_count,1);
  assert.ok(history.length>=1);assert.equal(history.at(-1).source_hash,manifest.source_hash);assert.equal(history[0].baseline,true);
});
test('raw source snapshots cover every character and all three selected skill slots',()=>{
  assert.equal(baseline.length,characters.length);assert.equal(new Set(baseline.map(s=>s.character_id)).size,199);
  assert.ok(baseline.every(s=>s.content_hash&&s.raw_skill_texts.length===3&&s.raw_skill_texts.every(k=>k.content_hash&&k.raw_skill_text)));
  assert.deepEqual(makeRawSourceSnapshots(characters,skills).map(s=>s.content_hash),baseline.map(s=>s.content_hash));
});
test('incremental source diff separates new, changed, removed and unchanged characters',()=>{
  const changed=structuredClone(baseline.slice(0,3));changed[0].raw_skill_texts[0].raw_skill_text+=' changed';changed[0].raw_skill_texts[0].content_hash=sha256(changed[0].raw_skill_texts[0].raw_skill_text);changed[0].content_hash=sha256(changed[0].raw_skill_texts.map(({source_checked_at,...s})=>s));
  changed.splice(1,1);changed.push({...structuredClone(changed[0]),character_id:'nikke-new',character_name:'New',content_hash:'new'});
  const diff=diffRawSourceSnapshots(baseline.slice(0,3),changed);
  assert.equal(diff.added.length,1);assert.equal(diff.changed.length,1);assert.equal(diff.removed.length,1);assert.equal(diff.unchanged.length,1);assert.equal(diff.skill_changes.length,1);
});
test('manual overrides are restored byte-for-byte and never overwritten',()=>{
  const current={...effects[0],manual_override:true,value:12.34},candidate={...current,value:99};const output={characters:structuredClone(characters.slice(0,1)),effects:[candidate]};
  const result=protectManualOverrides(output,[],[current]);assert.equal(result.protected_count,1);assert.equal(result.attempted_overwrite_count,1);assert.equal(result.actual_overwrite_count,0);assert.deepEqual(output.effects,[current]);
});
test('changed source makes a review decision stale and quarantines its comparison effect',()=>{
  const item={review_key:'review:test',character_id:'nikke-1',character_name:'Test',skill_slot:'Skill 1',needs_review:false,review_status:'approved'};
  const output={effects:[{effect_id:'manual:1',review_key:'review:test'}],'skill-snapshots':[{character_id:'nikke-1',skill_slot:'Skill 1',text:'■ new source'}],
    'review-items':[item],'review-queue':[],'collection-report':{pending_sections:0,comparable_effects:1}};
  const store={decisions:[{review_key:'review:test',source_hash:'old',review_status:'approved',item_snapshot:{character_id:'nikke-1',character_name:'Test',skill_slot:'Skill 1',source_section_index:0},effects:[{effect_id:'manual:1'}]}]};
  const result=protectReviewDecisions(output,store);assert.equal(result.stale_count,1);assert.equal(output.effects.length,0);assert.equal(item.stale_review_decision,true);assert.equal(item.review_status,'hold');assert.equal(output['review-queue'].length,1);
});
test('stable effect ID audit is parser-order independent and supports duplicate semantics',()=>{
  const a={...effects[0],effect_id:'a'},b={...a,effect_id:'b'};assert.deepEqual(stableIdViolations([a,b],[b,a],[a.character_id]),[]);
  assert.equal(stableIdViolations([a],[{...a,effect_id:'changed'}],[a.character_id]).length,1);
});
test('source limitations are reported as count changes, not quality failures',()=>{
  const before=[{source_limitations:['trigger_not_stated']}],after=[{source_limitations:['trigger_not_stated','duration_not_stated']}];
  assert.deepEqual(diffLimitations(before,after),[{source_limitation:'duration_not_stated',before:0,after:1}]);
});
test('canonical candidate passes every data-only quality gate',()=>{
  const output={characters,effects,'non-buff-effects':nonbuff,'metadata-only-effects':metadata,'review-queue':queue,
    'unknown-buff-candidates':[],'unrecognized-positive-effect-candidates':[],'source-conflicts':[]};
  const audit=auditCandidate(output,{characterSchema:charSchema,effectSchema,current:{characters:199,comparison:991,excluded:400,structured:1391},manualProtection:{actual_overwrite_count:0},idViolations:[]});
  assert.deepEqual(audit.errors,[]);assert.equal(audit.counts.structured,1391);assert.equal(audit.counts.review,1);
});
test('comparison boundary fails closed for excluded effect types and pending reviews',()=>{
  const bad={...effects[0],effect_id:'bad:comparison',effect_type:'damage',needs_review:true};
  const output={characters,effects:[...effects,bad],'non-buff-effects':nonbuff,'metadata-only-effects':metadata,'review-queue':queue,
    'unknown-buff-candidates':[],'unrecognized-positive-effect-candidates':[],'source-conflicts':[]};
  const audit=auditCandidate(output,{characterSchema:charSchema,effectSchema,current:{characters:199,comparison:991,excluded:400,structured:1391},manualProtection:{actual_overwrite_count:0},idViolations:[]});
  assert.ok(audit.errors.some(e=>e.startsWith('comparison boundary violation')));
});
test('large character/effect deletion is suspicious and fails closed',()=>{
  const removedIds=new Set(characters.slice(0,30).map(c=>c.character_id)),candidateCharacters=characters.filter(c=>!removedIds.has(c.character_id));
  const keep=rows=>rows.filter(e=>!removedIds.has(e.character_id));
  const output={characters:candidateCharacters,effects:keep(effects),'non-buff-effects':keep(nonbuff),'metadata-only-effects':keep(metadata),'review-queue':[],
    'unknown-buff-candidates':[],'unrecognized-positive-effect-candidates':[],'source-conflicts':[]};
  const audit=auditCandidate(output,{characterSchema:charSchema,effectSchema,current:{characters:199,comparison:991,excluded:400,structured:1391},manualProtection:{actual_overwrite_count:0},idViolations:[]});
  assert.equal(audit.suspicious_update,true);assert.ok(audit.errors.some(e=>e.startsWith('suspicious_update')));
});
test('verify-data can audit the canonical dataset without network access',async()=>{
  const result=await verifyCanonical({runTests:false,runBuild:false});assert.equal(result.ok,true);assert.equal(result.audit.counts.comparison,991);assert.equal(result.audit.counts.excluded,400);
});
test('package exposes update, dry-run-capable pipeline and offline verify commands',async()=>{
  const pkg=JSON.parse(await readFile(new URL('../../package.json',import.meta.url),'utf8')),source=await readFile(new URL('../../scripts/update-data.mjs',import.meta.url),'utf8');
  assert.equal(pkg.scripts['update-data'],'node scripts/update-data.mjs');assert.equal(pkg.scripts['verify-data'],'node scripts/verify-data.mjs');
  assert.equal(pkg.scripts['test:data'],'node scripts/run-data-tests.mjs');assert.equal(pkg.scripts['seed'],'node scripts/seed-demo-data.mjs');
  for(const flag of ['--dry-run','--full','--offline'])assert.ok(source.includes(flag));assert.ok(source.indexOf('testCandidate')<source.indexOf('writeCollection(output)'));
  assert.ok(source.lastIndexOf('publishCache(cacheRoot,id)')<source.lastIndexOf('writeCollection(output)'));assert.ok(source.includes('restoreCachePointer(previousPointer)'));
});

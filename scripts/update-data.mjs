import {cp,mkdir,mkdtemp,readFile,rename,rm,writeFile} from 'node:fs/promises';
import {join,resolve,sep} from 'node:path';
import {pathToFileURL} from 'node:url';
import {fetchInputs} from './fetch-sources.mjs';
import {prepareCollection,withDataLock,writeCollection} from './collect-data.mjs';
import {materializeCandidateProject,testCandidate,buildCandidate} from './update-runner.mjs';
import {auditCandidate,diffEffects,diffLimitations,diffRawSourceSnapshots,effectSemanticIdentity,makeRawSourceSnapshots,
  protectManualOverrides,protectReviewDecisions,sha256,stableIdViolations,stableStringify,withoutVolatile} from './update-model.mjs';

const readJson=async path=>JSON.parse(await readFile(path,'utf8'));
const optional=async(path,fallback)=>{try{return await readJson(path);}catch(e){if(e.code==='ENOENT')return fallback;throw e;}};
const DATASETS=['characters','effects','skill-snapshots','review-queue','review-items','collection-report','non-buff-effects','metadata-only-effects',
  'unknown-buff-candidates','unrecognized-positive-effect-candidates','source-conflicts'];
const data=async name=>readJson(`data/${name}.json`);
const pad=n=>String(n).padStart(2,'0');
const runStamp=date=>`${date.getUTCFullYear()}${pad(date.getUTCMonth()+1)}${pad(date.getUTCDate())}-${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}`;
const reportDate=date=>date.toISOString().slice(0,10);
const effectKinds=records=>[...new Set(records.map(e=>e.buff_type||e.special_type||e.resource_type).filter(Boolean))].sort();
const reviewKeys=items=>new Set(items.filter(r=>r.needs_review).map(r=>r.review_key));
const characterSummary=c=>({character_id:c.character_id,character_name:c.character_name,page_url:c.nikke_gg_url||c.nikke_explorer_url||null,
  manufacturer:c.manufacturer,burst_stage:c.burst_stage,element:c.element,weapon_type:c.weapon_type,class:c.class,rarity:c.rarity,
  release_date:c.release_date,release_date_review_status:c.release_date_review_status});
async function copyCache(fromRoot,toRoot){
  await mkdir(toRoot,{recursive:true});
  for(const name of ['nikke-gg-raw','nikke-explorer-raw']){try{await cp(join(fromRoot,name),join(toRoot,name),{recursive:true});}catch(e){if(e.code!=='ENOENT')throw e;}}
}
async function currentCacheRoot(){
  const pointer=await optional('work/source-cache-current.json',null);
  if(pointer?.path&&pointer.path.startsWith('work/source-cache-generations/'))return pointer.path;
  return 'work';
}
async function publishCache(cacheRoot,id){
  const target=`work/source-cache-generations/${id}`;await mkdir('work/source-cache-generations',{recursive:true});await rename(cacheRoot,target);
  const temp='work/source-cache-current.json.tmp';await writeFile(temp,JSON.stringify({path:target,published_at:new Date().toISOString()},null,2)+'\n');await rename(temp,'work/source-cache-current.json');
  return target;
}
async function restoreCachePointer(previous){
  const temp='work/source-cache-current.json.tmp';
  if(previous){await writeFile(temp,JSON.stringify(previous,null,2)+'\n');await rename(temp,'work/source-cache-current.json');}
  else{try{await rm('work/source-cache-current.json');}catch(e){if(e.code!=='ENOENT')throw e;}}
}
function currentCounts(current){return {characters:current.characters.length,comparison:current.effects.length,
  excluded:current['non-buff-effects'].length+current['metadata-only-effects'].length,
  structured:current.effects.length+current['non-buff-effects'].length+current['metadata-only-effects'].length,
  review:current['review-queue'].filter(r=>r.needs_review).length};}
function changedCharacters(before,after){
  const old=new Map(before.map(c=>[c.character_id,c]));return after.filter(c=>old.has(c.character_id)&&stableStringify(withoutVolatile(c))!==stableStringify(withoutVolatile(old.get(c.character_id))));
}
function removedTypes(before,after){const next=new Set(effectKinds(after));return effectKinds(before).filter(k=>!next.has(k));}
function sourceChangeReport(diff,generatedAt){return {generated_at:generatedAt,changed_characters:diff.changed.length,changed_skills:diff.skill_changes.length,changes:diff.skill_changes};}
function generationEntry(output,rawSnapshots,generatedAt){const counts={comparison:output.effects.length,excluded:output['non-buff-effects'].length+output['metadata-only-effects'].length};return {
  generated_at:generatedAt,parser_version:output['collection-report'].parser_version,character_count:output.characters.length,
  structured_count:counts.comparison+counts.excluded,comparison_count:counts.comparison,excluded_count:counts.excluded,
  comparison_effect_type_counts:Object.fromEntries(['buff','heal','revive'].map(type=>[type,output.effects.filter(e=>e.effect_type===type).length])),
  review_count:output['review-queue'].filter(r=>r.needs_review).length,source_hash:sha256(rawSnapshots.map(s=>[s.character_id,s.content_hash]))};}
function markdown(report){
  const lines=[`# NIKKE Buff Atlas update report — ${report.generated_at}`,'',`- Status: **${report.status}**`,`- Mode: ${report.mode}${report.dry_run?' / dry-run':''}`,
    `- Parser: ${report.parser_version}`,'', '## Added characters',''];
  lines.push(...(report.added_characters.length?report.added_characters.map(c=>`- ${c.character_name} (${c.character_id}) · ${c.page_url||'source URL unknown'}`):['- None']));
  lines.push('','## Updated characters','',...(report.updated_characters.length?report.updated_characters.map(c=>`- ${c.character_name} (${c.character_id})`):['- None']),
    '','## Removed characters','',...(report.removed_characters.length?report.removed_characters.map(c=>`- ${c.character_name} (${c.character_id})`):['- None']),
    '','## Effect changes','',`- Added effects: ${report.effects.added}`,`- Changed effects: ${report.effects.changed}`,`- Removed effects: ${report.effects.removed}`,
    `- New buff/special/resource types: ${report.new_types.length?report.new_types.join(', '):'None'}`,
    '','## Review and sources','',`- New review items: ${report.review.new}`,`- Resolved review items: ${report.review.resolved}`,`- Existing unresolved review items: ${report.review.existing}`,
    `- Source conflicts: ${report.source_conflicts}`,`- Source limitations changes: ${report.source_limitations_changes.length}`,
    `- Source skill changes: ${report.source_changes.changed_skills}`,
    '','## Protection','',`- Manual override protected: ${report.manual_override.protected_count}`,
    `- Attempted overwrite: ${report.manual_override.attempted_overwrite_count}`,`- Actual overwrite: ${report.manual_override.actual_overwrite_count}`,
    `- Review decisions protected: ${report.review_decisions.protected_count}`,`- Stale review decisions: ${report.review_decisions.stale_count}`,
    `- Stable effect ID violations: ${report.stable_effect_id_violations}`,
    '','## Counts','',`- Characters: ${report.before.characters} → ${report.after.characters}`,
    `- Structured records: ${report.before.structured} → ${report.after.structured}`,
    `- Comparison effects: ${report.before.comparison} → ${report.after.comparison}`,
    `- Excluded effects: ${report.before.excluded} → ${report.after.excluded}`,
    `- Review: ${report.before.review} → ${report.after.review}`,
    '','## Quality gates','',...report.quality_gates.map(g=>`- ${g.ok?'PASS':'FAIL'} — ${g.name}${g.detail?`: ${g.detail}`:''}`),
    '','## Release date changes','',...(report.release_date_changes.length?report.release_date_changes.map(c=>`- ${c.character_name}: ${c.before||'unknown'} → ${c.after||'unknown'}`):['- None']),
    '','## Rollback','',`- ${report.rollback}`,'');return lines.join('\n');
}
async function writeReports(report,id){
  await mkdir('outputs/update-reports',{recursive:true});const base=`outputs/update-reports/update-report-${reportDate(new Date(report.generated_at))}-${id}`;
  await writeFile(`${base}.json`,JSON.stringify(report,null,2)+'\n');await writeFile(`${base}.md`,markdown(report));
  await writeFile('outputs/update-reports/latest.json',JSON.stringify(report,null,2)+'\n');await writeFile('outputs/update-reports/latest.md',markdown(report));
  return {json:`${base}.json`,markdown:`${base}.md`};
}
export async function runUpdate({dryRun=false,full=false,offline=false,now=new Date(),runTests=true,runBuild=true}={}){
  const id=runStamp(now),stage=await mkdtemp(join('work',`update-run-${id}-`)),cacheRoot=join(stage,'cache');let cachePublished=null;
  const current=Object.fromEntries(await Promise.all(DATASETS.map(async name=>[name,await data(name)])));
  const [characterSchema,effectSchema,reviewStore]=await Promise.all([data('character-schema'),data('effect-schema'),data('review-decisions')]);
  const before=currentCounts(current),generatedAt=now.toISOString();let reportPath;
  try{
    await copyCache(await currentCacheRoot(),cacheRoot);
    let inputs;
    try{inputs=await fetchInputs({offline,audit:full,cacheRoot});}
    catch(error){
      const failure={generated_at:generatedAt,status:'source_fetch_error',mode:full?'full':'incremental',dry_run:dryRun,parser_version:current['collection-report'].parser_version,
        before,after:before,error:error.message,source_fetch_error:true,rollback:'Canonical data and cached raw snapshot were not changed.'};
      reportPath=await writeReports({...failure,added_characters:[],updated_characters:[],removed_characters:[],effects:{added:0,changed:0,removed:0},new_types:[],review:{new:0,resolved:0,existing:before.review},source_conflicts:0,source_limitations_changes:[],source_changes:{changed_skills:0},manual_override:{protected_count:0,attempted_overwrite_count:0,actual_overwrite_count:0},review_decisions:{protected_count:reviewStore.decisions.length,stale_count:0},stable_effect_id_violations:0,quality_gates:[{name:'source fetch',ok:false,detail:error.message}],release_date_changes:[]},id);
      throw Object.assign(Error(`source_fetch_error: ${error.message}`),{reportPath});
    }
    const output=await prepareCollection({offline,full,inputs,decisionStore:reviewStore});
    const previousSnapshots=await optional('data/raw-source-snapshots.json',makeRawSourceSnapshots(current.characters,current['skill-snapshots']));
    const nextSnapshots=makeRawSourceSnapshots(output.characters,output['skill-snapshots']),sourceDiff=diffRawSourceSnapshots(previousSnapshots,nextSnapshots);
    const allBefore=[...current.effects,...current['non-buff-effects'],...current['metadata-only-effects']];
    const manual=protectManualOverrides(output,current.characters,current.effects),decisions=protectReviewDecisions(output,reviewStore);
    const protectedAllAfter=[...output.effects,...output['non-buff-effects'],...output['metadata-only-effects']];
    const unchangedIds=sourceDiff.unchanged.map(s=>s.character_id),idViolations=stableIdViolations(allBefore,protectedAllAfter,unchangedIds);
    const audit=auditCandidate(output,{characterSchema,effectSchema,current:before,manualProtection:manual,idViolations});
    const effectsDiff=diffEffects(allBefore,protectedAllAfter),oldReviews=reviewKeys(current['review-queue']),newReviews=reviewKeys(output['review-queue']);
    const addedCharacters=output.characters.filter(c=>!current.characters.some(o=>o.character_id===c.character_id)),removedCharacters=current.characters.filter(c=>!output.characters.some(o=>o.character_id===c.character_id));
    const updatedCharacters=changedCharacters(current.characters,output.characters).filter(c=>!addedCharacters.some(a=>a.character_id===c.character_id));
    const releaseChanges=output.characters.flatMap(c=>{const old=current.characters.find(o=>o.character_id===c.character_id);return old&&old.release_date!==c.release_date?[{character_id:c.character_id,character_name:c.character_name,before:old.release_date,after:c.release_date}]:[];});
    const removedBuffTypes=removedTypes(allBefore,protectedAllAfter);if(removedBuffTypes.length>5)audit.errors.push(`suspicious_update: ${removedBuffTypes.length} existing effect types disappeared`);
    const entry=generationEntry(output,nextSnapshots,generatedAt),history=await optional('data/data-generation-history.json',[]);
    output['raw-source-snapshots']=nextSnapshots;output['source-change-report']=sourceChangeReport(sourceDiff,generatedAt);
    output['dataset-manifest']=entry;output['data-generation-history']=[...history,entry];
    const stageProject=await materializeCandidateProject(stage,output),testResult=runTests?await testCandidate(stageProject):{code:0,stdout:'skipped',stderr:''};
    if(testResult.code)audit.errors.push(`regression tests failed (${testResult.code})`);
    const buildResult=runBuild&&testResult.code===0?await buildCandidate(stage,stageProject):{code:testResult.code?1:0,stdout:runBuild?'skipped because tests failed':'skipped',stderr:''};
    if(buildResult.code)audit.errors.push(`production build failed (${buildResult.code})`);
    const gates=[
      {name:'schema validation',ok:!audit.errors.some(e=>!/^Unknown|^Unrecognized|^comparison|^effect ID|^manual|^stable|^suspicious|^regression|^production/.test(e)),detail:audit.errors.filter(e=>!/^Unknown|^Unrecognized|^comparison|^effect ID|^manual|^stable|^suspicious|^regression|^production/.test(e)).join('; ')},
      {name:'Unknown Buff Type = 0',ok:audit.counts.unknown_buff_types===0},{name:'unrecognized positive = 0',ok:audit.counts.unrecognized_positive===0},
      {name:'comparison/excluded boundary',ok:!audit.errors.some(e=>e.startsWith('comparison boundary'))},{name:'effect ID overlap = 0',ok:audit.overlap_count===0},
      {name:'stable effect IDs',ok:idViolations.length===0},{name:'manual override overwrite = 0',ok:manual.actual_overwrite_count===0},
      {name:'suspicious deletion protection',ok:!audit.suspicious_update&&!audit.errors.some(e=>e.startsWith('suspicious_update'))},
      {name:'regression tests',ok:testResult.code===0,detail:testResult.code?testResult.stderr.trim().slice(-500):testResult.stdout.match(/tests\s+\d+/)?.[0]||'pass'},
      {name:'production build',ok:buildResult.code===0,detail:buildResult.stdout.trim()}];
    const after={...audit.counts,review:audit.counts.review};
    const report={generated_at:generatedAt,status:audit.errors.length?'failed_quality_gate':dryRun?'dry_run_passed':'applied',mode:full?'full':'incremental',dry_run:dryRun,offline,
      parser_version:output['collection-report'].parser_version,before,after,source_classification:{new:sourceDiff.added.length,changed:sourceDiff.changed.length,unchanged:sourceDiff.unchanged.length,removed:sourceDiff.removed.length},
      added_characters:addedCharacters.map(characterSummary),updated_characters:updatedCharacters.map(characterSummary),removed_characters:removedCharacters.map(characterSummary),
      effects:{added:effectsDiff.added.length,changed:effectsDiff.changed.length,removed:effectsDiff.removed.length},
      new_types:effectKinds(protectedAllAfter).filter(k=>!effectKinds(allBefore).includes(k)),removed_types:removedBuffTypes,
      review:{new:[...newReviews].filter(k=>!oldReviews.has(k)).length,resolved:[...oldReviews].filter(k=>!newReviews.has(k)).length,existing:[...newReviews].filter(k=>oldReviews.has(k)).length},
      source_conflicts:audit.counts.source_conflicts,source_limitations_changes:diffLimitations(current.effects,output.effects),source_changes:output['source-change-report'],
      release_date_changes:releaseChanges,manual_override:manual,review_decisions:decisions,stable_effect_id_violations:idViolations.length,
      suspicious_update:audit.suspicious_update,quality_gate_errors:audit.errors,quality_gates:gates,
      incremental_note:full?'All source slots were audited and the full dataset was parsed.':'Characters were classified by content hash; unchanged output is retained semantically. The full parser validation pass remains enabled for safety.',
      rollback:audit.errors.length||dryRun?'Canonical production data was not changed.':'Previous JSON files were snapshotted; writeCollection uses temporary files and restores replaced files if commit fails.',
      tests:{code:testResult.code,summary:testResult.stdout.trim().split('\n').slice(-10)},production_build:{code:buildResult.code,output:buildResult.stdout.trim()}};
    reportPath=await writeReports(report,id);
    if(audit.errors.length)throw Object.assign(Error(`Quality gates failed; canonical data was not changed.\n${audit.errors.join('\n')}`),{reportPath});
    if(!dryRun){
      const previousPointer=await optional('work/source-cache-current.json',null);
      try{cachePublished=await publishCache(cacheRoot,id);await writeCollection(output);report.cache_published=cachePublished;}
      catch(error){
        await restoreCachePointer(previousPointer);report.status='commit_failed';report.rollback='Cache pointer was restored and writeCollection restored every partially replaced canonical JSON file.';
        report.quality_gates.push({name:'atomic commit',ok:false,detail:error.message});reportPath=await writeReports(report,id);throw Object.assign(error,{reportPath});
      }
    }
    return {...report,report_files:reportPath,cache_published:cachePublished};
  }finally{
    const target=resolve(stage),base=resolve('work')+sep;if(!target.startsWith(base)||!target.includes(`${sep}update-run-`))throw Error('Unsafe update staging cleanup');
    await rm(target,{recursive:true,force:true});
  }
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const args=new Set(process.argv.slice(2));
  try{
    const result=await withDataLock(()=>runUpdate({dryRun:args.has('--dry-run'),full:args.has('--full'),offline:args.has('--offline')}));
    console.log(JSON.stringify({status:result.status,mode:result.mode,dry_run:result.dry_run,before:result.before,after:result.after,
      source_classification:result.source_classification,effects:result.effects,manual_override:result.manual_override,review_decisions:result.review_decisions,
      stable_effect_id_violations:result.stable_effect_id_violations,quality_gates:result.quality_gates,report_files:result.report_files},null,2));
  }catch(error){console.error(error.message);if(error.reportPath)console.error(JSON.stringify({report_files:error.reportPath},null,2));process.exitCode=1;}
}

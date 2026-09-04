import {readFile,writeFile,mkdir,rename,open,unlink} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {fetchInputs} from './fetch-sources.mjs';
import {assembleData} from './assemble-data.mjs';
import {validateDataset} from './validate-data.mjs';
import {applyReviewWorkflow,emptyReviewStore} from './review-pipeline.mjs';
import {assertHierarchyRegression} from './hierarchy-regression.mjs';
import {applyResidualAuditResolutions} from './residual-grammar.mjs';
import {applyFinalHumanReview} from './final-review-grammar.mjs';
const read=async path=>JSON.parse(await readFile(path,'utf8'));
const optional=async(path,fallback=[])=>{try{return await read(path);}catch(e){if(e.code==='ENOENT')return fallback;throw e;}};
export async function withDataLock(action){
  await mkdir('work',{recursive:true});let lock;
  try{lock=await open('work/data-write.lock','wx');}
  catch(e){if(e.code==='EEXIST')throw Object.assign(Error('データの更新処理中です。少し待ってから再実行してください。'),{status:409});throw e;}
  try{await lock.writeFile(JSON.stringify({pid:process.pid,started_at:new Date().toISOString()}));return await action();}
  finally{await lock.close();await unlink('work/data-write.lock');}
}
export async function prepareCollection({offline=false,audit=false,decisionStore,inputs,cacheRoot='work'}={}){
  // Hard gate: no catalog fetch/reparse/write if Mode B semantics regress.
  assertHierarchyRegression();
  const sourceInputs=inputs||await fetchInputs({offline,audit,cacheRoot});
  const base=assembleData(sourceInputs,{
    overrides:await optional('data/character-overrides.json',{}),curated:await optional('data/curated-effects.json',[]),reviewed:await optional('data/reviewed-skills.json',[]),
    known:await optional('data/skill-snapshots.json'),previousSlots:await optional('data/slot-source-status.json'),history:await optional('data/source-history.json')
  });
  const store=decisionStore||await optional('data/review-decisions.json',emptyReviewStore());
  let output=applyReviewWorkflow(base,store);output['collection-report'].offline=offline;
  const residualAudit=await optional('review-audit-v4.2-residual.json',null);
  if(residualAudit)output=applyResidualAuditResolutions(output,residualAudit);
  if(residualAudit)output=applyFinalHumanReview(output);
  output['unknown-reclassification-report'].remaining_needs_review_effects=output['review-items'].filter(r=>r.needs_review).reduce((n,r)=>n+(r.parser_candidates?.filter(c=>c.hierarchy?.effect_type==='buff'||c.effect_type==='buff').length||1),0);
  output['unknown-reclassification-report'].remaining_review_sections=output['review-items'].filter(r=>r.needs_review).length;
  output['unknown-reclassification-report'].comparable_effects_total=output.effects.filter(e=>!e.needs_review).length;
  output['unknown-reclassification-report'].debuff_immunity_effects_total=output.effects.filter(e=>!e.needs_review&&e.buff_type==='debuff_immunity').length;
  output['unknown-reclassification-report'].generated_at=new Date().toISOString();
  const previousEffects=await optional('data/effects.json');
  const semantic=e=>[e.character_id,e.skill_slot,e.buff_type,typeof e.value==='number'?e.value.toFixed(8):String(e.value),e.value_unit,e.target_type].join('|');
  const current=new Set(output.effects.map(semantic));
  const nonBuffBySlot=new Map(output['non-buff-effects'].map(e=>[`${e.character_id}:${e.skill_slot}`,e]));
  output['parser-migration-report']={generated_at:new Date().toISOString(),parser_version:output['collection-report'].parser_version,
    previous_effect_count:previousEffects.length,current_effect_count:output.effects.length,
    retained_semantically:previousEffects.filter(e=>current.has(semantic(e))).length,
    removed_from_comparison:previousEffects.filter(e=>!current.has(semantic(e))).map(e=>({effect_id:e.effect_id,character_id:e.character_id,character_name:e.character_name,
      skill_slot:e.skill_slot,buff_type:e.buff_type,value:e.value,value_unit:e.value_unit,
      disposition:e.manual_override?'manual_review_updated':nonBuffBySlot.has(`${e.character_id}:${e.skill_slot}`)?'comparison_excluded_non_buff':'held_for_review_or_reclassified'}))};
  const previousMigration=await optional('data/parser-migration-report.json',null);
  if(previousMigration?.parser_version===output['collection-report'].parser_version&&previousEffects.length===output.effects.length&&output['parser-migration-report'].retained_semantically===previousEffects.length)output['parser-migration-report']=previousMigration;
  const errors=validateDataset(output.characters,output.effects,await read('data/character-schema.json'),await read('data/effect-schema.json'));
  if(errors.length)throw Error('Validation failed; published data was not changed.\n'+errors.join('\n'));
  return output;
}
export async function writeCollection(output,extra={}){
  const files={...output,...extra},previous=new Map(),replaced=[];
  await mkdir('work/data-backups',{recursive:true});
  for(const [name,value] of Object.entries(files)){
    if(!/^[a-z0-9-]+$/.test(name))throw Error('Invalid output filename');
    const path=`data/${name}.json`;
    try{const prior=await readFile(path);previous.set(name,prior);await writeFile(`work/data-backups/${name}.previous.json`,prior);}
    catch(e){if(e.code!=='ENOENT')throw e;previous.set(name,null);}
    await writeFile(`${path}.tmp`,JSON.stringify(value,null,2)+'\n');
  }
  try{
    // Decision store is committed last; its revision only advances with all generated data.
    for(const name of Object.keys(files)){await rename(`data/${name}.json.tmp`,`data/${name}.json`);replaced.push(name);}
  }catch(error){
    for(const name of replaced){const prior=previous.get(name);if(prior===null)await unlink(`data/${name}.json`);else{await writeFile(`data/${name}.json.restore`,prior);await rename(`data/${name}.json.restore`,`data/${name}.json`);}}
    throw error;
  }
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const args=process.argv.slice(2);
  await withDataLock(async()=>{const output=await prepareCollection({offline:args.includes('--offline'),audit:args.includes('--audit-sources')});await writeCollection(output);console.log(JSON.stringify(output['collection-report'],null,2));});
}

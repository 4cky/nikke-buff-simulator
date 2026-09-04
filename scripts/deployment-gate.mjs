import {readFile,readdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';

const read=async name=>JSON.parse(await readFile(`data/${name}.json`,'utf8'));
const run=args=>{
  const result=spawnSync(process.execPath,args,{stdio:'inherit',windowsHide:true});
  if(result.status!==0)throw Error(`node ${args.join(' ')} failed (${result.status})`);
};

export async function inspectProductionGate({deploymentPath='dist/deployment-manifest.json'}={}){
  const [characters,effects,excluded,metadata,review,unknown,positive,manifest,deployment]=await Promise.all([
    read('characters'),read('effects'),read('non-buff-effects'),read('metadata-only-effects'),read('review-queue'),read('unknown-buff-candidates'),read('unrecognized-positive-effect-candidates'),read('dataset-manifest'),deploymentPath?JSON.parse(await readFile(deploymentPath,'utf8')):null
  ]);
  const errors=[],ids=rows=>new Set(rows.map(row=>row.effect_id));
  const comparisonIds=ids(effects),excludedRows=[...excluded,...metadata],excludedIds=ids(excludedRows);
  const typeCounts=Object.fromEntries(['buff','heal','revive'].map(type=>[type,effects.filter(e=>e.effect_type===type).length]));
  const expected={characters:199,comparison:991,excluded:400,review:1,unknown:0,positive:0};
  const actual={characters:characters.length,comparison:effects.length,excluded:excludedRows.length,review:review.length,unknown:unknown.length,positive:positive.length};
  for(const key of Object.keys(expected))if(actual[key]!==expected[key])errors.push(`${key}: expected ${expected[key]}, got ${actual[key]}`);
  if(JSON.stringify(typeCounts)!==JSON.stringify({buff:898,heal:90,revive:3}))errors.push(`comparison effect types: ${JSON.stringify(typeCounts)}`);
  if(effects.some(e=>e.needs_review))errors.push('needs_review effect leaked into comparison UI');
  if(effects.some(e=>!['buff','heal','revive'].includes(e.effect_type)))errors.push('excluded effect_type leaked into comparison UI');
  if([...comparisonIds].some(id=>excludedIds.has(id)))errors.push('effect ID overlap across comparison/excluded datasets');
  if(deployment&&(deployment.parser_version!==manifest.parser_version||deployment.character_count!==actual.characters||deployment.comparison_effect_count!==actual.comparison||deployment.excluded_count!==actual.excluded||deployment.review_count!==actual.review))errors.push('deployment manifest does not match canonical dataset');
  return {ok:errors.length===0,errors,counts:{...actual,...typeCounts},parser_version:manifest.parser_version,artifact_hash:deployment?.artifact_hash||null};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  try{
    const tests=(await readdir('tests')).filter(name=>name.endsWith('.test.mjs')).sort().map(name=>`tests/${name}`);
    run(['--test',...tests]);run(['scripts/validate-data.mjs']);run(['scripts/verify-data.mjs']);run(['scripts/build.mjs']);
    const result=await inspectProductionGate();console.log(JSON.stringify(result,null,2));if(!result.ok)process.exitCode=1;
  }catch(error){console.error(error.message);process.exitCode=1;}
}

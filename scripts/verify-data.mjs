import {readFile,mkdir,mkdtemp,rm} from 'node:fs/promises';
import {join,resolve,sep} from 'node:path';
import {pathToFileURL} from 'node:url';
import {auditCandidate,makeRawSourceSnapshots,stableIdViolations} from './update-model.mjs';
import {materializeCandidateProject,testCandidate,buildCandidate} from './update-runner.mjs';

const read=async name=>JSON.parse(await readFile(`data/${name}.json`,'utf8'));
const outputNames=['characters','effects','skill-snapshots','review-queue','review-items','collection-report','non-buff-effects','metadata-only-effects','unknown-buff-candidates','unrecognized-positive-effect-candidates','source-conflicts'];
export async function verifyCanonical({runTests=true,runBuild=true,stageRoot}={}){
  const values=await Promise.all(outputNames.map(async name=>[name,await read(name)])),output=Object.fromEntries(values);
  const [characterSchema,effectSchema]=await Promise.all([read('character-schema'),read('effect-schema')]);
  const structured=output.effects.length+output['non-buff-effects'].length+output['metadata-only-effects'].length;
  const current={characters:output.characters.length,comparison:output.effects.length,excluded:structured-output.effects.length,structured};
  const audit=auditCandidate(output,{characterSchema,effectSchema,current,manualProtection:{actual_overwrite_count:0},idViolations:stableIdViolations(output.effects,output.effects,output.characters.map(c=>c.character_id))});
  const snapshots=makeRawSourceSnapshots(output.characters,output['skill-snapshots']);
  if(new Set(snapshots.map(s=>s.character_id)).size!==output.characters.length)audit.errors.push('raw snapshot character coverage mismatch');
  if(!stageRoot)await mkdir('work',{recursive:true});
  const ownedStage=!stageRoot,stage=stageRoot||await mkdtemp(join('work','verify-data-'));
  let tests={code:0,stdout:'skipped',stderr:''},build={code:0,stdout:'skipped',stderr:''};
  try{
    if(runTests||runBuild){const project=await materializeCandidateProject(stage,{});if(runTests)tests=await testCandidate(project);if(runBuild)build=await buildCandidate(stage,project);}
    if(tests.code) audit.errors.push(`regression tests failed (${tests.code})`);
    if(build.code) audit.errors.push(`production build failed (${build.code})`);
    return {ok:audit.errors.length===0,audit,tests,build,parser_version:output['collection-report'].parser_version};
  }finally{
    if(ownedStage){const target=resolve(stage),base=resolve('work')+sep;if(!target.startsWith(base))throw Error('Unsafe verify cleanup');await rm(target,{recursive:true,force:true});}
  }
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const result=await verifyCanonical();
  console.log(JSON.stringify({ok:result.ok,parser_version:result.parser_version,counts:result.audit.counts,quality_gate_errors:result.audit.errors,
    tests:{code:result.tests.code,summary:result.tests.stdout.trim().split('\n').slice(-8)},build:{code:result.build.code,output:result.build.stdout.trim()}},null,2));
  if(!result.ok){if(result.tests.stderr)console.error(result.tests.stderr);if(result.build.stderr)console.error(result.build.stderr);process.exitCode=1;}
}

import {readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {makeRawSourceSnapshots,sha256} from './update-model.mjs';
const read=async name=>JSON.parse(await readFile(`data/${name}.json`,'utf8'));
export async function bootstrap(){
  const [characters,effects,nonbuff,metadata,skills,report,queue]=await Promise.all(['characters','effects','non-buff-effects','metadata-only-effects','skill-snapshots','collection-report','review-queue'].map(read));
  const snapshots=makeRawSourceSnapshots(characters,skills),generatedAt=report.generated_at;
  const entry={generated_at:generatedAt,parser_version:report.parser_version,character_count:characters.length,
    structured_count:effects.length+nonbuff.length+metadata.length,comparison_count:effects.length,excluded_count:nonbuff.length+metadata.length,
    comparison_effect_type_counts:Object.fromEntries(['buff','heal','revive'].map(type=>[type,effects.filter(e=>e.effect_type===type).length])),
    review_count:queue.filter(r=>r.needs_review).length,source_hash:sha256(snapshots.map(s=>[s.character_id,s.content_hash])),baseline:true};
  await writeFile('data/raw-source-snapshots.json',JSON.stringify(snapshots,null,2)+'\n');
  await writeFile('data/dataset-manifest.json',JSON.stringify(entry,null,2)+'\n');
  await writeFile('data/data-generation-history.json',JSON.stringify([entry],null,2)+'\n');
  await writeFile('data/source-change-report.json',JSON.stringify({generated_at:generatedAt,changed_characters:0,changed_skills:0,changes:[]},null,2)+'\n');
  return entry;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(await bootstrap(),null,2));

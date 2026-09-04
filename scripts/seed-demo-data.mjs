// Seeds a minimal synthetic dataset (fictional characters, invented values)
// so the app, tests and build run without real collected data.
// Real data/ files are never overwritten unless --force is given.
// Usage: node scripts/seed-demo-data.mjs [--if-missing] [--force]
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)),'..');
const DEMO_FILES = ['characters.json','effects.json','collection-report.json','dataset-manifest.json',
  'treasure-effects.json','treasure-report.json','review-queue.json','review-items.json'];
const DEMO_TREASURE_REPORT = {generated_at:'2026-09-04T00:00:00.000Z',holder_count:0,
  skill_count:0,effect_count:0,review_count:0,conflict_count:0,holders:[]};

async function exists(path){
  try{await readFile(path);return true;}catch{return false;}
}

export async function seedDemoData({force=false}={}){
  const seeded = [], skipped = [];
  for(const name of DEMO_FILES){
    const target = join(root,'data',name);
    if(!force&&await exists(target)){skipped.push(name);continue;}
    let value;
    if(name==='treasure-effects.json'||name==='review-queue.json'||name==='review-items.json')value = [];
    else if(name==='treasure-report.json')value = DEMO_TREASURE_REPORT;
    else value = JSON.parse(await readFile(join(root,'tests','fixtures',name),'utf8'));
    await mkdir(join(root,'data'),{recursive:true});
    await writeFile(target,JSON.stringify(value,null,2)+'\n');
    seeded.push(name);
  }
  return {seeded,skipped};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  // Default: seed only missing files, never overwrite real data.
  const {seeded,skipped} = await seedDemoData({force:process.argv.includes('--force')});
  console.log(JSON.stringify({seeded,skipped},null,2));
}

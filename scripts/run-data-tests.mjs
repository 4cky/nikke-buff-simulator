// Real-data verification suite. Runs only when collected data is present;
// otherwise reports an explicit skip (exit 0) instead of failing.
import {existsSync} from 'node:fs';
import {readdir} from 'node:fs/promises';
import {join} from 'node:path';
import {spawn} from 'node:child_process';

import {readFile} from 'node:fs/promises';
const required = ['data/characters.json','data/effects.json'];
const missing = required.filter(p=>!existsSync(p));
if(missing.length){
  console.log(`test:data skipped: ${missing.join(', ')} not present. Run npm run collect first.`);
  process.exit(0);
}
try{
  const manifest = JSON.parse(await readFile('data/dataset-manifest.json','utf8'));
  if(manifest.demo===true){
    console.log('test:data skipped: demo dataset (seed-demo-data.mjs) is not real data. Run npm run collect first.');
    process.exit(0);
  }
}catch{/* unreadable manifest falls through to the suite, which will fail loudly */}
const files = (await readdir(join('tests','data'))).filter(f=>f.endsWith('.test.mjs')).sort()
  .map(f=>join('tests','data',f));
const child = spawn(process.execPath,['--test',...files],
  {stdio:'inherit',windowsHide:true});
child.on('error',error=>{console.error(error);process.exit(1);});
child.on('close',code=>process.exit(code??1));

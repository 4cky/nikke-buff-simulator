// Real-data verification suite. Runs only when collected data is present;
// otherwise reports an explicit skip (exit 0) instead of failing.
import {existsSync} from 'node:fs';
import {readdir} from 'node:fs/promises';
import {join} from 'node:path';
import {spawn} from 'node:child_process';

const required = ['data/characters.json','data/effects.json'];
const missing = required.filter(p=>!existsSync(p));
if(missing.length){
  console.log(`test:data skipped: ${missing.join(', ')} not present. Run npm run collect first (demo data from seed-demo-data.mjs is not real data).`);
  process.exit(0);
}
const files = (await readdir(join('tests','data'))).filter(f=>f.endsWith('.test.mjs')).sort()
  .map(f=>join('tests','data',f));
const child = spawn(process.execPath,['--test',...files],
  {stdio:'inherit',windowsHide:true});
child.on('error',error=>{console.error(error);process.exit(1);});
child.on('close',code=>process.exit(code??1));

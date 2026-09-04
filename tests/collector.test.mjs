import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,cp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {levelTen} from '../scripts/source-model.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
test('collector is reproducible, preserves manual input, and quarantines changed source',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'nikke-collector-test-'));
  try{
    await mkdir(join(dir,'data'));await mkdir(join(dir,'work/nikke-gg-raw'),{recursive:true});
    for(const name of ['character-schema','effect-schema'])await cp(join(root,`data/${name}.json`),join(dir,`data/${name}.json`));
    const s={id:10,slot:1,name:'Test Skill',description:'■ Activates when HP is above 80%. Affects self.\n<color=#00AEFF>ATK ▲ {v}% for 10 sec.</color>',levels:Array.from({length:10},(_,i)=>({v:String(i+1)})),cooldown:0};
    const c={id:'1',name:'Test',slug:'test',visible:1,manufacturer:'Tetra',burst:'3',element:'Fire',weapon:'SR',class:'Attacker',rarity:'SSR',skills:[s]};
    const text=levelTen(s).text;
    const manual={effect_id:'manual:1',character_id:'nikke-1',character_name:'Test',skill_name:'Test Skill',skill_slot:'Skill 1',skill_level:10,target:'self',target_type:'self',buff_type:'atk',value:10,value_unit:'percent',duration:'10 sec',trigger:'HP above 80%',condition:'HP above 80%',stack_count:null,max_raw_value:10,source_url:'https://nikke.gg/characters/test/',notes:'human note',source_text:text,source_skill_text:text,source_skill_id:'10',source_skill_hash:createHash('sha256').update(text).digest('hex'),needs_review:false,validation_status:'curated'};
    const save=async(path,data)=>writeFile(join(dir,path),JSON.stringify(data));
    const load=async(path)=>JSON.parse(await readFile(join(dir,path),'utf8'));
    await save('work/nikke-gg-raw/characters.json',[c]);await save('data/character-overrides.json',{});await save('data/curated-effects.json',[manual]);await save('data/reviewed-skills.json',['nikke-1:10']);
    await save('work/nikke-gg-raw/source-info.json',{fetched_at:'2026-08-28T12:00:00.000Z'});
    const run=()=>spawnSync(process.execPath,[join(root,'scripts/collect-data.mjs'),'--offline'],{cwd:dir,encoding:'utf8'});
    let result=run();assert.equal(result.status,0,result.stderr);
    const first=await readFile(join(dir,'data/effects.json'),'utf8');assert.equal(JSON.parse(first).length,1);
    result=run();assert.equal(result.status,0,result.stderr);assert.equal(await readFile(join(dir,'data/effects.json'),'utf8'),first);
    c.skills[0].levels[9].v='11';await save('work/nikke-gg-raw/characters.json',[c]);
    result=run();assert.equal(result.status,0,result.stderr);
    assert.equal((await load('data/effects.json'))[0].needs_review,true);
    assert.equal((await load('data/curated-effects.json'))[0].value,10);
    const reviews=await load('data/review-queue.json');
    assert.equal(reviews.filter(r=>r.review_id.startsWith('changed:')).length,1);
    assert.equal(reviews.filter(r=>r.review_id.startsWith('missing:')).length,2);
    assert.equal((await load('data/collection-report.json')).comparable_effects,0);
    // Unknown metadata schema fails before replacing a working catalog.
    const before=await readFile(join(dir,'data/characters.json'),'utf8');c.manufacturer='Unexpected';
    await save('work/nikke-gg-raw/characters.json',[c]);result=run();assert.notEqual(result.status,0);
    assert.equal(await readFile(join(dir,'data/characters.json'),'utf8'),before);
  }finally{
    const target=resolve(dir),base=resolve(tmpdir())+sep;
    if(!target.startsWith(base)||!target.split(sep).at(-1).startsWith('nikke-collector-test-'))throw Error('Unsafe test cleanup');
    await rm(target,{recursive:true,force:true});
  }
});
test('frontend selectors and imports have corresponding static assets',async()=>{
  const html=await readFile(join(root,'index.html'),'utf8'),js=await readFile(join(root,'app.js'),'utf8');
  for(const m of js.matchAll(/['"]#([a-z][a-z0-9-]*)['"]/g))assert.ok(html.includes(`id="${m[1]}"`),m[1]);
  for(const m of js.matchAll(/from '\.\/(.+?)'/g))assert.ok((await readFile(join(root,m[1]))).length);
  assert.ok(html.includes('id="drawer-reviews"'));assert.ok(html.includes('id="clear-filters"'));
});

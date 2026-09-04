import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,cp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn,spawnSync} from 'node:child_process';
const root=fileURLToPath(new URL('../',import.meta.url));
test('review API persists decisions, rejects unsafe writes, and survives recollection and server restart',{timeout:30000},async()=>{
  const dir=await mkdtemp(join(tmpdir(),'nikke-review-api-'));let child;
  const save=(path,data)=>writeFile(join(dir,path),JSON.stringify(data));
  const read=async path=>JSON.parse(await readFile(join(dir,path),'utf8'));
  const collect=()=>{const result=spawnSync(process.execPath,[join(root,'scripts/collect-data.mjs'),'--offline'],{cwd:dir,encoding:'utf8'});assert.equal(result.status,0,result.stderr);};
  const start=async()=>{
    child=spawn(process.execPath,[join(root,'scripts/review-server.mjs')],{cwd:dir,env:{...process.env,NIKKE_REVIEW_PORT:'0'},stdio:['ignore','pipe','pipe'],windowsHide:true});
    return new Promise((resolve,reject)=>{let text='',error='';const timeout=setTimeout(()=>reject(Error('Server start timeout: '+error)),8000);child.stderr.on('data',c=>error+=c);child.once('error',reject);child.once('exit',code=>{if(code)reject(Error(error));});child.stdout.on('data',chunk=>{text+=chunk;const match=text.match(/Review ready: (http:\/\/127.0.0.1:\d+)\//);if(match){clearTimeout(timeout);resolve(match[1]);}});});
  };
  const stop=async()=>{if(child&&child.exitCode===null){const c=child;await new Promise(resolve=>{c.once('exit',resolve);c.kill();});}child=null;};
  try{
    await mkdir(join(dir,'data'));await mkdir(join(dir,'work/nikke-gg-raw'),{recursive:true});
    for(const name of ['character-schema','effect-schema'])await cp(join(root,`data/${name}.json`),join(dir,`data/${name}.json`));
    const source=[{id:'999',slug:'test',name:'Test',visible:1,manufacturer:'Tetra',burst:'3',element:'Fire',weapon:'SR',class:'Attacker',rarity:'SSR',skills:[{id:101,slot:1,name:'Test Skill',cooldown:0,
      description:'■ Activates when Full Burst starts. Affects self.\n<color=#00AEFF>ATK ▲ {v}% for 10 sec.\nMystery Power ▲ 10% for 10 sec.</color>',levels:Array.from({length:10},()=>({v:'20'}))}]}];
    await save('work/nikke-gg-raw/characters.json',source);await save('work/nikke-gg-raw/source-info.json',{fetched_at:'2026-08-28T12:00:00.000Z'});
    await save('data/curated-effects.json',[]);await save('data/character-overrides.json',{});await save('data/reviewed-skills.json',[]);collect();
    let origin=await start();let state=await(await fetch(origin+'/api/reviews')).json();
    const candidate=state.items.find(r=>r.candidate_effects.length),base={review_keys:[candidate.review_key],reviewed_by:'API test',review_note:'テスト用原文確認',confirmed:true};
    const post=(payload,headers={})=>fetch(origin+'/api/reviews',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','X-Review-Token':state.token,...headers},body:JSON.stringify(payload)});
    assert.equal((await post({...base,action:'approve',base_revision:0},{Origin:'https://untrusted.example'})).status,403);
    assert.equal((await post({...base,action:'approve',base_revision:0},{'X-Review-Token':'incorrect'})).status,403);
    assert.equal((await fetch(origin+'/scripts/review-server.mjs')).status,404);
    assert.equal((await post({...base,action:'edit',effects:[{...candidate.candidate_effects[0],value:true,value_unit:'percent'}],base_revision:0})).status,400);
    assert.equal((await post({...base,action:'approve',base_revision:0})).status,200);
    let persisted=await read('data/review-decisions.json');assert.equal(persisted.revision,1);assert.equal(persisted.decisions[0].review_status,'approved');assert.equal(persisted.decisions[0].manual_override,true);
    assert.equal((await read('data/effects.json'))[0].value,20);
    assert.equal((await post({...base,action:'exclude',base_revision:0})).status,409);
    assert.equal((await read('data/review-decisions.json')).revision,1);
    state=await(await fetch(origin+'/api/reviews')).json();
    assert.equal((await post({...base,action:'edit',base_revision:1,effects:[{...candidate.candidate_effects[0],value:21,max_raw_value:21}]})).status,200);
    assert.equal((await read('data/effects.json'))[0].value,21);
    persisted=await read('data/review-decisions.json');const savedAt=persisted.decisions[0].reviewed_at;
    source[0].skills[0].levels[9].v='30';await save('work/nikke-gg-raw/characters.json',source);collect();
    let effects=await read('data/effects.json');assert.equal(effects[0].value,21);assert.equal(effects[0].needs_review,false);assert.equal(effects[0].reviewed_at,savedAt);
    state=await(await fetch(origin+'/api/reviews')).json();assert.equal(state.items.find(r=>r.review_key===candidate.review_key).source_changed_since_review,true);
    await stop();origin=await start();state=await(await fetch(origin+'/api/reviews')).json();assert.equal(state.revision,2);
    assert.equal(state.items.find(r=>r.review_key===candidate.review_key).review_status,'edited');
    assert.equal((await post({...base,action:'exclude',base_revision:2})).status,200);collect();assert.equal((await read('data/effects.json')).length,0);
    state=await(await fetch(origin+'/api/reviews')).json();assert.equal(state.items.find(r=>r.review_key===candidate.review_key).review_status,'excluded');
    assert.equal((await read('data/review-decisions.json')).audit.length,3);
  }finally{
    await stop();const target=resolve(dir),base=resolve(tmpdir())+sep;
    if(!target.startsWith(base)||!target.split(sep).at(-1).startsWith('nikke-review-api-'))throw Error('Unsafe test cleanup');
    await rm(target,{recursive:true,force:true});
  }
});

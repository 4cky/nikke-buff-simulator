import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {SOURCE_URL} from './source-model.mjs';
import {EXPLORER_DATA,parseCsv,ggSlotMap,ggAvailability} from './source-policy.mjs';
const read=async path=>JSON.parse(await readFile(path,'utf8'));
const optional=async path=>{try{return await read(path);}catch(e){if(e.code==='ENOENT')return null;throw e;}};
async function download(url){
  const r=await fetch(url,{signal:AbortSignal.timeout(25000)});
  if(!r.ok)throw Error(`HTTP ${r.status} ${url}`);
  return r;
}
export async function fetchInputs({offline=false,audit=false,cacheRoot='work'}={}){
  const root=String(cacheRoot).replace(/[\\/]+$/,'');
  const ggRoot=`${root}/nikke-gg-raw`,ggPath=`${ggRoot}/characters.json`,exRoot=`${root}/nikke-explorer-raw`;
  await mkdir(ggRoot,{recursive:true});await mkdir(`${exRoot}/characters`,{recursive:true});
  let gg,ggCheckedAt;const warnings=[];
  if(offline){
    gg=await read(ggPath);ggCheckedAt=(await optional(`${ggRoot}/source-info.json`))?.fetched_at;
    if(!ggCheckedAt)throw Error('Original NIKKE.GG fetch timestamp is missing. Run collect online; file modification dates are not source verification dates.');
  }
  else{
    gg=await(await download(SOURCE_URL)).json();ggCheckedAt=new Date().toISOString();
    if(!Array.isArray(gg)||!gg.length||gg.some(c=>!c.id||!c.slug))throw Error('NIKKE.GG schema changed; output was not changed.');
    await writeFile(ggPath,JSON.stringify(gg,null,2)+'\n');
    await writeFile(`${ggRoot}/source-info.json`,JSON.stringify({fetched_at:ggCheckedAt,source_url:SOURCE_URL},null,2));
  }
  let indexCache=await optional(`${exRoot}/catalog.json`);
  if(!offline){try{
    const index=parseCsv(await(await download(EXPLORER_DATA+'characters.csv')).text());
    if(!index.length)throw Error('Empty Explorer catalog');
    indexCache={checked_at:new Date().toISOString(),data:index};await writeFile(`${exRoot}/catalog.json`,JSON.stringify(indexCache,null,2));
  }catch(e){warnings.push(`Explorer一覧の更新失敗。${indexCache?'前回キャッシュを使用':'補完未実施'}: ${e.message}`);}}
  const index=indexCache?.data||[],details=new Map();
  const existing=await optional('data/skill-snapshots.json')||[];
  const queue=[];
  for(const c of index){
    if(!/^[-a-z0-9]+$/.test(c.slug))throw Error('Invalid Explorer slug');
    const path=`${exRoot}/characters/${c.slug}.json`,cached=await optional(path);
    if(cached)details.set(String(c.resource_id),cached);
    const primary=gg.find(g=>g.visible===1&&String(g.id)===String(c.resource_id));
    const slots=ggSlotMap(primary,existing);
    const missing=['Skill 1','Skill 2','Burst'].some(slot=>ggAvailability(slots.get(slot))!=='available');
    // Primary NIKKE.GG remains authoritative. Explorer detail is refreshed only
    // for an explicitly requested full audit or when a primary slot is missing.
    if(!offline&&(audit||missing))queue.push({c,path});
  }
  let next=0,done=0;
  await Promise.all(Array.from({length:Math.min(3,queue.length)},async()=>{
    while(next<queue.length){
      const {c,path}=queue[next++];
      try{
        const data=await(await download(`${EXPLORER_DATA}character/${c.slug}.json`)).json();
        if(String(data.resource_id)!==String(c.resource_id)||data.slug!==c.slug||!Array.isArray(data.skills))throw Error('Explorer detail identity/schema mismatch');
        const cache={checked_at:new Date().toISOString(),source_url:`${EXPLORER_DATA}character/${c.slug}.json`,data};
        await writeFile(path,JSON.stringify(cache,null,2));details.set(String(c.resource_id),cache);
      }catch(e){warnings.push(`${c.slug}: ${e.message}`);}
      done++;if(done%30===0)console.log(`Explorer照合用スナップショット ${done}/${queue.length}`);
      await new Promise(resolve=>setTimeout(resolve,150));
    }
  }));
  return {gg,ggCheckedAt,index,indexCheckedAt:indexCache?.checked_at||null,details,warnings};
}

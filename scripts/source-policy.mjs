import {createHash} from 'node:crypto';
import {cleanText,levelTen,SLOTS,normalizeCharacter} from './source-model.mjs';
export const EXPLORER_PAGE='https://nikke.exynan.my.id/character/';
export const EXPLORER_DATA='https://nikke-static.exynan.my.id/data/';
export const hash=text=>createHash('sha256').update(text).digest('hex');
export function parseCsv(text){
  const rows=[];let row=[],cell='',quoted=false;
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}
    else if(c===','&&!quoted){row.push(cell);cell='';}
    else if(c==='\n'&&!quoted){row.push(cell.replace(/\r$/,''));if(row.some(Boolean))rows.push(row);row=[];cell='';}
    else cell+=c;
  }
  if(cell||row.length){row.push(cell.replace(/\r$/,''));rows.push(row);}
  if(quoted)throw Error('Unclosed CSV field');
  const headers=rows.shift();
  if(!headers?.includes('resource_id')||!headers.includes('slug'))throw Error('Explorer catalog schema changed');
  return rows.map(values=>Object.fromEntries(headers.map((h,i)=>[h,values[i]??''])));
}
export function ggSlotMap(character,known=[]){
  const map=new Map(),skills=character?.skills || [];
  map.unmapped=[];
  for(const [i,s] of skills.entries()){
    if(!s)continue;
    const explicit=SLOTS.includes(s.skill_slot)?s.skill_slot:SLOTS[Number(s.slot)-1];
    const historical=known.find(k=>k.character_id===`nikke-${character.id}`&&k.source_type!=='nikke_explorer'&&k.source_skill_id===String(s.id))?.skill_slot;
    const slot=explicit||historical||(skills.length===3?SLOTS[i]:null);
    if(slot){if(map.has(slot))map.set(slot,null);else map.set(slot,s);}
    else map.unmapped.push(s);
  }
  return map;
}
export function ggAvailability(skill){
  if(!skill)return 'missing_slot';
  if(!cleanText(skill.description).replace(/[■\s]/g,''))return 'missing_description';
  return levelTen(skill)?'available':'lv10_unavailable';
}
export function explorerSkill(skill){
  if(!skill||!SLOTS[Number(skill.slot)-1]||!cleanText(skill.description))return null;
  const parameters=skill.parameters||{};
  const keys=[...skill.description.matchAll(/\{([^}]+)\}/g)].map(m=>m[1]);
  const literal=v=>['string','number'].includes(typeof v)&&String(v).trim()!==''&&(typeof v!=='number'||Number.isFinite(v));
  if(keys.some(k=>Array.isArray(parameters[k])?(parameters[k].length!==10||parameters[k].some(v=>!literal(v))):!literal(parameters[k])))return null;
  // Constants remain constants; only explicitly supplied ten-level arrays use [9].
  const converted={id:`explorer-slot-${skill.slot}`,skill_slot:SLOTS[Number(skill.slot)-1],name:skill.name,
    description:skill.description,cooldown:skill.cooldown||'',
    levels:Array.from({length:10},(_,i)=>Object.fromEntries(keys.map(k=>[k,String(Array.isArray(parameters[k])?parameters[k][i]:parameters[k])])))};
  return levelTen(converted)?converted:null;
}
export function mergedCatalog(gg,index,overrides={}){
  const visible=gg.filter(c=>c.visible===1),byId=new Map(visible.map(c=>[String(c.id),{gg:c}]));
  for(const ex of index){
    if(!/^\d+$/.test(String(ex.resource_id))||!/^[-a-z0-9]+$/.test(ex.slug))throw Error('Invalid Explorer identity');
    const id=String(ex.resource_id),entry=byId.get(id)||{};
    if(entry.explorer)throw Error(`Duplicate Explorer ID ${id}`);
    byId.set(id,{...entry,explorer:ex});
  }
  return [...byId].map(([id,{gg:g,explorer:e}])=>{
    const base=g||{id,name:e.name,slug:e.slug,manufacturer:e.company,burst:/^B[123]$/.test(e.burst)?e.burst[1]:'',element:e.element,weapon:e.weapon,class:e.class,rarity:e.rarity,visible:1,skills:[]};
    const character=normalizeCharacter(base,overrides[`nikke-${id}`]);
    if(!g){character.nikke_gg_url=null;character.source_url=EXPLORER_PAGE+e.slug;character.metadata_source_type='nikke_explorer';}
    else character.metadata_source_type='nikke_gg';
    character.nikke_explorer_url=e?EXPLORER_PAGE+e.slug:null;
    character.aliases=e&&e.name!==character.character_name?[e.name]:[];
    if(!g&&e.burst==='All')character.burst_stage=[1,2,3];
    return {character,gg:g||null,explorer:e||null};
  });
}
const normalized=text=>cleanText(text).normalize('NFKC').replace(/[‘’]/g,"'").replace(/\s+/g,' ').trim();
const numbers=text=>[...normalized(text).matchAll(/\d+(?:\.\d+)?/g)].map(m=>+m[0]);
const skeleton=text=>normalized(text).replace(/\d+(?:\.\d+)?/g,'{n}');
export function compareSkills(gg,ex){
  if(!gg||!ex)return {status:'not_compared',source_conflict:false,differences:[]};
  const a=levelTen(gg)?.text,b=levelTen(ex)?.text;
  if(!a||!b)return {status:'not_compared',source_conflict:false,differences:[]};
  if(normalized(a)===normalized(b))return {status:'equal',source_conflict:false,differences:[]};
  // Do not pair unrelated effects just because they have the same buff_type.
  if(skeleton(a)!==skeleton(b)){
    const av=numbers(a),bv=numbers(b),different=JSON.stringify(av)!==JSON.stringify(bv);
    return {status:'wording_difference',source_conflict:different,differences:[],nikke_gg_values:av,nikke_explorer_values:bv};
  }
  const av=numbers(a),bv=numbers(b),differences=[];
  av.forEach((value,i)=>{if(value!==bv[i])differences.push({position:i,nikke_gg_value:value,nikke_explorer_value:bv[i]});});
  return {status:differences.length?'conflict':'wording_difference',source_conflict:differences.length>0,differences};
}
export function selectSlots(entry,detail,{ggCheckedAt,explorerCheckedAt,known=[]}={}){
  const ggSlots=ggSlotMap(entry.gg,known),result=[];
  for(const slot of SLOTS){
    const g=ggSlots.get(slot),ambiguous=ggSlots.has(slot)&&g===null||!ggSlots.has(slot)&&ggSlots.unmapped.length>0;
    const status=ambiguous?'slot_mapping_ambiguous':ggAvailability(g);
    const candidates=(detail?.skills||[]).filter(s=>SLOTS[Number(s.slot)-1]===slot);
    const ex=candidates.length===1?explorerSkill(candidates[0]):null;
    const comparison=compareSkills(status==='available'?g:null,ex);
    const type=status==='available'?'nikke_gg':!ambiguous&&ex?'nikke_explorer':null;
    const skill=type==='nikke_gg'?g:type==='nikke_explorer'?ex:null;
    const checked=type==='nikke_gg'?ggCheckedAt:explorerCheckedAt;
    const url=type==='nikke_gg'?entry.character.nikke_gg_url:entry.character.nikke_explorer_url;
    result.push({character_id:entry.character.character_id,character_name:entry.character.character_name,skill_slot:slot,
      nikke_gg_status:status,nikke_explorer_status:!detail?'not_checked':ex?'available':'lv10_unavailable',
      unmapped_primary_text:ambiguous?(entry.gg?.skills||[]).map(s=>levelTen(s)?.text||cleanText(s?.description)).join('\n\n'):'',
      selected_source_type:type,source_url:url,source_checked_at:checked||null,
      comparison,skill:skill?{...skill,skill_slot:slot,source_type:type,source_url:url,source_checked_at:checked,source_conflict:comparison.source_conflict}:null,
      gg_skill:status==='available'?g:null,explorer_skill:ex});
  }
  return result;
}

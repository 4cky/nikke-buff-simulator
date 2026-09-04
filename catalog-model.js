import {TYPE,filterRecords,numericRaw} from './view-model.js';
export const MANUFACTURERS=['Elysion','Missilis','Tetra','Pilgrim','Abnormal'];
export const ELEMENTS={Fire:'灼熱',Water:'水冷',Wind:'風圧',Electric:'電撃',Iron:'鉄甲'};
export const SORTS={name_asc:'ABC順 A→Z',name_desc:'ABC順 Z→A',release_asc:'実装順 古い→新しい',release_desc:'実装順 新しい→古い',value_desc:'選択中バフ 高い→低い',value_asc:'選択中バフ 低い→高い'};
export const DEFAULTS={query:'',type:'',manufacturer:'',burst:'',element:'',mode:'all',sort:'name_asc',target:'',slot:'',condition:'include',stack:'include',onlyMatching:true};
const enumValue=(value,allowed,fallback='')=>allowed.includes(value)?value:fallback;
const canonical=(value,allowed)=>allowed.find(v=>v.toLowerCase()===String(value).toLowerCase()) || '';
export function normalizeState(s={}) {
  const state={...DEFAULTS,...s};
  state.query=String(state.query||'').slice(0,150);
  state.type=enumValue(state.type,Object.keys(TYPE));
  state.manufacturer=canonical(state.manufacturer,MANUFACTURERS);
  state.element=canonical(state.element,Object.keys(ELEMENTS));
  state.burst=enumValue(String(state.burst),['1','2','3']);
  state.mode=enumValue(state.mode,['all','self','allies'],'all');
  state.sort=enumValue(state.sort,Object.keys(SORTS),'name_asc');
  state.target=enumValue(state.target,['self','all_allies','selected_allies','class','weapon','element','other']);
  state.slot=enumValue(state.slot,['Skill 1','Skill 2','Burst']);
  for(const k of ['condition','stack']) state[k]=enumValue(state[k],['include','exclude','only'],'include');
  state.onlyMatching=state.onlyMatching!==false;
  if(state.sort.startsWith('value_')&&(!state.type||['other','debuff_immunity'].includes(state.type)))state.sort='name_asc';
  return state;
}
export function readQuery(search) {
  const p=new URLSearchParams(search);
  return normalizeState({query:p.get('q'),type:p.get('buff'),manufacturer:p.get('manufacturer'),burst:p.get('burst'),
    element:p.get('element'),mode:p.get('scope')==='ally'?'allies':p.get('scope'),sort:p.get('sort'),
    target:p.get('target'),slot:p.get('skill'),condition:p.get('condition'),stack:p.get('stack'),onlyMatching:p.get('holders')!=='0'});
}
export function writeQuery(input) {
  const s=normalizeState(input),p=new URLSearchParams();
  for(const [key,param] of Object.entries({query:'q',type:'buff',manufacturer:'manufacturer',burst:'burst',element:'element',mode:'scope',sort:'sort',target:'target',slot:'skill',condition:'condition',stack:'stack'})) {
    if(s[key]!==DEFAULTS[key])p.set(param,key==='mode'&&s[key]==='allies'?'ally':['manufacturer','element'].includes(key)?s[key].toLowerCase():s[key]);
  }
  if(!s.onlyMatching)p.set('holders','0');
  return p.toString();
}
export function matchesCharacter(c,state) {
  return (!state.query.trim()||c.character_name.toLowerCase().includes(state.query.trim().toLowerCase()))
    &&(!state.manufacturer||c.manufacturer===state.manufacturer)
    &&(!state.burst||c.burst_stage.includes(+state.burst))
    &&(!state.element||c.element===state.element);
}
export function catalogGroups(characters,records,input={}) {
  const state=normalizeState(input),byId=new Map();
  const filtered=filterRecords(records.filter(r=>!r.needs_review),{...state,type:'',query:''});
  for(const r of filtered){if(!byId.has(r.character_id))byId.set(r.character_id,[]);byId.get(r.character_id).push(r);}
  const effectFilter=state.mode!=='all'||state.target||state.slot||state.condition!=='include'||state.stack!=='include';
  const rows=characters.filter(c=>matchesCharacter(c,state)).map(character=>{
    const effects=byId.get(character.character_id)||[];
    const matchingchosen=effects.filter(r=>r.buff_type===state.type);
    const numeric=matchingchosen.filter(r=>numericRaw(r)!==null).sort((a,b)=>a.value_unit.localeCompare(b.value_unit)||b.value-a.value);
    return {character,effects,hasType:matchingchosen.length>0,metric:numeric[0]};
  }).filter(r=>(!effectFilter||r.effects.length>0)&&(!state.type||!state.onlyMatching||r.hasType));
  const name=(a,b)=>a.character.character_name.localeCompare(b.character.character_name,'en',{sensitivity:'base'})||a.character.character_id.localeCompare(b.character.character_id);
  return rows.sort((a,b)=>{
    if(state.sort.startsWith('value_')){
      if(a.hasType!==b.hasType)return a.hasType?-1:1;
      if(!a.metric||!b.metric)return a.metric?-1:b.metric?1:name(a,b);
      return a.metric.value_unit.localeCompare(b.metric.value_unit)||(state.sort==='value_asc'?a.metric.value-b.metric.value:b.metric.value-a.metric.value)||name(a,b);
    }
    if(state.sort.startsWith('release_')){
      const ac=a.character,bc=b.character;
      if(Boolean(ac.release_date)!==Boolean(bc.release_date))return ac.release_date?-1:1;
      if(!ac.release_date)return name(a,b);
      const chronological=ac.release_date.localeCompare(bc.release_date)||(ac.release_order??Infinity)-(bc.release_order??Infinity);
      return (state.sort==='release_desc'?-chronological:chronological)||name(a,b);
    }
    return (state.sort==='name_desc'?-1:1)*name(a,b);
  });
}
export function sortStatus(input) {
  const s=normalizeState(input);
  if(s.sort.startsWith('value_'))return `並び替え中：${TYPE[s.type]}（${s.sort==='value_desc'?'降順':'昇順'}）`;
  return `並び替え中：${SORTS[s.sort]}`+(s.sort.startsWith('release_')?' · 実装日未確認は末尾':'');
}
export function filterChips(input) {
  const s=normalizeState(input),chips=[];
  const add=(key,label)=>{if(s[key]!==DEFAULTS[key])chips.push({key,label});};
  add('mode',s.mode==='self'?'SELF':'ALLY');add('query',`検索：${s.query}`);add('type',TYPE[s.type]);
  add('manufacturer',s.manufacturer);add('burst',`Burst ${['','I','II','III'][+s.burst]}`);add('element',ELEMENTS[s.element]);
  add('target',`対象：${s.target}`);add('slot',s.slot);add('condition',`条件付き：${s.condition==='only'?'のみ':'除外'}`);add('stack',`スタック：${s.stack==='only'?'のみ':'除外'}`);
  if(s.type&&!s.onlyMatching)chips.push({key:'onlyMatching',label:'バフ非所持も表示'});
  return chips;
}

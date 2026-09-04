import {REVIEW_REASONS,REVIEW_STATUSES,reviewSummary,filterReviews} from './review-model.js';
import {TYPE,formatRaw} from './view-model.js';
import {safeSourceUrl} from './sources.js';
const $=s=>document.querySelector(s);
const localReviewHost=['127.0.0.1','localhost'].includes(location.hostname)&&location.port==='4173';
const api=localReviewHost?`${location.protocol}//${location.hostname}:4174/api/reviews`:null;
const pageSize=25;
let items=[],revision=0,token=null,reason='',page=0,selection=new Set(),activeAction=null,busy=false;
let unknownCandidates=[],unknownReport=null,unknownLimit=25;
let positiveCandidates=[];
function node(tag,text='',className=''){const e=document.createElement(tag);e.textContent=text;e.className=className;return e;}
function button(text,handler){const e=node('button',text);e.type='button';e.addEventListener('click',handler);return e;}
const canSelect=r=>r.needs_review_reasons.includes('not_a_buff_candidate')&&['pending','hold','auto_excluded'].includes(r.review_status);
const filtered=()=>filterReviews(items,{reason,status:$('#review-status').value,query:$('#review-search').value});
const date=value=>value?new Date(value).toLocaleString('ja-JP'):'未確認';
function updateSelection(){
  $('#selected-count').textContent=`${selection.size}件選択`;$('#bulk-exclude').disabled=!token||!selection.size||busy;
  const keys=filtered().slice(page*pageSize,(page+1)*pageSize).filter(canSelect).map(r=>r.review_key);
  $('#select-page').checked=keys.length>0&&keys.every(k=>selection.has(k));
  $('#select-page').indeterminate=keys.some(k=>selection.has(k))&&!$('#select-page').checked;$('#select-page').disabled=!token||!keys.length||busy;
}
function sourceLink(parent,type,url,label){
  const safe=safeSourceUrl(type,url);if(!safe){parent.append(node('span',label+'：未取得'));return;}
  const a=node('a',label+' ↗');a.href=safe;a.target='_blank';a.rel='noopener noreferrer';parent.append(a);
}
function parentContext(effect){
  const box=node('div','','parent-context');
  box.append(node('strong',`${effect.parent_effect_name||'Section / Trigger'}${effect.parent_effect_type?' · '+effect.parent_effect_type:''}${effect.effect_index?' → Effect '+effect.effect_index:''}`));
  for(const [label,value] of [['Function / 親の説明',effect.parent_effect_description||effect.function_text],['対象',effect.target],['発動',effect.trigger],['持続',effect.duration],['終了条件',effect.end_condition||effect.parent_end_condition]])if(value)box.append(node('p',label+'：'+value));
  return box;
}
function renderUnknown(){
  const query=$('#unknown-search').value.trim().toLowerCase(),include=$('#unknown-include-nonbuff').checked;
  const rows=unknownCandidates.map(row=>({...row,occurrences:row.occurrences.filter(o=>include||o.comparison_candidate)})).filter(row=>row.occurrences.length&&[row.label,...row.characters].join(' ').toLowerCase().includes(query)).sort((a,b)=>b.occurrences.length-a.occurrences.length||a.label.localeCompare(b.label,'en'));
  $('#unknown-summary').textContent=`${rows.length} 種類 / ${rows.reduce((n,r)=>n+r.occurrences.length,0)} 出現 · ${include?'対象外・特殊候補を含む':'バフ候補のみ'}`;
  const root=$('#unknown-list');root.replaceChildren();
  for(const row of rows.slice(0,unknownLimit)){
    const group=node('details','','unknown-group');group.append(node('summary',`${row.label} · ${row.occurrences.length} occurrences · ${[...new Set(row.occurrences.map(o=>o.character_name))].join(', ')}`));
    for(const o of row.occurrences){
      const entry=node('div','','unknown-occurrence');entry.append(node('strong',`${o.character_name} · ${o.skill_slot} · ${o.skill_name}${o.parent_effect_name?' → '+o.parent_effect_name:''}${o.effect_index?' / Effect '+o.effect_index:''}`),node('small',o.comparison_candidate?'バフ候補':'比較対象外 / 特殊：'+o.effect_type),node('pre',o.source_line,'review-original'));
      const full=node('details');full.append(node('summary','親のFunction・条件を含む節の原文'),node('pre',o.source_text,'review-original'));entry.append(full);
      sourceLink(entry,o.source_type,o.source_url,o.source_type==='nikke_gg'?'NIKKE.GG':'Nikke Explorer');group.append(entry);
    }
    root.append(group);
  }
  $('#unknown-more').hidden=rows.length<=unknownLimit;
}
function renderReclassification(){
  const root=$('#reclassification-summary');root.replaceChildren();
  if(!unknownReport){root.append(node('span','再分類レポートを読み込めません'));return;}
  const metrics=[
    ['確認済みUnknown',unknownReport.reviewed_unknown_type_count],
    ['新規buff_type',unknownReport.new_buff_type.type_count],
    ['既存へ統合',unknownReport.existing_buff_type.type_count],
    ['resource',unknownReport.resource.type_count],
    ['special',unknownReport.special_mechanic.type_count],
    ['penalty / debuff',unknownReport.penalty_or_debuff.type_count],
    ['未分類',unknownReport.remaining_unknown_type_count],
    ['追加debuff免疫',unknownReport.followup_12?.debuff_immunity_effect_count],
    ['追加resource',unknownReport.followup_12?.resource_effect_count],
    ['追加special',unknownReport.followup_12?.special_mechanic_effect_count],
    ['未確認effect',unknownReport.remaining_needs_review_effects]
  ];
  for(const [label,value] of metrics){const metric=node('span');metric.append(node('strong',String(value??'—')),document.createTextNode(label));root.append(metric);}
  if(unknownReport.remaining_unknown?.length){
    const details=node('details','','wide'),summary=node('summary',`未分類に残した ${unknownReport.remaining_unknown.length} 種類（推測せずReview継続）`);
    const list=node('p',unknownReport.remaining_unknown.map(r=>`${r.label} (${r.occurrence_count})`).join(' / '));details.append(summary,list);root.append(details);
  }
}
function renderPositive(){
  const root=$('#positive-list');root.replaceChildren();
  $('#positive-summary').textContent=`${positiveCandidates.length} 種類 / ${positiveCandidates.reduce((n,r)=>n+r.occurrence_count,0)} 件`;
  for(const row of positiveCandidates){
    const group=node('details','','unknown-group');group.append(node('summary',`${row.label} · ${row.occurrence_count} occurrences`));
    for(const o of row.occurrences){
      const entry=node('div','','unknown-occurrence');entry.append(node('strong',`${o.character_name} · ${o.skill_slot} · ${o.skill_name}`),
        node('small',(o.needs_review_reasons||[]).map(k=>REVIEW_REASONS[k]||k).join(' / ')||'positive marker matched'),node('pre',o.source_line,'review-original'));
      const full=node('details');full.append(node('summary','節の原文'),node('pre',o.source_text,'review-original'));entry.append(full);
      sourceLink(entry,o.source_type,o.source_url,o.source_type==='nikke_gg'?'NIKKE.GG':'Nikke Explorer');group.append(entry);
    }
    root.append(group);
  }
  if(!positiveCandidates.length)root.append(node('p','未登録の有益effect候補はありません。'));
}
async function loadUnknown(){
  try{
    const [candidates,report,positive]=await Promise.all(['unknown-buff-candidates','unknown-reclassification-report','unrecognized-positive-effect-candidates'].map(name=>fetch(`data/${name}.json`,{cache:'no-store'})));
    if(!candidates.ok||!report.ok||!positive.ok)throw Error();unknownCandidates=await candidates.json();unknownReport=await report.json();positiveCandidates=await positive.json();renderReclassification();renderUnknown();renderPositive();
  }
  catch{$('#unknown-summary').textContent='集計ファイルを取得できません。データの再生成後に再読み込みしてください。';$('#positive-summary').textContent='監査ファイルを取得できません。';}
}
function render(){
  const summary=reviewSummary(items),metrics=$('#review-summary');metrics.replaceChildren();
  for(const [label,value] of [['対象節',summary.total],['未確認＋保留',summary.pending],['自動除外',summary.statuses.auto_excluded],['バフ部分を抽出',summary.statuses.auto_extracted],['人間が処理済み',summary.statuses.approved+summary.statuses.edited+summary.statuses.excluded]]){
    const metric=node('span');metric.append(node('strong',String(value)),document.createTextNode(label));metrics.append(metric);
  }
  const categories=$('#review-categories');categories.replaceChildren();
  for(const [key,label] of Object.entries(REVIEW_REASONS)){
    const counts=summary.reasons[key],b=button('',()=>{reason=reason===key?'':key;page=0;selection.clear();render();});
    b.append(node('span',label),node('small',`${counts.pending} 未確認 / 全${counts.total}`));b.setAttribute('aria-pressed',String(reason===key));categories.append(b);
  }
  const rows=filtered();page=Math.min(page,Math.max(0,Math.ceil(rows.length/pageSize)-1));
  $('#review-count').textContent=`${rows.length} 節${reason?' · '+REVIEW_REASONS[reason]:''}`;
  const root=$('#review-list');root.replaceChildren();
  for(const r of rows.slice(page*pageSize,(page+1)*pageSize)){
    const article=node('article','','review-item'),head=node('header','','review-item-header'),identity=node('div','','review-item-title');
    if(canSelect(r)){
      const check=document.createElement('input');check.type='checkbox';check.checked=selection.has(r.review_key);check.disabled=!token||busy;
      check.setAttribute('aria-label',r.character_name+' '+r.skill_slot+'を一括除外対象に選択');
      check.addEventListener('change',()=>{if(check.checked)selection.add(r.review_key);else selection.delete(r.review_key);updateSelection();});identity.append(check);
    }
    const title=node('div');title.append(node('h2',r.character_name),node('p',r.skill_slot+' · '+r.skill_name));identity.append(title);
    head.append(identity,node('span',REVIEW_STATUSES[r.review_status]||r.review_status,'review-state'));article.append(head);
    const reasons=node('div','','review-reasons');for(const key of r.needs_review_reasons)reasons.append(node('span',REVIEW_REASONS[key]));article.append(reasons);
    if(r.source_changed_since_review||r.source_missing_since_review)article.append(node('p','原文変更あり：以前の判断・値は保護されています。新しい原文を確認して、必要な場合のみEditしてください。','review-alert'));
    const panes=node('div','','review-panes'),original=node('section'),candidates=node('section');
    original.append(node('h3','Skill Lv.10 原文（確認対象の節）'),node('pre',r.source_text,'review-original'));
    if(r.current_source_text){const current=node('details');current.append(node('summary','変更後の原文'),node('pre',r.current_source_text,'review-original'));original.append(current);}
    const full=node('details');full.append(node('summary','スキル全文'),node('pre',r.source_skill_text,'review-original'));original.append(full);
    candidates.append(node('h3','Parserの抽出候補'));
    for(const c of r.parser_candidates){
      const entry=node('div','','review-candidate');
      entry.append(node('strong',c.parsed?(TYPE[c.parsed.buff_type]||c.parsed.buff_type)+' '+formatRaw(c.parsed):'型・効果量の対応を要確認'),node('p',c.source_line));
      if(c.hierarchy)entry.append(parentContext(c.hierarchy));
      if(c.comparison_eligible)entry.append(node('small','確定したバフとして比較画面に反映済み（この節の未確定部分は別途確認）'));
      if(!c.parsed&&c.raw_numbers.length)entry.append(node('small','検出した数値（効果量とは未確定）：'+c.raw_numbers.join(', ')));
      if(c.unresolved_fields.length)entry.append(node('p','未確定：'+c.unresolved_fields.join(' / ')));
      candidates.append(entry);
    }
    if(!r.parser_candidates.length)candidates.append(node('p','比較対象のバフ候補はありません。','review-intro'));
    if(r.approved_effects?.length){candidates.append(node('h3','保存済みの効果'));for(const e of r.approved_effects)candidates.append(node('p',`${TYPE[e.buff_type]||e.buff_type} ${formatRaw(e)} · ${e.target}`));}
    if(r.excluded_parts.length){const excluded=node('details');excluded.append(node('summary','比較対象外の記述 · '+r.excluded_parts.length+'件'));for(const p of r.excluded_parts)excluded.append(node('p',p.reason+'：'+p.text));candidates.append(excluded);}
    const diagnosis=node('details');diagnosis.append(node('summary','分類根拠・従来の解析理由'),node('p',[r.reason,...r.classification_evidence].join('\n')));candidates.append(diagnosis);
    panes.append(original,candidates);article.append(panes);
    const sources=node('div','','review-source-links');sourceLink(sources,'nikke_gg',r.nikke_gg_url,'NIKKE.GG');sourceLink(sources,'nikke_explorer',r.nikke_explorer_url,'Nikke Explorer');sources.append(node('span','原文の確認：'+date(r.source_checked_at)));article.append(sources);
    const actions=node('div','','review-actions');
    for(const [action,label] of [['approve','Approve · 承認'],['edit','Edit · 編集'],['exclude','Exclude · 除外'],['hold','Hold · 保留']]){
      const complete=r.candidate_effects.length&&r.candidate_effects.every(e=>e.target_type&&e.target&&e.trigger&&e.duration&&e.value!==null);
      const b=button(label,()=>openAction(action,[r]));b.disabled=!token||busy||action==='approve'&&(!complete||['approved','edited'].includes(r.review_status));
      if(action==='approve'&&!complete)b.title='候補なし、または必須項目が未確定です。Editで入力するかHoldしてください。';actions.append(b);
    }
    actions.append(node('small',r.reviewed_at?`${r.reviewed_by} · ${date(r.reviewed_at)}${r.manual_override?' · 手動保護':''}`:'未処理（人間の承認はしていません）'));article.append(actions);
    if(r.review_note)article.append(node('p','確認メモ：'+r.review_note,'review-intro'));root.append(article);
  }
  if(!rows.length)root.append(node('p','条件に一致する確認項目はありません。'));
  $('#previous-page').disabled=page===0;$('#next-page').disabled=(page+1)*pageSize>=rows.length;
  $('#page-status').textContent=`${page+1} / ${Math.max(1,Math.ceil(rows.length/pageSize))}ページ（${pageSize}件ずつ）`;updateSelection();
}
async function load(){
  const status=$('#review-connection');status.textContent='確認データを読み込み中…';status.dataset.error='false';token=null;
  try{
    if(!api)throw Error('Hosted review is intentionally read-only');
    const response=await fetch(api,{cache:'no-store',signal:AbortSignal.timeout(8000)});if(!response.ok)throw Error('HTTP '+response.status);
    const data=await response.json();items=data.items;revision=data.revision;token=data.token;status.textContent='保存可能 · 確認結果はアプリ側に保存され、再取得でも保護されます。';
  }catch{
    status.dataset.error='true';status.textContent='閲覧専用：保存サービスに接続できません。確認操作は無効です。保存できたようには表示しません。';
    try{const response=await fetch('data/review-items.json',{cache:'no-store'});if(!response.ok)throw Error('No data');items=await response.json();}catch{items=[];status.textContent+=' 確認データも読み込めませんでした。';}
  }
  selection.clear();render();await loadUnknown();
}
const fields={buff_type:['バフ種類',Object.entries(TYPE)],value:['Raw Value'],value_unit:['単位',['percent','caster_atk_percent','caster_def_percent','caster_max_hp_percent','caster_charge_speed_percent','seconds','boolean','conversion','flat_value'].map(v=>[v,v])],target:['対象（原文）'],target_type:['対象タイプ',['self','all_allies','selected_allies','class','weapon','element','other'].map(v=>[v,v])],duration:['持続時間'],trigger:['発動条件'],condition:['追加条件'],stack_count:['最大stack数'],max_raw_value:['最大Raw Value'],value_basis:['基準（任意）'],direction:['方向',[['increase','増加'],['decrease','減少・軽減']]],notes:['メモ']};
Object.assign(fields,{parent_effect_name:['親効果名'],parent_effect_type:['親の種類（mode / status / named_effect等）'],parent_effect_description:['親の説明・Function'],parent_trigger:['親の発動'],parent_end_condition:['親の終了条件'],parent_duration:['親の持続'],effect_index:['子Effect番号'],duration_type:['持続の種類',['fixed','conditional','continuous','instant','counted','unknown'].map(v=>[v,v])],end_condition:['終了条件']});
function addEditor(effect={}){
  const box=node('section','','effect-editor'),head=node('div','','effect-editor-head');head.append(node('strong','1つのバフ効果'),button('この効果を除く',()=>box.remove()));box.append(head);
  box.savedContext={function_text:effect.function_text||null,related_effects:effect.related_effects||[]};
  const grid=node('div','','editor-fields');
  for(const [key,[label,options]] of Object.entries(fields)){
    const wrap=node('label',label),control=options?document.createElement('select'):['condition','notes','parent_effect_description'].includes(key)?document.createElement('textarea'):document.createElement('input');
    if(options){control.add(new Option('選択してください',''));for(const [value,text] of options)control.add(new Option(text,value));}
    control.dataset.field=key;control.value=effect[key]??(key==='direction'?'increase':'');
    if(['condition','notes','parent_effect_description'].includes(key)){wrap.className='wide';control.rows=2;}
    if(['value','stack_count','max_raw_value'].includes(key))control.inputMode='decimal';if(key==='value')control.placeholder='数値 / booleanはtrueまたはfalse';
    wrap.append(control);grid.append(wrap);
  }
  box.append(grid);$('#edit-effects').append(box);
  const recalc=()=>{const value=box.querySelector('[data-field=value]').value,count=box.querySelector('[data-field=stack_count]').value;if(value.trim()&&Number.isFinite(Number(value))&&(!count||Number.isInteger(Number(count))&&Number(count)>0))box.querySelector('[data-field=max_raw_value]').value=Number((Number(value)*(Number(count)||1)).toFixed(8));};
  for(const key of ['value','stack_count'])box.querySelector(`[data-field=${key}]`).addEventListener('input',recalc);
}
function openAction(action,rows){
  activeAction={action,rows};const item=rows[0],edit=action==='edit';
  $('#action-title').textContent=({approve:'Approve · 候補を承認',edit:'Edit · 編集して承認',exclude:'Exclude · 比較対象外',hold:'Hold · 保留',bulk_exclude:'選択した節を比較対象外として承認'})[action];
  $('#action-description').textContent=rows.length>1?`${rows.length}節を一括処理します。`:item.character_name+' / '+item.skill_slot+' / '+item.skill_name;
  const candidateCount=rows.reduce((sum,r)=>sum+r.candidate_effects.length,0);
  $('#action-warning').textContent=action.includes('exclude')?`この節のバフ部分も含めて比較対象外にします。${candidateCount?`${candidateCount}件のバフ候補が含まれます。混在する効果を残す場合は一括除外せずEditしてください。`:''}`:action==='hold'?'保留として保存し、比較には含めません。':item.source_changed_since_review?'原文変更あり：変更後の原文も確認してください。':'候補のRaw Value・対象・持続・条件を確認してください。承認する候補以外の記述は比較に含めません。';
  $('#review-note').value=rows.length===1?item.review_note||'':'';$('#action-error').textContent='';$('#action-confirmation').checked=false;
  $('#confirmation-label').hidden=action==='hold';$('#edit-effects').replaceChildren();$('#add-effect').hidden=!edit;
  if(edit){const values=item.approved_effects?.length?item.approved_effects:item.candidate_effects;if(values.length)values.forEach(addEditor);else addEditor();}
  else if(action==='approve')for(const e of item.candidate_effects)$('#edit-effects').append(node('p',`${TYPE[e.buff_type]} ${formatRaw(e)} / 対象：${e.target||'未確定'} / 持続：${e.duration} / 発動：${e.trigger||'未確定'}`));
  $('#review-dialog').showModal();
}
function readEditors(){
  return [...document.querySelectorAll('.effect-editor')].map(box=>{
    const effect=Object.fromEntries([...box.querySelectorAll('[data-field]')].map(c=>[c.dataset.field,c.value.trim()]));
    if(effect.value_unit==='boolean'){if(!['true','false'].includes(effect.value))throw Error('booleanはtrueまたはfalseを入力してください。');effect.value=effect.value==='true';}
    else{if(effect.value===''||!Number.isFinite(Number(effect.value)))throw Error('Raw Valueに数値を入力してください。');effect.value=Number(effect.value);}
    for(const key of ['stack_count','max_raw_value','effect_index']){if(effect[key]!==''&&!Number.isFinite(Number(effect[key])))throw Error(`${key}に数値を入力してください。`);effect[key]=effect[key]===''?null:Number(effect[key]);}
    for(const key of ['parent_effect_name','parent_effect_type','parent_effect_description','parent_trigger','parent_end_condition','parent_duration','end_condition'])effect[key]=effect[key]||null;
    effect.duration_type=effect.duration_type||'unknown';effect.value_basis=effect.value_basis||null;return {...box.savedContext,...effect};
  });
}
$('#review-form').addEventListener('submit',async event=>{
  event.preventDefault();if(!activeAction||busy)return;
  try{
    if(!$('#reviewer-name').value.trim())throw Error('画面上部の確認者名を入力してください。');
    if(activeAction.action!=='hold'&&!$('#action-confirmation').checked)throw Error('原文と処理対象の確認にチェックしてください。');
    const payload={action:activeAction.action,review_keys:activeAction.rows.map(r=>r.review_key),reviewed_by:$('#reviewer-name').value.trim(),review_note:$('#review-note').value,confirmed:$('#action-confirmation').checked,base_revision:revision,...(activeAction.action==='edit'?{effects:readEditors()}:{})};
    busy=true;$('#save-review').disabled=true;$('#action-error').textContent='保存しています…';
    const response=await fetch(api,{method:'POST',headers:{'Content-Type':'application/json','X-Review-Token':token},body:JSON.stringify(payload)});
    const data=await response.json();if(!response.ok)throw Error(data.error||'保存に失敗しました');
    items=data.items;revision=data.revision;token=data.token;selection.clear();$('#review-dialog').close();$('#review-connection').textContent='保存しました。比較画面の再読み込みで反映されます。';$('#review-connection').dataset.error='false';
  }catch(e){$('#action-error').textContent=e.message;}
  finally{busy=false;$('#save-review').disabled=false;render();}
});
for(const id of ['close-review-dialog','cancel-review'])$('#'+id).addEventListener('click',()=>{if(!busy)$('#review-dialog').close();});
$('#review-dialog').addEventListener('cancel',e=>{if(busy)e.preventDefault();});$('#add-effect').addEventListener('click',()=>addEditor());
$('#review-search').addEventListener('input',()=>{page=0;selection.clear();render();});$('#review-status').addEventListener('change',()=>{page=0;selection.clear();render();});
$('#review-reset').addEventListener('click',()=>{reason='';$('#review-status').value='pending';$('#review-search').value='';page=0;selection.clear();render();});$('#review-refresh').addEventListener('click',load);
$('#clear-selection').addEventListener('click',()=>{selection.clear();render();});
$('#select-page').addEventListener('change',e=>{for(const r of filtered().slice(page*pageSize,(page+1)*pageSize).filter(canSelect)){if(e.target.checked)selection.add(r.review_key);else selection.delete(r.review_key);}render();});
$('#bulk-exclude').addEventListener('click',()=>openAction('bulk_exclude',items.filter(r=>selection.has(r.review_key))));
$('#previous-page').addEventListener('click',()=>{page--;render();});$('#next-page').addEventListener('click',()=>{page++;render();});
for(const id of ['unknown-search','unknown-include-nonbuff'])$('#'+id).addEventListener('input',()=>{unknownLimit=25;renderUnknown();});
$('#unknown-more').addEventListener('click',()=>{unknownLimit+=25;renderUnknown();});
load();

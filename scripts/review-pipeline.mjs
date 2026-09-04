import {classifyReview,reviewKey} from './review-classifier.mjs';
import {reviewSummary,isPending,REVIEW_REASONS,REVIEW_STATUSES} from '../review-model.js';
import {hash} from './source-policy.mjs';
import {cleanText} from './source-model.mjs';
const norm=s=>cleanText(s).replace(/\s+/g,' ').trim();
export const emptyReviewStore=()=>({version:1,revision:0,decisions:[],audit:[]});
export function validateReviewStore(store){
  if(store?.version!==1||!Number.isInteger(store.revision)||store.revision<0||!Array.isArray(store.decisions)||!Array.isArray(store.audit))throw Error('確認結果ファイルの形式が不正です。自動的に初期化せず処理を中止します。');
  const keys=new Set();
  for(const d of store.decisions){
    if(!d.review_key||keys.has(d.review_key)||!['approved','edited','excluded','hold'].includes(d.review_status)||!d.item_snapshot||!Array.isArray(d.effects)||!d.reviewed_by||!Number.isFinite(Date.parse(d.reviewed_at))||typeof d.review_note!=='string'||d.manual_override!==(d.review_status!=='hold'))throw Error('確認結果に不正な判断レコードがあります。既存データを保護して中止します。');
    keys.add(d.review_key);
  }
}
export function validateReviewItems(items){
  const keys=new Set();
  for(const r of items){
    if(!r.review_key||keys.has(r.review_key)||!Array.isArray(r.needs_review_reasons)||r.needs_review&& !r.needs_review_reasons.length||r.needs_review_reasons.some(k=>!Object.hasOwn(REVIEW_REASONS,k))||r.needs_review_reason!==(r.needs_review_reasons[0]||null)||!Object.hasOwn(REVIEW_STATUSES,r.review_status)||r.needs_review!==isPending(r))throw Error('Review分類データの整合性を確認できません。');
    keys.add(r.review_key);
  }
}
export function effectBelongsToReview(effect,item,snapshots=[]) {
  if(effect.review_key===item.review_key)return true;
  if(effect.character_id!==item.character_id||effect.skill_slot!==item.skill_slot)return false;
  if(item.review_id.startsWith('changed:'))return effect.effect_id===item.review_id.slice(8);
  if(item.source_section_index===null)return true;
  // Exact old text follows a moved section. Otherwise conservatively protect its previous position.
  const snapshot=snapshots.find(s=>s.character_id===item.character_id&&s.skill_slot===item.skill_slot);
  const sections=(snapshot?.text||'').split('■').slice(1).map(norm);
  const exact=sections.indexOf(norm(item.source_text));
  const index=exact>=0?exact:item.source_section_index;
  const effectIndex=effect.source_section_index??(effect.effect_id.startsWith('auto:')?Number(effect.effect_id.split(':').at(-2)):null);
  return effectIndex===index||norm(effect.source_text)===norm(item.source_text);
}
export function applyReviewWorkflow(output,store=emptyReviewStore()) {
  validateReviewStore(store);
  const snapshots=output['skill-snapshots'],characters=output.characters;
  const items=output['review-queue'].map(r=>classifyReview(r,characters.find(c=>c.character_id===r.character_id),snapshots.find(s=>s.character_id===r.character_id&&s.skill_slot===r.skill_slot)));
  let effects=output.effects.map(e=>({...e}));
  for(const item of items.filter(r=>r.review_status==='auto_extracted'))effects.push(...item.candidate_effects.map(e=>({...e,review_status:'auto_extracted'})));
  const byKey=new Map(items.map(r=>[r.review_key,r]));
  for(const decision of store.decisions){
    const original=decision.item_snapshot;
    const source=snapshots.find(s=>s.character_id===original.character_id&&s.skill_slot===original.skill_slot);
    const sectionTexts=(source?.text||'').split('■').slice(1).map(cleanText);
    const movedIndex=sectionTexts.findIndex(s=>norm(s)===norm(original.source_text));
    let current=items.find(r=>r.character_id===original.character_id&&r.skill_slot===original.skill_slot&&norm(r.source_text)===norm(original.source_text));
    if(!current&&!(movedIndex>=0&&movedIndex!==original.source_section_index))current=byKey.get(decision.review_key);
    const collision=byKey.get(decision.review_key);
    if(collision&&collision!==current){byKey.delete(collision.review_key);collision.review_key+=`:new-${collision.source_hash.slice(0,12)}`;byKey.set(collision.review_key,collision);}
    const currentText=original.source_section_index===null?source?.text:sectionTexts[movedIndex>=0?movedIndex:original.source_section_index];
    const changed=Boolean(source&&norm(currentText||'')!==norm(original.source_text));
    // Keep human decisions even if the new parser no longer produces a review entry.
    if(!current){current={...original};items.push(current);byKey.set(current.review_key,current);}
    Object.assign(current,{
      ...original,review_status:decision.review_status,reviewed_at:decision.reviewed_at,reviewed_by:decision.reviewed_by,
      manual_override:decision.manual_override,review_note:decision.review_note,needs_review:decision.review_status==='hold',
      source_changed_since_review:changed,source_missing_since_review:!source,
      current_source_text:changed?currentText||'':null,current_source_skill_text:source?.text||null,current_source_checked_at:source?.source_checked_at||null,
      current_source_type:source?.source_type||null,current_source_url:source?.source_url||null,
      approved_effects:decision.effects||[]
    });
    effects=effects.filter(e=>!effectBelongsToReview(e,original,snapshots));
    if(['approved','edited'].includes(decision.review_status)){
      effects.push(...decision.effects.map(e=>({...e,needs_review:false,manual_override:true,
        review_status:decision.review_status,reviewed_at:decision.reviewed_at,reviewed_by:decision.reviewed_by,review_note:decision.review_note,
        source_changed_since_review:changed,source_missing_since_review:!source})));
    }
  }
  validateReviewItems(items);
  effects=effects.map(e=>({parent_effect_name:null,parent_effect_type:null,parent_effect_description:null,parent_trigger:e.trigger||null,
    parent_end_condition:null,effect_index:null,end_condition:null,
    duration_type:e.duration==='継続'?'continuous':e.duration==='Instant'?'instant':/\d.*sec/.test(e.duration)?'fixed':'unknown',...e}));
  const summary=reviewSummary(items);
  for(const c of characters){
    const relevant=items.filter(r=>r.character_id===c.character_id);
    c.review_count=relevant.filter(isPending).length;
    c.effect_count=effects.filter(e=>e.character_id===c.character_id&&!e.needs_review).length;
    c.effect_review_status=c.review_count?'needs_review':'complete';
    c.release_date_review_status=c.release_date?'verified':'needs_review';
    c.metadata_review_fields=(c.review_fields||[]).filter(f=>!['effects','missing_slots','release_date'].includes(f));
    c.metadata_review_status=c.metadata_review_fields.length?'needs_review':'complete';
    c.effect_needs_review=c.effect_review_status==='needs_review';
    c.release_date_needs_review=c.release_date_review_status==='needs_review';
    // Legacy aggregate stays available but never gates published effects.
    c.review_fields=[...c.metadata_review_fields,...(c.release_date_needs_review?['release_date']:[]),...(c.effect_needs_review?['effects']:[])];
    c.needs_review=c.review_fields.length>0;
  }
  Object.assign(output['collection-report'],{review_sections_total:items.length,pending_sections:summary.pending,
    auto_excluded_sections:summary.statuses.auto_excluded,auto_extracted_sections:summary.statuses.auto_extracted,
    total_effects:effects.length,comparable_effects:effects.filter(e=>!e.needs_review).length,
    characters_with_effects:characters.filter(c=>c.effect_count).length,review_revision:store.revision,
    source_usage:Object.fromEntries(['nikke_gg','nikke_explorer','manual','official'].map(type=>[type,effects.filter(e=>e.source_type===type).length]))});
  return {...output,effects,'review-items':items,'review-queue':items.filter(isPending),
    'review-report':{...summary,revision:store.revision,reason_counts_overlap:true,
      source_change_alerts:items.filter(r=>r.source_changed_since_review||r.source_missing_since_review).length,
      scope:'既存の比較効果は維持。自動除外は確認待ち節にのみ適用。'}};
}
export function createDecision(store,items,payload,validateEffects,now=new Date().toISOString()) {
  validateReviewStore(store);
  if(payload.base_revision!==store.revision)throw Object.assign(Error('他の画面で更新されています。再読み込みしてから操作してください。'),{status:409});
  if(!['approve','edit','exclude','hold','bulk_exclude'].includes(payload.action))throw Error('Unknown review action');
  if(typeof payload.reviewed_by!=='string'||!payload.reviewed_by.trim()||payload.reviewed_by.length>100)throw Error('確認者名を1〜100文字で入力してください。');
  if(typeof payload.review_note!=='string'||payload.review_note.length>4000)throw Error('確認メモは4000文字以内で入力してください。');
  const keys=payload.review_keys;
  if(!Array.isArray(keys)||!keys.length||keys.length>1000||new Set(keys).size!==keys.length)throw Error('確認項目の選択が不正です（1回あたり最大1000節）。');
  if(payload.action!=='bulk_exclude'&&keys.length!==1)throw Error('一括処理は除外のみです。');
  const selected=keys.map(key=>items.find(r=>r.review_key===key));
  if(selected.some(r=>!r))throw Error('確認項目が見つかりません。');
  if(payload.action==='bulk_exclude'&&selected.some(r=>!r.needs_review_reasons.includes('not_a_buff_candidate')||!['pending','hold','auto_excluded'].includes(r.review_status)))throw Error('一括除外は対象外候補の未処理・保留・自動除外項目のみ選択できます。');
  const status={approve:'approved',edit:'edited',exclude:'excluded',bulk_exclude:'excluded',hold:'hold'}[payload.action];
  if(['approved','edited','excluded'].includes(status)&&payload.confirmed!==true)throw Error('原文と処理対象を確認してください。');
  const changes=selected.map(selectedItem=>{
    const item=['approve','edit'].includes(payload.action)&&selectedItem.source_changed_since_review&&selectedItem.current_source_text?{
      ...selectedItem,source_text:selectedItem.current_source_text,source_skill_text:selectedItem.current_source_skill_text,
      source_hash:hash(norm(selectedItem.current_source_text)),source_checked_at:selectedItem.current_source_checked_at,
      source_type:selectedItem.current_source_type,source_url:selectedItem.current_source_url,
      source_changed_since_review:false
    }:selectedItem;
    let effects=[];
    if(['approved','edited'].includes(status)){
      const proposed=payload.action==='approve'?item.candidate_effects:payload.effects;
      if(!Array.isArray(proposed)||!proposed.length||proposed.length>50)throw Error('承認する効果がありません。Editで比較可能な効果を入力してください。');
      const editable=['buff_type','value','value_unit','value_basis','target','target_type','duration','trigger','condition','stack_count','max_raw_value','notes','direction'];
      const hierarchy=['parent_effect_name','parent_effect_type','parent_effect_description','parent_trigger','parent_end_condition','parent_duration','function_text','effect_index','duration_type','end_condition','related_effects'];
      effects=proposed.map((p,i)=>({
        ...Object.fromEntries(editable.map(k=>[k,p[k]??(['value_basis','stack_count','max_raw_value'].includes(k)?null:k==='direction'?'increase':'')])),
        ...Object.fromEntries(hierarchy.filter(k=>k in p).map(k=>[k,p[k]])),effect_type:'buff',
        effect_id:`manual-review:${hash(item.review_key).slice(0,20)}:${i}`,character_id:item.character_id,character_name:item.character_name,
        skill_name:item.skill_name,skill_slot:item.skill_slot,skill_level:10,review_key:item.review_key,source_section_index:item.source_section_index,
        source_type:item.source_type,source_url:item.source_url,source_checked_at:item.source_checked_at,source_skill_id:item.source_skill_id,
        source_text:item.source_text,source_skill_text:item.source_skill_text,source_conflict:false,reviewed_source_conflict:Boolean(item.source_conflict),
        needs_review:false,validation_status:'curated',manual_override:true,review_status:status,reviewed_at:now,reviewed_by:payload.reviewed_by.trim(),review_note:payload.review_note.trim()
      }));
      const errors=validateEffects(effects);if(errors.length)throw Error(errors.join('\n'));
    }
    const {approved_effects,...itemSnapshot}=item;
    return {review_key:item.review_key,review_status:status,reviewed_at:now,reviewed_by:payload.reviewed_by.trim(),
      manual_override:status!=='hold',review_note:payload.review_note.trim(),source_hash:item.source_hash,item_snapshot:itemSnapshot,effects};
  });
  const next={...store,revision:store.revision+1,decisions:store.decisions.filter(d=>!keys.includes(d.review_key)).concat(changes),
    audit:[...store.audit,{revision:store.revision+1,action:payload.action,reviewed_at:now,reviewed_by:payload.reviewed_by.trim(),
      review_keys:keys,previous:store.decisions.filter(d=>keys.includes(d.review_key)),changes}]};
  return next;
}

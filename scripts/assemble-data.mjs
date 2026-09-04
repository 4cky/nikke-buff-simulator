import {SOURCE_URL,SOURCE_PAGE,PARSER_VERSION,SLOTS,levelTen,extractCharacter} from './source-model.mjs';
import {mergedCatalog,selectSlots,hash} from './source-policy.mjs';
import {aggregateUnknownCandidates,aggregateUnrecognizedPositiveCandidates,reclassificationReport} from './skill-hierarchy.mjs';
import {normalizeEffectAxes} from './effect-grammar.mjs';
const slotKey=e=>`${e.character_id}:${e.skill_slot}`;
const sourceKey=e=>`${e.character_id}:${e.source_type}:${e.source_skill_id}`;
export function assembleData(inputs,{overrides={},curated=[],reviewed=[],known=[],previousSlots=[],history=[]}={}){
  const entries=mergedCatalog(inputs.gg,inputs.index,overrides),characters=entries.map(e=>e.character);
  const selected=entries.flatMap(entry=>{
    const cached=inputs.details.get(entry.character.source_id);
    return selectSlots(entry,cached?.data,{ggCheckedAt:inputs.ggCheckedAt,explorerCheckedAt:cached?.checked_at,known});
  });
  const selectedMap=new Map(selected.map(s=>[slotKey(s),s]));
  const slotStatus=selected.map(({skill,gg_skill,explorer_skill,comparison,...s})=>({...s,comparison_status:comparison.status,
    source_conflict:comparison.source_conflict,source_skill_id:skill?String(skill.id):null,
    source_text:skill?levelTen(skill).text:'',source_hash:skill?hash(levelTen(skill).text):null,
    needs_review:!skill||comparison.status==='conflict'||comparison.status==='wording_difference'}));
  const comparisons=selected.filter(s=>s.comparison.status!=='not_compared').map(s=>({
    character_id:s.character_id,character_name:s.character_name,skill_slot:s.skill_slot,...s.comparison,
    nikke_gg:{source_url:characters.find(c=>c.character_id===s.character_id).nikke_gg_url,source_checked_at:inputs.ggCheckedAt,source_text:levelTen(s.gg_skill).text},
    nikke_explorer:{source_url:characters.find(c=>c.character_id===s.character_id).nikke_explorer_url,source_checked_at:inputs.details.get(s.character_id.replace('nikke-',''))?.checked_at,source_text:levelTen(s.explorer_skill).text}
  }));
  const conflicts=comparisons.filter(s=>s.source_conflict);
  const extracted=entries.map(entry=>extractCharacter({skills:selected.filter(s=>s.character_id===entry.character.character_id&&s.skill).map(s=>s.skill)},entry.character));
  const snapshots=extracted.flatMap(e=>e.snapshots);
  const hierarchies=extracted.flatMap(e=>e.hierarchies),nonBuffEffects=extracted.flatMap(e=>e.nonBuffEffects);
  const bySourceSkill=new Map(snapshots.map(s=>[sourceKey(s),s]));
  const reviewedSet=new Set(reviewed);
  const isReviewed=e=>reviewedSet.has(sourceKey(e))||(e.source_type==='nikke_gg'&&reviewedSet.has(`${e.character_id}:${e.source_skill_id}`));
  const sourceChanges=[],manual=[];
  for(const e of curated){
    const type=e.source_type||'nikke_gg',selection=selectedMap.get(slotKey(e));
    // Preserve the manual input, but don't duplicate a slot after source migration.
    if(['nikke_gg','nikke_explorer'].includes(type)&&selection?.selected_source_type&&selection.selected_source_type!==type)continue;
    const s=bySourceSkill.get(sourceKey({...e,source_type:type}));
    const external=['nikke_gg','nikke_explorer'].includes(type);
    const changed=external&&(!s||hash(s.text)!==e.source_skill_hash);
    if(changed)sourceChanges.push({review_id:`changed:${e.effect_id}`,character_id:e.character_id,character_name:e.character_name,skill_name:e.skill_name,skill_slot:e.skill_slot,
      source_type:type,source_url:e.source_url,source_checked_at:selection?.source_checked_at||e.source_checked_at||inputs.ggCheckedAt,
      source_text:s?.text||'',previous_source_text:e.source_skill_text,reason:'手動確認済み原文が変更・欠損。旧値は保持し数値比較から除外。',needs_review:true});
    const canonicalBuffType=e.buff_type==='hp_recovery_healing_potency'?(/Incoming Healing/i.test(e.source_text||e.source_skill_text||'')?'incoming_healing':'hp_recovery'):e.buff_type;
    manual.push({...e,buff_type:canonicalBuffType,source_type:type,source_checked_at:external?(s?.source_checked_at||selection?.source_checked_at||inputs.ggCheckedAt):e.source_checked_at,
      source_conflict:Boolean(selection?.comparison.source_conflict),
      needs_review:Boolean(e.needs_review||changed||selection?.comparison.source_conflict||selection?.comparison.status==='wording_difference')});
  }
  const replacements=new Set(manual.map(e=>e.replaces_effect_id).filter(Boolean));
  const effects=[...manual,...extracted.flatMap(e=>e.effects).filter(e=>!isReviewed(e)&&!replacements.has(e.effect_id))].map(normalizeEffectAxes);
  for(const e of effects)if(selectedMap.get(slotKey(e))?.comparison.status==='wording_difference')e.needs_review=true;
  const reviews=[...extracted.flatMap(e=>e.reviews).filter(e=>!isReviewed(e)),...sourceChanges];
  for(const s of selected){
    if(!s.skill)reviews.push({review_id:`missing:${slotKey(s)}`,character_id:s.character_id,character_name:s.character_name,skill_slot:s.skill_slot,skill_name:'未取得',
      source_type:entries.find(e=>e.character.character_id===s.character_id)?.gg?'nikke_gg':'nikke_explorer',
      source_url:characters.find(c=>c.character_id===s.character_id).nikke_gg_url||characters.find(c=>c.character_id===s.character_id).nikke_explorer_url,
      source_checked_at:inputs.ggCheckedAt,source_text:s.unmapped_primary_text||'',reason:`スキル枠の欠損・未確定：NIKKE.GG=${s.nikke_gg_status} / Explorer=${s.nikke_explorer_status}`,needs_review:true});
  }
  for(const c of comparisons.filter(c=>c.status!=='equal'))reviews.push({
    review_id:`comparison:${slotKey(c)}`,character_id:c.character_id,character_name:c.character_name,skill_slot:c.skill_slot,skill_name:'ソース照合',
    source_type:'nikke_gg',source_url:c.nikke_gg.source_url,source_checked_at:c.nikke_gg.source_checked_at,source_conflict:c.source_conflict,
    alternate_source_url:c.nikke_explorer.source_url,
    reason:c.source_conflict?'両ソースの数値が不一致。自動上書きせず比較から除外。':'記述が異なり同じ効果として自動照合できません。両原文を保持。',
    source_text:`NIKKE.GG:\n${c.nikke_gg.source_text}\n\nNikke Explorer:\n${c.nikke_explorer.source_text}`,needs_review:true});
  const dates=characters.filter(c=>c.release_date).sort((a,b)=>a.release_date.localeCompare(b.release_date)||a.character_name.localeCompare(b.character_name,'en')||a.character_id.localeCompare(b.character_id));
  dates.forEach((c,i)=>c.release_order=i+1);
  for(const c of characters){
    const skills=selected.filter(s=>s.character_id===c.character_id);
    for(const s of skills)for(const m of (s.skill?levelTen(s.skill).text:'').matchAll(/(?:When used in Burst Stage|Changes to Burst Stage)\s+([123])/gi))if(!c.burst_stage.includes(+m[1]))c.burst_stage.push(+m[1]);
    c.burst_stage.sort();c.review_fields=c.review_fields.filter(k=>k!=='burst_stage'||!c.burst_stage.length);
    c.effect_count=effects.filter(e=>e.character_id===c.character_id&&!e.needs_review).length;
    c.review_count=reviews.filter(r=>r.character_id===c.character_id).length;
    c.missing_slots=skills.filter(s=>!s.skill).map(s=>s.skill_slot);
    c.fallback_slots=skills.filter(s=>s.selected_source_type==='nikke_explorer').map(s=>s.skill_slot);
    c.source_conflict=skills.some(s=>s.comparison.source_conflict);
    const allReviewed=skills.length===3&&skills.every(s=>s.skill&&isReviewed({...s.skill,character_id:c.character_id,source_skill_id:String(s.skill.id)}));
    c.effects_status=allReviewed?(c.review_count?'needs_review':'curated'):c.review_count?'partial':'rule_matched';
    if(c.review_count)c.review_fields.push('effects');
    if(c.missing_slots.length)c.review_fields.push('missing_slots');
    c.needs_review=c.review_fields.length>0;
  }
  const transitions=[...history];
  for(const current of slotStatus){
    const previous=previousSlots.find(s=>slotKey(s)===slotKey(current));
    if(previous&&(previous.selected_source_type!==current.selected_source_type||previous.source_hash!==current.source_hash)){
      const event_id=hash([slotKey(current),previous.selected_source_type,previous.source_hash,current.selected_source_type,current.source_hash,current.source_checked_at].join('|'));
      if(!transitions.some(e=>e.event_id===event_id))transitions.push({event_id,character_id:current.character_id,skill_slot:current.skill_slot,
        changed_at:current.source_checked_at,previous,current,reason:previous.selected_source_type!==current.selected_source_type?'source_migration':'source_text_changed'});
    }
  }
  const report={generated_at:new Date().toISOString(),collected_at:inputs.ggCheckedAt,source_page:SOURCE_PAGE,source_api_url:SOURCE_URL,
    explorer_index_checked_at:inputs.indexCheckedAt,parser_version:PARSER_VERSION,source_snapshot_sha256:hash(JSON.stringify(inputs.gg)),
    source_records:inputs.gg.length,explorer_characters:inputs.index.length,visible_characters:characters.length,
    hierarchy_skills:hierarchies.length,hierarchy_sections:hierarchies.reduce((n,h)=>n+h.sections.length,0),
    structured_sections:hierarchies.reduce((n,h)=>n+h.sections.filter(s=>s.structured).length,0),
    non_buff_child_effects:nonBuffEffects.length,unknown_candidate_types:aggregateUnknownCandidates(hierarchies).length,
    comparable_effects:effects.filter(e=>!e.needs_review).length,total_effects:effects.length,characters_with_effects:characters.filter(c=>c.effect_count>0).length,
    pending_sections:reviews.length,verified_release_dates:dates.length,
    missing_primary_slots:selected.filter(s=>s.nikke_gg_status!=='available').length,
    fallback_slots:selected.filter(s=>s.selected_source_type==='nikke_explorer').length,
    unresolved_slots:selected.filter(s=>!s.skill).length,audited_slots:comparisons.length,conflicting_slots:conflicts.length,
    source_usage:Object.fromEntries(['nikke_gg','nikke_explorer','manual','official'].map(type=>[type,effects.filter(e=>e.source_type===type).length])),
    warnings:inputs.warnings,excluded:inputs.gg.filter(c=>c.visible!==1).map(c=>({source_id:c.id,name:c.name,reason:'NIKKE.GG visible != 1'})),
    completeness:'取得可能な両公開一覧の和集合。原文の欠損と分類未対応を分離。全効果の確認済みとは保証しません。',
    release_order_basis:'確認済み入手可能日順。同日は英語名→ID。不明日はnull。更新日やバナー終了日を転用しません。'};
  const unknownCandidates=aggregateUnknownCandidates(hierarchies),positiveCandidates=aggregateUnrecognizedPositiveCandidates(hierarchies);
  report.unrecognized_positive_effect_candidate_types=positiveCandidates.length;
  report.unrecognized_positive_effect_candidates=positiveCandidates.reduce((n,r)=>n+r.occurrence_count,0);
  return {characters,effects,'skill-snapshots':snapshots,'review-queue':reviews,'collection-report':report,
    'skill-hierarchies':hierarchies,'non-buff-effects':nonBuffEffects,'unknown-buff-candidates':unknownCandidates,
    'unrecognized-positive-effect-candidates':positiveCandidates,
    'unknown-reclassification-report':reclassificationReport(hierarchies,unknownCandidates),
    'slot-source-status':slotStatus,'source-comparisons':comparisons,'source-conflicts':conflicts,'source-history':transitions};
}

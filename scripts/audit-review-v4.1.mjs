import {createHash} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

const EXPECTED_PARSER='4.1.0';
const JSON_OUTPUT='review-audit-v4.1.json';
const MARKDOWN_OUTPUT='review-audit-v4.1.md';
const REASON_ORDER=['unknown_buff_type','ambiguous_value','special_mechanic','ambiguous_target','ambiguous_duration','ambiguous_trigger','missing_value','parser_failure','not_a_buff_candidate'];
const NON_COMPARISON_TYPES=new Set(['damage','penalty','debuff','cost_or_penalty','resource','special_mechanic','weapon_state']);
const STALE_STRUCTURED_TYPES=new Set(['resource','heal','weapon_state']);
const unique=values=>[...new Set(values.filter(v=>v!==null&&v!==undefined&&v!==''))];
const sortReasons=reasons=>unique(reasons).sort((a,b)=>{
  const ai=REASON_ORDER.indexOf(a),bi=REASON_ORDER.indexOf(b);
  return (ai<0?999:ai)-(bi<0?999:bi)||a.localeCompare(b,'en');
});
const hash=value=>createHash('sha256').update(value).digest('hex');
const readRaw=path=>readFile(path,'utf8');
const safe=(value,fallback=null)=>value===undefined?fallback:value;
const normalizedPattern=text=>String(text||'')
  .normalize('NFKC').replace(/[“”]/g,'"').replace(/[‘’]/g,"'")
  .replace(/^Effect\s+\d+\s*:\s*/i,'Effect {index}: ')
  .replace(/\b\d+(?:\.\d+)?\s*%/g,'{percent}')
  .replace(/\b\d+(?:\.\d+)?\s*(?:sec(?:ond)?s?)\b/gi,'{seconds} sec')
  .replace(/\b\d+(?:\.\d+)?\s*(?:round(?:\(s\)|s)?)\b/gi,'{rounds} rounds')
  .replace(/\b\d+(?:\.\d+)?\s*(?:shot(?:\(s\)|s)?)\b/gi,'{shots} shots')
  .replace(/\b\d+(?:\.\d+)?\b/g,'{number}')
  .replace(/\s+/g,' ').trim().toLowerCase();
const sourceLineFor=(item,candidate)=>candidate?.hierarchy?.source_line||candidate?.text||candidate?.source_line||item.source_text||'';
const candidateReasons=(item,candidate)=>{
  const hierarchy=candidate?.hierarchy;
  // An explicitly empty child-level array means this sibling is already resolved;
  // do not smear another sibling's section-level reason onto it.
  if(Array.isArray(hierarchy?.needs_review_reasons))return sortReasons(hierarchy.needs_review_reasons);
  if(REASON_ORDER.includes(candidate?.reason))return [candidate.reason];
  return sortReasons(item.needs_review_reasons||[]);
};
function expandItem(item){
  const candidates=item.parser_candidates?.length?item.parser_candidates:[null];
  return candidates.map((candidate,index)=>{
    const h=candidate?.hierarchy||{};
    const source_line=sourceLineFor(item,candidate);
    return {
      review_key:item.review_key,review_id:item.review_id,review_status:item.review_status,
      character_id:item.character_id,character_name:item.character_name,skill_slot:item.skill_slot,skill_name:item.skill_name,
      source_type:item.source_type,source_url:item.source_url,source_section_index:item.source_section_index,
      candidate_index:index,normalized_pattern:normalizedPattern(source_line),source_line,
      current_effect_type:safe(h.effect_type,candidate?.effect_type||null),current_buff_type:safe(h.buff_type,null),
      current_modifier_type:safe(h.modifier_type,null),current_target_type:safe(h.target_type,null),
      current_target:safe(h.target,null),current_trigger:safe(h.trigger,null),
      current_value:safe(h.value,null),current_value_unit:safe(h.value_unit,null),
      current_duration:safe(h.duration,null),current_duration_value:safe(h.duration_value,null),
      current_duration_unit:safe(h.duration_unit,null),current_duration_type:safe(h.duration_type,null),
      current_end_condition:safe(h.end_condition,null),current_parent_effect_name:safe(h.parent_effect_name,null),
      current_parent_effect_type:safe(h.parent_effect_type,null),current_section_condition:safe(h.section_condition,null),
      current_scaling_condition:safe(h.scaling_condition,null),current_special_type:safe(h.special_type,null),
      current_resource_type:safe(h.resource_type,null),needs_review_reasons:candidateReasons(item,candidate),
      item_needs_review_reasons:sortReasons(item.needs_review_reasons||[]),
      has_hierarchy:Boolean(candidate?.hierarchy),source_conflict:Boolean(item.source_conflict),manual_override:Boolean(item.manual_override)
    };
  });
}
const completeComparable=o=>['buff','heal','revive'].includes(o.current_effect_type)&&Boolean(o.current_buff_type)&&Boolean(o.current_modifier_type)&&
  Boolean(o.current_target_type)&&o.current_value!==null&&Boolean(o.current_value_unit)&&Boolean(o.current_trigger)&&o.current_duration!==null;
const structuredNonComparison=o=>NON_COMPARISON_TYPES.has(o.current_effect_type)&&o.has_hierarchy;
const structuredSpecial=o=>o.current_effect_type==='special_mechanic'&&o.has_hierarchy;
const hasOnly=(reasons,allowed)=>reasons.length>0&&reasons.every(r=>allowed.includes(r));
const lexicallyDefinitiveNonbuff=o=>/^(?:deals?\b|deploys? .+\bdeal\b|creates? (?:a |the |shared )?shield\b|current hp\s*▼|(?:atk|def|max hp|charge speed|charge damage|critical rate|critical damage|hit rate)\s*▼)/i.test(o.source_line);
function recommendation(group){
  const occurrences=group.occurrences,reasons=unique(occurrences.flatMap(o=>o.needs_review_reasons));
  if(occurrences.every(o=>structuredNonComparison(o))&&hasOnly(reasons,['special_mechanic','not_a_buff_candidate'])){
    if(occurrences.every(o=>o.current_effect_type!=='special_mechanic'||o.current_special_type))return {bucket:'review_flag_removal_candidate',confidence:'high',rationale:'比較対象外のeffect_typeとsubtypeまで構造化済みで、残存reasonは分類済み状態を再確認しているだけです。'};
    if(occurrences.every(o=>o.current_effect_type!=='special_mechanic'||/^(?:changes? (?:the|thes) weapon|removes? |crafts? |taunts?|stuns?)/i.test(o.source_line)))return {bucket:'review_flag_removal_candidate',confidence:'medium',rationale:'比較対象外のspecial文法として確定可能で、review flagのみ残っている可能性があります。'};
  }
  if(occurrences.every(o=>STALE_STRUCTURED_TYPES.has(o.current_effect_type)&&o.has_hierarchy)&&
    reasons.every(r=>['special_mechanic','ambiguous_duration','ambiguous_target','ambiguous_trigger','not_a_buff_candidate'].includes(r)))
    return {bucket:'review_flag_removal_candidate',confidence:'high',rationale:'resource / heal / weapon_stateとして必要軸が構造化済みで、旧review reasonだけが残っている候補です。'};
  if(occurrences.every(o=>completeComparable(o))&&reasons.every(r=>['ambiguous_duration','ambiguous_target','ambiguous_trigger'].includes(r)))
    return {bucket:'review_flag_removal_candidate',confidence:'medium',rationale:'比較effectの主要軸がすべて取得済みで、親・条件継承後の古いambiguity flagである可能性があります。'};
  const batchSignal=group.occurrence_count>1||reasons.some(r=>['parser_failure','missing_value','ambiguous_duration'].includes(r))||
    occurrences.some(o=>/\b(?:duration|cooldown|reload|restores?|charges?|fixed|stack|damage|hp|atk|def)\b|[▲▼]/i.test(o.source_line));
  if(batchSignal&&!occurrences.some(o=>o.source_conflict))return {bucket:'parser_rule_batch_candidate',confidence:group.occurrence_count>1?'high':'medium',rationale:'正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。'};
  return {bucket:'human_judgement_candidate',confidence:'high',rationale:'対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。'};
}
function makeGroup(reason,pattern,occurrences){
  const characters=unique(occurrences.map(o=>o.character_name)).sort((a,b)=>a.localeCompare(b,'en'));
  const skills=[...new Map(occurrences.map(o=>[`${o.character_name}|${o.skill_slot}|${o.skill_name}`,{character_name:o.character_name,skill_slot:o.skill_slot,skill_name:o.skill_name}])).values()];
  const group={reason,normalized_pattern:pattern,occurrence_count:occurrences.length,review_item_count:new Set(occurrences.map(o=>o.review_key)).size,
    character_names:characters,skills,source_lines:unique(occurrences.map(o=>o.source_line)),occurrences};
  return {...group,recommendation:recommendation(group)};
}
const sum=(rows,key='occurrence_count')=>rows.reduce((n,row)=>n+(row[key]||0),0);
const mdEscape=value=>String(value??'—').replace(/\|/g,'\\|').replace(/\r?\n/g,'<br>');
const mdCode=value=>`\`${String(value??'—').replace(/`/g,"'")}\``;
function groupMarkdown(group,index){
  const rec=group.recommendation;
  const lines=[`#### ${index+1}. ${mdCode(group.normalized_pattern)}`,'',
    `- 出現: ${group.occurrence_count} / Review節: ${group.review_item_count}`,
    `- キャラクター: ${group.character_names.join(', ')}`,
    `- 推奨: ${rec.bucket} (${rec.confidence}) — ${rec.rationale}`,'',
    '| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |',
    '|---|---|---|---|---|---|---|---|---|---|'];
  for(const o of group.occurrences)lines.push(`| ${mdEscape(o.character_name)} | ${mdEscape(`${o.skill_slot} / ${o.skill_name}`)} | ${mdEscape(o.source_line)} | ${mdEscape(`${o.current_effect_type||'—'} / ${o.current_buff_type||'—'} / ${o.current_modifier_type||'—'}`)} | ${mdEscape(o.current_target_type)} | ${mdEscape(`${o.current_value??'—'} / ${o.current_value_unit||'—'}`)} | ${mdEscape(`${o.current_duration||'—'} (${o.current_duration_value??'—'} ${o.current_duration_unit||''})`)} | ${mdEscape(o.current_parent_effect_name)} | ${mdEscape(JSON.stringify(o.current_section_condition))} | ${mdEscape(o.needs_review_reasons.join(' + '))} |`);
  return lines.join('\n');
}
function bucketMarkdown(name,bucket){
  const title={review_flag_removal_candidate:'既に構造化済みでreview flagだけ除去できそう',parser_rule_batch_candidate:'parser rule追加で一括解決できそう',human_judgement_candidate:'人間判断が必要そう'}[name];
  const lines=[`## ${title}`,'',`${bucket.pattern_count} patterns / ${bucket.occurrence_count} candidate occurrences / ${bucket.review_item_count} review sections`,'',
    '| Pattern | Occurrences | Characters | Reasons | Confidence |', '|---|---:|---|---|---|'];
  for(const g of bucket.groups)lines.push(`| ${mdEscape(g.normalized_pattern)} | ${g.occurrence_count} | ${mdEscape(g.character_names.join(', '))} | ${mdEscape(unique(g.occurrences.flatMap(o=>o.needs_review_reasons)).join(' + '))} | ${g.recommendation.confidence} |`);
  return lines.join('\n');
}
export async function auditReview(){
  const [reviewRaw,effectsRaw,decisionsRaw,reportRaw]=await Promise.all([
    readRaw('data/review-items.json'),readRaw('data/effects.json'),readRaw('data/review-decisions.json'),readRaw('data/collection-report.json')
  ]);
  const reviews=JSON.parse(reviewRaw).filter(item=>item.needs_review),effects=JSON.parse(effectsRaw),collection=JSON.parse(reportRaw);
  if(collection.parser_version!==EXPECTED_PARSER)throw Error(`Expected parser ${EXPECTED_PARSER}, found ${collection.parser_version}`);
  const occurrences=reviews.flatMap(expandItem),reasonCounts=new Map(),combos=new Map();
  for(const item of reviews){
    const reasons=sortReasons(item.needs_review_reasons||[]);for(const reason of reasons)reasonCounts.set(reason,(reasonCounts.get(reason)||0)+1);
    const key=reasons.join(' + ');if(!combos.has(key))combos.set(key,{reasons,item_count:0,review_keys:[]});const row=combos.get(key);row.item_count++;row.review_keys.push(item.review_key);
  }
  const groupsByReason={};
  for(const reason of sortReasons([...reasonCounts.keys()])){
    const map=new Map();
    for(const o of occurrences.filter(o=>o.needs_review_reasons.includes(reason))){const key=o.normalized_pattern||'(empty source line)';if(!map.has(key))map.set(key,[]);map.get(key).push(o);}
    groupsByReason[reason]=[...map].map(([pattern,rows])=>makeGroup(reason,pattern,rows)).sort((a,b)=>b.occurrence_count-a.occurrence_count||a.normalized_pattern.localeCompare(b.normalized_pattern,'en'));
  }
  const allPatternMap=new Map();
  for(const o of occurrences.filter(o=>o.needs_review_reasons.length)){const key=o.normalized_pattern||'(empty source line)';if(!allPatternMap.has(key))allPatternMap.set(key,[]);allPatternMap.get(key).push(o);}
  const allGroups=[...allPatternMap].map(([pattern,rows])=>makeGroup(sortReasons(unique(rows.flatMap(o=>o.needs_review_reasons))).join(' + '),pattern,rows));
  const bucketNames=['review_flag_removal_candidate','parser_rule_batch_candidate','human_judgement_candidate'];
  const resolutionBuckets=Object.fromEntries(bucketNames.map(name=>{
    const groups=allGroups.filter(g=>g.recommendation.bucket===name).sort((a,b)=>b.occurrence_count-a.occurrence_count||a.normalized_pattern.localeCompare(b.normalized_pattern,'en'));
    return [name,{pattern_count:groups.length,occurrence_count:sum(groups),review_item_count:new Set(groups.flatMap(g=>g.occurrences.map(o=>o.review_key))).size,groups}];
  }));
  const diagnostic=(predicate)=>occurrences.filter(predicate);
  const diagnostics={
    special_mechanic_only:diagnostic(o=>o.current_effect_type==='special_mechanic'&&o.needs_review_reasons.length===1&&o.needs_review_reasons[0]==='special_mechanic'),
    structured_resource_heal_weapon_state_with_review:diagnostic(o=>STALE_STRUCTURED_TYPES.has(o.current_effect_type)&&o.has_hierarchy&&o.needs_review_reasons.length>0),
    likely_stale_structured_resource_heal_weapon_state:diagnostic(o=>STALE_STRUCTURED_TYPES.has(o.current_effect_type)&&o.has_hierarchy&&o.needs_review_reasons.length>0&&
      (o.current_effect_type!=='heal'||completeComparable(o))&&o.needs_review_reasons.every(r=>['special_mechanic','ambiguous_duration','ambiguous_target','ambiguous_trigger','not_a_buff_candidate'].includes(r))),
    suspected_value_duration_confusion:diagnostic(o=>{
      const hasSeconds=/\b\d+(?:\.\d+)?\s*sec\b/i.test(o.source_line),statSeconds=/\b(?:cooldown|duration|time)\b[^.]*[▲▼:]\s*\d+(?:\.\d+)?\s*sec/i.test(o.source_line);
      return hasSeconds&&(statSeconds&&(o.current_value_unit!=='seconds'||o.current_value===null)||o.current_value_unit==='seconds'&&o.current_duration_value===o.current_value&&o.current_duration_type==='fixed');
    }),
    resolved_context_but_ambiguous_target_or_trigger:diagnostic(o=>(o.needs_review_reasons.includes('ambiguous_target')&&Boolean(o.current_target_type)||o.needs_review_reasons.includes('ambiguous_trigger')&&Boolean(o.current_trigger))&&Boolean(o.current_parent_effect_name||o.current_section_condition||o.current_scaling_condition)),
    definitive_nonbuff_with_not_a_buff_candidate:diagnostic(o=>o.needs_review_reasons.includes('not_a_buff_candidate')&&(NON_COMPARISON_TYPES.has(o.current_effect_type)||lexicallyDefinitiveNonbuff(o)))
  };
  const report={
    audit_version:'1.0.0',parser_version:EXPECTED_PARSER,generated_at:new Date().toISOString(),read_only_audit:true,
    inputs:{review_items_sha256:hash(reviewRaw),effects_sha256:hash(effectsRaw),review_decisions_sha256:hash(decisionsRaw),collection_report_sha256:hash(reportRaw)},
    summary:{needs_review_items:reviews.length,candidate_occurrences:occurrences.length,blocking_candidate_occurrences:occurrences.filter(o=>o.needs_review_reasons.length).length,manual_override_review_items:reviews.filter(r=>r.manual_override).length,published_effects:effects.length},
    reason_counts:sortReasons([...reasonCounts.keys()]).map(reason=>({reason,item_count:reasonCounts.get(reason),candidate_occurrence_count:occurrences.filter(o=>o.needs_review_reasons.includes(reason)).length})),
    reason_combinations:[...combos.values()].sort((a,b)=>b.item_count-a.item_count||a.reasons.join('|').localeCompare(b.reasons.join('|'),'en')),
    groups_by_reason:groupsByReason,resolution_buckets:resolutionBuckets,
    diagnostics:Object.fromEntries(Object.entries(diagnostics).map(([name,rows])=>[name,{occurrence_count:rows.length,review_item_count:new Set(rows.map(o=>o.review_key)).size,occurrences:rows}]))
  };
  const md=['# Review Audit — parser v4.1.0','',`Generated: ${report.generated_at}`,'',
    '> Read-only audit. effects、review decisions、manual overrideは変更していません。reason件数はReview節単位、pattern件数はparser candidate単位です。','',
    '> Resolution bucketはpattern単位の推奨です。同じReview節に複数patternがあるため、bucket間のReview節件数は重複する場合があります。','',
    '## Summary','',`- needs_review: ${reviews.length} sections`,`- parser candidates: ${occurrences.length} occurrences`,`- blocking parser candidates: ${report.summary.blocking_candidate_occurrences} occurrences`,`- published effects (unchanged): ${effects.length}`,
    `- manual_override review items: ${report.summary.manual_override_review_items}`,'',
    '## needs_review_reasons','', '| Reason | Review sections | Candidate occurrences |','|---|---:|---:|',
    ...report.reason_counts.map(r=>`| ${r.reason} | ${r.item_count} | ${r.candidate_occurrence_count} |`),'',
    '## Reason combinations','', '| Combination | Review sections |','|---|---:|',
    ...report.reason_combinations.map(r=>`| ${r.reasons.join(' + ')||'(none)'} | ${r.item_count} |`),'',
    ...bucketNames.flatMap(name=>[bucketMarkdown(name,resolutionBuckets[name]),'']),
    '## Targeted diagnostics','',
    ...Object.entries(report.diagnostics).map(([name,value])=>`- ${name}: ${value.occurrence_count} occurrences / ${value.review_item_count} sections`),'',
    '## Normalized groups by reason',''];
  for(const [reason,groups] of Object.entries(groupsByReason)){
    md.push(`## ${reason}`,'',`${groups.length} patterns / ${sum(groups)} candidate occurrences`,'');
    groups.forEach((group,index)=>md.push(groupMarkdown(group,index),''));
  }
  await writeFile(JSON_OUTPUT,JSON.stringify(report,null,2)+'\n');
  await writeFile(MARKDOWN_OUTPUT,md.join('\n'));
  return report;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const report=await auditReview();
  console.log(JSON.stringify({outputs:[JSON_OUTPUT,MARKDOWN_OUTPUT],summary:report.summary,reason_counts:report.reason_counts,
    reason_combinations:report.reason_combinations.map(({reasons,item_count})=>({reasons,item_count})),
    resolution_buckets:Object.fromEntries(Object.entries(report.resolution_buckets).map(([k,v])=>[k,{pattern_count:v.pattern_count,occurrence_count:v.occurrence_count,review_item_count:v.review_item_count}])),
    diagnostics:Object.fromEntries(Object.entries(report.diagnostics).map(([k,v])=>[k,{occurrence_count:v.occurrence_count,review_item_count:v.review_item_count}]))},null,2));
}

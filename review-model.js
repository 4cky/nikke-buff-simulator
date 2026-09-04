export const REVIEW_REASONS = {
  unknown_buff_type: 'Unknown Buff Type · バフ種別が未対応',
  ambiguous_value: 'Ambiguous Value · 効果量が曖昧',
  special_mechanic: 'Special Mechanic · 特殊挙動',
  ambiguous_target: 'Ambiguous Target · 対象が曖昧',
  missing_value: 'Missing Value · Raw Valueなし',
  parser_failure: 'Parser Failure · 解析形式が未対応',
  ambiguous_duration: 'Ambiguous Duration · 持続が曖昧',
  ambiguous_trigger: 'Ambiguous Trigger · 発動が曖昧',
  not_a_buff_candidate: 'Not a Buff Candidate · 比較対象外候補'
};
export const REVIEW_STATUSES = {pending:'未確認',hold:'保留',auto_excluded:'自動除外',auto_extracted:'バフ部分を抽出済み',approved:'承認済み',edited:'編集・承認済み',excluded:'人間が除外'};
export const reasonPriority = reason => Object.keys(REVIEW_REASONS).indexOf(reason)+1 || 99;
export const isPending = r => ['pending','hold'].includes(r.review_status);
export function reviewSummary(items) {
  return {total:items.length,pending:items.filter(isPending).length,
    statuses:Object.fromEntries(Object.keys(REVIEW_STATUSES).map(s=>[s,items.filter(r=>r.review_status===s).length])),
    reasons:Object.fromEntries(Object.keys(REVIEW_REASONS).map(reason=>[reason,{total:items.filter(r=>r.needs_review_reasons.includes(reason)).length,pending:items.filter(r=>isPending(r)&&r.needs_review_reasons.includes(reason)).length}]))};
}
export function filterReviews(items,{reason='',status='pending',query=''}={}) {
  const needle=query.trim().toLowerCase();
  return items.filter(r=>(!reason||r.needs_review_reasons.includes(reason))&&
    (status==='all'||status==='pending'?status==='all'||isPending(r):r.review_status===status)&&
    (!needle||[r.character_name,r.skill_name,r.skill_slot,r.review_note].join(' ').toLowerCase().includes(needle)))
    .sort((a,b)=>a.review_priority-b.review_priority||a.character_name.localeCompare(b.character_name,'en')||a.review_key.localeCompare(b.review_key));
}

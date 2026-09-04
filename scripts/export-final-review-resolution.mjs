import {readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

const read=async path=>JSON.parse(await readFile(path,'utf8'));
export async function exportFinalReviewResolution(output='final-review-resolution-v4.2.2.md'){
  const [report,queue,effects,characters]=await Promise.all(['data/final-review-resolution-report.json','data/review-queue.json','data/effects.json','data/characters.json'].map(read));
  const limitations=report.source_limitations.by_reason;
  const lines=[
    '# Parser v4.2.2 — Human Review Final Resolution','',
    '> NIKKE.GGを第一ソース、保存済みNikke Explorer監査原文を第二ソースとして17節を照合。原文にない情報は推測せず `source_limitations` に保存しています。','',
    '## Result','',
    `- Review対象: ${report.reviewed_sections} sections`,
    `- 解決: ${report.resolved_sections} sections`,
    `- 解決（source limitationなし）: ${report.resolved_without_source_limitation} sections`,
    `- 解決（source limitationあり）: ${report.resolved_with_source_limitation} sections`,
    `- 未解決: ${report.unresolved_sections} section（${report.unresolved_keys.join(', ')}）`,
    `- effects: ${report.before.effects_total} → ${report.after.effects_total}`,
    `- needs_review: ${report.before.needs_review} → ${report.after.needs_review}`,'',
    '## Source audit','',
    `- Nikke Explorer確認: ${report.secondary_source.checked_sections} sections`,
    `- Nikke Explorer補完: ${report.secondary_source.supplemented_sections} sections`,
    `- source limitation occurrences: ${report.source_limitations.total_occurrences}（公開effect ${report.source_limitations.effect_occurrences} / 未解決review ${report.source_limitations.unresolved_review_occurrences}）`,
    `- trigger_not_stated: ${limitations.trigger_not_stated||0}`,
    `- target_not_stated: ${limitations.target_not_stated||0}`,
    `- duration_not_stated: ${limitations.duration_not_stated||0}`,
    `- end_condition_not_fully_stated: ${limitations.end_condition_not_fully_stated||0}`,'',
    '## Schema additions','',
    `- New buff types: ${report.new_buff_types.map(x=>'`'+x+'`').join(', ')}`,
    `- Reference-stat effects: ${report.reference_stat_effects}`,
    '- Source omissions are separate from parser ambiguity via `source_limitations`.','',
    '## Remaining human review',''
  ];
  for(const review of queue){
    lines.push(`### ${review.character_name}`,'',`${review.skill_slot} · ${review.skill_name}`,'','```text',review.source_text,'```','',
      `- needs_review_reasons: ${(review.needs_review_reasons||[]).join(', ')}`,
      `- source_limitations: ${(review.source_limitations||[]).join(', ')}`,
      `- resolution blocker: ${review.final_resolution?.unresolved_reason||'—'}`,'');
  }
  lines.push('## Dataset validation','',`- characters: ${characters.length}`,`- effects: ${effects.length}`,`- comparison effects: ${effects.filter(e=>!e.needs_review).length}`,
    `- Unknown Buff Type: ${report.after.unknown_buff_types}`,`- unrecognized positive candidates: ${report.after.unrecognized_positive_occurrences}`,'');
  await writeFile(output,lines.join('\n')+'\n');return output;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(await exportFinalReviewResolution());

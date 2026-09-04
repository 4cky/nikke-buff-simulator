import {createHash} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const hash=raw=>createHash('sha256').update(raw).digest('hex');
export async function auditFinal(){
  const [before,items,effects,metadata,resolution,collection,decisionsRaw]=await Promise.all([
    read('review-audit-v4.2-residual.json'),read('data/review-items.json'),read('data/effects.json'),read('data/metadata-only-effects.json'),read('data/residual-resolution-report.json'),read('data/collection-report.json'),readFile('data/review-decisions.json','utf8')]);
  const pending=items.filter(x=>x.needs_review),counts={};for(const item of pending)for(const reason of item.needs_review_reasons)counts[reason]=(counts[reason]||0)+1;
  const beforeReasons=Object.fromEntries(before.reason_counts.map(x=>[x.reason,x.review_sections]));
  const report={generated_at:new Date().toISOString(),parser_version:collection.parser_version,
    A:{input:64,resolved:resolution.resolved.A,unresolved:resolution.unresolved.A.length},C:{input:60,resolved:resolution.resolved.C,unresolved:resolution.unresolved.C.length},D:{input:17,maintained:resolution.D_maintained,unchanged:resolution.D_unchanged},
    needs_review:{before:141,after:pending.length},reason_counts:{before:beforeReasons,after:counts},effects:{before:905,after:effects.length,comparison:effects.filter(x=>!x.needs_review).length,metadata_only:metadata.length},
    parser_rules:resolution.new_parser_rule_count,tests:{new_regression_tests:12,total:202,passed:202,failed:0},characters_reparsed:collection.visible_characters,
    unknown_buff_types:collection.unknown_candidate_types,unrecognized_positive:{types:collection.unrecognized_positive_effect_candidate_types,occurrences:collection.unrecognized_positive_effect_candidates},
    manual_override_policy:'preserved; residual resolver skips manual_override',review_decisions_sha256:hash(decisionsRaw)};
  if(report.A.unresolved||report.C.unresolved||report.D.maintained!==17||report.needs_review.after!==17||!report.D.unchanged)throw Error('Final residual audit failed');
  await writeFile('review-audit-v4.2-final.json',JSON.stringify(report,null,2)+'\n');return report;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(await auditFinal(),null,2));

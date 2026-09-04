import {readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

const read=async p=>JSON.parse(await readFile(p,'utf8'));
const val=v=>v===null||v===undefined||v===''?'—':typeof v==='object'?JSON.stringify(v):String(v);
const esc=v=>val(v).replace(/\|/g,'\\|').replace(/\r?\n/g,'<br>');
const fields=['effect_type','buff_type','modifier_type','value','value_unit','duration','duration_value','duration_unit','target','target_type','trigger','condition','parent_effect_name','section_condition','special_type','resource_type','scaling_type','scaling_source_effect','needs_review_reasons'];

export async function exportFinalHumanReview(){
  const [audit,reviews]=await Promise.all([read('review-audit-v4.2-residual.json'),read('data/review-items.json')]);
  const d=audit.categories.D.items,map=new Map(reviews.map(x=>[x.review_key,x]));
  const rows=d.map(a=>({audit:a,current:map.get(a.review_key)}));
  if(rows.length!==17||rows.some(x=>!x.current?.needs_review))throw Error('Expected all 17 D reviews to remain pending');
  const lines=['# Human Review v4.2 — Final 17','',
    '> residual auditのD分類だけを収録しています。A/Cの自動処理後も、この17節には推測による変更を加えていません。',''];
  rows.forEach(({audit:a,current:r},index)=>{
    lines.push(`## ${index+1}. ${r.character_name}`,'',`${r.skill_slot} · ${r.skill_name}`,'',`- review_key: \`${r.review_key}\``,'',
      '### Skill Lv.10 原文（section全文）','```text',r.source_text,'```','',
      `### A/Cで自動処理しなかった理由`,'',a.rationale,'',
      `### needs_review_reasons`,'',`- ${r.needs_review_reasons.join(' + ')}`,'');
    const candidates=r.parser_candidates?.length?r.parser_candidates:[{source_line:r.source_text,hierarchy:{}}];
    candidates.forEach((candidate,i)=>{
      const h=candidate.hierarchy||candidate.parsed||{};
      lines.push(`### Candidate ${i+1} — 問題の行`,'```text',candidate.source_line||r.source_text,'```','',
        '| Current parsed field | Value |','|---|---|');
      for(const field of fields){const key=field==='needs_review_reasons'?'needs_review_reasons':field;lines.push(`| ${field} | ${esc(h[key]??(field==='needs_review_reasons'?r.needs_review_reasons:null))} |`);}lines.push('');
    });
  });
  const reasonCounts={};for(const {current:r} of rows)for(const reason of r.needs_review_reasons)reasonCounts[reason]=(reasonCounts[reason]||0)+1;
  lines.push('## 集計','',`- review sections: ${rows.length}`,`- characters: ${new Set(rows.map(x=>x.current.character_name)).size}`,'',
    '| Reason | Sections |','|---|---:|',...Object.entries(reasonCounts).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).map(([k,v])=>`| ${k} | ${v} |`),'');
  await writeFile('human-review-v4.2-final.md',lines.join('\n'));
  return {sections:rows.length,characters:new Set(rows.map(x=>x.current.character_name)).size,reason_counts:reasonCounts};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(await exportFinalHumanReview(),null,2));

import {createHash} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

const OUTPUT='human-review-v4.1.md';
const PRIORITY=['ambiguous_target','ambiguous_value','missing_value','parser_failure','ambiguous_trigger','ambiguous_duration','special_mechanic','not_a_buff_candidate'];
const SLOT_ORDER={'Skill 1':1,'Skill 2':2,Burst:3};
const EXPLANATION={
  ambiguous_target:'対象を self / all allies / selected allies 等へ一意に確定できていません。',
  ambiguous_value:'原文中の数値を、対象effectのRaw Valueへ一意に対応付けられていません。',
  missing_value:'比較可能なRaw Valueを抽出できていません。',
  parser_failure:'現在のparser文法またはsection構造では、この行を安定してeffectへ変換できていません。',
  ambiguous_trigger:'発動条件または親から継承するtriggerを一意に確定できていません。',
  ambiguous_duration:'効果の持続時間または終了条件を一意に確定できていません。',
  special_mechanic:'特殊状態・状態遷移・コピー・分配・条件依存等として検出されていますが、既存effect構造への確定に人間判断が必要です。',
  not_a_buff_candidate:'バフ比較対象外の可能性がありますが、現行の解析結果だけでは自動的な比較対象外確定を行っていません。'
};
const hash=text=>createHash('sha256').update(text).digest('hex');
const unique=values=>[...new Set(values)];
const display=value=>{
  if(value===undefined||value===null)return 'null';
  if(typeof value==='object')return JSON.stringify(value);
  return String(value).replace(/\r?\n/g,'<br>');
};
const fence=text=>`\`\`\`text\n${String(text||'').replace(/\`\`\`/g,'\`\` \`')}\n\`\`\``;
const primaryReason=reasons=>PRIORITY.find(reason=>reasons.includes(reason))||reasons[0]||'unclassified';
const compare=(a,b)=>PRIORITY.indexOf(a.primary_reason)-PRIORITY.indexOf(b.primary_reason)||
  a.character_name.localeCompare(b.character_name,'en')||(SLOT_ORDER[a.skill_slot]||9)-(SLOT_ORDER[b.skill_slot]||9)||
  a.skill_name.localeCompare(b.skill_name,'en')||a.source_section_index-b.source_section_index||a.candidate_index-b.candidate_index;

export async function exportHumanReview(){
  const [auditRaw,reviewRaw,effectsRaw,decisionsRaw]=await Promise.all([
    readFile('review-audit-v4.1.json','utf8'),readFile('data/review-items.json','utf8'),readFile('data/effects.json','utf8'),readFile('data/review-decisions.json','utf8')
  ]);
  const audit=JSON.parse(auditRaw),reviewItems=JSON.parse(reviewRaw);
  const bucket=audit.resolution_buckets?.human_judgement_candidate;
  if(audit.parser_version!=='4.1.0'||bucket?.pattern_count!==61||bucket?.occurrence_count!==61)throw Error('Expected parser v4.1.0 human bucket with 61 patterns / 61 occurrences.');
  const itemMap=new Map(reviewItems.map(item=>[item.review_key,item]));
  const rows=bucket.groups.flatMap(group=>group.occurrences.map(occurrence=>({group,occurrence}))).map(({group,occurrence})=>{
    const item=itemMap.get(occurrence.review_key);if(!item)throw Error(`Missing review item: ${occurrence.review_key}`);
    const candidate=item.parser_candidates?.[occurrence.candidate_index]||null,h=candidate?.hierarchy||{};
    const reasons=occurrence.needs_review_reasons;
    return {
      review_key:occurrence.review_key,character_name:occurrence.character_name,skill_slot:occurrence.skill_slot,skill_name:occurrence.skill_name,
      source_section_index:occurrence.source_section_index??item.source_section_index??0,candidate_index:occurrence.candidate_index,
      section_text:item.hierarchy_section?.source_text||item.source_text||'',source_line:occurrence.source_line,
      normalized_pattern:group.normalized_pattern,primary_reason:primaryReason(reasons),needs_review_reasons:reasons,
      effect_type:h.effect_type??candidate?.effect_type??null,buff_type:h.buff_type??null,modifier_type:h.modifier_type??null,
      value:h.value??null,value_unit:h.value_unit??null,duration_value:h.duration_value??null,duration_unit:h.duration_unit??null,
      target:h.target??null,target_type:h.target_type??null,trigger:h.trigger??null,condition:h.condition??null,
      parent_effect_name:h.parent_effect_name??null,section_condition:h.section_condition??null,special_type:h.special_type??null,
      resource_type:h.resource_type??null,scaling_type:h.scaling_type??null,scaling_source_effect:h.scaling_source_effect??null
    };
  }).sort(compare);
  if(rows.length!==61||new Set(rows.map(r=>r.normalized_pattern)).size!==61)throw Error('Human-review export lost or duplicated candidates.');

  const grouped=[];
  for(const row of rows){
    const key=`${row.primary_reason}|${row.review_key}`;
    let group=grouped.at(-1);
    if(!group||group.key!==key){group={key,primary_reason:row.primary_reason,character_name:row.character_name,skill_slot:row.skill_slot,skill_name:row.skill_name,section_text:row.section_text,rows:[]};grouped.push(group);}
    group.rows.push(row);
  }
  const markdown=['# Human Review Export — parser v4.1.0','',
    '> `review-audit-v4.1` の human_judgement_candidate のみを抽出した、人間確認用のread-only exportです。effects、review decision、manual_override、parser、review flagは変更していません。',''];
  let ordinal=0,currentReason=null;
  for(const group of grouped){
    if(group.primary_reason!==currentReason){currentReason=group.primary_reason;markdown.push(`# ${currentReason}`,'');}
    markdown.push(`## ${group.character_name}`,'',`${group.skill_slot} · ${group.skill_name}`,'',
      '### Skill Lv.10 原文（該当節全文）','',fence(group.section_text),'');
    for(const row of group.rows){
      ordinal++;
      markdown.push(`### Candidate ${ordinal}`,'',`- primary reason: ${row.primary_reason}`,
        `- normalized pattern: \`${row.normalized_pattern.replace(/`/g,"'")}\``,'',
        '#### 問題の行','',fence(row.source_line),'','#### 現在の解析','',
        `- effect_type: ${display(row.effect_type)}`,
        `- buff_type: ${display(row.buff_type)}`,
        `- modifier_type: ${display(row.modifier_type)}`,
        `- value: ${display(row.value)}`,
        `- value_unit: ${display(row.value_unit)}`,
        `- duration_value: ${display(row.duration_value)}`,
        `- duration_unit: ${display(row.duration_unit)}`,
        `- target: ${display(row.target)}`,
        `- target_type: ${display(row.target_type)}`,
        `- trigger: ${display(row.trigger)}`,
        `- condition: ${display(row.condition)}`,
        `- parent_effect_name: ${display(row.parent_effect_name)}`,
        `- section_condition: ${display(row.section_condition)}`,
        `- special_type: ${display(row.special_type)}`,
        `- resource_type: ${display(row.resource_type)}`,
        `- scaling_type: ${display(row.scaling_type)}`,
        `- scaling_source_effect: ${display(row.scaling_source_effect)}`,
        `- needs_review_reasons: ${row.needs_review_reasons.join(' + ')}`,'',
        '#### Parserが判断できなかった理由','',
        `監査では「人間判断候補」に分類されています。${row.needs_review_reasons.map(reason=>EXPLANATION[reason]||`${reason} の解消条件をparserが確定できていません。`).join(' ')}`,'');
    }
    markdown.push('---','');
  }
  const primaryCounts=Object.fromEntries(PRIORITY.map(reason=>[reason,rows.filter(row=>row.primary_reason===reason).length]).filter(([,count])=>count));
  const allReasonCounts=Object.fromEntries(PRIORITY.map(reason=>[reason,rows.filter(row=>row.needs_review_reasons.includes(reason)).length]).filter(([,count])=>count));
  markdown.push('## 集計','',
    `- unique patterns: ${new Set(rows.map(row=>row.normalized_pattern)).size}`,
    `- occurrences: ${rows.length}`,
    `- character数: ${new Set(rows.map(row=>row.character_name)).size}`,'',
    '### 配置先reason別件数','',
    '| Reason | Occurrences |','|---|---:|',...Object.entries(primaryCounts).map(([reason,count])=>`| ${reason} | ${count} |`),'',
    '### 全reason出現件数（複数reasonは重複集計）','',
    '| Reason | Occurrences |','|---|---:|',...Object.entries(allReasonCounts).map(([reason,count])=>`| ${reason} | ${count} |`),'',
    '### Read-only input fingerprints','',
    `- effects.json: ${hash(effectsRaw)}`,
    `- review-decisions.json: ${hash(decisionsRaw)}`,
    `- review-items.json: ${hash(reviewRaw)}`,
    `- review-audit-v4.1.json: ${hash(auditRaw)}`,'');
  await writeFile(OUTPUT,markdown.join('\n'));
  return {output:OUTPUT,unique_patterns:new Set(rows.map(row=>row.normalized_pattern)).size,occurrences:rows.length,
    character_count:new Set(rows.map(row=>row.character_name)).size,primary_reason_counts:primaryCounts,all_reason_counts:allReasonCounts,
    input_hashes:{effects:hash(effectsRaw),review_decisions:hash(decisionsRaw),review_items:hash(reviewRaw),audit:hash(auditRaw)}};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(await exportHumanReview(),null,2));

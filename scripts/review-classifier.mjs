import {cleanText,parseEffectLine,targetType} from './source-model.mjs';
import {hash} from './source-policy.mjs';
import {reasonPriority} from '../review-model.js';
export const REVIEW_CLASSIFIER_VERSION='2.1.0';
const normalized=text=>cleanText(text).replace(/\s+/g,' ').trim();
const complex=/\b(?:convert\w*|conversion|copies|copy|mirrors?|equally shares?|distribut\w*|stack\w*|stage\s+\d|each subsequent|effects? var(?:y|ies)|proportion|multiplied|excess|changes? the weapon|changes? thes weapon|deactivation)\b/i;
const likelyBuff=/[▲▼]|\b(?:buff|gain|increase|unlimited|immune|indomitability|pierce|invulnerable|reload)\b/i;
const attack=/^(?:Deals? )\d+(?:\.\d+)?% of (?:final )?ATK as (?:additional |pierce )?damage\.$/i;
// Exclusion is a whitelist of complete, standalone lines. Unknown suffixes fail closed.
export function outsideComparison(line,enemy=false) {
  const text=normalized(line),p=parseEffectLine(text);
  if(attack.test(text))return '敵への直接ダメージ倍率';
  if(/^(?:(?:Attract: )?Taunts?(?: all enemies)?|Stuns?(?: the target)?) for \d+(?:\.\d+)? sec\.$/i.test(text))return '挑発・気絶';
  if(p?.effect_type==='special_mechanic'&&p.special_type==='shield')return 'シールド生成量';
  if(/^Current HP ▼ \d+(?:\.\d+)?%\.$/i.test(text))return '自己HP消費（条件・コストとして原文を保持）';
  if(enemy&&/^(?:[\w -]+: )?(?:DEF|ATK|Attack Damage|Hit Rate) ▼ \d+(?:\.\d+)?% for \d+(?:\.\d+)? sec\.$/i.test(text))return '敵へのデバフ';
  if(enemy&&/^Damage Taken ▲ \d+(?:\.\d+)?% for \d+(?:\.\d+)? sec\.$/i.test(text))return '敵への被ダメージ増加';
  return null;
}
export function reviewKey(review) {
  const suffix=review.review_id?.split(':').at(-1);
  const block=/^\d+$/.test(suffix)?Number(suffix):null;
  const kind=review.review_id?.startsWith('changed:')?'changed:'+review.review_id.slice(8):review.review_id?.startsWith('comparison:')?'comparison':review.review_id?.startsWith('missing:')?'missing':block===null?'skill':`section-${block}`;
  return `${review.character_id}:${review.skill_slot}:${kind}`;
}
export function classifyReview(review,character={},snapshot={}) {
  if(review.hierarchy_section)return classifyHierarchyReview(review,character,snapshot);
  const source=cleanText(review.source_text),lines=source.split('\n').map(l=>l.trim()).filter(Boolean);
  const heading=lines[0]||'',body=lines.slice(1),reasons=new Set(),evidence=[];
  const key=reviewKey(review),blockMatch=key.match(/section-(\d+)$/),block=blockMatch?+blockMatch[1]:null;
  const whole=snapshot.text||source;
  const sections=whole.split('■').slice(1).map(cleanText);
  const sectionMatched=block!==null&&normalized(sections[block])===normalized(source);
  const preceding=sectionMatched?sections.slice(0,block).join('\n'):'';
  const targetMatch=heading.match(/Affects (.+?)(?=\.\s*(?:Activates|Only activates|$))/i);
  const target=targetMatch?targetMatch[1]+'.':null,type=target&&targetType(target);
  const enemy=Boolean(target&&/\b(?:enemy|enemies|target\(s\)|target)\b/i.test(target)&&! /\b(?:self|allies|ally)\b/i.test(target));
  const activation=heading.replace(/Affects .+?(?=\.\s*(?:Activates|Only activates|$))\.?/i,'').trim();
  const inherited=!/Activates|chance of activating/i.test(heading)&&/Activates|chance of activating/i.test(preceding);
  let trigger=/Activates|chance of activating/i.test(activation)?activation:review.skill_slot==='Burst'&&!inherited?'Burst Skill使用時':'';
  const parts=body.map((text,index)=>({text,line_index:index,excluded_reason:outsideComparison(text,enemy),parsed:parseEffectLine(text)}));
  const knownBuff=parts.filter(p=>p.parsed&&!p.excluded_reason),unknown=parts.filter(p=>!p.parsed&&!p.excluded_reason);
  if(!trigger&&!inherited&&knownBuff.length&&knownBuff.every(p=>p.parsed.duration==='継続'))trigger='常時（原文 continuously）';
  const unsafe=/When used in Burst Stage|Effects? vary|Each subsequent|Only one effect|Stage \d|Effect \d:|Additional Effect|Changes? (?:the|thes) weapon|Function:|Once:|Twice:|Three times:/i.test(source);
  const integrity=review.source_conflict||/^(?:changed|comparison|missing):/.test(review.review_id||'');
  if(complex.test(source)){reasons.add('special_mechanic');evidence.push('スタック・変換・分配・段階などの記述');}
  if(!type&&!enemy){reasons.add('ambiguous_target');evidence.push('対象を既存の分類に確定できない');}
  if(inherited||!trigger){reasons.add('ambiguous_trigger');evidence.push(inherited?'前の節から発動条件が引き継がれる可能性':'発動条件を独立して確定できない');}
  for(const p of unknown){
    if(likelyBuff.test(p.text)){
      if(!/\b(?:ATK|DEF|Max HP|Critical Rate|Critical Damage|Attack Damage|Charge Speed|Charge Damage|Reload Speed|Hit Rate|Pierce Damage|Core Damage|Max Ammunition Capacity|Damage Taken)\b/i.test(p.text))reasons.add('unknown_buff_type');
      else if(!/(?:for|lasts for) \d+(?:\.\d+)? (?:sec|round|shot)|continuously/i.test(p.text))reasons.add('ambiguous_duration');
      else reasons.add('parser_failure');
    }
    if(/\d/.test(p.text)&&(/\b(?:of|per|each|times|x|stage|effect|damage|ATK)\b/i.test(p.text)))reasons.add('ambiguous_value');
  }
  for(const p of knownBuff)for(const reason of p.parsed._needs_review_reasons||[])reasons.add(reason);
  if(!body.length||/<[^>]*>|\{[^}]+\}/.test(source)||/構造|文法/.test(review.reason||''))reasons.add('parser_failure');
  if(!parts.some(p=>p.parsed||/\d+(?:\.\d+)?(?:%| sec| round| shot)/i.test(p.text)))reasons.add('missing_value');
  const likelyOutside=enemy||parts.some(p=>p.excluded_reason)||/Changes? (?:the|thes) weapon|Deals .*damage|Creates a shield/i.test(source);
  if(likelyOutside)reasons.add('not_a_buff_candidate');
  if(integrity){reasons.add('ambiguous_value');evidence.push('原文欠損・変更またはソース競合。自動処理しない');}
  const excluded=parts.filter(p=>p.excluded_reason);
  // All lines must be accounted for; never exclude a whole mixed/unknown section.
  const allOutside=parts.length>0&&excluded.length===parts.length&&!unsafe&&!integrity;
  const safeSplit=sectionMatched&&!inherited&&type&&trigger&&!unsafe&&!integrity&&unknown.length===0&&knownBuff.length>0&&excluded.length>0&&!knownBuff.some(p=>p.parsed._needs_review_reasons?.length);
  if(allOutside){reasons.clear();reasons.add('not_a_buff_candidate');}
  if(!reasons.size)reasons.add('parser_failure');
  const sorted=allOutside?[]:[...reasons].sort((a,b)=>reasonPriority(a)-reasonPriority(b));
  const candidates=parts.filter(p=>!p.excluded_reason).map(p=>({line_index:p.line_index,source_line:p.text,
    parsed:p.parsed,raw_numbers:[...p.text.matchAll(/\d+(?:\.\d+)?/g)].map(m=>+m[0]),
    unresolved_fields:[...(!p.parsed?['buff_type / value / duration']:[]),...(!type?['target_type']:[]),...(!trigger||inherited?['trigger']:[]),...(unsafe?['condition']:[])]}));
  const effects=knownBuff.map(p=>({
    character_id:review.character_id,character_name:review.character_name,skill_name:review.skill_name,skill_slot:review.skill_slot,skill_level:10,
    effect_id:`review:${key}:${p.line_index}`,review_key:key,source_section_index:block,
    ...p.parsed,target:target||'',target_type:type||null,trigger:inherited?'':trigger,
    condition:[activation||type&&!['self','all_allies'].includes(type)?heading:'',...excluded.map(p=>p.text),...(unsafe?[source]:[])].filter(Boolean).join('\n'),
    notes:p.parsed.notes||'',source_type:review.source_type,source_url:review.source_url,source_checked_at:review.source_checked_at,
    source_skill_id:review.source_skill_id,source_text:source,source_skill_text:whole,source_conflict:Boolean(review.source_conflict),
    needs_review:!safeSplit,validation_status:'rule_matched',parser_version:REVIEW_CLASSIFIER_VERSION
  }));
  return {...review,review_key:key,source_section_index:block,source_hash:hash(normalized(source)),source_skill_text:whole,
    nikke_gg_url:character.nikke_gg_url||null,nikke_explorer_url:character.nikke_explorer_url||null,
    needs_review_reasons:sorted,needs_review_reason:sorted[0]||null,review_priority:sorted.length?reasonPriority(sorted[0]):null,classification_evidence:evidence,
    parser_candidates:candidates,candidate_effects:effects,excluded_parts:excluded.map(({text,excluded_reason})=>({text,reason:excluded_reason})),
    review_status:allOutside?'auto_excluded':safeSplit?'auto_extracted':'pending',needs_review:!allOutside&&!safeSplit,
    reviewed_at:null,reviewed_by:null,manual_override:false,review_note:'',classifier_version:REVIEW_CLASSIFIER_VERSION,
    auto_exclusion_reason:allOutside?[...new Set(excluded.map(p=>p.excluded_reason))].join(' / '):null
  };
}

function classifyHierarchyReview(review,character,snapshot){
  const section=review.hierarchy_section,children=section.groups.flatMap(g=>g.children),key=reviewKey(review);
  const reasons=[...new Set(children.flatMap(c=>c.effect.needs_review_reasons))].sort((a,b)=>reasonPriority(a)-reasonPriority(b));
  if(!reasons.length)reasons.push('parser_failure');
  const candidates=children.filter(c=>['buff','heal','revive'].includes(c.effect.effect_type)||c.effect.needs_review_reasons.length);
  return {...review,review_key:key,source_section_index:section.section_index,source_hash:hash(normalized(review.source_text)),
    source_skill_text:snapshot.text||review.source_skill_text||review.source_text,
    nikke_gg_url:character.nikke_gg_url||null,nikke_explorer_url:character.nikke_explorer_url||null,
    needs_review_reasons:reasons,needs_review_reason:reasons[0],review_priority:reasonPriority(reasons[0]),
    classification_evidence:['Section → 親Mode/状態（任意）→ 子Effectとして解析。親のFunction・条件を保持。'],
    parser_candidates:candidates.map(c=>({line_index:c.child_index,source_line:c.source_line,parsed:c.parsed?c.effect:null,
      hierarchy:c.effect,effect_type:c.effect.effect_type,raw_numbers:[...c.text.matchAll(/\d+(?:\.\d+)?/g)].map(m=>+m[0]),
      unresolved_fields:c.effect.needs_review_reasons,comparison_eligible:c.comparison_eligible})),
    candidate_effects:children.filter(c=>['buff','heal','revive'].includes(c.effect.effect_type)&&c.parsed).map(c=>({...review,...c.effect,
      effect_id:`review:${key}:g${c.effect.parent_group_index}-c${c.child_index}`,review_key:key,skill_level:10,
      source_skill_text:snapshot.text||review.source_skill_text,notes:c.effect.notes||'',needs_review:!c.comparison_eligible,
      validation_status:'rule_matched',parser_version:REVIEW_CLASSIFIER_VERSION})),
    excluded_parts:children.filter(c=>!['buff','heal','revive'].includes(c.effect.effect_type)).map(c=>({text:c.source_line,reason:c.effect.effect_type,hierarchy:c.effect})),
    review_status:'pending',needs_review:true,reviewed_at:null,reviewed_by:null,manual_override:false,review_note:'',
    classifier_version:REVIEW_CLASSIFIER_VERSION,auto_exclusion_reason:null};
}

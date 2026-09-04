import {createHash} from 'node:crypto';
import {readFile, writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

const PARSER_VERSION = '4.2.0';
const JSON_OUTPUT = 'review-audit-v4.2-residual.json';
const MD_OUTPUT = 'review-audit-v4.2-residual.md';
const REASON_ORDER = ['unknown_buff_type','ambiguous_target','ambiguous_value','missing_value','parser_failure','ambiguous_trigger','ambiguous_duration','special_mechanic','not_a_buff_candidate'];
const CATEGORY_META = {
  A: {title: 'Auto-resolvable', description: 'parser rule追加で自動解決可能'},
  B: {title: 'Flag-only cleanup', description: '構造は確定済みでreview flagだけ除去可能'},
  C: {title: 'Exclude from comparison', description: '比較対象外として確定可能'},
  D: {title: 'Human judgement required', description: '原文または意味関係が不足し、人間判断が必要'},
};
const D_KEYS = new Map([
  ['nikke-308:Skill 2:section-0', '対象を示す文が原文になく、被攻撃時の発動者自身と断定できません。'],
  ['nikke-401:Skill 1:section-0', '他者Max HPの複製値を通常Max HP buffとして扱うか、copy mechanicとして扱うかは方針判断が必要です。'],
  ['nikke-402:Skill 1:section-0', '他者Max HPの複製値を通常Max HP buffとして扱うか、copy mechanicとして扱うかは方針判断が必要です。'],
  ['nikke-400:Skill 1:section-0', '他者ATKの複製とstackの意味を通常caster-based ATKへ落とすかは方針判断が必要です。'],
  ['nikke-121:Skill 2:section-0', '効果値は明示されていますが、持続時間が原文にありません。'],
  ['nikke-514:Skill 1:section-0', '終了条件が「under certain conditions」としか書かれておらず、具体条件を確定できません。'],
  ['nikke-12:Skill 2:section-0', 'source sectionに発動triggerが明示されていません。'],
  ['nikke-171:Skill 2:section-0', 'source sectionに発動triggerが明示されていません。'],
  ['nikke-30:Skill 2:section-0', 'source sectionに発動triggerが明示されていません。'],
  ['nikke-852:Skill 1:section-0', 'source sectionに発動triggerが明示されていません。'],
  ['nikke-306:Skill 2:section-0', 'source sectionに発動triggerが明示されていません。'],
  ['nikke-80:Skill 2:section-0', 'source sectionに発動triggerが明示されていません。'],
  ['nikke-352:Skill 2:section-0', 'source sectionに発動triggerが明示されていません。'],
  ['nikke-283:Skill 2:section-0', 'source sectionに発動triggerが明示されていません。'],
  ['nikke-284:Skill 2:section-0', 'source sectionに発動triggerが明示されていません。'],
  ['nikke-412:Burst:section-3', 'Burst activationは暗黙に想定できますが、該当sectionの原文にtriggerが明示されていません。'],
  ['nikke-861:Skill 2:section-1', 'source sectionに発動triggerが明示されていません。'],
]);

const sha256 = raw => createHash('sha256').update(raw).digest('hex');
const unique = xs => [...new Set(xs.filter(x => x !== null && x !== undefined && x !== ''))];
const sortReasons = xs => unique(xs || []).sort((a,b) => (REASON_ORDER.indexOf(a) < 0 ? 999 : REASON_ORDER.indexOf(a)) - (REASON_ORDER.indexOf(b) < 0 ? 999 : REASON_ORDER.indexOf(b)) || a.localeCompare(b,'en'));
const normalize = text => String(text || '').normalize('NFKC').replace(/[“”]/g,'"').replace(/[‘’]/g,"'")
  .replace(/^Effect\s+\d+\s*:\s*/i,'Effect {index}: ')
  .replace(/\b\d+(?:\.\d+)?\s*%/g,'{percent}')
  .replace(/\b\d+(?:\.\d+)?\s*(?:sec(?:ond)?s?)\b/gi,'{seconds} sec')
  .replace(/\b\d+(?:\.\d+)?\s*(?:round(?:\(s\)|s)?|shot(?:\(s\)|s)?|time(?:\(s\)|s)?)\b/gi,'{count} count')
  .replace(/\b\d+(?:\.\d+)?\b/g,'{number}').replace(/\s+/g,' ').trim().toLowerCase();
const md = value => String(value ?? '—').replace(/\|/g,'\\|').replace(/\r?\n/g,'<br>');
const code = value => `\`${String(value ?? '—').replace(/`/g,"'")}\``;
const safe = (obj,key,fallback=null) => obj && obj[key] !== undefined ? obj[key] : fallback;

function candidateReasons(item,candidate) {
  const h = candidate?.hierarchy;
  if (Array.isArray(h?.needs_review_reasons)) return sortReasons(h.needs_review_reasons);
  return sortReasons(candidate?.reason ? [candidate.reason] : item.needs_review_reasons);
}

function expandCandidate(item,candidate,index) {
  const h = candidate?.hierarchy || candidate?.parsed || {};
  const sourceLine = h.source_line || candidate?.source_line || candidate?.text || item.source_text || '';
  return {
    candidate_index: index,
    source_line: sourceLine,
    normalized_pattern: normalize(sourceLine),
    current_effect_type: safe(h,'effect_type',candidate?.effect_type || null),
    current_buff_type: safe(h,'buff_type'),
    current_modifier_type: safe(h,'modifier_type'),
    current_value: safe(h,'value'),
    current_value_unit: safe(h,'value_unit'),
    current_target: safe(h,'target'),
    current_target_type: safe(h,'target_type'),
    current_trigger: safe(h,'trigger'),
    current_condition: safe(h,'condition'),
    current_duration: safe(h,'duration'),
    current_duration_value: safe(h,'duration_value'),
    current_duration_unit: safe(h,'duration_unit'),
    current_duration_type: safe(h,'duration_type'),
    current_end_condition: safe(h,'end_condition'),
    current_parent_effect_name: safe(h,'parent_effect_name'),
    current_parent_effect_type: safe(h,'parent_effect_type'),
    current_section_condition: safe(h,'section_condition'),
    current_special_type: safe(h,'special_type'),
    current_resource_type: safe(h,'resource_type'),
    current_scaling_type: safe(h,'scaling_type'),
    current_scaling_source_effect: safe(h,'scaling_source_effect'),
    current_stack_count: safe(h,'stack_count'),
    needs_review_reasons: candidateReasons(item,candidate),
  };
}

function numberRole(line, match, offset) {
  const s = line.toLowerCase();
  const before = s.slice(Math.max(0,offset-45),offset);
  const after = s.slice(offset,offset+65);
  const around = before + after;
  if (/skill\s*$/.test(before)) return 'skill_slot_number';
  if (/effect\s*$/.test(before)) return 'effect_index';
  if (/stage\s*$/.test(before) || /burst\s*$/.test(before)) return 'stage_number';
  if (/affects?\s+(?:the\s+)?$/.test(before) || /targets?\s*$/.test(before)) return 'target_count';
  if (/attacks? sequentially\s*$/.test(before)) return 'attack_count';
  if (/stacks? up to\s*$/.test(before) || /stack count.*$/i.test(before)) return 'stack_count';
  if (/activates?\s*$/.test(before) || /activates?\s+.*?$/i.test(before) && /time/.test(after)) return 'activation_limit';
  if (/maximum(?: amount)?(?: is| of)?\s*$/.test(before) || /up to (?:a )?maximum of\s*$/.test(before)) return 'resource_cap';
  if (/required(?: for .*?)?\s*$/.test(before) || /hit count required.*$/i.test(before)) return 'requirement';
  if (/every\s*$/.test(before) || /recurring interval(?::| of .*?[▲▼])?\s*$/.test(before)) return 'interval';
  if (/for\s*$/.test(before) && /\s*(?:sec|round|shot)/.test(after)) return /round/.test(after) ? 'duration_rounds' : /shot/.test(after) ? 'duration_shots' : 'duration';
  if (/fixed|fixes charge time|activation time condition|duration/.test(around) && /sec/.test(after)) return 'parameter_or_duration';
  if (/normal attacks?|full charge attacks?/.test(after)) return 'attack_count_or_requirement';
  if (/%/.test(match)) {
    if (/deals?|damage|shield|avatar|max hp.*(?:equal|duplicate)/.test(around)) return 'noncomparison_raw_value';
    return 'raw_value';
  }
  if (/round/.test(after)) return 'round_count_or_flat_ammo';
  if (/sec/.test(after)) return 'duration_or_interval';
  if (/gauge|mp|restraint|feather|resource|charge by|replenishes/.test(around)) return 'resource_amount_or_cap';
  return 'unclassified_number';
}

function numericTokens(text) {
  const out=[];
  const re=/\b\d+(?:\.\d+)?(?:\s*%)?(?:\s*(?:sec(?:ond)?s?|round(?:\(s\)|s)?|shot(?:\(s\)|s)?|time(?:\(s\)|s)?))?/gi;
  for (const m of String(text||'').matchAll(re)) {
    const raw=m[0], value=Number(raw.match(/\d+(?:\.\d+)?/)?.[0]);
    out.push({raw,value,unit:/%/.test(raw)?'percent':/sec/i.test(raw)?'seconds':/round/i.test(raw)?'rounds':/shot/i.test(raw)?'shots':/time/i.test(raw)?'times':null,role:numberRole(String(text||''),raw,m.index),context:String(text||'').slice(Math.max(0,m.index-35),Math.min(String(text||'').length,m.index+raw.length+45)).replace(/\s+/g,' ')});
  }
  return out;
}

function extractTargetText(item) {
  if (item.hierarchy_section?.target) return item.hierarchy_section.target;
  const m = item.source_text.match(/Affects?\s+([^\n.]+(?:\([^)]*\))?)/i);
  if (m) return m[1].trim();
  if (/protects all allies/i.test(item.source_text)) return 'all allies (shared shield protection)';
  return null;
}

function targetProposal(item) {
  const raw=extractTargetText(item), t=String(raw||'').toLowerCase();
  const result={normalized_pattern:'missing_target_expression',target_type:null,target_count:null,target_selection:null,target_condition:null,target_class:null,target_weapon:null,target_element:null};
  if (!raw) return result;
  if (/same targets?/.test(t)) Object.assign(result,{normalized_pattern:'same_targets',target_type:'other',target_selection:'inherit_previous_section_targets'});
  else if (/allies.*except (?:for )?(?:self|the skill user)/.test(t)) Object.assign(result,{normalized_pattern:'all_allies_except_caster',target_type:/code/.test(t)?'element':'selected_allies',target_selection:'all_matching_except_caster'});
  else if (/self and (?:both |all )?adjacent allies/.test(t)) Object.assign(result,{normalized_pattern:'caster_and_adjacent_allies',target_type:'selected_allies',target_count:/both/.test(t)?3:null,target_selection:'caster_plus_adjacent'});
  else if (/self and all allies with lower.*def/.test(t)) Object.assign(result,{normalized_pattern:'caster_and_allies_lower_stat',target_type:'selected_allies',target_selection:'lower_stat_than_caster',target_condition:'final_def < caster_final_def'});
  else if (/incapacitated.*highest.*atk/.test(t)) Object.assign(result,{normalized_pattern:'incapacitated_ally_highest_atk',target_type:'selected_allies',target_count:1,target_selection:'highest_atk',target_condition:'incapacitated'});
  else if (/burst\s*3.*lowest.*atk/.test(t)) Object.assign(result,{normalized_pattern:'burst_stage_ally_lowest_atk',target_type:'selected_allies',target_count:1,target_selection:'lowest_atk',target_condition:'burst_stage=3'});
  else if (/random ally.*cover.*destroyed/.test(t)) Object.assign(result,{normalized_pattern:'random_ally_cover_destroyed',target_type:'selected_allies',target_count:(t.match(/\b(\d+)\b/)?.[1]&&Number(t.match(/\b(\d+)\b/)[1]))||1,target_selection:'random',target_condition:'cover_destroyed'});
  else if (/random ally/.test(t)) Object.assign(result,{normalized_pattern:'random_ally',target_type:'selected_allies',target_count:(t.match(/\b(\d+)\b/)?.[1]&&Number(t.match(/\b(\d+)\b/)[1]))||1,target_selection:'random'});
  else if (/defender ally/.test(t)) Object.assign(result,{normalized_pattern:'class_limited_allies',target_type:'class',target_count:Number(t.match(/\b(\d+)\b/)?.[1]||0)||null,target_class:'defender'});
  else if (/code allies.*(?:assault rifles?|\bsr\b|\brl\b|\bsmg\b)/.test(t)) Object.assign(result,{normalized_pattern:'element_and_weapon_limited_allies',target_type:'other',target_selection:'all_matching',target_element:t.match(/(fire|water|wind|electric|iron)\s+code/)?.[1]||null,target_weapon:t.match(/(assault rifles?|rocket launchers?|sniper rifles?|shotguns?|submachine guns?|machine guns?)/)?.[1]||null});
  else if (/code allies/.test(t)) Object.assign(result,{normalized_pattern:'element_limited_allies',target_type:'element',target_selection:'all_matching',target_element:t.match(/(fire|water|wind|electric|iron)\s+code/)?.[1]||null});
  else if (/all allies.*(?:in|when in|not in).*?(?:state|status)/.test(t)) Object.assign(result,{normalized_pattern:'allies_by_named_state',target_type:'selected_allies',target_selection:'named_state_membership',target_condition:raw});
  else if (/targets? in .*status|targets? afflicted with|all targets? in/.test(t)) Object.assign(result,{normalized_pattern:'targets_by_named_state',target_type:'other',target_selection:'named_state_membership',target_condition:raw});
  else if (/allies from the same squad/.test(t)) Object.assign(result,{normalized_pattern:'same_squad_allies',target_type:'selected_allies',target_selection:'same_squad'});
  else if (/self (?:if|while)/.test(t)) Object.assign(result,{normalized_pattern:'self_in_condition',target_type:'self',target_condition:raw});
  else if (/this unit'?s cover/.test(t)) Object.assign(result,{normalized_pattern:'caster_cover',target_type:'other',target_selection:'caster_cover'});
  else if (/the target/.test(t)) Object.assign(result,{normalized_pattern:'named_or_current_target',target_type:'other',target_selection:'current_named_target'});
  else if (/all allies/.test(t)) Object.assign(result,{normalized_pattern:'all_allies',target_type:'all_allies'});
  else if (/self/.test(t)) Object.assign(result,{normalized_pattern:'self',target_type:'self'});
  else Object.assign(result,{normalized_pattern:'explicit_unmapped_target',target_type:'other',target_selection:'literal_source_target'});
  return result;
}

function triggerAnalysis(item) {
  const text=item.source_text;
  const explicit=text.match(/(?:There is a [^\n.]+ chance of )?activat(?:es|ing|ed)[^\n.]*/i)?.[0] || null;
  const parent=unique(item.parser_candidates.map(c=>c.hierarchy?.parent_trigger).filter(Boolean))[0]||null;
  if (explicit) return {kind:'explicit_trigger_parser_missing',source_trigger:explicit,resolution:'A'};
  if (parent) return {kind:'parent_trigger_inheritance_available',source_trigger:parent,resolution:'A'};
  if (/\b\d+\s+or more ghosts?\b/i.test(text)) return {kind:'branch_condition_can_supply_trigger_context',source_trigger:text.match(/\b\d+\s+or more ghosts?\b/i)?.[0]||null,resolution:'A'};
  if (item.skill_slot==='Burst') return {kind:'implicit_skill_activation_not_explicit',source_trigger:null,resolution:'D'};
  return {kind:'trigger_absent_in_source',source_trigger:null,resolution:'D'};
}

function durationAnalysis(item) {
  const text=item.source_text;
  if (/for\s+1\s+shot/i.test(text)) return {kind:'parent_duration_inheritance',duration_type:'shots',value:1,unit:'shots',resolution:'A'};
  if (/for\s+1\s+round/i.test(text)) return {kind:'parent_duration_inheritance',duration_type:'rounds',value:1,unit:'rounds',resolution:'A'};
  if (/Duration:\s*\d+(?:\.\d+)?\s*sec/i.test(text)) { const n=Number(text.match(/Duration:\s*(\d+(?:\.\d+)?)/i)[1]); return {kind:'parent_duration_inheritance',duration_type:'fixed',value:n,unit:'seconds',resolution:'A'}; }
  if (/removed upon reloading/i.test(text)) return {kind:'until_condition',duration_type:'conditional',end_condition:'reload to max ammunition',resolution:'A'};
  if (/removes? .*under certain conditions/i.test(text)) return {kind:'until_unspecified_condition',duration_type:'conditional',end_condition:'under certain conditions (source is incomplete)',resolution:'D'};
  if (/continuously|continuous/i.test(text)) return {kind:'continuous',duration_type:'continuous',resolution:'A'};
  if (/permanently/i.test(text)) return {kind:'permanent',duration_type:'permanent',resolution:'A'};
  if (!/\b(?:sec|round|shot|continuous|permanent|removed|until)\b/i.test(text)) return {kind:'duration_absent_in_source',duration_type:'unknown',resolution:'D'};
  return {kind:'explicit_duration_parser_missing',duration_type:'unknown',resolution:'A'};
}

function parserFailureCause(line) {
  const s=String(line||'');
  if (/^Activates[\s\S]+Function:/i.test(s)) return 'named effect + Function + embedded key/value effectsを単一候補として束ね、子Effectへroutingできていません。';
  if (/^Affects[\s\S]+Function:/i.test(s)) return 'target heading + named effect + Functionの複合sectionを子Effectへroutingできていません。';
  if (/for\s+\d+(?:\.\d+)?\s+(?:shots?|round)/i.test(s)) return 'shots/roundsを持続単位として扱うstat buff文法に未対応です。';
  if (/Fixes charge time/i.test(s)) return '固定charge timeというweapon parameter文法に未対応です。';
  if (/Invulnerable.*Activates\s+\d+/i.test(s)) return 'boolean grantとbattle内activation limitを併記する複合文法に未対応です。';
  if (/Only when at/i.test(s)) return 'tier/branch prefixの後にnamed boolean effectが続く文法に未対応です。';
  if (/Previous effects trigger repeatedly/i.test(s)) return 'previous-effects参照をmetadata relationとしてparseできていません。';
  if (/Proportionally shares damage/i.test(s)) return 'numeric valueを持たないdamage-share grant文法に未対応です。';
  if (/Restores HP equal to .*attack damage/i.test(s)) return 'attack-damage基準のhealing conversion文法に未対応です。';
  if (/shield .* becomes invulnerable/i.test(s)) return 'shield objectをtargetにするboolean invulnerability文法に未対応です。';
  if (/^[^▲▼]+\.$/.test(s.trim())) return 'named state/headingだけのmetadata行をeffectから分離できていません。';
  if (/Max (?:Ammunition|ammunition) Capacity\s*▼/i.test(s)) return 'Max Ammunition Capacity decrease（句読点・注記を含む）のstat grammarに未対応です。';
  if (/[▲▼]/.test(s)) return '通常stat増減行をsection context付きchild effectへmaterializeできていません。';
  return 'この複合文を既知のchild effect grammarへ分割できていません。';
}

function specialSemantics(candidate) {
  const s=candidate.source_line.toLowerCase();
  let kind='unclassified_special', name=candidate.current_parent_effect_name||null, metadata=false, comparison='requires_parser_rule';
  if (/decoy: creates an avatar/.test(s)) {kind='decoy_state';name='Decoy';comparison='exclude';}
  else if (/unable to take cover/.test(s)) {kind='penalty_metadata';name='unable_to_take_cover';metadata=true;comparison='exclude';}
  else if (/recurring interval/.test(s)) {kind='interval_parameter';name='recurring_interval';metadata=true;comparison='exclude';}
  else if (/^storage:/.test(s)) {kind='healing_storage_state';name='Storage';metadata=true;comparison='exclude';}
  else if (/^aftertaste:|^brand:|deals?|damage:/.test(s)) {kind='damage_mechanic';comparison='exclude';}
  else if (/changes the weapon in use/.test(s)) {kind='weapon_specification';name=s.split(':').slice(1).join(':').trim()||name;metadata=true;comparison='exclude';}
  else if (/converts damage/.test(s)) {kind='damage_conversion';name='elemental_advantage_conversion';comparison='requires_parser_rule';}
  else if (/firepower gauge|\bmp\b|restraint chains|near feathers/.test(s)) {kind='resource_operation';name=(s.match(/firepower gauge|mp|restraint chains|near feathers/)||[])[0]||name;comparison='exclude';}
  else if (/fixes charge time|activation time condition|hit count required|number of uses/.test(s)) {kind='skill_or_weapon_parameter';name=(s.match(/charge time|activation time condition|hit count required|number of uses/)||[])[0]||name;metadata=true;comparison='exclude';}
  else if (/effect \d+: activates|previous effects|special note|once the duration ends/.test(s)) {kind='trigger_or_state_metadata';metadata=true;comparison='exclude';}
  else if (/stores up hp|maximum amount stored/.test(s)) {kind='storage_parameter';metadata=true;comparison='exclude';}
  else if (/duplicates|mirrors|x (?:the )?number/.test(s)) {kind='copy_or_scaling';comparison='requires_parser_rule';}
  else if (/invulnerable|proportionally shares|decreases the stack count|incoming healing|restores hp|atk ▲|reload speed ▲|distributed damage ▲/.test(s)) {kind='beneficial_effect';comparison='requires_parser_rule';}
  return {
    semantic_special_type:kind,
    state_resource_or_parameter_name:name,
    special_type_already_set:Boolean(candidate.current_special_type),
    resource_type_already_set:Boolean(candidate.current_resource_type),
    target_required:comparison==='requires_parser_rule' && !metadata,
    numeric_value_required:!/invulnerable|proportionally shares|conversion|once the duration ends/.test(s) && !metadata,
    standalone_effect:!metadata,
    metadata_only:metadata,
    disposition:comparison,
    normal_special_review_unnecessary:comparison==='exclude',
  };
}

function isCompleteComparable(c) {
  const numericRequired = c.current_value_unit !== 'boolean';
  return ['buff','heal','revive'].includes(c.current_effect_type) && Boolean(c.current_buff_type) && Boolean(c.current_modifier_type) && Boolean(c.current_target_type) && Boolean(c.current_trigger) && c.current_duration !== null && (!numericRequired || c.current_value !== null);
}

function candidateExclusionKind(c) {
  const s=c.source_line.toLowerCase();
  if (/deals?|damage:|deploys? .*deal/.test(s)) return 'damage';
  if (/creates? (?:a |the )?(?:shared )?shield/.test(s)) return 'shield_generation';
  if (/unable to take cover|current hp\s*▼/.test(s)) return 'penalty';
  if (/firepower gauge|\bmp\b|restraint chains|near feathers|replenishes \d+ mp|charges? .* by/.test(s)) return 'resource';
  if (/changes the weapon|fixes charge time|focuses fire/.test(s)) return 'weapon_state';
  if (/recurring interval|previous effects|special note|effect \d+: activates|forcefully uses|once the duration ends|maximum amount stored|storage:/.test(s)) return 'metadata';
  if (/decoy: creates an avatar/.test(s)) return 'state_metadata';
  if (/atk\s*▼|def\s*▼|stun|taunt/.test(s)) return 'debuff';
  return null;
}

function classifyItem(item,candidates) {
  if (D_KEYS.has(item.review_key)) return {category:'D',cause_group:'source_or_semantic_limitation',rationale:D_KEYS.get(item.review_key)};
  const blocking=candidates.filter(c=>c.needs_review_reasons.length);
  const reasons=sortReasons(item.needs_review_reasons);
  if (reasons.includes('ambiguous_trigger')) {
    const a=triggerAnalysis(item);
    if (a.resolution==='D') return {category:'D',cause_group:a.kind,rationale:'原文に明示triggerがなく、自動補完すると推測になります。'};
  }
  if (reasons.includes('ambiguous_duration')) {
    const a=durationAnalysis(item);
    if (a.resolution==='D') return {category:'D',cause_group:a.kind,rationale:a.kind==='duration_absent_in_source'?'原文に持続時間がありません。':'具体的な終了条件がsourceにありません。'};
  }
  const genuinelyComplete = blocking.every(c=>isCompleteComparable(c)) &&
    blocking.every(c=>!c.needs_review_reasons.includes('special_mechanic') || Boolean(c.current_scaling_type || c.current_special_type || c.current_resource_type)) &&
    blocking.every(c=>!c.needs_review_reasons.includes('ambiguous_duration') || !['Instant','',null].includes(c.current_duration));
  if (blocking.length && genuinelyComplete && blocking.every(c=>c.needs_review_reasons.every(r=>['special_mechanic','ambiguous_target','ambiguous_trigger','ambiguous_duration'].includes(r)))) {
    return {category:'B',cause_group:'stale_review_reason',rationale:'比較effectの必須軸が既に構造化済みで、残っているreasonのみを除去できます。'};
  }
  const exclusions=blocking.map(candidateExclusionKind);
  if (blocking.length && exclusions.every(Boolean)) return {category:'C',cause_group:unique(exclusions).sort().join('+'),rationale:`未解決candidateは${unique(exclusions).join(' / ')}で、今回の比較effectsから除外できます。`};
  if (reasons.includes('special_mechanic') && blocking.length && blocking.every(c=>specialSemantics(c).disposition==='exclude')) return {category:'C',cause_group:'normal_special_noncomparison',rationale:'special mechanicの種類と役割は原文から確定でき、比較用effectではなくmetadata/noncomparisonとして扱えます。'};
  const cause = reasons.includes('ambiguous_target') ? targetProposal(item).normalized_pattern
    : reasons.includes('ambiguous_value') ? 'numeric_role_grammar'
    : reasons.includes('missing_value') ? 'boolean_or_resource_grammar'
    : reasons.includes('parser_failure') ? normalize(parserFailureCause(blocking[0]?.source_line||item.source_text))
    : reasons.includes('ambiguous_trigger') ? triggerAnalysis(item).kind
    : reasons.includes('ambiguous_duration') ? durationAnalysis(item).kind
    : reasons.includes('special_mechanic') ? 'special_or_scaling_grammar'
    : 'review_rule_gap';
  return {category:'A',cause_group:cause,rationale:'原文に必要情報があり、正規化された文法・継承・routing ruleとして再現可能です。'};
}

function markdownCandidate(c) {
  return [
    `#### Candidate ${c.candidate_index + 1}`,'',
    '```text',c.source_line,'```','',
    '| Field | Current value |','|---|---|',
    `| effect_type | ${md(c.current_effect_type)} |`,`| buff_type | ${md(c.current_buff_type)} |`,`| modifier_type | ${md(c.current_modifier_type)} |`,
    `| value / unit | ${md(`${c.current_value ?? '—'} / ${c.current_value_unit ?? '—'}`)} |`,`| target / target_type | ${md(`${c.current_target ?? '—'} / ${c.current_target_type ?? '—'}`)} |`,
    `| trigger | ${md(c.current_trigger)} |`,`| condition | ${md(c.current_condition)} |`,`| duration | ${md(`${c.current_duration ?? '—'} (${c.current_duration_value ?? '—'} ${c.current_duration_unit ?? ''}; ${c.current_duration_type ?? '—'})`)} |`,
    `| parent_effect_name | ${md(c.current_parent_effect_name)} |`,`| section_condition | ${md(JSON.stringify(c.current_section_condition))} |`,`| special_type | ${md(c.current_special_type)} |`,`| resource_type | ${md(c.current_resource_type)} |`,`| needs_review_reasons | ${md(c.needs_review_reasons.join(' + ')||'(resolved sibling)')} |`,''
  ].join('\n');
}

function markdownItem(row,index) {
  const lines=[`### ${index + 1}. ${row.character}`,'',`${row.skill_slot} · ${row.skill_name}`,'',
    `- review_key: ${code(row.review_key)}`,
    `- 判定: **${row.category} — ${CATEGORY_META[row.category].description}**`,
    `- cause group: ${code(row.cause_group)}`,
    `- 根拠: ${row.rationale}`,
    `- section target proposal: ${code(JSON.stringify(row.target_analysis))}`,'',
    '#### Source section全文','', '```text',row.source_section,'```',''];
  row.candidates.forEach(c=>lines.push(markdownCandidate(c)));
  return lines.join('\n');
}

export async function auditResidual() {
  const paths=['data/review-items.json','data/effects.json','data/review-decisions.json','data/collection-report.json'];
  const beforeRaw=Object.fromEntries(await Promise.all(paths.map(async p=>[p,await readFile(p,'utf8')])));
  const beforeHashes=Object.fromEntries(paths.map(p=>[p,sha256(beforeRaw[p])]));
  const collection=JSON.parse(beforeRaw['data/collection-report.json']);
  if (collection.parser_version!==PARSER_VERSION) throw new Error(`Expected parser ${PARSER_VERSION}, found ${collection.parser_version}`);
  const reviews=JSON.parse(beforeRaw['data/review-items.json']).filter(x=>x.needs_review);
  if (reviews.length!==141) throw new Error(`Expected 141 needs_review sections, found ${reviews.length}`);

  const rows=reviews.map(item=>{
    const candidates=(item.parser_candidates?.length?item.parser_candidates:[null]).map((c,i)=>expandCandidate(item,c,i));
    const decision=classifyItem(item,candidates);
    return {
      review_key:item.review_key,review_id:item.review_id,character:item.character_name,character_id:item.character_id,
      skill_slot:item.skill_slot,skill_name:item.skill_name,source_type:item.source_type,source_url:item.source_url,
      source_section:item.source_text,source_section_index:item.source_section_index,
      needs_review_reasons:sortReasons(item.needs_review_reasons),manual_override:Boolean(item.manual_override),review_status:item.review_status,
      ...decision,target_analysis:targetProposal(item),numeric_tokens:numericTokens(item.source_text),
      trigger_analysis:item.needs_review_reasons.includes('ambiguous_trigger')?triggerAnalysis(item):null,
      duration_analysis:item.needs_review_reasons.includes('ambiguous_duration')?durationAnalysis(item):null,
      parser_failure_explanations:item.needs_review_reasons.includes('parser_failure')?unique(candidates.filter(c=>c.needs_review_reasons.includes('parser_failure')).map(c=>parserFailureCause(c.source_line))):[],
      candidates:candidates.map(c=>({...c,numeric_tokens:numericTokens(c.source_line),exclusion_kind:candidateExclusionKind(c),special_audit:c.needs_review_reasons.includes('special_mechanic')?specialSemantics(c):null})),
    };
  });
  if (rows.length!==141 || new Set(rows.map(r=>r.review_key)).size!==141 || rows.some(r=>!CATEGORY_META[r.category])) throw new Error('A-D partition is not complete and exclusive');

  const reasonCounts=sortReasons(unique(rows.flatMap(r=>r.needs_review_reasons))).map(reason=>({reason,review_sections:rows.filter(r=>r.needs_review_reasons.includes(reason)).length,candidate_occurrences:rows.flatMap(r=>r.candidates).filter(c=>c.needs_review_reasons.includes(reason)).length}));
  const groupsFor=(selector,keyFn)=>{
    const map=new Map(); for(const row of rows.filter(selector)){const key=keyFn(row);if(!map.has(key))map.set(key,[]);map.get(key).push(row);}
    return [...map].map(([normalized_pattern,items])=>({normalized_pattern,review_sections:items.length,candidate_occurrences:items.reduce((n,x)=>n+x.candidates.filter(c=>c.needs_review_reasons.length).length,0),characters:unique(items.map(x=>x.character)).sort((a,b)=>a.localeCompare(b,'en')),review_keys:items.map(x=>x.review_key)})).sort((a,b)=>b.review_sections-a.review_sections||a.normalized_pattern.localeCompare(b.normalized_pattern,'en'));
  };
  const targetGroups=groupsFor(r=>r.needs_review_reasons.includes('ambiguous_target'),r=>r.target_analysis.normalized_pattern).map(g=>({...g,structured_target:rows.find(r=>g.review_keys.includes(r.review_key)).target_analysis}));
  const parserFailureGroups=groupsFor(r=>r.needs_review_reasons.includes('parser_failure'),r=>r.parser_failure_explanations.join(' + ')||'unknown parser failure');
  const specialRows=rows.filter(r=>r.needs_review_reasons.includes('special_mechanic'));
  const specialAudit=specialRows.map(r=>({review_key:r.review_key,character:r.character,skill_slot:r.skill_slot,skill_name:r.skill_name,category:r.category,candidates:r.candidates.filter(c=>c.needs_review_reasons.includes('special_mechanic')).map(c=>({source_line:c.source_line,current_effect_type:c.current_effect_type,current_special_type:c.current_special_type,current_resource_type:c.current_resource_type,...c.special_audit}))}));
  const notBuffAudit=rows.filter(r=>r.needs_review_reasons.includes('not_a_buff_candidate')).map(r=>({review_key:r.review_key,character:r.character,category:r.category,classification:unique(r.candidates.filter(c=>c.needs_review_reasons.includes('not_a_buff_candidate')).map(c=>c.exclusion_kind||'actual_beneficial_effect')),source_lines:r.candidates.filter(c=>c.needs_review_reasons.includes('not_a_buff_candidate')).map(c=>c.source_line)}));
  const missingValueAudit=rows.filter(r=>r.needs_review_reasons.includes('missing_value')).map(r=>({review_key:r.review_key,character:r.character,category:r.category,candidates:r.candidates.filter(c=>c.needs_review_reasons.includes('missing_value')).map(c=>({source_line:c.source_line,numeric_value_required:!/focuses fire|forcefully uses|proportionally shares|summons/i.test(c.source_line),recommended_unit:/proportionally shares|focuses fire|forcefully uses/i.test(c.source_line)?'boolean':null,numeric_tokens:c.numeric_tokens,semantic_kind:c.exclusion_kind||'beneficial_boolean_or_unknown'}))}));
  const durationAudit=rows.filter(r=>r.needs_review_reasons.includes('ambiguous_duration')).map(r=>({review_key:r.review_key,character:r.character,skill_slot:r.skill_slot,skill_name:r.skill_name,category:r.category,source_section:r.source_section,analysis:r.duration_analysis}));
  const triggerAudit=rows.filter(r=>r.needs_review_reasons.includes('ambiguous_trigger')).map(r=>({review_key:r.review_key,character:r.character,skill_slot:r.skill_slot,skill_name:r.skill_name,category:r.category,source_section:r.source_section,analysis:r.trigger_analysis}));
  const valueAudit=rows.filter(r=>r.needs_review_reasons.includes('ambiguous_value')).map(r=>({review_key:r.review_key,character:r.character,skill_slot:r.skill_slot,skill_name:r.skill_name,category:r.category,source_section:r.source_section,numeric_tokens:r.numeric_tokens}));
  const categories=Object.fromEntries(Object.keys(CATEGORY_META).map(k=>{
    const items=rows.filter(r=>r.category===k), causeMap=new Map();
    for(const item of items){if(!causeMap.has(item.cause_group))causeMap.set(item.cause_group,[]);causeMap.get(item.cause_group).push(item);}
    const cause_groups=[...causeMap].map(([cause_group,groupItems])=>({cause_group,review_section_count:groupItems.length,candidate_occurrence_count:groupItems.reduce((n,r)=>n+r.candidates.length,0),characters:unique(groupItems.map(r=>r.character)).sort((a,b)=>a.localeCompare(b,'en')),review_keys:groupItems.map(r=>r.review_key)})).sort((a,b)=>b.review_section_count-a.review_section_count||a.cause_group.localeCompare(b.cause_group,'en'));
    return [k,{title:CATEGORY_META[k].title,description:CATEGORY_META[k].description,review_section_count:items.length,candidate_occurrence_count:items.reduce((n,r)=>n+r.candidates.length,0),cause_groups,items}];
  }));
  const humanRows=rows.filter(r=>r.category==='D');
  const allBlocking=rows.flatMap(r=>r.candidates).filter(c=>c.needs_review_reasons.length);
  const report={
    audit_version:'1.0.0',parser_version:PARSER_VERSION,generated_at:new Date().toISOString(),read_only_audit:true,
    mutation_policy:{effects:false,review_decisions:false,manual_override:false,parser:false},
    input_hashes_before:beforeHashes,
    summary:{total_review_sections:rows.length,total_review_occurrences:rows.reduce((n,r)=>n+r.candidates.length,0),blocking_candidate_occurrences:allBlocking.length,A:categories.A.review_section_count,B:categories.B.review_section_count,C:categories.C.review_section_count,D:categories.D.review_section_count,normalized_pattern_count:new Set(allBlocking.map(c=>c.normalized_pattern)).size,human_judgement_required_character_count:new Set(humanRows.map(r=>r.character)).size},
    reason_counts:reasonCounts,categories,
    diagnostics:{special_mechanic:{review_section_count:specialRows.length,items:specialAudit},ambiguous_target:{review_section_count:targetGroups.reduce((n,g)=>n+g.review_sections,0),normalized_groups:targetGroups},ambiguous_value:{review_section_count:valueAudit.length,items:valueAudit},parser_failure:{review_section_count:parserFailureGroups.reduce((n,g)=>n+g.review_sections,0),groups:parserFailureGroups,items:rows.filter(r=>r.needs_review_reasons.includes('parser_failure')).map(r=>({review_key:r.review_key,character:r.character,skill_slot:r.skill_slot,skill_name:r.skill_name,category:r.category,explanations:r.parser_failure_explanations}))},ambiguous_trigger:{review_section_count:triggerAudit.length,items:triggerAudit},not_a_buff_candidate:{review_section_count:notBuffAudit.length,items:notBuffAudit},missing_value:{review_section_count:missingValueAudit.length,items:missingValueAudit},ambiguous_duration:{review_section_count:durationAudit.length,items:durationAudit}},
  };

  const mdLines=['# Review Audit v4.2 — Residual 141','',`Generated: ${report.generated_at}`,'',
    '> read-only監査です。effects、review decisions、manual_override、parserは変更していません。各Review節はA〜Dのいずれか1つにのみ割り当てています。','',
    '## Summary','',`- total review sections: ${report.summary.total_review_sections}`,`- total review occurrences: ${report.summary.total_review_occurrences}`,`- blocking candidate occurrences: ${report.summary.blocking_candidate_occurrences}`,`- A: ${report.summary.A}`,`- B: ${report.summary.B}`,`- C: ${report.summary.C}`,`- D: ${report.summary.D}`,`- normalized patterns: ${report.summary.normalized_pattern_count}`,`- human judgement required characters: ${report.summary.human_judgement_required_character_count}`,'',
    '### Reason counts','', '| Reason | Review sections | Candidate occurrences |','|---|---:|---:|',...reasonCounts.map(r=>`| ${r.reason} | ${r.review_sections} | ${r.candidate_occurrences} |`),''];
  for (const key of ['A','B','C','D']) {
    mdLines.push(`## ${CATEGORY_META[key].title}`,'',`${categories[key].review_section_count} review sections / ${categories[key].candidate_occurrence_count} candidate occurrences`,'');
    if(!categories[key].review_section_count) mdLines.push('該当なし。必須軸が完全に確定済みのまま古いflagだけ残る節は、今回の残差141件にはありませんでした。','');
    else mdLines.push('| Cause group | Sections | Candidates | Characters |','|---|---:|---:|---|',...categories[key].cause_groups.map(g=>`| ${md(g.cause_group)} | ${g.review_section_count} | ${g.candidate_occurrence_count} | ${md(g.characters.join(', '))} |`),'');
    categories[key].items.forEach((row,i)=>mdLines.push(markdownItem(row,i),''));
  }
  mdLines.push('## Focused diagnostics','',
    '### special_mechanic','',`- ${specialRows.length} review sections`,`- normal special / noncomparisonでreview不要: ${specialAudit.filter(x=>x.category==='C').length} sections`,`- parser rule候補: ${specialAudit.filter(x=>x.category==='A').length} sections`,`- human judgement: ${specialAudit.filter(x=>x.category==='D').length} sections`,'',
    '| Character | Skill | Category | Source line | Semantic type | Name | Target required | Value required | Standalone | Metadata-only |','|---|---|---|---|---|---|---|---|---|---|');
  for(const row of specialAudit) for(const c of row.candidates) mdLines.push(`| ${md(row.character)} | ${md(`${row.skill_slot} / ${row.skill_name}`)} | ${row.category} | ${md(c.source_line)} | ${md(c.semantic_special_type)} | ${md(c.state_resource_or_parameter_name)} | ${c.target_required} | ${c.numeric_value_required} | ${c.standalone_effect} | ${c.metadata_only} |`);
  mdLines.push('','### ambiguous_target normalized groups','', '| Pattern | Sections | Characters | Proposed target fields |','|---|---:|---|---|',...targetGroups.map(g=>`| ${md(g.normalized_pattern)} | ${g.review_sections} | ${md(g.characters.join(', '))} | ${md(JSON.stringify(g.structured_target))} |`),'',
    '### ambiguous_value numeric roles','');
  for(const row of valueAudit){mdLines.push(`#### ${row.character} — ${row.skill_slot} / ${row.skill_name}`,'','| Raw | Role | Context |','|---|---|---|',...row.numeric_tokens.map(n=>`| ${md(n.raw)} | ${md(n.role)} | ${md(n.context)} |`),'');}
  mdLines.push('### parser_failure grammar groups','', '| Grammar failure | Sections | Characters |','|---|---:|---|',...parserFailureGroups.map(g=>`| ${md(g.normalized_pattern)} | ${g.review_sections} | ${md(g.characters.join(', '))} |`),'',
    '### ambiguous_trigger','', '| Character | Skill | Category | Distinction | Source trigger |','|---|---|---|---|---|',...triggerAudit.map(x=>`| ${md(x.character)} | ${md(`${x.skill_slot} / ${x.skill_name}`)} | ${x.category} | ${md(x.analysis.kind)} | ${md(x.analysis.source_trigger)} |`),'',
    '### not_a_buff_candidate','', '| Character | Category | Classification | Source line |','|---|---|---|---|',...notBuffAudit.map(x=>`| ${md(x.character)} | ${x.category} | ${md(x.classification.join(' + '))} | ${md(x.source_lines.join(' / '))} |`),'',
    '### missing_value','', '| Character | Category | Source line | Numeric required | Suggested unit |','|---|---|---|---|---|');
  for(const row of missingValueAudit) for(const c of row.candidates) mdLines.push(`| ${md(row.character)} | ${row.category} | ${md(c.source_line)} | ${c.numeric_value_required} | ${md(c.recommended_unit)} |`);
  mdLines.push('','### ambiguous_duration','', '| Character | Skill | Category | Kind | Resolution |','|---|---|---|---|---|',...durationAudit.map(x=>`| ${md(x.character)} | ${md(`${x.skill_slot} / ${x.skill_name}`)} | ${x.category} | ${md(x.analysis.kind)} | ${md(x.analysis.resolution)} |`),'',
    '## Final totals','',`- total review sections: ${rows.length}`,`- total review occurrences: ${report.summary.total_review_occurrences}`,`- A: ${report.summary.A}`,`- B: ${report.summary.B}`,`- C: ${report.summary.C}`,`- D: ${report.summary.D}`,`- normalized pattern count: ${report.summary.normalized_pattern_count}`,`- human judgement required character count: ${report.summary.human_judgement_required_character_count}`,'');

  await writeFile(JSON_OUTPUT,JSON.stringify(report,null,2)+'\n');
  await writeFile(MD_OUTPUT,mdLines.join('\n'));
  const afterRaw=Object.fromEntries(await Promise.all(paths.map(async p=>[p,await readFile(p,'utf8')])));
  const afterHashes=Object.fromEntries(paths.map(p=>[p,sha256(afterRaw[p])]));
  const unchanged=paths.every(p=>beforeHashes[p]===afterHashes[p]);
  if (!unchanged) throw new Error('Read-only invariant failed: an input file changed');
  report.input_hashes_after=afterHashes;
  report.input_hashes_unchanged=true;
  await writeFile(JSON_OUTPUT,JSON.stringify(report,null,2)+'\n');
  return report;
}

if (process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href) {
  const r=await auditResidual();
  console.log(JSON.stringify({outputs:[JSON_OUTPUT,MD_OUTPUT],summary:r.summary,reason_counts:r.reason_counts,input_hashes_unchanged:r.input_hashes_unchanged},null,2));
}

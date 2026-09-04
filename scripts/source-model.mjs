import {cleanText,parseEffectLine,targetType,normalizeEffectAxes} from './effect-grammar.mjs';
import {parseSkillHierarchy,HIERARCHY_VERSION} from './skill-hierarchy.mjs';
// The public data endpoint used by NIKKE.GG's character pages (not a game API).
export const SOURCE_URL = 'https://api.dotgg.gg/cgfw/getgacha?game=nikke&type=characters';
export const SOURCE_PAGE = 'https://nikke.gg/characters/';
export const PARSER_VERSION = HIERARCHY_VERSION;
export const SLOTS = ['Skill 1','Skill 2','Burst'];
export {cleanText,parseEffectLine,targetType} from './effect-grammar.mjs';
export function levelTen(skill) {
  if (!skill || !Array.isArray(skill.levels) || skill.levels.length !== 10 || !skill.levels[9]) return null;
  const values = skill.levels[9];
  let missing = false;
  const html = String(skill.description || '').replace(/\{([^}]+)\}/g,(match,key) => {
    if (!['string','number'].includes(typeof values[key]) || String(values[key]).trim()==='' || typeof values[key]==='number'&&!Number.isFinite(values[key])) { missing=true; return match; }
    return String(values[key]);
  });
  return missing || /\{[^}]+\}/.test(html) || !cleanText(html).replace(/[■\s]/g,'') ? null : {html,text:cleanText(html)};
}
export function normalizeCharacter(source, overrides = {}) {
  const texts = (source.skills || []).map(s=>levelTen(s)?.text || '').join('\n');
  const stages = new Set(/^[123]$/.test(source.burst) ? [+source.burst] : []);
  // Explicit stage declarations, not an assumption that every "p" means I/II/III.
  for (const m of texts.matchAll(/(?:When used in Burst Stage|Changes to Burst Stage)\s+([123])/gi)) stages.add(+m[1]);
  const character = {
    character_id:`nikke-${source.id}`, character_name:source.name,
    manufacturer:source.manufacturer || null, burst_stage:[...stages].sort(),
    element:source.element || null, weapon_type:source.weapon || null,
    class:source.class || null, rarity:source.rarity || null,
    release_order:null, release_date:null, availability:null, limited:null, collab:null, alt_character:null,
    nikke_gg_url:`https://nikke.gg/characters/${source.slug}/`,
    source_id:String(source.id), source_url:SOURCE_URL, source_visible:source.visible === 1,
    ...overrides
  };
  const fields = ['manufacturer','element','weapon_type','class','rarity','release_date'];
  character.review_fields = fields.filter(k=>!character[k]);
  if (!character.burst_stage.length) character.review_fields.push('burst_stage');
  character.needs_review = character.review_fields.length > 0;
  return character;
}

export function extractCharacter(source, character) {
  const effects=[], reviews=[], snapshots=[],hierarchies=[],nonBuffEffects=[];
  for (const [index,skill] of (source.skills || []).entries()) {
    if(!skill)continue;
    const slot=skill.skill_slot||SLOTS[index];
    const decoded=levelTen(skill);
    const key=`${character.character_id}:${skill.id}`;
    const common={character_id:character.character_id,character_name:character.character_name,skill_slot:slot,
      skill_name:skill.name,skill_level:10,source_url:skill.source_url||character.nikke_gg_url,
      source_type:skill.source_type||'nikke_gg',source_checked_at:skill.source_checked_at||null,
      source_conflict:Boolean(skill.source_conflict),source_api_url:skill.source_type==='nikke_explorer'?character.nikke_explorer_url:SOURCE_URL,source_skill_id:String(skill.id)};
    snapshots.push({...common,text:decoded?.text || '',description_template:skill.description,level_10_values:skill.levels?.[9] || null,needs_review:!decoded});
    const review=(reason,text,block) => reviews.push({...common,review_id:`${key}:${block}`,reason,source_text:text,needs_review:true});
    if (!decoded || !slot) { review('Lv.10データまたはスキル枠を確定できません',skill.description,'skill'); continue; }
    const hierarchy=parseSkillHierarchy({...common,text:decoded.text,cooldown:skill.cooldown});hierarchies.push(hierarchy);
    const blocks=decoded.html.split('■').slice(1);
    let earlierTrigger=false;
    for (const [blockIndex,block] of blocks.entries()) {
      const section=hierarchy.sections[blockIndex];
      if(section?.structured||section?.reviewed){
        const children=section.groups.flatMap(g=>g.children);
        for(const c of children){
          const record={...common,...c.effect,notes:c.effect.notes||'',effect_id:`auto:${key}:${blockIndex}:g${c.effect.parent_group_index}-c${c.child_index}`,
            source_text:section.source_text,source_skill_text:decoded.text,needs_review:false,validation_status:'rule_matched',parser_version:PARSER_VERSION};
          if(c.comparison_eligible)effects.push(record);
          else if(!['buff','heal','revive'].includes(c.effect.effect_type))nonBuffEffects.push({...record,needs_review:c.effect.needs_review_reasons.length>0,comparison_excluded:true});
        }
        if(children.some(c=>c.effect.needs_review_reasons.length)||!children.length)reviews.push({...common,review_id:`${key}:${blockIndex}`,
          reason:'階層解析：子効果・親の条件に未確定項目があります（確定したバフのみ比較に反映）',source_text:section.source_text,
          source_skill_text:decoded.text,hierarchy_section:section,needs_review:true});
        earlierTrigger ||= Boolean(section.trigger&&section.trigger!=='Burst Skill activation');
        continue;
      }
      const colorIndex=block.indexOf('<color=');
      const heading=cleanText(block.slice(0,colorIndex));
      const body=cleanText(block.slice(colorIndex));
      const text=cleanText(block);
      if (colorIndex<0) { review('スキル本文の構造が未対応',text,blockIndex); continue; }
      const targets=[...heading.matchAll(/Affects (.+?)(?:\n|$)/gi)];
      const target=targets[0]?.[1]?.trim();
      const type=target && targetType(target);
      const hasActivation=/Activates/i.test(heading);
      const inherited=!hasActivation && earlierTrigger;
      earlierTrigger ||= hasActivation;
      // Entire plain enemy-only damage sections are out of buff scope.
      if (!type && /Affects (?:all enemies|enemies|(?:the )?\d+ enemy|the (?:same )?enemy|the target)/i.test(heading) && !/Taunt|affects? (?:self|allies)/i.test(body)) continue;
      if (targets.length!==1 || !type || inherited || /Activates.*Activates/is.test(heading)) { review('対象・条件の引き継ぎを手動確認',text,blockIndex); continue; }
      const lines=body.split('\n').map(s=>s.trim()).filter(Boolean);
      const tiered=/Effects vary according to the number of times (?:entered|used)\./i.test(body)&&/Each subsequent effect triggers all effects before it/i.test(body);
      const contextLines=tiered?lines.filter(l=>! /^(Once|Twice|Three times):/.test(l)):[];
      const effectLines=tiered?lines.filter(l=>/^(Once|Twice|Three times):/.test(l)):lines;
      const parsed=effectLines.map(line=>{
        const tier=tiered?line.match(/^(Once|Twice|Three times): (.*)$/):null;
        const parsed=parseEffectLine(tier?tier[2]:line);
        return parsed&&{...parsed,tier_condition:tier?[...contextLines,tier[1]].join(' '):''};
      });
      if (!parsed.length || parsed.some(v=>!v)) { review('未対応の効果・条件・単位を含む節（推測しない）',text,blockIndex); continue; }
      const trigger=heading.replace(/Affects .+$/is,'').trim() || (slot==='Burst' ? 'Burst Skill使用時' : skill.cooldown ? `${slot}使用時（${skill.cooldown} sec cooldown）` : '');
      if (!trigger) { review('発動タイミングを確定できません',text,blockIndex); continue; }
      for (const [lineIndex,p] of parsed.entries()) {
        const record={...common,...p,effect_id:`auto:${key}:${blockIndex}:${lineIndex}`,target,target_type:type,trigger,
        parent_effect_name:null,parent_effect_type:null,parent_effect_description:null,parent_trigger:trigger,parent_end_condition:null,
        effect_index:null,source_section_index:blockIndex,duration_type:p.duration==='継続'?'continuous':p.duration==='Instant'?'instant':'fixed',end_condition:null,
        condition:[hasActivation || !['self','all_allies'].includes(type) ? heading : '',p.tier_condition].filter(Boolean).join(' '),
        notes:p.notes || '',source_text:text,source_skill_text:decoded.text,
        needs_review:Boolean(skill.source_conflict),validation_status:'rule_matched',parser_version:PARSER_VERSION};
        if(['buff','heal','revive'].includes(p.effect_type||'buff'))effects.push(record);
        else nonBuffEffects.push({...record,comparison_excluded:true});
      }
    }
  }
  return {effects,reviews,snapshots,hierarchies,nonBuffEffects};
}

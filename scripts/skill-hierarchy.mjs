import {cleanText,parseEffectLine,targetType,knownStatName} from './effect-grammar.mjs';
import {reviewedRuleForLine,isFollowupUnknownLabel} from './reclassification-rules.mjs';

export const HIERARCHY_VERSION='4.2.0';
const number='(\\d+(?:\\.\\d+)?)';
const unique=values=>[...new Set(values.filter(Boolean))];
const activation=text=>text.match(/(?:Only )?Activates\b[^\n]*?(?=\.\s*(?:Affects|$)|$)/i)?.[0]?.replace(/\.$/,'')||null;
function targetIn(text){return text.match(/Affects (.+?)(?=\.\s*(?:Activates|Only activates|$)|$)/i)?.[1]?.replace(/\.$/,'')||null;}
const enemyTarget=text=>/\b(?:enemy|enemies|target)\b/i.test(text||'')&&!/\b(?:self|allies|ally)\b/i.test(text||'');
function reviewedDurationForNonBuff(text){
  const fixed=text.match(/(?:for|lasts for) (\d+(?:\.\d+)?) (sec|rounds?|shots?)\b/i);
  if(fixed)return `${fixed[1]} ${fixed[2]}`;
  if(/continuously|This effect is continuous/i.test(text))return '継続';
  return 'Instant';
}
function durationContext(text){
  const hp=text.match(new RegExp("(?:removed|ends?|deactivates?) when (?:this unit's |the unit's |its )?HP (?:drops|falls) to "+number+"% or (below|above)",'i'));
  const removed=text.match(/(?:removed|ends?|deactivates?) (?:when|upon|once) (.+?)(?:\.(?:\s|$)|$)/i);
  const deactivation=text.match(/Deactivation condition:\s*([^\n]+)/i);
  const until=text.match(/(?:lasts? |active )?until ([^.]+)\.?/i);
  const end=hp?`HP ${hp[2].toLowerCase()==='below'?'<=':'>='} ${hp[1]}%`:deactivation?.[1]||removed?.[1]||until?.[1]||null;
  const seconds=text.match(new RegExp('(?:Duration:|lasts for|lasts|remains active for)\\s*'+number+' sec','i'));
  const fullBurst=/during Full Burst|while Full Burst is active/i.test(text);
  const removable=/cannot be removed/i.test(text)?false:null;
  if(end)return {duration:seconds?`${seconds[1]} sec / until ${end}`:`Until ${end}`,duration_value:seconds?+seconds[1]:null,duration_unit:'until_condition',duration_type:'conditional',end_condition:end,removable};
  if(fullBurst)return {duration:'During Full Burst',duration_value:null,duration_unit:'full_burst',duration_type:'conditional',end_condition:'Full Burst ends',removable};
  if(seconds)return {duration:`${seconds[1]} sec`,duration_value:+seconds[1],duration_unit:'seconds',duration_type:'fixed',end_condition:null,removable};
  if(/This effect is continuous\.|continuously\./i.test(text))return {duration:'継続',duration_value:null,duration_unit:'continuous',duration_type:'continuous',end_condition:null,removable};
  return {duration:null,duration_value:null,duration_unit:null,duration_type:'unknown',end_condition:null,removable};
}

function targetMetadata(target=''){
  target=String(target||'');
  const count=target.match(/(?:the )?(\d+) (?:random |leftmost |rightmost )?.*?ally unit/i);
  const element=target.match(/\b(Fire|Water|Wind|Electric|Iron) (?:Code )?ally/i);
  const weapon=target.match(/\b(sniper rifles|shotguns|assault rifles|submachine guns|machine guns|rocket launchers)\b/i);
  return {
    target_count:count?+count[1]:null,
    target_selection:/\brandom\b/i.test(target)?'random':/\bleftmost\b/i.test(target)?'leftmost':/\brightmost\b/i.test(target)?'rightmost':/member who initiated Sing Along/i.test(target)?'sing_along_initiator':null,
    target_condition:/with debuffs/i.test(target)?'has_debuff':null,
    target_element:element?element[1][0].toUpperCase()+element[1].slice(1).toLowerCase():null,
    target_weapon:weapon?weapon[1].toLowerCase().replace(/s$/,'').replace(/ /g,'_'):null
  };
}
function inferredDuration(duration){
  return duration==='継続'?'continuous':duration==='Instant'?'instant':/\d.*sec/.test(duration||'')?'fixed':/\d.*(?:shot|round)/.test(duration||'')?'counted':'unknown';
}
function classifyChild(text,target,reviewedRule=null){
  const parsed=parseEffectLine(text,{reviewedRule});
  if(parsed?.effect_type)return parsed.effect_type;
  const enemy=enemyTarget(target);
  if(reviewedRule){
    if(['new_buff_type','existing_buff_type'].includes(reviewedRule.classification))return enemy?'debuff':'buff';
    if(reviewedRule.classification==='resource')return reviewedRule.resource_change?'resource_change':'resource';
    if(reviewedRule.classification==='special_mechanic')return 'special_mechanic';
    if(reviewedRule.classification==='penalty')return 'penalty';
    if(reviewedRule.classification==='debuff')return enemy?'debuff':'special_mechanic';
  }
  if(/^Current HP ▼ \d+(?:\.\d+)?%(?: every second)?(?: for \d+(?:\.\d+)? sec)?\.$/i.test(text))return 'cost_or_penalty';
  if(/^(?:Deals? )\d+(?:\.\d+)?% of (?:final )?ATK as (?:[\w -]+ )?damage\b/i.test(text)||/^(?:Full Charge )?Damage:/i.test(text))return 'damage';
  if(/^Revives? /i.test(text))return 'revive';
  if(/^(?:Restores? |Recovers? )/i.test(text))return 'heal';
  if(enemy&&/^[\w :()-]+ [▲▼] \d/.test(text))return 'debuff';
  if(/^(?:Creates? a shield|(?:Attract: )?Taunts?|Stuns?|Removes? |Crafts? |Changes? (?:the|thes) weapon|Charge [Tt]ime:|Max Ammunition Capacity:)/i.test(text))return 'special';
  if(/^(?:Normal Attack Damage Multiplier|Attack Interval|Charge time is fixed)/i.test(text))return 'special';
  if(/^(?:ATK|DEF|Max HP|Charge Speed|Charge Damage|Critical Rate|Critical Damage|Hit Rate) ▼/.test(text))return 'cost_or_penalty';
  if(/^Damage Taken ▲/.test(text)&&!enemy)return 'cost_or_penalty';
  if(/^Cooldown of Burst Skill ▲/.test(text)&&!enemy)return 'cost_or_penalty';
  return parseEffectLine(text)||/[▲▼]|\b(?:gain|increase|unlimited|immune|indomitability|pierce|invulnerable|reload|shares)\b/i.test(text)?'buff':'special';
}
function candidateLabel(text){
  const arrow=text.match(/^(.+?)\s+[▲▼]\s*\d/);
  if(arrow&&/^(?:Cooldown of Burst Skill)$/i.test(arrow[1]))return null;
  if(arrow&&!knownStatName(arrow[1]))return arrow[1];
  if(/distributed damage/i.test(text))return 'Distributed Damage';
  if(/unlimited ammunition/i.test(text))return 'Unlimited Ammunition';
  if(/ammo reload/i.test(text))return 'Ammo Reload';
  if(/equally shares (?:HP recovery|damage taken)/i.test(text))return text.match(/equally shares (?:HP recovery|damage taken)/i)[0];
  if(/\b(?:gain|gains) /i.test(text)){
    const name=text.replace(/^Gains? /i,'').split(/ for | continuously|\./)[0];
    return /^(?:Pierce|Invulnerable)$/i.test(name)?null:name;
  }
  return null;
}
function splitCompoundChildren(children){
  const starts=/(?=(?:Restores?|Recovers?|Removes?|Re-enters?|Reloads?|Gains?|Grants?|Expands?|Increases? the stack count|Skill \d+'s requirement|Charges? (?:battery|Extrasensory)|Normal attacks deal true damage|Pellet count is fixed|Cooldown of Burst Skill|[A-Za-z][A-Za-z ()'-]{0,60}\s+[▲▼])\b)/i;
  return children.flatMap(original=>{
    let body=original.text,prefix='';
    const stackImmunity=body.match(/^(.+?, stacks up to \d+ time\(s\)) and immune to stack count increase or decrease effects continuously\. This effect cannot be removed\.$/i);
    if(stackImmunity)return [
      {...original,text:stackImmunity[1]+' continuously.',effect_index:original.effect_index},
      {...original,text:'Immune to stack count increase or decrease effects continuously. This effect cannot be removed.',effect_index:null}
    ];
    if(/^Reload time is fixed at .+\. Removed upon firing the last bullet\.$/i.test(body))return [original];
    for(let pass=0;pass<2;pass++){
      const control=body.match(/^(Affects [^.]+|(?:Only )?Activates [^.]+)\.\s+(.+)$/i);
      if(!control)break;prefix+=(prefix?'. ':'')+control[1];body=control[2];
    }
    const clauses=body.split(/(?<=\.)\s+/).reduce((out,part)=>{
      if(!out.length||starts.test(part))out.push(part);else out[out.length-1]+=' '+part;
      return out;
    },[]);
    return clauses.map((text,index)=>({...original,effect_index:index?null:original.effect_index,
      child_index:0,text:index?text:`${prefix}${prefix?'. ':''}${text}`}));
  }).map((c,index)=>({...c,child_index:index}));
}

// Section/parent boundaries are identified before child numbers. No character-specific rules.
export function parseSkillHierarchy(snapshot){
  const text=cleanText(snapshot.text),rawChunks=text.split('■'),rawPreamble=rawChunks.shift().trim();
  const firstStage=rawPreamble.match(/When used in Burst Stage\s+([123])(?::[^\n]*)?/i);
  const preamble=rawPreamble.replace(/When used in Burst Stage\s+[123](?::[^\n]*)?/gi,'').trim();
  let activeBurstStage=firstStage?+firstStage[1]:null;
  const chunkRows=rawChunks.map(raw=>{
    const markers=[...raw.matchAll(/(?:^|\n)When used in Burst Stage\s+([123])(?::[^\n]*)?/gi)];
    const next=markers.length?+markers.at(-1)[1]:null;
    const cleaned=raw.replace(/(?:^|\n)When used in Burst Stage\s+[123](?::[^\n]*)?/gi,'').trim();
    const row={raw:cleaned,burst_stage:activeBurstStage};
    if(next)activeBurstStage=next;
    return row;
  });
  let earlierTrigger=null;
  const sections=chunkRows.map(({raw,burst_stage},section_index)=>{
    const lines=raw.trim().split('\n').map(s=>s.trim()).filter(Boolean);let heading=lines.shift()||'';
    const inlineHeading=heading.match(/^((?:(?:Only )?Activates [^.]+\.\s+)?Affects [^.]+\.)\s+(.+)$/i);
    if(inlineHeading){heading=inlineHeading[1];lines.unshift(inlineHeading[2]);}
    const sectionTarget=targetIn(heading),ownTrigger=activation(heading);
    const trigger=ownTrigger||(snapshot.skill_slot==='Burst'?'Burst Skill activation':null);
    const crossSection=Boolean(!ownTrigger&&earlierTrigger&&snapshot.skill_slot!=='Burst');
    earlierTrigger=ownTrigger||earlierTrigger;
    const section_condition=burst_stage?{burst_stage}:null;
    const section={section_index,source_text:raw.trim(),heading,target:sectionTarget,target_type:targetType((sectionTarget||'')+'.'),trigger,section_condition,weapon_state:/Changes? (?:the|thes) weapon/i.test(raw),
      context_unresolved:Boolean(preamble||crossSection),context_lines:[],groups:[],structured:Boolean(section_condition)};
    let group;
    const newGroup=(name=null,type=null)=>{
      group={group_index:section.groups.length,parent_effect_name:name,parent_effect_type:type,function_text:'',description_lines:[],children:[],target:sectionTarget,trigger,effect_targets:{}};
      section.groups.push(group);return group;
    };
    newGroup();
    let stage=null,stageTarget=null,stageCondition=null,additional=false,inlineGroup=false,additionalTarget=null;
    for(let i=0;i<lines.length;i++){
      let line=lines[i],childNamedParent=null;
      if(inlineGroup&&!/^Effect \d:|^Function:/i.test(line)){newGroup();inlineGroup=false;}
      if(/^(?:Function|Ability):/i.test(line)||/^Effect:\s*Launches attachable projectiles/i.test(line)){
        section.structured=true;inlineGroup=false;group.function_text+=[group.function_text?'\n':'',line.replace(/^Function:\s*/i,'')].join('');
        // HTML/plain-text wrapping does not turn the rest of Function into child effects.
        while(i+1<lines.length&&!/^(?:Effect(?: \d+)?:|Function:|Duration:|Removal Condition:|Deactivation condition:|Additional Effect|Required hit count:|Triggers |■)/i.test(lines[i+1])&&
          /[.!?]$/.test(lines[i+1])&&!/[▲▼]/.test(lines[i+1]))group.function_text+='\n'+lines[++i];
        continue;
      }
      if(/^(?:Duration:|Removal Condition:|Deactivation condition:)/i.test(line)){
        section.structured=true;group.description_lines.push(line);continue;
      }
      const effectTarget=line.match(/^Effect (\d+) Targets:\s*(.+)$/i);
      if(effectTarget){section.structured=true;group.effect_targets[+effectTarget[1]]=effectTarget[2].replace(/\.$/,'');group.description_lines.push(line);continue;}
      if(/Effects? var(?:y|ies)|Each subsequent|Only one (?:set of )?effect|Advances to the next/i.test(line)){
        section.structured=true;section.context_lines.push(line);continue;
      }
      if(/^If .+:$/i.test(line)){
        section.structured=true;
        if(group.children.length||group.parent_effect_name)newGroup();
        group.description_lines.push(line);
        continue;
      }
      if(/^Additional Effects?:?$/i.test(line)){section.structured=true;additional=true;continue;}
      const explicitTarget=line.match(/^Target:\s*(?:Affects )?(.+?)\.?$/i);
      if(explicitTarget){
        section.structured=true;additionalTarget=explicitTarget[1].replace(/\.$/,'');
        // A Target line starts a new sub-section. It must not inherit the target of
        // an earlier damage child in the same top-level Affects section.
        if(group.children.length)newGroup(group.parent_effect_name,group.parent_effect_type);
        group.target=additionalTarget;group.description_lines.push(line);continue;
      }
      if(/^(?:Affects |(?:Only )?Activates )/.test(line)&&!/[▲▼]|Effect \d/.test(line)){
        // An unnumbered control line updates the enclosing group, not preceding children.
        if(group.children.length)newGroup(group.parent_effect_name,group.parent_effect_type);
        group.target=targetIn(line)||group.target;group.trigger=activation(line)||group.trigger;group.description_lines.push(line);continue;
      }
      const tier=line.match(/^((?:Stage \d+(?: or (?:below|above))?|Once|Twice|(?:One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten) times|\d+ attacks landed):)\s*(.*)$/i);
      if(tier){
        section.structured=true;stage=tier[1];line=tier[2];stageTarget=null;stageCondition=null;
        const countWord={One:1,Two:2,Three:3,Four:4,Five:5,Six:6,Seven:7,Eight:8,Nine:9,Ten:10}[stage.split(/\s/)[0]];
        if(countWord)stageCondition={attack_count:countWord};
        const stageNumber=stage.match(/^Stage (\d+)/i);if(stageNumber)stageCondition={...(stageCondition||{}),stage:+stageNumber[1]};
        if(/^Affects /i.test(line)){stageTarget=targetIn(line);continue;}
        const state=line.match(/^When in (.+?) state,?$/i);if(state){stageCondition={...(stageCondition||{}),state:state[1]};continue;}
        if(/^(?:Only )?Activates .+Affects /i.test(line)){stageTarget=targetIn(line);stageCondition={...(stageCondition||{}),activation:activation(line)};continue;}
        if(/,$/.test(line)){stageCondition={...(stageCondition||{}),condition:line.replace(/,$/,'')};stage+=' '+line;continue;}
        if(/^If .*[,]$/.test(line)){stage+=' '+line;continue;}if(!line)continue;
      }
      if(tier&&/^While .*[,]$/.test(line)){stage+=' '+line;continue;}
      const numbered=line.match(/^Effect (\d+):\s*(.*)$/i);
      if(numbered){section.structured=true;line=numbered[2];}
      const wrapper=line.match(/^(?:Additional Effect|Effect):\s*(.+)$/i);if(wrapper){section.structured=true;additional=/^Additional/i.test(line);line=wrapper[1];}
      const conditionalWrapper=line.match(/^Additional effect (?:for|of) (.+?):\s*(.+)$/i);
      if(conditionalWrapper){section.structured=true;stage='Requires '+conditionalWrapper[1];line=conditionalWrapper[2];}
      const preParsed=parseEffectLine(line,{parentEffectName:group.parent_effect_name});
      if(!numbered&&!tier&&preParsed?.special_type==='state_duration'){
        section.structured=true;newGroup(preParsed.state_name,'named_effect');group.description_lines.push(lines[i]);
        group.children.push({effect_index:null,child_index:0,source_line:lines[i],text:line,tier_condition:null,tier_target:null,tier_section_condition:null,additional_effect:false});
        continue;
      }
      const parentState=line.match(/^(.{1,90}?):\s*This effect is continuous and cannot be removed\.$/i);
      if(parentState){section.structured=true;newGroup(parentState[1],/\bmode\b/i.test(parentState[1])?'mode':'named_effect');group.description_lines.push('This effect is continuous and cannot be removed.');continue;}
      const parentStateParen=line.match(/^(.{1,90}?) \(Cannot be removed\)$/i);
      if(parentStateParen){section.structured=true;newGroup(parentStateParen[1],'named_effect');group.description_lines.push('Cannot be removed.');continue;}
      const namedHeading=line.match(/^([\w][\w '()!?,.-]{0,90}):\s*$/);
      if(namedHeading){section.structured=true;newGroup(namedHeading[1],/\bmode\b/i.test(namedHeading[1])?'mode':'named_effect');continue;}
      const inline=line.match(/^([\w][\w '()-]*?):\s*(.+)$/);
      const reserved=/^(?:Charge time|Damage|Full Charge Damage|Max Ammunition Capacity|Cooldown|Duration|Attack Interval|Fire Rate|Normal Attack Damage Multiplier)$/i;
      if(!numbered&&!tier&&inline&&!reserved.test(inline[1])&&!['special_mechanic','resource','weapon_state'].includes(preParsed?.effect_type)){
        const inheritedTarget=group.children.length?sectionTarget:group.target,inheritedTrigger=group.children.length?trigger:group.trigger;
        section.structured=true;newGroup(inline[1],/\bmode\b/i.test(inline[1])?'mode':/status/i.test(inline[1])?'status':'named_effect');
        group.target=inheritedTarget;group.trigger=inheritedTrigger;
        if(additional&&additionalTarget)group.target=additionalTarget;
        line=inline[2];additional=false;inlineGroup=true;
      }else if(tier&&inline&&!reserved.test(inline[1])){
        section.structured=true;newGroup(inline[1],'named_effect');if(additional&&additionalTarget)group.target=additionalTarget;line=inline[2];inlineGroup=true;
      }else if(numbered&&inline&&!reserved.test(inline[1])&&parseEffectLine(inline[2],{parentEffectName:inline[1]})){
        childNamedParent=inline[1];line=inline[2];
      }else if(!numbered&&!tier&&!inline&&!preParsed&&/^[\w][\w '()!?,.-]{0,90}$/.test(line)&&/^(?:Function|Ability):|^Effect(?: \d+)?:/i.test(lines[i+1]||'')){
        section.structured=true;newGroup(line,/\bmode\b/i.test(line)?'mode':/status/i.test(line)?'status':'named_effect');additional=false;continue;
      }
      if(/Changes? (?:the|thes) weapon/i.test(line)){section.structured=true;section.weapon_state=true;group.parent_effect_type=group.parent_effect_type||'weapon_change';group.description_lines.push(line);}
      if(/^Only one Assigned Part is applied according to .+ current status\.$/i.test(line)){section.structured=true;section.context_lines.push(line);continue;}
      group.children.push({effect_index:numbered?+numbered[1]:null,child_index:group.children.length,source_line:lines[i],text:line,named_parent:childNamedParent,tier_condition:stage,tier_target:stageTarget,tier_section_condition:stageCondition,additional_effect:additional});
    }
    section.groups=section.groups.filter(g=>g.children.length||g.function_text||g.parent_effect_name);
    for(const g of section.groups){
      g.children=splitCompoundChildren(g.children);
      g.parent_effect_description=[...section.context_lines,g.function_text,...g.description_lines].filter(Boolean).join('\n');
      const d=durationContext(g.parent_effect_description);
      g.duration=d.duration;g.duration_type=d.duration_type;g.end_condition=d.end_condition;
      if(!g.trigger){const match=g.function_text.match(/^Gains a buff (when [^.]+)\.$/i);if(match)g.trigger='Activates '+match[1];}
      const relation=/\b(?:copies|copy|mirrors?|conversion|converts?|proportion|multiplied|x the number|according to|each subsequent|stack)\b/i.test(g.parent_effect_description);
      const unresolvedFunction=Boolean(g.function_text&&(/\b(?:if|unless|until|only|when|stack|copies|conversion|removed|deactivates|conditions)\b/i.test(g.function_text))&&!d.end_condition&&!/^Gains a buff when [^.]+\.$/i.test(g.function_text));
      const indices=g.children.map(c=>c.effect_index).filter(n=>n!==null),duplicates=new Set(indices).size!==indices.length;
      for(const c of g.children){
        let body=c.text,childTarget=null,childTrigger=null;
        // Child-local clauses never leak into siblings.
        for(let pass=0;pass<2;pass++){
          const control=body.match(/^(Affects [^.]+|(?:Only )?Activates [^.]+)\.\s+(.+)$/i);
          if(!control)break;
          childTarget=targetIn(control[1])||childTarget;childTrigger=activation(control[1])||childTrigger;body=control[2];
        }
        const reviewedRule=reviewedRuleForLine(body,g.parent_effect_name),localDuration=durationContext(body),inherited=localDuration.duration?localDuration:d;
        const target=childTarget||g.effect_targets[c.effect_index]||c.tier_target||g.target,type=targetType((target||'')+'.');
        const parsed=parseEffectLine(body,{inheritedDuration:inherited,reviewedRule,parentEffectName:g.parent_effect_name});
        let effectType=parsed?.effect_type||classifyChild(body,target,reviewedRule);
        effectType=effectType==='cost_or_penalty'?'penalty':effectType==='resource_change'?'resource':effectType==='special'?'special_mechanic':effectType;
        if((g.parent_effect_type==='weapon_change'||section.weapon_state)&&(/^(?:Charge Time|Damage|Full Charge Damage|Max Ammunition Capacity|Additional Effect)/i.test(c.source_line)||['charge_time','pierce','pierce_range','max_ammo'].includes(parsed?.buff_type)))effectType='weapon_state';
        const trigger=childTrigger||g.trigger||(!section.context_unresolved&&parsed?.duration==='継続'?'Continuous (source: continuously)':null);
        const reasons=[];
        // A reviewed damage label can also appear as a direct attack sentence.
        // It is known non-buff content, not a remaining unknown buff candidate.
        const knownDirectDamage=effectType!=='buff'&&/distributed damage/i.test(body);
        const label=parsed||reviewedRule||knownDirectDamage||['cost_or_penalty','penalty'].includes(effectType)?null:candidateLabel(body);
        if(['buff','heal','revive'].includes(effectType)){
          if(!parsed){
            if(label)reasons.push('unknown_buff_type');
            else if(/\b(?:x|mirrors?|copies|proportion|stack)\b/i.test(body))reasons.push('special_mechanic','ambiguous_value');
            else if(!/(?:for \d|continuously)/i.test(body)&&!inherited.duration)reasons.push('ambiguous_duration');
            else reasons.push('parser_failure');
          }
          if(!type)reasons.push('ambiguous_target');
          if(!trigger||section.context_unresolved)reasons.push('ambiguous_trigger');
          if(unresolvedFunction||relation&&/\b(?:copies|copy|mirrors?|conversion|converts?|proportion|multiplied|x the number|stack)\b/i.test(body)&&!c.tier_condition&&!parsed?.scaling_type||/\bx (?:the )?number\b/i.test(body)&&!parsed?.scaling_type)reasons.push('special_mechanic');
          if(/\bx (?:the )?number\b/i.test(body)&&!parsed?.scaling_type)parsed.max_raw_value=null;
          if(c.tier_condition&&!section.context_lines.length&&!/Requires |If |While /.test(c.tier_condition))reasons.push('ambiguous_trigger');
          if(duplicates)reasons.push('parser_failure');
          if(snapshot.source_conflict)reasons.push('ambiguous_value');
          for(const reason of parsed?._needs_review_reasons||[])reasons.push(reason);
        }else if(effectType==='special_mechanic'&&!parsed&&!/^(?:Changes? (?:the|thes) weapon|Charge [Tt]ime:|Max Ammunition Capacity:|(?:Attract: )?Taunts?|Stuns?|Creates? a shield|Removes? |Crafts? )/i.test(body))reasons.push('special_mechanic');
        const end=localDuration.end_condition||d.end_condition;
        const effectiveParent=parsed?.parent_effect_name||reviewedRule?.parent_effect_name||c.named_parent||g.parent_effect_name;
        const stageMatch=c.tier_condition?.match(/^Stage (\d+)(?: or (below|above))?:/i);
        const scalingCondition=stageMatch?`Overcurrent stage ${stageMatch[2]?.toLowerCase()==='below'?'<=':stageMatch[2]?.toLowerCase()==='above'?'>=':'='} ${stageMatch[1]}`:null;
        const effect={...parsed,effect_type:effectType,target:target?target+'.':'',target_type:type,trigger:trigger||'',
          duration:parsed?.duration||inherited.duration||'',duration_type:end?'conditional':parsed?inferredDuration(parsed.duration):inherited.duration_type,
          duration_value:parsed?.duration_value??inherited.duration_value??null,duration_unit:end?'until_condition':parsed?.duration_unit??inherited.duration_unit??null,end_condition:parsed?.end_condition||end,
          parent_effect_name:effectiveParent,parent_effect_type:effectiveParent?(g.parent_effect_type||'named_effect'):null,parent_effect_path:unique([g.parent_effect_name,effectiveParent]),parent_effect_description:g.parent_effect_description||null,
          parent_trigger:g.trigger,parent_end_condition:g.end_condition,parent_duration:g.duration,function_text:g.function_text||null,
          effect_index:c.effect_index,source_section_index:section_index,parent_group_index:g.group_index,section_condition:c.tier_section_condition||section_condition,scaling_condition:scalingCondition,
          condition:unique([section_condition&&`Burst Stage ${section_condition.burst_stage}`,heading,g.parent_effect_description,c.tier_condition,reviewedRule?.condition,parsed?.condition_fragment,childTrigger,childTarget&&'Affects '+childTarget]).join('\n'),
          raw_label:parsed?.raw_label||reviewedRule?.label||null,reviewed_classification:reviewedRule?.classification||parsed?.reviewed_classification||null,
          target_skill_slot:reviewedRule?.target_skill_slot??parsed?.target_skill_slot??null,element:reviewedRule?.element??parsed?.element??null,
          conversion_source:reviewedRule?.conversion_source??parsed?.conversion_source??null,conversion_target:reviewedRule?.conversion_target??parsed?.conversion_target??null,
          immune_effect:reviewedRule?.immune_effect??parsed?.immune_effect??null,immunity_count:reviewedRule?.immunity_count??parsed?.immunity_count??null,
          resource_type:parsed?.resource_type||reviewedRule?.resource_type||null,special_type:parsed?.special_type||reviewedRule?.special_type||null,state_system:parsed?.state_system||reviewedRule?.state_system||null,
          from_state:parsed?.from_state??reviewedRule?.from_state??null,to_state:parsed?.to_state??reviewedRule?.to_state??null,state_name:parsed?.state_name||reviewedRule?.state_name||null,
          source_line:c.source_line,removable:parsed?.removable??inherited.removable??null,...targetMetadata(target),needs_review_reasons:unique(reasons)};
        if(!parsed&&['penalty','resource','special_mechanic','debuff'].includes(effectType)){
          const value=body.match(/[▼▲] (\d+(?:\.\d+)?)%/);effect.value=value?+value[1]:null;effect.value_unit=value?'percent':null;
          const flat=body.match(/[▼▲] (\d+(?:\.\d+)?)(?!%)/);if(effect.value===null&&flat){effect.value=+flat[1];effect.value_unit=/\bsec\b/.test(body.slice(flat.index))?'seconds':'flat_value';}
          effect.direction=/▼/.test(body)?'decrease':/▲/.test(body)?'increase':null;effect.interval_seconds=/every (\d+(?:\.\d+)?)?\s*second/i.test(body)?+(body.match(/every (\d+(?:\.\d+)?)?\s*second/i)?.[1]||1):null;
          effect.duration=effect.duration||reviewedDurationForNonBuff(body);effect.reviewed_classification=reviewedRule?.classification||effect.reviewed_classification;
        }
        if(effectType==='damage'){
          effect.damage_multiplier=+(body.match(/Deals? (\d+(?:\.\d+)?)% of (?:final )?ATK/i)?.[1]||0)||null;
          effect.attack_count=+(body.match(/Attacks? (?:sequentially )?(\d+) times/i)?.[1]||0)||null;
          effect.attack_pattern=/sequential/i.test(body)?'sequential':null;
        }
        c.text=body;c.effect=effect;c.parsed=parsed;c.unknown_candidate=label;
        c.comparison_eligible=['buff','heal','revive'].includes(effectType)&&Boolean(parsed)&&!reasons.length;
      }
      const related=g.children.filter(c=>!['buff','heal','revive'].includes(c.effect.effect_type)).map(c=>({effect_index:c.effect_index,effect_type:c.effect.effect_type,source_line:c.source_line}));
      for(const c of g.children)c.effect.related_effects=related;
    }
    section.reviewed=section.groups.some(g=>g.children.some(c=>Boolean(c.effect.reviewed_classification)));
    return section;
  });
  return {character_id:snapshot.character_id,character_name:snapshot.character_name,skill_slot:snapshot.skill_slot,skill_name:snapshot.skill_name,
    skill_level:10,source_type:snapshot.source_type,source_url:snapshot.source_url,source_checked_at:snapshot.source_checked_at,
    parser_version:HIERARCHY_VERSION,preamble,sections};
}

export function aggregateUnknownCandidates(hierarchies){
  const groups=new Map();
  for(const h of hierarchies)for(const s of h.sections)for(const g of s.groups)for(const c of g.children){
    if(!c.unknown_candidate)continue;
    const key=c.unknown_candidate.toLowerCase().replace(/\s+/g,' ').trim();
    if(!groups.has(key))groups.set(key,{candidate:key,label:c.unknown_candidate,occurrence_count:0,characters:[],skill_slots:[],occurrences:[]});
    const row=groups.get(key);row.occurrence_count++;
    row.characters=unique([...row.characters,h.character_name]);row.skill_slots=unique([...row.skill_slots,h.skill_slot]);
    row.occurrences.push({character_id:h.character_id,character_name:h.character_name,skill_slot:h.skill_slot,skill_name:h.skill_name,
      source_section_index:s.section_index,parent_effect_name:g.parent_effect_name,effect_index:c.effect_index,
      source_line:c.source_line,source_text:s.source_text,effect_type:c.effect.effect_type,comparison_candidate:c.effect.effect_type==='buff',
      source_type:h.source_type,source_url:h.source_url,source_checked_at:h.source_checked_at});
  }
  return [...groups.values()].sort((a,b)=>b.occurrence_count-a.occurrence_count||a.label.localeCompare(b.label,'en'));
}

const POSITIVE_MARKER=/(?:▲|\bGains?\b|\bGrants?\b|\bRestores?\b|\bRemoves?\b|\bRe-enters?\b|\bReloads?\b|fixed at|\bExpands?\b|deal true damage|Increases? the stack count|Cooldown(?: of Burst Skill)? ▼|immunity|Unlimited ammunition)/i;
export function aggregateUnrecognizedPositiveCandidates(hierarchies){
  const groups=new Map();
  for(const h of hierarchies)for(const s of h.sections)for(const g of s.groups)for(const c of g.children){
    if(!POSITIVE_MARKER.test(c.text)||c.parsed||['resource','damage','penalty','debuff','special_mechanic','weapon_state'].includes(c.effect.effect_type))continue;
    const key=c.text.toLowerCase().replace(/\d+(?:\.\d+)?/g,'#').replace(/\s+/g,' ').trim();
    if(!groups.has(key))groups.set(key,{candidate:key,label:c.text,occurrence_count:0,characters:[],skill_slots:[],occurrences:[]});
    const row=groups.get(key);row.occurrence_count++;
    row.characters=unique([...row.characters,h.character_name]);row.skill_slots=unique([...row.skill_slots,h.skill_slot]);
    row.occurrences.push({character_id:h.character_id,character_name:h.character_name,skill_slot:h.skill_slot,skill_name:h.skill_name,
      source_section_index:s.section_index,section_condition:s.section_condition,parent_effect_name:g.parent_effect_name,effect_index:c.effect_index,
      source_line:c.source_line,source_text:s.source_text,effect_type:c.effect.effect_type,needs_review_reasons:c.effect.needs_review_reasons,
      source_type:h.source_type,source_url:h.source_url,source_checked_at:h.source_checked_at});
  }
  return [...groups.values()].sort((a,b)=>b.occurrence_count-a.occurrence_count||a.label.localeCompare(b.label,'en'));
}

export function reclassificationReport(hierarchies,unknownCandidates){
  const buckets={new_buff_type:new Map(),existing_buff_type:new Map(),resource:new Map(),special_mechanic:new Map(),penalty_or_debuff:new Map()};
  for(const h of hierarchies)for(const s of h.sections)for(const g of s.groups)for(const c of g.children){
    const e=c.effect,kind=['penalty','debuff'].includes(e.reviewed_classification)?'penalty_or_debuff':e.reviewed_classification;
    if(!kind||!buckets[kind]||!e.raw_label)continue;
    const current=buckets[kind].get(e.raw_label)||{label:e.raw_label,occurrence_count:0,characters:new Set(),buff_type:e.buff_type||null,effect_type:e.effect_type};
    current.occurrence_count++;current.characters.add(h.character_name);buckets[kind].set(e.raw_label,current);
  }
  const output={};
  for(const [kind,map] of Object.entries(buckets)){
    const labels=[...map.values()].map(r=>({...r,characters:[...r.characters].sort((a,b)=>a.localeCompare(b,'en'))})).sort((a,b)=>a.label.localeCompare(b.label,'en'));
    output[kind]={type_count:labels.length,effect_count:labels.reduce((n,r)=>n+r.occurrence_count,0),labels};
  }
  const remaining=unknownCandidates.map(r=>({label:r.label,occurrence_count:r.occurrence_count,
    comparison_candidate_occurrences:r.occurrences.filter(o=>o.comparison_candidate).length,characters:r.characters,skill_slots:r.skill_slots}));
  const followup=[...Object.values(output).flatMap(b=>b.labels)].filter(r=>isFollowupUnknownLabel(r.label));
  return {parser_version:HIERARCHY_VERSION,reviewed_unknown_type_count:Object.values(output).reduce((n,b)=>n+b.type_count,0),...output,
    followup_12:{type_count:followup.length,effect_count:followup.reduce((n,r)=>n+r.occurrence_count,0),
      debuff_immunity_effect_count:followup.filter(r=>r.buff_type==='debuff_immunity').reduce((n,r)=>n+r.occurrence_count,0),
      resource_effect_count:followup.filter(r=>r.effect_type==='resource').reduce((n,r)=>n+r.occurrence_count,0),
      special_mechanic_effect_count:followup.filter(r=>r.effect_type==='special_mechanic').reduce((n,r)=>n+r.occurrence_count,0),labels:followup},
    remaining_unknown_type_count:remaining.length,remaining_unknown_buff_candidate_type_count:remaining.filter(r=>r.comparison_candidate_occurrences).length,
    remaining_unknown_effect_count:remaining.reduce((n,r)=>n+r.occurrence_count,0),remaining_unknown:remaining};
}

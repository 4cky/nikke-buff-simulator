import {effectLabel,formatRaw,UNIT_NOTE} from './view-model.js';
import {targetMetadata} from './comparison-qa.js';
import {MANUFACTURERS,ELEMENTS} from './catalog-model.js';
import {SOURCE_LABELS} from './sources.js';
import {FORMATION_SIZE,normalizeFormationState,isSelectableTarget,resolveFormation,
  placeMember,moveMember,removeMemberAt,portraitUrlFor,trackMember,
  normalizeRosterFilters,rosterFilterCount,filterRoster,
  buffAxisCoverage,buffAxisGroups,memberAxisRoles,
  validateRotation,rotationNextOptions,reentryTargets,effectiveReentryByChar,isTreasureEligible,
  groupEffectsForGraph} from './formation-model.js';

const SLOT_SHORT = {'Skill 1':'S1','Skill 2':'S2',Burst:'Burst'};
const ORDINALS = ['1st','2nd','3rd','4th','5th'];
const STAGE_ROMAN = {1:'B1',2:'B2',3:'B3'};

const $ = selector => document.querySelector(selector);
let characters = [], effectsByChar = new Map(), byId = new Map();
let state = {members:[],burst:'none',targetIndex:-1,burstCasters:{1:null,2:null,3:null},rotation:[],rotationIndex:-1,treasure:[]};
let treasureByChar = new Map();
let reentryByChar = {};
let filters = normalizeRosterFilters();

function populateFilterOptions(){
  const add = (selector,values)=>{
    const select = $(selector);
    for(const value of values){
      const option = document.createElement('option');
      option.value = value;option.textContent = value;
      select.append(option);
    }
  };
  add('#roster-manufacturer',MANUFACTURERS);
  add('#roster-element',Object.keys(ELEMENTS));
  add('#roster-class',[...new Set(characters.map(c=>c.class).filter(Boolean))].sort());
  add('#roster-weapon',[...new Set(characters.map(c=>c.weapon_type).filter(Boolean))].sort());
  add('#roster-rarity',[...new Set(characters.map(c=>c.rarity).filter(Boolean))].sort());
}

function initials(name){
  const words = String(name||'?').split(/[\s:·/]+/).filter(Boolean);
  const letters = (words.slice(0,2).map(w=>w[0]).join('')||'?').toUpperCase();
  return letters;
}

function avatar(character){
  const wrap = document.createElement('span');
  wrap.className = 'formation-avatar';
  const url = portraitUrlFor(character);
  if(url){
    const img = document.createElement('img');
    img.loading = 'lazy';img.decoding = 'async';img.referrerPolicy = 'no-referrer';
    img.alt = '';img.src = url;img.draggable = false;
    img.addEventListener('error',()=>{wrap.replaceChildren(document.createTextNode(initials(character.character_name)));});
    wrap.append(img);
  }else wrap.textContent = initials(character.character_name);
  return wrap;
}

function dragPayload(event){
  const types = event.dataTransfer?.types||[];
  const has = name=>Array.prototype.includes.call(types,name);
  if(has('application/x-formation-index')){
    const index = Number.parseInt(event.dataTransfer.getData('application/x-formation-index'),10);
    if(Number.isInteger(index))return {kind:'member',index};
  }
  if(has('application/x-roster-id')){
    const id = event.dataTransfer.getData('application/x-roster-id');
    if(id)return {kind:'roster',id};
  }
  const fallback = event.dataTransfer?.getData('text/plain');
  if(fallback)return {kind:'roster',id:fallback};
  return null;
}

// Keep the target glued to the same character across reorders; if that
// character left the formation, fall back to clamping. Burst casters are
// identity-tracked per stage: reorder follows each character, removal
// clears only the stages that named the removed character. The rotation
// is revalidated against the new members (entries naming removed members
// are dropped) while the evaluated entry is tracked by identity.
// Rotation validation always uses the effective re-entry map (static
// Burst-fire facts plus currently-holding formation-dependent ones).
function rotReentry(memberChars){
  return effectiveReentryByChar(memberChars,reentryByChar,effectsByChar);
}

function applyMembers(nextMembers){
  const targetId = state.members[state.targetIndex];
  const evalEntry = state.rotation[state.rotationIndex]||null;
  const memberChars = nextMembers.map(id=>byId.get(id)).filter(Boolean);
  const picks = state.rotation.filter(p=>nextMembers.includes(p.caster));
  const rotation = validateRotation(picks,memberChars,rotReentry(memberChars));
  let rotationIndex = evalEntry
    ? rotation.findIndex(e=>e.caster===evalEntry.caster&&e.stage===evalEntry.stage) : -1;
  if(rotationIndex<0)rotationIndex = rotation.length?rotation.length-1:-1;
  // Treasure state follows characters (keyed by id): kept members retain
  // it, removed members lose it, re-added members start OFF.
  const treasure = state.treasure.filter(id=>nextMembers.includes(id));
  state = normalizeFormationState({members:nextMembers,burst:state.burst,
    targetIndex:targetId?nextMembers.indexOf(targetId):-1,
    burstCasters:Object.fromEntries(['1','2','3'].map(stage=>
      [stage,trackMember(nextMembers,state.burstCasters?.[stage])])),
    rotation,rotationIndex,treasure},characters,{reentryByChar,effectsByChar});
}

export function parseFormationQuery(search,characterList,reentry={},effectsByChar=null){
  const params = new URLSearchParams(search);
  const ids = (params.get('formation')||'').split(',').map(s=>s.trim()).filter(Boolean);
  const burst = params.get('fburst')||'none';
  const target = Number.parseInt(params.get('ftarget')||'',10);
  // Per-stage casters are the legacy form; a legacy lone fburstcaster
  // restores as stage 1 without breaking old shared URLs. Legacy casters
  // migrate into rotation entries (see rotationFromStageCasters).
  const legacy = params.get('fburstcaster')||null;
  const burstCasters = Object.fromEntries(['1','2','3'].map(stage=>
    [stage,params.get(`fburstcaster${stage}`)||(stage==='1'?legacy:null)]));
  // Canonical form: frot=id@stage,... with the evaluated frotidx.
  let rotation, rotationIndex;
  if(params.has('frot')){
    rotation = params.get('frot').split(',').map(s=>s.trim()).filter(Boolean)
      .map(part=>{
        const at = part.lastIndexOf('@');
        if(at<0)return {caster:part,stage:undefined};
        return {caster:part.slice(0,at).trim(),stage:Number(part.slice(at+1))};
      }).filter(p=>p.caster);
    const parsed = Number.parseInt(params.get('frotidx')||'',10);
    if(Number.isInteger(parsed))rotationIndex = parsed;
  }
  // Treasure state: ftreasure=id,... Absent (including legacy URLs) means
  // all OFF. Unknown ids are dropped by normalization.
  const treasure = (params.get('ftreasure')||'').split(',').map(s=>s.trim()).filter(Boolean);
  return normalizeFormationState({members:ids,burst,burstCasters,
    targetIndex:Number.isInteger(target)?target:0,rotation,rotationIndex,treasure},
    characterList,{reentryByChar:reentry,effectsByChar});
}

export function formatFormationQuery(current){
  const params = new URLSearchParams();
  if(current.members.length)params.set('formation',current.members.join(','));
  if(Array.isArray(current.treasure)&&current.treasure.length)
    params.set('ftreasure',current.treasure.join(','));
  if(current.rotation?.length){
    params.set('frot',current.rotation.map(e=>`${e.caster}@${e.stage}`).join(','));
    params.set('frotidx',String(current.rotationIndex));
  }else{
    if(current.burst!=='none')params.set('fburst',current.burst);
    for(const stage of ['1','2','3'])
      if(current.burstCasters?.[stage])params.set(`fburstcaster${stage}`,current.burstCasters[stage]);
  }
  if(current.targetIndex>0)params.set('ftarget',String(current.targetIndex));
  return params.toString();
}

function readStateFromUrl(){
  state = parseFormationQuery(location.search,characters,reentryByChar,effectsByChar);
}

function writeStateToUrl(){
  const query = formatFormationQuery(state);
  try{history.replaceState(null,'',location.pathname+(query?`?${query}`:'')+location.hash);}catch{/* embedded */}
}

// Burst Rotation editor: one row per rotation position plus a single
// empty "next" row while the chain can extend (never a fixed 7-frame).
// Caster options per row are limited to formation members valid at that
// position (stage capability enforced, re-entry repeats only with own
// re-entry); the stage select offers the valid stages for the chosen
// caster. The radio marks the evaluated position.
function setRotationCaster(index,caster,stage){
  const picks = state.rotation.slice(0,index);
  if(caster)picks.push(stage==null?{caster}:{caster,stage});
  state = normalizeFormationState({members:state.members,burst:state.burst,
    targetIndex:state.targetIndex,burstCasters:state.burstCasters,
    rotation:picks,rotationIndex:index,treasure:state.treasure},characters,{reentryByChar,effectsByChar});
  render();
}

function removeRotationAt(index){
  const picks = state.rotation.filter((_,j)=>j!==index);
  state = normalizeFormationState({members:state.members,burst:state.burst,
    targetIndex:state.targetIndex,burstCasters:state.burstCasters,
    rotation:picks,rotationIndex:state.rotationIndex,treasure:state.treasure},characters,{reentryByChar,effectsByChar});
  render();
}

function renderRotation(){
  const wrap = $('#burst-rotation');
  if(!wrap)return;
  wrap.replaceChildren();
  const memberChars = state.members.map(id=>byId.get(id)).filter(Boolean);
  const effective = rotReentry(memberChars);
  const info = $('#rotation-info');
  if(info){
    const reentries = memberChars
      .filter(c=>effective[c.character_id]!=null)
      .map(c=>`${c.character_name} → B${effective[c.character_id]}`);
    info.textContent = reentries.length?`Re-entry: ${reentries.join(' · ')}`:'';
  }
  if(!memberChars.length){
    const empty = document.createElement('li');
    empty.className = 'empty-note';
    empty.textContent = 'Add members to build a rotation';
    wrap.append(empty);
    return;
  }
  const canExtend = state.rotation.length<FORMATION_SIZE
    &&state.rotation.length<memberChars.length
    &&rotationNextOptions(state.rotation,memberChars,effective).length>0;
  const rows = state.rotation.length+(canExtend?1:0);
  for(let index=0;index<rows;index++){
    const prefix = state.rotation.slice(0,index);
    const current = state.rotation[index]||null;
    const options = rotationNextOptions(prefix,memberChars,effective);
    const item = document.createElement('li');
    item.className = 'rotation-row'+(index===state.rotationIndex?' is-evaluated':'');
    const evalLabel = document.createElement('label');
    evalLabel.className = 'rotation-eval';
    const radio = document.createElement('input');
    radio.type = 'radio';radio.name = 'rotation-eval';
    radio.checked = index===state.rotationIndex;
    radio.disabled = !current;
    radio.setAttribute('aria-label',`Evaluate position ${ORDINALS[index]}`);
    radio.addEventListener('change',()=>{state.rotationIndex = index;render();});
    const ord = document.createElement('span');
    ord.className = 'rotation-ord';
    ord.textContent = ORDINALS[index];
    evalLabel.append(radio,ord);
    item.append(evalLabel);
    const casterSel = document.createElement('select');
    casterSel.setAttribute('aria-label',`Position ${ORDINALS[index]} caster`);
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = current?'Unset':'Select caster';
    casterSel.append(placeholder);
    for(const opt of options){
      const character = byId.get(opt.caster);
      const choice = document.createElement('option');
      choice.value = opt.caster;
      choice.textContent =
        `${character?character.character_name:opt.caster} (${opt.stages.map(s=>STAGE_ROMAN[s]).join('/')})`;
      casterSel.append(choice);
    }
    casterSel.value = current?current.caster:'';
    casterSel.addEventListener('change',()=>setRotationCaster(index,casterSel.value||null));
    item.append(casterSel);
    const stageSel = document.createElement('select');
    stageSel.setAttribute('aria-label',`Position ${ORDINALS[index]} stage`);
    stageSel.disabled = !current;
    if(current){
      const valid = options.find(o=>o.caster===current.caster)?.stages||[current.stage];
      for(const stage of valid){
        const choice = document.createElement('option');
        choice.value = String(stage);
        choice.textContent = STAGE_ROMAN[stage];
        stageSel.append(choice);
      }
      stageSel.value = String(current.stage);
      stageSel.addEventListener('change',()=>setRotationCaster(index,current.caster,Number(stageSel.value)));
    }
    item.append(stageSel);
    if(current){
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'rotation-remove';
      remove.textContent = 'Remove';
      remove.setAttribute('aria-label',`Remove position ${ORDINALS[index]}`);
      remove.addEventListener('click',()=>removeRotationAt(index));
      item.append(remove);
    }
    wrap.append(item);
  }
}

function detailsElement(row,summaryContent){
  const details = document.createElement('details');
  details.className = 'row-details';
  const summary = document.createElement('summary');
  if(summaryContent)summary.append(...summaryContent);
  else summary.textContent = 'Details';
  details.append(summary);
  if(row.conflict){
    const conflict = document.createElement('p');
    conflict.className = 'conflict';
    conflict.textContent = row.conflict;
    details.append(conflict);
  }
  const gateLines = [...row.reasons.map(r=>`reason: ${r}`),...row.gateText];
  if(row.effect.stack_count){
    const max = row.effect.max_raw_value===null||row.effect.max_raw_value===undefined
      ? '未記載' : formatRaw(row.effect,row.effect.max_raw_value);
    gateLines.push(`Stack: 1 stack ${formatRaw(row.effect)} / max ${row.effect.stack_count} stacks / maxRaw ${max}`);
  }
  if(gateLines.length){
    const ul = document.createElement('ul');
    ul.className = 'gates';
    for(const line of gateLines){
      const item = document.createElement('li');
      item.textContent = line;
      ul.append(item);
    }
    const source = document.createElement('li');
    source.textContent = `Source: ${SOURCE_LABELS[row.effect.source_type]||'unknown'} · ${row.effect.source_url||''}`;
    ul.append(source);
    const target = targetMetadata(row.effect);
    if(target&&!row.gateText.join('\n').includes(target)){
      const extra = document.createElement('li');
      extra.textContent = target;
      ul.append(extra);
    }
    details.append(ul);
  }else{
    const source = document.createElement('p');
    source.className = 'gates';
    source.textContent = `Source: ${SOURCE_LABELS[row.effect.source_type]||'unknown'} · ${row.effect.source_url||''}`;
    details.append(source);
  }
  return details;
}

function casterLabel(row){
  return `${row.caster.character_name} · ${SLOT_SHORT[row.effect.skill_slot]||row.effect.skill_slot} ${row.effect.skill_name}`;
}

// One chip = one original effect record, never summed. The summary shows
// only caster + raw value; everything else lives inside the <details>.
function chipElement(row){
  const caster = document.createElement('span');
  caster.className = 'chip-caster';
  caster.textContent = row.caster.character_name;
  const value = document.createElement('span');
  value.className = 'chip-value';
  value.textContent = formatRaw(row.effect);
  if(row.effect.stack_count&&typeof row.effect.value==='number'){
    const note = document.createElement('span');
    note.className = 'stack-note';
    note.textContent = ' / stack';
    value.append(note);
  }
  const li = document.createElement('li');
  li.className = 'chip-wrap';
  li.append(detailsElement(row,[caster,value]));
  return li;
}

function groupElement(group){
  const li = document.createElement('li');
  li.className = 'graph-group';
  const head = document.createElement('div');
  head.className = 'graph-group-head';
  const label = document.createElement('strong');
  const sample = group.bars[0]||group.badges[0];
  label.textContent = sample?effectLabel(sample.effect):group.buffType;
  head.append(label);
  const unitNote = UNIT_NOTE[group.valueUnit]||'';
  if(unitNote){
    const unit = document.createElement('span');
    unit.className = 'graph-unit';
    unit.textContent = unitNote;
    head.append(unit);
  }
  const count = group.bars.length+group.badges.length;
  const effects = document.createElement('span');
  effects.className = 'graph-count';
  effects.textContent = `${count} effect${count===1?'':'s'}`;
  head.append(effects);
  const list = document.createElement('ul');
  list.className = 'chips';
  for(const row of group.bars)list.append(chipElement(row));
  for(const row of group.badges)list.append(chipElement(row));
  li.append(head,list);
  return li;
}

function unknownRowElement(row){
  const li = document.createElement('li');
  li.className = 'formation-row';
  const main = document.createElement('div');
  main.className = 'row-main';
  const kind = document.createElement('span');
  kind.className = 'effect-kind';
  kind.textContent = effectLabel(row.effect);
  const caster = document.createElement('span');
  caster.textContent = casterLabel(row);
  main.append(kind,caster);
  const hint = document.createElement('div');
  hint.className = 'row-gatehint';
  hint.textContent = `自動適用外 — ${row.reasons.join(' · ')||'reason unknown'}`;
  li.append(main,hint,detailsElement(row));
  return li;
}

function rowElement(row){
  const li = document.createElement('li');
  li.className = 'formation-row';
  const main = document.createElement('div');
  main.className = 'row-main';
  const kind = document.createElement('span');
  kind.className = 'effect-kind';
  kind.textContent = effectLabel(row.effect);
  const value = document.createElement('strong');
  value.className = 'effect-value';
  value.textContent = formatRaw(row.effect);
  main.append(kind,value);
  const sub = document.createElement('div');
  sub.className = 'row-sub';
  sub.textContent = casterLabel(row);
  const scope = document.createElement('div');
  scope.className = 'row-scope';
  scope.textContent = `${row.relation==='self'?'SELF':'ALLY'} · ${row.effect.target}`;
  li.append(main,sub,scope);
  if(row.bucket==='gated'){
    const hint = document.createElement('div');
    hint.className = 'row-gatehint';
    hint.textContent = row.reasons.includes('burst-not-selected')
      ? 'Burst未選択のため保留'
      : 'Condition / Triggerあり';
    li.append(hint);
  }
  if(row.bucket==='unknown'){
    const hint = document.createElement('div');
    hint.className = 'row-gatehint';
    hint.textContent = '自動適用外 — 詳細を確認';
    li.append(hint);
  }
  li.append(detailsElement(row));
  return li;
}

function render(){
  writeStateToUrl();renderRotation();
  const strip = $('#formation-slots');
  strip.replaceChildren();
  for(let index=0;index<FORMATION_SIZE;index++){
    const item = document.createElement('li');
    const number = document.createElement('span');
    number.className = 'slot-number';
    number.textContent = String(index+1);
    number.setAttribute('aria-hidden','true');
    const id = state.members[index];
    if(!id){
      item.className = 'formation-slot is-empty';
      item.append(number);
      const empty = document.createElement('span');
      empty.className = 'slot-empty-label';
      empty.textContent = 'Empty';
      item.append(empty);
      item.addEventListener('dragover',event=>{
        event.preventDefault();
        if(event.dataTransfer)event.dataTransfer.dropEffect = 'move';
        item.classList.add('is-dragover');
      });
      item.addEventListener('dragleave',()=>item.classList.remove('is-dragover'));
      item.addEventListener('drop',event=>{
        event.preventDefault();item.classList.remove('is-dragover');
        const payload = dragPayload(event);
        if(!payload)return;
        if(payload.kind==='member')applyMembers(moveMember(state.members,payload.index,index));
        else applyMembers(placeMember(state.members,payload.id,index));
        render();
      });
      strip.append(item);continue;
    }
    const character = byId.get(id);
    item.className = 'formation-slot'+(index===state.targetIndex?' is-target':'');
    item.append(number);
    const button = document.createElement('button');
    button.type = 'button';
    button.draggable = true;
    button.setAttribute('aria-pressed',String(index===state.targetIndex));
    button.setAttribute('aria-label',`Target ${character.character_name}`);
    button.append(avatar(character));
    const name = document.createElement('span');
    name.className = 'formation-name';
    name.textContent = character.character_name;
    const meta = document.createElement('span');
    meta.className = 'formation-meta';
    meta.textContent = `${character.burst_stage.map(n=>['','I','II','III'][n]).join('/')||'—'} · ${character.element||'—'} · ${character.weapon_type||'—'}`;
    button.append(name,meta);
    button.addEventListener('click',()=>{state.targetIndex = index;render();});
    button.addEventListener('dragstart',event=>{
      event.dataTransfer.setData('application/x-formation-index',String(index));
      event.dataTransfer.setData('text/plain',id);
      event.dataTransfer.effectAllowed = 'move';
    });
    button.addEventListener('dragend',()=>{
      document.querySelectorAll('.is-dragover').forEach(node=>node.classList.remove('is-dragover'));
    });
    item.addEventListener('dragover',event=>{
      event.preventDefault();
      if(event.dataTransfer)event.dataTransfer.dropEffect = 'move';
      item.classList.add('is-dragover');
    });
    item.addEventListener('dragleave',()=>item.classList.remove('is-dragover'));
    item.addEventListener('drop',event=>{
      event.preventDefault();item.classList.remove('is-dragover');
      const payload = dragPayload(event);
      if(!payload)return;
      if(payload.kind==='member')applyMembers(moveMember(state.members,payload.index,index));
      else applyMembers(placeMember(state.members,payload.id,index));
      render();
    });
    const remove = document.createElement('button');
    remove.type = 'button';remove.className = 'formation-remove';
    remove.textContent = 'Remove';
    remove.setAttribute('aria-label',`Remove ${character.character_name}`);
    remove.addEventListener('click',()=>{
      applyMembers(removeMemberAt(state.members,index));
      render();
    });
    item.append(button,remove);
    // Treasure toggle: only for treasure-eligible characters, so the
    // roster and non-eligible slots stay compact. ON adds a badge.
    if(isTreasureEligible(character,treasureByChar)){
      const on = state.treasure.includes(id);
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'treasure-toggle'+(on?' is-on':'');
      toggle.textContent = on?'💎 宝もの [ON]':'💎 宝もの [OFF]';
      toggle.setAttribute('aria-label',`Favorite Item for ${character.character_name}: ${on?'ON':'OFF'}`);
      toggle.setAttribute('aria-pressed',String(on));
      toggle.addEventListener('click',()=>{setTreasure(id,!on);});
      item.append(toggle);
      if(on)item.classList.add('has-treasure');
    }
    strip.append(item);
  }

  const target = isSelectableTarget(state,state.targetIndex)
    ? byId.get(state.members[state.targetIndex]) : null;
  $('#panel-target-name').textContent = target
    ? target.character_name : 'No target';
  $('#panel-target-meta').textContent = target
    ? `${target.burst_stage.map(n=>['','I','II','III'][n]).join('/')||'—'} · ${target.element||'—'} · ${target.weapon_type||'—'} · ${target.class||'—'}`
    : '';
  const resolved = resolveFormation({members:(state.members.map(id=>byId.get(id)).filter(Boolean)),
    targetIndex:state.targetIndex,rotation:state.rotation,rotationIndex:state.rotationIndex,
    treasure:state.treasure,treasureByChar,
    effectsByChar,characters});
  renderCoverage(target,state.members.map(id=>byId.get(id)).filter(Boolean),resolved);
  renderBucket($('#list-deterministic'),$('#count-deterministic'),resolved.deterministic,'graph');
  renderBucket($('#list-gated'),$('#count-gated'),resolved.gated,'collapsed-graph');
  renderBucket($('#list-unknown'),$('#count-unknown'),resolved.unknown,'unknown');
  renderBucket($('#list-quarantined'),$('#count-quarantined'),resolved.quarantined,'card');
  const evaluated = state.rotation[state.rotationIndex];
  $('#formation-counts').textContent =
    `${state.members.length}/5 members · Rotation ${state.rotation.length
      ? `${state.rotation.length} step${state.rotation.length===1?'':'s'}${evaluated?` · evaluating ${ORDINALS[state.rotationIndex]} (${STAGE_ROMAN[evaluated.stage]})`:''}`
      : 'unset'}`;
  renderRoster();
}

// Buff Axis Coverage summary: presence-only chips per canonical axis
// (Covered / Conditional / Not covered) plus per-member New/Existing
// axes against the target's own axes. Provider names are provenance;
// no values are summed and no strength judgment is rendered.
function axisChip(axis){
  const li = document.createElement('li');
  li.className = `axis-chip is-${axis.status}`;
  const mark = document.createElement('span');
  mark.className = 'axis-mark';
  mark.textContent = axis.status==='covered'?'●':axis.status==='conditional'?'◐':'○';
  mark.setAttribute('aria-hidden','true');
  const label = document.createElement('span');
  label.textContent = effectLabel({buff_type:axis.buffType});
  li.append(mark,label);
  if(axis.status!=='uncovered'){
    const who = document.createElement('span');
    who.className = 'axis-providers';
    who.textContent = axis.self?'SELF':axis.providers.join(' · ');
    li.append(who);
  }
  return li;
}

// One collapsible axis group: Collapsed = aggregate conclusion,
// Expanded = per-effect evidence. Sums form only within one
// (buff_type, value_unit) group over summable rows; deterministic and
// conditional sums stay separate; anything unsummable is counted as
// individual rows, never forced into the total.
function axisGroupElement(group){
  const details = document.createElement('details');
  details.className = 'axis-group-detail';
  const summary = document.createElement('summary');
  summary.className = 'axis-group-summary';
  const mark = document.createElement('span');
  mark.className = 'axis-mark';
  mark.textContent = group.status==='covered'?'●':'◐';
  mark.setAttribute('aria-hidden','true');
  const label = document.createElement('strong');
  label.textContent = effectLabel({buff_type:group.buffType});
  summary.append(mark,label);
  const unitNote = UNIT_NOTE[group.valueUnit]||'';
  if(unitNote){
    const unit = document.createElement('span');
    unit.className = 'graph-unit';
    unit.textContent = unitNote;
    summary.append(unit);
  }
  const template = [...group.detRows,...group.gatedRows]
    .map(r=>r.effect).find(e=>e&&typeof e.value==='number'&&Number.isFinite(e.value));
  const part = (sum,summed,total,title)=>{
    if(!total)return null;
    if(!summed)return `${title}${total}件（個別表示のみ）`;
    const extra = total>summed?`＋個別${total-summed}件`:'';
    return `${title}${template?formatRaw(template,sum):String(sum)}（${summed}件${extra}）`;
  };
  const parts = [
    part(group.detSum,group.detSummedCount,group.detTotalCount,'確定合計 '),
    part(group.gatedSum,group.gatedSummedCount,group.gatedTotalCount,'条件付き合計 '),
  ].filter(Boolean);
  const totals = document.createElement('span');
  totals.className = 'axis-totals';
  totals.textContent = parts.length?parts.join(' · '):'個別表示のみ';
  summary.append(totals);
  const who = document.createElement('span');
  who.className = 'axis-providers';
  who.textContent = group.self?'SELF':group.providers.join(' · ');
  summary.append(who);
  details.append(summary);
  const list = document.createElement('ul');
  list.className = 'axis-breakdown';
  for(const [rows,tag] of [[group.detRows,'確定'],[group.gatedRows,'条件付き']]){
    for(const row of rows){
      const caster = document.createElement('span');
      caster.className = 'chip-caster';
      caster.textContent = row.caster.character_name;
      const value = document.createElement('span');
      value.className = 'chip-value';
      value.textContent = formatRaw(row.effect);
      if(row.effect.stack_count&&typeof row.effect.value==='number'){
        const note = document.createElement('span');
        note.className = 'stack-note';
        note.textContent = ' / stack';
        value.append(note);
      }
      const status = document.createElement('span');
      status.className = 'axis-row-status';
      status.textContent = tag;
      const li = document.createElement('li');
      li.className = 'chip-wrap';
      li.append(detailsElement(row,[caster,value,status]));
      list.append(li);
    }
  }
  details.append(list);
  return details;
}

function setTreasure(characterId,on){
  const kept = state.treasure.filter(id=>id!==characterId);
  if(on)kept.push(characterId);
  state = normalizeFormationState({members:state.members,burst:state.burst,
    targetIndex:state.targetIndex,burstCasters:state.burstCasters,
    rotation:state.rotation,rotationIndex:state.rotationIndex,
    treasure:kept},characters,{reentryByChar,effectsByChar});
  render();
}

function renderCoverage(target,memberChars,resolved){
  const summary = $('#coverage-summary'), wrap = $('#axis-coverage');
  if(!summary||!wrap)return;
  const applied = [...resolved.deterministic,...resolved.gated];
  const coverage = buffAxisCoverage(applied,target);
  const groups = buffAxisGroups(applied,target);
  const count = status=>coverage.filter(a=>a.status===status).length;
  summary.textContent = target
    ? `Covered ${count('covered')} · Conditional ${count('conditional')} · Not covered ${count('uncovered')}`
    : 'No target';
  wrap.replaceChildren();
  if(!target){
    const empty = document.createElement('p');
    empty.className = 'empty-note';empty.textContent = '該当なし';
    wrap.append(empty);
  }else{
    const note = document.createElement('p');
    note.className = 'axis-sum-note';
    note.textContent = '合計は同一軸・同一単位のRaw値の単純合計（確定／条件付きは別計）。基準値・スタック・上限は考慮しないため実効値ではない。';
    wrap.append(note);
    for(const [status,title] of [['covered','Covered'],['conditional','Conditional']]){
      const list = groups.filter(g=>g.status===status);
      if(!list.length)continue;
      const group = document.createElement('div');
      group.className = 'axis-group';
      const head = document.createElement('div');
      head.className = 'axis-group-head';
      head.textContent = `${title} · ${list.length}`;
      group.append(head);
      for(const g of list)group.append(axisGroupElement(g));
      wrap.append(group);
    }
    const uncovered = coverage.filter(a=>a.status==='uncovered');
    const group = document.createElement('div');
    group.className = 'axis-group';
    const head = document.createElement('div');
    head.className = 'axis-group-head';
    head.textContent = `Not covered · ${uncovered.length}`;
    const list = document.createElement('ul');
    list.className = 'chips axis-chips';
    for(const axis of uncovered)list.append(axisChip(axis));
    group.append(head,list);
    wrap.append(group);
  }
  renderMemberAxes(target,memberChars,applied);
}

function renderMemberAxes(target,memberChars,applied){
  const wrap = $('#member-axes');
  if(!wrap)return;
  wrap.replaceChildren();
  if(!target||!memberChars.length){
    const empty = document.createElement('p');
    empty.className = 'empty-note';empty.textContent = '該当なし';
    wrap.append(empty);return;
  }
  const list = document.createElement('ul');
  list.className = 'member-axes-list';
  for(const role of memberAxisRoles(applied,memberChars,target)){
    const item = document.createElement('li');
    item.className = 'member-axes-row';
    const name = document.createElement('div');
    name.className = 'member-axes-name';
    name.textContent = role.member.character_name+(role.isTarget?' · TARGET':'');
    item.append(name);
    for(const [axes,title,cls] of [[role.newAxes,'New axis','axis-new'],[role.existingAxes,'Existing axis','axis-existing']]){
      if(!axes.length)continue;
      const sub = document.createElement('div');
      sub.className = 'member-axes-sub';
      const head = document.createElement('span');
      head.className = `member-axes-head ${cls}`;
      head.textContent = `${title} · ${axes.length}`;
      const chips = document.createElement('ul');
      chips.className = 'chips axis-chips';
      for(const buffType of axes){
        const chip = document.createElement('li');
        chip.className = `axis-chip ${cls}`;
        chip.textContent = effectLabel({buff_type:buffType});
        chips.append(chip);
      }
      sub.append(head,chips);
      item.append(sub);
    }
    if(!role.newAxes.length&&!role.existingAxes.length){
      const none = document.createElement('div');
      none.className = 'empty-note';none.textContent = 'No effects on target';
      item.append(none);
    }
    list.append(item);
  }
  wrap.append(list);
}

function emptyNote(ul){
  const empty = document.createElement('li');
  empty.className = 'empty-note';
  empty.textContent = '該当なし';
  ul.append(empty);
}

function renderBucket(ul,count,rows,mode){
  if(!ul)return;
  ul.replaceChildren();
  if(!rows.length)emptyNote(ul);
  else if(mode==='graph'){
    for(const group of groupEffectsForGraph(rows))ul.append(groupElement(group));
  }else if(mode==='collapsed-graph'){
    const wrap = document.createElement('li');
    wrap.className = 'bucket-collapse';
    const details = document.createElement('details');
    details.className = 'bucket-details';
    const summary = document.createElement('summary');
    summary.textContent = `Conditional Effects · ${rows.length}`;
    details.append(summary);
    const inner = document.createElement('ul');
    inner.className = 'bucket-groups';
    for(const group of groupEffectsForGraph(rows))inner.append(groupElement(group));
    details.append(inner);
    wrap.append(details);
    ul.append(wrap);
  }else if(mode==='unknown'){
    for(const row of rows)ul.append(unknownRowElement(row));
  }else{
    for(const row of rows)ul.append(rowElement(row));
  }
  if(count)count.textContent = String(rows.length);
}

function rosterCandidates(){
  return filterRoster(characters,filters);
}

function readFilters(){
  filters = normalizeRosterFilters({
    query:$('#roster-search').value,
    manufacturer:$('#roster-manufacturer').value,
    burst:$('#roster-burst').value,
    element:$('#roster-element').value,
    class:$('#roster-class').value,
    weapon:$('#roster-weapon').value,
    rarity:$('#roster-rarity').value,
  });
}

function renderRoster(){
  const grid = $('#character-roster');
  if(!grid)return;
  const list = rosterCandidates();
  grid.replaceChildren();
  for(const character of list){
    const inFormation = state.members.includes(character.character_id);
    const item = document.createElement('li');
    item.className = 'roster-item'+(inFormation?' is-member':'');
    const button = document.createElement('button');
    button.type = 'button';
    button.draggable = true;
    button.setAttribute('aria-label',inFormation
      ? `${character.character_name} (in formation — activate to target)`
      : `Add ${character.character_name}`);
    button.setAttribute('aria-pressed',String(inFormation));
    button.append(avatar(character));
    const name = document.createElement('span');
    name.className = 'roster-name';
    name.textContent = character.character_name;
    button.append(name);
    button.addEventListener('click',()=>{
      if(state.members.includes(character.character_id)){
        // Touch/keyboard fallback: jump the target to this member.
        state.targetIndex = state.members.indexOf(character.character_id);
      }else if(state.members.length<FORMATION_SIZE){
        state.members = [...state.members,character.character_id];
        state = normalizeFormationState(state,characters);
      }
      render();
    });
    button.addEventListener('dragstart',event=>{
      event.dataTransfer.setData('application/x-roster-id',character.character_id);
      event.dataTransfer.setData('text/plain',character.character_id);
      event.dataTransfer.effectAllowed = 'move';
    });
    button.addEventListener('dragend',()=>{
      document.querySelectorAll('.is-dragover').forEach(node=>node.classList.remove('is-dragover'));
    });
    item.append(button);
    grid.append(item);
  }
  $('#roster-count').textContent = `${list.length}/${characters.length}`;
  const clear = $('#roster-clear');
  clear.disabled = rosterFilterCount(filters)===0;
}

async function init(){
  try{
    if(location.protocol==='file:')throw Error('file:// direct launch is unsupported. Serve this directory over HTTP.');
    const load = async name=>{
      const response = await fetch(new URL(`./data/${name}.json`,import.meta.url));
      if(!response.ok)throw Error(`${name}: HTTP ${response.status}`);
      return response.json();
    };
    const [loadedCharacters,loadedEffects,manifest,report] = await Promise.all(
      ['characters','effects','dataset-manifest','collection-report'].map(load));
    if(manifest.parser_version!==report.parser_version
      ||manifest.character_count!==loadedCharacters.length
      ||manifest.comparison_count!==loadedEffects.length)
      throw Error('Dataset manifest does not match loaded data');
    characters = loadedCharacters;byId = new Map(characters.map(c=>[c.character_id,c]));
    effectsByChar = new Map();
    for(const effect of loadedEffects){
      if(!byId.has(effect.character_id))continue;
      if(!effectsByChar.has(effect.character_id))effectsByChar.set(effect.character_id,[]);
      effectsByChar.get(effect.character_id).push(effect);
    }
    reentryByChar = reentryTargets(loadedEffects);
    // Treasure datasets are optional: missing files disable treasure
    // without breaking the formation page. Effective sets replace covered
    // normal slots only (no double-apply); uncovered slots keep normal.
    const loadOptional = async name=>{
      try{
        const response = await fetch(new URL(`./data/${name}.json`,import.meta.url));
        if(!response.ok)return null;
        return await response.json();
      }catch{return null;}
    };
    const [treasureEffects,treasureReport] = await Promise.all(
      ['treasure-effects','treasure-report'].map(loadOptional));
    treasureByChar = new Map();
    if(Array.isArray(treasureEffects)&&treasureReport){
      const covered = new Map(
        (treasureReport.holders||[]).map(h=>[h.character_id,h.covered_slots||[]]));
      for(const effect of treasureEffects){
        if(!byId.has(effect.character_id))continue;
        if(!treasureByChar.has(effect.character_id))treasureByChar.set(effect.character_id,[]);
        treasureByChar.get(effect.character_id).push(effect);
      }
      for(const [id,list] of [...treasureByChar]){
        const slots = covered.get(id)||[];
        const normal = (effectsByChar.get(id)||[]).filter(e=>!slots.includes(e.skill_slot));
        treasureByChar.set(id,[...list,...normal]);
      }
    }
  }catch(error){
    const empty = $('#formation-empty');
    empty.hidden = false;
    empty.replaceChildren(document.createTextNode(`データを読み込めませんでした。${error.message}`));
    return;
  }
  readStateFromUrl();
  populateFilterOptions();
  $('#roster-search').addEventListener('input',()=>{readFilters();renderRoster();});
  for(const selector of ['#roster-manufacturer','#roster-burst','#roster-element',
    '#roster-class','#roster-weapon','#roster-rarity'])
    $(selector).addEventListener('change',()=>{readFilters();renderRoster();});
  $('#roster-clear').addEventListener('click',()=>{
    filters = normalizeRosterFilters();
    $('#roster-search').value = '';
    for(const selector of ['#roster-manufacturer','#roster-burst','#roster-element',
      '#roster-class','#roster-weapon','#roster-rarity'])
      $(selector).value = '';
    renderRoster();
  });
  const bin = $('#remove-bin');
  bin.addEventListener('dragover',event=>{
    event.preventDefault();
    if(event.dataTransfer)event.dataTransfer.dropEffect = 'move';
    bin.classList.add('is-dragover');
  });
  bin.addEventListener('dragleave',()=>bin.classList.remove('is-dragover'));
  bin.addEventListener('drop',event=>{
    event.preventDefault();bin.classList.remove('is-dragover');
    const payload = dragPayload(event);
    if(payload?.kind==='member')applyMembers(removeMemberAt(state.members,payload.index));
    render();
  });
  document.body.classList.add('panel-open');
  const setPanel = open=>{
    document.body.classList.toggle('panel-open',open);
    $('#panel-toggle').hidden = open;
    $('#panel-backdrop').hidden = !open;
  };
  $('#panel-toggle').addEventListener('click',()=>setPanel(true));
  $('#panel-close').addEventListener('click',()=>setPanel(false));
  $('#panel-backdrop').addEventListener('click',()=>setPanel(false));
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&document.body.classList.contains('panel-open'))setPanel(false);
  });
  $('#formation-clear').addEventListener('click',()=>{
    state = normalizeFormationState({members:[],burst:state.burst,targetIndex:-1,
      burstCasters:{1:null,2:null,3:null},rotation:[],rotationIndex:-1,treasure:[]},characters,{reentryByChar,effectsByChar});
    render();
  });
  window.addEventListener('popstate',()=>{readStateFromUrl();render();});
  render();
}

if(typeof document!=='undefined')init();

import {relation,numericRaw,CATEGORIES} from './view-model.js';
import {matchesCharacter} from './catalog-model.js';
import {targetMetadata,scalingMetadata,periodicMetadata} from './comparison-qa.js';

// Formation target resolver — pure, no DOM, no combat simulation.
// Input: existing structured raw effect records (comparison dataset shape).
// Output: per-target tri-state buckets (deterministic / gated / unknown)
// plus a quarantined tray for needs_review records.
// Policy (mirrors the existing pipeline, no new policy):
// - needs_review is the single hard gate and must never be applied.
//   Per scripts/assemble-data.mjs + validate-data.mjs, a source_conflict
//   record always carries needs_review:true, so gating on needs_review
//   already quarantines every conflict. source_conflict is surfaced only
//   as a provenance badge, never as an independent exclusion rule.
// - Comparison boundary is preserved: the resolver consumes records but
//   never reclassifies them and never writes the dataset.

export const FORMATION_SIZE = 5;
export const BURST_OPTIONS = ['none','1','2','3'];

// NIKKE.GG portrait derivation (verified, not guessed):
// 1. Saved GG API payload (work/nikke-gg-raw/characters.json) gives every
//    character `icon: "characters/{id}.webp"` (212/212, zero nonstandard).
// 2. Live GG character page og:image/preload confirm the absolute base
//    `https://static.dotgg.gg/nikke/` (checked for Rapi + Crown, icon and
//    artwork both HEAD 200 image/webp).
// 3. characters.json already carries the canonical GG identity as
//    `source_id`, so no dataset change is needed to resolve portraits.
// Unknown/non-numeric ids (e.g. future Explorer-only rows) yield null and
// the UI falls back to initials; a 404 also falls back via onerror.
const PORTRAIT_BASE = 'https://static.dotgg.gg/nikke';
const PORTRAIT_HOSTS = new Set(['static.dotgg.gg','nikke.gg']);
export function portraitUrlFor(character){
  if(!character)return null;
  const direct = typeof character.portrait_url==='string'
    ? character.portrait_url.trim() : '';
  if(direct){
    try{
      const url = new URL(direct);
      if(url.protocol==='https:'&&PORTRAIT_HOSTS.has(url.hostname))return url.href;
    }catch{/* fall through to derived URL */}
  }
  const sourceId = String(character.source_id??'').trim();
  if(/^\d+$/.test(sourceId))return `${PORTRAIT_BASE}/characters/${sourceId}.webp`;
  return null;
}

// Drag-and-drop state transitions — pure, order-preserving, dupe-safe.
// The formation model stays a compact id array (empty slots are trailing
// indices >= members.length); these helpers map every drop gesture onto it:
// - roster portrait -> empty slot: append (first free position)
// - roster portrait -> occupied slot: replace the occupant
// - member -> occupied slot: swap the two positions
// - member -> empty slot: relocate to the end
// - member -> remove bin: remove
// - roster portrait -> full formation: replace on occupied, no-op on empty
export function placeMember(members,characterId,toIndex){
  const list = [...members];
  if(typeof characterId!=='string'||!characterId)return list;
  const from = list.indexOf(characterId);
  if(from!==-1){
    if(from===toIndex)return list;
    if(toIndex>=0&&toIndex<list.length){
      [list[from],list[toIndex]] = [list[toIndex],list[from]];
      return list;
    }
    list.splice(from,1);
    if(list.length<FORMATION_SIZE)list.push(characterId);
    return list;
  }
  if(toIndex>=0&&toIndex<list.length){
    list[toIndex] = characterId;
    return list;
  }
  if(list.length<FORMATION_SIZE)list.push(characterId);
  return list;
}

export function moveMember(members,fromIndex,toIndex){
  const list = [...members];
  if(!Number.isInteger(fromIndex)||fromIndex<0||fromIndex>=list.length)return list;
  if(!Number.isInteger(toIndex)||toIndex<0)return list;
  if(fromIndex===toIndex)return list;
  if(toIndex<list.length){
    [list[fromIndex],list[toIndex]] = [list[toIndex],list[fromIndex]];
    return list;
  }
  const [moved] = list.splice(fromIndex,1);
  list.push(moved);
  return list;
}

export function removeMemberAt(members,index){
  if(!Number.isInteger(index)||index<0)return [...members];
  return members.filter((_,i)=>i!==index);
}

// Roster filtering — 7 axes combined with AND; '' means unselected.
// Name/manufacturer/burst/element reuse catalog-model.js matchesCharacter
// (the same predicate as the comparison table); class/weapon/rarity are
// exact-match axes on top. Pure; in-formation marking stays in the UI.
export const ROSTER_FILTER_DEFAULTS =
  Object.freeze({query:'',manufacturer:'',burst:'',element:'',class:'',weapon:'',rarity:''});

export function normalizeRosterFilters(input={}){
  const out = {...ROSTER_FILTER_DEFAULTS};
  if(typeof input.query==='string')out.query = input.query.slice(0,150);
  for(const key of ['manufacturer','burst','element','class','weapon','rarity'])
    if(typeof input[key]==='string')out[key] = input[key];
  return out;
}

export function rosterFilterCount(filters=ROSTER_FILTER_DEFAULTS){
  return Object.entries(filters).filter(([key,value])=>
    key==='query'?value.trim()!=='':value!=='').length;
}

export function filterRoster(characters,filters=ROSTER_FILTER_DEFAULTS){
  const active = normalizeRosterFilters(filters);
  return characters.filter(c=>
    matchesCharacter(c,{query:active.query,manufacturer:active.manufacturer,
      burst:active.burst,element:active.element})
    &&(!active.class||c.class===active.class)
    &&(!active.weapon||c.weapon_type===active.weapon)
    &&(!active.rarity||c.rarity===active.rarity));
}

const VALID_BURST = new Set(BURST_OPTIONS);

function characterById(characters,id){
  return characters.find(c=>c.character_id===id)||null;
}

// Normalize formation UI state. Allows 0-5 members; drops unknown ids,
// drops duplicates (first occurrence wins), clamps the target to a filled
// slot. Never throws for empty formations.
// The canonical Burst form is `rotation` ([{caster, stage}], validated)
// with `rotationIndex` (evaluated position, -1 = none). Legacy per-stage
// `burstCasters` are preserved verbatim for identity tracking and migrate
// into rotation when no explicit rotation is given. opts.reentryByChar
// ({character_id: stage}) enables re-entry-aware rotation validation.
export function normalizeFormationState(input={},characters=[],opts={}){
  const rawIds = Array.isArray(input.members)?input.members
    : Array.isArray(input.memberIds)?input.memberIds : [];
  const seen = new Set(), members = [];
  for(const id of rawIds){
    if(typeof id!=='string'||seen.has(id))continue;
    const character = characterById(characters,id);
    if(!character)continue;
    seen.add(id);members.push(id);
    if(members.length>=FORMATION_SIZE)break;
  }
  const burst = VALID_BURST.has(String(input.burst))?String(input.burst):'none';
  let targetIndex = Number.isInteger(input.targetIndex)?input.targetIndex:0;
  if(members.length===0)targetIndex = -1;
  else if(targetIndex<0||targetIndex>=members.length)targetIndex = 0;
  // Burst casters are identity-based per stage ({1,2,3: character_id}),
  // never slot positions, so swaps keep each caster glued to its
  // character. Unknown ids become unspecified. A legacy single
  // `burstCaster` (old fburstcaster URLs) normalizes to stage 1.
  const burstCasters = {1:null,2:null,3:null};
  const legacy = typeof input.burstCaster==='string'&&members.includes(input.burstCaster)
    ? input.burstCaster : null;
  for(const stage of ['1','2','3']){
    const id = input.burstCasters?.[stage] ?? (stage==='1' ? legacy : null);
    burstCasters[stage] = typeof id==='string'&&members.includes(id) ? id : null;
  }
  const memberChars = members.map(id=>characterById(characters,id)).filter(Boolean);
  const reentryByChar = effectiveReentryByChar(memberChars,
    opts?.reentryByChar||{},opts?.effectsByChar||null);
  let rotation;
  if(Array.isArray(input.rotation))
    rotation = validateRotation(input.rotation,memberChars,reentryByChar);
  else
    rotation = rotationFromStageCasters(burstCasters,memberChars);
  let rotationIndex;
  if(Number.isInteger(input.rotationIndex)
    &&input.rotationIndex>=0&&input.rotationIndex<rotation.length)
    rotationIndex = input.rotationIndex;
  else if(!Array.isArray(input.rotation)&&burst!=='none'){
    const at = rotation.findIndex(e=>e.stage===Number(burst));
    rotationIndex = at;
  }
  else rotationIndex = rotation.length?rotation.length-1:-1;
  // Treasure (Favorite Item) state: ids with treasure ON. Default (absent)
  // is always OFF. Filtered to current members, so removal drops the state
  // and re-adding starts OFF; keyed by character_id, so swaps follow the
  // character, never the slot.
  const treasureSeen = new Set(), treasure = [];
  for(const id of Array.isArray(input.treasure)?input.treasure:[]){
    if(typeof id!=='string'||treasureSeen.has(id)||!members.includes(id))continue;
    treasureSeen.add(id);treasure.push(id);
  }
  return {members,burst,targetIndex,burstCasters,rotation,rotationIndex,treasure};
}

// Treasure eligibility is strictly data-driven: a character is eligible
// only when a treasure-variant effect set is registered for it (or the
// character record itself carries treasure data). Nothing is guessed.
// With the current dataset this is always false — see survey: neither
// NIKKE.GG raw, skill snapshots, Explorer raw, nor effects carry any
// Favorite Item data.
export function isTreasureEligible(character,treasureByChar=null){
  if(!character||typeof character.character_id!=='string')return false;
  if(treasureByChar instanceof Map&&treasureByChar.has(character.character_id))return true;
  if(character.treasure===true)return true;
  if(Array.isArray(character.treasure_skills)&&character.treasure_skills.length)return true;
  return false;
}

export function isSelectableTarget(state,index){
  return Number.isInteger(index)&&index>=0&&index<state.members.length;
}

// Identity tracker for state that must follow a character across reorders
// (burst caster) or fall back when the character leaves the formation.
export function trackMember(members,characterId){
  return typeof characterId==='string'&&members.includes(characterId)?characterId:null;
}

// Burst stage scope of a Burst-slot effect: the stage whose firing this
// record describes. Reads section_condition (both `burst_stage` and legacy
// `stage` keys) with a condition/trigger text fallback (`Burst Stage N`).
// Burst-slot-only: Skill-slot `stage` values (Over Energy, Memory
// Absorption, Golden Chip, ...) are unrelated internal counters and must
// never be read as Burst stages.
// Returns 1, 2, 3, or null (unscoped generic Burst fire).
const BURST_STAGE_TEXT_PATTERN = /burst stage\s*(1|2|3|iii|ii|i)\b/i;
function burstStageToken(value){
  if(value===1||value===2||value===3||value==='1'||value==='2'||value==='3')
    return Number(value);
  if(typeof value!=='string')return null;
  const key = value.trim().toLowerCase();
  if(key==='1'||key==='i')return 1;
  if(key==='2'||key==='ii')return 2;
  if(key==='3'||key==='iii')return 3;
  return null;
}
export function burstStageOf(effect){
  if(effect?.skill_slot!=='Burst')return null;
  const sc = effect?.section_condition;
  if(sc&&typeof sc==='object'){
    for(const key of ['burst_stage','stage']){
      const stage = burstStageToken(sc[key]);
      if(stage!==null)return stage;
    }
  }
  const text = [effect?.trigger,effect?.condition,effect?.parent_effect_description]
    .filter(Boolean).join('\n');
  const match = BURST_STAGE_TEXT_PATTERN.exec(text);
  return match?burstStageToken(match[1]):null;
}

// Burst gate. Burst-slot effects need an explicit stage selection and a
// caster whose burst_stage includes it. A stage-scoped Burst record fired
// at another stage is not the displayed Burst, so it stays visible as
// gated `burst-not-selected` (never silently collapsed, never a caster
// mismatch). A caster that cannot fire the selected stage at all stays
// collapsed (`burst-stage-mismatch`, rotation is not simulated).
// Non-Burst records keep the legacy behavior: only an explicit
// section_condition.stage interacts with the selection, and Full Burst
// event conditions on S1/S2 (which carry no section stage) never become
// `burst-not-selected`.
export function burstGate(effect,caster,burst){
  if(effect?.skill_slot==='Burst'){
    if(burst==='none')return {pass:false,reason:'burst-not-selected'};
    const stage = burstStageOf(effect);
    if(stage!==null&&stage!==Number(burst))
      return {pass:false,reason:'burst-not-selected'};
    if(!caster||!Array.isArray(caster.burst_stage)||!caster.burst_stage.includes(Number(burst)))
      return {pass:false,reason:'burst-stage-mismatch'};
    return {pass:true};
  }
  const stage = effect?.section_condition?.stage ?? null;
  if(stage!==null){
    if(burst==='none')return {pass:false,reason:'burst-not-selected'};
    if(Number(stage)!==Number(burst))return {pass:false,reason:'burst-stage-mismatch'};
  }
  return {pass:true};
}

const WEAPON_ALIASES = new Map([
  ['sg','SG'],['shotgun','SG'],
  ['ar','AR'],['assault_rifle','AR'],['assault rifles','AR'],['assault-rifle','AR'],
  ['sr','SR'],['sniper','SR'],['sniper rifle','SR'],['sniper_rifle','SR'],
  ['smg','SMG'],['mg','MG'],['machine_gun','MG'],['machine gun','MG'],
  ['rl','RL'],['rocket_launcher','RL'],['rocket launcher','RL'],
]);

function normWeapon(value){
  if(!value)return null;
  const key = String(value).trim().toLowerCase();
  return WEAPON_ALIASES.get(key)||String(value).trim().toUpperCase();
}

function sameToken(a,b){
  if(a===null||a===undefined||b===null||b===undefined)return false;
  return String(a).trim().toLowerCase()===String(b).trim().toLowerCase();
}

// Burst-stage requirement carried by the target text itself
// (e.g. "all Burst 3 allies who previously used their Burst Skill").
// Scans ONLY effect.target: squad-composition phrasing in trigger /
// condition / parent text ("no other standard Burst 1 allies") is a
// formation branch, not a target restriction, and is handled separately.
// Returns 1, 2, 3, or null.
const TARGET_BURST_STAGE_PATTERN = /\bburst\s*(1|2|3|iii|ii|i)\b/i;
export function targetBurstStageOf(effect){
  const match = TARGET_BURST_STAGE_PATTERN.exec(effect?.target||'');
  return match?burstStageToken(match[1]):null;
}

// Structural target verdict against the selected target member.
// Returns {applies:boolean, reason:string|null}. Ambiguous or
// unstructured targeting returns applies:false with an explicit
// unknown reason instead of guessing. opts.previouslyCastHolds bypasses
// only the previously-cast part of a selected_allies target: ranked /
// count-based selection is never auto-resolved, and a Burst-stage target
// requirement is still enforced structurally.
export function targetVerdict(effect,target,opts={}){
  if(!target)return {applies:false,reason:'no-target'};
  switch(effect?.target_type){
    case 'self':
      return effect.character_id===target.character_id
        ? {applies:true,reason:null}
        : {applies:false,reason:'self-only'};
    case 'all_allies':
      return {applies:true,reason:null};
    case 'class':
      if(effect.target_class&&target.class)
        return sameToken(effect.target_class,target.class)
          ? {applies:true,reason:null}
          : {applies:false,reason:'class-mismatch'};
      return {applies:false,reason:'target-axes-unstructured'};
    case 'weapon':{
      const want = normWeapon(effect.target_weapon), have = normWeapon(target.weapon_type);
      if(want&&have)
        return want===have
          ? {applies:true,reason:null}
          : {applies:false,reason:'weapon-mismatch'};
      return {applies:false,reason:'target-axes-unstructured'};
    }
    case 'element':
      if(effect.target_element&&target.element)
        return sameToken(effect.target_element,target.element)
          ? {applies:true,reason:null}
          : {applies:false,reason:'element-mismatch'};
      return {applies:false,reason:'target-axes-unstructured'};
    case 'selected_allies':{
      // Ranked / count-based selection (counts, orderings) is never
      // auto-resolved: the formation has no live HP/cover/position.
      if(effect.target_count!=null||effect.target_selection)
        return {applies:false,reason:'ranked-or-conditional-selection'};
      // A Burst-stage target restriction is structural formation data: a
      // target outside that stage provably does not match (exclusion
      // only — never a positive proof, other qualifiers such as element
      // or named states stay unresolved).
      const needStage = targetBurstStageOf(effect);
      if(needStage!==null){
        const have = Array.isArray(target?.burst_stage)?target.burst_stage:[];
        if(!have.includes(needStage))
          return {applies:false,reason:'burst-target-mismatch'};
      }
      if(effect.target_condition&&!opts.previouslyCastHolds)
        return {applies:false,reason:'ranked-or-conditional-selection'};
      // A satisfied previously-cast condition answers the remaining
      // target question (Crown/Ada shapes); anything else stays unknown.
      if(opts.previouslyCastHolds)
        return {applies:true,reason:null};
      return {applies:false,reason:'target-axes-unstructured'};
    }
    case 'hit_targets':
      return {applies:false,reason:'out-of-formation-scope'};
    default:
      return {applies:false,reason:'out-of-formation-scope'};
  }
}

// Named battle states derivable purely from formation composition.
// combat-assist (Rapi): active iff no other standard Burst 1 ally.
// my-own-star (Anis: Star): active iff the owner is the sole Burst 1.
// everyone's-star (Anis: Star): active iff another Burst 1 ally exists.
// Returns true/false, or null when a member lacks burst_stage data.
export function formationStateActive(state,ownerId,members){
  const key = String(state||'').replace(/’/g,"'").toLowerCase();
  if(key!=='combat-assist'&&key!=='my-own-star'&&key!=="everyone's-star")return null;
  // Same owner-based counting as evaluateFormationBranch: Rapi's Combat
  // Assist sees broad B1-capability (Anis counts), Anis's stars see
  // standard B1 only (Rapi never counts). No effective-stage cycles.
  const owner = (members||[]).find(m=>m&&m.character_id===ownerId)||null;
  const standardOnly = burstOneClass(owner)!=='dynamic';
  const b1 = hasOtherBurstStageMember(members,ownerId,1,{standardOnly});
  if(b1===null)return null;
  if(key==='combat-assist')return b1===0;
  if(key==='my-own-star')return b1===0;
  return b1>=1;
}

// Narrow conditional: a trigger/condition text blocks determinism ONLY
// when it depends on information outside formation state (stats, HP,
// stacks, counts, kills, death, resources, chance, unknown states...).
// Pure timing markers (battle start, Full Burst start/end, an established
// Burst/skill firing) and boilerplate (Affects lines, durations) never
// block: "the event has not happened yet" is not a gating reason.
// Formation-proven clauses (held branches, held previously-cast, held
// formation-derived states) are stripped before the check.
// Returns 'vanish' (a formation-derived state provably fails),
// 'conditional' (external dependency remains), or 'deterministic'.
const GATE_BRANCH_CLAUSES = [
  /effects? var(y|ies) according to squad formation/i,
  /squad formation/i,
  /only one (set of )?effects? (is|are) applied/i,
  /no( other)? standard burst 1 allies:?/i,
  /any other burst 1 allies:?/i,
  /there are (no|any|standard )[^.\n]*?burst 1 allies:?/i,
];
const GATE_POLARITY_CLAUSES = [
  /did not previously (cast|use)( their)? burst skills?/i,
  /previously (cast|used)( their)? burst skills?/i,
];
const GATE_TIMING_FULL = [
  /^activates at the start of battle$/i,
  /^activates at the start of battle and when full burst ends$/i,
  /^activates at the (start|beginning) of full burst$/i,
  /^activates when entering full burst$/i,
  /^activates when full burst ends?$/i,
  /^full burst開始時$/i,
  /^skill \d+使用時/i,
  /^skill \d+ activation$/i,
  /^activates when using skill \d+$/i,
  /^the \S+使用時$/i,
  /^activates when performing a full charge attack$/i,
  /^activates when attacking with full charge$/i,
  /^continuous\b/i,
];
const GATE_TIMING_CLAUSE = [
  /activates at the start of battle/i,
  /at the (start|beginning) of full burst/i,
  /when entering full burst/i,
  /when full burst ends?/i,
  /full burst開始時/i,
  /performing a full charge attack/i,
  /attacking with full charge/i,
];
const GATE_BOILERPLATE = [
  /^affects\b/i,
  /continuous/i,
  /^for .*sec/i,
  /^duration\b/i,
  /^lasts? for/i,
  /^burst stage \d+$/i,
];
const GATE_STATE_PATTERNS = [
  [/combat assist/i,'combat-assist'],
  [/my own star/i,'my-own-star'],
  [/everyone'?s star/i,"everyone's-star"],
];
const GATE_BURST_FIRE_FULL =
  /^(burst skill(使用時| activation))$/i;
const GATE_BURST_STAGE_ENTRY_FULL =
  /^activates when entering burst stage (\d+)$/i;

function splitGateSentences(text){
  return String(text||'').split(/[\n。]+/)
    .flatMap(line=>String(line).split(/\.(?=\s|$)/))
    .map(s=>s.trim().replace(/[.。]+$/,'').trim())
    .filter(Boolean);
}

// History/state qualifiers: the outcome depends on battle progression or
// an ongoing state outside formation state — always conditional, even
// when the sentence also mentions an established Burst firing.
const GATE_HISTORY_BLOCK = [
  /for the first time/i,
  /without using/i,
  /after using/i,
  /as long as/i,
];

function gateSentenceVerdict(sentence,ctx){
  let s = sentence;
  if(GATE_HISTORY_BLOCK.some(re=>re.test(s)))return 'conditional';
  if(ctx.branchHeld)
    for(const re of GATE_BRANCH_CLAUSES)s = s.replace(re,' ');
  if(ctx.polarityHeld)
    for(const re of GATE_POLARITY_CLAUSES)s = s.replace(re,' ');
  for(const [pattern,state] of GATE_STATE_PATTERNS){
    if(!pattern.test(s))continue;
    const active = formationStateActive(state,ctx.ownerId,ctx.members);
    if(active===null)return 'conditional';
    const holds = /not in|without/i.test(s)?!active:active;
    if(!holds)return 'vanish';
    s = s.replace(/while\s+(not\s+)?in\s+(the\s+)?.*?(state|status)/i,' ')
      .replace(/in\s+(the\s+)?.*?(state|status)/i,' ');
  }
  if(/stat(e|us)/i.test(s))return 'conditional';
  // Target restrictions ("Affects ...") belong to targetVerdict, never to
  // gate analysis: an Affects sentence alone never blocks determinism.
  if(/^affects\b/i.test(s))return 'deterministic';
  if(ctx.burstFireEstablished&&GATE_BURST_FIRE_FULL.test(s))return 'deterministic';
  if(OWN_BURST_PATTERNS.some(re=>re.test(s)))
    return ctx.burstFireEstablished?'deterministic':'conditional';
  const stageEntry = GATE_BURST_STAGE_ENTRY_FULL.exec(s);
  if(stageEntry)
    return ctx.selectedStage!==null&&Number(stageEntry[1])===ctx.selectedStage
      ? 'deterministic' : 'conditional';
  if(GATE_TIMING_FULL.some(re=>re.test(s)))return 'deterministic';
  let t = s;
  for(const re of GATE_TIMING_CLAUSE)t = t.replace(re,' ');
  for(const re of GATE_BOILERPLATE)t = t.replace(re,' ');
  t = t.replace(/\b(and|while|with|in|the|a|an|if|when|after|at|to|for|of|by|on|as|is|are|be|there|activates?|activation|effects?)\b/gi,' ')
    .replace(/[.,;:'"()（）[\]]/g,' ').replace(/\s+/g,' ').trim();
  return t?'conditional':'deterministic';
}

export function effectGateVerdict(effect,ctx={}){
  if(effect?.activation_chance!==null&&effect?.activation_chance!==undefined)
    return 'conditional';
  if(effect?.duration_type==='conditional')return 'conditional';
  if(effect?.end_condition||effect?.parent_end_condition)return 'conditional';
  if(Array.isArray(effect?.source_limitations)&&effect.source_limitations.length)
    return 'conditional';
  const sc = effect?.section_condition;
  // A Burst-slot stage scope is already enforced by burstGate; any other
  // section staging (Over Energy, Memory Absorption, Golden Chip, attack
  // counts, stack thresholds, ...) depends on battle state.
  if(sc&&JSON.stringify(sc).length>2&&effect?.skill_slot!=='Burst')
    return 'conditional';
  const texts = [effect?.trigger,effect?.condition,
    effect?.parent_trigger,effect?.parent_effect_description].filter(Boolean);
  let saw = false;
  for(const text of texts){
    for(const sentence of splitGateSentences(text)){
      saw = true;
      const verdict = gateSentenceVerdict(sentence,ctx);
      if(verdict==='vanish')return 'vanish';
      if(verdict==='conditional')return 'conditional';
    }
  }
  return 'deterministic';
}

// Human-readable gate lines. Reuses comparison-qa metadata helpers so the
// formation view shows exactly what the comparison drawer shows.
export function gateTextFor(effect,unitNote=''){
  const lines = [];
  if(effect.trigger)lines.push(`Trigger: ${effect.trigger}`);
  if(effect.condition)lines.push(`Condition: ${effect.condition}`);
  const parent = [effect.parent_effect_name,effect.parent_effect_type]
    .filter(Boolean).join(' · ');
  if(parent)lines.push(`Parent: ${parent}`);
  if(effect.parent_trigger)lines.push(`Parent trigger: ${effect.parent_trigger}`);
  if(effect.parent_effect_description)
    lines.push(`Parent: ${effect.parent_effect_description}`);
  if(effect.section_condition&&JSON.stringify(effect.section_condition).length>2)
    lines.push(`Section: ${JSON.stringify(effect.section_condition)}`);
  if(effect.end_condition||effect.parent_end_condition)
    lines.push(`End: ${effect.end_condition||effect.parent_end_condition}`);
  if(effect.duration)lines.push(`Duration: ${effect.duration}`);
  if(effect.activation_chance!==null&&effect.activation_chance!==undefined)
    lines.push(`Chance: ${effect.activation_chance}${effect.activation_chance_unit==='percent'?'%':''}`);
  const target = targetMetadata(effect);
  if(target)lines.push(target);
  const scaling = scalingMetadata(effect,unitNote);
  if(scaling)lines.push(scaling);
  const periodic = periodicMetadata(effect);
  if(periodic)lines.push(periodic);
  if(Array.isArray(effect.source_limitations)&&effect.source_limitations.length)
    lines.push(`Limits: ${effect.source_limitations.join(' · ')}`);
  return lines;
}

// Group resolved rows for bar visualization — pure presentation grouping.
// - Group key is (buff_type, value_unit): different units never mix, and
//   existing semantic splits (atk vs caster_atk_based_atk vs attack_damage)
//   are preserved as-is. No merging, no reclassification.
// - Values are NEVER summed: each bar is one original effect record.
// - Bar width is relative within its own group only (share of the group
//   maximum), so bars must not be compared across groups as strength.
// - Graphable = finite numeric value, non-boolean unit, non-immunity
//   category. Booleans, missing values and debuff-immunity counts become
//   badge rows (label + value, no bar) instead of forced graphs.
const BADGE_TYPES = new Set(['debuff_immunity']);
export function isGraphable(effect){
  return numericRaw(effect)!==null
    &&effect.value_unit!=='boolean'
    &&!BADGE_TYPES.has(effect.buff_type);
}

export function groupEffectsForGraph(rows){
  const groups = new Map();
  for(const row of rows){
    const key = JSON.stringify([row.effect.buff_type,row.effect.value_unit]);
    if(!groups.has(key))groups.set(key,{key,
      buffType:row.effect.buff_type,valueUnit:row.effect.value_unit,
      bars:[],badges:[]});
    const group = groups.get(key);
    if(isGraphable(row.effect))group.bars.push(row);
    else group.badges.push(row);
  }
  for(const group of groups.values()){
    group.bars.sort((a,b)=>
      (numericRaw(b.effect)??-Infinity)-(numericRaw(a.effect)??-Infinity));
    const peak = group.bars.length
      ? Math.max(...group.bars.map(r=>Math.abs(numericRaw(r.effect)??0))) : 0;
    group.peak = peak;
    for(const row of group.bars)
      row.graphWidthPct = peak>0
        ? Math.abs(numericRaw(row.effect)??0)/peak*100 : 0;
  }
  return [...groups.values()].sort((a,b)=>
    CATEGORIES.indexOf(a.buffType)-CATEGORIES.indexOf(b.buffType)
    ||a.valueUnit.localeCompare(b.valueUnit));
}

// Burst trigger events, classified from existing trigger/condition text.
// Classification answers "what event is this" only; whether the event
// holds under the current formation state is decided separately by the
// resolver below. The states "stage selected", "who fired each stage",
// "in Full Burst", "who fired before", and "who is in the formation"
// are never conflated:
// - own_burst: the skill user fires its own Burst Skill. Only explicit
//   self/own/skill-user phrasing, or an UNSCOPED Burst-slot record with a
//   generic fire trigger (a stageless Burst skill fires only when its
//   owner fires it). A stage-scoped Burst-slot record ("Burst Skill
//   activation" + Burst Stage N, e.g. Rapi: Red Hood) is NOT own_burst:
//   it means "this character's Burst fired at stage N" and is evaluated
//   via burstStageOf + the per-stage caster. Ambiguous Skill-slot
//   phrasing such as "Activates when using Burst Skill" is deliberately
//   NOT own_burst — it may mean any ally's Burst.
// - full_burst: Full Burst Time entry/exit/presence. Independent of who
//   fired; never tied to a caster identity and never auto-established.
// - ally_burst: another ally's Burst. Never confused with own_burst.
// - other: everything else (unchanged behavior), including stage-scoped
//   Burst firing, squad-formation branches, and previously-cast
//   conditions, which each have a dedicated evaluation below.
const OWN_BURST_PATTERNS = [/own burst skill/i, /\bown burst\b/i,
  /\b(her|his|their) burst skill/i,
  /skill user[^.]*?burst skill/i, /self[^.]*?burst skill/i];
const ALLY_BURST_PATTERN = /an ally[^.]*?burst skill|ally[^.]*?uses?[^.]*?burst/i;
const FULL_BURST_PATTERN = /\bfull burst\b/i;
const BURST_SLOT_FIRE_PATTERN =
  /^(burst skill(使用時| activation)|activates when using burst skills?\.?)$/i;

export function burstEventOf(effect){
  const text = `${effect?.trigger||''}\n${effect?.condition||''}`;
  if(FULL_BURST_PATTERN.test(text))return 'full_burst';
  if(ALLY_BURST_PATTERN.test(text))return 'ally_burst';
  if(OWN_BURST_PATTERNS.some(re=>re.test(text)))return 'own_burst';
  if(effect?.skill_slot==='Burst'
    &&BURST_SLOT_FIRE_PATTERN.test((effect.trigger||'').trim())
    &&burstStageOf(effect)===null)return 'own_burst';
  return 'other';
}

// Squad-formation branch: "no (other) standard Burst 1 allies" vs "any
// other Burst 1 allies" (Rapi: Red Hood S1, Anis: Star S1). This is about
// WHO IS IN THE FORMATION, never about who fired a Burst, so it is
// evaluated from members' burst_stage and is fully independent of the
// per-stage caster designation. Returns 'no-other-b1', 'any-other-b1',
// or null (no formation branch present).
const FORMATION_NO_B1_PATTERN = /no( other)? standard burst 1 allies/i;
const FORMATION_ANY_B1_PATTERN = /any other burst 1 allies|there are standard burst 1 allies/i;
export function formationBranchOf(effect){
  const text = [effect?.trigger,effect?.condition,
    effect?.parent_trigger,effect?.parent_effect_description]
    .filter(Boolean).join('\n');
  if(FORMATION_NO_B1_PATTERN.test(text))return 'no-other-b1';
  if(FORMATION_ANY_B1_PATTERN.test(text))return 'any-other-b1';
  return null;
}

// B1 classification for condition evaluation, from RAW burst_stage only
// (never rotation/effective stage, so no circular dependency):
// - 'standard': pure Burst 1 ([1] only, e.g. Anis, Liter, Moran).
//   Counts for every B1 check.
// - 'dynamic': multi-stage including 1 (e.g. Rapi: Red Hood [1,3]).
//   Never counts as a "standard Burst 1 ally", but counts for broad
//   B1-capability checks.
// - 'none': cannot fire Burst 1.
export function burstOneClass(character){
  const stages = Array.isArray(character?.burst_stage)?character.burst_stage:[];
  if(stages.length===1&&stages[0]===1)return 'standard';
  return stages.includes(1)?'dynamic':'none';
}

// Other-stage members in the formation, excluding the owner itself.
// The single source of truth for "other Burst N allies" questions: the
// owner's own stage is never counted (a solo B1 Anis sees other-B1 = 0).
// With standardOnly (Stage 1 only), dynamic B1/B3 members do not count.
// Returns the count, or null when a member lacks burst_stage data.
export function hasOtherBurstStageMember(formation,ownerId,stage,opts={}){
  if(stage!==1&&stage!==2&&stage!==3)return null;
  const standardOnly = stage===1&&opts.standardOnly===true;
  let count = 0;
  for(const member of formation||[]){
    if(!member||member.character_id===ownerId)continue;
    if(!Array.isArray(member.burst_stage))return null;
    if(standardOnly){
      if(burstOneClass(member)==='standard')count++;
    }else if(member.burst_stage.includes(stage))count++;
  }
  return count;
}

// Evaluate a formation branch against the formation. The B1 counting rule
// follows the OWNER's class: dynamic owners (multi-stage incl. B1, e.g.
// Rapi) evaluate broad B1-capability — Anis counts for Rapi — while
// standard owners (e.g. Anis) count standard B1 only — Rapi never counts
// for Anis. Unknown owners fall back to standard-only (conservative).
// Returns true (branch taken), false (not taken), or null (unprovable).
export function evaluateFormationBranch(branch,ownerId,members){
  if(branch!=='no-other-b1'&&branch!=='any-other-b1')return null;
  const owner = (members||[]).find(m=>m&&m.character_id===ownerId)||null;
  const standardOnly = burstOneClass(owner)!=='dynamic';
  const count = hasOtherBurstStageMember(members,ownerId,1,{standardOnly});
  if(count===null)return null;
  return branch==='no-other-b1'?count===0:count>=1;
}

// Previously-cast Burst condition (Crown S1, Ada S1): "previously cast
// (their) Burst Skill(s)" vs "did not previously cast (their) Burst
// Skill(s)". This is about ROTATION ORDER relative to the evaluated
// stage — neither own_burst nor full_burst — so it gets a dedicated
// evaluation. Returns 'previously-cast', 'not-previously-cast', or null.
// "Just used their Burst Skills" (Arcana, additionally Electric-gated)
// is deliberately NOT covered: its element qualifier and "just" timing
// cannot be proven from formation state.
const PREV_CAST_NEG_PATTERN = /did not previously (cast|use)( their)? burst skills?/i;
const PREV_CAST_POS_PATTERN = /previously (cast|used)( their)? burst skills?/i;
export function previouslyCastPolarityOf(effect){
  const text = [effect?.trigger,effect?.condition,effect?.target,
    effect?.parent_trigger,effect?.parent_effect_description]
    .filter(Boolean).join('\n');
  if(PREV_CAST_NEG_PATTERN.test(text))return 'not-previously-cast';
  if(PREV_CAST_POS_PATTERN.test(text))return 'previously-cast';
  return null;
}

// Evaluate a previously-cast condition for one target under the rotation
// state (selectedStage 1-3, per-stage casters). Rotation order is
// 1 -> 2 -> 3: stages below the selected one fired before, the selected
// stage is firing now, later stages have not fired. Returns:
// - 'holds': proven (target fired before / provably has not fired before)
// - 'fails': proven otherwise (effect does not apply to this target)
// - 'unresolvable': required caster slots are unspecified or the target
//   is the current-stage caster itself (its "previously or not" status
//   depends on exact Full Burst timing) — never guessed, stays gated.
export function evaluatePreviouslyCast(polarity,target,selectedStage,casters){
  if(polarity!=='previously-cast'&&polarity!=='not-previously-cast')return 'unresolvable';
  const stage = Number(selectedStage);
  if(!Number.isInteger(stage)||stage<1||stage>3)return 'unresolvable';
  const targetId = target?.character_id ?? null;
  const casterOf = key=>{
    const id = casters?.[String(key)];
    return typeof id==='string'&&id?id:null;
  };
  const priorKnown = [], priorComplete = ()=>{
    for(let key=1;key<stage;key++)if(!casterOf(key))return false;
    return true;
  };
  for(let key=1;key<stage;key++){
    const id = casterOf(key);
    if(id)priorKnown.push(id);
  }
  if(targetId&&priorKnown.includes(targetId))
    return polarity==='previously-cast'?'holds':'fails';
  if(!priorComplete())return 'unresolvable';
  if(polarity==='previously-cast')return 'fails';
  // not-previously-cast from here on: no earlier stage fired this target.
  if(targetId===casterOf(stage))return 'unresolvable';
  for(let key=stage+1;key<=3;key++)
    if(targetId&&targetId===casterOf(key))return 'holds';
  for(let key=1;key<=3;key++)if(!casterOf(key))return 'unresolvable';
  return 'holds';
}

// Buff Axis Coverage — pure presence summary over applied resolver rows.
// Input: deterministic + gated rows from resolveFormation (unknown and
// quarantined rows are never applied, so the caller must not pass them;
// rows of any other bucket are defensively ignored here as well).
// Output: one entry per canonical CATEGORIES axis, in canonical order.
// - status 'covered': at least one deterministic row carries the axis.
// - status 'conditional': only gated rows carry it (may or may not apply).
// - status 'uncovered': no applied row carries it.
// - self: true when the target itself provides the axis.
// - providers: distinct caster names carrying the axis (no values, no
//   sums, no ranking — presence only, never a strength judgment).
// Semantic splits (atk vs attack_damage, etc.) are preserved as-is:
// each canonical buff_type is its own axis.
export function buffAxisCoverage(appliedRows=[],target=null){
  const targetId = target?.character_id ?? null;
  const info = new Map();
  for(const row of appliedRows||[]){
    if(row?.bucket!=='deterministic'&&row?.bucket!=='gated')continue;
    const axis = row?.effect?.buff_type;
    if(typeof axis!=='string'||!axis||!CATEGORIES.includes(axis))continue;
    let entry = info.get(axis);
    if(!entry){
      entry = {deterministic:false,conditional:false,self:false,providers:[]};
      info.set(axis,entry);
    }
    if(row.bucket==='deterministic')entry.deterministic = true;
    else entry.conditional = true;
    const casterId = row?.caster?.character_id ?? null;
    if(casterId&&casterId===targetId)entry.self = true;
    const name = row?.caster?.character_name;
    if(name&&!entry.providers.includes(name))entry.providers.push(name);
  }
  return CATEGORIES.map(buffType=>{
    const entry = info.get(buffType);
    return {buffType,
      status:!entry?'uncovered':entry.deterministic?'covered':'conditional',
      self:!!entry?.self,
      providers:entry?[...entry.providers]:[]};
  });
}

// Per-member axis roles against the target's own axes. ownAxes = axes of
// applied rows cast by the target itself (self buffs). For every formation
// member, newAxes = member axes the target does not hold itself,
// existingAxes = member axes the target already holds itself. Presence
// only; overlapping axes are reported as-is without good/bad judgment
// (a duplicated axis with a larger value is still meaningful).
export function memberAxisRoles(appliedRows=[],members=[],target=null){
  const targetId = target?.character_id ?? null;
  const ownAxes = new Set();
  const perMember = new Map();
  for(const row of appliedRows||[]){
    if(row?.bucket!=='deterministic'&&row?.bucket!=='gated')continue;
    const axis = row?.effect?.buff_type;
    const casterId = row?.caster?.character_id ?? null;
    if(typeof axis!=='string'||!axis||!CATEGORIES.includes(axis)||!casterId)continue;
    if(!perMember.has(casterId))perMember.set(casterId,new Set());
    perMember.get(casterId).add(axis);
    if(casterId===targetId)ownAxes.add(axis);
  }
  const order = (a,b)=>CATEGORIES.indexOf(a)-CATEGORIES.indexOf(b);
  return (members||[]).map(member=>({
    member,
    isTarget:member?.character_id===targetId,
    newAxes:[...(perMember.get(member?.character_id)||new Set())]
      .filter(axis=>!ownAxes.has(axis)).sort(order),
    existingAxes:[...(perMember.get(member?.character_id)||new Set())]
      .filter(axis=>ownAxes.has(axis)).sort(order),
  }));
}

// Summability for axis aggregates. A sum is only ever formed from rows
// sharing BOTH buff_type and value_unit: different units, different axes,
// and different scaling semantics (percent vs caster_*_percent vs seconds
// vs conversion vs flat vs ...) never mix. Within one group, only finite
// numeric non-stack non-boolean values are summed; stack effects (value is
// per-stack), booleans, immunity counts and missing values are kept as
// individual rows and excluded from the sum.
export function isSummable(effect){
  return isGraphable(effect)&&effect.stack_count==null;
}

// Buff axis groups with raw-value aggregates — Collapsed (conclusion) data
// for the coverage UI. One group per (buff_type, value_unit); deterministic
// and gated rows are summed SEPARATELY (a conditional sum is never merged
// into the deterministic one). Each sum is a plain Raw-value total over the
// summable subset only — never an effective value (bases, stacks, caps and
// uptime are not considered). Rows stay attached for the Expanded
// (evidence) view. Ordering mirrors groupEffectsForGraph.
export function buffAxisGroups(appliedRows=[],target=null){
  const targetId = target?.character_id ?? null;
  const groups = new Map();
  for(const row of appliedRows||[]){
    if(row?.bucket!=='deterministic'&&row?.bucket!=='gated')continue;
    const effect = row?.effect;
    if(!effect||typeof effect.buff_type!=='string'
      ||!CATEGORIES.includes(effect.buff_type))continue;
    const unit = effect.value_unit||'';
    const key = JSON.stringify([effect.buff_type,unit]);
    if(!groups.has(key))groups.set(key,{buffType:effect.buff_type,valueUnit:unit,
      detRows:[],gatedRows:[],self:false,providers:[]});
    const group = groups.get(key);
    (row.bucket==='deterministic'?group.detRows:group.gatedRows).push(row);
    const casterId = row?.caster?.character_id ?? null;
    if(casterId&&casterId===targetId)group.self = true;
    const name = row?.caster?.character_name;
    if(name&&!group.providers.includes(name))group.providers.push(name);
  }
  const summarize = rows=>{
    const summable = rows.filter(r=>isSummable(r.effect));
    // Round to 2 decimals: Raw values carry at most 2, this only trims
    // binary floating-point residue (e.g. 99.52000000000001 -> 99.52).
    const sum = Math.round(summable.reduce((n,r)=>n+(numericRaw(r.effect)??0),0)*100)/100;
    return {sum,summedCount:summable.length,totalCount:rows.length};
  };
  const out = [];
  for(const group of groups.values()){
    const det = summarize(group.detRows), gated = summarize(group.gatedRows);
    out.push({...group,
      status:group.detRows.length?'covered':group.gatedRows.length?'conditional':'uncovered',
      detSum:det.sum,detSummedCount:det.summedCount,detTotalCount:det.totalCount,
      gatedSum:gated.sum,gatedSummedCount:gated.summedCount,gatedTotalCount:gated.totalCount});
  }
  return out.sort((a,b)=>CATEGORIES.indexOf(a.buffType)-CATEGORIES.indexOf(b.buffType)
    ||a.valueUnit.localeCompare(b.valueUnit));
}

export function conflictBadge(effect){
  if(!effect?.source_conflict)return null;
  const gg = effect.nikke_gg_value ?? '—', ex = effect.nikke_explorer_value ?? '—';
  return `Source conflict: NIKKE.GG ${gg} / Nikke Explorer ${ex} · GG value kept, review required`;
}

// ---- Burst Rotation (canonical form) ----
// A rotation is an ordered list of {caster: character_id, stage: 1|2|3}
// entries: "who fires at which position, at which Burst Stage". Positions
// run inside the 5-member formation — re-entry never adds members.
// Progression: position 0 is always Stage 1; each later position is either
// the normal advance (previous stage + 1) or the previous caster's
// re-entry target stage. A caster's own burst_stage is authoritative: a
// B1-only character can never take a B2/B3 position. Repeating a caster
// in one rotation is allowed only when that caster itself can re-enter
// (has a re-entry target). Picks are validated with truncation at the
// first invalid entry, so incremental UI building stays consistent.
export function reentryTargets(effects=[]){
  const map = {};
  for(const e of effects||[]){
    if(e?.buff_type!=='burst_stage_reentry'||e?.skill_slot!=='Burst')continue;
    const text = [e.source_skill_text,e.parent_effect_description,
      e.condition,e.trigger].filter(Boolean).join('\n');
    const match = /re-?enters? burst stage ([123])/i.exec(text);
    if(match)map[e.character_id] = Number(match[1]);
  }
  return map;
}

function reentryOf(reentryByChar,characterId){
  const target = reentryByChar?.[characterId];
  return target===1||target===2||target===3?target:null;
}

export function validateRotation(picks=[],members=[],reentryByChar={}){
  const byId = new Map((members||[]).map(m=>[m?.character_id,m]));
  const entries = [], used = new Set();
  for(const pick of picks||[]){
    const caster = typeof pick==='string'?pick:pick?.caster;
    if(typeof caster!=='string'||!byId.has(caster))break;
    const stages = byId.get(caster)?.burst_stage;
    if(!Array.isArray(stages))break;
    let allowed;
    if(!entries.length)allowed = [1];
    else{
      allowed = [];
      const prev = entries[entries.length-1];
      if(prev.stage<3)allowed.push(prev.stage+1);
      const reentered = reentryOf(reentryByChar,prev.caster);
      if(reentered!==null)allowed.push(reentered);
    }
    const candidates = [...new Set(allowed)].filter(s=>stages.includes(s));
    if(!candidates.length)break;
    let stage = typeof pick==='object'&&pick!==null?pick.stage:undefined;
    if(stage===undefined||stage===null){
      const prev = entries.length?entries[entries.length-1]:null;
      const advance = prev&&prev.stage<3?prev.stage+1:null;
      stage = candidates.includes(advance)?advance:candidates[0];
    }
    if(!candidates.includes(stage))break;
    if(used.has(caster)&&reentryOf(reentryByChar,caster)===null)break;
    entries.push({caster,stage});
    used.add(caster);
    if(entries.length>=FORMATION_SIZE)break;
  }
  return entries;
}

// Formation-dependent re-entries: Skill-slot burst_stage_reentry records
// whose formation branch currently holds (e.g. Anis: Star's Everyone's
// Star → Stage 1 when another Burst 1 ally exists). Derived from the same
// branch judgment the resolver uses (formationBranchOf +
// evaluateFormationBranch + hasOtherBurstStageMember) — never a parallel
// rule, never a hardcoded character. Burst-slot records are static and
// handled by reentryTargets; needs_review records never qualify.
const REENTRY_TARGET_PATTERN = /(?:re-?enters? burst(?: stage)?|changes to stage)\s*([123])/i;
export function formationDependentReentries(members=[],effectsByChar=null){
  const map = {};
  if(!(effectsByChar instanceof Map))return map;
  for(const member of members||[]){
    if(!member||typeof member.character_id!=='string')continue;
    if(Object.prototype.hasOwnProperty.call(map,member.character_id))continue;
    const effects = effectsByChar.get(member.character_id)||[];
    for(const e of effects){
      if(e?.buff_type!=='burst_stage_reentry')continue;
      if(e?.skill_slot==='Burst')continue;
      if(e?.needs_review)continue;
      const branch = formationBranchOf(e);
      if(!branch)continue;
      if(evaluateFormationBranch(branch,member.character_id,members)!==true)continue;
      const text = [e.source_skill_text,e.parent_effect_description,
        e.condition,e.trigger].filter(Boolean).join('\n');
      const match = REENTRY_TARGET_PATTERN.exec(text);
      if(match){map[member.character_id] = Number(match[1]);break;}
    }
  }
  return map;
}

// Effective re-entry map for rotation validation/options: static
// (Burst-fire) facts plus currently-holding formation-dependent ones.
export function effectiveReentryByChar(members=[],staticMap={},effectsByChar=null){
  return {...formationDependentReentries(members,effectsByChar),...(staticMap||{})};
}

// Valid (caster, stage) options for the position after `entries`.
// Returns [{caster, stages:[...]}] for formation members only.
export function rotationNextOptions(entries=[],members=[],reentryByChar={}){
  const byId = new Map((members||[]).map(m=>[m?.character_id,m]));
  const used = new Set((entries||[]).map(e=>e?.caster));
  let allowed;
  if(!entries.length)allowed = [1];
  else{
    allowed = [];
    const prev = entries[entries.length-1];
    if(prev.stage<3)allowed.push(prev.stage+1);
    const reentered = reentryOf(reentryByChar,prev?.caster);
    if(reentered!==null)allowed.push(reentered);
  }
  const options = [];
  for(const member of members||[]){
    if(!member||!byId.has(member.character_id))continue;
    const stages = Array.isArray(member.burst_stage)?member.burst_stage:[];
    const valid = [...new Set(allowed)].filter(s=>stages.includes(s));
    if(!valid.length)continue;
    if(used.has(member.character_id)&&reentryOf(reentryByChar,member.character_id)===null)continue;
    options.push({caster:member.character_id,stages:valid});
  }
  return options;
}

// Legacy migration: per-stage casters {1,2,3} become rotation entries.
// Casters outside the formation or lacking the stage are skipped (never
// guessed). The selected stage resolves to the first entry carrying it.
export function rotationFromStageCasters(burstCasters={},members=[]){
  const ids = new Set((members||[]).map(m=>m?.character_id));
  const byId = new Map((members||[]).map(m=>[m?.character_id,m]));
  const entries = [];
  for(const stage of [1,2,3]){
    const id = burstCasters?.[String(stage)];
    if(typeof id!=='string'||!ids.has(id))continue;
    const stages = byId.get(id)?.burst_stage;
    if(!Array.isArray(stages)||!stages.includes(stage))continue;
    entries.push({caster:id,stage});
  }
  return entries;
}

// Previously-cast from rotation POSITIONS (never stage numbers): positions
// before the selected one fired before, the selected one fires now, later
// ones have not fired. Explicit rotations are unique by construction, so
// only a missing selection (or the current caster's own not-previously
// status, which depends on exact Full Burst timing) is unresolvable.
export function evaluatePreviouslyCastInRotation(polarity,target,entries,selectedIdx){
  if(polarity!=='previously-cast'&&polarity!=='not-previously-cast')return 'unresolvable';
  if(!Array.isArray(entries)||!Number.isInteger(selectedIdx)
    ||selectedIdx<0||selectedIdx>=entries.length)return 'unresolvable';
  const targetId = target?.character_id ?? null;
  const prior = entries.slice(0,selectedIdx)
    .map(e=>e?.caster).filter(id=>typeof id==='string');
  if(targetId&&prior.includes(targetId))
    return polarity==='previously-cast'?'holds':'fails';
  if(polarity==='previously-cast')return 'fails';
  if(targetId&&targetId===entries[selectedIdx]?.caster)return 'unresolvable';
  return 'holds';
}

// Resolve one target. Works with 0-5 members: empty formation or an
// unselected target yields empty buckets (never throws, never applies).
// burstCasters is an optional {1,2,3: character_id} map; the selected
// stage (`burst`) and the per-stage casters are strictly separated: the
// selected stage says WHICH Burst is displayed, burstCasters says WHO
// fired each stage. Unset stages (or ids outside the formation)
// reproduce the exact pre-caster behavior for that stage: only the Burst
// Stage gates Burst-slot effects and no caster is ever guessed.
//
// Evaluation is two phases: burstEventOf classifies WHAT event a record
// describes, then each dedicated condition is proven from formation
// state — and only from formation state:
// - squad-formation branches ("no/any other Burst 1 allies") are proven
//   from members' burst_stage, independent of any caster designation.
//   A branch not taken removes the effect; a taken branch flows on.
// - stage-scoped Burst firing ("that character's Burst at stage N") needs
//   selectedStage === N; another stage stays visible as gated
//   `burst-not-selected`. Skill-slot Full Burst events never take this
//   path and are never `burst-not-selected`.
// - explicit own-Burst records ("own Burst", "self/skill user uses Burst
//   Skill") belong to exactly one character: the designated caster of
//   the displayed stage. When someone else fired, they leave the visible
//   buckets. Unspecified casters keep the legacy behavior (still gated).
// - remaining Burst-slot records of other members are shown as gated
//   `burst-caster-mismatch` instead of vanishing — except Full Burst and
//   ally-Burst events, which never require the owner to be the caster.
// - previously-cast conditions are proven from rotation order
//   (stages below selected fired before); unprovable cases stay gated.
// Anything unprovable (random, ranked, chance, hidden gameplay state)
// stays gated/unknown — never resolved by guessing.
export function resolveFormation({members=[],targetIndex=0,burst='none',burstCasters=null,rotation=null,rotationIndex=null,treasure=[],treasureByChar=new Map(),effectsByChar=new Map(),characters=[]}={}){
  const out = {deterministic:[],gated:[],unknown:[],quarantined:[]};
  const filled = members.filter(Boolean);
  if(!filled.length)return out;
  if(!Number.isInteger(targetIndex)||targetIndex<0||targetIndex>=filled.length)return out;
  const target = filled[targetIndex];
  // Treasure switching (Favorite Item): treasure ON uses the registered
  // treasure-variant effect set INSTEAD of the normal set (replacement,
  // never addition — a replaced normal effect must not apply twice).
  // Members without a registered set always use normal effects, even when
  // flagged ON, so missing treasure data fails safe to normal behavior.
  const treasureOn = new Set(Array.isArray(treasure)?treasure:[]);
  const effectiveByChar = new Map(effectsByChar);
  for(const id of treasureOn){
    if(treasureByChar instanceof Map&&treasureByChar.has(id))
      effectiveByChar.set(id,treasureByChar.get(id));
  }
  const effectsOf = characterId=>effectiveByChar.get(characterId)||[];
  // Canonical Burst Rotation path: evaluation by rotation POSITION
  // (previously-cast from position order, firing from the selected
  // position's caster+stage). Legacy per-stage casters keep the exact
  // historical stage-based behavior below.
  const canonical = Array.isArray(rotation);
  let burstForGate = 'none', selectedStage = null, stageCaster = null;
  let prevJudge = ()=>'unresolvable';
  if(canonical){
    // Entries whose caster lacks the position stage are dropped: a B1-only
    // character can never occupy a B2/B3 position, so no caster/stage
    // mismatch can arise downstream.
    const entries = rotation
      .filter(e=>e&&typeof e.caster==='string'&&[1,2,3].includes(e.stage)
        &&filled.some(m=>m.character_id===e.caster
          &&Array.isArray(m.burst_stage)&&m.burst_stage.includes(e.stage)));
    const selIdx = Number.isInteger(rotationIndex)?rotationIndex:-1;
    const sel = selIdx>=0&&selIdx<entries.length?entries[selIdx]:null;
    if(sel){
      burstForGate = String(sel.stage);
      selectedStage = sel.stage;
      stageCaster = sel.caster;
    }
    prevJudge = (polarity,t)=>evaluatePreviouslyCastInRotation(polarity,t,entries,selIdx);
  }else{
    if(!VALID_BURST.has(String(burst)))burst = 'none';
    const validCasters = {1:null,2:null,3:null};
    for(const stage of ['1','2','3']){
      const id = burstCasters?.[stage];
      validCasters[stage] = typeof id==='string'&&filled.some(m=>m.character_id===id)?id:null;
    }
    selectedStage = burst==='none'?null:Number(burst);
    stageCaster = selectedStage!==null?validCasters[String(selectedStage)]:null;
    burstForGate = burst;
    prevJudge = (polarity,t)=>evaluatePreviouslyCast(polarity,t,selectedStage,validCasters);
  }
  const stageCasterName = stageCaster
    ? (filled.find(m=>m.character_id===stageCaster)?.character_name||stageCaster) : null;

  for(const caster of filled){
    const effects = effectsOf(caster.character_id);
    for(const effect of effects){
      // Hard gate: needs_review is never applied. This also quarantines
      // every source_conflict record, which per the pipeline invariant
      // always carries needs_review:true.
      if(effect.needs_review){
        out.quarantined.push({effect,caster,bucket:'quarantined',
          reasons:['needs_review'],gateText:gateTextFor(effect),
          conflict:conflictBadge(effect),relation:relation(effect)});
        continue;
      }
      // Squad-formation branch first: it decides the applicable effect set
      // from WHO IS IN THE FORMATION, independent of Burst selection and
      // caster designation.
      const branch = formationBranchOf(effect);
      let branchHeld = false;
      if(branch){
        const held = evaluateFormationBranch(branch,effect.character_id,filled);
        if(held===false)continue;
        if(held===null){
          out.gated.push({effect,caster,bucket:'gated',reasons:['formation-unresolved'],
            gateText:gateTextFor(effect),conflict:conflictBadge(effect),
            relation:relation(effect)});
          continue;
        }
        branchHeld = true;
      }
      const gate = burstGate(effect,caster,burstForGate);
      if(!gate.pass){
        // A Burst fired at another stage/position stays visible as gated;
        // a caster that cannot fire the evaluated stage stays collapsed.
        // Skill-slot Full Burst events never arrive here as
        // burst-not-selected (they carry no section stage).
        if(gate.reason==='burst-not-selected'){
          out.gated.push({effect,caster,bucket:'gated',reasons:[gate.reason],
            gateText:gateTextFor(effect),conflict:conflictBadge(effect),
            relation:relation(effect)});
        }
        continue;
      }
      // Previously-cast condition: proven from rotation order (canonical
      // positions, legacy per-stage casters), never from identity alone.
      const polarity = previouslyCastPolarityOf(effect);
      let previouslyCastHolds = false;
      if(polarity){
        const judged = prevJudge(polarity,target);
        if(judged==='fails')continue;
        if(judged==='unresolvable'){
          out.gated.push({effect,caster,bucket:'gated',reasons:['previously-cast-unresolved'],
            gateText:gateTextFor(effect),conflict:conflictBadge(effect),
            relation:relation(effect)});
          continue;
        }
        previouslyCastHolds = true;
      }
      const event = burstEventOf(effect);
      // Own-Burst events belong to exactly one character: the designated
      // caster of the displayed stage. When someone else fired, this
      // character's own-Burst effects did not happen, so they leave the
      // visible buckets instead of lingering as applicable. Unspecified
      // casters keep the legacy behavior (still listed as gated).
      // Only explicit own records take this path — never Full Burst,
      // ally-Burst, formation, or previously-cast conditions.
      if(stageCaster&&event==='own_burst'
        &&effect.character_id!==stageCaster){
        continue;
      }
      // The displayed stage's caster narrows remaining Burst-slot effects
      // to its own: other members' Bursts cannot fire at the same time, so
      // they are shown as gated with an explicit reason instead of
      // disappearing. Full Burst and ally-Burst events are exempt: they
      // never require the owner to be the caster.
      if(stageCaster&&effect.skill_slot==='Burst'&&effect.character_id!==stageCaster
        &&event!=='full_burst'&&event!=='ally_burst'){
        out.gated.push({effect,caster,bucket:'gated',reasons:['burst-caster-mismatch'],
          gateText:[`Burst caster: ${stageCasterName} — this Burst fires only for its own caster`,
            ...gateTextFor(effect)],
          conflict:conflictBadge(effect),relation:relation(effect)});
        continue;
      }
      const verdict = targetVerdict(effect,target,
        previouslyCastHolds?{previouslyCastHolds:true}:undefined);
      if(!verdict.applies){
        // Ranked/stat/count-based picks: the meaning is clear but the
        // outcome depends on育成 values or battle state, so they are
        // conditional — never unknown.
        if(verdict.reason==='ranked-or-conditional-selection'){
          out.gated.push({effect,caster,bucket:'gated',reasons:[verdict.reason],
            gateText:gateTextFor(effect),conflict:conflictBadge(effect),
            relation:relation(effect)});
          continue;
        }
        if(verdict.reason&&verdict.reason!=='self-only'
          &&!verdict.reason.endsWith('-mismatch')){
          out.unknown.push({effect,caster,bucket:'unknown',
            reasons:[verdict.reason],gateText:gateTextFor(effect),
            conflict:conflictBadge(effect),relation:relation(effect)});
        }
        continue;
      }
      // Narrow conditional: trigger/condition text blocks determinism only
      // when it depends on information outside formation state. Proven
      // branches, held previously-cast clauses, established Burst firing
      // and pure timing/boilerplate never block.
      const gateVerdict = effectGateVerdict(effect,{ownerId:effect.character_id,
        members:filled,branchHeld,polarityHeld:previouslyCastHolds,
        burstFireEstablished:selectedStage!==null&&!!stageCaster
          &&effect.character_id===stageCaster,
        selectedStage});
      if(gateVerdict==='vanish')continue;
      const row = {effect,caster,bucket:'deterministic',reasons:[],
        gateText:gateTextFor(effect),conflict:conflictBadge(effect),
        relation:relation(effect)};
      if(gateVerdict==='conditional'){
        row.bucket = 'gated';row.reasons.push('conditional-or-gated');
        out.gated.push(row);continue;
      }
      out.deterministic.push(row);
    }
  }
  return out;
}

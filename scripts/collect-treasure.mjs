// Favorite Item (treasure) collection — separate pipeline, new files only.
// Existing data/parser/comparison outputs are never touched.
//
// Source policy (documented, no guessing):
// - NIKKE.GG carries NO treasure skill values: the public API skills have
//   exactly 3 normal slots per character and no treasure fields; GG pages
//   are JS-rendered. GG articles are used only to validate the holder list,
//   per-skill change scope, and Centi's rework final state (see GG_REFS).
// - All Lv.10 treasure values come from Nikke Explorer's structured
//   favorite_item.skill_replace database (secondary source, same Lv.10
//   convention: 10-entry parameter arrays, 10th entry used). Explorer
//   never replaces a GG value because GG has no treasure values.
// - Current final state wins: live Explorer data is post-Centi-rework
//   (Stockpile mechanics present; values differ from the superseded June
//   2026 GG adjustment notice). Nothing is hand-computed; unparseable
//   sections become needs_review and are never enabled.
import {readFile,writeFile,mkdir,readdir,stat} from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {extractCharacter} from './source-model.mjs';
import {normalizeEffectAxes} from './effect-grammar.mjs';
import {validateDataset} from './validate-data.mjs';

const RAW_DIR = 'work/nikke-explorer-treasure-raw';
const EXPLORER_PAGE = 'https://nikke.exynan.my.id/character/';
const SLOT_NAMES = {1:'Skill 1',2:'Skill 2',3:'Burst'};
// GG references used for holder/change-scope/Centi-final validation
// (prose only — no Lv.10 values taken from articles).
const GG_REFS = [
  'https://nikke.gg/centis-favorite-item-skill-adjustment-and-skill-reset-notice/',
  'https://nikke.gg/tove-favorite-item-analysis/',
  'https://nikke.gg/collection-item-guide-and-overview/',
];

function tenth(parameters){
  const out = {};
  for(const [key,value] of Object.entries(parameters||{})){
    out[key] = Array.isArray(value)?value[9]:value;
  }
  return out;
}

export async function collectTreasure({write=true}={}){
  const characters = JSON.parse(await readFile('data/characters.json','utf8'));
  const byId = new Map(characters.map(c=>[c.character_id,c]));
  const charSchema = JSON.parse(await readFile('data/character-schema.json','utf8'));
  const effectSchema = JSON.parse(await readFile('data/effect-schema.json','utf8'));
  const files = (await readdir(RAW_DIR)).filter(f=>f.endsWith('.json')&&!f.startsWith('_'));
  const holders = [], snapshots = [], effects = [], reviews = [], nonBuff = [];
  for(const file of files.sort()){
    const raw = JSON.parse(await readFile(join(RAW_DIR,file),'utf8'));
    const data = raw.data||raw;
    const fav = data.favorite_item;
    if(!fav||!Array.isArray(fav.skill_replace)||!fav.skill_replace.length)continue;
    const slug = file.replace(/\.json$/,'');
    const character = characters.find(c=>{
      const m = /\/character\/([a-z0-9-]+)/.exec(c.nikke_explorer_url||'');
      return m&&m[1]===slug;
    });
    if(!character)continue;
    const checkedAt = (await stat(join(RAW_DIR,file))).mtime.toISOString();
    const skills = [];
    const missing = [];
    for(const slot of [1,2,3]){
      const entry = fav.skill_replace.find(s=>s.slot===slot);
      if(!entry){missing.push(SLOT_NAMES[slot]);continue;}
      const levels = Array.from({length:10},()=>({}));
      levels[9] = tenth(entry.parameters);
      skills.push({id:`treasure-${slot}`,name:entry.name,description:entry.description,
        levels,cooldown:entry.cooldown??null,skill_slot:SLOT_NAMES[slot],
        source_type:'nikke_explorer',source_url:`${EXPLORER_PAGE}${slug}`,
        source_checked_at:checkedAt,treasure_phase:entry.favorite_item_phase??null});
    }
    const extracted = extractCharacter({skills},character);
    const phaseOf = id=>{
      const m = /^treasure-([123])$/.exec(String(id||'').split(':').pop()||'');
      const entry = m?fav.skill_replace.find(s=>s.slot===Number(m[1])):null;
      return entry?.favorite_item_phase??null;
    };
    for(const s of extracted.snapshots)
      snapshots.push({...s,treasure_item:fav.name??null,treasure_phase:phaseOf(s.source_skill_id)});
    for(const e of extracted.effects)
      effects.push(normalizeEffectAxes({...e,treasure_item:fav.name??null,treasure_phase:phaseOf(e.source_skill_id)}));
    for(const r of extracted.reviews)
      reviews.push({...r,treasure_item:fav.name??null,needs_review:true});
    for(const e of extracted.nonBuffEffects)
      nonBuff.push({...e,treasure_item:fav.name??null,treasure_phase:phaseOf(e.source_skill_id)});
    if(missing.length)
      reviews.push({review_id:`treasure-missing:${character.character_id}`,character_id:character.character_id,
        character_name:character.character_name,skill_slot:missing.join(','),skill_name:'Favorite Item skill',
        source_type:'nikke_explorer',source_url:`${EXPLORER_PAGE}${slug}`,source_checked_at:checkedAt,
        source_text:'',treasure_item:fav.name??null,
        reason:`Favorite Item skill枠の欠損：${missing.join(' / ')}。推測せず未確認のまま残します。`,needs_review:true});
    holders.push({character_id:character.character_id,character_name:character.character_name,
      slug,treasure_item:fav.name??null,
      slots:[1,2,3].filter(slot=>fav.skill_replace.some(s=>s.slot===slot)),
      covered_slots:[1,2,3].filter(slot=>{
        const snap = extracted.snapshots.find(s=>s.source_skill_id===`treasure-${slot}`);
        return snap&&!snap.needs_review;
      }).map(slot=>SLOT_NAMES[slot]),
      effect_count:extracted.effects.filter(e=>!e.needs_review).length,
      review_count:extracted.reviews.length+(missing.length?1:0),
      source_checked_at:checkedAt});
  }
  const errors = validateDataset(characters,effects,charSchema,effectSchema);
  const report = {generated_at:new Date().toISOString(),parser_version:null,
    source_policy:'NIKKE.GG has no treasure skill values (API: 3 normal slots, no treasure fields). All Lv.10 treasure values: Nikke Explorer favorite_item.skill_replace (secondary). GG articles validate holder list, change scope and Centi final state only.',
    gg_references:GG_REFS,
    holder_count:holders.length,
    skill_count:holders.reduce((n,h)=>n+h.slots.length,0),
    effect_count:effects.filter(e=>!e.needs_review).length,
    review_count:reviews.length,
    conflict_count:0,
    note:'Explorer never replaces a GG value (no GG treasure values exist). Current final state wins (post-Centi-rework live data). Unparseable sections are needs_review and never enabled.',
    holders,validation_errors:errors};
  try{
    const main = JSON.parse(await readFile('data/collection-report.json','utf8'));
    report.parser_version = main.parser_version;
  }catch{/* provenance stays null rather than guessed */}
  if(write){
    await mkdir('data',{recursive:true});
    await writeFile('data/treasure-snapshots.json',JSON.stringify(snapshots,null,1));
    await writeFile('data/treasure-effects.json',JSON.stringify(effects,null,1));
    await writeFile('data/treasure-non-buff-effects.json',JSON.stringify(nonBuff,null,1));
    await writeFile('data/treasure-review-queue.json',JSON.stringify(reviews,null,1));
    await writeFile('data/treasure-report.json',JSON.stringify(report,null,1));
  }
  return {snapshots,effects,reviews,nonBuff,report,errors};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const {report,errors} = await collectTreasure();
  console.log(JSON.stringify({holders:report.holder_count,skills:report.skill_count,
    effects:report.effect_count,reviews:report.review_count,conflicts:report.conflict_count,
    validation_errors:errors.length},null,1));
  if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}
}

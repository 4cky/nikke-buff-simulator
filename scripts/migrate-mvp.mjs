// One-time migration. Does not overwrite an existing manually reviewed dataset.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {levelTen,SLOTS,SOURCE_URL} from './source-model.mjs';
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const sources=await read('work/nikke-gg-raw/characters.json');
const legacy=await read('data/buffs.json');
const effects=legacy.map((r,i)=>{
  const c=sources.find(c=>c.name===r.character_name);
  if (!c) throw Error(`Missing character: ${r.character_name}`);
  const s=c.skills[SLOTS.indexOf(r.skill_slot)], text=levelTen(s).text;
  return {...r,character_id:`nikke-${c.id}`,effect_id:`curated:${c.id}:${i}`,skill_level:10,
    source_skill_id:String(s.id),source_skill_text:text,source_api_url:SOURCE_URL,
    source_skill_hash:createHash('sha256').update(text).digest('hex'),
    needs_review:false,validation_status:'curated',direction:r.buff_type==='burst_cooldown_reduction'?'decrease':'increase'};
});
// Explicit corrections verified against the fetched Lv.10 text, not game math.
for(const r of effects){
  if(r.character_name==='Red Hood'&&r.value===71.42){r.buff_type='atk';r.value_unit='percent';r.source_text='ATK ▲ 71.42% for 10 sec.';r.notes='現行NIKKE.GGの通常ATK表記に合わせて旧MVPのcaster分類を修正。';}
  if(r.character_name==='D: Killer Wife'&&r.buff_type==='caster_atk_based_atk'){r.value=12.19;r.max_raw_value=12.19;r.source_text="ATK ▲ 12.19% of the skill user's ATK for 10 sec.";r.notes='現行Lv.10原文に合わせて旧MVPの12%を修正。';}
  if(r.character_name==='Crown'&&r.value===4.06){r.trigger='通常攻撃43回後';r.source_text='Relax: Incoming Healing ▲ 4.06% continuously. Stacks up to 20 times.';}
  if(r.character_name==='Alice'&&r.value===11.67){r.value_unit='caster_charge_speed_percent';r.value_basis='caster_charge_speed';r.source_text="Charge Speed ▲ 11.67% of the skill user's Charge Speed for 10 sec.";r.notes='発動者のチャージ速度基準。通常percentと数値ソートの単位グループを分離。';}
}
const redCooldown=effects.find(r=>r.character_name==='Red Hood'&&r.buff_type==='burst_cooldown_reduction');
redCooldown.trigger='Beast Cage使用時';redCooldown.condition='Burst Iとして使用。1戦闘につき1回';
effects.push({...redCooldown,effect_id:'curated:470:burst2-cdr',trigger:'The Last Howl使用時',condition:'Burst IIとして使用。1戦闘につき1回'});
for (const [name,slot,duration,trigger] of [['Red Hood','Skill 2','継続','戦闘開始時'],['Naga','Burst','10 sec','Burst Skill使用時']]){
  const sample=effects.find(r=>r.character_name===name&&r.skill_slot===slot);
  effects.push({...sample,effect_id:`curated:${sample.character_id}:pierce`,target:'自身',target_type:'self',
    buff_type:'other',value:true,value_unit:'boolean',duration,trigger,condition:'',stack_count:null,max_raw_value:null,
    notes:'Pierce',source_text:`Gains Pierce${duration==='継続'?'. This effect is continuous.':' for 10 sec.'}`});
}
await writeFile('data/curated-effects.json',JSON.stringify(effects,null,2)+'\n',{flag:'wx'});
console.log(`Migrated ${legacy.length} original records to ${effects.length} separately sourced effects.`);

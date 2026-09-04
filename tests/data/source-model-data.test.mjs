import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('published automatic effects retain matching Lv.10 snapshots',()=>{
  const load=name=>JSON.parse(readFileSync(new URL(`../../data/${name}.json`,import.meta.url),'utf8'));
  const effects=load('effects').filter(e=>e.validation_status==='rule_matched'),snapshots=load('skill-snapshots');
  for(const e of effects){
    const s=snapshots.find(s=>s.character_id===e.character_id&&s.source_skill_id===e.source_skill_id);
    assert.equal(e.source_skill_text,s.text);
    if(typeof e.value==='number')assert.ok(s.text.includes(String(Math.abs(e.value))),e.effect_id);
    else {assert.equal(e.value,true);assert.match(s.text,/Pierce|Invulnerable|Taunt|shares (?:damage taken|HP recovery)|Indomitability|unlimited ammunition|(?:debuff )?immunity to|immune to stack count|Re-enters Burst|Changes to Burst Stage|Prevents being targeted by single-target attacks|deal true damage|Forced Reload|Converts damage to Elemental Advantage damage/i);}
    assert.ok(!e.source_text.includes('{description_value_'));assert.equal(e.skill_level,10);
  }
});

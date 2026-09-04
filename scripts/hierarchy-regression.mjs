import assert from 'node:assert/strict';
import {parseSkillHierarchy} from './skill-hierarchy.mjs';
export const A2_MODE_B={character_id:'nikke-811',character_name:'A2',skill_slot:'Burst',skill_name:'Mode B',skill_level:10,
  source_type:'nikke_gg',source_url:'https://nikke.gg/characters/a2/',source_checked_at:'2026-08-28T15:22:02.764Z',
  text:`■ Affects self.
Mode B
Function: Reduces HP every second in exchange for increased ATK and Charge Speed. Mode B is removed when this unit's HP drops to 40% or below.
Effect 1: Current HP ▼ 3.99% every second.
Effect 2: ATK ▲ 15.19%.
Effect 3: Charge Speed ▲ 35.88%.`};
export function assertHierarchyRegression(){
  const h=parseSkillHierarchy(A2_MODE_B),group=h.sections[0].groups[0],buffs=group.children.filter(c=>c.comparison_eligible);
  assert.equal(group.parent_effect_name,'Mode B');assert.equal(group.parent_effect_type,'mode');
  assert.deepEqual(buffs.map(c=>[c.effect.buff_type,c.effect.value,c.effect.effect_index]),[['atk',15.19,2],['charge_speed',35.88,3]]);
  for(const c of buffs){
    assert.equal(c.effect.target_type,'self');assert.equal(c.effect.trigger,'Burst Skill activation');
    assert.equal(c.effect.duration_type,'conditional');assert.equal(c.effect.end_condition,'HP <= 40%');
    assert.equal(c.effect.parent_end_condition,'HP <= 40%');assert.match(c.effect.parent_effect_description,/removed when/);
  }
  const cost=group.children[0];assert.equal(cost.effect.effect_type,'penalty');assert.equal(cost.effect.value,3.99);
  assert.equal(cost.effect.interval_seconds,1);assert.equal(cost.comparison_eligible,false);
  return true;
}

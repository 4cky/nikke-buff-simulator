import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {auditComparisonDataset,canRawSort,targetMetadata,scalingMetadata,periodicMetadata} from '../../comparison-qa.js';
import {catalogGroups} from '../../catalog-model.js';
import {summarizeRows} from '../../view-model.js';
import {portraitUrlFor} from '../../formation-model.js';

const read=name=>JSON.parse(readFileSync(new URL(`../../data/${name}.json`,import.meta.url),'utf8'));
const text=name=>readFileSync(new URL(`../../${name}`,import.meta.url),'utf8');
const characters=read('characters'),effects=read('effects'),nonbuff=read('non-buff-effects'),metadata=read('metadata-only-effects'),queue=read('review-queue'),report=read('collection-report'),manifest=read('dataset-manifest');
const names=rows=>rows.map(r=>r.character.character_name);

test('comparison dataset is exactly 991 buff/heal/revive records',()=>{
  const audit=auditComparisonDataset(effects,{expectedCount:991,expectedCounts:{buff:898,heal:90,revive:3}});
  assert.deepEqual(audit.errors,[]);assert.deepEqual(audit.counts,{buff:898,heal:90,revive:3});
});
test('excluded datasets contain exactly 400 records',()=>{
  assert.equal(nonbuff.length,377);assert.equal(metadata.length,23);assert.equal(nonbuff.length+metadata.length,400);
});
test('no excluded effect type or review flag enters comparison',()=>{
  const forbidden=new Set(['damage','debuff','penalty','resource','weapon_state','special_mechanic']);
  assert.equal(effects.filter(e=>forbidden.has(e.effect_type)||e.metadata_only||e.comparison_excluded||e.needs_review).length,0);
});
test('comparison, excluded and metadata effect IDs never overlap',()=>{
  const e=new Set(effects.map(x=>x.effect_id)),n=new Set(nonbuff.map(x=>x.effect_id)),m=new Set(metadata.map(x=>x.effect_id));
  assert.equal([...e].filter(x=>n.has(x)||m.has(x)).length,0);assert.equal([...n].filter(x=>m.has(x)).length,0);
});
test('startup audit rejects forbidden, pending and duplicate records',()=>{
  const bad=[effects[0],effects[0],{...effects[0],effect_id:'bad-damage',effect_type:'damage'},{...effects[0],effect_id:'bad-review',needs_review:true}];
  const errors=auditComparisonDataset(bad).errors;assert.ok(errors.some(x=>x.includes('duplicate')));assert.ok(errors.some(x=>x.includes('excluded effect_type')));assert.ok(errors.some(x=>x.includes('needs_review')));
});
test('reference ATK and Max HP remain separate from caster categories',()=>{
  const guilty=effects.find(e=>e.character_name==='Guilty'&&e.buff_type==='reference_atk_based_atk');
  const sin=effects.find(e=>e.character_name==='Sin'&&e.buff_type==='reference_max_hp_based_max_hp');
  const quency=effects.find(e=>e.character_name==='Quency'&&e.buff_type==='reference_max_hp_based_max_hp');
  assert.equal(guilty.value_unit,'reference_atk_percent');assert.equal(sin.reference_target_type,'ally');assert.equal(quency.reference_target_type,'nikke');
  assert.match(scalingMetadata(guilty),/reference stat: atk/);assert.match(scalingMetadata(sin),/reference stat: max_hp/);
});
test('source limitation is available for detailed display without blocking comparison',()=>{
  const anis=effects.find(e=>e.character_name==='Anis'&&e.skill_slot==='Skill 2'&&e.buff_type==='def');
  const anne=effects.find(e=>e.character_name==='Anne: Miracle Fairy'&&e.buff_type==='incoming_healing');
  assert.deepEqual(anis.source_limitations,['trigger_not_stated']);assert.equal(anis.trigger,null);assert.deepEqual(anne.source_limitations,['duration_not_stated']);assert.equal(anne.duration,null);
  assert.match(text('app.js'),/Trigger: Not stated in source/);assert.match(text('app.js'),/Duration: Not stated in source/);
});
test('selected ally metadata preserves count, selection, weapon and element',()=>{
  const anis=effects.find(e=>e.character_name==='Anis'&&e.skill_slot==='Skill 2'&&e.buff_type==='def');
  const trina=effects.find(e=>e.character_name==='Trina'&&e.buff_type==='hit_rate');
  assert.match(targetMetadata(anis),/count: 2/);assert.match(targetMetadata(anis),/highest final ATK/);assert.match(targetMetadata(anis),/includes self/);
  assert.match(targetMetadata(trina),/weapon: assault_rifle/);assert.match(targetMetadata(trina),/element: electric/);assert.match(targetMetadata(trina),/all_matching_allies/);
});
test('periodic heal exposes tick interval and duration separately',()=>{
  const heal=effects.find(e=>e.effect_type==='heal'&&e.tick_interval===1&&e.duration_value===5);assert.ok(heal);assert.match(periodicMetadata(heal),/tick: 1 seconds/);assert.equal(heal.duration,'5 sec');
});
test('manufacturer, burst, element, scope and buff filters compose as AND',()=>{
  const rows=catalogGroups(characters,effects,{manufacturer:'Pilgrim',burst:'2',element:'Iron',mode:'allies',type:'attack_damage'});
  assert.ok(rows.some(r=>r.character.character_name==='Crown'));assert.ok(rows.every(r=>r.character.manufacturer==='Pilgrim'&&r.character.burst_stage.includes(2)&&r.character.element==='Iron'));
});
test('multi-stage Burst arrays hit every applicable filter',()=>{
  const red=characters.find(c=>c.character_name==='Red Hood');assert.deepEqual(red.burst_stage,[1,2,3]);for(const burst of ['1','2','3'])assert.ok(names(catalogGroups(characters,effects,{burst})).includes('Red Hood'));
});
test('name and release sort directions are stable; unknown release dates stay last',()=>{
  const az=names(catalogGroups(characters,effects,{sort:'name_asc'})),za=names(catalogGroups(characters,effects,{sort:'name_desc'}));assert.deepEqual(za,[...az].reverse());
  const known=characters.filter(c=>c.release_date).length;for(const sort of ['release_asc','release_desc'])assert.ok(catalogGroups(characters,effects,{sort}).slice(known).every(r=>r.character.release_date===null));
});
test('boolean beneficial effects cannot enable Raw Value sorting',()=>{
  assert.equal(canRawSort(effects,'pierce'),false);assert.equal(canRawSort(effects,'invulnerability'),false);
  const rows=catalogGroups(characters,effects,{type:'pierce',sort:'value_desc'});assert.ok(rows.every(r=>r.metric===undefined));
});
test('mixed value units cannot be ranked as one Raw Value scale',()=>{
  assert.equal(canRawSort(effects,'max_ammo'),false);assert.equal(canRawSort(effects,'atk'),true);assert.equal(canRawSort(effects,'reference_atk_based_atk'),true);
});
test('multiple skills sharing one buff type retain every effect',()=>{
  const crown=effects.filter(e=>e.character_name==='Crown'&&e.buff_type==='attack_damage'),row=summarizeRows(crown)[0];assert.equal(crown.length,2);assert.equal(row.effects.length,2);assert.equal(row.top.value,36.24);
});
test('iDoll Sun remains only in Review and never enters comparison',()=>{
  assert.equal(queue.length,1);assert.equal(queue[0].character_name,'iDoll Sun');assert.equal(queue[0].needs_review,true);assert.equal(effects.some(e=>e.review_key===queue[0].review_key||e.effect_id.includes('nikke-308:Skill 2:section-0')),false);
});
test('narrow layout retains horizontal rows, scrolling and sticky identity column',()=>{
  const css=text('styles.css');assert.match(css,/\.comparison-list \{ overflow-x:auto/);assert.match(css,/\.comparison-columns>span:first-child,\.character-identity \{ position:sticky; left:0/);assert.doesNotMatch(css,/@media\(max-width:480px\)[\s\S]*?\.character-row \{ grid-template-columns:1fr; \}/);
});
test('About and detail templates expose version, source and structured context',()=>{
  const html=text('index.html'),app=text('app.js');assert.match(html,/id="parser-version"/);assert.match(html,/id="dataset-generated-at"/);assert.match(html,/detail-target-meta/);assert.match(html,/detail-scaling/);assert.match(html,/detail-section-condition/);assert.match(html,/detail-limitations/);
  assert.match(app,/Source conflict:/);assert.equal(report.parser_version,'4.2.2');assert.equal(report.visible_characters,199);assert.equal(report.comparable_effects,991);
});
test('startup fetches every required JSON and validates exact manifest counts',()=>{
  const app=text('app.js'),server=text('scripts/review-server.mjs');
  for(const name of ['characters','effects','collection-report','dataset-manifest'])assert.match(app,new RegExp(`['\"]${name}['\"]`));
  assert.deepEqual(manifest.comparison_effect_type_counts,{buff:898,heal:90,revive:3});
  assert.match(app,/pre-validation counts/);assert.match(app,/post-validation counts/);assert.match(app,/expectedCounts:manifest\.comparison_effect_type_counts/);
  assert.match(server,/comparison-qa\.js/);assert.match(server,/dataset-manifest/);
});
test('comparison portraits reuse formation resolution for all 199 characters',()=>{
  const urls=characters.map(c=>portraitUrlFor(c));
  assert.equal(urls.length,199);
  assert.ok(urls.every(u=>typeof u==='string'&&u.startsWith('https://static.dotgg.gg/nikke/characters/')&&u.endsWith('.webp')));
  assert.equal(new Set(urls).size,199);
  assert.equal(portraitUrlFor(null),null);
  const app=text('app.js');
  assert.match(app,/portraitUrlFor[^;]*from '\.\/formation-model\.js'/);
  assert.doesNotMatch(app,/static\.dotgg\.gg/);
  const html=text('index.html');
  assert.match(html,/class="character-portrait"/);
  assert.match(html,/character-identity"><span class="character-portrait"[^]*?character-name/);
  assert.match(app,/img\.loading = 'lazy'/);
  assert.match(app,/addEventListener\('error'/);
});
test('portrait column stays compact, sticky and responsive',()=>{
  const css=text('styles.css');
  assert.match(css,/\.character-portrait \{[^}]*width:36px[^}]*height:36px/);
  assert.match(css,/\.character-portrait img \{[^}]*object-fit:cover/);
  assert.match(css,/\.comparison-columns>span:first-child,\.character-identity \{ position:sticky; left:0/);
  assert.match(css,/\.comparison-columns,\.character-row \{ min-width:720px/);
  assert.match(css,/@media\(max-width:480px\)[\s\S]*?\.comparison-columns,\.character-row \{ min-width:680px/);
  assert.match(css,/@media\(max-width:480px\)[\s\S]*?\.character-portrait \{[^}]*width:30px/);
  assert.doesNotMatch(css,/@media\(max-width:480px\)[\s\S]*?\.character-row \{ grid-template-columns:1fr; \}/);
});
test('comparison renders one portrait per row from formation resolution',async()=>{
  const html=text('index.html');
  const knownIds=new Set([...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]));
  const portraits=[],names=[];
  function makeEl2(tag,cls=''){
    const el={tag,children:[],textContent:'',value:'',checked:false,disabled:false,
      hidden:false,dataset:{},style:{},
      classList:{add(){},remove(){},toggle(){},contains:()=>false},
      append(...n){el.children.push(...n);return el;},
      appendChild(n){el.children.push(n);return n;},
      replaceChildren(...n){el.children=n;return el;},
      addEventListener(){},removeEventListener(){},
      setAttribute(){},getAttribute:()=>null,hasAttribute:()=>false,
      querySelector:()=>null,querySelectorAll:()=>[],add(){}};
    return el;
  }
  const elements=new Map();
  const elFor=id=>{
    if(!elements.has(id)){
      const el=makeEl2();
      if(id==='character-template')el.content={cloneNode:()=>{
        const byClass=new Map();
        const get=cls=>{
          if(!byClass.has(cls)){
            const node=makeEl2('span',cls);
            if(cls==='character-portrait')portraits.push(node);
            if(cls==='character-name')names.push(node);
            byClass.set(cls,node);
          }
          return byClass.get(cls);
        };
        return {querySelector:sel=>get(sel.replace('.',''))};
      }};
      if(id==='sort-select')el.value='name_asc';
      elements.set(id,el);
    }
    return elements.get(id);
  };
  globalThis.document={createElement:t=>makeEl2(t),
    createTextNode:t=>({textContent:t}),
    querySelector:s=>{const m=/^#([\w-]+)$/.exec(s||'');
      return m&&knownIds.has(m[1])?elFor(m[1]):null;},
    querySelectorAll:()=>[],addEventListener(){},body:makeEl2('body')};
  globalThis.window={addEventListener(){}};
  globalThis.location={protocol:'http:',search:'',pathname:'/index.html',hash:''};
  globalThis.history={replaceState(){}};
  globalThis.Option=function(t,v){this.textContent=t;this.value=v;};
  globalThis.fetch=async url=>{
    const m=/\/data\/(.+)\.json/.exec(String(url));
    if(!m)throw Error('fetch '+url);
    return {ok:true,status:200,
      json:async()=>JSON.parse(readFileSync(new URL(`../../data/${m[1]}.json`,import.meta.url),'utf8'))};
  };
  const rejections=[];
  const onReject=r=>rejections.push(r);
  process.on('unhandledRejection',onReject);
  await import('../../app.js?portrait-boot');
  await new Promise(r=>setTimeout(r,300));
  process.removeListener('unhandledRejection',onReject);
  assert.equal(rejections.length,0);
  assert.equal(names.length,199);
  assert.equal(portraits.length,199);
  const imgs=portraits.flatMap(p=>p.children.filter(c=>c.tag==='img'));
  assert.equal(imgs.length,199);
  assert.ok(imgs.every(i=>i.src.startsWith('https://static.dotgg.gg/nikke/')));
  assert.equal(new Set(imgs.map(i=>i.src)).size,199);
  assert.ok(imgs.every(i=>i.loading==='lazy'));
  delete globalThis.document;delete globalThis.window;delete globalThis.location;
  delete globalThis.history;delete globalThis.Option;delete globalThis.fetch;
});
test('startup failure is visible in console and UI instead of becoming silent zero counts',()=>{
  const app=text('app.js');assert.match(app,/catch \(error\)/);assert.match(app,/console\.error\('\[NIKKE Buff Atlas\] initialization failed'/);assert.match(app,/file:\/\/ direct launch is unsupported/);
});

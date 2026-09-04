import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {filterRoster} from '../../formation-model.js';

const root = join(dirname(fileURLToPath(import.meta.url)),'../..');
const html = await readFile(join(root,'formation.html'),'utf8');
const knownIds = new Set([...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]));

let created = [];
function makeEl(){
  const el = {
    children:[],textContent:'',value:'',checked:false,disabled:false,
    hidden:false,dataset:{},style:{},_handlers:{},
    classList:{add(){},remove(){},toggle(){},contains:()=>false},
    append(...nodes){el.children.push(...nodes);return el;},
    appendChild(n){el.children.push(n);return n;},
    replaceChildren(...nodes){el.children = nodes;return el;},
    addEventListener(type,fn){(el._handlers[type]??=[]).push(fn);},
    removeEventListener(){},
    setAttribute(){},getAttribute:()=>null,hasAttribute:()=>false,
    querySelector:()=>null,querySelectorAll:()=>[],
  };
  created.push(el);
  return el;
}

let elements = new Map();
let rejections = [];
process.on('unhandledRejection',reason=>{rejections.push(reason);});

// Boot the real formation.js init() with a URL query and return handles.
// Each query string yields an isolated module instance.
let bootCount = 0;
async function boot(search){
  elements = new Map();
  created = [];
  rejections = [];
  globalThis.document = {
    createElement:()=>makeEl(),
    createTextNode:text=>({textContent:text}),
    querySelector:sel=>{
      const m = /^#([\w-]+)$/.exec(sel||'');
      if(!m||!knownIds.has(m[1]))return null;
      if(!elements.has(m[1]))elements.set(m[1],makeEl());
      return elements.get(m[1]);
    },
    querySelectorAll:()=>[],
    addEventListener(){},
    body:makeEl(),
  };
  globalThis.window = {addEventListener(){}};
  globalThis.location = {protocol:'http:',search,pathname:'/formation.html',hash:''};
  globalThis.history = {replaceState(){}};
  globalThis.fetch = async url=>{
    const m = /\/data\/(.+)\.json/.exec(String(url));
    if(!m)throw Error(`unexpected fetch ${url}`);
    return {ok:true,status:200,
      json:async()=>JSON.parse(await readFile(join(root,'data',`${m[1]}.json`),'utf8'))};
  };
  bootCount++;
  await import(pathToFileURL(join(root,'formation.js')).href+`?boot=${bootCount}`);
  await new Promise(r=>setTimeout(r,50));
  const el = id=>elements.get(id)??null;
  const treasureButtons = ()=>created.filter(n=>typeof n.textContent==='string'
    &&n.textContent.includes('宝もの'));
  return {el,rejections,treasureButtons,resetCreated:()=>{created = [];}};
}

test('no URL: page initializes with 199 roster characters and empty slots',async()=>{
  const {el,rejections} = await boot('');
  assert.equal(rejections.length,0);
  assert.equal(el('character-roster')?.children.length,199);
  assert.equal(el('roster-count')?.textContent,'199/199');
  assert.equal(el('formation-slots')?.children.length,5);
  assert.match(el('formation-counts')?.textContent||'',/0\/5 members/);
  // Roster filter input narrows the rendered grid.
  const search = el('roster-search');
  assert.ok(search);
  search.value = 'liter';
  for(const fn of search._handlers.input||[])fn();
  const real = JSON.parse(await readFile(join(root,'data','characters.json'),'utf8'));
  const expect = filterRoster(real,{query:'liter'}).length;
  assert.ok(expect>0&&expect<199);
  assert.equal(el('character-roster').children.length,expect);
});

test('rotation UI offers conditional re-entry candidates',async()=>{
  const {el,rejections} = await boot(
    '?formation=nikke-17,nikke-281,nikke-330,nikke-16,nikke-471&frot=nikke-17@1&frotidx=0');
  assert.equal(rejections.length,0);
  assert.equal(el('character-roster')?.children.length,199);
  const rows = el('burst-rotation')?.children||[];
  assert.equal(rows.length,2);
  const casterSel = rows[1].children.find(c=>c.children.length
    &&c.children.some(k=>/\(B[123]/.test(k.textContent||'')));
  assert.ok(casterSel);
  const values = casterSel.children.filter(o=>o.value).map(o=>o.value);
  // Anis B1 (+Moran B1 present) re-enters B1: Moran selectable at 2nd.
  assert.ok(values.includes('nikke-281'));
  assert.ok(values.includes('nikke-330'));
  // B3 members are not valid continuations here.
  assert.ok(!values.includes('nikke-471'));
  assert.match(el('rotation-info')?.textContent||'',/Anis: Star → B1/);
});

test('treasure toggle renders for eligible members only',async()=>{
  const {el, rejections} = await boot('?formation=nikke-281,nikke-330&ftreasure=nikke-281');
  assert.equal(rejections.length,0);
  assert.equal(el('character-roster')?.children.length,199);
  const slots = el('formation-slots')?.children||[];
  const texts = [];
  const collect = nodes=>{
    for(const n of nodes||[]){
      if(typeof n.textContent==='string'&&n.textContent.includes('宝もの'))texts.push(n.textContent);
      collect(n.children);
    }
  };
  collect(slots);
  assert.ok(texts.some(t=>t.includes('[ON]')));
  assert.ok(!texts.some(t=>t.includes('Crown')));
});

test('burst caster reselect keeps treasure ON in the UI',async()=>{
  const {el,rejections,treasureButtons,resetCreated} = await boot(
    '?formation=nikke-281,nikke-82,nikke-330&ftreasure=nikke-281&frot=nikke-82@1,nikke-330@2&frotidx=1');
  assert.equal(rejections.length,0);
  assert.ok(treasureButtons().some(b=>b.textContent.includes('[ON]')));
  resetCreated();
  // Reselect the same burst caster through the rotation UI.
  const rows = el('burst-rotation')?.children||[];
  const sel = rows[1].children.find(c=>c.children.length
    &&c.children.some(k=>/\(B[123]/.test(k.textContent||'')));
  assert.ok(sel);
  sel.value = 'nikke-330';
  for(const fn of sel._handlers.change||[])fn();
  await new Promise(r=>setTimeout(r,20));
  assert.equal(rejections.length,0);
  const fresh = treasureButtons();
  assert.ok(fresh.length>0);
  assert.ok(fresh.some(b=>b.textContent.includes('[ON]')));
  assert.ok(!fresh.some(b=>b.textContent.includes('[OFF]')&&b.textContent.includes('Moran')));
});

test('roster survives empty, valid, legacy, new and invalid rotation states',async()=>{
  const cases = {
    'empty rotation': '',
    'valid rotation': '?formation=nikke-82,nikke-330,nikke-222&frot=nikke-82@1,nikke-330@2,nikke-222@3&frotidx=2',
    'legacy fburstcaster': '?formation=nikke-82,nikke-330&fburst=2&fburstcaster1=nikke-82&fburstcaster2=nikke-330',
    'invalid rotation': '?formation=nikke-82,nikke-330&frot=nikke-82@2&frotidx=0',
    'treasure URL': '?formation=nikke-82,nikke-330&ftreasure=nikke-82,nikke-330',
  };
  for(const [name,search] of Object.entries(cases)){
    const {el,rejections} = await boot(search);
    assert.equal(rejections.length,0,name);
    assert.equal(el('character-roster')?.children.length,199,name);
    assert.equal(el('formation-slots')?.children.length,5,name);
  }
});

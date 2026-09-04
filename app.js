import {TYPE, CATEGORIES, SLOT, UNIT_NOTE, relation, effectLabel, formatRaw, summarizeRows, relationSummary} from './view-model.js';
import {MANUFACTURERS,ELEMENTS,SORTS,DEFAULTS,normalizeState,readQuery,writeQuery,catalogGroups,sortStatus,filterChips} from './catalog-model.js';
import {SOURCE_LABELS,safeSourceUrl} from './sources.js';
import {auditComparisonDataset,canRawSort,targetMetadata,scalingMetadata,periodicMetadata} from './comparison-qa.js';
import {portraitUrlFor} from './formation-model.js';

const $ = selector => document.querySelector(selector);
let records = [], catalog = [], mode = 'all', drawerOpener = null, reviewPromise = null, drawerToken = 0;
const controls = {query:'#name-search',type:'#type-filter',manufacturer:'#manufacturer-filter',burst:'#burst-filter',element:'#element-filter',sort:'#sort-select',target:'#target-filter',slot:'#slot-filter',condition:'#condition-filter',stack:'#stack-filter'};
const state = () => normalizeState({...Object.fromEntries(Object.entries(controls).map(([key,selector])=>[key,$(selector).value])),mode,onlyMatching:$('#only-matching').checked});
function applyState(value) {
  const s=normalizeState(value);
  for(const [key,selector] of Object.entries(controls))$(selector).value=s[key];
  $('#only-matching').checked=s.onlyMatching;setMode(s.mode);
}

function span(className, text) {
  const element = document.createElement('span');
  element.className = className;
  element.textContent = text;
  return element;
}

function initials(name){
  const words = String(name||'?').split(/[\s:·/]+/).filter(Boolean);
  return (words.slice(0,2).map(w=>w[0]).join('')||'?').toUpperCase();
}

function fillPortrait(portrait,character){
  portrait.replaceChildren();
  const url = portraitUrlFor(character);
  if(!url){portrait.textContent = initials(character.character_name);return;}
  const img = document.createElement('img');
  img.loading = 'lazy';img.decoding = 'async';img.referrerPolicy = 'no-referrer';
  img.alt = '';img.draggable = false;img.src = url;
  img.addEventListener('error',()=>{
    portrait.replaceChildren(document.createTextNode(initials(character.character_name)));
  },{once:true});
  portrait.append(img);
}

function setSourceLink(link,type,url) {
  const safe=safeSourceUrl(type,url);
  link.hidden=!safe;
  if(safe)link.href=safe;else link.removeAttribute('href');
}
function checkedLabel(value) {
  const date=new Date(value);
  return value&&!Number.isNaN(date.getTime())?'参照確認：'+date.toLocaleString('ja-JP',{timeZone:'Asia/Tokyo'})+' JST':'参照確認日：未確認';
}

function createRow(row) {
  const element = span('buff-row','');
  element.dataset.relation = row.relation;
  element.classList.toggle('is-comparison',row.type === $('#type-filter').value);
  const label = span('buff-label',row.label);
  const info = [];
  if(row.type==='damage_taken'&&row.top.direction==='decrease')info.push('軽減');
  if (row.effects.length > 1) info.push(row.effects.length + ' effects');
  if (['caster_max_hp_percent','caster_charge_speed_percent','conversion','flat_value'].includes(row.unit)) info.push(UNIT_NOTE[row.unit]);
  if (row.top.stack_count) {
    const maximum = row.top.max_raw_value === null ? '未記載' : formatRaw(row.top, row.top.max_raw_value);
    info.push('1 stack / 上限 ' + row.top.stack_count + ' stack・最大 ' + maximum);
  }
  if (info.length) label.append(span('row-note',info.join(' · ')));
  element.title = row.effects.map(r => (SLOT[r.skill_slot] || r.skill_slot) + ' · ' + r.skill_name + '：' + formatRaw(r) + (r.stack_count ? ' / 最大 ' + formatRaw(r,r.max_raw_value) : '')).join('\n');
  element.append(span('relation-label',row.relation === 'self' ? 'SELF' : 'ALLY'),label,span('buff-value',formatRaw(row.top)));
  return element;
}

async function openDrawer(character, effects, opener) {
  const name=character.character_name, token=++drawerToken;
  const drawer = $('#character-drawer');
  drawerOpener = opener;
  document.querySelectorAll('.character-row').forEach(row => row.setAttribute('aria-expanded',String(row === opener)));
  $('#drawer-title').textContent = name;
  $('#drawer-description').textContent = effects.length + ' effects · ' + relationSummary(effects);
  const metadata=$('#drawer-metadata');metadata.replaceChildren();
  const fields={企業:character.manufacturer,Burst:character.burst_stage.map(n=>['','I','II','III'][n]).join(' / '),属性:ELEMENTS[character.element],武器:character.weapon_type,クラス:character.class,レアリティ:character.rarity,実装日:character.release_date,入手区分:character.availability};
  for(const [label,value] of Object.entries(fields)){
    const pair=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');
    dt.textContent=label;dd.textContent=value || '未確認';pair.append(dt,dd);metadata.append(pair);
  }
  setSourceLink($('#drawer-character-source'),'nikke_gg',character.nikke_gg_url);
  setSourceLink($('#drawer-explorer-source'),'nikke_explorer',character.nikke_explorer_url);
  const releaseLink=$('#drawer-release-source');releaseLink.hidden=!character.release_source_url;
  if(character.release_source_url)releaseLink.href=character.release_source_url;
  $('#drawer-review-status').textContent=character.effects_status==='curated'?'サンプルの確認済み効果を収録。':`明確な文型のみ自動抽出。${character.review_count}節が確認待ちです。抽出済み効果は全効果の一部の場合があります。`;
  $('#drawer-reviews').replaceChildren();
  const root = $('#drawer-effects');
  root.replaceChildren();
  for (const row of summarizeRows(effects)) {
    for (const r of row.effects) {
      const entry = $('#effect-template').content.cloneNode(true);
      entry.querySelector('.detail-type').textContent = effectLabel(r);
      const rel = entry.querySelector('.detail-relation');
      rel.dataset.relation = relation(r);
      rel.textContent = relation(r) === 'self' ? 'SELF · 自分専用' : 'ALLY · 味方に配る';
      entry.querySelector('.detail-value').textContent = formatRaw(r);
      const unit = entry.querySelector('.detail-unit');
      unit.textContent = UNIT_NOTE[r.value_unit] || '';
      unit.hidden = !unit.textContent;
      const stack = entry.querySelector('.detail-stack');
      stack.textContent = r.stack_count ? '1 stack ' + formatRaw(r) + ' / 最大 ' + r.stack_count + ' stack / 最大Raw ' + (r.max_raw_value === null ? '未記載' : formatRaw(r,r.max_raw_value)) : '';
      stack.hidden = !r.stack_count;
      entry.querySelector('.detail-skill').textContent = (SLOT[r.skill_slot] || r.skill_slot) + ' · ' + r.skill_name;
      entry.querySelector('.detail-target').textContent = r.target;
      const targetMeta=entry.querySelector('.detail-target-meta');targetMeta.textContent=targetMetadata(r);targetMeta.hidden=!targetMeta.textContent;
      entry.querySelector('.detail-duration').textContent = r.duration === 'Instant' ? '即時' : r.duration || '原文記載なし（Not stated in source）';
      entry.querySelector('.detail-trigger').textContent = r.trigger || '原文記載なし（Not stated in source）';
      entry.querySelector('.detail-condition').textContent = r.condition || '追加条件なし';
      const scaling=entry.querySelector('.detail-scaling'),scalingText=scalingMetadata(r,UNIT_NOTE[r.value_unit]||'');scaling.textContent=scalingText;scaling.closest('div').hidden=!scalingText;
      const periodic=entry.querySelector('.detail-periodic'),periodicText=periodicMetadata(r);periodic.textContent=periodicText;periodic.closest('div').hidden=!periodicText;
      const section=entry.querySelector('.detail-section-condition');section.textContent=typeof r.section_condition==='string'?r.section_condition:r.section_condition?JSON.stringify(r.section_condition):'';section.closest('div').hidden=!section.textContent;
      const limitationLabels={trigger_not_stated:'Trigger: Not stated in source',target_not_stated:'Target: Not stated in source',duration_not_stated:'Duration: Not stated in source',end_condition_not_fully_stated:'End condition: Not fully stated in source'};
      const limitation=entry.querySelector('.detail-limitations');limitation.textContent=(r.source_limitations||[]).map(x=>limitationLabels[x]||x).join(' · ');limitation.closest('div').hidden=!limitation.textContent;
      if(r.parent_effect_name||r.parent_effect_description||r.end_condition){
        const context=document.createElement('div');context.className='parent-context';
        const title=document.createElement('strong');
        title.textContent=`${r.parent_effect_name||'Section / Trigger'}${r.parent_effect_type?' · '+r.parent_effect_type:''}${r.effect_index?' → Effect '+r.effect_index:''}`;context.append(title);
        for(const [label,value] of [['Function / 親の説明',r.parent_effect_description||r.function_text],['親の発動',r.parent_trigger],['終了条件',r.end_condition||r.parent_end_condition]]){
          if(!value)continue;const p=document.createElement('p');p.textContent=label+'：'+value;context.append(p);
        }
        if(r.related_effects?.length){const p=document.createElement('p');p.textContent='同じ親の比較対象外効果：'+r.related_effects.map(e=>e.source_line).join(' / ');context.append(p);}
        entry.querySelector('.effect-meta').after(context);
      }
      const notes = entry.querySelector('.detail-notes');
      notes.textContent = r.notes||'';
      notes.hidden = !notes.textContent;
      entry.querySelector('.detail-source-text').textContent = r.source_skill_text || r.source_text || '';
      entry.querySelector('.source-text').hidden = !(r.source_skill_text || r.source_text);
      const source = entry.querySelector('.source-link');
      source.textContent='Source: '+(SOURCE_LABELS[r.source_type]||'未確認')+' ↗';
      setSourceLink(source,r.source_type,r.source_url);
      entry.querySelector('.source-checked-at').textContent=checkedLabel(r.source_checked_at);
      const conflict=entry.querySelector('.detail-source-conflict');conflict.hidden=!r.source_conflict;
      if(r.source_conflict)conflict.textContent=`Source conflict: NIKKE.GG ${r.nikke_gg_value??'—'} / Nikke Explorer ${r.nikke_explorer_value??'—'} · review required`;
      root.append(entry);
    }
  }
  drawer.showModal();
  drawer.scrollTop = 0;
  if(!effects.length)root.append(span('pending-message','比較可能な効果は未収録です。「バフなし」を意味しません。'));
  if(character.review_count){
    const target=$('#drawer-reviews');target.textContent='確認待ちのスキル文を読み込み中…';
    try{
      reviewPromise ||= fetch('data/review-queue.json').then(r=>{if(!r.ok)throw Error(r.status);return r.json();}).catch(e=>{reviewPromise=null;throw e;});
      const reviews=await reviewPromise;if(token!==drawerToken)return;target.replaceChildren();
      for(const review of reviews.filter(r=>r.character_id===character.character_id).sort((a,b)=>(a.review_priority||99)-(b.review_priority||99))){
        const detail=document.createElement('details'),summary=document.createElement('summary'),text=document.createElement('p');
        detail.className='review-section';summary.textContent=`要確認 · ${SLOT[review.skill_slot] || review.skill_slot} · ${review.skill_name}`;
        text.textContent=review.reason+'\n\n'+review.source_text;detail.append(summary,text);
        const source=document.createElement('a');source.className='source-link';source.target='_blank';source.rel='noopener noreferrer';
        source.textContent='Source: '+(SOURCE_LABELS[review.source_type]||'未確認')+' ↗';setSourceLink(source,review.source_type,review.source_url);
        detail.append(source,span('source-checked-at',checkedLabel(review.source_checked_at)));
        if(review.alternate_source_url){
          const alternate=document.createElement('a');alternate.className='source-link';alternate.target='_blank';alternate.rel='noopener noreferrer';alternate.textContent='比較元: Nikke Explorer ↗';
          setSourceLink(alternate,'nikke_explorer',review.alternate_source_url);detail.append(alternate);
        }
        target.append(detail);
      }
    }catch{if(token===drawerToken)target.textContent='確認待ちの詳細を読み込めませんでした。元ページをご確認ください。';}
  }
}

function updateFilterState() {
  const current=state(),selected=current.type;
  const sortable = canRawSort(records,selected);
  if(!sortable&&current.sort.startsWith('value_')){$('#sort-select').value='name_asc';current.sort='name_asc';}
  $('#sort-select').querySelectorAll('option').forEach(option => {
    if (option.value.startsWith('value_')) option.disabled = !sortable;
  });
  $('#sort-select').value=current.sort;
  $('#sort-hint').textContent = sortStatus(current);
  $('#comparison-hint').textContent = selected ? '選択バフを強調 · フィルターはAND条件 · 他の所有バフも表示 · 数値順は同じ単位内で比較' : '企業・Burst・属性を組み合わせて比較。未確認の効果は数値比較に含めません。';
  $('#only-matching').disabled = !selected;
  const count = Number(Boolean($('#target-filter').value)) + Number(Boolean($('#slot-filter').value))
    + Number($('#condition-filter').value !== 'include') + Number($('#stack-filter').value !== 'include') + Number(Boolean(selected) && !$('#only-matching').checked);
  $('#advanced-count').textContent = count;
  $('#advanced-count').hidden = !count;
  const chips=filterChips(current),root=$('#active-filters');root.replaceChildren();
  for(const chip of chips){
    const button=document.createElement('button');button.type='button';button.className='filter-chip';
    button.textContent=chip.label+' ×';button.setAttribute('aria-label',chip.label+'を解除');
    button.addEventListener('click',()=>{applyState({...state(),[chip.key]:DEFAULTS[chip.key]});render();});root.append(button);
  }
  $('#filter-count').textContent=chips.length ? `${chips.length} 件の条件` : 'フィルターなし';
  $('#clear-filters').disabled=!chips.length&&current.sort==='name_asc';
}

function render() {
  updateFilterState();
  const current = state();
  const characters = catalogGroups(catalog,records,current);
  const query=writeQuery(current);
  try{history.replaceState(null,'',location.pathname+(query?'?'+query:'')+location.hash);}catch{/* Local embedding may prohibit history writes. */}
  const list = $('#character-list');
  list.replaceChildren();
  for (const {character,effects,hasType} of characters) {
    const name=character.character_name;
    const card = $('#character-template').content.cloneNode(true);
    const button = card.querySelector('.character-row');
    button.setAttribute('aria-label',name + 'のバフ詳細を開く');
    button.setAttribute('aria-expanded','false');
    card.querySelector('.character-name').textContent = name;
    fillPortrait(card.querySelector('.character-portrait'),character);
    card.querySelector('.effect-total').textContent = effects.length ? effects.length+' effects · '+relationSummary(effects) : 'バフ確認待ち';
    const note=card.querySelector('.match-note');note.hidden=!current.type||hasType;
    note.textContent=character.review_count?'選択バフ未収録（確認待ちあり）':'選択バフなし';
    const rows = card.querySelector('.buff-rows');
    summarizeRows(effects).forEach(row => rows.append(createRow(row)));
    if(!effects.length)rows.append(span('pending-message','比較可能な効果は未収録（バフなしではありません）'));
    button.addEventListener('click',() => openDrawer(character,effects,button));
    list.append(card);
  }
  $('#visible-count').textContent = characters.length;
  $('#empty-state').hidden = characters.length > 0;
}

function setMode(value) {
  mode = value;
  document.querySelectorAll('.mode').forEach(button => {
    const active = button.dataset.mode === mode;
    button.classList.toggle('active',active);
    button.setAttribute('aria-pressed',String(active));
  });
}
function resetAdvanced() {
  $('#target-filter').value = '';
  $('#slot-filter').value = '';
  $('#condition-filter').value = 'include';
  $('#stack-filter').value = 'include';
  $('#only-matching').checked = true;
}

async function init() {
  try {
    if(location.protocol==='file:')throw Error('file:// direct launch is unsupported. Serve this directory over HTTP.');
    const loadJson=async name=>{
      const url=new URL(`./data/${name}.json`,import.meta.url),response=await fetch(url);
      if(!response.ok)throw Error(`${url.pathname}: HTTP ${response.status}`);
      try{return await response.json();}catch(error){throw Error(`${url.pathname}: invalid JSON (${error.message})`);}
    };
    const [characters,effects,report,manifest]=await Promise.all(['characters','effects','collection-report','dataset-manifest'].map(async name=>{
      const value=await loadJson(name);console.info(`[NIKKE Buff Atlas] loaded data/${name}.json`,Array.isArray(value)?`${value.length} records`:'object');return value;
    }));
    console.info('[NIKKE Buff Atlas] pre-validation counts',{characters:Array.isArray(characters)?characters.length:null,effects:Array.isArray(effects)?effects.length:null});
    if(!Array.isArray(characters)||!Array.isArray(effects))throw Error('Invalid dataset');
    if(manifest.parser_version!==report.parser_version||manifest.character_count!==characters.length||manifest.comparison_count!==effects.length)throw Error('Dataset manifest does not match loaded data');
    const audit=auditComparisonDataset(effects,{expectedCount:manifest.comparison_count,expectedCounts:manifest.comparison_effect_type_counts});if(audit.errors.length)throw Error('Comparison dataset invariant failed: '+audit.errors.join('; '));
    console.info('[NIKKE Buff Atlas] post-validation counts',{characters:characters.length,effects:audit.total,effect_types:audit.counts});
    catalog=characters;records=effects;
    $('#coverage-summary').textContent=`バフ抽出済み ${report.characters_with_effects} / ${catalog.length}キャラ · 全効果の確認は未完了 · 収録状況`;
    $('#coverage-note').textContent=`両公開一覧から ${catalog.length}キャラ / バフ抽出済み ${report.characters_with_effects}キャラ / 確認待ち ${report.pending_sections}節。NIKKE.GGの不足 ${report.missing_primary_slots}枠、Explorerで補完 ${report.fallback_slots}枠、両方で未取得 ${report.unresolved_slots}枠。両ソース照合 ${report.audited_slots}枠 / 数値競合 ${report.conflicting_slots}枠。実装日確認済み ${report.verified_release_dates}キャラ。原文の取得完了と、全効果の分類完了は異なります。`;
    $('#parser-version').textContent=report.parser_version||'未確認';$('#dataset-character-count').textContent=characters.length;$('#dataset-effect-count').textContent=effects.length;$('#dataset-generated-at').textContent=report.generated_at||'未確認';
  } catch (error) {
    console.error('[NIKKE Buff Atlas] initialization failed',error);
    $('#empty-state').replaceChildren(span('', `データを読み込めませんでした。${error.message}`));
    $('#empty-state').hidden = false;
    return;
  }
  $('#record-count').textContent = records.filter(r=>!r.needs_review).length;
  $('#character-count').textContent = catalog.length;
  $('#category-count').textContent = new Set(records.map(r => r.buff_type)).size;
  CATEGORIES.forEach(type => {
    $('#type-filter').add(new Option(TYPE[type],type));
  });
  MANUFACTURERS.forEach(value=>$('#manufacturer-filter').add(new Option(value,value)));
  Object.entries(ELEMENTS).forEach(([value,label])=>$('#element-filter').add(new Option(label,value)));
  Object.entries(SORTS).forEach(([value,label])=>$('#sort-select').add(new Option(label,value)));
  applyState(readQuery(location.search));
  document.querySelectorAll('.mode').forEach(button => button.addEventListener('click',() => { setMode(button.dataset.mode); render(); }));
  Object.values(controls).filter(selector => selector !== '#type-filter').concat('#only-matching').forEach(selector => $(selector).addEventListener(selector === '#name-search' ? 'input' : 'change',render));
  $('#type-filter').addEventListener('change',() => {
    const selected=$('#type-filter').value;
    if(canRawSort(records,selected)&&!$('#sort-select').value.startsWith('release_'))$('#sort-select').value='value_desc';
    else if(!canRawSort(records,selected)&&$('#sort-select').value.startsWith('value_'))$('#sort-select').value='name_asc';
    render();
  });
  $('#reset-advanced').addEventListener('click',() => { resetAdvanced(); render(); });
  for(const selector of ['#reset-all','#clear-filters'])$(selector).addEventListener('click',()=>{applyState(DEFAULTS);render();});
  window.addEventListener('popstate',()=>{applyState(readQuery(location.search));render();});
  const drawer = $('#character-drawer');
  $('#close-drawer').addEventListener('click',() => drawer.close());
  drawer.addEventListener('close',() => {
    if (drawerOpener?.isConnected) { drawerOpener.setAttribute('aria-expanded','false'); drawerOpener.focus({preventScroll:true}); }
  });
  drawer.addEventListener('click',event => {
    if (event.target !== drawer) return;
    const bounds = drawer.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) drawer.close();
  });
  document.addEventListener('click',event => {
    if (!$('#advanced-filters').contains(event.target)) $('#advanced-filters').open = false;
  });
  document.addEventListener('keydown',event => {
    if (event.key === 'Escape' && $('#advanced-filters').open) {
      $('#advanced-filters').open = false;
      $('#advanced-filters summary').focus();
    }
  });
  render();
}
init();

/* Catalogs are projections of acquired records: browsing never grants progress. */
let encyclopediaTab='anomalies',encyclopediaFilter='all';
const CATALOG_TABS={anomalies:'異変',people:'人物',places:'場所'};
function catalogObservationHistory(mode,rarity){
 const o=observationState(),key=mode+':'+rarity;
 if(!o.collection?.[key])return '';
 const recent=(o.history||[]).filter(h=>h.mode===mode&&h.rarity===rarity).slice(-5).reverse();
 const total=o.collection[key];
 const records=recent.map(h=>{const time=Number(h.readyAt);return Number.isFinite(time)&&time>0?new Date(time).toLocaleString('ja-JP'):'日時不明';});
 return `<section class="catalog-history"><h3>遭遇履歴</h3><p>回収済み ${total}回 ／ 保存された最近の遭遇 ${recent.length}件</p>${records.length?`<ol>${records.map(d=>`<li>${escapeHTML(d)}</li>`).join('')}</ol>`:'<p>過去の遭遇時刻は保存されていません。</p>'}</section>`;
}

function catalogEntries(tab){
 const o=observationState(),collection=o.collection||{},contacts=watchContacts();
 if(tab==='people')return Object.entries(WATCH_COLLEAGUES).map(([id,m],i)=>({id,number:i+1,known:!!contacts[id],title:contacts[id]?m.name:'未面識の課員',sub:contacts[id]?m.role:'課内で話すと記録されます'}));
 if(tab==='places')return Object.entries(OBSERVATIONS).map(([id,m],i)=>{const known=[0,1,2,3].some(r=>collection[id+':'+r]>0);return {id,number:i+1,known,title:known?m.title:'未記録の場所',sub:known?`${WatchModel.setProgress(o,id)}件の記録`:'観測記録を回収すると記録されます'};});
 const observed=Object.entries(OBSERVATIONS).flatMap(([mode,m])=>[1,2,3].map(r=>({id:mode+':'+r,known:collection[mode+':'+r]>0,title:collection[mode+':'+r]>0?m.records[r]:'未確認の異変',sub:collection[mode+':'+r]>0?m.title+' ／ '+WatchModel.RARITY[r].name:'観測から発見'})));
 return observed.concat(INCURSIONS.map((m,i)=>({id:'inc:'+i,known:S.incursion?.discovered?.[i]===true,title:S.incursion?.discovered?.[i]===true?m.short:'未確認の異変',sub:S.incursion?.discovered?.[i]===true?'封筒調査 ／ '+incursionRarity(i).id:'封筒調査から発見'}))).map((e,i)=>({...e,number:i+1}));
}
function openEncyclopedia(tab=encyclopediaTab){
 if(!Object.hasOwn(CATALOG_TABS,tab))tab='anomalies';encyclopediaTab=tab;
 const entries=catalogEntries(tab),known=entries.filter(e=>e.known).length,shown=entries.filter(e=>encyclopediaFilter==='known'?e.known:encyclopediaFilter==='missing'?!e.known:true);
 openMenuPage('図鑑',menuBack()+`<section class="catalog"><p class="catalog-intro">あなたが持ち帰ったものだけが、ここに残る。</p><div class="catalog-tabs" role="group" aria-label="図鑑の分類">${Object.entries(CATALOG_TABS).map(([id,label])=>`<button data-catalog-tab="${id}" aria-pressed="${id===tab}">${label}</button>`).join('')}</div><div class="catalog-summary"><p>${CATALOG_TABS[tab]} <b>${known}</b>件 発見</p><label><input type="checkbox" data-catalog-filter ${encyclopediaFilter==='known'?'checked':''}> 発見済みのみ</label><label><input type="checkbox" data-catalog-missing ${encyclopediaFilter==='missing'?'checked':''}> 未発見のみ</label></div>${encyclopediaFilter==='missing'?`<p class="catalog-intro">未発見の記録は名前を伏せています。${tab==='anomalies'?'観測と封筒調査':tab==='people'?'課内での会話':'各地点の観測'}から探してください。</p>`:''}<div class="catalog-list">${shown.map(e=>`<button class="catalog-entry ${e.known?'':'catalog-unknown'}" data-catalog-entry="${e.id}" ${e.known?'':'disabled'}><small>No.${String(e.number).padStart(3,'0')}</small><span><b>${escapeHTML(e.title)}</b><small>${escapeHTML(e.sub)}</small></span><span aria-hidden="true">${e.known?'›':'―'}</span></button>`).join('')||'<p class="menu-empty">まだ発見済みの記録はありません。観測や課内での会話を進めると増えていきます。</p>'}</div></section>`);
}
function openCatalogEntry(id){
 const entry=catalogEntries(encyclopediaTab).find(e=>e.id===id);if(!entry?.known)return;
 if(encyclopediaTab==='anomalies'){
  if(id.startsWith('inc:'))return openIncursionRecords(Number(id.slice(4)));
  const [mode,r]=id.split(':');showWatchRecord(mode,Number(r));const detail=document.querySelector('.watch-record-caption');if(detail){detail.insertAdjacentHTML('afterend',catalogObservationHistory(mode,Number(r)));}return;
 }
 if(encyclopediaTab==='people'){
  const m=WATCH_COLLEAGUES[id],o=observationState();
  const records=Object.entries(INVESTIGATION_CASES).flatMap(([mode,c])=>c.member===id?[0,1,2,3].filter(r=>o.collection[mode+':'+r]>0).map(r=>({mode,r})):[]);
  const incidents=Object.keys(S.incursion?.discovered||{}).map(Number).filter(k=>S.incursion.discovered[k]===true&&INCURSIONS[k]&&incursionWitnessMember(k).id===id);
  sheet('人物図鑑',`<article class="catalog-detail"><header class="watch-speaker">${watchPortrait(m)}<div><small>${m.role}</small><h2>${m.name}</h2></div></header><p>${m.description}</p><h3>初めて交わした言葉</h3><blockquote>${m.greeting}</blockquote><h3>この人物と照合できる記録</h3>${records.map(({mode,r})=>`<button class="btn-line" data-catalog-record="${mode}:${r}">${OBSERVATIONS[mode].records[r]}</button>`).join('')}${incidents.map(k=>`<button class="btn-line" data-catalog-incident="${k}">${INCURSIONS[k].short}</button>`).join('')}${!records.length&&!incidents.length?'<p>照合できる記録は、まだありません。</p>':''}<button class="btn-paper" data-catalog-talk="${id}">${m.name}に話す</button></article>`);return;
 }
 const m=OBSERVATIONS[id],o=observationState();
 const legends=LegendModel.ids.filter(k=>LegendModel.CASES[k].mode===id&&LegendModel.count(S.levels,k)>0);
 sheet('場所図鑑',`<article class="catalog-detail"><small>${m.source} ／ ${WatchModel.MODES[id].label}</small><h2>${m.title}</h2><p>この場所で回収した記録 ${WatchModel.setProgress(o,id)}件。平常の記録も比較の手がかりになります。</p><div class="catalog-records">${[0,1,2,3].map(r=>`<button class="btn-line" data-catalog-record="${id}:${r}" ${o.collection[id+':'+r]>0?'':'disabled'}>${o.collection[id+':'+r]>0?m.records[r]:'未観測'}</button>`).join('')}</div>${legends.length?'<h3>関連する噂</h3>'+legends.map(k=>`<button class="btn-line" data-legend="case" data-id="${k}">${escapeHTML(legendTitle(k))}</button>`).join(''):''}<button class="btn-paper" data-watch="return">観測へ戻る</button></article>`);
}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-catalog-tab],[data-catalog-entry],[data-catalog-record],[data-catalog-talk],[data-catalog-incident]');if(!b||b.disabled)return;
 if(b.dataset.catalogTab)return openEncyclopedia(b.dataset.catalogTab);
 if(b.dataset.catalogEntry)return openCatalogEntry(b.dataset.catalogEntry);
 if(b.dataset.catalogRecord){const [mode,r]=b.dataset.catalogRecord.split(':');if(observationState().collection[b.dataset.catalogRecord]>0)showWatchRecord(mode,Number(r));return;}
 if(b.dataset.catalogIncident){hideSheet();return openIncursionRecords(Number(b.dataset.catalogIncident));}
 if(b.dataset.catalogTalk&&watchContacts()[b.dataset.catalogTalk]){hideSheet();observationColleagues();observationConversation(b.dataset.catalogTalk);}
});
document.addEventListener('change',e=>{if(e.target.matches('[data-catalog-filter],[data-catalog-missing]')){encyclopediaFilter=e.target.checked?(e.target.matches('[data-catalog-missing]')?'missing':'known'):'all';openEncyclopedia();}});

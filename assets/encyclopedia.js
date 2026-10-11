/* Catalogs are projections of acquired records: browsing never grants progress. */
let encyclopediaTab='anomalies',encyclopediaFilter='all';
const CATALOG_TABS={anomalies:'異変',people:'人物',places:'場所'};
function catalogTabs(){const t={...CATALOG_TABS};if(LegendModel.ids.some(id=>LegendModel.count(S.levels,id)===3&&legendLayerStatus(id)?.compared))t.confidential='機密';return t;}
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
 if(tab==='confidential')return LegendModel.ids.filter(id=>LegendModel.count(S.levels,id)===3&&legendLayerStatus(id)?.compared).map((id,i)=>({id,number:i+1,known:true,title:legendTitle(id),sub:'登録のない立会人 ／ 証言照合記録'}));
 if(tab==='people'){const staff=Object.entries(WATCH_COLLEAGUES).map(([id,m],i)=>({id,number:i+1,known:!!contacts[id],title:contacts[id]?m.name:'未面識の課員',sub:contacts[id]?m.role:'課内で話すと記録されます'}));const related=witnessRegistryRecords(),unknown=related.length?[{id:'ghost:registry',number:staff.length+1,known:true,title:'登録のない立会人',sub:'照合済み資料の立会欄 ／ '+related.length+'件'}]:[];const personnel=PersonnelDiscrepancies.unlocked(S.personnelEvidence,rankIdx()).map((c,i)=>({id:'personnel:'+c.id,number:staff.length+unknown.length+i+1,known:true,title:'課内照合：'+c.title,sub:PersonnelDiscrepancies.detail(S.personnelEvidence,rankIdx(),c.id)?.confirmed?'照合済み':'職員の証言を記録中'}));return staff.concat(unknown,personnel);}
 if(tab==='places'){const main=Object.entries(OBSERVATIONS).map(([id,m],i)=>{const known=[0,1,2,3].some(r=>collection[id+':'+r]>0);return {id,number:i+1,known,title:known?m.title:'未記録の場所',sub:known?`${WatchModel.setProgress(o,id)}件の記録`:'観測記録を回収すると記録されます'};});const alternates=Object.entries(ObservationSites.LOCATIONS).map(([mode,m],i)=>{const n=[0,1,2,3].filter(r=>ObservationSites.count(o.siteCollection,mode,'alt',r)>0).length;return {id:'site:'+mode+':alt',number:main.length+i+1,known:n>0,title:n?m.alt.name:'未記録の場所',sub:n?`${n}件の異なる記録`:'観測記録を回収すると記録されます'};});return main.concat(alternates);}
 const observed=Object.entries(OBSERVATIONS).flatMap(([mode,m])=>[1,2,3].map(r=>({id:mode+':'+r,known:collection[mode+':'+r]>0,title:collection[mode+':'+r]>0?m.records[r]:'未確認の異変',sub:collection[mode+':'+r]>0?m.title+' ／ '+WatchModel.RARITY[r].name:'観測から発見'})));
 return observed.concat(INCURSIONS.map((m,i)=>({id:'inc:'+i,known:S.incursion?.discovered?.[i]===true,title:S.incursion?.discovered?.[i]===true?m.short:'未確認の異変',sub:S.incursion?.discovered?.[i]===true?'封筒調査 ／ '+incursionRarity(i).id:'封筒調査から発見'}))).map((e,i)=>({...e,number:i+1}));
}
function openEncyclopedia(tab=encyclopediaTab){
 const tabs=catalogTabs();if(!Object.hasOwn(tabs,tab))tab='anomalies';encyclopediaTab=tab;
 const entries=catalogEntries(tab),known=entries.filter(e=>e.known).length,shown=encyclopediaFilter==='missing'?[]:entries.filter(e=>e.known);
 openMenuPage('図鑑',menuBack()+`<section class="catalog"><p class="catalog-intro">あなたが持ち帰ったものだけが、ここに残る。</p><div class="catalog-tabs" role="group" aria-label="図鑑の分類">${Object.entries(tabs).map(([id,label])=>`<button data-catalog-tab="${id}" aria-pressed="${id===tab}">${label}</button>`).join('')}</div><div class="catalog-summary"><p>${tabs[tab]} <b>${known}</b>件 発見</p><label><input type="checkbox" data-catalog-filter ${encyclopediaFilter==='known'?'checked':''}> 発見済みのみ</label><label><input type="checkbox" data-catalog-missing ${encyclopediaFilter==='missing'?'checked':''}> 未発見のみ</label></div>${encyclopediaFilter==='missing'?`<p class="catalog-intro">未発見の記録は一覧に表示されません。${tab==='anomalies'?'観測と封筒調査':tab==='people'?'課内での会話':'各地点の観測'}から探してください。</p>`:''}<div class="catalog-list">${shown.map(e=>`<button class="catalog-entry ${e.known?'':'catalog-unknown'}" data-catalog-entry="${e.id}" ${e.known?'':'disabled'}><small>No.${String(e.number).padStart(3,'0')}</small><span><b>${escapeHTML(e.title)}</b><small>${escapeHTML(e.sub)}</small></span><span aria-hidden="true">${e.known?'›':'―'}</span></button>`).join('')||'<p class="menu-empty">ここには発見済みの記録だけが残ります。観測や課内での会話を進めてください。</p>'}</div></section>`);
}
function openPersonnelDossier(id){
 const item=PersonnelDiscrepancies.detail(S.personnelEvidence,rankIdx(),id);
 if(!item)return;
 const statements=item.statements.map(s=>'<h3>'+escapeHTML(WATCH_COLLEAGUES[s.id].name)+' ／ 証言</h3><blockquote>'+escapeHTML(s.text)+'</blockquote>').join('');
 const action=item.confirmed?'<p>照合済み。記録は保管された。</p><p>'+escapeHTML(item.conclusion)+'</p>':item.complete?'<button class="btn-paper" data-personnel-confirm="'+escapeHTML(id)+'">三人の証言を照合する</button>':'<p>照合に必要な証言は、まだ揃っていない。</p>';
 sheet('第六文書課・人事照合', '<article class="catalog-detail"><small>PERSONNEL / CLASSIFIED</small><h2>'+escapeHTML(item.title)+'</h2>'+statements+action+'</article>');
}
function witnessRegistryRecords(){
 const compared=Object.fromEntries(LegendModel.ids.filter(id=>LegendModel.count(S.levels,id)===3&&legendLayerStatus(id)?.compared).map(id=>[id,true]));
 const followups=Object.fromEntries(Object.keys(compared).map(id=>[id,ForecastFollowup.inspect(S.forecastFollowups,id)]));
 return WitnessRegistry.list(S.levels,LegendModel.CASES,compared,followups);
}
function openWitnessDossier(id){
 const records=witnessRegistryRecords(),entry=records.find(x=>x.id===id);
 if(!entry)return;
 const forecast=ForecastArchive.inspect(id,S.levels,LegendModel.CASES,legendProof(id),legendLayerStatus(id));
 const related=records.length>1?'<details class="witness-related"><summary>別の資料に残された痕跡</summary>'+records.filter(x=>x.id!==id).map(x=>'<button class="btn-line" data-witness-case="'+x.id+'">'+escapeHTML(legendTitle(x.id))+'の立会記録を見る</button>').join('')+'</details>':'';
 sheet('人物図鑑・人事記録',`<article class="catalog-detail witness-dossier">
  <small>第六文書課 ／ 人事台帳 照会不一致</small>
  <header class="witness-card">
   <div class="witness-photo" role="img" aria-label="肖像写真の登録がない台帳"><span>肖像欄</span><i aria-hidden="true"></i><small>該当なし</small></div>
   <div class="witness-identity"><h2>登録のない立会人</h2><p>所属：照会できません</p><p>氏名：記載がありません</p><p>在籍記録：なし</p></div>
  </header>
  <p class="witness-lead">人員台帳に記録はない。けれど、この人物の立会印を押した事件がある。</p>
  <section class="witness-record"><h3>回収した資料 ／ ${escapeHTML(legendTitle(id))}</h3>
   <blockquote>${escapeHTML(entry.record)}</blockquote>
   <h3>資料に残された証言</h3><p>${escapeHTML(entry.testimony)}</p>
   <p class="witness-record-note">${escapeHTML(entry.statement)}</p>
  </section>
  ${forecast?'<section class="forecast-archive witness-forecast"><h3>未来の調査記録</h3><p>'+escapeHTML(forecast.forecast)+'</p>'+(entry.extra?'<p>'+escapeHTML(entry.extra)+'</p>':'<p>後日の観測記録との照合結果は、まだありません。</p>')+'</section>':''}
  ${related}
  <button class="btn-paper" data-legend="case" data-id="${id}">この立会人が記された調査へ戻る</button>
 </article>`);
}
function openCatalogEntry(id){
 const entry=catalogEntries(encyclopediaTab).find(e=>e.id===id);if(!entry?.known)return;
 if(encyclopediaTab==='confidential'){hideSheet();return openLegendCase(id);}
 if(encyclopediaTab==='anomalies'){
  if(id.startsWith('inc:'))return openIncursionRecords(Number(id.slice(4)));
  const [mode,r]=id.split(':');showWatchRecord(mode,Number(r));const detail=document.querySelector('.watch-record-caption');if(detail){detail.insertAdjacentHTML('afterend',catalogObservationHistory(mode,Number(r)));}return;
 }
 if(encyclopediaTab==='places'&&id.startsWith('site:')){
  const mode=id.split(':')[1],scene=ObservationSites.LOCATIONS[mode]?.alt,o=observationState();
  if(!scene||!ObservationSites.owned(o.siteCollection,mode,'alt'))return;
  const rows=[0,1,2,3].map(r=>{const n=ObservationSites.count(o.siteCollection,mode,'alt',r);
   return '<button class="btn-line" data-site-record="'+mode+':'+r+'" '+(n?'':'disabled')+'>'+ (n?escapeHTML(scene.notes[r])+' ／ '+WatchModel.RARITY[r].name:'未観測') +'</button>';
  }).join('');
  sheet('場所図鑑',`<article class="catalog-detail"><small>${escapeHTML(scene.source)} ／ ${WatchModel.MODES[mode].label}</small><h2>${escapeHTML(scene.name)}</h2><p>この場所の取得済み記録だけを保存しました。異変の原因は断定していません。</p><div class="catalog-records">${rows}</div><button class="btn-paper" data-watch="return">観測へ戻る</button></article>`);return;
 }
 if(encyclopediaTab==='people'){
  if(id.startsWith('personnel:'))return openPersonnelDossier(id.slice('personnel:'.length));
  if(id==='ghost:registry'){const first=witnessRegistryRecords()[0];if(first)return openWitnessDossier(first.id);return;}
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
 const b=e.target.closest('[data-catalog-tab],[data-catalog-entry],[data-catalog-record],[data-catalog-talk],[data-catalog-incident],[data-personnel-confirm],[data-personnel-list],[data-witness-case],[data-witness-registry],[data-site-record]');if(!b||b.disabled)return;
 if(b.dataset.siteRecord){const [mode,r]=b.dataset.siteRecord.split(':');return showSiteRecord(mode,Number(r));}
 if(b.dataset.personnelList!==undefined)return openEncyclopedia('people');
 if(b.dataset.witnessCase)return openWitnessDossier(b.dataset.witnessCase);
 if(b.dataset.witnessRegistry!==undefined){const first=witnessRegistryRecords()[0];if(first){hideSheet();return openWitnessDossier(first.id);}return;}
 if(b.dataset.personnelConfirm){const result=PersonnelDiscrepancies.confirm(S.personnelEvidence,rankIdx(),b.dataset.personnelConfirm);if(result.changed){S.personnelEvidence=result.state;markDirty();save();renderMenuBadge();}return openPersonnelDossier(b.dataset.personnelConfirm);}
 if(b.dataset.catalogTab)return openEncyclopedia(b.dataset.catalogTab);
 if(b.dataset.catalogEntry)return openCatalogEntry(b.dataset.catalogEntry);
 if(b.dataset.catalogRecord){const [mode,r]=b.dataset.catalogRecord.split(':');if(observationState().collection[b.dataset.catalogRecord]>0)showWatchRecord(mode,Number(r));return;}
 if(b.dataset.catalogIncident){hideSheet();return openIncursionRecords(Number(b.dataset.catalogIncident));}
 if(b.dataset.catalogTalk&&watchContacts()[b.dataset.catalogTalk]){hideSheet();observationColleagues();observationConversation(b.dataset.catalogTalk);}
});
document.addEventListener('change',e=>{if(e.target.matches('[data-catalog-filter],[data-catalog-missing]')){encyclopediaFilter=e.target.checked?(e.target.matches('[data-catalog-missing]')?'missing':'known'):'all';openEncyclopedia();}});

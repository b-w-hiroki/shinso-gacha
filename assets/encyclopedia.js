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
 if(tab==='places'){const original=Object.entries(OBSERVATIONS).map(([id,m],i)=>{const known=[0,1,2,3].some(r=>collection[id+':'+r]>0);return {id,number:i+1,known,title:known?m.title:'未記録の場所',sub:known?`${WatchModel.setProgress(o,id)}件の記録`:'観測記録を回収すると記録されます'};});const discovered=WatchLocations.discovered(o.locationRecords).map((scene,i)=>({id:scene.id,number:original.length+i+1,known:true,title:scene.title,sub:scene.source+' ／ '+scene.visits+'回 観測'}));return original.concat(discovered);}
 const observed=Object.entries(OBSERVATIONS).flatMap(([mode,m])=>[1,2,3].map(r=>({id:mode+':'+r,known:collection[mode+':'+r]>0,title:collection[mode+':'+r]>0?m.records[r]:'未確認の異変',sub:collection[mode+':'+r]>0?m.title+' ／ '+WatchModel.RARITY[r].name:'観測から発見'})));
 const inc=INCURSIONS.map((m,i)=>({id:'inc:'+i,known:S.incursion?.discovered?.[i]===true,title:S.incursion?.discovered?.[i]===true?m.short:'未確認の異変',sub:S.incursion?.discovered?.[i]===true?'封筒調査 ／ '+incursionRarity(i).id:'封筒調査から発見'}));
 const alternate=WatchLocations.discovered(o.locationRecords).flatMap(scene=>[1,2,3].filter(r=>Number(scene.rarities?.[r])>0).map(r=>({id:'alt:'+scene.mode+':'+r,known:true,title:scene.notes[r],sub:scene.title+' ／ '+WatchModel.RARITY[r].name})));
 return observed.concat(inc,alternate).map((e,i)=>({...e,number:i+1}));
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
 const witness=witnessRegistryRecords()[0];
 const witnessLink=item.confirmed&&witness?'<button class="btn-line" data-witness-case="'+escapeHTML(witness.id)+'">取得済みの立会人記録と照合する</button>':'';
 const action=item.confirmed?'<p>照合済み。記録は保管された。</p><p>'+escapeHTML(item.conclusion)+'</p>'+witnessLink:item.complete?'<button class="btn-paper" data-personnel-confirm="'+escapeHTML(id)+'">三人の証言を照合する</button>':'<p>照合に必要な証言は、まだ揃っていない。</p>';
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
 const editionNotes=WitnessRegistry.editions(rankIdx(),records,id);
 const editions=editionNotes.length?'<details class="witness-editions"><summary>食い違う人事台帳の原本を並べる</summary><div class="witness-edition-grid">'+editionNotes.map(note=>'<article class="witness-edition"><small>'+escapeHTML(note.code)+'</small><h3>'+escapeHTML(note.category)+'</h3><strong>'+escapeHTML(note.value)+'</strong><p>'+escapeHTML(note.note)+'</p></article>').join('')+'</div><p class="witness-edition-footnote">同じ立会者の書類です。新しい職員が増えたわけではありません。</p></details>':'';
 const revisionNotes=WitnessRegistry.revisions(rankIdx(),records,id);
 const revisions=revisionNotes.length?'<details class="witness-revisions"><summary>閲覧権限で復元された人事台帳の追記</summary>'+revisionNotes.map(note=>'<section><small>照会深度 '+note.tier+'</small><h3>'+escapeHTML(note.heading)+'</h3><p>'+escapeHTML(note.text)+'</p></section>').join('')+'</details>':'';
 const confirmedPersonnel=PersonnelDiscrepancies.unlocked(S.personnelEvidence,rankIdx())
  .map(c=>PersonnelDiscrepancies.detail(S.personnelEvidence,rankIdx(),c.id)).filter(x=>x?.confirmed);
 const echoes=WitnessRegistry.personnelEchoes(records,id,confirmedPersonnel);
 const crossPersonnel=echoes.length?'<details class="witness-personnel"><summary>確定した課内証言との矛盾を照合する</summary>'+echoes.map(x=>'<section><h3>'+escapeHTML(x.title)+'</h3><p>'+escapeHTML(x.note)+'</p><button class="btn-line" data-personnel-open="'+escapeHTML(x.id)+'">三人の証言原本を読む</button></section>').join('')+'</details>':'';
 const recheckTrail=entry.trail?.length?'<details class="witness-recheck-trail"><summary>再観測で増えた立会記録</summary>'+
  entry.trail.map(row=>'<section><small>回収日：'+escapeHTML(row.observed)+'</small><p>'+escapeHTML(row.note)+'</p></section>').join('')+
  '<p>原本の結論・異変区分・受領報酬は訂正されていません。</p>'+
  '<button class="btn-line" data-legend="case" data-id="'+escapeHTML(id)+'">翌日報告の原本と照合する</button></details>':'';
 const related=records.length>1?'<details class="witness-related"><summary>別の資料に残された痕跡</summary>'+records.filter(x=>x.id!==id).map(x=>'<button class="btn-line" data-witness-case="'+x.id+'">'+escapeHTML(legendTitle(x.id))+'の立会記録を見る</button>').join('')+'</details>':'';
 sheet('人物図鑑・人事記録',`<article class="catalog-detail witness-dossier">
  <small>第六文書課 ／ 人事台帳 照会不一致</small>
  <header class="witness-card">
   <div class="witness-photo" role="img" aria-label="肖像写真の登録がない台帳" data-presence="${Math.min(records.length,3)}"><img src="assets/colleagues/unregistered.webp" alt="" width="512" height="683" decoding="async"><span>肖像欄</span><small>該当なし</small></div>
   <div class="witness-identity"><h2>登録のない立会人</h2><p>所属：照会できません</p><p>氏名：記載がありません</p><p>在籍記録：なし</p></div>
  </header>
  <p class="witness-lead">人員台帳に記録はない。けれど、この人物の立会印を押した事件がある。</p>
  <section class="witness-record"><h3>回収した資料 ／ ${escapeHTML(legendTitle(id))}</h3>
   <blockquote>${escapeHTML(entry.record)}</blockquote>
   <h3>資料に残された証言</h3><p>${escapeHTML(entry.testimony)}</p>
   <p class="witness-record-note">${escapeHTML(entry.statement)}</p>
  </section>
  ${forecast?'<section class="forecast-archive witness-forecast"><h3>未来の調査記録</h3><p>'+escapeHTML(forecast.forecast)+'</p>'+(entry.extra?'<p>'+escapeHTML(entry.extra)+'</p>':'<p>後日の観測記録との照合結果は、まだありません。</p>')+'</section>':''}
  ${recheckTrail}
  ${related}
  ${editions}
  ${revisions}
  ${crossPersonnel}
  <button class="btn-paper" data-legend="case" data-id="${id}">この立会人が記された調査へ戻る</button>
 </article>`);
}
function locationLegendEchoesHTML(placeId){
 const noticed=Object.fromEntries(LegendModel.ids.map(id=>[id,legendLayerStatus(id)?.noticed===true]));
 const rows=WatchLocations.siteEchoes(placeId,S.levels,LegendModel.CASES,
  observationState().locationRecords,noticed);
 if(!rows.length)return '';
 return '<details class="site-legend-echoes"><summary>取得した事件資料と突き合わせる</summary>'+
  rows.map(row=>'<section><p>'+escapeHTML(row.record)+'</p>'+
    (row.after?'<p class="legend-location-after">'+escapeHTML(row.after)+'</p>':'')+
    '<button class="btn-line" data-legend="case" data-id="'+escapeHTML(row.caseId)+'">'+
     escapeHTML(legendTitle(row.caseId))+'の調査原本を読む</button></section>').join('')+
   '</details>';
}
function locationLinksHTML(id){
 const links=LocationCorrelations.list(WatchLocations.discovered(observationState().locationRecords),id);
 if(!links.length)return '';
 return '<details class="catalog-cross-sites"><summary>別の観測記録と照合する</summary>'+
  links.map(link=>{
   const other=link.left.id===id?link.right:link.left;
   return '<button class="btn-line" data-location-link="'+escapeHTML(link.id)+'">'+escapeHTML(other.title)+'の資料と見比べる</button>';
  }).join('')+'</details>';
}
function showLocationLink(id){
 const match=LocationCorrelations.inspect(WatchLocations.discovered(observationState().locationRecords),id);
 if(!match)return;
 const scenes=[match.left,match.right];
 const tiles=scenes.map(scene=>'<figure><img loading="eager" decoding="async" src="assets/observation/'+escapeHTML(scene.file)+'" alt="'+escapeHTML(scene.title)+'で回収した映像原本"><figcaption>'+escapeHTML(scene.source)+' ／ '+escapeHTML(scene.title)+'</figcaption></figure>').join('');
 sheet('地点の照合記録','<article class="catalog-detail site-correlation"><small>第六文書課 ／ 相互照合資料</small><h2>離れた二地点の一致</h2><div class="site-correlation-images">'+tiles+'</div><p class="site-correlation-copy">'+escapeHTML(match.record)+'</p><p>'+escapeHTML(match.afterword)+'</p><p class="site-correlation-note">これは取得済みの原本を相互参照した記録です。別の場所の観測結果を新しく抽選したものではありません。</p>'+scenes.map(scene=>'<button class="btn-line" data-catalog-entry="'+escapeHTML(scene.id)+'">'+escapeHTML(scene.title)+'の記録へ戻る</button>').join('')+'</article>');
}
function locationTriadHTML(id){
 const record=LocationCorrelations.triad(WatchLocations.discovered(observationState().locationRecords),id);
 return record?'<div class="catalog-triad-entry"><small>第六文書課 ／ 未整理の照会票</small><button class="btn-line" data-location-triad="'+escapeHTML(id)+'">三地点の矛盾を照合する</button></div>':'';
}
function showLocationTriad(id){
 const match=LocationCorrelations.triad(WatchLocations.discovered(observationState().locationRecords),id);
 if(!match)return;
 const images=match.sites.map(scene=>'<figure><img loading="eager" decoding="async" src="assets/observation/'+escapeHTML(scene.file)+'" alt="'+escapeHTML(scene.title)+'の回収済み原本"><figcaption>'+escapeHTML(scene.source)+' ／ '+escapeHTML(scene.title)+'</figcaption></figure>').join('');
 const buttons=match.sites.map(scene=>'<button class="btn-line" data-catalog-entry="'+escapeHTML(scene.id)+'">'+escapeHTML(scene.title)+'の原本へ戻る</button>').join('');
 sheet('三地点の照会記録','<article class="catalog-detail site-triad"><small>第六文書課 ／ 回収原本の相互照合</small><h2>'+escapeHTML(match.title)+'</h2><div class="site-triad-images">'+images+'</div><p class="site-triad-copy">'+escapeHTML(match.record)+'</p><p>'+escapeHTML(match.warning)+'</p><p class="site-correlation-note">実際に取得した三地点の異変だけを照合しています。閲覧しても抽選・報酬・記録件数は増えません。</p>'+buttons+'</article>');
}
function alternateLocationRecordsHTML(place,entry){
 const acquired=[0,1,2,3].filter(r=>Number(entry.rarities?.[r])>0);
 return '<div class="catalog-records">'+acquired.map(r=>
  '<button class="btn-line" data-location-record="'+escapeHTML(place.id)+':'+r+'">'+
   escapeHTML(place.notes[r])+' ／ '+WatchModel.RARITY[r].name+'</button>'
 ).join('')+'</div>';
}
function openCatalogEntry(id){
 const entry=catalogEntries(encyclopediaTab).find(e=>e.id===id);if(!entry?.known)return;
 if(encyclopediaTab==='confidential'){hideSheet();return openLegendCase(id);}
 if(encyclopediaTab==='anomalies'){
  if(id.startsWith('alt:')){const [,mode,r]=id.split(':');return showAlternateLocationRecord(mode,Number(r));}
  if(id.startsWith('inc:'))return openIncursionRecords(Number(id.slice(4)));
  const [mode,r]=id.split(':');showWatchRecord(mode,Number(r));const detail=document.querySelector('.watch-record-caption');if(detail){detail.insertAdjacentHTML('afterend',catalogObservationHistory(mode,Number(r)));}return;
 }
 if(encyclopediaTab==='people'){
  if(id.startsWith('personnel:'))return openPersonnelDossier(id.slice('personnel:'.length));
  if(id==='ghost:registry'){const first=witnessRegistryRecords()[0];if(first)return openWitnessDossier(first.id);return;}
  // An unmet colleague's portrait, name and evidence links stay out of the DOM.
  if(!Object.hasOwn(WATCH_COLLEAGUES,id)||watchContacts()[id]!==true)return;
  const m=WATCH_COLLEAGUES[id],o=observationState();
  const records=Object.entries(INVESTIGATION_CASES).flatMap(([mode,c])=>c.member===id?[0,1,2,3].filter(r=>o.collection[mode+':'+r]>0).map(r=>({mode,r})):[]);
  const incidents=Object.keys(S.incursion?.discovered||{}).map(Number).filter(k=>S.incursion.discovered[k]===true&&INCURSIONS[k]&&incursionWitnessMember(k).id===id);
  sheet('人物図鑑',`<article class="catalog-detail"><header class="watch-speaker">${watchPortrait(m)}<div><small>${m.role}</small><h2>${m.name}</h2></div></header><p>${m.description}</p><h3>初めて交わした言葉</h3><blockquote>${m.greeting}</blockquote><h3>この人物と照合できる記録</h3>${records.map(({mode,r})=>`<button class="btn-line" data-catalog-record="${mode}:${r}">${OBSERVATIONS[mode].records[r]}</button>`).join('')}${incidents.map(k=>`<button class="btn-line" data-catalog-incident="${k}">${INCURSIONS[k].short}</button>`).join('')}${!records.length&&!incidents.length?'<p>照合できる記録は、まだありません。</p>':''}<button class="btn-paper" data-catalog-talk="${id}">${m.name}に話す</button></article>`);return;
 }
 const place=WatchLocations.byId(id);
 if(place){const entry=WatchLocations.discovered(observationState().locationRecords).find(s=>s.id===id);if(!entry)return;const time=entry.firstAt?new Date(entry.firstAt).toLocaleDateString('ja-JP'):'日時不明';sheet('場所図鑑',`<article class="catalog-detail"><small>${escapeHTML(place.source)} ／ ${escapeHTML(WatchModel.MODES[place.mode].label)}</small><h2>${escapeHTML(place.title)}</h2><img src="assets/observation/${place.file}" alt="${escapeHTML(place.title)}の初回観測資料" loading="lazy" style="width:100%;aspect-ratio:2/1;object-fit:cover;border:1px solid #696154;border-radius:3px"><p>記録された訪問 ${entry.visits}回 ／ 最初の観測 ${time}</p><p>別媒体と記録を共有せず、この場所の原本はそのまま保存されます。</p>${alternateLocationRecordsHTML(place,entry)}${locationLegendEchoesHTML(place.id)}${locationLinksHTML(place.id)}${locationTriadHTML(place.id)}<button class="btn-line" data-watch="return">観測へ戻る</button></article>`);return;}
 const m=OBSERVATIONS[id],o=observationState();
 const legends=LegendModel.ids.filter(k=>LegendModel.CASES[k].mode===id&&LegendModel.count(S.levels,k)>0);
 sheet('場所図鑑',`<article class="catalog-detail"><small>${m.source} ／ ${WatchModel.MODES[id].label}</small><h2>${m.title}</h2><p>この場所で回収した記録 ${WatchModel.setProgress(o,id)}件。平常の記録も比較の手がかりになります。</p><div class="catalog-records">${[0,1,2,3].filter(r=>Number(o.collection[id+':'+r])>0).map(r=>`<button class="btn-line" data-catalog-record="${id}:${r}">${escapeHTML(m.records[r])}</button>`).join('')}</div>${legends.length?'<h3>関連する噂</h3>'+legends.map(k=>`<button class="btn-line" data-legend="case" data-id="${k}">${escapeHTML(legendTitle(k))}</button>`).join(''):''}<button class="btn-paper" data-watch="return">観測へ戻る</button></article>`);
}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-catalog-tab],[data-catalog-entry],[data-catalog-record],[data-catalog-talk],[data-catalog-incident],[data-personnel-confirm],[data-personnel-open],[data-personnel-list],[data-witness-case],[data-witness-registry],[data-location-record],[data-location-link],[data-location-triad]');if(!b||b.disabled)return;
 if(b.dataset.locationTriad)return showLocationTriad(b.dataset.locationTriad);
 if(b.dataset.locationLink)return showLocationLink(b.dataset.locationLink);
 if(b.dataset.locationRecord){const [prefix,mode,r]=b.dataset.locationRecord.split(':');if(prefix==='alt')return showAlternateLocationRecord(mode,Number(r));return;}
 if(b.dataset.personnelList!==undefined)return openEncyclopedia('people');
  if(b.dataset.personnelOpen)return openPersonnelDossier(b.dataset.personnelOpen);
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

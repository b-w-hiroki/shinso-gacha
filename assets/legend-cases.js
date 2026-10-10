/* Collected fragments -> corroborating record -> colleague -> hypothesis. */
function legendState(){return S.legends=LegendModel.state(S.legends,S.levels);}
function legendProof(id){return LegendModel.evidence(id,observationState().collection,S.incursion?.discovered,incursionProfile);}
function legendTitle(id){return byId(id)?.name||'未確認の噂';}
function legendStatus(id){const n=LegendModel.count(S.levels,id),s=legendState();return Object.hasOwn(s.conclusions,id)?'照合記録あり':n===3?'調査可能':`断片 ${n}/3`;}
function legendDossierHTML(id){
 if(isLite()||!Object.hasOwn(LegendModel.CASES,id)||!LegendModel.count(S.levels,id))return '';
 return `<button class="btn-line legend-link" data-legend="case" data-id="${id}">この都市伝説の証拠を照合する · ${legendStatus(id)}</button>`;
}
function legendCardHTML(r){
 if(isLite()||!Object.hasOwn(LegendModel.CASES,r.item.id))return '';
 const c=LegendModel.CASES[r.item.id],n=Math.min(3,r.after),f=c.fragments[Math.max(0,n-1)];
 const forbidden=r.item.rar==='x'||r.testi?.rar==='x';
 return `<aside class="legend-pull-evidence"><small>第六文書課・架空調査資料 ／ ${forbidden?'禁の原本':f[0]}</small><p>${forbidden?c.original:f[1]}</p><span>${n===3?'3断片が揃った。資料から調査案件を開けます。':`断片 ${n}/3。揃うと、この噂の調査が始まる。`}</span></aside>`;
}
function renderLegendLead(){
 if(isLite())return;
 const s=legendState(),active=s.active;
 const next=active||LegendModel.ids.find(id=>LegendModel.count(S.levels,id)>0&&!Object.hasOwn(s.conclusions,id));
 const el=document.getElementById('cab-desc');el.textContent=box==='urban'?(next?`${legendTitle(next)} ／ ${legendStatus(next)}　証拠を照合 ›`:'噂の断片を集める。3つ揃うと、調査が始まる。 ›'):BOX_DESC[box];
 el.dataset.legend=box==='urban'?'board':'';el.disabled=box!=='urban';
}
function legendNextStep(id){
 const n=LegendModel.count(S.levels,id),state=legendState();
 if(n<3)return `残り${3-n}断片を封筒から探す`;
 if(Object.hasOwn(state.conclusions,id))return '照合済み。次の噂を調べる';
 if(!legendProof(id))return '観測で裏付けの記録を集める';
 if(!state.testified[id])return `${WATCH_COLLEAGUES[LegendModel.CASES[id].member].name}に照会する`;
 return '証言を照合し、真相候補を記録する';
}
function legendResumeHTML(){
 const state=legendState();
 const id=[state.active,...LegendModel.ids.filter(k=>LegendModel.count(S.levels,k)>0&&!Object.hasOwn(state.conclusions,k))].find(k=>k&&LegendModel.count(S.levels,k)>0&&!Object.hasOwn(state.conclusions,k));
 if(!id)return '<p class="legend-resume">現在追跡中の噂はありません。封筒から断片を見つけてください。</p>';
 return `<section class="legend-resume" aria-label="前回の調査を再開"><small>調査の続き</small><p><strong>${legendTitle(id)}</strong> ／ ${legendNextStep(id)}</p><button class="btn-paper" data-legend="case" data-id="${id}">この調査を再開する</button></section>`;
}
function openLegendBoard(){
 const s=legendState();
 sheet('都市伝説の調査',`<div class="legend-board"><h2>噂が、証拠に変わる。</h2><p>封筒の断片3つから調査へ。既存の解読記録も引き継いでいます。</p>${legendResumeHTML()}<div class="legend-case-list">${LegendModel.ids.map(id=>{const n=LegendModel.count(S.levels,id);return `<button data-legend="case" data-id="${id}" ${n?'':'disabled'}><span><b>${n?legendTitle(id):'未入手の噂'}</b><small>${s.active===id?'追跡中 ／ ':''}${legendStatus(id)}</small></span><span aria-hidden="true">${n?'›':'―'}</span></button>`;}).join('')}</div><button class="btn-paper" data-legend="gacha">封筒から次の断片を探す</button></div>`);
}
function openLegendCase(id){
 const n=LegendModel.count(S.levels,id);if(!n)return;
 const c=LegendModel.CASES[id],s=legendState(),proof=n===3?legendProof(id):null;
 const related=Object.keys(S.incursion?.discovered||{}).map(Number).filter(k=>S.incursion.discovered[k]===true&&LegendModel.related(id,k,incursionProfile));
 const complete=Object.hasOwn(s.conclusions,id);
 sheet('都市伝説の調査',`<article class="legend-case"><button class="btn-line" data-legend="board">‹ 調査案件一覧</button><header><small>第六文書課・架空調査資料</small><h2>${legendTitle(id)}</h2><p>${legendStatus(id)}${s.active===id?' ／ 追跡中':''}</p></header><ol class="legend-fragments">${c.fragments.map(([type,text],i)=>`<li><small>断片 ${i+1} ／ ${i<n?type:'未入手'}</small><p>${i<n?text:'この断片は、まだ封筒の中にある。'}</p></li>`).join('')}</ol>${byId(id).rar==='x'&&n?`<details class="legend-original"><summary>禁の原本</summary><p>${c.original}</p></details>`:''}${n<3?`<p>あと${3-n}段の解読で調査を解放。</p><button class="btn-paper" data-legend="gacha">封筒から続きを探す</button>`:`<section class="legend-investigation"><h3>記録を照合する</h3><p>${OBSERVATIONS[c.mode].title}の観測、または同系統の保管済み異変を裏付けに使えます。関連は仮説であり、同じ怪異とは断定していません。</p><button class="btn-paper" data-legend="start" data-id="${id}" ${s.active===id?'disabled':''}>${s.active===id?'この都市伝説を追跡中':'この都市伝説を追跡する'}</button>${proof?`<button class="btn-line" data-legend="proof" data-id="${id}">裏付けの記録を読む</button><button class="btn-paper" data-legend="witness" data-id="${id}">${WATCH_COLLEAGUES[c.member].name}に照会する</button>`:`<p>裏付けの記録は未取得。</p><button class="btn-line" data-legend="observe" data-id="${id}">${observationState().unlocked.includes(c.mode)?'観測で裏付けを集める':`${OBSERVATIONS[c.mode].title}の観測装備を確認する`}</button>`}${related.length?`<details><summary>関連する保管済み異変 ${related.length}件</summary><div class="legend-related">${related.map(k=>`<button class="btn-line" data-legend="incident" data-kind="${k}">${INCURSIONS[k].short}</button>`).join('')}</div></details>`:''}${complete?`<p class="legend-conclusion">記録した候補：${s.conclusions[id]===0?'記録の側が書き換わっている':'現地の怪異がこちらへ近づいている'}。確定には、まだ矛盾が残る。</p><button class="btn-paper" data-legend="gacha">新しい封筒を調べる</button>`:s.testified[id]&&proof?`<fieldset class="legend-hypotheses"><legend>証言を踏まえ、真相候補を記録</legend><p>どちらも仮説です。正解・不正解やptの増減はありません。</p><button class="btn-line" data-legend="conclude" data-id="${id}" data-choice="0">記録の側が書き換わっている</button><button class="btn-line" data-legend="conclude" data-id="${id}" data-choice="1">現地からこちらへ近づいている</button></fieldset>`:''}</section>`}</article>`);
}
function legendWitness(id){
 const c=LegendModel.CASES[id];if(!c||LegendModel.count(S.levels,id)!==3||!legendProof(id))return;
 const s=legendState(),m=WATCH_COLLEAGUES[c.member];
 WatchModel.closeMonitor(observationState(),Date.now(),true);
 if(!s.testified[id]){s.testified[id]=true;WatchModel.talk(observationState(),Date.now(),c.member);}
 watchContacts()[c.member]=true;markDirty();save();
 watchConversationPage(`<div class="watch-conversation"><button class="menu-back" data-watch="colleagues">‹ 課内の人たち</button><header class="watch-speaker">${watchPortrait(m)}<div><small>${m.role}</small><h1 tabindex="-1">${m.name}</h1><p>${m.description}</p></div></header><p class="watch-conversation-cue">「${legendTitle(id)}」の3断片と、裏付けの記録を机に並べた。</p><blockquote tabindex="-1">${c.witness}</blockquote><div class="watch-dialogue-actions"><button class="btn-paper" data-legend="case" data-id="${id}">証言を持ち帰り、真相候補を記録する</button><button class="btn-line" data-watch-talk="${c.member}" data-topic="rest">少し休みたい</button></div><button class="btn-line" data-watch="leave">観測へ戻る</button></div>`,c.member);
}
function legendSeepageContext(){
 const id=legendState().active,c=LegendModel.CASES[id];if(!c)return null;
 const o=observationState(),event=S.incursion?.event;
 return o.pending?.rarity>0?(o.mode===c.mode?id:null):event&&LegendModel.related(id,event.kind,incursionProfile)?id:null;
}
function legendSeepageCopy(event,base){
 const c=LegendModel.CASES[event.legendId];if(!c||LegendModel.count(S.levels,event.legendId)!==3)return base;
 return {...base,member:c.member,copy:base.kind==='colleague'?c.odd:base.kind==='caption'?c.seep:base.copy};
}
function legendIncidentLinks(kind){
 const ids=LegendModel.ids.filter(id=>LegendModel.count(S.levels,id)>0&&LegendModel.related(id,kind,incursionProfile));
 return ids.length?`<details class="legend-incident-links"><summary>この現象と関連する噂</summary>${ids.map(id=>`<button class="btn-line" data-legend="case" data-id="${id}">${legendTitle(id)} ／ ${legendStatus(id)}</button>`).join('')}</details>`:'';
}
function legendObservationLinks(mode){
 const ids=LegendModel.ids.filter(id=>LegendModel.count(S.levels,id)===3&&LegendModel.CASES[id].mode===mode);
 return ids.length?`<div class="legend-observation-links">${ids.map(id=>`<button class="btn-line" data-legend="case" data-id="${id}">「${legendTitle(id)}」の裏付けに照合する</button>`).join('')}</div>`:'';
}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-legend]');if(!b||b.disabled||isLite())return;
 const action=b.dataset.legend,id=b.dataset.id;
 if(document.getElementById('incursion-dialog').open)document.getElementById('incursion-dialog').close();
 if(action==='board')return openLegendBoard();
 if(action==='case')return openLegendCase(id);
 if(action==='gacha'){hideSheet();box='urban';go('gacha');render();fitGacha();return;}
 if(!Object.hasOwn(LegendModel.CASES,id)&&action!=='incident')return;
 if(action==='start'){if(LegendModel.start(legendState(),S.levels,id)){markDirty();save();renderLegendLead();openLegendCase(id);}return;}
 if(action==='witness')return legendWitness(id);
 if(action==='proof'){const p=legendProof(id);if(!p||LegendModel.count(S.levels,id)!==3)return;hideSheet();if(p.incident!==undefined)openIncursionRecords(p.incident);else showWatchRecord(p.mode,p.rarity);return;}
 if(action==='observe'){hideSheet();const mode=LegendModel.CASES[id].mode;if(observationState().unlocked.includes(mode)){go('home');renderObservation();}else{go('lab');renderObservationLab();}return;}
 if(action==='incident'){const k=Number(b.dataset.kind);if(!S.incursion?.discovered?.[k])return;hideSheet();openIncursionRecords(k);return;}
 if(action==='conclude'){if(LegendModel.conclude(legendState(),S.levels,id,Number(b.dataset.choice),legendProof(id))){markDirty();save();openLegendCase(id);}}
});

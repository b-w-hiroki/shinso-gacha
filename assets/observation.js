/* The home is one live scene. Management and explanations live off the scene. */
// Eligibility is checked in the model for both purchase and execution.
const WATCH_AUTOMATION_AVAILABLE=true;
const OBSERVATIONS={
 cctv:{title:'公園',source:'CAM 04',ratio:1.2,records:['日中の公園','風のないブランコ','影だけの来園者','砂場の整列']},
 photo:{title:'食卓',source:'PHOTO 03',ratio:.75,records:['三人分の夕食','浮いた箸','四人目の夕食','窓の内側']},
 vision:{title:'商店街',source:'LINK 07',ratio:.75,records:['巡回中','視線を持つ傘','全員が気づいた','着衣だけの通行人']},
 dash:{title:'県道',source:'DRIVE 11',ratio:1.333333,records:['雨上がり','夜を映す鏡','繰り返す県道','白い横断者']}
};
/* Three visual conditions per source, without reclassifying the saved observation IDs. */
const OBS_SCENE_CONDITIONS={
 cctv:['定点監視','薄明','夜間記録'],photo:['原本','退色','低照度'],
 vision:['通常回線','残像','受信不良'],dash:['通常走行','霧雨','暗所']
};
function observationCondition(o){return Math.abs(Number(o.sequence)||0)%3;}
let watchMessage='',watchMessageUntil=0,watchPaint='',watchLastTick=0;
function observationState(){
 if(!S.observation||![2,3].includes(S.observation.version)){
  const seed=globalThis.crypto?.getRandomValues?crypto.getRandomValues(new Uint32Array(1))[0]:Math.floor(Math.random()*0xffffffff);
  S.observation=WatchModel.create(Date.now(),seed,S.observation);save();
 }
 const migrated=S.observation.version===2,o=WatchModel.normalize(S.observation),credit=WatchModel.takeRouteCredit(o);
 if(credit)S.currency+=credit;
 const id=typeof LegendModel!=='undefined'?LegendModel.state(S.legends,S.levels).active:null,c=LegendModel.CASES[id];
 WatchModel.focus(o,c?{id,mode:c.mode,rarities:c.rarities}:null);
 if(migrated||credit){markDirty();save();}
 return o;
}
function observationSync(now=Date.now()){
 const o=observationState(),changed=WatchModel.sync(o,now);
 if(changed)markDirty();return o;
}
function watchDuration(ms){const minutes=Math.max(0,Math.ceil(ms/60000));return minutes>=60?`${Math.floor(minutes/60)}時間${minutes%60?`${minutes%60}分`:''}`:`${minutes}分`;}
function watchElapsed(ms){const minutes=Math.max(1,Math.floor(ms/60000));return minutes>=60?`${Math.floor(minutes/60)}時間${minutes%60?`${minutes%60}分`:''}`:`${minutes}分`;}
function renderObservation(){
 const f=document.getElementById('obs-frame');if(!f||isLite())return;
 const o=observationSync(),p=o.pending,m=OBSERVATIONS[o.mode],r=p?.rarity??0;
 const advanced=r===1||r===3,side=r===2||r===3?'right':'left';
 const src=`assets/observation/${o.mode}${advanced?'-variants':''}.webp`;
 const condition=observationCondition(o);
 const paint=`${o.mode}/${p?.sequence??'idle'}/${r}/${condition}`;
 if(paint!==watchPaint){
  const im=document.getElementById('obs-image');im.style.backgroundImage=`url("${src}")`;im.style.backgroundPosition=`${side} center`;
  f.style.setProperty('--obs-ratio',m.ratio);f.dataset.mode=o.mode;f.dataset.rarity=r;f.dataset.condition=String(condition);
  f.classList.remove('obs-change');if(watchPaint){void f.offsetWidth;f.classList.add('obs-change');}watchPaint=paint;
 }
 const quiet=o.quiet||!!S.incursion?.quiet;
 f.dataset.trace=String(r>0&&condition===2&&!quiet?'1':'0');
 f.dataset.quiet=String(quiet);f.dataset.ready=String(!o.mind.closed);f.dataset.closed=String(o.mind.closed);f.disabled=o.mind.closed;f.setAttribute('aria-disabled',String(o.mind.closed));
 const danger=!!p&&p.rarity>0;
 document.querySelectorAll('[data-watch="settings"]').forEach(b=>b.hidden=!watchSettingsUnlocked());
 document.getElementById('obs-rest').textContent=o.mind.closed?'観測を再開':'回線を切る';
 document.getElementById('obs-closed').hidden=!o.mind.closed;
 f.setAttribute('aria-label',o.mind.closed?'観測モニタは閉じています':`${m.title}。${danger?'違和感のある場所をタップ。キーボードでは場所を選んで対処':'タップで観測を進める'}`);
 document.getElementById('obs-source').textContent=m.source+' ／ '+OBS_SCENE_CONDITIONS[o.mode][condition];
 document.getElementById('obs-name').textContent=m.title;
 document.getElementById('obs-ready').hidden=!danger||o.mind.closed;
 document.getElementById('obs-ready').textContent=danger?'異変の場所を繰り返しタップ':'記録を受信';
 const help=document.getElementById('obs-help');if(help)help.hidden=!danger||o.mind.closed;
 document.getElementById('obs-timer').textContent=p&&!danger&&!o.mind.closed?`記録の確認期限まで ${watchDuration(p.expiresAt-o.lastSeen)}`:'';
 const hint=document.getElementById('obs-first-hint');hint.hidden=true;hint.textContent=danger?'違和感のある場所に触れる':'映像に触れて観測する';

 if(Date.now()>watchMessageUntil)watchMessage='';document.getElementById('obs-feedback').textContent=watchMessage;
 const pressure=WatchModel.contamination(o);
 document.getElementById('obs-atmosphere').textContent=o.mind.closed?'切った回線の向こうは、もう確認しない。':pressure>=3?'画面を閉じても、この輪郭が残りそうだ。':pressure===2?'映像の外側にも、視線を感じる。':pressure===1?'さっきから、部屋の気配が変わらない。':watchLeadCopy(o)||['映っていない場所が、気になる。','誰もいない。そう記録されている。','こちらの様子は、映っていないはずだ。'][o.sequence%3];
 if(typeof investigationHome==='function')investigationHome();
 renderWatchMind();fitObservation();
 // The screen reader can request the timer; normal viewing stays quiet.
}
function observationTick(){
 if(Date.now()-watchLastTick<1000)return;watchLastTick=Date.now();
 if(isLite())return;
 const scene=document.getElementById('obs-frame').getBoundingClientRect();
 const active=scene.bottom>0&&scene.top<innerHeight-60&&!document.hidden&&!document.getElementById('incursion-dialog').open&&document.getElementById('sheet-bg').hidden&&document.getElementById('stage').hidden&&!!document.getElementById('obs-frame').getClientRects().length;
 const o=observationState(),before=[o.tapProgress,o.pending?.suppression,o.pending?.sequence,o.sequence].join('/');
 const targeting=!document.getElementById('sheet-bg').hidden&&!!document.querySelector('.watch-target-regions');
 watchMindTick(active||targeting);
 const result=WatchModel.automate(o,Date.now(),WATCH_AUTOMATION_AVAILABLE&&active);
 if(result)observationReward(result,true);else {
  if(before!==[o.tapProgress,o.pending?.suppression,o.pending?.sequence,o.sequence].join('/'))markDirty();
  renderObservation();
 }
 const dot=document.getElementById('dot-home');if(S.observation?.pending&&dot)dot.hidden=false;
}
function observationReward(result,auto=false){
 const record=result.record;record.reward=Math.round(record.reward*(1+.1*upLv('lens')));
 S.currency+=record.reward;
 if(!auto){S.clicks++;bump('click');if(record.rarity>=2)incursionInvestigate();}
 watchMessage=`${result.kind==='anomaly'?'干渉停止。観測を継続してください。':'記録を転送しました。'} +${record.reward}pt`;watchMessageUntil=Date.now()+4500;
 markDirty();render();if(!auto)buzz(result.kind==='anomaly'?30:8);
}
let watchTouchTimer,watchJolt,watchMisses=0,watchCurrencyDirty=false;
function observationTapReward(){
 S.currency+=1;watchCurrencyDirty=true;animatePt(true);
}
function observationTouchFeedback(event,strike){
 const frame=document.getElementById('obs-frame');
 // Extend one low-contrast pulse during repeated input; never stack flashes.
 const rect=frame.getBoundingClientRect(),onImage=event?.currentTarget===frame&&event.detail>0;
 const x=onImage?Math.max(0,Math.min(rect.width,event.clientX-rect.left)):rect.width/2;
 const y=onImage?Math.max(0,Math.min(rect.height,event.clientY-rect.top)):rect.height/2;
 frame.style.setProperty('--touch-x',`${x}px`);frame.style.setProperty('--touch-y',`${y}px`);
 watchJolt?.cancel();
 if(frame.dataset.quiet!=='true'&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
  const im=document.getElementById('obs-image'),n=strike?3:1.5;
  watchJolt=im.animate([{transform:`translate(calc(-50% + ${n}px),calc(-50% - ${n}px))`},{transform:`translate(calc(-50% - ${n}px),-50%)`},{transform:'translate(-50%,-50%)'}],{duration:160,easing:'ease-out'});
 }
 clearTimeout(watchTouchTimer);frame.classList.toggle('obs-strike',strike);frame.classList.add('obs-touched');
 watchTouchTimer=setTimeout(()=>frame.classList.remove('obs-touched','obs-strike'),180);
}
function observationCollect(event){
 if(isLite())return;
 const o=observationSync();if(o.mind.closed)return;
 const strike=!!o.pending&&o.pending.rarity>0;
 if(strike&&(event?.currentTarget!==document.getElementById('obs-frame')||!event.detail))return observationTargetPicker();
 observationTapReward();
 let point=null;
 if(strike){const r=document.getElementById('obs-image').getBoundingClientRect();point={x:(event.clientX-r.left)/r.width,y:(event.clientY-r.top)/r.height};}
 const contact=strike&&WatchModel.hit(o,point);
 const result=strike?WatchModel.suppress(o,Date.now(),point):WatchModel.tap(o,Date.now());
 if(result){watchMisses=0;observationReward(result);}else {
  if(strike){watchMisses=contact?0:watchMisses+1;
   if(contact||watchMisses>=3){watchMessage=contact?'輪郭が揺らいだ。まだ、そこにいる。':'この場所からは反応がない。';watchMessageUntil=Date.now()+2200;}
  }
  markDirty();renderObservation();
 }
 observationTouchFeedback(event,contact);
}
function watchSettingsUnlocked(){return Object.values(observationState().upgrades).some(level=>level>0);}
function observationSettings(){
 if(!watchSettingsUnlocked())return;
 const o=observationSync(),p=o.pending;
 sheet('観測設定',`<div class="watch-settings"><h2>${WatchModel.MODES[o.mode].label} ／ ${OBSERVATIONS[o.mode].title}</h2><p>${p?`受取期限まで ${watchDuration(p.expiresAt-o.lastSeen)}`:`定時観測まで ${watchDuration(o.dueAt-o.lastSeen)}`}</p><p>離れていても記録が残る時間：${WatchModel.RETENTION[o.upgrades.retention]}時間</p><p>映像に触れて照合を進め、完了すると4地点のうち別の場所へ移ります。追跡中の噂に関連する場所と未観測の記録を優先します。異変は、映像内の違和感がある付近に繰り返し触れて抑えます。別の場所や通常巡回では除去できません。場所選択からも対処できます。結果は観測ごとに固定され、再読込や育成では引き直されません。</p><p>異変を見続け、真相を追い続けると画面の外へ干渉が広がります。手を止める、モニタを閉じる、課内で話すと落ち着きます。不在中には悪化せず、資料やptも失われません。</p><button class="btn-paper" data-watch="lab">観測装備を変更・育成</button>${WatchModel.automationUnlocked(o,'patrol')&&o.upgrades.patrol?`<label><input type="checkbox" data-watch-auto ${o.autoEnabled?'checked':''}> 自動巡回・鎮静を有効にする</label><p>自動化は調査室で強化。観測映像の表示中だけ進み、別画面・資料閲覧・対処中は停止。留守中の自動pt獲得は継続します。</p>`:''}<label><input type="checkbox" data-watch-quiet ${o.quiet?'checked':''}> 揺れ・瞬きを抑える</label><details><summary>観測記録 ${o.collected}件</summary><ul>${o.history.slice().reverse().map(h=>`<li>${WatchModel.RARITY[h.rarity].name} · ${OBSERVATIONS[h.mode].records[h.rarity]} · +${h.reward}pt</li>`).join('')||'<li>記録はまだありません。</li>'}</ul></details><details><summary>出現率と報酬</summary><p>観測先へ移るときに平常か異変かを抽選。異変の種類は未遭遇と追跡中の噂を優先します。受取前の引き直しはできません。</p><p>平常 ${WatchModel.ODDS[o.upgrades.sensitivity][0]}% ／ 異変 ${100-WatchModel.ODDS[o.upgrades.sensitivity][0]}%（最大12%）</p><p>通常巡回 8pt、異変鎮静 R / SR / SSR は80 / 200 / 480pt。方式倍率：監視×1、写真×1.25、視界×1.5、車載×2。虫眼鏡でさらに1Lvあたり+10%（四捨五入）。</p></details><button class="btn-line" data-desk="evidence">別件の検知記録</button><button class="btn-line" data-inc="open">異変の対処記録</button></div>`);
}
function watchUpgradeValues(id){
 if(id==='retention')return WatchModel.RETENTION.map(x=>x+'時間まで記録が残る');
 if(id==='interval')return WatchModel.INTERVAL.map(x=>'照合間隔 '+x+'分');
 if(id==='sensitivity')return WatchModel.ODDS.map(row=>'異変 '+(100-row[0])+'%');
 return WatchModel.AUTO_SECONDS.map((x,lv)=>lv?(id==='suppression'?WatchModel.RARITY[WatchModel.autoTier(lv)].name+'まで・':'')+x+'秒に1回':'手動');
}
function watchLeadCopy(o){
 if(!o.lead||o.pending?.rarity>0||!OBSERVATIONS[o.lead.mode])return '';
 const id=o.lead.legendId,known=id&&LegendModel.count(S.levels,id)===3,place=OBSERVATIONS[o.lead.mode].title;
 const lines=[`無線：${place}の記録に、照合先が見つかった。`,`課内連絡：${place}の記録を別の時刻と比べてほしい。`,`照合メモ：${place}について、同じ報告が届いている。`];
 return known?`課内連絡：「${legendTitle(id)}」の断片は${place}と照合できそうだ。`:lines[(o.lead.step-1)%lines.length];
}
function renderObservationLab(){
 const root=document.getElementById('observation-lab');if(!root)return;if(isLite()){root.innerHTML='';return;}
 const o=observationState();
 root.innerHTML=`<section class="watch-lab"><div class="watch-lab-heading"><h2>観測装備</h2><span>${o.collected}件</span></div><p class="watch-lab-context">${OBSERVATIONS[o.mode].title} ／ 異変 ${(100-WatchModel.ODDS[o.upgrades.sensitivity][0]).toFixed(1).replace(/\.0$/,'')}%<br>${o.focusLegend?'追跡中：'+escapeHTML(legendTitle(o.focusLegend)):'追跡中の噂はありません'}</p><div class="watch-lab-links"><button class="btn-paper" data-watch="return">観測へ戻る</button><button class="btn-line" data-watch="settings" ${watchSettingsUnlocked()?'':'hidden'}>観測設定</button></div><p class="watch-note">4地点を巡回。同じ場所を続けず、追跡中の噂と未観測の場所を優先します。</p><div class="watch-equipment">${Object.entries(WatchModel.MODES).map(([id,m])=>`<article class="watch-mode ${id===o.mode?'equipped':''}"><div><b>${m.label}</b><small>${OBSERVATIONS[id].title} · pt ×${m.mult}</small></div><span>${id===o.mode?'● 観測中':o.focusMode===id?'噂の照合先':'巡回対象'}</span></article>`).join('')}</div>${o.routeCredit?`<p class="watch-note">以前の観測先解放分 ${o.routeCredit}ptを返還済み。育成と記録は引き継いでいます。</p>`:''}<details class="watch-upgrades"><summary>観測を強化 <span>${WatchModel.RETENTION[o.upgrades.retention]}h</span></summary>${Object.entries(WatchModel.UPGRADES).filter(([id])=>!['patrol','suppression'].includes(id)||WatchModel.automationUnlocked(o,id)).map(([id,u])=>{const lv=o.upgrades[id],max=lv===u.max,values=watchUpgradeValues(id);return `<article><div><b>${u.name} · Lv.${lv}/${u.max}</b><small>${values[lv]}${max?'':` → ${values[lv+1]}`}</small></div><button data-watch-upgrade="${id}" ${max||S.currency<u.costs[lv]?'disabled':''}>${max?'最大':`${u.costs[lv]}pt`}</button></article>`;}).join('')}<p class="watch-note">異常感度は0.5ポイントずつ、最大12%。離れていても記録が残る時間は最大24時間、巡回効率は最大Lv.6。自動化は最大Lv.9・1秒に1回。自動巡回は記録20件、自動鎮静は手動鎮静10件と自動巡回Lv.1で解放。鎮静Lv.1/5/9でR/SR/SSRまで対応。受取待ちの抽選結果は育成で変わりません。</p></details></section>`;
}
document.getElementById('obs-frame').addEventListener('click',observationCollect);
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-watch],[data-watch-equip],[data-watch-unlock],[data-watch-upgrade]');if(!b||b.disabled)return;
 if(b.dataset.watch==='target')return observationTargetPicker();
 if(b.dataset.watch==='settings')return observationSettings();
 if(b.dataset.watch==='lab'){document.getElementById('sheet-bg').hidden=true;go('lab');setSectionTab('lab:upgrade');document.querySelector('.watch-upgrades').open=true;return;}
 if(b.dataset.watch==='return'){hideSheet();go('home');setHomeTab('desk');return;}
 const o=observationSync();let cost=null;
 if(b.dataset.watchEquip){if(!WatchModel.equip(o,b.dataset.watchEquip,Date.now()))return;}
 else if(b.dataset.watchUnlock){cost=WatchModel.unlock(o,b.dataset.watchUnlock,S.currency);if(cost===null)return;S.currency-=cost;}
 else if(b.dataset.watchUpgrade){if(!WATCH_AUTOMATION_AVAILABLE&&['patrol','suppression'].includes(b.dataset.watchUpgrade))return;cost=WatchModel.upgrade(o,b.dataset.watchUpgrade,S.currency,Date.now());if(cost===null)return;S.currency-=cost;}
 else return;
 const expanded=document.querySelector('.watch-upgrades')?.open;markDirty();render();if(expanded)document.querySelector('.watch-upgrades').open=true;
});
document.addEventListener('change',e=>{if(WATCH_AUTOMATION_AVAILABLE&&e.target.matches('[data-watch-auto]')){observationState().autoEnabled=e.target.checked;observationState().autoLastAt=Date.now();markDirty();}if(e.target.matches('[data-watch-quiet]')){observationState().quiet=e.target.checked;markDirty();renderObservation();}});
document.addEventListener('visibilitychange',()=>{if(typeof S!=='undefined'&&!isLite()){observationState().autoLastAt=Date.now();if(!document.hidden)observationTick();}});

function renderObservationAlbum(){
 const root=document.getElementById('watch-album');if(!root||isLite())return;
 const o=observationState(),count=Object.keys(OBSERVATIONS).reduce((n,mode)=>n+WatchModel.setProgress(o,mode),0);
 root.innerHTML=`<div class="watch-album-count"><b>観測記録</b><span>${count} / 16</span></div>${Object.entries(OBSERVATIONS).map(([mode,m])=>`<section class="watch-album-group"><h3>${m.title} <small>${WatchModel.setProgress(o,mode)}/4</small></h3><div class="watch-album-grid">${[0,1,2,3].map(r=>{const n=o.collection[mode+':'+r]||0;return `<button data-watch-record="${mode}:${r}" ${n?'':'disabled'}><b>${WatchModel.RARITY[r].name}</b><span>${n?m.records[r]:'未観測'}</span><small>${n?'×'+n+(investigationState().read[mode+':'+r]?'':' · 未読'):'―'}</small></button>`;}).join('')}</div><button class="watch-set-reward" data-watch-set="${mode}" ${WatchModel.setProgress(o,mode)!==4||o.completedSets[mode]?'disabled':''}>${o.completedSets[mode]?'✓ 全4種・達成報酬受取済み':WatchModel.setProgress(o,mode)===4?`全4種達成 · ${WatchModel.SET_REWARDS[mode]}ptを受け取る`:`全4種で ${WatchModel.SET_REWARDS[mode]}pt`}</button>${watchResearchHTML(o,mode)}</section>`).join('')}`;
}
function watchResearchHTML(o,mode){
 const r=WatchModel.researchStatus(o,mode);if(!o.unlocked.includes(mode)||!r.missing.length)return '';
 return `<div class="watch-research"><span>重複記録 ${r.available} / ${WatchModel.RESEARCH_COST}</span><button data-watch-research="${mode}" ${r.ready?'':'disabled'}>照合する</button></div>`;
}
function showWatchRecord(mode,rarity,restored=false){
 const o=observationState(),key=mode+':'+rarity,m=OBSERVATIONS[mode];if(!m||!o.collection[key])return;
 const advanced=rarity===1||rarity===3,side=rarity===2||rarity===3?'right':'left';
 WatchModel.closeMonitor(o,Date.now(),true);
 sheet(restored?'未発見の記録を復元':'観測資料',`<div class="watch-record-image" role="img" aria-label="${m.records[rarity]}" style="aspect-ratio:${m.ratio};background-image:url('assets/observation/${mode}${advanced?'-variants':''}.webp');background-position:${side} center"></div><div class="watch-record-caption"><b>${WatchModel.RARITY[rarity].name} ／ ${m.records[rarity]}</b><span>記録 ${o.collection[key]}件${o.reconstructed[key]?' · 照合で復元':''}</span></div>${rarity>0&&o.collection[mode+':0']?`<div class="watch-compare"><p id="watch-compare-status" aria-live="polite">発見した記録：${m.records[rarity]}</p><button class="btn-paper" data-watch-compare="${mode}:${rarity}" aria-pressed="false">平常の記録と見比べる</button></div>`:''}${investigationMemo(mode,rarity)}`);
}
document.addEventListener('click',e=>{
 const study=e.target.closest('[data-watch-research],[data-watch-research-confirm]');
 if(study){
  if(study.disabled||isLite())return;
  const o=observationState(),mode=study.dataset.watchResearch||study.dataset.watchResearchConfirm,r=WatchModel.researchStatus(o,mode);
  if(!r?.ready)return;
  if(study.dataset.watchResearch){
   sheet('重複記録の照合',`<div class="watch-research-confirm"><h2>${OBSERVATIONS[mode].title}</h2><p>重複${WatchModel.RESEARCH_COST}件を使い、未発見の記録を1件復元します。</p><p>発見済みの画像・記録件数は残ります。ptと観測回収数は増えません。</p><button class="btn-paper" data-watch-research-confirm="${mode}" data-spent="${r.spent}">${WatchModel.RESEARCH_COST}件で照合する</button><button class="btn-line" data-watch-research-cancel>戻る</button></div>`);return;
  }
  const result=WatchModel.research(o,mode,Number(study.dataset.spent));if(!result)return;
  markDirty();render();showWatchRecord(result.mode,result.rarity,true);return;
 }
 if(e.target.closest('[data-watch-research-cancel]')){document.getElementById('sheet-bg').hidden=true;return;}
 const rewardButton=e.target.closest('[data-watch-set]');
 if(rewardButton&&!rewardButton.disabled){
  if(isLite())return;
  const reward=WatchModel.claimSet(observationState(),rewardButton.dataset.watchSet);if(reward===null)return;
  S.currency+=reward;markDirty();render();return;
 }
 const compare=e.target.closest('[data-watch-compare]');
 if(compare){
  const [mode,r]=compare.dataset.watchCompare.split(':'),rarity=Number(r),o=observationState();
  if(!OBSERVATIONS[mode]||!o.collection[mode+':0']||!o.collection[mode+':'+rarity])return;
  const normal=compare.getAttribute('aria-pressed')!=='true',shown=normal?0:rarity,m=OBSERVATIONS[mode];
  const im=document.querySelector('.watch-record-image');if(!im)return;
  im.style.backgroundImage=`url('assets/observation/${mode}${shown===1||shown===3?'-variants':''}.webp')`;
  im.style.backgroundPosition=`${shown===2||shown===3?'right':'left'} center`;
  im.setAttribute('aria-label',m.records[shown]);
  document.getElementById('watch-compare-status').textContent=normal?`平常の記録：${m.records[0]}`:`発見した記録：${m.records[rarity]}`;
  compare.setAttribute('aria-pressed',String(normal));compare.textContent=normal?'発見した記録へ戻す':'平常の記録と見比べる';return;
 }
 const b=e.target.closest('[data-watch-record]');if(!b||b.disabled)return;
 const [mode,r]=b.dataset.watchRecord.split(':'),rarity=Number(r),o=observationState();if(!o.collection[b.dataset.watchRecord])return;
 showWatchRecord(mode,rarity);
});

// Persistent unease belongs to the observation state; page visibility gates exposure.
let watchMindBoot=false,watchMindSavedAt=0;
function watchMindTick(viewing=false){
 const o=observationState(),now=Date.now();
 const changed=WatchModel.mindTick(o,now,{viewing,visible:watchMindBoot&&!document.hidden});watchMindBoot=true;
 if(changed){save();if(now-watchMindSavedAt>=15000){markDirty();watchMindSavedAt=now;}}
 renderWatchMind();
}
function watchPursue(amount){if(isLite())return;WatchModel.pursue(observationState(),Date.now(),amount);renderWatchMind();}
function renderWatchMind(){
 const o=observationState(),stage=isLite()?0:WatchModel.contamination(o);
 document.body.dataset.watchMind=String(stage);
 document.body.classList.toggle('watch-mind-quiet',o.quiet||!!S.incursion?.quiet);
 const frame=document.getElementById('obs-frame');
 frame.dataset.seep=String(o.mind.closed?0:stage);
 frame.dataset.anomaly=String(!isLite()&&!o.mind.closed&&o.pending?.rarity>0?Math.max(1,stage):0);
 if(typeof renderPlayerSeepage==='function')renderPlayerSeepage();
}
function observationRest(){
 const o=observationState(),now=Date.now(),wasClosed=o.mind.closed;
 const away=wasClosed&&Number.isFinite(o.awaySince)&&o.awaySince>0?Math.max(0,now-o.awaySince):0;
 WatchModel.closeMonitor(o,now,!wasClosed);
 if(o.mind.closed){o.awaySince=now;calmPlayerSeepage();}else o.awaySince=0;
 watchMessage=o.mind.closed?'回線を切りました。今は、見なくてかまいません。':away>=60000?'観測から離れていた時間 '+watchElapsed(away)+'。誰も見ていなかった映像を確認してください。':'回線を開きました。';watchMessageUntil=now+8500;
 markDirty();renderObservation();
}
const WATCH_REGIONS=['左上','中央上','右上','左中央','中央','右中央','左下','中央下','右下'];
function observationTargetPicker(message='異変が見えた場所を選ぶ。同じ枠を繰り返し押すと対処できます。'){
 const o=observationState();if(o.mind.closed||!o.pending?.rarity)return;
 sheet('異変の対処',`<p class="watch-target-copy" role="status">${message}</p><div class="watch-target-regions">${WATCH_REGIONS.map((name,i)=>`<button data-watch-region="${i}">${name}</button>`).join('')}</div><p class="hint">同じ付近に繰り返し触れて干渉を抑える。映像へ戻って直接タップすることもできます。</p><button class="btn-line" data-act="close">映像へ戻る</button>`);
}
const WATCH_COLLEAGUES={
 records:{name:'白瀬',role:'記録係',portrait:'shirose',description:'観測記録の受領と保管。記録の食い違いを相談できる。',greeting:'記録係の白瀬です。あなたの報告を受け取ります。席は空いています。見たものを、順番に話してください。',again:'この前の記録は、私が持っています。今日は続きを急がなくていい。',
 strange:['記録にないものは、すぐ名前を付けなくていいんです。名前の欄だけ、先に埋まることがあります。','同じ写真でも、余白が減っていることがあります。中のものが増えたとは限りません。','あなたの報告書、筆跡は合っています。ただ、提出日は明日になっています。'],
 rest:['資料は伏せておきます。お茶が冷めるまで、何も確かめなくて大丈夫。','ここでは仕事の話をしなくてもいいんです。……時計も、見なくていい。','窓の外より、この机を見ていてください。傷の数は、昨日と同じです。'],
 office:['紙コップは人数分です。ひとつ余っていても、捨てないことになっています。','内線表の空欄には、何も書かないでください。前の係の申し送りです。','出勤簿は私が閉じます。あなたの隣の欄は、気にしなくていい。'],
 past:['前任者の引継ぎは、目次だけ残っています。本文は、読んだ人が持って帰ったそうです。','古い職員証の写真は、裏返して保管しています。退職後も更新されるので。','この課ができた日ですか。設置より古い受領印があるので、確認中です。']},
 equipment:{name:'榊',role:'設備担当',portrait:'sakaki',description:'モニタと回線の保守。映像や機材の異常を相談できる。',greeting:'設備担当の榊です。モニタと回線は私が見ています。回線は切ってあります。まだ映っていても、触らないでください。',again:'さっき抜いたケーブルは、まだ抜いたままです。確かめに戻る必要はありません。',
 strange:['映像全部に触れても止まりません。おかしい場所、その付近だけです。長く見続けないで。','故障なら、毎回同じように壊れます。今のは、こちらの操作を待っていました。','音声のない機材です。声が聞こえたら、音量を探さず回線を切ってください。'],
 rest:['モニタは私が見ておきます。……いえ、電源を抜いておきます。少し離れて。','工具を片付ける間、座っていてください。今は何もしなくていい。','手、冷えていますね。湯のみを持っていてください。機材は後でいいです。'],
 office:['白瀬さんと話した？　今日は休みの連絡を受けています。……確認は、明日にしましょう。','休憩室の呼び鈴、線が来ていないんです。鳴っても誰も立たないでしょう。','机の下のコードは数えないでください。必要な本数は、私が覚えています。'],
 past:['撤去したモニタの番号が、今朝の接続一覧にありました。予備機ということにしています。','前の担当が残した工具箱、鍵が内側にあります。開けた記録はありません。','この部屋の図面は取り寄せません。前に届いたものには、出口がありませんでした。']},
 senior:{name:'三輪',role:'先輩調査員',portrait:'miwa',description:'現場調査を知る先輩。調査の進め方や以前の出来事を聞ける。',greeting:'三輪だ。ここでは少し先輩になる。調べ方に迷ったら聞いてくれ。追うほど向こうにも道ができる。まず座ろう。',again:'また来たな。ちゃんと、戻る場所を覚えていたか。',
 strange:['画面の外まで違和感が残るなら、深追いしないことだ。真相は逃げない。こちらを待っている。','見つけた、とすぐ口にしないほうがいい。向こうも、そう思うかもしれない。','何も映らない時間を覚えておけ。異変のほうが、普通に見え始める前に。'],
 rest:['何も調べない時間も仕事のうちだ。急ぐな。普通の話をしていこう。','帰りに何を食べる？　思いつくまで、ここにいていい。','椅子はそのままでいい。背中を預けろ。今は誰の報告にも答えなくていい。'],
 office:['名前で呼べる相手がいるうちは、ここへ戻ってこい。席の番号だけになったら、休め。','廊下ですれ違っても、返事をしないことがある。ここで会ったときに話してくれ。','空いている席は、空けておく。それだけ覚えていればいい。'],
 past:['前任の話は、記録と本人で少し違う。どちらも嘘をついているつもりはないんだろう。','初日に言われたことは忘れない。「着任、おめでとう」ではなく「お帰り」だった。','この課を出た人のことも覚えている。顔より先に、名前が思い出せなくなる。']}
};
const WATCH_TOPICS={strange:'見たものについて',rest:'少し休みたい',office:'課内のこと',past:'以前のこと'};
function watchPortrait(m){const id=Object.keys(WATCH_COLLEAGUES).find(id=>WATCH_COLLEAGUES[id]===m)||'';return `<img data-seep-person="${id}" src="assets/colleagues/${m.portrait}.webp" alt="" width="90" height="120">`;}
function watchContacts(){
 const o=observationState();if(!o.contacts||typeof o.contacts!=='object'||Array.isArray(o.contacts))o.contacts={};return o.contacts;
}
function watchConversationPage(html,member=''){
 hideSheet();go('colleagues');const page=document.querySelector('[data-view="colleagues"]');
 page.dataset.member=member;page.innerHTML=html;renderPlayerSeepage();page.querySelector('[tabindex="-1"]')?.focus({preventScroll:true});
}
function observationColleagues(){
 const echo=observationState().echo;if(echo?.end>Date.now())echo.returnedAt=Date.now();
 WatchModel.closeMonitor(observationState(),Date.now(),true);markDirty();renderObservation();
 const contacts=watchContacts();
 watchConversationPage(`<div class="watch-colleagues"><header><small>第六文書課 ／ 休憩室</small><h1 tabindex="-1">課内で話す</h1><p class="watch-room-note">相談する相手を選ぶ。回線は切ってあります。</p></header><div class="watch-people">${Object.entries(WATCH_COLLEAGUES).map(([id,m])=>`<button class="watch-person" data-watch-member="${id}">${watchPortrait(m)}<span><small>${m.role} · ${contacts[id]?'面識あり':'初めて話す'}</small><b>${m.name}</b><span class="watch-person-description">${m.description}</span><span class="watch-person-action">${m.name}に声をかける ›</span></span></button>`).join('')}</div><button class="btn-line watch-leave" data-watch="leave">観測へ戻る</button></div>`);
}
function watchTopicChoices(id){
 return `<div class="watch-topic-selection"><p class="watch-action-label">話題を選ぶ</p>${investigationTopic(id)}<div class="watch-topics">${Object.entries(WATCH_TOPICS).map(([key,label])=>`<button class="watch-choice" data-watch-talk="${id}" data-topic="${key}">${label}</button>`).join('')}</div></div>`;
}
function watchChooseTopics(id){
 if(!Object.hasOwn(WATCH_COLLEAGUES,id))return;
 const actions=document.querySelector('.watch-dialogue-actions');if(!actions)return;
 actions.innerHTML=watchTopicChoices(id);actions.querySelector('button')?.focus({preventScroll:true});
}
function watchLeaveConversation(){hideSheet();go('home');setHomeTab('desk');renderObservation();document.getElementById('obs-colleagues').focus({preventScroll:true});}
function observationConversation(id,topic){
 if(!Object.hasOwn(WATCH_COLLEAGUES,id))return;const member=WATCH_COLLEAGUES[id];
 const o=observationState(),seen=!!o.mind.talks[id],troubled=WatchModel.contamination(o)>=2;
 const first=!watchContacts()[id];
 let line=first?member.greeting:(seen?member.again:'どうしましたか。話を聞きます。');
 if(Object.hasOwn(WATCH_TOPICS,topic)){
  const key=id+':'+topic,n=Math.max(0,Math.floor(Number(o.mind.dialogue[key])||0));
  line=member[topic][n%member[topic].length];o.mind.dialogue[key]=n+1;
  if(id==='equipment'&&topic==='office'&&n%3===0)o.mind.clues.absent=true;
  if(id==='records'&&topic==='office'&&o.mind.clues.absent){line='榊さんが、そう言ったんですか。欠勤届は私が預かっています。……私の分ではありません。';o.mind.clues.absent=false;}
  WatchModel.talk(o,Date.now(),id);if(topic==='rest')calmPlayerSeepage();markDirty();save();renderWatchMind();
 }
 if(topic==='record')line=investigationTestimony(id)||line;
 WatchModel.closeMonitor(o,Date.now(),true);watchContacts()[id]=true;markDirty();save();
 const replied=Object.hasOwn(WATCH_TOPICS,topic)||topic==='record';
 watchConversationPage(`<div class="watch-conversation"><button class="menu-back" data-watch="colleagues">‹ 話す相手を選び直す</button><header class="watch-speaker">${watchPortrait(member)}<div><small>${member.role}${first?' ／ 初対面':''}</small><h1 tabindex="-1">${member.name}</h1><p>${member.description}</p></div></header>${first&&topic==='record'?`<p class="watch-introduction">${member.greeting}</p>`:''}<p class="watch-conversation-cue">${troubled?'こちらを見ている。目が合ったかは、わからない。':'向かいの席から、声がする。'}</p>${replied?`<p class="watch-selected-topic">あなた：${topic==='record'?'この記録について聞く':WATCH_TOPICS[topic]}</p>`:''}<blockquote tabindex="-1" aria-label="${member.name}の返答">${line}</blockquote><div class="watch-dialogue-actions">${replied?`${topic==='record'?investigationReturn(id):''}<button class="watch-choice watch-next" data-watch-next="${id}">別の話題を選ぶ</button>`:first?`<button class="watch-choice watch-next" data-watch-next="${id}">話題を選ぶ</button>`:watchTopicChoices(id)}</div><footer class="watch-conversation-footer"><button class="btn-line watch-leave" data-watch="leave">会話を終えて観測へ戻る</button></footer></div>`,id);
 if(replied)document.querySelector('.watch-conversation blockquote').focus({preventScroll:true});
}
document.getElementById('obs-rest').addEventListener('click',observationRest);
document.getElementById('obs-colleagues').addEventListener('click',observationColleagues);
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-watch-region],[data-watch-member],[data-watch-talk],[data-watch-next],[data-watch="colleagues"],[data-watch="leave"]');if(!b||isLite())return;
 if(b.dataset.watch==='leave')return watchLeaveConversation();
 if(b.dataset.watchNext)return watchChooseTopics(b.dataset.watchNext);
 if(b.dataset.watch==='colleagues')return observationColleagues();
 if(b.dataset.watchMember)return observationConversation(b.dataset.watchMember);
 if(b.dataset.watchTalk)return observationConversation(b.dataset.watchTalk,b.dataset.topic);
 if(b.dataset.watchRegion!==undefined){
  const o=observationState();if(o.mind.closed||!o.pending?.rarity)return;
  const region=Number(b.dataset.watchRegion);if(!Number.isInteger(region)||region<0||region>8)return;
  observationTapReward();
  const before=o.pending.suppression,result=WatchModel.suppressRegion(o,Date.now(),region);
  if(result){document.getElementById('sheet-bg').hidden=true;observationReward(result);observationTouchFeedback(null,true);document.getElementById('obs-frame').focus();}
  else {markDirty();save();renderWatchMind();document.querySelector('.watch-target-copy').textContent=o.pending.suppression>before?'指先に抵抗がある。まだ、そこにいる。':'そこには、手応えがない。';}
 }
});

function fitObservation(){
 if(typeof S==='undefined')return;
 const frame=document.getElementById('obs-frame');if(!frame.getClientRects().length)return;
 const nav=document.querySelector('.nav'),f=frame.getBoundingClientRect();
 const navRect=nav.getBoundingClientRect(),navHeight=navRect.height;
 document.documentElement.style.setProperty('--watch-nav-height',`${navHeight}px`);
 // The viewport owns the monitor size; image ratio and status text never resize it.
 // A short landscape viewport scrolls, rather than crushing the image.
 let top=0;for(let el=frame;el;el=el.offsetParent)top+=el.offsetTop;
 const rows=getComputedStyle(frame.closest('.thread-radar'));
 const reserved=['--obs-status-row','--obs-copy-row','--obs-control-row'].reduce((n,key)=>n+parseFloat(rows.getPropertyValue(key)),18);
 const minimum=innerHeight>=innerWidth?140:180;
 const height=Math.floor(Math.max(minimum,Math.min(560,innerHeight-navHeight-top-reserved)));
 if(Math.abs(height-f.height)>1)frame.style.setProperty('--obs-height',`${height}px`);
}
const scheduleObservationFit=RuntimeSafety.frame(fitObservation);
addEventListener('resize',scheduleObservationFit);
window.visualViewport?.addEventListener('resize',scheduleObservationFit);
new ResizeObserver(scheduleObservationFit).observe(document.querySelector('.thread-radar'));

// Only handle page navigation when no modal is being dismissed.
document.addEventListener('keydown',e=>{
 const page=document.querySelector('[data-view="colleagues"]');
 if(e.key!=='Escape'||page.hidden||!document.getElementById('sheet-bg').hidden)return;
 e.stopImmediatePropagation();e.preventDefault();
 if(page.dataset.member)observationColleagues();else watchLeaveConversation();
},true);

function observationRouteOffer(){return null;}
function observationRoutePrompt(){go('lab');}

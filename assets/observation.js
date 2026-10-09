/* The home is one live scene. Management and explanations live off the scene. */
const OBSERVATIONS={
 cctv:{title:'公園',source:'CAM 04',ratio:1.2,records:['日中の公園','風のないブランコ','影だけの来園者','砂場の整列']},
 photo:{title:'食卓',source:'PHOTO 03',ratio:.75,records:['三人分の夕食','浮いた箸','四人目の夕食','窓の内側']},
 vision:{title:'商店街',source:'LINK 07',ratio:.75,records:['巡回中','視線を持つ傘','全員が気づいた','着衣だけの通行人']},
 dash:{title:'県道',source:'DRIVE 11',ratio:1.333333,records:['雨上がり','夜を映す鏡','繰り返す県道','白い横断者']}
};
let watchMessage='',watchMessageUntil=0,watchPaint='',watchLastTick=0;
function observationState(){
 if(!S.observation||S.observation.version!==2){
  const seed=globalThis.crypto?.getRandomValues?crypto.getRandomValues(new Uint32Array(1))[0]:Math.floor(Math.random()*0xffffffff);
  S.observation=WatchModel.create(Date.now(),seed,S.observation);save();
 }
 return WatchModel.normalize(S.observation);
}
function observationSync(now=Date.now()){
 const o=observationState(),changed=WatchModel.sync(o,now);
 if(changed)markDirty();return o;
}
function watchDuration(ms){const minutes=Math.max(0,Math.ceil(ms/60000));return minutes>=60?`${Math.floor(minutes/60)}時間${minutes%60?`${minutes%60}分`:''}`:`${minutes}分`;}
function renderObservation(){
 const f=document.getElementById('obs-frame');if(!f||isLite())return;
 const o=observationSync(),p=o.pending,m=OBSERVATIONS[o.mode],r=p?.rarity??0;
 const advanced=r===1||r===3,side=r===2||r===3?'right':'left';
 const src=`assets/observation/${o.mode}${advanced?'-variants':''}.webp`;
 const paint=`${o.mode}/${p?.sequence??'idle'}/${r}`;
 if(paint!==watchPaint){
  const im=document.getElementById('obs-image');im.style.backgroundImage=`url("${src}")`;im.style.backgroundPosition=`${side} center`;
  f.style.setProperty('--obs-ratio',m.ratio);f.dataset.mode=o.mode;f.dataset.rarity=r;
  f.classList.remove('obs-change');if(watchPaint){void f.offsetWidth;f.classList.add('obs-change');}watchPaint=paint;
 }
 const quiet=o.quiet||!!S.incursion?.quiet;
 f.dataset.quiet=String(quiet);f.dataset.ready='true';f.setAttribute('aria-disabled','false');
 const danger=!!p&&p.rarity>0,target=danger?WatchModel.SUPPRESS[p.rarity]:WatchModel.TAPS[o.upgrades.interval],progress=danger?(p.suppression||0):o.tapProgress;
 document.getElementById('obs-action-label').textContent=danger?'映像の乱れを抑える':'次の地点への照合';
 document.getElementById('obs-tap').textContent=danger?'干渉を抑える':'観測を進める';
 document.getElementById('obs-progress-count').textContent=`${progress} / ${target}`;
 const bar=document.getElementById('obs-progress');bar.max=target;bar.value=progress;bar.setAttribute('aria-label',danger?'異変の鎮静':'地点切替');
 document.getElementById('obs-auto-status').textContent=!o.autoEnabled?'自動化 OFF':danger?(o.upgrades.suppression>=p.rarity?'自動鎮静中':o.upgrades.patrol?'自動巡回：異変の対処待ち':''):(o.upgrades.patrol?`自動巡回 · ${WatchModel.AUTO_SECONDS[o.upgrades.patrol]}秒で1回`:'');
 f.setAttribute('aria-label',`${m.title}。${danger?'異変を鎮静':'次の観測地点へ'}。${progress}/${target}。タップで観測を進める`);
 document.getElementById('obs-source').textContent=`${m.source} · 巡回${o.patrols+1}`;
 document.getElementById('obs-name').textContent=m.title;
 document.getElementById('obs-ready').hidden=!p;
 document.getElementById('obs-timer').textContent=p?`◷ ${watchDuration(p.expiresAt-o.lastSeen)}`:'';
 const hint=document.getElementById('obs-first-hint');hint.hidden=o.collected>0;hint.textContent='映像または下のボタンをタップ';
 document.getElementById('obs-danger').hidden=!S.incursion?.event;
 if(Date.now()>watchMessageUntil)watchMessage='';document.getElementById('obs-feedback').textContent=watchMessage;
 // The screen reader can request the timer; normal viewing stays quiet.
}
function observationTick(){
 if(Date.now()-watchLastTick<1000)return;watchLastTick=Date.now();
 if(isLite())return;
 const scene=document.getElementById('obs-frame').getBoundingClientRect();
 const active=scene.bottom>0&&scene.top<innerHeight-60&&!document.hidden&&!document.getElementById('incursion-dialog').open&&document.getElementById('sheet-bg').hidden&&document.getElementById('stage').hidden&&!!document.getElementById('obs-frame').getClientRects().length;
 const result=WatchModel.automate(observationState(),Date.now(),active);
 if(result)observationReward(result,true);else {markDirty();renderObservation();}
 const dot=document.getElementById('dot-home');if(S.observation?.pending&&dot)dot.hidden=false;
}
function observationReward(result,auto=false){
 const record=result.record;record.reward=Math.round(record.reward*(1+.1*upLv('lens')));
 S.currency+=record.reward;
 if(!auto){S.clicks++;bump('click');if(record.rarity>=2)incursionInvestigate();}
 watchMessage=`${result.kind==='anomaly'?'干渉停止。観測を継続してください。':'記録を転送しました。'} +${record.reward}pt`;watchMessageUntil=Date.now()+4500;
 markDirty();save();render();if(!auto)buzz(result.kind==='anomaly'?30:8);
}
function observationCollect(){
 if(isLite())return;
 const result=WatchModel.tap(observationState(),Date.now());
 if(result)observationReward(result);else {markDirty();renderObservation();}
}
function observationSettings(){
 const o=observationSync(),p=o.pending;
 sheet('観測設定',`<div class="watch-settings"><h2>${WatchModel.MODES[o.mode].label} ／ ${OBSERVATIONS[o.mode].title}</h2><p>${p?`受取期限まで ${watchDuration(p.expiresAt-o.lastSeen)}`:`定時観測まで ${watchDuration(o.dueAt-o.lastSeen)}`}</p><p>${WatchModel.TAPS[o.upgrades.interval]}タップで巡回 · ${WatchModel.RETENTION[o.upgrades.retention]}時間保持</p><p>映像または「観測を進める」を繰り返しタップ。照合が完了すると解放済みの次の地点へ移動し、記録報酬を受け取ります。1地点のみの場合は同じ地点を再観測します。異変は追加のタップで干渉を抑えると、通常より多くの記録報酬を受け取ります。保持中は別地点に切り替えられません。</p><button class="btn-paper" data-watch="lab">観測装備を変更・育成</button><label><input type="checkbox" data-watch-auto ${o.autoEnabled?'checked':''}> 自動巡回・鎮静を有効にする</label><p>自動化は調査室で強化。観測映像の表示中だけ進み、別画面・資料閲覧・対処中は停止。留守中の自動pt獲得は継続します。</p><label><input type="checkbox" data-watch-quiet ${o.quiet?'checked':''}> 揺れ・瞬きを抑える</label><details><summary>観測記録 ${o.collected}件</summary><ul>${o.history.slice().reverse().map(h=>`<li>${WatchModel.RARITY[h.rarity].name} · ${OBSERVATIONS[h.mode].records[h.rarity]} · +${h.reward}pt</li>`).join('')||'<li>記録はまだありません。</li>'}</ul></details><details><summary>出現率と報酬</summary><p>同じ地点で平常と3種類の異変を抽選。受取前の変更・引き直しはできません。</p><p>N / R / SR / SSR：${[[60,28,10,2],[50,33,14,3],[40,37,18,5]][o.upgrades.sensitivity].join(' / ')}%</p><p>通常巡回 8pt、異変鎮静 R / SR / SSR は80 / 200 / 480pt。方式倍率：監視×1、写真×1.25、視界×1.5、車載×2。虫眼鏡でさらに1Lvあたり+10%（四捨五入）。</p></details><button class="btn-line" data-desk="evidence">別件の検知記録</button><button class="btn-line" data-inc="open">異変の対処記録</button></div>`);
}
function renderObservationLab(){
 const root=document.getElementById('observation-lab');if(!root)return;if(isLite()){root.innerHTML='';return;}
 const o=observationState();
 root.innerHTML=`<section class="watch-lab"><div class="watch-lab-heading"><h2>観測装備</h2><span>${o.collected}件</span></div><div class="watch-equipment">${Object.entries(WatchModel.MODES).map(([id,m])=>{const owned=o.unlocked.includes(id),active=id===o.mode,eligible=o.collected>=m.need&&S.currency>=m.cost;return `<article class="watch-mode ${active?'equipped':''}"><div><b>${m.label}</b><small>${OBSERVATIONS[id].title} · pt ×${m.mult}</small></div><button type="button" data-watch-${owned?'equip':'unlock'}="${id}" ${owned?(active||o.pending?'disabled':''):eligible?'':'disabled'}>${active?'● 設置中':owned?'設置':o.collected<m.need?`🔒 ${o.collected}/${m.need}件`:`解放 ${m.cost}pt`}</button></article>`;}).join('')}</div>${o.pending?'<p class="watch-note">記録を保持中。タップで観測・鎮静を終えると装備を変更できます。</p>':''}<details class="watch-upgrades"><summary>観測を強化 <span>${WatchModel.TAPS[o.upgrades.interval]}タップ / ${WatchModel.RETENTION[o.upgrades.retention]}h</span></summary>${Object.entries(WatchModel.UPGRADES).map(([id,u])=>{const lv=o.upgrades[id],max=lv===u.max;const values=id==='retention'?WatchModel.RETENTION.map(x=>x+'時間'):id==='interval'?WatchModel.TAPS.map(x=>x+'タップ'):id==='patrol'?['手動','5秒に1回','3秒に1回','1秒に1回']:id==='suppression'?['手動','Rまで自動','SRまで自動','SSRまで自動']:['SSR 2%','SSR 3%','SSR 5%'];return `<article><div><b>${u.name}</b><small>${values[lv]}${max?'':` → ${values[lv+1]}`}</small></div><button data-watch-upgrade="${id}" ${max||S.currency<u.costs[lv]?'disabled':''}>${max?'最大':`${u.costs[lv]}pt`}</button></article>`;}).join('')}<p class="watch-note">保持強化は受取待ちの記録にも適用。巡回効率は定時観測の間隔も短縮。自動鎮静は観測映像の異変が対象で、封筒調査の自律封印装置とは別です。</p></details></section>`;
}
document.getElementById('obs-frame').addEventListener('click',observationCollect);
document.getElementById('obs-tap').addEventListener('click',observationCollect);
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-watch],[data-watch-equip],[data-watch-unlock],[data-watch-upgrade]');if(!b||b.disabled)return;
 if(b.dataset.watch==='settings')return observationSettings();
 if(b.dataset.watch==='lab'){document.getElementById('sheet-bg').hidden=true;go('lab');return;}
 const o=observationSync();let cost=null;
 if(b.dataset.watchEquip){if(!WatchModel.equip(o,b.dataset.watchEquip,Date.now()))return;}
 else if(b.dataset.watchUnlock){cost=WatchModel.unlock(o,b.dataset.watchUnlock,S.currency);if(cost===null)return;S.currency-=cost;}
 else if(b.dataset.watchUpgrade){cost=WatchModel.upgrade(o,b.dataset.watchUpgrade,S.currency,Date.now());if(cost===null)return;S.currency-=cost;}
 else return;
 const expanded=document.querySelector('.watch-upgrades')?.open;markDirty();render();if(expanded)document.querySelector('.watch-upgrades').open=true;
});
document.addEventListener('change',e=>{if(e.target.matches('[data-watch-auto]')){observationState().autoEnabled=e.target.checked;observationState().autoLastAt=Date.now();markDirty();}if(e.target.matches('[data-watch-quiet]')){observationState().quiet=e.target.checked;markDirty();renderObservation();}});
document.addEventListener('visibilitychange',()=>{if(typeof S!=='undefined'&&!isLite()){observationState().autoLastAt=Date.now();if(!document.hidden)observationTick();}});

function renderObservationAlbum(){
 const root=document.getElementById('watch-album');if(!root||isLite())return;
 const o=observationState(),count=Object.keys(OBSERVATIONS).reduce((n,mode)=>n+WatchModel.setProgress(o,mode),0);
 root.innerHTML=`<div class="watch-album-count"><b>観測記録</b><span>${count} / 16</span></div>${Object.entries(OBSERVATIONS).map(([mode,m])=>`<section class="watch-album-group"><h3>${m.title} <small>${WatchModel.setProgress(o,mode)}/4</small></h3><div class="watch-album-grid">${[0,1,2,3].map(r=>{const n=o.collection[mode+':'+r]||0;return `<button data-watch-record="${mode}:${r}" ${n?'':'disabled'}><b>${WatchModel.RARITY[r].name}</b><span>${n?m.records[r]:'未観測'}</span><small>${n?'×'+n:'―'}</small></button>`;}).join('')}</div><button class="watch-set-reward" data-watch-set="${mode}" ${WatchModel.setProgress(o,mode)!==4||o.completedSets[mode]?'disabled':''}>${o.completedSets[mode]?'✓ 全4種・達成報酬受取済み':WatchModel.setProgress(o,mode)===4?`全4種達成 · ${WatchModel.SET_REWARDS[mode]}ptを受け取る`:`全4種で ${WatchModel.SET_REWARDS[mode]}pt`}</button>${watchResearchHTML(o,mode)}</section>`).join('')}`;
}
function watchResearchHTML(o,mode){
 const r=WatchModel.researchStatus(o,mode);if(!o.unlocked.includes(mode)||!r.missing.length)return '';
 return `<div class="watch-research"><span>重複記録 ${r.available} / ${WatchModel.RESEARCH_COST}</span><button data-watch-research="${mode}" ${r.ready?'':'disabled'}>照合する</button></div>`;
}
function showWatchRecord(mode,rarity,restored=false){
 const o=observationState(),key=mode+':'+rarity,m=OBSERVATIONS[mode];if(!m||!o.collection[key])return;
 const advanced=rarity===1||rarity===3,side=rarity===2||rarity===3?'right':'left';
 sheet(restored?'未発見の記録を復元':'観測資料',`<div class="watch-record-image" role="img" aria-label="${m.records[rarity]}" style="aspect-ratio:${m.ratio};background-image:url('assets/observation/${mode}${advanced?'-variants':''}.webp');background-position:${side} center"></div><div class="watch-record-caption"><b>${WatchModel.RARITY[rarity].name} ／ ${m.records[rarity]}</b><span>記録 ${o.collection[key]}件${o.reconstructed[key]?' · 照合で復元':''}</span></div>${rarity>0&&o.collection[mode+':0']?`<div class="watch-compare"><p id="watch-compare-status" aria-live="polite">発見した記録：${m.records[rarity]}</p><button class="btn-paper" data-watch-compare="${mode}:${rarity}" aria-pressed="false">平常の記録と見比べる</button></div>`:''}`);
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
  markDirty();save();render();showWatchRecord(result.mode,result.rarity,true);return;
 }
 if(e.target.closest('[data-watch-research-cancel]')){document.getElementById('sheet-bg').hidden=true;return;}
 const rewardButton=e.target.closest('[data-watch-set]');
 if(rewardButton&&!rewardButton.disabled){
  if(isLite())return;
  const reward=WatchModel.claimSet(observationState(),rewardButton.dataset.watchSet);if(reward===null)return;
  S.currency+=reward;markDirty();save();render();return;
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

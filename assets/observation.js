/* The home is one live scene. Management and explanations live off the scene. */
// Unlock conditions are undecided. Keep saved levels, but expose no purchase or execution path.
const WATCH_AUTOMATION_AVAILABLE=false;
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
 f.dataset.quiet=String(quiet);f.dataset.ready=String(!o.mind.closed);f.dataset.closed=String(o.mind.closed);f.disabled=o.mind.closed;f.setAttribute('aria-disabled',String(o.mind.closed));
 const danger=!!p&&p.rarity>0;
 document.querySelector('[data-watch="settings"]').hidden=!watchSettingsUnlocked();
 document.getElementById('obs-rest').textContent=o.mind.closed?'モニタを開く':'モニタを閉じる';
 document.getElementById('obs-closed').hidden=!o.mind.closed;
 f.setAttribute('aria-label',o.mind.closed?'観測モニタは閉じています':`${m.title}。${danger?'違和感のある場所をタップ。キーボードでは場所を選んで対処':'タップで観測を進める'}`);
 document.getElementById('obs-source').textContent=m.source;
 document.getElementById('obs-name').textContent=m.title;
 document.getElementById('obs-ready').hidden=!p||o.mind.closed;
 document.getElementById('obs-timer').textContent=p&&!o.mind.closed?`◷ ${watchDuration(p.expiresAt-o.lastSeen)}`:'';
 const hint=document.getElementById('obs-first-hint');hint.hidden=o.mind.closed||o.collected>0;hint.textContent=danger?'違和感のある場所に触れる':'映像に触れて観測を進める';

 if(Date.now()>watchMessageUntil)watchMessage='';document.getElementById('obs-feedback').textContent=watchMessage;
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
 markDirty();save();render();if(!auto)buzz(result.kind==='anomaly'?30:8);
}
let watchTouchTimer,watchJolt;
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
 let point=null;
 if(strike){const r=document.getElementById('obs-image').getBoundingClientRect();point={x:(event.clientX-r.left)/r.width,y:(event.clientY-r.top)/r.height};}
 const contact=strike&&WatchModel.hit(o,point);
 const result=strike?WatchModel.suppress(o,Date.now(),point):WatchModel.tap(o,Date.now());
 if(result)observationReward(result);else {markDirty();renderObservation();}
 observationTouchFeedback(event,contact);
}
function watchSettingsUnlocked(){return Object.values(observationState().upgrades).some(level=>level>0);}
function observationSettings(){
 if(!watchSettingsUnlocked())return;
 const o=observationSync(),p=o.pending;
 sheet('観測設定',`<div class="watch-settings"><h2>${WatchModel.MODES[o.mode].label} ／ ${OBSERVATIONS[o.mode].title}</h2><p>${p?`受取期限まで ${watchDuration(p.expiresAt-o.lastSeen)}`:`定時観測まで ${watchDuration(o.dueAt-o.lastSeen)}`}</p><p>${WatchModel.RETENTION[o.upgrades.retention]}時間保持</p><p>映像を繰り返しタップ。照合が完了すると解放済みの次の地点へ移動し、記録報酬を受け取ります。1地点のみの場合は同じ地点を再観測します。異変は、映像内の違和感がある付近に繰り返し触れて抑えます。別の場所や通常巡回では除去できません。場所選択からも対処できます。保持中は別地点に切り替えられません。</p><p>異変を見続け、真相を追い続けると画面の外へ干渉が広がります。手を止める、モニタを閉じる、課内で話すと落ち着きます。不在中には悪化せず、資料やptも失われません。</p><button class="btn-paper" data-watch="lab">観測装備を変更・育成</button>${WATCH_AUTOMATION_AVAILABLE?`<label><input type="checkbox" data-watch-auto ${o.autoEnabled?'checked':''}> 自動巡回・鎮静を有効にする</label><p>自動化は調査室で強化。観測映像の表示中だけ進み、別画面・資料閲覧・対処中は停止。留守中の自動pt獲得は継続します。</p>`:''}<label><input type="checkbox" data-watch-quiet ${o.quiet?'checked':''}> 揺れ・瞬きを抑える</label><details><summary>観測記録 ${o.collected}件</summary><ul>${o.history.slice().reverse().map(h=>`<li>${WatchModel.RARITY[h.rarity].name} · ${OBSERVATIONS[h.mode].records[h.rarity]} · +${h.reward}pt</li>`).join('')||'<li>記録はまだありません。</li>'}</ul></details><details><summary>出現率と報酬</summary><p>同じ地点で平常と3種類の異変を抽選。受取前の変更・引き直しはできません。</p><p>N / R / SR / SSR：${[[60,28,10,2],[50,33,14,3],[40,37,18,5]][o.upgrades.sensitivity].join(' / ')}%</p><p>通常巡回 8pt、異変鎮静 R / SR / SSR は80 / 200 / 480pt。方式倍率：監視×1、写真×1.25、視界×1.5、車載×2。虫眼鏡でさらに1Lvあたり+10%（四捨五入）。</p></details><button class="btn-line" data-desk="evidence">別件の検知記録</button><button class="btn-line" data-inc="open">異変の対処記録</button></div>`);
}
function renderObservationLab(){
 const root=document.getElementById('observation-lab');if(!root)return;if(isLite()){root.innerHTML='';return;}
 const o=observationState();
 root.innerHTML=`<section class="watch-lab"><div class="watch-lab-heading"><h2>観測装備</h2><span>${o.collected}件</span></div><div class="watch-equipment">${Object.entries(WatchModel.MODES).map(([id,m])=>{const owned=o.unlocked.includes(id),active=id===o.mode,eligible=o.collected>=m.need&&S.currency>=m.cost;return `<article class="watch-mode ${active?'equipped':''}"><div><b>${m.label}</b><small>${OBSERVATIONS[id].title} · pt ×${m.mult}</small></div><button type="button" data-watch-${owned?'equip':'unlock'}="${id}" ${owned?(active||o.pending?'disabled':''):eligible?'':'disabled'}>${active?'● 設置中':owned?'設置':o.collected<m.need?`🔒 ${o.collected}/${m.need}件`:`解放 ${m.cost}pt`}</button></article>`;}).join('')}</div>${o.pending?'<p class="watch-note">記録を保持中。タップで観測・鎮静を終えると装備を変更できます。</p>':''}<details class="watch-upgrades"><summary>観測を強化 <span>${WatchModel.RETENTION[o.upgrades.retention]}h</span></summary>${Object.entries(WatchModel.UPGRADES).filter(([id])=>WATCH_AUTOMATION_AVAILABLE||!['patrol','suppression'].includes(id)).map(([id,u])=>{const lv=o.upgrades[id],max=lv===u.max;const values=id==='retention'?WatchModel.RETENTION.map(x=>x+'時間'):id==='interval'?['標準','短縮 I','短縮 II','短縮 III']:id==='patrol'?['手動','5秒に1回','3秒に1回','1秒に1回']:id==='suppression'?['手動','Rまで自動','SRまで自動','SSRまで自動']:['SSR 2%','SSR 3%','SSR 5%'];return `<article><div><b>${u.name}</b><small>${values[lv]}${max?'':` → ${values[lv+1]}`}</small></div><button data-watch-upgrade="${id}" ${max||S.currency<u.costs[lv]?'disabled':''}>${max?'最大':`${u.costs[lv]}pt`}</button></article>`;}).join('')}<p class="watch-note">観測装備を1段階育成すると観測設定を利用可能。保持強化は受取待ちの記録にも適用。巡回効率は定時観測の間隔も短縮。</p></details></section>`;
}
document.getElementById('obs-frame').addEventListener('click',observationCollect);
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-watch],[data-watch-equip],[data-watch-unlock],[data-watch-upgrade]');if(!b||b.disabled)return;
 if(b.dataset.watch==='settings')return observationSettings();
 if(b.dataset.watch==='lab'){document.getElementById('sheet-bg').hidden=true;go('lab');return;}
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
 document.getElementById('obs-frame').dataset.seep=String(o.mind.closed?0:stage);
}
function observationRest(){
 const o=observationState();WatchModel.closeMonitor(o,Date.now(),!o.mind.closed);
 watchMessage=o.mind.closed?'回線を切りました。今は、見なくてかまいません。':'回線を開きました。';watchMessageUntil=Date.now()+4500;
 markDirty();save();renderObservation();
}
const WATCH_REGIONS=['左上','中央上','右上','左中央','中央','右中央','左下','中央下','右下'];
function observationTargetPicker(message='映像を見て、違和感のある場所を選んでください。'){
 const o=observationState();if(o.mind.closed||!o.pending?.rarity)return;
 sheet('異変の対処',`<p class="watch-target-copy" role="status">${message}</p><div class="watch-target-regions">${WATCH_REGIONS.map((name,i)=>`<button data-watch-region="${i}">${name}</button>`).join('')}</div><p class="hint">同じ付近に繰り返し触れて干渉を抑える。映像へ戻って直接タップすることもできます。</p><button class="btn-line" data-act="close">映像へ戻る</button>`);
}
const WATCH_COLLEAGUES={
 records:{name:'白瀬 ／ 記録係',greeting:'席、空いています。見たものを、順番に話してください。',strange:'記録にないものは、今すぐ名前を付けなくていいんです。あなたの名前まで書き込まれる前に、いったん閉じましょう。',rest:'その資料は預かります。窓の外を見ていてください。ここにあるものを、三つ数えて。',again:'この前の記録は、私が持っています。今日は続きを急がなくていい。'},
 equipment:{name:'榊 ／ 設備担当',greeting:'回線は切ってあります。まだ映っていても、触らないでください。',strange:'映像全体を叩いても信号は止まりません。おかしい場所、その付近だけに干渉してください。長く見続けるのは避けて。',rest:'モニタは私が見ておきます。……いえ、電源を抜いておきます。あなたも少し離れて。',again:'さっき抜いたケーブルは、まだ抜いたままです。確かめに戻る必要はありません。'},
 senior:{name:'三輪 ／ 先輩調査員',greeting:'追うほど向こうにも道ができる。戻ってきたなら、まず座ろう。',strange:'画面の外まで違和感が残るなら、今日は深追いしないことだ。真相は逃げない。こちらを待っている。',rest:'何も調べない時間も仕事のうちだ。急ぐな。普通の話をしていこう。',again:'また来たな。ちゃんと、戻る場所を覚えていたか。'}
};
function observationColleagues(){
 WatchModel.closeMonitor(observationState(),Date.now(),true);markDirty();save();renderObservation();
 sheet('第六文書課 ／ 休憩室',`<div class="watch-colleagues"><p>回線を切って、課内へ戻った。</p>${Object.entries(WATCH_COLLEAGUES).map(([id,m])=>`<button class="btn-paper" data-watch-member="${id}">${m.name}<small>${observationState().mind.talks[id]?'もう一度、話す':'声をかける'}</small></button>`).join('')}<button class="btn-line" data-act="close">席へ戻る</button></div>`);
}
function observationConversation(id,topic){
 const member=WATCH_COLLEAGUES[id];if(!member)return;
 const o=observationState(),seen=!!o.mind.talks[id],troubled=WatchModel.contamination(o)>=2;
 let line=seen?member.again:member.greeting;
 if(topic==='strange'||topic==='rest'){line=member[topic];WatchModel.talk(o,Date.now(),id);markDirty();save();renderWatchMind();}
 sheet(member.name,`<div class="watch-conversation"><p class="watch-room-note">${troubled?'廊下の足音が、ここでは聞こえない。':'紙コップの温かさが、指先に残る。'}</p><blockquote>${line}</blockquote><div class="watch-dialogue-actions"><button class="btn-paper" data-watch-talk="${id}" data-topic="strange">見たものについて話す</button><button class="btn-paper" data-watch-talk="${id}" data-topic="rest">少し休みたい</button><button class="btn-line" data-watch="colleagues">ほかの人に話す</button><button class="btn-line" data-act="close">席へ戻る</button></div></div>`);
}
document.getElementById('obs-rest').addEventListener('click',observationRest);
document.getElementById('obs-colleagues').addEventListener('click',observationColleagues);
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-watch-region],[data-watch-member],[data-watch-talk],[data-watch="colleagues"]');if(!b||isLite())return;
 if(b.dataset.watch==='colleagues')return observationColleagues();
 if(b.dataset.watchMember)return observationConversation(b.dataset.watchMember);
 if(b.dataset.watchTalk)return observationConversation(b.dataset.watchTalk,b.dataset.topic);
 if(b.dataset.watchRegion!==undefined){
  const o=observationState();if(o.mind.closed||!o.pending?.rarity)return;
  const before=o.pending.suppression,result=WatchModel.suppressRegion(o,Date.now(),Number(b.dataset.watchRegion));
  if(result){document.getElementById('sheet-bg').hidden=true;observationReward(result);observationTouchFeedback(null,true);document.getElementById('obs-frame').focus();}
  else {markDirty();save();renderWatchMind();document.querySelector('.watch-target-copy').textContent=o.pending.suppression>before?'指先に抵抗がある。まだ、そこにいる。':'そこには、手応えがない。';}
 }
});

function fitObservation(){
 const frame=document.getElementById('obs-frame');if(!frame.getClientRects().length)return;
 const controls=document.querySelector('.obs-secondary'),nav=document.querySelector('.nav-in');
 const f=frame.getBoundingClientRect(),bottom=controls.getBoundingClientRect().bottom+scrollY;
 const navTop=nav?.getBoundingClientRect().top||innerHeight-60;
 const height=Math.max(100,Math.min(560,f.height+Math.min(innerHeight,navTop)-bottom-18));
 if(Math.abs(height-f.height)>1)frame.style.setProperty('--obs-height',`${Math.floor(height)}px`);
}
addEventListener('resize',fitObservation);
new ResizeObserver(()=>requestAnimationFrame(fitObservation)).observe(document.querySelector('.thread-radar'));

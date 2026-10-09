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
 f.dataset.quiet=String(quiet);f.dataset.ready=String(!!p);f.setAttribute('aria-disabled',String(!p));
 f.setAttribute('aria-label',p?`${m.title}。観測可能。タップで記録を回収。残り${watchDuration(p.expiresAt-o.lastSeen)}`:`${m.title}を観測中。次の記録まで${watchDuration(o.dueAt-o.lastSeen)}`);
 document.getElementById('obs-source').textContent=m.source;
 document.getElementById('obs-name').textContent=m.title;
 document.getElementById('obs-ready').hidden=!p;
 document.getElementById('obs-timer').textContent=p?`◷ ${watchDuration(p.expiresAt-o.lastSeen)}`:'';
 const hint=document.getElementById('obs-first-hint');hint.hidden=o.collected>0;hint.textContent=p?'タップで記録':'変化を待つ';
 document.getElementById('obs-danger').hidden=!S.incursion?.event;
 if(Date.now()>watchMessageUntil)watchMessage='';document.getElementById('obs-feedback').textContent=watchMessage;
 // The screen reader can request the timer; normal viewing stays quiet.
}
function observationTick(){
 if(Date.now()-watchLastTick<1000)return;watchLastTick=Date.now();renderObservation();
 const dot=document.getElementById('dot-home');if(S.observation?.pending&&dot)dot.hidden=false;
}
function observationCollect(){
 if(isLite())return;
 const o=observationState(),record=WatchModel.claim(o,Date.now());
 if(!record){renderObservation();return;}
 record.reward=Math.round(record.reward*(1+.1*upLv("lens")));
 S.currency+=record.reward;S.clicks++;bump('click');
 // Time and missed windows never raise danger. Only a collected rare record does.
 if(record.rarity>=2)incursionInvestigate();
 watchMessage=`${record.first?'NEW · ':''}${WatchModel.RARITY[record.rarity].name} · +${record.reward}pt`;watchMessageUntil=Date.now()+4500;
 markDirty();render();buzz(8);
}
function observationSettings(){
 const o=observationSync(),p=o.pending;
 sheet('観測設定',`<div class="watch-settings"><h2>${WatchModel.MODES[o.mode].label} ／ ${OBSERVATIONS[o.mode].title}</h2><p>${p?`受取期限まで ${watchDuration(p.expiresAt-o.lastSeen)}`:`次の記録まで ${watchDuration(o.dueAt-o.lastSeen)}`}</p><p>${WatchModel.INTERVAL[o.upgrades.interval]}分間隔 · ${WatchModel.RETENTION[o.upgrades.retention]}時間保持</p><p>映像の「!」をタップして回収。保持中は上書きされません。期限切れでは報酬を失い、次の観測へ進みます。</p><button class="btn-paper" data-watch="lab">観測装備を変更・育成</button><label><input type="checkbox" data-watch-quiet ${o.quiet?'checked':''}> 揺れ・瞬きを抑える</label><details><summary>観測記録 ${o.collected}件</summary><ul>${o.history.slice().reverse().map(h=>`<li>${WatchModel.RARITY[h.rarity].name} · ${OBSERVATIONS[h.mode].records[h.rarity]} · +${h.reward}pt</li>`).join('')||'<li>記録はまだありません。</li>'}</ul></details><details><summary>出現率と報酬</summary><p>同じ地点で平常と3種類の異変を抽選。受取前の変更・引き直しはできません。</p><p>N / R / SR / SSR：${[[60,28,10,2],[50,33,14,3],[40,37,18,5]][o.upgrades.sensitivity].join(' / ')}%</p><p>基本報酬 8 / 20 / 60 / 180pt。方式倍率：監視×1、写真×1.25、視界×1.5、車載×2。虫眼鏡でさらに1Lvあたり+10%（四捨五入）。</p></details><button class="btn-line" data-desk="evidence">別件の検知記録</button><button class="btn-line" data-inc="open">異変の対処記録</button></div>`);
}
function renderObservationLab(){
 const root=document.getElementById('observation-lab');if(!root)return;if(isLite()){root.innerHTML='';return;}
 const o=observationState();
 root.innerHTML=`<section class="watch-lab"><div class="watch-lab-heading"><h2>観測装備</h2><span>${o.collected}件</span></div><div class="watch-equipment">${Object.entries(WatchModel.MODES).map(([id,m])=>{const owned=o.unlocked.includes(id),active=id===o.mode,eligible=o.collected>=m.need&&S.currency>=m.cost;return `<article class="watch-mode ${active?'equipped':''}"><div><b>${m.label}</b><small>${OBSERVATIONS[id].title} · pt ×${m.mult}</small></div><button type="button" data-watch-${owned?'equip':'unlock'}="${id}" ${owned?(active||o.pending?'disabled':''):eligible?'':'disabled'}>${active?'● 設置中':owned?'設置':o.collected<m.need?`🔒 ${o.collected}/${m.need}件`:`解放 ${m.cost}pt`}</button></article>`;}).join('')}</div>${o.pending?'<p class="watch-note">受取待ち。映像を回収すると装備を変更できます。</p>':''}<details class="watch-upgrades"><summary>観測を強化 <span>${WatchModel.RETENTION[o.upgrades.retention]}h / ${WatchModel.INTERVAL[o.upgrades.interval]}分</span></summary>${Object.entries(WatchModel.UPGRADES).map(([id,u])=>{const lv=o.upgrades[id],max=lv===u.max;const values=id==='retention'?WatchModel.RETENTION.map(x=>x+'時間'):id==='interval'?WatchModel.INTERVAL.map(x=>x+'分'):['SSR 2%','SSR 3%','SSR 5%'];return `<article><div><b>${u.name}</b><small>${values[lv]}${max?'':` → ${values[lv+1]}`}</small></div><button data-watch-upgrade="${id}" ${max||S.currency<u.costs[lv]?'disabled':''}>${max?'最大':`${u.costs[lv]}pt`}</button></article>`;}).join('')}<p class="watch-note">保持強化は受取待ちの記録にも適用。出現率・間隔の強化は確定済みの結果を変えません。</p></details></section>`;
}
document.getElementById('obs-frame').addEventListener('click',observationCollect);
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
document.addEventListener('change',e=>{if(e.target.matches('[data-watch-quiet]')){observationState().quiet=e.target.checked;markDirty();renderObservation();}});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&typeof S!=='undefined'&&!isLite())observationTick();});

function renderObservationAlbum(){
 const root=document.getElementById('watch-album');if(!root||isLite())return;
 const o=observationState(),count=Object.values(o.collection).filter(n=>n>0).length;
 root.innerHTML=`<div class="watch-album-count"><b>観測記録</b><span>${count} / 16</span></div>${Object.entries(OBSERVATIONS).map(([mode,m])=>`<section class="watch-album-group"><h3>${m.title} <small>${[0,1,2,3].filter(r=>o.collection[mode+':'+r]>0).length}/4</small></h3><div class="watch-album-grid">${[0,1,2,3].map(r=>{const n=o.collection[mode+':'+r]||0;return `<button data-watch-record="${mode}:${r}" ${n?'':'disabled'}><b>${WatchModel.RARITY[r].name}</b><span>${n?m.records[r]:'未観測'}</span><small>${n?'×'+n:'―'}</small></button>`;}).join('')}</div></section>`).join('')}`;
}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-watch-record]');if(!b||b.disabled)return;
 const [mode,r]=b.dataset.watchRecord.split(':'),rarity=Number(r),o=observationState();if(!o.collection[b.dataset.watchRecord])return;
 const advanced=rarity===1||rarity===3,side=rarity===2||rarity===3?'right':'left',m=OBSERVATIONS[mode];
 sheet('観測資料',`<div class="watch-record-image" role="img" aria-label="${m.records[rarity]}" style="aspect-ratio:${m.ratio};background-image:url('assets/observation/${mode}${advanced?'-variants':''}.webp');background-position:${side} center"></div><div class="watch-record-caption"><b>${WatchModel.RARITY[rarity].name} ／ ${m.records[rarity]}</b><span>観測 ${o.collection[b.dataset.watchRecord]}回</span></div>`);
});

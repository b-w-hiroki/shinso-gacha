/* Investigation causes incursions; time away never advances them. */
const INCURSIONS = [
  {name:'写真の中から、こちらを見ている',short:'写真の照合',after:'ベンチ横の人影が消えた。駅の時計だけが動き始めた。'},
  {name:'切ったはずの回線が鳴っている',short:'通信の遮断',after:'受信ランプが消えた。いつもの室内音が戻ってきた。'},
  {name:'宛名が、内側から書き換わる',short:'資料の封印',after:'赤い封印が定着した。封筒の内側の筆音が止まった。'}
];
function incursionState(create=false) {
  if (!S.incursion && !create) return null;
  let a=S.incursion;
  if (!a || a.version!==1) a=S.incursion={version:1,level:0,resolved:0,cooldown:0,event:null,quiet:false,history:[]};
  const int=(v,max)=>Math.max(0,Math.min(max,Math.floor(Number(v)||0)));
  a.level=int(a.level,100);a.resolved=int(a.resolved,999999);a.cooldown=int(a.cooldown,5);
  a.manual=int(a.manual ?? a.resolved,999999);a.samples=int(a.samples,999999);
  a.defense=a.defense&&typeof a.defense==='object'?a.defense:{};
  for(const [id,max] of [['ward',3],['recovery',3],['guardian',2]])a.defense[id]=int(a.defense[id],max);
  a.autoWait=int(a.autoWait,6);a.autoEnabled=a.autoEnabled!==false;
  a.history=Array.isArray(a.history)?a.history.filter(h=>h&&Number.isInteger(h.kind)&&INCURSIONS[h.kind]).slice(-8):[];
  if(a.event){if(!Number.isInteger(a.event.kind)||!INCURSIONS[a.event.kind])a.event=null;else {a.event.step=int(a.event.step,2);a.event.seen=int(a.event.seen,3);a.event.tier=Math.max(1,int(a.event.tier||1,3));a.event.round=int(a.event.round,2);}}
  if(a.level>=36&&!a.event)a.event=incursionEvent(a);
  return a;
}
function incursionEvent(a) {
  const unlocked=a.manual>=8?3:a.manual>=3?2:1;
  return {kind:a.resolved%3,step:0,seen:0,tier:1+(a.resolved%unlocked),round:0};
}
function incursionBlocked() {
  const a=incursionState();
  if(a&&a.level>=100&&a.event){openIncursion();return true;}
  return false;
}
function incursionInvestigate(count=1) {
  if (typeof introActive==='function'&&introActive()) return;
  const a=incursionState(true);
  if(a.autoWait>0)a.autoWait--;
  if(a.cooldown>0)a.cooldown--;
  else a.level=Math.min(100,a.level+Math.ceil((count>1?20:12)*(1-a.defense.ward*.15)));
  if(a.level>=36&&!a.event)a.event=incursionEvent(a);
  if(a.event&&a.autoEnabled&&a.defense.guardian>=a.event.tier&&a.autoWait===0){
    incursionResolve(true);a.autoWait=8-2*a.defense.guardian;
  }
  // Caller persists with the normal draw transaction.
  renderIncursion();
}
function renderIncursion() {
  const b=document.getElementById('incursion-status');if(!b)return;
  const a=incursionState(),visible=!!a&&!(typeof introActive==='function'&&introActive());
  b.hidden=!visible||!a.event;
  const stage=!visible||!a.level?'calm':a.level<36?'trace':a.level<70?'noticed':a.level<100?'close':'breach';
  document.body.dataset.incursion=stage;
  document.body.classList.toggle('incursion-quiet',!!a?.quiet);
  if(!visible)return;
  const label={calm:'静穏',trace:'違和感',noticed:'観測されている',close:'侵入の兆候',breach:'開封を一時停止'}[stage];
  const text=`${label}${a.event?' Lv.'+a.event.tier:''} ${a.level}/100　｜　${a.event?'対処する':'対処記録'}`;
  if(b.textContent!==text)b.textContent=text;
  if(typeof renderRadar==='function')renderRadar();
  b.setAttribute('aria-label',`異変の危険度 ${a.level} / 100。${label}。${a.event?'対処画面を開く':'対処記録を開く'}`);
}
let incursionReturnFocus=null;
function openIncursion() {
  const d=document.getElementById('incursion-dialog');
  if(!d.open){incursionReturnFocus=document.activeElement;d.showModal();}
  drawIncursion();
}
function closeIncursion() {
  document.getElementById('incursion-dialog').close();
  if(incursionReturnFocus?.isConnected)incursionReturnFocus.focus({preventScroll:true});
}
function drawIncursion(message='') {
  const a=incursionState(true),e=a.event,d=document.getElementById('incursion-dialog');
  const heading=e?INCURSIONS[e.kind].name:a.level?'まだ、違和感だけ。':'日常に、戻った。';
  let content='';
  if(e?.kind===0){
    content=`<figure class="inc-photo"><img src="assets/intro/station-${e.view==='before'?'before':'after'}.webp" alt="${e.view==='before'?'記録写真。左の柱に1人。':'現在の写真。右のベンチ横に人物が増えている。'}"><figcaption>${e.view==='before'?'記録写真：左の柱に1人':'現在：右のベンチ横にもう1人'} ／ 02:14</figcaption></figure><div class="inc-grid"><button data-inc="before" aria-pressed="${e.view==='before'}">記録を見る</button><button data-inc="after" aria-pressed="${e.view!=='before'}">現在を見る</button></div><p class="inc-instruction">両方の写真を見て、増えた人影の場所を照合。</p><div class="inc-grid three">${['左の柱','右のベンチ','駅の時計'].map((s,i)=>`<button data-inc="identify" data-value="${i}" ${e.seen===3?'':'disabled'}>${s}</button>`).join('')}</div>`;
  }else if(e?.kind===1){
    content=`<div class="inc-radio" aria-hidden="true"><i></i><i></i><i></i><span>02:14 / INCOMING</span></div><p class="inc-instruction">送信元が「不明」の回線を選び、接続を切る。</p><div class="inc-channels">${['管理室','不明','第六文書課'].map((s,i)=>`<button data-inc="channel" data-value="${i}" aria-pressed="${e.step===1&&i===1}"><span>CH.0${i+1}</span><strong>${s}</strong><small>${i===1?'切断後も受信中':'認証済み'}</small></button>`).join('')}</div><button class="inc-primary" data-inc="disconnect" ${e.step===1?'':'disabled'}>CH.02の接続を遮断</button>`;
  }else if(e?.kind===2){
    content=`<div class="inc-envelope"><span>封緘手順 ／ ${e.step} / 3</span><p>差出人 → 宛名 → 本文</p><div class="inc-seals">${['差出人','宛名','本文'].map((s,i)=>`<button data-inc="seal" data-value="${i}" ${i<e.step?'disabled':''}><b>${i<e.step?'封済':i+1}</b><span>${s}</span></button>`).join('')}</div></div><p class="inc-instruction">順番に3か所を押して、内側からの書き換えを止める。</p>`;
  }else{
    const last=a.history.at(-1);
    content=`<div class="inc-settled"><span>${a.level?'異変の兆候を観測中':'接続は安定しています'}</span><strong>${a.resolved}件 対処済み</strong><p>${last?INCURSIONS[last.kind].after:'調査を進めると、写真・通信・資料に異変が現れます。'}</p></div><p class="inc-instruction">${a.cooldown?`次の${a.cooldown}回の開封までは保護区間。`:'異変は開封を進めたときだけ蓄積します。'}<br>時間の経過や留守中には悪化しません。</p><button class="inc-primary" data-inc="close">調査に戻る</button>`;
  }
  d.innerHTML=`<div class="inc-heading"><span>第六文書課 ／ 異変対処</span><button data-inc="close" aria-label="異変対処を閉じる">×</button></div><h2 id="incursion-title" tabindex="-1">${heading}</h2><div class="inc-meter"><span>危険度 <b>${a.level} / 100</b></span><meter min="0" max="100" low="36" high="70" optimum="0" value="${a.level}" aria-label="危険度"></meter></div>${e?`<p class="inc-tier">異変 Lv.${e.tier} ／ ${['局所的な異変','反復する干渉','深層からの侵入'][e.tier-1]}<br>鎮静手順 ${e.round+1} / ${e.tier} ・ 手動完了で対策資料 +${e.tier}</p>`:''}${content}<p class="inc-feedback" role="status">${message|| (a.level>=100?'対処すると新しい開封を再開できます。資料・ptは失われません。':e?'対処で危険度を0に戻す。見送って調査を続けると上昇します。':'対処記録を保管しました。')}</p>${incursionDefenseHTML(a)}<details class="inc-details"><summary>演出と対処記録</summary><label><input type="checkbox" data-inc="quiet" ${a.quiet?'checked':''}> 異変の画面演出を控えめにする</label><p>ゲーム内の異変です。この対処演出には点滅・大音量・放置中の悪化はありません。</p><ol>${a.history.slice().reverse().map(h=>`<li>${INCURSIONS[h.kind].short} Lv.${h.tier||1}：${h.auto?'自動':'手動'}鎮静</li>`).join('')||'<li>対処記録はまだありません。</li>'}</ol></details>`;
  d.querySelector('h2').focus({preventScroll:true});
}
function incursionResolve(auto=false) {
  const a=incursionState();if(!a?.event)return;
  const e=a.event;
  if(!auto&&e.round+1<e.tier){
    e.round++;e.step=0;e.seen=0;delete e.view;
    markDirty();drawIncursion(`干渉が戻ってきた。残り${e.tier-e.round}手順で完全鎮静。`);return;
  }
  if(!auto){a.samples=Math.min(999999,a.samples+e.tier);a.manual++;}
  a.history.push({kind:e.kind,tier:e.tier,auto});a.history=a.history.slice(-8);a.resolved++;a.event=null;a.level=0;a.cooldown=2+a.defense.recovery;
  markDirty();renderIncursion();renderIncursionDefense();
  if(!auto)drawIncursion(`異変を鎮めました。対策資料 +${e.tier}。危険度が0に戻りました。`);
}
const INC_DEFENSE = [
  {id:'ward',name:'遮蔽結界',max:3,effect:l=>`侵食の蓄積を${l*15}%軽減`},
  {id:'recovery',name:'保護符',max:3,effect:l=>`対処後${2+l}回の開封を保護`},
  {id:'guardian',name:'自律封印装置',max:2,effect:l=>l?`Lv.${l}以下を自動鎮静・再充填${8-2*l}開封`:'自動対処なし'}
];
function incursionDefenseHTML(a) {
  return `<details class="inc-defense"><summary>対抗策を育てる ・ 対策資料 ${a.samples}</summary><p>手動鎮静で異変Lv.と同数の資料を獲得。自動鎮静では獲得しません。手動3件でLv.2、8件でLv.3が混ざります（現在${a.manual}件）。</p>${INC_DEFENSE.map(u=>{const l=a.defense[u.id],cost=2*(l+1);return `<article><h3>${u.name} Lv.${l}/${u.max}</h3><p>${u.effect(l)}${l<u.max?` → ${u.effect(l+1)}`:''}</p><button type="button" data-inc-up="${u.id}" ${l>=u.max||a.samples<cost?'disabled':''}>${l>=u.max?'最大強化':`強化する（対策資料 ${cost}）`}</button></article>`;}).join('')}<label><input type="checkbox" data-inc-auto ${a.autoEnabled?'checked':''}> 自動対処を有効にする</label><p>${a.defense.guardian?`自動装置：${a.autoWait?`再充填まで${a.autoWait}回開封`:'待機中'}。Lv.3は手動対処。`:'装置を強化すると自動対処が使えます。'}留守中には進みません。</p></details>`;
}
function renderIncursionDefense() {
  const root=document.getElementById('incursion-defense');if(root)root.innerHTML=incursionDefenseHTML(incursionState()||{samples:0,manual:0,defense:{ward:0,recovery:0,guardian:0},autoWait:0,autoEnabled:true});
}
function upgradeIncursionDefense(id) {
  const u=INC_DEFENSE.find(u=>u.id===id);if(!u)return;
  const a=incursionState(true),l=a.defense[id],cost=2*(l+1);
  if(l>=u.max||a.samples<cost)return;
  a.samples-=cost;a.defense[id]++;markDirty();renderIncursionDefense();
  const root=document.getElementById('incursion-defense');if(root?.querySelector('details'))root.querySelector('details').open=true;
  if(document.getElementById('incursion-dialog').open){drawIncursion(`${u.name}を強化しました。`);document.querySelector('#incursion-dialog .inc-defense').open=true;}
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-inc-up]');if(b&&!b.disabled)upgradeIncursionDefense(b.dataset.incUp);});
document.addEventListener('change',e=>{if(e.target.matches('[data-inc-auto]')){incursionState(true).autoEnabled=e.target.checked;markDirty();renderIncursionDefense();}});
function incursionAction(action,value) {
  const a=incursionState(),e=a?.event;if(!e)return;
  let message='',wrong=false;
  if(e.kind===0&&['before','after'].includes(action)){e.view=action;e.seen|=action==='before'?1:2;}
  else if(e.kind===0&&action==='identify'&&e.seen===3){if(value===1)return incursionResolve();wrong=true;}
  else if(e.kind===1&&action==='channel'){if(value===1){e.step=1;message='未認証回線を隔離しました。遮断してください。';}else wrong=true;}
  else if(e.kind===1&&action==='disconnect'&&e.step===1)return incursionResolve();
  else if(e.kind===2&&action==='seal'){if(value===e.step){if(e.step===2)return incursionResolve();e.step++;message=`${e.step}か所を封印。次の場所を押してください。`;}else if(value>e.step)wrong=true;}
  else return;
  if(wrong){a.level=Math.min(100,a.level+6*e.tier);message=`異変が近づいた（危険度 +${6*e.tier}）。手掛かりを確認して、もう一度。`;}
  markDirty();renderIncursion();drawIncursion(message);
}
document.addEventListener('click',event=>{
  const b=event.target.closest('[data-inc]');if(!b||b.disabled)return;
  if(b.dataset.inc==='open')return openIncursion();
  if(b.dataset.inc==='close')return closeIncursion();
  if(b.dataset.inc==='quiet')return;
  incursionAction(b.dataset.inc,Number(b.dataset.value));
});
document.addEventListener('change',event=>{if(event.target.matches('[data-inc="quiet"]')){incursionState(true).quiet=event.target.checked;markDirty();renderIncursion();}});
// Keep Escape local to the top-layer dialog; do not close a result sheet underneath it.
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&document.getElementById('incursion-dialog')?.open){event.preventDefault();event.stopImmediatePropagation();closeIncursion();}},true);

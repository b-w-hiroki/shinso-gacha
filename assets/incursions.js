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
  a.level=int(a.level,100);a.resolved=int(a.resolved,999999);a.cooldown=int(a.cooldown,2);
  a.history=Array.isArray(a.history)?a.history.filter(h=>h&&Number.isInteger(h.kind)&&INCURSIONS[h.kind]).slice(-8):[];
  if(a.event){if(!Number.isInteger(a.event.kind)||!INCURSIONS[a.event.kind])a.event=null;else {a.event.step=int(a.event.step,2);a.event.seen=int(a.event.seen,3);}}
  if(a.level>=36&&!a.event)a.event={kind:a.resolved%3,step:0,seen:0};
  return a;
}
function incursionBlocked() {
  const a=incursionState();
  if(a&&a.level>=100&&a.event){openIncursion();return true;}
  return false;
}
function incursionInvestigate(count=1) {
  if (typeof introActive==='function'&&introActive()) return;
  const a=incursionState(true);
  if(a.cooldown>0)a.cooldown--;
  else a.level=Math.min(100,a.level+(count>1?20:12));
  if(a.level>=36&&!a.event)a.event={kind:a.resolved%3,step:0,seen:0};
  // Caller persists with the normal draw transaction.
  renderIncursion();
}
function renderIncursion() {
  const b=document.getElementById('incursion-status');if(!b)return;
  const a=incursionState(),visible=!!a&&!(typeof introActive==='function'&&introActive());
  b.hidden=!visible;
  const stage=!visible||!a.level?'calm':a.level<36?'trace':a.level<70?'noticed':a.level<100?'close':'breach';
  document.body.dataset.incursion=stage;
  document.body.classList.toggle('incursion-quiet',!!a?.quiet);
  if(!visible)return;
  const label={calm:'静穏',trace:'違和感',noticed:'観測されている',close:'侵入の兆候',breach:'開封を一時停止'}[stage];
  const text=`${label} ${a.level}/100　｜　${a.event?'対処する':'対処記録'}`;
  if(b.textContent!==text)b.textContent=text;
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
  d.innerHTML=`<div class="inc-heading"><span>第六文書課 ／ 異変対処</span><button data-inc="close" aria-label="異変対処を閉じる">×</button></div><h2 id="incursion-title" tabindex="-1">${heading}</h2><div class="inc-meter"><span>危険度 <b>${a.level} / 100</b></span><meter min="0" max="100" low="36" high="70" optimum="0" value="${a.level}" aria-label="危険度"></meter></div>${content}<p class="inc-feedback" role="status">${message|| (a.level>=100?'対処すると新しい開封を再開できます。資料・ptは失われません。':e?'対処で危険度を0に戻す。見送って調査を続けると上昇します。':'対処記録を保管しました。')}</p><details class="inc-details"><summary>演出と対処記録</summary><label><input type="checkbox" data-inc="quiet" ${a.quiet?'checked':''}> 異変の画面演出を控えめにする</label><p>ゲーム内の異変です。この対処演出には点滅・大音量・放置中の悪化はありません。</p><ol>${a.history.slice().reverse().map(h=>`<li>${INCURSIONS[h.kind].short}：鎮静</li>`).join('')||'<li>対処記録はまだありません。</li>'}</ol></details>`;
  d.querySelector('h2').focus({preventScroll:true});
}
function incursionResolve() {
  const a=incursionState();if(!a?.event)return;
  a.history.push({kind:a.event.kind});a.history=a.history.slice(-8);a.resolved++;a.event=null;a.level=0;a.cooldown=2;
  markDirty();renderIncursion();drawIncursion('異変を鎮めました。危険度が0に戻りました。');
}
function incursionAction(action,value) {
  const a=incursionState(),e=a?.event;if(!e)return;
  let message='',wrong=false;
  if(e.kind===0&&['before','after'].includes(action)){e.view=action;e.seen|=action==='before'?1:2;}
  else if(e.kind===0&&action==='identify'&&e.seen===3){if(value===1)return incursionResolve();wrong=true;}
  else if(e.kind===1&&action==='channel'){if(value===1){e.step=1;message='未認証回線を隔離しました。遮断してください。';}else wrong=true;}
  else if(e.kind===1&&action==='disconnect'&&e.step===1)return incursionResolve();
  else if(e.kind===2&&action==='seal'){if(value===e.step){if(e.step===2)return incursionResolve();e.step++;message=`${e.step}か所を封印。次の場所を押してください。`;}else if(value>e.step)wrong=true;}
  else return;
  if(wrong){a.level=Math.min(100,a.level+6);message='異変が近づいた（危険度 +6）。手掛かりを確認して、もう一度。';}
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

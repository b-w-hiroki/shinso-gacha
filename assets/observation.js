/* Fixed scenes, different capture media. No background timer advances danger. */
const OBSERVATIONS = {
 cctv:{title:'影だけの公園',source:'CAM 04 ／ 公園',action:'カメラを確認',before:'昼の公園。映像内に人影なし。',after:'入園記録は0名。地面には4人分の影。',ratio:'1.2'},
 photo:{title:'四人目の夕食',source:'証拠写真 ／ 食卓',action:'もう一度撮影',before:'居住者3名。食器の数を照合する。',after:'椅子は3脚。撮影者の前に、食べかけの一膳。',ratio:'.75'},
 vision:{title:'全員が気づいた',source:'捜査官 07 ／ 視界接続',action:'視界に接続',before:'商店街を調査中。こちらに気づく者はいない。',after:'接続した瞬間、通行人がこちらを向いた。',ratio:'.75'},
 dash:{title:'抜けられない県道',source:'車載記録 ／ 県道',action:'走行記録を進める',before:'雨上がりの県道。赤いミラーを通過する。',after:'同じ傷のミラーが続く。走行距離だけが増えている。',ratio:'1.3333'}
};
let observationPreview=null, observationReference=false, observationDisconnected=false, observationMessage='';
function observationState(){
 let o=S.observation;
 if(!o||o.version!==1)o=S.observation={version:1,mode:'cctv',remaining:6,anomaly:false,day:dayKey(),reports:0,frames:0,quiet:false};
 if(!OBSERVATIONS[o.mode])o.mode='cctv';
 o.remaining=Math.max(1,Math.min(11,Math.floor(Number(o.remaining)||6)));
 o.frames=Math.max(0,Math.floor(Number(o.frames)||0));
 o.reports=Math.max(0,Math.min(10,Math.floor(Number(o.reports)||0)));
 o.anomaly=!!o.anomaly;o.quiet=!!o.quiet;
 if(o.day!==dayKey()){o.day=dayKey();o.reports=0;}
 return o;
}
function observationAdvance(){
 const o=observationState();o.frames++;observationReference=false;observationDisconnected=false;observationMessage='';
 if(!o.anomaly && --o.remaining<=0){o.anomaly=true;o.remaining=5+Math.floor(Math.random()*7);}
 const f=document.getElementById('obs-frame');f.classList.remove('obs-capture');void f.offsetWidth;f.classList.add('obs-capture');
}
function renderObservation(){
 const f=document.getElementById('obs-frame');if(!f)return;
 const o=observationState(),m=OBSERVATIONS[o.mode],a=incursionState();
 const abnormal=observationPreview!==null?observationPreview:!!(o.anomaly||a?.event);
 const before=observationReference||!abnormal;
 f.dataset.mode=o.mode;f.dataset.observationView=before?'before':'after';f.dataset.quiet=String(o.quiet||!!a?.quiet);
 f.dataset.disconnected=String(observationDisconnected);f.style.setProperty('--obs-ratio',m.ratio);
 const img=document.getElementById('obs-image');img.style.backgroundImage=`url("assets/observation/${o.mode}.webp")`;img.setAttribute('aria-label',before?m.before:m.after);
 document.getElementById('obs-disconnected').hidden=!observationDisconnected;
 document.getElementById('obs-source').textContent=m.source;
 document.getElementById('obs-time').textContent=observationPreview!==null?'試写・報酬なし':`記録 ${String(o.frames).padStart(4,'0')}`;
 document.getElementById('obs-title').textContent=m.title;
 document.getElementById('obs-caption').textContent=observationDisconnected?'視界を遮断しました。観測ボタンで再接続できます。':before?m.before:m.after;
 for(const b of document.querySelectorAll('[data-obs-mode]'))b.setAttribute('aria-pressed',String(b.dataset.obsMode===o.mode));
 const ref=document.getElementById('obs-reference');ref.textContent=observationReference?'現在の記録':'前の記録';ref.setAttribute('aria-pressed',String(observationReference));
 const report=document.getElementById('obs-report');report.disabled=observationPreview!==null;report.textContent=a?.event?'異変に対処':o.mode==='vision'?'報告して切断':'異変を報告';
 document.querySelector('#sniff b').textContent=m.action;
 document.getElementById('obs-feedback').textContent=observationMessage;
 document.getElementById('obs-quiet').checked=o.quiet;
}
function observationAction(action){
 const o=observationState();
 if(action==='preview-before'||action==='preview-after'){observationPreview=action==='preview-after';observationReference=false;observationDisconnected=false;observationMessage='試写中：平常と異変を比較できます。';}
 else if(action==='preview-exit'){observationPreview=null;observationReference=false;observationMessage='実際の観測に戻りました。';}
 else if(action==='reference')observationReference=!observationReference;
 else if(action==='report'){
  if(observationPreview!==null)return;
  if(incursionState()?.event){openIncursion();return;}
  if(!o.anomaly){observationMessage='現在の記録に差異はありません。ptは減りません。';renderObservation();return;}
  const reward=o.reports<10?5:0;
  o.anomaly=false;o.reports=Math.min(10,o.reports+1);o.remaining=5+Math.floor(Math.random()*7);
  S.currency+=reward;observationReference=false;observationDisconnected=o.mode==='vision';
  // Reporting reveals the danger; existing ward, guardian and cooldown rules apply.
  incursionInvestigate();
  observationMessage=reward?'差異を記録しました。疑念pt +5。': '差異を記録しました。本日の報告報酬は受取済み。';
  if(incursionState()?.event)observationMessage+=' 危険な反応を検知。対処してください。';
  markDirty();render();
 }
 renderObservation();renderSniffCap();
}
document.addEventListener('click',e=>{
 const mode=e.target.closest('[data-obs-mode]');
 if(mode){observationState().mode=mode.dataset.obsMode;observationReference=false;observationDisconnected=false;observationMessage='';markDirty();renderObservation();return;}
 const b=e.target.closest('[data-obs]');if(b&&!b.disabled)observationAction(b.dataset.obs);
});
document.addEventListener('change',e=>{if(e.target.id==='obs-quiet'){observationState().quiet=e.target.checked;markDirty();renderObservation();}});

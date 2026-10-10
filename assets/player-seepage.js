/* Intrusion is confined to the fiction: controls, balances and evidence stay truthful. */
const SEEPAGE_CASES=[
 {kind:'caption',copy:'閲覧者：あなた、ほか一名',member:'records'},
 {kind:'caption',copy:'この画面は、向こうからも閲覧できます',member:'equipment'},
 {kind:'caption',copy:'退室者：一名　／　入室者：二名',member:'senior'},
 {kind:'reflection',copy:'今、画面の縁に顔があった。',member:'records'},
 {kind:'reflection',copy:'こちらが動く前に、反射だけが動いた。',member:'equipment'},
 {kind:'reflection',copy:'閉じたはずの窓に、誰かが立っていた。',member:'senior'},
 {kind:'colleague',copy:'白瀬は、あなたと同じ筆跡で同じ一文を書き続けている。「まだ、あなたが書き終わっていません」',member:'records'},
 {kind:'colleague',copy:'榊の唇は動いていない。机の下から、榊の声がする。「回線は、あなたの側に残っています」',member:'equipment'},
 {kind:'colleague',copy:'三輪の視線だけが、あなたの背後に残る。「そこは、私の席だったはずです」',member:'senior'}
];
let seepageTimer=null,seepageGlimpseKey='';
function playerSeepageState(){
 if(!S.playerSeepage||typeof S.playerSeepage!=='object'||Array.isArray(S.playerSeepage))S.playerSeepage={};
 return SeepageModel.normalize(S.playerSeepage);
}
function calmPlayerSeepage(){observationState().echo=null;SeepageModel.calm(playerSeepageState(),Date.now());markDirty();renderPlayerSeepage();}
function renderPlayerSeepage(){
 const o=observationState(),s=playerSeepageState(),now=Date.now(),a=S.incursion;
 const quiet=isLite()||o.quiet||!!a?.quiet;
 const echo=o.echo?.end>now?o.echo:null;
 const encounter=o.pending?.rarity>0?`watch:${o.seed}:${o.pending.sequence}:${o.pending.mode}`:echo?echo.key:a?.event?`envelope:${a.resolved}:${a.event.kind}:${a.event.tier}`:'';
 const engaged=(!o.mind.closed&&now-o.mind.lastInput<30000)||(!!echo&&now-echo.returnedAt<30000&&!document.querySelector('[data-view=colleagues]').hidden);
 const modal=!!document.querySelector('dialog[open]')||!document.getElementById('sheet-bg').hidden||!document.getElementById('stage').hidden;
 const allowed=!quiet&&!document.hidden&&!modal&&!document.querySelector('[data-view="menu"]:not([hidden])');
 const previous=s.event;
 const changed=SeepageModel.tick(s,{now,encounter,seed:o.seed,engaged,visible:allowed,quiet});
 if(s.event&&s.event!==previous&&typeof legendSeepageContext==='function')s.event.legendId=o.pending?.rarity>0?(Object.hasOwn(o.pending,'legendId')?o.pending.legendId:legendSeepageContext()):echo?echo.legendId:legendSeepageContext();
 if(changed)markDirty();
 const e=allowed?s.event:null,base=e?SEEPAGE_CASES[e.id]:null,c=e&&typeof legendSeepageCopy==='function'?legendSeepageCopy(e,base):base;
 document.body.dataset.playerSeepage=c?.kind||'';
 let edge=document.getElementById('player-seepage-edge');
 if(!edge){edge=document.createElement('div');edge.id='player-seepage-edge';edge.setAttribute('aria-hidden','true');edge.innerHTML='<span class="seep-margin-copy"></span><img class="seep-reflection" alt="" width="72" height="108">';document.body.append(edge);}
 edge.hidden=!c;edge.querySelector('span').textContent=c?.kind==='caption'?c.copy:'';
 const glimpse=c?.kind==='reflection'&&!o.mind.closed&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(!glimpse){clearTimeout(seepageTimer);edge.classList.remove('seep-glimpse');seepageGlimpseKey='';}
 else if(!e.glimpsed){
  e.glimpsed=true;markDirty();seepageGlimpseKey=e.key;
  const img=edge.querySelector('img');img.src=`assets/colleagues/${WATCH_COLLEAGUES[c.member].portrait}.webp`;
  clearTimeout(seepageTimer);edge.classList.add('seep-glimpse');
  seepageTimer=setTimeout(()=>edge.classList.remove('seep-glimpse'),1100);
 }else if(seepageGlimpseKey!==e.key)edge.classList.remove('seep-glimpse');
 for(const img of document.querySelectorAll('[data-seep-person]'))img.dataset.seepOdd=String(c?.kind==='colleague'&&img.dataset.seepPerson===c.member);
 const page=document.querySelector('[data-view="colleagues"]');
 const cue=page.querySelector('.watch-conversation-cue');
 let line=page.querySelector('.seep-colleague-line');
 if(c?.kind==='colleague'&&page.dataset.member===c.member&&cue){
  if(!line){line=document.createElement('p');line.className='seep-colleague-line';cue.after(line);}line.textContent=c.copy;
 }else line?.remove();
}
document.addEventListener('visibilitychange',()=>{if(typeof S!=='undefined')renderPlayerSeepage();});
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',()=>{if(typeof S!=='undefined')renderPlayerSeepage();});

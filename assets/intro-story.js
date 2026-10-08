/* Optional first-case narrative. Progress lives inside the existing saved lite state. */
let introBusy = false;
function introActive() {
  const i = S.lite && S.lite.intro;
  return isLite() && i && i.version === 1 && !i.done && liteTotal() <= 3;
}
function initIntro() {
  if (isLite() && liteTotal() === 0 && !(S.lite && S.lite.intro)) {
    S.lite = S.lite || {lv:{},pulls:0};
    S.lite.intro = {version:1,step:0,done:false,revealed:false};
    markDirty();
  }
  renderIntro();
}
function introImage(name, alt, cls = '') {
  return `<img class="intro-image ${cls}" src="assets/intro/${name}.webp" alt="${alt}" width="1536" height="1024">`;
}
function introLabel() {
  const i=S.lite.intro;
  return ['封を切る','写真をもう一度見る','2通目を開く','3通目を開く',i.revealed?'記録を保管して、調査を続ける':'黒塗りを剥がす'][i.step] || '調査を続ける';
}
function renderIntro() {
  const root=$('intro-case'); if(!root)return;
  const active=!!introActive(); root.hidden=!active;
  document.body.classList.toggle('intro-active',active);
  if(!active)return;
  const i=S.lite.intro, step=i.step;
  const titles=['差出人のない、1通。','写真には、1人だけ。','さっき、ここにいた？','同じ場所に、赤い印。','3通とも、同じ時刻。'];
  const captions=['郵便受けに入っていた。宛名も、差出人もない。','裏には「02:14」。ベンチの横は空いている。','ベンチの横に、もう1人。この写真は、誰にも見せないでください。','写真で人が増えた場所と、構内図の赤い印が重なる。','写真・構内図・メモ。すべてに「02:14」が残っていた。'];
  let visual=step===0?'<img class="intro-image intro-envelope" src="assets/ui/civilian-envelope.webp" alt="差出人のない閉じた茶封筒" width="1536" height="1024">'
    :step<3?introImage(step===1?'station-before':'station-after',step===1?'夜の駅。左の柱の横に1人。右のベンチ横には誰もいない。':'同じ駅。左の人物に加え、右のベンチ横にもう1人が立っている。')
    :step===3?introImage('station-plan','駅の構内図。ベンチの横に赤い丸が描かれている。')
    :`<div class="intro-note"><span>02:14 ／ 差出人のメモ</span><p>写真の人物を、数え直さないこと。</p><button class="intro-redaction" data-intro="reveal" aria-expanded="${!!i.revealed}">${i.revealed?'こちらで、あなたを保護します。':'黒塗りを剥がす'}</button>${i.revealed?'<p class="intro-sender">第六文書課</p>':'<p class="intro-sender">差出人　██████</p>'}</div>`;
  root.innerHTML=`<div class="intro-top"><span>最初の3通 ／ ${step===0?'未開封':Math.min(3,Math.max(1,step-1))+' / 3'}</span><button data-intro="skip">導入をスキップ</button></div><h1>${titles[step]}</h1><figure>${visual}${step>0&&step<4?'<span class="intro-time">記録時刻 02:14</span>':''}</figure><p class="intro-caption" aria-live="polite">${captions[step]}</p>${step===2?'<div class="intro-compare" role="group" aria-label="写真を比較"><button data-intro="before" aria-pressed="false">最初の写真</button><button data-intro="after" aria-pressed="true">もう一度見た写真</button></div>':''}${step>0?`<div class="intro-receipt"><img src="assets/intro/${step<3?'envelope-torn':'envelope-open'}.webp" alt="${step<3?'端を破った封筒':'資料が覗く開封済みの封筒'}"><span>${Math.min(3,Math.max(1,step-1))}通を保管済み<br>事件記録は「記録」タブへ</span></div>`:'<small class="intro-fiction">架空の事件を調べる物語です。</small>'}`;
  $('lite-pull').textContent=introLabel(); $('lite-pull').dataset.mode='intro';
}
function advanceIntro() {
  if(!introActive() || introBusy)return;
  introBusy=true; setTimeout(()=>{introBusy=false;},350);
  const i=S.lite.intro;
  if(i.step===4){
    if(!i.revealed)i.revealed=true;
    else {i.done=true;i.completed=true;}
  }else{
    // Exactly three ordinary draws, through the original pool/level/save logic.
    if([0,2,3].includes(i.step))litePull();
    i.step++;
  }
  markDirty(); renderLite();
}
function introArchive() {
  sheet('最初の3通 ／ 02:14の記録',`<div class="intro-archive"><p>駅の写真、構内図、差出人のメモ。3通に残された同じ時刻。</p><details open><summary>1通目：人物が増えた写真</summary>${introImage('station-before','最初の写真。左に1人。')}${introImage('station-after','もう一度見た写真。右にも人物がいる。')}</details><details><summary>2通目：構内図の赤い印</summary>${introImage('station-plan','ベンチの横に赤い印がある構内図')}<p>写真で人物が増えた場所を、誰かが先に示していた。</p></details><details><summary>3通目：差出人のメモ</summary><div class="intro-note"><p>02:14<br>写真の人物を、数え直さないこと。</p><p>こちらで、あなたを保護します。</p><b>第六文書課</b></div></details><p class="hint">再閲覧では開封数・資料・報酬は増えません。</p></div>`);
}
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-intro]');if(!b)return;
  const action=b.dataset.intro;
  if(action==='archive')return introArchive();
  if(!introActive())return;
  if(action==='skip'){S.lite.intro.done=true;S.lite.intro.skipped=true;markDirty();renderLite();return;}
  if(action==='reveal')return advanceIntro();
  if(action==='before'||action==='after'){
    const im=$('intro-case').querySelector('figure img');
    im.src=`assets/intro/station-${action}.webp`;
    im.alt=action==='before'?'最初の写真。左に1人。':'もう一度見た写真。右にも人物がいる。';
    $('intro-case').querySelectorAll('.intro-compare button').forEach(x=>x.setAttribute('aria-pressed',x===b));
  }
});
